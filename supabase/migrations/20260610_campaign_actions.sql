-- Kolejka akcji Centrum Kampanii: proposed (Claude) -> approved (Tomek w kampanie.html) -> executed (Claude/routine przez Meta MCP)
-- UWAGA: zastosowane na żywej bazie przez MCP apply_migration 2026-06-10; plik dograny do repo dla spójności.
-- Panel nie ma dostępu do Meta API — "panel sam robi" = panel zatwierdza, egzekutor (Claude/routine) odczytuje status='approved'.
CREATE TABLE IF NOT EXISTS campaign_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id uuid NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('pause_campaign','resume_campaign','budget_change','pause_ad','resume_ad','pause_adset','resume_adset','new_creative','fix_tracking','custom')),
  title text NOT NULL,
  params jsonb NOT NULL DEFAULT '{}'::jsonb,
  reason text,
  status text NOT NULL DEFAULT 'proposed' CHECK (status IN ('proposed','approved','rejected','executing','executed','failed')),
  proposed_by text NOT NULL DEFAULT 'claude',
  approved_at timestamptz,
  approved_by text,
  executed_at timestamptz,
  execution_result text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_campaign_actions_status ON campaign_actions(status, created_at DESC);
ALTER TABLE campaign_actions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS campaign_actions_authenticated ON campaign_actions;
CREATE POLICY campaign_actions_authenticated ON campaign_actions FOR ALL TO authenticated USING (true) WITH CHECK (true);
COMMENT ON TABLE campaign_actions IS 'Kolejka akcji kampanii Meta: proposed (Claude proponuje) -> approved (Tomek w kampanie.html) -> executed (Claude/routine wykonuje przez MCP i wpisuje wynik).';
