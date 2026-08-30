'use client'
import { useAppConfig } from '@/context/AppConfigContext'
import ProductGridCard from '@/components/product/ProductGridCard'

// Top Drop: 어드민에서 여러 개 선택 가능 → 진열대처럼 카드로 나열, 클릭하면 각자의 상세페이지로 이동
export default function TopDropPage() {
  const { config } = useAppConfig()
  const products = config.products.filter(p => config.featuredWineIds.includes(p.id))

  return (
    <div className="max-w-[1240px] mx-auto px-5 py-16 md:py-20">
      <header className="text-center max-w-[640px] mx-auto mb-12 md:mb-16">
        <p className="text-[13px] tracking-[0.32em] uppercase text-[#0e3719] mb-3">Top Drop</p>
        <h1 className="font-[family-name:var(--font-playfair-display)] font-semibold text-[32px] md:text-[44px] leading-tight text-[#1C1A17] mb-3">
          이번 Top Drop
        </h1>
        <p className="text-[15px] text-[#605d5d] leading-relaxed">
          지금 이 순간 가장 추천하는 상품들을 모았습니다.
        </p>
      </header>

      {products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5 md:gap-7">
          {products.map(product => (
            <ProductGridCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="text-center text-[#9b9797] py-20">아직 선택된 Top Drop 상품이 없습니다.</p>
      )}
    </div>
  )
}
