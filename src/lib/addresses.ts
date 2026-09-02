import { createClient } from '@/lib/supabase/client'

export type Address = {
  id: string
  recipient_name: string
  address: string
  city: string
  postal_code: string | null
  country: string
  is_default: boolean
  customs_code: string | null
}

export const COUNTRY_OPTIONS = [
  { code: 'KR', label: '🇰🇷 한국' },
  { code: 'DE', label: '🇩🇪 독일' },
  { code: 'FR', label: '🇫🇷 프랑스' },
  { code: 'IT', label: '🇮🇹 이탈리아' },
  { code: 'ES', label: '🇪🇸 스페인' },
  { code: 'NL', label: '🇳🇱 네덜란드' },
  { code: 'BE', label: '🇧🇪 벨기에' },
  { code: 'AT', label: '🇦🇹 오스트리아' },
  { code: 'PT', label: '🇵🇹 포르투갈' },
  { code: 'SE', label: '🇸🇪 스웨덴' },
  { code: 'PL', label: '🇵🇱 폴란드' },
]

export function countryLabel(code: string): string {
  return COUNTRY_OPTIONS.find(c => c.code === code)?.label ?? code
}

export type AddressInput = Omit<Address, 'id'>

export async function fetchMyAddresses(userId: string): Promise<Address[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false })
  return (data ?? []) as Address[]
}

export async function saveAddress(userId: string, input: AddressInput, id?: string): Promise<void> {
  const supabase = createClient()
  // 기본 배송지로 지정하면 기존 기본 해제
  if (input.is_default) {
    await supabase.from('addresses').update({ is_default: false }).eq('user_id', userId)
  }
  if (id) {
    const { error } = await supabase.from('addresses').update(input).eq('id', id).eq('user_id', userId)
    if (error) throw error
  } else {
    const { error } = await supabase.from('addresses').insert({ ...input, user_id: userId })
    if (error) throw error
  }
}

export async function deleteAddress(id: string, userId: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('addresses').delete().eq('id', id).eq('user_id', userId)
  if (error) throw error
}

export async function setDefaultAddress(id: string, userId: string): Promise<void> {
  const supabase = createClient()
  await supabase.from('addresses').update({ is_default: false }).eq('user_id', userId)
  await supabase.from('addresses').update({ is_default: true }).eq('id', id).eq('user_id', userId)
}
