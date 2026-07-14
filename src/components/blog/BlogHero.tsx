'use client'
import { isVideoUrl } from '@/lib/uploadImage'
import { BlogPost } from '@/lib/blog'
import { categoryLabel } from '@/lib/blogCategories'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
}

// 블로그 상세 상단 커버 히어로: 대표 사진(images[0])을 원본 비율 그대로 폭에 꽉 채우고
// 스크림(어두운 그라데이션) 위에 카테고리/제목/작성자·날짜를 오버레이 (브런치 스타일)
export default function BlogHero({ post }: { post: BlogPost }) {
  const image = post.images[0]
  const video = image && isVideoUrl(image)

  return (
    <div className="relative overflow-hidden bg-[#8A867F]">
      {image ? (
        video ? (
          <video src={image} controls className="block w-full h-auto" />
        ) : (
          <img src={image} alt="" className="block w-full h-auto" />
        )
      ) : (
        // 사진 없는 글: 차콜 배경 위에 텍스트만 표시할 최소 높이 확보
        <div className="aspect-[3/2] md:aspect-[21/9]" />
      )}

      {/* 텍스트 오버레이 */}
      <div className="absolute inset-x-0 bottom-0 p-6 md:p-12 pointer-events-none">
        <p className="text-[11px] md:text-xs font-bold text-white/70 uppercase tracking-widest mb-2 md:mb-3">
          {categoryLabel(post.category)}
        </p>
        {/* whitespace-pre-line: 제목 입력 시 넣은 줄바꿈(엔터)을 그대로 표시 */}
        <h1 className="whitespace-pre-line text-2xl md:text-4xl lg:text-5xl font-black text-white leading-tight mb-3 md:mb-4 max-w-4xl [text-shadow:0_1px_12px_rgba(0,0,0,0.35)]">
          {post.title}
        </h1>
        <p className="text-xs md:text-sm text-white [text-shadow:0_1px_12px_rgba(0,0,0,0.35)]">
          {post.author_name} · {formatDate(post.created_at)}
        </p>
      </div>
    </div>
  )
}
