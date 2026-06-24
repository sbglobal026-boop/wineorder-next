'use client'
import Link from 'next/link'
import { useAppConfig } from '@/context/AppConfigContext'

const panelStyles = [
  { bg: 'linear-gradient(180deg,rgba(28,26,23,.15),rgba(28,26,23,.62)),repeating-linear-gradient(135deg,#46403525 0 14px,#3a342b25 14px 28px),#564d40', href: '/wines' },
  { bg: 'linear-gradient(180deg,rgba(28,26,23,.12),rgba(28,26,23,.6)),repeating-linear-gradient(135deg,#3a352d25 0 14px,#2e2a2225 14px 28px),#3f3a31', href: '/blog' },
]

export default function Hero() {
  const { config } = useAppConfig()
  const slides = config.bannerSlides.slice(0, 2)

  return (
    <section className="max-w-[1400px] mx-auto px-[20px] pt-[15px]">
      <div className="grid md:grid-cols-2">
      {slides.map((slide, i) => {
        const style = panelStyles[i] ?? panelStyles[0]
        return (
          <Link
            key={slide.id}
            href={style.href}
            className="relative aspect-square flex flex-col justify-end p-10 md:p-14 text-[#F4EFE6] overflow-hidden"
            style={slide.imageUrl
              ? { backgroundImage: `url(${slide.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
              : { background: style.bg }
            }
          >
            {slide.imageUrl && <div className="absolute inset-0 bg-black/40" />}
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
          </Link>
        )
      })}
      </div>
    </section>
  )
}
