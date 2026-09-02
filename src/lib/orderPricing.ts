// 주문 금액 계산 로직 — 체크아웃 화면(클라이언트)과 주문 생성 API(서버)가 동일한 공식을 쓰도록 공용화.
// 서버 쪽에서 이 로직으로 직접 재계산해야 클라이언트가 보낸 금액을 그대로 믿지 않을 수 있음.

export const EU_COUNTRIES = ['FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'PT', 'PL', 'SE', 'DK', 'FI', 'IE', 'GR', 'CZ', 'HU', 'RO', 'SK', 'BG', 'HR', 'SI', 'LT', 'LV', 'EE', 'LU', 'MT', 'CY']

export type CountryZone = 'DE' | 'KR' | 'EU'

export function getZone(country: string): CountryZone {
  if (country === 'DE') return 'DE'
  if (country === 'KR') return 'KR'
  if (EU_COUNTRIES.includes(country)) return 'EU'
  return 'EU'
}

// 관세 계산 (한국 배송 전용 — 통관 예상 관세)
export function calcDuty(price: number, eurToKrw: number, eurToUsd: number, origin: string) {
  const ftaOrigins = ['프랑스', '이탈리아', '스페인', '독일', '포르투갈']
  const isFTA = ftaOrigins.some(o => origin.includes(o))

  const priceUsd = price * eurToUsd
  const priceKrw = price * eurToKrw

  if (priceUsd <= 150) {
    const total = Math.round(isFTA ? priceKrw * 0.33 : priceKrw * 0.683)
    return { total }
  } else {
    const total = Math.round(isFTA ? priceKrw * 0.463 : priceKrw * 0.683)
    return { total }
  }
}

export interface ShippingRateRow {
  zone: string
  fee: number
  vat_rate: number
}

export function calcOrderTotals(params: {
  zone: CountryZone | null
  subtotal: number
  totalQty: number
  splitDelivery: boolean
  shippingRates: ShippingRateRow[]
}) {
  const { zone, subtotal, totalQty, splitDelivery, shippingRates } = params
  const rateInfo = zone ? shippingRates.find(r => r.zone === zone) : undefined
  const shippingFee = rateInfo ? (zone === 'KR' ? rateInfo.fee * totalQty : rateInfo.fee) : 0
  const splitFee = splitDelivery ? totalQty * 1 : 0
  const vat = zone === 'DE' ? subtotal * (rateInfo?.vat_rate ?? 0) : 0
  const total = subtotal + shippingFee + splitFee + vat
  return { shippingFee, splitFee, vat, total }
}
