import Link from 'next/link'
import { BlogPost } from '@/lib/blog'
import { categoryLabel, categoryEyebrow, BLOG_CATEGORIES, BlogCategory } from '@/lib/blogCategories'
import { stripHtml } from '@/lib/sanitizeHtml'
import { isVideoUrl } from '@/lib/uploadImage'

// 카드 컨셉 블로그 카드. BlogCard(세로 그리드용), BlogFeaturedCard(대표글 2단 가로)

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
}

// 본문 길이로 읽기 시간 자동 계산 (분)
function readingMinutes(html: string): number {
  const len = stripHtml(html).length
  return Math.max(1, Math.round(len / 500))
}

// 상위 카테고리별 썸네일 배경 그라데이션 (이미지 없을 때)
const TOP_GRADIENT: Record<string, string> = {
  'wine': 'radial-gradient(90% 120% at 70% 10%, #f2e6e1, #e6cdc4)',
  'food-drink': 'radial-gradient(90% 120% at 70% 10%, #eef0dd, #dde5c5)',
  'travel': 'radial-gradient(90% 120% at 70% 10%, #f7e7cf, #f1d6b0)',
  'monthly-table': 'radial-gradient(90% 120% at 70% 10%, #e7e0ee, #d3c8e0)',
  'journal': 'radial-gradient(90% 120% at 70% 10%, #f3ddc7, #e8c39a)',
}

function gradientFor(cat: BlogCategory): string {
  const meta = BLOG_CATEGORIES.find(c => c.value === cat)
  const top = meta?.parent ?? cat
  return TOP_GRADIENT[top] ?? TOP_GRADIENT['wine']
}

function Thumb({ post, className = '' }: { post: BlogPost; className?: string }) {
  const src = post.images[0]
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ background: gradientFor(post.category) }}>
      {src ? (
        isVideoUrl(src)
          ? <video src={src} muted className="thumb absolute inset-0 w-full h-full object-cover" />
          : <img src={src} alt={post.title} className="thumb absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-4xl select-none">🍷</div>
      )}
    </div>
  )
}

export function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.category}/${post.id}`}
      className="cutecard group block rounded-[24px] border border-[#eae7e7] bg-[#fffefb] overflow-hidden no-underline"
    >
      <Thumb post={post} className="h-[180px]" />
      <div className="p-5">
        <span className="text-[12px] text-[#7d5411]">{categoryLabel(post.category)}</span>
        <h4 className="font-[family-name:var(--font-playfair-display)] text-[21px] leading-[1.3] text-[#1C1A17] mt-2 mb-2 line-clamp-2">
          {post.title}
        </h4>
        <p className="text-[13.5px] leading-[1.65] text-[#605d5d] line-clamp-2 mb-4">{stripHtml(post.content)}</p>
        <div className="text-[12px] text-[#9b9797]">{formatDate(post.created_at)} · {readingMinutes(post.content)}분 읽기</div>
      </div>
    </Link>
  )
}

export function BlogFeaturedCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.category}/${post.id}`}
      className="cutecard group grid md:grid-cols-2 rounded-[28px] border border-[#eae7e7] bg-[#fffefb] overflow-hidden no-underline"
    >
      <Thumb post={post} className="h-[240px] md:h-full min-h-[240px]" />
      <div className="p-8 md:p-10 flex flex-col justify-center">
        <span className="self-start text-[11px] tracking-[0.16em] uppercase text-[#7d5411] border border-[#b68235] rounded-full px-3 py-1 mb-4">
          Editor&rsquo;s Pick
        </span>
        <h2 className="font-[family-name:var(--font-playfair-display)] text-[26px] md:text-[32px] leading-[1.2] text-[#1C1A17] mb-3 line-clamp-3">
          {post.title}
        </h2>
        <p className="text-[15px] leading-[1.8] text-[#605d5d] line-clamp-3 mb-5">{stripHtml(post.content)}</p>
        <div className="flex items-center gap-3 text-[13px] text-[#9b9797]">
          <span className="w-8 h-8 rounded-full" style={{ background: gradientFor(post.category) }} />
          <span className="text-[#605d5d]">{post.author_name}</span>
          <span>·</span>
          <span>{categoryEyebrow(post.category)}</span>
          <span>·</span>
          <span>{readingMinutes(post.content)}분 읽기</span>
        </div>
      </div>
    </Link>
  )
}
