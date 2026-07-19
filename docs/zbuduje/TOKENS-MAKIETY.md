# TOKENS-MAKIETY — SSOT mikro-tokenów makiety (STYLE-DNA landingu)

**Status: OBOWIĄZUJE (2026-07-19, „pełny zestaw ulepszeń designu makiet" — decyzja Tomka po
syntezie 3 analiz: audyt procesu + research desktop + research mobile).** Jeden plik na landing
codyfikuje DNA wizualne jako TWARDE tokeny tekstowe. Powód powstania: makiety A/B/C jednego
landingu dryfowały (inny styl ikon outline↔filled, trust-pill raz biały raz amber, różne
radiusy galeria vs demo, amber rozlany poza CTA) — bo „STYLE-DNA z głowy" pisano od nowa per
makieta. Tokeny domykają ten dryf SYSTEMOWO: jedno źródło, wstrzykiwane do KAŻDEGO promptu.

---

## PO CO (i dlaczego to zamyka dryf A/B/C/radius/ikon)

Bez wspólnego SSOT każda makieta sekcji dostaje własną, lekko inną interpretację palety, fontów,
radiusa i ikon → strona wygląda jak sklejona z 3 projektów. TOKENS-MAKIETY.md = **jeden akapit
STYLE-DNA**, identyczny w prompcie hero, każdej sekcji i każdej pary mobile → wszystkie generacje
dzielą DOKŁADNIE te same hexy, role, radius, styl ikon i trust-pill. Koniec z „kafle demo
kwadratowe, galeria xl", „ikona korzyści outline, ikona materiału filled", „trust-pill raz
kremowy raz pomarańczowy".

**To jest źródło akapitu „STYLE-DNA tekstowe w KAŻDYM prompcie" (STANDARD §F2)** — nie duplikat,
tylko jego JEDYNE, wypełnione konkretami źródło. Wcześniej ten akapit składano ad-hoc; teraz
pochodzi z tego pliku 1:1.

---

## KIEDY i GDZIE

- **Generowany w F2.5** (krok panelu `lp_styl_marka`), zaraz po **STYL-MASTERZE** (F2 pkt 1) —
  bo styl-master = plansza DNA (specimen: paleta z rolami, 2 fonty z rolami, swash, plusiki,
  radius, styl ikon, trust-pill, próbka głębi), z której agent SPISUJE tokeny. Kolejność:
  F1.7 przewodnik → **styl-master → TOKENS-MAKIETY.md** → hero-makieta → makiety sekcji → pary mobile.
- **Wstrzykiwany do KAŻDEGO promptu makiety** (hero, każda sekcja, każda para mobile) jako
  niezmienny akapit STYLE-DNA — obraz styl-mastera jako ref + TEN tekst razem są stabilniejsze
  niż sam obraz (STANDARD §F2 „STYLE-DNA tekstowe").
- **Per-landing (Z6):** F2.5 WYPEŁNIA tokeny konkretami TEGO landingu. Niezmienna jest
  **STRUKTURA RÓL** (display vs label/liczby vs body; amber-scope; jeden radius; jeden styl ikon;
  jeden trust-pill; skala 8pt; skala typo). Zmienne per-landing są KONKRETY (drugi font, hexy
  palety, wybór filled|outline) — to one dają unikatowość, nie łamanie ról.
- Zapis: `FABRYKA-*/<slug>/TOKENS-MAKIETY.md`. Chip w panelu (`lp_styl_marka`, pole `tokens_url`).

---

## FORMAT (blok tokenów — F2.5 wypełnia kolumnę „konkret TEGO landingu")

Nazwy zmiennych = te same, których używają moduły kanoniczne (`moduly/*.html`: `--paper*`,
`--line`, `--ink`, `--body`, `--cta`, `--radius-lg`, `--shadow-*`) — koder wkleja `:root{}` bez
tłumaczenia nazw (spójność z modułami + z blokiem `ir.root.css` w F4).

### 1. FONTY — 2 kroje z KONTRASTEM (koniec mono-Baloo)

| token | rola | reguła (niezmienna) | konkret (F2.5 per-landing) |
|---|---|---|---|
| `--font-display` | marka / H1 / H2 / duże liczby-jako-grafika | zaokrąglony, ciepły display = **twarz marki**; domyślnie **Baloo 2**, dopuszczalny inny zaokrąglony-ciepły display (Z6) | np. „Baloo 2 700/800" |
| `--font-text` | **eyebrow · LICZBY · CENY · wymiary · długie akapity · label UI** | WYRAZISTY, ciepły: humanist (Nunito Sans / Mulish / Fraunces-soft) LUB ciepły grotesk kondensowany. **⛔ ZIMNY tech (Inter/Helvetica/Roboto/system-ui sam) = FAIL kalibracji premium.** Humanist „rymuje" z Baloo zaokrągleniem, podnosi czytelność i klasę | np. „Nunito Sans 400/600/800" |
| `--font-accent` | swash `.hi`/`.ac` (kursywny akcent pod 1 słowem) | opcjonalny 3. krój TYLKO na swash (np. Fraunces italic) — nie liczy się jako „para" | np. „Fraunces italic 500" |

**Reguła twarda:** mono-typeface (jeden krój na display+liczby+ceny+body) = **łagodny kontrast =
FAIL** (research premium 17.07). Display i text MUSZĄ być rozróżnialne na pierwszy rzut oka.

### 2. PALETA + ROLE (z REGUŁĄ amber-scope)

| token | rola | reguła amber-scope | konkret (F2.5) |
|---|---|---|---|
| `--paper` / `--paper-2` / `--paper-3` | tła sekcji (warstwowe: jasne→ciemniejszy beż) | **⛔ ZAKAZ ciemnych teł/neonu.** Kremowe/beżowe zawsze | np. `#FAF5EC / #F3EADA / #EADFCB` |
| `--ink` | nagłówki + **WSZYSTKIE ikony funkcjonalne** (korzyści/materiał/kroki/lupa/FAQ +−) | charcoal = ciepły grafit; **ikona funkcjonalna NIGDY amber** | np. `#2A211B` |
| `--body` | tekst akapitowy | ciepła prawie-czerń/głęboki brąz; **⛔ `#000`, ⛔ mglisty jasny `#6E6053`** (za jasny na długiej stronie) | np. `#33281F` |
| `--line` | hairline 1px, plusiki „+", crop-marks | ciepły szarobeż, nie szary neutralny | np. `#DFD3BF` |
| **`--cta`** | **AMBER = JEDYNY akcent** | **scope TWARDY: TYLKO {przycisk `.btn.cta` · swash `.hi`/`.ac` pod 1 słowem · gwiazdki ratingu ★}. NIC WIĘCEJ.** ⛔ ikony, lupa, kroki demo, materiał, trust-pill, dividery | np. `#E08A2B` |
| `--trust-pill` | pigułka zaufania (chip „14 dni", „za pobraniem") | **JEDEN styl globalnie** = fill kremowy (`--paper`) + tekst/border `--ink` (charcoal). ⛔ raz biały raz amber | fill `--paper`, border `--line`, tekst `--ink` |

> **Nota spójności z kodem:** STANDARD §3 (l. „NIE zmieniać samego tokena `--cta`") zabrania
> REMAPOWANIA wartości `--cta` w trakcie budowy (dzielą go węzły, które historycznie były ciepłe).
> To reguła KODU (nie mutuj żywego tokena). Amber-scope to reguła DESIGNU MAKIETY: **na nowej
> makiecie ikony funkcjonalne od początku są rysowane w charcoal (`--ink`), więc nie odwołują się
> do `--cta` w ogóle** — sprzeczności brak. Przykład dryfu do wyeliminowania: FAQ +/− na `--blush`
> (moduł `faq-accordion@1`) → nowa makieta/skóra rysuje +/− w `--ink`.

### 3. GŁĘBIA — warstwowe CIEPŁE cienie + grain (koniec jednego czarnego cienia)

| token | reguła | konkret (F2.5) |
|---|---|---|
| `--shadow-sm` / `--shadow-md` / `--shadow-lg` | **3-4 warstwy: key przy krawędzi + ambient miękki**, tint **brązowo-sepiowy** `rgba(80,50,20,α)`, α **0.06–0.12**. ⛔ jeden twardy `0 10px 30px rgba(0,0,0,.3)` = tanio | np. `0 1px 2px rgba(80,50,20,.06), 0 8px 24px rgba(80,50,20,.10)` |
| `--grain` | subtelny grain/noise **2–4%** na kremowych tłach = analogowe ciepło; SVG `feTurbulence` opacity ≤`.05`, JEDNO źródło (nie PNG) | `feTurbulence baseFrequency ~.9, opacity .04` |

### 4. RADIUS — jeden dla całej serii

| token | reguła | konkret (F2.5) |
|---|---|---|
| `--radius-lg` (+ `--radius-sm` dla drobnych) | **JEDEN radius serii** na wszystkich kartach/media/galerii/demo/kaflach. ⛔ galeria xl + demo kwadrat (dziś rozjazd) | np. `--radius-lg:20px; --radius-sm:12px` |

### 5. STYL IKON — filled ALBO outline (jeden, trzymany wszędzie)

| token | reguła | konkret (F2.5) |
|---|---|---|
| `--icon-style` | **WYBÓR: `filled` LUB `outline`** — trzymany w OBU viewportach i we WSZYSTKICH sekcjach. Rozjazd (outline↔filled między sekcjami / desktop↔mobile) = regeneracja. Kolor = `--ink` (charcoal), NIE amber | np. `outline, stroke 1.75px, --ink` |

### 6. SKALA 8pt (rytm + hojny whitespace = luksus)

| token | reguła | konkret (F2.5) |
|---|---|---|
| `--s1..--s7` | twarda siatka **8/16/24/32/48/64/96px** — wszystkie odstępy z tej drabiny (koniec 58px ad-hoc) | `8·16·24·32·48·64·96` |
| padding sekcji | desktop **96–128px**, mobile **64–80px** między głównymi sekcjami | `--sect-pad-d:112px; --sect-pad-m:72px` |
| szerokość treści | **~1160–1200px**; kolumna tekstu **50–75 znaków** | `--content-w:1180px` |

### 7. SKALA TYPO (modularna)

| token | reguła | konkret (F2.5) |
|---|---|---|
| skala | **Perfect Fourth 1.333** (Fifth 1.5 dla wielkiego H1) | ratio 1.333 |
| `--h1-d` / `--h1-m` | H1 desktop **56–80px**; **H1 mobile FLOOR 36–40px** (dziś 31px = za skromnie = FAIL) | `clamp(38px,8vw,72px)` |
| `--body-fs` | body **16–18px**, line-height **1.5–1.6** | `17px / 1.55` |
| eyebrow | ALL-CAPS, tracking **0.2em**, `--font-text`, `--ink` | — |

---

## PRZYKŁAD WYPEŁNIONY (ilustracja — F2.5 podmienia na konkrety landingu)

```
FONTY:   display = Baloo 2 (700/800) → marka, H1, H2, wielkie liczby
         text    = Nunito Sans (400/600/800) → eyebrow, CENY, LICZBY, wymiary, akapity, label
         accent  = Fraunces italic (500) → swash pod 1 słowem
PALETA:  --paper #FAF5EC · --paper-2 #F3EADA · --paper-3 #EADFCB
         --ink #2A211B (nagłówki + WSZYSTKIE ikony funkcjonalne, charcoal)
         --body #33281F (akapity — ciepła prawie-czerń, nie #000, nie mglisty jasny)
         --line #DFD3BF (hairline, plusiki)
         --cta  #E08A2B  →  AMBER TYLKO: przycisk CTA + swash + gwiazdki ratingu
         trust-pill: fill --paper, border --line, tekst --ink (JEDEN styl wszędzie)
GŁĘBIA:  --shadow-md: 0 1px 2px rgba(80,50,20,.06), 0 10px 26px rgba(80,50,20,.10)  (sepia, nie czarny)
         --grain: feTurbulence, opacity .04 na kremie
RADIUS:  --radius-lg 20px / --radius-sm 12px  (jeden dla serii)
IKONY:   outline, stroke 1.75px, kolor --ink  (trzymane wszędzie, desktop==mobile)
8pt:     8·16·24·32·48·64·96 · sekcja desktop 112 / mobile 72 · content-w 1180 · kolumna 50–75 zn.
TYPO:    ratio 1.333 · H1 desktop clamp 56–80 · H1 mobile floor 38 · body 17/1.55 · eyebrow caps 0.2em
```

---

## GATE (egzekucja)

- **F2.5 zamknięty dopiero z TOKENS-MAKIETY.md** — plik obowiązkowy artefaktu `lp_styl_marka`
  (chip w panelu). Docelowo w `files.wymagane` gate-check + reguła w `panel_sync doc_wymagane`
  (analogicznie do `WIERNOSC.md`): brak pliku = FAIL fazy. **Dopisać wiersz w `gate-manifest.json`
  ZANIM tokeny wejdą na stałe do fabryki** (patrz STANDARD §1: nowy artefakt bez wiersza w
  manifeście = etap niekompletny) — to jedyna zmiana KODU/konfiguracji poza docs, świadomie
  wydzielona do osobnego przebiegu.
- **KRYTYK makiet (F2, przed akceptem)** sprawdza zgodność KAŻDEJ makiety z tokenami — checklista
  STYLE-DNA (STANDARD §F2, bullet „🎯 STYLE-DNA MAKIET"): para fontów z realnym kontrastem?
  amber tylko CTA+swash+rating (ikony charcoal)? jeden styl ikon i jeden radius w całej serii?
  jeden styl trust-pill? głębia = warstwowe ciepłe cienie? Rozjazd tokenu na makiecie =
  regeneracja makiety (nie łatanie kodem — Z2).

---

## GRANICE (czego tokeny NIE robią)

- Nie zastępują **makiety** (Z2 — makieta jest święta); tokeny to WSPÓLNY słownik stylu, makieta
  to konkretny layout sekcji.
- Nie łamią **Z6** — struktura ról jest wspólna, konkrety (drugi font, hexy, filled|outline)
  różnicują landingi. Dwa landingi z tą samą strukturą ról, ale innym `--font-text`/paletą =
  poprawnie unikatowe.
- Nie ruszają **mechaniki modułów** (`MODULY.md`) — moduł skóruje się TOKENAMI, proporcje i JS
  nietykalne. Tokeny to skóra, moduł to szkielet.
- Wszystko MUSI mieścić się w **clinical-warmth**: kremowe/beżowe tła, amber jako JEDYNY akcent,
  display zaokrąglony-ciepły, klimat domowy. ⛔ ciemne tła, neon, zimne tech-fonty, >3 kolory,
  ★/liczby opinii nad foldem (persona lęk #1 = scam — redukcja ryzyka > social proof; STANDARD §4).

---

## POWIĄZANIA
- **STANDARD-LANDING-SKLEPY.md** — §F2 (STYL-MASTER pkt 1 = plansza DNA → tokeny; bullet
  „🎯 STYLE-DNA MAKIET" = reguły + checklista KRYTYKA; F2.4 pary), §2 ZASADY WIZUALNE
  (amber allow-list, DNA typograficzne), §5 (budżet fontów: 2 kroje), §1 mapa faz (`lp_styl_marka`).
- **PRZEWODNIK-GRAFICZNY.md** (F1.7) — karta sekcji nosi detale UI (ikony charcoal/amber,
  trust-pill, mikro-interakcja, hero ostra fotografia, FAQ media), formalizowane tu w F2.5.
- **moduly/MODULY.md** — nazwy tokenów = kontrakt skórowania modułów; `faq-accordion@1` ma slot
  `.faq-media` (użyć — koniec „gołego akordeonu").
- **SEKCJA-Z-MAKIETY.md** (F4) — `ir.root.css` wkleja `:root{}` z tymi tokenami 1:1 (zakaz
  re-aproksymacji zmierzonych wartości).
