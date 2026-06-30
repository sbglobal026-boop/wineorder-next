import DOMPurify from 'isomorphic-dompurify'

const ALLOWED_TAGS = ['p', 'h2', 'h3', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'br', 'span']
const ALLOWED_ATTR = ['style']

export function sanitizeBlogHtml(html: string): string {
  return DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR })
}

export function stripHtml(html: string): string {
  return DOMPurify.sanitize(html, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }).trim()
}
