'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import InfoPageLayout from '@/components/legal/InfoPageLayout'
import LoadingDots from '@/components/LoadingDots'
import { fetchQnaPosts, QnaPost } from '@/lib/qna'

// QnA — 어드민 "QnA 관리"에서 등록한 질문·답변을 순서대로 보여줌
export default function QnaPage() {
  const [posts, setPosts] = useState<QnaPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let ignore = false
    fetchQnaPosts()
      .then(data => { if (!ignore) { setPosts(data); setLoading(false) } })
      .catch(() => { if (!ignore) { setError(true); setLoading(false) } })
    return () => { ignore = true }
  }, [])

  return (
    <InfoPageLayout
      eyebrow="QnA"
      title="자주 묻는 질문"
      subtitle="원하는 답을 찾지 못하셨다면 언제든 문의해주세요."
    >
      {loading ? (
        <LoadingDots className="py-16" />
      ) : error ? (
        <p className="text-center py-16 text-[#9b9797]">질문을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.</p>
      ) : posts.length === 0 ? (
        <p className="text-center py-16 text-[#9b9797]">등록된 질문이 없습니다.</p>
      ) : (
        <div className="space-y-6">
          {posts.map(post => (
            <div key={post.id} className="border-b border-[#eae7e7] pb-6">
              <h2 className="font-[family-name:var(--font-playfair-display)] text-[19px] text-[#1C1A17] mb-2">Q. {post.question}</h2>
              <p className="text-[#605d5d] whitespace-pre-wrap">{post.answer}</p>
            </div>
          ))}
        </div>
      )}

      <p className="mt-8 text-xs text-[#9b9797]">
        문의는 <Link href="/cs-board" className="underline underline-offset-2 hover:text-[#0e3719]">CS 게시판</Link>으로 남겨주세요.
      </p>
    </InfoPageLayout>
  )
}
