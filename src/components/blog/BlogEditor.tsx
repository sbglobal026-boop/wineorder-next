'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { ImagePlus, Video, X, ChevronDown } from 'lucide-react'
import { uploadBlogImages, uploadBlogVideo, isVideoUrl } from '@/lib/uploadImage'
import { createBlogPost, updateBlogPost, BlogPost } from '@/lib/blog'
import { BlogCategory, categoryLabel, topLevelCategories, childCategories } from '@/lib/blogCategories'
import { hasBlogContent } from '@/lib/sanitizeHtml'
import RichTextEditor from '@/components/blog/RichTextEditor'

// 커버 위 카테고리 선택 드롭다운 — 반투명 다크 패널, 하위 카테고리는 들여쓰기
function CategoryDropdown({
  value,
  onChange,
}: {
  value: BlogCategory | null
  onChange: (v: BlogCategory) => void
}) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  // 바깥 클릭 / ESC 로 닫기
  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={wrapRef} className="relative inline-block mb-2 md:mb-3">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 text-[11px] md:text-xs font-bold text-white/70 hover:text-white uppercase tracking-widest transition-colors"
      >
        {value ? categoryLabel(value) : '카테고리 선택'}
        <ChevronDown size={14} strokeWidth={2.5} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 w-60 max-h-80 overflow-y-auto bg-white border border-gray-100 rounded-2xl shadow-2xl py-2 z-30">
          {topLevelCategories().map((parent, i) => {
            const children = childCategories(parent.value)
            return (
              <div key={parent.value} className={i > 0 ? 'border-t border-gray-100 mt-1 pt-1' : ''}>
                {/* 상위 카테고리 */}
                <button
                  type="button"
                  onClick={() => { onChange(parent.value); setOpen(false) }}
                  className={`w-full text-left px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors ${
                    value === parent.value ? 'text-gray-900 bg-gray-100' : 'text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  {parent.label}
                </button>
                {/* 하위 카테고리: 들여쓰기 + 세로 가이드라인으로 계층 표시 */}
                {children.length > 0 && (
                  <div className="ml-5 border-l-2 border-gray-100 mb-1">
                    {children.map(v => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => { onChange(v); setOpen(false) }}
                        className={`w-full text-left pl-3 pr-4 py-1.5 text-xs font-medium transition-colors ${
                          value === v
                            ? 'text-gray-900 bg-gray-100'
                            : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        {categoryLabel(v)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// 브런치 스타일 풀페이지 글쓰기/수정 에디터.
// 발행된 상세페이지와 같은 레이아웃(커버 히어로 + 본문) 위에서 직접 입력한다.
// 어드민(/admin/blog/*)과 승인 작성자(/blog/write)가 공유한다.
export default function BlogEditor({
  post,
  authorId,
  defaultAuthorName,
  fixedAuthorName = false,
  initialCategory,
  backHref,
  onSaved,
}: {
  post?: BlogPost | null            // 있으면 수정 모드, 없으면 새 글
  authorId: string | null
  defaultAuthorName: string
  fixedAuthorName?: boolean         // true면 작성자 이름 입력 불가 (승인 작성자 본인 이름 고정)
  initialCategory?: BlogCategory
  backHref: string
  onSaved: (category: BlogCategory) => void
}) {
  const [title, setTitle] = useState(post?.title ?? '')
  const [content, setContent] = useState(post?.content ?? '')
  // 새 글은 카테고리 미선택 상태로 시작 → 발행 전에 직접 고르도록 유도
  const [category, setCategory] = useState<BlogCategory | null>(post?.category ?? initialCategory ?? null)
  // 어드민 새 글은 작성자란을 비워두고 placeholder로 안내 (비우면 기본 이름으로 저장됨)
  const [authorName, setAuthorName] = useState(post?.author_name ?? (fixedAuthorName ? defaultAuthorName : ''))
  const [cover, setCover] = useState<string | null>(post?.images[0] ?? null)
  // 옛 글의 하단 갤러리 사진(images[1..]) — 새로 추가는 못 하고 삭제만 가능
  const [legacyImages, setLegacyImages] = useState<string[]>(post?.images.slice(1) ?? [])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const coverImageRef = useRef<HTMLInputElement>(null)
  const coverVideoRef = useRef<HTMLInputElement>(null)
  const titleRef = useRef<HTMLTextAreaElement>(null)

  // 제목 textarea 높이를 내용에 맞게 자동 조절
  useEffect(() => {
    const el = titleRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [title])

  const handleCoverImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploading(true)
    try {
      const [url] = await uploadBlogImages([file], authorId)
      setCover(url)
    } catch {
      setError('커버 사진 업로드에 실패했습니다')
    }
    setUploading(false)
  }

  const handleCoverVideo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setError(null)
    setUploading(true)
    try {
      const url = await uploadBlogVideo(file, authorId)
      setCover(url)
    } catch (err) {
      const message = (err && typeof err === 'object' && 'message' in err) ? String((err as { message: unknown }).message) : '동영상 업로드에 실패했습니다'
      setError(message)
    }
    setUploading(false)
  }

  const handleSave = async () => {
    setError(null)
    if (!category) { setError('카테고리를 선택하세요'); return }
    if (!title.trim()) { setError('제목을 입력하세요'); return }
    if (!hasBlogContent(content)) { setError('내용을 입력하세요'); return }
    const images = cover ? [cover, ...legacyImages] : legacyImages
    const name = authorName.trim() || defaultAuthorName
    setSaving(true)
    try {
      if (post) {
        await updateBlogPost(post.id, { title, content, images, category, author_name: name })
      } else {
        await createBlogPost({ title, content, images, category, author_id: authorId, author_name: name })
      }
      onSaved(category)
    } catch (err) {
      const message = (err && typeof err === 'object' && 'message' in err) ? String((err as { message: unknown }).message) : '저장에 실패했습니다'
      setError(message)
      setSaving(false)
    }
  }

  const coverIsVideo = cover ? isVideoUrl(cover) : false

  return (
    <div className="bg-[#F9F4EE] min-h-screen">
      {/* 상단 바: 뒤로가기 / 발행 */}
      <div className="sticky top-0 z-20 bg-[#F9F4EE]/90 backdrop-blur border-b border-[#DAD4CD]/60">
        <div className="max-w-[1640px] mx-auto px-5 md:px-10 h-14 flex items-center justify-between">
          <Link href={backHref} className="text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors">
            ← 돌아가기
          </Link>
          <div className="flex items-center gap-3">
            {error && <p className="text-xs text-red-600">{error}</p>}
            <button
              onClick={handleSave}
              disabled={saving || uploading}
              className="bg-gray-900 hover:bg-gray-700 disabled:bg-gray-400 text-white text-sm font-semibold px-6 py-2 rounded-full transition-colors"
            >
              {saving ? '저장 중...' : post ? '저장' : '발행'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1640px] mx-auto px-5 md:px-10 py-8">
        {/* 커버 히어로 (상세페이지 BlogHero와 같은 모양 — 헤더 폭, 원본 비율 — 그 위에서 직접 입력) */}
        {/* overflow-hidden 금지: 카테고리 드롭다운이 커버 밖으로 열릴 수 있어야 함 */}
        <div className="relative bg-[#8A867F] mb-8">
          {cover ? (
            coverIsVideo ? (
              <video src={cover} muted className="block w-full h-auto" />
            ) : (
              <img src={cover} alt="" className="block w-full h-auto" />
            )
          ) : (
            // 커버 없을 때 입력 영역 확보용 최소 높이
            <div className="aspect-[3/2] md:aspect-[21/9]" />
          )}
          {/* 커버 사진/동영상 버튼 (우측 상단, 흰색 아이콘 세로 정렬)
              마우스 오버 시 아이콘이 커지고 왼쪽에 기능 라벨이 나타남 */}
          <div className="absolute top-5 right-5 z-10 flex flex-col gap-5">
            <button
              onClick={() => coverImageRef.current?.click()}
              disabled={uploading}
              aria-label={cover ? '커버 사진 변경' : '커버 사진 업로드'}
              className="group relative flex items-center text-white/85 hover:text-white transition-colors drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)] disabled:opacity-40"
            >
              <span className="absolute right-full mr-3 whitespace-nowrap bg-black/70 text-white text-xs font-medium px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {cover ? '커버 사진 변경' : '커버 사진 업로드'}
              </span>
              <ImagePlus size={30} strokeWidth={1.5} className="transition-transform group-hover:scale-110" />
            </button>
            <button
              onClick={() => coverVideoRef.current?.click()}
              disabled={uploading}
              aria-label="커버 동영상 업로드"
              className="group relative flex items-center text-white/85 hover:text-white transition-colors drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)] disabled:opacity-40"
            >
              <span className="absolute right-full mr-3 whitespace-nowrap bg-black/70 text-white text-xs font-medium px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                커버 동영상 업로드
              </span>
              <Video size={30} strokeWidth={1.5} className="transition-transform group-hover:scale-110" />
            </button>
            {cover && (
              <button
                onClick={() => setCover(null)}
                aria-label="커버 제거"
                className="group relative flex items-center text-white/85 hover:text-white transition-colors drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]"
              >
                <span className="absolute right-full mr-3 whitespace-nowrap bg-black/70 text-white text-xs font-medium px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  커버 제거
                </span>
                <X size={30} strokeWidth={1.5} className="transition-transform group-hover:scale-110" />
              </button>
            )}
            {uploading && <span className="text-[10px] text-white/85 drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]">업로드중</span>}
          </div>
          <input ref={coverImageRef} type="file" accept="image/*" onChange={handleCoverImage} className="hidden" />
          <input ref={coverVideoRef} type="file" accept="video/*" onChange={handleCoverVideo} className="hidden" />

          {/* 텍스트 오버레이: 상세페이지와 같은 위치/타이포에서 직접 입력 */}
          <div className="absolute inset-x-0 bottom-0 p-6 md:p-12">
            <CategoryDropdown value={category} onChange={setCategory} />
            <textarea
              ref={titleRef}
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="제목을 입력하세요"
              rows={1}
              className="block w-full max-w-4xl resize-none bg-transparent text-2xl md:text-4xl lg:text-5xl font-black text-white leading-tight mb-3 md:mb-4 placeholder:text-white focus:outline-none [text-shadow:0_1px_12px_rgba(0,0,0,0.35)]"
            />
            {fixedAuthorName ? (
              <p className="text-xs md:text-sm text-white [text-shadow:0_1px_12px_rgba(0,0,0,0.35)]">{authorName}</p>
            ) : (
              <div>
                <input
                  value={authorName}
                  onChange={e => setAuthorName(e.target.value)}
                  placeholder="글쓴이"
                  className="bg-transparent text-xs md:text-sm text-white placeholder:text-white focus:outline-none [text-shadow:0_1px_12px_rgba(0,0,0,0.35)]"
                />
                <p className="text-[10px] text-white mt-0.5 [text-shadow:0_1px_12px_rgba(0,0,0,0.35)]">글쓴이를 입력하지 않으면 자동으로 &lsquo;{defaultAuthorName}&rsquo;로 표시됩니다</p>
              </div>
            )}
          </div>
        </div>

        {/* 본문: 상세페이지와 같은 1240 박스 전체 폭에서 편집 */}
        <div className="max-w-[1240px] mx-auto">
        <div className="w-full bg-white border border-gray-100">
          <RichTextEditor
            value={content}
            onChange={setContent}
            placeholder="내용을 입력하세요"
            onUploadImages={(files) => uploadBlogImages(files, authorId)}
          />
        </div>

        {/* 옛 글의 하단 갤러리 사진 — 삭제만 가능 (신규 추가는 본문 에디터 사용) */}
        {legacyImages.length > 0 && (
          <div className="mt-8">
            <p className="text-xs font-semibold text-gray-500 mb-1">본문 아래 갤러리 사진 (이전 방식)</p>
            <p className="text-[11px] text-gray-400 mb-3">이 사진들은 글 하단에 이어서 표시됩니다. 새 사진은 본문 에디터의 사진 기능으로 넣어주세요.</p>
            <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
              {legacyImages.map((src, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 bg-black">
                  {isVideoUrl(src)
                    ? <video src={src} muted className="w-full h-full object-cover" />
                    : <img src={src} alt="" className="w-full h-full object-cover" />
                  }
                  <button
                    onClick={() => setLegacyImages(prev => prev.filter((_, idx) => idx !== i))}
                    className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white text-xs w-5 h-5 rounded-full"
                  >×</button>
                </div>
              ))}
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
