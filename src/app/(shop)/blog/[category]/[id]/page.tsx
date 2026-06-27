'use client'
import { useEffect, useState } from 'react'
import { useParams, notFound } from 'next/navigation'
import { fetchBlogPost, BlogPost } from '@/lib/blog'
import { isBlogCategory, categoryLabel } from '@/lib/blogCategories'
import BlogPostCard from '@/components/blog/BlogPostCard'
import Link from 'next/link'

export default function BlogPostPage() {
  const { category, id } = useParams<{ category: string; id: string }>()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)

  if (!isBlogCategory(category)) notFound()

  useEffect(() => {
    fetchBlogPost(Number(id)).then(data => { setPost(data); setLoading(false) })
  }, [id])

  if (loading) {
    return <div className="bg-white min-h-screen" />
  }

  if (!post) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-sm mb-4">글을 찾을 수 없습니다</p>
          <Link href={`/blog/${category}`} className="text-xs font-bold text-[#8B4513] uppercase tracking-widest hover:underline">
            ← {categoryLabel(category)}로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-xl mx-auto px-6 py-16">
        <Link href={`/blog/${category}`} className="text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors mb-8 block">
          ← {categoryLabel(category)}
        </Link>
        <BlogPostCard post={post} />
      </div>
    </div>
  )
}
