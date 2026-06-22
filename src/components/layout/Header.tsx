'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'

const navItems = [
  { label: '홈.', href: '/' },
  { label: 'Top Drop.', href: '/events' },
  { label: '와인.', href: '/wines' },
  { label: '식품.', href: '/support' },
  { label: '블로그.', href: '/blog' },
]

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [cartCount] = useState(2)
  const { currentUser, logout } = useAuth()

  return (
    <header className="sticky top-0 z-50">
      {/* 공지 배너 */}
      <div className="bg-[#1C1A17] text-[#FBFAF7] flex items-center justify-between px-[15px] py-[9px] text-[12.5px] tracking-wide">
        <span className="flex-1" />
        <span className="flex-none text-center">구독하면 10% 할인 — 전국 무료 배송.</span>
        <span className="flex-1 flex justify-end gap-1.5 opacity-70 text-xs">
          ₩ KRW <span className="opacity-50">|</span> 대한민국
        </span>
      </div>

      <div className="bg-[#FBFAF7] border-b border-[#1C1A17]/10">
        <div className="max-w-7xl mx-auto px-[15px] h-14 flex items-center justify-between">

        {/* 로고 */}
        <Link href="/" className="text-[19px] font-semibold tracking-tight text-[#1C1A17]">
          table code
        </Link>

        {/* 데스크탑 네비게이션 */}
        <nav className="hidden md:flex items-center gap-8 text-[14.5px] font-medium text-[#1C1A17]">
          {navItems.map(item => (
            <Link key={item.href} href={item.href} className="opacity-80 hover:opacity-100 transition-opacity">
              {item.label}
            </Link>
          ))}
        </nav>

        {/* 아이콘 */}
        <div className="flex items-center gap-5 text-[14.5px] font-medium text-[#1C1A17]">
          {currentUser ? (
            <div className="flex items-center gap-3">
              <span className="opacity-70 hidden md:block">{currentUser.name}</span>
              <button onClick={logout} className="opacity-70 hover:opacity-100 transition-opacity">
                로그아웃.
              </button>
            </div>
          ) : (
            <Link href="/login" className="opacity-80 hover:opacity-100 transition-opacity">
              로그인.
            </Link>
          )}

          <Link href="/cart" className="relative opacity-80 hover:opacity-100 transition-opacity">
            장바구니 [{cartCount}]
          </Link>

          <button className="md:hidden opacity-80" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? '닫기.' : '메뉴.'}
          </button>
        </div>
        </div>

        {mobileOpen && (
          <nav className="md:hidden border-t border-[#1C1A17]/10 px-[15px] py-4 flex flex-col gap-4 bg-[#FBFAF7]">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                className="text-[15px] font-medium text-[#1C1A17] opacity-80 hover:opacity-100 transition-opacity">
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  )
}
