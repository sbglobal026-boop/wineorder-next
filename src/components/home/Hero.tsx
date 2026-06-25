'use client'
import { useEffect, useRef, useState } from 'react'
import { useAppConfig } from '@/context/AppConfigContext'

const AUTO_PLAY_MS = 10000

const panelStyles = [
  { bg: 'linear-gradient(180deg,rgba(28,26,23,.15),rgba(28,26,23,.62)),repeating-linear-gradient(135deg,#46403525 0 14px,#3a342b25 14px 28px),#564d40' },
  { bg: 'linear-gradient(180deg,rgba(28,26,23,.12),rgba(28,26,23,.6)),repeating-linear-gradient(135deg,#3a352d25 0 14px,#2e2a2225 14px 28px),#3f3a31' },
]

export default function Hero() {
  const { config } = useAppConfig()
  const slides = config.bannerSlides
  const containerRef = useRef<HTMLDivElement>(null)
  const [page, setPage] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const pageCount = Math.ceil(slides.length / 2)

  const handleScroll = () => {
    const el = containerRef.current
    if (!el) return
    setPage(Math.round(el.scrollLeft / el.clientWidth))
  }

  const goTo = (i: number) => {
    const el = containerRef.current
    if (!el) return
    el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' })
  }

  // 자동 슬라이드 전환
  useEffect(() => {
    if (pageCount <= 1 || isPaused) return
    const timer = setInterval(() => {
      goTo((page + 1) % pageCount)
    }, AUTO_PLAY_MS)
    return () => clearInterval(timer)
  }, [page, pageCount, isPaused])

  return (
    <section className="max-w-[1640px] mx-auto px-[20px] pt-0">
      <div
        className="relative group"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar"
        >
          {Array.from({ length: pageCount }).map((_, p) => (
            <div key={p} className="grid md:grid-cols-2 w-full shrink-0 snap-start">
              {slides.slice(p * 2, p * 2 + 2).map((slide, i) => {
                const style = panelStyles[i] ?? panelStyles[0]
                return (
                  <div
                    key={slide.id}
                    className="relative aspect-square flex flex-col justify-end p-10 md:p-14 text-[#F4EFE6] overflow-hidden"
                    style={slide.imageUrl
                      ? { backgroundImage: `url(${slide.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                      : { background: style.bg }
                    }
                  >
                    {slide.imageUrl && <div className="absolute inset-0 bg-black/40" />}

                    {/* 슬라이드 진행 바 (왼쪽 패널에만 표시) */}
                    {i === 0 && (
                      <div className="absolute bottom-4 md:bottom-6 left-10 md:left-14 w-24 h-[3px] bg-white/30 z-10">
                        {p === page && (
                          <div
                            key={page}
                            className="h-full bg-white animate-[hero-progress_10000ms_linear_forwards]"
                            style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
                          />
                        )}
                        {p < page && <div className="h-full bg-white" />}
                      </div>
                    )}

                    <div className="relative">
                      <p className="max-w-md text-[22px] md:text-[25px] leading-snug font-normal whitespace-pre-line mb-6">
                        {slide.title}
                      </p>
                      <div className="flex items-center gap-4">
                        <span className="text-lg font-semibold">{slide.subtitle}</span>
                        <span className="border border-white/50 rounded-full px-5 py-2 text-[13.5px] font-medium">
                          {slide.cta}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        {pageCount > 1 && (
          <>
            {page > 0 && (
              <button
                onClick={() => goTo(page - 1)}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white shadow flex items-center justify-center text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity z-10"
              >
                ‹
              </button>
            )}
            {page < pageCount - 1 && (
              <button
                onClick={() => goTo(page + 1)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white shadow flex items-center justify-center text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity z-10"
              >
                ›
              </button>
            )}
          </>
        )}
      </div>
    </section>
  )
}
