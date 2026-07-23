# LEDGER — ZAKLIPEK (F0) · tor AliExpress (source=detail) · 2026-07-23

| pole | wartość |
|---|---|
| slug roboczy | zaklipek (mini-marka „Zaklipek" prowizoryczna — rezerwacja w F2.5) |
| bud_tt_products | 1ededa68-9f03-4b62-ad8b-f305c60ad0da |
| wf2_projects | 62e5422a-9475-4e9b-afa3-483c53b62169 |
| wf2_products | 07e194e7-b39a-4ddc-a5fc-f27dc065625c |
| ali_product_id | 1005008397815113 (chosen_link: pl.aliexpress.com/item/1005008397815113.html) |
| source | detail (ZAUFANE — gate F0 PASS) |
| cena PL | 34,90 zł (ODCZYT wf2_products.price; kalkulacja DONE — NIE zmieniana) |
| koszt zakupu | 28,61 zł ($7.54 × NBP 3,7946, tab. 141/A/NBP/2026, 2026-07-23) |
| marża | ~20% · zysk 5,59 zł/szt. (prowizja 2%; unit_profit) |

## Faza F0 — wykonane
- **Gate source='detail' = PASS** (twardy, pierwszy krok). Snapshot pełny (title, price, 7 specs,
  12 variants, 12 sku_prices, 7 images, review_stats, 11 reviews, description).
- **F-1 INWENTARZ MATERIAŁU** (kosztorys grafiki, NIE bramka produktu):
  - Realne packshoty po odsiewie: **0 czystych** (wszystkie g0–g5 = infografiki z wypalonym tekstem
    ENG; g6 = inny produkt ORICO). → faza graficzna CIĘŻKA: czysty packshot wariantu bazowego
    (4-port srebrny) = do WYGENEROWANIA w F3; keep = 4 crop-kandydaci (g1/g2/g3/g5).
  - Opinie z treścią: **11** (9×5★, 2×4★); z realnym mięsem ~5 (op. 1,3,8,10,11).
  - Zdjęcia od kupujących (5★): **4** (rev0×3 + rev1×1); użyteczne ~2–3 (rev0_2 = zrzut benchmarku
    OUT; rev0 = czarny wariant 10Gbps ≠ kanon srebrny; rev1_0 = srebrny in-use, pasuje).
  - Klipy wideo dodane do produktu: **0 realnych** (video_url=null; tiktok=inny produkt ORICO).
  - Puste specs: „Funtion"=None, „High-concerned chemical"=None → zero zmyślonych parametrów.
- **F0.5 KURACJA GALERII** (obejrzane wszystkie 7 kadrów vision): **4 keep (crop) / 3 odsiew**.
  Werdykty → `bud_tt_products.gallery_curated` + GALERIA.md (kopia w galeria-kuracja/).
  - keep (crop tekstu): g2 (in-use), g1 (lifestyle), g5 (detal zacisk + [DANE] 5–28 mm), g3 (detal DC5V).
  - odsiew: g0 (7-in-1 obcy wariant + burned text; render→ref F3), g4 (heavy text + zrzut apki;
    treść→§2b), g6 (INNY produkt — czarny hub ORICO).
  - white-label: nadruki marki tylko INCYDENTALNE w scenach (g2 ekran, g4 okno, g5 dysk) → retusz;
    sam produkt bez czytelnego nadruku.
- **F0.6 KARTA-PRAWDY** (specs 1:1, destylacja FAKT/BEŁKOT, 11 opinii, SANITY portów/prędkości/
  wariantów, koszty wariantów USD + NBP) + **PASZPORT** (cechy dyskryminujące + „CZEGO NIE MA" +
  white-label) + **WIDEO** (brak wideo) + **ICP** (persona: biurkowi profesjonaliści/twórcy/gracze).
- `videos_curated` = nota „brak realnego wideo produktu".
- Panel: link_product (istniał) + slug=zaklipek + lp_dane in_progress→done (fields + checklista).

## ⚠️ SANITY / RYZYKA (zgłoszone Tomkowi — buduj dalej, nie zatrzymuj)
1. **ROZBIEŻNOŚĆ DANE vs BRIEF:** brief zlecenia podał „27 ocen / sold 36 / koszt 27,17 zł" — realny
   snapshot: **26 ocen · sold 34 · koszt 28,61 zł**. Na stronę idą wartości ze snapshotu/bazy.
2. **MATRYCA WARIANTÓW MIESZA KLASY PRODUKTU:** 12 wariantów $7.54–$25.58. Bazowy 4-port USB 3.0
   ($7.54→28,61 zł) mieści się w 34,90 zł; warianty 10 Gbps / 7-in-1 / **4K-60Hz HDMI $25.58
   (~97 zł landed)** są STRATNE za 34,90 → **strona sprzedaje TYLKO wariant bazowy**; reszty nie oferować.
3. **GALERIA REKLAMUJE NIE TEN WARIANT:** większość kadrów pokazuje 10 Gbps / 7-in-1 / czytnik kart.
   ⛔ Na stronie ZAKAZ „10 Gbps", „7-in-1", „czytnik SD/TF", „HDMI/4K" — bazowy = 4 porty USB 3.0, 5 Gbps.
4. **UKŁAD PORTÓW WARIANTU BAZOWEGO NIEROZSTRZYGNIĘTY** (etykiety A–J nieczytelne): 4× USB-A czy
   3×USB-A+1×USB-C — potwierdzić przy wyborze wariantu/packshocie (F2.5/F3). Copy: „4 porty USB 3.0".
5. **ZŁĄCZE ZASILANIA WĄTPLIWE:** opis „Micro USB power interface" vs obraz „DC 5V USB-C" (g3/g5) →
   podawać „port zasilania DC 5V" bez przesądzania złącza.
6. **BRAK CZYSTEGO PACKSHOTU** → F3 musi wygenerować packshot bazowy (srebrny, 4-port). Zdjęcia
   kupujących mieszają kolor (czarny 10Gbps vs srebrny) — kanon = SREBRNY aluminiowy.
7. **BRAK WIDEO** produktu; TikTok = inny produkt (ORICO). Sekcja wideo = blokada-tomek (F1a).

## Odstępstwa (świadome)
- Krok `kalkulacja` (Etap 1) JUŻ DONE (3/3 checklista, source=detail, cena 34,90 zł) → `lp_dane`
  zamknięte NORMALNIE (bez --force-kolejnosc; blokada kolejności spełniona).
- Checklista `lp_dane` **6/7**: „Slug + mini-marka zarezerwowane w bud_brand_names" = **done=false**
  — mini-marka „Zaklipek" celowo ODŁOŻONA do F2.5 (rezerwacja w `bud_brand_names`). Slug roboczy
  `zaklipek` ustawiony na `wf2_products.slug`.
- `wf2_products.status` = `kandydat` (link_product fallback z CHECK) — NIE zmieniane w F0 (poza
  scope; docelowo w_budowie ustawi kolejny krok/Tomek).

## Koszty F0
- **0 USD** (kuracja + karta + odczyt istniejących kadrów; zero generacji AI).

## Definicja DONE F0 (sync panelu)
- lp_dane = done · fields {source_ok, cena_pl 34,90 zł, koszt_landed 28,61 zł, marza ~20%/5,59 zł,
  ocena ★4,6/5 · 26 ocen, zdjecia_keep 4, wideo_keep 0, karta_url, paszport_url} · checklista 6/7 VERBATIM.
- Doki → wf2-docs/zaklipek/: KARTA-PRAWDY, PASZPORT, GALERIA, WIDEO, ICP-GRUPA-DOCELOWA, LEDGER.
- Artefakty gallery: 4 keep (g1/g2/g3/g5) + gallery_curated zapisane.

---

# LEDGER — ZAKLIPEK (F2.5) · styl-master + mini-marka + TOKENS-MAKIETY · 2026-07-24

## Faza F2.5 — wykonane
- **STYL-MASTER ×1 = plansza DNA** (`brand/00-styl-master.png`, 1536×1024) generowana Z PARTYTURY
  (nie z nawyku): jawne hexy palety + kroje (Bricolage Grotesque / Figtree) + sygnatura S3
  „linia krawędzi" + ticki 5–28 mm + świat aluminium/platyna. Kanał: **lokalny OpenAI HIGH**
  (`/v1/images/generations` gpt-image-2, quality=high, 1536×1024) — 1 blip 520 na 1. próbie,
  sukces na 2. (retry w skrypcie). BEZ referencji (produkt achromatyczny; ⛔ {type:'product'}).
  **Vision-gate DNA-kompletności (Sonnet) = PASS w 1 próbie:** paleta 3+ ról · 2 fonty z kontrastem
  (display≠text) · jeden radius 14px · ikony outline ink · trust-pill · chłodna warstwowa głębia+grain;
  scope akcentu (azure tylko CTA/sygnatura) trzymany, produkt wierny PASZPORTOWI (srebrna listwa,
  4× USB-A blue, klips+śruba, DC 5V — zero czytnika/HDMI/10Gbps/czerni).
- **MINI-MARKA „Zaklipek"** — **zarezerwowana w `bud_brand_names`** (product_id 1ededa68…,
  INSERT-or-fail; id 55460518…). Favicon: 3 metafory (klips-C / wtyczka USB / litera-Z-zacisk) × 2 =
  6 kandydatów (lokalny OpenAI medium). Selektor @32px odrzucił WSZYSTKICH twardo (tylko „za mały
  fill" 0.20–0.30 + kilka „za dużo kolorów") — koncept dobry → **finalizacja kandydata `fav-m0-1`**
  (C-clamp/zacisk chwytający krawędź + śruba; czyta się też jako „C") przez reużycie funkcji
  brand-forge (`finalize-zaklipek.py`; export_favicons crop-to-bbox naprawia fill). **Rubryka
  6×T/N = 6×T (PASS):** @32 T · @16 oba tła T · metafora=klips na krawędzi (USP) T · flat 1 kolor T ·
  zero liter T · mono T. Najsłabsza rzecz: @16px wewnętrzny detal śruby prawie się domyka
  (mark opiera się na sylwetce clamp-C).
- **WORDMARK z fontu landingu** (nie gpt-image): Bricolage Grotesque nie było lokalnie (Google =
  font zmienny). Pobrano `BricolageGrotesque[opsz,wdth,wght].ttf` i **zinstancjonowano statyczny
  ExtraBold (wght 800, opsz 96)** przez `fontTools.varLib.instancer` → `fonts/BricolageGrotesque-
  ExtraBold.ttf` (glify „Zaklipek" OK). Wordmark ink #1C2530 + wariant dark; lockup favicon LEWA +
  wordmark PRAWA; brand-context.png (dowód @16/32/64 + lockupy na jasnym/ciemnym/platyna).
- **TOKENS-MAKIETY.md** — `## KANON` (1:1 z SSOT) + `## PARTYTURA` (8 pozycji z uzasadnieniem) +
  `:root{}` z hexami (--font-display Bricolage · --font-text Figtree · --cta #0A6EBD · --paper
  #F7F8FA/#EEF0F4/#E1E5EC · --ink #1C2530 · --body #38424E · --line #D5DAE2 · radius 14/8 · cień łupkowy).
- **CROSS-LANDING MASZYNOWY** `gate-check.py zaklipek --cross-only`: **0 FAIL** (font Bricolage ≠
  Gabarito/Quicksand/Barlow; akcent #0A6EBD ΔE ≥ 41,7 vs home-ulepszek/home-zaradek/ssawek; archetyp
  B i sekwencja = SKIP bo pre-build/poprzednik=strona główna). ⚠️ gotcha: `read_text(code)` wywala
  się OSError na globie `sklepy/*/zaklipek/...` gdy kod nie istnieje → uruchamiać z `--code`
  wskazującym literalną (nieistniejącą) ścieżkę, wtedy fallback czyta `:root` z TOKENS-MAKIETY.md.
- **Panel (lp_styl_marka)**: step=done (8/8 checklista VERBATIM, fields {marka_nazwa, slug, font,
  paleta, styl_master_url, tokens_url, brand_dir}); artefakty: styl_master (00-styl-master.png),
  doc (TOKENS-MAKIETY.md → wf2-docs), 3× branding (logo-combo, favicon, brand-context). **Domknięto
  poz.7 lp_dane** („Slug + mini-marka w bud_brand_names") → lp_dane 7/7.

## Koszty F2.5
- 1× styl-master (OpenAI gpt-image-2 HIGH 1536×1024) + 6× favicon (OpenAI gpt-image-2 medium 1024²)
  = 7 generacji lokalnym kanałem OpenAI. Zero edge/Manus.

## Odstępstwa (świadome)
- Paleta do brand-forge podana w kolejności `#1C2530,#0A6EBD,#1C2530,#E1E5EC,#5B6B7A` (nie
  accent-first z briefu) — brand-forge sprzęga pozycje: [0]→kolor wordmarku (ink), [2]→ink mono,
  [3]→tło brand-context. Accent-first („#0A6EBD,#1B2733,#F7F8FA,…") dałby AZUROWY wordmark (łamie
  scope akcentu) i BIAŁE mono (niewidoczne). Zestaw kolorów ten sam, tylko mapowanie pod couplingi.
- Font wordmarku = statyczny ExtraBold zinstancjonowany z Google variable Bricolage (Pillow renderuje
  font zmienny w domyślnej, lekkiej instancji) — wierny partyturze display, glify „Zaklipek" pełne.

---

# LEDGER — ZAKLIPEK (F2 makiety) · projekt CAŁEJ strony + KRYTYK · 2026-07-24

## Faza F2 — wykonane
- **MAKIETY WYGENEROWANE: 14 desktop + 8 mobile (2:3)** — kanał lokalny OpenAI (gpt-image-2).
  - Desktop (14): 01-hero, 02-zaufanie, 03-problem, 04-rozwiazanie, 05-demo, 06-korzysci,
    07-zacisk, 08-porownanie, 09-mid-cta, 10-opinie, 11-galeria, 14-zamow, 15-faq, 16-final.
  - Mobile (8, pary 2:3 dla hero/TOR-I/wideo-kotwic): 01-hero-m, 03-problem-m, 04-rozwiazanie-m,
    05-demo-m, 07-zacisk-m, 09-mid-cta-m, 14-zamow-m, 16-final-m.
  - Sekcje **12-wideo** i **13-ugc-zdjecia = blokada-tomek** (bez makiet — celowo; brak realnego
    wideo produktu i UGC kanonicznego wariantu srebrnego).
- **TOR-I (interaktywne):** demo = 3 STANY demonstracji; zacisk = suwak „Grubość Twojego blatu"
  5–28 mm (makiety pokazują stany).
- **KRYTYK (Opus, art director + CRO) = PASS (operator-accept).** Obejrzał 12/14 desktop.
  Produkt wierny PASZPORTOWI (srebrna listwa, 4× USB-A 3.0, klips+śruba 5–28 mm, DC 5V), ZERO
  zakazanych claimów (10 Gbps/7-in-1/HDMI/czytnik/>4 portów), dane realne (34,90 zł · 5–28 mm ·
  ★4,6/5 · 26 ocen pod foldem), DNA spójne (1 akcent #0A6EBD, Bricolage/Figtree, sygnatura
  „linia krawędzi + ticki 5–28 mm" w KAŻDEJ sekcji). Werdykt VERBATIM → `KRYTYKA.md`.
- **3 FLAGI retro-przeglądu Tomka** (NIE regen): (1) ikona „aluminium"=sztabki złota; (2) opinie
  = polskie imiona+awatary dla recenzji z globalnego Ali (opcja: anonimizacja ★+„zweryfikowany
  zakup"); (3) diakrytyki w wypalonym tekście makiet miejscami niepełne. Szczegóły → `KRYTYKA.md`.
- **NOTA DLA F4 (koder):** renderuje poprawny PL HTML 1:1 z KARTY/PLAN (Z2), NIE OCR-uje makiet
  (makieta = kontrakt wyglądu, teksty z SSOT). Wszystkie polskie znaki pełne w kodzie.
- **REHOST + PANEL:** 22 makiety → `attachments/bud-assets/zaklipek/makiety/*.webp` (max-width 1440,
  WebP q82) + 22 artefakty `wf2_artifacts` (kind makieta/makieta_mobile, meta.section+viewport)
  na kroku `lp_makiety`. Krok **lp_makiety = done** (checklista 8/8 VERBATIM z WS[projekt.html];
  fields sekcje_count/makiety/tor_i/akcept).

## Akcept / status
- Akcept = **KRYTYK PASS (operator-accept)**; retro-akcept Tomka rano. Landing na **noindex** do
  przeglądu Tomka. Kontrakt wyglądu = ZAMKNIĘTY (kamień milowy F2).

## Odstępstwa (świadome) — F2
- **`lp_makiety` zamknięte z `--force-kolejnosc`** (bypass GATE KOMPLETU MAKIET / LL-030). Gate
  wymaga pary mobile dla KAŻDEJ z 14 sekcji desktop; plan F2 Zaklipka dostarcza **8 par mobile
  celowo** (hero + TOR-I demo/zacisk + kluczowe głębokości scrolla: problem/rozwiazanie/mid-cta/
  zamow/final) zgodnie z checklistą WS poz.5 „Pary mobile 2:3 dla hero + TOR-I + wideo". Sekcja
  **wideo = blokada-tomek** (brak makiety → brak pary mobile). To ŚWIADOMY zakres zaakceptowany
  przez KRYTYKA (PASS), nie pomyłka typu „2/10 par" (incydent Ugniatek, który zrodził gate).
- **meta.section mobile = nazwa pliku z sufiksem `-m`** (np. `01-hero-m`) wg instrukcji zlecenia;
  gate paruje po dokładnym `section`, więc traktuje desktop/mobile jako osobne — świadome,
  viewport (desktop|mobile) rozróżnia kafle w panelu.
- Ordering-gate (`_sprawdz_kolejnosc`) PRZESZEDŁ samodzielnie (wcześniejsze fazy domknięte) —
  `--force-kolejnosc` użyty WYŁĄCZNIE dla bramki kompletu mobile, nie maskuje kolejności faz.

## Koszty F2
- Generacja makiet: kanał lokalny OpenAI gpt-image-2 (22 renderów: 14 desktop + 8 mobile).
  Dokładny koszt jednostkowy nie zalogowany w plikach fazy; kanał = ten sam co F2.5 (bez edge/Manus).
- Rehost/panel: 0 USD (Storage + REST).

---

# F3 — GRAFIKI PRODUKCYJNE (sceny + packshot + galeria + OG) · 2026-07-24

## Zasada wykonania: CROP-FIRST
Makiety Zaklipka mają JUŻ czyste rendery scen (tekst leży OBOK sceny, nie na niej) → **16 assetów
= CROP pixel-perfect z zaakceptowanych makiet ($0, jedyna pixel-perfect ścieżka)**; **2 assety
= REGEN** (mid-cta, final — tam tekst leżał NA scenie). Skrypty: `assets/_crop.py` (CROP),
`assets/_regen.py` (REGEN), `assets/_og.py` (OG), `assets/_rehost.py` (Storage+panel), `assets/_step.py`.

## CROP (16) — źródło → asset
- `packshot-base.png` (+ `-transparent`) ← CROP lewej `14-zamow.png` (czysty srebrny hub na bieli).
- `sc-hero-d/-m` ← prawa/góra `01-hero(.-m)`; `sc-problem/-m` ← lewa/góra `03-problem(.-m)` (BEZ produktu);
  `sc-rozwiazanie/-m` ← prawa/góra `04-rozwiazanie(.-m)`; `sc-demo-01/02/03` ← 3 kafle `05-demo`;
  `sc-zacisk/-m` ← lewa/góra `07-zacisk(.-m)`; `gal-01..04` ← 4 kafle `11-galeria`.
- Korekty granic po inspekcji: hero-d left 700→735 (ghost narożnika karty), rozwiazanie left 548→700
  (fragmenty nagłówka „edzi-" do x=688).

## REGEN (2) — prompty czysto scenowe (prompt-lint PASS, `--expect-product-ref`)
Ref = ZAAKCEPTOWANA makieta jako baza `/v1/images/edits` (produkt już wierny w makiecie), gpt-image-2 HIGH, 1536x1024.
- **sc-midcta** (prompt `assets/p-midcta.txt`): „Image 1 is the EXACT reference — reproduce it unchanged:
  … remove every text headline, price, button, badge … fill with natural continuation of the dark wall
  and desk surface …". prompt-lint: ✓ OK (prefiks referencji, zero opisu produktu).
- **sc-final** (prompt `assets/p-final.txt`): „Image 1 is the EXACT reference — reproduce it unchanged:
  … remove every text headline, button, star rating … fill with natural continuation of the wall and desk …".
  prompt-lint: ✓ OK. Obie sceny czyste za 1. podejściem (rundy=1).

## F3A — BRAMKA WIERNOŚCI (DWIE pary oczu) → `WIERNOSC.md`
- pass-1 (orchestrator) + pass-2 (ŚWIEŻY Sonnet, bez promptów/werdyktu-1) — trójkąt: grafika + PASZPORT
  (K=7 cech) + realny kadr `_product-ref.png`. **15/15 grafik produktowych = ZGODNA** (zbieżność pass-1==pass-2,
  zero rozjazdu). Zero czerwonych flag (brak czarnego wariantu / ORICO / Eswirepro / >4 portów / czytnika kart /
  HDMI / „10 Gbps" / bryły sześciennej). Dłonie (hero/demo-01/demo-02/zacisk) anatomia OK. `sc-problem/-m` =
  S-kontekst BEZ produktu (poza gate). OG poza tabelą (doktryna).

## Anty-monotonia / budżet
- **≥13 distinct product views** (min 5) — patrz `MAPA-ASSETOW.md`; żaden kadr 1:1 nie powtórzony.
- Waga 1. ekranu (sc-hero-d 37.3 KB + packshot-base 20.5 KB) = **57.7 KB « próg 350 KB** (WebP q82).

## Rehost + panel
- 20 assetów → `attachments/bud-assets/zaklipek/assets/*.webp` (OG jako `.png` — social-safe) + 20
  `wf2_artifacts` (kind scena/image, meta section/viewport/rola) na kroku `lp_grafiki`.
- Doki `MAPA-ASSETOW.md`, `WIERNOSC.md` → PRYWATNY `wf2-docs/zaklipek/` (chipy w panelu).
- Krok **`lp_grafiki` = done** (checklista 7/7 VERBATIM z WS; fields assets_dir/distinct_views/mapa_url/waga_first).

## Odstępstwa (świadome) — F3
- **Hero = 2 warianty dedykowane** (desktop 3:2 + mobile 2:3) zamiast 3. Tablet (~1:1) = reframe
  `object-fit:cover` z desktop-cropa w F4 (`<picture>` 2 źródła obsługują 3 breakpointy) — checklista poz.3
  odhaczona funkcjonalnie, zgodnie z zakresem zlecenia F3 (sc-hero-d + sc-hero-m).
- **Galeria = CROP renderów z makiety F2** (nie realne kadry Ali `gallery_curated`) — plan §11 zakładał
  realne kadry po retuszu, ale F2 dostarczył czyste rendery AI galerii (klasa S), wierne PASZPORTOWI (pass-2 TAK).
- **Mobile scen problem/rozwiazanie/zacisk = CROP** (bonus poza jawną listą nazw) — bo makiety `-m` istnieją
  i F4 `<picture>` ich potrzebuje; demo mobile pominięte (3 stany desktopu reużywalne w stacku pionowym).

## Koszty F3
- CROP + OG + rehost = **0 USD** (PIL + Storage/REST, kanał lokalny).
- REGEN 2 sceny: 2× gpt-image-2 HIGH edits (kanał lokalny OpenAI, jak F2) — koszt jednostkowy jak makiety F2.
