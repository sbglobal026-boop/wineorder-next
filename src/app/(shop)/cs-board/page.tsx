'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { fetchCsPosts, CsPost } from '@/lib/csBoard'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function CsBoardPage() {
  const { currentUser } = useAuth()
  const [posts, setPosts] = useState<CsPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCsPosts().then(data => { setPosts(data); setLoading(false) })
  }, [])

  return (
    <div className="bg-[#F9F4EE] min-h-screen">
      <div className="max-w-[1640px] mx-auto">
        <div className="bg-[#1C1A17] flex items-center justify-between px-5 h-12">
          <h1 className="font-[family-name:var(--font-playfair-display)] text-white text-[21px] font-bold tracking-tight">
            CS 게시판
          </h1>
          <Link
            href={currentUser ? '/cs-board/write' : '/login'}
            className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-5 py-2 rounded-full transition-colors shrink-0"
          >
            글쓰기
          </Link>
        </div>
      </div>

      <div className="max-w-[1240px] mx-auto px-5 py-12">
        {loading ? (
          <p className="text-sm text-gray-400 text-center py-24">불러오는 중...</p>
        ) : posts.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-24">등록된 문의가 없습니다</p>
        ) : (
          <div className="divide-y divide-gray-200 border-t border-b border-gray-200">
            {posts.map(post => (
              <Link
                key={post.id}
                href={`/cs-board/${post.id}`}
                className="flex items-center justify-between gap-4 px-2 py-4 hover:bg-white/60 transition-colors"
              >
                <div className="min-w-0 flex items-center gap-3">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                    post.answer ? 'bg-[#2C5F2D]/10 text-[#2C5F2D]' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {post.answer ? '답변완료' : '답변대기'}
                  </span>
                  <p className="truncate text-sm font-semibold text-gray-900">{post.title}</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-400 shrink-0">
                  <span>{post.author_name}</span>
                  <span>{formatDate(post.created_at)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
