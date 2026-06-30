-- Koszty /sklep: dotąd makiety (bud-mockup) i reklamy (bud-ads) NIE logowały kosztu do bud_usage,
-- a HTML strony (bud-landing-gen, gpt-5.5) też nie. Dodajemy brakujące rodzaje 'mockup' i 'ads'
-- do CHECK, żeby logi tych etapów się zapisywały (landing/image już dozwolone).
alter table public.bud_usage drop constraint if exists bud_usage_kind_check;
alter table public.bud_usage add constraint bud_usage_kind_check
  check (kind = any (array[
    'chat','plan','image','landing','raport','prototype','economics','gtm','email',
    'assess','brand','demand','products','mockup','ads'
  ]));
