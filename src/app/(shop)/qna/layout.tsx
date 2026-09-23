import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'QnA',
  description: '배송·주문·주류 구매 나이 제한 등 자주 묻는 질문을 모았습니다.',
  alternates: { canonical: '/qna' },
}

export default function SectionLayout({ children }: { children: React.ReactNode }) {
  return children
}
