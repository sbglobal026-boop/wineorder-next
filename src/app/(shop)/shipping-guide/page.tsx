import LegalPageLayout from '@/components/legal/LegalPageLayout'

// 배송 안내 — 배송비는 DB(shipping_rates)의 한국 요율과 맞춰 둠. 요율을 바꾸면 이 문구와 AGB §3도 함께 고칠 것.
export default function ShippingGuidePage() {
  return (
    <LegalPageLayout title="배송 안내">
      <h2 className="text-lg font-bold text-gray-900 mt-8 mb-2">배송 기간</h2>

      <h3 className="text-base font-semibold text-gray-900 mt-5 mb-2">재고 보유 상품</h3>
      <p className="mb-4">
        결제 완료 후 <strong>7일 이내</strong>에 수령하실 수 있습니다.
      </p>

      <h3 className="text-base font-semibold text-gray-900 mt-5 mb-2">예약 주문 (Pre-order)</h3>
      <p className="mb-4">
        재고가 없어 현지 공급처에서 새로 들여오는 상품은 산지에 따라 기간이 달라집니다.
      </p>
      <ul className="list-disc list-inside mb-4 space-y-1">
        <li>독일 내 공급처 — 약 14일</li>
        <li>프랑스 — 약 1개월</li>
        <li>그 외 국가 — 최대 2개월까지 소요될 수 있습니다</li>
      </ul>

      <h2 className="text-lg font-bold text-gray-900 mt-8 mb-2">배송비</h2>
      <p className="mb-4">배송지 국가에 따라 배송비가 다릅니다.</p>
      <ul className="list-disc list-inside mb-4 space-y-1">
        <li>한국 — 병당 12유로 (주문하신 병 수만큼 합산)</li>
        <li>독일 — 주문 1건당 5유로</li>
        <li>프랑스 · 이탈리아 — 주문 1건당 5유로</li>
      </ul>
      <p className="mb-4">
        배송지를 선택하시면 결제 화면에서 최종 금액을 확인하실 수 있습니다. 한국으로 배송되는
        상품에는 관세 등 수입 비용이 별도로 발생할 수 있으며, 이는 고객님 부담입니다.
      </p>

      <h2 className="text-lg font-bold text-gray-900 mt-8 mb-2">배송 조회</h2>
      <p className="mb-4">
        주문 내역에서 송장번호를 확인하실 수 있으며, 기타 관련 문의는 CS 게시판을 이용해주세요.
      </p>
    </LegalPageLayout>
  )
}
