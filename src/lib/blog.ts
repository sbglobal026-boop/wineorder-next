import { createClient } from '@/lib/supabase/client'
import { removeStorageFiles } from '@/lib/uploadImage'

export type BlogPost = {
  id: number
  title: string
  content: string
  images: string[]
  author_id: string | null
  author_name: string
  created_at: string
}

export type BlogComment = {
  id: number
  post_id: number
  user_id: string
  author_name: string
  content: string
  created_at: string
}

export async function fetchBlogPosts(): Promise<BlogPost[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false })
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
}) {
  const supabase = createClient()
  const { data, error } = await supabase.from('blog_posts').insert(post).select().single()
  if (error) throw error
  return data as BlogPost
}

export async function updateBlogPost(id: number, post: Partial<Pick<BlogPost, 'title' | 'content' | 'images'>>) {
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
