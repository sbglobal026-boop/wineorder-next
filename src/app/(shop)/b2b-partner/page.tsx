'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

// 비공개 B2B 입점 가입 페이지 — 네비게이션 어디에도 링크 안 걸어둠, URL을 아는 벤더만 접근
export default function B2BPartnerPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [shopName, setShopName] = useState('')
  const [businessInfo, setBusinessInfo] = useState('')
  const [country, setCountry] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/vendor/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, shopName, businessInfo, country }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? '신청 중 오류가 발생했습니다')
        return
      }
      setDone(true)
    } catch {
      setError('신청 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="bg-[#F9F4EE] min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <h1 className="text-xl font-black text-gray-900 mb-3">입점 신청이 접수됐어요</h1>
          <p className="text-sm text-gray-500 leading-relaxed mb-6">
            담당자 검토 후 승인되면 로그인해서 벤더 센터를 이용하실 수 있어요.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="w-full bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold py-3 rounded-full transition-colors"
          >
            로그인 화면으로
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#F9F4EE] min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-[#0e3719] text-xs font-bold tracking-widest uppercase mb-2">B2B Partner</p>
          <h1 className="text-2xl font-black text-gray-900">입점 신청</h1>
          <p className="text-sm text-gray-400 mt-2">table code에 와인샵을 입점시켜보세요</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">샵 이름</label>
            <input
              value={shopName}
              onChange={e => setShopName(e.target.value)}
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-gray-400"
              placeholder="예: OO 와인"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">사업자 정보 (선택)</label>
            <input
              value={businessInfo}
              onChange={e => setBusinessInfo(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-gray-400"
              placeholder="사업자등록번호 등"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">국가</label>
            <input
              value={country}
              onChange={e => setCountry(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-gray-400"
              placeholder="예: 독일"
            />
          </div>

          <div className="h-px bg-gray-200 my-1" />

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">이메일 (로그인용)</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-gray-400"
              placeholder="example@email.com"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-gray-400"
              placeholder="6자 이상"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">비밀번호 확인</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-gray-400"
              placeholder="비밀번호 다시 입력"
            />
          </div>

          {error && <p className="text-red-500 text-xs">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 hover:bg-gray-700 disabled:bg-gray-400 text-white text-sm font-semibold py-3 rounded-full transition-colors mt-2 cursor-pointer"
          >
            {loading ? '신청 중...' : '입점 신청하기'}
          </button>
        </form>
      </div>
    </div>
  )
}
