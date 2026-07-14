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

  // 압축 실패(브라우저가 해석 못 하는 포맷 등) 시 원본 그대로 업로드해서 조용한 실패를 막음
  let blob: Blob = file
  let contentType = file.type || 'image/jpeg'
  let ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  try {
    blob = await compressToBlob(file)
    contentType = 'image/jpeg'
    ext = 'jpg'
  } catch {
    // 원본 업로드로 폴백
  }

  const filename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { error } = await supabase.storage.from(bucket).upload(filename, blob, {
    contentType,
    cacheControl: '31536000',
  })
  if (error) throw error

  const { data } = supabase.storage.from(bucket).getPublicUrl(filename)
  return data.publicUrl
}

export async function uploadBlogImage(file: File, ownerId: string | null): Promise<string> {
  return uploadImage(file, 'blog-images', ownerId ?? 'admin')
}

// 여러 장은 동시에 업로드 (순차 업로드는 장수만큼 시간이 배로 걸림)
export async function uploadBlogImages(files: File[], ownerId: string | null): Promise<string[]> {
  return Promise.all(files.map(file => uploadBlogImage(file, ownerId)))
}

export async function uploadProductImage(file: File): Promise<string> {
  return uploadImage(file, 'product-images', 'products')
}

export async function uploadBannerImage(file: File): Promise<string> {
  return uploadImage(file, 'banner-images', 'banners')
}

const MAX_VIDEO_SIZE = 50 * 1024 * 1024 // 50MB

// 동영상은 이미지처럼 캔버스로 압축할 수 없어 용량만 제한하고 원본 그대로 업로드
export async function uploadVideo(file: File, bucket: string, folder: string): Promise<string> {
  if (file.size > MAX_VIDEO_SIZE) throw new Error('동영상 용량은 50MB 이하만 업로드할 수 있습니다')

  const supabase = createClient()
  const ext = file.name.split('.').pop()?.toLowerCase() || 'mp4'
  const filename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { error } = await supabase.storage.from(bucket).upload(filename, file, {
    contentType: file.type || 'video/mp4',
    cacheControl: '31536000',
  })
  if (error) throw error

  const { data } = supabase.storage.from(bucket).getPublicUrl(filename)
  return data.publicUrl
}

export async function uploadBlogVideo(file: File, ownerId: string | null): Promise<string> {
  return uploadVideo(file, 'blog-images', ownerId ?? 'admin')
}

export async function uploadBannerVideo(file: File): Promise<string> {
  return uploadVideo(file, 'banner-images', 'banners')
}

export function isVideoUrl(url: string): boolean {
  return /\.(mp4|webm|mov|ogg)(\?|$)/i.test(url)
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
