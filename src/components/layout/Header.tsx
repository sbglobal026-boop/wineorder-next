'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useAppConfig } from '@/context/AppConfigContext'
import { childCategories, categoryLabel } from '@/lib/blogCategories'

const navItems = [
  { label: 'Home', href: '/' },
  {
    label: 'Top Drop',
    href: '/events',
    children: [
      { label: '와인', href: '/events/wines' },
      { label: '식품', href: '/events/food' },
    ],
  },
  {
    label: 'Wine',
    href: '/blog/wine',
    children: childCategories('wine').map(c => ({ label: categoryLabel(c), href: `/blog/${c}` })),
  },
  { label: 'Food & Drink', href: '/blog/food-drink' },
  { label: 'Travel', href: '/blog/travel' },
]

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { currentUser, logout } = useAuth()
  const { config } = useAppConfig()
  const cartCount = config.cart.reduce((sum, c) => sum + c.qty, 0)
  const [isAdmin, setIsAdmin] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (!currentUser) {
      setIsAdmin(false)
      return
    }
    fetch('/api/admin/me')
      .then(res => res.json())
      .then(data => setIsAdmin(!!data.isAdmin))
      .catch(() => setIsAdmin(false))
  }, [currentUser])

  return (
    <header className="sticky top-0 z-50">
      {/* 공지 배너 */}
      <div className="max-w-[1640px] mx-auto bg-[#0e3719] text-[#FBFAF7] flex items-center justify-between px-[20px] py-[9px] text-[12.5px] tracking-wide">
        <span className="flex-1" />
        <span className="flex-none text-center">구독하면 10% 할인 — 전국 무료 배송.</span>
        <span className="flex-1 flex justify-end gap-1.5 opacity-70 text-xs">
          ₩ KRW <span className="opacity-50">|</span> 대한민국
        </span>
      </div>

      <div>
        <div className="max-w-[1640px] mx-auto bg-[#F9F4EE] px-[20px] h-12 flex items-center justify-between">

        {/* 로고 */}
        <Link href="/" className="relative flex items-center h-full w-[120px] shrink-0">
          <span className={`font-[family-name:var(--font-playfair-display)] text-[21px] font-semibold tracking-tight text-[#1C1A17] pt-3 transition-opacity duration-300 whitespace-nowrap ${scrolled ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            table code
          </span>
          <img
            src="/table code-7.png"
            alt="TC"
            className={`absolute h-7 w-auto mt-[6px] transition-opacity duration-300 ${scrolled ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          />
        </Link>

        {/* 데스크탑 네비게이션 */}
        <nav className="hidden md:flex items-center gap-8 text-[13px] font-medium text-[#1C1A17] pt-4 font-[family-name:var(--font-lato)]">
          {navItems.map(item => (
            <div key={item.href} className="group relative">
              <Link href={item.href} className="opacity-80 hover:opacity-100 transition-opacity">
                {item.label}
              </Link>
              {item.children && (
                <div className="absolute left-0 top-full pt-3 hidden group-hover:block">
                  <div className="min-w-[120px] bg-[#F9F4EE] border border-[#1C1A17]/10 shadow-md py-2">
                    {item.children.map(child => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block px-4 py-2 text-[14px] opacity-80 hover:opacity-100 hover:bg-[#1C1A17]/5 transition-colors whitespace-nowrap"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* 아이콘 */}
        <div className="flex items-center gap-5 text-[12px] font-medium text-[#1C1A17] pt-4 font-[family-name:var(--font-lato)]">
          {currentUser ? (
            <div className="flex items-center gap-3">
              {isAdmin && (
                <Link href="/admin" className="opacity-70 hover:opacity-100 transition-opacity">
                  Admin
                </Link>
              )}
              <span className="opacity-70 hidden md:block">{currentUser.name}</span>
              <button onClick={logout} className="opacity-70 hover:opacity-100 transition-opacity cursor-pointer">
                Logout
              </button>
            </div>
          ) : (
            <Link href="/login" className="opacity-80 hover:opacity-100 transition-opacity">
              Login
            </Link>
          )}

          <Link href="/cart" className="relative opacity-80 hover:opacity-100 transition-opacity">
            Cart [{cartCount}]
          </Link>

          <button className="md:hidden opacity-80 cursor-pointer" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? 'Close' : 'Menu'}
          </button>
        </div>
        </div>

        <div className="max-w-[1600px] mx-auto border-b border-[#1C1A17]" />

        {mobileOpen && (
          <nav className="md:hidden border-t border-[#1C1A17]/10 max-w-[1640px] mx-auto px-[20px] py-4 flex flex-col gap-4 bg-[#F9F4EE]">
            {navItems.map((item) => (
              <div key={item.href} className="flex flex-col gap-2">
                <Link href={item.href} onClick={() => setMobileOpen(false)}
                  className="text-[15px] font-medium text-[#1C1A17] opacity-80 hover:opacity-100 transition-opacity">
                  {item.label}
                </Link>
                {item.children && (
                  <div className="flex flex-col gap-2 pl-4">
                    {item.children.map(child => (
                      <Link key={child.href} href={child.href} onClick={() => setMobileOpen(false)}
                        className="text-[14px] text-[#1C1A17] opacity-60 hover:opacity-100 transition-opacity">
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        )}
      </div>
    </header>
  )
}
