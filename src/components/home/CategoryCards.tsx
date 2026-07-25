'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  HOME_CARD_KEYS, HOME_CARD_STATIC, DEFAULT_HOME_CONTENT, HomeContent, fetchHomeContent,
} from '@/lib/homeCards'

// 홈 메인: 3개 카테고리 선택 카드. 텍스트·사진은 어드민 배너관리에서 편집(app_config), 링크/색은 고정.

export default function CategoryCards() {
  const [content, setContent] = useState<HomeContent>(DEFAULT_HOME_CONTENT)

  useEffect(() => {
    fetchHomeContent().then(setContent)
  }, [])

  return (
    <section
      className="max-w-[1640px] mx-auto px-[20px] py-[72px] md:py-[110px]"
      style={{ background: 'radial-gradient(120% 90% at 15% 0%, #faf5ec 0%, #F9F4EE 55%)' }}
    >
      {/* 히어로 헤딩 */}
      <header className="text-center max-w-[760px] mx-auto mb-14 md:mb-20">
        <p className="text-[13px] tracking-[0.32em] uppercase text-[#7d5411] mb-3.5">{content.eyebrow}</p>
        <h1 className="font-[family-name:var(--font-nanum-square)] font-extrabold text-[36px] md:text-[52px] leading-[1.15] text-[#1C1A17] mb-4">
          {content.heroTitle}
        </h1>
        <p className="text-[15px] md:text-[17px] leading-[1.65] text-[#605d5d]">
          {content.heroSubtitle}
        </p>
      </header>

      {/* 3개 카드: 데스크톱 3열 그리드 → 모바일 세로 스택(가로형 카드) */}
      <div className="max-w-[1240px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-7">
        {HOME_CARD_KEYS.map((key) => {
          const s = HOME_CARD_STATIC[key]
          const c = content.cards[key]
          return (
            <Link
              key={key}
              href={s.href}
              className="cutecard group block rounded-[24px] md:rounded-[26px] border border-[#eae7e7] bg-[#fffefb] overflow-hidden no-underline
                         flex flex-row md:flex-col items-center md:items-stretch gap-4 md:gap-0 p-4 md:p-0"
            >
              {/* 상단(모바일: 왼쪽) 이미지/컬러 영역 */}
              <div
                className="relative shrink-0 overflow-hidden flex items-center justify-center w-[74px] h-[74px] md:w-full md:h-auto md:aspect-[2/1] rounded-[20px] md:rounded-none"
                style={{ background: s.bg }}
              >
                {c.imageUrl ? (
                  <img src={c.imageUrl} alt={c.title} className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <span
                    className="blob flex items-center justify-center w-[56px] h-[56px] md:w-[96px] md:h-[96px]"
                    style={{ borderRadius: s.shape, background: s.blob, boxShadow: 'inset 0 -8px 16px rgba(120,80,20,.2)' }}
                  >
                    <span className="text-[26px] md:text-[40px]" style={{ color: s.ink }}>{s.emoji}</span>
                  </span>
                )}
              </div>

              {/* 텍스트 */}
              <div className="min-w-0 md:p-6 md:pb-7">
                <div className="text-[11px] md:text-[12px] tracking-[0.2em] uppercase text-[#7d5411] mb-1.5 md:mb-2">
                  {c.label}
                </div>
                <h3 className="font-[family-name:var(--font-playfair-display)] font-medium text-[21px] md:text-[26px] text-[#1C1A17] mb-1 md:mb-2">
                  {c.title}
                </h3>
                <p className="text-[12.5px] md:text-[14px] leading-[1.6] text-[#605d5d] mb-0 md:mb-[18px]">
                  {c.desc}
                </p>
                <span className="hidden md:inline-flex items-center gap-1.5 text-[14px] text-[#7d5411] border-b border-[#b68235]">
                  둘러보기 →
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
