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

export async function uploadBlogImage(file: File, ownerId: string | null): Promise<string> {
  const supabase = createClient()
  const blob = await compressToBlob(file)
  const folder = ownerId ?? 'admin'
  const filename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`

  const { error } = await supabase.storage.from('blog-images').upload(filename, blob, {
    contentType: 'image/jpeg',
    cacheControl: '31536000',
  })
  if (error) throw error

  const { data } = supabase.storage.from('blog-images').getPublicUrl(filename)
  return data.publicUrl
}

export async function uploadBlogImages(files: File[], ownerId: string | null): Promise<string[]> {
  const results: string[] = []
  for (const file of files) {
    results.push(await uploadBlogImage(file, ownerId))
  }
  return results
}
