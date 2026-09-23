import type { Metadata } from 'next'
import { createPublicClient } from '@/lib/supabase/public'
import { SITE_URL, SITE_NAME } from '@/lib/site'

// 블로그 글별 검색 제목·설명 + 글 구조화 데이터
async function fetchPost(id: string) {
  const { data } = await createPublicClient()
    .from('blog_posts')
    .select('id, title, content, images, author_name, created_at, category')
    .eq('id', Number(id))
    .maybeSingle()
  return data
}

// 본문에서 태그를 걷어내 미리보기 문장을 만듦
function plainText(html: string) {
  return html.replace(/<[^>]*>/g, ' ').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ').trim()
}

export async function generateMetadata({ params }: { params: Promise<{ category: string; id: string }> }): Promise<Metadata> {
  const { category, id } = await params
  const post = await fetchPost(id)
  if (!post) return { title: '글' }

  const description = plainText(post.content ?? '').slice(0, 150)
  return {
    title: `${post.title} | ${SITE_NAME}`,
    description,
    alternates: { canonical: `/blog/${category}/${id}` },
    openGraph: {
      type: 'article',
      title: post.title,
      description,
      publishedTime: post.created_at,
      authors: post.author_name ? [post.author_name] : undefined,
      images: post.images?.[0] ? [post.images[0]] : undefined,
    },
  }
}

export default async function BlogPostLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ category: string; id: string }>
}) {
  const { category, id } = await params
  const post = await fetchPost(id)

  const jsonLd = post && {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: plainText(post.content ?? '').slice(0, 200),
    image: post.images?.[0] ?? undefined,
    datePublished: post.created_at,
    author: { '@type': 'Person', name: post.author_name || SITE_NAME },
    publisher: { '@type': 'Organization', name: SITE_NAME, logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` } },
    mainEntityOfPage: `${SITE_URL}/blog/${category}/${id}`,
  }

  return (
    <>
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
      {children}
    </>
  )
}
