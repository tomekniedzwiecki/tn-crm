# GESTALT.md — SKROLIK (F7.4, audyt naprawczy hero)

- **Data:** 2026-07-23
- **URL live:** https://zaradek.pl/skrolik
- **Viewporty:** desktop 1440, desktop 1920, mobile 390 (świeże screenshoty, cache-bust ?v=, izolowany kontekst przeglądarki)
- **Recenzent:** główna sesja (własne screenshoty chrome-devtools; werdykt dziecka nie propaguje się do rodzica — gestalt zrobiony osobiście wg polecenia koordynatora)
- **Kontekst:** hero był "ożywioną pocztówką" (.hr-media w ramce radius+box-shadow, split 52/48 obok tekstu). Naprawa: JEDEN kadr full-bleed osadzony w TLE (kanon mata) + pętla i2v.
- **Ocena reuse-vs-new (uczciwa, vision):** istniejąca scena sc-hero.webp = PORTRAIT (1024×1536), kompozycja pod kartę (telefon po lewej / dłoń z pierścieniem po prawej — obie strony niosą treść, ZERO czystej strefy negative-space na copy). Nie nadaje się do full-bleed z nakładką copy → NOWA scena landscape 3:2 z lewym negative-space.

## Co sprawdzono (żywa strona)
- Pętla hero GRA na 1440/1920/390: `#hero .hr-scene-vid video` — paused=false, klasa `.on`, currentTime rośnie, src=hero-loop-tlo.mp4. Ruch = feed na ekranie telefonu przewija się pionowo (kafle zdjęć → portrety) + klik kciukiem. To DZIAŁANIE produktu (przewijanie), nie ambient.
- Brak h-scroll na żadnym viewportcie.
- 11 sekcji: hero, demo, ekran-zostaje, ebooki, selfie, kolory, wideo, mid-cta, zamow, faq, final. 19 obrazów; jedyny "broken" = ukryty placeholder lightboxa `<img id=lb-img>` w #kolory (0×0, wypełniany po kliknięciu) — NIE defekt.
- #zamow: realny wielokrokowy formularz (Kontakt/Adres/Dostawa/Płatność) + karta produktu (packshot różowego pierścienia, "Skrolik — pierścień do przewijania", 34,90 zł malina); fallback "chwilowo niedostępne" NIE pokazany.
- #demo: interaktywny mock "Naciśnij i patrz, jak ekran sam przewija" — spójny, płynne przejście z hero.
- Mobile: pas sceny (band ~388px) z grającą pętlą (telefon+pierścień w kadrze), treść na papierze pod spodem — bez tekstu na kadrze.

## Werdykt gestalt (5 pytań STANDARD F7.4) — HERO (zakres zlecenia)
1. **Skończona i spójna?** TAK — spójne tokeny (malina #B4265C / ciepła róż #F8F1F0), spójna typografia, kohezyjne karty.
2. **Hero robi wrażenie i INTEGRALNE (mata, nie pocztówka)?** TAK — scena = TŁO 1. ekranu (position:absolute inset:0), zero ramki/radius/box-shadow; pętla gra (feed przewija się = sedno produktu), pierścień wierny (róż, 2 trójkątne przyciski + boczny), copy na scrimie papieru po lewej. Wyraźny skok jakości względem dawnej pocztówki w ramce.
3. **Kasa częścią strony?** TAK — #zamow w tokenach strony, realny formularz, cena 34,90 zł, karta produktu.
4. **Co zgrzyta?** Brak blokerów. Drobiazgi: feed przewija do siatki generycznych twarzy stock w najgłębszej klatce (czyta się jako "scroll social feeda", akceptowalne); frosted karta oferty jasna-na-jasnym na bladym scrimie (kontrast niski, czytelne przez obwódki+cień).
5. **Kupiłbyś?** TAK — hero od razu pokazuje wartość (bezdotykowe przewijanie telefonu), cena w kasie jasna, kasa budząca zaufanie (BLIK/karta/pobranie, 14 dni zwrot).

## WERDYKT (HERO — zakres zlecenia): GESTALT PASS
Czysto — bez zgrzytu wymagającego naprawy. Sam hero nie wymaga już nic.

## FLAGA do triażu głównej sesji (POZA hero, pre-istniejące)
- **#wideo "Najpierw zobacz. Potem ustaw po swojemu."** — rail 3 klipów UGC (tt1/tt2/tt3.mp4). NIE udało się wizualnie zaudytować treści klipów z powodu "wojny o fokus" przeglądarki (równoległa sesja Brzuszka podbijała karty). Ten sam wzorzec UGC co Ugniatek, gdzie audyt wykrył OBCĄ MARKĘ ("KAJUE") i zły typ produktu → zalecany ręczny przegląd, czy klipy tt1-3 pokazują faktyczny różowy Skrolik, a nie inne pierścienie/produkty/marki. Poza zakresem "napraw hero".

## Dowody produkcyjne
- Scena (gpt-image-2, 3:2, ref=stary sc-hero.webp dla wierności pierścienia): sc-hero-tlo.webp — landscape z lewym negative-space, pierścień wierny.
- i2v Kling v2.1 PRO: AMPLITUDA diff(0↔2.5s)=6.31 | diff(0↔5s)=8.21 (próg ≥8.0) = PASS (marginalny, ale RUCH REALNY — feed przewija content pionowo; NIE fałszywy diff z przebarwień). Inspekcja klatek 0/2.5/5: pierścień + dłoń wierne, bez morfingu.
- Ping-pong (first=last). Upload pod nowymi nazwami -tlo. Publish HTTP 200, published-gate 0 FAIL, noindex zdjęty (domena custom).
