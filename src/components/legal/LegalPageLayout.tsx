import { ReactNode } from 'react'

export default function LegalPageLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bg-[#F9F4EE] min-h-screen">
      <div className="max-w-[1640px] mx-auto">
        <div className="bg-[#1C1A17] flex items-center px-5 h-12">
          <h1 className="font-[family-name:var(--font-playfair-display)] text-white text-[21px] font-bold tracking-tight">
            {title}
          </h1>
        </div>
      </div>
      <div className="max-w-[880px] mx-auto px-5 md:px-10 py-16 text-sm text-gray-700 leading-relaxed">
        {children}
      </div>
    </div>
  )
}
