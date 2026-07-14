'use client'
import { useEffect, useState } from 'react'
import { fetchCsPosts, answerCsPost, deleteCsPost, CsPost } from '@/lib/csBoard'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function CsBoardPanel() {
  const [posts, setPosts] = useState<CsPost[]>([])
  const [loading, setLoading] = useState(true)
  const [openId, setOpenId] = useState<number | null>(null)
  const [answerDraft, setAnswerDraft] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

  const loadPosts = () => {
    setLoading(true)
    fetchCsPosts().then(data => { setPosts(data); setLoading(false) })
  }

  useEffect(() => { loadPosts() }, [])

  const startAnswer = (post: CsPost) => {
    setOpenId(post.id)
    setAnswerDraft(post.answer ?? '')
  }

  const saveAnswer = async (id: number) => {
    setSaving(true)
    await answerCsPost(id, answerDraft.trim())
    setSaving(false)
    setOpenId(null)
    loadPosts()
  }

  const handleDelete = async (id: number) => {
    if (deleteConfirm === id) {
      await deleteCsPost(id)
      setDeleteConfirm(null)
      loadPosts()
    } else {
      setDeleteConfirm(id)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">CS 게시판 관리</h2>
      <p className="text-gray-500 text-sm mb-8">고객 문의를 확인하고 답변을 등록합니다</p>

      {loading ? (
        <p className="text-sm text-gray-400 text-center py-16">불러오는 중...</p>
      ) : posts.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-16">등록된 문의가 없습니다</p>
      ) : (
        <div className="divide-y divide-gray-100">
          {posts.map(post => (
            <div key={post.id} className="py-4">
              <div className="flex items-center gap-4">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                  post.answer ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-500'
                }`}>
                  {post.answer ? '답변완료' : '답변대기'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{post.title}</p>
                  <p className="text-xs text-gray-400">{post.author_name} · {formatDate(post.created_at)}</p>
                </div>
                <button
                  onClick={() => openId === post.id ? setOpenId(null) : startAnswer(post)}
                  className="text-xs text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-gray-400 px-4 py-1.5 rounded-full transition-colors font-medium shrink-0"
                >
                  {openId === post.id ? '닫기' : post.answer ? '답변 수정' : '답변하기'}
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

              {openId === post.id && (
                <div className="mt-4 ml-2 bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-3 whitespace-pre-wrap">{post.content}</p>
                  <textarea
                    value={answerDraft}
                    onChange={e => setAnswerDraft(e.target.value)}
                    rows={4}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400 resize-none mb-3"
                    placeholder="답변을 입력하세요"
                  />
                  <button
                    onClick={() => saveAnswer(post.id)}
                    disabled={saving}
                    className="bg-gray-900 hover:bg-gray-700 disabled:bg-gray-400 text-white text-xs font-semibold px-5 py-2 rounded-full transition-colors"
                  >
                    {saving ? '저장 중...' : '답변 저장'}
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
