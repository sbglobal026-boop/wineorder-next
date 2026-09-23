import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '식품',
  description: '와인과 함께 즐기기 좋은 유럽 식품을 소개합니다.',
  alternates: { canonical: '/events/food' },
}

export default function SectionLayout({ children }: { children: React.ReactNode }) {
  return children
}
