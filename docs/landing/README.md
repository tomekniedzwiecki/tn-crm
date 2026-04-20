# Landing Page Procedure — TN CRM (v3)

> Ostatnia aktualizacja: 2026-04-20 (v3 — patrz [CHANGELOG.md](CHANGELOG.md))

## TL;DR

Generowanie landing page w **6 etapach**. **Manifesto PRZED HTML** (nie po). Po ETAP 6 — **FULL auto deploy** na Vercel (landingi to preview dla klienta, nie produkcja).

## 🎯 Trigger frazy (AUTO-RUN)

- „Przygotuj landing dla projektu [UUID]"
- „Zrób landing dla [UUID]" / „Zrób landing dla workflow [nazwa]"
- „Wygeneruj stronę sprzedażową [UUID]"

Gdy słyszysz którąkolwiek frazę → wykonuj wszystkie 6 etapów autonomicznie.

---

## Mapa plików (13)

### Flow etapów (7)

| # | Plik | Rola |
|---|------|------|
| 1 | [`01-direction.md`](01-direction.md) | **DIRECTION** — audyt + manifesto + baseline + verify-brief |
| 2 | [`02-generate.md`](02-generate.md) | **GENERATE** — HTML zgodny z briefem (po valid briefie) |
| 3 | [`03-review.md`](03-review.md) | **REVIEW** — weryfikacja treści (~63 grep checks) |
| 3.5 | [`03-5-copy-review.md`](03-5-copy-review.md) | **COPY REVIEW** — Manus rewrite purple prose → direct response |
| 4 | [`04-design.md`](04-design.md) | **DESIGN** — polish + offer box (sekcja H) |
| 5 | [`05-verify.md`](05-verify.md) | **VERIFY** — Playwright screenshoty 3 viewporty |
| 6 | [`06-mobile.md`](06-mobile.md) | **MOBILE** — polish pass na 375px |

### Reference (cross-cutting)

| Plik | Rola |
|------|------|
| [`reference/safety.md`](reference/safety.md) | 10 zasad bezwarunkowych (single source of truth) |
| [`reference/copy.md`](reference/copy.md) | Senior Copywriter Playbook + Conversion Boosters |
| [`reference/pagespeed.md`](reference/pagespeed.md) | Optymalizacja wydajności (90+ mobile) |
| [`reference/patterns.md`](reference/patterns.md) | 22 signature snippetów (kopiuj-wklej) |

### Specjalne przypadki

| Plik | Kiedy |
|------|-------|
| [`migrate.md`](migrate.md) | Modyfikacja starego landinga LUB migracja briefa retrospektywnie |
| [`CHANGELOG.md`](CHANGELOG.md) | Historia zmian procedury (v1→v3) |

### Skrypty pomocnicze

| Skrypt | Cel |
|--------|-----|
| `scripts/verify-brief.sh [slug]` | Walidacja `_brief.md` przed ETAP 2 (BLOKUJE jeśli niekompletny) |
| `scripts/verify-landing.sh [slug]` | ~63 grep checks na index.html (target: ≥60 PASS) |
| `scripts/verify-all-landings.sh` | Regression check na 6 baseline'ach |
| `scripts/screenshot-landing.sh [slug]` | Playwright screenshoty 3 viewporty |
| `scripts/landing-autorun.sh [UUID]` | Entry-point AUTO-RUN mode |
| `scripts/generate-landing-images.sh [UUID] [SLUG]` | Background AI image generation |
| `scripts/extract-copy.mjs [slug] [outFile]` | ETAP 3.5 — wyciąga copy z index.html do JSON (Playwright) |
| `scripts/review-copy-manus.sh [slug]` | ETAP 3.5 — Manus copy rewrite (submit + poll 15 min) |
| `scripts/apply-copy.mjs [slug]` | ETAP 3.5 — aplikuje rewritten JSON do index.html |

---

## Flow (visual)

```
[USER] „Zrób landing dla workflow [UUID]"
  ↓
[scripts/landing-autorun.sh UUID]   ← walidacja + folder + AI bg + prompt
  ↓
ETAP 0 (walidacja Supabase)         — autonomous
  ↓
ETAP 1 — DIRECTION (manifesto)      — autonomous
  ↓
  [verify-brief.sh BLOKUJE jeśli niekompletny, max 3 retry]
  ↓
ETAP 2 — GENERATE (HTML)            — autonomous
  ↓
ETAP 3 — REVIEW (treść, 63 grep)    — autonomous
  ↓
ETAP 3.5 — COPY REVIEW (Manus)      — autonomous (~5-15 min)
  [bash scripts/review-copy-manus.sh + node scripts/apply-copy.mjs]
  ↓
ETAP 4 — DESIGN (polish + offer)    — autonomous
  ↓
ETAP 5 — VERIFY (Playwright)        — autonomous
  ↓
ETAP 6 — MOBILE (polish 375px)      — autonomous
  ↓
═══ PRE-DEPLOY VALIDATION (auto, bez human gate) ══
- verify-landing.sh ≥15/18 PASS
- verify-all-landings.sh regression OK
- Zdjęcia AI ≥5/11 lub placeholder-briefy
═══════════════════════════════════════════════════
  ↓ (jeśli 3/3 OK)
[AUTO] git add + commit + push → Vercel deploy
  ↓
[Claude] raport + link: https://tn-crm.vercel.app/landing-pages/[slug]/
```

**Total czas:** ~25-30 min od promptu do live URL.
**Interakcje z userem:** 0 (chyba że trafimy w jedną z 3 STOP conditions).

---

## AUTO-RUN protocol (FULL autonomous)

### STOP conditions (tylko te 3 zatrzymują auto-deploy)

1. **`verify-landing.sh` <15/18 PASS** — safety violation, landing nie spełnia minimum jakości
2. **`verify-all-landings.sh` zepsuł inny landing** — regression w istniejącym preview
3. **Brak zdjęć AI **i** brak placeholder-briefów** — landing wyglądałby jak szkielet

We wszystkich innych przypadkach (AI timeout, częściowe fail, nietypowy kierunek) — Claude kontynuuje, deployuje, raportuje niedociągnięcia w finalnym outputcie.

### Rationale (z [`feedback-landing-auto-deploy.md`](../../../Users/tomek/.claude/projects/c--repos-tn/memory/feedback-landing-auto-deploy.md))

Landingi to **preview dla klienta** (demo sprzedażowe), nie produkcja. Pre-commit checkpoint przedłużałby każdą iterację — jeśli coś nie gra, user widzi to na live URL i prosi o zmianę. Koszt pomyłki = 5 sekund wpisania „zmień X", nie incident produkcyjny.

**Scope auto-deploy:** TYLKO `tn-crm/landing-pages/*` i `tn-crm/docs/landing/*`. Wszystko inne (supabase/functions, tn-workflow, client-projekt.html) — zawsze human-in-loop.

---

## Finalny checklist przed deployem

### Zasady bezwarunkowe (10 reguł — patrz [`reference/safety.md`](reference/safety.md))
- [ ] Header `#FFFFFF` solid (nie rgba+backdrop) — safety #9
- [ ] Fade-in z `html.js` gate + safety timeout filtrujący `getBoundingClientRect()` — safety #2
- [ ] Polskie diakrytyki UPPERCASE: `line-height ≥ 1.4` — safety #7
- [ ] Fonty z `&subset=latin-ext` (Fredoka NIE Fredoka One) — safety #10
- [ ] OG image + logo: pełny URL Supabase (nie względny) — safety #10
- [ ] Placeholdery 4-polowe (mark/title/size/note) — safety #4
- [ ] Element absolute w karcie ma dual bank desktop/mobile — safety #3
- [ ] Zero zakazanych fraz (24h, magazyn PL, COD, raty, PayPo, Klarna, Twisto) — safety #6

### Kompletność
- [ ] `_brief.md` istnieje i jest valid (`verify-brief.sh` exit 0)
- [ ] 14 sekcji obecnych (header → footer)
- [ ] 10-14 placeholderów z briefem fotografa LUB AI images podstawione
- [ ] Logo z workflow (przycięte sharp().trim, pełny URL Supabase)
- [ ] Conversion Toolkit zintegrowany
- [ ] PageSpeed checklist (preconnect, fetchpriority, lazy loading)

### Verification
- [ ] `verify-landing.sh` ≥15/18 PASS
- [ ] Playwright screenshoty 3 viewports (desktop/tablet/mobile)
- [ ] Mobile 5/5 certyfikacja (06-mobile.md)
- [ ] `verify-all-landings.sh` — regression OK (lub akceptowalne known issues)

---

## Troubleshooting

| Problem | Rozwiązanie | Źródło |
|---------|-------------|--------|
| Cała strona to pusta plama (ivory) | Fade-in bug — dodaj `html.js` gate | [`reference/safety.md` #2](reference/safety.md) |
| Hero spec rozjeżdża się na mobile | Dual bank desktop absolute + mobile static | [`reference/safety.md` #3](reference/safety.md) |
| „Ł" w UPPERCASE wychodzi nad belkę | Wymień Italiana → Cormorant Garamond | [`reference/safety.md` #7](reference/safety.md) |
| Header nieczytelny mobile | `background: #FFFFFF` solid, NIE rgba+backdrop | [`reference/safety.md` #9](reference/safety.md) |
| Polskie znaki w fontach renderują się jako ? | Dodaj `&subset=latin-ext` do Google Fonts URL | [`reference/safety.md` #10](reference/safety.md) |
| Trust strip rozjeżdża się na mobile | `flex-direction: column` na ≤900px + `white-space: nowrap` | [`reference/patterns.md` #15](reference/patterns.md) |
| `verify-brief.sh` exit 1 | Uzupełnij brakujące sekcje w `_brief.md` | [`01-direction.md` Krok 9](01-direction.md) |
| Manifesto „za ogólne" / pasuje do 5 produktów | Wróć do Kroku 1 (audyt produktu) | [`01-direction.md` Krok 4.1](01-direction.md) |

---

## FAQ

### Q: Dlaczego manifesto PRZED HTML?

Przed wersją v3 (2026-04) manifesto było ETAP 2.5 — uruchamiany PO wygenerowaniu HTML. Efekt: Claude wybierał baseline z tabeli 6 presetów bez audytu produktu, dryfował między Editorial↔Panoramic Calm bez danych workflow. Manifesto było „poprawkowaczem po fakcie".

W v3: manifesto = ETAP 1, baseline jest skutkiem audytu (nie zgadywanką). `verify-brief.sh` blokuje ETAP 2 jeśli brief niekompletny. Patrz [CHANGELOG.md](CHANGELOG.md).

### Q: Czy mogę pominąć ETAP 5/6 (visual verify)?

Nie. To dwa najważniejsze etapy:
- **ETAP 5** wykrywa fade-in bug (80% strony niewidoczne) — code review tego nie wyłapuje
- **ETAP 6** dopracowuje mobile na 375px (60-70% ruchu)

W AUTO-RUN mode wykonują się autonomicznie (Playwright + bash scan).

### Q: Co jeśli `verify-all-landings.sh` zepsuło inny landing?

To znaczy że nowa zmiana (np. w safety rule lub w shared CSS) złamała istniejący preview. **STOP, NIE deploy**. Decyzja: albo cofnij zmianę safety, albo napraw stary landing osobno.

### Q: Jak modyfikować istniejący landing?

→ [`migrate.md`](migrate.md) Use case 2 (Modyfikacja). Krok 1: przeczytaj `_brief.md` (jeśli brak — najpierw migracja Use case 1).

### Q: Czy landingi działają jako preview czy produkcja?

**Preview dla klienta** (demo sprzedażowe). Nie produkcja, brak SEO, brak konwersji. Dlatego AUTO-RUN deployuje od razu bez checkpointu — patrz [`feedback-landing-auto-deploy.md`](../../../Users/tomek/.claude/projects/c--repos-tn/memory/feedback-landing-auto-deploy.md).

---

## Cross-references

- **Branding** (kolory, fonty, logo z workflow) → `tn-crm/CLAUDE_BRANDING_PROCEDURE.md`
- **AI images** (generate-image edge function) → `tn-crm/CLAUDE_AI_IMAGES_PROCEDURE.md`
- **Memory landingowe** → `C:/Users/tomek/.claude/projects/c--repos-tn/memory/feedback-landing-*.md`
