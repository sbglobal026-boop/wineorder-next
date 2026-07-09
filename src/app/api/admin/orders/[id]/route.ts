import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await request.json()
  const { status, tracking_number } = body

  const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
  if (status && !validStatuses.includes(status)) {
    return NextResponse.json({ error: '유효하지 않은 상태값입니다' }, { status: 400 })
  }

  const supabase = createAdminClient()

  // 취소 시 재고 복구 (이미 취소된 주문은 중복 복구 방지)
  if (status === 'cancelled') {
    const { data: order } = await supabase
      .from('orders')
      .select('status, items')
      .eq('id', id)
      .single()

    if (order && order.status !== 'cancelled') {
      for (const item of order.items) {
        const { data: product } = await supabase
          .from('products')
          .select('stock')
          .eq('id', item.productId)
          .single()

        if (product) {
          await supabase
            .from('products')
            .update({ stock: (product.stock ?? 0) + item.qty })
            .eq('id', item.productId)
        }
      }
    }
  }

  const updates: Record<string, string> = {}
  if (status) updates.status = status
  if (tracking_number !== undefined) updates.tracking_number = tracking_number

  const { error } = await supabase
    .from('orders')
    .update(updates)
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
