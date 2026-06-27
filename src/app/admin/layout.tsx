import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAdminUser } from '@/lib/admin-auth'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/admin')
  }

  const admin = await getAdminUser()
  if (!admin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-gray-50">
        <p className="text-gray-900 font-semibold">관리자 권한이 없습니다</p>
        <p className="text-gray-400 text-sm">{user.email}로 로그인되어 있습니다</p>
      </div>
    )
  }

  return <>{children}</>;
}
