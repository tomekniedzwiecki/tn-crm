-- 20260723j_wfp_source_harvest2.sql — Prospektor: kolejne audytowalne źródła harvestu.
-- Fala testu dywersyfikacji: katalogi branżowe PSV (vending), BUR/PARP (BHP), WSPON (pośrednicy).
-- Każde = publiczny wykaz → source rozróżnialny dla noty art. 14 (source_detail ustawiany po imporcie).
-- Idempotentne.
ALTER TABLE public.wfp_prospects DROP CONSTRAINT IF EXISTS wfp_prospects_source_check;
ALTER TABLE public.wfp_prospects ADD CONSTRAINT wfp_prospects_source_check
  CHECK (source IN ('manual','csv','pspddd','ceidg','bip-gmina','sad-okregowy','katalog','psv','bur','wspon'));
