'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { fetchRecentBlogPosts, BlogPost } from '@/lib/blog'
import { BlogCard } from '@/components/blog/BlogCard'
import LoadingDots from '@/components/LoadingDots'

// 메인 Top Drop 아래 블로그 기사 섹션 — 카테고리 구분 없이 최신 글 2개를 카드로 보여줌
const CARD_COUNT = 2

export default function MainBlogSection() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let ignore = false
    fetchRecentBlogPosts(CARD_COUNT)
      .then(data => { if (!ignore) { setPosts(data); setLoading(false) } })
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
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-7">
            {posts.map(post => (
              <BlogCard key={post.id} post={post} variant="square" />
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              href="/journal"
              className="inline-block rounded-full border border-[#d7d3d3] text-[#605d5d] hover:border-[#5C7A63] hover:text-[#0e3719] text-sm px-7 py-3 transition-colors no-underline"
            >
              이야기 더 보기
            </Link>
          </div>
        </>
      )}
    </section>
  )
}
