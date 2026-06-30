'use client'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { uploadBlogImages } from '@/lib/uploadImage'
import { fetchBlogPosts, createBlogPost, updateBlogPost, deleteBlogPost, BlogPost } from '@/lib/blog'
import { BLOG_CATEGORIES, BlogCategory } from '@/lib/blogCategories'
import { stripHtml } from '@/lib/sanitizeHtml'
import RichTextEditor from '@/components/blog/RichTextEditor'

const MAX_IMAGES = 10

type FormState = { title: string; content: string; images: string[]; category: BlogCategory }
const emptyForm: FormState = { title: '', content: '', images: [], category: 'wine' }

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
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
  const addFileRef = useRef<HTMLInputElement>(null)
  const editFileRef = useRef<HTMLInputElement>(null)

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

  const handleAdd = async () => {
    if (!addForm.title.trim() || !stripHtml(addForm.content)) return
    await createBlogPost({
      title: addForm.title,
      content: addForm.content,
      images: addForm.images,
      category: addForm.category,
      author_id: currentUser?.id ?? null,
      author_name: currentUser?.name ?? '관리자',
    })
    setAddForm(emptyForm)
    setShowAdd(false)
    loadPosts()
  }

  const startEdit = (post: BlogPost) => {
    setEditingId(post.id)
    setEditForm({ title: post.title, content: post.content, images: post.images, category: post.category })
    setShowAdd(false)
  }

  const saveEdit = async () => {
    if (!editForm || editingId === null) return
    await updateBlogPost(editingId, editForm)
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
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
            filter === 'all' ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-600 hover:border-gray-400'
          }`}
        >전체</button>
        {BLOG_CATEGORIES.map(c => (
          <button
            key={c.value}
            onClick={() => setFilter(c.value)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
              filter === c.value ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-600 hover:border-gray-400'
            }`}
          >{c.label}</button>
        ))}
      </div>

      {/* 글쓰기 폼 */}
      {showAdd && (
        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6 mb-6">
          <p className="text-sm font-semibold text-gray-700 mb-4">새 글 작성</p>
          <div className="flex flex-col gap-4">

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">카테고리 *</label>
              <div className="flex gap-2">
                {BLOG_CATEGORIES.map(c => (
                  <button
                    key={c.value}
                    onClick={() => setAddForm(f => ({ ...f, category: c.value }))}
                    className={`text-sm font-semibold px-4 py-2 rounded-full border transition-colors ${
                      addForm.category === c.value ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-600 hover:border-gray-400'
                    }`}
                  >{c.label}</button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">
                사진 ({addForm.images.length}/{MAX_IMAGES})
              </label>
              <div className="grid grid-cols-5 gap-3">
                {addForm.images.map((src, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200">
                    <img src={src} alt="" className="w-full h-full object-cover" />
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
              />
            </div>

            <div className="flex gap-2">
              <button onClick={handleAdd} className="bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold px-6 py-2 rounded-full transition-colors">
                발행
              </button>
              <button onClick={() => { setShowAdd(false); setAddForm(emptyForm) }} className="border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm px-6 py-2 rounded-full transition-colors">
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
                      <div className="flex gap-2">
                        {BLOG_CATEGORIES.map(c => (
                          <button
                            key={c.value}
                            onClick={() => setEditForm(f => f ? { ...f, category: c.value } : f)}
                            className={`text-sm font-semibold px-4 py-2 rounded-full border transition-colors ${
                              editForm.category === c.value ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-600 hover:border-gray-400'
                            }`}
                          >{c.label}</button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-2">
                        사진 ({editForm.images.length}/{MAX_IMAGES})
                      </label>
                      <div className="grid grid-cols-5 gap-3">
                        {editForm.images.map((src, i) => (
                          <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200">
                            <img src={src} alt="" className="w-full h-full object-cover" />
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
                    <img src={post.images[0]} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-[#fef9e4] flex items-center justify-center shrink-0">
                      <span className="text-2xl">🍷</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-400 border border-gray-200 rounded-full px-2 py-0.5">
                        {BLOG_CATEGORIES.find(c => c.value === post.category)?.label ?? post.category}
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
