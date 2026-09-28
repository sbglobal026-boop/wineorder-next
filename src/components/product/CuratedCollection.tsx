'use client'
import { useAppConfig } from '@/context/AppConfigContext'
import ProductGridCard from '@/components/product/ProductGridCard'
import LoadingDots from '@/components/LoadingDots'

// Top Drop / Preorder 처럼 "어드민에서 고른 상품만 모아 보여주는" 페이지 공용 틀
// 두 페이지가 같은 모양을 유지하도록 한 곳에서 관리한다
export default function CuratedCollection({
  eyebrow,
  title,
  subtitle,
  pick,
  emptyText,
}: {
  eyebrow: string
  title: string
  subtitle?: string
  pick: 'featured' | 'preorder'
  emptyText: string
}) {
  const { config, productsLoaded } = useAppConfig()
  const ids = pick === 'featured' ? config.featuredWineIds : config.preorderWineIds
  const products = config.products.filter(p => ids.includes(p.id))

  return (
    <div className="max-w-[1240px] mx-auto px-5 py-14 md:py-20">
      <header className="text-center max-w-[640px] mx-auto mb-8 md:mb-10">
        <div className="text-[12px] tracking-[0.24em] uppercase text-[#0e3719] mb-2">{eyebrow}</div>
        <h1 className="font-[family-name:var(--font-playfair-display)] font-medium text-[30px] md:text-[40px] leading-tight text-[#1C1A17]">
          {title}
        </h1>
        {subtitle && <p className="mt-3 text-[15px] md:text-[16px] leading-[1.7] text-[#605d5d]">{subtitle}</p>}
      </header>

      {!productsLoaded ? (
        <LoadingDots className="py-20" />
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5 md:gap-7">
          {products.map(product => (
            <ProductGridCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="text-center text-[#9b9797] py-20">{emptyText}</p>
      )}
    </div>
  )
}
