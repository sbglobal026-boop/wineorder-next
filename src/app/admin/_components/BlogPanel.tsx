'use client'
import { useState, useRef } from 'react'
import { useAppConfig } from '@/context/AppConfigContext'
import { BlogPost } from '@/context/AppConfigContext'
import { compressImage } from '@/lib/compressImage'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
}

const emptyForm = { title: '', content: '', imageUrl: undefined as string | undefined }

export default function BlogPanel() {
  const { config, addBlogPost, updateBlogPost, deleteBlogPost } = useAppConfig()
  const [showAdd, setShowAdd] = useState(false)
  const [addForm, setAddForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<BlogPost | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const addFileRef = useRef<HTMLInputElement>(null)
  const editFileRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'add' | 'edit') => {
    const file = e.target.files?.[0]
    if (!file) return
    const compressed = await compressImage(file)
    if (target === 'add') setAddForm(f => ({ ...f, imageUrl: compressed }))
    else setEditForm(f => f ? { ...f, imageUrl: compressed } : f)
  }

  const handleAdd = () => {
    if (!addForm.title.trim() || !addForm.content.trim()) return
    addBlogPost(addForm)
    setAddForm(emptyForm)
    setShowAdd(false)
  }

  const startEdit = (post: BlogPost) => {
    setEditingId(post.id)
    setEditForm({ ...post })
    setShowAdd(false)
  }

  const saveEdit = () => {
    if (editForm) { updateBlogPost(editForm); setEditingId(null); setEditForm(null) }
  }

  const handleDelete = (id: number) => {
    if (deleteConfirm === id) { deleteBlogPost(id); setDeleteConfirm(null) }
    else setDeleteConfirm(id)
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
      <p className="text-gray-500 text-sm mb-6">블로그 글을 작성하고 관리합니다</p>

      {/* 글쓰기 폼 */}
      {showAdd && (
        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6 mb-6">
          <p className="text-sm font-semibold text-gray-700 mb-4">새 글 작성</p>
          <div className="flex flex-col gap-4">

            {/* 이미지 */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">대표 이미지</label>
              {addForm.imageUrl ? (
                <div className="relative w-48 h-36 rounded-xl overflow-hidden border border-gray-200">
                  <img src={addForm.imageUrl} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => { setAddForm(f => ({ ...f, imageUrl: undefined })); if (addFileRef.current) addFileRef.current.value = '' }}
                    className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white text-xs px-2 py-1 rounded-full"
                  >제거</button>
                </div>
              ) : (
                <button
                  onClick={() => addFileRef.current?.click()}
                  className="w-48 h-36 border-2 border-dashed border-gray-200 hover:border-gray-400 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors text-gray-400 hover:text-gray-600"
                >
                  <span className="text-3xl">+</span>
                  <span className="text-xs font-medium">이미지 업로드</span>
                </button>
              )}
              <input ref={addFileRef} type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'add')} className="hidden" />
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
              <textarea
                value={addForm.content}
                onChange={(e) => setAddForm(f => ({ ...f, content: e.target.value }))}
                rows={8}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400 resize-none"
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
      <div className="divide-y divide-gray-100">
        {config.blogPosts.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-10">작성된 글이 없습니다</p>
        )}
        {config.blogPosts.map((post) => (
          <div key={post.id}>
            {editingId === post.id && editForm ? (
              <div className="py-4 px-4 bg-gray-50 rounded-xl my-2">
                <p className="text-xs text-gray-400 font-medium mb-4">편집 중: {post.title}</p>
                <div className="flex flex-col gap-4">

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">대표 이미지</label>
                    {editForm.imageUrl ? (
                      <div className="relative w-48 h-36 rounded-xl overflow-hidden border border-gray-200">
                        <img src={editForm.imageUrl} alt="" className="w-full h-full object-cover" />
                        <button
                          onClick={() => { setEditForm(f => f ? { ...f, imageUrl: undefined } : f); if (editFileRef.current) editFileRef.current.value = '' }}
                          className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white text-xs px-2 py-1 rounded-full"
                        >제거</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => editFileRef.current?.click()}
                        className="w-48 h-36 border-2 border-dashed border-gray-200 hover:border-gray-400 rounded-xl flex flex-col items-center justify-center gap-2 transition-colors text-gray-400"
                      >
                        <span className="text-3xl">+</span>
                        <span className="text-xs font-medium">이미지 업로드</span>
                      </button>
                    )}
                    <input ref={editFileRef} type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'edit')} className="hidden" />
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
                    <textarea
                      value={editForm.content}
                      onChange={(e) => setEditForm(f => f ? { ...f, content: e.target.value } : f)}
                      rows={8}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400 resize-none"
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
                {post.imageUrl ? (
                  <img src={post.imageUrl} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-[#fef9e4] flex items-center justify-center shrink-0">
                    <span className="text-2xl">🍷</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{post.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(post.createdAt)}</p>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">{post.content}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => startEdit(post)}
                    className="text-xs text-gray-600 hover:text-gray-900 font-medium border border-gray-200 hover:border-gray-400 px-3 py-1.5 rounded-full transition-colors"
                  >편집</button>
                  <button
                    onClick={() => handleDelete(post.id)}
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
      <p className="text-xs text-gray-400 mt-4">{config.blogPosts.length}개 글</p>
    </div>
  )
}
