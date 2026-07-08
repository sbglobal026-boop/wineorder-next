import { createClient } from '@/lib/supabase/client'

export type CsPost = {
  id: number
  title: string
  content: string
  author_id: string
  author_name: string
  answer: string | null
  answered_at: string | null
  created_at: string
}

export async function fetchCsPosts(): Promise<CsPost[]> {
  const supabase = createClient()
  const { data, error } = await supabase.from('cs_posts').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function fetchCsPost(id: number): Promise<CsPost | null> {
  const supabase = createClient()
  const { data } = await supabase.from('cs_posts').select('*').eq('id', id).maybeSingle()
  return data ?? null
}

export async function createCsPost(post: {
  title: string
  content: string
  author_id: string
  author_name: string
}) {
  const supabase = createClient()
  const { data, error } = await supabase.from('cs_posts').insert(post).select().single()
  if (error) throw error
  return data as CsPost
}

// 관리자 답변 등록/수정 및 삭제는 서비스 롤 권한이 필요해 서버 API를 통해 처리
export async function answerCsPost(id: number, answer: string) {
  const res = await fetch(`/api/admin/cs-posts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answer }),
  })
  if (!res.ok) throw new Error('답변 등록에 실패했습니다')
}

export async function deleteCsPost(id: number) {
  const res = await fetch(`/api/admin/cs-posts/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('삭제에 실패했습니다')
}
