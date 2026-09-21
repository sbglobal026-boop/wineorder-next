-- 주문에 배송지 주소를 복사해 저장 (고객이 주소록에서 주소를 지워도 어드민 주문의 배송지는 남도록)
-- Supabase 대시보드 SQL 에디터에서 실행할 것 — 새 코드를 배포(push)하기 전에 먼저 실행해야 함
-- (컬럼이 없으면 결제 시 임시 주문 저장이 실패해 결제가 막힘)

alter table orders add column if not exists shipping_address jsonb;
alter table checkout_drafts add column if not exists shipping_address jsonb;

-- 기존 주문에 현재 주소록 내용을 복사해 넣기 (이미 채워진 주문은 건드리지 않음)
update orders o
set shipping_address = jsonb_build_object(
  'recipient_name', a.recipient_name,
  'address', a.address,
  'city', a.city,
  'postal_code', a.postal_code,
  'country', a.country,
  'customs_code', a.customs_code
)
from addresses a
where a.id = o.address_id
  and o.shipping_address is null;

-- 주소록에서 주소를 지우면 주문의 주소 연결만 끊고 주문은 그대로 유지 (배송지는 위에서 복사한 값 사용)
alter table orders alter column address_id drop not null;

do $$
declare constraint_name text;
begin
  select conname into constraint_name
  from pg_constraint
  where conrelid = 'orders'::regclass
    and contype = 'f'
    and pg_get_constraintdef(oid) like '%REFERENCES addresses(%';

  if constraint_name is not null then
    execute format('alter table orders drop constraint %I', constraint_name);
  end if;
end $$;

alter table orders
  add constraint orders_address_id_fkey
  foreign key (address_id) references addresses(id) on delete set null;
