import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '와이너리',
  description: 'table code가 직접 만난 유럽 와이너리를 A–Z로 모았습니다. 생산자별 와인과 이야기를 확인해보세요.',
  alternates: { canonical: '/events/winery' },
}

export default function SectionLayout({ children }: { children: React.ReactNode }) {
  return children
}
