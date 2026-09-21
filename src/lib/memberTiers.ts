// 회원 등급 정의 — 어드민 회원관리, 헤더, (추후) 커뮤니티 게시판이 함께 사용
// 등급은 Supabase Auth의 app_metadata.tier에 저장 (user_metadata는 회원 본인이 브라우저에서 바꿀 수 있어 사용하지 않음)

// letter/iconCls = 동그란 아이콘(코드로 그림), badgeCls = 아이콘 아래 등급 이름
export const MEMBER_TIERS = [
  {
    value: 'basic', label: '일반', letter: 'N',
    // 헤더 배경도 같은 보틀그린이라 동그라미가 묻히지 않도록 얇은 밝은 테두리를 함께 사용
    iconCls: 'bg-[#0e3719] text-[#FBFAF7] ring-1 ring-inset ring-[#FBFAF7]/55',
    badgeCls: 'bg-[#0e3719]/10 text-[#0e3719]',
  },
  {
    value: 'silver', label: '실버', letter: 'S',
    iconCls: 'bg-gradient-to-br from-[#EDF0F2] to-[#A7AFB6] text-[#39424A] ring-1 ring-inset ring-[#8F979E]/40',
    badgeCls: 'bg-slate-200 text-slate-700',
  },
  {
    value: 'gold', label: '골드', letter: 'G',
    iconCls: 'bg-gradient-to-br from-[#F6DE9B] to-[#C79A1E] text-[#4A3606] ring-1 ring-inset ring-[#A8811A]/40',
    badgeCls: 'bg-amber-100 text-amber-800',
  },
  {
    value: 'vip', label: 'VIP', letter: 'V',
    iconCls: 'bg-gradient-to-br from-[#9061F9] to-[#6425C7] text-[#FBFAF7]',
    badgeCls: 'bg-purple-100 text-purple-800',
  },
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
