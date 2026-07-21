-- ═══════════════════════════════════════════════════════════════════════════
-- WF2 — krok „Twoja firma" PO konfiguracji kampanii (2026-07-22, korekta Tomka)
-- „To nie może być pierwsze zadanie, oni się przestraszą. To musi być po
--  konfiguracji kampanii. Nie chcę też aby to było w ogóle widoczne wcześniej."
--
-- Przeniesienie: Etap 3 (sort 17) → Etap 4 „Środowisko reklamowe", sort 35
-- (za ads_budzet 30, przed ads_pixel 40). Niewidoczność przed czasem załatwia
-- front portalu (buildState: krok istnieje dla klienta DOPIERO gdy ads_strona +
-- ads_konto + ads_budzet są done) + nadrzędnie PREVIEW_ONLY_STEPS w edge
-- (moduł w ogóle nieudostępniony klientom do decyzji Tomka).
-- ═══════════════════════════════════════════════════════════════════════════

UPDATE public.wf2_step_defs
   SET stage = 4,
       stage_label = 'Środowisko reklamowe',
       sort = 35
 WHERE key = 'firma';
