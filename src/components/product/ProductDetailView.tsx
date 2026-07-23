'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Product } from '@/data/products'
import { useAppConfig } from '@/context/AppConfigContext'
import { useAuth } from '@/context/AuthContext'
import { fetchReviews, addReview, ProductReview } from '@/lib/reviews'
import ProductGridCard from '@/components/product/ProductGridCard'

// 카테고리별 상단 카드 그라데이션 (카드 컨셉)
const categoryGradient: Record<string, string> = {
  '레드': 'radial-gradient(100% 120% at 65% 8%, #f2e6e1, #e6cdc4)',
  '화이트': 'radial-gradient(100% 120% at 65% 8%, #eef0dd, #dde5c5)',
  '로제': 'radial-gradient(100% 120% at 65% 8%, #f7e7cf, #f1d6b0)',
  '스파클링': 'radial-gradient(100% 120% at 65% 8%, #e7e0ee, #d3c8e0)',
  '식품': 'radial-gradient(100% 120% at 65% 8%, #f3ddc7, #e8c39a)',
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
  topDrop = false,
}: {
  product: Product
  eyebrow?: string
  backLink?: { href: string; label: string }
  showDuty?: boolean
  topDrop?: boolean // true면 상품 히어로 위에 Top Drop 전용 인트로 밴드 표시 (/events 전용)
}) {
  const { config, addToCart, openCart } = useAppConfig()
  const { currentUser } = useAuth()
  const router = useRouter()
  const recommended = config.products.filter(p => p.id !== product.id).slice(0, 8)
  const foodGuide = config.products.find(p => p.type === 'food')

  const [activeImg, setActiveImg] = useState(0)
  const [qty, setQty] = useState(1)
  const [sticky, setSticky] = useState(false)
  const carouselRef = useRef<HTMLDivElement>(null)

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
  const gradient = categoryGradient[product.category] ?? categoryGradient['로제']
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

  const handleBuyNow = () => {
    for (let i = 0; i < qty; i++) addToCart(product.id)
    router.push('/cart')
  }

  const scrollCarousel = (dir: 'left' | 'right') => {
    carouselRef.current?.scrollBy({ left: dir === 'right' ? 328 : -328, behavior: 'smooth' })
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

  // 상품 정보 스펙표 (용량·알코올은 데이터 필드 없음 → 껍데기 '—')
  const specRows = [
    { k: '원산지', v: product.origin },
    { k: '품종', v: product.grapeVariety || '—' },
    { k: '빈티지', v: extractVintage(product.name) },
    { k: '평가', v: criticRatings.length > 0 ? criticRatings.join(', ') : '—' },
    { k: '용량', v: '—' },
    { k: '알코올', v: '—' },
  ]
  const hashtags = [`#${product.category}`, product.type === 'wine' ? '#와인' : '#식품', '#선물추천']

  // 할인 표시용 껍데기 — 정가/할인율 필드가 데이터에 생기면 여기에 연결
  const originalPrice: number | null = null
  const discountRate: number | null = null

  const catLabel = product.category

  return (
    <div className="min-h-screen" style={{ background: 'radial-gradient(120% 90% at 15% 0%, #faf5ec 0%, #F9F4EE 55%)' }}>

      {/* 뒤로가기 */}
      {backLink && (
        <div className="max-w-[1240px] mx-auto px-5 pt-8">
          <Link
            href={backLink.href}
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#7d5411] hover:opacity-70 transition-opacity no-underline"
          >
            <ChevronLeft size={14} strokeWidth={2.5} /> {backLink.label}
          </Link>
        </div>
      )}

      {/* ===== Top Drop 전용 인트로 밴드 (/events 에서만) ===== */}
      {topDrop && (
        <section className="max-w-[1240px] mx-auto px-5 pt-14 md:pt-20 pb-4 md:pb-6 text-center">
          <div className="inline-flex items-center gap-2.5 text-[16px] md:text-[18px] tracking-[0.28em] uppercase text-[#7d5411] mb-4">
            <span className="w-8 h-px bg-[#b68235]/50" />
            Top Drop
            <span className="w-8 h-px bg-[#b68235]/50" />
          </div>
          <h1 className="font-[family-name:var(--font-playfair-display)] font-medium text-[40px] md:text-[56px] leading-[1.05] text-[#1C1A17] mb-4">
            Today&rsquo;s Drop
          </h1>
          <p className="text-[17px] md:text-[20px] leading-[1.7] text-[#605d5d] max-w-[600px] mx-auto">
            저희가 진짜 마셔보고 엄선한 와인이에요. 믿어주세요.
          </p>
        </section>
      )}

      {/* ===== 대표 상품 히어로 ===== */}
      <section className="max-w-[1240px] mx-auto px-5 pt-8 md:pt-10 grid md:grid-cols-2 gap-8 md:gap-12 items-start">
        {/* 이미지 카드 */}
        <div className="relative rounded-[30px] border border-[#eae7e7] overflow-hidden aspect-square" style={{ background: gradient }}>
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
            : <span className="absolute inset-0 flex items-center justify-center text-[120px] select-none">{product.type === 'wine' ? '🍷' : '🧀'}</span>
          }
          {isSoldOut && (
            <div className="absolute inset-0 bg-black/45 flex items-center justify-center z-10">
              <span className="text-white text-sm font-bold tracking-widest uppercase border border-white/60 px-5 py-2">Sold Out</span>
            </div>
          )}
          {images.length > 1 && (
            <>
              <button onClick={() => setActiveImg(i => (i - 1 + images.length) % images.length)} className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/70 hover:bg-white flex items-center justify-center text-[#1C1A17] shadow-sm transition-colors">‹</button>
              <button onClick={() => setActiveImg(i => (i + 1) % images.length)} className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/70 hover:bg-white flex items-center justify-center text-[#1C1A17] shadow-sm transition-colors">›</button>
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10">
                {images.map((_, i) => (
                  <button key={i} onClick={() => setActiveImg(i)} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === activeImg ? 'bg-[#7d5411]' : 'bg-white/70'}`} />
                ))}
              </div>
            </>
          )}
        </div>

        {/* 정보 */}
        <div className="flex flex-col">
          {/* 별점 + 리뷰 토글 */}
          <div className="flex items-center gap-2.5 mb-3">
            <span className="text-[#b68235] text-sm tracking-wide">{'★'.repeat(Math.round(avgRating))}{'☆'.repeat(5 - Math.round(avgRating))}</span>
            <button onClick={() => setReviewOpen(o => !o)} className="text-[13px] text-[#7d5411] underline underline-offset-2 cursor-pointer">
              고객 리뷰 {reviews.length}개 {reviewOpen ? '▴' : '▾'}
            </button>
          </div>

          {/* 리뷰 패널 — 토글 버튼 바로 아래 */}
          {reviewOpen && (
            <div className="mb-5 p-4 bg-white/70 border border-[#eae7e7] rounded-2xl flex flex-col gap-4">
              {reviews.length === 0 && <p className="text-[13px] text-[#9b9797]">아직 등록된 리뷰가 없습니다.</p>}
              {reviews.map(r => (
                <div key={r.id} className="flex flex-col gap-1 pb-3 border-b border-[#eae7e7] last:border-b-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium text-[#1C1A17]">{r.author_name}</span>
                    <span className="text-xs text-[#9b9797]">{new Date(r.created_at).toLocaleDateString()}</span>
                  </div>
                  <span className="text-[#b68235] text-xs">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                  <p className="text-[13px] text-[#605d5d] leading-relaxed">{r.comment}</p>
                </div>
              ))}
              {currentUser ? (
                <div className="flex flex-col gap-2 pt-2 border-t border-[#eae7e7]">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button key={n} onClick={() => setNewRating(n)} className="text-lg cursor-pointer leading-none text-[#b68235]">{n <= newRating ? '★' : '☆'}</button>
                    ))}
                  </div>
                  <textarea value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="이 상품에 대한 리뷰를 남겨주세요" className="w-full text-[13px] p-2.5 border border-[#eae7e7] rounded-lg bg-white resize-none" rows={2} />
                  {reviewError && <p className="text-[12px] text-red-600">{reviewError}</p>}
                  <button onClick={handleSubmitReview} disabled={!newComment.trim() || submitting} className="self-end px-4 py-2 rounded-full bg-[#7d5411] text-white text-xs font-medium disabled:opacity-40 cursor-pointer">리뷰 등록</button>
                </div>
              ) : (
                <p className="text-[13px] text-[#9b9797] pt-2 border-t border-[#eae7e7]">리뷰를 남기려면 로그인이 필요합니다.</p>
              )}
            </div>
          )}

          <div className="text-[12px] tracking-[0.22em] uppercase text-[#7d5411] mb-3">{eyebrow} · {catLabel}</div>
          <h1 className="font-[family-name:var(--font-playfair-display)] text-[34px] md:text-[42px] leading-[1.1] text-[#1C1A17] mb-4">
            {product.name}
          </h1>
          <p className="text-[15px] leading-[1.75] text-[#605d5d] mb-6 max-w-[46ch] whitespace-pre-line">{product.description}</p>

          {/* 가격 (+ 할인 껍데기) */}
          <div className="flex items-baseline gap-2.5 mb-1">
            <span className="font-[family-name:var(--font-playfair-display)] text-[34px] text-[#1C1A17]">{fmt(product.price)}</span>
            {originalPrice && (
              <span className="text-[15px] text-[#9b9797] line-through">{fmt(originalPrice)}</span>
            )}
            {discountRate && (
              <span className="text-[12px] font-semibold text-[#7d5411] border border-[#b68235] rounded-full px-2.5 py-1">{discountRate}% OFF</span>
            )}
          </div>

          {showDuty && (
            <div className="mb-5">
              <p className="text-xs text-[#7d5411]">* 예상 원화가 약 {priceKrw ? `${Math.round(priceKrw).toLocaleString()}원` : '환율 로딩중'} · 예상 관세 약 {duty ? `${duty.total.toLocaleString()}원` : '계산중'}</p>
              <p className="text-xs text-[#7d5411] mt-0.5">* 배송비 별도</p>
            </div>
          )}

          {/* 수량 + 버튼 */}
          <div className="flex flex-wrap gap-2.5 mt-3">
            {!isSoldOut && (
              <div className="flex items-center rounded-full border border-[#d7d3d3] overflow-hidden">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-11 h-12 cursor-pointer text-lg text-[#605d5d]">−</button>
                <span className="w-9 text-center text-sm">{qty}</span>
                <button onClick={() => setQty(q => q + 1)} className="w-11 h-12 cursor-pointer text-lg text-[#605d5d]">+</button>
              </div>
            )}
            {isSoldOut ? (
              <span className="flex-1 min-w-[160px] flex items-center justify-center h-12 rounded-full bg-[#eae7e7] text-[#9b9797] text-sm">품절</span>
            ) : (
              <>
                <button onClick={handleBuyNow} className="buybtn flex-1 min-w-[130px] h-12 rounded-full bg-[#7d5411] text-[#fffdf9] text-sm font-medium hover:bg-[#5a3b0a] transition-colors cursor-pointer">
                  바로 구매
                </button>
                <button onClick={handleAdd} className="buybtn flex-1 min-w-[130px] h-12 rounded-full border border-[#b68235] text-[#7d5411] text-sm font-medium hover:bg-[#7d5411] hover:text-[#fffdf9] transition-colors cursor-pointer">
                  장바구니 담기
                </button>
              </>
            )}
          </div>

          <div className="mt-5 pt-4 border-t border-[#eae7e7]">
            <span className="inline-flex items-center gap-2 text-[13px] font-medium text-[#605d5d]">♡ 위시리스트 추가</span>
          </div>
        </div>
      </section>

      {/* 구분선 */}
      <div className="max-w-[1240px] mx-auto px-5 my-14 md:my-20"><div className="h-px bg-[#eae7e7]" /></div>

      {/* ===== 상품 상세 설명 (사진 → 글) ===== */}
      <section className="max-w-[1240px] mx-auto px-5">
        <div className="text-center mb-7">
          <div className="text-[12px] tracking-[0.24em] uppercase text-[#7d5411] mb-2">Product Detail</div>
          <h3 className="font-[family-name:var(--font-playfair-display)] text-[28px] md:text-[30px] text-[#1C1A17]">상품 상세 설명</h3>
        </div>

        {/* 글 설명 */}
        <div className="grid md:grid-cols-[1.4fr_1fr] gap-8 md:gap-12">
          <div>
            <h4 className="font-[family-name:var(--font-playfair-display)] text-[24px] text-[#1C1A17] mb-3.5">테이스팅 노트</h4>
            <p className="text-[15px] leading-[1.85] text-[#605d5d] whitespace-pre-line">{product.description}</p>
          </div>
          <div className="md:border-l md:border-[#eae7e7] md:pl-8">
            <h4 className="font-[family-name:var(--font-playfair-display)] text-[20px] text-[#1C1A17] mb-4">상품 정보</h4>
            <div className="flex flex-col gap-3 text-sm">
              {specRows.map((row, i) => (
                <div key={row.k} className={`flex justify-between gap-4 ${i < specRows.length - 1 ? 'border-b border-dotted border-[#d7d3d3] pb-2' : ''}`}>
                  <span className="text-[#9b9797]">{row.k}</span>
                  <span className="text-[#1C1A17] text-right">{row.v}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {hashtags.map(tag => (
                <span key={tag} className="text-[12px] text-[#7d5411] border border-[#e2d9c8] rounded-full px-3 py-1">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 구분선 */}
      <div className="max-w-[1240px] mx-auto px-5 my-14 md:my-20"><div className="h-px bg-[#eae7e7]" /></div>

      {/* ===== 함께 곁들이기 좋은 (가로 캐러셀) ===== */}
      {recommended.length > 0 && (
        <section className="max-w-[1240px] mx-auto pb-24">
          <div className="px-5 flex items-center justify-between mb-5">
            <h3 className="font-[family-name:var(--font-playfair-display)] text-[26px] md:text-[28px] text-[#1C1A17]">함께 곁들이기 좋은</h3>
            <div className="hidden md:flex items-center gap-2.5">
              <button onClick={() => scrollCarousel('left')} className="w-10 h-10 rounded-full border border-[#d7d3d3] text-[#605d5d] hover:border-[#b68235] hover:text-[#7d5411] flex items-center justify-center transition-colors">
                <ChevronLeft size={18} />
              </button>
              <button onClick={() => scrollCarousel('right')} className="w-10 h-10 rounded-full border border-[#b68235] text-[#7d5411] hover:bg-[#7d5411] hover:text-white flex items-center justify-center transition-colors">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
          {/* pt/pb: 호버 시 카드가 떠오르고 그림자가 생겨도 잘리지 않도록 세로 여백 확보 */}
          <div ref={carouselRef} className="flex gap-5 px-5 pt-5 pb-12 overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-smooth">
            {recommended.map(rec => (
              <div key={rec.id} className="flex-none w-[240px] md:w-[280px] snap-start">
                <ProductGridCard product={rec} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ===== 푸드 페어링 배너 (기존 기능 유지) ===== */}
      {foodGuide && (
        <section className="relative max-w-[1240px] mx-auto px-5 pb-24">
          <div className="relative rounded-[26px] overflow-hidden py-14 px-8 md:px-12">
            {foodGuide.imageUrl && (
              <img src={foodGuide.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover blur-2xl scale-110 z-0" />
            )}
            <div className="absolute inset-0 bg-black/55 z-[1]" />
            <div className="relative z-[2] grid md:grid-cols-3 gap-8 text-white">
              <h3 className="font-[family-name:var(--font-playfair-display)] text-[22px]">푸드 페어링 가이드.</h3>
              <Link href="/events/food" className="md:col-span-2 flex gap-5 items-end no-underline text-white">
                <div className="w-[132px] flex-shrink-0 aspect-[4/5] rounded-2xl overflow-hidden">
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
          </div>
        </section>
      )}

      {/* 스크롤 sticky 구매바 */}
      {sticky && (
        <div className="fixed left-0 right-0 bottom-0 z-[70] bg-[#FBFAF7]/96 backdrop-blur border-t border-[#eae7e7] animate-[wh-slideup_0.28s_ease]">
          <div className="max-w-[1240px] mx-auto px-5 py-3 flex items-center justify-between gap-6">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-[52px] flex-shrink-0 rounded-xl overflow-hidden" style={{ background: gradient }}>
                {images[0] && <img src={images[0]} alt="" className="w-full h-full object-contain p-1" />}
              </div>
              <p className="text-base font-medium text-[#1C1A17] truncate">{product.name}</p>
            </div>
            <button
              onClick={isSoldOut ? undefined : handleAdd}
              disabled={isSoldOut}
              className={`flex items-center gap-6 px-5 h-12 rounded-full text-sm font-medium transition-colors ${
                isSoldOut ? 'bg-[#eae7e7] text-[#9b9797] cursor-not-allowed' : 'bg-[#7d5411] hover:bg-[#5a3b0a] text-[#fffdf9] cursor-pointer'
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
