'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const ZONE_LABELS: Record<string, { label: string; icon: string; desc: string }> = {
  DE: { label: '독일', icon: '🇩🇪', desc: '독일 내 배송 & VAT 적용' },
  KR: { label: '한국', icon: '🇰🇷', desc: '한국 배송 & 통관 관세 별도' },
  EU: { label: 'EU (독일 외)', icon: '🇪🇺', desc: '독일 외 EU 국가 배송' },
}

interface ShippingRate {
  id: string
  zone: string
  fee: number
  vat_rate: number
}

export default function ShippingPanel() {
  const [rates, setRates] = useState<ShippingRate[]>([])
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    supabase
      .from('shipping_rates')
      .select('*')
      .order('zone')
      .then(({ data }) => {
        if (data) setRates(data)
        setLoading(false)
      })
  }, [])

  const handleChange = (id: string, field: 'fee' | 'vat_rate', value: string) => {
    setRates(prev =>
      prev.map(r => r.id === id ? { ...r, [field]: Number(value) } : r)
    )
  }

  const handleSave = async (rate: ShippingRate) => {
    setSaving(rate.id)
    const res = await fetch(`/api/admin/shipping-rates/${rate.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fee: rate.fee, vat_rate: rate.vat_rate }),
    })
    setSaving(null)
    if (res.ok) {
      setSaved(rate.id)
      setTimeout(() => setSaved(null), 2000)
    }
  }

  if (loading) {
    return <p className="text-sm text-gray-400">불러오는 중...</p>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-2xl font-bold text-gray-900">배송 관리</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold px-5 py-2 rounded-full transition-colors"
        >
          배송비 관리
        </button>
      </div>
      {/* 현재 배송비 요약 — 한 줄 */}
      <div className="flex items-center gap-6 flex-wrap mt-3 mb-6">
        {rates.map(rate => {
          const info = ZONE_LABELS[rate.zone]
          return (
            <div key={rate.id} className="flex items-center gap-2 text-sm text-gray-600">
              <span>{info?.icon}</span>
              <span className="font-bold text-gray-900">{info?.label ?? rate.zone}</span>
              <span>€{rate.fee}</span>
              {rate.zone === 'DE' && <span className="text-gray-400">· VAT {Math.round(rate.vat_rate * 100)}%</span>}
            </div>
          )
        })}
      </div>

      {/* 배송비 관리 모달 */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl mx-4 p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">배송비 관리</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-700 transition-colors text-xl leading-none"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {rates.map(rate => {
                const info = ZONE_LABELS[rate.zone]
                return (
                  <div key={rate.id} className="border border-gray-100 rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xl">{info?.icon}</span>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{info?.label ?? rate.zone}</p>
                        <p className="text-xs text-gray-400">{info?.desc}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">배송비 (유로)</label>
                        <div className="flex items-center border border-gray-200 rounded-lg focus-within:border-gray-400 overflow-hidden">
                          <span className="px-3 text-gray-400 text-sm bg-gray-50 border-r border-gray-200 py-2">€</span>
                          <input
                            type="number"
                            min={0}
                            value={rate.fee}
                            onChange={e => handleChange(rate.id, 'fee', e.target.value)}
                            className="flex-1 py-2 px-3 text-sm focus:outline-none"
                          />
                        </div>
                      </div>

                      {rate.zone === 'DE' && (
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">VAT (%)</label>
                          <div className="flex items-center border border-gray-200 rounded-lg focus-within:border-gray-400 overflow-hidden">
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={Math.round(rate.vat_rate * 100)}
                              onChange={e => handleChange(rate.id, 'vat_rate', String(Number(e.target.value) / 100))}
                              className="flex-1 py-2 px-3 text-sm focus:outline-none"
                            />
                            <span className="px-3 text-gray-400 text-sm bg-gray-50 border-l border-gray-200 py-2">%</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleSave(rate)}
                      disabled={saving === rate.id}
                      className={`text-sm font-semibold px-6 py-2 rounded-full transition-colors ${
                        saved === rate.id
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-900 hover:bg-gray-700 text-white disabled:opacity-50'
                      }`}
                    >
                      {saving === rate.id ? '저장 중...' : saved === rate.id ? '✓ 저장됨' : '저장'}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
