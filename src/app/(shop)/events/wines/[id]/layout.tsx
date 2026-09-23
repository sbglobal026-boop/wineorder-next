import type { Metadata } from 'next'
import { createPublicClient } from '@/lib/supabase/public'
import { SITE_NAME } from '@/lib/site'
import { productJsonLd, ProductSeoRow } from '@/lib/seo'

// 상품별 검색 제목·설명 (상품 화면 자체는 클라이언트 컴포넌트라 이 껍데기에서 처리)
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const { data } = await createPublicClient()
    .from('products_public')
    .select('name, origin, category, description, image_url')
    .eq('id', Number(id))
    .maybeSingle()

  if (!data) return { title: '상품' }

  // 상위 페이지가 제목을 덮어써 서식(| table code)이 끊기므로 여기서 직접 붙임
  const title = `${[data.name, data.origin, data.category].filter(Boolean).join(' | ')} | ${SITE_NAME}`
  const description = (data.description ?? '').replace(/\s+/g, ' ').trim().slice(0, 150)
    || `${data.name} — ${SITE_NAME}에서 만나보세요.`

  return {
    title,
    description,
    alternates: { canonical: `/events/wines/${id}` },
    openGraph: {
      type: 'website',
      title,
      description,
      images: data.image_url ? [data.image_url] : undefined,
    },
  }
}

export default async function WineDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { data } = await createPublicClient()
    .from('products_public')
    .select('id, name, origin, category, description, image_url, price, stock')
    .eq('id', Number(id))
    .maybeSingle()

  return (
    <>
      {/* 검색 결과에 가격·재고가 함께 보이도록 상품 정보를 구조화해 제공 */}
      {data && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(data as ProductSeoRow, 'wines')) }}
        />
      )}
      {children}
    </>
  )
}
