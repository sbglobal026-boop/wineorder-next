'use client'
import { useState } from 'react'
import { MEMBER_TIERS, type MemberTier } from '@/lib/memberTiers'
import { refreshTierBadgeImages, useTierBadgeImages } from '@/lib/memberBadges'
import TierBadge from '@/components/member/TierBadge'

// 회원관리 탭 상단 — 등급별 배지 그림 업로드·삭제. 그림이 없는 등급은 글자 배지로 표시됨
export default function TierBadgeImagesEditor() {
  const images = useTierBadgeImages()
  const [busyTier, setBusyTier] = useState<MemberTier | null>(null)
  const [message, setMessage] = useState<{ tier: MemberTier; text: string; error: boolean } | null>(null)

  const upload = async (tier: MemberTier, file: File | undefined) => {
    if (!file) return
    setBusyTier(tier)
    setMessage(null)
    const form = new FormData()
    form.append('tier', tier)
    form.append('file', file)
    const res = await fetch('/api/admin/tier-badges', { method: 'POST', body: form })
    const data = await res.json().catch(() => null)
    if (res.ok) await refreshTierBadgeImages()
    setMessage({ tier, text: res.ok ? '업로드했습니다' : (data?.error ?? '업로드하지 못했습니다'), error: !res.ok })
    setBusyTier(null)
  }

  const remove = async (tier: MemberTier) => {
    setBusyTier(tier)
    setMessage(null)
    const res = await fetch(`/api/admin/tier-badges?tier=${tier}`, { method: 'DELETE' })
    const data = await res.json().catch(() => null)
    if (res.ok) await refreshTierBadgeImages()
    setMessage({ tier, text: res.ok ? '삭제했습니다 (글자 배지로 표시)' : (data?.error ?? '삭제하지 못했습니다'), error: !res.ok })
    setBusyTier(null)
  }

  return (
    <section className="bg-gray-50 rounded-2xl border border-gray-100 p-5 mb-8">
      <p className="text-sm font-semibold text-gray-700">등급 배지 이미지</p>
      <p className="text-xs text-gray-400 mt-1 mb-4">
        올린 그림이 기본 아이콘(N·S·G·V)을 대신합니다 · PNG·WebP, 500KB 이하 · 투명 배경의 정사각형(96×96px 이상) 권장 · 아주 작게(20px) 표시되므로 단순한 모양이 잘 보입니다
      </p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {MEMBER_TIERS.map(t => (
          <div key={t.value} className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col items-center gap-3">
            <div className="h-16 flex items-center justify-center">
              <TierBadge tier={t.value} size="lg" showLabel />
            </div>
            <div className="flex items-center gap-2">
              <label className={`text-xs font-semibold px-3 py-1.5 rounded-full bg-gray-900 text-white hover:bg-gray-700 transition-colors ${busyTier ? 'opacity-40 pointer-events-none' : 'cursor-pointer'}`}>
                {busyTier === t.value ? '처리 중...' : images[t.value] ? '변경' : '업로드'}
                <input
                  type="file"
                  accept="image/png,image/webp"
                  className="hidden"
                  disabled={!!busyTier}
                  onChange={e => { upload(t.value, e.target.files?.[0]); e.target.value = '' }}
                />
              </label>
              {images[t.value] && (
                <button
                  onClick={() => remove(t.value)}
                  disabled={!!busyTier}
                  className="text-xs text-gray-400 hover:text-red-600 border border-gray-200 hover:border-red-200 px-3 py-1.5 rounded-full transition-colors disabled:opacity-40"
                >
                  삭제
                </button>
              )}
            </div>
            {message?.tier === t.value && (
              <p className={`text-[11px] text-center ${message.error ? 'text-red-600' : 'text-green-700'}`}>{message.text}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
