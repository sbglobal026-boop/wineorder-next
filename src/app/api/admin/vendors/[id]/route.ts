import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'

const VALID_STATUSES = ['pending', 'approved', 'suspended']

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { status, commission_rate } = await request.json()

  const updates: Record<string, string | number> = {}
  if (status !== undefined) {
    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: '유효하지 않은 상태값입니다' }, { status: 400 })
    }
    updates.status = status
  }
  if (commission_rate !== undefined) {
    const rate = Number(commission_rate)
    if (Number.isNaN(rate) || rate < 0 || rate > 1) {
      return NextResponse.json({ error: '수수료율은 0~1 사이 숫자여야 합니다' }, { status: 400 })
    }
    updates.commission_rate = rate
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: '변경할 내용이 없습니다' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { error } = await supabase.from('vendors').update(updates).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
