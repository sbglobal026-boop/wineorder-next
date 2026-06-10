import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-[#fef9e4] border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">

          {/* 브랜드 */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">🍷</span>
              <span className="text-gray-900 font-black tracking-widest text-xs uppercase">Wine Order</span>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed">
              엄선된 세계 각국의 와인을<br />합리적인 가격에 제공합니다.
            </p>
          </div>

          {/* 고객 서비스 */}
          <div>
            <h3 className="text-gray-900 text-xs font-black uppercase tracking-widest mb-5">고객 서비스</h3>
            <ul className="space-y-3 text-xs text-gray-400">
              {['주문 조회', '배송 안내', '교환 / 반품', '공지사항'].map(label => (
                <li key={label}><Link href="#" className="hover:text-gray-900 transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>

          {/* 회사 정보 */}
          <div>
            <h3 className="text-gray-900 text-xs font-black uppercase tracking-widest mb-5">회사 정보</h3>
            <ul className="space-y-3 text-xs text-gray-400">
              {['회사 소개', '이용약관', '개인정보 처리방침', 'Impressum'].map(label => (
                <li key={label}><Link href="#" className="hover:text-gray-900 transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>

          {/* 연락처 */}
          <div>
            <h3 className="text-gray-900 text-xs font-black uppercase tracking-widest mb-5">연락처</h3>
            <ul className="space-y-3 text-xs text-gray-400">
              <li>📞 1588-0000</li>
              <li>✉️ help@wineorder.kr</li>
              <li>평일 09:00 – 18:00</li>
            </ul>
          </div>
        </div>

        {/* 사업자 정보 */}
        <div className="border-t border-gray-100 pt-8 text-xs text-gray-300 space-y-1.5">
          <p>㈜와인오더 &nbsp;|&nbsp; 대표이사 홍길동 &nbsp;|&nbsp; 사업자등록번호 123-45-67890</p>
          <p>통신판매업 신고번호 제2024-서울강남-0000호 &nbsp;|&nbsp; 주류판매 면허번호 제00-0000호</p>
          <p>서울특별시 강남구 테헤란로 123, 와인빌딩 5층</p>
          <p className="pt-2">© 2024 Wine Order. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
