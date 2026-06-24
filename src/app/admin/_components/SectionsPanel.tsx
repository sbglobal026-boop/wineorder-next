'use client'

const fixedItems = [
  { label: '메인 배너', description: '항상 표시됩니다' },
  { label: '추천 와인', description: '항상 표시됩니다' },
]

export default function SectionsPanel() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">섹션 설정</h2>
      <p className="text-gray-500 text-sm mb-8">메인 페이지에 표시되는 섹션입니다</p>

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
