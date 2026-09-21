'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { fetchWineries, type Winery } from '@/lib/wineries'
import LoadingDots from '@/components/LoadingDots'

// 와이너리 A–Z 목록 — 검색 + 글자별 바로가기
const LETTERS = ['0-9', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')]

// 이름의 첫 글자로 구간 결정 (영문 외 글자는 0-9 구간에 모음)
function letterOf(name: string) {
  const first = name.trim().charAt(0).toUpperCase()
  return /^[A-Z]$/.test(first) ? first : '0-9'
}

export default function WineryListPage() {
  const [wineries, setWineries] = useState<Winery[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    let ignore = false
    fetchWineries()
      .then(list => { if (!ignore) { setWineries(list); setLoading(false) } })
      .catch(() => { if (!ignore) setLoading(false) })
    return () => { ignore = true }
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return wineries
    return wineries.filter(w =>
      w.name.toLowerCase().includes(q) ||
      w.region.toLowerCase().includes(q) ||
      w.country.toLowerCase().includes(q)
    )
  }, [wineries, search])

  // 글자 구간별로 묶기
  const groups = useMemo(() => {
    const map = new Map<string, Winery[]>()
    for (const w of filtered) {
      const letter = letterOf(w.name)
      map.set(letter, [...(map.get(letter) ?? []), w])
    }
    return map
  }, [filtered])

  return (
    <div className="min-h-screen" style={{ background: 'radial-gradient(120% 90% at 15% 0%, #F9F4EE 0%, #F9F4EE 55%)' }}>
      <div className="max-w-[1240px] mx-auto px-5 pt-14 md:pt-20 pb-20">
        <h1 className="font-[family-name:var(--font-playfair-display)] font-semibold text-[34px] md:text-[46px] leading-tight text-[#1C1A17]">
          Winery A–Z
        </h1>

        {/* 검색 */}
        <div className="max-w-[560px] mx-auto mt-10">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="어떤 와이너리를 찾으세요?"
            className="w-full border-b border-[#d7d3d3] bg-transparent px-1 py-3 text-[15px] text-center focus:outline-none focus:border-[#0e3719] transition-colors"
          />
        </div>

        {/* 글자 바로가기 — 등록된 와이너리가 있는 글자만 누를 수 있음 */}
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-8 text-[15px]">
          {LETTERS.map(letter => {
            const has = (groups.get(letter)?.length ?? 0) > 0
            return has ? (
              <a key={letter} href={`#letter-${letter}`} className="text-[#1C1A17] hover:text-[#0e3719] transition-colors no-underline">
                {letter}
              </a>
            ) : (
              <span key={letter} className="text-[#d7d3d3]">{letter}</span>
            )
          })}
        </div>

        {loading ? (
          <LoadingDots className="py-24" />
        ) : filtered.length === 0 ? (
          <p className="text-center text-[#9b9797] py-24">
            {wineries.length === 0 ? '등록된 와이너리가 없습니다.' : '검색 결과가 없습니다.'}
          </p>
        ) : (
          <div className="mt-14 flex flex-col gap-12">
            {LETTERS.filter(letter => (groups.get(letter)?.length ?? 0) > 0).map(letter => (
              <section key={letter} id={`letter-${letter}`} className="scroll-mt-24">
                <div className="flex items-baseline justify-between border-b border-[#eae7e7] pb-2 mb-5">
                  <h2 className="font-[family-name:var(--font-playfair-display)] text-[22px] font-semibold text-[#1C1A17]">{letter}</h2>
                  <a href="#top" className="text-[13px] text-[#9b9797] hover:text-[#0e3719] transition-colors no-underline">위로 ↑</a>
                </div>
                <ul className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-2.5">
                  {(groups.get(letter) ?? []).map(w => (
                    <li key={w.id}>
                      <Link href={`/events/winery/${w.slug}`} className="text-[15px] text-[#1C1A17] hover:text-[#0e3719] hover:underline underline-offset-4 transition-colors no-underline">
                        {w.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
