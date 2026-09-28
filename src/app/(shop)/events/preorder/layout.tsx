import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Preorder',
  description: '현지 생산자에게 새로 들여오는 예약 주문 와인. 산지에 따라 14일에서 최대 2개월이 걸립니다.',
  alternates: { canonical: '/events/preorder' },
}

export default function SectionLayout({ children }: { children: React.ReactNode }) {
  return children
}
