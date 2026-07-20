-- ═══════════════════════════════════════════════════════════════════════════
-- WF2 — WARSTWA ANALITYKI PLATFORMY TREVIO (2026-07-20)
-- API platformy dostało: payments[] w /orders, /orders/{id}/attribution (sesje,
-- źródło ruchu, click ids) oraz endpoint ceny wariantu (§3.4 CENNIK). Ta migracja
-- dokłada kolumny cache płatności+atrybucji ADDYTYWNIE — zero zmian istniejących
-- kolumn i zero zmian semantyki orders/revenue w wf2_sales (paid = równoległa księga).
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. wf2_orders: płatności + atrybucja (addytywnie) ────────────────────────
ALTER TABLE public.wf2_orders
  ADD COLUMN IF NOT EXISTS payments jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS is_paid boolean,                    -- NULL=nieznane (payments puste), true/false wyliczone
  ADD COLUMN IF NOT EXISTS paid_at timestamptz,
  ADD COLUMN IF NOT EXISTS payment_method text,                -- blik|card|cod|transfer|… (najlepsza płatność)
  ADD COLUMN IF NOT EXISTS attribution jsonb,                  -- pełna odpowiedź /attribution (MINUS pole identity = PII)
  ADD COLUMN IF NOT EXISTS attributed_source text,             -- skrót "source / channel" (np. facebook/paid)
  ADD COLUMN IF NOT EXISTS attribution_entry_path text,        -- pathname z landingPage sesji primary
  ADD COLUMN IF NOT EXISTS attribution_campaign text,          -- utm_campaign jeśli występuje
  ADD COLUMN IF NOT EXISTS attribution_click_ids jsonb,        -- {fbclid,gclid,ttclid,…} bez null-i
  ADD COLUMN IF NOT EXISTS attribution_status text NOT NULL DEFAULT 'pending',  -- pending|ok|none
  ADD COLUMN IF NOT EXISTS attribution_checked_at timestamptz;

-- indeks częściowy: kolejka kandydatów do pobrania atrybucji (najnowsze najpierw)
CREATE INDEX IF NOT EXISTS wf2_orders_attr_pending_idx
  ON public.wf2_orders(project_id, order_date DESC) WHERE attribution_status = 'pending';

-- ── 2. wf2_sales: równoległa księga PAID (semantyka orders/revenue BEZ ZMIAN) ─
ALTER TABLE public.wf2_sales
  ADD COLUMN IF NOT EXISTS orders_paid integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS revenue_paid numeric(12,2) NOT NULL DEFAULT 0;

-- ── 3. wf2_products: licznik POTWIERDZONYCH (orders_paid zostaje jako proxy) ──
ALTER TABLE public.wf2_products
  ADD COLUMN IF NOT EXISTS orders_confirmed integer NOT NULL DEFAULT 0;
