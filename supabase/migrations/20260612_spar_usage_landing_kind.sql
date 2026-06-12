-- spar-landing: nowy rodzaj kosztu w spar_usage (generacja landinga HTML przez gpt-5.5)
-- Zaaplikowane przez MCP 2026-06-12.
ALTER TABLE spar_usage DROP CONSTRAINT spar_usage_kind_check;
ALTER TABLE spar_usage ADD CONSTRAINT spar_usage_kind_check
  CHECK (kind = ANY (ARRAY['chat'::text, 'plan'::text, 'image'::text, 'landing'::text]));
