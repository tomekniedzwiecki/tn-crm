-- 2026-06-21 — /zbuduje: bud-products loguje zużycie z kind='products'.
-- Poszerzenie CHECK bud_usage_kind_check o 'products' (follow-up do f0).
-- Zaaplikowane na żywej bazie 2026-06-21 (version 20260621115055).
alter table public.bud_usage drop constraint if exists bud_usage_kind_check;
alter table public.bud_usage add constraint bud_usage_kind_check
  check (kind = any (array['chat','plan','image','landing','raport','prototype','economics','gtm','email','assess','brand','demand','products']));
