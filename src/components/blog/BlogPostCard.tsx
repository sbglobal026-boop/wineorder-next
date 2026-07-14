'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Heart, Share2, MessageCircle } from 'lucide-react'
import { categoryLabel, BLOG_CATEGORIES } from '@/lib/blogCategories'
import BlogContent from './BlogContent'
import BlogGallery from './BlogGallery'
import {
  BlogPost,
  BlogComment,
  fetchLikeCount,
  fetchUserLiked,
  toggleLike,
  fetchComments,
  addComment,
  deleteComment,
} from '@/lib/blog'

export default function BlogPostCard({ post }: { post: BlogPost }) {
  const { currentUser } = useAuth()
  const router = useRouter()
  const [likeCount, setLikeCount] = useState(0)
  const [liked, setLiked] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<BlogComment[]>([])
  const [loadingComments, setLoadingComments] = useState(false)
  const [commentText, setCommentText] = useState('')

  useEffect(() => {
    fetchLikeCount(post.id).then(setLikeCount)
    if (currentUser) fetchUserLiked(post.id, currentUser.id).then(setLiked)
    fetchComments(post.id).then(setComments)
  }, [post.id, currentUser])

  const handleLike = async () => {
    if (!currentUser) { router.push('/login'); return }
    const newLiked = await toggleLike(post.id, currentUser.id)
    setLiked(newLiked)
    setLikeCount(c => newLiked ? c + 1 : c - 1)
  }

  const handleToggleComments = async () => {
    const next = !showComments
    setShowComments(next)
    if (next && comments.length === 0) {
      setLoadingComments(true)
      const data = await fetchComments(post.id)
      setComments(data)
      setLoadingComments(false)
    }
  }

  // 본인 댓글 삭제
  const handleDeleteComment = async (commentId: number) => {
    if (!currentUser) return
    try {
      await deleteComment(commentId, currentUser.id)
      setComments(c => c.filter(cm => cm.id !== commentId))
    } catch {
      // 삭제 실패 시 목록 유지 (RLS 정책 미설정 등)
    }
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) { router.push('/login'); return }
    if (!commentText.trim()) return
    const newComment = await addComment(post.id, currentUser.id, currentUser.name, commentText.trim())
    setComments(c => [...c, newComment])
    setCommentText('')
  }

  const pageUrl = typeof window !== 'undefined' ? window.location.href : ''
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`
  const xShareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(post.title)}`
  const emailShareUrl = `mailto:?subject=${encodeURIComponent(post.title)}&body=${encodeURIComponent(pageUrl)}`

  return (
    <div className="w-full border border-gray-100 overflow-hidden mb-8">
      <div className="p-5">
        {/* 브레드크럼: 하위 카테고리 글은 상위 카테고리도 함께 표시 (Home › Wine › Tasting › 제목) */}
        <nav className="text-sm text-gray-400 mb-5 flex items-center gap-1.5 flex-wrap">
          <Link href="/" className="hover:text-gray-900 transition-colors">Home</Link>
          {(() => {
            const parent = BLOG_CATEGORIES.find(c => c.value === post.category)?.parent
            return parent ? (
              <>
                <span>›</span>
                <Link href={`/blog/${parent}`} className="hover:text-gray-900 transition-colors">{categoryLabel(parent)}</Link>
              </>
            ) : null
          })()}
          <span>›</span>
          <Link href={`/blog/${post.category}`} className="hover:text-gray-900 transition-colors">{categoryLabel(post.category)}</Link>
          <span>›</span>
          <span className="text-gray-600 truncate">{post.title}</span>
        </nav>

        {/* 소셜 공유 아이콘 */}
        <div className="flex items-center gap-3 mb-5">
          <a href={facebookShareUrl} target="_blank" rel="noopener noreferrer" aria-label="페이스북 공유" className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-xs text-gray-500 hover:text-gray-900 hover:border-gray-400 transition-colors">f</a>
          <a href={xShareUrl} target="_blank" rel="noopener noreferrer" aria-label="X 공유" className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-xs text-gray-500 hover:text-gray-900 hover:border-gray-400 transition-colors">X</a>
          <a href={emailShareUrl} aria-label="이메일 공유" className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-xs text-gray-500 hover:text-gray-900 hover:border-gray-400 transition-colors">✉</a>
        </div>

        {/* 제목/카테고리/작성자·날짜는 상단 커버 히어로(BlogHero)에 표시됨 */}
        <BlogContent html={post.content} className="text-lg text-gray-700 mb-4" />

        {/* 대표 사진을 제외한 나머지 업로드 사진 (본문 하단 갤러리) */}
        <BlogGallery images={post.images.slice(1)} />

        {/* 액션 바 */}
        <div className="flex items-center gap-5 border-t border-gray-100 pt-4">
          <button onClick={handleLike} className={`group flex items-center gap-1.5 text-sm font-medium transition-colors ${liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}>
            <Heart size={18} strokeWidth={1.75} className={`transition-transform group-hover:scale-110 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
            <span>{likeCount}</span>
          </button>

          <button className="group flex items-center gap-1.5 text-sm text-gray-500 font-medium transition-colors hover:text-gray-900">
            <Share2 size={18} strokeWidth={1.75} className="transition-transform group-hover:scale-110" />
          </button>

          <button onClick={handleToggleComments} className="group flex items-center gap-1.5 text-sm text-gray-500 font-medium transition-colors hover:text-gray-900">
            <MessageCircle size={18} strokeWidth={1.75} className="transition-transform group-hover:scale-110" />
            <span>{comments.length}</span>
          </button>
        </div>

        {/* 댓글 영역 */}
        {showComments && (
          <div className="mt-4 border-t border-gray-100 pt-4">
            {loadingComments ? (
              <p className="text-xs text-gray-400 mb-3">불러오는 중...</p>
            ) : comments.length === 0 ? (
              <p className="text-xs text-gray-400 mb-3">아직 댓글이 없습니다</p>
            ) : (
              <div className="space-y-2.5 mb-4">
                {comments.map(c => (
                  <div key={c.id} className="group flex items-start gap-2 text-sm">
                    <p className="flex-1 min-w-0">
                      <span className="font-semibold text-gray-900">{c.author_name}</span>{' '}
                      <span className="text-gray-600">{c.content}</span>
                    </p>
                    {currentUser?.id === c.user_id && (
                      <button
                        onClick={() => handleDeleteComment(c.id)}
                        aria-label="댓글 삭제"
                        className="shrink-0 text-xs text-gray-500 hover:text-red-600 underline underline-offset-2 transition-colors"
                      >
                        삭제
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder={currentUser ? '댓글을 입력하세요' : '로그인 후 댓글을 작성할 수 있습니다'}
                className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-gray-400"
              />
              <button type="submit" className="text-xs font-bold text-[#8B4513] px-2">게시</button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
