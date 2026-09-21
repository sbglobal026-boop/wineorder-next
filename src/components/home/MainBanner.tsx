'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAppConfig } from '@/context/AppConfigContext'

// 메인 상단 배너 — 어드민 "배너 관리"의 사진·제목·부제를 화면 끝까지 꽉 채워 보여주고 7초마다 자동으로 넘김
const AUTO_PLAY_MS = 7000

// 배너 링크가 절대주소로 저장돼 있어도 우리 사이트 주소면 내부 이동으로 처리 (사이트 밖으로 나갔다 오지 않도록)
const INTERNAL_HOSTS = ['tablecodeeu.com', 'www.tablecodeeu.com', 'wineorder-next.vercel.app']

function internalPath(linkUrl: string): string | null {
  if (!/^https?:\/\//i.test(linkUrl)) return linkUrl // 이미 내부 경로
  try {
    const url = new URL(linkUrl)
    const sameHost = typeof window !== 'undefined' && url.hostname === window.location.hostname
    if (sameHost || INTERNAL_HOSTS.includes(url.hostname)) return `${url.pathname}${url.search}${url.hash}`
    return null // 외부 사이트
  } catch {
    return null
  }
}

// 모바일에서 21:9는 너무 납작해 글씨가 들어가지 않으므로 16:9로 조금 높게
// 넓은 화면에서 배너가 너무 커지지 않도록 높이는 585px까지만
const ratioCls = 'aspect-[16/9] md:aspect-[21/9] max-h-[585px]'

export default function MainBanner() {
  const { config, bannerSlidesLoaded } = useAppConfig()
  const slides = config.bannerSlides
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused || slides.length <= 1) return
    const timer = setInterval(() => setIndex(i => (i + 1) % slides.length), AUTO_PLAY_MS)
    return () => clearInterval(timer)
  }, [paused, slides.length])

  // 배너를 불러오는 동안에는 같은 크기의 빈 칸만 둬서 화면이 튀지 않게 함
  if (!bannerSlidesLoaded) return <div className={`w-full ${ratioCls} bg-[#F1ECE4]`} />
  if (slides.length === 0) return null

  // 어드민에서 배너가 줄어든 경우에도 범위를 벗어나지 않게
  const current = index % slides.length

  return (
    <section
      aria-label="배너"
      className={`relative w-full overflow-hidden ${ratioCls} bg-[#1C1A17]`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="flex h-full transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map(slide => {
          const href = slide.linkUrl ? internalPath(slide.linkUrl) : null
          const content = (
            <>
              {slide.videoUrl ? (
                <video src={slide.videoUrl} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover" />
              ) : slide.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={slide.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
              ) : null}
              {/* 사진 위 글씨가 잘 보이도록 아래쪽을 어둡게 */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/10" />
              <div className="absolute inset-x-0 bottom-0">
                <div className="max-w-[1240px] mx-auto px-5 pb-8 md:pb-12 text-[#FBFAF7]">
                  <p className="font-[family-name:var(--font-playfair-display)] font-semibold text-[20px] md:text-[34px] leading-snug whitespace-pre-line">
                    {slide.title}
                  </p>
                  {slide.subtitle && (
                    <p className="mt-1.5 md:mt-3 text-[13px] md:text-[17px] leading-snug whitespace-pre-line text-[#FBFAF7]/85">
                      {slide.subtitle}
                    </p>
                  )}
                </div>
              </div>
            </>
          )

          const slideCls = 'relative w-full h-full shrink-0 block'
          if (href) {
            return (
              <Link key={slide.id} href={href} className={slideCls}>
                {content}
              </Link>
            )
          }
          if (slide.linkUrl) {
            // 외부 사이트 링크는 새 탭으로
            return (
              <a key={slide.id} href={slide.linkUrl} target="_blank" rel="noopener noreferrer" className={slideCls}>
                {content}
              </a>
            )
          }
          return (
            <div key={slide.id} className={slideCls}>
              {content}
            </div>
          )
        })}
      </div>

      {slides.length > 1 && (
        <>
          <button
            type="button"
            aria-label="이전 배너"
            onClick={() => setIndex((current - 1 + slides.length) % slides.length)}
            className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/30 hover:bg-black/50 text-[#FBFAF7] flex items-center justify-center transition-colors cursor-pointer"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="다음 배너"
            onClick={() => setIndex((current + 1) % slides.length)}
            className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/30 hover:bg-black/50 text-[#FBFAF7] flex items-center justify-center transition-colors cursor-pointer"
          >
            ›
          </button>
          <div className="absolute inset-x-0 bottom-3 md:bottom-4 flex justify-center gap-2">
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                aria-label={`${i + 1}번째 배너로 이동`}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${i === current ? 'w-6 bg-[#FBFAF7]' : 'w-1.5 bg-[#FBFAF7]/50 hover:bg-[#FBFAF7]/80'}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
