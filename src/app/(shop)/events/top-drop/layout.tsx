import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Top Drop',
  description: '직접 마셔보고 고른 이번 셀렉션. table code가 현지에서 골라 소개하는 와인과 고메 식품.',
  alternates: { canonical: '/events/top-drop' },
}

export default function SectionLayout({ children }: { children: React.ReactNode }) {
  return children
}
