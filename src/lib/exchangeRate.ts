// 환율 조회 — 클라이언트용 /api/exchange-rate 라우트와 서버(주문 API)의 관세 계산이 같은 소스를 쓰도록 공용화.
export async function fetchExchangeRates(): Promise<{ krw: number; usd: number }> {
  try {
    const res = await fetch('https://api.frankfurter.app/latest?from=EUR&to=KRW,USD', {
      next: { revalidate: 3600 }, // 1시간 마다 호출
    })
    const data = await res.json()
    return { krw: data.rates.KRW, usd: data.rates.USD }
  } catch {
    return { krw: 1750, usd: 1.08 } // Default
  }
}
