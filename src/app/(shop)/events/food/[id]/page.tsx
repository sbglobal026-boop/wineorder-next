'use client'
import { useParams } from 'next/navigation'
import { useAppConfig } from '@/context/AppConfigContext'
import ProductDetailView from '@/components/product/ProductDetailView'
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
    <ProductDetailView
      product={product}
      eyebrow="식품"
      backLink={{ href: '/events/food', label: '← 식품 목록' }}
    />
  )
}
