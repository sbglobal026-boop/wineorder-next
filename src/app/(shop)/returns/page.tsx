import LegalPageLayout from '@/components/legal/LegalPageLayout'

export default function ReturnsPage() {
  return (
    <LegalPageLayout title="교환 / 반품">
      <h2 className="text-lg font-bold text-gray-900 mt-8 mb-2">교환 / 반품 가능 기간</h2>
      <p className="mb-4">
        상품 수령일로부터 14일 이내에 교환 또는 반품을 신청하실 수 있습니다. 이는 EU 소비자법이
        정한 철회 기간(14일)과 동일하며, 자세한 내용은 AGB §7에 있습니다.
      </p>

      <h2 className="text-lg font-bold text-gray-900 mt-8 mb-2">교환 / 반품이 불가능한 경우</h2>
      <p className="mb-4">
        아래의 경우에는 교환/반품이 제한됩니다.
      </p>
      <ul className="list-disc list-inside mb-4 space-y-1">
        <li>병을 개봉한 경우 — 위생상 재판매가 불가능하여 반품·환불이 되지 않습니다</li>
        <li>고객의 책임 있는 사유로 상품이 멸실 또는 훼손된 경우</li>
        <li>상품 수령 후 14일이 지난 경우</li>
      </ul>
      <p className="mb-4">
        수령 시 라벨이 훼손되어 있는 경우에는 반품이 가능합니다.
      </p>

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
