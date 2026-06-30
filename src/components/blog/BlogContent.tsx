import { sanitizeBlogHtml } from '@/lib/sanitizeHtml'

export default function BlogContent({ html, className = '' }: { html: string; className?: string }) {
  return (
    <div
      className={`blog-rich-content ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizeBlogHtml(html) }}
    />
  )
}
