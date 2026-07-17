-- SELLER-MINING — "dobry sklep = kopalnia".
-- Teza: sprzedawca, który dostarczył nam JUŻ zwalidowany hit (np. SEESE Store — 7 naszych
-- produktów, 1,54 mln sold, 137 pozycji w katalogu), ma na półce całą listę pre-walidowanych
-- bestsellerów. Zamiast szukać produkt-po-produkcie (bud-shop-radar op:scan), bierzemy KATALOG
-- sprawdzonego sprzedawcy (/v1/tiktok/shop/products?sort_by=top) i przepuszczamy przez ten sam
-- pipeline co scan (filtr sprzedaży/ceny/oceny → enrich → nazwy PL → dedup → upsert pending).
--
-- 1) bud_radar_sellers — rejestr sprzedawców do minowania (seed z bud_tt_products, rotacja po
--    last_mined_at NULLS FIRST — jak bud_radar_queries.last_used_at).
-- 2) cron bud-radar-mine-sellers — pon/czw 06:45 UTC (45 min po scan 06:00), 5 sprzedawców/run.
--
-- RLS: SPÓJNIE z bud_radar_queries (bez RLS). Tabela używana WYŁĄCZNIE przez edge (service_role,
-- omija RLS). Brak PII — publiczne dane sklepów TikTok Shop (seller_id, nazwa, URL sklepu).
-- Legacy anon keys wyłączone globalnie (project-supabase-legacy-keys-disabled), więc brak
-- powierzchni odczytu przez anon mimo braku RLS.
--
-- AUTH DO EDGE / VAULT: jak 20260716c_radar_cron.sql — x-tools-secret z Vault `bud_tools_secret`,
-- timeout_milliseconds := 350000 (pg_net default 5s zerwałby długi mine).

-- Sanity: sekret musi istnieć (inaczej cron dostanie 403).
DO $$
DECLARE v_secret text;
BEGIN
    SELECT decrypted_secret INTO v_secret
    FROM vault.decrypted_secrets WHERE name = 'bud_tools_secret';
    IF v_secret IS NULL OR length(v_secret) < 10 THEN
        RAISE EXCEPTION 'Vault secret "bud_tools_secret" missing/too short. '
                        'Run vault.create_secret(<BUD_TOOLS_SECRET>, ''bud_tools_secret'', ...) first.';
    END IF;
END $$;

-- =============================================
-- Tabela sprzedawców do minowania
-- =============================================
CREATE TABLE IF NOT EXISTS bud_radar_sellers (
    seller_id     text PRIMARY KEY,          -- TikTok Shop sellerId (stabilny; z tt_shop.shop.seller_id)
    shop_name     text,                       -- nazwa sklepu (tt_shop.shop.name)
    store_url     text,                       -- https://www.tiktok.com/shop/store/<slug>/<seller_id>
    source_key    text,                       -- bud_tt_products.key hitu, który ujawnił sprzedawcę (najwyższy sold)
    total_sold    bigint,                     -- suma sold_count naszych hitów tego sprzedawcy (sygnał "kopalni")
    last_mined_at timestamptz,                -- NULL = jeszcze nieminowany (priorytet w rotacji)
    discovered_at timestamptz NOT NULL DEFAULT now()
);

-- Rotacja: najdawniej minowani pierwsi (NULLS FIRST = nigdy-nieminowani na czele), tie-break po odkryciu.
CREATE INDEX IF NOT EXISTS bud_radar_sellers_mine_order
    ON bud_radar_sellers (last_mined_at ASC NULLS FIRST, discovered_at ASC);

-- =============================================
-- CRON: mine katalogów sprawdzonych sprzedawców — pon i czw 06:45 UTC
-- (45 min po bud-radar-scan 06:00; osobny job, żeby scan i mine nie kolidowały o deadline).
-- =============================================
DO $$ BEGIN PERFORM cron.unschedule('bud-radar-mine-sellers');
EXCEPTION WHEN OTHERS THEN RAISE NOTICE 'skip unschedule bud-radar-mine-sellers'; END $$;

SELECT cron.schedule(
    'bud-radar-mine-sellers',
    '45 6 * * 1,4',
    $$
    SELECT net.http_post(
        url := 'https://yxmavwkwnfuphjqbelws.supabase.co/functions/v1/bud-shop-radar',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'x-tools-secret', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'bud_tools_secret')
        ),
        body := jsonb_build_object('op', 'mine_sellers', 'limit', 5, 'perSeller', 2),
        timeout_milliseconds := 350000
    ) AS request_id
    $$
);

-- =============================================
-- Weryfikacja:
--   SELECT jobname, schedule FROM cron.job WHERE jobname = 'bud-radar-mine-sellers';
--   SELECT count(*), count(last_mined_at) FROM bud_radar_sellers;
--   SELECT * FROM bud_radar_sellers ORDER BY total_sold DESC NULLS LAST LIMIT 10;
-- =============================================
