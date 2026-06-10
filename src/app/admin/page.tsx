'use client'
import { useState } from 'react'
import Link from 'next/link'
import BannerPanel from './_components/BannerPanel'
import ProductsPanel from './_components/ProductsPanel'
import SectionsPanel from './_components/SectionsPanel'

type Panel = 'banner' | 'products' | 'sections'

const navItems: { id: Panel; label: string; icon: string }[] = [
  { id: 'products', label: '상품 관리', icon: '🍷' },
  { id: 'banner', label: '배너 관리', icon: '🖼️' },
  { id: 'sections', label: '섹션 설정', icon: '⚙️' },
]

export default function AdminPage() {
  const [activePanel, setActivePanel] = useState<Panel>('products')

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* 사이드바 */}
      <aside className="w-56 bg-white border-r border-gray-100 flex flex-col shrink-0">
        <div className="p-5 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl">🍷</span>
            <div>
              <p className="text-red-800 font-bold text-sm tracking-wider">WINE ORDER</p>
              <p className="text-gray-400 text-xs">Admin</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-3">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActivePanel(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                    activePanel === item.id
                      ? 'bg-red-50 text-red-800 font-semibold'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 transition-colors"
          >
            ← 사이트로 돌아가기
          </Link>
        </div>
      </aside>

      {/* 콘텐츠 영역 */}
      <main className="flex-1 p-8 overflow-auto">
        {activePanel === 'banner' && <BannerPanel />}
        {activePanel === 'products' && <ProductsPanel />}
        {activePanel === 'sections' && <SectionsPanel />}
      </main>
    </div>
  )
}
