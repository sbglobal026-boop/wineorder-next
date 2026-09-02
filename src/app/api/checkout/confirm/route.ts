import { NextResponse } from 'next/server'
import { finalizeCheckoutSession } from '@/lib/checkoutFinalize'

// Stripe Checkout 결제 성공 후 돌아오는 리다이렉트 주소 (success_url)
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const sessionId = searchParams.get('session_id')

  if (!sessionId) {
    return NextResponse.redirect(`${origin}/checkout?error=missing_session`)
  }

  try {
    const orderId = await finalizeCheckoutSession(sessionId)
    return NextResponse.redirect(`${origin}/order/${orderId}?new=1`)
  } catch {
    return NextResponse.redirect(`${origin}/checkout?error=payment_failed`)
  }
}
