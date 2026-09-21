'use client'
import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react'
import { Product, FixedCost } from '@/data/products'
import { useAuth } from '@/context/AuthContext'
import {
  fetchProducts,
  fetchFeaturedProductIds,
  setFeaturedProductIdsRemote,
} from '@/lib/products'
import { fetchBannerSlides, updateBannerSlideRow } from '@/lib/banners'

import {
  createFixedCostRow,
  deleteFixedCostRow,
  fetchFixedCosts,
} from '@/lib/fixedCosts'

export type BannerSlide = {
  id: number
  title: string
  subtitle: string
  cta: string
  imageUrl?: string
  videoUrl?: string
  linkUrl?: string
}

// 장바구니
export type CartItem = {
  productId: number
  qty: number
}

export type AppConfig = {
  featuredWineIds: number[]
  bannerSlides: BannerSlide[]
  products: Product[]
  approvedWriters: string[]
  fixedCosts: FixedCost[]
  cart: CartItem[]
}

type AppConfigContextType = {
  config: AppConfig
  productsLoaded: boolean
  bannerSlidesLoaded: boolean
  toggleFeaturedWine: (id: number) => void
  updateBannerSlide: (slide: BannerSlide) => void
  approveWriter: (email: string) => void
  revokeWriter: (email: string) => void
  addFixedCost: (cost: Omit<FixedCost, 'id'>) => void
  deleteFixedCost: (id: number) => void
  getTotalFixedCost: () => number
  addToCart: (productId: number) => void
  removeFromCart: (productId: number) => void
  updateCartQty: (productId: number, qty: number) => void
  clearCart: () => void
  isCartOpen: boolean
  openCart: () => void
  closeCart: () => void
  refreshProducts: () => Promise<void>
}

const defaultBannerSlides: BannerSlide[] = [
  { id: 1, title: "봄의 시작,\n특별한 와인과 함께", subtitle: "프리미엄 와인 최대 30% 할인", cta: "지금 쇼핑하기" },
  { id: 2, title: "새로 입고된\n이탈리아 와인", subtitle: "슈퍼 투스칸 컬렉션 신규 입고", cta: "컬렉션 보기" },
  { id: 3, title: "선물로 완벽한\n프리미엄 세트", subtitle: "기프트 패키지 무료 포장", cta: "선물 고르기" },
  { id: 4, title: "주말 한정\n스파클링 와인", subtitle: "버블의 계절, 지금이 기회", cta: "둘러보기" },
]

const defaultConfig: AppConfig = {
  featuredWineIds: [1],
  bannerSlides: defaultBannerSlides,
  products: [],
  approvedWriters: [],
  fixedCosts: [],
  cart: [],
}

// 장바구니 저장 위치 — 로그인 전에는 게스트 칸, 로그인 후에는 계정별 칸
const GUEST_CART_KEY = 'wineorder-cart-guest'
const cartKey = (userId: string | null) => (userId ? `wineorder-cart-${userId}` : GUEST_CART_KEY)

function readCart(key: string): CartItem[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) ?? 'null')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeCart(key: string, cart: CartItem[]) {
  try {
    localStorage.setItem(key, JSON.stringify(cart))
  } catch {
    console.warn('localStorage 용량 초과')
  }
}

// 로그인 전 담아둔 장바구니와 계정 장바구니를 합침 — 같은 상품은 수량을 더함
function mergeCarts(accountCart: CartItem[], guestCart: CartItem[]): CartItem[] {
  const merged = accountCart.map(item => ({ ...item }))
  for (const item of guestCart) {
    const found = merged.find(m => m.productId === item.productId)
    if (found) found.qty += item.qty
    else merged.push({ ...item })
  }
  return merged
}

const AppConfigContext = createContext<AppConfigContextType | null>(null)

export function AppConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<AppConfig>(defaultConfig)
  const [isLoaded, setIsLoaded] = useState(false)
  const [bannerSlidesLoaded, setBannerSlidesLoaded] = useState(false)
  const [productsLoaded, setProductsLoaded] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const { currentUser } = useAuth()

  const openCart = () => setIsCartOpen(true)
  const closeCart = () => setIsCartOpen(false)

  // 로컬 전용 설정 (작성자 승인 목록)
  useEffect(() => {
    const stored = localStorage.getItem('wineorder-config')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setConfig(prev => ({
          ...prev,
          approvedWriters: parsed.approvedWriters ?? [],
        }))
      } catch {}
    }
    setIsLoaded(true)
  }, [])

  // 상품 / 추천상품 ID / 배너 슬라이드는 Supabase에서 로드
  useEffect(() => {
    fetchProducts().then(products => {
      setConfig(prev => ({ ...prev, products }))
      setProductsLoaded(true)
    })
    fetchFeaturedProductIds().then(ids => {
      setConfig(prev => ({ ...prev, featuredWineIds: ids }))
    })
    fetchBannerSlides().then(bannerSlides => {
      if (bannerSlides.length > 0) setConfig(prev => ({ ...prev, bannerSlides }))
      setBannerSlidesLoaded(true)
    })
  }, [])

  // 현재 장바구니의 주인 — null = 로그인 전(게스트), undefined = 아직 불러오기 전
  const cartOwnerRef = useRef<string | null | undefined>(undefined)
  // 방금 불러온 장바구니가 화면 상태에 반영되기 전에 저장이 먼저 돌아 빈 값으로 덮어쓰는 것을 막기 위한 표시
  const pendingCartRef = useRef<CartItem[] | null>(null)

  // 장바구니 불러오기: 로그인 전에는 게스트 장바구니, 로그인하면 계정 장바구니와 합쳐서 복원
  useEffect(() => {
    const ownerId = currentUser?.id ?? null
    // 같은 주인인데 로그인 상태만 다시 확인된 경우(탭 복귀 등)에는 화면의 장바구니를 그대로 둠
    if (cartOwnerRef.current === ownerId) return
    const previousOwner = cartOwnerRef.current
    cartOwnerRef.current = ownerId

    let nextCart: CartItem[]
    if (!ownerId) {
      // 첫 방문(불러오기 전)에는 게스트 장바구니 복원, 로그아웃한 경우에는 비움
      nextCart = previousOwner === undefined ? readCart(GUEST_CART_KEY) : []
      writeCart(GUEST_CART_KEY, nextCart)
    } else {
      // 로그인 — 로그인 전 담아둔 장바구니를 계정 장바구니와 합치고, 게스트 쪽은 비움
      const guestCart = readCart(GUEST_CART_KEY)
      nextCart = mergeCarts(readCart(cartKey(ownerId)), guestCart)
      if (guestCart.length > 0) writeCart(GUEST_CART_KEY, [])
      writeCart(cartKey(ownerId), nextCart)
    }

    pendingCartRef.current = nextCart
    setConfig(prev => ({ ...prev, cart: nextCart }))
  }, [currentUser])

  // 장바구니 저장 (로그인 전에는 게스트 칸에 저장 → 새로고침해도 유지되고 로그인 시 합쳐짐)
  useEffect(() => {
    if (cartOwnerRef.current === undefined) return
    if (pendingCartRef.current) {
      // 불러온 장바구니가 아직 반영되기 전이면 저장하지 않음
      if (config.cart !== pendingCartRef.current) return
      pendingCartRef.current = null
    }
    writeCart(cartKey(cartOwnerRef.current), config.cart)
  }, [config.cart, currentUser])

  useEffect(() => {
    if (!isLoaded) return
    try {
      localStorage.setItem('wineorder-config', JSON.stringify({ approvedWriters: config.approvedWriters }))
    } catch {
      console.warn('localStorage 용량 초과')
    }
  }, [config.approvedWriters, isLoaded])

  // 고정비 데이터베이스에서 로드
  useEffect(() => {
    fetchFixedCosts().then((data) => {
      setConfig(prev => ({
        ...prev,
        fixedCosts: data,
      }))
    })
  }, [])

  const refreshProducts = async () => {
    const products = await fetchProducts()
    setConfig(prev => ({ ...prev, products }))
  }

  const toggleFeaturedWine = (id: number) => {
    setConfig(prev => {
      const next = prev.featuredWineIds.includes(id)
        ? prev.featuredWineIds.filter(existingId => existingId !== id)
        : [...prev.featuredWineIds, id]
      setFeaturedProductIdsRemote(next)
      return { ...prev, featuredWineIds: next }
    })
  }

  const updateBannerSlide = (slide: BannerSlide) => {
    setConfig(prev => ({
      ...prev,
      bannerSlides: prev.bannerSlides.map(s => s.id === slide.id ? slide : s),
    }))
    updateBannerSlideRow(slide)
  }

  const approveWriter = (email: string) =>
    setConfig(prev => ({
      ...prev,
      approvedWriters: prev.approvedWriters.includes(email)
        ? prev.approvedWriters
        : [...prev.approvedWriters, email],
    }))

  const revokeWriter = (email: string) =>
    setConfig(prev => ({
      ...prev,
      approvedWriters: prev.approvedWriters.filter(e => e !== email),
    }))

  // 고정비 추가
  const addFixedCost = (cost: Omit<FixedCost, 'id'>) => {
    createFixedCostRow(cost).then(created => {
      setConfig(prev => ({ ...prev, fixedCosts: [...prev.fixedCosts, created] }))
    })
  }

  // 고정비 삭제
  const deleteFixedCost = (id: number) => {
    setConfig(prev => ({
      ...prev,
      fixedCosts: prev.fixedCosts.filter(c => c.id !== id),
    }))
    deleteFixedCostRow(id)
  }

  // 모든 고정비 합계
  const getTotalFixedCost = () => {
  return config.fixedCosts.reduce((sum, cost) => {
    return sum + Number(cost.amount)
  }, 0)
}

// 장바구니 추가
const addToCart = (productId: number) => {
  setConfig(prev => {
    const existing = prev.cart.find(c => c.productId === productId)

    if (existing) {
      return {
        ...prev,
        cart: prev.cart.map(c =>
          c.productId === productId
            ? { ...c, qty: c.qty + 1 }
            : c
        ),
      }
    }

    return {
      ...prev,
      cart: [...prev.cart, { productId, qty: 1 }],
    }
  })
}

// 장바구니 수량 직접 변경 (0 이하면 삭제)
const updateCartQty = (productId: number, qty: number) => {
  if (qty <= 0) {
    setConfig(prev => ({ ...prev, cart: prev.cart.filter(c => c.productId !== productId) }))
  } else {
    setConfig(prev => ({
      ...prev,
      cart: prev.cart.map(c => c.productId === productId ? { ...c, qty } : c),
    }))
  }
}

// 장바구니 삭제
const removeFromCart = (productId: number) => {
  setConfig(prev => ({
    ...prev,
    cart: prev.cart.filter(c => c.productId !== productId),
  }))
}

// 장바구니 비우기
const clearCart = () => {
  setConfig(prev => ({ ...prev, cart: [] }))
}

  return (
    <AppConfigContext.Provider value={{
      config, productsLoaded, bannerSlidesLoaded, toggleFeaturedWine,
      updateBannerSlide,
      approveWriter, revokeWriter,
      addFixedCost, deleteFixedCost,
      getTotalFixedCost,
      addToCart, removeFromCart, updateCartQty, clearCart,
      isCartOpen, openCart, closeCart,
      refreshProducts,
    }}>
      {children}
    </AppConfigContext.Provider>
  )
}

export function useAppConfig() {
  const ctx = useContext(AppConfigContext)
  if (!ctx) throw new Error('useAppConfig must be used within AppConfigProvider')
  return ctx
}
