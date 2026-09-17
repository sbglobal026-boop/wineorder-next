'use client'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { usePathname } from 'next/navigation'

// 주류 판매 사이트라 접속 시 19세 이상인지 묻는 팝업 — 버튼으로 답하는 자기 신고 방식이며 실제 성인 인증은 아님
// "19세 이상" 확인 기록은 localStorage에 24시간 보관, 지나면 다시 물어봄
const STORAGE_KEY = 'wineorder-age-confirmed-at'
const VALID_MS = 24 * 60 * 60 * 1000
// 법적 고지 페이지는 누구나 볼 수 있어야 하므로 팝업 제외
const EXEMPT_PATHS = ['/impressum', '/datenschutz', '/agb']

// localStorage 저장이 막힌 브라우저(사생활 보호 모드 등)용 — 새로고침 전까지만 통과 상태 유지
let confirmedInMemory = false
// 확인 버튼을 누르면 팝업을 다시 그리도록 알릴 대상
const listeners = new Set<() => void>()

function subscribe(onChange: () => void) {
  listeners.add(onChange)
  // 다른 탭에서 확인한 경우에도 이 탭의 팝업이 닫히도록 storage 이벤트 구독
  window.addEventListener('storage', onChange)
  return () => {
    listeners.delete(onChange)
    window.removeEventListener('storage', onChange)
  }
}

function isConfirmed() {
  if (confirmedInMemory) return true
  try {
    const confirmedAt = Number(localStorage.getItem(STORAGE_KEY))
    return confirmedAt > 0 && Date.now() - confirmedAt < VALID_MS
  } catch {
    return false
  }
}

function saveConfirmed() {
  confirmedInMemory = true
  try {
    localStorage.setItem(STORAGE_KEY, String(Date.now()))
  } catch {
    // 저장 실패 시 confirmedInMemory로만 통과
  }
  listeners.forEach(fn => fn())
}

export default function AgeGate() {
  const pathname = usePathname()
  // 서버 렌더링 때는 localStorage를 읽을 수 없어 "확인됨"으로 두고(팝업 숨김), 브라우저에서 실제 기록으로 다시 판단
  const confirmed = useSyncExternalStore(subscribe, isConfirmed, () => true)
  const [denied, setDenied] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)
  const exempt = EXEMPT_PATHS.some(p => pathname.startsWith(p))
  const open = !confirmed && !exempt

  useEffect(() => {
    if (!open) return
    // 팝업이 떠 있는 동안 뒤 페이지 스크롤 잠금
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    // Tab 키 포커스가 뒤 페이지로 빠져나가지 않게 팝업 버튼 사이에서만 순환 (ESC로는 닫히지 않음)
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !dialogRef.current) return
      const buttons = Array.from(dialogRef.current.querySelectorAll('button'))
      if (buttons.length === 0) return
      e.preventDefault()
      const idx = buttons.indexOf(document.activeElement as HTMLButtonElement)
      const next = idx === -1 ? 0 : (idx + (e.shiftKey ? -1 : 1) + buttons.length) % buttons.length
      buttons[next].focus()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = prevOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="age-gate-title"
        aria-describedby="age-gate-desc"
        className="w-full max-w-[400px] rounded-2xl bg-[#FBFAF7] px-6 py-10 sm:px-10 text-center break-keep shadow-2xl"
      >
        <p className="font-[family-name:var(--font-playfair-display)] text-[22px] font-semibold tracking-tight text-[#0e3719]">
          table code
        </p>
        <div className="mx-auto mt-6 flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#1C1A17] font-[family-name:var(--font-grotesk)] text-lg font-bold text-[#1C1A17]">
          19
        </div>

        {denied ? (
          <>
            <h2 id="age-gate-title" className="mt-5 text-lg font-bold text-[#1C1A17]">
              이용하실 수 없습니다
            </h2>
            <p id="age-gate-desc" className="mt-3 text-sm leading-relaxed text-[#6b6660]">
              19세 미만은 table code를 이용하실 수 없습니다.
              <br />
              양해 부탁드립니다.
            </p>
            {/* 잘못 누른 경우를 위해 질문 화면으로 돌아가는 버튼만 제공 */}
            <button
              type="button"
              autoFocus
              onClick={() => setDenied(false)}
              className="mt-8 text-sm text-[#6b6660] underline underline-offset-4 hover:text-[#1C1A17] outline-none focus-visible:ring-2 focus-visible:ring-[#0e3719] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FBFAF7]"
            >
              이전으로
            </button>
          </>
        ) : (
          <>
            <h2 id="age-gate-title" className="mt-5 text-lg font-bold text-[#1C1A17]">
              19세 이상이신가요?
            </h2>
            <p id="age-gate-desc" className="mt-3 text-sm leading-relaxed text-[#6b6660]">
              table code는 주류를 판매하는 사이트입니다.
              <br />
              관련 법령에 따라 19세 미만은 이용하실 수 없습니다.
            </p>
            <div className="mt-8 flex flex-col gap-2.5">
              <button
                type="button"
                autoFocus
                onClick={saveConfirmed}
                className="w-full rounded-full bg-[#0e3719] py-3.5 text-sm font-semibold text-[#FBFAF7] transition-opacity hover:opacity-90 outline-none focus-visible:ring-2 focus-visible:ring-[#0e3719] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FBFAF7]"
              >
                19세 이상입니다
              </button>
              <button
                type="button"
                onClick={() => setDenied(true)}
                className="w-full rounded-full border border-[#DAD4CD] py-3.5 text-sm font-semibold text-[#1C1A17] transition-colors hover:bg-[#DAD4CD]/40 outline-none focus-visible:ring-2 focus-visible:ring-[#0e3719] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FBFAF7]"
              >
                19세 미만입니다
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
