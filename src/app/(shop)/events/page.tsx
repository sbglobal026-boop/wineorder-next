'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useAppConfig } from '@/context/AppConfigContext'
import { useAuth } from '@/context/AuthContext'
import { fetchReviews, addReview, ProductReview } from '@/lib/reviews'

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

export default function TopDropPage() {
  const { config, addToCart } = useAppConfig()
  const { currentUser } = useAuth()
  const product = config.products.find(p => p.id === config.featuredWineId) ?? config.products[0]
  const recommended = config.products.filter(p => p.id !== product?.id).slice(0, 4)
  const foodGuide = config.products.find(p => p.type === 'food')

  const [activeImg, setActiveImg] = useState(0)
  const [qty, setQty] = useState(1)
  const [toast, setToast] = useState(false)
  const [sticky, setSticky] = useState(false)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [reviews, setReviews] = useState<ProductReview[]>([])
  const [reviewOpen, setReviewOpen] = useState(false)
  const [newRating, setNewRating] = useState(5)
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [reviewError, setReviewError] = useState<string | null>(null)

  useEffect(() => {
    setActiveImg(0)
    setQty(1)
  }, [product?.id])

  useEffect(() => {
    if (!product) return
    fetchReviews(product.id).then(setReviews)
  }, [product?.id])

  useEffect(() => {
    const onScroll = () => setSticky(window.scrollY > 560)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current) }, [])

  if (!product) return null

  const images = [product.imageUrl, ...(product.extraImages ?? [])].filter(Boolean) as string[]
  const bg = categoryBg[product.category] ?? 'bg-gray-50'

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) addToCart(product.id)
    setToast(true)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(false), 2200)
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

  const previewRows = [
    { k: 'Vintage', v: extractVintage(product.name) },
    { k: 'Origin', v: product.origin },
    { k: 'Rating', v: `★ ${avgRating.toFixed(1)}` },
  ]

  return (
    <div className="bg-[#F9F4EE] min-h-screen">

      <div className="max-w-[1640px] mx-auto px-5 pt-10 grid md:grid-cols-2 gap-20 items-start">

        {/* 갤러리 */}
        <section>
          <p className="text-[11px] font-bold tracking-[0.18em] text-gray-400 uppercase mb-3.5">
            Today&apos;s Top Drop · {product.category}
          </p>

          <div className={`relative w-full aspect-square ${bg} overflow-hidden`}>
            {images.length > 0
              ? <img src={images[activeImg]} alt={product.name} className="absolute inset-0 w-full h-full object-cover" />
              : <span className="absolute inset-0 flex items-center justify-center text-[160px] select-none">🍷</span>
            }
          </div>

          {images.length > 1 && (
            <div className="grid grid-cols-3 gap-3 mt-3.5">
              {images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`aspect-square p-0 ${bg} overflow-hidden cursor-pointer`}
                >
                  <img src={src} alt="" className="w-full h-full object-cover block" />
                </button>
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
                    placeholder="이 와인에 대한 리뷰를 남겨주세요"
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

          <p className="text-[28px] font-bold tracking-tight mb-6 text-gray-900">
            {fmt(product.price)}
          </p>

          {/* 수량 + 장바구니 */}
          <div className="flex gap-2.5 mb-4.5">
            <div className="flex items-center border-[1.5px] border-gray-300">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-[46px] h-[54px] cursor-pointer text-lg">−</button>
              <span className="w-9 text-center text-sm">{qty}</span>
              <button onClick={() => setQty(q => q + 1)} className="w-[46px] h-[54px] cursor-pointer text-lg">+</button>
            </div>
            <button
              onClick={handleAdd}
              className="flex-1 flex items-center justify-between px-5 h-[54px] bg-[#DAD4CD] hover:bg-[#2C5F2D] text-white text-sm font-medium transition-colors cursor-pointer"
            >
              <span>장바구니 담기</span>
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
        <section className="max-w-[1640px] mx-auto px-5 mt-24 md:mt-[140px] pb-32">
          <div className="flex items-baseline justify-between mb-9">
            <h2 className="text-[40px] font-black tracking-tight text-gray-900">하우스 추천.</h2>
            <Link href="/events/wines" className="text-sm font-medium text-gray-900 no-underline inline-flex gap-1.5 items-center">전체보기 →</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {recommended.map(rec => {
              const href = rec.type === 'wine' ? `/events/wines/${rec.id}` : `/events/food/${rec.id}`
              return (
                <div key={rec.id} className="flex flex-col">
                  <Link href={href} className="relative aspect-[3/4] block no-underline overflow-hidden">
                    <div className={`absolute inset-0 ${categoryBg[rec.category] ?? 'bg-gray-50'}`} />
                    {rec.imageUrl
                      ? <img src={rec.imageUrl} alt={rec.name} className="absolute inset-0 w-full h-full object-contain p-3.5" />
                      : <span className="absolute inset-0 flex items-center justify-center text-6xl select-none">{rec.type === 'wine' ? '🍷' : '🧀'}</span>
                    }
                  </Link>
                  <Link href={href} className="no-underline text-gray-900">
                    <p className="text-[17px] font-medium mt-3.5 mb-3 tracking-tight truncate">{rec.name}</p>
                  </Link>
                  <div className="flex gap-7 mb-3.5">
                    <div>
                      <p className="text-xs font-medium mb-0.5">원산지.</p>
                      <p className="text-xs text-gray-400">{rec.origin}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium mb-0.5">등급.</p>
                      <p className="text-xs text-gray-400">★ {rec.rating}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { addToCart(rec.id) }}
                    className="mt-auto flex items-center justify-between px-3.5 py-3 border border-gray-200 bg-white text-[13px] font-medium cursor-pointer hover:border-gray-900 transition-colors"
                  >
                    <span>장바구니 담기</span>
                    <span className="inline-flex items-center gap-2.5 text-gray-400">{fmt(rec.price)} <span className="text-base text-gray-900">+</span></span>
                  </button>
                </div>
              )
            })}
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
              onClick={handleAdd}
              className="flex items-center gap-7 px-5 h-12 bg-[#8B4513] hover:bg-[#2C5F2D] text-white text-sm font-medium transition-colors cursor-pointer"
            >
              <span>장바구니 담기</span>
              <span className="opacity-85">{fmt(product.price)}</span>
            </button>
          </div>
        </div>
      )}

      {/* 토스트 */}
      {toast && (
        <div className="fixed left-1/2 bottom-24 -translate-x-1/2 z-[90] bg-gray-900 text-white px-5.5 py-3.5 text-sm font-medium shadow-lg">
          장바구니에 추가됨 ✓
        </div>
      )}

    </div>
  )
}
