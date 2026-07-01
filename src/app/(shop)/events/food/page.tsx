'use client'
import { useAppConfig } from '@/context/AppConfigContext'
import ProductGridCard from '@/components/product/ProductGridCard'

export default function FoodPage() {
  const { config } = useAppConfig()
  const foods = config.products.filter(p => p.type === 'food')

  return (
    <div className="bg-[#F9F4EE] min-h-screen">
      <div className="max-w-[1640px] mx-auto">
        <div className="bg-[#1C1A17] flex items-center px-5 h-12">
          <h1 className="font-[family-name:var(--font-playfair-display)] text-white text-[21px] font-bold tracking-tight">
            Food Collection
          </h1>
        </div>
      </div>
      <div className="max-w-[1640px] mx-auto px-5 py-12">
        {foods.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <p className="text-4xl mb-4">🧀</p>
            <p className="text-sm">등록된 식품이 없습니다</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {foods.map((product) => (
              <ProductGridCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )

}
