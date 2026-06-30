'use client'
import { useEffect, useState } from 'react'
import { useParams, notFound } from 'next/navigation'
import { useAppConfig } from '@/context/AppConfigContext'
import { useAuth } from '@/context/AuthContext'
import { fetchBlogPosts, BlogPost } from '@/lib/blog'
import { isBlogCategory, BLOG_CATEGORIES } from '@/lib/blogCategories'
import Link from 'next/link'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function BlogCategoryPage() {
  const { category } = useParams<{ category: string }>()
  const { config } = useAppConfig()
  const { currentUser } = useAuth()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const isApproved = currentUser && config.approvedWriters.includes(currentUser.email)

  if (!isBlogCategory(category)) notFound()
  const meta = BLOG_CATEGORIES.find(c => c.value === category)!

  useEffect(() => {
    fetchBlogPosts(category).then(data => { setPosts(data); setLoading(false) })
  }, [category])

  return (
    <div className="bg-[#F9F4EE] min-h-screen">
      <div className="max-w-[1640px] mx-auto px-5 py-16">

        <div className="border-b border-gray-200 pb-8 mb-12 flex items-end justify-between">
          <div>
            <p className="text-[#8B4513] text-xs font-bold tracking-widest uppercase mb-3">{meta.eyebrow}</p>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">{meta.label}</h1>
          </div>
          {isApproved && (
            <Link
              href={`/blog/write?category=${category}`}
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
            {posts.map((post) => (
              <Link key={post.id} href={`/blog/${category}/${post.id}`} className="group block">
                <div className="aspect-[4/3] overflow-hidden mb-4 bg-[#fef9e4]">
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
                <p className="text-gray-900 text-xs font-bold tracking-widest uppercase mb-2">
                  {meta.eyebrow}
                </p>
                <h2 className="text-lg font-bold text-gray-900 uppercase leading-tight mb-3 line-clamp-3 group-hover:text-[#8B4513] transition-colors">
                  {post.title}
                </h2>
                <p className="text-sm text-gray-700 line-clamp-2 mb-3">{post.content}</p>
                <p className="text-xs text-gray-500 italic">{post.author_name} · {formatDate(post.created_at)}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
