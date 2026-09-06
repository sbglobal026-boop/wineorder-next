'use client'
import { useEffect, useMemo, useState } from 'react'

type Member = {
  id: string
  email: string | null
  name: string | null
  createdAt: string
  lastSignInAt: string | null
  vendorShopName: string | null
  vendorStatus: string | null
  orderCount: number
  totalSpent: number
  tier: string
}

const VENDOR_STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  pending: { label: '벤더 승인대기', cls: 'bg-yellow-100 text-yellow-800' },
  approved: { label: '벤더 승인됨', cls: 'bg-green-100 text-green-800' },
  suspended: { label: '벤더 정지됨', cls: 'bg-red-100 text-red-800' },
}

const TIER_OPTIONS = [
  { value: 'basic', label: '일반' },
  { value: 'silver', label: '실버' },
  { value: 'gold', label: '골드' },
  { value: 'vip', label: 'VIP' },
]

const TIER_CLS: Record<string, string> = {
  basic: 'bg-gray-100 text-gray-600',
  silver: 'bg-slate-200 text-slate-700',
  gold: 'bg-amber-100 text-amber-800',
  vip: 'bg-purple-100 text-purple-800',
}

function formatDate(iso: string | null) {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function MembersPanel() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const [tierTarget, setTierTarget] = useState<Member | null>(null)
  const [selectedTier, setSelectedTier] = useState('basic')

  useEffect(() => {
    fetch('/api/admin/members')
      .then(res => res.json())
      .then(data => setMembers(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    if (!search.trim()) return members
    const q = search.trim().toLowerCase()
    return members.filter(m =>
      (m.email ?? '').toLowerCase().includes(q) ||
      (m.name ?? '').toLowerCase().includes(q) ||
      (m.vendorShopName ?? '').toLowerCase().includes(q)
    )
  }, [members, search])

  const vendorCount = members.filter(m => m.vendorStatus).length

  const openTierModal = (member: Member) => {
    setTierTarget(member)
    setSelectedTier(member.tier)
  }

  const confirmTier = async () => {
    if (!tierTarget) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/members/${tierTarget.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: selectedTier }),
      })
      if (res.ok) {
        setMembers(prev => prev.map(m => m.id === tierTarget.id ? { ...m, tier: selectedTier } : m))
        setTierTarget(null)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">회원 관리</h2>
      <p className="text-gray-500 text-sm mb-6">
        전체 가입자 {members.length}명 · 벤더 {vendorCount}명 · 벤더 승인/수수료 설정은 “벤더 관리” 탭에서
      </p>

      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="이메일·이름·샵이름 검색..."
        className="w-full max-w-xs border border-gray-200 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:border-gray-400"
      />

      {loading ? (
        <p className="text-sm text-gray-400">불러오는 중...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-gray-400 py-10 text-center">가입자가 없습니다</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[820px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-widest px-3 py-2">이메일</th>
                <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-widest px-3 py-2">이름</th>
                <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-widest px-3 py-2 w-[120px]">가입일</th>
                <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-widest px-3 py-2 w-[130px]">구매 이력</th>
                <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-widest px-3 py-2 w-[110px]">등급</th>
                <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-widest px-3 py-2 w-[160px]">벤더 여부</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(m => {
                const vendorStatus = m.vendorStatus ? VENDOR_STATUS_LABEL[m.vendorStatus] : null
                return (
                  <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-2.5 text-sm text-gray-900">{m.email ?? '-'}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-600">{m.name ?? '-'}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-400">{formatDate(m.createdAt)}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-600">
                      <p className="font-semibold text-gray-900">€{m.totalSpent.toLocaleString()}</p>
                      <p className="text-gray-400">{m.orderCount}건</p>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${TIER_CLS[m.tier] ?? TIER_CLS.basic}`}>
                          {TIER_OPTIONS.find(t => t.value === m.tier)?.label ?? '일반'}
                        </span>
                        <button
                          onClick={() => openTierModal(m)}
                          className="text-xs text-gray-400 hover:text-gray-700 underline underline-offset-2 whitespace-nowrap cursor-pointer"
                        >
                          등급지정
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      {vendorStatus ? (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${vendorStatus.cls}`}>
                          {m.vendorShopName} · {vendorStatus.label}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-300">일반 회원</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 등급지정 모달 */}
      {tierTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => !saving && setTierTarget(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <h3 className="text-base font-bold text-gray-900 mb-1">등급 지정</h3>
            <p className="text-xs text-gray-400 mb-5">{tierTarget.email}</p>

            <div className="flex flex-col gap-2 mb-6">
              {TIER_OPTIONS.map(t => (
                <label
                  key={t.value}
                  className={`flex items-center gap-3 border rounded-xl px-4 py-3 cursor-pointer transition-colors ${
                    selectedTier === t.value ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="tier"
                    value={t.value}
                    checked={selectedTier === t.value}
                    onChange={() => setSelectedTier(t.value)}
                    className="cursor-pointer"
                  />
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${TIER_CLS[t.value]}`}>{t.label}</span>
                </label>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={confirmTier}
                disabled={saving}
                className="flex-1 bg-gray-900 hover:bg-gray-700 disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-full transition-colors cursor-pointer"
              >
                {saving ? '저장 중...' : '저장'}
              </button>
              <button
                onClick={() => setTierTarget(null)}
                disabled={saving}
                className="flex-1 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-600 text-sm font-semibold py-2.5 rounded-full transition-colors cursor-pointer"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
