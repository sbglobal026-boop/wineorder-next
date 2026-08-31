'use client'
import { Suspense, useEffect, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
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

function isCategory(v: string | null): v is Category {
  return !!v && (CATEGORIES as readonly string[]).includes(v)
}

export default function WinesPage() {
  return (
    <Suspense fallback={null}>
      <WinesPageInner />
    </Suspense>
  )
}

function WinesPageInner() {
  const { config, productsLoaded } = useAppConfig()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [active, setActive] = useState<Category | 'all'>(() => {
    const c = searchParams.get('category')
    return isCategory(c) ? c : 'all'
  })
  const [search, setSearch] = useState(() => searchParams.get('q') ?? '')
  const [grapeFilter, setGrapeFilter] = useState(() => searchParams.get('grape') ?? '')
  const [hideOutOfStock, setHideOutOfStock] = useState(() => searchParams.get('soldout') === 'hide')
  const [priceRange, setPriceRange] = useState<[number, number] | null>(() => {
    const min = searchParams.get('priceMin')
    const max = searchParams.get('priceMax')
    return min && max ? [Number(min), Number(max)] : null
  })
  const [sortPrice, setSortPrice] = useState<'none' | 'asc' | 'desc'>(() => {
    const s = searchParams.get('sort')
    return s === 'asc' || s === 'desc' ? s : 'none'
  })

  const allWines = config.products.filter(p => p.type === 'wine')

  const grapeVarieties = Array.from(
    new Set(allWines.map(p => p.grapeVariety).filter((v): v is string => !!v))
  ).sort()

  const prices = allWines.map(p => p.price)
  const priceBounds = { min: prices.length ? Math.min(...prices) : 0, max: prices.length ? Math.max(...prices) : 0 }
  const [priceMin, priceMax] = priceRange ?? [priceBounds.min, priceBounds.max]

  // 필터가 바뀔 때마다 URL 쿼리에 반영 — 새로고침하거나 링크를 공유해도 같은 결과를 볼 수 있도록
  useEffect(() => {
    const params = new URLSearchParams()
    if (active !== 'all') params.set('category', active)
    if (search.trim()) params.set('q', search.trim())
    if (grapeFilter) params.set('grape', grapeFilter)
    if (hideOutOfStock) params.set('soldout', 'hide')
    if (sortPrice !== 'none') params.set('sort', sortPrice)
    if (priceRange && (priceRange[0] !== priceBounds.min || priceRange[1] !== priceBounds.max)) {
      params.set('priceMin', String(priceRange[0]))
      params.set('priceMax', String(priceRange[1]))
    }
    const qs = params.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, search, grapeFilter, hideOutOfStock, sortPrice, priceRange])

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
      style={{ background: 'radial-gradient(120% 90% at 15% 0%, #F9F4EE 0%, #F9F4EE 55%)' }}
    >
      {/* 히어로 헤딩 */}
      <header className="max-w-[760px] mx-auto text-center px-5 pt-16 md:pt-24 pb-10">
        <p className="text-[13px] tracking-[0.28em] uppercase text-[#0e3719] mb-3.5">Top Drop Archive</p>
        <h1 className="font-[family-name:var(--font-playfair-display)] font-medium text-[38px] md:text-[54px] leading-[1.1] text-[#1C1A17] mb-4">
          Our Wine Selection So Far
        </h1>
        <p className="text-[15px] md:text-[16px] leading-[1.7] text-[#605d5d]">
          취향대로 골라 담는 둥근 카드 리스트. 마우스를 올리면 살포시 떠올라요.
        </p>
      </header>

      <div className="max-w-[1240px] mx-auto px-5 pb-16">
        {/* 카테고리 필터 + 세부 필터 */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-10">
          <div className="flex gap-2 flex-wrap" role="group" aria-label="와인 카테고리 필터">
            <button
              onClick={() => setActive('all')}
              aria-pressed={active === 'all'}
              className={`text-xs font-semibold px-4 py-2 rounded-full border transition-colors ${
                active === 'all' ? 'bg-[#0e3719] text-white border-[#0e3719]' : 'border-[#d7d3d3] text-[#605d5d] hover:border-[#5C7A63]'
              }`}
            >
              All
            </button>
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setActive(c)}
                aria-pressed={active === c}
                className={`text-xs font-semibold px-4 py-2 rounded-full border transition-colors ${
                  active === c ? 'bg-[#0e3719] text-white border-[#0e3719]' : 'border-[#d7d3d3] text-[#605d5d] hover:border-[#5C7A63]'
                }`}
              >
                {CATEGORY_LABEL[c]}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="sr-only" htmlFor="wine-search">상품명 검색</label>
            <input
              id="wine-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="상품명 검색"
              className="border border-gray-200 rounded-full px-4 py-2 text-xs focus:outline-none focus:border-gray-400 w-40"
            />
            {/* 항상 자리를 차지하고 opacity로만 보이고 안 보이게 해서, 나타나고 사라질 때 다른 필터가 밀리지 않도록 함 */}
            <button
              onClick={resetFilters}
              tabIndex={isFiltered ? 0 : -1}
              aria-hidden={!isFiltered}
              className={`text-xs text-gray-400 hover:text-gray-700 border border-gray-200 rounded-full px-4 py-2 transition-opacity ${
                isFiltered ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              초기화
            </button>
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
          </div>
        </div>

        {!productsLoaded ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4.2] rounded-[24px] border border-[#eae7e7] bg-[#eae7e7]/40 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  )
}
