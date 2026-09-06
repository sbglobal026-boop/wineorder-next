import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getVendorUser } from '@/lib/vendor-auth'

export default async function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/vendor')
  }

  const vendor = await getVendorUser()
  if (!vendor) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-gray-50">
        <p className="text-gray-900 font-semibold">입점 벤더 계정이 아닙니다</p>
        <p className="text-gray-400 text-sm">{user.email}로 로그인되어 있습니다</p>
      </div>
    )
  }

  if (vendor.status === 'pending') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-gray-50">
        <p className="text-gray-900 font-semibold">입점 승인 대기 중입니다</p>
        <p className="text-gray-400 text-sm">승인이 완료되면 상품 등록이 가능해집니다</p>
      </div>
    )
  }

  if (vendor.status === 'suspended') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-gray-50">
        <p className="text-gray-900 font-semibold">입점이 중지된 계정입니다</p>
        <p className="text-gray-400 text-sm">문의사항은 담당자에게 연락해주세요</p>
      </div>
    )
  }

  return <>{children}</>;
}
