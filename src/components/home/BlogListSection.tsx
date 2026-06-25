'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { fetchBlogPosts, BlogPost } from '@/lib/blog'
import { categoryLabel } from '@/lib/blogCategories'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function BlogListSection() {
  const [posts, setPosts] = useState<BlogPost[]>([])

  useEffect(() => {
    fetchBlogPosts().then(data => setPosts(data.slice(0, 5)))
  }, [])

  if (posts.length === 0) return null

  return (
    <section>
      <div className="max-w-[1640px] mx-auto bg-[#F9F4EE] text-[#1C1A17] p-[20px] my-[40px]">
        <div className="max-w-[1600px] mx-auto border-t border-[#1C1A17] my-[10px]" />
        <div className="flex flex-col md:flex-row items-start gap-5 md:gap-[100px]">
        <h2 className="text-[20px] font-bold tracking-tight shrink-0 font-[family-name:var(--font-playfair-display)]">Recent Posts.</h2>
        <div className="flex flex-nowrap gap-5 overflow-x-auto snap-x snap-mandatory pb-2 -mx-[20px] px-[20px] md:mx-0 md:px-0">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.category}/${post.id}`} className="block group w-[320px] h-[552px] flex flex-col shrink-0 snap-start">
              {/* 이미지 영역 */}
              <div className="relative w-[320px] h-[380px] shrink-0 rounded-sm overflow-hidden bg-[#e6e0d4]">
                {post.images[0] ? (
                  <img
                    src={post.images[0]}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center text-4xl">🍷</span>
                )}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                  <p className="bg-[#F9F4EE] rounded-full px-2.5 py-1 text-[11px] font-medium leading-none">
                    {categoryLabel(post.category)}
                  </p>
                  {post.images.length > 1 && (
                    <p className="bg-[#1C1A17] text-[#F9F4EE] rounded-full px-2.5 py-1 text-[11px] font-medium leading-none">
                      사진 {post.images.length}
                    </p>
                  )}
                </div>
              </div>

              {/* 하단 정보 */}
              <p className="text-[17px] font-semibold leading-normal mt-3.5 truncate">{post.title}</p>

              <div className="border-t border-[#1C1A17] mt-2" />

              <p className="text-sm leading-normal opacity-70 line-clamp-2 mt-2">{post.content}</p>

              <div className="border-t border-[#1C1A17]/10 mt-2" />

              <div className="flex items-center justify-between gap-3 mt-2">
                <div className="flex flex-col gap-0.5 min-w-0">
                  <p className="text-[11px] uppercase tracking-widest opacity-50">작성자.</p>
                  <p className="text-xs truncate">{post.author_name}</p>
                </div>
                <div className="flex flex-col gap-0.5 items-end shrink-0">
                  <p className="text-[11px] uppercase tracking-widest opacity-50">작성일.</p>
                  <p className="text-xs">{formatDate(post.created_at)}</p>
                </div>
              </div>

              <span className="block mt-2 text-xs font-medium uppercase tracking-widest text-[#1C1A17]/60 group-hover:text-[#1C1A17] transition-colors">
                View →
              </span>
            </Link>
          ))}
        </div>
        </div>
      </div>
    </section>
  )
}
