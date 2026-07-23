# BRIEF F5 — CHOREOGRAF RUCHU „Rozgrzewek" (MOTION-DNA + spec per sekcja)

Jesteś senior motion designerem landingów direct-response (mobile ~90%, zimny ruch TikTok/
Reels). Landing „Rozgrzewek" (podgrzewany masażer gua sha, 84,90 zł — zakup impulsowy,
mały rytuał wieczorny) jest OPUBLIKOWANY (https://ulepszek.pl/rozgrzewek). Zaprojektuj
warstwę życia: MOTION-DNA + spec per sekcja tak konkretny, że koder wdroży bez decyzji
twórczych. NIE piszesz kodu — piszesz partyturę ruchu.

## PARTYTURA WIZUALNA LANDINGU (kontekst — nie zmieniaj)
- Fonty: Fraunces (miękki charakterny serif display) + Work Sans (text) · akcent #2E46C8
  (królewski indygo z produktu) · świat: ciepła muszla-brzoskwinia #FAF3EF/#F3E9E3,
  białe karty, radius 18/10 · cienie ciepłe.
- Sygnatura: „kręgi ciepła" — 2-3 koncentryczne łuki przy eyebrow (zewnętrzny w indygo)
  + duża liczba „9" (poziomy intensywności).
- Metafora ruchu (kierunek): ROZGRZEWANIE / PROMIENIOWANIE CIEPŁA — ruch miękki, powolny,
  falujący od środka na zewnątrz (jak ciepło rozchodzące się po karku); wieczorny spokój,
  zero nerwowości, zero tech. Kontra do „serii powtórzeń" Brzuszka i „odmrażania" Rozmrozika.

## SEKCJE (kolejność; stan po F4)
1. hero — archetyp D: packshot centralny na polu koloru, copy i cena POD nim; 3 hooki ?h=.
   Sticky-buy@1 po opuszczeniu hero (IO .hero) + drugi IO na #zamow (chowa pasek).
2. moment — scena: kobieta wieczorem z masażerem na ramieniu; hak napięcia werbalny
   w 1. zdaniu body.
3. tryby — TOR-I: 3 zakładki Ciepło/Wibracje/EMS; aktywna zakładka ink; DOKŁADNIE 1 dioda
   zapalona per tryb (czerwona/niebieska/zielona) — DZIAŁA z F4; zaprojektuj przejścia
   stanów + mikrofeedback + TEST STANÓW (SSIM <0.9).
4. glowica — makro głowicy (crop z g0) + H2 „Stalowe kulki w koncentrycznych
   pierścieniach." — ⛔ BEZ count-upu i BEZ dużej cyfry „21" (decyzja F3A — NIE proponuj!).
   Kandydat na akcent: animacja SYGNATURY kręgów (łuki rysujące się/pulsujące raz).
5. obszary — 4 kadry (kark/ramiona/plecy/uda) w mozaice.
6. autonomia — 4 karty (ładowanie ~3 h, praca ~50 min, timer ok. 30 min, ABS/TPR+CE/RoHS).
   Liczby z „ok./~" — count-up NIEWSKAZANY dla przybliżeń? Rozstrzygnij (uczciwość:
   count-up sugeruje precyzję; może liczba „9" w innej sekcji to jedyny count-up).
7. zdjecia-kupujacych — 3 kafle realnych UGC.
8. mid-cta — packshot + cena 84,90 zł + CTA + pigułki ryzyka.
9. faq — akordeon 8 pytań (pierwszy otwarty).
10. zamow — checkout-inline@2 (WŁASNA sekcja #zamow; logika NIETYKALNA) — tylko subtelne
    wejście + mikrofeedback submitu.
11. final — ciepły domowy kadr + ostatnie CTA + footer.

## CO MASZ ZWRÓCIĆ (markdown, dokładnie te nagłówki — wzorzec: FABRYKA-taca/MOTION-DNA.md)
1. `## MOTION-DNA` — osobowość ruchu w 5 zdaniach (promieniowanie ciepła → ruch) + TABELA
   TOKENÓW: --dur-xs/s/m/l (ms; wolniejsze niż typowo? uzasadnij), easingi cubic-bezier,
   dystanse wejść, stagger, progi IO, reguła 1 akcentu na viewport.
2. `## SPEC PER SEKCJA` — dla KAŻDEJ z 11: trigger, wejście, mikrointerakcje, czego NIE
   animować. TOR-I (3): przejścia stanów diod/zakładek + TEST STANÓW. Sekcja 4: konkretny
   spec animacji kręgów ciepła (SVG stroke-dashoffset? skala+opacity? — wybierz i podaj
   wartości; produkt/zdjęcie STATYCZNE).
3. `## ZESTAW OBOWIĄZKOWY` — scroll-reveal (stagger), count-up (rozstrzygnij KTÓRE liczby
   — „9" tak/nie; przybliżenia „ok." NIE — uzasadnij), sticky-buy slide-in (+ chowanie
   przy #zamow).
4. `## MIKROINTERAKCJE CTA/KART` — przyciski/karty/kafle UGC/pola formularza; wartości.
5. `## INTERAKTYWNE DEMO KORZYŚCI` — oceń: TOR-I trybów + animacja kręgów wystarczą?
   (bez nowych treści/grafik).
6. `## REDUCED-MOTION I BUDŻET` — prefers-reduced-motion; transform/opacity only;
   will-change; 55–60 fps; CLS=0.
7. `## TEST-PLAN` — checklist 1280+390: stany TOR-I (SSIM<0.9), reveal-audyt, count-upy
   (jeśli są), sticky (pojawia/chowa), konsola, h-scroll, CLS, fps, reduced-motion,
   LL-052 (CTA→.zc-form).

## TWARDE OGRANICZENIA
Vanilla CSS/JS + IntersectionObserver; ZERO bibliotek/scroll-jackingu/parallaxu; treść
i layout NIETYKALNE; checkout logika NIETYKALNA; ⛔ count-up „21"; każda animacja ma powód
(prowadzi do oferty albo wyjaśnia produkt). Pisz konkretnie, wartości liczbowe wszędzie.
