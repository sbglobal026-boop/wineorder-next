import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// 배송이 이미 시작된 주문은 자동 취소 대신, CS 게시판(cs_requests)에 취소 요청을 등록해 어드민이 처리하도록 함
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let message: string | undefined
  try {
    ;({ message } = await request.json())
  } catch {
    return NextResponse.json({ error: '취소 사유를 입력해주세요' }, { status: 400 })
  }

  if (!message || !message.trim()) {
    return NextResponse.json({ error: '취소 사유를 입력해주세요' }, { status: 400 })
  }

  const adminSupabase = createAdminClient()

  const { data: order, error: fetchError } = await adminSupabase
    .from('orders')
    .select('id, user_id, status, items')
    .eq('id', id)
    .single()

  if (fetchError || !order) {
    return NextResponse.json({ error: '주문을 찾을 수 없습니다' }, { status: 404 })
  }
  if (order.user_id !== user.id) {
    return NextResponse.json({ error: '본인 주문만 요청할 수 있습니다' }, { status: 403 })
  }
  if (order.status !== 'shipped') {
    return NextResponse.json({ error: '배송중인 주문에만 취소 요청을 보낼 수 있습니다' }, { status: 400 })
  }

  // 이미 처리 대기 중인 요청이 있으면 중복 등록 방지
  const { data: existing } = await adminSupabase
    .from('cs_requests')
    .select('id')
    .eq('order_id', order.id)
    .eq('status', 'pending')
    .maybeSingle()
  if (existing) {
    return NextResponse.json({ error: '이미 접수된 취소 요청이 처리 대기 중입니다' }, { status: 400 })
  }

  const items = order.items as { name: string }[]
  const productName = items.length > 1
    ? `${items[0].name} 외 ${items.length - 1}건`
    : (items[0]?.name ?? '주문 상품')

  const { error: insertError } = await adminSupabase
    .from('cs_requests')
    .insert({
      order_id: order.id,
      product_name: productName,
      reason: `[주문취소 요청] ${message.trim()}`,
      status: 'pending',
    })

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
