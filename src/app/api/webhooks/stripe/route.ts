import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getStripe } from '@/lib/stripe'
import { finalizeCheckoutSession } from '@/lib/checkoutFinalize'

// Stripe 서버 웹훅 — 사용자가 결제 후 브라우저를 닫아도 주문이 반드시 생성되도록 하는 백업 경로
// (/api/checkout/confirm 리다이렉트가 실패하거나 도달하지 못한 경우 대비)
export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  const rawBody = await request.text()

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
    const session = event.data.object as Stripe.Checkout.Session
    try {
      await finalizeCheckoutSession(session.id)
    } catch (err) {
      console.error('Stripe webhook 주문 확정 실패', err)
      return NextResponse.json({ error: 'finalize failed' }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}
