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

export default function WinesPage() {
  const { config } = useAppConfig()
  const [active, setActive] = useState<Category | 'all'>('all')

  const wines = config.products.filter(p =>
    p.type === 'wine' && (active === 'all' || p.category === active)
  )

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
        {/* 카테고리 필터 */}
        <div className="flex gap-2 flex-wrap mb-10">
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
