import { SITE_URL, SITE_NAME } from '@/lib/site'

// 검색엔진용 구조화 데이터(JSON-LD) 만들기 — 검색 결과에 가격·재고 등이 함께 표시됨
export type ProductSeoRow = {
  id: number
  name: string
  origin: string | null
  category: string | null
  description: string | null
  image_url: string | null
  price: number
  stock: number | null
}

export function productJsonLd(product: ProductSeoRow, section: 'wines' | 'food') {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: (product.description ?? '').replace(/\s+/g, ' ').trim() || undefined,
    image: product.image_url ?? undefined,
    category: product.category ?? undefined,
    brand: product.origin ? { '@type': 'Brand', name: product.origin } : undefined,
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/events/${section}/${product.id}`,
      priceCurrency: 'EUR',
      price: product.price,
      availability: (product.stock ?? 0) > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: SITE_NAME },
    },
  }
}

// 사이트 전체 정보 (홈에 넣음)
export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
  }
}
