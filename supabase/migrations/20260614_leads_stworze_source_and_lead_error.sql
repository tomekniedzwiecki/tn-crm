-- 2026-06-14 — fixy sparingu (audyt 4 person)
--
-- Fix #1 (KRYTYCZNE): zielony werdykt w lejku „Stworzę/Aplikacja" nie tworzył leada.
-- spar-chat wysyła lead_source='stworze', a CHECK dopuszczał tylko website/outreach/manual
-- → INSERT w lead-upsert leciał błędem (500), leadId=null, lead znikał z CRM (brak
-- follow-upów verdict_no_payment/last_call, brak status='won' po wpłacie).
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_lead_source_check;
ALTER TABLE leads ADD CONSTRAINT leads_lead_source_check
  CHECK (lead_source IN ('website','outreach','manual','stworze'));

-- Fix #2 (obserwowalność): sygnał, gdy zielony werdykt z mailem mimo wszystko nie
-- utworzy leada. spar-chat stempluje tu komunikat → queryable alert
-- (SELECT id, lead_error FROM spar_sessions WHERE lead_error IS NOT NULL).
ALTER TABLE spar_sessions ADD COLUMN IF NOT EXISTS lead_error text;
