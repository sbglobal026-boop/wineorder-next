import { createClient } from '@/lib/supabase/client'
import { removeStorageFiles } from '@/lib/uploadImage'
import { BlogCategory } from '@/lib/blogCategories'

export type BlogPost = {
  id: number
  title: string
  content: string
  images: string[]
  author_id: string | null
  author_name: string
  created_at: string
  category: BlogCategory
}

export type BlogComment = {
  id: number
  post_id: number
  user_id: string
  author_name: string
  content: string
  created_at: string
}

export async function fetchBlogPosts(category?: BlogCategory | BlogCategory[]): Promise<BlogPost[]> {
  const supabase = createClient()
  let query = supabase.from('blog_posts').select('*').order('created_at', { ascending: false })
  if (Array.isArray(category)) query = query.in('category', category)
  else if (category) query = query.eq('category', category)
  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function fetchBlogPost(id: number): Promise<BlogPost | null> {
  const supabase = createClient()
  const { data } = await supabase.from('blog_posts').select('*').eq('id', id).maybeSingle()
  return data ?? null
}

export async function createBlogPost(post: {
  title: string
  content: string
  images: string[]
  author_id: string | null
  author_name: string
  category: BlogCategory
}) {
  const supabase = createClient()
  const { data, error } = await supabase.from('blog_posts').insert(post).select().single()
  if (error) throw error
  return data as BlogPost
}

export async function updateBlogPost(id: number, post: Partial<Pick<BlogPost, 'title' | 'content' | 'images' | 'category' | 'author_name'>>) {
  const supabase = createClient()
  const { error } = await supabase.from('blog_posts').update(post).eq('id', id)
  if (error) throw error
}

export async function deleteBlogPost(id: number, images: string[] = []) {
  if (images.length > 0) {
    await removeStorageFiles('blog-images', images)
  }
  const supabase = createClient()
  const { error } = await supabase.from('blog_posts').delete().eq('id', id)
  if (error) throw error
}

// 대표글 ID들 — app_config 테이블에 저장 (Top Drop featuredProductId와 동일 방식)
// slot: 'main'(Editor's Pick 전체) 또는 카테고리 값('wine' 등)별 대표글
export type FeaturedSlot = 'main' | BlogCategory

function featuredKey(slot: FeaturedSlot): string {
  return slot === 'main' ? 'featuredBlogPostId' : `featuredBlog_${slot}`
}

// 전체 대표글 슬롯을 한 번에 조회 → { main: id, wine: id, ... }
export async function fetchFeaturedBlogPosts(): Promise<Record<string, number>> {
  const supabase = createClient()
  const { data } = await supabase.from('app_config').select('key, value').like('key', 'featuredBlog%')
  const result: Record<string, number> = {}
  for (const row of data ?? []) {
    const n = Number(row.value)
    if (!Number.isFinite(n)) continue
    // key → slot 역변환
    const slot = row.key === 'featuredBlogPostId' ? 'main' : row.key.replace('featuredBlog_', '')
    result[slot] = n
  }
  return result
}

// 하위 호환: 전체 Editor's Pick 단일 조회
export async function fetchFeaturedBlogPostId(): Promise<number | null> {
  const map = await fetchFeaturedBlogPosts()
  return map['main'] ?? null
}

export async function setFeaturedBlogPost(slot: FeaturedSlot, id: number): Promise<void> {
  const supabase = createClient()
  await supabase.from('app_config').upsert({ key: featuredKey(slot), value: String(id) })
}

// 대표글 지정 해제
export async function clearFeaturedBlogPost(slot: FeaturedSlot): Promise<void> {
  const supabase = createClient()
  await supabase.from('app_config').delete().eq('key', featuredKey(slot))
}

export async function fetchLikeCount(postId: number): Promise<number> {
  const supabase = createClient()
  const { count } = await supabase
    .from('blog_likes')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', postId)
  return count ?? 0
}

export async function fetchUserLiked(postId: number, userId: string): Promise<boolean> {
  const supabase = createClient()
  const { data } = await supabase
    .from('blog_likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .maybeSingle()
  return !!data
}

export async function toggleLike(postId: number, userId: string): Promise<boolean> {
  const supabase = createClient()
  const liked = await fetchUserLiked(postId, userId)
  if (liked) {
    await supabase.from('blog_likes').delete().eq('post_id', postId).eq('user_id', userId)
    return false
  }
  await supabase.from('blog_likes').insert({ post_id: postId, user_id: userId })
  return true
}

export async function fetchComments(postId: number): Promise<BlogComment[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('blog_comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true })
  return data ?? []
}

// 본인 댓글 삭제 — user_id 조건을 함께 걸어 다른 사람 댓글은 지워지지 않게 함 (RLS 정책과 이중 안전장치)
export async function deleteComment(commentId: number, userId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('blog_comments')
    .delete()
    .eq('id', commentId)
    .eq('user_id', userId)
  if (error) throw error
}

export async function addComment(postId: number, userId: string, authorName: string, content: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('blog_comments')
    .insert({ post_id: postId, user_id: userId, author_name: authorName, content })
    .select()
    .single()
  if (error) throw error
  return data as BlogComment
}
