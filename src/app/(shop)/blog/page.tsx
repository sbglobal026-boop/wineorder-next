'use client'
import { useEffect, useState } from 'react'
import { useAppConfig } from '@/context/AppConfigContext'
import { useAuth } from '@/context/AuthContext'
import { fetchBlogPosts, BlogPost } from '@/lib/blog'
import BlogPostCard from '@/components/blog/BlogPostCard'
import Link from 'next/link'

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
      <div className="max-w-xl mx-auto px-6 py-16">

        <div className="border-b border-gray-200 pb-8 mb-10 flex items-end justify-between">
          <div>
            <p className="text-[#8B4513] text-xs font-bold tracking-widest uppercase mb-3">Wine Story</p>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">블로그</h1>
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
          posts.map(post => <BlogPostCard key={post.id} post={post} />)
        )}
      </div>
    </div>
  )
}
