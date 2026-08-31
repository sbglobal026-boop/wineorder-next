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
    <div className="min-h-screen" style={{ background: 'radial-gradient(120% 90% at 15% 0%, #F9F4EE 0%, #F9F4EE 55%)' }}>
      <header className="max-w-[760px] mx-auto text-center px-5 pt-16 md:pt-24 pb-8">
        <p className="text-[13px] tracking-[0.28em] uppercase text-[#0e3719] mb-3.5">CS Board</p>
        <h1 className="font-[family-name:var(--font-playfair-display)] font-medium text-[34px] md:text-[46px] leading-[1.1] text-[#1C1A17]">
          CS 게시판
        </h1>
      </header>

      <div className="max-w-[1240px] mx-auto px-5 pb-16">
        <div className="flex justify-end mb-6">
          <Link
            href={currentUser ? '/cs-board/write' : '/login'}
            className="text-xs font-semibold px-4 py-2 rounded-full bg-[#0e3719] text-white hover:bg-[#22301C] transition-colors no-underline"
          >
            글쓰기
          </Link>
        </div>
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
