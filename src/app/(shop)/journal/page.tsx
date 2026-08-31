'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { fetchBlogPosts, BlogPost } from '@/lib/blog'
import { categoryHero } from '@/lib/blogCategories'
import { useAuth } from '@/context/AuthContext'
import { useAppConfig } from '@/context/AppConfigContext'
import { BlogCard, BlogFeaturedCard } from '@/components/blog/BlogCard'

const PER_PAGE = 9

export default function JournalPage() {
  const { currentUser } = useAuth()
  const { config } = useAppConfig()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  const isApproved = currentUser && config.approvedWriters.includes(currentUser.email)
  const hero = categoryHero('journal')

  useEffect(() => {
    fetchBlogPosts('journal').then(data => { setPosts(data); setLoading(false) })
  }, [])

  // 대표글: 최신 저널 글
  const featured = posts[0] ?? null
  const rest = posts.filter(p => p.id !== featured?.id)
  const totalPages = Math.max(1, Math.ceil(rest.length / PER_PAGE))
  const pagePosts = rest.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  return (
    <div className="min-h-screen" style={{ background: 'radial-gradient(120% 90% at 15% 0%, #F9F4EE 0%, #F9F4EE 55%)' }}>
      {/* 히어로 */}
      <header className="max-w-[760px] mx-auto text-center px-5 pt-16 md:pt-24 pb-8">
        <p className="text-[13px] tracking-[0.28em] uppercase text-[#0e3719] mb-3.5">Journal</p>
        <h1 className="font-[family-name:var(--font-playfair-display)] font-medium text-[38px] md:text-[54px] leading-[1.1] text-[#1C1A17] mb-4">
          {hero.title}
        </h1>
        <p className="text-[15px] md:text-[16px] leading-[1.7] text-[#605d5d]">{hero.subtitle}</p>
      </header>

      <div className="max-w-[1240px] mx-auto px-5 pb-20">
        {isApproved && (
          <div className="flex justify-end mb-8">
            <Link href="/blog/write?category=journal" className="text-xs font-semibold px-4 py-2 rounded-full bg-[#0e3719] text-white hover:bg-[#22301C] transition-colors no-underline">
              + 글쓰기
            </Link>
          </div>
        )}

        {loading ? (
          <p className="text-[#9b9797] text-sm text-center py-24">불러오는 중...</p>
        ) : posts.length === 0 ? (
          <p className="text-[#9b9797] text-sm text-center py-24">아직 작성된 저널 글이 없습니다</p>
        ) : (
          <>
            {featured && (
              <div className="mb-14">
                <BlogFeaturedCard post={featured} />
              </div>
            )}

            {pagePosts.length > 0 && (
              <>
                <div className="flex items-baseline justify-between mb-6">
                  <h3 className="font-[family-name:var(--font-playfair-display)] text-[26px] text-[#1C1A17]">저널 글</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {pagePosts.map(post => (
                    <BlogCard key={post.id} post={post} />
                  ))}
                </div>
              </>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-14">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="w-9 h-9 rounded-full border border-[#d7d3d3] text-[#605d5d] flex items-center justify-center hover:border-[#5C7A63] hover:text-[#0e3719] transition-colors disabled:opacity-30">
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`w-9 h-9 rounded-full border flex items-center justify-center text-sm transition-colors ${
                      n === page ? 'border-[#5C7A63] text-[#0e3719] font-semibold bg-[#0e3719]/5' : 'border-[#d7d3d3] text-[#605d5d] hover:border-[#5C7A63] hover:text-[#0e3719]'
                    }`}
                  >{n}</button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="w-9 h-9 rounded-full border border-[#d7d3d3] text-[#605d5d] flex items-center justify-center hover:border-[#5C7A63] hover:text-[#0e3719] transition-colors disabled:opacity-30">
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
