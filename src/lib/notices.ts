import { createClient } from '@/lib/supabase/client'

export type Notice = {
  id: number
  title: string
  content: string
  author_name: string
  created_at: string
}

export async function fetchNotices(): Promise<Notice[]> {
  const supabase = createClient()
  const { data, error } = await supabase.from('notices').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function fetchNotice(id: number): Promise<Notice | null> {
  const supabase = createClient()
  const { data } = await supabase.from('notices').select('*').eq('id', id).maybeSingle()
  return data ?? null
}

// 공지사항 작성/수정/삭제는 관리자 권한이 필요해 서버 API를 통해 처리
export async function createNotice(notice: { title: string; content: string; author_name: string }): Promise<Notice> {
  const res = await fetch('/api/admin/notices', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(notice),
  })
  if (!res.ok) throw new Error('공지사항 작성에 실패했습니다')
  return res.json()
}

export async function updateNotice(id: number, notice: { title: string; content: string }): Promise<void> {
  const res = await fetch(`/api/admin/notices/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(notice),
  })
  if (!res.ok) throw new Error('공지사항 수정에 실패했습니다')
}

export async function deleteNotice(id: number): Promise<void> {
  const res = await fetch(`/api/admin/notices/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('공지사항 삭제에 실패했습니다')
}
