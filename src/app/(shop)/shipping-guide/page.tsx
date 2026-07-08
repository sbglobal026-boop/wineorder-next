import LegalPageLayout from '@/components/legal/LegalPageLayout'

export default function ShippingGuidePage() {
  return (
    <LegalPageLayout title="배송 안내">
      <p className="mb-6 text-xs text-gray-400">
        아래 내용은 표본(예시) 안내이며, 실제 배송 정책에 맞게 내용을 교체해주세요.
      </p>

      <h2 className="text-lg font-bold text-gray-900 mt-8 mb-2">배송 기간</h2>
      <p className="mb-4">
        결제 완료 후 영업일 기준 2~5일 이내에 출고되며, 지역에 따라 배송 완료까지 추가로 1~3일이
        소요될 수 있습니다. 주말 및 공휴일은 배송이 진행되지 않습니다.
      </p>

      <h2 className="text-lg font-bold text-gray-900 mt-8 mb-2">배송비</h2>
      <p className="mb-4">
        일정 금액 이상 구매 시 무료배송이 적용되며, 그 외에는 주문 시 배송비가 별도로 안내됩니다.
        도서/산간 지역은 추가 배송비가 발생할 수 있습니다.
      </p>

      <h2 className="text-lg font-bold text-gray-900 mt-8 mb-2">주류 배송 안내</h2>
      <p className="mb-4">
        주류는 관련 법령에 따라 성인 확인 후 배송되며, 수령 시 신분증 확인이 요청될 수 있습니다.
        미성년자에게는 배송되지 않습니다.
      </p>

      <h2 className="text-lg font-bold text-gray-900 mt-8 mb-2">배송 조회</h2>
      <p className="mb-4">
        주문 내역에서 송장번호를 확인하실 수 있으며, 배송 관련 문의는 CS 게시판을 이용해주세요.
      </p>
    </LegalPageLayout>
  )
}
