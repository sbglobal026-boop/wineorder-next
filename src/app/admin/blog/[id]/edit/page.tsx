'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { fetchBlogPost, BlogPost } from '@/lib/blog'
import BlogEditor from '@/components/blog/BlogEditor'

// 어드민 글 수정 — 발행된 글과 같은 화면에서 수정 (관리자 보호는 admin/layout.tsx에서 적용됨)
export default function AdminBlogEditPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { currentUser } = useAuth()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBlogPost(Number(id)).then(data => { setPost(data); setLoading(false) })
  }, [id])

  if (loading) return <div className="bg-[#F9F4EE] min-h-screen" />

  if (!post) {
    return (
      <div className="bg-[#F9F4EE] min-h-screen flex items-center justify-center">
        <p className="text-sm text-gray-400">글을 찾을 수 없습니다</p>
      </div>
    )
  }

  return (
    <BlogEditor
      post={post}
      authorId={currentUser?.id ?? null}
      defaultAuthorName="관리자"
      backHref="/admin?panel=blog"
      onSaved={() => router.push('/admin?panel=blog')}
    />
  )
}
