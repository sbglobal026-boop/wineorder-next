'use client'
import CuratedCollection from '@/components/product/CuratedCollection'

// 어드민 상품 관리에서 Top Drop으로 고른 상품 전부
export default function TopDropPage() {
  return (
    <CuratedCollection
      eyebrow="Top Drop"
      title="Top Drop"
      subtitle="저희가 직접 마셔보고 골라 담은 이번 셀렉션입니다."
      pick="featured"
      emptyText="아직 선택된 Top Drop 상품이 없습니다."
    />
  )
}
