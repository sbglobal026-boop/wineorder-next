'use client'
import { useAppConfig } from '@/context/AppConfigContext'
import ProductCard from './ProductCard'

export default function ProductGrid() {
  const { config } = useAppConfig()

  return (
    <section className="bg-[#fef9e4] border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-20">

        {/* 섹션 헤더 */}
        <div className="flex items-end justify-between mb-12 border-b border-gray-200 pb-6">
          <div>
            <p className="text-[#8B4513] text-xs font-bold tracking-widest uppercase mb-2">Wine Collection</p>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">전체 와인</h2>
          </div>
          <button className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors">
            필터 →
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {config.products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
