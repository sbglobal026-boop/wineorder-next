'use client'

export default function Newsletter() {
  return (
    <section>
      <div className="max-w-[1640px] mx-auto bg-[#DAD4CD] py-24 px-[20px] text-center">
        <h2 className="text-3xl md:text-[38px] font-normal tracking-tight mb-3.5 text-[#1C1A17]">
          First at the table, Always.
        </h2>
        <p className="text-lg text-[#5c564c] max-w-lg mx-auto mb-8">
          구독하면 첫 주문 10% 할인.
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
      </div>
    </section>
  )
}
