import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getZone, calcDuty, calcOrderTotals } from '@/lib/orderPricing'
import { fetchExchangeRates } from '@/lib/exchangeRate'
import { getStripe } from '@/lib/stripe'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { addressId, items, splitDelivery, memo } = body

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
    .select('id, name, price, origin, stock')
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

  // 서버에서 신뢰할 수 있는 값(DB 가격)으로 주문 항목·금액을 다시 계산
  const trustedItems: { productId: number; name: string; qty: number; price_eur: number }[] = items.map(
    (item: { productId: number; qty: number }) => {
      const product = productMap.get(item.productId)!
      return { productId: item.productId, name: product.name, qty: item.qty, price_eur: product.price }
    }
  )
  const subtotal = trustedItems.reduce((sum, i) => sum + i.price_eur * i.qty, 0)
  const totalQty = trustedItems.reduce((sum, i) => sum + i.qty, 0)

  const { data: shippingRates } = await adminSupabase.from('shipping_rates').select('zone, fee, vat_rate')
  const { shippingFee, splitFee, vat, total } = calcOrderTotals({
    zone, subtotal, totalQty, splitDelivery: !!splitDelivery, shippingRates: shippingRates ?? [],
  })

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
      split_delivery: !!splitDelivery,
      split_delivery_fee_eur: splitFee,
      memo: memo ?? null,
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
  if (splitFee > 0) {
    lineItems.push({
      price_data: { currency: 'eur', product_data: { name: `분할배송비 (${totalQty}병)` }, unit_amount: Math.round(splitFee * 100) },
      quantity: 1,
    })
  }
  if (vat > 0) {
    lineItems.push({
      price_data: { currency: 'eur', product_data: { name: '부가세 (VAT)' }, unit_amount: Math.round(vat * 100) },
      quantity: 1,
    })
  }

  const origin = request.headers.get('origin') ?? new URL(request.url).origin

  // Embedded Checkout — 사이트를 벗어나지 않고 체크아웃 페이지 안에 결제창을 iframe으로 띄움
  // 참고: 이 Stripe 계정의 API 버전에서는 ui_mode 'embedded'가 폐기되어 'embedded_page'를 써야 함
  const session = await getStripe().checkout.sessions.create({
    mode: 'payment',
    ui_mode: 'embedded_page',
    payment_method_types: ['card'],
    locale: 'auto', // 결제창 언어를 방문자 브라우저 언어에 맞춰 자동 설정 (한국 방문자는 한국어로 보임)
    line_items: lineItems,
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
