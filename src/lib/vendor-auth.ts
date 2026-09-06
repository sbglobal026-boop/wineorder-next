import { createClient } from '@/lib/supabase/server'

export type Vendor = {
  id: string
  user_id: string
  shop_name: string
  business_info: string | null
  country: string | null
  stripe_account_id: string | null
  commission_rate: number
  status: string // pending | approved | suspended
  created_at: string
}

// 현재 로그인한 사용자가 벤더로 등록돼 있는지 확인. 아니면 null.
// status는 여기서 걸러내지 않음 — pending/suspended 화면 분기는 호출하는 쪽에서 처리
export async function getVendorUser(): Promise<Vendor | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: vendor } = await supabase
    .from('vendors')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  return vendor
}
