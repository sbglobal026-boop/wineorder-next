'use client'
import { useAppConfig } from '@/context/AppConfigContext'

const categoryBg: Record<string, string> = {
  '레드': 'from-red-100 to-rose-50',
  '화이트': 'from-yellow-100 to-amber-50',
  '로제': 'from-pink-100 to-fuchsia-50',
  '스파클링': 'from-blue-100 to-sky-50',
}

export default function FeaturedPanel() {
  const { config, toggleFeaturedWine } = useAppConfig()

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">추천 상품 관리</h2>
      <p className="text-gray-500 text-sm mb-8">Top Drop에 표시할 와인을 여러 개 선택할 수 있어요</p>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {config.products.map((product) => {
          const isFeatured = config.featuredWineIds.includes(product.id)
          return (
            <div
              key={product.id}
              className={`bg-white rounded-2xl overflow-hidden border-2 transition-all ${
                isFeatured ? 'border-red-700 shadow-lg' : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              <div className={`h-28 bg-gradient-to-br ${categoryBg[product.category]} flex items-center justify-center`}>
                <span className="text-5xl">🍷</span>
              </div>
              <div className="p-3">
                <p className="text-gray-400 text-xs">{product.origin}</p>
                <p className="text-gray-900 font-semibold text-sm truncate mb-1">{product.name}</p>
                <p className="text-gray-700 font-bold text-xs mb-3">{product.price.toLocaleString()}원</p>
                {isFeatured ? (
                  <button
                    onClick={() => toggleFeaturedWine(product.id)}
                    className="w-full bg-[#0e3719] text-white text-xs font-bold py-2 rounded-full text-center hover:bg-[#22301C] transition-colors"
                  >
                    ✓ 현재 추천 중
                  </button>
                ) : (
                  <button
                    onClick={() => toggleFeaturedWine(product.id)}
                    className="w-full border border-[#0e3719] text-[#0e3719] hover:bg-[#0e3719]/5 text-xs font-semibold py-2 rounded-full transition-colors"
                  >
                    추천으로 설정
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
