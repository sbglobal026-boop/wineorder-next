import type { Metadata } from 'next'
import { createPublicClient } from '@/lib/supabase/public'
import { SITE_NAME } from '@/lib/site'

// 와이너리별 검색 제목·설명
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const { data } = await createPublicClient()
    .from('wineries')
    .select('name, country, region, description, image_url')
    .eq('slug', slug)
    .maybeSingle()

  if (!data) return { title: '와이너리' }

  const place = [data.country, data.region].filter(Boolean).join(' ')
  const title = `${place ? `${data.name} | ${place} 와이너리` : `${data.name} 와이너리`} | ${SITE_NAME}`
  const description = (data.description ?? '').replace(/\s+/g, ' ').trim().slice(0, 150)
    || `${data.name}의 와인을 ${SITE_NAME}에서 만나보세요.`

  return {
    title,
    description,
    alternates: { canonical: `/events/winery/${slug}` },
    openGraph: { type: 'website', title, description, images: data.image_url ? [data.image_url] : undefined },
  }
}

export default function WineryDetailLayout({ children }: { children: React.ReactNode }) {
  return children
}
