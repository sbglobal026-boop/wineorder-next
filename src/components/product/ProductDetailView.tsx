'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Product } from '@/data/products'
import { useAppConfig } from '@/context/AppConfigContext'
import { useAuth } from '@/context/AuthContext'
import { fetchReviews, addReview, ProductReview } from '@/lib/reviews'
import ProductGridCard from '@/components/product/ProductGridCard'

const categoryBg: Record<string, string> = {
  '레드': 'bg-red-50',
  '화이트': 'bg-amber-50',
  '로제': 'bg-pink-50',
  '스파클링': 'bg-blue-50',
  '식품': 'bg-orange-50',
}

function extractVintage(name: string): string {
  const match = name.match(/\b(19|20)\d{2}\b/)
  return match ? match[0] : '—'
}

function fmt(n: number): string {
  return '€' + n.toLocaleString()
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

export default function ProductDetailView({
  product,
  eyebrow = "Today's Top Drop",
  backLink,
  showDuty = false,
}: {
  product: Product
  eyebrow?: string
  backLink?: { href: string; label: string }
  showDuty?: boolean
}) {
  const { config, addToCart, openCart } = useAppConfig()
  const { currentUser } = useAuth()
  const recommended = config.products.filter(p => p.id !== product.id).slice(0, 4)
  const foodGuide = config.products.find(p => p.type === 'food')

  const [activeImg, setActiveImg] = useState(0)
  const [qty, setQty] = useState(1)
  const [sticky, setSticky] = useState(false)

  const [reviews, setReviews] = useState<ProductReview[]>([])
  const [reviewOpen, setReviewOpen] = useState(false)
  const [newRating, setNewRating] = useState(5)
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [reviewError, setReviewError] = useState<string | null>(null)

  const [eurToKrw, setEurToKrw] = useState<number | null>(null)
  const [eurToUsd, setEurToUsd] = useState<number | null>(null)

  useEffect(() => {
    setActiveImg(0)
    setQty(1)
  }, [product.id])

  useEffect(() => {
    fetchReviews(product.id).then(setReviews)
  }, [product.id])

  // 환율 API 연동 (와인 상품 상세에서만 필요)
  useEffect(() => {
    if (!showDuty) return
    fetch('/api/exchange-rate')
      .then(res => res.json())
      .then(data => {
        setEurToKrw(data.krw)
        setEurToUsd(data.usd)
      })
      .catch(() => setEurToKrw(1750))
  }, [showDuty])

  useEffect(() => {
    const onScroll = () => setSticky(window.scrollY > 560)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const images = [product.imageUrl, ...(product.extraImages ?? [])].filter(Boolean) as string[]
  const bg = categoryBg[product.category] ?? 'bg-gray-50'
  const isSoldOut = (product.stock ?? 1) === 0

  // 5초마다 자동 슬라이드
  useEffect(() => {
    if (images.length <= 1) return
    const timer = setInterval(() => {
      setActiveImg(i => (i + 1) % images.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [images.length])

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) addToCart(product.id)
    openCart()
  }

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : product.rating

  const handleSubmitReview = async () => {
    if (!currentUser || !newComment.trim() || submitting) return
    setSubmitting(true)
    setReviewError(null)
    try {
      const created = await addReview({
        productId: product.id,
        userId: currentUser.id,
        authorName: currentUser.name,
        rating: newRating,
        comment: newComment.trim(),
      })
      setReviews(prev => [created, ...prev])
      setNewComment('')
      setNewRating(5)
    } catch (err) {
      const message = err instanceof Error
        ? err.message
        : (typeof err === 'object' && err !== null && 'message' in err ? String((err as { message: unknown }).message) : null)
      setReviewError(message || '리뷰 등록에 실패했습니다')
    } finally {
      setSubmitting(false)
    }
  }

  const priceKrw = (showDuty && eurToKrw) ? product.price * eurToKrw : null
  const duty = (showDuty && eurToKrw && eurToUsd) ? calcDuty(product.price, eurToKrw, eurToUsd, product.origin) : null

  const criticRatings = (product.criticRatings ?? '').split(',').map(s => s.trim()).filter(Boolean).slice(0, 3)

  const previewRows = [
    { k: 'Type', v: product.category },
    { k: '포도품종', v: product.grapeVariety || '—' },
    { k: 'Vintage', v: extractVintage(product.name) },
    { k: 'Origin', v: product.origin },
    { k: '평가', v: criticRatings.length > 0 ? criticRatings.join(', ') : '—' },
  ]

  return (
    <div className="bg-[#F9F4EE] min-h-screen">

      {/* 히어로 바 — backLink 있을 때만 표시 */}
      {backLink && (
        <div className="max-w-[1640px] mx-auto">
          <div className="bg-[#1C1A17] flex items-center justify-between px-5 h-12">
            <Link
              href={backLink.href}
              className="inline-flex items-center gap-2 text-white/70 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors no-underline"
            >
              {backLink.label}
            </Link>
            <h2 className="font-[family-name:var(--font-playfair-display)] text-white text-[21px] font-bold tracking-tight">
              {product.name}
            </h2>
          </div>
        </div>
      )}

      <div className="max-w-[1640px] mx-auto px-5 pt-10 grid md:grid-cols-2 gap-20 items-start">

        {/* 갤러리 */}
        <section>
          <p className="text-[11px] font-bold tracking-[0.18em] text-gray-400 uppercase mb-3.5">
            {eyebrow}
          </p>

          <div className={`relative w-full aspect-square ${bg} overflow-hidden`}>
            {images.length > 0
              ? images.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(${(i - activeImg) * 100}%)` }}
                  />
                ))
              : <span className="absolute inset-0 flex items-center justify-center text-[160px] select-none">{product.type === 'wine' ? '🍷' : '🧀'}</span>
            }
            {isSoldOut && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                <span className="text-white text-sm font-bold tracking-widest uppercase border border-white/60 px-5 py-2">Sold Out</span>
              </div>
            )}
            {/* 좌우 화살표 */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImg(i => (i - 1 + images.length) % images.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 flex items-center justify-center text-white text-2xl drop-shadow"
                >
                  ‹
                </button>
                <button
                  onClick={() => setActiveImg(i => (i + 1) % images.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 flex items-center justify-center text-white text-2xl drop-shadow"
                >
                  ›
                </button>
              </>
            )}
          </div>

          {/* dot 인디케이터 */}
          {images.length > 1 && (
            <div className="flex justify-center gap-2 mt-3">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${i === activeImg ? 'bg-gray-900' : 'bg-gray-300'}`}
                />
              ))}
            </div>
          )}
        </section>

        {/* 구매박스 */}
        <section className="sticky top-[110px] flex flex-col">
          <div className="flex items-center gap-2.5 mb-2">
            <span className="text-gray-900 text-sm tracking-wide">
              {'★'.repeat(Math.round(avgRating))}{'☆'.repeat(5 - Math.round(avgRating))}
            </span>
            <span className="text-[13px] text-gray-400">{avgRating.toFixed(1)}</span>
          </div>

          <button
            onClick={() => setReviewOpen(o => !o)}
            className="text-[13px] text-gray-500 underline underline-offset-2 cursor-pointer mb-4 text-left"
          >
            고객 리뷰 {reviews.length}개 {reviewOpen ? '▴' : '▾'}
          </button>

          {reviewOpen && (
            <div className="mb-6 p-4 bg-white/60 border border-[#1C1A17]/10 flex flex-col gap-4">
              {reviews.length === 0 && (
                <p className="text-[13px] text-gray-400">아직 등록된 리뷰가 없습니다.</p>
              )}
              {reviews.map(r => (
                <div key={r.id} className="flex flex-col gap-1 pb-3 border-b border-[#1C1A17]/10 last:border-b-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium text-gray-800">{r.author_name}</span>
                    <span className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString()}</span>
                  </div>
                  <span className="text-amber-500 text-xs">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                  <p className="text-[13px] text-gray-600 leading-relaxed">{r.comment}</p>
                </div>
              ))}

              {currentUser ? (
                <div className="flex flex-col gap-2 pt-2 border-t border-[#1C1A17]/10">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button key={n} onClick={() => setNewRating(n)} className="text-lg cursor-pointer leading-none">
                        {n <= newRating ? '★' : '☆'}
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    placeholder="이 상품에 대한 리뷰를 남겨주세요"
                    className="w-full text-[13px] p-2.5 border border-[#1C1A17]/15 bg-white resize-none"
                    rows={2}
                  />
                  {reviewError && (
                    <p className="text-[12px] text-red-600">{reviewError}</p>
                  )}
                  <button
                    onClick={handleSubmitReview}
                    disabled={!newComment.trim() || submitting}
                    className="self-end px-4 py-2 bg-gray-900 text-white text-xs font-medium disabled:opacity-40 cursor-pointer"
                  >
                    리뷰 등록
                  </button>
                </div>
              ) : (
                <p className="text-[13px] text-gray-400 pt-2 border-t border-[#1C1A17]/10">리뷰를 남기려면 로그인이 필요합니다.</p>
              )}
            </div>
          )}

          <h1 className="text-[40px] md:text-[48px] leading-[1.02] font-black tracking-tight mb-6 text-gray-900">
            {product.name}
          </h1>

          <p className={`text-[28px] font-bold tracking-tight text-gray-900 ${showDuty ? 'mb-1' : 'mb-6'}`}>
            {fmt(product.price)}
          </p>

          {showDuty && (
            <p className="text-xs text-gray-400 mb-6">
              * 예상 원화가 약 {priceKrw ? `${Math.round(priceKrw).toLocaleString()}원` : '환율 로딩중'} · 예상 관세 약 {duty ? `${duty.total.toLocaleString()}원` : '계산중'}
            </p>
          )}

          {/* 수량 + 장바구니 */}
          <div className="flex gap-2.5 mb-4.5">
            {!isSoldOut && (
              <div className="flex items-center border-[1.5px] border-gray-300">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-[46px] h-[54px] cursor-pointer text-lg">−</button>
                <span className="w-9 text-center text-sm">{qty}</span>
                <button onClick={() => setQty(q => q + 1)} className="w-[46px] h-[54px] cursor-pointer text-lg">+</button>
              </div>
            )}
            <button
              onClick={isSoldOut ? undefined : handleAdd}
              disabled={isSoldOut}
              className={`flex-1 flex items-center justify-between px-5 h-[54px] text-sm font-medium transition-colors ${
                isSoldOut
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-[#DAD4CD] hover:bg-[#2C5F2D] text-white cursor-pointer'
              }`}
            >
              <span>{isSoldOut ? '품절' : '장바구니 담기'}</span>
              <span className="opacity-85">{fmt(product.price)}</span>
            </button>
          </div>

          <div className="pt-4.5 border-t border-gray-200">
            <span className="inline-flex items-center gap-2 text-[13px] font-medium text-gray-700">♡ 위시리스트 추가</span>
          </div>

          <div className="mt-5 flex flex-col">
            {previewRows.map(row => (
              <div key={row.k} className="flex justify-between gap-4 py-2.5 border-t border-[#1C1A17]/15 text-base">
                <span className="font-medium text-gray-700">{row.k}</span>
                <span className="text-gray-400 text-right">{row.v}</span>
              </div>
            ))}
          </div>

          <p className="text-[20px] leading-relaxed text-gray-600 mt-5 pt-5 border-t border-[#1C1A17]/15">
            {product.description}
          </p>
        </section>
      </div>

      {/* 추천상품 헤더 */}
      <div className="max-w-[1640px] mx-auto px-5 mt-24 md:mt-[140px]">
        <h2 className="text-[13px] font-medium tracking-wide border-t border-gray-900 pt-2.5">함께 보면 좋은 와인.</h2>
      </div>

      {/* 푸드 페어링 배너 */}
      {foodGuide && (
        <section className="relative max-w-[1640px] mx-auto px-5 py-16 mt-10 overflow-hidden">
          {foodGuide.imageUrl && (
            <img src={foodGuide.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover blur-2xl scale-110 z-0" />
          )}
          <div className="absolute inset-0 bg-black/55 z-[1]" />
          <div className="relative z-[2] grid md:grid-cols-3 gap-8 text-white">
            <h3 className="text-[22px] font-medium">푸드 페어링 가이드.</h3>
            <Link href="/events/food" className="md:col-span-2 flex gap-5 items-end no-underline text-white">
              <div className="w-[132px] flex-shrink-0 aspect-[4/5] overflow-hidden">
                {foodGuide.imageUrl
                  ? <img src={foodGuide.imageUrl} alt={foodGuide.name} className="w-full h-full object-cover block" />
                  : <div className="w-full h-full bg-orange-50" />
                }
              </div>
              <div className="flex-1">
                <p className="text-xl font-medium mb-3">{foodGuide.name}</p>
                <p className="text-xs font-medium mb-1 opacity-85">Preview.</p>
                <p className="text-xs leading-relaxed mb-4 opacity-85">와인과 함께 즐기기 좋은 테이블 코드의 식품 셀렉션을 만나보세요…</p>
                <span className="text-xs font-medium inline-flex items-center gap-1.5">가이드 보기 →</span>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* 추천상품 그리드 */}
      {recommended.length > 0 && (
        <section className="max-w-[1640px] mx-auto px-5 mt-0 pb-32">
          <div className="flex items-baseline justify-end mb-9">
            <Link href="/events/wines" className="text-sm font-medium text-gray-900 no-underline inline-flex gap-1.5 items-center">전체보기 →</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {recommended.map(rec => (
              <ProductGridCard key={rec.id} product={rec} />
            ))}
          </div>
        </section>
      )}

      {/* 스크롤 sticky 구매바 */}
      {sticky && (
        <div className="fixed left-0 right-0 bottom-0 z-[70] bg-white/96 backdrop-blur border-t border-gray-200 animate-[wh-slideup_0.28s_ease]">
          <div className="max-w-[1640px] mx-auto px-5 py-3 flex items-center justify-between gap-6">
            <div className="flex items-center gap-3.5">
              <div className={`w-11 h-[58px] flex-shrink-0 overflow-hidden ${bg}`}>
                {images[0] && <img src={images[0]} alt="" className="w-full h-full object-cover" />}
              </div>
              <p className="text-base font-medium text-gray-900">{product.name}</p>
            </div>
            <button
              onClick={isSoldOut ? undefined : handleAdd}
              disabled={isSoldOut}
              className={`flex items-center gap-7 px-5 h-12 text-sm font-medium transition-colors ${
                isSoldOut
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-[#8B4513] hover:bg-[#2C5F2D] text-white cursor-pointer'
              }`}
            >
              <span>{isSoldOut ? '품절' : '장바구니 담기'}</span>
              <span className="opacity-85">{fmt(product.price)}</span>
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
