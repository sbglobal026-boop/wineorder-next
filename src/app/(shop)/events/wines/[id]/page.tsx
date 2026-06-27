'use client'
import { useParams } from 'next/navigation'
import { useAppConfig } from '@/context/AppConfigContext'
import Link from 'next/link'
import { useState, useEffect } from 'react'

const categoryBg: Record<string, string> = {
  '레드': 'bg-red-50',
  '화이트': 'bg-amber-50',
  '로제': 'bg-pink-50',
  '스파클링': 'bg-blue-50',
}

function extractVintage(name: string): string {
  const match = name.match(/\b(19|20)\d{2}\b/)
  return match ? match[0] : '—'
}

// 관세 계산(배송비 미포함 ver.)
function calcDuty(price: number, eurToKrw: number, eurToUsd: number, origin: string) {
  const ftaOrigins = ['프랑스', '이탈리아', '스페인', '독일', '포르투갈'] 
  const isFTA = ftaOrigins.some(o => origin.includes(o))

  const priceUsd = price * eurToUsd
  const priceKrw = price * eurToKrw

  if (priceUsd <= 150) {
    const total = Math.round(isFTA ? priceKrw * 0.33 : priceKrw * 0.683)
    return { total }
  } else {
    const total = Math.round(isFTA ? priceKrw * 0.463 : priceKrw * 0.683)
    return { total }
  }
}

export default function WineDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { config, addToCart } = useAppConfig()
  const product = config.products.find(p => p.id === Number(id))

  const [eurToKrw, setEurToKrw] = useState<number | null>(null)
  const [eurToUsd, setEurToUsd] = useState<number | null>(null)

  // 환율 API 연동
  useEffect(() => {
    fetch('/api/exchange-rate')
      .then(res => res.json())
      .then(data => {
        setEurToKrw(data.krw)
        setEurToUsd(data.usd)
      })
      .catch(() => setEurToKrw(1750)) // Default
  }, [])

  if (!product) {
    return (
      <div className="bg-[#fef9e4] min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-400 text-sm">존재하지 않는 상품입니다</p>
        <Link href="/events/wines" className="text-xs font-bold uppercase tracking-widest text-[#8B4513] hover:text-[#2C5F2D] transition-colors">
          ← 와인 목록으로
        </Link>
      </div>
    )
  }
  const priceKrw = (eurToKrw) ? product.price * eurToKrw : null
  const duty = (eurToKrw && eurToUsd) ? calcDuty(product.price, eurToKrw, eurToUsd, product.origin) : null

  return (
    <div className="bg-[#fef9e4] min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-10">

        <Link href="/events/wines" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors mb-10">
          ← 와인 목록
        </Link>

        <div className="grid md:grid-cols-2 gap-0 border border-gray-200">

          {/* 왼쪽: 이미지 */}
          <div className={`${categoryBg[product.category] ?? 'bg-gray-50'} relative flex items-center justify-center py-32 overflow-hidden`}>
            {product.imageUrl
              ? <img src={product.imageUrl} alt={product.name} className="absolute inset-0 w-full h-full object-cover" />
              : <span className="text-[160px] select-none">🍷</span>
            }
          </div>

          {/* 오른쪽: 상품 정보 */}
          <div className="p-10 md:p-14 flex flex-col justify-center border-l border-gray-200">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
              {product.category} · {product.origin}
            </p>

            <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-5">
              {product.name}
            </h1>

            <div className="flex items-center gap-8 mb-6">
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Vintage</p>
                <p className="text-sm font-bold text-gray-900">{extractVintage(product.name)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Rating</p>
                <div className="flex items-center gap-1">
                  <span className="text-[#F5D623] text-sm">★</span>
                  <span className="text-sm font-bold text-gray-900">{product.rating}</span>
                </div>
              </div>
            </div>

            <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-sm">
              {product.description}
            </p>

            <p className="text-4xl font-black text-gray-900 mb-8">
              {product.price.toLocaleString()}
              <span className="text-lg font-semibold text-gray-400 ml-1">유로</span>
            </p>
            {/* 예상 원화 가격 */}
            <p className="text-4xl font-black text-gray-900 mb-8">
              {priceKrw ? priceKrw.toLocaleString():'환율 로딩중'}
              <span className="text-lg font-semibold text-gray-400 ml-1">원</span>
              기준환율 1유로 = {eurToKrw?.toLocaleString('ko-KR', { maximumFractionDigits: 0 })}원

            </p>

            {/* 예상 관세 */}
            <p className="text-4xl font-black text-gray-900 mb-8">
              예상관세=
              {duty ? duty.total.toLocaleString():'예상 세율 계산중'}
              <span className="text-lg font-semibold text-gray-400 ml-1">원</span>
            </p>

            <div className="flex gap-3">

              {/*<button className="flex-1 bg-[#8B4513] hover:bg-[#2C5F2D] text-white text-xs font-bold uppercase tracking-widest py-4 transition-colors">*/}
              <button
                onClick={() => {
                  console.log('clicked', product.id)
                  addToCart(product.id)}}
                className="flex-1 bg-[#8B4513] hover:bg-[#2C5F2D] text-white text-xs font-bold uppercase tracking-widest py-4 transition-colors">
                장바구니 담기
              </button>
              <button className="flex-1 border-2 border-[#8B4513] text-[#8B4513] hover:bg-[#8B4513] hover:text-white text-xs font-bold uppercase tracking-widest py-4 transition-colors">
                바로 구매
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
