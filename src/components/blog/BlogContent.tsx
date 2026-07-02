'use client'
import { useEffect, useState } from 'react'
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

export default function BlogContent({ html, className = '' }: { html: string; className?: string }) {
  const [embeds, setEmbeds] = useState<MapEmbed[]>([])

  useEffect(() => {
    MAP_URL_RE.lastIndex = 0
    const rawUrlSet = new Set<string>()
    let m
    while ((m = MAP_URL_RE.exec(html)) !== null) {
      rawUrlSet.add(m[0])
    }
    const rawUrls = [...rawUrlSet]

    if (rawUrls.length === 0) { setEmbeds([]); return }

    Promise.all(rawUrls.map(resolveMapEmbed)).then(results => {
      setEmbeds(results.filter(Boolean) as MapEmbed[])
    })
  }, [html])

  return (
    <>
      <div
        className={`blog-rich-content ${className}`}
        dangerouslySetInnerHTML={{ __html: sanitizeBlogHtml(html) }}
      />
      {embeds.map(({ embedUrl, placeName, rawUrl }, i) => (
        <div key={i} className="mt-6 border border-gray-200 overflow-hidden w-1/2">
          {/* 헤더 */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#0e3719]">
            <div className="flex items-center gap-2">
              <span className="text-[#FBFAF7] text-sm">📍</span>
              <span className="text-[#FBFAF7] text-sm font-medium">{placeName}</span>
            </div>
            <a
              href={rawUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-bold uppercase tracking-widest text-[#DAD4CD] hover:text-[#FBFAF7] transition-colors"
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
      ))}
    </>
  )
}
