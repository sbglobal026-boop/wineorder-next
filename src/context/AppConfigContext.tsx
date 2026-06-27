'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Product } from '@/data/products'
import {
  fetchProducts,
  createProductRow,
  updateProductRow,
  deleteProductRow,
  fetchFeaturedProductId,
  setFeaturedProductIdRemote,
} from '@/lib/products'

export type BannerSlide = {
  id: number
  title: string
  subtitle: string
  cta: string
  imageUrl?: string
}

export type AppConfig = {
  featuredWineId: number
  bannerSlides: BannerSlide[]
  products: Product[]
  approvedWriters: string[]
  fixedCosts: FixedCost[]
}

type AppConfigContextType = {
  config: AppConfig
  setFeaturedWine: (id: number) => void
  updateBannerSlide: (slide: BannerSlide) => void
  updateProduct: (product: Product) => void
  addProduct: (product: Omit<Product, 'id'>) => void
  deleteProduct: (id: number) => void
  approveWriter: (email: string) => void
  revokeWriter: (email: string) => void
  addFixedCost: (cost: Omit<FixedCost, 'id'>) => void
  deleteFixedCost: (id: number) => void
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
}

const AppConfigContext = createContext<AppConfigContextType | null>(null)

export function AppConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<AppConfig>(defaultConfig)
  const [isLoaded, setIsLoaded] = useState(false)

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
  }, [])

  useEffect(() => {
    if (!isLoaded) return
    try {
      localStorage.setItem('wineorder-config', JSON.stringify({ approvedWriters: config.approvedWriters }))
    } catch {
      console.warn('localStorage 용량 초과')
    }
  }, [config.approvedWriters, isLoaded])

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

  const updateProduct = (product: Product) => {
    setConfig(prev => ({
      ...prev,
      products: prev.products.map(p => p.id === product.id ? product : p),
    }))
    updateProductRow(product)
  }

  const addProduct = (product: Omit<Product, 'id'>) => {
    createProductRow(product).then(created => {
      setConfig(prev => ({ ...prev, products: [...prev.products, created] }))
    })
  }

  const deleteProduct = (id: number) => {
    const target = config.products.find(p => p.id === id)
    setConfig(prev => ({
      ...prev,
      products: prev.products.filter(p => p.id !== id),
    }))
    deleteProductRow(id, target?.imageUrl, target?.extraImages)
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

  const addFixedCost = (cost: Omit<FixedCost, 'id'>) => {
    createFixedCostRow(cost).then(created => {
      setConfig(prev => ({ ...prev, fixedCosts: [...prev.fixedCosts, created] }))
    })
  }

  const deleteFixedCost = (id: number) => {
    setConfig(prev => ({
      ...prev,
      fixedCosts: prev.fixedCosts.filter(c => c.id !== id),
    }))
    deleteFixedCostRow(id)
  }

  return (
    <AppConfigContext.Provider value={{
      config, setFeaturedWine,
      updateBannerSlide,
      updateProduct, addProduct, deleteProduct,
      approveWriter, revokeWriter,
      addFixedCost, deleteFixedCost,
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
