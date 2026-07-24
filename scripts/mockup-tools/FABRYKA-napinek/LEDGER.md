# LEDGER — NAPINEK (sprężynowy trener ramion i klatki) · dziennik fabryki · start 2026-07-24

Projekt wf2: `dfba24fb-70d0-4cba-ae3a-7f67b48e8413` (Tomasz Borowski) · Parasol: **Zmyślnik**
(sklep `019f94f0-14a1-7626-8739-95aa8660698c`, subdomena `zmyslnik.shop.tomekniedzwiecki.pl`).
Produkt: `wf2_products.id = 9156bbc2-0dbf-416a-8e9b-4bc5ade21a39` · tt `08ca65d9-a717-4e33-a435-213ab30049a0`.
Slug: **napinek** · cena 144,90 zł (DANA, kalkulacja done) · koszt 125,93 zł.

---

## F0 — DANE + VISION-GATE + KARTA (krok `lp_dane`) — 2026-07-24
- **Gate `source='detail'`: PASS ✓** — `ali_snapshot.source='detail'`, `fetched_at=2026-07-24T16:21Z`
  (świeży, <24 h). Aukcja `1005009863215535` (Twister Arm Trainer / power twister).
- **F0.5 KURACJA GALERII:** 7 kadrów → **2 keep (crop/DANE: g4 wymiary, g5 porównanie), 5 odsiew
  (DANE)**. ⚠️ Galeria SKRAJNIE uboga: g0–g5 = infografiki z wypalonym ENG (literówki) na CIEMNYM
  tle siłowni; g6 = biały packshot ale NIEBIESKI wariant + broszura „HOTWAVE". **0 czystych
  packshotów w kanonie (turkus)** → packshot i sceny = F3. `gallery_curated` zapisane. Odstępstwo od
  „≥4 keep": DANE produktu na to nie pozwalają (materiał = infografiki) — nie defekt, stan danych.
- **F0.6 KARTA-PRAWDY:** cena 144,90 (ODCZYT) + kurs NBP ≈3,80 (125,93=33,14×3,80); specs 1:1
  (Rbefeuly white-label); destylacja FAKT/BEŁKOT. **Kluczowe fakty:** 3 poziomy oporu 60/75/90 lbs
  (g1/g3), stalowa sprężyna dwuwarstwowa + osłona, pianka antypoślizgowa, wymiary 67×17 cm (g4),
  rozkładany; partie: ramiona/klatka/plecy/barki (+nogi drugoplan). Ocena ★4,8/5 · 9 ocen · 95,6%.
  sold 25 <1000 → POMIJAMY.
- **F0.6b MAPA-ZASTOSOWAN:** produkt WIELOZADANIOWY (ściskanie do środka ↔ prostowanie na zewnątrz;
  ≥4 partie) → SZEROKOŚĆ obowiązuje; 7 zastosowań z klasą dowodu; SPEKTRUM ≥4 ✓.
- **F0.6a ICP:** persona [WYWNIOSKOWANA] — domowy trener siły, 20–45, ~70% M/30% K, SOLUTION-aware,
  lęk #1=scam; casting = zwykła sprawna osoba (⛔ nie półnagi kulturysta z galerii), JASNE wnętrze domowe.
- **PASZPORT:** bryła = łamany drążek, para sprężyn, pianka+mięta+chrom; „CZEGO NIE MA": niebieski
  wariant, pojedyncza sprężyna (typ OTHER), linki/ekspander.
- **WIDEO:** `video_url=null`; TT klip niepobrany, okładka off-color+brand → **blokada-tomek** (klasa dowodowa).
- **UGC zdjęcia:** `bud-reviews/1005009863215535` PUSTE + wszystkie recenzje `images:[]` → **blokada-tomek**.
- **Mini-marka „Napinek" ZAREZERWOWANA** w `bud_brand_names` (INSERT-or-fail, product mode) — F0
  (idempotentnie potwierdzi ją brand-forge w F2.5).
- **⚠️ NOTA EKONOMICZNA (F-1, jedna linia — NIE zatrzymuję):** marża przy 144,90 zł (koszt 125,93)
  ~11% (unit_profit ~16 zł) — cienka; drabinka SCALE (est. 319 zł) czeka na bramkę Tomka. Decyzja
  cenowa = Etap 1, nie fabryka.
- **Koszty API F0:** 0 (żadnej generacji; sama kuracja/dane).

## F1 — PLAN + PRZEWODNIK GRAFICZNY (krok `lp_plan`) — 2026-07-24
- **Motyw:** „NAPIĘCIE, KTÓRE BUDUJE" (łuk napięcia + wielkie liczby 60/75/90 = sygnatura S5).
  Kąt: siła ramion i klatki w domu, 3 poziomy oporu. HOOKS 1–3 (siłownia w domu / 3 poziomy / bez karnetu).
- **PARTYTURA (cross-landing 5/5 vs migotek·nakrecik·zaklipek):** display **Barlow Semi Condensed**
  (atletyczny; ≠ Fraunces/Space Grotesk/Bricolage) · text Mulish · akcent **#0F766E** (turkus z
  produktu; ΔE≥33; biały 5,47:1) · archetyp **C** (≠ A bezpośredniego migotka) · tło chłodny len/popiel
  z nutą zieleni · sygnatura **S5** wielkie liczby.
- **MANIFEST SEKCJI:** 17 pozycji; 15 `build` (w tym `zastosowania` SPEKTRUM + `poziomy` TOR-I flagowa),
  2 `blokada-tomek` (wideo #13, ugc-zdjecia #14 — materiał wyczerpany). Rdzeń hero/mid-cta/zamow/final ✓.
- **PRZEWODNIK:** łuk 8 klatek; osie różnorodności (6 kontekstów/4 skale/3 światła/~88% człowiek/4
  perspektywy) ✓; anty-szew (ciąg 4–7: tylko `rozwiazanie` full-bleed, reszta karty/mozaika/konfigurator);
  SCENY ANIMOWANE = hero + rozwiazanie + final (firana/roślina; hero = klasa aktywna).
- **Koszty API F1:** 0.

## F2.5 — MARKA + STYL-MASTER + TOKENY (krok `lp_styl_marka`) — 2026-07-24
- **TOKENS-MAKIETY.md** (partytura hexami): display Barlow Semi Condensed (800/700) · text Mulish
  (400/600/800) · `--paper #F5F7F5/#E9EDE9/#DCE4DE` · `--ink #1C2723` · `--cta #0F766E` (turkus,
  biały 5,47:1) · radius 12/6 · ikony outline 2px ink · sygnatura S5 (60/75/90 + 01/02/03 + łuk) ·
  archetyp C. Blok `:root` gotowy (dla `--cross-only` w F6 + `ir.root.css` w F4).
- **Styl-master** (plansza DNA, gpt-image-2 HIGH lokalnie, 1 obraz): paleta z rolami + Barlow/Mulish
  + S5 liczby + produkt w kanonie (czarny+turkus+chrom) + świat jasny dom. Jakość OK (obejrzany).
- **brand-forge (tryb produktowy):** nazwa „Napinek" potwierdzona idempotentnie (zarezerwowana w F0);
  favicon (metafory: sprężyna→N / łuk drążka→N / muskuł+sprężyna), wordmark z Barlow SemiCond ExtraBold,
  logo-combo, brand-context → `bud-assets/napinek/brand/`.
- **Koszty API F2.5:** styl-master 1 obraz + favicon ~6 kandydatów (gpt-image-2 HIGH).

## F2 — MAKIETY CAŁEJ STRONY (krok `lp_makiety`) — 2026-07-24 — ⛔ IN_PROGRESS (bramka Tomka)
- **Tor LOKALNY gpt-image-2 HIGH** (`makiety/_gen.py` + `_batch.py` + `_prompts.py` + `_index.json`,
  ref produktu `_product-ref.png` = crop g4 turkus). **15 sekcji build × (desktop+mobile) = 30 makiet.**
- Sekcje: hero(C)/zaufanie/problem/rozwiazanie/demo/zastosowania/poziomy/korzysci/bezpieczenstwo/
  mid-cta/opinie/galeria/zamow/faq/final. Wideo(#13) i ugc-zdjecia(#14) = blokada-tomek (bez makiet).
- Jakość (obejrzane 01-hero, 04-rozwiazanie): archetyp C poprawny, kolor TURKUS (nie niebieski),
  casting zwykłej osoby (nie kulturysta), dane 144,90/60-75-90, S5 + łuk, trust nad foldem, spójne DNA.
- Rehost → `bud-assets/napinek/makiety/` (webp q82 max 1440); artefakty `makieta`/`makieta_mobile`
  z meta{section, viewport}.
- **⛔ lp_makiety = IN_PROGRESS** (NIE done) — czeka na AKCEPT MAKIET Tomka (bramka). Checklista:
  wszystko zaznaczone POZA „AKCEPT MAKIET".
- **Koszty API F2:** 30 obrazów gpt-image-2 HIGH (makiety) + styl-master + favicony (F2.5).
