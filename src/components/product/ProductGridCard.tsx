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
  const { addToCart } = useAppConfig()
  const href = product.type === 'wine' ? `/events/wines/${product.id}` : `/events/food/${product.id}`
  const criticRatings = (product.criticRatings ?? '').split(',').map(s => s.trim()).filter(Boolean).slice(0, 3)

  return (
    <div className="flex flex-col">
      <Link href={href} className="relative aspect-[3/4] block no-underline overflow-hidden">
        <div className={`absolute inset-0 ${categoryBg[product.category] ?? 'bg-gray-50'}`} />
        {product.imageUrl
          ? <img src={product.imageUrl} alt={product.name} className="absolute inset-0 w-full h-full object-contain p-3.5" />
          : <span className="absolute inset-0 flex items-center justify-center text-6xl select-none">{product.type === 'wine' ? '🍷' : '🧀'}</span>
        }
      </Link>
      <Link href={href} className="no-underline text-gray-900">
        <p className="text-[17px] font-medium mt-3.5 mb-3 tracking-tight truncate">{product.name}</p>
      </Link>
      <div className="flex gap-7 mb-3.5">
        <div>
          <p className="text-xs font-medium mb-0.5">원산지.</p>
          <p className="text-xs text-gray-400">{product.origin}</p>
        </div>
        <div>
          <p className="text-xs font-medium mb-0.5">평가.</p>
          {criticRatings.length > 0
            ? criticRatings.map((r, i) => <p key={i} className="text-xs text-gray-400 leading-relaxed">{r}</p>)
            : <p className="text-xs text-gray-400">—</p>
          }
        </div>
      </div>
      <button
        onClick={() => addToCart(product.id)}
        className="mt-auto flex items-center justify-between px-3.5 py-3 border border-gray-200 bg-white text-[13px] font-medium cursor-pointer hover:border-gray-900 transition-colors"
      >
        <span>장바구니 담기</span>
        <span className="inline-flex items-center gap-2.5 text-gray-400">{fmt(product.price)} <span className="text-base text-gray-900">+</span></span>
      </button>
    </div>
  )
}
