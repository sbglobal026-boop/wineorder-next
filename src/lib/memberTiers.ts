// 회원 등급 정의 — 어드민 회원관리, 헤더, (추후) 커뮤니티 게시판이 함께 사용
// 등급은 Supabase Auth의 app_metadata.tier에 저장 (user_metadata는 회원 본인이 브라우저에서 바꿀 수 있어 사용하지 않음)

export const MEMBER_TIERS = [
  { value: 'basic', label: '일반', badgeCls: 'bg-white text-gray-600 ring-1 ring-inset ring-gray-300' },
  { value: 'silver', label: '실버', badgeCls: 'bg-slate-200 text-slate-700' },
  { value: 'gold', label: '골드', badgeCls: 'bg-amber-100 text-amber-800' },
  { value: 'vip', label: 'VIP', badgeCls: 'bg-purple-100 text-purple-800' },
] as const

export type MemberTier = (typeof MEMBER_TIERS)[number]['value']

export const DEFAULT_TIER: MemberTier = 'basic'

export function isMemberTier(value: unknown): value is MemberTier {
  return MEMBER_TIERS.some(t => t.value === value)
}

// app_metadata에서 등급을 읽음 — 없거나 잘못된 값이면 일반
export function tierFromAppMetadata(appMetadata: unknown): MemberTier {
  const tier = (appMetadata as { tier?: unknown } | null | undefined)?.tier
  return isMemberTier(tier) ? tier : DEFAULT_TIER
}

export function getTierInfo(tier: MemberTier) {
  return MEMBER_TIERS.find(t => t.value === tier) ?? MEMBER_TIERS[0]
}

// 화면에 보여줄 회원 이름 — 가입 때 입력한 이름, 없으면 이메일 앞부분 (헤더·마이페이지 공용)
export function memberDisplayName(name: string, email: string) {
  return name && name !== email ? name : email.split('@')[0]
}
