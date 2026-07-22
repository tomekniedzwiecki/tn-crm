-- Etap 4 „Środowisko reklamowe" — instructions_md kroku ads_budzet: PRZEBUDOWA pod PREPAID (22.07.2026).
-- DECYZJA TOMKA (22.07, WIĄŻĄCA): metoda płatności budżetu = PREPAID / PŁATNOŚCI RĘCZNE (BLIK/przelew/PayU),
-- NIE karta. Wcześniejsza rekomendacja „karta-first" (migracja 20260722k „ZALECAMY KARTĘ") jest WYCOFANA.
-- Ta migracja (m > k alfabetycznie → aplikuje się PO k przy świeżym apply) NADPISUJE treść k wersją prepaid.
-- Treść = LUSTRO portalowego CLIENT_WS.ads_budzet (tn-sklepy/portal.html) — sparafrazowane 1:1 co do sensu.
-- SSOT modułu: docs/zbuduje/ADS-ONBOARDING-LEADSIE.md.
--
-- L1 (incydent): doładowanie MUSI iść z Ustawień płatności KONKRETNEGO konta reklamowego — ogólny przelew
--   ląduje na domyślnym koncie rozliczeniowym PROFILU i utyka (1000 zł stało tydzień poza kampanią).
-- L5: płatności ręczne wybiera się przy PIERWSZEJ konfiguracji płatności konta — później nie da się
--   przełączyć z automatycznych na ręczne.
-- Idempotentny UPDATE po key (bez zmian schematu).

update wf2_step_defs set instructions_md =
'Zasil swoje konto reklamowe budżetem startowym 1000 zł (500 zł na testy 3 produktów + 500 zł na skalowanie zwycięzców). ZALECAMY PŁATNOŚCI RĘCZNE (prepaid, doładowanie z góry: BLIK/przelew/PayU). WAŻNE: PŁATNOŚCI RĘCZNE wybierasz przy PIERWSZEJ konfiguracji płatności konta — później nie da się już przełączyć z automatycznych na ręczne, więc ustaw to od razu. Metodę dodasz w Menedżerze reklam → Ustawienia płatności. Doładuj 1000 zł ZAWSZE z poziomu Ustawień płatności TEGO KONKRETNEGO konta reklamowego. UNIKAJ ogólnego przelewu na Facebooka: wpłata przelewem trafia na ogólne saldo rozliczeniowe Twojego profilu, a nie na konkretne konto reklamowe kampanii — i potrafi „utknąć" poza reklamami (incydent: 1000 zł stało tydzień poza kampanią). Środki muszą być widoczne na koncie w Menedżerze reklam. Karta jest możliwa jako alternatywa (Meta pobiera koszty na bieżąco), ale domyślnie idziemy w płatności ręczne. Limit wydatków konta (bezpiecznik) ustawimy my przez API po WF2_META_TOKEN — nie musisz nic konfigurować.'
where key = 'ads_budzet';
