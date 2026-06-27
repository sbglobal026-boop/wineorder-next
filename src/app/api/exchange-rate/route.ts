export async function GET() {
  try {
    const res = await fetch('https://api.frankfurter.app/latest?from=EUR&to=KRW', {
      next: { revalidate: 3600 } // 1시간 마다 호출
    })
    const data = await res.json()
    return Response.json({ rate: data.rates.KRW })
  } catch {
    // Default
    return Response.json({ rate: 1480 })
  }
}