'use client'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { fetchBlogPosts, BlogPost } from '@/lib/blog'
import { BlogCategory, categoryLabel } from '@/lib/blogCategories'
import { stripHtml } from '@/lib/sanitizeHtml'
import { isVideoUrl } from '@/lib/uploadImage'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' })
}

const CARD_WIDTH = 340 // 320px 카드 + 20px gap

// title/categories를 바꿔 같은 슬라이드를 여러 섹션(Recent/Wine/Food & Drink)에 재사용
export default function BlogListSection({
  title = 'Recent Posts',
  categories,
  titleHref,
}: {
  title?: string
  categories?: BlogCategory[] // 없으면 전체 글
  titleHref?: string          // 제목 클릭 시 이동할 카테고리 페이지
} = {}) {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchBlogPosts(categories).then(data => setPosts(data.slice(0, 5)))
    // categories는 페이지에서 리터럴로 내려오는 고정값이라 최초 1회만 로드
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const updateArrows = () => {
    const el = scrollRef.current
    if (!el) return
    setCanLeft(el.scrollLeft > 0)
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
  }

  const scrollBy = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'right' ? CARD_WIDTH : -CARD_WIDTH, behavior: 'smooth' })
  }

  if (posts.length === 0) return null

  return (
    <section>
      <div className="max-w-[1640px] mx-auto bg-[#F9F4EE] text-[#1C1A17] pl-[20px] pr-0 py-[20px] md:p-[20px] my-[40px]">
        <div className="max-w-[1600px] mx-auto border-t border-[#1C1A17] my-[10px]" />
        <div className="flex flex-col md:flex-row items-start gap-5 md:gap-[100px]">
          {/* 제목 폭을 고정해서 제목 길이와 무관하게 카드 시작 위치가 세 섹션 모두 동일하게 함 */}
          {titleHref ? (
            <Link href={titleHref} className="shrink-0 md:w-[200px] group/title">
              <h2 className="text-[30px] font-bold tracking-tight font-[family-name:var(--font-playfair-display)] group-hover/title:opacity-70 transition-opacity">{title}</h2>
            </Link>
          ) : (
            <h2 className="text-[30px] font-bold tracking-tight shrink-0 md:w-[200px] font-[family-name:var(--font-playfair-display)]">{title}</h2>
          )}

          {/* 스크롤 영역 + 화살표 */}
          <div className="relative w-full min-w-0">
            {/* 왼쪽 화살표 */}
            <button
              onClick={() => scrollBy('left')}
              className={`hidden md:flex absolute left-0 top-0 h-[380px] z-10 items-center px-3 transition-opacity duration-200 ${canLeft ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            >
              <span className="bg-white/70 hover:bg-white/90 backdrop-blur-sm text-[#1C1A17] w-9 h-9 rounded-full flex items-center justify-center shadow-sm transition-colors text-sm">←</span>
            </button>

            {/* 오른쪽 화살표 */}
            <button
              onClick={() => scrollBy('right')}
              className={`hidden md:flex absolute right-0 top-0 h-[380px] z-10 items-center px-3 transition-opacity duration-200 ${canRight ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            >
              <span className="bg-white/70 hover:bg-white/90 backdrop-blur-sm text-[#1C1A17] w-9 h-9 rounded-full flex items-center justify-center shadow-sm transition-colors text-sm">→</span>
            </button>

            <div
              ref={scrollRef}
              onScroll={updateArrows}
              className="flex flex-nowrap gap-5 overflow-x-auto snap-x snap-mandatory no-scrollbar -ml-[20px] w-[calc(100%+20px)] pl-[20px] scroll-pl-5 pr-[20px] md:ml-0 md:w-full md:pl-0 md:scroll-pl-0 md:pr-0"
            >
              {posts.map((post) => (
                <Link key={post.id} href={`/blog/${post.category}/${post.id}`} className="block group w-[320px] h-[552px] flex flex-col shrink-0 snap-start">
                  {/* 이미지 영역 */}
                  <div className="relative w-[320px] h-[380px] shrink-0 rounded-sm overflow-hidden bg-[#e6e0d4]">
                    {post.images[0] ? (
                      isVideoUrl(post.images[0]) ? (
                        <video
                          src={post.images[0]}
                          muted
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <img
                          src={post.images[0]}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )
                    ) : (
                      <span className="absolute inset-0 flex items-center justify-center text-4xl">🍷</span>
                    )}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                      <p className="bg-[#F9F4EE] rounded-full px-2.5 py-1 text-[11px] font-medium leading-none">
                        {categoryLabel(post.category)}
                      </p>
                      {post.images.length > 1 && (
                        <p className="bg-[#1C1A17] text-[#F9F4EE] rounded-full px-2.5 py-1 text-[11px] font-medium leading-none">
                          사진 {post.images.length}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 하단 정보 */}
                  <p className="text-[17px] font-semibold leading-normal mt-3.5 truncate">{post.title}</p>
                  <div className="border-t border-[#1C1A17] mt-2" />
                  <p className="text-sm leading-normal opacity-70 line-clamp-2 mt-2">{stripHtml(post.content)}</p>
                  <div className="border-t border-[#1C1A17]/10 mt-2" />
                  <div className="flex items-center justify-between gap-3 mt-2">
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <p className="text-[11px] uppercase tracking-widest opacity-50">작성자.</p>
                      <p className="text-xs truncate">{post.author_name}</p>
                    </div>
                    <div className="flex flex-col gap-0.5 items-end shrink-0">
                      <p className="text-[11px] uppercase tracking-widest opacity-50">작성일.</p>
                      <p className="text-xs">{formatDate(post.created_at)}</p>
                    </div>
                  </div>
                  <span className="block mt-2 text-xs font-medium uppercase tracking-widest text-[#1C1A17]/60 group-hover:text-[#1C1A17] transition-colors">
                    View →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
