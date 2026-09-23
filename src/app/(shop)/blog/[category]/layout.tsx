import type { Metadata } from 'next'
import { categoryLabel } from '@/lib/blogCategories'

// 블로그 카테고리 목록의 검색 제목 (예: "Wine 이야기 | table code")
export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params
  const label = categoryLabel(category)
  return {
    title: `${label} 이야기`,
    description: `${label}에 대한 table code의 기록. 와인과 음식, 여행, 그리고 그 자리에 대한 이야기를 전합니다.`,
    alternates: { canonical: `/blog/${category}` },
  }
}

export default function BlogCategoryLayout({ children }: { children: React.ReactNode }) {
  return children
}
