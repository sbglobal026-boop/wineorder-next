-- 회원 등급 배지: 다른 회원의 등급 조회 함수 + 등급별 배지 이미지(어드민 업로드)
-- Supabase 대시보드 SQL 에디터에서 실행할 것 — 새 코드를 배포(push)하기 전에 먼저 실행해야 함
-- 등급 값 목록('basic','silver','gold','vip')은 src/lib/memberTiers.ts와 맞춰야 함

-- 1) 회원 ID 목록 → 등급 (리뷰·댓글·CS 게시판 작성자 옆 배지용)
-- 등급은 auth.users의 app_metadata(서버만 수정 가능)에 있고 브라우저에서는 본인 것만 읽을 수 있으므로,
-- 요청한 ID의 등급만 돌려주는 함수를 security definer로 제공 (전체 회원 목록은 조회 불가, 한 번에 최대 200명)
create or replace function public.member_tiers(user_ids uuid[])
returns table (user_id uuid, tier text)
language sql
stable
security definer
set search_path = ''
as $$
  select u.id,
         case when u.raw_app_meta_data->>'tier' in ('basic', 'silver', 'gold', 'vip')
              then u.raw_app_meta_data->>'tier'
              else 'basic' end
  from auth.users u
  where u.id = any (user_ids[1:200])
$$;

revoke all on function public.member_tiers(uuid[]) from public;
grant execute on function public.member_tiers(uuid[]) to anon, authenticated, service_role;

-- 2) 등급별 배지 이미지 — 누구나 읽기 가능, 쓰기는 서버(/api/admin/tier-badges, service role)만
create table if not exists member_tier_badges (
  tier text primary key check (tier in ('basic', 'silver', 'gold', 'vip')),
  image_url text not null,
  image_path text not null, -- Storage 안의 파일 경로 (교체·삭제 시 이전 파일 정리용)
  updated_at timestamptz not null default now()
);

alter table member_tier_badges enable row level security;

drop policy if exists "member_tier_badges public read" on member_tier_badges;
create policy "member_tier_badges public read" on member_tier_badges
  for select using (true);

-- 3) 배지 이미지 저장 버킷 (공개 읽기, PNG·WebP만, 500KB 이하)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('badge-images', 'badge-images', true, 512000, array['image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;
