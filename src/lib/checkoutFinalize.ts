import { getStripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'

// Stripe 결제 성공 후 실제 주문(orders)을 생성한다.
// 리다이렉트 경로(/api/checkout/confirm)와 webhook(/api/webhooks/stripe) 양쪽에서 호출되므로
// 어느 쪽이 먼저 도착해도 주문이 하나만 생성되도록 orders.stripe_session_id unique 제약으로 멱등성을 보장한다.
export async function finalizeCheckoutSession(stripeSessionId: string): Promise<string> {
  const adminSupabase = createAdminClient()

  const { data: existingOrder } = await adminSupabase
    .from('orders')
    .select('id')
    .eq('stripe_session_id', stripeSessionId)
    .maybeSingle()
  if (existingOrder) return existingOrder.id

  const session = await getStripe().checkout.sessions.retrieve(stripeSessionId)
  if (session.payment_status !== 'paid') {
    throw new Error('결제가 완료되지 않았습니다')
  }

  const { data: draft } = await adminSupabase
    .from('checkout_drafts')
    .select('*')
    .eq('stripe_session_id', stripeSessionId)
    .single()
  if (!draft) throw new Error('주문 정보를 찾을 수 없습니다')

  const { data: order, error: orderError } = await adminSupabase
    .from('orders')
    .insert({
      user_id: draft.user_id,
      address_id: draft.address_id,
      items: draft.items,
      status: 'pending',
      total_eur: draft.total_eur,
      shipping_fee_eur: draft.shipping_fee_eur,
      duty_eur: draft.duty_eur,
      split_delivery: draft.split_delivery,
      split_delivery_fee_eur: draft.split_delivery_fee_eur,
      memo: draft.memo,
      stripe_session_id: stripeSessionId,
    })
    .select()
    .single()

  if (orderError) {
    // unique 제약 충돌 = 다른 경로(webhook 또는 confirm 리다이렉트)가 이미 생성함
    const { data: raceOrder } = await adminSupabase
      .from('orders')
      .select('id')
      .eq('stripe_session_id', stripeSessionId)
      .single()
    if (raceOrder) return raceOrder.id
    throw new Error(orderError.message)
  }

  const items = draft.items as { productId: number; name: string; qty: number }[]

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

  if (draft.split_delivery && order.order_number) {
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

  await adminSupabase
    .from('checkout_drafts')
    .update({ status: 'completed', order_id: order.id })
    .eq('id', draft.id)

  return order.id
}
