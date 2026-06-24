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
  bg: string
  accent: string
  ctaStyle: string
  imageUrl?: string
}

export type AppConfig = {
  featuredWineId: number
  bannerSlides: BannerSlide[]
  products: Product[]
  approvedWriters: string[]
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
}

const defaultBannerSlides: BannerSlide[] = [
  {
    id: 1,
    title: "봄의 시작,\n특별한 와인과 함께",
    subtitle: "프리미엄 와인 최대 30% 할인",
    cta: "지금 쇼핑하기",
    bg: "from-red-50 to-amber-50",
    accent: "text-red-700",
    ctaStyle: "bg-red-800 hover:bg-red-700 text-white",
  },
  {
    id: 2,
    title: "새로 입고된\n이탈리아 와인",
    subtitle: "슈퍼 투스칸 컬렉션 신규 입고",
    cta: "컬렉션 보기",
    bg: "from-emerald-50 to-teal-50",
    accent: "text-emerald-700",
    ctaStyle: "bg-emerald-800 hover:bg-emerald-700 text-white",
  },
  {
    id: 3,
    title: "선물로 완벽한\n프리미엄 세트",
    subtitle: "기프트 패키지 무료 포장",
    cta: "선물 고르기",
    bg: "from-purple-50 to-pink-50",
    accent: "text-purple-700",
    ctaStyle: "bg-purple-800 hover:bg-purple-700 text-white",
  },
]

const defaultConfig: AppConfig = {
  featuredWineId: 1,
  bannerSlides: defaultBannerSlides,
  products: [],
  approvedWriters: [],
}

const AppConfigContext = createContext<AppConfigContextType | null>(null)

export function AppConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<AppConfig>(defaultConfig)
  const [isLoaded, setIsLoaded] = useState(false)

  // 로컬 전용 설정 (배너, 작성자 승인 목록)
  useEffect(() => {
    const stored = localStorage.getItem('wineorder-config')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (!parsed.approvedWriters) parsed.approvedWriters = []
        setConfig(prev => ({
          ...prev,
          bannerSlides: parsed.bannerSlides ?? prev.bannerSlides,
          approvedWriters: parsed.approvedWriters,
        }))
      } catch {}
    }
    setIsLoaded(true)
  }, [])

  // 상품 / 추천상품 ID는 Supabase에서 로드
  useEffect(() => {
    fetchProducts().then(products => setConfig(prev => ({ ...prev, products })))
    fetchFeaturedProductId().then(id => {
      if (id !== null) setConfig(prev => ({ ...prev, featuredWineId: id }))
    })
  }, [])

  useEffect(() => {
    if (!isLoaded) return
    try {
      const persisted = {
        bannerSlides: config.bannerSlides,
        approvedWriters: config.approvedWriters,
      }
      localStorage.setItem('wineorder-config', JSON.stringify(persisted))
    } catch {
      console.warn('localStorage 용량 초과 — 이미지 크기를 줄여주세요')
    }
  }, [config.bannerSlides, config.approvedWriters, isLoaded])

  const setFeaturedWine = (id: number) => {
    setConfig(prev => ({ ...prev, featuredWineId: id }))
    setFeaturedProductIdRemote(id)
  }

  const updateBannerSlide = (slide: BannerSlide) =>
    setConfig(prev => ({
      ...prev,
      bannerSlides: prev.bannerSlides.map(s => s.id === slide.id ? slide : s),
    }))

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
    deleteProductRow(id, target?.imageUrl)
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

  return (
    <AppConfigContext.Provider value={{
      config, setFeaturedWine,
      updateBannerSlide,
      updateProduct, addProduct, deleteProduct,
      approveWriter, revokeWriter,
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
