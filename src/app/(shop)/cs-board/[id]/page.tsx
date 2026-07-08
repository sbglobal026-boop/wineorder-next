'use client'
import { useEffect, useState } from 'react'
import { useParams, notFound } from 'next/navigation'
import Link from 'next/link'
import { fetchCsPost, CsPost } from '@/lib/csBoard'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function CsBoardDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [post, setPost] = useState<CsPost | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCsPost(Number(id)).then(data => { setPost(data); setLoading(false) })
  }, [id])

  if (loading) {
    return <div className="bg-[#F9F4EE] min-h-screen" />
  }

  if (!post) notFound()

  return (
    <div className="bg-[#F9F4EE] min-h-screen">
      <div className="max-w-[1640px] mx-auto px-5 md:px-10 py-16">
        <Link href="/cs-board" className="text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors mb-8 block">
          ← CS 게시판
        </Link>

        <div className="max-w-[880px] mx-auto border border-gray-200 rounded-2xl p-6 md:p-10 bg-white/60">
          <div className="flex items-center gap-2 mb-4">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
              post.answer ? 'bg-[#2C5F2D]/10 text-[#2C5F2D]' : 'bg-gray-200 text-gray-500'
            }`}>
              {post.answer ? '답변완료' : '답변대기'}
            </span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-2">{post.title}</h1>
          <p className="text-xs text-gray-400 mb-6">{post.author_name} · {formatDate(post.created_at)}</p>
          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{post.content}</p>

          {post.answer && (
            <div className="mt-8 pt-6 border-t border-gray-200 bg-[#F9F4EE] rounded-xl p-5">
              <p className="text-xs font-bold text-[#2C5F2D] uppercase tracking-widest mb-2">관리자 답변</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{post.answer}</p>
              {post.answered_at && <p className="text-xs text-gray-400 mt-3">{formatDate(post.answered_at)}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
