'use client'
import { useAppConfig } from '@/context/AppConfigContext'
import ProductCard from '@/components/home/ProductCard'

export default function WinesPage() {
  const { config } = useAppConfig()
  const wines = config.products.filter(p => p.type === 'wine')

  return (
    <div className="bg-[#fef9e4] min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-16">

        <div className="border-b border-gray-200 pb-8 mb-12">
          <p className="text-[#8B4513] text-xs font-bold tracking-widest uppercase mb-3">Wine Collection</p>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">와인 목록</h1>
          <p className="text-gray-400 text-sm mt-3">엄선된 프리미엄 와인 {wines.length}종</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {wines.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  )
}
