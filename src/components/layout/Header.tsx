'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/context/AuthContext'

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [cartCount] = useState(2)
  const { currentUser, logout } = useAuth()

  return (
    <header className="sticky top-0 z-50 bg-[#fef9e4] border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

        {/* 로고 */}
        <Link href="/">
          <Image src="/logo.png" alt="Wine Order" height={40} width={160} style={{ width: 'auto', height: '80px' }} priority />
        </Link>

        {/* 데스크탑 네비게이션 */}
        <nav className="hidden md:flex items-center gap-10 text-xs font-semibold uppercase tracking-widest text-gray-500">
          <Link href="/" className="hover:text-gray-900 transition-colors">홈</Link>
          <Link href="/events" className="hover:text-gray-900 transition-colors">Top Drop</Link>
          <Link href="/wines" className="hover:text-gray-900 transition-colors">와인</Link>
          <Link href="/support" className="hover:text-gray-900 transition-colors">식품</Link>
          <Link href="/blog" className="hover:text-gray-900 transition-colors">블로그</Link>
        </nav>

        {/* 아이콘 */}
        <div className="flex items-center gap-5">
          {currentUser ? (
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500 hidden md:block">{currentUser.name}</span>
              <button
                onClick={logout}
                className="text-xs text-gray-400 hover:text-gray-900 transition-colors font-medium"
              >
                로그아웃
              </button>
            </div>
          ) : (
            <Link href="/login" className="text-gray-400 hover:text-gray-900 transition-colors" title="로그인">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </Link>
          )}

          <Link href="/cart" className="relative text-gray-400 hover:text-gray-900 transition-colors" title="장바구니">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#8B4513] text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          <button className="md:hidden text-gray-400 hover:text-gray-900 transition-colors" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18 18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="md:hidden border-t border-gray-100 px-6 py-4 flex flex-col gap-4">
          {[
            { label: '홈', href: '/' },
            { label: 'Top Drop', href: '/events' },
            { label: '와인', href: '/wines' },
            { label: '식품', href: '/support' },
            { label: '블로그', href: '/blog' },
          ].map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
              className="text-xs font-semibold uppercase tracking-widest text-gray-500 hover:text-gray-900 transition-colors">
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  )
}
