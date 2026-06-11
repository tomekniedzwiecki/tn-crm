-- Drugi czat (panel projektu — rozmowa o współpracy): rozdzielenie historii per kanał
-- Zaaplikowane 2026-06-12 przez one-off spar-ddl (MCP niedostępny)
ALTER TABLE spar_messages ADD COLUMN IF NOT EXISTS channel text NOT NULL DEFAULT 'sparing';
CREATE INDEX IF NOT EXISTS idx_spar_messages_session_channel ON spar_messages (session_id, channel, created_at);
