import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { isMemberTier } from '@/lib/memberTiers'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { tier } = await request.json()

  if (!isMemberTier(tier)) {
    return NextResponse.json({ error: '유효하지 않은 등급입니다' }, { status: 400 })
  }

  const supabase = createAdminClient()

  // 등급은 app_metadata에 저장 — user_metadata와 달리 회원 본인이 브라우저에서 바꿀 수 없음
  // 기존 app_metadata(로그인 방식 provider 등)를 지우지 않도록 먼저 읽어서 합쳐줌
  const { data: existing, error: fetchError } = await supabase.auth.admin.getUserById(id)
  if (fetchError || !existing.user) {
    return NextResponse.json({ error: '사용자를 찾을 수 없습니다' }, { status: 404 })
  }

  const { error } = await supabase.auth.admin.updateUserById(id, {
    app_metadata: { ...existing.user.app_metadata, tier },
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
