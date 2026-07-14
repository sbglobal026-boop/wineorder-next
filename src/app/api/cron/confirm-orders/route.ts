import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: Request) {
  // Vercel Cron 인증 확인
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 독일 현재 시각이 9시인지 확인 (DST 자동 처리)
  const now = new Date()
  const germanHour = parseInt(
    now.toLocaleString('en-US', { timeZone: 'Europe/Berlin', hour: 'numeric', hour12: false })
  )

  if (germanHour !== 9) {
    return NextResponse.json({ skipped: true, germanHour })
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('orders')
    .update({ status: 'confirmed' })
    .eq('status', 'pending')
    .select('id')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ confirmed: data?.length ?? 0 })
}
