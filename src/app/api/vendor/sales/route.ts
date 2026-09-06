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
    .select('id')
    .eq('vendor_id', vendor.id)
  const myProductIds = new Set((myProducts ?? []).map(p => p.id))

  // 취소된 주문은 매출 집계에서 제외
  const { data: orders, error } = await supabase
    .from('orders')
    .select('id, status, items, created_at')
    .neq('status', 'cancelled')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  let grossSales = 0
  let orderCount = 0
  const items: { name: string; qty: number; amount: number; createdAt: string }[] = []

  for (const order of orders ?? []) {
    const orderItems = order.items as { productId: number; name: string; qty: number; price_eur: number }[]
    const mine = orderItems.filter(i => myProductIds.has(i.productId))
    if (mine.length === 0) continue

    orderCount += 1
    for (const item of mine) {
      const amount = item.price_eur * item.qty
      grossSales += amount
      items.push({ name: item.name, qty: item.qty, amount, createdAt: order.created_at })
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
