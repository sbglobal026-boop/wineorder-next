// 데이터를 불러오는 동안 보여주는 공용 로딩 표시 — 보틀그린 점 3개가 차례로 깜빡이고 아래에 "불러오는 중"
// 위아래 여백은 페이지마다 달라서 className으로 넘겨받음 (예: 'py-20')
export default function LoadingDots({ className = '' }: { className?: string }) {
  return (
    <div role="status" className={`flex flex-col items-center gap-3 ${className}`}>
      <div className="flex gap-2">
        {[0, 200, 400].map(delay => (
          <span key={delay} className="w-2 h-2 rounded-full bg-[#0e3719] animate-pulse" style={{ animationDelay: `${delay}ms` }} />
        ))}
      </div>
      <p className="text-[13px] text-[#9b9797]">불러오는 중</p>
    </div>
  )
}
