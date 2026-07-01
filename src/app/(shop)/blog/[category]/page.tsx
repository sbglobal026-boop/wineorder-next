'use client'
import { useEffect, useState } from 'react'
import { useParams, notFound } from 'next/navigation'
import { useAppConfig } from '@/context/AppConfigContext'
import { useAuth } from '@/context/AuthContext'
import { fetchBlogPosts, BlogPost } from '@/lib/blog'
import { isBlogCategory, BLOG_CATEGORIES, BlogCategory, childCategories, categoryEyebrow, categoryLabel } from '@/lib/blogCategories'
import { stripHtml } from '@/lib/sanitizeHtml'
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
  const [subFilter, setSubFilter] = useState<BlogCategory | 'all'>('all')
  const isApproved = currentUser && config.approvedWriters.includes(currentUser.email)

  if (!isBlogCategory(category)) notFound()
  const meta = BLOG_CATEGORIES.find(c => c.value === category)!
  const children = childCategories(category)

  useEffect(() => {
    if (!isBlogCategory(category)) return
    setSubFilter('all')
    const childCats = childCategories(category)
    const target = childCats.length > 0 ? [category, ...childCats] : category
    fetchBlogPosts(target).then(data => { setPosts(data); setLoading(false) })
  }, [category])

  const visiblePosts = subFilter === 'all' ? posts : posts.filter(p => p.category === subFilter)

  return (
    <div className="bg-[#F9F4EE] min-h-screen">

      {/* 히어로 섹션 */}
      <div className="max-w-[1640px] mx-auto">
        <div className="relative bg-[#1C1A17] flex items-center justify-between px-5 h-12">
          <h1 className="font-[family-name:var(--font-playfair-display)] text-white text-[21px] font-bold tracking-tight">
            {meta.label}
          </h1>
          {isApproved && (
            <Link
              href={`/blog/write?category=${category}`}
              className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-5 py-2 rounded-full transition-colors shrink-0"
            >
              + 글쓰기
            </Link>
          )}
        </div>
      </div>

      <div className="max-w-[1640px] mx-auto px-5 py-12">

        {children.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-10">
            <button
              onClick={() => setSubFilter('all')}
              className={`text-xs font-semibold px-4 py-2 rounded-full border transition-colors ${
                subFilter === 'all' ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-600 hover:border-gray-400'
              }`}
            >전체</button>
            {children.map((c) => (
              <button
                key={c}
                onClick={() => setSubFilter(c)}
                className={`text-xs font-semibold px-4 py-2 rounded-full border transition-colors ${
                  subFilter === c ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-600 hover:border-gray-400'
                }`}
              >{categoryLabel(c)}</button>
            ))}
          </div>
        )}

        {loading ? (
          <p className="text-gray-400 text-sm text-center py-24">불러오는 중...</p>
        ) : visiblePosts.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-24">아직 작성된 글이 없습니다</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
            {visiblePosts.map((post) => (
              <Link key={post.id} href={`/blog/${post.category}/${post.id}`} className="group block">
                <div className="relative w-full pb-[118.75%] mb-4 bg-[#fef9e4] overflow-hidden">
                  {post.images[0] ? (
                    <img
                      src={post.images[0]}
                      alt={post.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-5xl">🍷</span>
                    </div>
                  )}
                </div>
                <p className="text-gray-900 text-xs font-bold tracking-widest uppercase mb-2">
                  {categoryEyebrow(post.category)}
                </p>
                <h2 className="text-lg font-bold text-gray-900 uppercase leading-tight mb-3 line-clamp-3 group-hover:text-[#8B4513] transition-colors">
                  {post.title}
                </h2>
                <p className="text-sm text-gray-700 line-clamp-2 mb-3">{stripHtml(post.content)}</p>
                <p className="text-xs text-gray-500 italic">{post.author_name} · {formatDate(post.created_at)}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
