'use client'
import { getTierInfo, type MemberTier } from '@/lib/memberTiers'
import { useTierBadgeImages } from '@/lib/memberBadges'

const SIZE = {
  // 헤더, 어드민, 리뷰·댓글·게시판 작성자 옆
  sm: { icon: 'h-5 w-5 text-[11px]', label: 'text-[10px]' },
  // 마이페이지 인사말처럼 큰 제목 옆
  lg: { icon: 'h-10 w-10 text-[18px] md:h-12 md:w-12 md:text-[21px]', label: 'text-[12px] md:text-[13px]' },
}

const fontCls = 'font-[family-name:var(--font-lato)] font-bold leading-none'

// 회원 등급 배지 — 헤더, 어드민, 마이페이지, 리뷰·댓글·CS 게시판(추후 커뮤니티 게시판) 작성자 옆에 공용으로 사용
// 기본은 코드로 그린 동그란 아이콘(N/S/G/V)만 표시. 어드민이 등급 그림을 올려두었으면 그림이 아이콘을 대신함
// showLabel: 등급 이름을 옆에 함께 표시 (어드민 등급 지정 화면처럼 이름이 필요한 곳에서만 사용)
export default function TierBadge({
  tier,
  size = 'sm',
  showLabel = false,
  className = '',
}: { tier: MemberTier; size?: keyof typeof SIZE; showLabel?: boolean; className?: string }) {
  const info = getTierInfo(tier)
  const imageUrl = useTierBadgeImages()[tier]
  const s = SIZE[size]

  const icon = imageUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={imageUrl} alt="" className={`${s.icon} object-contain shrink-0`} />
  ) : (
    <span aria-hidden className={`inline-flex items-center justify-center rounded-full shrink-0 ${s.icon} ${fontCls} ${info.iconCls}`}>
      {info.letter}
    </span>
  )

  return (
    <span
      title={`${info.label} 등급`}
      aria-label={`${info.label} 등급`}
      className={`inline-flex items-center gap-1.5 align-middle ${className}`}
    >
      {icon}
      {showLabel && <span className={`${fontCls} ${s.label} text-gray-600 whitespace-nowrap`}>{info.label}</span>}
    </span>
  )
}
