import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getZone, calcDuty, calcOrderTotals } from '@/lib/orderPricing'
import { fetchExchangeRates } from '@/lib/exchangeRate'
import { getStripe } from '@/lib/stripe'
import { checkReferralCode, normalizeReferralCode } from '@/lib/referral'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  // 분할배송은 더 이상 신청받지 않음 — 요청에 splitDelivery가 있어도 무시 (임시 주문 컬럼은 기본값 false/0)
  const { addressId, items, memo, referralCode, expectedDiscountPercent } = body

  if (!items || items.length === 0) {
    return NextResponse.json({ error: '주문 상품이 없습니다' }, { status: 400 })
  }

  const adminSupabase = createAdminClient()

  // 배송지는 본인 것만 사용 가능 + 국가로 배송존 결정
  let zone: ReturnType<typeof getZone> | null = null
  if (addressId) {
    const { data: address } = await adminSupabase
      .from('addresses')
      .select('country')
      .eq('id', addressId)
      .eq('user_id', user.id)
      .single()
    if (!address) return NextResponse.json({ error: '잘못된 배송지입니다' }, { status: 400 })
    zone = getZone(address.country)
  }

  // 상품 정보(가격·재고·원산지)는 클라이언트 값이 아니라 DB에서 직접 조회 — 가격 조작 방지
  const productIds = [...new Set(items.map((i: { productId: number }) => i.productId))]
  const { data: products } = await adminSupabase
    .from('products')
    .select('id, name, price, origin, stock, shipping_fee')
    .in('id', productIds)
  const productMap = new Map((products ?? []).map(p => [p.id, p]))

  for (const item of items) {
    const product = productMap.get(item.productId)
    if (!product) {
      return NextResponse.json({ error: `상품 정보를 찾을 수 없습니다 (id: ${item.productId})` }, { status: 400 })
    }
    if ((product.stock ?? 0) < item.qty) {
      return NextResponse.json({ error: `${product.name} 재고가 부족합니다 (남은 재고: ${product.stock ?? 0}병)` }, { status: 400 })
    }
  }

  // 추천인 코드 — 화면에서 계산한 할인은 믿지 않고 서버에서 코드를 다시 확인
  let referral: { code: string; discountPercent: number } | null = null
  if (normalizeReferralCode(referralCode)) {
    const check = await checkReferralCode(adminSupabase, referralCode)
    if (!check.ok) {
      return NextResponse.json({ error: check.error, referralInvalid: true }, { status: 400 })
    }
    // [적용]을 누른 뒤 어드민에서 할인율이 바뀐 경우 — 바뀐 금액을 화면에서 확인하고 다시 결제하도록 안내
    if (check.discountPercent !== Number(expectedDiscountPercent)) {
      return NextResponse.json({
        error: `추천인 코드 할인율이 ${check.discountPercent}%로 변경되었습니다. 금액을 확인하신 후 다시 결제해주세요.`,
        referral: { code: check.code, discountPercent: check.discountPercent },
      }, { status: 409 })
    }
    referral = { code: check.code, discountPercent: check.discountPercent }
  }

  // 서버에서 신뢰할 수 있는 값(DB 가격)으로 주문 항목·금액을 다시 계산
  const trustedItems: { productId: number; name: string; qty: number; price_eur: number }[] = items.map(
    (item: { productId: number; qty: number }) => {
      const product = productMap.get(item.productId)!
      return { productId: item.productId, name: product.name, qty: item.qty, price_eur: product.price }
    }
  )
  const subtotal = trustedItems.reduce((sum, i) => sum + i.price_eur * i.qty, 0)

  const { data: shippingRates } = await adminSupabase.from('shipping_rates').select('zone, fee, vat_rate')
  const { shippingFee, discount, vat, total } = calcOrderTotals({
    zone, subtotal, shippingRates: shippingRates ?? [],
    items: trustedItems.map(i => ({ qty: i.qty, shippingFee: productMap.get(i.productId)?.shipping_fee ?? null })),
    discountPercent: referral?.discountPercent ?? 0,
  })

  // Stripe는 €0.50 미만 결제를 만들 수 없음 (할인 후 금액이 너무 작아지는 경우)
  if (total < 0.5) {
    return NextResponse.json({ error: '결제 금액이 최소 결제 금액(€0.50)보다 적어 결제할 수 없습니다' }, { status: 400 })
  }

  let dutyEur = 0
  if (zone === 'KR') {
    const { krw, usd } = await fetchExchangeRates()
    dutyEur = trustedItems.reduce((sum, i) => {
      const product = productMap.get(i.productId)!
      return sum + calcDuty(i.price_eur * i.qty, krw, usd, product.origin ?? '').total
    }, 0)
  }

  // 결제 전 임시 주문 스냅샷 저장 — Stripe에 청구하는 금액과 나중에 orders 테이블에 들어갈 금액이
  // 반드시 일치해야 하므로 여기서 계산한 값을 그대로 얼려두고, 결제 확정 시 재계산 없이 그대로 쓴다.
  const { data: draft, error: draftError } = await adminSupabase
    .from('checkout_drafts')
    .insert({
      user_id: user.id,
      address_id: addressId ?? null,
      items: trustedItems,
      total_eur: total,
      shipping_fee_eur: shippingFee,
      duty_eur: dutyEur,
      memo: memo ?? null,
      referral_code: referral?.code ?? null,
      discount_eur: discount,
    })
    .select()
    .single()

  if (draftError) {
    return NextResponse.json({ error: draftError.message }, { status: 500 })
  }

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = trustedItems.map(item => ({
    price_data: {
      currency: 'eur',
      product_data: { name: item.name },
      unit_amount: Math.round(item.price_eur * 100),
    },
    quantity: item.qty,
  }))

  if (shippingFee > 0) {
    lineItems.push({
      price_data: { currency: 'eur', product_data: { name: '배송비' }, unit_amount: Math.round(shippingFee * 100) },
      quantity: 1,
    })
  }
  if (vat > 0) {
    lineItems.push({
      price_data: { currency: 'eur', product_data: { name: '부가세 (VAT)' }, unit_amount: Math.round(vat * 100) },
      quantity: 1,
    })
  }

  // 추천인 할인 — 이 주문의 할인액만큼 1회용 정액 쿠폰을 만들어 결제창에 붙임
  // (% 쿠폰을 쓰면 배송비·부가세 줄까지 할인되므로, 상품 금액 기준으로 계산한 할인액을 정액으로 넘겨 화면 금액과 일치시킴)
  let discounts: Stripe.Checkout.SessionCreateParams.Discount[] | undefined
  if (referral && discount > 0) {
    const coupon = await getStripe().coupons.create({
      amount_off: Math.round(discount * 100),
      currency: 'eur',
      duration: 'once',
      max_redemptions: 1,
      name: `추천인 ${referral.code}`,
      metadata: { draft_id: draft.id, referral_code: referral.code },
    })
    discounts = [{ coupon: coupon.id }]
  }

  const origin = request.headers.get('origin') ?? new URL(request.url).origin

  // Embedded Checkout — 사이트를 벗어나지 않고 체크아웃 페이지 안에 결제창을 iframe으로 띄움
  // 참고: 이 Stripe 계정의 API 버전에서는 ui_mode 'embedded'가 폐기되어 'embedded_page'를 써야 함
  // payment_method_types를 지정하지 않아야 Stripe 대시보드에 켜둔 결제수단이 동적으로 노출됨
  // (카카오페이·네이버페이 등 현지 통화 전용 수단은 Adaptive Pricing과 함께 이 방식에서만 표시됨)
  const session = await getStripe().checkout.sessions.create({
    mode: 'payment',
    ui_mode: 'embedded_page',
    locale: 'auto', // 결제창 언어를 방문자 브라우저 언어에 맞춰 자동 설정 (한국 방문자는 한국어로 보임)
    line_items: lineItems,
    discounts,
    customer_email: user.email ?? undefined,
    return_url: `${origin}/api/checkout/confirm?session_id={CHECKOUT_SESSION_ID}`,
    metadata: { draft_id: draft.id },
  })

  await adminSupabase
    .from('checkout_drafts')
    .update({ stripe_session_id: session.id })
    .eq('id', draft.id)

  return NextResponse.json({ clientSecret: session.client_secret })
}
