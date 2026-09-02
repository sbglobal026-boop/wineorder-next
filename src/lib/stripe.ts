import Stripe from 'stripe'

// 서버 전용 Stripe 클라이언트. 절대 클라이언트 컴포넌트에서 import하지 말 것.
// 지연 생성: 빌드 시점(page data collection)에는 STRIPE_SECRET_KEY가 없을 수 있으므로
// 모듈 로드 시점이 아니라 실제로 API를 호출하는 시점에 생성한다.
let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  }
  return _stripe
}
