'use client'
import Link from 'next/link'
import { Product } from '@/data/products'
import { useAppConfig } from '@/context/AppConfigContext'

const categoryBg: Record<string, string> = {
  '레드': 'bg-red-50',
  '화이트': 'bg-amber-50',
  '로제': 'bg-pink-50',
  '스파클링': 'bg-blue-50',
}

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart, openCart } = useAppConfig()
  const href = product.type === 'wine' ? `/events/wines/${product.id}` : `/events/food/${product.id}`

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product.id)
    openCart()
  }

  return (
    <Link href={href} className="bg-[#fef9e4] border border-gray-200 group block rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-2 hover:shadow-xl">
      {/* 이미지 */}
      <div className={`${categoryBg[product.category] ?? 'bg-gray-50'} h-48 flex items-center justify-center relative overflow-hidden`}>
        {product.imageUrl
          ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
          : <span className="text-6xl select-none">{product.type === 'wine' ? '🍷' : '🧀'}</span>
        }
        <span className="absolute top-3 left-3 text-xs font-bold uppercase tracking-widest text-gray-400">
          {product.category}
        </span>
      </div>

      {/* 정보 */}
      <div className="p-5">
        <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">{product.origin}</p>
        <h3 className="text-gray-900 font-black text-sm tracking-tight mb-1 truncate">{product.name}</h3>
        <div className="flex items-center gap-1 mb-4">
          <span className="text-[#F5D623] text-xs">★</span>
          <span className="text-gray-500 text-xs font-semibold">{product.rating}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-900 font-black text-sm">
            {product.price.toLocaleString()}유로
          </span>

          <button
            onClick={handleAddToCart}
            className="bg-[#8B4513] group-hover:bg-[#2C5F2D] text-white p-2 transition-colors duration-200 cursor-pointer"
            title="장바구니 담기"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
            </svg>
          </button>
        </div>
      </div>
    </Link>
  )
}
