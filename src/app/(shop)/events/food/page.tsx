'use client'
import { useState } from 'react'
import { useAppConfig } from '@/context/AppConfigContext'
import ProductGridCard from '@/components/product/ProductGridCard'
import { PriceRangeSlider, FilterSelect } from '@/components/product/ProductFilters'

export default function FoodPage() {
  const { config } = useAppConfig()
  const [search, setSearch] = useState('')
  const [hideOutOfStock, setHideOutOfStock] = useState(false)
  const [priceRange, setPriceRange] = useState<[number, number] | null>(null)
  const [sortPrice, setSortPrice] = useState<'none' | 'asc' | 'desc'>('none')

  const allFoods = config.products.filter(p => p.type === 'food')

  const prices = allFoods.map(p => p.price)
  const priceBounds = { min: prices.length ? Math.min(...prices) : 0, max: prices.length ? Math.max(...prices) : 0 }
  const [priceMin, priceMax] = priceRange ?? [priceBounds.min, priceBounds.max]

  let foods = allFoods.filter(p => {
    if (search.trim() && !p.name.toLowerCase().includes(search.trim().toLowerCase())) return false
    if (p.price < priceMin || p.price > priceMax) return false
    if (hideOutOfStock && (p.stock ?? 0) === 0) return false
    return true
  })
  if (sortPrice === 'asc') foods = [...foods].sort((a, b) => a.price - b.price)
  else if (sortPrice === 'desc') foods = [...foods].sort((a, b) => b.price - a.price)

  const isFiltered = search.trim() || hideOutOfStock || sortPrice !== 'none' || priceRange !== null

  const resetFilters = () => {
    setSearch('')
    setHideOutOfStock(false)
    setPriceRange(null)
    setSortPrice('none')
  }

  // 신상 배지용 placeholder: 최신 등록(id 큰 순) 상위 3개
  const newestIds = new Set([...allFoods].sort((a, b) => b.id - a.id).slice(0, 3).map(p => p.id))

  return (
    <div className="min-h-screen" style={{ background: 'radial-gradient(120% 90% at 15% 0%, #faf5ec 0%, #F9F4EE 55%)' }}>
      {/* 히어로 헤딩 */}
      <header className="max-w-[760px] mx-auto text-center px-5 pt-16 md:pt-24 pb-10">
        <p className="text-[13px] tracking-[0.28em] uppercase text-[#7d5411] mb-3.5">Food Collection</p>
        <h1 className="font-[family-name:var(--font-playfair-display)] font-medium text-[38px] md:text-[54px] leading-[1.1] text-[#1C1A17] mb-4">
          Best Pairing Food for Wine
        </h1>
        <p className="text-[15px] md:text-[16px] leading-[1.7] text-[#605d5d]">
          와인과 곁들이기 좋은 테이블 코드의 식품 셀렉션. 마우스를 올리면 살포시 떠올라요.
        </p>
      </header>

      <div className="max-w-[1640px] mx-auto px-[20px] pb-16">
        {/* 필터 바 */}
        <div className="flex flex-wrap items-center justify-end gap-3 mb-10">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="상품명 검색"
            className="border border-gray-200 rounded-full px-4 py-2 text-xs focus:outline-none focus:border-gray-400 w-40"
          />
          {priceBounds.max > priceBounds.min && (
            <PriceRangeSlider bounds={priceBounds} value={[priceMin, priceMax]} onChange={setPriceRange} />
          )}
          <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={hideOutOfStock}
              onChange={(e) => setHideOutOfStock(e.target.checked)}
              className="accent-[#7d5411]"
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

        <p className="text-xs text-gray-400 mb-4">{foods.length}개 상품</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {foods.length === 0 ? (
            <p className="col-span-2 md:col-span-4 text-sm text-gray-400 text-center py-24">등록된 식품이 없습니다</p>
          ) : (
            foods.map((product) => (
              <ProductGridCard key={product.id} product={product} isNew={newestIds.has(product.id)} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
