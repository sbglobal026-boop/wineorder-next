'use client'
import { usePathname } from 'next/navigation'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import CartDrawer from '@/components/cart/CartDrawer'
import AgeGate from '@/components/layout/AgeGate'

// 카드 선택 화면(/welcome)에서는 푸터만 숨김 (카드 컨셉 랜딩을 깔끔하게 보여주기 위함). 헤더는 모든 페이지에 표시
const HIDE_FOOTER_PATHS = ['/welcome']

export default function ShopChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const hideFooter = HIDE_FOOTER_PATHS.includes(pathname)

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">{children}</main>
      {!hideFooter && <Footer />}
      <CartDrawer />
      {/* 19세 이상 확인 팝업 — 쇼핑몰 전체 페이지에 적용 (제외 경로는 AgeGate 안에서 처리) */}
      <AgeGate />
    </div>
  )
}
