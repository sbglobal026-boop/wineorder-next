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
        <h3 className="text-[20px] font-bold tracking-tight pt-[30px] px-[20px] font-[family-name:var(--font-libre-baskerville)]">Top Drop</h3>

        <div className="grid grid-cols-1 md:grid-cols-[560px_560px] gap-[30px] justify-start px-[20px] pt-[20px] pb-[20px]">
          {/* 메인 이미지 */}
          <div className="relative w-full aspect-square md:w-[560px] md:h-[560px] overflow-hidden bg-[#efeae1]">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <span className="absolute inset-0 flex items-center justify-center text-7xl">
                {product.type === 'wine' ? '🍷' : '🧀'}
              </span>
            )}
          </div>

          <div className="flex flex-col h-auto md:h-[560px] justify-between">
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

            {/* 추가 사진 2장 */}
            <div className="flex gap-3">
              <Link href={href} className="relative flex-1 aspect-square overflow-hidden bg-[#efeae1] group">
                {product.extraImages?.[0] && (
                  <img
                    src={product.extraImages[0]}
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
              </Link>
              <Link href={href} className="relative flex-1 aspect-square overflow-hidden bg-[#efeae1] group">
                {product.extraImages?.[1] && (
                  <img
                    src={product.extraImages[1]}
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* 하단 CTA */}
        <Link
          href={href}
          className="flex items-center justify-end gap-2 border-t border-b border-[#1C1A17]/20 px-10 md:px-14 py-[5px] text-sm font-medium uppercase tracking-widest text-[#1C1A17] hover:bg-[#1C1A17]/5 transition-colors"
        >
          {product.name} 구매하기
          <span>→</span>
        </Link>
      </div>
    </section>
  )
}
