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
  const { data } = await supabase
    .from('product_reviews')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: false })
  return data ?? []
}

// 내가 쓴 리뷰 모아보기 (마이페이지)
export async function fetchMyReviews(userId: string): Promise<ProductReview[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('product_reviews')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function deleteReview(id: number, userId: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('product_reviews').delete().eq('id', id).eq('user_id', userId)
  if (error) throw error
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
