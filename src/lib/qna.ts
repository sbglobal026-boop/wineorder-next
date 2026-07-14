import { createClient } from '@/lib/supabase/client'

export type QnaPost = {
  id: number
  question: string
  answer: string
  sort_order: number
  created_at: string
}

export async function fetchQnaPosts(): Promise<QnaPost[]> {
  const supabase = createClient()
  const { data, error } = await supabase.from('qna_posts').select('*').order('sort_order').order('created_at')
  if (error) throw error
  return data ?? []
}

// 작성/수정/삭제는 관리자 권한이 필요해 서버 API를 통해 처리
export async function createQnaPost(post: { question: string; answer: string; sort_order: number }): Promise<QnaPost> {
  const res = await fetch('/api/admin/qna', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(post),
  })
  if (!res.ok) throw new Error('QnA 작성에 실패했습니다')
  return res.json()
}

export async function updateQnaPost(id: number, post: { question: string; answer: string; sort_order: number }): Promise<void> {
  const res = await fetch(`/api/admin/qna/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(post),
  })
  if (!res.ok) throw new Error('QnA 수정에 실패했습니다')
}

export async function updateQnaOrder(id: number, sort_order: number): Promise<void> {
  const res = await fetch(`/api/admin/qna/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sort_order }),
  })
  if (!res.ok) throw new Error('순서 변경에 실패했습니다')
}

export async function deleteQnaPost(id: number): Promise<void> {
  const res = await fetch(`/api/admin/qna/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('QnA 삭제에 실패했습니다')
}
