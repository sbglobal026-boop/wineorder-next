'use client'
import Link from 'next/link'
import { Product } from '@/data/products'
import { useAppConfig } from '@/context/AppConfigContext'

const categoryBg: Record<string, string> = {
  '레드': 'bg-red-50',
  '화이트': 'bg-amber-50',
  '로제': 'bg-pink-50',
  '스파클링': 'bg-blue-50',
  '식품': 'bg-orange-50',
}

function fmt(n: number): string {
  return '€' + n.toLocaleString()
}

export default function ProductGridCard({ product }: { product: Product }) {
  const { addToCart, openCart } = useAppConfig()
  const href = product.type === 'wine' ? `/events/wines/${product.id}` : `/events/food/${product.id}`
  const firstCriticRating = (product.criticRatings ?? '').split(',').map(s => s.trim()).filter(Boolean)[0]
  const isSoldOut = (product.stock ?? 1) === 0

  return (
    <div className="flex flex-col hover:-translate-y-1 transition-transform duration-300">
      <Link href={href} className="relative aspect-square block no-underline overflow-hidden">
        <div className={`absolute inset-0 ${categoryBg[product.category] ?? 'bg-gray-50'}`} />
        {product.imageUrl
          ? <img src={product.imageUrl} alt={product.name} className="absolute inset-0 w-full h-full object-contain" />
          : <span className="absolute inset-0 flex items-center justify-center text-6xl select-none">{product.type === 'wine' ? '🍷' : '🧀'}</span>
        }
        {isSoldOut && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white text-xs font-bold tracking-widest uppercase border border-white/60 px-3 py-1">Sold Out</span>
          </div>
        )}
      </Link>
      <Link href={href} className="no-underline text-gray-900">
        <p className={`text-[17px] font-bold mt-3.5 tracking-tight truncate ${product.grapeVariety ? '' : 'mb-3'}`}>{product.name}</p>
        {product.grapeVariety && (
          <p className="text-xs text-gray-400 mt-0.5 mb-3 truncate">{product.grapeVariety}</p>
        )}
      </Link>
      <div className="flex gap-7 mb-3.5">
        <div>
          <p className="text-xs font-medium mb-0.5">원산지.</p>
          <p className="text-xs text-gray-400">{product.origin}</p>
        </div>
        <div>
          <p className="text-xs font-medium mb-0.5">평가.</p>
          <p className="text-xs text-gray-400">{firstCriticRating ?? '—'}</p>
        </div>
      </div>
      {isSoldOut ? (
        <button
          disabled
          className="mt-auto flex items-center justify-between px-3.5 py-3 border border-gray-200 bg-gray-50 text-[13px] font-medium text-gray-300 cursor-not-allowed"
        >
          <span className="inline-flex items-center gap-2.5">{fmt(product.price)}</span>
          <span>품절</span>
        </button>
      ) : (
        <button
          onClick={() => { addToCart(product.id); openCart() }}
          className="mt-auto flex items-center justify-between px-3.5 py-3 border border-[#0e3719] bg-[#0e3719] text-[13px] font-medium text-[#F4EFE6] cursor-pointer hover:bg-[#0a2b13] transition-colors"
        >
          <span className="text-[18px] font-bold text-[#DAD4CD]">{fmt(product.price)}</span>
          <span className="inline-flex items-center gap-2.5">장바구니 담기 <span className="text-base text-[#F4EFE6]">+</span></span>
        </button>
      )}
    </div>
  )
}
