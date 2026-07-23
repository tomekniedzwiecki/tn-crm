-- 20260723d_wfp_source_harvest.sql — Prospektor: audytowalne źródła pozyskania prospektów.
-- Bramka compliance (PROSPEKTOR-BAZA.md): pole source mówi SKĄD są dane (art. 14 RODO —
-- w stopce podajemy źródło). Poszerzenie CHECK o źródła harvestu. Idempotentne.
ALTER TABLE public.wfp_prospects DROP CONSTRAINT IF EXISTS wfp_prospects_source_check;
ALTER TABLE public.wfp_prospects ADD CONSTRAINT wfp_prospects_source_check
  CHECK (source IN ('manual','csv','pspddd','ceidg','bip-gmina','sad-okregowy','katalog'));
