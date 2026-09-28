'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Grape, Wine, MapPin, Star, Building2, Truck } from 'lucide-react'
import { Product } from '@/data/products'
import { fetchWineryByProductId, type Winery } from '@/lib/wineries'
import { useAppConfig } from '@/context/AppConfigContext'
import { useAuth } from '@/context/AuthContext'
import { fetchReviews, addReview, deleteReview, ProductReview } from '@/lib/reviews'
import { fetchWishlist, addToWishlist, removeFromWishlist } from '@/lib/wishlist'
import ProductGridCard from '@/components/product/ProductGridCard'
import { VENDOR_MARKETPLACE_ENABLED } from '@/lib/featureFlags'
import { calcDuty } from '@/lib/orderPricing'
import { useMemberTiers } from '@/lib/memberBadges'
import TierBadge from '@/components/member/TierBadge'
import { formatEur } from '@/lib/formatPrice'
import BlogContent from '@/components/blog/BlogContent'

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

// 예전에 저장된 설명은 태그 없는 일반 글, 새로 쓴 설명은 사진이 섞인 HTML.
// 둘 다 깨지지 않게 형태를 보고 나눠서 그린다.
function looksLikeHtml(text: string): boolean {
  return /<(p|div|img|h2|h3|ul|ol|br|hr|blockquote|span|strong|em)\b/i.test(text)
}

const fmt = formatEur

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

  // 연결된 와이너리 — 경로 표시와 "와이너리 보기" 버튼에 사용
  const [winery, setWinery] = useState<Winery | null>(null)
  useEffect(() => {
    let ignore = false
    fetchWineryByProductId(product.id)
      .then(w => { if (!ignore) setWinery(w) })
      .catch(() => { if (!ignore) setWinery(null) })
    return () => { ignore = true }
  }, [product.id])

  // 위시리스트
  const [wished, setWished] = useState(false)
  useEffect(() => {
    if (!currentUser) { setWished(false); return }
    fetchWishlist(currentUser.id).then(ids => setWished(ids.includes(product.id))).catch(err => console.error('위시리스트 조회 실패', err))
  }, [currentUser, product.id])

  const toggleWish = async () => {
    if (!currentUser) { router.push('/login'); return }
    const next = !wished
    setWished(next)
    if (next) await addToWishlist(currentUser.id, product.id)
    else await removeFromWishlist(currentUser.id, product.id)
  }

  const [activeImg, setActiveImg] = useState(0)
  const [qty, setQty] = useState(1)
  const [sticky, setSticky] = useState(false)
  const carouselRef = useRef<HTMLDivElement>(null)

  const [reviews, setReviews] = useState<ProductReview[]>([])
  // 리뷰 작성자 등급 (작성자 이름 옆 배지)
  const reviewerTiers = useMemberTiers(reviews.map(r => r.user_id))
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
    fetchReviews(product.id).then(setReviews).catch(err => console.error('리뷰 조회 실패', err))
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
  // 예약 주문 상품 — 재고 상품과 배송 기간이 달라 상세에서도 알려줌
  const isPreorder = config.preorderWineIds.includes(product.id)

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

  const handleDeleteReview = async (reviewId: number) => {
    if (!currentUser) return
    setReviewError(null)
    try {
      await deleteReview(reviewId, currentUser.id)
      setReviews(prev => prev.filter(r => r.id !== reviewId))
    } catch (err) {
      setReviewError(err instanceof Error ? err.message : '리뷰 삭제에 실패했습니다')
    }
  }

  const priceKrw = (showDuty && eurToKrw) ? product.price * eurToKrw : null
  const duty = (showDuty && eurToKrw && eurToUsd) ? calcDuty(product.price, 1, eurToKrw, eurToUsd, product.origin) : null

  const criticRatings = (product.criticRatings ?? '').split(',').map(s => s.trim()).filter(Boolean).slice(0, 3)

  const catLabel = product.category

  // 제목 아래 아이콘 스펙 — 값이 있는 줄만 보여줌 (빈 줄로 '—'가 늘어서지 않게)
  const vintage = extractVintage(product.name)
  const bottleLine = [
    catLabel,
    product.alcohol ? `${product.alcohol}% Vol.` : '',
    product.volume ? `${product.volume}ml` : '',
  ].filter(Boolean).join(' · ')
  const specs: { icon: React.ReactNode; lines: string[]; muted?: boolean }[] = [
    ...(product.grapeVariety ? [{ icon: <Grape size={20} strokeWidth={1.5} />, lines: [product.grapeVariety] }] : []),
    ...(bottleLine ? [{ icon: <Wine size={20} strokeWidth={1.5} />, lines: [bottleLine, vintage !== '—' ? `빈티지 ${vintage}` : ''].filter(Boolean) }] : []),
    // 평론가 점수는 어드민에 입력이 없어도 자리를 비워 둔 채로 항상 보여줌
    criticRatings.length > 0
      ? { icon: <Star size={20} strokeWidth={1.5} />, lines: criticRatings }
      : { icon: <Star size={20} strokeWidth={1.5} />, lines: ['평가 미등록'], muted: true },
    ...(product.origin || winery ? [{
      icon: <MapPin size={20} strokeWidth={1.5} />,
      lines: [[product.origin, winery?.region].filter(Boolean).join(', ')].filter(Boolean),
    }] : []),
    ...(VENDOR_MARKETPLACE_ENABLED && product.vendorName
      ? [{ icon: <Building2 size={20} strokeWidth={1.5} />, lines: [product.vendorName] }] : []),
  ]

  // 리터당 가격 (750ml 등 용량이 있을 때만)
  const volumeMl = Number(product.volume)
  const pricePerLiter = volumeMl > 0 ? product.price / (volumeMl / 1000) : null

  const hashtags = [`#${product.category}`, product.type === 'wine' ? '#와인' : '#식품', '#선물추천']

  // 할인 표시용 껍데기 — 정가/할인율 필드가 데이터에 생기면 여기에 연결
  const originalPrice: number | null = null
  const discountRate: number | null = null


  return (
    <div className="min-h-screen" style={{ background: 'radial-gradient(120% 90% at 15% 0%, #F9F4EE 0%, #F9F4EE 55%)' }}>

      {/* 경로 표시 (홈 › 목록 › 원산지 › 와이너리 › 상품명) */}
      {backLink && (
        <div className="max-w-[1240px] mx-auto px-5 pt-8">
          <nav aria-label="현재 위치" className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[12.5px] text-[#9b9797]">
            <Link href="/" className="hover:text-[#0e3719] transition-colors no-underline">홈</Link>
            <ChevronRight size={13} strokeWidth={2} className="text-[#c9c4c4]" />
            <Link href={backLink.href} className="hover:text-[#0e3719] transition-colors no-underline">{backLink.label}</Link>
            {product.origin && (
              <>
                <ChevronRight size={13} strokeWidth={2} className="text-[#c9c4c4]" />
                <span>{product.origin}</span>
              </>
            )}
            {winery && (
              <>
                <ChevronRight size={13} strokeWidth={2} className="text-[#c9c4c4]" />
                <Link href={`/events/winery/${winery.slug}`} className="hover:text-[#0e3719] transition-colors no-underline">{winery.name}</Link>
              </>
            )}
            <ChevronRight size={13} strokeWidth={2} className="text-[#c9c4c4]" />
            <span className="text-[#1C1A17]">{product.name}</span>
          </nav>
        </div>
      )}

      {/* ===== Top Drop 전용 인트로 밴드 (/events 에서만) ===== */}
      {topDrop && (
        <section className="max-w-[1240px] mx-auto px-5 pt-14 md:pt-20 pb-4 md:pb-6 text-center">
          <div className="inline-flex items-center gap-2.5 text-[16px] md:text-[18px] tracking-[0.28em] uppercase text-[#0e3719] mb-4">
            <span className="w-8 h-px bg-[#5C7A63]/50" />
            Top Drop
            <span className="w-8 h-px bg-[#5C7A63]/50" />
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
          {/* 위시리스트 하트 (이미지 우측 상단) */}
          <button
            onClick={toggleWish}
            aria-label={wished ? '위시리스트에서 제거' : '위시리스트에 추가'}
            className="absolute top-4 right-4 z-20 w-11 h-11 rounded-full bg-white/85 hover:bg-white shadow-md flex items-center justify-center text-2xl leading-none transition-all hover:scale-110 cursor-pointer"
          >
            <span className={wished ? 'text-[#d94f5c]' : 'text-[#bab6b6]'}>{wished ? '♥' : '♡'}</span>
          </button>
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
                  <button key={i} onClick={() => setActiveImg(i)} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === activeImg ? 'bg-[#0e3719]' : 'bg-white/70'}`} />
                ))}
              </div>
            </>
          )}
        </div>

        {/* 정보 */}
        <div className="flex flex-col">
          {/* 별점 + 리뷰 토글 */}
          <div className="flex items-center gap-2.5 mb-3">
            <span className="text-[#5C7A63] text-sm tracking-wide">{'★'.repeat(Math.round(avgRating))}{'☆'.repeat(5 - Math.round(avgRating))}</span>
            <button onClick={() => setReviewOpen(o => !o)} className="text-[13px] text-[#0e3719] underline underline-offset-2 cursor-pointer">
              고객 리뷰 {reviews.length}개 {reviewOpen ? '▴' : '▾'}
            </button>
          </div>

          {/* 리뷰 모달 — 토글을 눌러도 레이아웃이 밀리지 않도록 팝업으로 표시 */}
          {reviewOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/50" onClick={() => setReviewOpen(false)} />
              <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-y-auto p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[15px] font-semibold text-[#1C1A17]">고객 리뷰 {reviews.length}개</h3>
                  <button onClick={() => setReviewOpen(false)} aria-label="닫기" className="text-[#9b9797] hover:text-[#1C1A17] text-xl leading-none cursor-pointer">×</button>
                </div>
                {reviews.length === 0 && <p className="text-[13px] text-[#9b9797]">아직 등록된 리뷰가 없습니다.</p>}
                {reviews.map(r => (
                  <div key={r.id} className="flex flex-col gap-1 pb-3 border-b border-[#eae7e7] last:border-b-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 min-w-0">
                        <span className="text-[13px] font-medium text-[#1C1A17] truncate">{r.author_name}</span>
                        {reviewerTiers[r.user_id] && <TierBadge tier={reviewerTiers[r.user_id]} className="shrink-0" />}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#9b9797]">{new Date(r.created_at).toLocaleDateString()}</span>
                        {currentUser?.id === r.user_id && (
                          <button onClick={() => handleDeleteReview(r.id)} className="text-xs text-red-500 hover:text-red-600 transition-colors cursor-pointer">삭제</button>
                        )}
                      </div>
                    </div>
                    <span className="text-[#5C7A63] text-xs">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                    <p className="text-[13px] text-[#605d5d] leading-relaxed">{r.comment}</p>
                  </div>
                ))}
                {currentUser ? (
                  <div className="flex flex-col gap-2 pt-2 border-t border-[#eae7e7]">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(n => (
                        <button key={n} onClick={() => setNewRating(n)} className="text-lg cursor-pointer leading-none text-[#5C7A63]">{n <= newRating ? '★' : '☆'}</button>
                      ))}
                    </div>
                    <textarea value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="이 상품에 대한 리뷰를 남겨주세요" className="w-full text-[13px] p-2.5 border border-[#eae7e7] rounded-lg bg-white resize-none" rows={2} />
                    {reviewError && <p className="text-[12px] text-red-600">{reviewError}</p>}
                    <button onClick={handleSubmitReview} disabled={!newComment.trim() || submitting} className="self-end px-4 py-2 rounded-full bg-[#0e3719] text-white text-xs font-medium disabled:opacity-40 cursor-pointer">리뷰 등록</button>
                  </div>
                ) : (
                  <p className="text-[13px] text-[#9b9797] pt-2 border-t border-[#eae7e7]">리뷰를 남기려면 로그인이 필요합니다.</p>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2.5 mb-3">
            <span className="text-[12px] tracking-[0.22em] uppercase text-[#0e3719]">{eyebrow === catLabel ? catLabel : `${eyebrow} · ${catLabel}`}</span>
            {isPreorder && (
              <span className="text-[11px] tracking-[0.12em] border border-[#c79a4e] text-[#8a5a12] rounded-full px-2.5 py-0.5">Preorder</span>
            )}
          </div>
          <h1 className="font-[family-name:var(--font-playfair-display)] text-[34px] md:text-[42px] leading-[1.1] text-[#1C1A17] mb-4">
            {product.name}
          </h1>
          {/* 설명은 아래 "테이스팅 노트"에서만 보여줌 (같은 글이 두 번 나오지 않게) */}

          {/* 와이너리로 이동 (상품에 와이너리가 연결된 경우만) */}
          {winery && (
            <Link
              href={`/events/winery/${winery.slug}`}
              className="self-start w-fit inline-flex items-center gap-1.5 mb-5 px-4 py-2 rounded-full border border-[#d7d3d3] text-[13px] text-[#1C1A17] hover:border-[#0e3719] hover:text-[#0e3719] transition-colors no-underline"
            >
              <Building2 size={14} strokeWidth={1.8} /> 와이너리 보기
            </Link>
          )}

          {/* 상품 정보 — 아이콘 + 줄 구분 (참고 사이트 구조) */}
          {specs.length > 0 && (
            <div className="mb-6 border-t border-[#eae7e7]">
              {specs.map((spec, i) => (
                <div key={i} className="flex items-start gap-4 py-3.5 border-b border-[#eae7e7]">
                  <span className="shrink-0 w-8 flex justify-center text-[#9b9797] pt-0.5">{spec.icon}</span>
                  <div className={`text-[14.5px] leading-[1.6] ${spec.muted ? 'text-[#c2bdbd]' : 'text-[#1C1A17]'}`}>
                    {spec.lines.map(line => <p key={line}>{line}</p>)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 가격 (+ 할인 껍데기) — 오른쪽에 재고·배송 예상 */}
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 mb-1">
            <div className="flex items-baseline gap-2.5">
              <span className="font-[family-name:var(--font-playfair-display)] text-[34px] text-[#1C1A17]">{fmt(product.price)}</span>
              {originalPrice && (
                <span className="text-[15px] text-[#9b9797] line-through">{fmt(originalPrice)}</span>
              )}
              {discountRate && (
                <span className="text-[12px] font-semibold text-[#0e3719] border border-[#5C7A63] rounded-full px-2.5 py-1">{discountRate}% OFF</span>
              )}
            </div>
            <div className="flex items-center gap-3.5 text-[12.5px] text-[#605d5d]">
              <span className="inline-flex items-center gap-1.5">
                <Truck size={15} strokeWidth={1.6} className="text-[#9b9797]" />
                {isPreorder ? '예약 주문 · 14일~2개월' : isSoldOut ? '입고 후 발송' : '7일 이내 수령'}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isSoldOut ? 'bg-[#c9c4c4]' : 'bg-[#2F8F4E]'}`} />
                {isSoldOut ? '품절' : '재고 있음'}
              </span>
            </div>
          </div>

          {/* 가격 밑 잔글씨 — 리터당 가격 · 상품번호 */}
          <p className="text-[12px] text-[#9b9797] mb-1">
            배송비 별도
            {pricePerLiter && <> · {product.volume}ml · 리터당 {fmt(Math.round(pricePerLiter * 100) / 100)}</>}
            {' · 상품번호 '}{product.id}
          </p>

          {showDuty && (
            <div className="mb-5">
              <p className="text-xs text-[#0e3719]">* 예상 원화가 약 {priceKrw ? `${Math.round(priceKrw).toLocaleString()}원` : '환율 로딩중'} · 예상 관세 약 {duty ? `${duty.total.toLocaleString()}원` : '계산중'}</p>
              <p className="text-xs text-[#0e3719]/70 mt-0.5">* 실제 결제 금액은 카드사 환율에 따라 달라질 수 있습니다</p>
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
                <button onClick={handleBuyNow} className="buybtn flex-1 min-w-[130px] h-12 rounded-full bg-[#0e3719] text-[#FFFFFF] text-sm font-medium hover:bg-[#22301C] transition-colors cursor-pointer">
                  바로 구매
                </button>
                <button onClick={handleAdd} className="buybtn flex-1 min-w-[130px] h-12 rounded-full border border-[#5C7A63] text-[#0e3719] text-sm font-medium hover:bg-[#0e3719] hover:text-[#FFFFFF] transition-colors cursor-pointer">
                  장바구니 담기
                </button>
              </>
            )}
          </div>

        </div>
      </section>

      {/* 구분선 */}
      <div className="max-w-[1240px] mx-auto px-5 my-14 md:my-20"><div className="h-px bg-[#eae7e7]" /></div>

      {/* ===== 상품 상세 설명 (사진 → 글) ===== */}
      <section className="max-w-[1240px] mx-auto px-5">
        <div className="text-center mb-7">
          <div className="text-[12px] tracking-[0.24em] uppercase text-[#0e3719] mb-2">Product Detail</div>
          <h3 className="font-[family-name:var(--font-playfair-display)] text-[28px] md:text-[30px] text-[#1C1A17]">상품 상세 설명</h3>
        </div>

        {/* 글 설명 — 상품 정보 표는 위쪽(제목 아래)으로 옮겨서 여기서는 설명만 보여줌 */}
        <div className="max-w-[760px] mx-auto">
          <h4 className="font-[family-name:var(--font-playfair-display)] text-[24px] text-[#1C1A17] mb-3.5">테이스팅 노트</h4>
          {looksLikeHtml(product.description ?? '')
            ? <BlogContent html={product.description ?? ''} className="text-[15px] leading-[1.85] text-[#605d5d]" />
            : <p className="text-[15px] leading-[1.85] text-[#605d5d] whitespace-pre-line">{product.description}</p>}
          <div className="mt-6 flex flex-wrap gap-2">
            {hashtags.map(tag => (
              <span key={tag} className="text-[12px] text-[#0e3719] border border-[#e2d9c8] rounded-full px-3 py-1">{tag}</span>
            ))}
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
              <button onClick={() => scrollCarousel('left')} className="w-10 h-10 rounded-full border border-[#d7d3d3] text-[#605d5d] hover:border-[#5C7A63] hover:text-[#0e3719] flex items-center justify-center transition-colors">
                <ChevronLeft size={18} />
              </button>
              <button onClick={() => scrollCarousel('right')} className="w-10 h-10 rounded-full border border-[#5C7A63] text-[#0e3719] hover:bg-[#0e3719] hover:text-white flex items-center justify-center transition-colors">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
          {/* pt/pb: 호버 시 카드가 떠오르고 그림자가 생겨도 잘리지 않도록 세로 여백 확보 */}
          {/* scroll-pl-5: px-5와 값을 맞춰야 스냅(snap-start)이 패딩을 무시하고 시작 지점을 카드 왼쪽 끝으로 당겨버리는 걸 방지함 */}
          <div ref={carouselRef} className="flex gap-5 px-5 pt-5 pb-12 overflow-x-auto snap-x snap-mandatory scroll-pl-5 no-scrollbar scroll-smooth">
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
                isSoldOut ? 'bg-[#eae7e7] text-[#9b9797] cursor-not-allowed' : 'bg-[#0e3719] hover:bg-[#22301C] text-[#FFFFFF] cursor-pointer'
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
