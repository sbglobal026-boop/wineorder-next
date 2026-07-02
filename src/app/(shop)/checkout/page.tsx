'use client'
import Link from 'next/link'
import { useAppConfig } from '@/context/AppConfigContext'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const EU_COUNTRIES = ['FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'PT', 'PL', 'SE', 'DK', 'FI', 'IE', 'GR', 'CZ', 'HU', 'RO', 'SK', 'BG', 'HR', 'SI', 'LT', 'LV', 'EE', 'LU', 'MT', 'CY']

type CountryZone = 'DE' | 'KR' | 'EU'

function getZone(country: string): CountryZone {
  if (country === 'DE') return 'DE'
  if (country === 'KR') return 'KR'
  if (EU_COUNTRIES.includes(country)) return 'EU'
  return 'EU'
}

interface Address {
  id: string
  recipient_name: string
  address: string
  city: string
  postal_code: string | null
  country: string
  is_default: boolean
  customs_code: string | null
}

interface ShippingRate {
  id: string
  zone: string
  fee: number
  vat_rate: number
}

const COUNTRY_OPTIONS = [
  { code: 'KR', label: '🇰🇷 한국' },
  { code: 'DE', label: '🇩🇪 독일' },
  { code: 'FR', label: '🇫🇷 프랑스' },
  { code: 'IT', label: '🇮🇹 이탈리아' },
  { code: 'ES', label: '🇪🇸 스페인' },
  { code: 'NL', label: '🇳🇱 네덜란드' },
  { code: 'BE', label: '🇧🇪 벨기에' },
  { code: 'AT', label: '🇦🇹 오스트리아' },
  { code: 'PT', label: '🇵🇹 포르투갈' },
  { code: 'SE', label: '🇸🇪 스웨덴' },
  { code: 'PL', label: '🇵🇱 폴란드' },
]

// 관세 계산
function calcDuty(price: number, eurToKrw: number, eurToUsd: number, origin: string) {
  const ftaOrigins = ['프랑스', '이탈리아', '스페인', '독일', '포르투갈'] 
  const isFTA = ftaOrigins.some(o => origin.includes(o))

  const priceUsd = price * eurToUsd
  const priceKrw = price * eurToKrw

  if (priceUsd <= 150) {
    const total = Math.round(isFTA ? priceKrw * 0.33 : priceKrw * 0.683)
    return { total }
  } else {
    const total = Math.round(isFTA ? priceKrw * 0.463 : priceKrw * 0.683)
    return { total }
  }
}

export default function CheckoutPage() {
  const { config, clearCart } = useAppConfig()
  const supabase = createClient()
  const router = useRouter()

  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [showNewForm, setShowNewForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([])
  const [eurToKrw, setEurToKrw] = useState<number | null>(null)
  const [eurToUsd, setEurToUsd] = useState<number | null>(null)
  const [splitDelivery, setSplitDelivery] = useState(false)
  const [showPaymentConfirm, setShowPaymentConfirm] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null)
  const [orderLoading, setOrderLoading] = useState(false)
  const [orderError, setOrderError] = useState('')

  const emptyForm = { recipient_name: '', address: '', city: '', postal_code: '', country: 'DE', is_default: false, customs_code: '' }

  const [form, setForm] = useState({
    recipient_name: '',
    address: '',
    city: '',
    postal_code: '',
    country: 'DE',
    is_default: false,
    customs_code: '',
  })

  const items = config.cart
    .map(c => {
      const product = config.products.find(p => p.id === c.productId)
      return product ? { ...c, product } : null
    })
    .filter((item): item is { productId: number; qty: number; product: NonNullable<typeof config.products[number]> } => item !== null)

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.qty, 0)

  const selectedAddress = addresses.find(a => a.id === selectedAddressId)
  const zone = selectedAddress ? getZone(selectedAddress.country) : null

  // 배송비 데이터베이스에서
  const rateInfo = shippingRates.find(r => r.zone === zone)
  const totalQty = items.reduce((sum, item) => sum + item.qty, 0)
  // 한국 배송은 병수만큼 배송비 곱하기, 그 외는 고정 배송비
  const shippingFee = rateInfo ? (zone === 'KR' ? rateInfo.fee * totalQty : rateInfo.fee) : 0
  const splitFee = splitDelivery ? totalQty * 1 : 0
  const vat = zone === 'DE' ? subtotal * (rateInfo?.vat_rate ?? 0) : 0
  const total = subtotal + shippingFee + splitFee + vat

  useEffect(() => {
    // 배송지 불러오기
    const fetchAddresses = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })

      if (data && data.length > 0) {
        setAddresses(data)
        const defaultAddr = data.find((a: Address) => a.is_default)
        setSelectedAddressId(defaultAddr?.id ?? data[0].id)
      } else {
        setShowNewForm(true)
      }
    }

    // 배송비 불러오기
    const fetchShippingRates = async () => {
      const { data } = await supabase
        .from('shipping_rates')
        .select('*')
      if (data) setShippingRates(data)
    }

    fetchAddresses()
    fetchShippingRates()
  }, [])

    // 환율 API 연동
  useEffect(() => {
    fetch('/api/exchange-rate')
      .then(res => res.json())
      .then(data => {
        setEurToKrw(data.krw)
        setEurToUsd(data.usd)
      })
      .catch(() => setEurToKrw(1750)) // Default
  }, [])

  // 예상 원화가/관세는 상품별로 계산해서 각 아이템 아래에 표시 (아래 items.map 참고)

  const startEdit = (addr: Address) => {
    setEditingAddressId(addr.id)
    setShowNewForm(false)
    setForm({
      recipient_name: addr.recipient_name,
      address: addr.address,
      city: addr.city,
      postal_code: addr.postal_code ?? '',
      country: addr.country,
      is_default: addr.is_default,
      customs_code: addr.customs_code ?? '',
    })
  }

  const handleSaveAddress = async () => {
    if (!form.recipient_name || !form.address || !form.city) return
    if (form.country === 'KR' && !form.customs_code) return
    setSaving(true)
    setSaveError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }

    const payload = {
      ...form,
      postal_code: form.postal_code || null,
      customs_code: form.country === 'KR' ? form.customs_code : null,
    }

    if (editingAddressId) {
      // 수정
      const { data, error } = await supabase
        .from('addresses')
        .update(payload)
        .eq('id', editingAddressId)
        .eq('user_id', user.id)
        .select()
        .single()

      if (!error && data) {
        setAddresses(prev => prev.map(a => a.id === editingAddressId ? data : a))
        setEditingAddressId(null)
        setShowNewForm(false)
        setForm(emptyForm)
      } else if (error) {
        setSaveError(error.message)
      }
    } else {
      // 신규 추가
      const { data, error } = await supabase
        .from('addresses')
        .insert({ ...payload, user_id: user.id })
        .select()
        .single()

      if (!error && data) {
        setAddresses(prev => [...prev, data])
        setSelectedAddressId(data.id)
        setShowNewForm(false)
        setForm(emptyForm)
      } else if (error) {
        setSaveError(error.message)
      }
    }
    setSaving(false)
  }

  const handleDeleteAddress = async (id: string) => {
    if (deleteConfirmId !== id) {
      setDeleteConfirmId(id)
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (!error) {
      setAddresses(prev => {
        const next = prev.filter(a => a.id !== id)
        if (selectedAddressId === id) {
          setSelectedAddressId(next[0]?.id ?? null)
          if (next.length === 0) setShowNewForm(true)
        }
        return next
      })
    }
    setDeleteConfirmId(null)
  }

  if (items.length === 0) {
    return (
      <div className="bg-[#F9F4EE] min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-400 text-sm">장바구니가 비어 있습니다</p>
        <Link href="/events/wines" className="text-xs font-bold uppercase tracking-widest text-[#8B4513] hover:text-[#2C5F2D] transition-colors">
          ← 와인 목록으로
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-[#F9F4EE] min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-3">결제하기</h1>
        <div className="border-t border-gray-900 mb-10" />

        <div className="grid md:grid-cols-2 gap-10">

          {/* 왼쪽: 배송지 */}
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-700 mb-4">배송지</h2>

            {addresses.length > 0 && (
              <div className="flex flex-col gap-3 mb-4">
                {addresses.map(addr => (
                  <div key={addr.id} className={`border bg-white transition-colors ${
                    selectedAddressId === addr.id && editingAddressId !== addr.id
                      ? 'border-[#8B4513]'
                      : 'border-gray-200'
                  }`}>
                    {editingAddressId === addr.id ? (
                      /* 인라인 수정 폼 */
                      <div className="p-4 flex flex-col gap-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">수령인</label>
                            <input className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-[#8B4513]"
                              value={form.recipient_name} onChange={e => setForm(f => ({ ...f, recipient_name: e.target.value }))} />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">국가</label>
                            <select className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-[#8B4513] bg-white"
                              value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))}>
                              {COUNTRY_OPTIONS.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">도시</label>
                          <input className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-[#8B4513]"
                            value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">상세 주소</label>
                          <input className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-[#8B4513]"
                            value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">우편번호</label>
                          <input className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-[#8B4513]"
                            value={form.postal_code} onChange={e => setForm(f => ({ ...f, postal_code: e.target.value }))} placeholder="10115" />
                        </div>
                        {form.country === 'KR' && (
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">개인통관고유부호</label>
                            <input className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-[#8B4513]"
                              value={form.customs_code} onChange={e => setForm(f => ({ ...f, customs_code: e.target.value }))} placeholder="P123456789012" />
                          </div>
                        )}
                        {saveError && <p className="text-xs text-red-500">{saveError}</p>}
                        <div className="flex gap-2">
                          <button onClick={handleSaveAddress} disabled={saving}
                            className="flex-1 bg-[#8B4513] text-white text-xs font-bold uppercase tracking-widest py-2.5 hover:bg-[#2C5F2D] transition-colors disabled:opacity-50">
                            {saving ? '저장 중...' : '저장'}
                          </button>
                          <button onClick={() => { setEditingAddressId(null); setForm(emptyForm); setSaveError('') }}
                            className="flex-1 border border-gray-200 text-gray-400 text-xs font-bold uppercase tracking-widest py-2.5 hover:border-gray-400 transition-colors">
                            취소
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* 일반 표시 */
                      <div
                        onClick={() => { setSelectedAddressId(addr.id) }}
                        className="p-4 cursor-pointer flex items-start justify-between gap-3"
                      >
                        <div>
                          <p className="text-sm font-bold text-gray-900">{addr.recipient_name}</p>
                          <p className="text-sm text-gray-500 mt-1">{addr.address}, {addr.city}</p>
                          <p className="text-sm text-gray-500">{COUNTRY_OPTIONS.find(c => c.code === addr.country)?.label ?? addr.country}</p>
                          {addr.country === 'KR' && addr.customs_code && (
                            <p className="text-xs text-gray-400 mt-1">통관부호 {addr.customs_code}</p>
                          )}
                          {addr.is_default && (
                            <span className="text-[10px] font-bold text-[#8B4513] uppercase tracking-widest mt-1 inline-block">기본 배송지</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={(e) => { e.stopPropagation(); startEdit(addr) }}
                            className="text-xs px-2 py-1 text-gray-400 hover:text-gray-700 transition-colors"
                          >수정</button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteAddress(addr.id) }}
                            className={`text-xs px-2 py-1 transition-colors ${
                              deleteConfirmId === addr.id ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-red-600'
                            }`}
                          >{deleteConfirmId === addr.id ? '확인' : '삭제'}</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {!showNewForm && (
              <button
                onClick={() => { setEditingAddressId(null); setForm(emptyForm); setShowNewForm(true) }}
                className="w-full border border-dashed border-gray-300 text-gray-400 text-xs font-bold uppercase tracking-widest py-3 hover:border-gray-500 hover:text-gray-600 transition-colors"
              >
                + 새 배송지 추가
              </button>
            )}

            {showNewForm && (
              <div className="border border-gray-200 bg-white p-6 flex flex-col gap-4">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  {editingAddressId ? '배송지 수정' : '새 배송지'}
                </p>

                <div>
                  <label className="text-xs text-gray-500 mb-1 block">수령인 이름</label>
                  <input
                    className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-[#8B4513]"
                    value={form.recipient_name}
                    onChange={e => setForm(f => ({ ...f, recipient_name: e.target.value }))}
                    placeholder="홍길동"
                  />
                </div>
                
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">국가</label>
                  <select
                    className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-[#8B4513] bg-white"
                    value={form.country}
                    onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
                  >
                    {COUNTRY_OPTIONS.map(c => (
                      <option key={c.code} value={c.code}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-gray-500 mb-1 block">도시</label>
                  <input
                    className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-[#8B4513]"
                    value={form.city}
                    onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                    placeholder="Berlin"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-500 mb-1 block">상세 주소</label>
                  <input
                    className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-[#8B4513]"
                    value={form.address}
                    onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                    placeholder="Musterstraße 1"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-500 mb-1 block">우편번호</label>
                  <input
                    className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-[#8B4513]"
                    value={form.postal_code}
                    onChange={e => setForm(f => ({ ...f, postal_code: e.target.value }))}
                    placeholder="10115"
                  />
                </div>

                {/** 주소지가 한국인 경우 개인 통관부호 입력 */}
                {form.country === 'KR' && (
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">개인통관고유부호</label>
                    <input
                      className="w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-[#8B4513]"
                      value={form.customs_code}
                      onChange={e => setForm(f => ({ ...f, customs_code: e.target.value }))}
                      placeholder="P123456789012"
                    />
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_default"
                    checked={form.is_default}
                    onChange={e => setForm(f => ({ ...f, is_default: e.target.checked }))}
                  />
                  <label htmlFor="is_default" className="text-xs text-gray-500">기본 배송지로 저장</label>
                </div>

                {saveError && (
                  <p className="text-xs text-red-500">{saveError}</p>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={handleSaveAddress}
                    disabled={saving}
                    className="flex-1 bg-[#8B4513] text-white text-xs font-bold uppercase tracking-widest py-3 hover:bg-[#2C5F2D] transition-colors disabled:opacity-50"
                  >
                    {saving ? '저장 중...' : '저장'}
                  </button>
                  {addresses.length > 0 && (
                    <button
                      onClick={() => { setShowNewForm(false); setEditingAddressId(null); setForm(emptyForm); setSaveError('') }}
                      className="flex-1 border border-gray-200 text-gray-400 text-xs font-bold uppercase tracking-widest py-3 hover:border-gray-400 transition-colors"
                    >
                      취소
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 오른쪽: 주문 요약 */}
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-700 mb-4">주문 요약</h2>

            <div className="border border-gray-200 divide-y divide-gray-200 bg-white">
              {items.map(({ productId, qty, product }) => {
                const perBottleKrw = eurToKrw ? product.price * eurToKrw : null
                const perBottleDuty = (eurToKrw && eurToUsd)
                  ? calcDuty(product.price, eurToKrw, eurToUsd, product.origin).total
                  : null
                return (
                  <div key={productId} className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 flex items-center justify-center bg-gray-50 overflow-hidden shrink-0">
                        {product.imageUrl
                          ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                          : <span className="text-xl select-none">🍷</span>
                        }
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-600 mt-0.5">수량 {qty}개</p>
                      </div>
                      <p className="text-sm font-black text-gray-900 whitespace-nowrap">
                        €{(product.price * qty).toLocaleString()}
                      </p>
                    </div>

                    {zone === 'KR' && (
                      <div className="mt-2 flex flex-col gap-0.5 items-end">
                        <p className="text-xs text-[#0e3719]">
                          1병 예상 원화가 {perBottleKrw ? `₩${Math.round(perBottleKrw).toLocaleString()}` : '로딩중'}
                        </p>
                        <p className="text-xs text-[#0e3719]">
                          1병 예상 관세 {perBottleDuty !== null ? `₩${perBottleDuty.toLocaleString()}` : '계산중'}
                        </p>
                        <p className="text-xs text-[#0e3719] mt-0.5">※ 통관 관세가 별도로 부과됩니다</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* 요금 내역 */}
            <div className="border border-t-0 border-gray-200 bg-white p-5 flex flex-col gap-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">상품 금액</span>
                <span className="text-gray-900 font-medium">€{subtotal.toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-500">배송비</span>
                <span className="text-gray-900 font-medium">
                  {zone
                    ? `€${shippingFee}`
                    : <span className="text-gray-300">배송지 선택 후 계산</span>
                  }
                </span>
              </div>

              {/* 분할배송 요청 (배송지가 한국일 경우에만)*/}
              {zone === 'KR' && (
                <div className="flex items-start gap-3 pl-1">
                <input
                  type="checkbox"
                  id="split_delivery"
                  checked={splitDelivery}
                  onChange={e => setSplitDelivery(e.target.checked)}
                  className="mt-0.5 cursor-pointer"
                />
                <label htmlFor="split_delivery" className="text-sm text-gray-600 cursor-pointer">
                  분할배송 요청
                  <span className="block text-xs text-gray-400 mt-0.5">병당 €1 추가 · 총 €{totalQty} 추가</span>
                </label>
              </div>
              )}

              {zone === 'DE' && vat > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">부가세 (VAT {((rateInfo?.vat_rate ?? 0) * 100).toFixed(0)}%)</span>
                  <span className="text-gray-900 font-medium">€{vat.toFixed(2)}</span>
                </div>
              )}

              {splitDelivery && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">분할배송비 ({totalQty}병 × €1)</span>
                  <span className="text-gray-900 font-medium">€{splitFee}</span>
                </div>
              )}

              <div className="flex justify-between font-black text-gray-900 text-2xl border-t border-gray-100 pt-3">
                <span>총 결제금액</span>
                <span>€{total.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>

              {zone === 'KR' && eurToKrw && (
                <div className="flex justify-between text-sm text-gray-500">
                  <span>총 예상 원화가</span>
                  <span className="font-bold">₩{Math.round(total * eurToKrw).toLocaleString()}</span>
                </div>
              )}

              {zone === 'KR' && eurToKrw && (
                <div className="flex justify-between text-xs text-gray-400">
                  <span>기준 환율</span>
                  <span>1€ = ₩{eurToKrw.toLocaleString('ko-KR', { maximumFractionDigits: 0 })}</span>
                </div>
              )}
            </div>
            <Link
              href="/cart"
              className="block w-full text-center text-xs font-bold uppercase tracking-widest text-[#0e3719] hover:opacity-70 transition-opacity py-1 mt-3"
            >
              ← 장바구니로 돌아가기
            </Link>
            <button
              disabled={!selectedAddressId}
              onClick={() => selectedAddressId && setShowPaymentConfirm(true)}
              className="w-full mt-3 bg-[#8B4513] hover:bg-[#2C5F2D] text-white text-sm font-bold uppercase tracking-widest py-4 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {selectedAddressId ? '결제 진행' : '배송지를 선택해주세요'}
              </button>
            
          </div>

        </div>
      </div>

      {/* 결제 전 관세로 인한 환불불가 안내창 */}
      {showPaymentConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowPaymentConfirm(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-8">
            <h3 className="text-lg font-black text-gray-900 mb-3">결제 전 안내</h3>
            <p className="text-sm font-bold text-gray-800 mb-2">통관 관세로 인한 환불 불가</p>
            <p className="text-xs text-gray-400 leading-relaxed mb-8">
              해외 직배송 상품 특성상 통관 과정에서 발생하는 관세 및 부가세는 구매자 부담이며, 이로 인한 반품 및 환불은 불가합니다.
            </p>
            {orderError && (
              <p className="text-red-500 text-xs mb-3">{orderError}</p>
            )}
            <div className="flex flex-col gap-2">
              <button
                disabled={orderLoading}
                onClick={async () => {
                  setOrderLoading(true)
                  setOrderError('')
                  try {
                    const orderItems = items.map(i => ({
                      productId: i.productId,
                      name: i.product.name,
                      qty: i.qty,
                      price_eur: i.product.price,
                    }))
                    const dutyTotal = zone === 'KR' && eurToKrw && eurToUsd
                      ? items.reduce((sum, i) => {
                          const d = calcDuty(i.product.price * i.qty, eurToKrw, eurToUsd, i.product.origin ?? '')
                          return sum + d.total
                        }, 0)
                      : 0
                    const res = await fetch('/api/orders', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        addressId: selectedAddressId,
                        items: orderItems,
                        totalEur: total,
                        shippingFeeEur: shippingFee,
                        dutyEur: dutyTotal,
                        splitDelivery,
                        splitFeeEur: splitFee,
                        memo: null,
                      }),
                    })
                    const data = await res.json()
                    if (!res.ok) {
                      setOrderError(data.error ?? '주문 처리 중 오류가 발생했습니다')
                      return
                    }
                    clearCart()
                    router.push(`/order/${data.orderId}`)
                  } catch {
                    setOrderError('주문 처리 중 오류가 발생했습니다')
                  } finally {
                    setOrderLoading(false)
                  }
                }}
                className="w-full bg-[#8B4513] hover:bg-[#2C5F2D] text-white text-xs font-bold uppercase tracking-widest py-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {orderLoading ? '처리 중...' : '확인했습니다 — 결제하기'}
              </button>
              <button
                onClick={() => setShowPaymentConfirm(false)}
                className="w-full text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-gray-700 py-3 transition-colors"
              >
                돌아가기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}