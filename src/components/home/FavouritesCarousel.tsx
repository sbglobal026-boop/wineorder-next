'use client'
import Link from 'next/link'
import { useAppConfig } from '@/context/AppConfigContext'

export default function FavouritesCarousel() {
  const { config } = useAppConfig()
  const product = config.products.find(p => p.id === config.featuredWineId)

  if (!product) return null

  const href = product.type === 'wine' ? `/wines/${product.id}` : `/support/${product.id}`

  return (
    <section className="max-w-[1640px] mx-auto px-[20px] pb-28">
      <div className="flex items-end justify-between flex-wrap gap-5 border-b border-[#1C1A17]/12 pb-5 mb-9">
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-[#1C1A17]">Top Drop.</h2>
        <Link href="/events" className="text-sm font-medium text-[#5c564c] border-b border-[#1C1A17]/25 pb-1">
          View all
        </Link>
      </div>

      <Link href={href} className="grid md:grid-cols-2 gap-0 border border-[#1C1A17]/12">
        <div className="relative aspect-square bg-[#efeae1] flex items-center justify-center">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-7xl">{product.type === 'wine' ? '🍷' : '🧀'}</span>
          )}
          <span className="absolute top-4 left-4 text-[10px] tracking-widest text-[#9a9384] font-mono">
            [ {product.category} ]
          </span>
        </div>

        <div className="p-10 md:p-14 flex flex-col justify-center border-t md:border-t-0 md:border-l border-[#1C1A17]/12">
          <p className="text-xs font-semibold tracking-widest uppercase text-[#9a9384] mb-4">
            {product.origin}
          </p>
          <h3 className="text-3xl md:text-4xl font-semibold tracking-tight mb-5 text-[#1C1A17]">
            {product.name}
          </h3>
          <div className="flex flex-col gap-2 text-[14px] text-[#5c564c] border-t border-[#1C1A17]/10 pt-4 mb-7 max-w-xs">
            <div className="flex justify-between gap-3">
              <span className="text-[#9a9384]">평점</span>
              <span>★ {product.rating}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-[#9a9384]">분류</span>
              <span>{product.type === 'wine' ? '와인' : '식품'}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-semibold text-[#1C1A17]">{product.price.toLocaleString()}원</span>
            <span className="bg-[#1C1A17] text-[#FBFAF7] rounded-full px-6 py-3 text-sm font-medium">
              담기
            </span>
          </div>
        </div>
      </Link>
    </section>
  )
}
