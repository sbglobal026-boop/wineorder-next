import { createClient } from '@/lib/supabase/client'
import { Product } from '@/data/products'

type ProductRow = {
  id: number
  name: string
  price: number
  type: string
  category: string
  origin: string | null
  rating: number
  description: string | null
  image_url: string | null
}

function rowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    price: row.price,
    type: row.type as Product['type'],
    category: row.category as Product['category'],
    origin: row.origin ?? '',
    rating: row.rating,
    description: row.description ?? '',
    imageUrl: row.image_url ?? undefined,
  }
}

function productToRow(product: Omit<Product, 'id'>) {
  return {
    name: product.name,
    price: product.price,
    type: product.type,
    category: product.category,
    origin: product.origin,
    rating: product.rating,
    description: product.description,
    image_url: product.imageUrl ?? null,
  }
}

export async function fetchProducts(): Promise<Product[]> {
  const supabase = createClient()
  const { data, error } = await supabase.from('products').select('*').order('id')
  if (error) throw error
  return (data ?? []).map(rowToProduct)
}

export async function createProductRow(product: Omit<Product, 'id'>): Promise<Product> {
  const supabase = createClient()
  const { data, error } = await supabase.from('products').insert(productToRow(product)).select().single()
  if (error) throw error
  return rowToProduct(data)
}

export async function updateProductRow(product: Product): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('products').update(productToRow(product)).eq('id', product.id)
  if (error) throw error
}

export async function deleteProductRow(id: number): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw error
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
