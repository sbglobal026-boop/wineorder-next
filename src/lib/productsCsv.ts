import Papa from 'papaparse'
import { Product } from '@/data/products'

const CSV_COLUMNS = [
  'id', 'name', 'type', 'category', 'origin', 'price', 'EK', 'margin',
  'rating', 'stock', 'description', 'grapeVariety', 'criticRatings',
  'imageUrl', 'extraImages',
] as const

export function productsToCsv(products: Product[]): string {
  const rows = products.map(p => ({
    id: p.id,
    name: p.name,
    type: p.type,
    category: p.category,
    origin: p.origin,
    price: p.price,
    EK: p.EK,
    margin: p.margin,
    rating: p.rating,
    stock: p.stock ?? 0,
    description: p.description,
    grapeVariety: p.grapeVariety ?? '',
    criticRatings: p.criticRatings ?? '',
    imageUrl: p.imageUrl ?? '',
    extraImages: (p.extraImages ?? []).join('|'),
  }))
  return Papa.unparse(rows, { columns: [...CSV_COLUMNS] })
}

export type ParsedProductRow = Omit<Product, 'id'> & { id: number | null }

export function parseProductsCsv(text: string): ParsedProductRow[] {
  const { data } = Papa.parse<Record<string, string>>(text, { header: true, skipEmptyLines: true })
  return data
    .filter(row => row.name?.trim())
    .map(row => ({
      id: row.id?.trim() ? Number(row.id) : null,
      name: row.name.trim(),
      type: (row.type?.trim() === 'food' ? 'food' : 'wine') as Product['type'],
      category: (row.category?.trim() || '레드') as Product['category'],
      origin: row.origin?.trim() ?? '',
      price: Number(row.price) || 0,
      EK: Number(row.EK) || 0,
      margin: Number(row.margin) || 0,
      rating: Number(row.rating) || 0,
      stock: Number(row.stock) || 0,
      description: row.description ?? '',
      grapeVariety: row.grapeVariety?.trim() || undefined,
      criticRatings: row.criticRatings?.trim() || undefined,
      imageUrl: row.imageUrl?.trim() || undefined,
      extraImages: row.extraImages?.trim() ? row.extraImages.split('|').map(s => s.trim()).filter(Boolean) : undefined,
    }))
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
