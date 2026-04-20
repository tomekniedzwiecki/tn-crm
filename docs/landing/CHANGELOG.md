# Changelog — Landing Page Procedure

## [v3.6] — 2026-04-20

### Added — Section variants library (22 wariantów per sekcja)

Biblioteka wariantów Tier 1 dla 3 kluczowych sekcji (Hero/Features/Testimonials). Reszta sekcji (Header, Trust, Problem, How, Compare, FAQ, Offer, Final CTA, Footer, Sticky CTA, Cookie) = klasyczny szablon bez zmian — fundament konwersji nienaruszony.

**Nowe pliki:**
- `docs/landing/reference/section-variants.md` — 10 wariantów Hero + 6 Features + 6 Testimonials, każdy z HTML snippet + CSS + kryteriami wyboru. Plus drzewo decyzyjne (rozdział 4) + reguła pierwszeństwa „pierwsza pasująca z góry wygrywa". Plus rozdział 6: JS Effects coverage — tabela deficytów per wariant + reguła uzupełniania fallbacków.

**Zmiany:**
- `docs/landing/02-generate.md` — nowy rozdział „Autonomiczny wybór wariantów sekcji" przed architekturą 14 sekcji. Krok 2 workflow ETAP 2: wybierz warianty z drzewa + zaloguj w `_brief.md` sekcja 9. Krok 5 workflow: sprawdź pokrycie 5 JS effects, uzupełnij fallbacki.
- `docs/landing/01-direction.md` — sekcja 9 briefa opisana jako opcjonalna (wypełniana autonomicznie w ETAP 2).
- `docs/landing/03-review.md` — tabela „Checklist sekcji i obrazów" variant-aware. Nº numbering oznaczony jako opcjonalny (Editorial paradigm only).
- `landing-pages/_templates/_brief.template.md` — dodana sekcja 9.
- `scripts/landing-autorun.sh` — prompt dla Claude'a wspomina krok wyboru wariantów.
- `scripts/verify-landing.sh` — `BENTO_TILES` regex akceptuje `<div>` i `<article>` (warianty F używają article). `PERS_PH` + `TESTI_PH` obniżone do ≥1 (T5 Single Hero ma 1 avatar). Grupa 2 Nº numbering USUNIĘTA (Editorial-only signature, nie universal requirement).
- `CLAUDE.md` + `docs/landing/README.md` — dodany section-variants.md w reference table. Liczba etapów ujednolicona na 7 (było 6 gdzie pomijano 3.5).

**Motywacja:**
Kafina/Caffora/Numerator/GlassNova (rebuild) miały identyczną architekturę strony (hero split + bento + ritual + spec + versus + voices + FAQ + offer). Różne tylko kolory/teksty. Paradigm approach v3.6 (cofnięty) udawał że każda strona jest inna; realnie tylko 3 sekcje niosą wizualną wagę (Hero/Features/Testimonials) i te wariantujemy — reszta to fundament konwersji.

---

## [v3.5] — 2026-04-20

### Added — ETAP 3.5 Copy Review (Manus)
Nowy obowiązkowy etap pomiędzy ETAP 3 REVIEW a ETAP 4 DESIGN. Wykorzystuje Manus edge function (`manus-ask` / `manus-get-result`) do rewrite'u purple prose na direct response.

**Nowe pliki:**
- `docs/landing/03-5-copy-review.md` — pełna procedura ETAP 3.5
- `scripts/extract-copy.mjs` — extract copy z index.html przez Playwright (UTF-8 safe)
- `scripts/review-copy-manus.sh` — submit + poll Manus (15 min timeout)
- `scripts/apply-copy.mjs` — apply rewritten JSON do HTML

**Integracja z AUTO-RUN:**
- `scripts/landing-autorun.sh` prompt aktualizowany — Claude wywołuje ETAP 3.5 po ETAP 3 PASS
- `docs/landing/README.md` flow 6 → **7 etapów**
- `docs/landing/03-review.md` — pointer na ETAP 3.5 po PASS

**Dlaczego:**
Tomek pokazał Problem copy w Caffora z purple prose („smak żalu", „coś z domu zostaje też w tobie"). `verify-landing.sh` sprawdzał tylko anti-patterns, nie jakość literacką. Manus (senior copywriter direct response AI) jest specjalizowany w tym — dostaje prompt z twardymi zasadami (zakaz purple prose, konkret > metafora, 2 osoba, max 15 słów/zdanie) + brief + obecne copy, zwraca rewrite.

**Wynik na Caffora:**
- Problem h2: „Rytuał który zostaje w domu" → „260 razy w roku zaczynasz dzień od kompromisu"
- Problem body: „smak żalu / papierowy kubek" → „cappuccino za 9 zł: sproszkowane mleko, letnia woda"
- Agitacja: „coś z domu zostaje też w tobie" → „Pięć dni w tygodniu. 52 tygodnie. 260 poranków"

### Added — Per-section placeholder checks
Nowa memory `feedback-landing-placeholder-per-section.md` + `verify-landing.sh` Grupa 1a:
- Hero: min 1 `hero-figure` / `hero-image` / `hero-product`
- Personas: min 3 `persona-figure`
- Testimonials: min 2 `avatar-figure` / `voice-figure` / `testi-avatar-figure`
- Procedure/How: min 3 `step-figure` / `ritual-figure`
- Final CTA: 1 `bg-figure` (warn, opcjonalnie)

### Added — No purple prose rule
`reference/safety.md` #11: zakaz literary flourish + lista czerwonych fraz do rewrite.

---

## [v3.4] — 2026-04-20

### Added — Grupa 12 Copy quality (pozytywne)
`verify-landing.sh` sprawdza teraz:
- Headline ≤10 słów
- Brak „nasz/nasza/nasze" (2 osoba Ty/Twój)
- Konkretne liczby w hero (digit + jednostka)
- FAQ answers ≥80 znaków
- Testimonials ≥80 znaków
- Offer CTA z korzyścią

---

## [v3.3] — 2026-04-20

### Added — 5 obowiązkowych JS effects
`verify-landing.sh` Grupa 7:
- `.js-split` (1× h1 hero)
- `.js-counter` (≥2)
- `.magnetic` (≥2)
- `.js-tilt` (≥2)
- `.js-parallax` (≥1)

---

## [v3.2] — 2026-04-20

### Added — Section completeness + hero placeholder
`verify-landing.sh` Grupa 11 sprawdza explicite wszystkie 14 sekcji po klasie HTML. Hero MUSI mieć `hero-figure` placeholder.

---

## [v3.1] — 2026-04-20 (hotfix)

### BREAKING CHANGE
- **Usunięta opcja MODE=copy-adapt** — zawsze MODE=forge (memory: `feedback-landing-always-forge.md`)
- Każdy landing budujesz **od zera** używając szkieletu 14 sekcji + snippetów z `reference/patterns.md`
- NIGDY nie kopiuj istniejących baseline'ów (`cp -r landing-pages/$BASE` jest zakazane)

### Dlaczego
Tomek zobaczył efekt MODE=copy-adapt dla Caffory (kopia kafiny 1:1 z innymi kolorami/copy) i to nie jest to czego chce. Argumenty:
- Procedura ma być **uniwersalna** — działać nawet gdyby `landing-pages/` było puste
- Kopiowanie baseline = local maxima (powielasz błędy poprzednika, brak ewolucji)
- Klient widzi „rodzeństwo" landingów zamiast unikalnej marki
- AI-slop — adaptacja sprawdzonego layoutu wygląda generycznie

### Changed
- `01-direction.md` Krok 5 — tabela baseline jako **anty-referencje** (co JUŻ JEST, czego NIE powtarzać), nie template'y
- `01-direction.md` Krok 6 — usunięty MODE decision, zawsze forge
- `02-generate.md` — usunięte wszystkie wzmianki o `cp -r` i MODE=copy-adapt
- `_brief.template.md` sekcja 6 — z „Baseline decision" na „Anty-referencje"
- `verify-brief.sh` — sprawdza sekcję 6 jako anty-referencje (treść, nie checkbox MODE)
- `reference/safety.md` #1 — przepisana z „Baseline mismatch" na „NIGDY nie kopiuj layoutu"

### Bug fix
- `landing-autorun.sh` — slug extraction (brand_info to escaped JSON, parsuj przez node, nie grep)

### Wpływ na istniejące landingi
- `landing-pages/caffora/` — utworzony PRZED v3.1 jako test copy-adapt z kafiny. **Powinien zostać usunięty i zrobiony od zera** (decyzja użytkownika)

---

## [v3] — 2026-04-20

### BREAKING CHANGES

- **Manifesto = ETAP 1** (było ETAP 2.5). Wybór kierunku PRZED generowaniem HTML.
- **Nowa struktura folderów:** wszystkie pliki w `docs/landing/` (było `tn-crm/` root).
- **Nowy enforcement:** `scripts/verify-brief.sh` BLOKUJE ETAP 2 jeśli `_brief.md` niekompletny.
- **FULL auto deploy:** brak pre-commit checkpointu — Claude commituje + pushuje + deployuje na Vercel od razu po ETAP 6 (landingi to preview dla klienta, nie produkcja).

### Dlaczego refactor

**Root cause v2 (przed 2026-04):** dryf kierunku (Editorial↔Panoramic Calm) przy prompcie bez danych workflow. ETAP 1 (stare PROCEDURE) wybierał baseline z tabeli 6 presetów bez audytu produktu, manifesto (stare ETAP 2.5) było „poprawkowaczem po fakcie". Claude Design pytany o „szablon idealnego landinga" dryfował między Editorial/Panoramic Calm bez danych Supabase.

**Fix v3:** manifesto ETAP 1 + verify-brief.sh enforcement → baseline jest **skutkiem** audytu produktu, nie zgadywanką z tabeli.

### Added

#### Pliki dokumentacji
- `docs/landing/README.md` — master index + AUTO-RUN protocol
- `docs/landing/CHANGELOG.md` — ten plik
- `docs/landing/migrate.md` — osobny flow dla starych landingów / modyfikacji
- `docs/landing/reference/safety.md` — single source dla 10 reguł bezwarunkowych
- `docs/landing/reference/copy.md` — Copywriter Playbook + Conversion Boosters (wydzielony)
- `docs/landing/reference/pagespeed.md` — PageSpeed optimization (wydzielony)

#### Skrypty
- `scripts/verify-brief.sh` — walidacja `_brief.md` przed ETAP 2 (8 sekcji + checkbox + 3 marki + paleta)
- `scripts/verify-all-landings.sh` — regression check na 6 baseline'ach (paromia, h2vital, pupilnik, kafina, vibestrike, vitrix)

#### Templates
- `landing-pages/_templates/_brief.template.md` — szablon manifesta z 8 sekcjami

### Changed

#### Reorganizacja plików (8 root → 13 w `docs/landing/`)

| Stara ścieżka | Nowa ścieżka | Zmiany |
|---|---|---|
| `CLAUDE_LANDING.md` | `docs/landing/README.md` | Master index, flowchart, AUTO-RUN protocol |
| `CLAUDE_LANDING_DIRECTION.md` | `docs/landing/01-direction.md` | **EXPANDED** + Krok 5 (mapping baseline) + Krok 6 (MODE decision) + Krok 9 (verify-brief gate) |
| `CLAUDE_LANDING_PROCEDURE.md` | `docs/landing/02-generate.md` | **SLIMMED** z 2919 → 1011 linii (extracted: KRYTYCZNE LEKCJE → safety, Senior Copywriter → copy, PageSpeed → pagespeed, MIGRACJA → migrate) |
| `CLAUDE_LANDING_REVIEW.md` | `docs/landing/03-review.md` | Update paths + cross-refs |
| `CLAUDE_LANDING_DESIGN.md` | `docs/landing/04-design.md` | Update paths + cross-refs |
| `CLAUDE_LANDING_VERIFY.md` | `docs/landing/05-verify.md` | **EXPANDED** + tabela 33 grep checks z mapowaniem na safety rules |
| `CLAUDE_LANDING_MOBILE.md` | `docs/landing/06-mobile.md` | Update paths + cross-refs |
| `CLAUDE_LANDING_PATTERNS.md` | `docs/landing/reference/patterns.md` | Move bez zmian (1004 linii) |

#### Numeracja ETAP

```
v2:  0 → 1 PROCEDURE → 2 REVIEW → 2.5 DIRECTION → 3 DESIGN → 4 VERIFY → 4.5 MOBILE
v3:  0 → 1 DIRECTION → 2 GENERATE → 3 REVIEW → 4 DESIGN → 5 VERIFY → 6 MOBILE
```

#### CLAUDE.md (globalny entry-point)

- Sekcja „Generowanie landing page" — update z 5 etapów → 6 etapów
- Trigger frazy bez zmian
- Lista plików: 8 → 13 z nowymi ścieżkami `docs/landing/*`

#### MEMORY.md (auto-memory)

- `Landing Pages (tn-crm)` sekcja — path update do `docs/landing/02-generate.md`
- Dodany: `feedback-landing-auto-deploy.md` (FULL auto deploy bez checkpointu)

### Removed

- Duplikaty safety rules w 3-5 plikach (teraz tylko `reference/safety.md`):
  - Fade-in bug — było w 5 miejscach (PROCEDURE, PATTERNS, VERIFY, LANDING, _templates)
  - Header białe — było w 4 miejscach
  - Polskie diakrytyki — było w 3 miejscach
  - Zakazane obietnice — było w 5 miejscach
  - Fonty subset — było w 5 miejscach
  - IntersectionObserver timeout — było w 4 miejscach
  - OG image pełny URL — było w 4 miejscach
- Stara sekcja „Wybór kierunku estetycznego" w PROCEDURE.md (kierunek ustala się wyłącznie w `01-direction.md`)
- Senior Copywriter Playbook (510 linii) z PROCEDURE.md → przeniesione do `reference/copy.md`
- Conversion Boosters (392 linii) z PROCEDURE.md → przeniesione do `reference/copy.md`
- PageSpeed Optimization (310 linii) z PROCEDURE.md → przeniesione do `reference/pagespeed.md`
- MIGRACJA + MODYFIKACJA (84 linii) z PROCEDURE.md → przeniesione do `migrate.md`

### Statistics

| Metryka | v2 | v3 | Zmiana |
|---|---|---|---|
| Liczba plików dokumentacji | 8 | 13 | +5 |
| Lokalizacja | `tn-crm/` root | `docs/landing/` | restrukturyzacja |
| Największy plik (linii) | 2919 (PROCEDURE) | 1011 (02-generate) | -65% |
| Łącznie linii dokumentacji | ~6700 | ~5500 | -18% (po deduplikacji) |
| Skrypty | 2 | 4 | +2 (verify-brief, verify-all-landings) |
| Templates | 0 | 1 | +1 (_brief.template.md) |
| Safety rules w jednym miejscu | NIE (3-5 dup) | TAK | single source |

### Known issues (post-refactor)

Po refactorze `verify-all-landings.sh` regression test pokazał:

| Landing | Status | Powód |
|---|---|---|
| paromia | ❌ FAIL | Pre-existing — sprzed v3 safety rules |
| h2vital | ❌ FAIL | Pre-existing |
| pupilnik | ❌ FAIL | Pre-existing |
| kafina | ✅ PASS | Najnowszy, zgodny z safety |
| vibestrike | ❌ FAIL | „za pobraniem" w copy (safety #6) |
| vitrix | ❌ FAIL | 2 fails na 30+ checks (akceptowalne) |

**Decyzja:** stare landingi są **grandfathered**. Nie naprawiamy ich automatycznie — tylko gdy user wykonuje modyfikację (przez [`migrate.md`](migrate.md) Use case 2). Naprawa wymaga decyzji per landing.

---

## [v2] — przed 2026-04-20

Wersja przejściowa (extracted patterns into separate file, but manifesto still ETAP 2.5 after HTML generation).

## [v1] — początek 2026

Inicjalna wersja (8 plików `CLAUDE_LANDING_*.md` w root `tn-crm/`):
- CLAUDE_LANDING.md (index)
- CLAUDE_LANDING_PROCEDURE.md (monolith ~2900 linii)
- CLAUDE_LANDING_REVIEW.md (ETAP 2 weryfikacja)
- CLAUDE_LANDING_DIRECTION.md (ETAP 2.5 manifesto — PO HTML)
- CLAUDE_LANDING_DESIGN.md (ETAP 3 polish + offer box)
- CLAUDE_LANDING_VERIFY.md (ETAP 4 Playwright)
- CLAUDE_LANDING_MOBILE.md (ETAP 4.5 mobile)
- CLAUDE_LANDING_PATTERNS.md (22 snippets)
