// 운송장번호 → 우체국 국내우편(등기·소포) 배송조회 링크
// 국내 도착 후 받는 등기번호(숫자)를 기준으로 하며, 숫자 외 문자가 섞인 번호는 링크를 만들지 않고 글자로만 보여줌

const EPOST_DOMESTIC_URL = 'https://service.epost.go.kr/trace.RetrieveDomRigiTraceList.comm'

// 공백·하이픈은 빼고 숫자만 남김
function normalize(trackingNumber: string) {
  return trackingNumber.replace(/[\s-]/g, '')
}

export function trackingUrl(trackingNumber: string | null | undefined): string | null {
  if (!trackingNumber) return null
  const number = normalize(trackingNumber)
  // 우체국 등기번호는 13자리 숫자 (자릿수가 다른 번호도 조회되도록 9~14자리까지 허용)
  if (!/^\d{9,14}$/.test(number)) return null
  return `${EPOST_DOMESTIC_URL}?sid1=${number}&displayHeader=N`
}
