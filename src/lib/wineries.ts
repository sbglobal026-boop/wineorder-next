import { createClient } from '@/lib/supabase/client'
import { removeStorageFiles } from '@/lib/uploadImage'

// 와이너리(생산자) — 목록(/events/winery)·상세(/events/winery/[slug]) 페이지와 어드민에서 사용
export type Winery = {
  id: number
  slug: string
  name: string
  country: string
  region: string
  description: string
  image_url: string | null
  created_at: string
}

export type WineryInput = {
  slug: string
  name: string
  country: string
  region: string
  description: string
  image_url: string | null
}

// 주소에 쓰는 영문 이름 형식 (DB 제약과 동일)
export const WINERY_SLUG_PATTERN = /^[a-z0-9-]{2,60}$/

// 이름에서 주소용 영문 이름 자동 생성 (예: "Ossian Vides y Vinos" → "ossian-vides-y-vinos")
export function slugify(name: string) {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // 악센트 제거 (é → e)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

// 어드민 와이너리 등록·수정 입력값 검사
export function parseWineryInput(body: Record<string, unknown>): { ok: true; value: WineryInput } | { ok: false; error: string } {
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  if (!name) return { ok: false, error: '와이너리 이름을 입력해주세요' }

  const slug = typeof body.slug === 'string' ? body.slug.trim().toLowerCase() : ''
  if (!WINERY_SLUG_PATTERN.test(slug)) {
    return { ok: false, error: '주소용 영문 이름은 영문 소문자·숫자·-로 2~60자여야 합니다' }
  }

  const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
  return {
    ok: true,
    value: {
      slug,
      name: name.slice(0, 100),
      country: text(body.country).slice(0, 50),
      region: text(body.region).slice(0, 80),
      description: text(body.description),
      image_url: text(body.image_url) || null,
    },
  }
}

export async function fetchWineries(): Promise<Winery[]> {
  const supabase = createClient()
  const { data, error } = await supabase.from('wineries').select('*').order('name')
  if (error) throw error
  return data ?? []
}

export async function fetchWineryBySlug(slug: string): Promise<Winery | null> {
  const supabase = createClient()
  const { data } = await supabase.from('wineries').select('*').eq('slug', slug).maybeSingle()
  return data ?? null
}

// 이 와이너리의 상품 id 목록 (상품 정보 자체는 products_public에서 가져옴)
export async function fetchWineryProductIds(slug: string): Promise<number[]> {
  const supabase = createClient()
  const { data, error } = await supabase.from('product_wineries').select('product_id').eq('winery_slug', slug)
  if (error) return []
  return (data ?? []).map(row => row.product_id as number)
}

// 상품 하나에 연결된 와이너리 (상품 상세 페이지의 경로 표시·와이너리 버튼용)
// products_public 뷰에는 winery_id가 없으므로 product_wineries 뷰를 거쳐 찾는다
export async function fetchWineryByProductId(productId: number): Promise<Winery | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('product_wineries')
    .select('winery_slug')
    .eq('product_id', productId)
    .maybeSingle()
  if (error || !data?.winery_slug) return null
  return fetchWineryBySlug(data.winery_slug as string)
}

// ===== 어드민 =====
export async function fetchAdminWineries(): Promise<Winery[]> {
  const res = await fetch('/api/admin/wineries')
  if (!res.ok) throw new Error('와이너리 목록을 불러오지 못했습니다')
  return res.json()
}

export async function createWinery(input: WineryInput): Promise<void> {
  const res = await fetch('/api/admin/wineries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error((await res.json().catch(() => null))?.error ?? '등록하지 못했습니다')
}

export async function updateWinery(id: number, input: WineryInput): Promise<void> {
  const res = await fetch(`/api/admin/wineries/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error((await res.json().catch(() => null))?.error ?? '저장하지 못했습니다')
}

// 소개글(HTML) 안에 넣은 사진 주소를 모두 찾아낸다 — 와이너리를 지울 때 저장소에서도 같이 지우기 위함
export function imageUrlsInHtml(html: string | null | undefined): string[] {
  const urls = new Set<string>()
  for (const m of (html ?? '').matchAll(/<img[^>]+src=["']([^"']+)["']/gi)) urls.add(m[1])
  return [...urls]
}

export async function deleteWinery(id: number, imageUrl?: string | null, description?: string): Promise<void> {
  // 대표 사진과 소개글 속 사진을 저장소에서 먼저 정리 (지금까지는 사진이 그대로 남아 있었음)
  const imagesToRemove = [imageUrl, ...imageUrlsInHtml(description)].filter((url): url is string => !!url)
  if (imagesToRemove.length > 0) {
    await removeStorageFiles('banner-images', imagesToRemove)
  }
  const res = await fetch(`/api/admin/wineries/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error((await res.json().catch(() => null))?.error ?? '삭제하지 못했습니다')
}
