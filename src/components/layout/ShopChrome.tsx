'use client'
import { usePathname } from 'next/navigation'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import CartDrawer from '@/components/cart/CartDrawer'
import TableCodeLinks from '@/components/layout/TableCodeLinks'

// 카드 선택 화면(/welcome)에서는 푸터만 숨김 (카드 컨셉 랜딩을 깔끔하게 보여주기 위함). 헤더는 모든 페이지에 표시
const HIDE_FOOTER_PATHS = ['/welcome']
// 헤더 아래 table code 콘텐츠 링크 줄을 보여줄 페이지 — 메인·상품 목록만 (장바구니·결제는 구매 집중, 블로그·저널은 헤더에 이미 카테고리가 있어 제외)
const TABLE_CODE_LINKS_PATHS = ['/', '/events/wines', '/events/food']

export default function ShopChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const hideFooter = HIDE_FOOTER_PATHS.includes(pathname)
  const showTableCodeLinks = TABLE_CODE_LINKS_PATHS.includes(pathname)

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      {/* 헤더는 상단 고정, 이 줄은 본문과 함께 스크롤되어 사라짐 */}
      {showTableCodeLinks && <TableCodeLinks />}
      <main className="flex-1">{children}</main>
      {!hideFooter && <Footer />}
      <CartDrawer />
    </div>
  )
}
