'use client'

export default function Newsletter() {
  return (
    <section className="bg-[#F3EFE8] py-24 px-[15px] text-center">
      <h2 className="text-3xl md:text-[38px] font-semibold tracking-tight mb-3.5 text-[#1C1A17]">
        table code 소식, 당신의 메일로.
      </h2>
      <p className="text-lg text-[#5c564c] max-w-lg mx-auto mb-8">
        신상 와인, 시즌 추천, 다가오는 이벤트까지. 구독하면 10% 할인도 드려요.
      </p>
      <form
        onSubmit={(e) => e.preventDefault()}
        className="max-w-md mx-auto flex gap-2.5 border-b border-[#1C1A17]/30 pb-2.5"
      >
        <input
          type="email"
          placeholder="이메일 주소"
          className="flex-1 bg-transparent outline-none text-base text-[#1C1A17] placeholder:text-[#9a9384]"
        />
        <button type="submit" className="text-lg font-semibold text-[#1C1A17]">→</button>
      </form>
    </section>
  )
}
