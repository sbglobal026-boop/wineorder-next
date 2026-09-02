export type BlogCategory =
  | 'wine'
  | 'wine-ratings'
  | 'tasting'
  | 'winery'
  | 'vinotheken'
  | 'journal'
  | 'weekly-tasting'
  | 'food-drink'
  | 'restaurant'
  | 'winebar'
  | 'caffe'
  | 'etc'
  | 'travel'
  | 'germany'
  | 'france'
  | 'italy'
  | 'travel-etc'
  | 'monthly-table'

export const BLOG_CATEGORIES: { value: BlogCategory; label: string; eyebrow: string; parent?: BlogCategory }[] = [
  { value: 'wine', label: 'Wine', eyebrow: 'Wine Story' },
  { value: 'wine-ratings', label: 'Wine Ratings', eyebrow: 'Wine Ratings', parent: 'wine' },
  { value: 'tasting', label: 'Tasting', eyebrow: 'Tasting', parent: 'wine' },
  { value: 'winery', label: 'Winery', eyebrow: 'Winery', parent: 'wine' },
  { value: 'vinotheken', label: 'Vinotheken', eyebrow: 'Vinotheken', parent: 'wine' },
  { value: 'weekly-tasting', label: 'Weekly Tasting', eyebrow: 'Weekly Tasting', parent: 'wine' },
  // Journal은 최상위 독립 페이지(/journal)로 분리 — parent 없음
  { value: 'journal', label: 'Journal', eyebrow: 'Journal' },
  { value: 'food-drink', label: 'Food & Drink', eyebrow: 'Food & Drink Story' },
  { value: 'restaurant', label: 'Restaurant', eyebrow: 'Restaurant', parent: 'food-drink' },
  { value: 'winebar', label: 'Wine Bar', eyebrow: 'Wine Bar', parent: 'food-drink' },
  { value: 'caffe', label: 'Café', eyebrow: 'Café', parent: 'food-drink' },
  { value: 'etc', label: 'Etc.', eyebrow: 'Etc.', parent: 'food-drink' },
  { value: 'travel', label: 'Travel', eyebrow: 'Travel Story' },
  { value: 'germany', label: 'Germany', eyebrow: 'Germany', parent: 'travel' },
  { value: 'france', label: 'France', eyebrow: 'France', parent: 'travel' },
  { value: 'italy', label: 'Italy', eyebrow: 'Italy', parent: 'travel' },
  { value: 'travel-etc', label: 'Etc.', eyebrow: 'Etc.', parent: 'travel' },
  { value: 'monthly-table', label: 'Monthly Table', eyebrow: 'Monthly Table' },
]

// 상위 카테고리별 히어로 문구 (카테고리 페이지 상단)
const CATEGORY_HERO: Partial<Record<BlogCategory, { title: string; subtitle: string }>> = {
  'wine': { title: '한 잔에 담긴 세계', subtitle: '품종부터 테이스팅까지, 와인의 모든 이야기' },
  'food-drink': { title: '와인과 어울리는 한 접시', subtitle: '레스토랑·와인바·카페, 미식의 순간들' },
  'travel': { title: '와인을 따라 떠나는 여행', subtitle: '프랑스·이탈리아·독일, 산지에서 만난 풍경' },
  'monthly-table': { title: '이 달의 테이블', subtitle: '매달 새롭게 차리는 테이블 코드의 제안' },
  'journal': { title: 'Table Code Journal', subtitle: '저희가 마시고 기록한 진짜 이야기' },
}

// 카테고리의 히어로 문구 (하위 카테고리는 상위의 부제를 쓰되 제목은 해당 라벨)
export function categoryHero(value: BlogCategory): { title: string; subtitle: string } {
  const meta = BLOG_CATEGORIES.find(c => c.value === value)
  const top = meta?.parent ?? value
  const hero = CATEGORY_HERO[top] ?? { title: categoryLabel(value), subtitle: '' }
  if (meta?.parent) return { title: categoryLabel(value), subtitle: hero.subtitle }
  return hero
}

export function isBlogCategory(value: string): value is BlogCategory {
  return BLOG_CATEGORIES.some(c => c.value === value)
}

export function categoryLabel(value: string): string {
  return BLOG_CATEGORIES.find(c => c.value === value)?.label ?? value
}

export function categoryEyebrow(value: string): string {
  return BLOG_CATEGORIES.find(c => c.value === value)?.eyebrow ?? value
}

export function childCategories(value: BlogCategory): BlogCategory[] {
  return BLOG_CATEGORIES.filter(c => c.parent === value).map(c => c.value)
}

export function topLevelCategories() {
  return BLOG_CATEGORIES.filter(c => !c.parent)
}
