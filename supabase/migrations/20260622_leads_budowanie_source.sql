-- 2026-06-22 — fix /zbuduje (oferta AWE).
--
-- bud-chat wysyła lead_source='budowanie' przy zielonym werdykcie, ale
-- leads_lead_source_check (z migracji 20260614_leads_stworze_source...) dopuszczał
-- tylko website/outreach/manual/stworze → INSERT w lead-upsert leciał błędem (500),
-- leadId=null (ten sam bug, który 20260614 naprawiał dla 'stworze'). Komentarz w
-- 20260621_zbuduje_f0_foundation ("brak CHECK -> 'budowanie' przejdzie") był
-- nieaktualny. Poszerzam CHECK o 'budowanie'.
ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_lead_source_check;
ALTER TABLE public.leads ADD CONSTRAINT leads_lead_source_check
  CHECK (lead_source IN ('website','outreach','manual','stworze','budowanie'));
