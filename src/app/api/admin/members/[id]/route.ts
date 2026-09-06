import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'

const VALID_TIERS = ['basic', 'silver', 'gold', 'vip']

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { tier } = await request.json()

  if (!VALID_TIERS.includes(tier)) {
    return NextResponse.json({ error: '유효하지 않은 등급입니다' }, { status: 400 })
  }

  const supabase = createAdminClient()

  // user_metadata는 통째로 덮어써지므로, 기존 값(이름 등)을 먼저 읽어서 합쳐줌
  const { data: existing, error: fetchError } = await supabase.auth.admin.getUserById(id)
  if (fetchError || !existing.user) {
    return NextResponse.json({ error: '사용자를 찾을 수 없습니다' }, { status: 404 })
  }

  const { error } = await supabase.auth.admin.updateUserById(id, {
    user_metadata: { ...existing.user.user_metadata, tier },
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
