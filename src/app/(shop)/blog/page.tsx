'use client'
import { useEffect, useState } from 'react'
import { useAppConfig } from '@/context/AppConfigContext'
import { useAuth } from '@/context/AuthContext'
import { fetchBlogPosts, BlogPost } from '@/lib/blog'
import Link from 'next/link'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function BlogPage() {
  const { config } = useAppConfig()
  const { currentUser } = useAuth()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const isApproved = currentUser && config.approvedWriters.includes(currentUser.email)

  useEffect(() => {
    fetchBlogPosts().then(data => { setPosts(data); setLoading(false) })
  }, [])

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-16">

        <div className="border-b border-gray-200 pb-8 mb-12 flex items-end justify-between">
          <div>
            <p className="text-[#8B4513] text-xs font-bold tracking-widest uppercase mb-3">Wine Story</p>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">블로그</h1>
          </div>
          {isApproved && (
            <Link
              href="/blog/write"
              className="bg-gray-900 hover:bg-gray-700 text-white text-xs font-semibold px-5 py-2.5 rounded-full transition-colors"
            >
              + 글쓰기
            </Link>
          )}
        </div>

        {loading ? (
          <p className="text-gray-400 text-sm text-center py-24">불러오는 중...</p>
        ) : posts.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-24">아직 작성된 글이 없습니다</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-12">
            {posts.map((post) => (
              <Link key={post.id} href={`/blog/${post.id}`} className="group block">
                <div className="aspect-square overflow-hidden rounded-xl mb-4 bg-[#fef9e4]">
                  {post.images[0] ? (
                    <img
                      src={post.images[0]}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-5xl">🍷</span>
                    </div>
                  )}
                </div>
                <p className="text-[#8B4513] text-xs font-bold tracking-widest uppercase mb-2">
                  {post.images.length > 1 ? `사진 ${post.images.length}장` : 'Wine Story'}
                </p>
                <h2 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#8B4513] transition-colors">
                  {post.title}
                </h2>
                <p className="text-sm text-gray-500 line-clamp-2 mb-3">{post.content}</p>
                <p className="text-xs text-gray-400">{post.author_name} · {formatDate(post.created_at)}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
