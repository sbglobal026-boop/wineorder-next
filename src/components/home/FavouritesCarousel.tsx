'use client'
import Link from 'next/link'
import { useAppConfig } from '@/context/AppConfigContext'

export default function FavouritesCarousel() {
  const { config } = useAppConfig()
  const product = config.products.find(p => p.id === config.featuredWineId)

  if (!product) return null

  return (
    <section className="relative max-w-[1640px] mx-auto overflow-hidden bg-[#1C1A17]">
      {product.imageUrl && (
        <img src={product.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover blur-2xl scale-110" />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0e3719]/85 via-[#1C1A17]/85 to-black/90" />
      <div className="absolute inset-0 [background:radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.6)_100%)]" />

      <div className="relative z-10 max-w-xl mx-auto px-6 py-[90px] flex flex-col items-center text-center">
        <h2 className="font-[family-name:var(--font-playfair-display)] font-bold text-[40px] md:text-[56px] leading-tight text-[#FBFAF7] mb-10">
          Today&apos;s Top Drop
        </h2>

        <div className="w-full max-w-[500px] aspect-square overflow-hidden mb-8 bg-[#DAD4CD]/10">
          {product.imageUrl
            ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
            : <span className="w-full h-full flex items-center justify-center text-7xl">{product.type === 'wine' ? '🍷' : '🧀'}</span>
          }
        </div>

        <p className="text-white text-sm leading-relaxed line-clamp-1 mb-7 max-w-sm">
          {product.description}
        </p>

        <Link href="/events" className="inline-flex items-center gap-2 text-[#FBFAF7] font-semibold text-sm no-underline hover:opacity-80 transition-opacity">
          Go to the Top Drop <span>→</span>
        </Link>
      </div>
    </section>
  )
}
