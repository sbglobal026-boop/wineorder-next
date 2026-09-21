'use client'
import { useEffect, useRef, useState } from 'react'
import {
  fetchAdminWineries, createWinery, updateWinery, deleteWinery,
  slugify, type Winery, type WineryInput,
} from '@/lib/wineries'
import { uploadImage } from '@/lib/uploadImage'

// 와이너리(생산자) 관리 — 여기서 등록한 와이너리를 상품 편집 화면에서 고르고, /events/winery 페이지에 표시됨
const emptyForm: WineryInput = { slug: '', name: '', country: '', region: '', description: '', image_url: null }

const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400'

export default function WineriesPanel() {
  const [wineries, setWineries] = useState<Winery[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  // 폼: null = 닫힘, 'new' = 새 와이너리, 그 외 = 수정 중인 id
  const [formTarget, setFormTarget] = useState<number | 'new' | null>(null)
  const [form, setForm] = useState<WineryInput>(emptyForm)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const [rowError, setRowError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const load = async () => {
    try {
      setWineries(await fetchAdminWineries())
      setLoadError('')
    } catch {
      setLoadError('와이너리 목록을 불러오지 못했습니다')
    }
    setLoading(false)
  }

  useEffect(() => {
    let ignore = false
    fetchAdminWineries()
      .then(list => { if (!ignore) { setWineries(list); setLoading(false) } })
      .catch(() => { if (!ignore) { setLoadError('와이너리 목록을 불러오지 못했습니다'); setLoading(false) } })
    return () => { ignore = true }
  }, [])

  const openNew = () => { setFormTarget('new'); setForm(emptyForm); setFormError('') }

  const openEdit = (w: Winery) => {
    setFormTarget(w.id)
    setForm({ slug: w.slug, name: w.name, country: w.country, region: w.region, description: w.description, image_url: w.image_url })
    setFormError('')
  }

  const handleImage = async (file: File | undefined) => {
    if (!file) return
    setUploading(true)
    setFormError('')
    try {
      const url = await uploadImage(file, 'banner-images', 'wineries', 1600)
      setForm(f => ({ ...f, image_url: url }))
    } catch {
      setFormError('사진을 올리지 못했습니다')
    }
    setUploading(false)
  }

  const save = async () => {
    setSaving(true)
    setFormError('')
    try {
      if (formTarget === 'new') await createWinery(form)
      else if (formTarget != null) await updateWinery(formTarget, form)
      setFormTarget(null)
      await load()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : '저장하지 못했습니다')
    }
    setSaving(false)
  }

  const handleDelete = async (w: Winery) => {
    if (deleteConfirm !== w.id) { setDeleteConfirm(w.id); return }
    setDeleteConfirm(null)
    setRowError('')
    try {
      await deleteWinery(w.id)
      await load()
    } catch (err) {
      setRowError(err instanceof Error ? err.message : '삭제하지 못했습니다')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-2xl font-bold text-gray-900">와이너리 관리</h2>
        <button
          onClick={openNew}
          className="bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors"
        >
          + 새 와이너리
        </button>
      </div>
      <p className="text-gray-500 text-sm mb-8">
        여기서 등록한 와이너리를 상품 편집 화면에서 고를 수 있고, 고객 페이지 /events/winery 에 표시됩니다.
      </p>

      {formTarget !== null && (
        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6 mb-6 max-w-2xl">
          <p className="text-sm font-semibold text-gray-700 mb-4">
            {formTarget === 'new' ? '새 와이너리 등록' : '와이너리 수정'}
          </p>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">이름 *</label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({
                    ...f,
                    name: e.target.value,
                    // 새로 등록할 때는 이름에서 주소용 영문 이름을 자동으로 만들어 줌 (직접 고칠 수 있음)
                    slug: formTarget === 'new' && (f.slug === slugify(f.name) || !f.slug) ? slugify(e.target.value) : f.slug,
                  }))}
                  className={inputCls}
                  placeholder="예: Ossian"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">주소용 영문 이름 *</label>
                <input
                  value={form.slug}
                  onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase() }))}
                  className={`${inputCls} font-mono`}
                  placeholder="ossian"
                />
                <p className="text-xs text-gray-400 mt-1">/events/winery/{form.slug || 'ossian'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">나라</label>
                <input value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} className={inputCls} placeholder="예: 스페인" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">지역</label>
                <input value={form.region} onChange={e => setForm(f => ({ ...f, region: e.target.value }))} className={inputCls} placeholder="예: 카스티야이레온, 루에다" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">소개글</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={5}
                className={`${inputCls} resize-none`}
                placeholder="와이너리 소개 — 고객 페이지의 상품 목록 아래에 표시됩니다"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">사진</label>
              <div className="flex items-center gap-3">
                {form.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.image_url} alt="" className="w-40 h-24 object-cover rounded-lg border border-gray-200" />
                ) : (
                  <div className="w-40 h-24 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center text-xs text-gray-400">사진 없음</div>
                )}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="text-xs font-semibold px-3 py-1.5 rounded-full bg-gray-900 hover:bg-gray-700 text-white transition-colors disabled:opacity-40"
                  >
                    {uploading ? '올리는 중...' : form.image_url ? '사진 변경' : '사진 올리기'}
                  </button>
                  {form.image_url && (
                    <button
                      onClick={() => setForm(f => ({ ...f, image_url: null }))}
                      className="text-xs text-gray-400 hover:text-red-600 transition-colors"
                    >
                      사진 삭제
                    </button>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => { handleImage(e.target.files?.[0]); e.target.value = '' }} />
              </div>
            </div>

            {formError && <p className="text-xs text-red-600">{formError}</p>}
            <div className="flex gap-2">
              <button onClick={save} disabled={saving} className="bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold px-6 py-2 rounded-full transition-colors disabled:opacity-40">
                {saving ? '저장 중...' : '저장'}
              </button>
              <button onClick={() => setFormTarget(null)} className="border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm px-6 py-2 rounded-full transition-colors">
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
      ) : wineries.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-16">등록된 와이너리가 없습니다</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {wineries.map(w => (
            <div key={w.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col">
              {w.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={w.image_url} alt="" className="w-full h-32 object-cover" />
              ) : (
                <div className="w-full h-32 bg-gray-50 flex items-center justify-center text-gray-300 text-2xl">🍇</div>
              )}
              <div className="p-4 flex flex-col gap-1 flex-1">
                <p className="text-sm font-bold text-gray-900">{w.name}</p>
                <p className="text-xs font-mono text-gray-400">/events/winery/{w.slug}</p>
                <p className="text-xs text-gray-500">{[w.country, w.region].filter(Boolean).join(' · ') || '지역 미입력'}</p>
                <p className="text-xs text-gray-400 line-clamp-2 mt-1">{w.description || '소개글 없음'}</p>
                <div className="flex items-center gap-2 mt-3">
                  <button onClick={() => openEdit(w)} className="text-xs border border-gray-200 hover:border-gray-400 text-gray-600 px-3 py-1.5 rounded-full transition-colors">
                    수정
                  </button>
                  <button
                    onClick={() => handleDelete(w)}
                    className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                      deleteConfirm === w.id ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-red-600 border border-gray-200 hover:border-red-200'
                    }`}
                  >
                    {deleteConfirm === w.id ? '확인?' : '삭제'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
