'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, notFound } from 'next/navigation'
import { useAppConfig } from '@/context/AppConfigContext'
import ProductGridCard from '@/components/product/ProductGridCard'
import LoadingDots from '@/components/LoadingDots'
import { fetchWineryBySlug, fetchWineryProductIds, type Winery } from '@/lib/wineries'

// 와이너리 상세 — 위에 사진·이름, 가운데 이 와이너리 상품, 맨 아래 소개글
export default function WineryDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { config, productsLoaded } = useAppConfig()
  const [winery, setWinery] = useState<Winery | null>(null)
  const [productIds, setProductIds] = useState<number[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let ignore = false
    Promise.all([fetchWineryBySlug(slug), fetchWineryProductIds(slug)])
      .then(([found, ids]) => {
        if (ignore) return
        setWinery(found)
        setProductIds(ids)
        setLoading(false)
      })
      .catch(() => { if (!ignore) setLoading(false) })
    return () => { ignore = true }
  }, [slug])

  if (loading) {
    return <div className="min-h-screen" style={{ background: 'radial-gradient(120% 90% at 15% 0%, #F9F4EE 0%, #F9F4EE 55%)' }}><LoadingDots className="py-32" /></div>
  }
  if (!winery) notFound()

  const products = config.products.filter(p => productIds.includes(p.id))

  return (
    <div className="min-h-screen" style={{ background: 'radial-gradient(120% 90% at 15% 0%, #F9F4EE 0%, #F9F4EE 55%)' }}>
      {/* 상단 — 사진 + 이름 */}
      <section className="max-w-[1240px] mx-auto px-5 pt-10 md:pt-14">
        {/* 사진은 최대 400px, 옆 글 영역은 최소 280px 확보 */}
        <div className="grid md:grid-cols-[minmax(0,400px)_minmax(280px,1fr)] gap-6 md:gap-10 items-center">
          {/* 사진 칸은 400×400 정사각형까지 — 사진은 비율 그대로 안쪽에 맞추고 남는 공간은 페이지 배경 그대로 */}
          <div className="relative w-full max-w-[400px] aspect-square">
            {winery.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={winery.image_url} alt={winery.name} className="absolute inset-0 w-full h-full object-contain" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-5xl select-none">🍇</div>
            )}
          </div>
          <div>
            <h1 className="font-[family-name:var(--font-playfair-display)] font-semibold text-[34px] md:text-[48px] leading-tight text-[#1C1A17]">
              {winery.name}
            </h1>
            {(winery.country || winery.region) && (
              <p className="mt-3 text-[15px] text-[#605d5d]">
                {[winery.country, winery.region].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>
        </div>

        {/* 이동 경로 */}
        <nav aria-label="현재 위치" className="mt-8 text-[13px] text-[#9b9797]">
          <Link href="/" className="hover:text-[#0e3719] no-underline">Home</Link>
          <span className="mx-2">›</span>
          <Link href="/events/winery" className="hover:text-[#0e3719] no-underline">Winery</Link>
          {winery.country && <><span className="mx-2">›</span>{winery.country}</>}
          {winery.region && <><span className="mx-2">›</span>{winery.region}</>}
          <span className="mx-2">›</span>
          <span className="text-[#605d5d]">{winery.name}</span>
        </nav>
      </section>

      {/* 이 와이너리의 상품 */}
      <section className="max-w-[1240px] mx-auto px-5 mt-8">
        <h2 className="text-[17px] font-semibold text-[#1C1A17] border-b border-[#eae7e7] pb-3 mb-6">
          전체 {products.length}개 상품
        </h2>
        {!productsLoaded ? (
          <LoadingDots className="py-16" />
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5 md:gap-7">
            {products.map(product => (
              <ProductGridCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-center text-[#9b9797] py-16">아직 등록된 상품이 없습니다.</p>
        )}
      </section>

      {/* 소개글 — 상품 아래 */}
      {winery.description && (
        <section className="max-w-[880px] mx-auto px-5 mt-16 md:mt-20 pb-20">
          <h2 className="font-[family-name:var(--font-playfair-display)] text-[24px] md:text-[30px] text-[#1C1A17] mb-5">
            {winery.name} 이야기
          </h2>
          <p className="text-[15px] leading-[1.9] text-[#605d5d] whitespace-pre-wrap">{winery.description}</p>
        </section>
      )}
      {!winery.description && <div className="pb-20" />}
    </div>
  )
}
