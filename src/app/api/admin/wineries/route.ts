import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { parseWineryInput } from '@/lib/wineries'

export async function GET() {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createAdminClient()
  const { data, error } = await supabase.from('wineries').select('*').order('name')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(request: Request) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = parseWineryInput(await request.json().catch(() => ({})))
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 })

  const supabase = createAdminClient()
  const { error } = await supabase.from('wineries').insert(parsed.value)
  if (error) {
    const message = error.code === '23505' ? '이미 있는 주소용 영문 이름입니다' : error.message
    return NextResponse.json({ error: message }, { status: error.code === '23505' ? 409 : 500 })
  }
  return NextResponse.json({ ok: true })
}
