import { NextResponse } from 'next/server'
import { getVendorUser } from '@/lib/vendor-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { productToRow } from '@/lib/products'

// 이 상품이 실제로 이 벤더 소유인지 확인 (admin 클라이언트는 RLS를 안 타므로 직접 체크 필요)
async function assertOwnership(supabase: ReturnType<typeof createAdminClient>, id: number, vendorId: string) {
  const { data } = await supabase.from('products').select('vendor_id').eq('id', id).maybeSingle()
  return data?.vendor_id === vendorId
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const vendor = await getVendorUser()
  if (!vendor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const supabase = createAdminClient()

  if (!(await assertOwnership(supabase, Number(id), vendor.id))) {
    return NextResponse.json({ error: '본인 상품만 수정할 수 있습니다' }, { status: 403 })
  }

  const body = await request.json()
  const row = {
    ...productToRow(body),
    EK: body.price ?? 0,
    margin: 0,
    approval_status: 'pending', // 수정하면 다시 검수 대기로 (승인된 상품을 몰래 바꿔치기하는 것 방지)
  }

  const { error } = await supabase.from('products').update(row).eq('id', Number(id))
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const vendor = await getVendorUser()
  if (!vendor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const supabase = createAdminClient()

  if (!(await assertOwnership(supabase, Number(id), vendor.id))) {
    return NextResponse.json({ error: '본인 상품만 삭제할 수 있습니다' }, { status: 403 })
  }

  const { error } = await supabase.from('products').delete().eq('id', Number(id))
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
