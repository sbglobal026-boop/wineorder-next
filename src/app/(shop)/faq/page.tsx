import LegalPageLayout from '@/components/legal/LegalPageLayout'

const FAQS: { q: string; a: string }[] = [
  {
    q: '주문한 와인은 언제 받아볼 수 있나요?',
    a: '결제 완료 후 영업일 기준 1~3일 내에 출고되며, 배송에는 지역에 따라 1~2일이 추가로 소요됩니다. 자세한 내용은 배송 안내 페이지를 참고해주세요.',
  },
  {
    q: '배송비는 얼마인가요?',
    a: '구독 회원은 전 상품 무료 배송입니다. 비회원 및 일반 주문의 배송비는 결제 단계에서 지역·수량에 따라 안내됩니다.',
  },
  {
    q: '교환·환불은 어떻게 하나요?',
    a: '상품 수령 후 단순 변심에 의한 교환·환불은 제한될 수 있으며, 파손·오배송의 경우 수령 후 7일 이내에 고객센터로 문의해주시면 처리해드립니다.',
  },
  {
    q: '와인 보관은 어떻게 해야 하나요?',
    a: '직사광선을 피하고 12~15℃의 서늘하고 습도가 일정한 곳에 눕혀서 보관하시는 것을 권장합니다. 코르크가 마르지 않도록 하는 것이 중요합니다.',
  },
  {
    q: '주류 온라인 구매에 나이 제한이 있나요?',
    a: '네. 대한민국 법령에 따라 만 19세 이상만 주류를 구매할 수 있으며, 수령 시 성인 인증이 필요할 수 있습니다.',
  },
]

export default function FaqPage() {
  return (
    <LegalPageLayout title="FAQ">
      <p className="mb-8">자주 묻는 질문을 모았습니다. 원하는 답을 찾지 못하셨다면 언제든 문의해주세요.</p>

      <div className="space-y-6">
        {FAQS.map((item, i) => (
          <div key={i} className="border-b border-gray-200 pb-6">
            <h2 className="text-base font-bold text-gray-900 mb-2">Q. {item.q}</h2>
            <p className="text-gray-600">{item.a}</p>
          </div>
        ))}
      </div>

      <p className="mt-8 text-xs text-gray-400">
        ※ 본 내용은 예시 문구이며, 실제 정책에 맞게 교체할 수 있습니다.
      </p>
    </LegalPageLayout>
  )
}
