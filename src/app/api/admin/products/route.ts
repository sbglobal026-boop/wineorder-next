import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { productToRow } from '@/lib/products'

export async function GET() {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createAdminClient()
  const { data, error } = await supabase.from('products').select('*, vendors(shop_name)').order('id')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const enriched = (data ?? []).map(row => {
    const { vendors, ...rest } = row as typeof row & { vendors: { shop_name: string } | { shop_name: string }[] | null }
    const shopName = Array.isArray(vendors) ? vendors[0]?.shop_name : vendors?.shop_name
    return { ...rest, vendor_name: shopName ?? null }
  })

  return NextResponse.json(enriched)
}

export async function POST(request: Request) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const supabase = createAdminClient()
  const { data, error } = await supabase.from('products').insert(productToRow(body)).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
