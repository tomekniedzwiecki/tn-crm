# GESTALT.md — UGNIATEK (F7.4, audyt naprawczy hero)

- **Data:** 2026-07-23
- **URL live:** https://zaradek.pl/ugniatek
- **Viewporty:** desktop 1440, desktop 1920, mobile 390 (świeże screenshoty, cache-bust ?v=)
- **Recenzent:** główna sesja (własne screenshoty chrome-devtools, izolowany kontekst; werdykt dziecka nie wraca do rodzica — gestalt zrobiony osobiście wg polecenia koordynatora)
- **Kontekst:** hero był DIPTYK (dwa osobne kadry L+wideo / P-statyczny, pół martwe, data-mo="dyptyk"). Naprawa: JEDEN kadr full-bleed osadzony w TLE (kanon mata) + pętla i2v.

## Co sprawdzono (żywa strona, nie makieta)
- Pętla hero GRA na 1440/1920/390: `#hero .hr-scene-vid video` — paused=false, klasa `.on`, currentTime rośnie, src=hero-loop-tlo.mp4. Ruch = ugniatanie karku (masażer sunie po karku/trapezie, głowa się unosi).
- Brak h-scroll na żadnym viewportcie (scrollWidth <= innerWidth).
- 11 sekcji obecnych: hero, dwie-formy, anatomia, sterowanie, wieczorem, wideo, mid-cta, zestaw, zamow, faq, final. 23 obrazy, 0 zepsutych.
- #zamow: root zc-checkout, realny wielokrokowy formularz (Kontakt/Adres/Dostawa/Płatność), fallback "chwilowo niedostępne" NIE pokazany; cena 189,00 zł → Razem 198,99 zł; miniatura produktu; BLIK/Visa/MC/za pobraniem.
- Mobile: pas sceny (band ~388px, 46svh) z grającą pętlą, produkt w kadrze (object-position 66% 42%), treść na papierze pod spodem — bez tekstu na kadrze.

## Werdykt gestalt (5 pytań STANDARD F7.4)
1. **Skończona i spójna?** TAK — spójne tokeny (petrol #0B6B64 / porcelanowa szarość #EEF1F2), spójna typografia i język kart, 0 zepsutych obrazów; czyta się jak jedna praca projektanta.
2. **Hero robi wrażenie i INTEGRALNE (mata, nie pocztówka)?** TAK — scena jest TŁEM 1. ekranu (position:absolute inset:0), zero ramki/radius/box-shadow oddzielających; pętla gra, produkt wierny packshotowi (owal satyna-srebro, 6 czarnych głowic 2×3, panel centralny, wyświetlacz P3, dwa uchwyty chwycone oburącz), copy na gradientowym scrimie w papierze po lewej. Na 1920 szczególnie mocne. To jednoznacznie "mata".
3. **Kasa częścią strony?** TAK — #zamow w tokenach strony, realny formularz, poprawna cena/miniatura.
4. **Co zgrzyta?** Brak blokerów. Drobiazg: frosted karta oferty + pille są jasne-na-jasnym na bladym scrimie (kontrast niski, ale czytelne dzięki obwódkom + cieniom) — świadome, pasuje do przewiewnej estetyki. Mikro-wobble glifu na bocznym wyświetlaczu w najgłębszej klatce pętli — niewidoczny w skali hero.
5. **Kupiłbyś?** TAK — hero od razu komunikuje produkt i sposób użycia (docisk do karku), cena jasna, kasa budzi zaufanie (BLIK/karta/pobranie, 14 dni zwrot).

## WERDYKT (HERO — zakres zlecenia): GESTALT PASS
Czysto — bez zgrzytu wymagającego naprawy. Zostawiamy.

## Dowody produkcyjne
- Scena (gpt-image-2, 3:2, product-ref packshot-final): sc-hero-tlo.webp — wierność > poprzedniego live hero-L (który zdryfował do kwadratowej płyty).
- i2v Kling v2.1 PRO: AMPLITUDA diff(0↔2.5s)=10.66 | diff(0↔5s)=13.08 (próg ≥8.0; wzorzec-dobry Brzuszek-crunch 11.9) = PASS. Inspekcja klatek 0/2.5/5: ruch REALNY (translacja masażera po karku), produkt rigid, dłonie bez morfingu, twarz nie pojawia się — NIE fałszywy diff z przebarwień (lekcja Rozgrzewek v2 8.97).
- Ping-pong (first=last). Upload pod nowymi nazwami -tlo. Publish HTTP 200, published-gate 0 FAIL, noindex zdjęty (domena custom zaradek.pl).


## Audyt CAŁOŚCIOWY (drugi, świeży recenzent — headless Playwright, izolowany kontekst)
Niezależny agent visual-verify obejrzał CAŁĄ żywą stronę (1440/1920/390, pełny scroll, konsola 0 błędów, autoplay hero potwierdzony). **Werdykt hero identyczny z moim: PASS ("mata", nie pocztówka; pętla realnie gra — zmiana pozycji masażera między klatkami).** Dodatkowo, przy pełnym scrollu, wychwycił ZGRZYTY POZA HERO — PRE-ISTNIEJĄCE, niezwiązane z naprawą hero (poza zakresem tego zlecenia "napraw hero"), zgłoszone do triażu głównej sesji:

1. **#wideo "W akcji" (WYSOKI — brand/kategoria):** klipy TikTok pokazują INNE produkty — karta 1 (@jierebyqcwi) = czarny masażer z WIDOCZNĄ OBCĄ MARKĄ "KAJUE" na obudowie; karta 2 (@seaurchin) = zielony pistolet powięziowy ("fascia gun"); karta 4 = czarny pistolet perkusyjny. Żaden to nie płaski owal Ugniatek. Marka konkurencji + zła kategoria na własnej stronie sprzedażowej. → wymaga podmiany klipów na realne UGC Ugniatka (osobny workstream, NIE hero).
2. **#final (render środkowy):** callout "6 kulowych głowic" nachodzi na produkt jak zgubiony tooltip (desktop + mobile).
3. **#anatomia:** niespójność danych — desktop "22 081 … do mm²" (rozjechany podpis) vs mobile "powierzchnia robocza do 22 300 mm²".
4. **#sterowanie (desktop, kosmetyka):** "Akumulator 1 973 mAh" dotyka prawej krawędzi karty.

## Reconciliacja i zakres
- **HERO = PASS** (dwie niezależne recenzje zgodne). Deliverable zlecenia ("napraw hero") DOSTARCZONY i czysty — sam hero nie wymaga już nic.
- Zgrzyty 1–4 są POZA hero i PRE-ISTNIEJĄCE (nie wprowadzone moją zmianą). Zgodnie z zakresem ("Napraw hero"; commit TYLKO ścieżek hero; #zamow nietykalny) NIE naprawiam ich w tej sesji — FLAGuję głównej sesji. Priorytet: #wideo (marka konkurencji KAJUE).
