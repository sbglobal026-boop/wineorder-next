'use client'
import { useState, useMemo, useRef, useEffect } from 'react'
import { useAppConfig } from '@/context/AppConfigContext'
import { Product } from '@/data/products'
import { uploadProductImage } from '@/lib/uploadImage'
import { fetchAdminProducts, createProductRow, updateProductRow, deleteProductRow } from '@/lib/products'

type Category = Product['category']
const wineCategories: Category[] = ['레드', '화이트', '로제', '스파클링']

const emptyProduct: Omit<Product, 'id'> = {
  name: '', price: 0, EK: 0, margin: 0, type: 'wine', category: '레드', origin: '', rating: 4.5, description: '', criticRatings: '', grapeVariety: '',
}

// 가격 계산 함수
function calculatePrice(EK: number, margin: number) {
  return Math.round(EK * (1 + margin / 100))
  //return Math.round(EK * (1 + margin / 100))
}

function ProductForm({
  data,
  onChange,
  onSave,
  onCancel,
  saveLabel,
}: {
  data: Omit<Product, 'id'>
  onChange: (d: Omit<Product, 'id'>) => void
  onSave: () => void
  onCancel: () => void
  saveLabel: string
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const extraFileInputRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)]
  const [uploading, setUploading] = useState(false)
  const [uploadingExtraIndex, setUploadingExtraIndex] = useState<number | null>(null)

  const handleTypeChange = (type: 'wine' | 'food') => {
    onChange({ ...data, type, category: type === 'food' ? '식품' : '레드' })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const url = await uploadProductImage(file)
    setUploading(false)
    onChange({ ...data, imageUrl: url })
  }

  const removeImage = () => {
    onChange({ ...data, imageUrl: undefined })
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleExtraImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingExtraIndex(index)
    const url = await uploadProductImage(file)
    setUploadingExtraIndex(null)
    const extraImages = [...(data.extraImages ?? [])]
    extraImages[index] = url
    onChange({ ...data, extraImages })
  }

  const removeExtraImage = (index: number) => {
    const extraImages = [...(data.extraImages ?? [])]
    extraImages.splice(index, 1)
    onChange({ ...data, extraImages })
    if (extraFileInputRefs[index].current) extraFileInputRefs[index].current!.value = ''
  }

  // 원가 및 마진 변동 가격 자동 계산 핸들러
  // const { getTotalFixedCost } = useAppConfig()
  // const fixedTotal = getTotalFixedCost()
  const handleCostChange = (EK: number) => {
    const price = calculatePrice(EK, data.margin ?? 20)
    onChange({...data, EK, price})
  }
  const handleMarginChange = (margin: number) => {
    const price = calculatePrice(data.EK ?? onCancel, margin)
    onChange({...data, margin, price})
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

      {/* 이미지 업로드 */}
      <div className="md:col-span-3">
        <label className="block text-xs font-semibold text-gray-600 mb-2">상품 이미지</label>
        {data.imageUrl ? (
          <div className="relative w-40 h-40 rounded-xl overflow-hidden border border-gray-200">
            <img src={data.imageUrl} alt="상품 이미지" className="w-full h-full object-cover" />
            <button
              onClick={removeImage}
              className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white text-xs px-2 py-1 rounded-full transition-colors"
            >
              제거
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-40 h-40 border-2 border-dashed border-gray-200 hover:border-gray-400 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors text-gray-400 hover:text-gray-600"
          >
            {uploading ? (
              <span className="text-xs font-medium">업로드중...</span>
            ) : (
              <>
                <span className="text-3xl">+</span>
                <span className="text-xs font-medium">이미지 업로드</span>
              </>
            )}
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>

      {/* 추가 사진 (Top Drop 작은 사진 2장용) */}
      <div className="md:col-span-3">
        <label className="block text-xs font-semibold text-gray-600 mb-2">추가 사진 (최대 2장, Top Drop 섹션에 표시됨)</label>
        <div className="flex gap-3">
          {[0, 1].map((index) => {
            const url = data.extraImages?.[index]
            return (
              <div key={index}>
                {url ? (
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200">
                    <img src={url} alt={`추가 사진 ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeExtraImage(index)}
                      className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded-full transition-colors"
                    >
                      제거
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => extraFileInputRefs[index].current?.click()}
                    disabled={uploadingExtraIndex === index}
                    className="w-24 h-24 border-2 border-dashed border-gray-200 hover:border-gray-400 rounded-xl flex flex-col items-center justify-center gap-1 transition-colors text-gray-400 hover:text-gray-600"
                  >
                    {uploadingExtraIndex === index ? (
                      <span className="text-[10px] font-medium">업로드중...</span>
                    ) : (
                      <>
                        <span className="text-2xl">+</span>
                        <span className="text-[10px] font-medium">사진 {index + 1}</span>
                      </>
                    )}
                  </button>
                )}
                <input
                  ref={extraFileInputRefs[index]}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleExtraImageUpload(index, e)}
                  className="hidden"
                />
              </div>
            )
          })}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">구분</label>
        <select
          value={data.type}
          onChange={(e) => handleTypeChange(e.target.value as 'wine' | 'food')}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
        >
          <option value="wine">와인</option>
          <option value="food">식품</option>
        </select>
      </div>
      <div className="md:col-span-2">
        <label className="block text-xs font-semibold text-gray-600 mb-1">상품명 *</label>
        <input
          value={data.name}
          onChange={(e) => onChange({ ...data, name: e.target.value })}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
          placeholder="예: 샤또 마고 2018"
        />
      </div>
      {data.type === 'wine' && (
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">카테고리</label>
          <select
            value={data.category}
            onChange={(e) => onChange({ ...data, category: e.target.value as Category })}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
          >
            {wineCategories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      )}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">원산지</label>
        <input
          value={data.origin}
          onChange={(e) => onChange({ ...data, origin: e.target.value })}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
          placeholder="예: 프랑스"
        />
      </div>
      {/* 원가 추가 */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">원가 (유로) *</label>
        <input
          type="number"
          value={data.EK || ''}
          onChange={(e)=>handleCostChange(Number(e.target.value))}
          //onChange={(e) => onChange({ ...data, price: Number(e.target.value) })}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
          placeholder="예: 35"
        />
      </div>
      {/* 마진 추가 */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">마진 (%) *</label>
        <input
          type="number"
          value={data.margin || ''}
          onChange={(e) => handleMarginChange(Number(e.target.value))}
          //onChange={(e) => onChange({ ...data, price: Number(e.target.value) })}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
          placeholder="예: 20"
        />
      </div>
      {/* 판매가 */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">가격 (유로) *</label>
        <input
          type="number"
          value={data.price || ''}
          readOnly
          //onChange={(e) => onChange({ ...data, price: Number(e.target.value) })}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
          //placeholder="예: "
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">별점 (0~5)</label>
        <input
          type="number"
          step="0.1"
          min="0"
          max="5"
          value={data.rating}
          onChange={(e) => onChange({ ...data, rating: Number(e.target.value) })}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">포도품종</label>
        <input
          value={data.grapeVariety ?? ''}
          onChange={(e) => onChange({ ...data, grapeVariety: e.target.value })}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
          placeholder="예: 카베르네 소비뇽"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">평가 (평론가 점수)</label>
        <input
          value={data.criticRatings ?? ''}
          onChange={(e) => onChange({ ...data, criticRatings: e.target.value })}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
          placeholder="예: RP90, JS100, FS100"
        />
      </div>
      <div className="md:col-span-3">
        <label className="block text-xs font-semibold text-gray-600 mb-1">상품 설명</label>
        <input
          value={data.description}
          onChange={(e) => onChange({ ...data, description: e.target.value })}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
          placeholder="예: 보르도의 왕이라 불리는 명품 레드와인"
        />
      </div>
      <div className="md:col-span-3 flex gap-2">
        <button onClick={onSave} className="bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold px-6 py-2 rounded-full transition-colors">
          {saveLabel}
        </button>
        <button onClick={onCancel} className="border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm px-6 py-2 rounded-full transition-colors">
          취소
        </button>
      </div>
    </div>
  )
}

/**
function FixedCostsSection() {
  const { config, addFixedCost, deleteFixedCost } = useAppConfig()
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')

  const handleAdd = () => {
    if (name.trim() && amount) {
      addFixedCost({ name: name.trim(), amount: Number(amount) })
      setName('')
      setAmount('')
    }
  }

  return (
    <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
      <p className="text-xs font-semibold text-gray-500 mb-3">고정비</p>

      <div className="flex flex-wrap gap-2 mb-3">
        {config.fixedCosts.length === 0 && (
          <span className="text-xs text-gray-400">등록된 고정비가 없습니다</span>
        )}
        {config.fixedCosts.map((cost) => (
          <span
            key={cost.id}
            className="flex items-center gap-2 text-xs font-medium bg-white border border-gray-200 rounded-full px-3 py-1.5"
          >
            {cost.name} · {cost.amount.toLocaleString()}유로
            <button
              onClick={() => deleteFixedCost(cost.id)}
              className="text-gray-300 hover:text-red-500 transition-colors"
            >
              ✕
            </button>
          </span>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="예: 항공운임"
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-gray-400 w-32"
        />
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="금액 (유로)"
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-gray-400 w-28"
        />
        <button
          onClick={handleAdd}
          className="text-xs font-semibold bg-gray-900 hover:bg-gray-700 text-white px-4 py-1.5 rounded-full transition-colors"
        >
          추가
        </button>
      </div>
    </div>
  )
}*/

export default function ProductsPanel() {
  const { config, setFeaturedWine } = useAppConfig()
  const [products, setProducts] = useState<Product[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<Product | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [addForm, setAddForm] = useState<Omit<Product, 'id'>>(emptyProduct)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

  const [searchName, setSearchName] = useState('')
  const [filterOrigin, setFilterOrigin] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'wine' | 'food'>('all')
  const [sortPrice, setSortPrice] = useState<'none' | 'asc' | 'desc'>('none')

  useEffect(() => {
    fetchAdminProducts().then(setProducts).catch(() => setProducts([]))
  }, [])

  const origins = useMemo(
    () => Array.from(new Set(products.map(p => p.origin))).sort(),
    [products]
  )

  const filtered = useMemo(() => {
    let list = products
    if (filterType !== 'all')
      list = list.filter(p => p.type === filterType)
    if (searchName.trim())
      list = list.filter(p => p.name.toLowerCase().includes(searchName.toLowerCase()))
    if (filterOrigin)
      list = list.filter(p => p.origin === filterOrigin)
    if (sortPrice === 'asc')
      list = [...list].sort((a, b) => a.price - b.price)
    else if (sortPrice === 'desc')
      list = [...list].sort((a, b) => b.price - a.price)
    return list
  }, [products, searchName, filterOrigin, filterType, sortPrice])

  const startEdit = (product: Product) => {
    setEditingId(product.id)
    setEditForm({ ...product })
    setShowAdd(false)
  }

  const saveEdit = async () => {
    if (!editForm) return
    await updateProductRow(editForm)
    setProducts(prev => prev.map(p => p.id === editForm.id ? editForm : p))
    setEditingId(null)
    setEditForm(null)
  }

  const handleAdd = async () => {
    if (addForm.name && addForm.price) {
      const created = await createProductRow(addForm)
      setProducts(prev => [...prev, created])
      setAddForm(emptyProduct)
      setShowAdd(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (deleteConfirm === id) {
      const target = products.find(p => p.id === id)
      await deleteProductRow(id, target?.imageUrl, target?.extraImages)
      setProducts(prev => prev.filter(p => p.id !== id))
      setDeleteConfirm(null)
    } else {
      setDeleteConfirm(id)
    }
  }

  const isFiltered = searchName || filterOrigin || filterType !== 'all' || sortPrice !== 'none'

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-2xl font-bold text-gray-900">상품 관리</h2>
        <button
          onClick={() => { setShowAdd(true); setEditingId(null) }}
          className="bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors"
        >
          + 새 상품 추가
        </button>
      </div>
      <p className="text-gray-500 text-sm mb-6">와인 및 식품 상품을 추가, 편집, 삭제할 수 있습니다</p>

      {showAdd && (
        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6 mb-6">
          <p className="text-sm font-semibold text-gray-700 mb-4">새 상품 추가</p>
          <ProductForm
            data={addForm}
            onChange={setAddForm}
            onSave={handleAdd}
            onCancel={() => setShowAdd(false)}
            saveLabel="추가"
          />
        </div>
      )}

      {/* 고정비 */}
      {/*<FixedCostsSection />*/}

      {/* 필터 */}
      <div className="flex flex-wrap gap-3 mb-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
        <div className="min-w-[100px]">
          <label className="block text-xs font-semibold text-gray-500 mb-1">구분</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as 'all' | 'wine' | 'food')}
            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-gray-400"
          >
            <option value="all">전체</option>
            <option value="wine">와인</option>
            <option value="food">식품</option>
          </select>
        </div>
        <div className="flex-1 min-w-[160px]">
          <label className="block text-xs font-semibold text-gray-500 mb-1">상품명</label>
          <input
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            placeholder="검색..."
            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-gray-400"
          />
        </div>
        <div className="min-w-[120px]">
          <label className="block text-xs font-semibold text-gray-500 mb-1">원산지</label>
          <select
            value={filterOrigin}
            onChange={(e) => setFilterOrigin(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-gray-400"
          >
            <option value="">전체</option>
            {origins.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div className="min-w-[120px]">
          <label className="block text-xs font-semibold text-gray-500 mb-1">가격</label>
          <select
            value={sortPrice}
            onChange={(e) => setSortPrice(e.target.value as 'none' | 'asc' | 'desc')}
            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-gray-400"
          >
            <option value="none">기본</option>
            <option value="asc">낮은순</option>
            <option value="desc">높은순</option>
          </select>
        </div>
        {isFiltered && (
          <div className="flex items-end">
            <button
              onClick={() => { setSearchName(''); setFilterOrigin(''); setFilterType('all'); setSortPrice('none') }}
              className="text-xs text-gray-400 hover:text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors"
            >
              초기화
            </button>
          </div>
        )}
      </div>

      {/* 리스트 헤더 */}
      <div className="grid grid-cols-[48px_80px_2fr_1fr_1fr_1fr_100px_auto] gap-4 px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
        <span></span>
        <span>구분</span>
        <span>상품명</span>
        <span>원산지</span>
        <span>카테고리</span>
        <span>가격</span>
        <span>Top Drop</span>
        <span></span>
      </div>

      {/* 리스트 */}
      <div className="divide-y divide-gray-100">
        {filtered.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-10">검색 결과가 없습니다</p>
        )}
        {filtered.map((product) => (
          <div key={product.id}>
            {editingId === product.id && editForm ? (
              <div className="py-4 px-4 bg-gray-50">
                <p className="text-xs text-gray-400 font-medium mb-4">편집 중: {product.name}</p>
                <ProductForm
                  data={editForm}
                  onChange={(d) => setEditForm({ ...d, id: product.id })}
                  onSave={saveEdit}
                  onCancel={() => setEditingId(null)}
                  saveLabel="저장"
                />
              </div>
            ) : (
              <div className="grid grid-cols-[48px_80px_2fr_1fr_1fr_1fr_100px_auto] gap-4 items-center px-4 py-3 hover:bg-gray-50 transition-colors">
                {/* 썸네일 */}
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0 flex items-center justify-center">
                  {product.imageUrl
                    ? <img src={product.imageUrl} alt="" className="w-full h-full object-cover" />
                    : <span className="text-lg">{product.type === 'wine' ? '🍷' : '🧀'}</span>
                  }
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full w-fit ${
                  product.type === 'wine'
                    ? 'bg-[#8B4513]/10 text-[#8B4513]'
                    : 'bg-[#2C5F2D]/10 text-[#2C5F2D]'
                }`}>
                  {product.type === 'wine' ? '와인' : '식품'}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{product.name}</p>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{product.description}</p>
                </div>
                <span className="text-sm text-gray-600">{product.origin}</span>
                <span className="text-sm text-gray-600">{product.category}</span>
                <span className="text-sm font-semibold text-gray-900">{product.price.toLocaleString()}유로</span>
                {product.id === config.featuredWineId ? (
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-full text-center">
                    ✓ Top Drop
                  </span>
                ) : (
                  <button
                    onClick={() => setFeaturedWine(product.id)}
                    className="text-xs text-gray-500 hover:text-amber-700 border border-gray-200 hover:border-amber-300 hover:bg-amber-50 px-2 py-1 rounded-full transition-colors"
                  >
                    선택
                  </button>
                )}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => startEdit(product)}
                    className="text-xs text-gray-600 hover:text-gray-900 font-medium border border-gray-200 hover:border-gray-400 px-3 py-1.5 rounded-full transition-colors"
                  >
                    편집
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                      deleteConfirm === product.id
                        ? 'bg-red-600 text-white'
                        : 'text-gray-400 hover:text-red-600 border border-gray-200 hover:border-red-200'
                    }`}
                  >
                    {deleteConfirm === product.id ? '확인?' : '삭제'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400 mt-4">{filtered.length}개 상품</p>
    </div>
  )
}
