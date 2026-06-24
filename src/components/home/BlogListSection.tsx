'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { fetchBlogPosts, BlogPost } from '@/lib/blog'

export default function BlogListSection() {
  const [posts, setPosts] = useState<BlogPost[]>([])

  useEffect(() => {
    fetchBlogPosts().then(data => setPosts(data.slice(0, 5)))
  }, [])

  if (posts.length === 0) return null

  return (
    <section className="bg-[#1C1A17] text-[#F4EFE6] py-20 md:py-24 px-[20px]">
      <div className="max-w-[1400px] mx-auto">
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-10">Recent Posts.</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-5">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.id}`} className="block group">
              <div className="relative aspect-[3/4] rounded-sm overflow-hidden bg-[#2b2720]">
                {post.images[0] ? (
                  <img src={post.images[0]} alt={post.title} className="w-full h-full object-cover" />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center text-4xl">🍷</span>
                )}
              </div>
              <h3 className="text-[17px] font-semibold mt-3.5 mb-1.5 line-clamp-1">{post.title}</h3>
              <p className="text-sm opacity-70 line-clamp-2 mb-3">{post.content}</p>
              <span className="text-xs font-medium uppercase tracking-widest text-[#F4EFE6]/60 group-hover:text-[#F4EFE6] transition-colors">
                View
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
