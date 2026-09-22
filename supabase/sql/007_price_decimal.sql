-- 가격을 소수점(센트)까지 저장할 수 있게 변경
-- Supabase 대시보드 SQL 에디터에서 실행할 것
-- 배경: price가 정수 칸이라 345.97처럼 소수점이 있는 판매가를 저장하면 오류가 났음
--      (어드민에서 원가·마진 대신 판매가를 직접 입력하도록 바꾸면서 드러남)
--
-- products_public 뷰가 price 칸을 쓰고 있어 칸 형식을 바로 바꿀 수 없으므로,
-- 뷰의 현재 정의·설정·권한을 그대로 읽어두고 → 뷰 삭제 → 칸 변경 → 같은 내용으로 뷰 재생성한다.

do $$
declare
  view_def text;
  view_opts text[];
  grant_row record;
begin
  -- 1) 현재 뷰 정의와 설정 보관
  select pg_get_viewdef('public.products_public'::regclass, true), c.reloptions
    into view_def, view_opts
  from pg_class c
  where c.oid = 'public.products_public'::regclass;

  -- 2) 현재 뷰 권한 보관 (재생성 후 그대로 복원)
  create temporary table if not exists _view_grants (grantee text, privilege_type text) on commit drop;
  delete from _view_grants;
  insert into _view_grants
  select g.grantee, g.privilege_type
  from information_schema.role_table_grants g
  where g.table_schema = 'public' and g.table_name = 'products_public';

  -- 3) 뷰 내리고 칸 형식 변경
  execute 'drop view public.products_public';

  execute 'alter table products
             alter column price type numeric(10,2) using price::numeric(10,2),
             alter column "EK" type numeric(10,2) using "EK"::numeric(10,2),
             alter column shipping_fee type numeric(10,2) using shipping_fee::numeric(10,2)';

  -- 4) 뷰를 원래 정의 그대로 다시 만들고 설정·권한 복원
  execute format('create view public.products_public as %s', view_def);

  if view_opts is not null then
    execute format('alter view public.products_public set (%s)', array_to_string(view_opts, ', '));
  end if;

  for grant_row in select * from _view_grants loop
    execute format('grant %s on public.products_public to %I', grant_row.privilege_type, grant_row.grantee);
  end loop;
end $$;

-- 배송비 요율도 같은 이유로 소수점 허용 (예: 12.50)
alter table shipping_rates
  alter column fee type numeric(10,2) using fee::numeric(10,2);
