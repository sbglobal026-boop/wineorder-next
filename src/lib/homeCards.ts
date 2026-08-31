import { createClient } from '@/lib/supabase/client'

// 홈 카테고리 카드 — 편집 가능한 텍스트/이미지는 app_config(JSON)에 저장, 링크/색/모양은 코드 고정

export const HOME_CARD_KEYS = ['wine', 'blog', 'journal'] as const
export type HomeCardKey = typeof HOME_CARD_KEYS[number]

// 고정 비주얼 (링크·배경·blob·폴백 이모지)
export const HOME_CARD_STATIC: Record<HomeCardKey, {
  href: string; bg: string; blob: string; ink: string; shape: string; emoji: string
}> = {
  wine: {
    href: '/events',
    bg: 'radial-gradient(90% 120% at 70% 10%, #eef3ea, #dce8d8)',
    blob: '#8fae87', ink: '#0e3719', shape: '42% 58% 60% 40% / 45% 45% 55% 55%', emoji: '🍷',
  },
  blog: {
    href: '/blog',
    bg: 'radial-gradient(90% 120% at 70% 10%, #eef0dd, #dde5c5)',
    blob: '#b7c98d', ink: '#0e3719', shape: '58% 42% 45% 55% / 55% 48% 52% 45%', emoji: '✦',
  },
  journal: {
    href: '/journal',
    bg: 'radial-gradient(90% 120% at 70% 10%, #e7f1ec, #d3e6de)',
    blob: '#7fb0a3', ink: '#0e3719', shape: '48% 52% 55% 45% / 58% 42% 58% 42%', emoji: '✎',
  },
}

export type HomeCardContent = { label: string; title: string; desc: string; imageUrl?: string }
export type HomeContent = {
  eyebrow: string
  heroTitle: string
  heroSubtitle: string
  cards: Record<HomeCardKey, HomeCardContent>
}

export const DEFAULT_HOME_CONTENT: HomeContent = {
  eyebrow: 'Table code',
  heroTitle: '오늘 어디를 가고 싶으세요?',
  heroSubtitle: '마음이 가는 카드를 골라보세요. 마우스를 올리면 카드가 살포시 떠오릅니다.',
  cards: {
    wine: { label: 'Shop', title: 'Store', desc: '엄선한 프리미엄 와인을 만나보세요.' },
    blog: { label: 'Story', title: 'Blog', desc: '와인과 사람, 그리고 이야기.' },
    journal: { label: 'Journal', title: 'Journal', desc: '테이블 코드가 기록하는 순간들.' },
  },
}

// 저장된 JSON을 기본값과 병합 (누락 필드는 기본값으로 폴백)
function mergeContent(raw: Partial<HomeContent> | null): HomeContent {
  const d = DEFAULT_HOME_CONTENT
  if (!raw) return d
  const cards = {} as Record<HomeCardKey, HomeCardContent>
  for (const key of HOME_CARD_KEYS) {
    cards[key] = { ...d.cards[key], ...(raw.cards?.[key] ?? {}) }
  }
  return {
    eyebrow: raw.eyebrow ?? d.eyebrow,
    heroTitle: raw.heroTitle ?? d.heroTitle,
    heroSubtitle: raw.heroSubtitle ?? d.heroSubtitle,
    cards,
  }
}

export async function fetchHomeContent(): Promise<HomeContent> {
  const supabase = createClient()
  const { data } = await supabase.from('app_config').select('value').eq('key', 'homeCards').maybeSingle()
  if (!data?.value) return DEFAULT_HOME_CONTENT
  try {
    return mergeContent(JSON.parse(data.value))
  } catch {
    return DEFAULT_HOME_CONTENT
  }
}

export async function saveHomeContent(content: HomeContent): Promise<void> {
  const supabase = createClient()
  await supabase.from('app_config').upsert({ key: 'homeCards', value: JSON.stringify(content) })
}
