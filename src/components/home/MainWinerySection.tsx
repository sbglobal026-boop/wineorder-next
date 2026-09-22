'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { fetchWineries, type Winery } from '@/lib/wineries'
import LoadingDots from '@/components/LoadingDots'

// 메인 Top Drop과 블로그 섹션 사이 — 와이너리를 작은 정사각형 카드로 보여주고 자동으로 옆으로 넘김
const AUTO_SLIDE_MS = 4000
const GAP_PX = 20 // 카드 사이 간격 (gap-5)

export default function MainWinerySection() {
  const [wineries, setWineries] = useState<Winery[]>([])
  const [loading, setLoading] = useState(true)
  const [paused, setPaused] = useState(false)
  const [canScroll, setCanScroll] = useState(false)
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let ignore = false
    fetchWineries()
      .then(list => { if (!ignore) { setWineries(list); setLoading(false) } })
      .catch(() => { if (!ignore) setLoading(false) })
    return () => { ignore = true }
  }, [])

  // 카드가 화면 밖으로 넘칠 때만 화살표·자동 넘김을 사용
  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    const update = () => setCanScroll(el.scrollWidth > el.clientWidth + 4)
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [wineries.length])

  // 카드 한 장 너비만큼 이동 (끝에 닿으면 처음으로)
  const slide = (direction: 1 | -1) => {
    const el = trackRef.current
    if (!el) return
    const card = el.querySelector<HTMLElement>('[data-winery-card]')
    const step = (card?.offsetWidth ?? el.clientWidth) + GAP_PX
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4
    if (direction === 1 && atEnd) el.scrollTo({ left: 0, behavior: 'smooth' })
    else if (direction === -1 && el.scrollLeft <= 4) el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' })
    else el.scrollBy({ left: step * direction, behavior: 'smooth' })
  }

  useEffect(() => {
    if (paused || !canScroll) return
    const timer = setInterval(() => slide(1), AUTO_SLIDE_MS)
    return () => clearInterval(timer)
  }, [paused, canScroll])

  // 등록된 와이너리가 없으면 섹션 자체를 숨김
  if (!loading && wineries.length === 0) return null

  return (
    <section className="max-w-[1240px] mx-auto px-5 pb-16 md:pb-20">
      <div className="flex items-end justify-between gap-4 mb-8 md:mb-10">
        <div>
          <p className="text-[13px] tracking-[0.32em] uppercase text-[#0e3719] mb-3">Winery</p>
          <h2 className="font-[family-name:var(--font-playfair-display)] font-semibold text-[28px] md:text-[38px] leading-tight text-[#1C1A17]">
            table code가 만난 생산자
          </h2>
        </div>
        <Link href="/events/winery" className="shrink-0 text-sm text-[#605d5d] hover:text-[#0e3719] transition-colors no-underline">
          전체 보기 →
        </Link>
      </div>

      {loading ? (
        <LoadingDots className="py-12" />
      ) : (
        <div
          className="relative"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={() => setPaused(true)}
        >
          <div
            ref={trackRef}
            className="flex gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar"
          >
            {wineries.map(w => (
              <Link
                key={w.id}
                href={`/events/winery/${w.slug}`}
                data-winery-card
                className="snap-start shrink-0 w-[150px] md:w-[190px] no-underline group"
              >
                <div className="relative w-full aspect-square overflow-hidden rounded-[16px] bg-[#EFE9E1]">
                  {w.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={w.image_url}
                      alt={w.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-3xl select-none">🍇</div>
                  )}
                </div>
                <p className="mt-3 text-[14px] font-semibold text-[#1C1A17] leading-snug line-clamp-2 group-hover:text-[#0e3719] transition-colors">
                  {w.name}
                </p>
                {(w.country || w.region) && (
                  <p className="mt-1 text-[12px] text-[#9b9797]">{[w.country, w.region].filter(Boolean).join(' · ')}</p>
                )}
                {w.description && (
                  <p className="mt-1.5 text-[12.5px] leading-snug text-[#605d5d] line-clamp-1">{w.description}</p>
                )}
              </Link>
            ))}
          </div>

          {canScroll && (
            <>
              <button
                type="button"
                aria-label="이전 와이너리"
                onClick={() => slide(-1)}
                className="absolute -left-3 top-[30%] w-9 h-9 rounded-full bg-white/90 hover:bg-white shadow flex items-center justify-center text-[#605d5d] transition-colors cursor-pointer"
              >
                ‹
              </button>
              <button
                type="button"
                aria-label="다음 와이너리"
                onClick={() => slide(1)}
                className="absolute -right-3 top-[30%] w-9 h-9 rounded-full bg-white/90 hover:bg-white shadow flex items-center justify-center text-[#605d5d] transition-colors cursor-pointer"
              >
                ›
              </button>
            </>
          )}
        </div>
      )}
    </section>
  )
}
