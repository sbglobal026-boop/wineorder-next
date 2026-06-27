import { createClient } from '@/lib/supabase/client'
import { Product } from '@/data/products'
import { removeStorageFiles } from '@/lib/uploadImage'

export type ProductRow = {
  id: number
  name: string
  EK: number
  margin: number
  price: number
  type: string
  category: string
  origin: string | null
  rating: number
  description: string | null
  image_url: string | null
  extra_images: string[] | null
}

export function rowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    EK: row.EK,
    margin: row.margin,
    price: row.price,
    type: row.type as Product['type'],
    category: row.category as Product['category'],
    origin: row.origin ?? '',
    rating: row.rating,
    description: row.description ?? '',
    imageUrl: row.image_url ?? undefined,
    extraImages: row.extra_images ?? undefined,
  }
}

export function productToRow(product: Omit<Product, 'id'>) {
  return {
    name: product.name,
    EK: product.EK,
    margin: product.margin,
    price: product.price,
    type: product.type,
    category: product.category,
    origin: product.origin,
    rating: product.rating,
    description: product.description,
    image_url: product.imageUrl ?? null,
    extra_images: product.extraImages ?? [],
  }
}

// 공개 상품 목록 — 원가(EK)/마진은 빠진 view에서 조회 (누구나 접근 가능)
export async function fetchProducts(): Promise<Product[]> {
  const supabase = createClient()
  const { data, error } = await supabase.from('products_public').select('*').order('id')
  if (error) throw error
  return (data ?? []).map(row => rowToProduct({ ...row, EK: 0, margin: 0 } as ProductRow))
}

// 관리자용 상품 목록 (원가/마진 포함) — 서버 API를 통해서만 조회, 관리자 인증 필요
export async function fetchAdminProducts(): Promise<Product[]> {
  const res = await fetch('/api/admin/products')
  if (!res.ok) throw new Error('상품 목록을 불러오지 못했습니다')
  const rows: ProductRow[] = await res.json()
  return rows.map(rowToProduct)
}

export async function createProductRow(product: Omit<Product, 'id'>): Promise<Product> {
  const res = await fetch('/api/admin/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  })
  if (!res.ok) throw new Error('상품 추가에 실패했습니다')
  return rowToProduct(await res.json())
}

export async function updateProductRow(product: Product): Promise<void> {
  const res = await fetch(`/api/admin/products/${product.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  })
  if (!res.ok) throw new Error('상품 수정에 실패했습니다')
}

export async function deleteProductRow(id: number, imageUrl?: string, extraImages?: string[]): Promise<void> {
  const imagesToRemove = [imageUrl, ...(extraImages ?? [])].filter((url): url is string => !!url)
  if (imagesToRemove.length > 0) {
    await removeStorageFiles('product-images', imagesToRemove)
  }
  const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('상품 삭제에 실패했습니다')
}

export async function fetchFeaturedProductId(): Promise<number | null> {
  const supabase = createClient()
  const { data } = await supabase.from('app_config').select('value').eq('key', 'featuredProductId').maybeSingle()
  return data ? Number(data.value) : null
}

export async function setFeaturedProductIdRemote(id: number): Promise<void> {
  const supabase = createClient()
  await supabase.from('app_config').upsert({ key: 'featuredProductId', value: String(id) })
}
