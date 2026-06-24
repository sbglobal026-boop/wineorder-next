'use client'
import Link from 'next/link'
import { useAppConfig } from '@/context/AppConfigContext'

export default function FavouritesCarousel() {
  const { config } = useAppConfig()
  const product = config.products.find(p => p.id === config.featuredWineId)

  if (!product) return null

  const href = product.type === 'wine' ? `/events/wines/${product.id}` : `/events/food/${product.id}`

  return (
    <section className="max-w-[1640px] mx-auto pb-0">
      <div className="flex flex-col bg-[#DAD4CD]">
        <h3 className="text-lg md:text-2xl font-medium tracking-tight pt-10 md:pt-14 px-[20px]">Top Drop.</h3>

        <div className="grid md:grid-cols-[560px_560px] gap-[30px] justify-start pl-[20px] pt-[20px] pb-[20px]">
          {/* 메인 이미지 */}
          <div className="relative w-[560px] h-[560px] overflow-hidden bg-[#efeae1]">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <span className="absolute inset-0 flex items-center justify-center text-7xl">
                {product.type === 'wine' ? '🍷' : '🧀'}
              </span>
            )}
          </div>

          <div className="flex flex-col h-[560px] justify-between">
            <div>
              {/* 와인 이름 */}
              <p className="text-2xl md:text-[34px] leading-snug font-semibold tracking-tight mb-3 text-[#1C1A17]">
                {product.name}
              </p>

              {/* 와인 설명 */}
              <p className="text-sm text-[#5c564c] mb-8">
                {product.description}
              </p>

              {/* 혜택/정보 리스트 */}
              <div className="flex flex-col gap-3">
                <p className="flex items-center gap-3 text-sm text-[#1C1A17]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1C1A17] shrink-0" />
                  평점 ★ {product.rating}
                </p>
                <p className="flex items-center gap-3 text-sm text-[#1C1A17]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1C1A17] shrink-0" />
                  원산지 {product.origin}
                </p>
                <p className="flex items-center gap-3 text-sm text-[#1C1A17]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1C1A17] shrink-0" />
                  분류 {product.type === 'wine' ? '와인' : '식품'}
                </p>
              </div>
            </div>

            {/* 옵션 카드 (와인 / 식품) */}
            <div className="flex gap-3">
              <Link href="/events/wines" className="relative flex-1 aspect-square overflow-hidden bg-[#efeae1] flex items-end p-4 group">
                <span className="relative z-10 text-xs font-medium uppercase tracking-widest text-[#1C1A17] flex items-center justify-between w-full">
                  와인
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </span>
              </Link>
              <Link href="/events/food" className="relative flex-1 aspect-square overflow-hidden bg-[#efeae1] flex items-end p-4 group">
                <span className="relative z-10 text-xs font-medium uppercase tracking-widest text-[#1C1A17] flex items-center justify-between w-full">
                  식품
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* 하단 CTA */}
        <Link
          href={href}
          className="flex items-center justify-between border-t border-b border-[#1C1A17]/20 px-10 md:px-14 py-5 text-sm font-medium uppercase tracking-widest text-[#1C1A17] hover:bg-[#1C1A17]/5 transition-colors"
        >
          {product.name} 구매하기
          <span>→</span>
        </Link>
      </div>
    </section>
  )
}
