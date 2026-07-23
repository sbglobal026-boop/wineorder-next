import Link from 'next/link'

// 홈 메인: 3개 카테고리 선택 카드 (다운로드 "카드 컨셉" 시안을 브랜드 폰트로 재현)
// blob 도형 + 호버 시 카드가 살포시 떠오르는 인터랙션이 핵심

type Card = {
  href: string
  label: string
  title: string
  desc: string
  emoji: string
  // 상단 영역 그라데이션 / blob 색 / blob 안 글자색 / blob 모양(border-radius)
  bg: string
  blob: string
  ink: string
  shape: string
}

const CARDS: Card[] = [
  {
    href: '/events',
    label: 'Shop',
    title: 'Wine',
    desc: '엄선한 프리미엄 와인을 만나보세요.',
    emoji: '🍷',
    bg: 'radial-gradient(90% 120% at 70% 10%, #f7e7cf, #f1d6b0)',
    blob: '#e8b877',
    ink: '#7a5216',
    shape: '42% 58% 60% 40% / 45% 45% 55% 55%',
  },
  {
    href: '/blog/wine',
    label: 'Story',
    title: 'Blog',
    desc: '와인과 사람, 그리고 이야기.',
    emoji: '✦',
    bg: 'radial-gradient(90% 120% at 70% 10%, #eef0dd, #dde5c5)',
    blob: '#b7c98d',
    ink: '#4f5f28',
    shape: '58% 42% 45% 55% / 55% 48% 52% 45%',
  },
  {
    href: '/blog/journal',
    label: 'Journal',
    title: 'Journal',
    desc: '테이블 코드가 기록하는 순간들.',
    emoji: '✎',
    bg: 'radial-gradient(90% 120% at 70% 10%, #f2e6e1, #e6cdc4)',
    blob: '#d99f8b',
    ink: '#7d4432',
    shape: '48% 52% 55% 45% / 58% 42% 58% 42%',
  },
]

export default function CategoryCards() {
  return (
    <section
      className="max-w-[1640px] mx-auto px-[20px] py-[72px] md:py-[110px]"
      style={{ background: 'radial-gradient(120% 90% at 15% 0%, #faf5ec 0%, #F9F4EE 55%)' }}
    >
      {/* 히어로 헤딩 */}
      <header className="text-center max-w-[760px] mx-auto mb-14 md:mb-20">
        <p className="text-[13px] tracking-[0.32em] uppercase text-[#7d5411] mb-3.5">Table code</p>
        <h1 className="font-[family-name:var(--font-nanum-square)] font-extrabold text-[36px] md:text-[52px] leading-[1.15] text-[#1C1A17] mb-4">
          오늘 <em className="not-italic text-[#7d5411]">어디를</em> 가고 싶으세요?
        </h1>
        <p className="text-[15px] md:text-[17px] leading-[1.65] text-[#605d5d]">
          마음이 가는 카드를 골라보세요. 마우스를 올리면 카드가 살포시 떠오릅니다.
        </p>
      </header>

      {/* 3개 카드: 데스크톱 3열 그리드 → 모바일 세로 스택(가로형 카드) */}
      <div className="max-w-[1240px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-7">
        {CARDS.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="cutecard group block rounded-[24px] md:rounded-[26px] border border-[#eae7e7] bg-[#fffefb] overflow-hidden no-underline
                       flex flex-row md:flex-col items-center md:items-stretch gap-4 md:gap-0 p-4 md:p-0"
          >
            {/* 상단(모바일: 왼쪽) 컬러 영역 + blob */}
            <div
              className="shrink-0 flex items-center justify-center w-[74px] h-[74px] md:w-full md:h-[170px] rounded-[20px] md:rounded-none"
              style={{ background: c.bg }}
            >
              <span
                className="blob flex items-center justify-center w-[56px] h-[56px] md:w-[96px] md:h-[96px]"
                style={{
                  borderRadius: c.shape,
                  background: c.blob,
                  boxShadow: 'inset 0 -8px 16px rgba(120,80,20,.2)',
                }}
              >
                <span className="text-[26px] md:text-[40px]" style={{ color: c.ink }}>{c.emoji}</span>
              </span>
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
        ))}
      </div>
    </section>
  )
}
