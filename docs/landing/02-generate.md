# ETAP 2 — GENERATE: szkielet HTML zgodny z manifestem

> **Safety rules:** [`reference/safety.md`](reference/safety.md) — zasady bezwarunkowe.
> **Copy:** [`reference/copy.md`](reference/copy.md) — Hero Headline + Copywriter Playbook + Conversion Boosters.
> **Patterns:** [`reference/patterns.md`](reference/patterns.md) — 22 signature snippety.
> **PageSpeed:** [`reference/pagespeed.md`](reference/pagespeed.md) — optymalizacja wydajności.

## Kiedy uruchomić

Po **ETAP 1 (DIRECTION)** — tylko gdy `bash scripts/verify-brief.sh [slug]` zwraca exit 0.

## Wejście z ETAP 1 (OBOWIĄZKOWE)

```bash
# Sprawdź brief
bash scripts/verify-brief.sh $SLUG
```

**Exit 1** → STOP, wróć do [`01-direction.md`](01-direction.md). NIE wybieraj kierunku samodzielnie z presetu.

**Exit 0** → przeczytaj `landing-pages/$SLUG/_brief.md` (szczególnie **Sekcja 9: Paradigm architektury**) i buduj szkielet **zgodny z wybranym paradygmatem** (nie sztywny 14-sekcyjny template).

> ⚠️ **NIGDY nie kopiuj istniejących baseline'ów** (`cp -r landing-pages/$BASE` jest **zakazane**). Procedura ma być uniwersalna — patrz memory `feedback-landing-always-forge.md` + [`01-direction.md` Krok 6](01-direction.md). Tabela baseline w Kroku 5 to **anty-referencje** (co już jest, czego nie powtarzaj), nie template'y.

---

## ETAP 0 — Walidacja wejścia (Supabase)

> Uruchamiane automatycznie przez `landing-autorun.sh` PRZED ETAP 1. Jeśli wykonujesz ręcznie — przejdź ten check.

```bash
set -a && source /c/repos_tn/tn-crm/.env && set +a

UUID="[UUID]"

# Check 1: Workflow istnieje
WF=$(curl -s "https://yxmavwkwnfuphjqbelws.supabase.co/rest/v1/workflows?id=eq.$UUID&select=id,customer_name" \
  -H "apikey: $SUPABASE_SERVICE_KEY" -H "Authorization: Bearer $SUPABASE_SERVICE_KEY")
[ "$WF" = "[]" ] && echo "❌ Workflow nie istnieje" && exit 1

# Check 2: brand_info
BI=$(curl -s ".../workflow_branding?workflow_id=eq.$UUID&type=eq.brand_info&select=value" \
  -H "apikey: $SUPABASE_SERVICE_KEY" -H "Authorization: Bearer $SUPABASE_SERVICE_KEY")
[ "$BI" = "[]" ] && echo "❌ Brak brand_info — wróć do CLAUDE_BRANDING_PROCEDURE.md" && exit 1

# Check 3: Raport strategiczny PDF
RP=$(curl -s ".../workflow_reports?workflow_id=eq.$UUID&type=eq.report_pdf&select=file_url" \
  -H "apikey: $SUPABASE_SERVICE_KEY" -H "Authorization: Bearer $SUPABASE_SERVICE_KEY")
[ "$RP" = "[]" ] && echo "❌ Brak raportu PDF" && exit 1

# Check 4 (opcjonalny warning)
PR=$(curl -s ".../workflow_products?workflow_id=eq.$UUID&select=name,price" \
  -H "apikey: $SUPABASE_SERVICE_KEY" -H "Authorization: Bearer $SUPABASE_SERVICE_KEY")
[ "$PR" = "[]" ] && echo "⚠️  Brak workflow_products"

# Slug = lowercase nazwa marki z brand_info
SLUG=$(echo "$BI" | grep -oE '"name":"[^"]+"' | head -1 | sed 's/"name":"//; s/"$//' | tr '[:upper:]' '[:lower:]')
```

### Kiedy STOP (nie uruchamiaj flow)

Przerwij i poinformuj użytkownika, jeśli:
- Brak `.env` z `SUPABASE_SERVICE_KEY`
- `workflow_branding` type=`brand_info` pusty → wróć do `CLAUDE_BRANDING_PROCEDURE.md`
- `workflow_reports` type=`report_pdf` brak → raport jest podstawą person i copy
- `workflow_products` pusty + brak referencji produktu w `ai-generated/` → nie masz z czego generować obrazów

Te przypadki wymagają powrotu do wcześniejszych etapów workflow, nie próbuj „wymyślać" contentu.

---

## Wymagane dane wejściowe

1. **workflow_id** — UUID workflow
2. **Branding** — `workflow_branding` (brand_info, colors, fonts)
3. **Raport PDF** — `workflow_reports` type=`report_pdf` (USP, persony, pain points)
4. **Produkt** — `workflow_products` (nazwa, opis, cena)
5. **Brief** — `landing-pages/$SLUG/_brief.md` (z ETAP 1)

## Co generuje

Kompletny plik `landing-pages/[slug]/index.html` gotowy do verify (ETAP 3).

### Kroki po wygenerowaniu HTML (OBOWIĄZKOWE!)

1. **Pobierz GŁÓWNE logo** z `workflow_branding` (type='logo') — wybierz to które ma w polu `notes` JSON z `"is_main": true`:
   ```bash
   node -e "const d=require('c:/tmp/wb.json'); console.log(d.filter(x=>x.type==='logo').find(x=>{try{return JSON.parse(x.notes||'{}').is_main}catch(e){return false}})?.file_url)"
   ```
   NIGDY nie zgaduj po tytule (np. "Logo premium") — użytkownik oznacza główne logo flagą `is_main`.

2. **Przytnij logo** używając `sharp().trim()` (usuwa białe marginesy)

3. **Upload logo** do `attachments/landing/[slug]/logo.png`

4. **Użyj pełnego URL** w HTML — patrz [`reference/safety.md` reguła #10](reference/safety.md)

---

## ⛔ NIGDY NIE KOPIUJ ZDJĘĆ Z INNEGO WORKFLOW ⛔

**To jest krytyczna zasada — naruszenie = oszustwo wobec klienta.**

Procedura zakazuje kopiowania szablonów (zawsze MODE=forge — patrz [`01-direction.md` Krok 6](01-direction.md)). Ale gdy modyfikujesz istniejący landing ([`migrate.md`](migrate.md) Use case 2), **MUSISZ** zweryfikować że żadne `<img src>` nie wskazują na zasoby z innego workflow. Zastąp je:

1. **Zdjęciami z BIEŻĄCEGO workflow** (`workflow_branding` type='mockup' lub 'logo', `workflow_reports` type=`report_infographic`) — jedyne dozwolone źródło
2. **Wyraźnymi placeholderami** (4-polowy brief fotografa — patrz [`reference/safety.md` #4](reference/safety.md))

**Jak rozpoznać obce zdjęcia:** URL zawiera inne UUID workflow w ścieżce `ai-generated/<UUID>/`. Przed zapisem pliku uruchom:

```bash
grep -oE "ai-generated/[a-f0-9-]{36}" landing-pages/[slug]/index.html | sort -u
```

Wynik MUSI zawierać wyłącznie UUID bieżącego workflow. Każdy inny UUID = bug do naprawy natychmiast.

**Dlaczego to jest krytyczne:** Zdjęcia z innego workflow przedstawiają inny produkt pod inną marką. Klient dostaje landing ze zdjęciami konkurencji.

---

## Hosting assetów (Supabase Storage)

Landing pages są przenoszone na zewnętrzne platformy (TakeDrop), więc **wszystkie assety muszą mieć pełne URL-e** (patrz [`reference/safety.md` #10](reference/safety.md)).

### Logo — upload do Supabase Storage

```bash
curl -X POST "https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/attachments/landing/[slug]/logo.png" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
  -H "Content-Type: image/png" \
  --data-binary @"landing-pages/[slug]/logo.png"
```

### URL do logo w HTML

```html
<!-- ✅ DOBRZE — pełny URL Supabase -->
<img src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/landing/[slug]/logo.png" alt="[Marka]" width="140" height="36">
```

### Struktura w Supabase Storage

```
attachments/
└── landing/
    ├── windox/logo.png
    ├── brewgo/logo.png
    └── [slug]/logo.png
```

---

## Image naming convention (obrazy AI)

```
ai-generated/[slug]/
├── hero.jpg                   # Nº 01 hero
├── challenge.jpg              # Nº 02 problem
├── tile-hero.jpg              # Nº 03 featured bento
├── tile-safety.jpg            # Nº 03 bento 2
├── tile-navigation.jpg        # Nº 03 bento 3
├── tile-control.jpg           # Nº 03 bento 4
├── ritual-1.jpg               # Nº 04 krok 1
├── ritual-2.jpg               # Nº 04 krok 2
├── ritual-3.jpg               # Nº 04 krok 3
├── spec.jpg                   # Nº 05 spec sheet
├── persona-anna.jpg           # Nº 07.01
├── persona-marek.jpg          # Nº 07.02
├── persona-kasia.jpg          # Nº 07.03
└── offer.jpg                  # Nº 10 packshot
```

**Jak włączyć:** edge function `generate-image` musi dostać parameter `custom_filename`. Obecnie używa `Date.now()_index.ext` — kompatybilność wstecz.

W AUTO-RUN mode obrazy generują się w tle przez `scripts/generate-landing-images.sh` (uruchamiany przez `landing-autorun.sh`). Patrz [`README.md`](README.md) sekcja AUTO-RUN.

---

## ⚠️ 10 tematów do pokrycia (forma zależy od paradygmatu z Etapu 1.5)

> **Zmiana z 2026-04-20 (memory: `feedback-landing-structural-uniqueness.md`):** zamiast „14 sekcji w sztywnej kolejności z identycznymi klasami CSS" — pokrywasz **10 tematów**, a ich formę wybierasz na podstawie paradygmatu z briefa (Sekcja 9: Paradigm architektury).

> Memory: `feedback-landing-polish-required.md` + `feedback-landing-hero-image-required.md` + `feedback-landing-placeholder-per-section.md` obowiązują dalej — każda forma musi być dopieszczona + hero musi mieć placeholder zdjęcia + każda sekcja wizualna musi mieć brief fotografa.

### 10 tematów do pokrycia (content coverage — MUSI być każdy)

| # | Temat | Funkcja | Pokrywam przez (zależy od paradygmatu) |
|---|-------|---------|---------------------------------------|
| 1 | **Navigation** | Dostęp do sekcji / CTA zawsze w zasięgu | Header sticky / anchor-tabs / minimal-logo / no-nav |
| 2 | **Hero** | Pierwsze wrażenie, promise | Full-bleed / split-image / text-first / dashboard-mockup / numeral-bg / carousel / prompt-input / persona-portrait |
| 3 | **Trust** | Uwiarygodnienie w <10 sek | Trust bar ikon / press logos / cert badges / rating count / user count |
| 4 | **Problem** | Rezonans z bólem / status quo | PAS paragraph / cytat klienta / statystyka dużym drukiem / ilustracja kontrastu |
| 5 | **Solution** | Co produkt robi | Bento 2×2 / scrollytelling sticky / linear features / configurator / comparison / horizontal scroll / long-form |
| 6 | **Edukacja / How** | Jak działa w praktyce | 3 kroki / demo video / app screenshots / diagram techniczny / „day in the life" narracja |
| 7 | **Proof** | Dowód społeczny | Testimonials grid / before-after cards / case study / UGC wall / press quotes / video-dominant / before-after stats |
| 8 | **Objection handling** | FAQ, wątpliwości | Accordion FAQ / long-form „dlaczego" / comparison table / guarantee block |
| 9 | **Offer** | Cena + co dostajesz + gwarancja | Offer box / pricing tiers / bundle card / configurator total / quiz-end recommendation |
| 10 | **Final action** | Ostatnia okazja konwersji | CTA banner / sticky CTA mobile / footer CTA / email capture |

**Reguła:** MUSI być pokryty każdy z 10 tematów. **Forma wybrana per paradygmat** z Sekcji 9 briefa.

### Paradigm → canonical skeleton (przykłady form per paradygmat)

**Dashboard-style (anxiety + outcome-hero — np. smart home, safety):**
```
Hero: split image, app/device mockup prawo + headline „You're in control" lewo
Trust: mała belka z liczbami użytkowników + cert badges
Problem: statystyka duża + short paragraph (nie PAS 3-akapitowy)
Solution: feature cards z UI screenshots (nie bento grid)
How: 3 app-screen sequence (nie ikonki abstrakcyjne)
Proof: real-data case study z wykresami/stats + 2 video quotes
FAQ: compact accordion, 5 pytań
Offer: box z gwarancją powrotu, subskrypcja vs single purchase
Final: sticky CTA na mobile + email capture w footerze
```

**Scrollytelling (anxiety → reassurance arc, demo):**
```
Hero: sekwencyjne frames (przed → w trakcie → po), headline jedna linia
Trust: przesunięte niżej, po hero (buduje suspens)
Problem: zadany obraz lęku (np. fotka drabiny + cytat)
Solution: STICKY image w center + scrolling narracja z boku (3-4 beatów)
How: demonstracja kontinuum (nie „3 kroki z ikonkami")
Proof: before-after split cards z konkretnymi liczbami
FAQ: expandable, pytania dotyczące lęku
Offer: box z pełną obietnicą bezpieczeństwa
Final: CTA z podkreśleniem „zero ryzyka"
```

**Editorial / manifesto (desire/identity, enthusiast):**
```
Hero: text-first, duża prose headline, minimal photo w tle
Trust: subtelne press quote strip (bez badges)
Problem: long-form prose paragraph (nie statystyka)
Solution: sekwencja krótkich magazynowych sekcji Nº 01, Nº 02 (numeracja)
How: jeden długi przekrój tekstowy z inline quotes
Proof: 1-2 cytaty press + zero „5 stars" review grid
FAQ: rozwijane jako text links (nie accordion-styled)
Offer: scarcity-framed, limited release framing
Final: quiet CTA bez urgency
```

**Cinematic launch (desire + product-hero, premium AGD):**
```
Hero: full-bleed video autoplay + jedno statement headline
Trust: brak osobnej sekcji (integrated in nav: „As seen in Vogue")
Problem: krótki, 1 beat emocjonalny
Solution: 3 emotional beats scroll-revealed z cutaway diagrams
How: animated tech breakdown (slow-mo shots style)
Proof: minimal — zero testi, 1 video, press logos
FAQ: hidden w tabs (tylko dla fryzerów decyzji)
Offer: dark, product-centric box z numerem produkcji
Final: elegant „order now" bez urgency
```

**Comparison grid (skepticism, B2B, buyer porównuje SKU):**
```
Hero: split z ceną widoczną + „compare plans" CTA
Trust: logo klientów rząd (credibility mass)
Problem: skrótowe, listing-style
Solution: full comparison table z feature matrix
How: link do demo video (skondensowane)
Proof: rating widget + count reviews prominent
FAQ: expandable (szczegółowe)
Offer: 3 pricing tiers side-by-side
Final: double CTA: „start trial" + „talk to sales"
```

**Spec waterfall (desire + product-hero, tech):**
```
Hero: oversized numeral background (5600, 120Hz, 0.3s)
Trust: press + mikro-review snippets
Problem: minimal, 1 zdanie
Solution: scroll-down spec cards, każda reveal jednej liczby
How: cutaway technical diagram
Proof: benchmark graph + tech review quote
FAQ: tech-focused
Offer: box z pełną specyfikacją
Final: solo CTA
```

> Pozostałe 6 paradygmatów (Platform breadth, Configurator, Founder-led, Moment, Quiz-first, Prompt-as-hero) — wybierz skeleton analogicznie, patrz tabela w `01-direction.md` Krok 6.5.

**DLACZEGO nie ma sztywnego szablonu:** bo różny produkt + persona = różna architektura. Oura NIE wygląda jak Dyson. Ring NIE wygląda jak Aesop. To jest mechanika branży, nie kwestia stylu.

### Placeholder zdjęć — wymogi (bez zmian)

| Sekcja-typ | Min | Klasa CSS (elastyczna) | Opis fotografii |
|--------|-----|-----------|------------------|
| **Hero** | 1 | `hero-figure` / `hero-image` / `hero-product` / `hero-mockup` | Packshot / app UI / lifestyle / osoba |
| **Solution / Gallery** | 3-6 | `gal-figure` / `bento-image` / `gallery-image` / `feature-image` / `step-image` | Detail + context + UI |
| **Persona / Proof** | 2-4 | `persona-figure` / `testi-avatar-figure` / `voice-figure` / `avatar-figure` / `case-figure` | Twarz 112×112 LUB scenka |
| **How / Process** | 3 (jeśli paradygmat używa How-step) | `step-figure` / `step-image` / `how-figure` / `ritual-figure` | Ujęcie wykonania kroku |
| **Offer / CTA** | 1 | `offer-figure` / `final-cta-figure` / `cta-figure` / `bg-figure` | Flat lay zestawu / panorama |

Liczba klas dopuszczalnych celowo szeroka — żeby paradigm Editorial nie musiał używać `bento-image` gdy ma long-form prose. Weryfikacja jest **content coverage** (czy jest placeholder), nie **class naming** (czy nazywa się konkretnie).

---

## Wzorce designu

> **WAŻNE**: Domyślnie ZAWSZE używaj jasnego motywu (białe tło). Ciemny motyw stosuj TYLKO gdy manifesto wyraźnie wskazuje (np. Retro-Futuristic / vibestrike, Rugged Heritage / kafina dark hero).

### Unikaj typowych wzorców „AI-generated"

**NIE UŻYWAJ tych elementów — wyglądają generycznie:**

| Element | Dlaczego źle | Co zamiast |
|---------|--------------|------------|
| `border-left: 4px solid [kolor]` na kartach | Typowy wzorzec AI, wygląda tanio | Subtelny cień + hover effect |
| Ikony ✓ i ✗ w porównaniach | Najbardziej oczywisty wzorzec AI | Opisowy tekst, karty lub tabela BEZ checkmarków |
| Czerwone/pomarańczowe kolory dla statystyk „problemu" | Zbyt oczywiste, krzykliwe | Użyj text-primary lub neutralnych kolorów |
| Ikonki z checkmarks w każdym elemencie listy | Przewidywalne, nudne | Prosta lista lub numeracja |
| Gradient border-top na kartach | Wygląda na wygenerowane | Brak lub bardzo subtelny |
| „Neon glow" efekty na wszystkim | Przestarzałe, 2020 | Subtelne cienie, blur |

**Zasada ogólna:** Jeśli element wygląda jak z szablonu lub „zbyt designersko" — usuń go. Prostota > efekty.

### Sekcja Comparison — dwa poprawne formaty

**WYBIERZ JEDEN z dwóch formatów:**

#### Format A: Dwie karty z opisowym tekstem (ZALECANY dla premium)

```html
<div class="comparison-grid">
  <div class="comparison-card">
    <h3>Tradycyjne metody</h3>
    <p class="comparison-desc">Krótki opis problemów tradycyjnego podejścia...</p>
    <ul>
      <li>Punkt negatywny opisany zdaniem</li>
    </ul>
  </div>
  <div class="comparison-card highlight">
    <h3>[MARKA]</h3>
    <p class="comparison-desc">Krótki opis przewag produktu...</p>
    <ul>
      <li>Korzyść opisana pełnym zdaniem</li>
    </ul>
  </div>
</div>
```

```css
.comparison-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
.comparison-card { padding: 40px; border-radius: var(--radius-xl); background: var(--bg-white); }
.comparison-card.highlight { border: 2px solid var(--primary); box-shadow: var(--shadow-lg); }
```

#### Format B: Tabela z opisowymi komórkami (dla tech)

```html
<table class="comparison-table">
  <thead>
    <tr>
      <th>Cecha</th>
      <th>Tradycyjne</th>
      <th class="highlight">[MARKA]</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Czas działania</td>
      <td>2-3 godziny</td>
      <td class="highlight">Do 8 godzin</td>
    </tr>
  </tbody>
</table>
```

**Kiedy który:**
- **Format A (karty)**: produkty premium, mniej cech, nacisk na storytelling
- **Format B (tabela)**: produkty tech, wiele mierzalnych parametrów

**NIGDY:** ikony ✓ / ✗, kolory czerwony/zielony dla tak/nie, emotikony w komórkach.

### Motyw jasny (DOMYŚLNY)

- Background: `#FFFFFF` (główny) i `#F8FAFC` (sekcje alternatywne)
- Tekst: `#111827` (dark) z `#6B7280` (secondary)
- Akcenty: kolory z brandingu (primary, secondary, accent)
- Efekty: subtle shadows, soft gradients, clean borders
- Header/Footer: białe (header **ZAWSZE** `#FFFFFF` — patrz [`reference/safety.md` #9](reference/safety.md))

### Wykorzystanie kolorów marki w sekcjach

Kolory z brandingu (primary, secondary, accent) powinny być widoczne w **każdej sekcji**.

| Sekcja | Tło | Akcenty kolorystyczne |
|--------|-----|----------------------|
| **Hero** | Gradient: `rgba(primary,0.03)` → white → `rgba(secondary,0.03)` | Glow z primary, badge z primary |
| **Trust Bar** | Gradient: `rgba(primary,0.04)` → `rgba(secondary,0.04)` | Ikony w primary, hover z primary shadow |
| **Problem** | Ciepły odcień primary: `#FFF5F0` | Statystyki w kolorze ostrzegawczym |
| **Solution/Bento** | White → `rgba(secondary,0.05)` | Naprzemienne ikony primary/secondary |
| **How It Works** | Ciepły odcień accent: `#FFF8E7` | Numery kroków w różnych kolorach |
| **Comparison** | `rgba(secondary,0.05)` → white | Podświetlona kolumna produktu z `rgba(primary,0.08)` |
| **Testimonials** | White → `rgba(primary,0.03)` | Gwiazdki w accent, avatary w primary-soft |
| **FAQ** | `rgba(secondary,0.05)` → white | Ikony strzałek w primary |
| **Offer** | Gradient: `rgba(primary,0.05)` → white → `rgba(secondary,0.05)` | Animowany border z primary+secondary+accent |
| **CTA Banner** | **Gradient: primary → secondary** (pełne kolory!) | Biały tekst, biały przycisk z primary tekstem |
| **Footer** | Jasny `#FAFAFA` | Border-top gradient primary → secondary |

```css
/* CTA Banner - pełne kolory */
.cta-banner { background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%); }
.cta-banner .cta-title { color: #FFFFFF; }
.cta-banner .btn-primary { background: #FFFFFF; color: var(--primary); }
```

### Motyw ciemny (TYLKO na życzenie — tech/gaming z manifesta)

- Background: `#0A0A0A` lub `#0D1117`
- Tekst: `#FFFFFF` z opacity 0.5-1.0
- Akcenty: neonowe (cyan, magenta, lime)
- Efekty: glow, particles, noise texture
- Przykład: vibestrike, kafina (Rugged Heritage dark hero)

---

## Tech Stack (vanilla)

```
- HTML5 semantic
- CSS3 (custom properties, grid, flexbox)
- Vanilla JS (intersection observer dla fade-in, hamburger)
- Google Fonts (z &subset=latin-ext — patrz reference/safety.md #10)
- Zero dependencies
```

## CSS Architecture

### Zmienne CSS (root)

```css
:root {
  /* Brand Colors */
  --primary: [kolor z brandingu];
  --secondary: [kolor z brandingu];
  --accent: [kolor z brandingu];
  --neutral-dark: [kolor z brandingu];
  --neutral-mid: [kolor z brandingu];
  --neutral-light: [kolor z brandingu];

  /* Derived */
  --primary-soft: rgba([primary], 0.08);
  --primary-glow: rgba([primary], 0.25);

  /* Typography */
  --font-heading: '[font-heading]', sans-serif;
  --font-body: '[font-body]', sans-serif;
  --font-accent: '[font-accent]', monospace;
}
```

### Utility Classes

```css
.container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }

/* Fade-in z safety gate (patrz reference/safety.md #2) */
html.js .fade-in { opacity: 0; transform: translateY(40px); transition: 0.8s; }
html.js .fade-in.visible { opacity: 1; transform: translateY(0); }

.section-label {
  font-family: var(--font-accent);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 3px;
  line-height: 1.4;  /* polskie diakrytyki — patrz reference/safety.md #7 */
}
```

### Responsive Breakpoints

```css
@media (max-width: 768px) { /* Tablet/Mobile */ }
@media (max-width: 480px) { /* Small mobile */ }
@media (max-width: 380px) { /* Extra small */ }
```

---

## Komponenty

### Header — ZAWSZE solid #FFFFFF

> ⚠️ **NIE używaj `rgba() + backdrop-filter`** — patrz [`reference/safety.md` #9](reference/safety.md). Header musi być solid `#FFFFFF` na każdym landingu (logo zaprojektowane na białym tle, kontrast z hero).

```css
.header {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  background: #FFFFFF;
  border-bottom: 1px solid var(--rule);
}
```

### Trust Bar (jedna linia na desktop!)

```css
.trust-items {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: nowrap;
}

.trust-item {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  flex-shrink: 0;
  white-space: nowrap;  /* zapobiega łamaniu */
}

.trust-icon { width: 40px; height: 40px; flex-shrink: 0; }
.trust-text strong { font-size: 13px; white-space: nowrap; }
.trust-text span { font-size: 12px; white-space: nowrap; }

@media (max-width: 768px) {
  .trust-items { flex-wrap: wrap; gap: 16px; }
}
@media (max-width: 900px) {
  .trust-items { flex-direction: column; }
}
```

> Pełny snippet copy-paste: [`reference/patterns.md` #15 Trust Strip](reference/patterns.md).

### Hero Glow Effect

```css
.hero-glow {
  position: absolute; width: 900px; height: 900px; border-radius: 50%;
  background: radial-gradient(circle, rgba(var(--primary-rgb), 0.2) 0%, transparent 70%);
  animation: glow-pulse 4s ease-in-out infinite alternate;
}
```

### Hero Background Animation

Każdy landing MA mieć subtelną animację W TLE sekcji hero, dopasowaną do produktu.

**Zasady:**
- Animacja w tle, NIE zastępuje placeholdera/zdjęcia produktu
- Subtelna (opacity 0.1-0.4, delikatne ruchy)
- Nawiązuje do produktu (nie generyczna)

| Kategoria | Typ | Elementy |
|---|---|---|
| Urządzenia masujące/wibracyjne | Pulsujące fale | Koncentryczne kręgi |
| Napoje/żywność | Unoszące się cząsteczki | Bąbelki |
| Kosmetyki | Delikatne fale | Płynne, organiczne kształty |
| Tech/gadżety | Geometryczne | Linie, siatki |
| Termoterapia | Ciepłe cząsteczki | Pomarańczowe/czerwone punkty |

```html
<section class="hero">
  <div class="hero-glow"></div>
  <div class="hero-bg-animation">
    <div class="vibration-wave vibration-wave-1"></div>
    <div class="vibration-wave vibration-wave-2"></div>
    <div class="vibration-wave vibration-wave-3"></div>
  </div>
  <div class="container"><!-- ... --></div>
</section>
```

```css
.hero-bg-animation {
  position: absolute; top: 50%; right: 10%;
  transform: translateY(-50%);
  width: 500px; height: 500px;
  pointer-events: none; z-index: 0;
}

.vibration-wave {
  position: absolute; top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  border: 1px solid rgba(var(--primary-rgb), 0.1);
  animation: vibration-pulse 4s ease-out infinite;
}

.vibration-wave-1 { width: 200px; height: 200px; }
.vibration-wave-2 { width: 300px; height: 300px; animation-delay: 1s; }
.vibration-wave-3 { width: 400px; height: 400px; animation-delay: 2s; }

@keyframes vibration-pulse {
  0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.4; }
  100% { transform: translate(-50%, -50%) scale(1.2); opacity: 0; }
}

@media (max-width: 768px) {
  .hero-bg-animation { width: 300px; height: 300px; opacity: 0.5; }
}
```

### Bento Card with Spotlight

```css
.bento-card .spotlight {
  position: absolute; width: 300px; height: 300px; border-radius: 50%;
  background: radial-gradient(circle, rgba(var(--primary-rgb), 0.08) 0%, transparent 70%);
  pointer-events: none; opacity: 0; transition: opacity 0.4s;
}
.bento-card:hover .spotlight { opacity: 1; }
```

### Shimmer Button

```css
.btn-shimmer::after {
  content: ''; position: absolute; top: 0; left: -100%; width: 60%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  animation: shimmer 3s infinite;
}
@keyframes shimmer { 0% { left: -100%; } 100% { left: 200%; } }
```

### Border Beam (Offer Box)

```css
.offer-box::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
  background: linear-gradient(90deg, var(--primary), var(--accent), var(--primary));
  animation: border-beam 3s linear infinite; background-size: 200% 100%;
}
```

### Marquee (Infinite Scroll)

```css
.marquee-track {
  display: flex; gap: 48px; width: max-content;
  animation: marquee 25s linear infinite;
}
@keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
```

> Więcej signature snippets (Magnetic CTA, Tile 3D Tilt, Split Headline Reveal, Number Counter, Editorial Numeral): [`reference/patterns.md`](reference/patterns.md).

---

## Placeholder Images (przed otrzymaniem zdjęć)

```html
<div class="ph">
  <div class="ph-mark">P</div>
  <div class="ph-title">Fotografia produktowa</div>
  <div class="ph-size">Paromia Handheld · 1200 × 1500</div>
  <div class="ph-note">Neutralne tło (ivory/paper). Orientacja pionowa 4:5, przycięte ciasno. Światło miękkie, boczne.</div>
</div>
```

```css
.ph {
  position: relative; overflow: hidden;
  background: var(--anthracite, #f8f9fa);
  border: 1px solid rgba(var(--primary-rgb), 0.1);
  display: flex; align-items: center; justify-content: center;
  flex-direction: column; gap: 12px;
  padding: 24px;
}
.ph-mark { font-size: 48px; opacity: 0.3; }
.ph-title { font-weight: 600; }
.ph-size { font-family: var(--font-mono); font-size: 12px; opacity: 0.7; }
.ph-note { font-size: 13px; max-width: 300px; text-align: center; line-height: 1.5; }
```

> **Każdy placeholder to BRIEF dla fotografa** — patrz [`reference/safety.md` #4](reference/safety.md). NIE pisz „TODO" ani „Hero Image" — pisz 4-polowy brief z kontekstem.

---

## Wymagane zdjęcia na landing page (10-14 sztuk)

### Lista wymaganych zdjęć

| # | Sekcja | Nazwa | Rozmiar | Placeholder |
|---|--------|-------|---------|-------------|
| 1 | **Hero** | Hero Product | 1200×900 | TAK |
| 2 | **Problem** | Problem Visual | 800×600 | TAK |
| 3 | **Solution/Bento** | Feature 1-4 | 640×360 | TAK (4x) |
| 4 | **How It Works** | Krok 1-3 | 600×450 | TAK (3x) |
| 5 | **Testimonials** | Avatar 1-3 | 56×56 | OPCJONALNIE |
| 6 | **Offer** | Zestaw produktu | 800×450 | TAK |

**Suma: 10-14 zdjęć na landing.**

### Przykłady HTML placeholderów

#### Bento Card

```html
<div class="bento-card fade-in">
  <div class="spotlight"></div>
  <div class="bento-image">
    <div class="ph" style="aspect-ratio: 16/9; margin-bottom: 20px;">
      <div class="ph-mark">B</div>
      <div class="ph-title">Feature 1</div>
      <div class="ph-size">640×360px</div>
      <div class="ph-note">Zbliżenie detalu — np. głowica parownicy w użyciu, light bottom 45°</div>
    </div>
  </div>
  <h3 class="bento-title">...</h3>
  <p class="bento-text">...</p>
</div>
```

#### How It Works

```html
<div class="how-step fade-in">
  <div class="how-step-image">
    <div class="ph" style="aspect-ratio: 4/3; margin-bottom: 20px; border-radius: 12px;">
      <div class="ph-mark">H1</div>
      <div class="ph-title">Krok 1: Napełnij wodą</div>
      <div class="ph-size">600×450px</div>
      <div class="ph-note">Ręka trzymająca zbiornik, light naturalne, kontekst kuchni</div>
    </div>
  </div>
  <div class="how-step-number">1</div>
  <h3 class="how-step-title">...</h3>
</div>
```

#### Offer

```html
<div class="offer-box fade-in">
  <span class="offer-badge">Bestseller</span>
  <div class="offer-image" style="margin: 24px 0;">
    <div class="ph" style="aspect-ratio: 16/9; border-radius: 16px;">
      <div class="ph-mark">O</div>
      <div class="ph-title">Zestaw produktu</div>
      <div class="ph-size">800×450px</div>
      <div class="ph-note">Flat lay wszystkich elementów zestawu na ivory tle, top-down</div>
    </div>
  </div>
  <h3 class="offer-title">...</h3>
</div>
```

### Wskazówki dotyczące zdjęć

1. **Hero Product** — produkt na białym/przezroczystym tle, min. 1200px szerokości, najlepsza strona
2. **Feature images (Bento)** — zbliżenia detali, produkt w użyciu, spójny styl
3. **How It Works** — jasne, instruktażowe, kolejne etapy, mogą zawierać ręce użytkownika
4. **Testimonials avatars** — prawdziwe lub stockowe, spójne oświetlenie, twarze do kamery
5. **Offer zestaw** — wszystkie elementy widoczne, flat lay lub lekko pod kątem

### Alternatywy gdy brak zdjęć

- Stockowe (Unsplash, Pexels)
- AI generated (Midjourney, DALL-E, własna edge function `generate-image`)
- Mockupy produktowe
- W ostateczności: placeholder-briefy 4-polowe → klient dostarcza

---

## JavaScript — 5 obowiązkowych JS effects w ETAP 2

> **Wszystkie 5 effects MUSZĄ być w każdym landingu** (DESIGN D.1 + verify-landing.sh Grupa 7). Dodawaj je razem z HTML w ETAP 2, nie odkładaj do ETAP 4.

| # | Effect | Klasa | Gdzie | Pattern |
|---|---|---|---|---|
| 1 | **Fade-in safe** (html.js gate + safety timeout z filtrem getBoundingClientRect) | `.fade-in` | wszędzie | [#11](reference/patterns.md) |
| 2 | **Split headline reveal** (char-by-char staggered) | `.js-split` | h1 w Hero | [#17](reference/patterns.md) |
| 3 | **Number counters** (0→target, easeOutCubic) | `.js-counter` z `data-target` | min 2× (spec sheet, hero stats, offer savings) | [#18](reference/patterns.md) |
| 4 | **Magnetic CTA** (kursor lekko przyciąga, tylko `hover:hover`) | `.magnetic` | min 2× na primary/offer buttons | [#19](reference/patterns.md) |
| 5 | **Tile 3D Tilt** (subtle rotateX/Y max 4°) | `.js-tilt` | min 2× na bento tiles | [#20](reference/patterns.md) |
| 6 | **Parallax numerals** (editorial numerals unoszą się przy scrollu) | `.js-parallax` z `data-speed` | min 1× (signature element hero/section) | [#21](reference/patterns.md) |

**Jeśli brak któregokolwiek → `verify-landing.sh` FAIL → blokuje deploy.**

## JavaScript (snippety podstawowe)

> ⚠️ Fade-in MUSI mieć `html.js` gate i safety timeout filtrujący `getBoundingClientRect()` — patrz [`reference/safety.md` #2](reference/safety.md). Pełny snippet copy-paste: [`reference/patterns.md` #11](reference/patterns.md).

```javascript
// Fade-in observer (z safety timeout — patrz safety.md #2)
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((es) => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
  }), { threshold: 0.1, rootMargin: '0px 0px -80px 0px' });
  document.querySelectorAll('.fade-in').forEach(el => io.observe(el));

  setTimeout(() => {
    document.querySelectorAll('.fade-in:not(.visible)').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight) el.classList.add('visible');
    });
  }, 3000);
} else {
  document.querySelectorAll('.fade-in').forEach(el => el.classList.add('visible'));
}

// Hamburger menu
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  mobileMenu.classList.toggle('open');
});

// Close mobile menu on link click
document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    mobileMenu.classList.remove('open');
  });
});

// Spotlight effect for bento cards
document.querySelectorAll('.bento-card').forEach(card => {
  const spotlight = card.querySelector('.spotlight');
  if (spotlight) {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      spotlight.style.left = (e.clientX - rect.left) + 'px';
      spotlight.style.top = (e.clientY - rect.top) + 'px';
    });
  }
});

// Cookie banner
const cookieBanner = document.getElementById('cookieBanner');
const cookieBtn = document.getElementById('cookieAccept');
if (!localStorage.getItem('cookiesAccepted')) {
  setTimeout(() => cookieBanner.classList.add('show'), 2000);
}
cookieBtn.addEventListener('click', () => {
  localStorage.setItem('cookiesAccepted', 'true');
  cookieBanner.classList.remove('show');
});
```

---

## Proces tworzenia (workflow)

1. **Pobierz dane** z Supabase (workflow, branding, products, reports)
2. **Przeczytaj `_brief.md`** (wynik ETAP 1) — szczególnie **Sekcja 9: Paradigm architektury** (emocja + hero type + wybór 1 z 12 + structural signature)
3. **Zbuduj szkielet per paradigm** — z canonical skeletons powyżej (Dashboard / Scrollytelling / Editorial / Cinematic / Comparison / Spec waterfall / …) — manifesto i paradygmat są jedynymi driverami designu
4. **Pokryj 10 tematów** w formie zgodnej z paradygmatem (nie sztywnie 14 sekcji)
5. **Napisz copy** dla każdej sekcji (patrz [`reference/copy.md`](reference/copy.md))
6. **Wygeneruj HTML** — używaj snippetów z [`reference/patterns.md`](reference/patterns.md) ostrożnie (**MAX 3 patterns per landing** — patrz nagłówek patterns.md)
6. **Zapisz** `landing-pages/[slug]/index.html` (pojedynczy plik, inline CSS + JS)
7. **Logo upload** — sharp().trim() + Supabase Storage (Kroki po wygenerowaniu HTML wyżej)
8. **Skonfiguruj URL** w `vercel.json` (jeśli dedykowany URL)
9. **Przejdź do ETAP 3** ([`03-review.md`](03-review.md)) — `bash scripts/verify-landing.sh [slug]`

> ⚠️ **NIE** używaj `cp -r landing-pages/$BASE` — to było MODE=copy-adapt, **usunięte z procedury** (memory `feedback-landing-always-forge.md`).

---

## Konfiguracja URL (Vercel)

Landing pages są hostowane na `tn-crm.vercel.app`.

### Domyślny URL

```
https://tn-crm.vercel.app/landing-pages/[slug]/
```

### Dedykowany URL (bez `/landing-pages/`)

Aby landing był dostępny pod krótszym URL (np. `/h2vital`), dodaj rewrite do `vercel.json`:

```json
{ "source": "/h2vital", "destination": "/landing-pages/h2vital/index.html" },
{ "source": "/h2vital/", "destination": "/landing-pages/h2vital/index.html" },
```

### Deploy

Po zmianach w `vercel.json`:
```bash
git add . && git commit -m "Add landing page route" && git push
```

Vercel automatycznie zdeployuje zmiany (FULL auto w AUTO-RUN — patrz [`README.md`](README.md)).

---

## Komendy curl (Supabase)

```bash
# Pobierz branding
curl -s "https://yxmavwkwnfuphjqbelws.supabase.co/rest/v1/workflow_branding?workflow_id=eq.[UUID]&select=*" \
  -H "apikey: $SUPABASE_SERVICE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_KEY"

# Pobierz produkty
curl -s "https://yxmavwkwnfuphjqbelws.supabase.co/rest/v1/workflow_products?workflow_id=eq.[UUID]&select=*" \
  -H "apikey: $SUPABASE_SERVICE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_KEY"

# Pobierz raport PDF
curl -s "https://yxmavwkwnfuphjqbelws.supabase.co/rest/v1/workflow_reports?workflow_id=eq.[UUID]&type=eq.report_pdf&select=*" \
  -H "apikey: $SUPABASE_SERVICE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_KEY"
```

---

## Logo z projektu — przetwarzanie

Logo znajduje się w tabeli `workflow_branding` z `type='logo'`, URL w polu `file_url`. Główne logo ma `notes` JSON z `"is_main": true`.

### Szybka metoda (jedna komenda)

```bash
cd /c/repos_tn/tn-crm && node -e "
const sharp = require('sharp');
sharp('landing-pages/[SLUG]/logo.png')
  .trim()
  .png()
  .toFile('landing-pages/[SLUG]/logo_trimmed.png')
  .then(() => {
    require('fs').renameSync('landing-pages/[SLUG]/logo_trimmed.png', 'landing-pages/[SLUG]/logo.png');
    console.log('Logo przycięte');
  });
"
```

### Wariant A: Tylko przycięcie marginesów (najczęściej wystarczy)

```javascript
const sharp = require('sharp');
sharp('logo_original.png').trim().png().toFile('logo.png');
```

### Wariant B: Logo MA białe tło (rzadziej — gdy trim nie wystarczy)

```javascript
const sharp = require('sharp');

async function processLogo() {
  const { data, info } = await sharp('logo_original.png')
    .trim()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = new Uint8Array(info.width * info.height * 4);
  for (let i = 0; i < info.width * info.height; i++) {
    const r = data[i * 3], g = data[i * 3 + 1], b = data[i * 3 + 2];
    const isWhite = r > 250 && g > 250 && b > 250;
    pixels[i * 4] = r;
    pixels[i * 4 + 1] = g;
    pixels[i * 4 + 2] = b;
    pixels[i * 4 + 3] = isWhite ? 0 : 255;
  }

  await sharp(pixels, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png()
    .toFile('logo.png');
}
processLogo();
```

### CSS dla logo

```css
.logo { display: flex; align-items: center; text-decoration: none; }
.logo img { height: 48px; width: auto; object-fit: contain; }
```

### HTML

```html
<a href="#" class="logo" aria-label="[Marka] — strona główna">
  <img src="https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/landing/[slug]/logo.png" alt="[Marka]" width="140" height="36">
</a>
```

---

## Conversion Toolkit (CRO)

**ZAWSZE dodawaj Conversion Toolkit** do każdego landing page, aby zwiększyć konwersję.

### Komponenty dostępne w toolkit

| Komponent | Wpływ na konwersję |
|-----------|-------------------|
| Exit Intent Popup | +15-20% |
| Urgency Timer (evergreen 24h) | +9-15% |
| Stock Counter | +10-12% |
| Social Proof Toast | +5-8% |
| Live Visitors | +3-5% |
| Floating CTA | +5-10% |
| Progress Bar | engagement |

### Integracja

Dodaj przed `</body>`:

```html
<script src="/landing-pages/shared/conversion-toolkit.js"></script>
<script>
  document.addEventListener('DOMContentLoaded', function() {
    ConversionToolkit.init({
      brand: {
        primary: '[KOLOR-ACCENT]',
        secondary: '[KOLOR-PRIMARY]',
        name: '[NAZWA-MARKI]',
        ctaUrl: '#offer'
      },
      exitPopup: {
        enabled: true,
        headline: 'Czekaj! Nie przegap tej okazji',
        subheadline: '[OFERTA SPECJALNA]',
        ctaText: 'Odbierz ofertę',
        dismissText: 'Nie, dziękuję'
      },
      urgency: {
        enabled: true,
        countdown: { enabled: true, position: 'both', text: 'Oferta wygasa za:' },
        stock: { enabled: true, initial: 20, min: 3 }
      },
      socialProof: {
        enabled: true,
        liveVisitors: { enabled: true },
        recentPurchases: { enabled: true }
      },
      scrollCTA: { enabled: true, text: 'Zamów teraz', pulse: true },
      progressBar: { enabled: true },
      extraCTAs: { enabled: true }
    });
  });
</script>
```

Pełna dokumentacja: `/landing-pages/shared/README.md`.

**WAŻNE:** Toolkit automatycznie dodaje klasę `ct-has-urgency-bar` do body i przesuwa header o 52px (44px na mobile). Header landing page MUSI mieć `position: fixed; top: 0;` aby to działało.

### Co landing page MUSI mieć (dla integracji z toolkit)

#### 1. Header z `position: fixed`
```css
.header {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  background: #FFFFFF;
}
```

#### 2. Hero z padding dla headera
```css
.hero { padding-top: [wysokość headera + margines]; }

/* Toolkit AUTOMATYCZNIE doda: */
/* body.ct-has-urgency-bar .header { top: 52px; } */
/* body.ct-has-urgency-bar { padding-top: 52px; } */
```

Jeśli chcesz dodatkowy padding w hero dla urgency bar:
```css
body.ct-has-urgency-bar .hero {
  padding-top: [bazowy padding + ~50px];
}
```

#### 3. NIE dodawaj własnego sticky CTA
Toolkit ma wbudowany `mobileBar` — nie twórz duplikatu `.sticky-cta`!

### Breakpoints Reference

| Breakpoint | Urgency Bar | Header Offset | Komponenty |
|------------|-------------|---------------|------------|
| >768px (desktop) | 52px | top: 52px | Floating CTA, Sticky Bar |
| ≤768px (mobile) | 44px | top: 44px | Mobile Bottom Bar |
| ≤480px (small) | 44px | top: 44px | Mniejsze fonty/spacing |

### Częste błędy do unikania

1. **Duplikat CTA** — nie dodawaj `.sticky-cta` gdy używasz toolkit
2. **Header bez `position: fixed`** — toolkit wymaga
3. **Nadpisywanie stylów toolkit** — nie pisz własnych dla `.ct-*` klas
4. **Brak padding w hero** — hero musi mieć padding na header

---

## Checklist przed deploy

- [ ] Wszystkie 10 tematów pokryte (Navigation → Final action), forma zgodna z paradygmatem z briefa sekcja 9
- [ ] Kolory i fonty z brandingu (zgodne z `_brief.md`)
- [ ] Logo z projektu (przycięte sharp().trim, pełny URL Supabase)
- [ ] **Pełne URL** do wszystkich assetów (Supabase Storage, NIE względne)
- [ ] Responsive (768px, 480px, 380px)
- [ ] Fade-in z `html.js` gate i safety timeout (patrz safety.md #2)
- [ ] Hamburger menu działa
- [ ] Cookie banner
- [ ] **Placeholdery z briefem fotografa** dla wszystkich brakujących obrazów (4-polowe!)
- [ ] CTA buttony linkują do #offer
- [ ] Meta tags (title, description, OG image z pełnym URL)
- [ ] **Conversion Toolkit zintegrowany**
- [ ] **PageSpeed Optimization** (preconnect, fetchpriority, lazy loading) — patrz [`reference/pagespeed.md`](reference/pagespeed.md)
- [ ] **Header `#FFFFFF` solid** (NIE rgba+backdrop) — patrz safety.md #9
- [ ] **Fonty z `&subset=latin-ext`** — patrz safety.md #10
- [ ] **Zero zakazanych fraz** (24h, magazyn PL, COD, raty, PayPo, Klarna) — patrz safety.md #6
- [ ] Route w `vercel.json` (jeśli dedykowany URL)

---

## Failure modes (AUTO-RUN mode)

| Warunek | Akcja | Max retry | Fallback |
|---------|-------|-----------|----------|
| `cp -r` z baseline fail | Fallback do MODE=forge | 1 | STOP + raport |
| Brak zdjęć AI w `ai-generated/[slug]/` | Placeholdery z briefem fotografa | — | kontynuuj, podmień w ETAP 4 |
| Błąd składni HTML (parse) | Re-generuj sekcję | 2 | STOP + diff |
| Logo upload do Supabase fail | Re-try z innym sharp config | 2 | STOP + manual upload |
| Obcy UUID w `<img src>` (nieswoje zdjęcia) | Usuń, zastąp placeholderem | — | kontynuuj |

---

## Po wygenerowaniu HTML

Przejdź do ETAP 3: [`03-review.md`](03-review.md) — `bash scripts/verify-landing.sh [slug]` (18/18 PASS).
