# BRIEF F5 — CHOREOGRAF RUCHU „Rozmrozik" (MOTION-DNA + spec per sekcja)

Jesteś senior motion designerem landingów direct-response (mobile ~90%, zimny ruch TikTok/Reels).
Landing „Rozmrozik" (taca do rozmrażania, 289 zł) jest OPUBLIKOWANY i statycznie kompletny
(https://ulepszek.pl/rozmrozik). Twoim zadaniem jest ZAPROJEKTOWAĆ warstwę życia strony:
MOTION-DNA + spec animacji per sekcja, tak konkretny, że koder wdroży go bez żadnej decyzji
twórczej. NIE piszesz kodu produkcyjnego — piszesz partyturę ruchu (wartości, easingi, triggery).

## PARTYTURA WIZUALNA LANDINGU (kontekst — nie zmieniaj)
- Fonty: Zilla Slab (display) + Instrument Sans (text) · akcent #E8590C (pomarańcz „ciepła")
  · świat: lodowy błękit #F2F7FA → ciepła kuchnia; archetyp hero F (dyptyk zamrożone|rozmrożone).
- Sygnatura: „thaw-line" — linia przejścia zimno→ciepło; DUŻA liczba 4,2 L.
- Metafora ruchu (kierunek): ODMRAŻANIE — elementy „budzą się" z chłodu do ciepła; ruch spokojny,
  cieczowo-miękki, bez nerwowości; landing kuchenny, nie tech.

## SEKCJE (kolejność na stronie; id = id manifestu)
1. hero — dyptyk zamrożone|rozmrożone + karta oferty (cena/CTA); sticky-buy@1 pojawia się po
   opuszczeniu hero (IntersectionObserver na .hero — JUŻ DZIAŁA, dopieść tylko timing/easing).
2. problem — scena 16:30 z mikrofalą + 2 kolumny kart (ikona nad tekstem).
3. jak-dziala — TOR-I stepper 3 stanów: połóż → przykryj → dotknij (JUŻ DZIAŁA z F4 —
   NIE przebudowywać mechaniki; zaprojektuj przejścia między stanami + mikrofeedback kliknięć).
4. pojemnosc — scena + DUŻA liczba **4,2 L** (count-up obowiązkowy; locale pl: przecinek,
   „4,2 L"), obok konkrety „4 steki / 4 porcje ryby", tacka ociekowa.
5. funkcje — karty funkcji (materiały, panel, USB-C, plazma, UVC) + toggle crossfade
   (JUŻ DZIAŁA — tylko dopieszczenie przejścia).
6. wideo — wideo-rail@1: 5 kafli 9:16 (desktop grid 5×1fr; mobile peek 68%).
7. mid-cta — powtórka oferty: cena → CTA → redukcja ryzyka.
8. faq — akordeon faq-accordion@1 (JUŻ DZIAŁA — zaprojektuj tylko easing rozwijania + chevron).
9. zamow — checkout-inline@2 (formularz z krokami). ⛔ ZERO animacji utrudniających
   wypełnianie; dozwolone tylko subtelne wejście sekcji i mikrofeedback przycisku submit.
10. final — scena zamykająca full-bleed + ostatnie CTA.

## CO MASZ ZWRÓCIĆ (markdown, dokładnie te nagłówki)
1. `## MOTION-DNA` — osobowość ruchu w 5 zdaniach (jak metafora odmrażania przekłada się na
   ruch) + TABELA TOKENÓW: --dur-xs/s/m/l (ms), --ease-out/-in-out/-spring (cubic-bezier),
   dystanse wejść (px), stagger (ms), próg IO (0.xx), reguła „1 akcent ruchu na viewport".
2. `## SPEC PER SEKCJA` — dla KAŻDEJ z 10 sekcji: trigger (IO próg / scroll / click), wejście
   (co, skąd, ile ms, jaki easing, stagger czego), mikrointerakcje (hover/focus/tap), czego NIE
   animować i dlaczego. Sekcje TOR-I (3, 5): przejścia stanów + feedback kontrolek + wymóg
   TEST STANÓW (screenshot każdego stanu, SSIM między stanami <0.9 = stany wizualnie różne).
3. `## ZESTAW OBOWIĄZKOWY` — scroll-reveal (stagger), count-up 4,2 L (kiedy startuje, ile trwa,
   jak formatowany, co po reduced-motion), sticky-buy slide-in (timing, easing, kiedy znika).
4. `## MIKROINTERAKCJE CTA/KART` — przyciski (hover/active/focus-visible), karty, kafle wideo,
   pola formularza (focus) — wartości konkretne (skala, cień, ms).
5. `## INTERAKTYWNE DEMO KORZYŚCI` — oceń: stepper jak-dziala + toggle funkcji + count-up
   pojemności WYSTARCZAJĄ jako demo korzyści (filtr sensu), czy trzeba dodać JEDNĄ małą
   interakcję (jeśli tak: co dokładnie, gdzie, jak — bez nowych treści i bez nowych grafik).
6. `## REDUCED-MOTION I BUDŻET` — prefers-reduced-motion: pełna treść widoczna bez animacji
   (co dokładnie się dzieje); budżet: transform/opacity ONLY, zero animacji layoutu, will-change
   dyscyplina, 55–60 fps, CLS=0 (jak spec to gwarantuje — np. rezerwacja miejsca sticky).
7. `## TEST-PLAN` — lista kontrolna dla wdrożenia: co sprawdzić na 1280 i 390 (stany TOR-I,
   SSIM, konsola, h-scroll, CLS, fps przy scrollu).

## TWARDE OGRANICZENIA
- Vanilla CSS/JS + IntersectionObserver; ZERO bibliotek, ZERO scroll-jackingu, ZERO parallaxu
  łamiącego CLS; treść i layout NIETYKALNE (Z2 — makieta święta); checkout: logika NIETYKALNA.
- Spec pisz na poziomie RÓL elementów (nagłówek sekcji / karty / media / kontrolki) — koder
  zmapuje na klasy (prefiksy per sekcja istnieją w kodzie).
- Każda animacja MA POWÓD (prowadzi wzrok do oferty albo wyjaśnia produkt) — żadnych ozdobników.
- Pisz konkretnie, wartości liczbowe wszędzie, bez lania wody.
