import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '공지사항',
  description: 'table code의 공지사항입니다.',
  alternates: { canonical: '/notices' },
}

export default function SectionLayout({ children }: { children: React.ReactNode }) {
  return children
}
