# PLAN LANDINGU — SSAWEK (mini-marka: Popiołek) · F1 · 2026-07-23

> Tor **Allegro→Marka**. Cena **119 zł DANA** (zero narracji o marży; towar klienta). Źródło faktów =
> `KARTA-PRAWDY.md` (Z7) — każdy claim niesie kotwicę w Karcie, inaczej CUT. Persona = `ICP-GRUPA-DOCELOWA.md`.
> Wygląd produktu = `PASZPORT.md`. White-label: marka „Lehmann"/„Haddo" NIGDY na stronie; nadruki na
> kadrach = RETUSZ (g07/g09/g11 + advisory g05).

---

## KĄT SPRZEDAŻOWY (z PRAWDY KARTY — realne bóle z 15 opinii)

**Hook rdzeniowy:** *„Popiół z kominka? Gruz po remoncie? Wciąga wszystko, czego boi się domowy
odkurzacz."* — message-match do reklamy (sezon grzewczy, impuls z Reels).

Oś sprzedaży = **jeden odkurzacz zamiast niszczenia domowego sprzętu na brudnej, gorącej robocie**.
Trzy filary, każdy z kotwicą i realnym bólem z opinii:

1. **Stalowy zbiornik znosi GORĄCY popiół** (kotwica: spec „Zbiornik metalowy, stal nierdzewna,
   żaroodporny"). Ból z opinii: kominek/koza/piec na pellet — op. 2/5/8/9/13/15 („dobrze wciąga
   popiół", „do czyszczenia pieca świetny"). Domowy odkurzacz z plastikowym zbiornikiem odpada.
2. **Bezworkowy — 3 filtry, pierzesz i używasz na przemian** (kotwica: spec „Bezworkowy" + zestaw
   3× filtr koszowy; op. 11 „3 filtry w zestawie, można prać na przemian", op. 13 „filtr wstępny + 2
   zapasowe"). Zero dokupowania worków. Koszt eksploatacji = 0 zł.
3. **Mocne ssanie + dmuchawa + mokro/sucho — jeden sprzęt na wiele robót** (kotwica: spec „funkcja
   dmuchawy", zestaw ssawka 2w1, op. 3 „chcesz dmuchnąć liście? Pyk", op. 10 „zasysa ziemię, drobne
   kamienie, zbiera wodę"). Gruz/gips po remoncie, warsztat, auto, działka.

**Zakotwiczenie ceny/ryzyka NAD foldem (redukcja lęku #1 = scam, rynek PL):** płatność **przy
odbiorze** · **zwrot 14 dni** · **wysyłka z Polski**. ⛔ ★/liczby opinii w topbar+hero (trust nad
foldem = redukcja ryzyka, NIE social proof).

**UCZCIWOŚĆ = KONWERSJA (Z5) — realne minusy z opinii idą do porównania/FAQ, nie chowamy:**
- głośny (op. 2/5) → FAQ: „tak, jest głośny — to cena mocy przemysłowej; do popiołu wystarczy chwila".
- ⛔ **ZAKAZ claimu antystatycznego** — opinie wprost przeczą („rura się elektryzuje, kopie 220 V",
  op. 11): temat obsłużony UCZCIWIE w FAQ (jak rozładować), nigdy jako „system antystatyczny".
- drobny pył po szlifowaniu gładzi / popielnik pellet zapycha filtr (op. 15) → porównanie/FAQ:
  „do bardzo drobnego pyłu stukaj filtr częściej — to nie odkurzacz do gładzi".
- ⛔ „99,99%" / Prüfengel = **[deklaracja sprzedawcy]** → NIE jako twardy fakt; „filtr HEPA
  zatrzymuje drobny pył" bez liczby.
- **sold 547** < 1000 → **POMIJAMY na stronie** (§sold: nie stosujemy nawet frazy „tysiące
  zamówień"; 547 to sprzedaż sprzedawcy Allegro, nie naszego sklepu = „X sprzedanych u nas" byłoby
  FAŁSZEM). Social-proof = **wyłącznie realne recenzje tekstowe + review_stats (★4,72 / 2458 ocen /
  650 recenzji) POD foldem** w sekcji `opinie` — nigdy nad foldem.

**Moc 2000 W** wolno pokazać TYLKO jako „**moc maksymalna 2000 W**" / „turbo 2000 W" (echo aukcji),
z dopiskiem „maks." przy 1. wystąpieniu; ⛔ „silnik 2000 W". Tabela specs podaje OBIE: maks. 2000 W
**oraz** znamionowa 1200 W.

---

## WZORCE (reuse preflight — EXEMPLARY-INDEX; rzemiosło, NIGDY wizja/copy)

Dobór 4 wg **trafności + różnorodności** (KAPITALIZACJA-OPS §1). ⛔ Reuse = moduły / rytm sekcji /
mechanika CTA / gęstość dowodu; ⛔ NIGDY paleta / font / archetyp / świat / copy (te = partytura pod
Popiołka). Anty-mode-collapse: celowo mieszam światy wzorców.

| wzorzec | poziom | co REUŻYWAM (rzemiosło) | dlaczego trafny |
|---|---|---|---|
| **ugniatek** | ◽ (1. przebieg wf2, 0 FAIL) | **checkout-inline@2 steps** (`data-zc-product`+`data-zc-api` — skórka tokenami dla `#zamow`), **hero-video (Kling i2v) HERO-STAGE**, **TOR-I demo dwie-formy** (przełącznik jako wzorzec stanów demo), count-up wielkiej liczby, sticky-buy@1, footer@1 | najbliższy technicznie: to samo, czego potrzebuję dla #zamow inline + hero animowalny + demo ze stanami |
| **masazer** | ✅ WZORZEC | **dedykowana sekcja mid-cta**, **demo TOR-I (crossfade stany)**, rytm 14 sekcji, karta oferty na scrimie, sekcja porównania (2 assety: nasz + stary sposób), lightbox | sprzętowo-domowy, wzorcowa mechanika mid-CTA i demo — rdzeń mojego szkieletu |
| **mata** | ✅ WZORZEC (dywersyfikator) | **hero-video-inject**, `lightbox@1`, gęstość sekcji zestaw/porównanie | celowy RÓŻNY świat (fiolet/Fraunces/„kanapka") — trzyma few-shot od kolapsu do jednego świata; ja idę archetypem C, nie D |
| **drapek** | ✅ WZORZEC | **źródło `footer@1`**, `wideo-rail@1` (mechanika kafli — nawet jeśli sekcja wideo = blokada-tomek), `sticky-buy@1`, hero brand-lockup | najbliższy „krępy przedmiot z jednym mocnym akcentem"; ⛔ drapek = 1 z 3 landingów porównawczych → reużywam TYLKO moduły, nie plik/wizję |

⛔ **odpalak/loczek = ANTY-WZORCE** (slivery wideo): jeśli sięgam po ich sekcje — WYŁĄCZNIE moduły
kanoniczne (`wideo-rail@1`, `lightbox@1`), NIGDY plik strony.

**Zasilenie `cross_landing` realną historią:** N=3 poprzednicy (mtime) = **home-zaradek · mata ·
drapek** — partytura Popiołka celowo odbita od nich (patrz PARTYTURA niżej + gate `--cross-only`).

---

## PARTYTURA (decyzje TEGO landingu — uzasadnione; pełny blok tokenów: `TOKENS-MAKIETY.md`)

Każda pozycja „ten produkt/persona prowadzi do…", nigdy „jak poprzednio". Odbicie od 3 poprzednich
(home-zaradek `#1F2A44` Quicksand/Mulish · mata `#5E3A6E` Fraunces · drapek `#E0954A` Baloo 2).

- **font display = Barlow Semi Condensed (700/800)** ⟵ produkt SPRZĘTOWY/WARSZTATOWY → doktryna
  TOKENS: „ciepły grotesk kondensowany"; kondensacja = język ciężkiego sprzętu/tabliczki znamionowej.
  ≠ Fraunces (serif) · ≠ Baloo 2 (rounded) · ≠ Quicksand/Mulish (geometryczne). **Gate font ✓**.
- **font text = Hanken Grotesk (400/600/700)** ⟵ humanist o normalnej szerokości = mocny KONTRAST do
  kondensowanego display; czytelne cyfry do długiej tabeli specs i ceny; ciepły, nie zimny tech.
- **akcent `--cta` = #C2381B** (głęboka przemysłowa czerwień-wermilion) ⟵ **WYPROWADZONY z realnego
  koloru produktu** (CZERWONA pokrywa — triada stal/czerwień/czerń z PASZPORTU). `--cta-ink #FFFFFF`
  (WCAG 5,42:1). ΔE ≥ 39 wobec każdego z 3 poprzednich (navy/fiolet/ochra). **Gate akcent ✓**.
- **rodzina tła = piasek / rozbielony beton (ciepły greige)** `#F3EDE4 / #E9E1D3 / #DACFBC` ⟵ świat
  WARSZTATU/GARAŻU/kominka (TOKENS mapping „warsztat/garaż → piasek"); ciepła, brudno-jasna baza pod
  produkt roboczy. `--ink #1C1815` (ciepły grafit), `--body #2E2620`, `--line #D7C9B3`.
- **sygnatura = S6 znacznik-rożek** (ścięty/kątowy narożnik kart i mediów, ZAWSZE z tej samej strony)
  ⟵ „sprzętowe, mocne, warsztatowe" — echo metalowej klamry/tabliczki; powtórzony w ≥3 sekcjach.
- **archetyp-hero: C** (karta oferty nachodząca na scenę) ⟵ produkt IMPULSOWY z Reels + **mocna
  pojedyncza cena 119 zł**; scena ssania popiołu = jednocześnie ARGUMENT (efekt widoczny gołym okiem)
  i NOŚNIK RUCHU hero-video; karta cena→CTA wjeżdża na dolną krawędź sceny = czysty fold na mobile.
  ≠ archetyp bezpośrednio poprzedniego (home-zaradek = strona główna, brak `archetyp-hero:` → gate SKIP,
  bez kolizji); świadomie NIE „A" (zużyty, 8/12 landingów) i NIE „D" (mata).

---

## MANIFEST SEKCJI

> Format kanoniczny: `` N. `id | typ | status — powód` ``. Rdzeń `hero · zamow · final · mid-cta` = build.
> Klasa DOWODOWA (wideo TikTok/UGC, zdjęcia od kupujących) — agent NIE MA prawa `SKIP`; po protokole
> wyczerpania materiału → `blokada-tomek` (decyzja o „sekcji nie będzie" należy do Tomka).

1. `hero | scenowa | build` — archetyp C; scena ssania popiołu + karta oferty (119 zł → CTA → pay-row) + trust nad foldem (COD/14 dni); HERO-STAGE pod hero-video. **hero-sub wymienia SPEKTRUM (wzór Skrolik): „…jeden sprzęt na popiół, gruz, wodę po zalaniu — i dmuchawa"** (PRIMARY = popiół z kominka prowadzi H1; sub niesie szerokość 3 funkcji, MAPA-ZASTOSOWAN F0.6b).
2. `zaufanie | kodowa | build` — pas COD: płatność przy odbiorze · zwrot 14 dni · wysyłka z Polski (redukcja lęku #1; separator anty-szew hero↔problem).
3. `problem | scenowa | build` — BÓL BEZ produktu: stary sposób (szufelka/domowy odkurzacz), chmura popiołu, syf; ⛔ zero naszego produktu w kadrze (EMOCJA↔PRODUKT).
4. `rozwiazanie | scenowa | build` — produkt WCHODZI jako rozwiązanie: stalowy zbiornik zjada gorący popiół; **triada USP „jedno zamiast trzech"** (stal/żar · bezworkowy 3 filtry · **ssie na sucho, zbiera WODĘ na mokro i zdmuchuje** — dociągnięta woda jako osobna funkcja).
5. `demo | scenowa | build` — „jak działa" 1-2-3 (wepnij → wciągnij popiół/gruz/wodę → wytrzep filtr); **TOR-I** (demo = domyślnie interakcja, kwalifikacja na makietach F2, stany per krok).
6. `zastosowania | scenowa | build` — **MOZAIKA 6 kafli-światów** (kominek/koza · **piec na pellet/kotłownia** · gruz/gips po remoncie · warsztat/garaż/auto · **woda/mokro — tryb WET** · działka/dmuchawa) niosąca **3 FUNKCJE** (sucho · mokro · nadmuch); nagłówek „JEDEN SPRZĘT ZAMIAST TRZECH". ⛔ NIE 4 kafle jednej funkcji — szerokość PROWADZONA (mozaika + hero-sub + triada), nie markowana (MAPA-ZASTOSOWAN F0.6b).
7. `zestaw | kodowa | build` — „9 elementów w zestawie" (packshot g14): 3 filtry, rury, wąż, HEPA, ssawki 2w1, redukcja do elektronarzędzi, instrukcja PL.
8. `porownanie | kodowa | build` — uczciwie: Popiołek vs zwykły domowy odkurzacz; JEDEN realny minus (głośny; drobny pył gładzi = stukaj filtr) wg Z5.
9. `mid-cta | scenowa | build` — DEDYKOWANA sekcja CTA z zaprojektowanym `.btn.cta` (szkielet CTA); scena w ciepłym świetle warsztatu, „Zamów Popiołka — 119 zł, przy odbiorze".
10. `opinie | kodowa | build` — realne recenzje PL (15 treści) + review_stats ★4,72 / 2458 ocen / 650 recenzji **POD foldem**; uczciwie, z kilkoma krytycznymi (Z5).
11. `galeria | kodowa | build` — kurowane realne kadry (g05/g07/g11 po RETUSZU logo, g02/03/04/06/08/09/10, g14) + `lightbox@1`.
12. `wideo | kodowa | blokada-tomek — protokół wyczerpania: oferta Allegro bez wideo (videos_curated=[]), brak kandydatów TT dla źródła Allegro (bud_tt_candidates 0) → materiał do pozyskania; kamień Tomka (KARTA §7).`
13. `ugc-zdjecia | kodowa | blokada-tomek — protokół wyczerpania: bud-reviews/16214946166 puste + 15/15 recenzji snapshotu bez pól images/photos → brak zdjęć od kupujących; kamień Tomka (klasa dowodowa, agent bez prawa SKIP).`
14. `faq | kodowa | build` — `faq-accordion@1` + slot media; uczciwie: głośność, elektryzowanie węża (bez claimu antystatycznego), drobny pył, worki (niepotrzebne), gorący popiół. **+3 pytania SZEROKOŚCI:** „Czy zbiera wodę / na mokro?" (tak — ssawka 2w1 mokro/sucho, op.10 „zbiera wodę") · „Czy działa jako dmuchawa?" (tak — odwrócony nadmuch, op.3) · „Czy odkurzę auto?" (tak, wnętrze/bagażnik — op.4/6/10; UCZCIWIE: op.9 „samochodu się nie odkurzy" = do wąskich szczelin użyj ssawki szczelinowej).
15. `zamow | kodowa | build` — **`#zamow` = moduł checkout-inline** (skórka tokenami; wrapper z `data-zc-product` ORAZ `data-zc-api`); cena 119 zł, COD, packshot; zaprojektowany CTA.
16. `final | scenowa | build` — FINAL CTA: życie z produktem (porządek po każdym paleniu, ciepły salon z kominkiem), zaprojektowany CTA.

**Nie-sekcje (moduły):** `sticky-buy@1` (mobile) · `footer@1` (źródło drapek).

---

## SZKIELET CTA (bramkowany — gate `cta`; ≥4 CTA + dedykowana mid-CTA)

| # | miejsce | typ CTA | etykieta | uwaga makiety |
|---|---|---|---|---|
| 1 | **hero** (#1) | karta oferty: cena → `.btn.cta` → pay-row | „Zamawiam — 119 zł" | ZAPROJEKTOWANY CTA w kadrze (krytyk +11) |
| 2 | **mid-cta** (#9) | DEDYKOWANA sekcja z `.btn.cta` + cena | „Zamów Popiołka" | scena + realny button (nie „dorobek kodera") |
| 3 | **zamow** (#15) | checkout-inline (`data-zc-*`) + `.btn.cta` | „Kup teraz — płacę przy odbiorze" | cena→CTA→redukcja ryzyka |
| 4 | **final** (#16) | `.btn.cta` na scenie życia z produktem | „Zamawiam Popiołka" | zaprojektowany CTA w kadrze |
| 5 | **sticky-buy@1** (mobile) | pasek dolny: cena + `.btn.cta` | „119 zł · Zamów" | moduł, re-CTA |

Makiety `hero · #zamow · mid-cta · final` MUSZĄ nieść ZAPROJEKTOWANY `.btn.cta` (kształt/kontrast/
etykieta akcji, strefa pod cenę, kolejność cena→CTA) — inaczej REGEN makiety.

---

## FUNKCJE KONWERSJI
- Message-match `?h=N` (HOOKS 1–3: popiół z kominka / gruz po remoncie / warsztat+auto) — h1+sub.
- `#zamow` checkout-inline Trevio (COD), sticky-buy mobile, mid-CTA dedykowana.
- Trust nad foldem: COD + zwrot 14 dni + wysyłka z Polski (⛔ ★/liczby opinii nad foldem).
- Uczciwe porównanie + FAQ (realne minusy) = redukcja ryzyka > social-proof (persona lęk #1 = scam).
- JSON-LD Offer (119 zł) + AggregateRating (4,72/2458) — structured data (nie nad foldem wizualnie).

## ANTY-MISMATCH (CLAIM → ŹRÓDŁO) — skrót; pełne kotwice w KARCIE
- „znosi gorący popiół" → spec: zbiornik stal nierdzewna, żaroodporny.
- „bez worków, 3 filtry na przemian" → spec Bezworkowy + zestaw 3× filtr + op. 11/13.
- „zdmuchniesz liście / uprzątniesz teren" → spec funkcja dmuchawy + op. 3.
- „zbierze pył, popiół i wodę" → zestaw ssawka 2w1 mokro/sucho + op. 10.
- „lekki, 4,7 kg" → spec Waga 4,7 kg + op. 4/7/13.
- „moc maksymalna 2000 W (turbo)" → spec Maksymalna moc 2000 W (+ znamionowa 1200 W w tabeli).
- ⛔ CUT: „antystatyczny", „99,99%", „najlepszy/bez kompromisów", Prüfengel jako claim jakości,
  marka Lehmann/Haddo, sprzedawca, sold 547 jako licznik.
