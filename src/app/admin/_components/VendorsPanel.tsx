'use client'
import { useEffect, useState } from 'react'

type Vendor = {
  id: string
  shop_name: string
  business_info: string | null
  country: string | null
  commission_rate: number
  status: string
  created_at: string
  email: string | null
}

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  pending: { label: '승인 대기', cls: 'bg-yellow-100 text-yellow-800' },
  approved: { label: '승인됨', cls: 'bg-green-100 text-green-800' },
  suspended: { label: '정지됨', cls: 'bg-red-100 text-red-800' },
}

export default function VendorsPanel() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [rateInputs, setRateInputs] = useState<Record<string, string>>({})
  const [savingId, setSavingId] = useState<string | null>(null)

  const load = () => {
    fetch('/api/admin/vendors')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setVendors(data)
          setRateInputs(Object.fromEntries(data.map((v: Vendor) => [v.id, String(Math.round(v.commission_rate * 100))])))
        }
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const updateVendor = async (id: string, body: { status?: string; commission_rate?: number }) => {
    setSavingId(id)
    try {
      const res = await fetch(`/api/admin/vendors/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) load()
    } finally {
      setSavingId(null)
    }
  }

  const saveRate = (id: string) => {
    const percent = Number(rateInputs[id])
    if (Number.isNaN(percent) || percent < 0 || percent > 100) return
    updateVendor(id, { commission_rate: percent / 100 })
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">벤더 관리</h2>
      <p className="text-gray-500 text-sm mb-6">입점 신청을 승인하고 수수료율을 설정하세요</p>

      {loading ? (
        <p className="text-sm text-gray-400">불러오는 중...</p>
      ) : vendors.length === 0 ? (
        <p className="text-sm text-gray-400 py-10 text-center">등록된 벤더가 없습니다</p>
      ) : (
        <div className="flex flex-col gap-2">
          {vendors.map(v => {
            const status = STATUS_LABEL[v.status] ?? STATUS_LABEL.pending
            return (
              <div key={v.id} className="bg-white border border-gray-200 rounded-xl px-5 py-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-gray-900">{v.shop_name}</p>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${status.cls}`}>
                        {status.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {v.email ?? '이메일 없음'} · {v.country ?? '국가 미입력'}
                      {v.business_info && ` · ${v.business_info}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        value={rateInputs[v.id] ?? ''}
                        onChange={e => setRateInputs(prev => ({ ...prev, [v.id]: e.target.value }))}
                        className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-xs text-right"
                      />
                      <span className="text-xs text-gray-400">%</span>
                      <button
                        onClick={() => saveRate(v.id)}
                        disabled={savingId === v.id}
                        className="text-xs text-gray-600 hover:text-gray-900 font-medium border border-gray-200 hover:border-gray-400 px-2.5 py-1 rounded-full transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        저장
                      </button>
                    </div>

                    {v.status === 'pending' && (
                      <button
                        onClick={() => updateVendor(v.id, { status: 'approved' })}
                        disabled={savingId === v.id}
                        className="text-xs font-semibold text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        승인
                      </button>
                    )}
                    {v.status === 'approved' && (
                      <button
                        onClick={() => updateVendor(v.id, { status: 'suspended' })}
                        disabled={savingId === v.id}
                        className="text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        정지
                      </button>
                    )}
                    {v.status === 'suspended' && (
                      <button
                        onClick={() => updateVendor(v.id, { status: 'approved' })}
                        disabled={savingId === v.id}
                        className="text-xs font-semibold text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-gray-400 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        재승인
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
