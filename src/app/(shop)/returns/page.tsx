import LegalPageLayout from '@/components/legal/LegalPageLayout'

export default function ReturnsPage() {
  return (
    <LegalPageLayout title="교환 / 반품">
      <p className="mb-6 text-xs text-gray-400">
        아래 내용은 표본(예시) 안내이며, 실제 교환/반품 정책에 맞게 내용을 교체해주세요.
      </p>

      <h2 className="text-lg font-bold text-gray-900 mt-8 mb-2">교환 / 반품 가능 기간</h2>
      <p className="mb-4">
        상품 수령일로부터 7일 이내에 교환 또는 반품을 신청하실 수 있습니다. 단, 상품의 특성상
        개봉 또는 사용 후에는 교환/반품이 제한될 수 있습니다.
      </p>

      <h2 className="text-lg font-bold text-gray-900 mt-8 mb-2">교환 / 반품이 불가능한 경우</h2>
      <p className="mb-4">
        아래의 경우에는 교환/반품이 제한됩니다.
      </p>
      <ul className="list-disc list-inside mb-4 space-y-1">
        <li>주류 특성상 개봉하였거나 라벨/포장이 훼손된 경우</li>
        <li>고객의 책임 있는 사유로 상품이 멸실 또는 훼손된 경우</li>
        <li>단순 변심으로 반품 요청 기간이 지난 경우</li>
      </ul>

      <h2 className="text-lg font-bold text-gray-900 mt-8 mb-2">환불</h2>
      <p className="mb-4">
        반품 상품 확인 후 영업일 기준 3~5일 이내에 결제 수단으로 환불이 진행됩니다.
      </p>

      <h2 className="text-lg font-bold text-gray-900 mt-8 mb-2">신청 방법</h2>
      <p className="mb-4">
        교환/반품을 원하시면 CS 게시판에 주문 정보와 사유를 남겨주시면 안내해드립니다.
      </p>
    </LegalPageLayout>
  )
}
