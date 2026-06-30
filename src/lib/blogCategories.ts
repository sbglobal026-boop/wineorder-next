export type BlogCategory =
  | 'wine'
  | 'wine-ratings'
  | 'tasting'
  | 'winery'
  | 'vinotheken'
  | 'food-drink'
  | 'travel'
  | 'monthly-table'

export const BLOG_CATEGORIES: { value: BlogCategory; label: string; eyebrow: string; parent?: BlogCategory }[] = [
  { value: 'wine', label: 'Wine', eyebrow: 'Wine Story' },
  { value: 'wine-ratings', label: 'Wine Ratings', eyebrow: 'Wine Ratings', parent: 'wine' },
  { value: 'tasting', label: 'Tasting', eyebrow: 'Tasting', parent: 'wine' },
  { value: 'winery', label: 'Winery', eyebrow: 'Winery', parent: 'wine' },
  { value: 'vinotheken', label: 'Vinotheken', eyebrow: 'Vinotheken', parent: 'wine' },
  { value: 'food-drink', label: 'Food & Drink', eyebrow: 'Food & Drink Story' },
  { value: 'travel', label: 'Travel', eyebrow: 'Travel Story' },
  { value: 'monthly-table', label: 'Monthly Table', eyebrow: 'Monthly Table' },
]

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
