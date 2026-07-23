# LEDGER — Rozmrozik (Ulepszek / Patryk Skrzypniak) · projekt 448f2395 · produkt 60215ce4

## F0 (22.07 wieczór)
- Gate source=detail PASS (refresh 22.07). Kuracja galerii: keep TYLKO g0 (packshot);
  g1–g5 watermarki/brand KAYUSO (DANE/REF); **g6/g7 = INNY produkt (pasywna taca) — ODRZUT
  tożsamościowy**. Sekcje galeria+opinie = SKIP (stan danych).
- Marka Rozmrozik zarezerwowana (bud_brand_names f62436f3), slug=rozmrozik.
- Koszt: $0 (kuracja bez generacji).

## F1 + F1.7 (22.07 późny wieczór)
- PLAN.md: gpt-5.6-sol effort high (refy g0+g2), 1 call. Koszt ~$0.25 (szacunek usage).
- KRYTYK (Opus, świeże oczy): **PASS-Z-POPRAWKAMI** — 5 poprawek wdrożonych:
  (1) PLAN problem: produkt USUNIĘTY z kadru sceny; (2) PRZEWODNIK: twarde „no defrosting box
  anywhere in frame" w seedzie problemu (furtka „w tle" skasowana); (3) KARTA §5b Handel/
  Checkout dopisana (kotwica płatności/zwrotu); (4) PLAN dokończony (G-MID mobile, G-FINAL,
  crop-first, FUNKCJE KONWERSJI, RYZYKA); (5) ANIM #3 nośnik = heat-haze+ściereczka (nie 3× para).
- **DECYZJA WYKONAWCZA: sprzedajemy WYŁĄCZNIE wariant CZARNY** — wariant „white" bez
  jakiegokolwiek dowodu wizualnego w galerii detail (cała galeria pokazuje czarny; sprzedaż
  koloru bez zdjęcia = ryzyko niezgodności z zamówieniem). Checkout bez wyboru koloru; FAQ
  komunikuje wprost. Cena bez zmian (oba SKU $65.66).
- MANIFEST: 12 pozycji (10 build + galeria SKIP + opinie SKIP), rdzeń komplet.
- Archetyp F (dyptyk) · Zilla Slab/Instrument Sans · #E8590C · lodowy błękit — cross-landing
  5/5 osi vs skrolik (B/Gabarito/#B4265C/pudrowy róż).

## F2 + F2.5 (22.07 noc)
- Brand: top-1 skryptowy (serce+wok) ODRZUCONY rubryką pyt. 3 (food-trope, nie rozmrażanie);
  wybrany kandydat #2 „klosz+śnieżynka/para" (6×T PASS; najsłabsze: ramiona śnieżynki @16px).
  Kanał lokalny OpenAI 2×520 → generacje przez edge (wf2-gen).
- Makiety: 10 desktop (regen 04 — moduł leżał na płycie + kostki lodu; regen 06 — link
  w akcencie) + 10 mobile (0 regeneracji). Literówki pikselowe (08d „zadeklarrować",
  03m „przezroczystsą") ZOSTAJĄ — kod odtwarza copy z PLANU, nie z pikseli.
- KRYTYK F2 (Opus, komplet 20 + styl-master + kotwica skrolika): **PASS-Z-POPRAWKAMI,
  zero regeneracji**. Pyt. 7-11: mobile-od-zera TAK; cross-landing odróżnialny (uwaga
  na przyszłość: różnicować UKŁAD hero między landingami, nie tylko skórę); ANIM-3
  wykonalne bez przebudowy; anti-bleed czysto; CTA hero mobile w kadrze (najciaśniej).
- **DECYZJE POKRYTYKOWE → F4 (kod):** (1) swash ZAWSZE 1 słowo (05/07 miały 2);
  (2) karta USB-C BEZ zbliżenia portu — crop modułu fn-modul z crop-first (PASZPORT:
  port niewidoczny w źródle); (3) hero mobile: kolejność makiety zostaje (dyptyk→copy→CTA),
  realny viewport 390×844 wyższy niż kadr 2:3 → CTA w foldzie z zapasem + sticky-buy@1;
  weryfikacja w F7.1 na 390px.
- Koszty: F2.5 $0.85 (styl-master + 2×6 kandydatów brand) · F2 $1.39 (12 desktop + 10 mobile).
- lp_styl_marka done 8/8 · lp_makiety done 7/8 — kamień „AKCEPT MAKIET" zostawiony Tomkowi
  (retro-przegląd w panelu; fabryka jedzie dalej po krytyku — wzorzec Hoffa).

## F3 start (22.07 noc)
- Crop-first ($0): fn-modul/fn-panel/fn-plyta/fn-kopula (makra z g0) + packshot-alpha (806×538).
- scenes-gen.py: 9 scen HIGH lokalnym /v1/images/edits; refy = g0 (product) + crop sceny
  z ZAAKCEPTOWANEJ makiety (kompozycja); problem/hero-frozen BEZ packshotu w refach
  (EMOCJA↔PRODUKT) + twarde NEG „no defrosting box anywhere in frame".

## F3 domknięcie (23.07)
- 9/9 scen: 6/7 PASS 1. przejściem; sc-problem v2 (mikrofala wg makiety — kontrakt Z2);
  sc-hero-thawed v2 (perforacja koncentryczna OK) + v3 — SPÓR 2 par oczu o „zwis modułu"
  rozstrzygnięty wzorcem g0: realny produkt MA identyczny zwis tylnego końca ze stopką
  poza top kopuły; wymóg „zero overhang" był ponad-paszportowy → PASS. WIERNOSC.md +
  MAPA-ASSETOW.md. Wideo: 5/5 klipów TikTok self-host (tt1 hero @sam.shan.shops).
- Koszt F3: ~$3.00 (9 scen high + 3 regen). lp_grafiki done (force-kolejnosc — kamień
  AKCEPT makiet u Tomka).

## F4 (23.07)
- Szkielet-kontrakt od zera (tokeny, favicon data-URI, fonty latin-ext, runtime-snippet).
- 10 sekcji: briefy z copy VERBATIM PLANU + poprawki krytyka F2 (swash zawsze 1 słowo,
  karta USB-C = crop modułu bez portu) → gpt-5.6-sol medium → splice po markerach;
  0 obcych hexów, 0 resztkowych markerów.
- Montaż: checkout-inline@2 (steps; „Zamawiam z obowiązkiem zapłaty"), pay-badges ×2,
  wideo-rail@1 5 kafli (repeat(5,1fr) — anty-slivery), footer@1, sticky-buy@1, LL-052.
- SMOKE visual (Playwright 1280+390): PASS, 0 konsoli, 0 h-scroll; naprawione: final
  white-gap (img cover), spec-clip (flex-wrap), karty problemu (ikona nad tekstem).
- PUBLISH LL-038: https://ulepszek.pl/rozmrozik 200, runtime TAK, noindex zdjęty; kasa 200.
  **INCYDENT DOMENY:** cała domena 500 — aktywna była TYLKO www, storefront przekierowuje
  na apeks; fix = activate_domain(ulepszek.pl). Duplikat produktu na platformie (bez kasy)
  — do ręcznego skasowania w panelu merchanta (API partnera bez DELETE).
- Koszt F4: ~$1.50. lp_kod done.

## F5 spec + F6 wideo (23.07)
- **MOTION-DNA.md gotowy** (choreograf gpt-5.6-sol high; edge 504 → fallback lokalny; urwany
  na limicie 12k tokenów w sekcji reduced-motion → dokończony ręcznie zgodnie z tokenami:
  reduced-motion, budżet wydajności, TEST-PLAN 10 pozycji). Werdykt choreografa: stepper +
  toggle + count-up WYSTARCZAJĄ jako demo korzyści — nie dodajemy 4. interakcji.
  Wdrożenie F5 czeka na koniec F7.1 (index.html zajęty przez dopasowanie).
- **F6 ANIM-3 przez bud-fal-proxy (fal.ai, Kling v2.1)** — WIDEO DOSTĘPNE (saldo $71.89):
  - **hero-loop.mp4 PASS** (784×1176, 5 s): para z kubka + zasłona falują, produkt/jedzenie/
    patelnia idealnie statyczne (gate klatkowy 0/2,5/4,7 s).
  - **problem-loop.mp4 PASS**: para znad miski cyklicznie; dłoń/kuchnia statyczne.
  - **final-loop v1 FAIL** (kopuła zmorfowała w mleczną świecącą bryłę) → **v2 z twardym
    lockiem produktu FAIL** (gorzej: okrągła taca wewnątrz, otwór w kopule, zdublowane
    szczypce — Kling standard nie trzyma struktury przy tym kadrze) → **v3 na modelu PRO
    (cfg 0.7, ruch zawężony) = PASS**: produkt idealnie stabilny we wszystkich klatkach;
    uwaga niekrytyczna — dłoń ze szczypcami wykonuje naturalny gest (więcej ruchu niż
    „stays still", paszport nienaruszony).
  - **Montaż pętli: wersje ping-pong 10 s** (split+reverse+concat, crf 27, faststart,
    bez audio) + postery WebP z klatki 0: hero 486 KB · problem 695 KB · final 1179 KB;
    postery 55/64/94 KB — w budżecie wag. Do osadzenia w F6 używać *-pp.mp4 + poster.
  - Klipy: Storage bud-assets/rozmrozik/video/ + lokalnie FABRYKA-rozmrozik/video/.
    Klatki źródłowe (JPG ze scen) w video-factory/rozmrozik-anim/.
    Koszt fal: **$1.61** (3× standard + 1× pro + 1 nieudany standard; saldo 71.89→70.28).

## F5 życie + F6 hero-video + Naprawa 23.07 (wdrożenie w index.html)
- **F5 ŻYCIE (MOTION-DNA 1:1):** guard `.rmz-motion` (klasa startowa reveal TYLKO gdy JS +
  brak reduced-motion; head-script) — bez JS / reduced-motion strona w 100% czytelna; tokeny
  MOTION-DNA (ease-out/in-out/spring, dur-xs..l, enter-y 16/24); jeden współdzielony IO
  (once + will-change tylko na czas animacji, zdejmowany po transitionend); count-up „4,2 L"
  (locale pl, threshold 0.45, 1200 ms, ≤30 akt./s, tabular-nums, kończy DOKŁADNIE „4,2 L";
  reduced-motion = statyczne). Guard `display:contents` (pj-media na mobile) → add .in (brak
  boxa, IO nie obserwuje). Hero diptych BEZ reveal (ochrona LCP — MOTION-DNA: media dyptyku
  widoczne od 1. klatki). Sticky-buy: dual-gate hero+#zamow (chowany na checkoucie).
- **F6 HERO-VIDEO:** pętla `hero-loop-pp.mp4` (486 KB) wpięta JS-em w PRAWĄ połowę dyptyku
  (.hr-thaw-vid nad statycznym posterem sc-hero-thawed.webp; fade-in po 'playing'; IO
  play/pause; reduced-motion/save-data = sam poster). Lewa połowa (zamrożone) statyczna —
  kontrast zimno|ciepło. Zero CLS (aspect kontenera bez zmian). Klamra #zamow POMINIĘTA
  świadomie (ochrona czytelności checkoutu — opcjonalna w brief).
- **NAPRAWA 23.07 — błędna diagnoza F0 naprawiona:** „SKIP opinii/galeria" był błędem — materiał
  UGC LEŻAŁ w bud-reviews/1005011774118215/ (6 klatek). Dorobiona sekcja „zdjęcia od kupujących"
  (STANDARD §F1a, klasa dowodowa) po sekcji wideo (06), przed mid-cta. Vision-gate 6/6:
  PASS 5-0 (moduł czarny) + 2-0 (taca+perforacja top-down) + 4-0 (kabel USB-C); ODRZUT 0-0
  (wariant BIAŁY — sprzedajemy czarny), 1-0 (ściana brandu KAYUSO/warehouse), 3-1 (pudełko
  z claimem „PLASMA LOCK FRESHNESS"). Rehost 3 kadrów → bud-assets/rozmrozik/assets/ugc/
  ugc-{1,2,3}.webp (WebP q80, 11.9/15.7/9.6 KB; KAYUSO wycięty crop-em; ZERO ocen/liczb).
- **TEST-PLAN 10/10 PASS** (1280+390): TOR-I SSIM 0.41–0.62 (<0.9); reveal-audyt 0; count-up
  „4,2 L"; sticky bez CLS; hero-video gra (paused=false, oba viewporty) + poster przy
  reduced-motion; nowa sekcja renderuje; 0 konsoli; 0 h-scroll (rail wideo = kontrolowany
  overflow wewn.); CLS=0; LL-052 CTA→.zc-form; checkout NIETKNIĘTY (data-zc-api ×2, kasa 200).
  Dowody: FABRYKA-taca/zycie/.
- **PUBLISH:** platform-sync publish (⛔ bez ensure_product) → https://ulepszek.pl/rozmrozik
  HTTP 200, 205566 B, runtime product_id TAK, hero-loop-pp.mp4 w live HTML, data-zc-api ×2,
  noindex ZDJĘTY, kasa 200. Wypchnięte razem: 27 poprawek F7.1 + hotfix kasy + F5 + F6 + UGC.

## F8 FINISZ (23.07) — gate-check + manifest-check + naprawy
- **manifest-check.py = exit 0** (PASS=33 FAIL=0): 11/11 sekcji build↔`<section id>` (alias
  `zdjecia-kupujacych`→`zdjecia`), hero-video mp4 200, media dowodowe 200, JSON-LD bez Offer/Rating.
  Pozycja 10b parsuje się poprawnie — PLAN.md bez zmian.
- **gate-check przed:** PASS=81 FAIL=35 WARN=10. Naprawialne FAIL-e domknięte (patrz niżej).
- **Kod (detail-lint P1: 8→2):** (1) kontrast hero-CTA — `.btn.cta` 17→19 px = AA-large (biały na `#E8590C`
  3.58:1 przy progu 3:1); (2) crop hero ×2 + final → `object-position:50% 42%` (P1→P2, AR/hero-video nietknięte);
  (3) touch-targety `.jd-link` + link „Przejdź do zamówienia →" → `min-height:44px inline-flex`;
  (4) `<main id="main">` landmark; (5) leak marketplace `@aliexpress.us` → „Klient TikTok" (aria+data+etykieta).
  Rezydualne P1 (udokumentowane, NIE naprawiane): `.zc-fallback` kontrast 1:1 (strefa checkout, `hidden`);
  pojemnosc image-on-image (celowy crossfade TOR-I steki/ryba, MOTION-DNA).
- **Wagi (6 assetów ≤ budżet):** packshot-alpha 290→66 KB (resize 760 + quantize P/tRNS, alfa soft zachowana,
  BEZ progowania); sc-capacity-steak 188→87, sc-final 147→79, sc-problem 167→95 KB (WebP 1240px/q80);
  tt3.mp4 4282→2154, tt5.mp4 4131→2329 KB (ffmpeg x264 crf33 + 30 fps + aac 80k). Re-upload x-upsert pod tymi
  samymi nazwami. Backup: `packshot-alpha-BACKUP.png`. **Koszt finiszu: $0** (rekompresja/CV/dokumenty).
  **Koszty wideo (fal.ai) zalogowane zbiorczo przez główną sesję** — finisz NIE loguje do wf2_costs.
- **Archiwum wg konwencji gate (LL-057):** `brand/` (favicon-32/wordmark/logo-combo), `makiety/` 21 png
  (styl-master + 10×d + 10×mobile; odzyskane ze Storage `bud-assets/rozmrozik/makiety/*.webp` → konwersja png,
  koszt $0), `galeria-kuracja/GALERIA.md`, `dopasowanie/{DOPASOWANIE,WIERNOSC,SEMANTYKA}.md`, `ir/` 11×IR
  (10 makiet + zdjecia z renderu przez mockup-ir OpenCV), `RETRO.md`. sekcja-diff.py: SSIM 0.34–0.63 desktop /
  0.20–0.66 mobile (real-render vs AI-makieta, prog 0.85 nieosiągalny — decyduje RUBRYKA), **LAYOUT-FAIL 0/11**,
  werdykty 11/11 desktop TAK + 12/12 mobile TAK.
- **mobile-makieta-wyjatek:** `zdjecia-kupujacych` = sekcja DOWODOWA render-only (3 realne kadry UGC, brak makiety AI) →
  komplet mobile makiet = 10/11 z wyjątkiem dla sekcji dowodowej (mobile-makieta-skip dla zdjecia).
- **cross_landing PASS** (parasol Ulepszek vs tomek-niedzwiecki): Zilla Slab + `#E8590C` odróżnialne (dE≥15) —
  mis-scope Rozgrzewka (Fraunces) tu NIE występuje.
- **Rezydualne FAIL-e gate (nie-naprawialne w zakresie finiszu, udokumentowane):** cta checkout-root (⛔ strefa checkout);
  finalny_pass ×2 (zc-fallback hidden + crossfade TOR-I intencjonalny); panel_sync artefakty-kompozyty (rejestracja poniżej).
