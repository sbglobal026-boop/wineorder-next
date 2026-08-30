'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useAppConfig } from '@/context/AppConfigContext'
import { fetchMyOrders, MyOrder, ORDER_STATUS_LABEL } from '@/lib/orders'
import { fetchMyReviews, deleteReview, ProductReview } from '@/lib/reviews'
import { fetchWishlist, removeFromWishlist } from '@/lib/wishlist'
import ProductGridCard from '@/components/product/ProductGridCard'
import {
  fetchMyAddresses, saveAddress, deleteAddress, setDefaultAddress,
  Address, AddressInput, COUNTRY_OPTIONS, countryLabel,
} from '@/lib/addresses'

type Tab = 'orders' | 'wishlist' | 'addresses' | 'reviews' | 'profile'
const TABS: { id: Tab; label: string }[] = [
  { id: 'orders', label: '주문 내역' },
  { id: 'wishlist', label: '위시리스트' },
  { id: 'addresses', label: '배송지 관리' },
  { id: 'reviews', label: '내 리뷰' },
  { id: 'profile', label: '회원 정보' },
]

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
}

const cardCls = 'rounded-[24px] border border-[#eae7e7] bg-[#FFFFFF] p-6'

export default function MyPage() {
  const { currentUser, loading, logout } = useAuth()
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('orders')

  useEffect(() => {
    if (!loading && currentUser === null) router.replace('/login?redirect=/mypage')
  }, [loading, currentUser, router])

  if (!currentUser) return <div className="min-h-screen" style={{ background: 'radial-gradient(120% 90% at 15% 0%, #FFFFFF 0%, #FFFFFF 55%)' }} />

  return (
    <div className="min-h-screen" style={{ background: 'radial-gradient(120% 90% at 15% 0%, #FFFFFF 0%, #FFFFFF 55%)' }}>
      <header className="max-w-[760px] mx-auto text-center px-5 pt-16 md:pt-20 pb-8">
        <p className="text-[13px] tracking-[0.28em] uppercase text-[#0e3719] mb-3.5">My Page</p>
        <h1 className="font-[family-name:var(--font-playfair-display)] font-medium text-[34px] md:text-[46px] leading-[1.1] text-[#1C1A17]">
          안녕하세요, {currentUser.name}님
        </h1>
      </header>

      <div className="max-w-[1240px] mx-auto px-5 pb-20 grid md:grid-cols-[220px_1fr] gap-6 md:gap-8 items-start">
        {/* 좌측 탭 사이드바 */}
        <aside className="min-w-0 rounded-[24px] border border-[#eae7e7] bg-[#FFFFFF] p-4 md:sticky md:top-[90px]">
          <div className="px-2 py-3 mb-2 border-b border-[#eae7e7]">
            <p className="text-sm font-semibold text-[#1C1A17] truncate">{currentUser.name}</p>
            <p className="text-xs text-[#9b9797] truncate">{currentUser.email}</p>
          </div>
          <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`text-left whitespace-nowrap text-sm rounded-xl px-3 py-2.5 transition-colors ${
                  tab === t.id ? 'bg-[#0e3719]/[0.08] text-[#0e3719] font-semibold' : 'text-[#605d5d] hover:bg-[#0e3719]/[0.04]'
                }`}
              >
                {t.label}
              </button>
            ))}
            <button
              onClick={() => { logout(); router.push('/') }}
              className="text-left whitespace-nowrap text-sm rounded-xl px-3 py-2.5 text-[#bab6b6] hover:text-[#0e3719] transition-colors"
            >
              로그아웃
            </button>
          </nav>
        </aside>

        {/* 우측 콘텐츠 */}
        <div className="min-w-0">
          {tab === 'orders' && <OrdersPanel userId={currentUser.id} />}
          {tab === 'wishlist' && <WishlistPanel userId={currentUser.id} />}
          {tab === 'addresses' && <AddressesPanel userId={currentUser.id} />}
          {tab === 'reviews' && <ReviewsPanel userId={currentUser.id} />}
          {tab === 'profile' && <ProfilePanel name={currentUser.name} email={currentUser.email} />}
        </div>
      </div>
    </div>
  )
}

/* ===== 주문 내역 ===== */
function OrdersPanel({ userId }: { userId: string }) {
  const [orders, setOrders] = useState<MyOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetchMyOrders(userId)
      .then(d => setOrders(d))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [userId])

  if (loading) return <p className="text-sm text-[#9b9797] py-16 text-center">불러오는 중...</p>
  if (error) return <p className="text-sm text-red-500 py-16 text-center">주문 내역을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.</p>
  if (orders.length === 0) return (
    <div className={`${cardCls} text-center py-16`}>
      <p className="text-4xl mb-3">🍷</p>
      <p className="text-sm text-[#9b9797] mb-4">주문 내역이 없습니다</p>
      <Link href="/events/wines" className="text-xs font-bold uppercase tracking-widest text-[#0e3719] hover:underline">와인 보러가기 →</Link>
    </div>
  )

  return (
    <div className="flex flex-col gap-4">
      {orders.map(o => (
        <Link key={o.id} href={`/order/${o.id}`} className={`${cardCls} block no-underline hover:border-[#5C7A63] transition-colors`}>
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-[11px] font-medium text-[#0e3719] bg-[#0e3719]/10 border border-[#5C7A63]/40 rounded-full px-2.5 py-0.5 shrink-0">
                {ORDER_STATUS_LABEL[o.status] ?? o.status}
              </span>
              <span className="text-xs text-[#9b9797] shrink-0">{formatDate(o.created_at)}</span>
            </div>
            <span className="text-xs font-mono text-[#9b9797] shrink-0">{o.order_number ?? o.id.slice(0, 8).toUpperCase()}</span>
          </div>
          <p className="text-sm text-[#1C1A17] mb-2 truncate">
            {(o.items ?? []).map(i => `${i.name} × ${i.qty}`).join(', ') || '주문 상품'}
          </p>
          <p className="font-[family-name:var(--font-playfair-display)] text-[18px] text-[#1C1A17]">€{o.total_eur?.toLocaleString()}</p>
        </Link>
      ))}
    </div>
  )
}

/* ===== 위시리스트 ===== */
function WishlistPanel({ userId }: { userId: string }) {
  const { config } = useAppConfig()
  const [ids, setIds] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetchWishlist(userId)
      .then(d => setIds(d))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [userId])

  const products = ids.map(id => config.products.find(p => p.id === id)).filter(Boolean) as typeof config.products
  // config.products가 아직 로드 안됐을 수 있으니 로딩 판단은 ids 기준

  const handleRemove = async (id: number) => {
    await removeFromWishlist(userId, id)
    setIds(prev => prev.filter(x => x !== id))
  }

  if (loading) return <p className="text-sm text-[#9b9797] py-16 text-center">불러오는 중...</p>
  if (error) return <p className="text-sm text-red-500 py-16 text-center">위시리스트를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.</p>
  if (ids.length === 0) return (
    <div className={`${cardCls} text-center py-16`}>
      <p className="text-4xl mb-3">🤍</p>
      <p className="text-sm text-[#9b9797] mb-4">위시리스트가 비어 있습니다</p>
      <Link href="/events/wines" className="text-xs font-bold uppercase tracking-widest text-[#0e3719] hover:underline">와인 담으러 가기 →</Link>
    </div>
  )

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
      {products.map(p => (
        <div key={p.id} className="relative">
          <button
            onClick={() => handleRemove(p.id)}
            aria-label="위시리스트에서 제거"
            className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/85 hover:bg-white text-[#0e3719] flex items-center justify-center shadow-sm transition-colors"
          >♥</button>
          <ProductGridCard product={p} />
        </div>
      ))}
    </div>
  )
}

/* ===== 내 리뷰 ===== */
function ReviewsPanel({ userId }: { userId: string }) {
  const { config } = useAppConfig()
  const [reviews, setReviews] = useState<ProductReview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    fetchMyReviews(userId)
      .then(d => setReviews(d))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [userId])

  const productName = (id: number) => config.products.find(p => p.id === id)?.name ?? `상품 #${id}`

  const handleDelete = async (id: number) => {
    setDeleteError('')
    try {
      await deleteReview(id, userId)
      setReviews(prev => prev.filter(r => r.id !== id))
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : '리뷰 삭제에 실패했습니다')
    }
  }

  if (loading) return <p className="text-sm text-[#9b9797] py-16 text-center">불러오는 중...</p>
  if (error) return <p className="text-sm text-red-500 py-16 text-center">리뷰를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.</p>
  if (reviews.length === 0) return (
    <div className={`${cardCls} text-center py-16`}>
      <p className="text-sm text-[#9b9797]">작성한 리뷰가 없습니다</p>
    </div>
  )

  return (
    <div className="flex flex-col gap-4">
      {deleteError && <p className="text-xs text-red-500">{deleteError}</p>}
      {reviews.map(r => (
        <div key={r.id} className={cardCls}>
          <div className="flex items-start justify-between gap-3 mb-1.5">
            <Link href={`/events/wines/${r.product_id}`} className="text-sm font-semibold text-[#1C1A17] hover:text-[#0e3719] transition-colors no-underline">
              {productName(r.product_id)}
            </Link>
            <button onClick={() => handleDelete(r.id)} className="text-xs text-[#bab6b6] hover:text-[#0e3719] transition-colors shrink-0">삭제</button>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[#5C7A63] text-sm">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
            <span className="text-xs text-[#9b9797]">{formatDate(r.created_at)}</span>
          </div>
          <p className="text-sm text-[#605d5d] leading-relaxed">{r.comment}</p>
        </div>
      ))}
    </div>
  )
}

/* ===== 회원 정보 ===== */
function ProfilePanel({ name, email }: { name: string; email: string }) {
  return (
    <div className={cardCls}>
      <h3 className="font-[family-name:var(--font-playfair-display)] text-[22px] text-[#1C1A17] mb-5">회원 정보</h3>
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-xs text-[#9b9797] mb-1">이름</p>
          <p className="text-sm text-[#1C1A17]">{name}</p>
        </div>
        <div className="pt-4 border-t border-[#eae7e7]">
          <p className="text-xs text-[#9b9797] mb-1">이메일</p>
          <p className="text-sm text-[#1C1A17]">{email}</p>
        </div>
      </div>
      <p className="text-xs text-[#9b9797] mt-6">회원 정보 수정·비밀번호 변경은 추후 제공됩니다.</p>
    </div>
  )
}

/* ===== 배송지 관리 ===== */
const emptyAddr: AddressInput = { recipient_name: '', address: '', city: '', postal_code: '', country: 'DE', is_default: false, customs_code: '' }

function AddressesPanel({ userId }: { userId: string }) {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<AddressInput>(emptyAddr)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const load = () => fetchMyAddresses(userId).then(d => { setAddresses(d); setLoading(false) })
  useEffect(() => { load() }, [userId])

  const startAdd = () => { setForm(emptyAddr); setEditingId(null); setShowForm(true); setError('') }
  const startEdit = (a: Address) => {
    setForm({ recipient_name: a.recipient_name, address: a.address, city: a.city, postal_code: a.postal_code ?? '', country: a.country, is_default: a.is_default, customs_code: a.customs_code ?? '' })
    setEditingId(a.id); setShowForm(true); setError('')
  }

  const save = async () => {
    if (!form.recipient_name || !form.address || !form.city) { setError('필수 항목을 입력해주세요'); return }
    setSaving(true)
    try {
      await saveAddress(userId, form, editingId ?? undefined)
      setShowForm(false); setEditingId(null); setForm(emptyAddr)
      await load()
    } catch { setError('저장에 실패했습니다') }
    setSaving(false)
  }

  const remove = async (id: string) => {
    if (deleteConfirm === id) { await deleteAddress(id, userId); setDeleteConfirm(null); await load() }
    else setDeleteConfirm(id)
  }

  const makeDefault = async (id: string) => { await setDefaultAddress(id, userId); await load() }

  const inputCls = 'w-full rounded-xl border border-[#eae7e7] bg-white px-3 py-2 text-sm focus:outline-none focus:border-[#5C7A63] transition-colors'

  if (loading) return <p className="text-sm text-[#9b9797] py-16 text-center">불러오는 중...</p>

  return (
    <div className="flex flex-col gap-4">
      {addresses.map(a => (
        <div key={a.id} className={`${cardCls} ${a.is_default ? 'border-[#5C7A63]' : ''}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-semibold text-[#1C1A17]">{a.recipient_name}</p>
                {a.is_default && <span className="text-[10px] font-bold text-[#0e3719] border border-[#5C7A63] rounded-full px-2 py-0.5">기본</span>}
              </div>
              <p className="text-sm text-[#605d5d]">{a.address}, {a.city}</p>
              <p className="text-sm text-[#9b9797]">{countryLabel(a.country)}{a.postal_code ? ` · ${a.postal_code}` : ''}</p>
              {a.country === 'KR' && a.customs_code && <p className="text-xs text-[#9b9797] mt-1">통관부호 {a.customs_code}</p>}
            </div>
            <div className="flex flex-col items-end gap-1.5 shrink-0 text-xs">
              {!a.is_default && <button onClick={() => makeDefault(a.id)} className="text-[#0e3719] hover:underline">기본 지정</button>}
              <button onClick={() => startEdit(a)} className="text-[#605d5d] hover:text-[#0e3719]">수정</button>
              <button onClick={() => remove(a.id)} className={deleteConfirm === a.id ? 'text-red-600 font-semibold' : 'text-[#bab6b6] hover:text-[#0e3719]'}>{deleteConfirm === a.id ? '확인?' : '삭제'}</button>
            </div>
          </div>
        </div>
      ))}

      {showForm ? (
        <div className={`${cardCls} flex flex-col gap-3`}>
          <p className="text-sm font-semibold text-[#1C1A17]">{editingId ? '배송지 수정' : '새 배송지'}</p>
          <div className="grid grid-cols-2 gap-3">
            <input className={inputCls} placeholder="받는 분" value={form.recipient_name} onChange={e => setForm(f => ({ ...f, recipient_name: e.target.value }))} />
            <select className={inputCls} value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))}>
              {COUNTRY_OPTIONS.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
            </select>
          </div>
          <input className={inputCls} placeholder="도시" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
          <input className={inputCls} placeholder="상세 주소" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
          <input className={inputCls} placeholder="우편번호" value={form.postal_code ?? ''} onChange={e => setForm(f => ({ ...f, postal_code: e.target.value }))} />
          {form.country === 'KR' && (
            <input className={inputCls} placeholder="개인통관고유부호 (P로 시작)" value={form.customs_code ?? ''} onChange={e => setForm(f => ({ ...f, customs_code: e.target.value }))} />
          )}
          <label className="flex items-center gap-2 text-sm text-[#605d5d] cursor-pointer">
            <input type="checkbox" checked={form.is_default} onChange={e => setForm(f => ({ ...f, is_default: e.target.checked }))} className="accent-[#0e3719]" />
            기본 배송지로 설정
          </label>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button onClick={save} disabled={saving} className="rounded-full bg-[#0e3719] hover:bg-[#22301C] text-white text-sm font-semibold px-6 py-2 transition-colors disabled:opacity-50">{saving ? '저장 중...' : '저장'}</button>
            <button onClick={() => { setShowForm(false); setEditingId(null) }} className="rounded-full border border-[#d7d3d3] text-[#605d5d] hover:border-[#5C7A63] text-sm px-6 py-2 transition-colors">취소</button>
          </div>
        </div>
      ) : (
        <button onClick={startAdd} className="rounded-[24px] border border-dashed border-[#d7d3d3] text-[#9b9797] hover:border-[#5C7A63] hover:text-[#0e3719] text-sm font-medium py-4 transition-colors">
          + 새 배송지 추가
        </button>
      )}
    </div>
  )
}
