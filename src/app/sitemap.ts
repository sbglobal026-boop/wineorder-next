import type { MetadataRoute } from 'next'
import { SITE_URL, STATIC_PATHS } from '@/lib/site'
import { createPublicClient } from '@/lib/supabase/public'

// 검색엔진에 알려줄 페이지 목록 — 상품·와이너리·블로그 글이 추가되면 자동으로 포함됨
export const revalidate = 3600 // 1시간마다 갱신

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createPublicClient()

  const [products, wineries, posts] = await Promise.all([
    supabase.from('products_public').select('id, type'),
    supabase.from('wineries').select('slug'),
    supabase.from('blog_posts').select('id, category, created_at'),
  ])

  const entries: MetadataRoute.Sitemap = STATIC_PATHS.map(path => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: path === '/' ? 'daily' : 'weekly',
    priority: path === '/' ? 1 : 0.7,
  }))

  for (const p of products.data ?? []) {
    entries.push({
      url: `${SITE_URL}/events/${p.type === 'food' ? 'food' : 'wines'}/${p.id}`,
      changeFrequency: 'weekly',
      priority: 0.9,
    })
  }

  for (const w of wineries.data ?? []) {
    entries.push({ url: `${SITE_URL}/events/winery/${w.slug}`, changeFrequency: 'monthly', priority: 0.6 })
  }

  for (const post of posts.data ?? []) {
    entries.push({
      url: `${SITE_URL}/blog/${post.category}/${post.id}`,
      lastModified: post.created_at ? new Date(post.created_at) : undefined,
      changeFrequency: 'monthly',
      priority: 0.6,
    })
  }

  return entries
}
