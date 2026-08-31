import { ReactNode } from 'react'

// 법적/안내 페이지 카드 톤 레이아웃 (크림 그라데이션 히어로)
export default function LegalPageLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: 'radial-gradient(120% 90% at 15% 0%, #F9F4EE 0%, #F9F4EE 55%)' }}>
      <header className="max-w-[760px] mx-auto text-center px-5 pt-16 md:pt-24 pb-8">
        <h1 className="font-[family-name:var(--font-playfair-display)] font-medium text-[34px] md:text-[46px] leading-[1.1] text-[#1C1A17]">
          {title}
        </h1>
      </header>
      <div className="max-w-[880px] mx-auto px-5 md:px-10 pb-20 text-[15px] text-[#605d5d] leading-relaxed">
        {children}
      </div>
    </div>
  )
}
