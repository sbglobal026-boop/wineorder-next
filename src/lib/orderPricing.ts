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

export interface OrderShippingItem {
  qty: number
  shippingFee?: number | null // 상품별 배송비 직접 입력값(개당). null/미입력 시 국가별 기본 배송비 대상
}

// 센트 단위 반올림 — Stripe 청구 금액(센트 정수)과 주문에 저장되는 금액이 어긋나지 않게
export function roundCents(value: number) {
  return Math.round(value * 100) / 100
}

export function calcOrderTotals(params: {
  zone: CountryZone | null
  subtotal: number
  items: OrderShippingItem[]
  shippingRates: ShippingRateRow[]
  discountPercent?: number // 추천인 코드 할인율(%) — 상품 금액에만 적용
}) {
  const { zone, subtotal, items, shippingRates, discountPercent = 0 } = params
  const rateInfo = zone ? shippingRates.find(r => r.zone === zone) : undefined

  // 배송비를 직접 입력한 상품은 국가별 기본 배송비 계산에서 제외하고 개당 값 × 수량으로 따로 더함
  const defaultItems = items.filter(i => i.shippingFee == null)
  const overrideItems = items.filter(i => i.shippingFee != null)
  const defaultQty = defaultItems.reduce((sum, i) => sum + i.qty, 0)

  const defaultShippingFee = (rateInfo && defaultItems.length > 0)
    ? (zone === 'KR' ? rateInfo.fee * defaultQty : rateInfo.fee)
    : 0
  const overrideShippingFee = overrideItems.reduce((sum, i) => sum + (i.shippingFee ?? 0) * i.qty, 0)
  const shippingFee = defaultShippingFee + overrideShippingFee

  // 할인은 상품 금액에만 적용 (배송비 제외). 할인율은 0~100%로 제한해 할인액이 상품 금액을 넘지 않게 함
  const discount = roundCents(subtotal * Math.min(Math.max(discountPercent, 0), 100) / 100)
  // 독일 부가세는 할인 후 상품 금액 기준
  const vat = zone === 'DE' ? roundCents((subtotal - discount) * (rateInfo?.vat_rate ?? 0)) : 0
  const total = roundCents(subtotal - discount + shippingFee + vat)
  return { shippingFee, discount, vat, total }
}
