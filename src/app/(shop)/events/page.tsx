import { redirect } from 'next/navigation'

// Top Drop 목록은 메인(/)으로 옮김 — 기존 /events 주소로 들어오면 메인으로 보냄 (307 임시 이동)
// /events/wines, /events/food 및 상품 상세 주소는 그대로 유지
export default function EventsRedirect() {
  redirect('/')
}
