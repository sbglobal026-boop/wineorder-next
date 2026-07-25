import { createClient } from '@/lib/supabase/client'

export type ProductReview = {
  id: number
  product_id: number
  user_id: string
  author_name: string
  rating: number
  comment: string
  created_at: string
}

export async function fetchReviews(productId: number): Promise<ProductReview[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('product_reviews')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

// 내가 쓴 리뷰 모아보기 (마이페이지)
export async function fetchMyReviews(userId: string): Promise<ProductReview[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('product_reviews')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function deleteReview(id: number, userId: string): Promise<void> {
  const supabase = createClient()
  // delete()는 0건이 지워져도 에러를 던지지 않으므로, select()로 실제 삭제된 행을 받아 확인한다
  // (0건이면 RLS에 막혔거나 본인 리뷰가 아닌 경우)
  const { data, error } = await supabase.from('product_reviews').delete().eq('id', id).eq('user_id', userId).select()
  if (error) throw error
  if (!data || data.length === 0) throw new Error('리뷰를 삭제할 권한이 없거나 이미 삭제되었습니다')
}

export async function addReview(review: {
  productId: number
  userId: string
  authorName: string
  rating: number
  comment: string
}) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('product_reviews')
    .insert({
      product_id: review.productId,
      user_id: review.userId,
      author_name: review.authorName,
      rating: review.rating,
      comment: review.comment,
    })
    .select()
    .single()
  if (error) throw error
  return data as ProductReview
}
