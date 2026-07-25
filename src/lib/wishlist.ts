import { createClient } from '@/lib/supabase/client'

// 위시리스트 — Supabase wishlist 테이블 (user_id, product_id). RLS로 본인 것만 접근.

export async function fetchWishlist(userId: string): Promise<number[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('wishlist')
    .select('product_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return (data ?? []).map(r => r.product_id as number)
}

export async function addToWishlist(userId: string, productId: number): Promise<void> {
  const supabase = createClient()
  // 중복은 무시 (unique 제약)
  await supabase.from('wishlist').upsert(
    { user_id: userId, product_id: productId },
    { onConflict: 'user_id,product_id', ignoreDuplicates: true }
  )
}

export async function removeFromWishlist(userId: string, productId: number): Promise<void> {
  const supabase = createClient()
  await supabase.from('wishlist').delete().eq('user_id', userId).eq('product_id', productId)
}
