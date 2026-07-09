'use client'
import { useRef, useState } from 'react'
import { isVideoUrl } from '@/lib/uploadImage'

export default function ImageCarousel({ images }: { images: string[] }) {
  const [index, setIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleScroll = () => {
    const el = containerRef.current
    if (!el) return
    setIndex(Math.round(el.scrollLeft / el.clientWidth))
  }

  const goTo = (i: number) => {
    const el = containerRef.current
    if (!el) return
    el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' })
  }

  if (images.length === 0) {
    return (
      <div className="aspect-[1240/775] bg-[#fef9e4] flex items-center justify-center">
        <span className="text-6xl">🍷</span>
      </div>
    )
  }

  return (
    <div className="relative bg-gray-50 group">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar aspect-[1240/775]"
      >
        {images.map((src, i) => (
          <div key={i} className="relative w-full h-full shrink-0 snap-center overflow-hidden bg-black">
            {isVideoUrl(src) ? (
              <video src={src} controls className="relative w-full h-full object-contain" />
            ) : (
              <>
                {/* 사진 톤에 맞춘 블러 배경 (여백을 사진 색감으로 자연스럽게 채움) */}
                <img src={src} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl brightness-75" />
                <img src={src} alt="" className="relative w-full h-full object-contain" />
              </>
            )}
          </div>
        ))}
      </div>

      {images.length > 1 && (
        <>
          {index > 0 && (
            <button
              onClick={() => goTo(index - 1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white shadow flex items-center justify-center text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ‹
            </button>
          )}
          {index < images.length - 1 && (
            <button
              onClick={() => goTo(index + 1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white shadow flex items-center justify-center text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ›
            </button>
          )}

          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
            {images.map((_, i) => (
              <span
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${i === index ? 'bg-white' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
