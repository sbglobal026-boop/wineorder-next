import { fetchExchangeRates } from '@/lib/exchangeRate'

export async function GET() {
  const rates = await fetchExchangeRates()
  return Response.json(rates)
}