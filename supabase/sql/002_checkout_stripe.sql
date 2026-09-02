-- Stripe 결제 연동을 위한 스키마 변경
-- Supabase 대시보드 SQL 에디터에서 실행할 것

-- 결제 완료된 주문과 Stripe Checkout Session을 연결 (중복 주문 생성 방지용 unique 제약)
alter table orders
  add column if not exists stripe_session_id text unique;

-- 결제 전 임시 주문 스냅샷 (Checkout Session 생성 시점의 확정 금액을 저장해두고,
-- 결제가 성공하면 이 값을 그대로 orders 테이블로 옮김 — 결제 시점과 주문 생성 시점의 가격 재계산 불일치 방지)
create table if not exists checkout_drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  address_id uuid,
  items jsonb not null,
  total_eur numeric not null,
  shipping_fee_eur numeric not null default 0,
  duty_eur numeric not null default 0,
  split_delivery boolean not null default false,
  split_delivery_fee_eur numeric not null default 0,
  memo text,
  stripe_session_id text unique,
  status text not null default 'pending', -- pending | completed | expired
  order_id uuid references orders(id),
  created_at timestamptz not null default now()
);

alter table checkout_drafts enable row level security;

-- 서버(admin 클라이언트)만 이 테이블을 다루므로 일반 사용자 접근은 차단
create policy "checkout_drafts no client access" on checkout_drafts
  for all using (false);
