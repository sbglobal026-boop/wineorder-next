import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { approval_status } = await request.json()

  if (!['live', 'pending'].includes(approval_status)) {
    return NextResponse.json({ error: '유효하지 않은 상태값입니다' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('products')
    .update({ approval_status })
    .eq('id', Number(id))

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
