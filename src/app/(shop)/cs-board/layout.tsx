import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'CS 게시판',
  description: '주문·배송 관련 문의를 남겨주세요.',
  alternates: { canonical: '/cs-board' },
}

export default function SectionLayout({ children }: { children: React.ReactNode }) {
  return children
}
