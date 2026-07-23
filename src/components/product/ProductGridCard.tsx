'use client'
import Link from 'next/link'
import { Product } from '@/data/products'
import { useAppConfig } from '@/context/AppConfigContext'

// 상품 카드 (카드 컨셉 · 둥근 카드). 와인/음식 리스트, 장바구니·상세 추천에서 공유.

// 카테고리별 상단 영역 그라데이션 + 작은 영문 라벨
const CATEGORY_META: Record<string, { label: string; bg: string }> = {
  '레드': { label: 'Red', bg: 'radial-gradient(90% 120% at 70% 10%, #f2e6e1, #e6cdc4)' },
  '화이트': { label: 'White', bg: 'radial-gradient(90% 120% at 70% 10%, #eef0dd, #dde5c5)' },
  '로제': { label: 'Rosé', bg: 'radial-gradient(90% 120% at 70% 10%, #f7e7cf, #f1d6b0)' },
  '스파클링': { label: 'Sparkling', bg: 'radial-gradient(90% 120% at 70% 10%, #e7e0ee, #d3c8e0)' },
  '식품': { label: 'Food', bg: 'radial-gradient(90% 120% at 70% 10%, #f3ddc7, #e8c39a)' },
}

function fmt(n: number): string {
  return '€' + n.toLocaleString()
}

export default function ProductGridCard({ product, isNew = false }: { product: Product; isNew?: boolean }) {
  const { addToCart, openCart } = useAppConfig()
  const href = product.type === 'wine' ? `/events/wines/${product.id}` : `/events/food/${product.id}`
  const meta = CATEGORY_META[product.category] ?? { label: '', bg: 'radial-gradient(90% 120% at 70% 10%, #f7e7cf, #f1d6b0)' }
  const firstCriticRating = (product.criticRatings ?? '').split(',').map(s => s.trim()).filter(Boolean)[0]

  const stock = product.stock ?? 1
  const isSoldOut = stock === 0
  const isLowStock = stock > 0 && stock <= 3
  // 배지 우선순위: 품절임박(실데이터) > 신상(임시 placeholder, isNew prop 전달 시)
  const badge = isLowStock ? '품절임박' : isNew ? '신상' : null

  return (
    <div className="cutecard group relative flex flex-col rounded-[24px] border border-[#eae7e7] bg-[#fffefb] overflow-hidden">
      {/* 배지 */}
      {badge && !isSoldOut && (
        <span className="absolute top-3.5 left-3.5 z-[2] text-[11px] tracking-[0.12em] border border-[#b68235] text-[#7d5411] bg-[#fffefb] rounded-full px-3 py-1">
          {badge}
        </span>
      )}

      {/* 이미지 영역 */}
      <Link href={href} className="relative block aspect-square no-underline" style={{ background: meta.bg }}>
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-5xl select-none">
            {product.type === 'wine' ? '🍷' : '🧀'}
          </span>
        )}
        {isSoldOut && (
          <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
            <span className="text-white text-[11px] font-bold tracking-widest uppercase border border-white/60 px-3 py-1">Sold Out</span>
          </div>
        )}
      </Link>

      {/* 정보 */}
      <div className="flex flex-col flex-1 p-4 md:p-5">
        <div className="text-[11px] tracking-[0.16em] uppercase text-[#7d5411] mb-1.5">{meta.label}</div>
        <Link href={href} className="no-underline">
          <h4 className="font-[family-name:var(--font-playfair-display)] text-[18px] md:text-[20px] leading-tight text-[#1C1A17] mb-1 line-clamp-2">
            {product.name}
          </h4>
        </Link>
        {product.grapeVariety && (
          <p className="text-[12.5px] text-[#9b9797] mb-1 truncate">{product.grapeVariety}</p>
        )}

        {/* 원산지 · 평가 */}
        <div className="flex gap-6 mt-1 mb-4 text-[11px]">
          <div>
            <p className="font-medium text-[#605d5d] mb-0.5">원산지.</p>
            <p className="text-[#9b9797]">{product.origin}</p>
          </div>
          <div>
            <p className="font-medium text-[#605d5d] mb-0.5">평가.</p>
            <p className="text-[#9b9797]">{firstCriticRating ?? '—'}</p>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2">
          <span className="font-[family-name:var(--font-playfair-display)] text-[20px] text-[#1C1A17]">{fmt(product.price)}</span>
          {isSoldOut ? (
            <span className="rounded-full border border-[#d7d3d3] text-[#bab6b6] px-3.5 py-1.5 text-[12px]">품절</span>
          ) : (
            <button
              onClick={() => { addToCart(product.id); openCart() }}
              className="buybtn rounded-full border border-[#b68235] text-[#7d5411] px-3.5 py-1.5 text-[12px] hover:bg-[#7d5411] hover:text-[#fffdf9] transition-colors cursor-pointer"
            >
              담기
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
