'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAppConfig } from '@/context/AppConfigContext'
import { useAuth } from '@/context/AuthContext'
import ProductGridCard from '@/components/product/ProductGridCard'

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

  if (items.length === 0) {
    return (
      <div className="bg-[#F9F4EE] min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-400 text-sm">장바구니가 비어 있습니다</p>
        <Link href="/events/wines" className="text-xs font-bold uppercase tracking-widest text-[#8B4513] hover:text-[#2C5F2D] transition-colors">
          ← 와인 목록으로
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-[#F9F4EE] min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-10">

        <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-3">
          장바구니
        </h1>
        <div className="border-t border-gray-900 mb-10" />

        <div className="flex flex-col lg:flex-row gap-10 items-start">

          {/* 상품 목록 */}
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-700 mb-4">상품</h2>
            <div className="border border-gray-200 bg-white divide-y divide-gray-200">
              {items.map(({ productId, qty, product }) => (
                <div key={productId} className="flex items-center gap-4 p-4">
                  {/* 이미지 */}
                  <Link href={product.type === 'wine' ? `/events/wines/${product.id}` : `/events/food/${product.id}`}
                    className="w-12 h-12 shrink-0 bg-gray-50 overflow-hidden block">
                    {product.imageUrl
                      ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain" />
                      : <span className="w-full h-full flex items-center justify-center text-xl select-none">🍷</span>
                    }
                  </Link>

                  {/* 정보 */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">
                      {product.category} · {product.origin}
                    </p>
                    <p className="text-sm font-bold text-gray-900 mb-2">{product.name}</p>

                    {/* 수량 조절 */}
                    <div className="flex items-center border border-gray-200 w-fit">
                      <button
                        onClick={() => updateCartQty(productId, qty - 1)}
                        className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors"
                      >−</button>
                      <span className="w-8 text-center text-sm font-bold text-gray-900">{qty}</span>
                      <button
                        onClick={() => updateCartQty(productId, qty + 1)}
                        className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors"
                      >+</button>
                    </div>
                  </div>

                  {/* 금액 + 삭제 */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <p className="text-sm font-black text-gray-900">
                      €{(product.price * qty).toLocaleString()}
                    </p>
                    <button
                      onClick={() => removeFromCart(productId)}
                      className="text-[11px] font-bold uppercase tracking-widest text-gray-300 hover:text-[#8B4513] transition-colors"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* 메모 */}
            <div className="mt-6">
              <label className="block text-sm font-bold uppercase tracking-widest text-gray-700 mb-2">
                주문 메모
              </label>
              <textarea
                value={memo}
                onChange={e => setMemo(e.target.value)}
                placeholder="배송 요청사항이나 특이사항을 입력해주세요"
                rows={3}
                className="w-full border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 placeholder-gray-300 resize-none focus:outline-none focus:border-gray-400 transition-colors"
              />
            </div>
          </div>

          {/* 주문 요약 */}
          <div className="w-full lg:w-[340px] shrink-0 sticky top-[110px]">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-700 mb-4">주문 요약</h2>
            <div className="border border-gray-200 bg-white p-5 flex flex-col gap-3">
              {items.map(({ productId, qty, product }) => (
                <div key={productId} className="flex justify-between text-sm">
                  <span className="text-gray-500 truncate pr-4">{product.name} × {qty}</span>
                  <span className="font-medium text-gray-900 shrink-0">€{(product.price * qty).toLocaleString()}</span>
                </div>
              ))}
              <div className="flex justify-between font-black text-gray-900 text-2xl border-t border-gray-100 pt-3">
                <span>합계</span>
                <span>€{items.reduce((s, i) => s + i.product.price * i.qty, 0).toLocaleString()}</span>
              </div>
            </div>
            <button
              onClick={handleOrder}
              className="w-full mt-3 bg-[#0e3719] hover:bg-[#1a5c2a] text-white text-sm font-bold uppercase tracking-widest py-4 transition-colors"
            >
              주문하기
            </button>
            <button
              onClick={clearCart}
              className="w-full text-xs font-bold uppercase tracking-widest text-gray-300 hover:text-[#8B4513] transition-colors py-2"
            >
              전체 비우기
            </button>
          </div>
        </div>

      </div>

      {/* 추천 와인 - 원래 너비 유지 */}
      {recommended.length > 0 && (
        <div className="max-w-[1640px] mx-auto px-[40px] pb-16">
          <section className="mt-24 md:mt-[140px]">
            <div className="flex items-baseline justify-between border-t border-gray-900 pt-2.5 mb-9">
              <h2 className="text-[18px] font-bold tracking-wide font-[family-name:var(--font-playfair-display)]">
                Top Drop Archive.
              </h2>
              <Link href="/events/wines" className="text-sm font-medium text-gray-900 no-underline inline-flex gap-1.5 items-center">
                전체보기 →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {recommended.map(rec => (
                <ProductGridCard key={rec.id} product={rec} />
              ))}
            </div>
          </section>
        </div>
      )}

    </div>
  )
}
