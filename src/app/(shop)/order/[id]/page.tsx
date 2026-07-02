'use client'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface OrderItem {
  productId: number
  name: string
  qty: number
  price_eur: number
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
  created_at: string
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
      .select('*')
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
      <div className="bg-[#F9F4EE] min-h-screen flex items-center justify-center">
        <p className="text-gray-400 text-sm">불러오는 중...</p>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="bg-[#F9F4EE] min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-400 text-sm">{error || '주문 정보를 찾을 수 없습니다'}</p>
        <Link href="/" className="text-xs font-bold uppercase tracking-widest text-[#8B4513] hover:text-[#2C5F2D] transition-colors">
          홈으로 →
        </Link>
      </div>
    )
  }

  const subtotal = order.items.reduce((sum, i) => sum + i.price_eur * i.qty, 0)

  return (
    <div className="bg-[#F9F4EE] min-h-screen">
      <div className="max-w-2xl mx-auto px-6 py-16">
        {/* 완료 아이콘 */}
        <div className="flex flex-col items-center text-center mb-12">
          <div className="w-16 h-16 rounded-full bg-[#2C5F2D] flex items-center justify-center mb-5">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">주문이 접수되었습니다</h1>
          <p className="text-sm text-gray-400">
            주문번호: <span className="font-mono text-gray-600">{order.order_number ?? order.id.slice(0, 8).toUpperCase()}</span>
          </p>
        </div>

        {/* 주문 내역 */}
        <div className="border border-gray-200 bg-white mb-6">
          <div className="border-b border-gray-100 px-5 py-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">주문 내역</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between items-center px-5 py-3">
                <div>
                  <p className="text-sm font-bold text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-400">{item.qty}병 × €{item.price_eur}</p>
                </div>
                <p className="text-sm font-black text-gray-900">€{(item.price_eur * item.qty).toLocaleString()}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 px-5 py-3 flex flex-col gap-1.5">
            <div className="flex justify-between text-sm text-gray-500">
              <span>상품 합계</span><span>€{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>배송비</span><span>€{order.shipping_fee_eur.toLocaleString()}</span>
            </div>
            {order.split_delivery && (
              <div className="flex justify-between text-sm text-gray-500">
                <span>분할배송비</span><span>€{order.split_delivery_fee_eur.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between font-black text-gray-900 text-base pt-1 border-t border-gray-100">
              <span>총 결제금액</span><span>€{order.total_eur.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* 상태 */}
        <div className="border border-gray-200 bg-white px-5 py-4 mb-10 flex justify-between items-center">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400">배송 상태</span>
          <span className="text-sm font-bold text-[#2C5F2D]">{STATUS_LABEL[order.status] ?? order.status}</span>
        </div>

        {/* 버튼 */}
        <div className="flex flex-col gap-3">
          <Link
            href="/events/wines"
            className="block w-full text-center bg-[#0e3719] hover:bg-[#1a5c2a] text-white text-xs font-bold uppercase tracking-widest py-4 transition-colors"
          >
            계속 쇼핑하기
          </Link>
          <Link
            href="/"
            className="block w-full text-center text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-gray-700 transition-colors py-2"
          >
            홈으로
          </Link>
        </div>
      </div>
    </div>
  )
}
