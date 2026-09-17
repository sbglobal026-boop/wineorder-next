'use client'
import { getTierInfo, type MemberTier } from '@/lib/memberTiers'
import { useTierBadgeImages } from '@/lib/memberBadges'

const SIZE = {
  // 헤더, 어드민, 리뷰·댓글·게시판 작성자 옆
  sm: { pill: 'text-[10px] px-2 py-1', img: 'h-5 w-5', label: 'text-[9px] px-1.5 py-[2px]' },
  // 마이페이지 인사말처럼 큰 제목 옆
  lg: { pill: 'text-[13px] md:text-[15px] px-3 py-1.5', img: 'h-10 w-10 md:h-12 md:w-12', label: 'text-[10px] md:text-[11px] px-2 py-0.5' },
}

const labelBase = 'inline-flex items-center font-[family-name:var(--font-lato)] font-bold leading-none rounded-full whitespace-nowrap'

// 회원 등급 배지 — 헤더, 어드민, 마이페이지, 리뷰·댓글·CS 게시판(추후 커뮤니티 게시판) 작성자 옆에 공용으로 사용
// 어드민이 등급 그림을 올려두었으면 "그림 + 아래에 등급 이름", 없으면 글자 배지
export default function TierBadge({ tier, size = 'sm', className = '' }: { tier: MemberTier; size?: keyof typeof SIZE; className?: string }) {
  const info = getTierInfo(tier)
  const imageUrl = useTierBadgeImages()[tier]
  const s = SIZE[size]

  if (imageUrl) {
    return (
      <span className={`inline-flex flex-col items-center gap-0.5 align-middle ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt="" className={`${s.img} object-contain`} />
        <span className={`${labelBase} ${s.label} ${info.badgeCls}`}>{info.label}</span>
      </span>
    )
  }

  return <span className={`${labelBase} ${s.pill} ${info.badgeCls} ${className}`}>{info.label}</span>
}
