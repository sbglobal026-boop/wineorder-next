'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { fetchNotices, Notice } from '@/lib/notices'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function NoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotices().then(data => { setNotices(data); setLoading(false) })
  }, [])

  return (
    <div className="min-h-screen" style={{ background: 'radial-gradient(120% 90% at 15% 0%, #FFFFFF 0%, #FFFFFF 55%)' }}>
      <header className="max-w-[760px] mx-auto text-center px-5 pt-16 md:pt-24 pb-8">
        <p className="text-[13px] tracking-[0.28em] uppercase text-[#0e3719] mb-3.5">Notice</p>
        <h1 className="font-[family-name:var(--font-playfair-display)] font-medium text-[34px] md:text-[46px] leading-[1.1] text-[#1C1A17]">
          공지사항
        </h1>
      </header>

      <div className="max-w-[1240px] mx-auto px-5 pb-16">
        {loading ? (
          <p className="text-sm text-gray-400 text-center py-24">불러오는 중...</p>
        ) : notices.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-24">등록된 공지사항이 없습니다</p>
        ) : (
          <div className="divide-y divide-gray-200 border-t border-b border-gray-200">
            {notices.map(notice => (
              <Link
                key={notice.id}
                href={`/notices/${notice.id}`}
                className="flex items-center justify-between gap-4 px-2 py-4 hover:bg-white/60 transition-colors"
              >
                <p className="truncate text-sm font-semibold text-gray-900">{notice.title}</p>
                <span className="text-xs text-gray-400 shrink-0">{formatDate(notice.created_at)}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
