-- Raport rynkowy (spar-raport, web search) + adres wygenerowanego landinga (spar-landing)
-- Zaaplikowane przez MCP 2026-06-12.
ALTER TABLE spar_sessions ADD COLUMN IF NOT EXISTS market_report jsonb;
ALTER TABLE spar_sessions ADD COLUMN IF NOT EXISTS landing_url text;
-- Nowy rodzaj kosztu: research rynkowy
ALTER TABLE spar_usage DROP CONSTRAINT spar_usage_kind_check;
ALTER TABLE spar_usage ADD CONSTRAINT spar_usage_kind_check
  CHECK (kind = ANY (ARRAY['chat'::text, 'plan'::text, 'image'::text, 'landing'::text, 'raport'::text]));
