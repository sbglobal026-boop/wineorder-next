'use client'
import Link from 'next/link'
import { useAppConfig } from '@/context/AppConfigContext'

export default function CheckoutPage() {
  const { config } = useAppConfig()

  const items = config.cart
    .map(c => {
      const product = config.products.find(p => p.id === c.productId)
      return product ? { ...c, product } : null
    })
    .filter((item): item is { productId: number; qty: number; product: NonNullable<typeof config.products[number]> } => item !== null)

  const total = items.reduce((sum, item) => sum + item.product.price * item.qty, 0)

  if (items.length === 0) {
    return (
      <div className="bg-[#fef9e4] min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-400 text-sm">장바구니가 비어 있습니다</p>
        <Link href="/events/wines" className="text-xs font-bold uppercase tracking-widest text-[#8B4513] hover:text-[#2C5F2D] transition-colors">
          ← 와인 목록으로
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-[#fef9e4] min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-10">

        <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-10">
          결제하기
        </h1>

        <div className="border border-gray-200 divide-y divide-gray-200">
          {items.map(({ productId, qty, product }) => (
            <div key={productId} className="flex items-center gap-6 p-6">
              <div className="w-16 h-16 flex items-center justify-center bg-gray-50 overflow-hidden shrink-0">
                {product.imageUrl
                  ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                  : <span className="text-2xl select-none">🍷</span>
                }
              </div>

              <div className="flex-1">
                <p className="text-sm font-bold text-gray-900">{product.name}</p>
                <p className="text-sm text-gray-400 mt-1">수량 {qty}개</p>
              </div>

              <p className="text-base font-black text-gray-900 whitespace-nowrap">
                {(product.price * qty).toLocaleString()}
                <span className="text-sm font-semibold text-gray-400 ml-1">유로</span>
              </p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mt-10">
          <p className="text-xl font-black text-gray-900">
            총 결제금액 {total.toLocaleString()}
            <span className="text-sm font-semibold text-gray-400 ml-1">유로</span>
          </p>

          <button className="bg-[#8B4513] hover:bg-[#2C5F2D] text-white text-xs font-bold uppercase tracking-widest py-4 px-10 transition-colors">
            결제 진행
          </button>
        </div>

      </div>
    </div>
  )
}
