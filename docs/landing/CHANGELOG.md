# Changelog — Landing Page Procedure

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
