-- 추천인 코드 + 할인(상품 금액에만 % 할인)
-- Supabase 대시보드 SQL 에디터에서 실행할 것 — 새 코드를 배포(push)하기 전에 먼저 실행해야 함
-- (컬럼이 없으면 결제 시 임시 주문 저장이 실패해 결제가 막힘)

-- 어드민이 등록하는 추천인 코드
create table if not exists referral_codes (
  id uuid primary key default gen_random_uuid(),
  -- 코드는 대문자·숫자·-·_ 4~30자로 통일 (서버에서 대문자로 바꿔 저장)
  code text not null unique check (code ~ '^[A-Z0-9_-]{4,30}$'),
  referrer_name text not null default '',
  discount_percent integer not null check (discount_percent between 1 and 100),
  -- null이면 사용 횟수 무제한
  max_uses integer check (max_uses is null or max_uses > 0),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table referral_codes enable row level security;

-- 서버(admin 클라이언트)만 다룸 — 고객 브라우저에서 코드 목록을 조회하지 못하게 차단
drop policy if exists "referral_codes no client access" on referral_codes;
create policy "referral_codes no client access" on referral_codes
  for all using (false);

-- 주문·임시 주문에 사용한 코드와 할인액 기록
-- 외래키는 걸지 않음: 결제 완료 후 주문 저장 단계가 코드 삭제 등으로 실패하면 안 되기 때문 (삭제 제한은 서버에서 처리)
alter table orders
  add column if not exists referral_code text,
  add column if not exists discount_eur numeric not null default 0 check (discount_eur >= 0);

alter table checkout_drafts
  add column if not exists referral_code text,
  add column if not exists discount_eur numeric not null default 0 check (discount_eur >= 0);

-- 코드별 사용 횟수 집계용
create index if not exists orders_referral_code_idx on orders (referral_code) where referral_code is not null;
