import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createAdminClient()

  const { data: usersPage, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: vendors } = await supabase
    .from('vendors')
    .select('user_id, shop_name, status')
  const vendorByUserId = new Map((vendors ?? []).map(v => [v.user_id, v]))

  // 취소 건 제외 주문을 유저별로 집계 (누적 구매액/주문 수)
  const { data: orders } = await supabase
    .from('orders')
    .select('user_id, total_eur, status')
    .neq('status', 'cancelled')
  const orderStatsByUserId = new Map<string, { count: number; total: number }>()
  for (const o of orders ?? []) {
    const prev = orderStatsByUserId.get(o.user_id) ?? { count: 0, total: 0 }
    orderStatsByUserId.set(o.user_id, { count: prev.count + 1, total: prev.total + o.total_eur })
  }

  const members = usersPage.users
    .map(u => {
      const vendor = vendorByUserId.get(u.id)
      const stats = orderStatsByUserId.get(u.id) ?? { count: 0, total: 0 }
      const metadata = u.user_metadata as { name?: string; tier?: string } | null
      return {
        id: u.id,
        email: u.email ?? null,
        name: metadata?.name ?? null,
        createdAt: u.created_at,
        lastSignInAt: u.last_sign_in_at ?? null,
        vendorShopName: vendor?.shop_name ?? null,
        vendorStatus: vendor?.status ?? null,
        orderCount: stats.count,
        totalSpent: stats.total,
        tier: metadata?.tier ?? 'basic',
      }
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  return NextResponse.json(members)
}
