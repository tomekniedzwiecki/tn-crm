-- Status MCP per konto reklamowe Meta.
-- Aktualizowany manualnie przez Claude przez wywolanie ads_get_ad_accounts (MCP)
-- raz na 2-3 dni gdy Tomek poprosi ("sprawdz MCP" / "odswiez MCP").
--
-- NULL = nie sprawdzone (np. workflow ma meta_ad_account_id ale jeszcze
--        nie przeleciala synchronizacja, albo ID nie jest ustawione)
-- TRUE = konto ma is_ads_mcp_enabled=true w Mecie
-- FALSE = konto sprawdzone, jeszcze nie ma MCP (gradual rollout)

ALTER TABLE workflow_ads
  ADD COLUMN IF NOT EXISTS meta_mcp_enabled BOOLEAN,
  ADD COLUMN IF NOT EXISTS meta_mcp_checked_at TIMESTAMPTZ;

COMMENT ON COLUMN workflow_ads.meta_mcp_enabled IS 'Czy konto reklamowe Meta ma is_ads_mcp_enabled=true (manualny refresh przez Claude/MCP)';
COMMENT ON COLUMN workflow_ads.meta_mcp_checked_at IS 'Kiedy ostatnio sprawdzono status MCP dla tego konta';
