-- ⚠️ HISTORYCZNE (22.07.2026 wieczór): WYCOFANE decyzją Tomka. NADPISANE przez 20260722m_wf2_budzet_prepaid_instr.sql
-- (prepaid / PŁATNOŚCI RĘCZNE). Migracja zostaje w repo TYLKO dla porządku apply (k<m: k aplikuje się PRZED m,
-- m nadpisuje treść na prepaid). NIE stosować samodzielnie — treść „ZALECAMY KARTĘ" niżej jest już nieaktualna.
-- ─────────────────────────────────────────────────────────────────────────────────────────────────────────
-- Etap 4 „Środowisko reklamowe" — instructions_md kroku ads_budzet: PRZEBUDOWA pod KARTĘ (22.07.2026).
-- PROBLEM (runda 3, werdykt krytyka P1): commitowana migracja 20260722h opisywała budżet jako
-- „prepaid (BLIK/przelew/PayU)", a żywa baza dostała PATCH-em treść „ZALECAMY KARTĘ" (rozjazd repo↔prod;
-- test:wf2 §14 nie odtwarzał się z repozytorium — asercja przechodziła TYLKO dzięki patchowi na prod).
-- FIX: idempotentny UPDATE po key (bez zmian schematu) sprowadza żywą bazę do wersji SPÓJNEJ z repo.
-- Treść = LUSTRO portalowego CLIENT_WS.ads_budzet (tn-sklepy/portal.html: guide „Najprościej i
-- najbezpieczniej — kartą" + warn „Unikaj doładowania przelewem") — sparafrazowane 1:1 co do sensu.
-- SSOT modułu: docs/zbuduje/ADS-ONBOARDING-LEADSIE.md.
--
-- Uwaga: nadpisuje ewentualny wcześniejszy PATCH z rundy 1 spójną wersją — to OK i zamierzone.

update wf2_step_defs set instructions_md =
'Zasil swoje konto reklamowe budżetem startowym 1000 zł (500 zł na testy 3 produktów + 500 zł na skalowanie zwycięzców). ZALECAMY KARTĘ jako pierwszą metodę płatności — najlepiej od razu dwie (główną i zapasową), żeby reklamy nie stanęły, gdyby na jednej zabrakło środków. Kartę dodasz w Menedżerze reklam → Ustawienia płatności. UNIKAJ doładowania przelewem: wpłata przelewem trafia na ogólne saldo rozliczeniowe Twojego profilu, a nie na konkretne konto reklamowe kampanii — i potrafi „utknąć" poza reklamami. Jeśli musisz zrobić przelew, wykonaj go wyłącznie z poziomu Ustawień płatności TEGO KONKRETNEGO konta reklamowego. Środki muszą być widoczne na koncie w Menedżerze reklam. Limit wydatków konta (bezpiecznik) ustawimy my — nie musisz nic konfigurować.'
where key = 'ads_budzet';
