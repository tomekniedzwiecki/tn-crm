-- LOGISTYKA (SSOT: docs/zbuduje/LOGISTYKA.md §4/§5/§7): oferty zakupu per produkt +
-- test-ordery + lejek logistyczny na bud_tt_products. RLS = 2 recenzentów (jak bud_tt_products).
-- APPLIED 2026-07-17 przez MCP — plik odtwarza PEŁNY, realny stan DB (spójność repo, idempotentny).
-- Silnik kill-gates/scoring/choose/status = edge function bud-offers.

-- ── bud_offers: oferty zakupu (kandydat/zweryf./odrzuc./główna/backup) ──
create table if not exists public.bud_offers (
  id              uuid primary key default gen_random_uuid(),
  key             text not null,                         -- = bud_tt_products.key
  source          text not null default 'aliexpress',    -- aliexpress|cj|allegro|1688|bigbuy|other
  url             text not null,
  seller_name     text,
  seller_id       text,
  price_pln       numeric,
  shipping_pln    numeric,
  delivery_days   integer,
  seller_score    integer,                               -- 0-100 (edge scoring)
  gates           jsonb,                                 -- {killed, kill_reasons[], warnings[], tier}
  score_breakdown jsonb,                                 -- {input, breakdown, weights, ...}
  status          text not null default 'candidate',     -- candidate|verified|rejected|chosen|backup
  notes           text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);
create index if not exists bud_offers_key on public.bud_offers using btree (key, status);

-- ── bud_test_orders: test-ordery (bramka przed podpięciem do sklepu klienta) ──
create table if not exists public.bud_test_orders (
  id          uuid primary key default gen_random_uuid(),
  key         text not null,
  offer_id    uuid references public.bud_offers(id),
  ordered_at  date,
  cost_pln    numeric,
  eta         date,
  received_at date,
  checklist   jsonb,                                     -- {czas, zgodnosc, material, dzialanie, opakowanie, reverse}
  verdict     text,                                      -- pass|partial|fail
  notes       text,
  created_at  timestamptz default now()
);
create index if not exists bud_test_orders_key on public.bud_test_orders using btree (key);

-- ── denorm lejka logistycznego na produkcie ──
alter table public.bud_tt_products add column if not exists logistics_status text;  -- none|sourcing|verified|test_ordered|ready|eu_stock|pl_stock
alter table public.bud_tt_products add column if not exists chosen_offer_id  uuid;

-- ── RLS = wyłącznie 2 recenzentów (jak bud_tt_products); ZERO anon ──
alter table public.bud_offers      enable row level security;
alter table public.bud_test_orders enable row level security;

drop policy if exists bud_offers_rw on public.bud_offers;
create policy bud_offers_rw on public.bud_offers
  for all to authenticated
  using      (auth.uid() = any (array['93675a5a-ea02-488c-a6c2-4adf687ea435'::uuid, '7cd1830f-fca0-44d4-a419-7a822f77f919'::uuid]))
  with check (auth.uid() = any (array['93675a5a-ea02-488c-a6c2-4adf687ea435'::uuid, '7cd1830f-fca0-44d4-a419-7a822f77f919'::uuid]));

drop policy if exists bud_test_orders_rw on public.bud_test_orders;
create policy bud_test_orders_rw on public.bud_test_orders
  for all to authenticated
  using      (auth.uid() = any (array['93675a5a-ea02-488c-a6c2-4adf687ea435'::uuid, '7cd1830f-fca0-44d4-a419-7a822f77f919'::uuid]))
  with check (auth.uid() = any (array['93675a5a-ea02-488c-a6c2-4adf687ea435'::uuid, '7cd1830f-fca0-44d4-a419-7a822f77f919'::uuid]));
