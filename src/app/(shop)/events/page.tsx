'use client'
import { useAppConfig } from '@/context/AppConfigContext'
import ProductDetailView from '@/components/product/ProductDetailView'

export default function TopDropPage() {
  const { config } = useAppConfig()
  const product = config.products.find(p => p.id === config.featuredWineId) ?? config.products[0]

  if (!product) return null

  // 검은 상단 바 제거 + Top Drop 전용 인트로 밴드(topDrop) 표시
  return <ProductDetailView product={product} eyebrow="Top Drop" topDrop showDuty={product.type === 'wine'} />
}
