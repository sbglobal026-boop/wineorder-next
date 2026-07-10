import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const supabase = createAdminClient()
  const { data, error } = await supabase.from('qna_posts').insert(body).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
