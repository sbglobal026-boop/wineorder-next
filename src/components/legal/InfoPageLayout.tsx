import { ReactNode } from 'react'

// 소개/FAQ 등 안내 페이지용 카드 톤 레이아웃 (크림 그라데이션 히어로)
export default function InfoPageLayout({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string
  title: string
  subtitle?: string
  children: ReactNode
}) {
  return (
    <div className="min-h-screen" style={{ background: 'radial-gradient(120% 90% at 15% 0%, #faf5ec 0%, #F9F4EE 55%)' }}>
      <header className="max-w-[760px] mx-auto text-center px-5 pt-16 md:pt-24 pb-8">
        <p className="text-[13px] tracking-[0.28em] uppercase text-[#7d5411] mb-3.5">{eyebrow}</p>
        <h1 className="font-[family-name:var(--font-playfair-display)] font-medium text-[38px] md:text-[54px] leading-[1.1] text-[#1C1A17] mb-4">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[15px] md:text-[16px] leading-[1.7] text-[#605d5d]">{subtitle}</p>
        )}
      </header>

      <div className="max-w-[880px] mx-auto px-5 md:px-10 pb-20 text-[15px] text-[#605d5d] leading-relaxed">
        {children}
      </div>
    </div>
  )
}
