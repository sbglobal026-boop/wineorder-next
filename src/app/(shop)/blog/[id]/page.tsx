'use client'
import { useAppConfig } from '@/context/AppConfigContext'
import { useParams } from 'next/navigation'
import Link from 'next/link'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function BlogPostPage() {
  const { config } = useAppConfig()
  const params = useParams()
  const post = config.blogPosts.find(p => p.id === Number(params.id))

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
      <div className="max-w-3xl mx-auto px-6 py-16">

        <Link href="/blog" className="text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors mb-10 block">
          ← 블로그
        </Link>

        <p className="text-xs text-gray-400 mb-4">{formatDate(post.createdAt)}</p>
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-8">{post.title}</h1>

        {post.imageUrl && (
          <div className="mb-10 rounded-2xl overflow-hidden">
            <img src={post.imageUrl} alt={post.title} className="w-full object-cover max-h-[480px]" />
          </div>
        )}

        <div className="text-gray-700 text-base leading-relaxed whitespace-pre-wrap border-t border-gray-100 pt-8">
          {post.content}
        </div>

      </div>
    </div>
  )
}
