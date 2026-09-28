// 금액 표기 공통 함수 — 유로는 항상 소수점 두 자리로 보여준다 (예: €333.80)
// 소수점이 잘려 €333.8 처럼 어색하게 보이던 것을 통일하기 위해 만듦
export function formatEur(n: number | null | undefined): string {
  return '€' + Number(n ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
