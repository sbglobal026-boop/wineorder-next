'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { fetchBlogPost, BlogPost } from '@/lib/blog'
import BlogPostCard from '@/components/blog/BlogPostCard'
import Link from 'next/link'

export default function BlogPostPage() {
  const params = useParams()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBlogPost(Number(params.id)).then(data => { setPost(data); setLoading(false) })
  }, [params.id])

  if (loading) {
    return <div className="bg-white min-h-screen" />
  }

  if (!post) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-sm mb-4">글을 찾을 수 없습니다</p>
          <Link href="/blog" className="text-xs font-bold text-[#8B4513] uppercase tracking-widest hover:underline">← 블로그로 돌아가기</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-xl mx-auto px-6 py-16">
        <Link href="/blog" className="text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors mb-8 block">
          ← 블로그
        </Link>
        <BlogPostCard post={post} />
      </div>
    </div>
  )
}
