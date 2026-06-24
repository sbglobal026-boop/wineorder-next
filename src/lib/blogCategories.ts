export type BlogCategory = 'wine' | 'food-drink' | 'travel'

export const BLOG_CATEGORIES: { value: BlogCategory; label: string; eyebrow: string }[] = [
  { value: 'wine', label: 'Wine', eyebrow: 'Wine Story' },
  { value: 'food-drink', label: 'Food & Drink', eyebrow: 'Food & Drink Story' },
  { value: 'travel', label: 'Travel', eyebrow: 'Travel Story' },
]

export function isBlogCategory(value: string): value is BlogCategory {
  return BLOG_CATEGORIES.some(c => c.value === value)
}

export function categoryLabel(value: string): string {
  return BLOG_CATEGORIES.find(c => c.value === value)?.label ?? value
}
