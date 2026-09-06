import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// 비공개 B2B 가입 페이지(/b2b-partner) 전용 — 계정 생성 + 벤더 신청을 한 번에 처리
// vendors 테이블은 RLS로 직접 insert가 막혀있어서(서버만 쓸 수 있음) 여기서만 등록 가능
export async function POST(request: Request) {
  const { email, password, shopName, businessInfo, country } = await request.json()

  if (!email || !password || !shopName?.trim()) {
    return NextResponse.json({ error: '이메일·비밀번호·샵 이름을 입력해주세요' }, { status: 400 })
  }
  if (password.length < 6) {
    return NextResponse.json({ error: '비밀번호는 6자 이상이어야 합니다' }, { status: 400 })
  }

  const supabase = createAdminClient()

  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // 별도 이메일 인증 없이 바로 로그인 가능하게
  })

  if (createError || !created.user) {
    const message = createError?.message.includes('already been registered')
      ? '이미 가입된 이메일입니다'
      : (createError?.message ?? '계정 생성에 실패했습니다')
    return NextResponse.json({ error: message }, { status: 400 })
  }

  const { error: vendorError } = await supabase.from('vendors').insert({
    user_id: created.user.id,
    shop_name: shopName.trim(),
    business_info: businessInfo?.trim() || null,
    country: country?.trim() || null,
    status: 'pending',
  })

  if (vendorError) {
    // 벤더 등록이 실패하면 방금 만든 계정도 같이 정리 (반쪽짜리 계정 방지)
    await supabase.auth.admin.deleteUser(created.user.id)
    return NextResponse.json({ error: vendorError.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
