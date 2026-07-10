'use client'
import { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { fetchQnaPosts, QnaPost } from '@/lib/qna'

export default function QnaPage() {
  const [posts, setPosts] = useState<QnaPost[]>([])
  const [loading, setLoading] = useState(true)
  const [openId, setOpenId] = useState<number | null>(null)

  useEffect(() => {
    fetchQnaPosts().then(data => { setPosts(data); setLoading(false) })
  }, [])

  return (
    <div className="bg-[#F9F4EE] min-h-screen">
      <div className="max-w-[1640px] mx-auto">
        <div className="bg-[#1C1A17] flex items-center px-5 h-12">
          <h1 className="font-[family-name:var(--font-playfair-display)] text-white text-[21px] font-bold tracking-tight">
            QnA
          </h1>
        </div>
      </div>

      <div className="max-w-[880px] mx-auto px-5 md:px-10 py-16">
        {loading ? (
          <p className="text-sm text-gray-400 text-center py-24">불러오는 중...</p>
        ) : posts.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-24">등록된 QnA가 없습니다</p>
        ) : (
          <div className="divide-y divide-gray-200 border-t border-b border-gray-200">
            {posts.map(post => {
              const open = openId === post.id
              return (
                <div key={post.id}>
                  <button
                    onClick={() => setOpenId(open ? null : post.id)}
                    className="w-full flex items-center justify-between gap-4 px-2 py-5 text-left hover:bg-white/60 transition-colors"
                  >
                    <span className="flex items-start gap-3 text-sm font-semibold text-gray-900">
                      <span className="text-[#0e3719] font-bold shrink-0">Q.</span>
                      {post.question}
                    </span>
                    <ChevronDown size={16} strokeWidth={2} className={`text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
                  </button>
                  {open && (
                    <div className="px-2 pb-5 flex items-start gap-3">
                      <span className="text-gray-400 font-bold shrink-0 text-sm">A.</span>
                      <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{post.answer}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
