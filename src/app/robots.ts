import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

// 검색엔진 크롤링 규칙 — 관리·개인 페이지는 검색에 노출하지 않음
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/vendor', '/mypage', '/cart', '/checkout', '/order', '/login', '/register', '/api/'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
