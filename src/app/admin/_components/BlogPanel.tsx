'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { isVideoUrl } from '@/lib/uploadImage'
import { fetchBlogPosts, deleteBlogPost, BlogPost } from '@/lib/blog'
import { BlogCategory, BLOG_CATEGORIES, topLevelCategories, childCategories, categoryLabel } from '@/lib/blogCategories'
import { stripHtml } from '@/lib/sanitizeHtml'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
}

function CategoryButtons({
  value,
  onChange,
  allLabel,
}: {
  value: BlogCategory | 'all'
  onChange: (v: BlogCategory | 'all') => void
  allLabel?: string
}) {
  const base = 'text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors'
  const cls = (active: boolean) =>
    `${base} ${active ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`

  // 현재 선택값의 부모 카테고리 (자식이 선택된 경우)
  const selectedParent = value !== 'all'
    ? BLOG_CATEGORIES.find(c => c.value === value)?.parent
    : undefined

  // 확장할 상위 카테고리: 자식이 선택되면 그 부모, 직접 선택이면 해당 카테고리
  const expandedParent: BlogCategory | null =
    selectedParent ?? (value !== 'all' ? value : null)

  const expandedChildren = expandedParent ? childCategories(expandedParent) : []

  return (
    <div className="flex flex-col gap-2">
      {/* 상위 카테고리 */}
      <div className="flex gap-2 flex-wrap">
        {allLabel && (
          <button type="button" onClick={() => onChange('all')} className={cls(value === 'all')}>{allLabel}</button>
        )}
        {topLevelCategories().map(c => (
          <button
            key={c.value}
            type="button"
            onClick={() => onChange(c.value)}
            className={cls(value === c.value || selectedParent === c.value)}
          >
            {c.label}
            {childCategories(c.value).length > 0 && (
              <span className="ml-1 opacity-50 text-[10px]">
                {expandedParent === c.value ? '▲' : '▼'}
              </span>
            )}
          </button>
        ))}
      </div>
      {/* 선택된 상위 카테고리의 하위 카테고리 */}
      {expandedChildren.length > 0 && (
        <div className="flex gap-2 flex-wrap pl-4 border-l-2 border-gray-200">
          {expandedChildren.map(v => (
            <button key={v} type="button" onClick={() => onChange(v)} className={cls(value === v)}>
              {categoryLabel(v)}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function BlogPanel() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const [filter, setFilter] = useState<BlogCategory | 'all'>('all')

  const loadPosts = () => {
    setLoading(true)
    fetchBlogPosts().then(data => { setPosts(data); setLoading(false) })
  }

  useEffect(() => { loadPosts() }, [])

  const visiblePosts = filter === 'all' ? posts : posts.filter(p => p.category === filter)

  const handleDelete = async (post: BlogPost) => {
    if (deleteConfirm === post.id) {
      await deleteBlogPost(post.id, post.images)
      setDeleteConfirm(null)
      loadPosts()
    } else {
      setDeleteConfirm(post.id)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-2xl font-bold text-gray-900">블로그 관리</h2>
        <Link
          href="/admin/blog/new"
          className="bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors"
        >
          + 새 글 작성
        </Link>
      </div>
      <p className="text-gray-500 text-sm mb-4">글 작성과 수정은 전용 에디터 페이지에서 진행됩니다</p>

      {/* 카테고리 필터 */}
      <div className="mb-6">
        <CategoryButtons value={filter} onChange={setFilter} allLabel="전체" />
      </div>

      {/* 글 목록 */}
      {loading ? (
        <p className="text-sm text-gray-400 text-center py-10">불러오는 중...</p>
      ) : (
        <div className="divide-y divide-gray-100">
          {visiblePosts.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-10">작성된 글이 없습니다</p>
          )}
          {visiblePosts.map((post) => (
            <div key={post.id} className="flex items-center gap-4 px-2 py-4 hover:bg-gray-50 transition-colors rounded-xl">
              {post.images[0] ? (
                isVideoUrl(post.images[0])
                  ? <video src={post.images[0]} muted className="w-16 h-16 rounded-xl object-cover shrink-0 bg-black" />
                  : <img src={post.images[0]} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-[#fef9e4] flex items-center justify-center shrink-0">
                  <span className="text-2xl">🍷</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-400 border border-gray-200 rounded-full px-2 py-0.5">
                    {categoryLabel(post.category)}
                  </span>
                  <p className="text-sm font-semibold text-gray-900 truncate">{post.title}</p>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{formatDate(post.created_at)} · {post.author_name}</p>
                <p className="text-xs text-gray-500 mt-1 line-clamp-1">{stripHtml(post.content)}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/admin/blog/${post.id}/edit`}
                  className="text-xs text-gray-600 hover:text-gray-900 font-medium border border-gray-200 hover:border-gray-400 px-3 py-1.5 rounded-full transition-colors"
                >편집</Link>
                <button
                  onClick={() => handleDelete(post)}
                  className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                    deleteConfirm === post.id
                      ? 'bg-red-600 text-white'
                      : 'text-gray-400 hover:text-red-600 border border-gray-200 hover:border-red-200'
                  }`}
                >{deleteConfirm === post.id ? '확인?' : '삭제'}</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <p className="text-xs text-gray-400 mt-4">{posts.length}개 글</p>
    </div>
  )
}
