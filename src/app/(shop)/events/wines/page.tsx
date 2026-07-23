'use client'
import { useState } from 'react'
import { useAppConfig } from '@/context/AppConfigContext'
import ProductGridCard from '@/components/product/ProductGridCard'
import { PriceRangeSlider, FilterSelect } from '@/components/product/ProductFilters'

const CATEGORIES = ['레드', '화이트', '로제', '스파클링'] as const
type Category = typeof CATEGORIES[number]

const CATEGORY_LABEL: Record<Category, string> = {
  '레드': 'Red',
  '화이트': 'White',
  '로제': 'Rosé',
  '스파클링': 'Sparkling',
}

export default function WinesPage() {
  const { config } = useAppConfig()
  const [active, setActive] = useState<Category | 'all'>('all')
  const [search, setSearch] = useState('')
  const [grapeFilter, setGrapeFilter] = useState('')
  const [hideOutOfStock, setHideOutOfStock] = useState(false)
  const [priceRange, setPriceRange] = useState<[number, number] | null>(null)
  const [sortPrice, setSortPrice] = useState<'none' | 'asc' | 'desc'>('none')

  const allWines = config.products.filter(p => p.type === 'wine')

  const grapeVarieties = Array.from(
    new Set(allWines.map(p => p.grapeVariety).filter((v): v is string => !!v))
  ).sort()

  const prices = allWines.map(p => p.price)
  const priceBounds = { min: prices.length ? Math.min(...prices) : 0, max: prices.length ? Math.max(...prices) : 0 }
  const [priceMin, priceMax] = priceRange ?? [priceBounds.min, priceBounds.max]

  let wines = allWines.filter(p => {
    if (active !== 'all' && p.category !== active) return false
    if (search.trim() && !p.name.toLowerCase().includes(search.trim().toLowerCase())) return false
    if (p.price < priceMin || p.price > priceMax) return false
    if (grapeFilter && p.grapeVariety !== grapeFilter) return false
    if (hideOutOfStock && (p.stock ?? 0) === 0) return false
    return true
  })
  if (sortPrice === 'asc') wines = [...wines].sort((a, b) => a.price - b.price)
  else if (sortPrice === 'desc') wines = [...wines].sort((a, b) => b.price - a.price)

  const isFiltered = active !== 'all' || search.trim() || grapeFilter || hideOutOfStock || sortPrice !== 'none' || priceRange !== null

  const resetFilters = () => {
    setActive('all')
    setSearch('')
    setGrapeFilter('')
    setHideOutOfStock(false)
    setPriceRange(null)
    setSortPrice('none')
  }

  // 신상 배지용 placeholder: 최신 등록(id 큰 순) 상위 3개 — 추후 등록일 필드로 교체
  const newestIds = new Set([...allWines].sort((a, b) => b.id - a.id).slice(0, 3).map(p => p.id))

  return (
    <div
      className="min-h-screen"
      style={{ background: 'radial-gradient(120% 90% at 15% 0%, #faf5ec 0%, #F9F4EE 55%)' }}
    >
      {/* 히어로 헤딩 */}
      <header className="max-w-[760px] mx-auto text-center px-5 pt-16 md:pt-24 pb-10">
        <p className="text-[13px] tracking-[0.28em] uppercase text-[#7d5411] mb-3.5">Top Drop Archive</p>
        <h1 className="font-[family-name:var(--font-playfair-display)] font-medium text-[38px] md:text-[54px] leading-[1.1] text-[#1C1A17] mb-4">
          Our Wine Selection So Far
        </h1>
        <p className="text-[15px] md:text-[16px] leading-[1.7] text-[#605d5d]">
          취향대로 골라 담는 둥근 카드 리스트. 마우스를 올리면 살포시 떠올라요.
        </p>
      </header>

      <div className="max-w-[1640px] mx-auto px-[20px] pb-16">
        {/* 카테고리 필터 + 세부 필터 */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-10">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setActive('all')}
              className={`text-xs font-semibold px-4 py-2 rounded-full border transition-colors ${
                active === 'all' ? 'bg-[#7d5411] text-white border-[#7d5411]' : 'border-[#d7d3d3] text-[#605d5d] hover:border-[#b68235]'
              }`}
            >
              All
            </button>
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setActive(c)}
                className={`text-xs font-semibold px-4 py-2 rounded-full border transition-colors ${
                  active === c ? 'bg-[#7d5411] text-white border-[#7d5411]' : 'border-[#d7d3d3] text-[#605d5d] hover:border-[#b68235]'
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
              <FilterSelect
                value={grapeFilter}
                onChange={setGrapeFilter}
                options={[{ value: '', label: '전체 품종' }, ...grapeVarieties.map(v => ({ value: v, label: v }))]}
              />
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
            <FilterSelect
              value={sortPrice}
              onChange={(v) => setSortPrice(v as 'none' | 'asc' | 'desc')}
              options={[
                { value: 'none', label: '기본 정렬' },
                { value: 'asc', label: '가격 낮은순' },
                { value: 'desc', label: '가격 높은순' },
              ]}
            />
            {isFiltered && (
              <button
                onClick={resetFilters}
                className="text-xs text-gray-400 hover:text-gray-700 border border-gray-200 rounded-full px-4 py-2 transition-colors"
              >
                초기화
              </button>
            )}
          </div>
        </div>

        <p className="text-xs text-gray-400 mb-4">{wines.length}개 상품</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {wines.length === 0 ? (
            <p className="col-span-2 md:col-span-4 text-sm text-gray-400 text-center py-24">해당 카테고리 상품이 없습니다</p>
          ) : (
            wines.map((product) => (
              <ProductGridCard key={product.id} product={product} isNew={newestIds.has(product.id)} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
