'use client'
import { Fragment, useEffect, useMemo, useState } from 'react'
import { sanitizeBlogHtml } from '@/lib/sanitizeHtml'

const MAP_URL_RE = /https?:\/\/(maps\.app\.goo\.gl|goo\.gl\/maps|maps\.google\.com|www\.google\.com\/maps)[^\s<"']*/gi

interface MapEmbed {
  embedUrl: string
  placeName: string
  rawUrl: string
}

function isShortUrl(url: string) {
  return /maps\.app\.goo\.gl|goo\.gl\/maps/.test(url)
}

function extractPlaceName(url: string): string {
  const match = url.match(/\/maps\/place\/([^/@?]+)/)
  if (match) {
    return decodeURIComponent(match[1].replace(/\+/g, ' '))
  }
  return '지도'
}

function makeEmbedUrl(url: string): string | null {
  const placeMatch = url.match(/\/maps\/place\/([^/@?]+)/)
  if (placeMatch) {
    return `https://maps.google.com/maps?q=${placeMatch[1]}&output=embed`
  }
  const coordMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+),(\d+)/)
  if (coordMatch) {
    return `https://maps.google.com/maps?q=${coordMatch[1]},${coordMatch[2]}&z=${coordMatch[3]}&output=embed`
  }
  const qMatch = url.match(/[?&]q=([^&]+)/)
  if (qMatch) {
    return `https://maps.google.com/maps?q=${qMatch[1]}&output=embed`
  }
  return null
}

async function resolveMapEmbed(rawUrl: string): Promise<MapEmbed | null> {
  let resolved = rawUrl
  if (isShortUrl(rawUrl)) {
    try {
      const res = await fetch(`/api/resolve-map?url=${encodeURIComponent(rawUrl)}`)
      const data = await res.json()
      if (data.resolved) resolved = data.resolved
    } catch {
      return null
    }
  }
  const embedUrl = makeEmbedUrl(resolved)
  if (!embedUrl) return null
  return { embedUrl, placeName: extractPlaceName(resolved), rawUrl }
}

function MapCard({ embedUrl, placeName, rawUrl }: MapEmbed) {
  return (
    <div className="my-4 border border-gray-200 overflow-hidden w-full sm:w-1/2 md:w-1/4">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#0e3719] font-[family-name:var(--font-lato)]">
        <div className="flex items-center gap-2">
          <span className="text-[#FBFAF7] text-sm">📍</span>
          <span className="text-[#FBFAF7] text-sm font-medium truncate">{placeName}</span>
        </div>
        <a
          href={rawUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-[11px] font-bold uppercase tracking-widest text-[#DAD4CD] hover:text-[#FBFAF7] transition-colors"
        >
          Google Maps →
        </a>
      </div>
      {/* 지도 - 정사각형 비율 유지 */}
      <div className="relative w-full pb-[100%]">
        <iframe
          src={embedUrl}
          className="absolute inset-0 w-full h-full"
          style={{ border: 0, display: 'block' }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  )
}

export default function BlogContent({ html, className = '' }: { html: string; className?: string }) {
  const [embeds, setEmbeds] = useState<MapEmbed[]>([])
  const clean = useMemo(() => sanitizeBlogHtml(html), [html])

  useEffect(() => {
    MAP_URL_RE.lastIndex = 0
    const rawUrlSet = new Set<string>()
    let m
    while ((m = MAP_URL_RE.exec(clean)) !== null) {
      rawUrlSet.add(m[0])
    }
    const rawUrls = [...rawUrlSet]

    if (rawUrls.length === 0) { setEmbeds([]); return }

    Promise.all(rawUrls.map(resolveMapEmbed)).then(results => {
      setEmbeds(results.filter(Boolean) as MapEmbed[])
    })
  }, [clean])

  // 지도 링크가 포함된 문단 바로 뒤에서 본문을 잘라, 각 조각 뒤에 지도 카드를 끼워 넣음
  // (기존에는 지도들을 본문 끝에 몰아서 붙여 링크 위치와 무관하게 맨 밑에 표시됐음)
  const segments = useMemo(() => {
    const segs: { html: string; embed?: MapEmbed }[] = []
    let rest = clean
    for (const embed of embeds) {
      const idx = rest.indexOf(embed.rawUrl)
      if (idx === -1) continue
      const pEnd = rest.indexOf('</p>', idx)
      const cut = pEnd === -1 ? idx + embed.rawUrl.length : pEnd + 4
      segs.push({ html: rest.slice(0, cut), embed })
      rest = rest.slice(cut)
    }
    segs.push({ html: rest })
    return segs
  }, [clean, embeds])

  return (
    <>
      {segments.map((seg, i) => (
        <Fragment key={i}>
          {seg.html && (
            <div
              className={`blog-rich-content ${className}`}
              dangerouslySetInnerHTML={{ __html: seg.html }}
            />
          )}
          {seg.embed && <MapCard {...seg.embed} />}
        </Fragment>
      ))}
    </>
  )
}
