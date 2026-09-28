'use client'
import { useEffect, useState } from 'react'
import { fetchBlogPostsPage, BlogPost } from '@/lib/blog'
import { childCategories, type BlogCategory } from '@/lib/blogCategories'
import { BlogCard } from '@/components/blog/BlogCard'
import LoadingDots from '@/components/LoadingDots'

// 메인 Top Drop 아래 블로그 기사 섹션 — Wine 계열 최신 글 2개를 카드로 보여줌
const CARD_COUNT = 2
// Wine 아래 하위 카테고리(Winery·Tasting 등)까지 포함 — /blog/wine 목록 페이지와 같은 기준
const WINE_CATEGORIES: BlogCategory[] = ['wine', ...childCategories('wine')]

export default function MainBlogSection() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let ignore = false
    fetchBlogPostsPage(WINE_CATEGORIES, 1, CARD_COUNT)
      .then(({ posts }) => { if (!ignore) { setPosts(posts); setLoading(false) } })
      .catch(() => { if (!ignore) setLoading(false) })
    return () => { ignore = true }
  }, [])

  // 글이 없거나 불러오지 못하면 섹션 자체를 숨김
  if (!loading && posts.length === 0) return null

  return (
    <section className="max-w-[1240px] mx-auto px-5 pb-16 md:pb-20">
      {/* 제목 문구 대신 구분선만 */}
      <div className="border-t border-[#dcd6cd] mb-10 md:mb-12" />

      {loading ? (
        <LoadingDots className="py-16" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-7">
          {posts.map(post => (
            <BlogCard key={post.id} post={post} variant="square" />
          ))}
        </div>
      )}
    </section>
  )
}
