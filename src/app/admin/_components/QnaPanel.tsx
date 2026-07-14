'use client'
import { useEffect, useState } from 'react'
import { GripVertical } from 'lucide-react'
import { fetchQnaPosts, createQnaPost, updateQnaPost, updateQnaOrder, deleteQnaPost, QnaPost } from '@/lib/qna'

type FormState = { question: string; answer: string }
const emptyForm: FormState = { question: '', answer: '' }

export default function QnaPanel() {
  const [posts, setPosts] = useState<QnaPost[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [addForm, setAddForm] = useState<FormState>(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<FormState | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const [draggedId, setDraggedId] = useState<number | null>(null)

  const loadPosts = () => {
    setLoading(true)
    fetchQnaPosts().then(data => { setPosts(data); setLoading(false) })
  }

  useEffect(() => { loadPosts() }, [])

  const handleAdd = async () => {
    if (!addForm.question.trim() || !addForm.answer.trim()) return
    const nextOrder = posts.length > 0 ? Math.max(...posts.map(p => p.sort_order)) + 1 : 1
    await createQnaPost({ question: addForm.question.trim(), answer: addForm.answer.trim(), sort_order: nextOrder })
    setAddForm(emptyForm)
    setShowAdd(false)
    loadPosts()
  }

  const startEdit = (post: QnaPost) => {
    setEditingId(post.id)
    setEditForm({ question: post.question, answer: post.answer })
    setShowAdd(false)
  }

  const saveEdit = async () => {
    if (!editForm || editingId === null) return
    const post = posts.find(p => p.id === editingId)
    await updateQnaPost(editingId, { ...editForm, sort_order: post?.sort_order ?? 0 })
    setEditingId(null)
    setEditForm(null)
    loadPosts()
  }

  // 드래그로 지나가는 위치에 맞춰 목록을 실시간으로 재배치 (이동 중임을 바로 보여줌)
  const handleDragOver = (targetId: number) => {
    if (draggedId === null || draggedId === targetId) return
    const fromIndex = posts.findIndex(p => p.id === draggedId)
    const toIndex = posts.findIndex(p => p.id === targetId)
    if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return
    const reordered = [...posts]
    const [moved] = reordered.splice(fromIndex, 1)
    reordered.splice(toIndex, 0, moved)
    setPosts(reordered)
  }

  const handleDrop = async () => {
    if (draggedId === null) return
    setDraggedId(null)
    await Promise.all(posts.map((p, i) => updateQnaOrder(p.id, i)))
    loadPosts()
  }

  const handleDelete = async (id: number) => {
    if (deleteConfirm === id) {
      await deleteQnaPost(id)
      setDeleteConfirm(null)
      loadPosts()
    } else {
      setDeleteConfirm(id)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-2xl font-bold text-gray-900">QnA 관리</h2>
        <button
          onClick={() => { setShowAdd(true); setEditingId(null) }}
          className="bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors"
        >
          + 새 QnA 작성
        </button>
      </div>
      <p className="text-gray-500 text-sm mb-8">푸터 QnA 게시판에 표시될 질문/답변을 관리합니다</p>

      {showAdd && (
        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6 mb-6">
          <p className="text-sm font-semibold text-gray-700 mb-4">새 QnA 작성</p>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">질문 *</label>
              <input
                value={addForm.question}
                onChange={(e) => setAddForm(f => ({ ...f, question: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                placeholder="예: 주문한 와인은 언제 배송되나요?"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">답변 *</label>
              <textarea
                value={addForm.answer}
                onChange={(e) => setAddForm(f => ({ ...f, answer: e.target.value }))}
                rows={4}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400 resize-none"
                placeholder="답변 내용을 입력하세요"
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

      {loading ? (
        <p className="text-sm text-gray-400 text-center py-16">불러오는 중...</p>
      ) : posts.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-16">작성된 QnA가 없습니다</p>
      ) : (
        <div className="divide-y divide-gray-100">
          {posts.map(post => (
            <div
              key={post.id}
              className={`py-4 transition-all duration-200 ease-out ${
                draggedId === post.id ? 'opacity-40 scale-[0.98] bg-gray-50 rounded-xl' : ''
              }`}
              draggable={editingId === null}
              onDragStart={() => setDraggedId(post.id)}
              onDragOver={(e) => { e.preventDefault(); handleDragOver(post.id) }}
              onDrop={(e) => { e.preventDefault(); handleDrop() }}
              onDragEnd={() => setDraggedId(null)}
            >
              {editingId === post.id && editForm ? (
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex flex-col gap-3">
                    <input
                      value={editForm.question}
                      onChange={(e) => setEditForm(f => f ? { ...f, question: e.target.value } : f)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                    />
                    <textarea
                      value={editForm.answer}
                      onChange={(e) => setEditForm(f => f ? { ...f, answer: e.target.value } : f)}
                      rows={4}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400 resize-none"
                    />
                    <div className="flex gap-2">
                      <button onClick={saveEdit} className="bg-gray-900 hover:bg-gray-700 text-white text-xs font-semibold px-5 py-2 rounded-full transition-colors">
                        저장
                      </button>
                      <button onClick={() => setEditingId(null)} className="border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs px-5 py-2 rounded-full transition-colors">
                        취소
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-4">
                  <GripVertical size={16} strokeWidth={2} className="text-gray-300 shrink-0 mt-1 cursor-grab active:cursor-grabbing" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">Q. {post.question}</p>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-1">A. {post.answer}</p>
                  </div>
                  <button
                    onClick={() => startEdit(post)}
                    className="text-xs text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-gray-400 px-4 py-1.5 rounded-full transition-colors font-medium shrink-0"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className={`text-xs px-3 py-1.5 rounded-full transition-colors shrink-0 ${
                      deleteConfirm === post.id
                        ? 'bg-red-600 text-white'
                        : 'text-gray-400 hover:text-red-600 border border-gray-200 hover:border-red-200'
                    }`}
                  >
                    {deleteConfirm === post.id ? '확인?' : '삭제'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
