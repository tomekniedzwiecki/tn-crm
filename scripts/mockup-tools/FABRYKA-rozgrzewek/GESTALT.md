# GESTALT (F7.4) — Rozgrzewek · naprawa OSADZENIA hero

**Data:** 2026-07-23
**Kontekst:** naprawa audytu 23.07 „ożywiona pocztówka" — hero było sceną w zaokrąglonym
boxie z cieniem obok kolumny tekstu (`.hr-wrap` grid 46/54, `.hr-scene` border-radius + box-shadow).
Przebudowa na kanon **mata** (STANDARD F1.7c pkt 2 OSADZENIE): scena = TŁO strony full-bleed
`position:absolute; inset:0` POD treścią, scrim gradientowy w tokenie `--paper #FAF3EF`, treść NA scenie.

**Decyzja scena/pętla:** REUSE. Tło sceny (ciepły kremowo-beżowy) harmonizuje 1:1 z tokenem
`--paper #FAF3EF`; nośniki ruchu (para z kubka, poświata lampy, świecące kulki u podstawy)
po prawej/centralnie — z dala od kolumny copy po lewej. Pętla `video/hero-loop-pp-v3.mp4`
(amplituda 7.75, zaakceptowana przez Tomka) reused; regeneracja groziłaby ponownym zepsuciem
wierności wyświetlacza „9" (pułapka LL-060: v2 miał 8.97 amplitudy ale display zmienił kolor = FAIL).
Zero nowej generacji → budżet $0, HOME bez zmian (ten sam plik pętli).

**Viewporty audytu (świeży agent visual-verify, nie znał zmian):** desktop 1440 + 1920, mobile 390,
hero z GRAJĄCĄ pętlą (readyState 4, `on=true`, currentTime rośnie 1.29→3.70; ruch realny),
pełny scroll wszystkich sekcji, #zamow.

## Werdykt: **GESTALT: CZYSTY**
Brak zgrzytów blokujących. Hero w pełni INTEGRALNE — scena to żywe TŁO 1. ekranu (kanon mata),
nie pocztówka: potwierdzone `border-radius:0`, `box-shadow:none`, `border:none`, szerokość = pełny
viewport (1425 przy 1440), start tuż pod przezroczystym headerem, brak jakiejkolwiek ramki/karty/cienia
oddzielającego scenę. Copy + karta ceny jako overlay po lewej na jaśniejszym fragmencie sceny.
Checkout (#zamow) spójny i poprawnie zbrandowany (ten sam header/tło/serif/łuk/niebieskie plakietki).

**Cytat-klucz:** „Scena to żywe TŁO pierwszego ekranu, nie pocztówka w ramce — para nad kubkiem
faluje, a u podstawy masażera pulsuje ciepła bursztynowa poświata; hero sprzedaje 'wieczorny
rytuał' zanim przeczytasz choć jedno słowo."

## Uwagi (wyłącznie kosmetyczne, NIE blokujące)
- Sekcja `zdjecia` (UGC): kadry surowsze niż packshoty — celowe i uczciwie zaramkowane
  („prawdziwe domowe kadry") → czyta się jako autentyczność.
- Mobile hero: poświata grzania u podstawy nasycona (mocny czerwono-pomarańczowy) — on-brand,
  na granicy intensywności, akceptowalne.
- Checkout: krótki flash pre-hydration (Dostawa —/Razem 84,90 → 9,99/94,89) — nie wada layoutu.

**Dowody publish:** `platform-sync publish` → https://ulepszek.pl/rozgrzewek HTTP 200 · 207511 B ·
runtime product_id w HTML: TAK · noindex ZDJĘTY · published-gate 0 FAIL.
