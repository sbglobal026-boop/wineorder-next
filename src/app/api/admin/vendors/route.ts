import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createAdminClient()

  const { data: vendors, error } = await supabase
    .from('vendors')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // vendors.user_id는 auth.users를 가리키는데, 이건 PostgREST로 직접 join이 안 돼서 관리자 API로 이메일을 따로 붙임
  const { data: usersPage } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 })
  const emailMap = new Map(usersPage?.users.map(u => [u.id, u.email]) ?? [])

  const enriched = (vendors ?? []).map(v => ({ ...v, email: emailMap.get(v.user_id) ?? null }))

  return NextResponse.json(enriched)
}
