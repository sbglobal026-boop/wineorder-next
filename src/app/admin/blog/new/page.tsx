'use client'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import BlogEditor from '@/components/blog/BlogEditor'

// 어드민 새 글 작성 — 발행된 글과 같은 화면에서 작성 (관리자 보호는 admin/layout.tsx에서 적용됨)
export default function AdminBlogNewPage() {
  const router = useRouter()
  const { currentUser } = useAuth()

  return (
    <BlogEditor
      authorId={currentUser?.id ?? null}
      defaultAuthorName="관리자"
      backHref="/admin?panel=blog"
      onSaved={() => router.push('/admin?panel=blog')}
    />
  )
}
