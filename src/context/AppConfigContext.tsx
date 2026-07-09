'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Product, FixedCost } from '@/data/products'
import { useAuth } from '@/context/AuthContext'
import {
  fetchProducts,
  fetchFeaturedProductId,
  setFeaturedProductIdRemote,
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
  featuredWineId: number
  bannerSlides: BannerSlide[]
  products: Product[]
  approvedWriters: string[]
  fixedCosts: FixedCost[]
  cart: CartItem[]
}

type AppConfigContextType = {
  config: AppConfig
  bannerSlidesLoaded: boolean
  setFeaturedWine: (id: number) => void
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
  featuredWineId: 1,
  bannerSlides: defaultBannerSlides,
  products: [],
  approvedWriters: [],
  fixedCosts: [],
  cart: [],
}

const AppConfigContext = createContext<AppConfigContextType | null>(null)

export function AppConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<AppConfig>(defaultConfig)
  const [isLoaded, setIsLoaded] = useState(false)
  const [bannerSlidesLoaded, setBannerSlidesLoaded] = useState(false)
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
    fetchProducts().then(products => setConfig(prev => ({ ...prev, products })))
    fetchFeaturedProductId().then(id => {
      if (id !== null) setConfig(prev => ({ ...prev, featuredWineId: id }))
    })
    fetchBannerSlides().then(bannerSlides => {
      if (bannerSlides.length > 0) setConfig(prev => ({ ...prev, bannerSlides }))
      setBannerSlidesLoaded(true)
    })
  }, [])

  // 장바구니: 로그인한 사용자별로 localStorage에 저장 — 로그아웃하면 비고, 로그인하면 그 계정 것만 복원
  useEffect(() => {
    if (!currentUser) {
      setConfig(prev => ({ ...prev, cart: [] }))
      return
    }
    const stored = localStorage.getItem(`wineorder-cart-${currentUser.id}`)
    setConfig(prev => ({ ...prev, cart: stored ? JSON.parse(stored) : [] }))
  }, [currentUser])

  useEffect(() => {
    if (!currentUser) return
    localStorage.setItem(`wineorder-cart-${currentUser.id}`, JSON.stringify(config.cart))
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

  const setFeaturedWine = (id: number) => {
    setConfig(prev => ({ ...prev, featuredWineId: id }))
    setFeaturedProductIdRemote(id)
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
      config, bannerSlidesLoaded, setFeaturedWine,
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
