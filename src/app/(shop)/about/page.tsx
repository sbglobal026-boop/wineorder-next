import LegalPageLayout from '@/components/legal/LegalPageLayout'

export default function AboutPage() {
  return (
    <LegalPageLayout title="소개">
      <p className="mb-6">
        Good food. Good people. Good stories. 테이블은 문화가 시작되는 곳입니다.
        Table Code는 바로 그 순간을 위해 만들어졌습니다.
      </p>

      <h2 className="text-lg font-bold text-gray-900 mt-8 mb-2">우리의 이야기</h2>
      <p className="mb-4">
        Table Code는 하나의 단순한 생각에서 출발했습니다 — 세계 각지의 훌륭한 와인을,
        품질과 이야기를 잃지 않으면서 더 가깝게 만들자는 것. 저희가 다루는 모든 와인은
        가족이 운영하는 작은 와이너리부터 수상 경력의 셀러까지, 하나하나 정성껏 선별합니다.
      </p>

      <h2 className="text-lg font-bold text-gray-900 mt-8 mb-2">우리가 지향하는 것</h2>
      <p className="mb-4">
        좋은 한 잔의 와인은 단순한 음료 그 이상이라고 믿습니다. 그것은 사람과 사람을
        불러 모으는 계기입니다. 그래서 저희는 산지, 만든 이의 손길, 그리고 라벨 뒤에 담긴
        이야기를 기준으로 컬렉션을 큐레이션합니다.
      </p>

      <h2 className="text-lg font-bold text-gray-900 mt-8 mb-2">우리의 약속</h2>
      <p className="mb-4">
        정직한 가격, 투명한 산지 정보, 그리고 진짜 와인 애호가의 마음에서 비롯된 서비스.
        특별한 순간을 위한 한 병을 찾으시든, 일상을 조금 더 풍요롭게 만들고 싶으시든,
        Table Code가 함께하겠습니다.
      </p>

      <p className="mt-8 text-xs text-gray-400">
        ※ 본 내용은 예시 문구이며, 실제 회사 정보로 교체할 수 있습니다.
      </p>
    </LegalPageLayout>
  )
}
