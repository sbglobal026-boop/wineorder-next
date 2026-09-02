'use client'
import { useEffect, useRef, useState } from 'react'
import { uploadBannerImage } from '@/lib/uploadImage'
import {
  HOME_CARD_KEYS, HOME_CARD_STATIC, HomeCardKey, HomeContent, DEFAULT_HOME_CONTENT,
  fetchHomeContent, saveHomeContent,
} from '@/lib/homeCards'

export default function HomeCardsEditor() {
  const [content, setContent] = useState<HomeContent>(DEFAULT_HOME_CONTENT)
  const [loaded, setLoaded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploadingKey, setUploadingKey] = useState<HomeCardKey | null>(null)
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({})

  useEffect(() => {
    fetchHomeContent().then(c => { setContent(c); setLoaded(true) })
  }, [])

  const setHero = (field: 'eyebrow' | 'heroTitle' | 'heroSubtitle', value: string) => {
    setContent(prev => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  const setCard = (key: HomeCardKey, field: keyof HomeContent['cards'][HomeCardKey], value: string) => {
    setContent(prev => ({ ...prev, cards: { ...prev.cards, [key]: { ...prev.cards[key], [field]: value } } }))
    setSaved(false)
  }

  const handleUpload = async (key: HomeCardKey, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingKey(key)
    try {
      const url = await uploadBannerImage(file)
      setContent(prev => ({ ...prev, cards: { ...prev.cards, [key]: { ...prev.cards[key], imageUrl: url } } }))
      setSaved(false)
    } finally {
      setUploadingKey(null)
      if (fileRefs.current[key]) fileRefs.current[key]!.value = ''
    }
  }

  const removeImage = (key: HomeCardKey) => {
    setContent(prev => ({ ...prev, cards: { ...prev.cards, [key]: { ...prev.cards[key], imageUrl: undefined } } }))
    setSaved(false)
  }

  const handleSave = async () => {
    setSaving(true)
    await saveHomeContent(content)
    setSaving(false)
    setSaved(true)
  }

  if (!loaded) return <p className="text-sm text-gray-400 py-6">불러오는 중...</p>

  const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400'

  return (
    <div className="mb-12">
      <h3 className="text-lg font-bold text-gray-900 mb-1">홈 카테고리 카드</h3>
      <p className="text-gray-500 text-sm mb-5">메인 페이지 상단 문구와 3개 카테고리 카드(사진·텍스트)를 편집합니다.</p>

      {/* 상단 문구 */}
      <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5 mb-5 flex flex-col gap-3">
        <p className="text-xs font-semibold text-gray-600">카테고리 위 문구</p>
        <div>
          <label className="block text-xs text-gray-500 mb-1">작은 문구 (eyebrow)</label>
          <input value={content.eyebrow} onChange={e => setHero('eyebrow', e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">큰 제목</label>
          <input value={content.heroTitle} onChange={e => setHero('heroTitle', e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">부제</label>
          <input value={content.heroSubtitle} onChange={e => setHero('heroSubtitle', e.target.value)} className={inputCls} />
        </div>
      </div>

      {/* 카드 3개 */}
      <div className="grid md:grid-cols-3 gap-4 mb-5">
        {HOME_CARD_KEYS.map((key) => {
          const c = content.cards[key]
          const s = HOME_CARD_STATIC[key]
          return (
            <div key={key} className="bg-gray-50 rounded-2xl border border-gray-100 p-5 flex flex-col gap-3">
              <p className="text-xs font-semibold text-gray-600">{key.toUpperCase()} 카드 <span className="text-gray-400 font-normal">→ {s.href}</span></p>

              {/* 이미지 */}
              <div className="relative aspect-square rounded-xl overflow-hidden border border-gray-200" style={{ background: s.bg }}>
                {c.imageUrl ? (
                  <img src={c.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center text-4xl">{s.emoji}</span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => fileRefs.current[key]?.click()}
                  disabled={uploadingKey === key}
                  className="flex-1 text-xs font-medium text-gray-700 border border-gray-200 hover:border-gray-400 rounded-full px-3 py-1.5 transition-colors disabled:opacity-50"
                >
                  {uploadingKey === key ? '업로드중...' : c.imageUrl ? '사진 변경' : '사진 업로드'}
                </button>
                {c.imageUrl && (
                  <button onClick={() => removeImage(key)} className="text-xs text-gray-400 hover:text-red-600 border border-gray-200 rounded-full px-3 py-1.5 transition-colors">제거</button>
                )}
              </div>
              <input ref={el => { fileRefs.current[key] = el }} type="file" accept="image/*" onChange={e => handleUpload(key, e)} className="hidden" />

              {/* 텍스트 */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">라벨</label>
                <input value={c.label} onChange={e => setCard(key, 'label', e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">제목</label>
                <input value={c.title} onChange={e => setCard(key, 'title', e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">설명</label>
                <input value={c.desc} onChange={e => setCard(key, 'desc', e.target.value)} className={inputCls} />
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-gray-900 hover:bg-gray-700 disabled:bg-gray-400 text-white text-sm font-semibold px-6 py-2.5 rounded-full transition-colors"
        >
          {saving ? '저장 중...' : '홈 카드 저장'}
        </button>
        {saved && <span className="text-sm text-green-600">저장되었습니다 ✓</span>}
      </div>
    </div>
  )
}
