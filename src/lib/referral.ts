import type { SupabaseClient } from '@supabase/supabase-js'

// 추천인 코드 공용 로직 (서버 전용) — 결제 페이지의 코드 확인 API, 결제 세션 API, 어드민 API가 같은 기준을 쓰도록 공용화

// DB 제약(supabase/sql/003_referral_codes.sql)과 동일한 형식: 대문자·숫자·-·_ 4~30자
export const REFERRAL_CODE_PATTERN = /^[A-Z0-9_-]{4,30}$/

// 입력값 정리: 앞뒤 공백 제거 + 영문 대문자로 통일 (abc와 ABC를 같은 코드로 취급)
export function normalizeReferralCode(raw: unknown): string {
  return typeof raw === 'string' ? raw.trim().toUpperCase() : ''
}

export interface ReferralCodeRow {
  id: string
  code: string
  referrer_name: string
  discount_percent: number
  max_uses: number | null
  active: boolean
  created_at: string
}

// 사용 횟수 = 이 코드로 결제된 주문 중 취소되지 않은 주문 수 (주문이 취소되면 횟수도 자동으로 돌아옴)
// 조회 실패 시 null — 호출하는 쪽에서 실패로 처리
export async function countReferralUses(supabase: SupabaseClient, code: string): Promise<number | null> {
  const { count, error } = await supabase
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .eq('referral_code', code)
    .neq('status', 'cancelled')
  return error ? null : (count ?? 0)
}

export type ReferralCheckResult =
  | { ok: true; code: string; discountPercent: number }
  | { ok: false; error: string }

// 결제에 쓸 수 있는 코드인지 확인 — 존재 여부, 사용 여부(켜짐/꺼짐), 최대 사용 횟수 검사
export async function checkReferralCode(supabase: SupabaseClient, rawCode: unknown): Promise<ReferralCheckResult> {
  const code = normalizeReferralCode(rawCode)
  if (!REFERRAL_CODE_PATTERN.test(code)) return { ok: false, error: '존재하지 않는 추천인 코드입니다' }

  const { data, error } = await supabase
    .from('referral_codes')
    .select('code, discount_percent, max_uses, active')
    .eq('code', code)
    .maybeSingle()
  if (error) return { ok: false, error: '추천인 코드를 확인하지 못했습니다. 잠시 후 다시 시도해주세요' }
  if (!data) return { ok: false, error: '존재하지 않는 추천인 코드입니다' }
  if (!data.active) return { ok: false, error: '종료된 추천인 코드입니다' }

  if (data.max_uses != null) {
    const uses = await countReferralUses(supabase, code)
    if (uses == null) return { ok: false, error: '추천인 코드를 확인하지 못했습니다. 잠시 후 다시 시도해주세요' }
    if (uses >= data.max_uses) return { ok: false, error: '사용 가능 횟수가 모두 소진된 추천인 코드입니다' }
  }

  return { ok: true, code: data.code, discountPercent: data.discount_percent }
}

// 어드민 코드 등록·수정 입력값 검사
export function parseReferralCodeInput(body: Record<string, unknown>):
  | { ok: true; value: Pick<ReferralCodeRow, 'code' | 'referrer_name' | 'discount_percent' | 'max_uses' | 'active'> }
  | { ok: false; error: string } {
  const code = normalizeReferralCode(body.code)
  if (!REFERRAL_CODE_PATTERN.test(code)) {
    return { ok: false, error: '코드는 영문·숫자·-·_ 4~30자로 입력해주세요' }
  }

  const discountPercent = Number(body.discount_percent)
  if (!Number.isInteger(discountPercent) || discountPercent < 1 || discountPercent > 100) {
    return { ok: false, error: '할인율은 1~100 사이의 정수로 입력해주세요' }
  }

  // 비워두면 무제한
  const rawMaxUses = body.max_uses
  const maxUses = rawMaxUses == null || rawMaxUses === '' ? null : Number(rawMaxUses)
  if (maxUses != null && (!Number.isInteger(maxUses) || maxUses < 1)) {
    return { ok: false, error: '최대 사용 횟수는 1 이상의 정수로 입력해주세요 (비우면 무제한)' }
  }

  return {
    ok: true,
    value: {
      code,
      referrer_name: typeof body.referrer_name === 'string' ? body.referrer_name.trim().slice(0, 50) : '',
      discount_percent: discountPercent,
      max_uses: maxUses,
      active: body.active !== false,
    },
  }
}
