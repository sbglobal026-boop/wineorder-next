'use client'
import { useState, useRef, useEffect, Suspense } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useAppConfig } from '@/context/AppConfigContext'
import { uploadBlogImages } from '@/lib/uploadImage'
import { createBlogPost } from '@/lib/blog'
import { BLOG_CATEGORIES, BlogCategory, isBlogCategory } from '@/lib/blogCategories'
import { stripHtml } from '@/lib/sanitizeHtml'
import RichTextEditor from '@/components/blog/RichTextEditor'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

const MAX_IMAGES = 10

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
  const [category, setCategory] = useState<BlogCategory>(
    initialCategory && isBlogCategory(initialCategory) ? initialCategory : 'wine'
  )
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const isApproved = currentUser && config.approvedWriters.includes(currentUser.email)

  useEffect(() => {
    if (!currentUser) router.replace('/login')
  }, [currentUser, router])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0 || !currentUser) return
    const remaining = MAX_IMAGES - images.length
    setUploading(true)
    const uploaded = await uploadBlogImages(files.slice(0, remaining), currentUser.id)
    setUploading(false)
    setImages(prev => [...prev, ...uploaded])
    if (fileRef.current) fileRef.current.value = ''
  }

  const removeImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !stripHtml(content) || !currentUser) return
    setSubmitting(true)
    await createBlogPost({
      title, content, images, category,
      author_id: currentUser.id,
      author_name: currentUser.name,
    })
    router.push(`/blog/${category}`)
  }

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
    <div className="bg-[#F9F4EE] min-h-screen">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-10">
          <Link href={`/blog/${category}`} className="text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors">
            ← 블로그
          </Link>
          <p className="text-xs text-gray-400">{currentUser.name}으로 작성 중</p>
        </div>

        <h1 className="text-2xl font-black text-gray-900 mb-8">새 글 작성</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* 카테고리 */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">카테고리 *</label>
            <div className="flex gap-2">
              {BLOG_CATEGORIES.map(c => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setCategory(c.value)}
                  className={`text-sm font-semibold px-4 py-2 rounded-full border transition-colors ${
                    category === c.value
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'border-gray-200 text-gray-600 hover:border-gray-400'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* 이미지 업로드 */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">
              사진 ({images.length}/{MAX_IMAGES})
            </label>
            <div className="grid grid-cols-4 gap-3">
              {images.map((src, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-gray-100">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-black/80 text-white text-xs w-6 h-6 rounded-full"
                  >×</button>
                </div>
              ))}
              {images.length < MAX_IMAGES && (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="aspect-square border-2 border-dashed border-gray-200 hover:border-gray-400 rounded-xl flex flex-col items-center justify-center gap-1 transition-colors text-gray-400 hover:text-gray-600"
                >
                  {uploading ? (
                    <span className="text-xs font-medium">업로드중...</span>
                  ) : (
                    <>
                      <span className="text-2xl">+</span>
                      <span className="text-xs font-medium">추가</span>
                    </>
                  )}
                </button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
          </div>

          {/* 제목 */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">제목 *</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gray-400"
              placeholder="글 제목을 입력하세요"
            />
          </div>

          {/* 내용 */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">내용 *</label>
            <RichTextEditor value={content} onChange={setContent} placeholder="내용을 입력하세요" />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="bg-gray-900 hover:bg-gray-700 disabled:bg-gray-400 text-white text-sm font-semibold px-8 py-3 rounded-full transition-colors"
            >
              {submitting ? '발행 중...' : '발행'}
            </button>
            <Link
              href={`/blog/${category}`}
              className="border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm px-8 py-3 rounded-full transition-colors"
            >
              취소
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
