import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { status, tracking_number } = await request.json()

  const validStatuses = ['pending', 'reshipped', 'resolved']
  if (status && !validStatuses.includes(status)) {
    return NextResponse.json({ error: '유효하지 않은 상태값입니다' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const updates: Record<string, string> = {}
  if (status) updates.status = status
  if (tracking_number !== undefined) updates.tracking_number = tracking_number

  const { error } = await supabase
    .from('cs_requests')
    .update(updates)
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
