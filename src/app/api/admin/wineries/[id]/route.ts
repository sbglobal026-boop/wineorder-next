import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { parseWineryInput } from '@/lib/wineries'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const parsed = parseWineryInput(await request.json().catch(() => ({})))
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 })

  const supabase = createAdminClient()
  const { error } = await supabase.from('wineries').update(parsed.value).eq('id', Number(id))
  if (error) {
    const message = error.code === '23505' ? '이미 있는 주소용 영문 이름입니다' : error.message
    return NextResponse.json({ error: message }, { status: error.code === '23505' ? 409 : 500 })
  }
  return NextResponse.json({ ok: true })
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const supabase = createAdminClient()

  // 연결된 상품이 있으면 먼저 연결을 해제하도록 안내 (실수로 상품의 와이너리가 사라지는 것 방지)
  const { count } = await supabase
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('winery_id', Number(id))
  if ((count ?? 0) > 0) {
    return NextResponse.json({ error: `이 와이너리로 등록된 상품이 ${count}개 있습니다. 상품에서 먼저 다른 와이너리로 바꿔주세요` }, { status: 409 })
  }

  const { error } = await supabase.from('wineries').delete().eq('id', Number(id))
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
