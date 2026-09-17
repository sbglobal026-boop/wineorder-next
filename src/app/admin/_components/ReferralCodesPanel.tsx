'use client'
import { useEffect, useState } from 'react'

interface ReferralCode {
  id: string
  code: string
  referrer_name: string
  discount_percent: number
  max_uses: number | null
  active: boolean
  created_at: string
  // 아래는 API가 붙여주는 통계 (취소 제외 주문 기준)
  uses: number
  totalEur: number
  discountEur: number
}

type FormState = { code: string; referrer_name: string; discount_percent: string; max_uses: string; active: boolean }
const emptyForm: FormState = { code: '', referrer_name: '', discount_percent: '', max_uses: '', active: true }

const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400 disabled:bg-gray-100 disabled:text-gray-400'

function formatEur(n: number) {
  return `€${n.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// 코드 목록 + 사용 통계 조회
async function fetchCodes(): Promise<{ codes: ReferralCode[] } | { error: string }> {
  const res = await fetch('/api/admin/referral-codes')
  const data = await res.json().catch(() => null)
  return res.ok ? { codes: data } : { error: data?.error ?? '코드 목록을 불러오지 못했습니다' }
}

function StatusBadge({ code }: { code: ReferralCode }) {
  if (!code.active) return <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">종료</span>
  if (code.max_uses != null && code.uses >= code.max_uses) {
    return <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">횟수 소진</span>
  }
  return <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-800">사용 중</span>
}

export default function ReferralCodesPanel() {
  const [codes, setCodes] = useState<ReferralCode[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  // 등록·수정 폼: null = 닫힘, 'new' = 새 코드, 그 외 = 수정 중인 코드 id
  const [formTarget, setFormTarget] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [rowError, setRowError] = useState('')

  const applyResult = (result: Awaited<ReturnType<typeof fetchCodes>>) => {
    if ('codes' in result) {
      setCodes(result.codes)
      setLoadError('')
    } else {
      setLoadError(result.error)
    }
    setLoading(false)
  }

  const loadCodes = async () => applyResult(await fetchCodes())

  useEffect(() => {
    let ignore = false
    fetchCodes().then(result => { if (!ignore) applyResult(result) })
    return () => { ignore = true }
  }, [])

  const editingCode = codes.find(c => c.id === formTarget)

  const openNew = () => {
    setFormTarget('new')
    setForm(emptyForm)
    setFormError('')
  }

  const openEdit = (c: ReferralCode) => {
    setFormTarget(c.id)
    setForm({
      code: c.code,
      referrer_name: c.referrer_name,
      discount_percent: String(c.discount_percent),
      max_uses: c.max_uses == null ? '' : String(c.max_uses),
      active: c.active,
    })
    setFormError('')
  }

  const saveForm = async () => {
    setSaving(true)
    setFormError('')
    const isNew = formTarget === 'new'
    const res = await fetch(isNew ? '/api/admin/referral-codes' : `/api/admin/referral-codes/${formTarget}`, {
      method: isNew ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, max_uses: form.max_uses.trim() }),
    })
    const data = await res.json().catch(() => null)
    setSaving(false)
    if (!res.ok) {
      setFormError(data?.error ?? '저장하지 못했습니다')
      return
    }
    setFormTarget(null)
    loadCodes()
  }

  // 목록에서 바로 사용 켜기/끄기 (끄면 즉시 종료)
  const toggleActive = async (c: ReferralCode) => {
    setBusyId(c.id)
    setRowError('')
    const res = await fetch(`/api/admin/referral-codes/${c.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: c.code,
        referrer_name: c.referrer_name,
        discount_percent: c.discount_percent,
        max_uses: c.max_uses,
        active: !c.active,
      }),
    })
    const data = await res.json().catch(() => null)
    if (!res.ok) setRowError(data?.error ?? '변경하지 못했습니다')
    await loadCodes()
    setBusyId(null)
  }

  // 삭제는 한 번 더 눌러야 실행. 주문에 사용된 코드는 서버에서 거절함
  const handleDelete = async (c: ReferralCode) => {
    if (deleteConfirm !== c.id) {
      setDeleteConfirm(c.id)
      return
    }
    setDeleteConfirm(null)
    setBusyId(c.id)
    setRowError('')
    const res = await fetch(`/api/admin/referral-codes/${c.id}`, { method: 'DELETE' })
    const data = await res.json().catch(() => null)
    if (!res.ok) setRowError(data?.error ?? '삭제하지 못했습니다')
    if (formTarget === c.id && res.ok) setFormTarget(null)
    await loadCodes()
    setBusyId(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-2xl font-bold text-gray-900">추천인 코드</h2>
        <button
          onClick={openNew}
          className="bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors"
        >
          + 새 코드
        </button>
      </div>
      <p className="text-gray-500 text-sm mb-8">
        결제 페이지에서 입력하는 추천인 코드와 할인율(상품 금액에만 적용)을 관리합니다. 사용 횟수는 취소되지 않은 주문 기준입니다.
      </p>

      {formTarget !== null && (
        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6 mb-6 max-w-xl">
          <p className="text-sm font-semibold text-gray-700 mb-4">
            {formTarget === 'new' ? '새 코드 등록' : `코드 수정 — ${editingCode?.code ?? ''}`}
          </p>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">코드 *</label>
              <input
                value={form.code}
                onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                disabled={!!editingCode && editingCode.uses > 0}
                maxLength={30}
                className={`${inputCls} font-mono`}
                placeholder="예: JIHO10"
              />
              <p className="text-xs text-gray-400 mt-1">
                {editingCode && editingCode.uses > 0
                  ? '이미 주문에 사용된 코드는 바꿀 수 없습니다'
                  : '영문·숫자·-·_ 4~30자 (영문은 대문자로 저장)'}
              </p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">추천인 이름</label>
              <input
                value={form.referrer_name}
                onChange={e => setForm(f => ({ ...f, referrer_name: e.target.value }))}
                maxLength={50}
                className={inputCls}
                placeholder="예: 지호"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">할인율 (%) *</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  step={1}
                  value={form.discount_percent}
                  onChange={e => setForm(f => ({ ...f, discount_percent: e.target.value }))}
                  className={inputCls}
                  placeholder="1~100"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">최대 사용 횟수</label>
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={form.max_uses}
                  onChange={e => setForm(f => ({ ...f, max_uses: e.target.value }))}
                  className={inputCls}
                  placeholder="비우면 무제한"
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={form.active}
                onChange={e => setForm(f => ({ ...f, active: e.target.checked }))}
              />
              사용 중 <span className="text-xs text-gray-400">(끄면 즉시 종료 — 이미 결제된 주문의 할인은 그대로 유지)</span>
            </label>
            {formError && <p className="text-xs text-red-600">{formError}</p>}
            <div className="flex gap-2">
              <button
                onClick={saveForm}
                disabled={saving}
                className="bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold px-6 py-2 rounded-full transition-colors disabled:opacity-40"
              >
                {saving ? '저장 중...' : '저장'}
              </button>
              <button
                onClick={() => setFormTarget(null)}
                className="border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm px-6 py-2 rounded-full transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {rowError && <p className="text-sm text-red-600 mb-4">{rowError}</p>}

      {loading ? (
        <p className="text-sm text-gray-400 text-center py-16">불러오는 중...</p>
      ) : loadError ? (
        <p className="text-sm text-red-600 text-center py-16">{loadError}</p>
      ) : codes.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-16">등록된 추천인 코드가 없습니다</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-2xl border border-gray-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                <th className="px-4 py-3 font-semibold">코드</th>
                <th className="px-4 py-3 font-semibold">추천인</th>
                <th className="px-4 py-3 font-semibold text-right">할인율</th>
                <th className="px-4 py-3 font-semibold text-right">사용</th>
                <th className="px-4 py-3 font-semibold text-right">결제 합계</th>
                <th className="px-4 py-3 font-semibold text-right">할인 합계</th>
                <th className="px-4 py-3 font-semibold">상태</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {codes.map(c => (
                <tr key={c.id} className={c.active ? '' : 'text-gray-400'}>
                  <td className="px-4 py-3 font-mono font-semibold whitespace-nowrap">{c.code}</td>
                  <td className="px-4 py-3">{c.referrer_name || '-'}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">{c.discount_percent}%</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">{c.uses} / {c.max_uses ?? '∞'}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">{formatEur(c.totalEur)}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">{formatEur(c.discountEur)}</td>
                  <td className="px-4 py-3 whitespace-nowrap"><StatusBadge code={c} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                      <button
                        onClick={() => toggleActive(c)}
                        disabled={busyId === c.id}
                        className="text-xs border border-gray-200 hover:border-gray-400 text-gray-600 px-3 py-1.5 rounded-full transition-colors disabled:opacity-40"
                      >
                        {c.active ? '종료' : '다시 사용'}
                      </button>
                      <button
                        onClick={() => openEdit(c)}
                        className="text-xs border border-gray-200 hover:border-gray-400 text-gray-600 px-3 py-1.5 rounded-full transition-colors"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDelete(c)}
                        disabled={busyId === c.id}
                        className={`text-xs px-3 py-1.5 rounded-full transition-colors disabled:opacity-40 ${
                          deleteConfirm === c.id
                            ? 'bg-red-600 text-white'
                            : 'text-gray-400 hover:text-red-600 border border-gray-200 hover:border-red-200'
                        }`}
                      >
                        {deleteConfirm === c.id ? '확인?' : '삭제'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
