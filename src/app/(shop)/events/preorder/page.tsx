'use client'
import CuratedCollection from '@/components/product/CuratedCollection'

// 어드민 상품 관리에서 Preorder로 고른 상품 전부
export default function PreorderPage() {
  return (
    <CuratedCollection
      eyebrow="Preorder"
      title="Preorder"
      subtitle="현지 생산자에게 새로 들여오는 와인입니다. 주문 후 산지에 따라 14일에서 최대 2개월까지 걸립니다."
      pick="preorder"
      emptyText="아직 선택된 Preorder 상품이 없습니다."
    />
  )
}
