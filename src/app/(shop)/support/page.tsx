'use client'
import { useAppConfig } from '@/context/AppConfigContext'
import ProductCard from '@/components/home/ProductCard'

export default function FoodPage() {
  const { config } = useAppConfig()
  const foods = config.products.filter(p => p.type === 'food')

  return (
    <div className="bg-[#fef9e4] min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-16">

        <div className="border-b border-gray-200 pb-8 mb-12">
          <p className="text-[#2C5F2D] text-xs font-bold tracking-widest uppercase mb-3">Food Collection</p>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">식품 목록</h1>
          <p className="text-gray-400 text-sm mt-3">엄선된 프리미엄 식품 {foods.length}종</p>
        </div>

        {foods.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <p className="text-4xl mb-4">🧀</p>
            <p className="text-sm">등록된 식품이 없습니다</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {foods.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
