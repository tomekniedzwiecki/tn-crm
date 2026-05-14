-- Tabela `client_knowledge` — cache wątków Gmail per klient.
-- Wypełniana przez `gmail-scan-client` edge function (on-demand lub cron).
-- Odczytywana przez `client-context-fetch` przy obsłudze maila.

CREATE TABLE IF NOT EXISTS client_knowledge (
  customer_email TEXT PRIMARY KEY,
  workflow_id UUID REFERENCES workflows(id) ON DELETE SET NULL,
  threads JSONB NOT NULL DEFAULT '[]'::jsonb,
  thread_count INT NOT NULL DEFAULT 0,
  last_thread_date TIMESTAMPTZ,
  last_scanned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_client_knowledge_workflow ON client_knowledge(workflow_id);
CREATE INDEX IF NOT EXISTS idx_client_knowledge_last_scan ON client_knowledge(last_scanned_at);

-- threads JSONB schema (array of objects):
-- {
--   "threadId": "19e0c5426e02e9f9",
--   "subject": "Błąd na stronie Sprzatka",
--   "lastDate": "2026-05-14T13:37:22Z",
--   "messageCount": 4,
--   "lastSender": "karol.karpeta@gmail.com",
--   "lastSnippet": "Hej, przejrzałem dokładnie stronę...",
--   "lastSenderIsClient": true,
--   "hasUnansweredMessage": true,
--   "totalAttachments": 13
-- }

COMMENT ON TABLE client_knowledge IS 'Cache Gmail thread metadata per klient. Wypełniana on-demand przez gmail-scan-client edge function. Odczytywana przez client-context-fetch.';

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION client_knowledge_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS client_knowledge_updated_at_trigger ON client_knowledge;
CREATE TRIGGER client_knowledge_updated_at_trigger
BEFORE UPDATE ON client_knowledge
FOR EACH ROW
EXECUTE FUNCTION client_knowledge_updated_at();

-- RLS: tylko service_role (Claude przez edge function). Anon nie ma dostępu.
ALTER TABLE client_knowledge ENABLE ROW LEVEL SECURITY;

-- Service role pełen dostęp (przez bypass RLS - automatic dla service key).
-- Brak policy dla anon = default deny.
