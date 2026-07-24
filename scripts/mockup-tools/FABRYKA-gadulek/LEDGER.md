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
