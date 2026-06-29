'use client'
import { useAppConfig } from '@/context/AppConfigContext'
import ProductDetailView from '@/components/product/ProductDetailView'

export default function TopDropPage() {
  const { config } = useAppConfig()
  const product = config.products.find(p => p.id === config.featuredWineId) ?? config.products[0]

  if (!product) return null

  return <ProductDetailView product={product} showDuty={product.type === 'wine'} />
}
