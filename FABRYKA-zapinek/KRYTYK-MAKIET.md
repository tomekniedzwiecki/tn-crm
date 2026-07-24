# KRYTYK MAKIET — ZAPINEK · gate F2 · 2026-07-24

Rola: bezlitosny art director + CRO. Ocena SAMA (nic nie generuję, nie piszę do bazy, nie commituję).
Wejście: 22 makiety (11 sekcji × d/m) + `brand/00-styl-master.png`. Kontrakty: `PLAN.md` · `PRZEWODNIK-GRAFICZNY.md`
· `TOKENS-MAKIETY.md` · `PASZPORT.md` · `KARTA-PRAWDY.md` · STANDARD F2 (linie 560–800).

---

## TABELA WERDYKTÓW

| sekcja | d/m | werdykt | uwaga (1 linia) |
|---|---|---|---|
| 00 styl-master | — | **PASS** | Komplet DNA (paleta+2 fonty+radius+ikony+trust-pill+głębia+stitching+PRODUKT+ŚWIAT); to plansza, nie druga hero. |
| 01 hero | d | **PASS** | Archetyp B: scena full-bleed wtopiona w papier (nie pocztówka), karta-oferty 19,90+CTA+pay w kadrze, nośnik ruchu (zieleń+światło za szybą) obecny — pasmo trochę wąskie (P2). |
| 01 hero | m | **PASS** | Fold z ofertą: H1→sub→karta(cena→CTA→pay)→scena ~30% (≤45%); ten sam beagle; karta NIE nachodzi na scenę (dopuszczalne dla B, P2). |
| 02 trust | d | **PASS** | 3 filary transakcyjne, hairline dividery, stitching fiolet u dołu; zero ★/liczników; ikony outline charcoal. |
| 02 trust | m | **PASS** | Poprawny reflow do pionu (stos, nie ściśnięta trójka); stitching fiolet. |
| 03 zastosowania (TOR-I) | d | **PASS** | Pokazuje OBA STANY jako demonstrację (auto/spacer), toggle „W aucie/Na spacerze" aktywny=fiolet, 41–71 cm; obie funkcje mają własny nośnik. |
| 03 zastosowania (TOR-I) | m | **PASS** | Toggle full-width + dwa stany stackowane pionowo; ten sam beagle/golden co desktop. |
| 04 montaz | d | **PASS** | Demo 1-2-3 (osobne kadry), numeracja 01/02/03 WEWNĄTRZ sekcji (dozwolona), dłonie bez twarzy, czarna skóra oparcia, alternatywny zamek — pełne diakrytyki. |
| 04 montaz | m | **PASS** | 3 kroki w pionie z łącznikiem (nie 3 obok siebie); spójne z desktop. |
| 05 detale | d | **PASS** | Bento asymetryczne makr na realnej tapicerce, 360°, czarna klamra, 1 kwiatek fiolet/żółty; najwyższy „drogi projekt". |
| 05 detale | m | **PASS** | Reflow do 2×2; te same makra; ikony spec charcoal. |
| 06 mid-cta | d | **PASS** | Full-bleed czarny wariant (kwiatek niebiesko-różowy = zgodny z PASZPORT), copy na scrimie LEWO, 19,90+CTA+pay. |
| 06 mid-cta | m | **PASS** | Scena góra / oferta dół; ten sam szczeniak/wariant. |
| 07 galeria | d | **POPRAWKA** | 8 kafli ~1/1 mapują 8 keep; ALE pigułki-podpisy JASNE — na mobile CIEMNE → rozjazd d↔m (ujednolicić). |
| 07 galeria | m | **POPRAWKA** | 2-kol reflow OK; pigułki ciemne (patrz wyżej — jeden styl w OBU). |
| 08 wideo | d | **PASS** | 5 pionowych kart rail, play-buttony, podpis „Zapinek w użyciu" (nie „opinie"), zero liczb odtworzeń. |
| 08 wideo | m | **PASS** | Rail poziomy z peekiem następnej karty; te same klipy. |
| 09 faq | d | **PASS** | 8 pytań = plan, pierwszy otwarty (40–55 cm), sticky packshot obok, +/− charcoal. |
| 09 faq | m | **PASS** | Akordeon full-width + media pod spodem; reflow poprawny. |
| 10 zamow | d | **REGEN (slot)** | Fake-dane: swatche **Beżowy/Biały/Brązowy** NIE istnieją w KARTA-PRAWDY §4 (są: Jasnoniebieski/Pomarańczowy/Czarny B). Reszta (form, 19,90, pay-badges, scena rozpoznawcza) PASS. |
| 10 zamow | m | **REGEN (slot)** | Ten sam wymysł kolorów + widocznych 7 swatchy zamiast 8; „Płatność online" dodane (poza SSOT — do weryfikacji). |
| 11 final | d | **PASS** | Full-bleed relacja (kobieta 30+ bez stockowego uśmiechu, golden z własną obrożą), copy PRAWO (zig-zag), torn-paper scrim = klasa; 19,90+CTA+pay. |
| 11 final | m | **PASS** | Scena góra / oferta dół; ten sam bohater; spójne. |

---

## WERDYKT ZBIORCZY: **PASS-Z-POPRAWKAMI**

Seria jest spójna, dojrzała i realnie „droga" — jeden system: Fraunces display ↔ Manrope, ciepła kość
słoniowa, JEDEN akcent fioletu w poprawnym scope (CTA/toggle/stitch/wybrany wariant), ikony outline charcoal,
sygnatura stitching powtarzana w ≥8 sekcjach, realna fotografia, asymetryczne bento, editorialowe eyebrow+serif.
Wierność produktu (PASZPORT) trzymana wszędzie: czarne plastikowe klamry, srebrny trójkątny ring, obrotowy
karabińczyk, JEDEN kwiatek (fiolet/żółty; czarny wariant = niebiesko-różowy w mid-cta), zero logo na taśmie,
psy z własną obrożą, zero scen strachu/wypadku. Ceny 19,90 zł literka-po-literce wszędzie; liczby wyłącznie
dozwolone (41–71 · 40–55 · 360°); ZERO ★/liczników/„sold". HERO przechodzi twardy punkt HERO-STAGE (pod animację,
jedna scena, oferta w kadrze, scena osadzona nie pocztówka).

**Jedyny blocker akceptu** = fake-dane na swatchach `10-zamow` (gate fake-danych działa NA MAKIECIE → slot-regen,
nie edycja w kodzie). Reszta to kosmetyka spójności.

### P1 — BLOKUJE AKCEPT (fake-dane, twarde)
1. **`10-zamow` d + m — swatche kolorów niezgodne z SSOT.** Makieta oferuje **Beżowy · Biały · Brązowy** — tych
   wariantów NIE MA w `KARTA-PRAWDY.md §4`. Prawdziwe 8 SKU: Fioletowy · Czarny · Czerwony (3× foto) + Jasnoniebieski
   · Granatowy · Różowy · Pomarańczowy · Czarny B (5× nazwana próbka). Regeneracja slotu swatchy w OBU (d+m) z
   poprawnym promptem: usunąć Beżowy/Biały/Brązowy → Jasnoniebieski/Pomarańczowy/Czarny B; mobile ma pokazać
   pełne 8 (widać 7). Foto tylko fiolet/czarny/czerwony, reszta jako kolorowe próbki NAZWAMI — mechanika OK.

### P2 — KOSMETYKA (nie blokuje akceptu; do domknięcia w regenie makiet lub tokenach kodu F4)
1. **Diakrytyki niespójne w SERII makiet.** `04-montaz`, `05-detale-m`, `07-galeria` mają pełne ą/ł/ż; `01-hero`,
   `02-trust`, `06-mid-cta`, `11-final`, `10-zamow`, `03/09` bez (zaglowek/tasma/platnosc). Artefakt renderu
   gpt-image — makieta wiąże układ/styl, NIE glify; **twardy warunek: kod F4 MUSI renderować pełne polskie
   diakrytyki z webfontu** (Fraunces/Manrope latin-ext). Zalecane wyrównać choć hero/zamow przy okazji regenu.
2. **Galeria — pigułki-podpisy: desktop JASNE vs mobile CIEMNE.** Złamanie „jeden styl trust-pill (desktop==mobile)".
   Ujednolicić jeden styl w OBU (rekomendacja: ciemna pigułka z białym tekstem — czytelniejsza na zdjęciach).
3. **Kolor eyebrow niespójny.** `08-wideo` i `10-zamow` mają eyebrow FIOLETOWY; pozostałe 8 sekcji charcoal.
   Eyebrow poza scope akcentu — ujednolicić na charcoal (fiolet zostaje tylko na stitchingu pod eyebrow).
4. **Hero — pasmo ruchu wąskie.** Zieleń/światło za szybą obecne, ale niezbyt dominujące. Dla tego testu wideo
   hero jest OFF (decyzja Tomka), więc nie blokuje; przy ożywieniu poszerzyć strefę ruchu w górnym oknie.
5. **Hero-m / mid-cta-m — karta oferty nie nachodzi na scenę** (wzorzec Drapek „ujemny margines"). Dopuszczalne dla
   archetypu B (copy-first), ale w kodzie warto rozważyć overlap dla mocniejszego foldu.
6. **`10-zamow-m` — „Płatność online" jako druga opcja** (desktop ma tylko „Płatność przy odbiorze" + badge). Zweryfikować
   z modelem płatności (COD-first) — jeśli online nie jest w ofercie, usunąć przy regenie slotu.

### Nota (nie-defekt, świadome)
- Beagle w hero/galerii ma **fioletowe szelki** ~w kolorze taśmy (kanon g1). Zgodne z PASZPORT (pies ma własne
  szelki), ale wizualnie zlewa się z produktem; w zastosowaniach/montażu/mid-cta psy mają brązowe/czarne obroże =
  czytelniej. Bez akcji — wierne źródłu g1.

---

## 3 NAJMOCNIEJSZE
1. **`05-detale`** — asymetryczne bento makr na realnej tapicerce, głębia skalą+temperaturą, spec-ikony charcoal,
   360°/klamra/kwiatek zakotwiczone. Tu najbardziej „czuć produkt" i widać rękę projektanta.
2. **`04-montaz`** — demo 1-2-3 z realnymi dłońmi na perforowanej skórze, poprawna numeracja krokowa, alternatywny
   zamek; wzorcowy reflow do pionu na mobile.
3. **`01-hero` + `11-final`** — archetyp B ze sceną wtopioną w papier (nie karta/pocztówka), oferta w kadrze;
   final z torn-paper scrimem i castingiem relacji = editorialowa klasa. Plus stitending jako spójna sygnatura serii.

## 3 NAJSŁABSZE
1. **`10-zamow` (d/m)** — wymyślone kolory swatchy (Beżowy/Biały/Brązowy) ≠ 8 realnych SKU = FAIL gate fake-danych.
2. **Niespójność diakrytyków** w całej serii makiet — zestaw nie czyta się jako jeden system typograficzny (ostrzeżenie
   pod kod F4).
3. **Drobne rozjazdy „jednego systemu"** — pigułki galerii d↔m + kolor eyebrow (2 sekcje fiolet vs 8 charcoal).

## OCENA „DROGI PROJEKT": **8 / 10**
Spójny, editorialowy system z charakterem (opiekuńczy serif + czysty sans, jeden dyscyplinowany akcent, ciepła
głębia, realna fotografia, stitching-sygnatura, asymetryczne bento) — zdecydowanie NIE AI-generyk (brak gładkich
płaskich teł, równych siatek, wyśrodkowanych splitów 50/50 poza uzasadnionym dyptykiem TOR-I). Do 9–10 brakuje:
wyrównania diakrytyków, ujednolicenia pigułek/eyebrow i domknięcia fake-danych na swatchach. Po slot-regenie
`10-zamow` seria jest gotowa do akceptu.

---
**Ścieżka pliku:** `C:\repos_tn\tn-crm\FABRYKA-zapinek\KRYTYK-MAKIET.md`
