'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useAppConfig } from '@/context/AppConfigContext'
import { Product } from '@/data/products'

const tabs: { label: string; match: (p: Product) => boolean }[] = [
  { label: '레드', match: p => p.category === '레드' },
  { label: '화이트', match: p => p.category === '화이트' },
  { label: '로제', match: p => p.category === '로제' },
  { label: '스파클링', match: p => p.category === '스파클링' },
  { label: '식품', match: p => p.type === 'food' },
]

export default function FavouritesCarousel() {
  const { config } = useAppConfig()
  const [active, setActive] = useState(0)
  const items = config.products.filter(tabs[active].match)

  return (
    <section className="px-6 md:px-10 pt-6 pb-28 max-w-7xl mx-auto">
      <div className="flex items-end justify-between flex-wrap gap-5 border-b border-[#1C1A17]/12 pb-5 mb-9">
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-[#1C1A17]">table code Favourites.</h2>
        <div className="flex gap-7 items-center">
          {tabs.map((tab, i) => (
            <button
              key={tab.label}
              onClick={() => setActive(i)}
              className="relative text-[16px] font-medium pb-1.5"
              style={{ color: '#1C1A17' }}
            >
              {tab.label}.
              {active === i && (
                <span className="absolute left-0 right-0 bottom-0 h-[2px] bg-[#1C1A17]" />
              )}
            </button>
          ))}
          <Link href="/wines" className="text-sm font-medium text-[#5c564c] border-b border-[#1C1A17]/25 pb-1">
            View all
          </Link>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-[#9a9384] py-10">상품이 없습니다</p>
      ) : (
        <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar" style={{ scrollSnapType: 'x proximity' }}>
          {items.map((item) => {
            const href = item.type === 'wine' ? `/wines/${item.id}` : `/support/${item.id}`
            return (
              <Link key={item.id} href={href} className="flex-none w-[270px]" style={{ scrollSnapAlign: 'start' }}>
                <div className="relative aspect-[3/4] rounded-sm overflow-hidden bg-[#efeae1]">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center text-5xl">
                      {item.type === 'wine' ? '🍷' : '🧀'}
                    </span>
                  )}
                  <span className="absolute top-3.5 left-3.5 text-[10px] tracking-widest text-[#9a9384] font-mono">
                    [ {item.category} ]
                  </span>
                </div>
                <div className="text-xs font-semibold tracking-widest uppercase text-[#9a9384] mt-4 mb-1.5">
                  {item.origin}
                </div>
                <div className="text-[18px] font-semibold tracking-tight mb-3.5 text-[#1C1A17] truncate">
                  {item.name}
                </div>
                <div className="flex flex-col gap-1.5 text-[13px] text-[#5c564c] border-t border-[#1C1A17]/10 pt-3">
                  <div className="flex justify-between gap-3">
                    <span className="text-[#9a9384]">평점</span>
                    <span>★ {item.rating}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-[#9a9384]">분류</span>
                    <span>{item.type === 'wine' ? '와인' : '식품'}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-[18px]">
                  <span className="text-[16px] font-semibold text-[#1C1A17]">{item.price.toLocaleString()}원</span>
                  <span className="bg-[#1C1A17] text-[#FBFAF7] rounded-full px-5 py-2.5 text-[13px] font-medium">
                    담기
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </section>
  )
}
