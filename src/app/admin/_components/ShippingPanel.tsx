'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const ZONE_LABELS: Record<string, { label: string; icon: string; desc: string }> = {
  DE: { label: '독일', icon: '🇩🇪', desc: '독일 내 배송 & VAT 적용' },
  KR: { label: '한국', icon: '🇰🇷', desc: '한국 배송 & 통관 관세 별도' },
  EU: { label: 'EU (독일 외)', icon: '🇪🇺', desc: '독일 외 EU 국가 배송' },
}

const STATUS_OPTIONS = [
  { value: 'pending',   label: '주문 접수',  color: 'bg-yellow-100 text-yellow-800' },
  { value: 'confirmed', label: '주문 확인',  color: 'bg-blue-100 text-blue-800' },
  { value: 'shipped',   label: '배송 중',    color: 'bg-purple-100 text-purple-800' },
  { value: 'delivered', label: '배송 완료',  color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: '주문 취소',  color: 'bg-red-100 text-red-800' },
]

interface ShippingRate {
  id: string
  zone: string
  fee: number
  vat_rate: number
}

interface OrderItem {
  productId: number
  name: string
  qty: number
  price_eur: number
}

interface SplitDelivery {
  id: string
  shipment_number: string
  product_name: string
  status: string
  scheduled_date: string | null
}

interface Order {
  id: string
  order_number: string | null
  status: string
  items: OrderItem[]
  total_eur: number
  shipping_fee_eur: number
  split_delivery: boolean
  split_delivery_fee_eur: number
  created_at: string
  addresses?: {
    recipient_name: string
    address: string
    city: string
    country: string
    postal_code: string | null
  } | null
  split_deliveries?: SplitDelivery[]
}

function StatusBadge({ status }: { status: string }) {
  const opt = STATUS_OPTIONS.find(s => s.value === status)
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${opt?.color ?? 'bg-gray-100 text-gray-600'}`}>
      {opt?.label ?? status}
    </span>
  )
}

export default function ShippingPanel() {
  const [rates, setRates] = useState<ShippingRate[]>([])
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)
  const [updatingShipmentId, setUpdatingShipmentId] = useState<string | null>(null)

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

  // 주문 목록 불러오기
  useEffect(() => {
    fetch('/api/admin/orders')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setOrders(data)
        setOrdersLoading(false)
      })
      .catch(() => setOrdersLoading(false))
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

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId)
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    if (res.ok) {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
    }
    setUpdatingOrderId(null)
  }

  const handleShipmentUpdate = async (
    orderId: string,
    shipmentId: string,
    updates: { status?: string; scheduled_date?: string | null }
  ) => {
    setUpdatingShipmentId(shipmentId)
    const res = await fetch(`/api/admin/split-deliveries/${shipmentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    if (res.ok) {
      setOrders(prev => prev.map(o => {
        if (o.id !== orderId) return o
        return {
          ...o,
          split_deliveries: o.split_deliveries?.map(s =>
            s.id === shipmentId ? { ...s, ...updates } : s
          ),
        }
      }))
    }
    setUpdatingShipmentId(null)
  }

  const filteredOrders = statusFilter === 'all'
    ? orders
    : orders.filter(o => o.status === statusFilter)

  if (loading) {
    return <p className="text-sm text-gray-400">불러오는 중...</p>
  }

  return (
    <div>
      {/* 배송비 섹션 */}
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-2xl font-bold text-gray-900">배송 관리</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold px-5 py-2 rounded-full transition-colors"
        >
          배송비 관리
        </button>
      </div>
      {/* 현재 배송비 요약 */}
      <div className="flex items-center gap-6 flex-wrap mt-3 mb-10">
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

      {/* 주문 목록 섹션 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">
            주문 목록
            <span className="ml-2 text-sm font-normal text-gray-400">({orders.length}건)</span>
          </h3>
          {/* 상태 필터 */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setStatusFilter('all')}
              className={`text-xs font-semibold px-3 py-1 rounded-full transition-colors ${
                statusFilter === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              전체
            </button>
            {STATUS_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value)}
                className={`text-xs font-semibold px-3 py-1 rounded-full transition-colors ${
                  statusFilter === opt.value ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {ordersLoading ? (
          <p className="text-sm text-gray-400">불러오는 중...</p>
        ) : filteredOrders.length === 0 ? (
          <p className="text-sm text-gray-400 py-6 text-center">주문 내역이 없습니다</p>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredOrders.map(order => (
              <div key={order.id} className="border border-gray-200 rounded-xl bg-white overflow-hidden">
                {/* 주문 헤더 */}
                <div
                  className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-xs font-mono text-gray-400">{order.order_number ?? order.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-sm font-bold text-gray-900">
                        {order.items.map(i => `${i.name} ×${i.qty}`).join(', ')}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(order.created_at).toLocaleString('ko-KR', { dateStyle: 'short', timeStyle: 'short' })}
                        {order.addresses && ` · ${order.addresses.recipient_name} (${order.addresses.country})`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-black text-gray-900">€{order.total_eur.toLocaleString()}</span>
                    <StatusBadge status={order.status} />
                    <span className="text-gray-300 text-xs">{expandedOrderId === order.id ? '▲' : '▼'}</span>
                  </div>
                </div>

                {/* 펼쳐지는 상세 */}
                {expandedOrderId === order.id && (
                  <div className="border-t border-gray-100 px-5 py-4 bg-gray-50">
                    {/* 배송지 */}
                    {order.addresses && (
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-gray-500 mb-1">배송지</p>
                        <p className="text-sm text-gray-700">
                          {order.addresses.recipient_name} · {order.addresses.address}, {order.addresses.city}
                          {order.addresses.postal_code && ` ${order.addresses.postal_code}`}
                          {' '}({order.addresses.country})
                        </p>
                      </div>
                    )}

                    {/* 금액 내역 */}
                    <div className="mb-4 flex flex-col gap-1">
                      <p className="text-xs font-semibold text-gray-500 mb-1">금액 내역</p>
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>상품 합계</span>
                        <span>€{order.items.reduce((s, i) => s + i.price_eur * i.qty, 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>배송비</span><span>€{order.shipping_fee_eur.toLocaleString()}</span>
                      </div>
                      {order.split_delivery && (
                        <div className="flex justify-between text-xs text-gray-600">
                          <span>분할배송비</span><span>€{order.split_delivery_fee_eur.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-xs font-bold text-gray-900 pt-1 border-t border-gray-200">
                        <span>총합</span><span>€{order.total_eur.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* 분할배송 세부 배송건 */}
                    {order.split_delivery && order.split_deliveries && order.split_deliveries.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-gray-500 mb-2">분할배송 관리</p>
                        <div className="flex flex-col gap-2">
                          {[...order.split_deliveries]
                            .sort((a, b) => a.shipment_number.localeCompare(b.shipment_number))
                            .map(shipment => (
                            <div key={shipment.id} className="border border-gray-200 rounded-lg p-3 bg-white">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <span className="text-xs font-mono font-bold text-gray-700">{shipment.shipment_number}</span>
                                  <span className="text-xs text-gray-400 ml-2">{shipment.product_name}</span>
                                </div>
                                <StatusBadge status={shipment.status} />
                              </div>
                              <div className="flex items-center gap-2 flex-wrap">
                                {/* 발송 예정일 */}
                                <input
                                  type="date"
                                  value={shipment.scheduled_date ?? ''}
                                  onChange={e => handleShipmentUpdate(order.id, shipment.id, { scheduled_date: e.target.value || null })}
                                  className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-gray-400"
                                />
                                {/* 상태 변경 버튼 */}
                                {[
                                  { value: 'pending', label: '대기' },
                                  { value: 'shipped', label: '발송' },
                                  { value: 'delivered', label: '완료' },
                                ].map(opt => (
                                  <button
                                    key={opt.value}
                                    disabled={shipment.status === opt.value || updatingShipmentId === shipment.id}
                                    onClick={() => handleShipmentUpdate(order.id, shipment.id, { status: opt.value })}
                                    className={`text-xs font-semibold px-3 py-1 rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                                      shipment.status === opt.value
                                        ? 'bg-gray-900 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                  >
                                    {updatingShipmentId === shipment.id && shipment.status !== opt.value ? '...' : opt.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 상태 변경 */}
                    <div>
                      <p className="text-xs font-semibold text-gray-500 mb-2">주문 상태 변경</p>
                      <div className="flex gap-2 flex-wrap">
                        {STATUS_OPTIONS.map(opt => (
                          <button
                            key={opt.value}
                            disabled={order.status === opt.value || updatingOrderId === order.id}
                            onClick={() => handleStatusChange(order.id, opt.value)}
                            className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                              order.status === opt.value
                                ? opt.color
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            {updatingOrderId === order.id && order.status !== opt.value ? '...' : opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
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
