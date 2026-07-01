'use client'
import { useAppConfig } from '@/context/AppConfigContext'
import ProductDetailView from '@/components/product/ProductDetailView'

export default function TopDropPage() {
  const { config } = useAppConfig()
  const product = config.products.find(p => p.id === config.featuredWineId) ?? config.products[0]

  if (!product) return null

  return (
    <>
      <div className="max-w-[1640px] mx-auto">
        <div className="bg-[#1C1A17] flex items-center px-5 h-12">
          <h1 className="font-[family-name:var(--font-playfair-display)] text-white text-[21px] font-bold tracking-tight">
            Top Drop
          </h1>
        </div>
      </div>
      <ProductDetailView product={product} showDuty={product.type === 'wine'} />
    </>
  )
}
