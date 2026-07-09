import { createClient } from '@/lib/supabase/client'
import { BannerSlide } from '@/context/AppConfigContext'

type BannerSlideRow = {
  id: number
  title: string
  subtitle: string
  cta: string
  image_url: string | null
  video_url: string | null
  link_url: string | null
  sort_order: number
}

function rowToSlide(row: BannerSlideRow): BannerSlide {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    cta: row.cta,
    imageUrl: row.image_url ?? undefined,
    videoUrl: row.video_url ?? undefined,
    linkUrl: row.link_url ?? undefined,
  }
}

export async function fetchBannerSlides(): Promise<BannerSlide[]> {
  const supabase = createClient()
  const { data, error } = await supabase.from('banner_slides').select('*').order('sort_order')
  if (error) throw error
  return (data ?? []).map(rowToSlide)
}

export async function updateBannerSlideRow(slide: BannerSlide): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('banner_slides')
    .update({
      title: slide.title,
      subtitle: slide.subtitle,
      cta: slide.cta,
      image_url: slide.imageUrl ?? null,
      video_url: slide.videoUrl ?? null,
      link_url: slide.linkUrl ?? null,
    })
    .eq('id', slide.id)
  if (error) throw error
}
