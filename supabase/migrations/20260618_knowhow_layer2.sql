-- Warstwa 2 know-how: nowe rodzaje (luki/decyzje/sprzecznosci/zalozenia) + scope + handoff pack
-- Zastosowane na zdalnej bazie 2026-06-18 (migracja MCP: knowhow_layer2_gaps_scope_handoff). Idempotentne.

ALTER TABLE public.spar_knowhow_items DROP CONSTRAINT IF EXISTS spar_knowhow_items_kind_check;
ALTER TABLE public.spar_knowhow_items ADD CONSTRAINT spar_knowhow_items_kind_check
  CHECK (kind IN ('wniosek','wymaganie','link','zalacznik','uwaga','cytat','intel_cenowy','luka','decyzja','sprzecznosc','zalozenie'));

ALTER TABLE public.spar_knowhow_items ADD COLUMN IF NOT EXISTS scope text
  CHECK (scope IN ('v1','pozniej','poza','nieznane'));

ALTER TABLE public.spar_knowhow_summary ADD COLUMN IF NOT EXISTS handoff_pack text;
ALTER TABLE public.spar_knowhow_summary ADD COLUMN IF NOT EXISTS handoff_generated_at timestamptz;

COMMENT ON COLUMN public.spar_knowhow_items.scope IS 'Dla wymaganie/wniosek: v1|pozniej|poza|nieznane (cichy podzial zakresu, niewidoczny dla klienta)';
COMMENT ON COLUMN public.spar_knowhow_summary.handoff_pack IS 'Auto-generowany pakiet wykonawczy do budowy v1 (markdown), tworzony przy domknieciu etapu.';
