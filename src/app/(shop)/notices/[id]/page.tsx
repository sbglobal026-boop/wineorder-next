'use client'
import { useEffect, useState } from 'react'
import { useParams, notFound } from 'next/navigation'
import Link from 'next/link'
import { fetchNotice, Notice } from '@/lib/notices'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function NoticeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [notice, setNotice] = useState<Notice | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotice(Number(id)).then(data => { setNotice(data); setLoading(false) })
  }, [id])

  if (loading) {
    return <div className="bg-[#F9F4EE] min-h-screen" />
  }

  if (!notice) notFound()

  return (
    <div className="bg-[#F9F4EE] min-h-screen">
      <div className="max-w-[1640px] mx-auto px-5 md:px-10 py-16">
        <Link href="/notices" className="text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors mb-8 block">
          ← 공지사항
        </Link>

        <div className="max-w-[880px] mx-auto border border-gray-200 rounded-2xl p-6 md:p-10 bg-white/60">
          <h1 className="text-2xl font-black text-gray-900 mb-2">{notice.title}</h1>
          <p className="text-xs text-gray-400 mb-6">{notice.author_name} · {formatDate(notice.created_at)}</p>
          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{notice.content}</p>
        </div>
      </div>
    </div>
  )
}
