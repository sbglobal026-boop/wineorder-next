import DOMPurify from 'isomorphic-dompurify'

const ALLOWED_TAGS = ['p', 'h2', 'h3', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'br', 'span', 'blockquote', 'hr', 'div', 'img']
const ALLOWED_ATTR = ['style', 'class', 'src', 'alt', 'data-images']

export function sanitizeBlogHtml(html: string): string {
  return DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR })
}

export function stripHtml(html: string): string {
  return DOMPurify.sanitize(html, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }).trim()
}

// 카드 미리보기용 — 문단·줄바꿈 경계에 띄어쓰기를 넣어 글자가 서로 붙지 않게 한 뒤 태그 제거
export function previewTextFromHtml(html: string): string {
  const spaced = html.replace(/<\/(p|h2|h3|li|blockquote|div)>|<br\s*\/?>/gi, ' ')
  return stripHtml(spaced).replace(/\s+/g, ' ').trim()
}

// 텍스트가 없어도 사진 콜라주/구분선만으로 이뤄진 글은 "내용 있음"으로 취급
export function hasBlogContent(html: string): boolean {
  if (stripHtml(html)) return true
  return /<(img|hr)\b/i.test(html)
}
