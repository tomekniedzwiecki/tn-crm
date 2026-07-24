# LEDGER — NAKRĘCIK (magnetyczny uchwyt POV na szyję)

Rejestr decyzji, kosztów API i odstępstw. Slug `nakrecik`. Projekt
`62e5422a-9475-4e9b-afa3-483c53b62169`, produkt `ee6e4040-1551-4447-a037-3c4bfc8bd878`,
tt `09a2e387-ae53-4268-a20d-8bcdf509e8bb`, ali `1005006455949937`.

## Wzorzec
Zaklipek (`sklepy/tomek-niedzwiecki/zaklipek/` + `scripts/mockup-tools/FABRYKA-zaklipek/`) —
kopiujemy strukturę/jakość/mechanikę, NIE treść. Model per faza wg Z8.

## 🔒 BEZPIECZNIK RENTOWNOŚCI (krok 1) — **PASSED**
- Kurs NBP USD: **3,7946** (odczyt `_nbp_usd_rate` 2026-07-24).
- Wariant bazowy sprzedawany = **„Grey" $29.03** → **110,16 zł landed** (= $29.03 × 3,7946;
  zgodne z `wf2_products.cost_purchase = 110,16`).
- Cena PL (kalkulacja Etap 1, już ustawiona): **124,90 zł**; prowizja 2% → 122,40 zł;
  `unit_profit` brutto **12,24 zł** (~11% narzut = pasmo testowe 10–15%).
- Z cłem ryczałt 13 zł/szt. (od 1.07.2026): 122,40 − 110,16 − 13 = **−0,76 zł netto** przy cenie
  testowej — **celowo cienkie** (doktryna TEST-margin: silnik windzie po potwierdzeniu popytu).
- **Headroom rynkowy:** przy 149 zł → 146,02 − 123,16 = **+22,9 zł netto (~18,5%)**; przy 159 zł
  → **+32,7 zł (~26,5%)**. Rynek udźwignie 149–159 zł (premium: stal+aluminium+silikon, 16
  neodymów, 20× ★5) → **produkt spina przy cenie osiągalnej. BUDUJEMY DO KOŃCA.**
- Nota: fabryka landingów NIE zmienia ceny (zostaje 124,90 zł na stronie, gate `cena_panel`).

## Koszty API (wf2_costs — twarde API: gpt-image / fal; Claude = abonament, NIE liczyć)
| faza | co | koszt USD |
|---|---|---|
| F0 | 0 (dane/wizja) | 0 |
| F1 | 0 (plan/przewodnik) | 0 |
| F2.5 | styl-master + 6 favicon (gpt-image-2 HIGH); wordmark z fontu = 0 | ~$1,4 (szac.) |
| F2/F3 | 17 scen produkcyjnych + 2 packshoty (gpt-image-2 HIGH; sceny=makieta+grafika) | ~$4,0 (szac.) |
| F5 | hero-video 2× Kling PRO i2v (bud-fal-proxy) | ~$0,90 |
| DEMO | pobranie/oględziny klipu Ali (ffmpeg) — ODRZUCONY | $0 |
| **F2-REGEN** | **24 PRAWDZIWE makiety strony (gpt-image-2 HIGH: 16 desktop 1536×1024 + 8 mobile 1024×1536), tor LOKALNY /edits+/generations** | **~$5,04 (24×~$0,21; wf2_costs kind=openai-image)** |
| **Σ** | **skumulowane** | **~$11,3 (~43 zł)** |

## Odstępstwa (Z4/Z8)
- **F1 PLAN + PRZEWODNIK autorsko agent (Opus)**, nie gpt-5.6-sol. Dozwolone (Z4: plan może pisać
  agent LUB gpt; Z8: F1 = osobna oś kosztu). Powód: spójność całości + pełna kontrola partytury/
  manifestu pod ten produkt. Gate'y F6/F7 rozstrzygają jakość niezależnie od autora.

## Log faz
- **F0 (dane/karta/kuracja/paszport/mapa/ICP/wideo) — DONE 2026-07-24.** source=detail ✓ (gate
  PASS). gallery_curated: 8 kadrów → 5 keep / 3 odrzuty. videos_curated: Ali video brandowane →
  hero-video F5; sekcja wideo-UGC = blokada-tomek. Bezpiecznik PASSED (wyżej). Bogaty produkt:
  20× ★5, 4,8/187/96,8%, 426 sold, wideo produktowe on-product, 10 zdjęć kupujących.
- **F1 (plan + przewodnik) — DONE 2026-07-24.** Motyw „TWÓJ KADR, OBIE RĘCE WOLNE" (POV/wizjer).
  Partytura: Space Grotesk (display) · Hanken Grotesk (text) · akcent emerald #12B76A (z wariantu
  Green) · tło ciepła kość · archetyp hero A (full-bleed) · sygnatura wizjer/REC. Cross-landing
  5/5 osi ≠ zaklipek. MANIFEST: 17 sekcji (zdjecia-kupujacych=build — mamy 5 zdjęć ★5;
  wideo-ugc=blokada-tomek). TOR-I: demo 1-2-3 + tryby (przełącznik ujęć, flagowa). ANIM-3:
  hero + rozwiazanie(para) + final(park golden hour).

## Log faz (wznowienie 2026-07-24 — agent #2, od F2.5)
- **F2.5 lp_styl_marka — DONE 2026-07-24.** TOKENS-MAKIETY.md (:root partytura). Marka „Nakręcik"
  (marka=done w F0). Favicon = **aperture „recording eye" emerald** (brand-forge, 6 kandydatów →
  selektor @32px, top m2-0). Wordmark „Nakręcik" z fontu Space Grotesk (NIE gpt-image, diakrytyki PL).
  logo-combo (aperture LEWA + wordmark PRAWA). brand/ wgrane do Storage `bud-assets/nakrecik/brand/`
  (200 OK). Panel: lp_styl_marka done + artefakty.
- **F2/F3 lp_makiety + lp_grafiki — DONE 2026-07-24.** ⚠️ ODSTĘPSTWO (jak migotek, `force-kolejnosc`):
  tor **gpt-image-2 HIGH** (OpenAI /images/edits z ref g0+g3; /generations dla `problem` bez produktu)
  — sceny = **makieta+grafika jednocześnie**, KRYTYK = wizualna inspekcja orkiestratora (samo-akcept
  z logiem). **17 scen + 2 packshoty** (grafit+green, BEZ logo TELESIN). Wierność PASZPORT PASS
  (grafit/green silikon, czarny pierścień magnetyczny, składane ramię, telefon; białe rogi kadru +
  zielona kropka REC wpalone w sceny). Distinct views = 15 (≫5). Zig-zag + różnorodność (kuchnia/ulica/
  park/warsztat/siłownia/rodzic/wideorozmowa; dzień + 2 sceny dark mid-cta/final). 5 zdjęć kupujących
  ★5 rehostowane → `reviews/buy-1..5`. Rehost 22 assety → `asset-urls.json`. MAPA-ASSETOW.md gotowa.
  Panel: lp_makiety+lp_grafiki done + artefakty (meta.section).
- **F5 lp_zycie (hero-video) — DONE 2026-07-24.** Kling PRO i2v (bud-fal-proxy, `gen-hero-nakrecik.py`):
  hero-loop (desktop, mp4 1483KB/webm 1129KB) + hero-loop-m (mobile, mp4 2116KB/webm 1953KB) + postery →
  `bud-assets/nakrecik/video/` + `assets/hero-video.mp4` (200 OK). Cinemagraph ANTY-MORFING: osoba/dłonie/
  uchwyt/telefon ZAMROŻONE (locked camera + NEG na ruch/morfing/logo), animacja = subtelny dryf światła
  z okna. Gate morfingu PASS (bryła zachowana). Koszt ~$0,90.
- **DEMO-WIDEO (F5.3) — ODRZUCONY 2026-07-24.** Klip `ali_snapshot.video_url` (41,6 s) obejrzany
  (ffmpeg, 11 klatek): **wypalony wordmark „TELESIN" (cyan) w prawym-górnym rogu KAŻDEJ klatki 0→41 s**
  + ANG napisy przez cały klip („Magnetic Neck Phone holder", „Quick release design", „Strong neodymium
  magnet", „Fishing", „Mountaineering") + infografika TELESIN @37 s + logo-karta TELESIN @40 s + molowane
  „TELESIN" na module w zbliżeniach. **Brak czystego okna temporalnego** (overlay rogu jest STAŁY — trim
  nie usuwa; spatial-crop zostawia napisy dolne + molowanie + kadruje produkt). → white-label + rynek PL
  nieratowalne. **Sekcja `wideo-ugc` = blokada-tomek** (zgodnie z PLAN #14). Ruch strony pokrywa hero-video
  F5 (jak Zaklipek). Koszt $0.

## Log faz (REGEN MAKIET PORZĄDNA 2026-07-24 — agent #3)
- **F2 lp_makiety REGEN — DONE 2026-07-24.** Naprawa LL-078: poprzednio landing poszedł
  **FALLBACKIEM** (0 makiet strony — tylko sceny/prompty; tor edge `genimg.py`/`wf2-gen` padł na
  brak `WF2_GEN_SECRET` → 403). Teraz: **24 PRAWDZIWE makiety CAŁEJ STRONY** torem **LOKALNYM
  gpt-image-2 HIGH** (mechanizm 1:1 z pilota Migotek — `makiety/_gen.py` + `_batch.py` ThreadPool na
  `_index.json`; OpenAI `/v1/images/edits` z `_product-ref.png`=g0 dla sekcji z produktem +
  `/v1/images/generations` dla `zaufanie/problem/opinie` bez produktu; smoke test 1 obraz PRZED
  batchem PASS). **16 desktop** (1536×1024) + **8 mobile** (1024×1536; hero/problem/rozwiazanie/demo/
  zastosowania/mid-cta/zamow/final). Prompty AUTORSKIE `_prompts.py`: STYLE-DNA z TOKENS-MAKIETY
  (kość #FAF7F1 + emerald #12B76A scope CTA/REC/★/checki + Space Grotesk/Hanken + sygnatura
  wizjer/rogi kadru + kropka REC) + copy **1:1** z żywego `index.html` + wierność PASZPORT (obręcz-U
  na kark, czarny moduł, krótkie składane ramię, czarny pierścień magnetyczny, grafit/zieleń; ZERO
  gooseneck/szczęk/LED/pilota; **ZERO „TELESIN"**). **KRYTYK (świeże oko, 2 kontakt-sheety) = PASS
  24/24.** Rehost → `bud-assets/nakrecik/makiety/` (24 WebP) + 40 `wf2_artifacts` (makieta/
  makieta_mobile/dopasowanie). Koszt $5,04 → `wf2_costs` (kind=openai-image, step lp_makiety).
- **F7 lp_dopasowanie REGEN — DONE 2026-07-24.** `sekcja-diff.py` render(żywy sprytko.pl/nakrecik
  @1280)↔makieta → **16 kompozytów [makieta|render]** + `DOPASOWANIE.md` (16 wierszy SSIM 0,17–0,78 =
  INFORMACYJNY real-vs-AI; **LAYOUT-FAIL 0/16** = twarda bramka DOM). Werdykt świeżej pary oczu:
  **16/16 sekcji = TAK** (5×T rubryka). **KOD BEZ ZMIAN** — makiety autorskie z istniejącego
  `index.html`, więc render realizuje je 1:1 (RUBRYKA+LAYOUT). Kompozyty rehost → `dopasowanie/`.
- **REPUBLISH — DONE 2026-07-24.** `platform-sync publish` → **`_makiety_gate` PRZESZEDŁ** (24 makiety
  strony ≥6 + 16 SSIM ≥12), published-gate 0 FAIL, harden+watermark OK. **DOWÓD live:
  https://sprytko.pl/nakrecik → HTTP 200 · runtime product_id (ee6e4040…) w HTML: TAK · noindex
  ZDJĘTY · hero-video NIENARUSZONE (hero-loop mp4/webm) · checkout NIENARUSZONY · ZERO TELESIN · cena
  124,90 zł.**
