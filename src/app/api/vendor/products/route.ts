import { NextResponse } from 'next/server'
import { getVendorUser } from '@/lib/vendor-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { productToRow } from '@/lib/products'

export async function GET() {
  const vendor = await getVendorUser()
  if (!vendor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('vendor_id', vendor.id)
    .order('id')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const vendor = await getVendorUser()
  if (!vendor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (vendor.status !== 'approved') {
    return NextResponse.json({ error: '입점 승인 대기 중입니다' }, { status: 403 })
  }

  const body = await request.json()
  const supabase = createAdminClient()
  const row = {
    ...productToRow(body),
    EK: body.price ?? 0, // 벤더 상품은 원가 개념 없음 — 판매가를 그대로 기준값으로 둠 (수수료는 vendors.commission_rate로 별도 관리)
    margin: 0,
    vendor_id: vendor.id,
    approval_status: 'pending', // 벤더가 직접 공개상태를 정할 수 없게 항상 검수 대기로 등록
  }

  const { data, error } = await supabase.from('products').insert(row).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
