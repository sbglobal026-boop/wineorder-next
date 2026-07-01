'use client'
import { useAppConfig } from '@/context/AppConfigContext'
import ProductGridCard from '@/components/product/ProductGridCard'

export default function WinesPage() {
  const { config } = useAppConfig()
  const wines = config.products.filter(p => p.type === 'wine')

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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {wines.map((product) => (
            <ProductGridCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  )
}
