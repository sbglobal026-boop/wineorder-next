'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { createCsPost } from '@/lib/csBoard'

export default function CsBoardWritePage() {
  const { currentUser } = useAuth()
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!currentUser) router.replace('/login')
  }, [currentUser, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim() || !currentUser) return
    setSubmitting(true)
    const post = await createCsPost({
      title: title.trim(),
      content: content.trim(),
      author_id: currentUser.id,
      author_name: currentUser.name,
    })
    router.push(`/cs-board/${post.id}`)
  }

  if (!currentUser) return null

  return (
    <div className="bg-[#F9F4EE] min-h-screen">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-10">
          <Link href="/cs-board" className="text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors">
            ← CS 게시판
          </Link>
          <p className="text-xs text-gray-400">{currentUser.name}으로 작성 중</p>
        </div>

        <h1 className="text-2xl font-black text-gray-900 mb-8">문의 작성</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">제목 *</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gray-400"
              placeholder="문의 제목을 입력하세요"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">내용 *</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              required
              rows={10}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gray-400 resize-none"
              placeholder="문의 내용을 입력하세요"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="bg-gray-900 hover:bg-gray-700 disabled:bg-gray-400 text-white text-sm font-semibold px-8 py-3 rounded-full transition-colors"
            >
              {submitting ? '등록 중...' : '등록'}
            </button>
            <Link
              href="/cs-board"
              className="border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm px-8 py-3 rounded-full transition-colors"
            >
              취소
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
