-- Radar trendów: nowy status 'duplicate' — produkt już był wcześniej w radarze.
-- Pozwala oznaczyć powtórkę osobno od 'rejected' (świadoma decyzja "już to widzieliśmy").
ALTER TABLE public.bud_tt_products DROP CONSTRAINT IF EXISTS bud_tt_status_check;
ALTER TABLE public.bud_tt_products
  ADD CONSTRAINT bud_tt_status_check
  CHECK (status = ANY (ARRAY['pending','approved','rejected','duplicate']));
