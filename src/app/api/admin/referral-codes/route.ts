import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { parseReferralCodeInput } from '@/lib/referral'

// 코드 목록 + 코드별 사용 통계(취소 제외 주문 수·결제 합계·할인 합계)
export async function GET() {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createAdminClient()
  const { data: codes, error } = await supabase
    .from('referral_codes')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Supabase는 한 번에 최대 1000행만 돌려주므로 나눠서 모두 가져옴
  const rows: { referral_code: string; total_eur: number; discount_eur: number }[] = []
  for (let from = 0; ; from += 1000) {
    const { data, error: ordersError } = await supabase
      .from('orders')
      .select('referral_code, total_eur, discount_eur')
      .not('referral_code', 'is', null)
      .neq('status', 'cancelled')
      .order('id')
      .range(from, from + 999)
    if (ordersError) return NextResponse.json({ error: ordersError.message }, { status: 500 })
    rows.push(...data)
    if (data.length < 1000) break
  }

  const stats = new Map<string, { uses: number; totalEur: number; discountEur: number }>()
  for (const row of rows) {
    const s = stats.get(row.referral_code) ?? { uses: 0, totalEur: 0, discountEur: 0 }
    s.uses += 1
    s.totalEur += Number(row.total_eur)
    s.discountEur += Number(row.discount_eur)
    stats.set(row.referral_code, s)
  }

  return NextResponse.json(
    (codes ?? []).map(c => ({ ...c, ...(stats.get(c.code) ?? { uses: 0, totalEur: 0, discountEur: 0 }) }))
  )
}

export async function POST(request: Request) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = parseReferralCodeInput(await request.json().catch(() => ({})))
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 })

  const supabase = createAdminClient()
  const { error } = await supabase.from('referral_codes').insert(parsed.value)
  if (error) {
    const message = error.code === '23505' ? '이미 있는 코드입니다' : error.message
    return NextResponse.json({ error: message }, { status: error.code === '23505' ? 409 : 500 })
  }
  return NextResponse.json({ ok: true })
}
