'use client'
import { useParams } from 'next/navigation'
import { useAppConfig } from '@/context/AppConfigContext'
import Link from 'next/link'

export default function FoodDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { config } = useAppConfig()
  const product = config.products.find(p => p.id === Number(id))

  if (!product) {
    return (
      <div className="bg-[#fef9e4] min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-400 text-sm">존재하지 않는 상품입니다</p>
        <Link href="/events/food" className="text-xs font-bold uppercase tracking-widest text-[#2C5F2D] hover:text-[#8B4513] transition-colors">
          ← 식품 목록으로
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-[#fef9e4] min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-10">

        <Link href="/events/food" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors mb-10">
          ← 식품 목록
        </Link>

        <div className="grid md:grid-cols-2 gap-0 border border-gray-200">

          {/* 왼쪽: 이미지 */}
          <div className="bg-green-50 relative flex items-center justify-center py-32 overflow-hidden">
            {product.imageUrl
              ? <img src={product.imageUrl} alt={product.name} className="absolute inset-0 w-full h-full object-cover" />
              : <span className="text-[160px] select-none">🧀</span>
            }
          </div>

          {/* 오른쪽: 상품 정보 */}
          <div className="p-10 md:p-14 flex flex-col justify-center border-l border-gray-200">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
              식품 · {product.origin}
            </p>

            <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-5">
              {product.name}
            </h1>

            <div className="flex items-center gap-8 mb-6">
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
              <button className="flex-1 bg-[#2C5F2D] hover:bg-[#8B4513] text-white text-xs font-bold uppercase tracking-widest py-4 transition-colors">
                장바구니 담기
              </button>
              <button className="flex-1 border-2 border-[#2C5F2D] text-[#2C5F2D] hover:bg-[#2C5F2D] hover:text-white text-xs font-bold uppercase tracking-widest py-4 transition-colors">
                바로 구매
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
