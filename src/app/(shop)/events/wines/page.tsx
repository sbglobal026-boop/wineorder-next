'use client'
import { useState } from 'react'
import { useAppConfig } from '@/context/AppConfigContext'
import ProductGridCard from '@/components/product/ProductGridCard'

const CATEGORIES = ['레드', '화이트', '로제', '스파클링'] as const
type Category = typeof CATEGORIES[number]

const CATEGORY_LABEL: Record<Category, string> = {
  '레드': 'Red',
  '화이트': 'White',
  '로제': 'Rosé',
  '스파클링': 'Sparkling',
}

function PriceRangeSlider({
  bounds,
  value,
  onChange,
}: {
  bounds: { min: number; max: number }
  value: [number, number]
  onChange: (v: [number, number]) => void
}) {
  const [minVal, maxVal] = value
  const span = bounds.max - bounds.min || 1
  const leftPct = ((minVal - bounds.min) / span) * 100
  const rightPct = ((maxVal - bounds.min) / span) * 100
  const thumbClass =
    'range-slider-thumb pointer-events-none absolute inset-0 h-full w-full appearance-none bg-transparent ' +
    '[&::-webkit-slider-runnable-track]:bg-transparent [&::-moz-range-track]:bg-transparent ' +
    '[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#0e3719] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#FBFAF7] [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform hover:[&::-webkit-slider-thumb]:scale-110 ' +
    '[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#0e3719] [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#FBFAF7] [&::-moz-range-thumb]:shadow-sm [&::-moz-range-thumb]:cursor-pointer'

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-500 whitespace-nowrap font-[family-name:var(--font-lato)]">€{minVal.toLocaleString()} ~ €{maxVal.toLocaleString()}</span>
      <div className="relative h-3.5 w-40 flex items-center">
        <div className="absolute h-[3px] w-full rounded-full bg-[#DAD4CD]" />
        <div
          className="absolute h-[3px] rounded-full bg-[#0e3719]"
          style={{ left: `${leftPct}%`, right: `${100 - rightPct}%` }}
        />
        <input
          type="range"
          min={bounds.min}
          max={bounds.max}
          value={minVal}
          onChange={(e) => onChange([Math.min(Number(e.target.value), maxVal), maxVal])}
          className={thumbClass}
        />
        <input
          type="range"
          min={bounds.min}
          max={bounds.max}
          value={maxVal}
          onChange={(e) => onChange([minVal, Math.max(Number(e.target.value), minVal)])}
          className={thumbClass}
        />
      </div>
    </div>
  )
}

export default function WinesPage() {
  const { config } = useAppConfig()
  const [active, setActive] = useState<Category | 'all'>('all')
  const [search, setSearch] = useState('')
  const [grapeFilter, setGrapeFilter] = useState('')
  const [hideOutOfStock, setHideOutOfStock] = useState(false)
  const [priceRange, setPriceRange] = useState<[number, number] | null>(null)

  const allWines = config.products.filter(p => p.type === 'wine')

  const grapeVarieties = Array.from(
    new Set(allWines.map(p => p.grapeVariety).filter((v): v is string => !!v))
  ).sort()

  const prices = allWines.map(p => p.price)
  const priceBounds = { min: prices.length ? Math.min(...prices) : 0, max: prices.length ? Math.max(...prices) : 0 }
  const [priceMin, priceMax] = priceRange ?? [priceBounds.min, priceBounds.max]

  const wines = allWines.filter(p => {
    if (active !== 'all' && p.category !== active) return false
    if (search.trim() && !p.name.toLowerCase().includes(search.trim().toLowerCase())) return false
    if (p.price < priceMin || p.price > priceMax) return false
    if (grapeFilter && p.grapeVariety !== grapeFilter) return false
    if (hideOutOfStock && (p.stock ?? 0) === 0) return false
    return true
  })

  return (
    <div className="bg-[#F9F4EE] min-h-screen">
      {/* 히어로 섹션 */}
      <div className="max-w-[1640px] mx-auto">
        <div className="bg-[#1C1A17] flex items-center px-5 h-12">
          <h1 className="font-[family-name:var(--font-playfair-display)] text-white text-[21px] font-bold tracking-tight">
            Top Drop Archive
          </h1>
        </div>
      </div>

      <div className="max-w-[1640px] mx-auto px-5 py-12">
        {/* 카테고리 필터 + 세부 필터 */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-10">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setActive('all')}
              className={`text-xs font-semibold px-4 py-2 rounded-full border transition-colors ${
                active === 'all' ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-600 hover:border-gray-400'
              }`}
            >
              All
            </button>
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setActive(c)}
                className={`text-xs font-semibold px-4 py-2 rounded-full border transition-colors ${
                  active === c ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-600 hover:border-gray-400'
                }`}
              >
                {CATEGORY_LABEL[c]}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="상품명 검색"
              className="border border-gray-200 rounded-full px-4 py-2 text-xs focus:outline-none focus:border-gray-400 w-40"
            />
            {priceBounds.max > priceBounds.min && (
              <PriceRangeSlider bounds={priceBounds} value={[priceMin, priceMax]} onChange={setPriceRange} />
            )}
            {grapeVarieties.length > 0 && (
              <select
                value={grapeFilter}
                onChange={(e) => setGrapeFilter(e.target.value)}
                className="border border-gray-200 rounded-full px-4 py-2 text-xs focus:outline-none focus:border-gray-400 text-gray-600"
              >
                <option value="">전체 품종</option>
                {grapeVarieties.map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            )}
            <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={hideOutOfStock}
                onChange={(e) => setHideOutOfStock(e.target.checked)}
                className="accent-gray-900"
              />
              품절 상품 제외
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {wines.length === 0 ? (
            <p className="col-span-4 text-sm text-gray-400 text-center py-24">해당 카테고리 상품이 없습니다</p>
          ) : (
            wines.map((product) => (
              <ProductGridCard key={product.id} product={product} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
