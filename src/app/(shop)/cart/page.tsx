'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAppConfig } from '@/context/AppConfigContext'
import { useAuth } from '@/context/AuthContext'
import ProductGridCard from '@/components/product/ProductGridCard'
import CheckoutSteps from '@/components/cart/CheckoutSteps'

// 카테고리별 카드 상단 그라데이션
const categoryGradient: Record<string, string> = {
  '레드': 'radial-gradient(100% 120% at 60% 8%, #f2e6e1, #e6cdc4)',
  '화이트': 'radial-gradient(100% 120% at 60% 8%, #eef0dd, #dde5c5)',
  '로제': 'radial-gradient(100% 120% at 60% 8%, #f7e7cf, #f1d6b0)',
  '스파클링': 'radial-gradient(100% 120% at 60% 8%, #e7e0ee, #d3c8e0)',
  '식품': 'radial-gradient(100% 120% at 60% 8%, #f3ddc7, #e8c39a)',
}

export default function CartPage() {
  const { config, removeFromCart, updateCartQty, clearCart } = useAppConfig()
  const { currentUser } = useAuth()
  const router = useRouter()
  const [memo, setMemo] = useState('')

  const handleOrder = () => {
    router.push(currentUser ? '/checkout' : '/login?redirect=/checkout')
  }

  const items = config.cart
    .map(c => {
      const product = config.products.find(p => p.id === c.productId)
      return product ? { ...c, product } : null
    })
    .filter((item): item is { productId: number; qty: number; product: NonNullable<typeof config.products[number]> } => item !== null)

  const recommended = config.products
    .filter(p => !items.some(i => i.productId === p.id))
    .slice(0, 4)

  const total = items.reduce((s, i) => s + i.product.price * i.qty, 0)

  const pageBg = { background: 'radial-gradient(120% 90% at 15% 0%, #faf5ec 0%, #F9F4EE 55%)' }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={pageBg}>
        <p className="text-5xl">🛒</p>
        <p className="text-[#9b9797] text-sm">장바구니가 비어 있습니다</p>
        <Link href="/events/wines" className="text-xs font-bold uppercase tracking-widest text-[#7d5411] hover:underline">
          ← 와인 목록으로
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={pageBg}>
      {/* 히어로 */}
      <header className="max-w-[760px] mx-auto text-center px-5 pt-16 md:pt-20 pb-6">
        <p className="text-[13px] tracking-[0.28em] uppercase text-[#7d5411] mb-3.5">Cart</p>
        <h1 className="font-[family-name:var(--font-playfair-display)] font-medium text-[36px] md:text-[48px] leading-[1.1] text-[#1C1A17] mb-4">
          담아둔 기쁨들
        </h1>
        <p className="text-[15px] md:text-[16px] leading-[1.7] text-[#605d5d]">
          고른 와인을 확인하고, 수량을 조정한 뒤 결제로 이어가세요.
        </p>
      </header>

      <div className="max-w-[1240px] mx-auto px-5 pb-16">
        <CheckoutSteps current={1} />

        <div className="grid lg:grid-cols-[1fr_360px] gap-8 items-start">
          {/* 상품 목록 */}
          <div className="flex flex-col gap-4">
            {items.map(({ productId, qty, product }) => {
              const href = product.type === 'wine' ? `/events/wines/${product.id}` : `/events/food/${product.id}`
              return (
                <div key={productId} className="cutecard rounded-[24px] border border-[#eae7e7] bg-[#fffefb] p-4 md:p-5 flex items-center gap-4 md:gap-5">
                  {/* 이미지 */}
                  <Link href={href} className="shrink-0 w-[70px] h-[90px] md:w-[78px] md:h-[100px] rounded-2xl overflow-hidden block" style={{ background: categoryGradient[product.category] ?? categoryGradient['로제'] }}>
                    {product.imageUrl
                      ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                      : <span className="w-full h-full flex items-center justify-center text-2xl select-none">🍷</span>
                    }
                  </Link>

                  {/* 정보 */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] tracking-[0.16em] uppercase text-[#7d5411] mb-1">{product.category} · {product.origin}</p>
                    <Link href={href} className="no-underline">
                      <h4 className="font-[family-name:var(--font-playfair-display)] text-[18px] md:text-[20px] text-[#1C1A17] leading-tight mb-2 line-clamp-2 hover:text-[#7d5411] transition-colors">{product.name}</h4>
                    </Link>
                    {/* 수량 알약 */}
                    <div className="flex items-center rounded-full border border-[#d7d3d3] w-fit overflow-hidden">
                      <button onClick={() => updateCartQty(productId, qty - 1)} className="w-9 h-9 flex items-center justify-center text-[#605d5d] hover:text-[#7d5411] hover:bg-[#7d5411]/[0.06] transition-colors">−</button>
                      <span className="w-10 text-center text-sm font-[family-name:var(--font-playfair-display)] text-[#1C1A17]">{qty}</span>
                      <button onClick={() => updateCartQty(productId, qty + 1)} className="w-9 h-9 flex items-center justify-center text-[#605d5d] hover:text-[#7d5411] hover:bg-[#7d5411]/[0.06] transition-colors">+</button>
                    </div>
                  </div>

                  {/* 금액 + 삭제 */}
                  <div className="flex flex-col items-end justify-between self-stretch shrink-0">
                    <button onClick={() => removeFromCart(productId)} aria-label="삭제" className="text-[#bab6b6] hover:text-[#7d5411] text-lg leading-none transition-colors">×</button>
                    <p className="font-[family-name:var(--font-playfair-display)] text-[19px] md:text-[22px] text-[#1C1A17]">€{(product.price * qty).toLocaleString()}</p>
                  </div>
                </div>
              )
            })}

            {/* 주문 메모 */}
            <div className="mt-2">
              <label className="block text-xs font-semibold text-[#605d5d] mb-2">주문 메모</label>
              <textarea
                value={memo}
                onChange={e => setMemo(e.target.value)}
                placeholder="배송 요청사항이나 특이사항을 입력해주세요"
                rows={3}
                className="w-full rounded-2xl border border-[#eae7e7] bg-[#fffefb] px-4 py-3 text-sm text-[#605d5d] placeholder-[#bab6b6] resize-none focus:outline-none focus:border-[#b68235] transition-colors"
              />
            </div>
          </div>

          {/* 결제 금액 요약 */}
          <div className="lg:sticky lg:top-[90px] rounded-[24px] border border-[#eae7e7] bg-[#fffefb] p-6 md:p-7">
            <h3 className="font-[family-name:var(--font-playfair-display)] text-[22px] text-[#1C1A17] mb-5">결제 금액</h3>
            <div className="flex flex-col gap-3 text-sm pb-4 border-b border-[#eae7e7]">
              <div className="flex justify-between"><span className="text-[#9b9797]">상품 금액</span><span className="text-[#1C1A17]">€{total.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-[#9b9797]">배송비</span><span className="text-[#1C1A17]">무료</span></div>
            </div>
            <div className="flex items-baseline justify-between py-5">
              <span className="text-[15px] text-[#1C1A17]">총 결제금액</span>
              <span className="font-[family-name:var(--font-playfair-display)] text-[28px] text-[#7d5411]">€{total.toLocaleString()}</span>
            </div>
            <button
              onClick={handleOrder}
              className="w-full rounded-full bg-[#7d5411] hover:bg-[#5a3b0a] text-[#fffdf9] text-sm font-semibold py-3.5 transition-colors mb-2.5"
            >
              주문하기
            </button>
            <Link
              href="/events/wines"
              className="block text-center rounded-full border border-[#d7d3d3] text-[#605d5d] hover:border-[#b68235] hover:text-[#7d5411] text-sm py-3 transition-colors no-underline"
            >
              계속 쇼핑하기
            </Link>
            <button
              onClick={clearCart}
              className="w-full text-xs text-[#bab6b6] hover:text-[#7d5411] transition-colors py-3"
            >
              전체 비우기
            </button>
          </div>
        </div>

        {/* 추천 상품 */}
        {recommended.length > 0 && (
          <section className="mt-20 md:mt-28">
            <div className="flex items-baseline justify-between mb-6">
              <h3 className="font-[family-name:var(--font-playfair-display)] text-[26px] text-[#1C1A17]">함께 담기 좋은</h3>
              <Link href="/events/wines" className="text-sm text-[#7d5411] no-underline border-b border-[#b68235]">전체보기 →</Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {recommended.map(rec => (
                <ProductGridCard key={rec.id} product={rec} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
