'use client'
import { useAppConfig } from '@/context/AppConfigContext'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function BlogPage() {
  const { config } = useAppConfig()
  const { currentUser } = useAuth()
  const posts = config.blogPosts
  const isApproved = currentUser && config.approvedWriters.includes(currentUser.email)

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

        {posts.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-24">아직 작성된 글이 없습니다</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link key={post.id} href={`/blog/${post.id}`} className="group block">
                <div className="border border-gray-100 rounded-2xl overflow-hidden hover:border-gray-300 transition-colors">
                  {post.imageUrl ? (
                    <div className="h-52 overflow-hidden">
                      <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                  ) : (
                    <div className="h-52 bg-[#fef9e4] flex items-center justify-center">
                      <span className="text-5xl">🍷</span>
                    </div>
                  )}
                  <div className="p-6">
                    <p className="text-xs text-gray-400 mb-2">{formatDate(post.createdAt)}</p>
                    <h2 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#8B4513] transition-colors">{post.title}</h2>
                    <p className="text-sm text-gray-500 line-clamp-3">{post.content}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
