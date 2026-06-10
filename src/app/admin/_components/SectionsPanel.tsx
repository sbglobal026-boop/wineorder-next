'use client'
import { useState } from 'react'
import { useAppConfig, SectionsConfig, AdBannerContent } from '@/context/AppConfigContext'

const fixedItems = [
  { label: '메인 배너', description: '항상 표시됩니다' },
  { label: '추천 와인', description: '항상 표시됩니다' },
]

export default function SectionsPanel() {
  const { config, toggleSection, updateAdBannerContent } = useAppConfig()
  const [editingBanner, setEditingBanner] = useState(false)
  const [form, setForm] = useState<AdBannerContent>(config.adBannerContent)

  const save = () => {
    updateAdBannerContent(form)
    setEditingBanner(false)
  }

  const cancel = () => {
    setForm(config.adBannerContent)
    setEditingBanner(false)
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">섹션 설정</h2>
      <p className="text-gray-500 text-sm mb-8">메인 페이지에 표시할 섹션을 켜고 끌 수 있습니다</p>

      {/* 광고 배너 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-3">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-gray-900 font-semibold text-sm">광고 배너</p>
            <p className="text-gray-400 text-xs mt-0.5">메인 페이지 하단 프로모션 배너</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setForm(config.adBannerContent); setEditingBanner(!editingBanner) }}
              className="text-xs font-medium text-gray-500 hover:text-gray-900 border border-gray-200 hover:border-gray-400 px-3 py-1.5 rounded-full transition-colors"
            >
              {editingBanner ? '닫기' : '편집'}
            </button>
            <button
              onClick={() => toggleSection('adBanner')}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                config.sections.adBanner ? 'bg-[#8B4513]' : 'bg-gray-200'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                  config.sections.adBanner ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {editingBanner && (
          <div className="border-t border-gray-100 pt-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">배지 텍스트</label>
                <input
                  value={form.badge}
                  onChange={e => setForm(prev => ({ ...prev, badge: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                  placeholder="Special Offer"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">설명 텍스트</label>
                <input
                  value={form.description}
                  onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                  placeholder="회원가입 후 첫 구매 시 자동 적용됩니다"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">제목</label>
              <input
                value={form.title}
                onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                placeholder="첫 주문 10% 할인 +"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">제목 강조 텍스트 (노란색)</label>
              <input
                value={form.highlight}
                onChange={e => setForm(prev => ({ ...prev, highlight: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                placeholder="무료 배송 혜택"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">버튼 1 (기본)</label>
                <input
                  value={form.primaryBtn}
                  onChange={e => setForm(prev => ({ ...prev, primaryBtn: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                  placeholder="지금 가입하기"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">버튼 2 (보조)</label>
                <input
                  value={form.secondaryBtn}
                  onChange={e => setForm(prev => ({ ...prev, secondaryBtn: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                  placeholder="혜택 자세히 보기"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={save} className="bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold px-6 py-2 rounded-full transition-colors">
                저장
              </button>
              <button onClick={cancel} className="border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm px-6 py-2 rounded-full transition-colors">
                취소
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 항상 표시 섹션 */}
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 mt-6">항상 표시</p>
      <div className="space-y-3">
        {fixedItems.map((item) => (
          <div key={item.label} className="bg-gray-50 rounded-2xl border border-gray-100 p-5 flex items-center justify-between">
            <div>
              <p className="text-gray-400 font-semibold text-sm">{item.label}</p>
              <p className="text-gray-300 text-xs mt-0.5">{item.description}</p>
            </div>
            <div className="relative w-12 h-6 rounded-full bg-[#8B4513]/30 opacity-60">
              <span className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow translate-x-6" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
