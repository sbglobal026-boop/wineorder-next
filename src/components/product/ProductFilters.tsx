'use client'
import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

// 와인/음식 리스트에서 공유하는 필터 UI (가격 슬라이더 + 드롭다운)

export function PriceRangeSlider({
  bounds,
  value,
  onChange,
}: {
  bounds: { min: number; max: number }
  value: [number, number]
  onChange: (v: [number, number]) => void
}) {
  const [minVal, maxVal] = value
  const span = bounds.max - bounds.min || 1
  const leftPct = ((minVal - bounds.min) / span) * 100
  const rightPct = ((maxVal - bounds.min) / span) * 100
  const thumbClass =
    'range-slider-thumb pointer-events-none absolute inset-0 h-full w-full appearance-none bg-transparent ' +
    '[&::-webkit-slider-runnable-track]:bg-transparent [&::-moz-range-track]:bg-transparent ' +
    '[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#7d5411] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#FBFAF7] [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform hover:[&::-webkit-slider-thumb]:scale-110 ' +
    '[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#7d5411] [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#FBFAF7] [&::-moz-range-thumb]:shadow-sm [&::-moz-range-thumb]:cursor-pointer'

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-500 whitespace-nowrap font-[family-name:var(--font-lato)]">€{minVal.toLocaleString()} ~ €{maxVal.toLocaleString()}</span>
      <div className="relative h-3.5 w-40 flex items-center">
        <div className="absolute h-[3px] w-full rounded-full bg-[#DAD4CD]" />
        <div
          className="absolute h-[3px] rounded-full bg-[#7d5411]"
          style={{ left: `${leftPct}%`, right: `${100 - rightPct}%` }}
        />
        <input
          type="range"
          min={bounds.min}
          max={bounds.max}
          value={minVal}
          onChange={(e) => onChange([Math.min(Number(e.target.value), maxVal), maxVal])}
          className={thumbClass}
        />
        <input
          type="range"
          min={bounds.min}
          max={bounds.max}
          value={maxVal}
          onChange={(e) => onChange([minVal, Math.max(Number(e.target.value), minVal)])}
          className={thumbClass}
        />
      </div>
    </div>
  )
}

export function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const selectedLabel = options.find(o => o.value === value)?.label ?? options[0]?.label

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 border border-gray-200 rounded-full pl-4 pr-3 py-2 text-xs text-gray-600 bg-white hover:border-gray-400 transition-colors"
      >
        {selectedLabel}
        <ChevronDown size={14} strokeWidth={2} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-20 mt-2 min-w-full w-max rounded-xl border border-gray-200 bg-white shadow-lg py-1.5 overflow-hidden">
          {options.map(o => (
            <button
              key={o.value}
              type="button"
              onClick={() => { onChange(o.value); setOpen(false) }}
              className={`block w-full text-left px-4 py-2 text-xs whitespace-nowrap transition-colors ${
                o.value === value ? 'text-[#7d5411] font-semibold bg-[#7d5411]/5' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
