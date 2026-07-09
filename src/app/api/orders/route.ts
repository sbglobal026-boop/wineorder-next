import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { addressId, items, totalEur, shippingFeeEur, dutyEur, splitDelivery, splitFeeEur, memo } = body

  if (!items || items.length === 0) {
    return NextResponse.json({ error: '주문 상품이 없습니다' }, { status: 400 })
  }

  const adminSupabase = createAdminClient()

  // 재고 확인
  for (const item of items) {
    const { data: product, error } = await adminSupabase
      .from('products')
      .select('stock, name')
      .eq('id', item.productId)
      .single()

    if (error || !product) {
      return NextResponse.json({ error: `상품 정보를 찾을 수 없습니다 (id: ${item.productId})` }, { status: 400 })
    }
    if ((product.stock ?? 0) < item.qty) {
      return NextResponse.json({ error: `${product.name} 재고가 부족합니다 (남은 재고: ${product.stock ?? 0}병)` }, { status: 400 })
    }
  }

  // 주문 생성
  const { data: order, error: orderError } = await adminSupabase
    .from('orders')
    .insert({
      user_id: user.id,
      address_id: addressId ?? null,
      items,
      status: 'pending',
      total_eur: totalEur,
      shipping_fee_eur: shippingFeeEur ?? 0,
      duty_eur: dutyEur ?? 0,
      split_delivery: splitDelivery ?? false,
      split_delivery_fee_eur: splitFeeEur ?? 0,
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
    for (const item of items) {
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
