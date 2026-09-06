import { NextResponse } from 'next/server'
import { getVendorUser } from '@/lib/vendor-auth'

export async function GET() {
  const vendor = await getVendorUser()
  return NextResponse.json({ isVendor: !!vendor, status: vendor?.status ?? null })
}
