'use client'
import { useAppConfig } from '@/context/AppConfigContext'

export default function AdBanner() {
  const { config } = useAppConfig()
  const c = config.adBannerContent

  return (
    <section className="bg-gradient-to-r from-[#8B4513] via-[#2C5F2D] to-[#8B4513] py-16">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
        <div>
          <p className="text-[#F5D623] text-xs font-semibold tracking-widest uppercase mb-2">
            {c.badge}
          </p>
          <h2 className="text-white text-3xl md:text-4xl font-bold mb-3 leading-tight">
            {c.title}{' '}
            <span className="text-[#F5D623]">{c.highlight}</span>
          </h2>
          <p className="text-[#fef9e4]/70 text-sm">{c.description}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
          <button className="bg-white text-[#8B4513] font-bold px-8 py-3 rounded-full text-sm hover:bg-[#F5D623]/30 transition-colors">
            {c.primaryBtn}
          </button>
          <button className="border border-white/50 text-white font-medium px-8 py-3 rounded-full text-sm hover:bg-white/10 transition-colors">
            {c.secondaryBtn}
          </button>
        </div>
      </div>
    </section>
  )
}
