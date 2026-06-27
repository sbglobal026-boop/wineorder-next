export async function GET() {
  try {
    const res = await fetch('https://api.frankfurter.app/latest?from=EUR&to=KRW,USD', {
      next: { revalidate: 3600 } // 1시간 마다 호출
    })
    const data = await res.json()

    return Response.json({
      krw: data.rates.KRW,
      usd: data.rates.USD,
    })

  } catch {
    return Response.json({ krw: 1750, usd: 1.08 }) // Default
  }
}