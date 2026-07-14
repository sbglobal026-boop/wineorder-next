'use client'
import { useEffect, Suspense } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useAppConfig } from '@/context/AppConfigContext'
import { isBlogCategory } from '@/lib/blogCategories'
import BlogEditor from '@/components/blog/BlogEditor'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function BlogWritePage() {
  return (
    <Suspense fallback={<div className="bg-[#F9F4EE] min-h-screen" />}>
      <BlogWriteForm />
    </Suspense>
  )
}

function BlogWriteForm() {
  const { currentUser } = useAuth()
  const { config } = useAppConfig()
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialCategory = searchParams.get('category')

  const isApproved = currentUser && config.approvedWriters.includes(currentUser.email)

  useEffect(() => {
    if (!currentUser) router.replace('/login')
  }, [currentUser, router])

  if (!currentUser) return null

  if (!isApproved) {
    return (
      <div className="bg-[#F9F4EE] min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-4xl mb-4">🔒</p>
          <h2 className="text-xl font-black text-gray-900 mb-2">글쓰기 권한이 없습니다</h2>
          <p className="text-sm text-gray-500 mb-6">관리자에게 승인을 요청해주세요</p>
          <Link href="/blog/wine" className="text-xs font-bold text-[#8B4513] uppercase tracking-widest hover:underline">
            ← 블로그로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  return (
    <BlogEditor
      authorId={currentUser.id}
      defaultAuthorName={currentUser.name}
      fixedAuthorName
      initialCategory={initialCategory && isBlogCategory(initialCategory) ? initialCategory : undefined}
      backHref="/blog/wine"
      onSaved={(category) => router.push(`/blog/${category}`)}
    />
  )
}
