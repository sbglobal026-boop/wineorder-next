'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAppConfig } from '@/context/AppConfigContext'
import { useAuth } from '@/context/AuthContext'

export default function CartDrawer() {
  const { config, removeFromCart, updateCartQty, clearCart, isCartOpen, closeCart } = useAppConfig()
  const { currentUser } = useAuth()
  const router = useRouter()

  // 드로어 열릴 때 배경 스크롤 잠금
  useEffect(() => {
    document.body.style.overflow = isCartOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isCartOpen])

  const items = config.cart
    .map(c => {
      const product = config.products.find(p => p.id === c.productId)
      return product ? { ...c, product } : null
    })
    .filter((item): item is { productId: number; qty: number; product: NonNullable<typeof config.products[number]> } => item !== null)

  const total = items.reduce((sum, { qty, product }) => sum + product.price * qty, 0)

  const handleOrder = () => {
    closeCart()
    router.push(currentUser ? '/checkout' : '/login?redirect=/checkout')
  }

  return (
    <>
      {/* 배경 오버레이 */}
      <div
        className={`fixed inset-0 bg-black/40 z-[60] transition-opacity duration-300 ${isCartOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={closeCart}
      />

      {/* 드로어 패널 */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-[420px] bg-[#FBFAF7] z-[70] flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>

        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#eae7e7]">
          <h2 className="font-[family-name:var(--font-playfair-display)] text-[20px] font-medium tracking-tight text-[#1C1A17]">
            Cart <span className="text-[#9b9797]">({items.length})</span>
          </h2>
          <button
            onClick={closeCart}
            className="text-[#9b9797] hover:text-[#7d5411] transition-colors text-xl leading-none"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        {/* 상품 목록 */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#eae7e7]">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
              <p className="text-[#9b9797] text-sm">장바구니가 비어 있습니다</p>
              <button
                onClick={closeCart}
                className="text-xs font-bold uppercase tracking-widest text-[#7d5411] hover:underline"
              >
                계속 쇼핑하기
              </button>
            </div>
          ) : (
            items.map(({ productId, qty, product }) => {
              const href = product.type === 'wine' ? `/events/wines/${product.id}` : `/events/food/${product.id}`
              return (
                <div key={productId} className="flex items-center gap-4 px-6 py-4">
                  {/* 상품 이미지 */}
                  <Link href={href} onClick={closeCart} className="w-16 h-16 shrink-0 rounded-2xl bg-[#f2e6e1] overflow-hidden block">
                    {product.imageUrl
                      ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                      : <span className="w-full h-full flex items-center justify-center text-2xl select-none">🍷</span>
                    }
                  </Link>

                  {/* 정보 */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] tracking-[0.16em] uppercase text-[#7d5411] mb-0.5">
                      {product.category} · {product.origin}
                    </p>
                    {/* 상품명 클릭 → 상세 페이지 */}
                    <Link
                      href={href}
                      onClick={closeCart}
                      className="text-sm font-semibold text-[#1C1A17] truncate mb-2 block hover:text-[#7d5411] transition-colors"
                    >
                      {product.name}
                    </Link>
                    {/* 수량 조절 */}
                    <div className="flex items-center rounded-full border border-[#d7d3d3] w-fit overflow-hidden">
                      <button
                        onClick={() => updateCartQty(productId, qty - 1)}
                        className="w-7 h-7 flex items-center justify-center text-[#605d5d] hover:text-[#7d5411] transition-colors"
                      >−</button>
                      <span className="w-7 text-center text-xs font-bold text-[#1C1A17]">{qty}</span>
                      <button
                        onClick={() => updateCartQty(productId, qty + 1)}
                        className="w-7 h-7 flex items-center justify-center text-[#605d5d] hover:text-[#7d5411] transition-colors"
                      >+</button>
                    </div>
                  </div>

                  {/* 금액 + 삭제 */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <p className="font-[family-name:var(--font-playfair-display)] text-[16px] text-[#1C1A17]">
                      €{(product.price * qty).toLocaleString()}
                    </p>
                    <button
                      onClick={() => removeFromCart(productId)}
                      className="text-[11px] tracking-widest text-[#bab6b6] hover:text-[#7d5411] transition-colors"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* 하단 액션 */}
        {items.length > 0 && (
          <div className="border-t border-[#eae7e7] px-6 py-5 flex flex-col gap-3">
            {/* 총 합계 */}
            <div className="flex items-center justify-between py-2 border-b border-[#eae7e7] mb-1">
              <span className="text-xs font-bold uppercase tracking-widest text-[#605d5d]">합계</span>
              <span className="font-[family-name:var(--font-playfair-display)] text-[20px] text-[#1C1A17]">€{total.toLocaleString()}</span>
            </div>
            <Link
              href="/cart"
              onClick={closeCart}
              className="w-full block text-center rounded-full border border-[#b68235] text-[#7d5411] hover:bg-[#7d5411] hover:text-[#fffdf9] text-xs font-bold uppercase tracking-widest py-3.5 transition-colors"
            >
              장바구니 전체 보기
            </Link>
            <button
              onClick={handleOrder}
              className="w-full rounded-full bg-[#7d5411] hover:bg-[#5a3b0a] text-[#fffdf9] text-xs font-bold uppercase tracking-widest py-3.5 transition-colors"
            >
              주문하기
            </button>
            <button
              onClick={clearCart}
              className="self-end text-xs tracking-widest text-[#bab6b6] hover:text-[#7d5411] transition-colors"
            >
              전체 비우기
            </button>
          </div>
        )}
      </div>
    </>
  )
}
