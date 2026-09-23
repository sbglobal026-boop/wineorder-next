import { createClient } from '@supabase/supabase-js'

// 로그인 정보 없이 공개 데이터만 읽는 서버용 클라이언트
// (sitemap·페이지 제목 생성처럼 쿠키가 필요 없는 곳에서 사용)
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}
