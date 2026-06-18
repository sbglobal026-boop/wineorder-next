'use client'
import { useRef, useState } from 'react'

export default function ImageCarousel({ images }: { images: string[] }) {
  const [index, setIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleScroll = () => {
    const el = containerRef.current
    if (!el) return
    setIndex(Math.round(el.scrollLeft / el.clientWidth))
  }

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-[#fef9e4] flex items-center justify-center">
        <span className="text-6xl">🍷</span>
      </div>
    )
  }

  return (
    <div className="relative bg-gray-50">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar aspect-square"
      >
        {images.map((src, i) => (
          <img key={i} src={src} alt="" className="w-full h-full object-cover shrink-0 snap-center" />
        ))}
      </div>

      {images.length > 1 && (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
          {images.map((_, i) => (
            <span
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${i === index ? 'bg-white' : 'bg-white/50'}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
