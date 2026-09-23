import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Journal',
  description: '와인과 음식, 그리고 그 자리에 대한 기록. table code 에디터가 쓰는 저널입니다.',
  alternates: { canonical: '/journal' },
}

export default function SectionLayout({ children }: { children: React.ReactNode }) {
  return children
}
