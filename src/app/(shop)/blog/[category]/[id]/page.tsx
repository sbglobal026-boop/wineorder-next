'use client'
import { useEffect, useState } from 'react'
import { useParams, notFound } from 'next/navigation'
import { fetchBlogPost, BlogPost } from '@/lib/blog'
import { isBlogCategory, categoryLabel } from '@/lib/blogCategories'
import BlogPostCard from '@/components/blog/BlogPostCard'
import BlogHero from '@/components/blog/BlogHero'
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
    return <div className="bg-[#FFFFFF] min-h-screen" />
  }

  if (!post) {
    return (
      <div className="bg-[#FFFFFF] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-sm mb-4">글을 찾을 수 없습니다</p>
          <Link href={`/blog/${category}`} className="text-xs font-bold text-[#0e3719] uppercase tracking-widest hover:underline">
            ← {categoryLabel(category)}로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'radial-gradient(120% 90% at 15% 0%, #FFFFFF 0%, #FFFFFF 55%)' }}>
      <div className="max-w-[1240px] mx-auto px-5 py-16">
        <Link href={`/blog/${category}`} className="text-xs font-bold text-[#0e3719] uppercase tracking-widest hover:opacity-70 transition-opacity mb-8 block">
          ← {categoryLabel(category)}
        </Link>
        {/* 커버는 헤더·바디와 같은 1240 폭 */}
        <div className="mb-8">
          <BlogHero post={post} />
        </div>
        <BlogPostCard post={post} />
      </div>
    </div>
  )
}
