import { createClient } from '@/lib/supabase/client'

export type OrderItem = { name: string; qty: number; price_eur: number }

export type MyOrder = {
  id: string
  order_number: string | null
  status: string
  items: OrderItem[]
  total_eur: number
  created_at: string
}

export const ORDER_STATUS_LABEL: Record<string, string> = {
  pending: '주문 접수',
  confirmed: '주문 확인',
  shipped: '배송 중',
  delivered: '배송 완료',
  cancelled: '주문 취소',
}

// 내 주문 목록 (RLS로 본인 주문만 조회됨)
export async function fetchMyOrders(userId: string): Promise<MyOrder[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('orders')
    .select('id, order_number, status, items, total_eur, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as MyOrder[]
}
