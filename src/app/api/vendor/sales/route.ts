import { NextResponse } from 'next/server'
import { getVendorUser } from '@/lib/vendor-auth'
import { createAdminClient } from '@/lib/supabase/admin'

// 주문(orders.items)엔 벤더 구분이 없어서, 이 벤더의 상품 ID 목록으로 걸러서 직접 집계함
export async function GET() {
  const vendor = await getVendorUser()
  if (!vendor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createAdminClient()

  const { data: myProducts } = await supabase
    .from('products')
    .select('id, image_url')
    .eq('vendor_id', vendor.id)
  const myProductImage = new Map((myProducts ?? []).map(p => [p.id, p.image_url]))

  // 취소된 주문은 매출 집계에서 제외
  const { data: orders, error } = await supabase
    .from('orders')
    .select('id, order_number, status, items, created_at')
    .neq('status', 'cancelled')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const STATUS_LABEL: Record<string, string> = {
    pending: '주문 접수', confirmed: '주문 확인', shipped: '배송 중', delivered: '배송 완료',
  }

  let grossSales = 0
  let orderCount = 0
  const items: {
    name: string; qty: number; amount: number; createdAt: string
    imageUrl: string | null; orderNumber: string | null; status: string
  }[] = []

  for (const order of orders ?? []) {
    const orderItems = order.items as { productId: number; name: string; qty: number; price_eur: number }[]
    const mine = orderItems.filter(i => myProductImage.has(i.productId))
    if (mine.length === 0) continue

    orderCount += 1
    for (const item of mine) {
      const amount = item.price_eur * item.qty
      grossSales += amount
      items.push({
        name: item.name,
        qty: item.qty,
        amount,
        createdAt: order.created_at,
        imageUrl: myProductImage.get(item.productId) ?? null,
        orderNumber: order.order_number,
        status: STATUS_LABEL[order.status] ?? order.status,
      })
    }
  }

  const commissionAmount = grossSales * vendor.commission_rate
  const netPayout = grossSales - commissionAmount

  return NextResponse.json({
    grossSales,
    commissionRate: vendor.commission_rate,
    commissionAmount,
    netPayout,
    orderCount,
    items: items.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 50),
  })
}
