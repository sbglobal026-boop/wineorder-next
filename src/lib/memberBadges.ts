'use client'
import { useEffect, useState, useSyncExternalStore } from 'react'
import { createClient } from '@/lib/supabase/client'
import { isMemberTier, type MemberTier } from '@/lib/memberTiers'

// ===== 등급별 배지 이미지 (어드민이 업로드, member_tier_badges 테이블) =====
// 페이지 안에서 한 번만 조회해 모든 배지가 공유. 새로고침 때 글자 배지가 잠깐 보였다 바뀌지 않도록
// 마지막으로 받은 값을 localStorage에 기억해 두고 먼저 사용

export type TierBadgeImages = Partial<Record<MemberTier, string>>

const CACHE_KEY = 'wineorder-tier-badge-images'
const EMPTY: TierBadgeImages = {}

let images: TierBadgeImages = EMPTY
let loadStarted = false
const listeners = new Set<() => void>()

if (typeof window !== 'undefined') {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) ?? 'null')
    if (cached && typeof cached === 'object') images = cached
  } catch {
    // 캐시가 없거나 읽을 수 없으면 서버 값만 사용
  }
}

// 어드민에서 이미지를 바꾼 뒤에도 호출해 화면의 모든 배지를 갱신
export async function refreshTierBadgeImages() {
  loadStarted = true
  const { data, error } = await createClient().from('member_tier_badges').select('tier, image_url')
  if (error) return
  const next: TierBadgeImages = {}
  for (const row of data ?? []) {
    if (isMemberTier(row.tier)) next[row.tier] = row.image_url
  }
  images = next
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(next))
  } catch {
    // 저장 실패해도 화면 표시는 정상
  }
  listeners.forEach(fn => fn())
}

function subscribe(onChange: () => void) {
  listeners.add(onChange)
  if (!loadStarted) refreshTierBadgeImages()
  return () => { listeners.delete(onChange) }
}

export function useTierBadgeImages(): TierBadgeImages {
  return useSyncExternalStore(subscribe, () => images, () => EMPTY)
}

// ===== 다른 회원의 등급 (리뷰·댓글·게시판 작성자 옆 배지용) =====
// DB 함수 member_tiers가 요청한 회원 ID의 등급만 돌려줌 (supabase/sql/004_member_tier_badges.sql)

const MAX_IDS = 200

export async function fetchMemberTiers(userIds: string[]): Promise<Record<string, MemberTier>> {
  const ids = [...new Set(userIds.filter(Boolean))].slice(0, MAX_IDS)
  if (ids.length === 0) return {}
  const { data, error } = await createClient().rpc('member_tiers', { user_ids: ids })
  // 조회 실패 시 배지 없이 표시 (작성자 이름은 그대로 보임)
  if (error || !Array.isArray(data)) return {}
  const result: Record<string, MemberTier> = {}
  for (const row of data as { user_id: string; tier: string }[]) {
    if (isMemberTier(row.tier)) result[row.user_id] = row.tier
  }
  return result
}

// 작성자 ID 목록이 바뀔 때마다 등급을 다시 조회. 아직 모르는 회원은 결과에 없음 → 배지를 그리지 않음
export function useMemberTiers(userIds: string[]): Record<string, MemberTier> {
  const key = [...new Set(userIds.filter(Boolean))].sort().join(',')
  const [tiers, setTiers] = useState<Record<string, MemberTier>>({})
  useEffect(() => {
    if (!key) return
    let ignore = false
    fetchMemberTiers(key.split(',')).then(result => { if (!ignore) setTiers(result) })
    return () => { ignore = true }
  }, [key])
  return tiers
}
