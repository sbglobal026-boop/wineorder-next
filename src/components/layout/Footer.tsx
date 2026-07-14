import Link from 'next/link'

export default function Footer() {
  return (
    <footer>
      <div className="max-w-[1640px] mx-auto bg-[#1C1A17] text-[#F4EFE6] px-[20px] py-16 font-lato-korean">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">

          {/* 브랜드 */}
          <div className="col-span-2 md:col-span-1">
            <div className="text-[22px] font-bold tracking-tight mb-4 font-[family-name:var(--font-lato)]">table code</div>
            <p className="text-sm opacity-70 leading-relaxed">
              Good food. Good people. Good stories. The table is where culture truly begins.
              Table Code — made for those moments.
            </p>
          </div>

          {/* 고객 서비스 */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest opacity-50 mb-4">고객 서비스.</h3>
            <ul className="space-y-2.5 text-sm opacity-80">
              {[
                { label: 'CS 게시판', href: '/cs-board' },
                { label: '배송 안내', href: '/shipping-guide' },
                { label: '교환 / 반품', href: '/returns' },
                { label: '공지사항', href: '/notices' },
                { label: 'QnA', href: '/qna' },
              ].map(item => (
                <li key={item.label}><Link href={item.href} className="hover:opacity-100 transition-opacity">{item.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* 회사 정보 */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest opacity-50 mb-4">회사 정보.</h3>
            <ul className="space-y-2.5 text-sm opacity-80">
              {[
                { label: 'über uns', href: '/ueber-uns' },
                { label: 'AGB', href: '/agb' },
                { label: 'Datenschutzerklärung', href: '/datenschutz' },
                { label: 'Impressum', href: '/impressum' },
              ].map(item => (
                <li key={item.label}><Link href={item.href} className="hover:opacity-100 transition-opacity">{item.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* 연락처 */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest opacity-50 mb-4">연락처.</h3>
            <ul className="space-y-2.5 text-sm opacity-80">
              <li>sbglobal026@gmail.com</li>
            </ul>
          </div>
        </div>

        {/* 사업자 정보 */}
        <div className="border-t border-[#F4EFE6]/14 pt-6 text-xs opacity-50 space-y-1.5">
          <p>sbglobal UG (haftungsbeschränkt) &nbsp;|&nbsp; Geschäftsführer: Max Mustermann &nbsp;|&nbsp; Handelsregister: Amtsgericht Berlin-Charlottenburg, HRB 000000 B</p>
          <p>USt-IdNr.: DE000000000 &nbsp;|&nbsp; Sitz der Gesellschaft: Musterstraße 1, 10115 Berlin, Deutschland</p>
          <p className="pt-2">© 2026 table code. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
