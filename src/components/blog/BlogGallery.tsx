'use client'
import { isVideoUrl } from '@/lib/uploadImage'

// 본문 하단 갤러리: 대표 사진을 제외한 나머지(images[1..])를 원본 비율 그대로 세로로 표시
// 새 글에서 본문에 직접 사진을 넣으면 이 갤러리는 비어서 렌더링되지 않음
export default function BlogGallery({ images }: { images: string[] }) {
  if (images.length === 0) return null

  return (
    <div className="space-y-3 mb-4">
      {images.map((src, i) =>
        isVideoUrl(src) ? (
          <video key={i} src={src} controls className="w-full" />
        ) : (
          <img key={i} src={src} alt="" className="w-full h-auto" />
        )
      )}
    </div>
  )
}
