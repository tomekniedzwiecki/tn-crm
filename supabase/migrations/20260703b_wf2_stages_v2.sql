-- ⚠ NIEIDEMPOTENTNA: `stage = stage - 1` przy ponownym uruchomieniu przesunęłoby
-- etapy o kolejne -1. Odpalać wyłącznie raz (standardowy flow migracji); NIE re-runować ręcznie.
-- Workflow v2: decyzja Tomka 2026-07-03 — bez etapu „Start" (rozmowa/umowa/kickoff
-- prowadzone poza systemem; płatności mają własną, zawsze widoczną sekcję w widoku
-- projektu) i bez kroku „Raport" w Portfelu. Etapy przenumerowane 1..5:
-- 1 Portfel produktów · 2 Sklep TakeDrop · 3 Kampanie · 4 Testy i skalowanie · 5 Przekazanie sterów
DELETE FROM public.wf2_step_defs WHERE key IN ('rozmowa','umowa','platnosc','kickoff','raport');
UPDATE public.wf2_step_defs SET stage = stage - 1 WHERE stage >= 2;
