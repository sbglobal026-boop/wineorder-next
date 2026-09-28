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
    description: plainTextFromHtml(product.description) || undefined,
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

// 상품 설명에 사진·서식이 섞인 글(HTML)이 들어올 수 있으므로,
// 검색 결과에 보일 요약문에서는 태그를 걷어내고 글자만 남긴다.
export function plainTextFromHtml(html: string | null | undefined): string {
  return (html ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&[a-z]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}
