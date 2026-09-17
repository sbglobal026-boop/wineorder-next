import { NextResponse } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { getAdminUser } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { parseReferralCodeInput } from '@/lib/referral'

// 이 코드가 들어간 주문 수 (취소 주문 포함) — 주문 기록과 코드가 어긋나지 않도록 사용된 코드는 이름 변경·삭제 금지
async function countOrdersWithCode(supabase: SupabaseClient, code: string) {
  const { count, error } = await supabase
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .eq('referral_code', code)
  return error ? null : (count ?? 0)
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const parsed = parseReferralCodeInput(await request.json().catch(() => ({})))
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 })

  const supabase = createAdminClient()
  const { data: existing } = await supabase.from('referral_codes').select('code').eq('id', id).maybeSingle()
  if (!existing) return NextResponse.json({ error: '코드를 찾을 수 없습니다' }, { status: 404 })

  if (existing.code !== parsed.value.code) {
    const used = await countOrdersWithCode(supabase, existing.code)
    if (used !== 0) {
      return NextResponse.json({ error: '이미 주문에 사용된 코드는 이름을 바꿀 수 없습니다. 새 코드를 만들어주세요' }, { status: 409 })
    }
  }

  const { error } = await supabase.from('referral_codes').update(parsed.value).eq('id', id)
  if (error) {
    const message = error.code === '23505' ? '이미 있는 코드입니다' : error.message
    return NextResponse.json({ error: message }, { status: error.code === '23505' ? 409 : 500 })
  }
  return NextResponse.json({ ok: true })
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const supabase = createAdminClient()
  const { data: existing } = await supabase.from('referral_codes').select('code').eq('id', id).maybeSingle()
  if (!existing) return NextResponse.json({ error: '코드를 찾을 수 없습니다' }, { status: 404 })

  const used = await countOrdersWithCode(supabase, existing.code)
  if (used !== 0) {
    return NextResponse.json({ error: '이미 주문에 사용된 코드는 삭제할 수 없습니다. 사용을 꺼서 종료해주세요' }, { status: 409 })
  }

  const { error } = await supabase.from('referral_codes').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
