// 주문 진행 단계 표시 (장바구니 → 주문/결제 → 주문완료). 카트·결제·완료 페이지 공유
const STEPS = ['장바구니', '주문/결제', '주문완료'] as const

export default function CheckoutSteps({ current }: { current: 1 | 2 | 3 }) {
  return (
    <div className="flex items-center justify-center gap-3 md:gap-4 text-[13px] md:text-sm mb-10">
      {STEPS.map((label, i) => {
        const step = (i + 1) as 1 | 2 | 3
        const active = step === current
        const done = step < current
        const on = active || done
        return (
          <div key={label} className="flex items-center gap-3 md:gap-4">
            <span className={`flex items-center gap-2 ${on ? 'text-[#0e3719]' : 'text-[#bab6b6]'}`}>
              <span className={`w-[26px] h-[26px] rounded-full border flex items-center justify-center text-[13px] font-[family-name:var(--font-playfair-display)] ${
                on ? 'border-[#5C7A63] text-[#0e3719]' : 'border-[#d7d3d3] text-[#bab6b6]'
              }`}>{step}</span>
              <span className="whitespace-nowrap">{label}</span>
            </span>
            {i < STEPS.length - 1 && <span className="w-8 md:w-10 h-px bg-[#d7d3d3]" />}
          </div>
        )
      })}
    </div>
  )
}
