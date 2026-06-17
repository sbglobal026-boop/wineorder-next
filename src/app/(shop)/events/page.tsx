'use client'
import { useAppConfig } from '@/context/AppConfigContext'
import ProductCard from '@/components/home/ProductCard'

const categoryBg: Record<string, string> = {
  '레드': 'bg-red-50',
  '화이트': 'bg-amber-50',
  '로제': 'bg-pink-50',
  '스파클링': 'bg-blue-50',
}

function extractVintage(name: string): string {
  const match = name.match(/\b(19|20)\d{2}\b/)
  return match ? match[0] : '—'
}

export default function TopDropPage() {
  const { config } = useAppConfig()
  const product = config.products.find(p => p.id === config.featuredWineId) ?? config.products[0]
  const recommended = config.products.filter(p => p.id !== product?.id).slice(0, 4)

  if (!product) return null

  return (
    <div className="bg-white min-h-screen">

      {/* 상품 상세 */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <p className="text-[#8B4513] text-xs font-bold tracking-widest uppercase mb-8">Today&apos;s Top Drop</p>

        <div className="grid md:grid-cols-2 gap-0 border border-gray-200">

          {/* 왼쪽: 이미지 */}
          <div className={`${categoryBg[product.category]} flex items-center justify-center py-32`}>
            {product.imageUrl
              ? <img src={product.imageUrl} alt={product.name} className="h-80 w-80 object-cover" />
              : <span className="text-[160px] select-none">🍷</span>
            }
          </div>

          {/* 오른쪽: 상품 정보 */}
          <div className="p-10 md:p-14 flex flex-col justify-center border-l border-gray-200">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
              {product.category} · {product.origin}
            </p>

            <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-5">
              {product.name}
            </h1>

            <div className="flex items-center gap-8 mb-6">
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Vintage</p>
                <p className="text-sm font-bold text-gray-900">{extractVintage(product.name)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Rating</p>
                <div className="flex items-center gap-1">
                  <span className="text-[#F5D623] text-sm">★</span>
                  <span className="text-sm font-bold text-gray-900">{product.rating}</span>
                </div>
              </div>
            </div>

            <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-sm">
              {product.description}
            </p>

            <p className="text-4xl font-black text-gray-900 mb-8">
              {product.price.toLocaleString()}
              <span className="text-lg font-semibold text-gray-400 ml-1">원</span>
            </p>

            <div className="flex gap-3">
              <button className="flex-1 bg-[#8B4513] hover:bg-[#2C5F2D] text-white text-xs font-bold uppercase tracking-widest py-4 transition-colors">
                장바구니 담기
              </button>
              <button className="flex-1 border-2 border-[#8B4513] text-[#8B4513] hover:bg-[#8B4513] hover:text-white text-xs font-bold uppercase tracking-widest py-4 transition-colors">
                바로 구매
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Past Top Drops */}
      {recommended.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 pb-20">
          <div className="border-b border-gray-200 pb-6 mb-10">
            <p className="text-[#8B4513] text-xs font-bold tracking-widest uppercase mb-2">Previously Featured</p>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Past Top Drops</h2>
          </div>
          <div className="max-w-xs">
            <ProductCard product={recommended[0]} />
          </div>
        </div>
      )}

    </div>
  )
}
