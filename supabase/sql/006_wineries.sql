-- 와이너리(생산자) — /events/winery 목록·상세 페이지용
-- Supabase 대시보드 SQL 에디터에서 실행할 것 — 새 코드를 배포(push)하기 전에 먼저 실행해야 함

create table if not exists wineries (
  id bigserial primary key,
  -- 주소에 쓰는 영문 이름 (예: /events/winery/ossian)
  slug text not null unique check (slug ~ '^[a-z0-9-]{2,60}$'),
  name text not null,
  country text not null default '',
  region text not null default '',
  description text not null default '',
  image_url text,
  created_at timestamptz not null default now()
);

alter table wineries enable row level security;

-- 목록·상세 페이지에서 보여주므로 누구나 읽기 가능, 쓰기는 서버(/api/admin/wineries)만
drop policy if exists "wineries public read" on wineries;
create policy "wineries public read" on wineries
  for select using (true);

-- 상품에 와이너리 연결 (와이너리를 지우면 상품의 연결만 끊고 상품은 유지)
alter table products
  add column if not exists winery_id bigint references wineries(id) on delete set null;

create index if not exists products_winery_id_idx on products (winery_id) where winery_id is not null;

-- 공개용 연결 정보 — products_public 뷰는 그대로 두고, 어떤 상품이 어느 와이너리 것인지만 따로 공개
create or replace view public.product_wineries as
  select p.id as product_id, p.winery_id, w.slug as winery_slug
  from products p
  join wineries w on w.id = p.winery_id;

grant select on public.product_wineries to anon, authenticated;
