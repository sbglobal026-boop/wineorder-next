import Link from 'next/link'

// 쇼핑 페이지(메인·상품 목록) 헤더 아래에 붙는 콘텐츠 입구 — 링크마다 위에 "table code", 아래에 이름을 두는 두 줄 글씨 링크
// 헤더의 상품용 Wine·Food 메뉴와 헷갈리지 않도록 헤더와 분리된 별도 줄로 둠
const LINKS = [
  { label: 'journal', href: '/journal' },
  { label: 'travel', href: '/blog/travel' },
  { label: 'wine', href: '/blog/wine' },
  { label: 'food&drink', href: '/blog/food-drink' },
]

export default function TableCodeLinks() {
  return (
    <nav aria-label="table code 콘텐츠" className="bg-[#F9F4EE]">
      <div className="max-w-[1240px] mx-auto px-5">
        {/* 모든 화면에서 한 줄 가운데 정렬 — "table code" 사이 간격 기준 모바일(768px 미만) 20px, 데스크톱 64px */}
        <ul className="flex justify-center gap-5 py-7 md:gap-16 md:py-9">
          {LINKS.map(({ label, href }) => (
            <li key={href}>
              <Link href={href} className="group inline-flex flex-col items-center no-underline font-[family-name:var(--font-playfair-display)] whitespace-nowrap">
                {/* 모바일(768px 미만) 11px / 14px, 데스크톱 15px / 20px */}
                <span className="text-[11px] md:text-[15px] font-semibold tracking-tight text-[#0e3719]/70">
                  table code
                </span>
                {/* 이름 폭은 칸 폭 계산에서 제외(w-0)하고 가운데 기준으로 양옆으로 퍼지게 함
                    → 칸 폭이 모두 "table code" 폭으로 같아져, food&drink처럼 긴 이름도 간격을 벌리지 않음 */}
                <span className="flex w-0 justify-center">
                  <span className="text-[14px] md:text-[20px] font-medium leading-tight text-[#1C1A17] underline-offset-[6px] decoration-1 transition-colors group-hover:text-[#0e3719] group-hover:underline">
                    {label}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}
