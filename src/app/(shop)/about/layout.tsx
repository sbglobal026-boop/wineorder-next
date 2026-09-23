import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '소개',
  description: 'table code는 유럽 현지에서 와인을 직접 고르고 한국으로 보내드립니다.',
  alternates: { canonical: '/about' },
}

export default function SectionLayout({ children }: { children: React.ReactNode }) {
  return children
}
