'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { fetchBlogPosts, BlogPost } from '@/lib/blog'

export default function WineStory() {
  const [post, setPost] = useState<BlogPost | null>(null)

  useEffect(() => {
    fetchBlogPosts().then(posts => setPost(posts[0] ?? null))
  }, [])

  if (!post) return null

  const bg = post.images[0]
    ? { backgroundImage: `url(${post.images[0]})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: 'linear-gradient(180deg,rgba(28,26,23,.25),rgba(28,26,23,.7)),repeating-linear-gradient(135deg,#46403525 0 16px,#3a342b25 16px 32px),#4a4338' }

  return (
    <section className="relative min-h-[560px] flex items-end px-[20px] py-16 text-[#F4EFE6]" style={bg}>
      {post.images[0] && <div className="absolute inset-0 bg-black/45" />}
      <div className="relative w-full">
        <p className="text-xs font-semibold tracking-widest uppercase opacity-70 mb-4">추천 와인 이야기</p>
        <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4">{post.title}</h2>
        <p className="max-w-lg text-lg leading-relaxed opacity-85 mb-7 line-clamp-3">{post.content}</p>
        <Link
          href={`/blog/${post.id}`}
          className="inline-flex items-center gap-3 border border-white/50 rounded-full px-6 py-3 text-sm font-medium hover:bg-white/10 transition-colors"
        >
          이야기 읽기 →
        </Link>
      </div>
    </section>
  )
}
