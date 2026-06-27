import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// service_role 키를 쓰는 서버 전용 클라이언트. 절대 클라이언트 컴포넌트에서 import하지 말 것.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
