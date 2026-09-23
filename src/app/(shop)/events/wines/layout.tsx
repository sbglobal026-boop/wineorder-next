import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '와인',
  description: '독일·프랑스·이탈리아 등 유럽 와인을 현지에서 직접 골라 소개합니다. 레드·화이트·로제·스파클링 셀렉션.',
  alternates: { canonical: '/events/wines' },
}

export default function SectionLayout({ children }: { children: React.ReactNode }) {
  return children
}
