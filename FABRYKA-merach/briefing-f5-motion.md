# BRIEF F5 — CHOREOGRAF RUCHU „Brzuszek" (MOTION-DNA + spec per sekcja)

Jesteś senior motion designerem landingów direct-response (mobile ~90%, zimny ruch TikTok/
Reels). Landing „Brzuszek" (składana maszyna do ćwiczeń brzucha, 429 zł) jest OPUBLIKOWANY
i statycznie kompletny (https://ulepszek.pl/brzuszek). Zaprojektuj warstwę życia strony:
MOTION-DNA + spec animacji per sekcja tak konkretny, że koder wdroży bez decyzji twórczych.
NIE piszesz kodu — piszesz partyturę ruchu (wartości, easingi, triggery).

## PARTYTURA WIZUALNA LANDINGU (kontekst — nie zmieniaj)
- Fonty: Archivo Expanded (display, szeroki plakatowy) + Figtree (text) · akcent #A21CAF
  (fuksja-fiolet) · świat: chłodna lila-mgła #F7F5FB/#F0ECF7, białe karty, radius 24/12.
- Sygnatura: „pasek powtórzeń" .reps — 5 segmentów, ostatni w akcencie (energia
  odhaczonej serii); swash = prosta kreska 3px pod jednym słowem nagłówka.
- Metafora ruchu (kierunek): SERIA POWTÓRZEŃ — rytmiczne, sprężyste „odhaczanie";
  ruch pewny i energiczny, ale domowy (nie siłownia, nie neon-gym).

## SEKCJE (kolejność; stan po F7.1 — dopasowane do makiet)
1. hero — desktop: obraz full-bleed + pływająca karta oferty po lewej (cena/CTA);
   mobile: stack scena→karta. Sticky-buy@1 po opuszczeniu hero (IO na .hero — DZIAŁA;
   dopieścić timing). UWAGA: elementy hero mają klasę .reveal z transform:none!important
   w pewnych stanach — spec musi unikać konfliktu (full-bleed przez calc, nie transform).
2. problem — czysto kodowa: nagłówek + 3 karty kontrastu METOD (ikony ink, wyrównane
   do lewej) + most.
3. jak-cwiczysz — TOR-I sticky-stage: scena na lawendowym gradiencie + 3 kroki
   (DZIAŁA z F4 — zaprojektuj przejścia stanów + mikrofeedback; wymóg TEST STANÓW
   SSIM <0.9 między stanami).
4. regulacja — obraz profilu + DUŻE liczby „5 / 2" (count-up kandydat) + toggle
   Łagodniej/Trudniej (DZIAŁA — dopieścić przejście).
5. wideo — rail 3 kafle 9:16 z realnym UGC (video autoplay w viewport? NIE — klipy
   z dźwiękiem po tapnięciu; zaprojektuj wejście kafli + stan hover/tap play).
6. wiele-partii — kafle 2×2 (4 partie: brzuch/talia-pośladki/ramiona/nogi).
7. wytrzymalosc — scena + liczba „≈200 kg" (count-up kandydat) + karty ABS/poprzeczki.
8. mid-cta — karta z białym boxem packshotu + cena + CTA + pigułki ryzyka.
9. skladanie — dyptyk rozłożona/złożona (realne UGC „zdjęcie od kupującego") + zawleczka.
10. zamow — checkout-inline@2 (kroki; logika NIETYKALNA). ⛔ zero animacji utrudniających
    formularz; tylko subtelne wejście sekcji + mikrofeedback submitu.
11. final — accordion FAQ 9 pytań (1-kolumna, pierwszy otwarty) + panel liczb 5·2·≈200 kg
    + cena + CTA.

## CO MASZ ZWRÓCIĆ (markdown, dokładnie te nagłówki — wzorzec: FABRYKA-taca/MOTION-DNA.md)
1. `## MOTION-DNA` — osobowość ruchu w 5 zdaniach (metafora serii powtórzeń → ruch)
   + TABELA TOKENÓW: --dur-xs/s/m/l (ms), easingi (cubic-bezier; sprężystość TYLKO
   kontrolki+sticky), dystanse wejść, stagger, progi IO, reguła 1 akcentu na viewport.
2. `## SPEC PER SEKCJA` — dla KAŻDEJ z 11: trigger, wejście (co/skąd/ile/easing/stagger),
   mikrointerakcje, czego NIE animować i czemu. TOR-I (3, 4): przejścia stanów + feedback
   + TEST STANÓW. Sekcja 1: uwzględnij ograniczenie .reveal/transform (wejścia hero przez
   opacity/clip-path zamiast translate, jeśli trzeba).
3. `## ZESTAW OBOWIĄZKOWY` — scroll-reveal (stagger), count-up (które liczby: 5/2 i ≈200 kg
   — format „≈200 kg" z prefiksem; kiedy start, ile trwa, reduced-motion), sticky-buy
   slide-in (timing/easing/kiedy znika — też przy #zamow).
4. `## MIKROINTERAKCJE CTA/KART` — przyciski/karty/kafle wideo/pola formularza; wartości.
5. `## INTERAKTYWNE DEMO KORZYŚCI` — oceń: stepper jak-cwiczysz + toggle regulacji
   + count-upy wystarczają? (filtr sensu; bez nowych treści/grafik).
6. `## REDUCED-MOTION I BUDŻET` — prefers-reduced-motion (pełna treść bez ruchu);
   transform/opacity only; will-change dyscyplina; 55–60 fps; CLS=0 (rezerwacje miejsca).
7. `## TEST-PLAN` — lista kontrolna 1280+390: stany TOR-I (SSIM<0.9), reveal-audyt,
   count-upy, sticky, konsola, h-scroll, CLS, fps, reduced-motion, LL-052 (CTA→.zc-form).

## TWARDE OGRANICZENIA
Vanilla CSS/JS + IntersectionObserver; ZERO bibliotek/scroll-jackingu/parallaxu łamiącego
CLS; treść i layout NIETYKALNE (Z2 + F7.1 świeżo dopasowane!); checkout logika NIETYKALNA;
sygnatura .reps może dostać JEDNĄ animację „odhaczenia" segmentów przy wejściu w viewport
(kandydat na akcent sekcji) — zaprojektuj ją konkretnie. Każda animacja ma powód. Pisz
konkretnie, wartości liczbowe wszędzie, bez lania wody.
