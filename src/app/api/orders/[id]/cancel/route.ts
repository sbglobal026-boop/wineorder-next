import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getStripe } from '@/lib/stripe'

// 손님이 직접 취소 가능한 상태 — 배송이 시작되면(shipped 이후) 취소 대신 반품/교환으로 안내
const CANCELLABLE_STATUSES = ['pending', 'confirmed']

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const adminSupabase = createAdminClient()

  const { data: order, error: fetchError } = await adminSupabase
    .from('orders')
    .select('id, user_id, status, items, stripe_session_id')
    .eq('id', id)
    .single()

  if (fetchError || !order) {
    return NextResponse.json({ error: '주문을 찾을 수 없습니다' }, { status: 404 })
  }
  if (order.user_id !== user.id) {
    return NextResponse.json({ error: '본인 주문만 취소할 수 있습니다' }, { status: 403 })
  }
  if (order.status === 'cancelled') {
    return NextResponse.json({ error: '이미 취소된 주문입니다' }, { status: 400 })
  }
  if (!CANCELLABLE_STATUSES.includes(order.status)) {
    return NextResponse.json({ error: '배송이 시작된 주문은 취소할 수 없습니다. 고객센터로 문의해주세요.' }, { status: 400 })
  }

  // Stripe로 결제된 주문이면 실제 환불 처리 (환불 실패 시 재고/상태는 건드리지 않고 바로 에러 반환)
  if (order.stripe_session_id) {
    try {
      const session = await getStripe().checkout.sessions.retrieve(order.stripe_session_id)
      if (typeof session.payment_intent === 'string') {
        await getStripe().refunds.create({ payment_intent: session.payment_intent })
      }
    } catch {
      return NextResponse.json({ error: '환불 처리 중 오류가 발생했습니다. 고객센터로 문의해주세요.' }, { status: 500 })
    }
  }

  // 재고 복구
  const items = order.items as { productId: number; qty: number }[]
  for (const item of items) {
    const { data: product } = await adminSupabase
      .from('products')
      .select('stock')
      .eq('id', item.productId)
      .single()

    await adminSupabase
      .from('products')
      .update({ stock: (product?.stock ?? 0) + item.qty })
      .eq('id', item.productId)
  }

  const { error: updateError } = await adminSupabase
    .from('orders')
    .update({ status: 'cancelled' })
    .eq('id', order.id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
