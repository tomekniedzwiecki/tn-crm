# ETAP 1 — DIRECTION: audyt + manifesto + baseline decision (OBOWIĄZKOWY)

> **Safety rules:** [`reference/safety.md`](reference/safety.md) — zasady bezwarunkowe, obowiązują niezależnie od kierunku.

## Kiedy uruchomić

Po ETAP 0 (walidacja danych Supabase). **PRZED jakąkolwiek linią HTML.**

## Dlaczego tu, a nie później

Historycznie (do 2026-04) ten etap był „2.5" — uruchamiany PO wygenerowaniu HTML. Efekt: Claude wybierał baseline z tabeli 6 presetów bez audytu produktu, a manifesto było „poprawkowaczem po fakcie". To powodowało dryf kierunku (Editorial↔Panoramic Calm) bez danych workflow.

**Obecnie:** manifesto PRZED HTML = baseline jest **skutkiem** audytu, nie zgadywanką z tabeli. Patrz [`CHANGELOG.md`](CHANGELOG.md).

## Input

- UUID workflow z walidacji ETAP 0
- `brand_info` z `workflow_branding` (Supabase)
- `report_pdf` z `workflow_reports` (strategiczny — persony, pain points)
- `workflow_products` (opcjonalnie — jeśli brak, dedukcja z brand_info)

## Output

- `landing-pages/[slug]/_brief.md` — **commitowany** (persystentny brief projektu)
- Zdecydowany baseline (`paromia` / `vitrix` / `h2vital` / `pupilnik` / `vibestrike` / `kafina`) **LUB** decyzja `MODE=forge`
- `bash scripts/verify-brief.sh [slug]` exit 0 (wymagane do przejścia do ETAP 2)

---

## Zasada fundamentalna

**NIE PYTAJ użytkownika o kierunek.** Autonomicznie pobierz dane z Supabase i zdecyduj sam. Jeśli brak danych → zgadnij na podstawie kategorii produktu i tagline, potem zapisz w manifesto dlaczego.

Manifesto to **kontrakt z samym sobą**. Jeśli nie umiesz go napisać w 5 linijkach — nie wiesz co robisz. Wróć do raportu PDF.

---

## Krok 1 — Audyt produktu (5 pytań, autoresearch)

Odpowiedz na każde pytanie **po pobraniu danych**, nie z głowy. Źródła: `workflow_branding` (brand_info), `workflow_reports` (report_pdf), `workflow_products`, mockupy.

### 1.1 Kategoria podwójna
- **Funkcjonalna** (co robi): np. „robot do mycia okien", „parownica ręczna", „podkład pod dziecko"
- **Emocjonalna** (co DAJE klientowi): **spokój / status / kontrola / zabawa / ulga / identyfikacja**

> Kierunek wizualny odpowiada kategorii EMOCJONALNEJ, nie funkcjonalnej. Robot do okien może sprzedawać „kontrolę" (tech minimalism) ALBO „wolny weekend" (lifestyle warm) — to dwa różne landingi.

### 1.2 Persona główna z raportu PDF
Skopiuj z sekcji „Grupa docelowa" raportu dosłownie:
- Wiek
- Płeć / sytuacja rodzinna
- Zawód / dochód
- **Inspiracje wizualne** (jeśli raport ich nie podaje — dedukuj: „30-letnia HR-owka z Warszawy, capsule wardrobe" → Cos, Arket, Kinfolk magazine; „45-letni przedsiębiorca, SUV, domek pod Warszawą" → Mercedes, Rolex marketing, Wine Spectator)

### 1.3 Price point i pozycjonowanie cenowe
- Budget (< 300 zł) → energia, zabawa, kolory nasycone
- Mid (300–1000 zł) → czystość, przestrzeń, jeden odważny akcent
- Premium (1000–3000 zł) → powaga, edytorialność, rzadki akcent złota/mosiądzu
- Luxury (> 3000 zł) → cisza, dużo pustego miejsca, Didone / Didot, subtelność

### 1.4 Moment i częstotliwość użycia
- **Codzienność** → ergonomia, jasne ikony, prostota
- **Rytuał tygodniowy** → okazja, estetyka „vibu" (np. niedzielne sprzątanie, wieczorny masaż)
- **Okazja / prezent** → dramatyzm, unboxing, storytelling

### 1.5 Od czego uciekać (anty-referencje)
- **Bezpośredni konkurenci** (wpisz 3 marki) — ich estetyka = czego Twój landing NIE może przypominać
- **AI-slop patterns** (zawsze unikaj): purple-to-blue gradient, checkmark ✓ tabele, neon glow orbs na wszystkim, generic bento z identycznymi kartami, border-left: 4px solid

---

## Krok 2 — Moodboard z 3 realnych marek (NIE z naszej biblioteki)

**KRYTYCZNE:** referencje wizualne ciągnij **spoza e-commerce landingów** (i **spoza `landing-pages/`**). Po co: unikniesz zamkniętej pętli stylistycznej.

### Skąd czerpać

| Kategoria produktu | Dobre referencje |
|---|---|
| Premium AGD / tech | Dyson, Apple, Bang & Olufsen, Vitsœ, Leica |
| Wellness / beauty | Aesop, Le Labo, Byredo, Glossier, Vacation |
| Home / lifestyle | Muji, Tekla, HAY, Loro Piana, The Row |
| Pet / kids / fun | Bark, Mini (cars), Graza, Omsom, Liquid Death |
| Architecture / spatial | Kinfolk magazine, Cereal magazine, Herman Miller, Knoll |
| Food / drink | Dough, Ghia, Partake, Fly by Jing |
| Tech / SaaS (tylko dla elementów) | Linear, Vercel, Stripe, Arc Browser |
| Workwear / outdoor | Filson, Red Wing, Yeti, Cereal „Tools", Patagonia |

### Format zapisu
Dla każdej z 3 marek wybierz **JEDNĄ rzecz** do pożyczenia. Nie więcej. To zmusza do selektywności.

```
Ref 1: Dyson → mikrotypograficzne bloki danych technicznych (Space Mono 10px uppercase nad headline)
Ref 2: Muji → paleta papierowa (off-white #F8F6F1, zamiast czystej bieli), dużo pustego miejsca między sekcjami (180px padding)
Ref 3: Linear → kolorowe gradienty w detalach (radial gradient w rogu karty, nie pełne tło)
```

**Zabronione referencje:** inne landingi z `landing-pages/` (zamknięta pętla), Midjourney gallery (AI slop), Dribbble (trend slop), generyczne „modern minimalist" template'y.

---

## Krok 3 — Design Manifesto (5 linijek)

Zapisz w `landing-pages/[slug]/_brief.md` dokładnie w tym formacie:

```markdown
# [MARKA] — Design Manifesto

## Kierunek: [NAZWA WŁASNA]
Nie z presetu. Nazwa musi opisywać mood, nie kategorię. Przykłady dobrych: "Panoramic Calm", "Clinical Warmth", "Workshop Precision", "Sunday Slow", "Nocturne Minimal".

## Tempo
[spokojne / rytmiczne / energiczne / dramatyczne / ciche]
Jedno słowo. Decyduje o padding sekcji, długości animacji, gęstości tekstu.

## Typografia
Display: [font] — [dlaczego, np. "geometryczne litery jak inżynierskie rysunki techniczne"]
Body: [font] — [czytelny, neutralny]
Accent: [font] — [monospace/editorial/script, użycie w 2-3 miejscach max]

## Paleta 60/30/10
Dominant 60%: [kolor + hex] — jak „oddech" strony
Secondary 30%: [kolor + hex] — główny charakter marki
Accent 10%: [kolor + hex] — użyty TYLKO w: [lista 3 miejsc max]

## Signature element
Jedna rzecz wizualna, którą klient zapamięta. Nie „gradientowy border" — to nikt nie zapamięta. Przykłady mocne: „monumentalna liczba 5800 PA w stylu zegara kolejowego nad hero", „każda sekcja ma własny numer N/10 w rogu jak w gazecie", „produkt otoczony siatką architektoniczną jak rysunek techniczny".

## Od czego świadomie uciekam
[3-5 wzorców z Kroku 1.5]
```

---

## Krok 4 — Walidacja anty-generic

Po napisaniu manifesto odpowiedz szczerze:

### 4.1 Test unikalności
Czy dokładnie TEN manifesto pasowałby do 5 innych produktów?
- TAK → manifesto jest za ogólne. Wróć do Kroku 1, znajdź coś specyficznego dla produktu.
- NIE → przejdź dalej.

### 4.2 Test ryzyka
Czy w manifesto jest przynajmniej JEDEN element, który ryzykuje (może się klientowi nie spodobać)?
- NIE → to szablon. Dodaj coś odważnego (kolor, typografia, layout move).
- TAK → przejdź dalej. Ryzyko = charakter.

### 4.3 Test portfolio
Czy pokazałbyś ten landing jako case study swojemu najlepszemu klientowi?
- NIE → brakuje polotu. Wzmocnij signature element.
- TAK → gotowe, przechodzisz do Kroku 5.

### 4.4 Test konfliktu z brandem
Sprawdź brand_info z Supabase:
- Czy paleta manifesto zgadza się z kolorami w `workflow_branding` type=color?
- Czy tone-of-voice w tagline pasuje do tempa?
- Jeśli jest konflikt — **branding ma priorytet** (klient zaakceptował kolory/fonty). Dostosuj manifesto.

---

## Krok 5 — Mapping manifesto → baseline

> **Wchłonięte z `landing-pages/_templates/README.md`** — w jednym miejscu zamiast dwóch.

| Kierunek manifesta | Baseline | Typografia | Charakterystyka |
|---|---|---|---|
| **Panoramic Calm** (architectural, tech premium, salon 18. piętro) | [`landing-pages/vitrix/`](../../landing-pages/vitrix/) | Plus Jakarta + Instrument Serif italic + Space Mono | Paper/navy/teal, `Nº 01–10` magazine numbering, oversized italic numerals, theatrical dark spec-sheet |
| **Editorial/Luxury** (premium AGD, lifestyle, hygge) | [`landing-pages/paromia/`](../../landing-pages/paromia/) | Fraunces + Italiana + Inter | Paper/ink/gold, `Nº` magazine, editorial numerals, italic pull quotes |
| **Organic/Natural** (wellness, health, spa) | [`landing-pages/h2vital/`](../../landing-pages/h2vital/) | Rounded sans + soft serif | Fluid shapes, soft gradients, greens/beiges |
| **Playful/Toy** (pet, kids, gadgets) | [`landing-pages/pupilnik/`](../../landing-pages/pupilnik/) | Rounded bouncy + display | Vivid colors, emoji, bouncy animations |
| **Retro-Futuristic** (gaming, tech edgy) | [`landing-pages/vibestrike/`](../../landing-pages/vibestrike/) | Neon mono + glitch | Neon on black, cyber, glitch effects |
| **Rugged Heritage** (workwear, outdoor premium, tools & trades) | [`landing-pages/kafina/`](../../landing-pages/kafina/) | Archivo 800 + Inter + Space Mono 700 | **Dark hero** (coal/pine) jako pattern break, `Cat. Nº 01–10` catalog numbering, stamp badges, mosiężne akcenty, brak italic editorial serif |

**Brak pasującego presetu** → przejdź do Kroku 6 z `MODE=forge`. NIE używaj „najbliższego" baseline'a jeśli kierunek jest wyraźnie inny (patrz [`reference/safety.md` reguła #1 Baseline mismatch](reference/safety.md)).

---

## Krok 6 — Decyzja: MODE=copy-adapt vs MODE=forge

### Sprawdź 5 czerwonych flag mismatcha

Policz ile flag trafia do Twojego manifesta:

- [ ] Moodboard referuje inny świat wizualny niż baseline (np. Filson/Red Wing/Yeti vs Kinfolk/Dyson/B&O)
- [ ] Paleta wyraźnie inna od baseline (np. ciemna + metal vs paper + italic teal)
- [ ] Fotografia lokalizacji inna („parking 4:30" vs „salon 18. piętro")
- [ ] Manifesto wprost wyklucza italic editorial serif / round acts / delikatne shadows (rzeczy charakterystyczne dla baseline)
- [ ] Persona z innego świata (kierowca TIR, rzemieślnik vs prawniczka, architektka)

### Decyzja

**0–2 flagi trafiają → MODE=copy-adapt:**
```bash
SLUG="nowa-marka"
BASE="paromia"   # wybrany z tabeli Krok 5

cp -r landing-pages/$BASE landing-pages/$SLUG
rm landing-pages/$SLUG/_brief.md  # własny brief, nie baseline'owy
rm landing-pages/$SLUG/logo*.png  # logo z workflow_branding

# Global replace nazwy marki
cd landing-pages/$SLUG
sed -i "s/Paromia/NewBrand/g; s/paromia/newbrand/g" index.html
```

→ ETAP 2 (`02-generate.md`) z flagą `MODE=copy-adapt`: kopia + adaptacja copy per brief.

**3+ flagi trafiają → MODE=forge:**

```bash
SLUG="nowa-marka"
mkdir -p landing-pages/$SLUG
# Brief już jest z Kroku 8
# ETAP 2 buduje szkielet 14 sekcji od zera, design pod manifesto
```

→ ETAP 2 (`02-generate.md`) z flagą `MODE=forge`: szkielet 14 sekcji od zera, własny design language.

**Pierwszy precedens forge:** Kafina (Rugged Heritage) — vitrix był dostępny, pasowała architektura, ale manifest Filson/Red Wing/Yeti wymagał dark hero + stamp badges + brak editorial italic. Świadoma decyzja: szkielet vitrix, design od zera. Po ukończeniu Kafina została dodana jako baseline dla Rugged Heritage.

---

## Krok 7 — Mapowanie manifesto → decyzje w ETAP 4 (DESIGN)

Manifesto musi przekładać się 1:1 na konkretne decyzje w kodzie. Wypełnij tabelę w pliku manifesto:

| Decyzja | Wartość z manifesto |
|---|---|
| Hero background | [paleta dominant + opis tła] |
| Hero headline font-family | [display z manifesto] |
| Hero headline font-style | [regular / italic em na kluczowych słowach / all-caps] |
| Signature element HTML | [konkretny kod w zarysie] |
| Dark section rytm | [ile sekcji ciemnych? które?] |
| Animacja hero | [subtle / none / dramatic + opis] |
| Border-radius globalny | [0 / 4px / 8px / 16px / 24px — jedna wartość dla spójności] |
| Shadow styl | [kolor, offset, opisz] |
| Divider między sekcjami | [line / wave / numbered / none] |

Jeśli którakolwiek decyzja jest pusta → manifesto jest niekompletne, wróć do Kroku 3.

---

## Krok 8 — Zapisz `_brief.md`

Skopiuj szablon i wypełnij:

```bash
cp landing-pages/_templates/_brief.template.md landing-pages/$SLUG/_brief.md
# Edytuj wszystkie 8 sekcji
```

**Struktura `_brief.md`** (8 sekcji obowiązkowych):

1. Kierunek manifesta (z 6 presetów lub „nowy")
2. Moodboard — 3 realne marki referencyjne (spoza landing-pages/)
3. Paleta (3-4 kolory z workflow_branding)
4. Typografia (2-3 fonty z workflow_branding + `&subset=latin-ext`)
5. Persona główna (z report_pdf — wiek/zawód/pain/motywacja)
6. Baseline decision (MODE=copy-adapt lub MODE=forge)
7. Test anty-generic (4 odpowiedzi TAK)
8. Signature element

**NIE używaj `/c/tmp/`** — `_brief.md` jest commitowany razem z landingiem (persystentny brief projektu).

---

## Krok 9 — verify-brief.sh (OBOWIĄZKOWY GATE)

```bash
bash scripts/verify-brief.sh $SLUG
```

**Exit 0:** Brief kompletny → przejdź do ETAP 2 (`02-generate.md`).

**Exit 1:** Brief niekompletny → wróć do Kroku 8, uzupełnij brakujące sekcje. Powtórz aż exit 0.

**Skrypt sprawdza:**
- 8 sekcji obecnych (`## 1.` do `## 8.`)
- Sekcja 1: któryś kierunek zaznaczony `[x]`
- Sekcja 2: 3 marki wypełnione (3 numerowane wpisy z `**`)
- Sekcja 3: paleta nie ma więcej niż 1 placeholdera `______`
- Sekcja 6: baseline decision zaznaczona `[x]`
- Sekcja 7: wszystkie 4 testy anty-generic na TAK `[x]`

**Bez valid briefa NIE przechodź do ETAP 2.** To jest twardy gate — autonomous mode w `landing-autorun.sh` wymusza max 3 retries, potem STOP + raport.

---

## Checklist wyjściowy

- [ ] Audyt produktu z danych Supabase (nie z głowy)
- [ ] 3 realne marki referencyjne wybrane (spoza `landing-pages/`)
- [ ] Manifesto napisane — 5 linijek wypełnionych
- [ ] Nazwa kierunku jest WŁASNA lub świadomie wybrana z 6 presetów
- [ ] Test unikalności: manifesto nie pasuje do 5 innych produktów
- [ ] Test ryzyka: min. 1 element odważny
- [ ] Paleta zgadza się z `workflow_branding` type=color
- [ ] Tabela mapowania Krok 7 wypełniona
- [ ] MODE wybrane (copy-adapt lub forge) z uzasadnieniem
- [ ] `_brief.md` zapisany w `landing-pages/[slug]/`
- [ ] `verify-brief.sh` exit 0
- [ ] Użytkownik NIE był pytany o nic — wszystkie decyzje oparte na danych

---

## Anty-wzorce (NIE RÓB TEGO)

- ❌ „Wybieram Editorial bo produkt jest premium" — leniwe, prowadzi do kopii paromii
- ❌ „Organic/Natural pasuje bo to wellness" — kategoria ≠ kierunek, zadaj sobie pytanie o EMOCJĘ
- ❌ Pomijanie manifesto i skakanie do ETAP 2 — gwarantowany szablon (verify-brief.sh i tak zatrzyma)
- ❌ Referencje typu „like paromia but warmer" — zamknięta pętla stylistyczna
- ❌ Manifesto napisane po zakodowaniu HTML — to racjonalizacja, nie projektowanie
- ❌ Pytanie użytkownika „jaki kierunek preferujesz?" — to TWOJA decyzja oparta na danych
- ❌ MODE=copy-adapt z baseline który nie pasuje — patrz [`reference/safety.md` reguła #1](reference/safety.md)

---

## Failure modes (AUTO-RUN mode)

| Warunek | Akcja | Max retry | Jeśli nadal fail |
|---------|-------|-----------|------------------|
| `verify-brief.sh` exit 1 (missing section) | Uzupełnij brakującą sekcję, re-run | 3 | STOP + raport do usera |
| Anty-generic test fail (4.1-4.4) | Przepisz manifesto, zmień marki referencyjne | 2 | STOP — zbyt generic |
| Brak pasującego baseline (≥3 czerwone flagi) | MODE=forge (szkielet od zera) | — | kontynuuj (to jest valid path) |
| Brak `report_pdf` (`workflow_reports`) | Dedukuj personę z `brand_info` + tagline | 1 | STOP — wróć do CLAUDE_BRANDING_PROCEDURE.md |
| Brak `brand_info` | STOP — wróć do CLAUDE_BRANDING_PROCEDURE.md | 0 | STOP |

---

## Relacja do pozostałych etapów

| Etap | Plik | Co robi |
|---|---|---|
| 0. Walidacja | (`landing-autorun.sh` lub `02-generate.md` ETAP 0) | Bash check Supabase |
| **1. Direction** | **ten plik (`01-direction.md`)** | **manifesto + baseline + verify-brief** |
| 2. Generate | [`02-generate.md`](02-generate.md) | HTML zgodny z briefem |
| 3. Review | [`03-review.md`](03-review.md) | weryfikacja treści (18 grep checks) |
| 4. Design polish | [`04-design.md`](04-design.md) | implementacja manifesto + offer box |
| 5. Verify | [`05-verify.md`](05-verify.md) | Playwright 3 viewporty |
| 6. Mobile | [`06-mobile.md`](06-mobile.md) | mobile polish 375px |

Po ETAP 6 (jeśli verify-all-landings.sh PASS) → auto commit + push + deploy. Patrz [`README.md`](README.md) sekcja AUTO-RUN protocol.
