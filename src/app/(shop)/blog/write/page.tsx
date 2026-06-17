'use client'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useAppConfig } from '@/context/AppConfigContext'
import { compressImage } from '@/lib/compressImage'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function BlogWritePage() {
  const { currentUser } = useAuth()
  const { config, addBlogPost } = useAppConfig()
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState<string | undefined>()
  const fileRef = useRef<HTMLInputElement>(null)

  const isApproved = currentUser && config.approvedWriters.includes(currentUser.email)

  useEffect(() => {
    if (!currentUser) router.replace('/login')
  }, [currentUser, router])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const compressed = await compressImage(file)
    setImageUrl(compressed)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return
    addBlogPost({ title, content, imageUrl })
    router.push('/blog')
  }

  if (!currentUser) return null

  if (!isApproved) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-4xl mb-4">🔒</p>
          <h2 className="text-xl font-black text-gray-900 mb-2">글쓰기 권한이 없습니다</h2>
          <p className="text-sm text-gray-500 mb-6">관리자에게 승인을 요청해주세요</p>
          <Link href="/blog" className="text-xs font-bold text-[#8B4513] uppercase tracking-widest hover:underline">
            ← 블로그로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-10">
          <Link href="/blog" className="text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors">
            ← 블로그
          </Link>
          <p className="text-xs text-gray-400">{currentUser.name}으로 작성 중</p>
        </div>

        <h1 className="text-2xl font-black text-gray-900 mb-8">새 글 작성</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* 이미지 업로드 */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">대표 이미지</label>
            {imageUrl ? (
              <div className="relative w-full h-64 rounded-2xl overflow-hidden border border-gray-100">
                <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => { setImageUrl(undefined); if (fileRef.current) fileRef.current.value = '' }}
                  className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white text-xs px-3 py-1.5 rounded-full"
                >
                  제거
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full h-40 border-2 border-dashed border-gray-200 hover:border-gray-400 rounded-2xl flex flex-col items-center justify-center gap-2 transition-colors text-gray-400 hover:text-gray-600"
              >
                <span className="text-3xl">+</span>
                <span className="text-sm font-medium">이미지 업로드</span>
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
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
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              required
              rows={12}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gray-400 resize-none"
              placeholder="내용을 입력하세요"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold px-8 py-3 rounded-full transition-colors"
            >
              발행
            </button>
            <Link
              href="/blog"
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
