import { createClient } from '@/lib/supabase/server'

const adminEmails = (process.env.ADMIN_EMAILS ?? '')
  .split(',')
  .map(e => e.trim().toLowerCase())
  .filter(Boolean)

// 현재 로그인한 사용자가 관리자 이메일 목록에 있는지 확인. 아니면 null.
export async function getAdminUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return null
  if (!adminEmails.includes(user.email.toLowerCase())) return null
  return user
}
