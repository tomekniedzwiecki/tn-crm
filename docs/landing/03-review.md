# ETAP 3 — REVIEW: weryfikacja treści (OBOWIĄZKOWY)

> **Safety rules:** [`reference/safety.md`](reference/safety.md) — wszystkie 10 reguł.
> **Copy reference:** [`reference/copy.md`](reference/copy.md) — Copywriter Playbook.

**Kiedy wywołać:** Po ETAP 2 ([`02-generate.md`](02-generate.md)) — po zapisaniu pliku index.html.

Ta procedura jest **obowiązkowa** — nie kończ pracy nad landingiem bez jej wykonania.

**Po PASS (≥60 PASS / 0 FAIL) →** przejdź do [`03-5-copy-review.md`](03-5-copy-review.md) (Manus rewrite purple prose) **PRZED** ETAP 4 DESIGN. Verify-landing sprawdza anti-patterns i długości, ale NIE ocenia jakości copy — Manus to robi.

---

## 0. Automatyczne kontrole (uruchom najpierw)

Zanim zaczniesz ręczną inspekcję, wykonaj te komendy z `landing-pages/[SLUG]/index.html`.
Każda odpowiada na konkretne pytanie z checklisty.

```bash
SLUG=paromia  # zmień na aktualny
FILE="landing-pages/$SLUG/index.html"

# 1. Liczba placeholderów na zdjęcia (wymóg: 12-20)
echo "Placeholdery:"
grep -cE '<div class="(hero-placeholder-ph|tile-figure|ritual-fig|spec-fig|persona-figure|offer-figure-inner|img-placeholder|ph-box)"' "$FILE"

# 2. Numeracja Nº — OPCJONALNE (sygnatura Editorial paradigm, nie wymóg uniwersalny)
# Jeśli _brief.md wskazuje Editorial/Luxury kierunek → sprawdź ciągłość.
# Dla pozostałych paradygmatów (Dashboard/Cinematic/Value/Oversized typo) — pomiń.
echo "Numeracja Nº (tylko dla Editorial paradigm):"
grep -oE "Nº [0-9]+" "$FILE" | sort -u

# 3. Czy wszystkie CTA prowadzą do tego samego miejsca
echo "Docelowe linki CTA (btn-primary + btn-cta + offer-cta):"
grep -oE 'href="#[a-z-]+"' "$FILE" | sort -u

# 4. Liczba słów w hero headline + subheadline (wymóg: H1 ≤10, lede ≤25)
echo "Hero word count:"
awk '/hero-headline/,/<\/h1>/' "$FILE" | sed 's/<[^>]*>//g;s/&nbsp;/ /g' | wc -w
awk '/hero-lede/,/<\/p>/' "$FILE" | sed 's/<[^>]*>//g;s/&nbsp;/ /g' | wc -w

# 5. "Power words do UNIKANIA" — czy copy nie brzmi korporacyjnie
echo "Korporacyjne słowa (powinno być 0):"
grep -ciE "innowacyjn|najwyższ[ae] jakość|profesjonaln.*rozwiązan|kompleksow|charakteryzuje się|implementacj" "$FILE"

# 6. Brak "lorem ipsum" ani pustych placeholderów tekstu
echo "Lorem/TODO/Placeholder tekst:"
grep -ciE "lorem ipsum|TODO|placeholder text|\[BRAK\]" "$FILE"

# 7. Brak obcych UUID (z innego workflow)
echo "UUIDs w obrazach (powinien być TYLKO bieżący workflow_id):"
grep -oE "ai-generated/[a-f0-9-]{36}" "$FILE" | sort -u

# 8. ZAKAZANE obietnice wysyłki (dropshipping ≠ 24h / magazyn w PL)
echo "Zakazane obietnice (powinno być 0):"
grep -ciE "wysy[łl]ka 24|w 24 ?h|polski magazyn|z magazynu w Polsc|D\+1" "$FILE"

# 9. Header biały + brak wordmark obok logo (zasada bezwarunkowa z DESIGN.md)
echo "Header backdrop-filter (powinno być 0 — header MA BYĆ biały #FFFFFF):"
grep -cE "\.header\s*\{[^}]*backdrop-filter" "$FILE"
echo "Logo z wordmarkiem obok img (powinno być 0):"
grep -nE "class=\"logo\"[^>]*>[^<]*<img[^>]*>\s*[A-Za-zĄĆĘŁŃÓŚŻŹąćęłńóśżź]" "$FILE" | head -3

# 10. Fade-in safety (kryt. lekcja #1 z PROCEDURE)
echo "html.js gate w <head> (powinno być ≥ 1):"
grep -cE "document\.documentElement\.classList\.add..js" "$FILE"
echo "Safety timeout 2500ms (powinno być 1):"
grep -cE "setTimeout.*fade-in.*2500" "$FILE"

# 11. Inline img sizing — zabronione (PATTERN 16 — wszystko w CSS)
echo "Img z inline style sizing (powinno być 0):"
grep -cE "<img[^>]*style=\"[^\"]*(height|width|aspect-ratio):" "$FILE"

# 12. OG image pełny URL Supabase (nie względny)
echo "OG image ma pełny Supabase URL (powinno być 1):"
grep -cE 'property="og:image"[^>]*yxmavwkwnfuphjqbelws' "$FILE"

# 13. Fonty z latin-ext dla polskich znaków
echo "Fonty z subset=latin-ext (powinno być 1):"
grep -cE "subset=latin-ext" "$FILE"

# 14. Brief placeholders (każdy MUSI mieć 'Brief: ' — 4-polowy format)
echo "Brief placeholders z formatowaniem (0 gdy wszystkie obrazy są, 3-6 gdy czekamy na klienta):"
grep -c "Brief: " "$FILE"

# 15. Bento/tile pustych komórek grida — symptom: tile-hero span 2×2 z niewystarczającą liczbą tiles
echo "tile-hero span (2×2 = ryzyko pustych komórek, chyba że masz 5 tiles):"
grep -cE "grid-row\s*:\s*span 2" "$FILE"
```

**Oczekiwane:**
| Kontrola | Oczekiwane | Jeśli inaczej |
|----------|-----------|---------------|
| Placeholdery | 12-20 | dodaj więcej figur w bento/ritual/personas |
| Numeracja Nº | **opcjonalna** — ciągła tylko dla Editorial paradigm (paromia). Dashboard/Cinematic/Value/Oversized nie wymagają Nº | jeśli Editorial → przenumeruj; jeśli inny paradigm → pomiń |
| Linki CTA | max 2 unikalne (np. `#zamow` + kotwice menu) | zunifikuj do jednego `#offer/#zamow` |
| Hero headline | ≤ 10 słów | skróć |
| Hero subheadline | ≤ 25 słów | skróć |
| Power words | 0 | zamień na konkret |
| Lorem/TODO | 0 | napisz realny copy |
| UUIDs | TYLKO bieżący workflow | **bug** — usuń obce natychmiast |
| Zakazane obietnice wysyłki | 0 | usuń — dropshipping ≠ 24h / magazyn PL |
| Header backdrop-filter | 0 | header MA BYĆ czysty #FFFFFF (DESIGN.md sekcja 0) |
| Wordmark obok logo | 0 | tylko `<img>`, bez napisu marki obok |
| html.js gate | ≥ 1 | dodaj `<script>document.documentElement.classList.add('js')</script>` do `<head>` |
| Safety timeout fade-in | 1 | dodaj `setTimeout(...fade-in..., 2500)` |
| Inline img sizing | 0 | przenieś do CSS (PATTERN 16) |
| OG image full URL | 1 | zastąp `/landing-pages/...` pełnym Supabase URL |
| subset=latin-ext | 1 | dodaj `&subset=latin-ext` do URL Google Fonts |
| grid-row span 2 | 0 lub parzyste wypełnienie | ryzyko pustych komórek — policz tiles × span (PATTERN 16) |

**NIE przechodź dalej** dopóki każda kontrola nie jest zielona.

---

## 1. Checklist sekcji i obrazów

Checklist pokrywa **funkcje** sekcji, nie dokładne nazwy. Liczba obrazów w sekcjach **Hero / Solution / Testimonials** zależy od wybranego wariantu z [`reference/section-variants.md`](reference/section-variants.md) (rozdział 1-3). Pozostałe sekcje = standard.

| # | Funkcja | Min. obrazów (zależnie od wariantu) | OK |
|---|---------|-------------------------------------|-----|
| 1 | Header + Logo | 1 (logo) | [ ] |
| 2 | Hero | 1–2 (H1-H10 każdy ma własny brief placeholder) | [ ] |
| 3 | Trust Bar | 0 (ikony/SVG) | [ ] |
| 4 | Problem | 1 (ilustracja lub stat + cytat) | [ ] |
| 5 | Solution / Features | 3–6 (F1 bento 4 · F2 asym 5-6 · F3 linear 4 · F4 cards 4 · F5 scroll 6 · F6 sticky 4) | [ ] |
| 6 | How It Works (kroki) | 3 (standard: 3 akty = 3 step-figure) | [ ] |
| 7 | Comparison | 0 (tekst + lista) — opcjonalna | [ ] |
| 8 | Testimonials / Proof | **zależnie od wariantu** (T1 voices: 3 · T2 B/A: 3 · T3 video: 3 · T4 UGC: 6-8 · T5 single: 1 · T6 press: 5 logo) | [ ] |
| 9 | Offer / Pricing | 1 (produkt w ofercie + flat lay zestawu) | [ ] |
| 10 | FAQ | 0 | [ ] |
| 11 | Final CTA Banner | 0-1 (opcjonalny bg-figure) | [ ] |
| 12 | Footer | 1 (logo) | [ ] |

**Minimum placeholderów obrazów na stronie: 12–20.**

Editorial/Luxury typowo ląduje na dolnej granicy (12–15) — typografia
dominuje. Playful/Tech — górna granica (18–20). **NIGDY** poniżej 12.

### Mapowanie — jak potraktować brak dokładnego odpowiednika

| Procedura wymaga | Editorial odpowiednik | Co sprawdzić |
|------------------|----------------------|--------------|
| „Product Gallery" jako sekcja | figury w bento t-tall + hero-figure + offer-figure | Czy łącznie ≥ 3 widoki produktu z różnych ujęć? |
| „How It's Made" osobno | wewnątrz Spec Sheet | Czy jest wizualizacja technologii / przekrój? |
| „Personas" sekcja | Nº 07 Dla Kogo | 3 karty × {portret + imię + meta + pull quote} |
| „Package" | lista w Offer | Wyraźna lista 4–6 pozycji zestawu startowego |

Jeśli brakuje **funkcji** (nie samej nazwy) — dodaj ją przed kontynuowaniem.

---

## 2. HERO DEEP DIVE (najważniejsza sekcja!)

Hero decyduje o tym, czy użytkownik zostanie na stronie. Poświęć mu **osobną, pogłębioną analizę**.

### A. Zdefiniuj grupę docelową PRZED pisaniem

Odpowiedz na pytania:
1. **Kim jest odbiorca?** (wiek, płeć, sytuacja życiowa)
2. **Co go boli?** (główny problem, frustracja, ból codzienny)
3. **Czego pragnie?** (marzenie, stan docelowy, ulga)
4. **Jakim językiem mówi?** (prosty/techniczny, formalny/luźny)

### B. Checklist Hero — KAŻDY punkt musi być spełniony

| Element | Pytanie kontrolne | Spełnione? |
|---------|-------------------|------------|
| **Badge** | Czy buduje kontekst/ciekawość? (nie "Nowość" — to nic nie mówi) | [ ] |
| **Headline** | Czy trafia w BÓL lub PRAGNIENIE? (nie w funkcję produktu!) | [ ] |
| **Headline** | Czy jest < 10 słów? | [ ] |
| **Headline** | Czy odbiorca pomyśli "to o mnie!"? | [ ] |
| **Subheadline** | Czy wyjaśnia JAK produkt rozwiązuje problem? | [ ] |
| **Subheadline** | Czy jest BEZ żargonu technicznego? (nie "11 kPa", "HEPA 12") | [ ] |
| **Subheadline** | Czy jest < 25 słów? | [ ] |
| **CTA główne** | Czy mówi co dostanę? (nie "Kup teraz" — raczej "Zamów z rabatem -30%") | [ ] |
| **CTA drugorzędne** | Czy odpowiada na "chcę wiedzieć więcej"? | [ ] |

### C. Formuły na skuteczny headline

Użyj jednej z tych formuł:

1. **Ból → Rozwiązanie:** "Koniec z [BÓL] — [ROZWIĄZANIE]"
2. **Pragnienie:** "[OSIĄGNIJ MARZENIE] bez [PRZESZKODA]"
3. **Transformacja:** "Z [STAN A] do [STAN B] w [CZAS]"
4. **Pytanie retoryczne:** "Masz dość [BÓL]?"
5. **Konkret:** "[LICZBA] [EFEKT] w [CZAS]"

### D. Anty-wzorce (NIE RÓB TEGO)

- ❌ Headline o produkcie: "Pupilnik — profesjonalny system pielęgnacji"
- ❌ Headline z funkcjami: "Moc ssania 11 kPa i filtr HEPA 12"
- ❌ Subheadline zaczynający się od nazwy: "Pupilnik to..."
- ❌ Żargon techniczny w pierwszych 3 sekundach
- ❌ Ogólniki: "Najlepsze rozwiązanie", "Innowacyjny produkt"
- ❌ **ZAKŁADANIE SYTUACJI ODBIORCY W HERO:** "Twoje dziecko raczkuje...", "Twój pies...", "Masz apartament..." — NIE WIESZ czy odbiorca ma dziecko/psa/apartament! W hero używaj uniwersalnych pytań/stwierdzeń ("Masz dość...?", "Dla tych, którzy...")
- ✅ **Zakładanie sytuacji DOZWOLONE W PERSONAS** — sekcja Nº 07 „Dla Kogo" celowo segmentuje. Tam można i trzeba pisać „32 l. · Warszawa · HR/Marketing · capsule wardrobe". Odbiorca świadomie sprawdza, do której grupy należy.
- ⚠️ **Liczba + jednostka w hero** — OK jeśli jednostka jest oczywista (sekundy, minuty, zł, %). UNIKAJ jednostek specjalistycznych (kPa, HEPA, SPF 50, lm) jeśli grupa docelowa ich nie używa na co dzień. Zamień „30 kPa" → „para pod ciśnieniem"; szczegół techniczny zostaw w Spec Sheet.

### E. Test 5 sekund

Przeczytaj TYLKO badge + headline + subheadline. Czy w 5 sekund wiesz:
1. Dla kogo to jest?
2. Jaki problem rozwiązuje?
3. Dlaczego powinienem zostać?

Jeśli NIE — przepisz Hero.

---

## 3. Weryfikacja treści (Copy Review)

Dla **każdej sekcji** zadaj sobie pytania:

### A. Kontekst odbiorcy
- Kim jest grupa docelowa? (wiek, sytuacja, problemy)
- Jakim językiem mówi? (formalny/nieformalny, techniczny/prosty)
- Co ich boli? Co chcą osiągnąć?

### B. Pytania do każdej sekcji

| Sekcja | Pytania kontrolne |
|--------|-------------------|
| **Hero** | **PATRZ SEKCJA 2 POWYŻEJ** — Hero wymaga osobnej, pogłębionej analizy! |
| **Problem** | Czy opis problemu rezonuje z odbiorcą? Czy używam jego słów? Czy statystyki są wiarygodne? |
| **Solution** | Czy korzyści są napisane językiem efektów (nie funkcji)? Czy każda korzyść odpowiada na konkretny ból? |
| **How It Works** | Czy kroki są proste i zrozumiałe? Czy pokazuję jak łatwo zacząć? |
| **Personas** | Czy 3 persony pokrywają główne segmenty? Czy każdy znajdzie siebie? |
| **Testimonials** | Czy opinie są wiarygodne? Czy zawierają konkrety (imię, rola, efekt)? |
| **Package** | Czy jasno widać co dostaje klient? Czy jest poczucie wartości? |
| **Offer** | Czy cena jest dobrze zakotwiczona (przekreślona stara)? Czy jest pilność/ograniczenie? |
| **FAQ** | Czy odpowiadam na realne obiekcje? Czy rozwiązuję wątpliwości przed zakupem? |

### C. Checklist copy

- [ ] Brak "lorem ipsum" ani placeholder tekstów
- [ ] Headline hero < 10 słów, konkretny efekt
- [ ] Wszystkie CTA mają jasny przekaz (nie "Kliknij tutaj")
- [ ] Ceny i rabaty są spójne w całym dokumencie
- [ ] Gwarancja/zwrot jest wyraźnie komunikowana
- [ ] Brak błędów ortograficznych i gramatycznych
- [ ] Każdy placeholder ma 4 pola: mark, title, size (px), note dla fotografa (nie tylko „Hero Image")

### D. Spójność z raportem strategicznym (workflow_reports type=report_pdf)

Landing MUSI odzwierciedlać ustalenia z raportu. Sprawdź:

- [ ] **Główny pain point** w hero = główny pain point z sekcji „Psychologia sprzedaży" raportu
- [ ] **Persony** (Nº 07 Dla Kogo) = 3 segmenty z sekcji „Grupa docelowa" raportu (imię/wiek/lokalizacja/frustracja — skopiuj, nie wymyślaj)
- [ ] **USP / statystyki** (26 s, 30 kPa, 99,9%) = liczby z sekcji „Specyfikacja techniczna" raportu
- [ ] **Cena** = „sweet spot" z raportu (nie wzięta z kapelusza)
- [ ] **Tagline / headline** pokrywa się z „styl marki" / „tone of voice" z raportu

**Dlaczego:** raport PDF to kontrakt strategiczny z klientem. Rozjazd landing ↔ raport = klient dostaje niespójny produkt.

---

## 4. Weryfikacja techniczna

### 4.A Podstawowa technika
- [ ] Logo ma pełny URL Supabase (nie względny)
- [ ] Fonty mają `&subset=latin-ext` (polskie znaki)
- [ ] Hero image ma `fetchpriority="high"` (bez `loading="lazy"`)
- [ ] Wszystkie `<img>` mają `width` i `height` (CLS)
- [ ] `preconnect` do fonts.googleapis.com i fonts.gstatic.com
- [ ] Meta title < 60 znaków, meta description < 160 znaków
- [ ] OG image ma **pełny URL Supabase**, nie `/landing-pages/...`
- [ ] **Header jest ZAWSZE widoczny** (position: fixed, bez hide-on-scroll JS)
- [ ] `<script>document.documentElement.classList.add('js')</script>` w `<head>` (fade-in gate)
- [ ] Fade-in CSS gated behind `html.js` (`html.js .fade-in{opacity:0}`, NIE `.fade-in{opacity:0}`)
- [ ] Fade-in JS ma `setTimeout` safety fallback 2500ms

### 4.B Zasady bezwarunkowe headera (z 04-design.md sekcja 0)

- [ ] Header ma tło **czysto białe `#FFFFFF`** — NIE `rgba(...)` z `backdrop-filter`, NIE `var(--paper)`
- [ ] Logo w headerze to **tylko `<img>`** — bez napisu tekstowego obok (jeśli logo zawiera nazwę marki)
- [ ] `position: fixed; top: 0; z-index ≥ 100`

```bash
# Szybki grep-check
grep -E "background\s*:\s*#FFFFFF|background\s*:\s*white" landing-pages/$SLUG/index.html | head -3
grep -cE "backdrop-filter" landing-pages/$SLUG/index.html  # powinno być 0 w headerze
```

### 4.C Layout integrity (cross-ref: `04-design.md` sekcja G)

Szczegółowe zasady + anti-patterns znajdziesz w DESIGN.md „G. Layout Discipline". Tu tylko szybka checklista do weryfikacji:

- [ ] **Bento / tile grids nie mają pustych komórek** — policz `liczba_tiles × 1 + Σ(span_extra) = komórki grida`
- [ ] Tile-hero (featured) ma wewnętrzny 2-col grid (nie pionowy banner) — tekst + figure
- [ ] Wszystkie `<img>` w tile mają `object-fit: cover` + `object-position` w CSS
- [ ] **Brak inline `style="height:..."`, `style="width:..."`, `style="aspect-ratio:..."`** na `<img>`
- [ ] Aspect-ratio dobrany do orientacji zdjęć w sekcji (portret 4/5, packshot 1/1, lifestyle 4/3)

```bash
# Sanity check — img z inline sizing
grep -nE '<img[^>]*style="[^"]*(height|width|aspect-ratio):' landing-pages/$SLUG/index.html
# Powinno być 0 wyników
```

### 4.D Placeholder briefs (dla sekcji bez zdjęć)

Każdy brief placeholder MUSI mieć 4 pola (ph-mark, ph-title, ph-size, ph-note LUB editorial variant z imieniem + meta + brief):

- [ ] Brief zawiera: nazwę elementu, orientację + rozmiar px, krótki opis kompozycji dla fotografa
- [ ] NIE ma brief'u typu „Hero Image" / „TODO" / „[brak]" — to porzucone placeholdery
- [ ] Każdy brief ma wyraźną dyrektywę dla fotografa / grafika (np. „Brief: kadr od ramion w górę, naturalne światło okna, spokój")

```bash
# Count briefs (editorial pattern — „Brief: " w HTML)
grep -c "Brief: " landing-pages/$SLUG/index.html
# Typowa wartość: 0-6 (0 gdy wszystkie obrazy wygenerowane, 3-6 gdy czekamy na klienta)
```

### 4.E Aspect-ratio integrity per sekcja

Typ zdjęcia → aspect-ratio obecny w CSS dla odpowiedniej klasy:

| Sekcja | Klasa | aspect-ratio |
|---|---|---|
| Hero | `.hero-figure` | 4/5 (pionowy) |
| Problem/Challenge | `.challenge-figure` / `.problem-visual` | 4/3 |
| Tile (bento) | `.tile-figure` | 4/3 |
| Tile-hero featured | `.tile.tile-hero .tile-figure` | `auto` + `height:100%` |
| Ritual/How step | `.act-figure` / `.step-image` | 4/3 |
| Spec Sheet | `.spec-figure` | 1/1 + `min-height` |
| Persona portrait | `.persona-figure` | 4/5 |
| Offer packshot | `.offer-figure` | 4/3 lub 1/1 |

Sprawdź czy każda sekcja ma **własny** aspect-ratio, NIE globalne wymuszenie jednej wartości.

---

## 5. Akcje po weryfikacji treści

Po przejściu checklisty:

1. **Jeśli są braki w treściach** — popraw je i przejdź ponownie przez sekcje z problemami
2. **Jeśli treści OK** — **PRZEJDŹ DO ETAPU 2.5: DIRECTION** (`01-direction.md`)

Kolejność: ETAP 3 (treści OK) → **ETAP 2 (manifesto kierunku)** → ETAP 4 (design polish) → ETAP 5 (Playwright) → commit.

**NIE COMMITUJ JESZCZE** — najpierw manifesto, potem design, potem weryfikacja wizualna.

---

## 6. Raport dla użytkownika

Po zakończeniu weryfikacji przedstaw krótki raport:

```
## Landing Page Review: [nazwa]

### Sekcje: [X/16] funkcji pokrytych
### Placeholdery: [X] (wymóg 12–20)
### Hero: test 5 sekund — [pass/fail]
### Copy: [status] (power words, lorem, subheadline ≤25 słów)
### Spójność z raportem PDF: [ok/rozjazd]

### Uwagi:
- [ewentualne sugestie do treści]
- [sekcje wymagające zdjęć od klienta — z briefem]

### Link: https://tn-crm.vercel.app/landing-pages/[nazwa]/
```

---

## 7. ETAP 2 + 3 + 4: Direction, Design i Wizualna weryfikacja

**OBOWIĄZKOWE** — po weryfikacji treści przejdź kolejno:

1. **ETAP 2 — `01-direction.md`** — audytujesz produkt, autonomicznie wybierasz kierunek estetyczny, piszesz **Design Manifesto** do `landing-pages/[slug]/_brief.md`. **NIE PYTAJ użytkownika.**
2. **ETAP 4 — `04-design.md`** — implementujesz manifesto: typografia, paleta, signature element
3. **ETAP 5 — `05-verify.md`** — Playwright screenshot w 3 viewportach

Dopiero po ETAP 5 (pozytywna weryfikacja wizualna) wykonaj deploy:

```bash
cd /c/repos_tn/tn-crm && git add landing-pages/[nazwa]/ && git commit -m "Add [nazwa] landing page" && git push
```

**Podaj użytkownikowi link:** `https://tn-crm.vercel.app/landing-pages/[nazwa]/`
