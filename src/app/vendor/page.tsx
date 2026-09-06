'use client'
import { useState } from 'react'
import Link from 'next/link'
import VendorProductsPanel from './_components/VendorProductsPanel'
import VendorSalesPanel from './_components/VendorSalesPanel'

const TABS = [
  { id: 'products', label: '내 상품' },
  { id: 'sales', label: '매출 현황' },
] as const

type TabId = typeof TABS[number]['id']

export default function VendorPage() {
  const [tab, setTab] = useState<TabId>('products')

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[900px] mx-auto px-6 py-10">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors no-underline mb-6">
          ← 판매페이지로 돌아가기
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">벤더 센터</h1>
        <p className="text-sm text-gray-400 mb-8">내 상품과 매출을 관리하세요</p>

        <div className="flex gap-2 mb-8 border-b border-gray-200">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`text-sm font-semibold px-4 py-3 border-b-2 transition-colors cursor-pointer ${
                tab === t.id ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'products' ? <VendorProductsPanel /> : <VendorSalesPanel />}
      </div>
    </div>
  )
}
