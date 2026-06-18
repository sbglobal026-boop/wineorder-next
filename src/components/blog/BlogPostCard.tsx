'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import ImageCarousel from './ImageCarousel'
import {
  BlogPost,
  BlogComment,
  fetchLikeCount,
  fetchUserLiked,
  toggleLike,
  fetchComments,
  addComment,
} from '@/lib/blog'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
}

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

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) { router.push('/login'); return }
    if (!commentText.trim()) return
    const newComment = await addComment(post.id, currentUser.id, currentUser.name, commentText.trim())
    setComments(c => [...c, newComment])
    setCommentText('')
  }

  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden mb-8">
      <ImageCarousel images={post.images} />

      <div className="p-5">
        <p className="text-xs text-gray-400 mb-2">{post.author_name} · {formatDate(post.created_at)}</p>
        <h2 className="text-lg font-bold text-gray-900 mb-2">{post.title}</h2>
        <p className="text-sm text-gray-600 whitespace-pre-wrap mb-4">{post.content}</p>

        {/* 액션 바 */}
        <div className="flex items-center gap-5 border-t border-gray-100 pt-4">
          <button onClick={handleLike} className="flex items-center gap-1.5 text-sm font-medium">
            <span>{liked ? '❤️' : '🤍'}</span>
            <span className={liked ? 'text-red-500' : 'text-gray-500'}>{likeCount}</span>
          </button>

          <button className="flex items-center gap-1.5 text-sm text-gray-500 font-medium">
            🔗 공유하기
          </button>

          <button onClick={handleToggleComments} className="flex items-center gap-1.5 text-sm text-gray-500 font-medium">
            💬 댓글{comments.length > 0 ? ` ${comments.length}` : ''}
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
                  <div key={c.id} className="text-sm">
                    <span className="font-semibold text-gray-900">{c.author_name}</span>{' '}
                    <span className="text-gray-600">{c.content}</span>
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
