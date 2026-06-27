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

// 원산지 → FTA 관세율
function getImportDutyRate(origin: string): number {
  const ftaOrigins = ['프랑스', '이탈리아', '스페인', '독일', '포르투갈', '오스트리아', '미국', '칠레', '호주', '뉴질랜드']
  return ftaOrigins.some(o => origin.includes(o)) ? 0 : 0.15
}

// 관세 계산
function calcDuty(priceEur: number, rate: number, origin: string) {
  const cif = priceEur * rate
  const importDuty = cif * getImportDutyRate(origin)
  const exciseTax = (cif + importDuty) * 0.30
  const educationTax = exciseTax * 0.10
  const vat = (cif + importDuty + exciseTax + educationTax) * 0.10
  const total = importDuty + exciseTax + educationTax + vat
  return { cif, importDuty, exciseTax, educationTax, vat, total }
}

export default function WineDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { config, addToCart } = useAppConfig()
  const product = config.products.find(p => p.id === Number(id))

  const [eurToKrw, setEurToKrw] = useState<number | null>(null)

  // 환율 API 연동
  useEffect(() => {
    fetch('/api/exchange-rate')
      .then(res => res.json())
      .then(data => setEurToKrw(data.rate))
      .catch(() => setEurToKrw(1480)) // Default
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

            {/* 예상 관세 */}
            <p className="text-4xl font-black text-gray-900 mb-8">
                    기준환율 1유로 = {eurToKrw?.toLocaleString('ko-KR', { maximumFractionDigits: 0 })}원 · 참고용 수치입니다
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
