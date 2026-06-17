'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { products as defaultProducts, Product } from '@/data/products'

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

export type AdBannerContent = {
  badge: string
  title: string
  highlight: string
  description: string
  primaryBtn: string
  secondaryBtn: string
}

export type SectionsConfig = {
  adBanner: boolean
}

export type BlogPost = {
  id: number
  title: string
  content: string
  imageUrl?: string
  createdAt: string
}

export type AppConfig = {
  featuredWineId: number
  sections: SectionsConfig
  bannerSlides: BannerSlide[]
  adBannerContent: AdBannerContent
  products: Product[]
  blogPosts: BlogPost[]
  approvedWriters: string[]
}

type AppConfigContextType = {
  config: AppConfig
  setFeaturedWine: (id: number) => void
  toggleSection: (key: keyof SectionsConfig) => void
  updateBannerSlide: (slide: BannerSlide) => void
  updateAdBannerContent: (content: AdBannerContent) => void
  updateProduct: (product: Product) => void
  addProduct: (product: Omit<Product, 'id'>) => void
  deleteProduct: (id: number) => void
  addBlogPost: (post: Omit<BlogPost, 'id' | 'createdAt'>) => void
  updateBlogPost: (post: BlogPost) => void
  deleteBlogPost: (id: number) => void
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

const defaultAdBannerContent: AdBannerContent = {
  badge: 'Special Offer',
  title: '첫 주문 10% 할인 +',
  highlight: '무료 배송 혜택',
  description: '회원가입 후 첫 구매 시 자동 적용됩니다',
  primaryBtn: '지금 가입하기',
  secondaryBtn: '혜택 자세히 보기',
}

const defaultConfig: AppConfig = {
  featuredWineId: 1,
  sections: { adBanner: true },
  bannerSlides: defaultBannerSlides,
  adBannerContent: defaultAdBannerContent,
  products: defaultProducts,
  blogPosts: [],
  approvedWriters: [],
}

const AppConfigContext = createContext<AppConfigContextType | null>(null)

export function AppConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<AppConfig>(defaultConfig)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('wineorder-config')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (parsed.products) {
          parsed.products = parsed.products.map((p: Product) => ({
            ...p,
            type: p.type ?? 'wine',
          }))
        }
        if (!parsed.adBannerContent) {
          parsed.adBannerContent = defaultAdBannerContent
        }
        if (!parsed.blogPosts) parsed.blogPosts = []
        if (!parsed.approvedWriters) parsed.approvedWriters = []
        setConfig(parsed)
      } catch {}
    }
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (!isLoaded) return
    try {
      localStorage.setItem('wineorder-config', JSON.stringify(config))
    } catch {
      console.warn('localStorage 용량 초과 — 이미지 크기를 줄여주세요')
    }
  }, [config, isLoaded])

  const setFeaturedWine = (id: number) =>
    setConfig(prev => ({ ...prev, featuredWineId: id }))

  const toggleSection = (key: keyof SectionsConfig) =>
    setConfig(prev => ({
      ...prev,
      sections: { ...prev.sections, [key]: !prev.sections[key] },
    }))

  const updateBannerSlide = (slide: BannerSlide) =>
    setConfig(prev => ({
      ...prev,
      bannerSlides: prev.bannerSlides.map(s => s.id === slide.id ? slide : s),
    }))

  const updateAdBannerContent = (content: AdBannerContent) =>
    setConfig(prev => ({ ...prev, adBannerContent: content }))

  const updateProduct = (product: Product) =>
    setConfig(prev => ({
      ...prev,
      products: prev.products.map(p => p.id === product.id ? product : p),
    }))

  const addProduct = (product: Omit<Product, 'id'>) => {
    const newId = Math.max(...config.products.map(p => p.id)) + 1
    setConfig(prev => ({
      ...prev,
      products: [...prev.products, { ...product, id: newId }],
    }))
  }

  const deleteProduct = (id: number) =>
    setConfig(prev => ({
      ...prev,
      products: prev.products.filter(p => p.id !== id),
    }))

  const addBlogPost = (post: Omit<BlogPost, 'id' | 'createdAt'>) => {
    const newId = config.blogPosts.length > 0 ? Math.max(...config.blogPosts.map(p => p.id)) + 1 : 1
    setConfig(prev => ({
      ...prev,
      blogPosts: [{ ...post, id: newId, createdAt: new Date().toISOString() }, ...prev.blogPosts],
    }))
  }

  const updateBlogPost = (post: BlogPost) =>
    setConfig(prev => ({
      ...prev,
      blogPosts: prev.blogPosts.map(p => p.id === post.id ? post : p),
    }))

  const deleteBlogPost = (id: number) =>
    setConfig(prev => ({
      ...prev,
      blogPosts: prev.blogPosts.filter(p => p.id !== id),
    }))

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
      config, setFeaturedWine, toggleSection,
      updateBannerSlide, updateAdBannerContent,
      updateProduct, addProduct, deleteProduct,
      addBlogPost, updateBlogPost, deleteBlogPost,
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
