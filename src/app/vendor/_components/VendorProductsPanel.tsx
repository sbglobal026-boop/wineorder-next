'use client'
import { useState, useEffect, useRef } from 'react'
import { Product } from '@/data/products'
import { uploadProductImage } from '@/lib/uploadImage'

type Category = Product['category']
const wineCategories: Category[] = ['레드', '화이트', '로제', '스파클링']

const emptyForm: Omit<Product, 'id'> = {
  name: '', price: 0, EK: 0, margin: 0, type: 'wine', category: '레드', origin: '', rating: 4.5,
  description: '', criticRatings: '', grapeVariety: '', volume: '', alcohol: '', stock: 0,
}

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  live: { label: '판매중', cls: 'bg-green-100 text-green-800' },
  pending: { label: '검수 대기', cls: 'bg-yellow-100 text-yellow-800' },
}

type VendorProduct = Product & { approval_status?: string }

export default function VendorProductsPanel() {
  const [products, setProducts] = useState<VendorProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | 'new' | null>(null)
  const [form, setForm] = useState<Omit<Product, 'id'>>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  // loading은 초기값 true로 시작 → 이펙트 안에서 동기적으로 다시 true를 세팅하지 않음 (react-hooks/set-state-in-effect 회피)
  const load = () => {
    fetch('/api/vendor/products')
      .then(res => res.json())
      .then(data => setProducts(Array.isArray(data) ? data.map(rowToProductLike) : []))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const startNew = () => {
    setForm(emptyForm)
    setEditingId('new')
    setError('')
  }

  const startEdit = (p: VendorProduct) => {
    setForm({ ...p })
    setEditingId(p.id)
    setError('')
  }

  const handleSave = async () => {
    if (!form.name.trim() || form.price <= 0) {
      setError('상품명과 가격을 입력해주세요')
      return
    }
    setSaving(true)
    setError('')
    try {
      const url = editingId === 'new' ? '/api/vendor/products' : `/api/vendor/products/${editingId}`
      const method = editingId === 'new' ? 'POST' : 'PUT'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? '저장 중 오류가 발생했습니다')
        return
      }
      setEditingId(null)
      load()
    } catch {
      setError('저장 중 오류가 발생했습니다')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (deleteConfirm !== id) {
      setDeleteConfirm(id)
      return
    }
    await fetch(`/api/vendor/products/${id}`, { method: 'DELETE' })
    setDeleteConfirm(null)
    load()
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadProductImage(file)
      setForm(f => ({ ...f, imageUrl: url }))
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">내 상품</h2>
        {editingId === null && (
          <button
            onClick={startNew}
            className="text-xs font-semibold px-4 py-2 rounded-full bg-gray-900 text-white hover:bg-gray-700 transition-colors cursor-pointer"
          >
            + 상품 등록
          </button>
        )}
      </div>

      {editingId !== null ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 max-w-xl">
          <h3 className="font-semibold text-gray-900 mb-4">{editingId === 'new' ? '새 상품 등록' : '상품 수정'}</h3>

          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              {(['wine', 'food'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setForm(f => ({ ...f, type: t, category: t === 'food' ? '식품' : '레드' }))}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
                    form.type === t ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {t === 'wine' ? '와인' : '식품'}
                </button>
              ))}
            </div>

            {form.type === 'wine' && (
              <div className="flex gap-2 flex-wrap">
                {wineCategories.map(c => (
                  <button
                    key={c}
                    onClick={() => setForm(f => ({ ...f, category: c }))}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
                      form.category === c ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}

            <input
              type="text" placeholder="상품명" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">판매가 (€)</label>
                <input
                  type="number" value={form.price}
                  onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">재고</label>
                <input
                  type="number" value={form.stock}
                  onChange={e => setForm(f => ({ ...f, stock: Number(e.target.value) }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>
            <input
              type="text" placeholder="원산지" value={form.origin}
              onChange={e => setForm(f => ({ ...f, origin: e.target.value }))}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
            <input
              type="text" placeholder="포도품종 (선택)" value={form.grapeVariety ?? ''}
              onChange={e => setForm(f => ({ ...f, grapeVariety: e.target.value }))}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text" placeholder="용량 (예: 750ml)" value={form.volume ?? ''}
                onChange={e => setForm(f => ({ ...f, volume: e.target.value }))}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
              <input
                type="text" placeholder="알코올 (예: 13.5%)" value={form.alcohol ?? ''}
                onChange={e => setForm(f => ({ ...f, alcohol: e.target.value }))}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <textarea
              placeholder="상품 설명" value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none"
            />

            <div>
              <label className="text-xs text-gray-500 mb-1 block">대표 사진</label>
              <div className="flex items-center gap-3">
                {form.imageUrl && (
                  <img src={form.imageUrl} alt="" className="w-16 h-16 rounded-lg object-cover border border-gray-200" />
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="text-xs font-semibold px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {uploading ? '업로드 중...' : '사진 선택'}
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
              </div>
            </div>

            {error && <p className="text-xs text-red-600">{error}</p>}

            <div className="flex gap-2 mt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="text-xs font-semibold px-4 py-2.5 rounded-full bg-gray-900 text-white hover:bg-gray-700 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {saving ? '저장 중...' : '저장'}
              </button>
              <button
                onClick={() => setEditingId(null)}
                disabled={saving}
                className="text-xs font-semibold px-4 py-2.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
              >
                취소
              </button>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">저장하면 검수 대기 상태로 등록되고, 승인 후 공개돼요.</p>
          </div>
        </div>
      ) : loading ? (
        <p className="text-sm text-gray-400">불러오는 중...</p>
      ) : products.length === 0 ? (
        <p className="text-sm text-gray-400 py-10 text-center">등록된 상품이 없습니다</p>
      ) : (
        <div className="flex flex-col gap-2">
          {products.map(p => {
            const status = STATUS_LABEL[p.approval_status ?? 'live'] ?? STATUS_LABEL.live
            return (
              <div key={p.id} className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl px-4 py-3">
                {p.imageUrl
                  ? <img src={p.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                  : <div className="w-12 h-12 rounded-lg bg-gray-100 shrink-0" />}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                  <p className="text-xs text-gray-400">€{p.price} · 재고 {p.stock ?? 0}개</p>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${status.cls}`}>
                  {status.label}
                </span>
                <button onClick={() => startEdit(p)} className="text-xs text-gray-600 hover:text-gray-900 font-medium cursor-pointer">
                  수정
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className={`text-xs px-2.5 py-1 rounded-full transition-colors cursor-pointer ${
                    deleteConfirm === p.id ? 'bg-red-600 text-white' : 'text-red-500 hover:bg-red-50'
                  }`}
                >
                  {deleteConfirm === p.id ? '확인' : '삭제'}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// API가 돌려주는 snake_case row를 화면에서 쓰는 camelCase 필드로 가볍게 매핑
function rowToProductLike(row: Record<string, unknown>): VendorProduct {
  return {
    id: row.id as number,
    name: row.name as string,
    price: row.price as number,
    EK: row.EK as number,
    margin: row.margin as number,
    type: row.type as Product['type'],
    category: row.category as Product['category'],
    origin: (row.origin as string) ?? '',
    rating: row.rating as number,
    description: (row.description as string) ?? '',
    imageUrl: (row.image_url as string) ?? undefined,
    extraImages: (row.extra_images as string[]) ?? undefined,
    criticRatings: (row.critic_ratings as string) ?? undefined,
    grapeVariety: (row.grape_variety as string) ?? undefined,
    volume: (row.volume as string) ?? undefined,
    alcohol: (row.alcohol as string) ?? undefined,
    stock: (row.stock as number) ?? 0,
    approval_status: row.approval_status as string,
  }
}
