# LEDGER — GADULEK (dziecięce walkie-talkie z ekranem/kamerą) · fabryka landingów wf2

Produkt `wf2_products.id = c80ddb0c-1349-4a27-9e55-3da297473772` · projekt
`f7e2ef31-5faa-4a4c-ab96-64f66140c761` (Damian Mordalski / marka parasolowa Odkrywek) ·
radar `bud_tt_products.id = 4db1b6fc-8cbb-4001-86f3-562946e76a18` · aukcja `1005010623173867`.

---

## F0 — DANE + KURACJA + KARTA (2026-07-24) · WYKONANE
- **GATE source:** `ali_snapshot.source = 'detail'` = ZAUFANE → **PASS ✓** (bez STOP-u).
  `snap_pid = 1005010623173867` = zgodne z `supplier_url`/`chosen_link`.
- **⚠️ ROZJAZD cover_url (nota do orkiestratora):** `wf2_products.cover_url` →
  `bud-products/1005011544279474/g0.avif` (INNE ID), a snapshot/galeria → `1005010623173867`.
  **Galeria budowana z `ali_snapshot.images` (właściwa aukcja), NIE z cover_url.** Naprawa
  cover_url = Etap 1/orkiestrator, nie fabryka landingów.
- **⚠️ Marża cienka (nota F-1, buduję dalej):** koszt landed ~80 zł (Blue&Blue $20.94 × NBP
  3,8000 = 79,57 zł), cena 89,90 zł, `unit_profit` 8,53 zł (~9,5%). Decyzja Etapu 1 — nie zmieniam.
- **Kuracja galerii:** 8 kadrów → **5 keep** (g0 CROP watermark + UGC 6-0/7-1/0-0/9-3), g1–g5 = DANE,
  g6+okładka-TT = ODRZUĆ (duplikat / off-product). ≥4 keep ✓. → `gallery_curated`.
- **Kuracja wideo:** brak wideo produktu (`video_url=null`), okładka TikTok off-product →
  `videos_curated` pusta z notą; sekcja wideo = **blokada-tomek** (nie SKIP). → `videos_curated`.
- **Artefakty:** KARTA-PRAWDY.md · PASZPORT.md · galeria-kuracja/GALERIA.md · WIDEO.md ·
  MAPA-ZASTOSOWAN.md · ICP-GRUPA-DOCELOWA.md.
- **Liczby oznaczone** [KONKRET-SKU/SPEC/GALERIA/OPIS/BEŁKOT-CUT] w Karcie ✓.
- **Kluczowe SANITY:** zasięg 100–400 m (NIE 1,5 km) · wideo 480P (NIE „HD") · efekty głosu bez
  sztywnej listy 3 (rozbieżność g4↔opis) · wiek 3+ (kotwica pudełko UGC 8-2) · nie wodoodporne ·
  moc w watach mylące — nie eksponować.
- **Slug/mini-marka:** `gadulek` / „Gadulek" — rezerwacja `bud_brand_names` (INSERT-or-fail).
- **Koszty twarde API (F0):** $0.00 (pobranie galerii/NBP/snapshot = darmowe; snapshot był w bazie).
- **Kurs NBP:** USD 3,8000, tab. 142/A/NBP/2026, 2026-07-24 (fetch api.nbp.pl).

### Model per faza (Z8)
F0 = wykonanie sesji (agent) + vision-gate kuracji (Sonnet-equiv, osąd zamknięty) — bez subagentów
Opus. Subagent Sonnet użyty tylko do wydobycia kontraktu narzędzi (I/O, nie osąd).

---

## F1 — PLAN + PRZEWODNIK (2026-07-24) · WYKONANE
- **Plan gpt-5.6-sol** (wf2gpt-call, effort=high padł na edge wall-clock/tło; foreground effort=medium OK).
  Motyw **„DWA OKIENKA. JEDNA PRZYGODA."** (malinowa fala rozmowy) — ≠ „clean e-commerce". Zrekonsyliowany
  do finalnego PLAN.md (nagłówek + cross-landing vs migotek/nakrecik/zaklipek + znormalizowany MANIFEST).
- **MANIFEST:** 12 build + `wideo` blokada-tomek. TOR-I: `jak-dziala` · `anatomia`. Sekcja `zastosowania`
  (≥2 funkcje → mozaika ≥5 światów). `zdjecia-od-kupujacych` = build (mamy 4 UGC 5★).
- **Tabela CLAIM→ŹRÓDŁO** kompletna; blok CUT/ZAKAZ (HD/4K, 1,5 km, wodoodporne, safety/CE, white-label).
- **PRZEWODNIK-GRAFICZNY.md** (łuk, matryca osi 6/3/4/54%/5, ANIM-3 hero+mid-cta+final, casting z ICP).
- **Krytyk przewodnika = subagent OPUS** → **PASS** + 5 poprawek NANIESIONYCH: (1) mid-cta↔final bliźniaczość
  → final przeniesiony do OGRODU o zmierzchu z innym nośnikiem ruchu (girlanda+trawa) i ujęciem (detal dłoni);
  (2) money-shot zróżnicowany per scena (hero front / zastosowania over-the-shoulder / final detal);
  (3) ⛔ kolumny konkurenta w `porownanie` = generyczna sylwetka, nie bryła Gadulka; (4) hero nośnik ruchu =
  dominujący element 1. planu; (5) podton brzoskwini jako sygnatura tła (common.py DNA).
- **Cross-landing 5/5:** akcent malina #C5265B · font Fredoka · archetyp H · tło krem/brzoskwinia · świat dziecięcy.
- **Koszty twarde API (F1):** gpt-5.6-sol plan ~$0.25 (2 wywołania, ~14,5k in / ~21k out tok; szac.).
- **Model (Z8):** plan = gpt-5.6-sol (oś OpenAI); krytyk przewodnika = **Opus** (otwarty osąd, brak gate'u za nim).

## F2.5 — STYL-MASTER + BRANDING (2026-07-24) · WYKONANE
- **TOKENS-MAKIETY.md** = KANON + PARTYTURA hexami (Fredoka/Alegreya Sans · malina #C5265B 5,53:1 · krem
  #FFF8EF/kość/brzoskwinia · radius 20 · ikony outline · sygnatura „malinowa fala") = SSOT `common.py DNA`.
- **Styl-master ×1** (local HIGH 1536×1024) → **GATE PASS**: komplet DNA (paleta+2 fonty kontrast+radius+
  ikony outline+trust-pill+głębia+produkt wierny para blue/pink+świat jasny); motyw↔korzyść czytelny, jasno.
- **Favicon (brand-forge, 3 metafory diversity-first, 6 kandydatów local HIGH):** TOP-1 skryptowo = fav-m0-0
  (malinowa ramka-ekran z buźką „widzą się"). **Werdykt vision RUBRYKĄ 6×T/N = 6×TAK → PASS** (czytelny
  @32/@16 oba tła · metafora oddaje nazwę · flat 1-2 kolory · zero liter · mono OK). Najsłabsze: @16 na czarnym
  ramka cienka (kształt trzyma).
- **Wordmark** „Gadulek" Z FONTU Fredoka-Bold (nie gpt-image); **lockup** favicon LEWA + wordmark PRAWA
  (jasny/ciemny); **brand-context.png** (@16/32/64 oba tła + lockupy); brand.json. **11 plików →
  bud-assets/gadulek/brand/**. ⚠️ WARN: instancja Fredoka-Bold.ttf bez pełnego latin-ext (brak ą/ć/ę/ł…) —
  wordmark „Gadulek" OK (bez diakrytyków); **dla F4** nagłówki PL: użyć webfontu Fredoka Google Fonts (ma latin-ext).
- **Koszty twarde API (F2.5):** styl-master ~$0.25 (HIGH 1536×1024) + 6 faviconów ~$1.00 (HIGH 1024²) = **~$1.25**.
- **Model (Z8):** styl-master gate + favicon 6×T = vision osąd (Sonnet-equiv/agent); selektor @32px = skrypt.
