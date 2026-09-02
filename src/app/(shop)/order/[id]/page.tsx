'use client'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import CheckoutSteps from '@/components/cart/CheckoutSteps'

const pageBg = { background: 'radial-gradient(120% 90% at 15% 0%, #F9F4EE 0%, #F9F4EE 55%)' }
const cardCls = 'rounded-[24px] border border-[#eae7e7] bg-[#FFFFFF]'

interface OrderItem {
  productId: number
  name: string
  qty: number
  price_eur: number
}

interface SplitDelivery {
  id: string
  shipment_number: string
  product_name: string
  status: string
  scheduled_date: string | null
  tracking_number: string | null
}

interface Order {
  id: string
  order_number: string | null
  status: string
  items: OrderItem[]
  total_eur: number
  shipping_fee_eur: number
  split_delivery: boolean
  split_delivery_fee_eur: number
  tracking_number: string | null
  created_at: string
  split_deliveries?: SplitDelivery[]
}

const STATUS_LABEL: Record<string, string> = {
  pending: '주문 접수',
  confirmed: '주문 확인',
  shipped: '배송 중',
  delivered: '배송 완료',
  cancelled: '주문 취소',
}

export default function OrderPage() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('orders')
      .select('*, split_deliveries(id, shipment_number, product_name, status, scheduled_date, tracking_number)')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) setError('주문 정보를 찾을 수 없습니다')
        else setOrder(data)
        setLoading(false)
      })
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={pageBg}>
        <p className="text-[#9b9797] text-sm">불러오는 중...</p>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={pageBg}>
        <p className="text-[#9b9797] text-sm">{error || '주문 정보를 찾을 수 없습니다'}</p>
        <Link href="/" className="text-xs font-bold uppercase tracking-widest text-[#0e3719] hover:underline">
          홈으로 →
        </Link>
      </div>
    )
  }

  const subtotal = order.items.reduce((sum, i) => sum + i.price_eur * i.qty, 0)

  return (
    <div className="min-h-screen" style={pageBg}>
      {/* 히어로 */}
      <header className="max-w-[760px] mx-auto text-center px-5 pt-16 md:pt-20 pb-6">
        <p className="text-[13px] tracking-[0.28em] uppercase text-[#0e3719] mb-3.5">Order Complete</p>
        <h1 className="font-[family-name:var(--font-playfair-display)] font-medium text-[36px] md:text-[48px] leading-[1.1] text-[#1C1A17] mb-4">
          주문이 완료됐어요 🎉
        </h1>
        <p className="text-[15px] md:text-[16px] leading-[1.7] text-[#605d5d]">
          한 잔의 기쁨이 곧 문 앞으로 찾아갑니다.
        </p>
      </header>

      <div className="max-w-[1240px] mx-auto px-5 pb-16">
        <CheckoutSteps current={3} />

        {/* 완료 확인 */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="check w-[88px] h-[88px] rounded-full bg-[#0e3719]/[0.12] border-[1.5px] border-[#5C7A63] flex items-center justify-center mb-5 text-[#0e3719] text-4xl">✓</div>
          <h2 className="font-[family-name:var(--font-playfair-display)] text-[26px] text-[#1C1A17] mb-2">주문해 주셔서 감사합니다!</h2>
          <p className="text-sm text-[#605d5d]">
            주문번호 <span className="font-mono text-[#0e3719]">{order.order_number ?? order.id.slice(0, 8).toUpperCase()}</span>
          </p>
          <p className="text-[13px] text-[#9b9797] mt-1">배송이 시작되면 알려드릴게요.</p>
        </div>

        <div className="grid md:grid-cols-[1fr_360px] gap-6 items-start">
          {/* 주문 상품 */}
          <div className={`${cardCls} p-6 md:p-7`}>
            <h3 className="font-[family-name:var(--font-playfair-display)] text-[20px] text-[#1C1A17] mb-4">
              주문 상품 <span className="text-sm text-[#9b9797]">{order.items.length}건</span>
            </h3>
            <div className="divide-y divide-[#eae7e7]">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between items-center py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#1C1A17] truncate">{item.name}</p>
                    <p className="text-xs text-[#9b9797]">수량 {item.qty}개 · €{item.price_eur}</p>
                  </div>
                  <p className="font-[family-name:var(--font-playfair-display)] text-[17px] text-[#1C1A17] shrink-0">€{(item.price_eur * item.qty).toLocaleString()}</p>
                </div>
              ))}
            </div>

            {/* 배송 상태 + 운송장 */}
            <div className="mt-5 pt-5 border-t border-[#eae7e7] flex flex-col gap-2.5">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-[#605d5d]">배송 상태</span>
                <span className="text-sm font-semibold text-[#0e3719]">{STATUS_LABEL[order.status] ?? order.status}</span>
              </div>
              {order.split_delivery && order.split_deliveries && order.split_deliveries.length > 0 ? (
                [...order.split_deliveries]
                  .sort((a, b) => a.shipment_number.localeCompare(b.shipment_number))
                  .map(s => (
                    <div key={s.id} className="flex justify-between items-center">
                      <div className="min-w-0">
                        <p className="text-xs font-mono font-semibold text-[#605d5d]">{s.shipment_number}</p>
                        <p className="text-xs text-[#9b9797]">{s.product_name} · {STATUS_LABEL[s.status] ?? s.status}</p>
                      </div>
                      {s.tracking_number
                        ? <span className="text-xs font-mono font-semibold text-[#1C1A17]">{s.tracking_number}</span>
                        : <span className="text-xs text-[#bab6b6]">운송장 준비 중</span>}
                    </div>
                  ))
              ) : (
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-[#605d5d]">운송장번호</span>
                  {order.tracking_number
                    ? <span className="text-xs font-mono font-semibold text-[#1C1A17]">{order.tracking_number}</span>
                    : <span className="text-xs text-[#bab6b6]">운송장 준비 중</span>}
                </div>
              )}
            </div>
          </div>

          {/* 결제 정보 + 버튼 */}
          <div className="md:sticky md:top-[90px] flex flex-col gap-3">
            <div className={`${cardCls} p-6 md:p-7`}>
              <h3 className="font-[family-name:var(--font-playfair-display)] text-[20px] text-[#1C1A17] mb-4">결제 정보</h3>
              <div className="flex flex-col gap-2.5 text-sm pb-4 border-b border-[#eae7e7]">
                <div className="flex justify-between"><span className="text-[#9b9797]">상품 합계</span><span className="text-[#1C1A17]">€{subtotal.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-[#9b9797]">배송비</span><span className="text-[#1C1A17]">€{order.shipping_fee_eur.toLocaleString()}</span></div>
                {order.split_delivery && (
                  <div className="flex justify-between"><span className="text-[#9b9797]">분할배송비</span><span className="text-[#1C1A17]">€{order.split_delivery_fee_eur.toLocaleString()}</span></div>
                )}
              </div>
              <div className="flex items-baseline justify-between pt-4">
                <span className="text-[15px] text-[#1C1A17]">총 결제금액</span>
                <span className="font-[family-name:var(--font-playfair-display)] text-[26px] text-[#0e3719]">€{order.total_eur.toLocaleString()}</span>
              </div>
            </div>
            <Link href="/mypage" className="block text-center rounded-full border border-[#5C7A63] text-[#0e3719] hover:bg-[#0e3719] hover:text-[#FFFFFF] text-sm font-semibold py-3.5 transition-colors no-underline">
              주문 내역 보기
            </Link>
            <Link href="/events/wines" className="block text-center rounded-full border border-[#d7d3d3] text-[#605d5d] hover:border-[#5C7A63] hover:text-[#0e3719] text-sm py-3 transition-colors no-underline">
              계속 쇼핑하기
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
