-- Etap 4 „Środowisko reklamowe" — przebudowa treści pod tor Leadsie (21.07.2026).
-- Aktualizuje instructions_md 5 kroków ads_* (UPDATE po key = idempotentne; brak zmian schematu).
-- SSOT modułu: docs/zbuduje/ADS-ONBOARDING-LEADSIE.md.
-- Kroki client (ads_konto/ads_strona/ads_budzet) = język klienta; kroki admin
-- (ads_pixel/ads_preflight) = instrukcja techniczna dla panelu (instructions_md nie idzie do portalu).

update wf2_step_defs set instructions_md =
'Kliknij „Połącz konta reklamowe" w swoim portalu i przejdź krótki kreator (logowanie Facebookiem). Jeśli nie masz jeszcze konta firmowego ani reklamowego — kreator utworzy je za Ciebie i od razu nada nam dostęp do wspólnej pracy. Po drodze poprosi Cię o dodanie metody płatności do konta reklamowego. Włącz też weryfikację dwuetapową na swoim profilu. Przygotuj dokumenty firmy (NIP, wpis CEIDG) — Meta czasem prosi o weryfikację i wtedy liczy się czas.'
where key = 'ads_konto';

update wf2_step_defs set instructions_md =
'Stronę firmy na Facebooku utworzysz w tym samym kreatorze „Połącz konta" — poprowadzi Cię krok po kroku, a my od razu dostaniemy do niej dostęp. Potem uzupełnij: logo i zdjęcie w tle (dostaniesz od nas), sekcję „Informacje" z danymi firmy i linkiem do sklepu oraz 3–6 postów (materiały podeślemy). Instagram jest opcjonalny na start — reklamy na Instagramie działają z Twojej strony na Facebooku. Nie kupuj lajków — kilka rzetelnych postów wystarczy.'
where key = 'ads_strona';

update wf2_step_defs set instructions_md =
'Zasil swoje konto reklamowe (przy płatnościach ręcznych: BLIK / przelew / PayU; przy karcie dodaj też zapasową). Budżet projektu: 1000 zł = 500 zł na testy 3 produktów + 500 zł na skalowanie zwycięzców. Środki muszą być widoczne na koncie w Menedżerze reklam. Limit wydatków konta (bezpiecznik) ustawimy my — nie musisz nic konfigurować.'
where key = 'ads_budzet';

update wf2_step_defs set instructions_md =
'Automat fabryki: pixel na koncie klienta (POST /act_*/adspixels, WF2_META_TOKEN) → weryfikacja domen TXT (wfa-domain dns_set) → RĘCZNIE 30 s: token CAPI w Events Managerze (wąski per-pixel, NIGDY master) → set_integration {pixelId, apiKey} (platforma emituje Purchase server-side — potwierdzone 21.07) → Purchase testowy + dedup event_id w Events Managerze. pixel_id zapisz też w wf2_projects.pixel_id (strażnik audytuje rozjazd).'
where key = 'ads_pixel';

update wf2_step_defs set instructions_md =
'Bramka 0 braków przed kampaniami. Automaty po WF2_META_TOKEN: mikro-wydatek schodzi, Account Quality, limit konta. Ręcznie: blocklista komentarzy PL na stronę (ADS-BLOCKLISTA-PL.md), naming [WF2:klient] + utm_id={{ad.id}}, plan struktury 1 kampania = 1 produkt = 1 ad set (ABO, broad, Advantage+). Warunek wejścia: Leadsie konto+strona Connected + token aktywny.'
where key = 'ads_preflight';
