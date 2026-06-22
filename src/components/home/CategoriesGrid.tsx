import Link from 'next/link'

const categories = [
  { label: '레드', href: '/wines' },
  { label: '화이트', href: '/wines' },
  { label: '로제', href: '/wines' },
  { label: '스파클링', href: '/wines' },
  { label: '식품', href: '/support' },
]

export default function CategoriesGrid() {
  return (
    <section className="bg-[#1C1A17] text-[#F4EFE6] py-20 md:py-24 px-[15px]">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-10">table code 카테고리.</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-5">
          {categories.map((cat) => (
            <Link key={cat.label} href={cat.href} className="block group">
              <div className="relative aspect-[3/4] rounded-sm overflow-hidden bg-[repeating-linear-gradient(135deg,#2b2720_0_14px,#322d25_14px_28px)]" />
              <div className="flex items-center justify-between mt-3.5">
                <span className="text-[17px] font-semibold">{cat.label}.</span>
                <span className="text-xs font-medium uppercase tracking-widest text-[#F4EFE6]/60 group-hover:text-[#F4EFE6] transition-colors">
                  Discover
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
