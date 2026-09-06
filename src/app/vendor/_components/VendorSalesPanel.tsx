'use client'
import { useEffect, useState } from 'react'

type SalesData = {
  grossSales: number
  commissionRate: number
  commissionAmount: number
  netPayout: number
  orderCount: number
  items: {
    name: string; qty: number; amount: number; createdAt: string
    imageUrl: string | null; orderNumber: string | null; status: string
  }[]
}

function fmt(n: number) {
  return '€' + n.toLocaleString(undefined, { maximumFractionDigits: 2 })
}

export default function VendorSalesPanel() {
  const [data, setData] = useState<SalesData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/vendor/sales')
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-sm text-gray-400">불러오는 중...</p>
  if (!data) return <p className="text-sm text-gray-400">매출 정보를 불러올 수 없습니다</p>

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">매출 현황</h2>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <p className="text-xs text-gray-400 mb-1">총 판매액</p>
          <p className="text-xl font-bold text-gray-900">{fmt(data.grossSales)}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <p className="text-xs text-gray-400 mb-1">수수료 ({(data.commissionRate * 100).toFixed(0)}%)</p>
          <p className="text-xl font-bold text-gray-900">-{fmt(data.commissionAmount)}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <p className="text-xs text-gray-400 mb-1">정산 예정액</p>
          <p className="text-xl font-bold text-green-700">{fmt(data.netPayout)}</p>
        </div>
      </div>

      <h3 className="text-sm font-semibold text-gray-900 mb-3">최근 판매 내역 ({data.orderCount}건 주문)</h3>
      {data.items.length === 0 ? (
        <p className="text-sm text-gray-400 py-6 text-center">아직 판매 내역이 없습니다</p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {data.items.map((item, i) => (
            <div key={i} className="flex items-center gap-3 bg-white border border-gray-100 rounded-lg px-4 py-2.5 text-sm">
              <div className="shrink-0 w-11 h-11 rounded-lg bg-gray-100 overflow-hidden">
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">🍷</div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-gray-900 truncate">{item.name}</p>
                <p className="text-xs text-gray-400">
                  {item.orderNumber ?? ''} · {new Date(item.createdAt).toLocaleDateString('ko-KR')} · 수량 {item.qty}개
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-semibold text-gray-900">{fmt(item.amount)}</p>
                <p className="text-xs text-gray-400">{item.status}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
