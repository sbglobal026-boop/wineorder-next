'use client'
import { useAppConfig } from '@/context/AppConfigContext'

export default function SubscriptionBanner() {
  const { config } = useAppConfig()
  const c = config.adBannerContent

  return (
    <section>
      <div className="max-w-[1640px] mx-auto bg-[#DAD4CD] grid md:grid-cols-2 gap-14 items-center py-20 md:py-28 px-[20px]">
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-[#9a9384] mb-4">{c.badge}</p>
          <h2 className="text-3xl md:text-[42px] font-semibold tracking-tight mb-5 text-[#1C1A17]">
            {c.title} {c.highlight}
          </h2>
          <p className="text-lg leading-relaxed text-[#5c564c] max-w-md mb-8">{c.description}</p>
          <div className="flex flex-col gap-3.5 mb-9">
            <div className="flex items-center gap-3 text-[15px] text-[#1C1A17]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1C1A17] shrink-0" />
              회원가입 시 즉시 할인 혜택
            </div>
            <div className="flex items-center gap-3 text-[15px] text-[#1C1A17]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1C1A17] shrink-0" />
              전국 무료 배송, 추가 비용 없음
            </div>
            <div className="flex items-center gap-3 text-[15px] text-[#1C1A17]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1C1A17] shrink-0" />
              언제든 자유롭게 혜택 확인 가능
            </div>
          </div>
          <div className="flex gap-3">
            <button className="bg-[#1C1A17] hover:bg-[#3a342b] text-[#FBFAF7] rounded-full px-7 py-3.5 text-sm font-medium transition-colors">
              {c.primaryBtn}
            </button>
            <button className="border border-[#1C1A17]/30 hover:bg-[#1C1A17]/5 text-[#1C1A17] rounded-full px-7 py-3.5 text-sm font-medium transition-colors">
              {c.secondaryBtn}
            </button>
          </div>
        </div>
        <div className="relative aspect-square rounded-sm overflow-hidden bg-[repeating-linear-gradient(135deg,#efeae1_0_14px,#e6e0d4_14px_28px)]" />
      </div>
    </section>
  )
}
