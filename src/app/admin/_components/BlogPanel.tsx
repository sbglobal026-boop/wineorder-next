'use client'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { uploadBlogImages, uploadBlogVideo, isVideoUrl } from '@/lib/uploadImage'
import { fetchBlogPosts, createBlogPost, updateBlogPost, deleteBlogPost, BlogPost } from '@/lib/blog'
import { BlogCategory, BLOG_CATEGORIES, topLevelCategories, childCategories, categoryLabel } from '@/lib/blogCategories'
import { stripHtml, hasBlogContent } from '@/lib/sanitizeHtml'
import RichTextEditor from '@/components/blog/RichTextEditor'

const MAX_IMAGES = 10

type FormState = { title: string; content: string; images: string[]; category: BlogCategory; author_name: string }
const emptyForm: FormState = { title: '', content: '', images: [], category: 'wine', author_name: '' }

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
}

function CategoryButtons({
  value,
  onChange,
  size = 'md',
  allLabel,
}: {
  value: BlogCategory | 'all'
  onChange: (v: BlogCategory | 'all') => void
  size?: 'sm' | 'md'
  allLabel?: string
}) {
  const base = size === 'sm'
    ? 'text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors'
    : 'text-sm font-semibold px-4 py-2 rounded-full border transition-colors'
  const cls = (active: boolean) =>
    `${base} ${active ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`

  // 현재 선택값의 부모 카테고리 (자식이 선택된 경우)
  const selectedParent = value !== 'all'
    ? BLOG_CATEGORIES.find(c => c.value === value)?.parent
    : undefined

  // 확장할 상위 카테고리: 자식이 선택되면 그 부모, 직접 선택이면 해당 카테고리
  const expandedParent: BlogCategory | null =
    selectedParent ?? (value !== 'all' ? value : null)

  const expandedChildren = expandedParent ? childCategories(expandedParent) : []

  return (
    <div className="flex flex-col gap-2">
      {/* 상위 카테고리 */}
      <div className="flex gap-2 flex-wrap">
        {allLabel && (
          <button type="button" onClick={() => onChange('all')} className={cls(value === 'all')}>{allLabel}</button>
        )}
        {topLevelCategories().map(c => (
          <button
            key={c.value}
            type="button"
            onClick={() => onChange(c.value)}
            className={cls(value === c.value || selectedParent === c.value)}
          >
            {c.label}
            {childCategories(c.value).length > 0 && (
              <span className="ml-1 opacity-50 text-[10px]">
                {expandedParent === c.value ? '▲' : '▼'}
              </span>
            )}
          </button>
        ))}
      </div>
      {/* 선택된 상위 카테고리의 하위 카테고리 */}
      {expandedChildren.length > 0 && (
        <div className="flex gap-2 flex-wrap pl-4 border-l-2 border-gray-200">
          {expandedChildren.map(v => (
            <button key={v} type="button" onClick={() => onChange(v)} className={cls(value === v)}>
              {categoryLabel(v)}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function BlogPanel() {
  const { currentUser } = useAuth()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [addForm, setAddForm] = useState<FormState>(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<FormState | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const [uploading, setUploading] = useState(false)
  const [filter, setFilter] = useState<BlogCategory | 'all'>('all')
  const [formError, setFormError] = useState<string | null>(null)
  const addFileRef = useRef<HTMLInputElement>(null)
  const editFileRef = useRef<HTMLInputElement>(null)
  const addVideoRef = useRef<HTMLInputElement>(null)
  const editVideoRef = useRef<HTMLInputElement>(null)
  const [videoError, setVideoError] = useState<string | null>(null)

  const loadPosts = () => {
    setLoading(true)
    fetchBlogPosts().then(data => { setPosts(data); setLoading(false) })
  }

  useEffect(() => { loadPosts() }, [])

  const visiblePosts = filter === 'all' ? posts : posts.filter(p => p.category === filter)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'add' | 'edit') => {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return
    const current = target === 'add' ? addForm.images : (editForm?.images ?? [])
    const remaining = MAX_IMAGES - current.length
    setUploading(true)
    const uploaded = await uploadBlogImages(files.slice(0, remaining), currentUser?.id ?? null)
    setUploading(false)
    if (target === 'add') setAddForm(f => ({ ...f, images: [...f.images, ...uploaded] }))
    else setEditForm(f => f ? { ...f, images: [...f.images, ...uploaded] } : f)
  }

  const removeImage = (idx: number, target: 'add' | 'edit') => {
    if (target === 'add') setAddForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }))
    else setEditForm(f => f ? { ...f, images: f.images.filter((_, i) => i !== idx) } : f)
  }

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'add' | 'edit') => {
    const file = e.target.files?.[0]
    if (!file) return
    setVideoError(null)
    setUploading(true)
    try {
      const uploaded = await uploadBlogVideo(file, currentUser?.id ?? null)
      if (target === 'add') setAddForm(f => ({ ...f, images: [...f.images, uploaded] }))
      else setEditForm(f => f ? { ...f, images: [...f.images, uploaded] } : f)
    } catch (err) {
      const message = (err && typeof err === 'object' && 'message' in err) ? String((err as { message: unknown }).message) : '동영상 업로드에 실패했습니다'
      setVideoError(message)
    }
    setUploading(false)
    if (target === 'add' && addVideoRef.current) addVideoRef.current.value = ''
    if (target === 'edit' && editVideoRef.current) editVideoRef.current.value = ''
  }

  // 선택한 사진을 배열 맨 앞으로 이동시켜 대표 사진(썸네일)으로 지정
  const setThumbnail = (idx: number, target: 'add' | 'edit') => {
    const reorder = (images: string[]) => {
      const picked = images[idx]
      return [picked, ...images.filter((_, i) => i !== idx)]
    }
    if (target === 'add') setAddForm(f => ({ ...f, images: reorder(f.images) }))
    else setEditForm(f => f ? { ...f, images: reorder(f.images) } : f)
  }

  const handleAdd = async () => {
    setFormError(null)
    if (!addForm.title.trim()) { setFormError('제목을 입력하세요'); return }
    if (!hasBlogContent(addForm.content)) { setFormError('내용을 입력하세요'); return }
    try {
      await createBlogPost({
        title: addForm.title,
        content: addForm.content,
        images: addForm.images,
        category: addForm.category,
        author_id: currentUser?.id ?? null,
        author_name: addForm.author_name.trim() || '관리자',
      })
      setAddForm(emptyForm)
      setShowAdd(false)
      loadPosts()
    } catch (err) {
      const message = (err && typeof err === 'object' && 'message' in err) ? String((err as { message: unknown }).message) : '발행에 실패했습니다'
      setFormError(message)
      console.error('블로그 발행 실패:', err)
    }
  }

  const startEdit = (post: BlogPost) => {
    setEditingId(post.id)
    setEditForm({ title: post.title, content: post.content, images: post.images, category: post.category, author_name: post.author_name })
    setShowAdd(false)
  }

  const saveEdit = async () => {
    if (!editForm || editingId === null) return
    await updateBlogPost(editingId, { ...editForm, author_name: editForm.author_name.trim() || '관리자' })
    setEditingId(null)
    setEditForm(null)
    loadPosts()
  }

  const handleDelete = async (post: BlogPost) => {
    if (deleteConfirm === post.id) {
      await deleteBlogPost(post.id, post.images)
      setDeleteConfirm(null)
      loadPosts()
    } else {
      setDeleteConfirm(post.id)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-2xl font-bold text-gray-900">블로그 관리</h2>
        <button
          onClick={() => { setShowAdd(true); setEditingId(null) }}
          className="bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors"
        >
          + 새 글 작성
        </button>
      </div>
      <p className="text-gray-500 text-sm mb-4">블로그 글을 작성하고 관리합니다 (사진 최대 {MAX_IMAGES}장)</p>

      {/* 카테고리 필터 */}
      <div className="mb-6">
        <CategoryButtons value={filter} onChange={setFilter} size="sm" allLabel="전체" />
      </div>

      {/* 글쓰기 폼 */}
      {showAdd && (
        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6 mb-6">
          <p className="text-sm font-semibold text-gray-700 mb-4">새 글 작성</p>
          <div className="flex flex-col gap-4">

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">카테고리 *</label>
              <CategoryButtons
                value={addForm.category}
                onChange={(v) => { if (v !== 'all') setAddForm(f => ({ ...f, category: v })) }}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">작성자 이름</label>
              <input
                value={addForm.author_name}
                onChange={(e) => setAddForm(f => ({ ...f, author_name: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                placeholder="비워두면 '관리자'로 표시됩니다"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">
                사진 ({addForm.images.length}/{MAX_IMAGES})
              </label>
              <div className="grid grid-cols-5 gap-3">
                {addForm.images.map((src, i) => (
                  <div key={i} className="group relative aspect-square rounded-xl overflow-hidden border border-gray-200 bg-black">
                    {isVideoUrl(src)
                      ? <video src={src} muted className="w-full h-full object-cover" />
                      : <img src={src} alt="" className="w-full h-full object-cover" />
                    }
                    {isVideoUrl(src) ? (
                      <span className="absolute bottom-1 left-1 bg-gray-900/80 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">🎬 동영상</span>
                    ) : i === 0 ? (
                      <span className="absolute bottom-1 left-1 bg-gray-900/80 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">대표</span>
                    ) : (
                      <button
                        onClick={() => setThumbnail(i, 'add')}
                        className="absolute bottom-1 left-1 bg-black/60 hover:bg-black/80 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >대표로 지정</button>
                    )}
                    <button
                      onClick={() => removeImage(i, 'add')}
                      className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white text-xs w-5 h-5 rounded-full"
                    >×</button>
                  </div>
                ))}
                {addForm.images.length < MAX_IMAGES && (
                  <button
                    onClick={() => addFileRef.current?.click()}
                    disabled={uploading}
                    className="aspect-square border-2 border-dashed border-gray-200 hover:border-gray-400 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 text-2xl"
                  >{uploading ? <span className="text-xs">업로드중</span> : '+'}</button>
                )}
              </div>
              <button
                onClick={() => addVideoRef.current?.click()}
                disabled={uploading || addForm.images.length >= MAX_IMAGES}
                className="mt-2 text-xs text-gray-500 hover:text-gray-900 border border-gray-200 hover:border-gray-400 rounded-full px-3 py-1.5 transition-colors disabled:opacity-40"
              >
                🎬 동영상 추가 (최대 50MB)
              </button>
              <input ref={addVideoRef} type="file" accept="video/*" onChange={(e) => handleVideoUpload(e, 'add')} className="hidden" />
              {videoError && <p className="text-xs text-red-600 mt-1">{videoError}</p>}
              <input ref={addFileRef} type="file" accept="image/*" multiple onChange={(e) => handleImageUpload(e, 'add')} className="hidden" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">제목 *</label>
              <input
                value={addForm.title}
                onChange={(e) => setAddForm(f => ({ ...f, title: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                placeholder="글 제목을 입력하세요"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">내용 *</label>
              <RichTextEditor
                value={addForm.content}
                onChange={(html) => setAddForm(f => ({ ...f, content: html }))}
                placeholder="글 내용을 입력하세요"
                onUploadImages={(files) => uploadBlogImages(files, currentUser?.id ?? null)}
              />
            </div>

            {formError && <p className="text-sm text-red-600">{formError}</p>}
            <div className="flex gap-2">
              <button onClick={handleAdd} className="bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold px-6 py-2 rounded-full transition-colors">
                발행
              </button>
              <button onClick={() => { setShowAdd(false); setAddForm(emptyForm); setFormError(null) }} className="border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm px-6 py-2 rounded-full transition-colors">
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 글 목록 */}
      {loading ? (
        <p className="text-sm text-gray-400 text-center py-10">불러오는 중...</p>
      ) : (
        <div className="divide-y divide-gray-100">
          {visiblePosts.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-10">작성된 글이 없습니다</p>
          )}
          {visiblePosts.map((post) => (
            <div key={post.id}>
              {editingId === post.id && editForm ? (
                <div className="py-4 px-4 bg-gray-50 rounded-xl my-2">
                  <p className="text-xs text-gray-400 font-medium mb-4">편집 중: {post.title}</p>
                  <div className="flex flex-col gap-4">

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-2">카테고리</label>
                      <CategoryButtons
                        value={editForm.category}
                        onChange={(v) => { if (v !== 'all') setEditForm(f => f ? { ...f, category: v } : f) }}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">작성자 이름</label>
                      <input
                        value={editForm.author_name}
                        onChange={(e) => setEditForm(f => f ? { ...f, author_name: e.target.value } : f)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                        placeholder="비워두면 '관리자'로 표시됩니다"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-2">
                        사진 ({editForm.images.length}/{MAX_IMAGES})
                      </label>
                      <div className="grid grid-cols-5 gap-3">
                        {editForm.images.map((src, i) => (
                          <div key={i} className="group relative aspect-square rounded-xl overflow-hidden border border-gray-200 bg-black">
                            {isVideoUrl(src)
                              ? <video src={src} muted className="w-full h-full object-cover" />
                              : <img src={src} alt="" className="w-full h-full object-cover" />
                            }
                            {isVideoUrl(src) ? (
                              <span className="absolute bottom-1 left-1 bg-gray-900/80 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">🎬 동영상</span>
                            ) : i === 0 ? (
                              <span className="absolute bottom-1 left-1 bg-gray-900/80 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">대표</span>
                            ) : (
                              <button
                                onClick={() => setThumbnail(i, 'edit')}
                                className="absolute bottom-1 left-1 bg-black/60 hover:bg-black/80 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              >대표로 지정</button>
                            )}
                            <button
                              onClick={() => removeImage(i, 'edit')}
                              className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white text-xs w-5 h-5 rounded-full"
                            >×</button>
                          </div>
                        ))}
                        {editForm.images.length < MAX_IMAGES && (
                          <button
                            onClick={() => editFileRef.current?.click()}
                            disabled={uploading}
                            className="aspect-square border-2 border-dashed border-gray-200 hover:border-gray-400 rounded-xl flex items-center justify-center text-gray-400 text-2xl"
                          >{uploading ? <span className="text-xs">업로드중</span> : '+'}</button>
                        )}
                      </div>
                      <input ref={editFileRef} type="file" accept="image/*" multiple onChange={(e) => handleImageUpload(e, 'edit')} className="hidden" />
                      <button
                        onClick={() => editVideoRef.current?.click()}
                        disabled={uploading || editForm.images.length >= MAX_IMAGES}
                        className="mt-2 text-xs text-gray-500 hover:text-gray-900 border border-gray-200 hover:border-gray-400 rounded-full px-3 py-1.5 transition-colors disabled:opacity-40"
                      >
                        🎬 동영상 추가 (최대 50MB)
                      </button>
                      <input ref={editVideoRef} type="file" accept="video/*" onChange={(e) => handleVideoUpload(e, 'edit')} className="hidden" />
                      {videoError && <p className="text-xs text-red-600 mt-1">{videoError}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">제목</label>
                      <input
                        value={editForm.title}
                        onChange={(e) => setEditForm(f => f ? { ...f, title: e.target.value } : f)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">내용</label>
                      <RichTextEditor
                        value={editForm.content}
                        onChange={(html) => setEditForm(f => f ? { ...f, content: html } : f)}
                        onUploadImages={(files) => uploadBlogImages(files, currentUser?.id ?? null)}
                      />
                    </div>

                    <div className="flex gap-2">
                      <button onClick={saveEdit} className="bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold px-6 py-2 rounded-full transition-colors">저장</button>
                      <button onClick={() => setEditingId(null)} className="border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm px-6 py-2 rounded-full transition-colors">취소</button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 px-2 py-4 hover:bg-gray-50 transition-colors rounded-xl">
                  {post.images[0] ? (
                    isVideoUrl(post.images[0])
                      ? <video src={post.images[0]} muted className="w-16 h-16 rounded-xl object-cover shrink-0 bg-black" />
                      : <img src={post.images[0]} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-[#fef9e4] flex items-center justify-center shrink-0">
                      <span className="text-2xl">🍷</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-400 border border-gray-200 rounded-full px-2 py-0.5">
                        {categoryLabel(post.category)}
                      </span>
                      <p className="text-sm font-semibold text-gray-900 truncate">{post.title}</p>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(post.created_at)} · 사진 {post.images.length}장</p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">{stripHtml(post.content)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => startEdit(post)}
                      className="text-xs text-gray-600 hover:text-gray-900 font-medium border border-gray-200 hover:border-gray-400 px-3 py-1.5 rounded-full transition-colors"
                    >편집</button>
                    <button
                      onClick={() => handleDelete(post)}
                      className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                        deleteConfirm === post.id
                          ? 'bg-red-600 text-white'
                          : 'text-gray-400 hover:text-red-600 border border-gray-200 hover:border-red-200'
                      }`}
                    >{deleteConfirm === post.id ? '확인?' : '삭제'}</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <p className="text-xs text-gray-400 mt-4">{posts.length}개 글</p>
    </div>
  )
}
