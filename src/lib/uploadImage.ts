import { createClient } from '@/lib/supabase/client'

function compressToBlob(file: File, maxWidth = 1080, quality = 0.75): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width)
        const canvas = document.createElement('canvas')
        canvas.width = img.width * scale
        canvas.height = img.height * scale
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error('이미지 압축 실패'))),
          'image/jpeg',
          quality
        )
      }
      img.onerror = reject
      img.src = e.target?.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export async function uploadImage(file: File, bucket: string, folder: string): Promise<string> {
  const supabase = createClient()
  const blob = await compressToBlob(file)
  const filename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`

  const { error } = await supabase.storage.from(bucket).upload(filename, blob, {
    contentType: 'image/jpeg',
    cacheControl: '31536000',
  })
  if (error) throw error

  const { data } = supabase.storage.from(bucket).getPublicUrl(filename)
  return data.publicUrl
}

export async function uploadBlogImage(file: File, ownerId: string | null): Promise<string> {
  return uploadImage(file, 'blog-images', ownerId ?? 'admin')
}

export async function uploadBlogImages(files: File[], ownerId: string | null): Promise<string[]> {
  const results: string[] = []
  for (const file of files) {
    results.push(await uploadBlogImage(file, ownerId))
  }
  return results
}

export async function uploadProductImage(file: File): Promise<string> {
  return uploadImage(file, 'product-images', 'products')
}

export async function uploadBannerImage(file: File): Promise<string> {
  return uploadImage(file, 'banner-images', 'banners')
}

function extractStoragePath(url: string, bucket: string): string | null {
  const marker = `/object/public/${bucket}/`
  const idx = url.indexOf(marker)
  if (idx === -1) return null
  return url.slice(idx + marker.length)
}

export async function removeStorageFiles(bucket: string, urls: string[]): Promise<void> {
  const paths = urls
    .map(u => extractStoragePath(u, bucket))
    .filter((p): p is string => !!p)
  if (paths.length === 0) return
  const supabase = createClient()
  await supabase.storage.from(bucket).remove(paths)
}
