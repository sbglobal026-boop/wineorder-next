import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '배송 안내',
  description: '유럽에서 한국까지의 배송 기간, 배송비, 통관 안내입니다.',
  alternates: { canonical: '/shipping-guide' },
}

export default function SectionLayout({ children }: { children: React.ReactNode }) {
  return children
}
