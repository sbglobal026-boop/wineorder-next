import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('orders')
    .select('*, addresses(recipient_name, address, city, country, postal_code, customs_code), split_deliveries(id, shipment_number, product_name, status, scheduled_date, tracking_number), cs_requests(id, product_name, reason, status, tracking_number, created_at)')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // 주문(orders.items)엔 벤더 구분·사진이 없어서, 상품ID→벤더명/사진 맵을 만들어 주문마다 붙여줌
  const { data: products } = await supabase
    .from('products')
    .select('id, image_url, vendors(shop_name)')
  const productInfoMap = new Map<number, { vendorName: string; imageUrl: string | null }>(
    (products ?? []).map(p => {
      const vendor = p.vendors as unknown as { shop_name: string } | { shop_name: string }[] | null
      const shopName = Array.isArray(vendor) ? vendor[0]?.shop_name : vendor?.shop_name
      return [p.id, { vendorName: shopName ?? '미상', imageUrl: p.image_url }]
    })
  )

  const enriched = (data ?? []).map(order => {
    const items = (order.items as { productId: number }[]).map(item => ({
      ...item,
      imageUrl: productInfoMap.get(item.productId)?.imageUrl ?? null,
    }))
    const vendorNames = Array.from(new Set(items.map(i => productInfoMap.get(i.productId)?.vendorName ?? '미상')))
    return { ...order, items, vendorNames }
  })

  return NextResponse.json(enriched)
}
