'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useAppConfig } from '@/context/AppConfigContext'
import { Menu, X } from 'lucide-react'
import { childCategories, categoryLabel } from '@/lib/blogCategories'
import { memberDisplayName, type MemberTier } from '@/lib/memberTiers'
import TierBadge from '@/components/member/TierBadge'

type NavItem = { label: string; href: string; children?: { label: string; href: string }[] }

// 메인(/) = Top Drop 목록. 안내·블로그·저널 메뉴바 맨 앞에만 붙이고,
// Top Drop 메뉴와 같은 곳을 가리키므로 두 메뉴가 함께 보이는 곳(쇼핑 메뉴바·기본 메뉴바)에서는 뺌
const homeItem: NavItem = { label: 'Home', href: '/' }

const navItems: NavItem[] = [
  { label: '소개', href: '/about' },
  { label: 'FAQ', href: '/faq' },
  {
    label: 'Top Drop',
    href: '/',
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
  { label: 'Journal', href: '/journal' },
]

// 메인(/)·/events 계열 페이지 전용 평탄화 메뉴 (Top Drop 하위메뉴를 상단으로 올림, 나머지 숨김)
const eventsNav: NavItem[] = [
  { label: 'Top Drop', href: '/' },
  { label: 'Wine', href: '/events/wines' },
  { label: 'Food', href: '/events/food' },
]

// 로그인한 회원 이름 + 등급 배지 (가입 때 입력한 이름이 없으면 이메일 앞부분)
// compact: 데스크톱 헤더가 좁은 화면(1024px 미만)에서 넘치지 않도록 이름은 숨기고 배지만 표시
function MemberNameBadge({ name, email, tier, compact = false }: { name: string; email: string; tier: MemberTier; compact?: boolean }) {
  const displayName = memberDisplayName(name, email)
  const nameCls = compact ? 'hidden lg:inline' : ''
  return (
    <span className="flex items-center gap-1.5 min-w-0 text-[#FBFAF7]" title={`${displayName} 님`}>
      <span className={`truncate max-w-[120px] ${nameCls}`}>{displayName}</span>
      <span className={`shrink-0 ${nameCls}`}>님</span>
      <TierBadge tier={tier} className="shrink-0" />
    </span>
  )
}

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { currentUser, logout } = useAuth()
  const { config } = useAppConfig()
  // 삭제된 상품을 가리키는 장바구니 항목은 실제 화면(카트/체크아웃)에서도 제외되므로 카운트에서도 동일하게 제외
  const cartCount = config.cart
    .filter(c => config.products.some(p => p.id === c.productId))
    .reduce((sum, c) => sum + c.qty, 0)
  const [isAdmin, setIsAdmin] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  // 카드 선택 화면(/welcome)에서는 미니멀 헤더 — Home/소개/FAQ 메뉴 + Login 버튼만 노출
  const isHome = pathname === '/welcome'
  // 메인(Top Drop)과 쇼핑 플로우(상품·장바구니·결제)는 와인 페이지와 동일한 메뉴바(eventsNav) 사용
  const isEvents = pathname === '/' || pathname.startsWith('/events') || pathname.startsWith('/cart') || pathname.startsWith('/checkout') || pathname.startsWith('/order') || pathname.startsWith('/mypage')
  const isBlog = pathname.startsWith('/blog')
  const isJournal = pathname.startsWith('/journal')
  // 안내·법적·게시판 페이지: 메뉴바를 Home/소개/FAQ만 노출
  const INFO_PREFIXES = ['/about', '/faq', '/cs-board', '/shipping-guide', '/returns', '/notices', '/ueber-uns', '/agb', '/datenschutz', '/impressum']
  const isInfo = INFO_PREFIXES.some(p => pathname.startsWith(p))
  const HOME_NAV = ['/about', '/faq']
  // 블로그 페이지: Home + 블로그 카테고리(Wine/Food & Drink/Travel/Monthly Table)만, 나머지 숨김
  const BLOG_NAV = ['/blog/wine', '/blog/food-drink', '/blog/travel', '/blog/monthly-table']
  // 저널 페이지: Home + Journal만, 나머지 숨김
  const JOURNAL_NAV = ['/journal']
  const navToShow = isHome || isInfo
    ? [homeItem, ...navItems.filter(i => HOME_NAV.includes(i.href))]
    : isEvents
      ? eventsNav
      : isBlog
        ? [homeItem, ...navItems.filter(i => BLOG_NAV.includes(i.href))]
        : isJournal
          ? [homeItem, ...navItems.filter(i => JOURNAL_NAV.includes(i.href))]
          : navItems

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
      {/* 헤더 전체에 보틀그린 배경 → 콘텐츠와 구분선 사이 틈으로 본문이 비치지 않게 */}
      <div className="bg-[#0e3719]">
        <div>
        <div className="h-12 flex items-center justify-between max-w-[1240px] mx-auto px-5">

        {/* 로고 */}
        <Link href="/" className="relative flex items-center h-full w-[120px] shrink-0">
          <span className={`font-[family-name:var(--font-playfair-display)] text-[21px] font-semibold tracking-tight text-[#FBFAF7] pt-3 transition-opacity duration-300 whitespace-nowrap ${scrolled ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            table code
          </span>
          <img
            src="/table code-7.png"
            alt="TC"
            className={`absolute h-7 w-auto mt-[6px] brightness-0 invert transition-opacity duration-300 ${scrolled ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          />
        </Link>

        {/* 데스크탑 네비게이션 — 호버 시 밝기 강조 + 둥근 카드형 드롭다운 */}
        <nav className="hidden md:flex items-center gap-8 text-[15px] font-medium text-[#FBFAF7] pt-4 font-[family-name:var(--font-lato)]">
          {navToShow.map(item => (
            <div key={item.href} className="group relative">
              <Link href={item.href} className="opacity-80 hover:opacity-100 transition-opacity">
                {item.label}
              </Link>
              {item.children && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 hidden group-hover:block">
                  <div className="min-w-[150px] bg-[#FBFAF7] border border-[#eae7e7] rounded-2xl shadow-[0_12px_32px_-12px_rgba(15,25,18,.28)] py-2 overflow-hidden">
                    {item.children.map(child => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block px-4 py-2 text-[14px] text-[#605d5d] hover:text-[#0e3719] hover:bg-[#0e3719]/[0.06] transition-colors whitespace-nowrap"
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
        <div className="flex items-center gap-2.5 text-[12px] font-medium text-[#FBFAF7] pt-4 font-[family-name:var(--font-lato)]">
          {isHome ? (
            /* 홈: 데스크톱은 로그인 알약, 모바일은 햄버거(메뉴+로그인은 그 안으로). 카트 없음 */
            <>
              <div className="hidden md:flex items-center gap-2.5">
                {currentUser ? (
                  <>
                    <MemberNameBadge name={currentUser.name} email={currentUser.email} tier={currentUser.tier} compact />
                    <button onClick={logout} className="rounded-full border border-[#FBFAF7]/40 text-[#FBFAF7] px-4 py-1.5 hover:bg-[#FBFAF7]/[0.12] transition-colors cursor-pointer">
                      Logout
                    </button>
                  </>
                ) : (
                  <Link href="/login" className="rounded-full border border-[#FBFAF7]/40 text-[#FBFAF7] px-4 py-1.5 hover:bg-[#FBFAF7]/[0.12] transition-colors">
                    Login
                  </Link>
                )}
              </div>
              <button
                className="md:hidden text-[#FBFAF7] p-1 cursor-pointer"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label={mobileOpen ? '메뉴 닫기' : '메뉴 열기'}
              >
                {mobileOpen ? <X size={24} strokeWidth={1.75} /> : <Menu size={24} strokeWidth={1.75} />}
              </button>
            </>
          ) : (
            <>
              <div className="hidden md:flex items-center gap-2.5">
                {currentUser ? (
                  <div className="flex items-center gap-2.5">
                    <MemberNameBadge name={currentUser.name} email={currentUser.email} tier={currentUser.tier} compact />
                    {isAdmin && (
                      <Link href="/admin" className="rounded-full border border-[#FBFAF7]/40 text-[#FBFAF7] px-3 py-1.5 hover:bg-[#FBFAF7]/[0.12] transition-colors">
                        Admin
                      </Link>
                    )}
                    <Link href="/mypage" className="rounded-full border border-[#FBFAF7]/40 text-[#FBFAF7] px-4 py-1.5 hover:bg-[#FBFAF7]/[0.12] transition-colors">
                      My Page
                    </Link>
                    <button onClick={logout} className="rounded-full border border-[#FBFAF7]/40 text-[#FBFAF7] px-3 py-1.5 hover:bg-[#FBFAF7]/[0.12] transition-colors cursor-pointer">
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link href="/login" className="rounded-full border border-[#FBFAF7]/40 text-[#FBFAF7] px-4 py-1.5 hover:bg-[#FBFAF7]/[0.12] transition-colors">
                    Login
                  </Link>
                )}

                <Link href="/cart" className="relative rounded-full bg-[#FBFAF7] text-[#0e3719] px-4 py-1.5 hover:bg-white transition-colors">
                  Cart [{cartCount}]
                </Link>
              </div>

              <button
                className="md:hidden text-[#FBFAF7] p-1 cursor-pointer"
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

        <div className="max-w-[1240px] mx-auto px-5 mt-3"><div className="border-b border-[#FBFAF7]/15" /></div>

        {mobileOpen && (
          <nav className="md:hidden border-t border-[#FBFAF7]/15 max-w-[1240px] mx-auto px-5 py-4 flex flex-col gap-4 bg-[#0e3719]">
            {navToShow.map((item) => (
              <div key={item.href} className="flex flex-col gap-2">
                <Link href={item.href} onClick={() => setMobileOpen(false)}
                  className="text-[15px] font-medium text-[#FBFAF7] hover:opacity-70 transition-opacity">
                  {item.label}
                </Link>
                {item.children && (
                  <div className="flex flex-col gap-2 pl-4 border-l border-[#FBFAF7]/20">
                    {item.children.map(child => (
                      <Link key={child.href} href={child.href} onClick={() => setMobileOpen(false)}
                        className="text-[14px] text-[#FBFAF7]/60 hover:text-[#FBFAF7] transition-colors">
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* 모바일 전용: 로그인/카트/어드민 (데스크톱 알약 버튼 대체). 홈에선 카트 숨김 */}
            <div className="flex flex-col gap-3 pt-4 mt-2 border-t border-[#FBFAF7]/15">
              {currentUser && (
                <div className="text-[15px] font-medium">
                  <MemberNameBadge name={currentUser.name} email={currentUser.email} tier={currentUser.tier} />
                </div>
              )}
              {!isHome && (
                <Link href="/cart" onClick={() => setMobileOpen(false)}
                  className="text-[15px] font-medium text-[#FBFAF7] hover:opacity-70 transition-opacity">
                  Cart [{cartCount}]
                </Link>
              )}
              {currentUser ? (
                <>
                  {isAdmin && (
                    <Link href="/admin" onClick={() => setMobileOpen(false)}
                      className="text-[15px] font-medium text-[#FBFAF7] hover:opacity-70 transition-opacity">
                      Admin
                    </Link>
                  )}
                  <Link href="/mypage" onClick={() => setMobileOpen(false)} className="text-[15px] font-medium text-[#FBFAF7] hover:opacity-70 transition-opacity">마이페이지</Link>
                  <button onClick={() => { logout(); setMobileOpen(false) }}
                    className="text-left text-[15px] font-medium text-[#FBFAF7] hover:opacity-70 transition-opacity cursor-pointer">
                    Logout
                  </button>
                </>
              ) : (
                <Link href="/login" onClick={() => setMobileOpen(false)}
                  className="text-[15px] font-medium text-[#FBFAF7] hover:opacity-70 transition-opacity">
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
