import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '교환 / 반품',
  description: '교환·반품 절차와 기준을 안내합니다.',
  alternates: { canonical: '/returns' },
}

export default function SectionLayout({ children }: { children: React.ReactNode }) {
  return children
}
