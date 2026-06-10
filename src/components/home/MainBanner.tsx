'use client'
import { useState, useEffect } from 'react'
import { useAppConfig } from '@/context/AppConfigContext'

export default function MainBanner() {
  const { config } = useAppConfig()
  const slides = config.bannerSlides
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [slides.length])

  const slide = slides[current]
  const hasImage = !!slide.imageUrl

  return (
    <section
      className="relative border-b border-gray-100 overflow-hidden"
      style={hasImage ? { backgroundImage: `url(${slide.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
    >
      {/* 이미지 있을 때 어두운 오버레이 */}
      {hasImage && <div className="absolute inset-0 bg-black/50" />}

      <div className={`relative max-w-7xl mx-auto px-6 py-24 md:py-36 ${!hasImage ? 'bg-[#fef9e4]' : ''}`}>
        <div className="max-w-3xl">
          <p className={`text-xs font-bold tracking-widest uppercase mb-6 ${hasImage ? 'text-[#F5D623]' : 'text-[#8B4513]'}`}>
            {slide.subtitle}
          </p>

          <h1 className={`text-5xl md:text-7xl font-black leading-none tracking-tight mb-10 whitespace-pre-line ${hasImage ? 'text-white' : 'text-gray-900'}`}>
            {slide.title}
          </h1>

          <button className="inline-flex items-center gap-3 bg-[#8B4513] hover:bg-[#2C5F2D] text-white text-xs font-bold uppercase tracking-widest px-8 py-4 transition-colors duration-200">
            {slide.cta}
            <span>→</span>
          </button>
        </div>

        {/* 슬라이드 인디케이터 */}
        <div className="flex gap-1 mt-16">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-0.5 transition-all duration-500 ${
                i === current ? 'w-12 bg-[#8B4513]' : 'w-4 bg-[#8B4513]/30 hover:bg-[#8B4513]/60'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
