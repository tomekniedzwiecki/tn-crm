-- 20260721d_wf2_merchant_accounts.sql
-- Konta merchanta Trevio zakladane AUTONOMICZNIE przez fabryke (edge wf2-merchant).
-- Zamyka luke "API partnera nie tworzy sklepu": rejestracja konta + utworzenie sklepu
-- fizycznego przez API merchanta gateway.trevio.pl/auth + /organization.
--
-- BEZPIECZENSTWO: tabela TRZYMA HASLA kont merchanta -> RLS ENABLED, ZERO polityk.
-- Dostep wylacznie service-role (bypass RLS z edge). anon/authenticated nie widza
-- ani jednego wiersza. Wzorzec jak inne tabele wf2_* z sekretami.

create table if not exists public.wf2_merchant_accounts (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid references public.wf2_projects(id) on delete set null,
  tenant_id   text not null,
  email       text not null unique,
  password    text not null,
  org_id      text,
  website_id  text,
  subdomain   text,
  created_by  text default 'fabryka',
  created_at  timestamptz default now()
);

-- RLS wlaczone, celowo BEZ POLITYK: tylko service-role (ktory omija RLS) czyta/pisze.
alter table public.wf2_merchant_accounts enable row level security;

-- Szybka referencja e-maila konta merchanta na projekcie (bez siegania do tabeli z haslami).
alter table public.wf2_projects add column if not exists platform_merchant_email text;

comment on table public.wf2_merchant_accounts is
  'Konta merchanta Trevio zakladane przez fabryke (edge wf2-merchant). TRZYMA HASLA - RLS bez polityk = service-role only.';
comment on column public.wf2_merchant_accounts.password is
  'Haslo konta merchanta - NIGDY nie logowac poza ta tabela; edge list_accounts zwraca wiersze bez tego pola.';
comment on column public.wf2_projects.platform_merchant_email is
  'E-mail konta merchanta Trevio powiazanego z projektem (szybka referencja; hasla trzyma wf2_merchant_accounts).';
