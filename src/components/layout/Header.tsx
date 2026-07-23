'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useAppConfig } from '@/context/AppConfigContext'
import { Menu, X } from 'lucide-react'
import { childCategories, categoryLabel } from '@/lib/blogCategories'

const navItems = [
  { label: 'Home', href: '/' },
  { label: '소개', href: '/about' },
  { label: 'FAQ', href: '/faq' },
  {
    label: 'Top Drop',
    href: '/events',
    children: [
      { label: 'Wine', href: '/events/wines' },
      { label: 'Food', href: '/events/food' },
    ],
  },
  {
    label: 'Wine',
    href: '/blog/wine',
    children: childCategories('wine').map(c => ({ label: categoryLabel(c), href: `/blog/${c}` })),
  },
  {
    label: 'Food & Drink',
    href: '/blog/food-drink',
    children: childCategories('food-drink').map(c => ({ label: categoryLabel(c), href: `/blog/${c}` })),
  },
  {
    label: 'Travel',
    href: '/blog/travel',
    children: childCategories('travel').map(c => ({ label: categoryLabel(c), href: `/blog/${c}` })),
  },
  { label: 'Monthly Table', href: '/blog/monthly-table' },
]

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { currentUser, logout } = useAuth()
  const { config } = useAppConfig()
  const cartCount = config.cart.reduce((sum, c) => sum + c.qty, 0)
  const [isAdmin, setIsAdmin] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  // 홈("/")에서는 미니멀 헤더 — Home/소개/FAQ 메뉴 + Login 버튼만 노출
  const isHome = pathname === '/'
  const HOME_NAV = ['/', '/about', '/faq']
  const navToShow = isHome ? navItems.filter(i => HOME_NAV.includes(i.href)) : navItems

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
      <div>
        {/* 배경은 1640 폭 전체, 콘텐츠는 홈에서 카드 그리드(1240)에 맞춰 정렬 */}
        <div className="max-w-[1640px] mx-auto bg-[#F9F4EE] px-[20px]">
        <div className={`h-12 flex items-center justify-between ${isHome ? 'max-w-[1240px] mx-auto' : ''}`}>

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

        {/* 데스크탑 네비게이션 — 호버 시 앰버 강조 + 둥근 카드형 드롭다운 */}
        <nav className="hidden md:flex items-center gap-8 text-[15px] font-medium text-[#1C1A17] pt-4 font-[family-name:var(--font-lato)]">
          {navToShow.map(item => (
            <div key={item.href} className="group relative">
              <Link href={item.href} className="opacity-80 hover:opacity-100 hover:text-[#7d5411] transition-colors">
                {item.label}
              </Link>
              {item.children && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 hidden group-hover:block">
                  <div className="min-w-[150px] bg-[#fffefb] border border-[#eae7e7] rounded-2xl shadow-[0_12px_32px_-12px_rgba(80,58,20,.28)] py-2 overflow-hidden">
                    {item.children.map(child => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block px-4 py-2 text-[14px] text-[#605d5d] hover:text-[#7d5411] hover:bg-[#7d5411]/[0.06] transition-colors whitespace-nowrap"
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

        {/* 아이콘 — 카드 톤의 둥근 알약 버튼 */}
        <div className="flex items-center gap-2.5 text-[12px] font-medium text-[#1C1A17] pt-4 font-[family-name:var(--font-lato)]">
          {isHome ? (
            /* 홈: 로그인 버튼만 (카트/햄버거 숨김, 모바일·데스크톱 모두 노출) */
            currentUser ? (
              <button onClick={logout} className="rounded-full border border-[#b68235]/50 text-[#7d5411] px-4 py-1.5 hover:bg-[#7d5411]/[0.06] transition-colors cursor-pointer">
                Logout
              </button>
            ) : (
              <Link href="/login" className="rounded-full border border-[#b68235]/50 text-[#7d5411] px-4 py-1.5 hover:bg-[#7d5411]/[0.06] transition-colors">
                Login
              </Link>
            )
          ) : (
            <>
              <div className="hidden md:flex items-center gap-2.5">
                {currentUser ? (
                  <div className="flex items-center gap-2.5">
                    {isAdmin && (
                      <Link href="/admin" className="rounded-full border border-[#b68235]/50 text-[#7d5411] px-3 py-1.5 hover:bg-[#7d5411]/[0.06] transition-colors">
                        Admin
                      </Link>
                    )}
                    <span className="text-[#605d5d]">{currentUser.name}</span>
                    <button onClick={logout} className="rounded-full border border-[#b68235]/50 text-[#7d5411] px-3 py-1.5 hover:bg-[#7d5411]/[0.06] transition-colors cursor-pointer">
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link href="/login" className="rounded-full border border-[#b68235]/50 text-[#7d5411] px-4 py-1.5 hover:bg-[#7d5411]/[0.06] transition-colors">
                    Login
                  </Link>
                )}

                <Link href="/cart" className="relative rounded-full bg-[#7d5411] text-[#FBFAF7] px-4 py-1.5 hover:bg-[#5a3b0a] transition-colors">
                  Cart [{cartCount}]
                </Link>
              </div>

              <button
                className="md:hidden text-[#7d5411] p-1 cursor-pointer"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label={mobileOpen ? '메뉴 닫기' : '메뉴 열기'}
              >
                {mobileOpen ? <X size={24} strokeWidth={1.75} /> : <Menu size={24} strokeWidth={1.75} />}
              </button>
            </>
          )}
        </div>
        </div>
        </div>

        <div className={`mx-auto border-b border-[#eae7e7] mt-3 ${isHome ? 'max-w-[1240px]' : 'max-w-[1600px]'}`} />

        {mobileOpen && (
          <nav className="md:hidden border-t border-[#eae7e7] max-w-[1640px] mx-auto px-[20px] py-4 flex flex-col gap-4 bg-[#F9F4EE]">
            {navToShow.map((item) => (
              <div key={item.href} className="flex flex-col gap-2">
                <Link href={item.href} onClick={() => setMobileOpen(false)}
                  className="text-[15px] font-medium text-[#1C1A17] hover:text-[#7d5411] transition-colors">
                  {item.label}
                </Link>
                {item.children && (
                  <div className="flex flex-col gap-2 pl-4 border-l border-[#eae7e7]">
                    {item.children.map(child => (
                      <Link key={child.href} href={child.href} onClick={() => setMobileOpen(false)}
                        className="text-[14px] text-[#605d5d] hover:text-[#7d5411] transition-colors">
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* 모바일 전용: 로그인/카트/어드민 (데스크톱 알약 버튼 대체) */}
            <div className="flex flex-col gap-3 pt-4 mt-2 border-t border-[#eae7e7]">
              <Link href="/cart" onClick={() => setMobileOpen(false)}
                className="text-[15px] font-medium text-[#7d5411] hover:opacity-80 transition-opacity">
                Cart [{cartCount}]
              </Link>
              {currentUser ? (
                <>
                  {isAdmin && (
                    <Link href="/admin" onClick={() => setMobileOpen(false)}
                      className="text-[15px] font-medium text-[#7d5411] hover:opacity-80 transition-opacity">
                      Admin
                    </Link>
                  )}
                  <span className="text-[14px] text-[#605d5d]">{currentUser.name}</span>
                  <button onClick={() => { logout(); setMobileOpen(false) }}
                    className="text-left text-[15px] font-medium text-[#7d5411] hover:opacity-80 transition-opacity cursor-pointer">
                    Logout
                  </button>
                </>
              ) : (
                <Link href="/login" onClick={() => setMobileOpen(false)}
                  className="text-[15px] font-medium text-[#7d5411] hover:opacity-80 transition-opacity">
                  Login
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
