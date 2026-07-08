'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { fetchNotices, createNotice, updateNotice, deleteNotice, Notice } from '@/lib/notices'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
}

type FormState = { title: string; content: string }
const emptyForm: FormState = { title: '', content: '' }

export default function NoticesPanel() {
  const { currentUser } = useAuth()
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [addForm, setAddForm] = useState<FormState>(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<FormState | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

  const loadNotices = () => {
    setLoading(true)
    fetchNotices().then(data => { setNotices(data); setLoading(false) })
  }

  useEffect(() => { loadNotices() }, [])

  const handleAdd = async () => {
    if (!addForm.title.trim() || !addForm.content.trim()) return
    await createNotice({
      title: addForm.title.trim(),
      content: addForm.content.trim(),
      author_name: currentUser?.name ?? '관리자',
    })
    setAddForm(emptyForm)
    setShowAdd(false)
    loadNotices()
  }

  const startEdit = (notice: Notice) => {
    setEditingId(notice.id)
    setEditForm({ title: notice.title, content: notice.content })
    setShowAdd(false)
  }

  const saveEdit = async () => {
    if (!editForm || editingId === null) return
    await updateNotice(editingId, editForm)
    setEditingId(null)
    setEditForm(null)
    loadNotices()
  }

  const handleDelete = async (id: number) => {
    if (deleteConfirm === id) {
      await deleteNotice(id)
      setDeleteConfirm(null)
      loadNotices()
    } else {
      setDeleteConfirm(id)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-2xl font-bold text-gray-900">공지사항 관리</h2>
        <button
          onClick={() => { setShowAdd(true); setEditingId(null) }}
          className="bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors"
        >
          + 새 공지 작성
        </button>
      </div>
      <p className="text-gray-500 text-sm mb-8">사이트 상단 및 공지사항 페이지에 표시될 공지를 관리합니다</p>

      {showAdd && (
        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6 mb-6">
          <p className="text-sm font-semibold text-gray-700 mb-4">새 공지 작성</p>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">제목 *</label>
              <input
                value={addForm.title}
                onChange={(e) => setAddForm(f => ({ ...f, title: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                placeholder="공지 제목을 입력하세요"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">내용 *</label>
              <textarea
                value={addForm.content}
                onChange={(e) => setAddForm(f => ({ ...f, content: e.target.value }))}
                rows={6}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400 resize-none"
                placeholder="공지 내용을 입력하세요"
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
      ) : notices.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-16">작성된 공지사항이 없습니다</p>
      ) : (
        <div className="divide-y divide-gray-100">
          {notices.map(notice => (
            <div key={notice.id} className="py-4">
              {editingId === notice.id && editForm ? (
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex flex-col gap-3">
                    <input
                      value={editForm.title}
                      onChange={(e) => setEditForm(f => f ? { ...f, title: e.target.value } : f)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                    />
                    <textarea
                      value={editForm.content}
                      onChange={(e) => setEditForm(f => f ? { ...f, content: e.target.value } : f)}
                      rows={6}
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
                <div className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{notice.title}</p>
                    <p className="text-xs text-gray-400">{notice.author_name} · {formatDate(notice.created_at)}</p>
                  </div>
                  <button
                    onClick={() => startEdit(notice)}
                    className="text-xs text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-gray-400 px-4 py-1.5 rounded-full transition-colors font-medium shrink-0"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDelete(notice.id)}
                    className={`text-xs px-3 py-1.5 rounded-full transition-colors shrink-0 ${
                      deleteConfirm === notice.id
                        ? 'bg-red-600 text-white'
                        : 'text-gray-400 hover:text-red-600 border border-gray-200 hover:border-red-200'
                    }`}
                  >
                    {deleteConfirm === notice.id ? '확인?' : '삭제'}
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
