import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { isMemberTier } from '@/lib/memberTiers'

// 등급 배지 이미지 업로드·삭제 (어드민 전용)
// 배지는 투명 배경을 살려야 하므로 브라우저에서 JPG로 압축하지 않고 원본 그대로 서버를 거쳐 저장
const BUCKET = 'badge-images'
const MAX_BYTES = 500 * 1024

// 파일 확장자·MIME만 믿지 않고 실제 파일 앞부분(시그니처)으로 PNG/WebP인지 확인
function detectImageType(bytes: Uint8Array): { ext: 'png' | 'webp'; contentType: string } | null {
  const isPng = bytes.length > 8 && [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((b, i) => bytes[i] === b)
  if (isPng) return { ext: 'png', contentType: 'image/png' }
  const ascii = (from: number, to: number) => String.fromCharCode(...bytes.slice(from, to))
  if (bytes.length > 12 && ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP') return { ext: 'webp', contentType: 'image/webp' }
  return null
}

export async function POST(request: Request) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const form = await request.formData().catch(() => null)
  const tier = form?.get('tier')
  const file = form?.get('file')
  if (!isMemberTier(tier)) return NextResponse.json({ error: '유효하지 않은 등급입니다' }, { status: 400 })
  if (!(file instanceof File)) return NextResponse.json({ error: '이미지 파일을 선택해주세요' }, { status: 400 })
  if (file.size > MAX_BYTES) return NextResponse.json({ error: '이미지는 500KB 이하만 올릴 수 있습니다' }, { status: 400 })

  const bytes = new Uint8Array(await file.arrayBuffer())
  const type = detectImageType(bytes)
  if (!type) return NextResponse.json({ error: 'PNG 또는 WebP 이미지만 올릴 수 있습니다' }, { status: 400 })

  const supabase = createAdminClient()
  const { data: previous } = await supabase.from('member_tier_badges').select('image_path').eq('tier', tier).maybeSingle()

  // 파일 이름을 매번 새로 만들어 브라우저·CDN 캐시에 옛 그림이 남지 않게 함
  const path = `${tier}-${Date.now()}.${type.ext}`
  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, bytes, {
    contentType: type.contentType,
    cacheControl: '31536000',
  })
  if (uploadError) return NextResponse.json({ error: `업로드 실패: ${uploadError.message}` }, { status: 500 })

  const imageUrl = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
  const { error: saveError } = await supabase
    .from('member_tier_badges')
    .upsert({ tier, image_url: imageUrl, image_path: path, updated_at: new Date().toISOString() })
  if (saveError) {
    await supabase.storage.from(BUCKET).remove([path])
    return NextResponse.json({ error: `저장 실패: ${saveError.message}` }, { status: 500 })
  }

  // 새 이미지 저장이 끝난 뒤 이전 파일 정리
  if (previous?.image_path && previous.image_path !== path) {
    await supabase.storage.from(BUCKET).remove([previous.image_path])
  }

  return NextResponse.json({ ok: true, imageUrl })
}

// 등급 그림 삭제 → 글자 배지로 돌아감
export async function DELETE(request: Request) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const tier = new URL(request.url).searchParams.get('tier')
  if (!isMemberTier(tier)) return NextResponse.json({ error: '유효하지 않은 등급입니다' }, { status: 400 })

  const supabase = createAdminClient()
  const { data: previous } = await supabase.from('member_tier_badges').select('image_path').eq('tier', tier).maybeSingle()
  if (!previous) return NextResponse.json({ ok: true })

  const { error } = await supabase.from('member_tier_badges').delete().eq('tier', tier)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await supabase.storage.from(BUCKET).remove([previous.image_path])
  return NextResponse.json({ ok: true })
}
