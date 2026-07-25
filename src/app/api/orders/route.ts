import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getZone, calcDuty, calcOrderTotals } from '@/lib/orderPricing'
import { fetchExchangeRates } from '@/lib/exchangeRate'

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

  // 주문 생성
  const { data: order, error: orderError } = await adminSupabase
    .from('orders')
    .insert({
      user_id: user.id,
      address_id: addressId ?? null,
      items: trustedItems,
      status: 'pending',
      total_eur: total,
      shipping_fee_eur: shippingFee,
      duty_eur: dutyEur,
      split_delivery: !!splitDelivery,
      split_delivery_fee_eur: splitFee,
      memo: memo ?? null,
    })
    .select()
    .single()

  if (orderError) {
    return NextResponse.json({ error: orderError.message }, { status: 500 })
  }

  // 재고 차감
  for (const item of items) {
    const { data: product } = await adminSupabase
      .from('products')
      .select('stock')
      .eq('id', item.productId)
      .single()

    await adminSupabase
      .from('products')
      .update({ stock: Math.max(0, (product?.stock ?? 0) - item.qty) })
      .eq('id', item.productId)
  }

  // 분할배송 요청 시 병마다 세부 배송건 생성
  if (splitDelivery && order.order_number) {
    const shipments = []
    let index = 1
    for (const item of trustedItems) {
      for (let i = 0; i < item.qty; i++) {
        shipments.push({
          order_id: order.id,
          shipment_number: `${order.order_number}-${index}`,
          product_id: item.productId,
          product_name: item.name,
          status: 'pending',
        })
        index++
      }
    }
    await adminSupabase.from('split_deliveries').insert(shipments)
  }

  return NextResponse.json({ orderId: order.id })
}
