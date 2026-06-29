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
