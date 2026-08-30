'use client'
import { useEffect, useState } from 'react'
import { useParams, notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useAppConfig } from '@/context/AppConfigContext'
import { useAuth } from '@/context/AuthContext'
import { fetchBlogPosts, BlogPost } from '@/lib/blog'
import { isBlogCategory, BlogCategory, childCategories, categoryLabel, categoryHero } from '@/lib/blogCategories'
import { BlogCard } from '@/components/blog/BlogCard'

const PER_PAGE = 9

export default function BlogCategoryPage() {
  const { category } = useParams<{ category: string }>()
  const { config } = useAppConfig()
  const { currentUser } = useAuth()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [subFilter, setSubFilter] = useState<BlogCategory | 'all'>('all')
  const [page, setPage] = useState(1)
  const isApproved = currentUser && config.approvedWriters.includes(currentUser.email)

  if (!isBlogCategory(category)) notFound()
  // Journal은 독립 페이지로 이동
  if (category === 'journal') redirect('/journal')
  const children = childCategories(category)
  const hero = categoryHero(category)

  useEffect(() => {
    if (!isBlogCategory(category)) return
    setSubFilter('all')
    setPage(1)
    const childCats = childCategories(category)
    const target = childCats.length > 0 ? [category, ...childCats] : category
    fetchBlogPosts(target).then(data => { setPosts(data); setLoading(false) })
  }, [category])

  const filtered = subFilter === 'all' ? posts : posts.filter(p => p.category === subFilter)
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const pagePosts = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  return (
    <div className="min-h-screen" style={{ background: 'radial-gradient(120% 90% at 15% 0%, #FFFFFF 0%, #FFFFFF 55%)' }}>
      {/* 히어로 */}
      <header className="max-w-[760px] mx-auto text-center px-5 pt-16 md:pt-24 pb-8">
        <p className="text-[13px] tracking-[0.28em] uppercase text-[#0e3719] mb-3.5">{categoryLabel(category)}</p>
        <h1 className="font-[family-name:var(--font-playfair-display)] font-medium text-[38px] md:text-[54px] leading-[1.1] text-[#1C1A17] mb-4">
          {hero.title}
        </h1>
        {hero.subtitle && (
          <p className="text-[15px] md:text-[16px] leading-[1.7] text-[#605d5d]">{hero.subtitle}</p>
        )}
      </header>

      <div className="max-w-[1240px] mx-auto px-5 pb-20">
        {/* 상위 블로그로 + 하위 카테고리 칩 */}
        <div className="flex items-center justify-between gap-3 flex-wrap mb-10">
          <div className="flex gap-2 flex-wrap items-center">
            <Link href="/blog" className="text-xs font-semibold px-4 py-2 rounded-full border border-[#d7d3d3] text-[#605d5d] hover:border-[#5C7A63] hover:text-[#0e3719] transition-colors no-underline">
              ← 전체
            </Link>
            {children.length > 0 && (
              <>
                <span className="w-px h-5 bg-[#d7d3d3] mx-1" />
                <button
                  onClick={() => { setSubFilter('all'); setPage(1) }}
                  className={`text-xs font-semibold px-4 py-2 rounded-full border transition-colors ${
                    subFilter === 'all' ? 'bg-[#0e3719] text-white border-[#0e3719]' : 'border-[#d7d3d3] text-[#605d5d] hover:border-[#5C7A63]'
                  }`}
                >{categoryLabel(category)}</button>
                {children.map((c) => (
                  <button
                    key={c}
                    onClick={() => { setSubFilter(c); setPage(1) }}
                    className={`text-xs font-semibold px-4 py-2 rounded-full border transition-colors ${
                      subFilter === c ? 'bg-[#0e3719] text-white border-[#0e3719]' : 'border-[#d7d3d3] text-[#605d5d] hover:border-[#5C7A63]'
                    }`}
                  >{categoryLabel(c)}</button>
                ))}
              </>
            )}
          </div>
          {isApproved && (
            <Link href={`/blog/write?category=${category}`} className="text-xs font-semibold px-4 py-2 rounded-full bg-[#0e3719] text-white hover:bg-[#22301C] transition-colors no-underline">
              + 글쓰기
            </Link>
          )}
        </div>

        {loading ? (
          <p className="text-[#9b9797] text-sm text-center py-24">불러오는 중...</p>
        ) : pagePosts.length === 0 ? (
          <p className="text-[#9b9797] text-sm text-center py-24">아직 작성된 글이 없습니다</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {pagePosts.map(post => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>

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
