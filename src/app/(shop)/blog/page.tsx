'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { fetchBlogPost, fetchFeaturedBlogPosts, fetchLatestBlogPost, fetchBlogPostsPage, BlogPost } from '@/lib/blog'
import { topLevelCategories, categoryLabel, childCategories, BlogCategory } from '@/lib/blogCategories'
import { useAuth } from '@/context/AuthContext'
import { useAppConfig } from '@/context/AppConfigContext'
import { BlogCard, BlogFeaturedCard } from '@/components/blog/BlogCard'

const PER_PAGE = 9

// Journal은 독립 페이지라 블로그 칩/목록에서 제외
const chips = topLevelCategories().filter(c => c.value !== 'journal')
const allNonJournalCategories: BlogCategory[] = chips.flatMap(c => {
  const top = c.value as BlogCategory
  return [top, ...childCategories(top)]
})

export default function BlogHomePage() {
  const { currentUser } = useAuth()
  const { config } = useAppConfig()
  const [featured, setFeatured] = useState<BlogPost | null>(null)
  const [catFeatured, setCatFeatured] = useState<{ cat: BlogCategory; post: BlogPost }[]>([])
  const [featuredLoaded, setFeaturedLoaded] = useState(false)
  const [pagePosts, setPagePosts] = useState<BlogPost[]>([])
  const [total, setTotal] = useState(0)
  const [loadedPage, setLoadedPage] = useState<number | null>(null)
  const [page, setPage] = useState(1)

  const isApproved = currentUser && config.approvedWriters.includes(currentUser.email)

  // 대표글(Editor's Pick + 카테고리별 대표글)만 먼저 로드
  // — 지정된 글은 ID로 콕 집어서, 미지정 카테고리는 최신 글 1개만 (전체 글을 다 받지 않음)
  useEffect(() => {
    fetchFeaturedBlogPosts().then(async (fmap) => {
      const mainPost = fmap['main']
        ? await fetchBlogPost(fmap['main'])
        : await fetchLatestBlogPost(allNonJournalCategories)

      const catResults = await Promise.all(chips.map(async (c) => {
        const top = c.value as BlogCategory
        const target = [top, ...childCategories(top)]
        const post = fmap[top] ? await fetchBlogPost(fmap[top]) : await fetchLatestBlogPost(target)
        return { cat: top, post }
      }))

      setFeatured(mainPost)
      setCatFeatured(catResults.filter((x): x is { cat: BlogCategory; post: BlogPost } => !!x.post))
      setFeaturedLoaded(true)
    })
  }, [])

  // 대표글로 이미 보여준 것들을 제외하고 "최근 글"을 페이지 단위로 로드
  useEffect(() => {
    if (!featuredLoaded) return
    const shownIds = [featured?.id, ...catFeatured.map(x => x.post.id)].filter((v): v is number => !!v)
    fetchBlogPostsPage(allNonJournalCategories, page, PER_PAGE, shownIds).then(({ posts, total }) => {
      setPagePosts(posts)
      setTotal(total)
      setLoadedPage(page)
    })
  }, [featuredLoaded, featured, catFeatured, page])

  const loading = !featuredLoaded || loadedPage !== page
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))
  const isEmpty = !loading && !featured && catFeatured.length === 0 && total === 0

  return (
    <div className="min-h-screen" style={{ background: 'radial-gradient(120% 90% at 15% 0%, #F9F4EE 0%, #F9F4EE 55%)' }}>
      {/* 히어로 */}
      <header className="max-w-[760px] mx-auto text-center px-5 pt-16 md:pt-24 pb-8">
        <p className="text-[13px] tracking-[0.28em] uppercase text-[#0e3719] mb-3.5">Table Code Journal</p>
        <h1 className="font-[family-name:var(--font-playfair-display)] font-medium text-[38px] md:text-[54px] leading-[1.1] text-[#1C1A17] mb-4">
          와인과 사람, 그리고 이야기
        </h1>
        <p className="text-[15px] md:text-[16px] leading-[1.7] text-[#605d5d]">
          카드를 눌러 오늘의 글을 만나보세요. 마우스를 올리면 살포시 떠올라요.
        </p>
      </header>

      <div className="max-w-[1240px] mx-auto px-5 pb-20">
        {/* 카테고리 칩 (하위 페이지로 이동) */}
        <div className="flex items-center justify-between gap-3 flex-wrap mb-10">
          <div className="flex gap-2 flex-wrap">
            <span className="text-xs font-semibold px-4 py-2 rounded-full border bg-[#0e3719] text-white border-[#0e3719]">전체</span>
            {chips.map(c => (
              <Link
                key={c.value}
                href={`/blog/${c.value}`}
                className="text-xs font-semibold px-4 py-2 rounded-full border border-[#d7d3d3] text-[#605d5d] hover:border-[#5C7A63] hover:text-[#0e3719] transition-colors no-underline"
              >
                {c.label}
              </Link>
            ))}
          </div>
          {isApproved && (
            <Link href="/blog/write" className="text-xs font-semibold px-4 py-2 rounded-full bg-[#0e3719] text-white hover:bg-[#22301C] transition-colors no-underline">
              + 글쓰기
            </Link>
          )}
        </div>

        {loading ? (
          <p className="text-[#9b9797] text-sm text-center py-24">불러오는 중...</p>
        ) : isEmpty ? (
          <p className="text-[#9b9797] text-sm text-center py-24">아직 작성된 글이 없습니다</p>
        ) : (
          <>
            {/* 대표글 (Editor's Pick) */}
            {featured && (
              <div className="mb-14">
                <BlogFeaturedCard post={featured} />
              </div>
            )}

            {/* 카테고리별 대표글 */}
            {catFeatured.length > 0 && (
              <div className="mb-14">
                <div className="flex items-baseline justify-between mb-6">
                  <h3 className="font-[family-name:var(--font-playfair-display)] text-[26px] text-[#1C1A17]">카테고리별 추천</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {catFeatured.map(({ cat, post }) => (
                    <div key={cat}>
                      <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-[#0e3719] mb-5">{categoryLabel(cat)}</p>
                      <BlogCard post={post} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 최근 글 */}
            {pagePosts.length > 0 && (
              <>
                <div className="flex items-baseline justify-between mb-6">
                  <h3 className="font-[family-name:var(--font-playfair-display)] text-[26px] text-[#1C1A17]">최근 글</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {pagePosts.map(post => (
                    <BlogCard key={post.id} post={post} />
                  ))}
                </div>
              </>
            )}

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-14">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-9 h-9 rounded-full border border-[#d7d3d3] text-[#605d5d] flex items-center justify-center hover:border-[#5C7A63] hover:text-[#0e3719] transition-colors disabled:opacity-30"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`w-9 h-9 rounded-full border flex items-center justify-center text-sm transition-colors ${
                      n === page
                        ? 'border-[#5C7A63] text-[#0e3719] font-semibold bg-[#0e3719]/5'
                        : 'border-[#d7d3d3] text-[#605d5d] hover:border-[#5C7A63] hover:text-[#0e3719]'
                    }`}
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-9 h-9 rounded-full border border-[#d7d3d3] text-[#605d5d] flex items-center justify-center hover:border-[#5C7A63] hover:text-[#0e3719] transition-colors disabled:opacity-30"
                >
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
