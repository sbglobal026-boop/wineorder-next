import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkReferralCode } from '@/lib/referral'

// 결제 페이지의 [적용] 버튼 — 추천인 코드가 사용 가능한지 확인하고 할인율을 돌려줌
// 코드 추측 시도를 줄이기 위해 로그인한 사용자만 확인 가능
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const result = await checkReferralCode(createAdminClient(), body.code)
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 })

  return NextResponse.json({ code: result.code, discountPercent: result.discountPercent })
}
