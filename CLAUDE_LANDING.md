# Landing Pages — Index & Cheatsheet

**Wersja:** 2026-04 · **Master entry-point:** [`CLAUDE_LANDING_PROCEDURE.md`](CLAUDE_LANDING_PROCEDURE.md)

---

## TL;DR — jak zrobić landing w 30 min

```
User → "Przygotuj landing dla projektu [UUID]"
Claude → otwiera CLAUDE_LANDING_PROCEDURE.md → autonomicznie wykonuje 5 etapów
Output → https://tn-crm.vercel.app/landing-pages/[slug]/ + commit
```

**Zero pytań do użytkownika.** Wszystkie decyzje (kierunek estetyczny, persony, fotostyle, copy, layout) — z danych Supabase + manifesta.

---

## Mapa plików procedur

| Plik | Rola | Kiedy używać |
|------|------|--------------|
| **[CLAUDE_LANDING_PROCEDURE.md](CLAUDE_LANDING_PROCEDURE.md)** | 🎯 **MASTER + ETAP 1** | Entry-point. Zawiera trigger + flow całości + generowanie HTML |
| [CLAUDE_LANDING_REVIEW.md](CLAUDE_LANDING_REVIEW.md) | ETAP 2 — Weryfikacja treści | Kompletność sekcji, Hero deep dive, copy review |
| [CLAUDE_LANDING_DIRECTION.md](CLAUDE_LANDING_DIRECTION.md) | ETAP 2.5 — Manifesto | Autonomiczny wybór kierunku estetycznego, 4-kroki |
| [CLAUDE_LANDING_DESIGN.md](CLAUDE_LANDING_DESIGN.md) | ETAP 3 — Design polish | Implementacja manifesta w CSS/HTML + JS effects |
| [CLAUDE_LANDING_VERIFY.md](CLAUDE_LANDING_VERIFY.md) | ETAP 4 — Playwright | Visual verification przed deployem |
| [CLAUDE_LANDING_PATTERNS.md](CLAUDE_LANDING_PATTERNS.md) | 📚 Biblioteka snippetów | Copy-paste signature elements, JS effects, layout discipline (21 wzorców) |
| [CLAUDE_AI_IMAGES_PROCEDURE.md](CLAUDE_AI_IMAGES_PROCEDURE.md) | 🖼️ Obrazy AI | Wywoływana wewnątrz ETAP 3 gdy trzeba wygenerować grafikę |

---

## Flow (wizualnie)

```
┌─────────────────────────────────────────────────────────────────┐
│  User: "Przygotuj landing dla projektu [UUID]"                   │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│  ETAP 0 — Walidacja                                              │
│  - .env z SUPABASE_SERVICE_KEY ✓                                 │
│  - workflow_branding type=brand_info ✓                           │
│  - workflow_reports type=report_pdf ✓                            │
│  - jeśli brak → STOP, wróć do brandingu                          │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│  ETAP 1 — Generowanie HTML (CLAUDE_LANDING_PROCEDURE.md)         │
│  - Pobierz branding, produkty, raport z Supabase                 │
│  - Pobierz logo (is_main: true), przytnij sharp().trim()         │
│  - Upload logo do attachments/landing/[slug]/logo.png            │
│  - Wygeneruj szkielet index.html z placeholdery brief            │
│  - Zapisz landing-pages/[slug]/index.html                        │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│  ETAP 2 — Weryfikacja treści (CLAUDE_LANDING_REVIEW.md)          │
│  - Automatyczne grep checks (15 kontroli sekcja 0)               │
│  - Hero deep dive (5-second test)                                │
│  - Copy review per sekcja                                        │
│  - Spójność z raportem PDF                                       │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│  ETAP 2.5 — Manifesto (CLAUDE_LANDING_DIRECTION.md)              │
│  - Audyt produktu (kategoria emocjonalna, persona, price)        │
│  - 3 realne marki referencyjne (spoza landing-pages/)            │
│  - Design Manifesto (5 linijek: kierunek, tempo, typografia…)    │
│  - Walidacja anty-generic (3 testy)                              │
│  - Zapisz: landing-pages/[slug]/_brief.md (persystentne!)        │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│  ETAP 3 — Design polish (CLAUDE_LANDING_DESIGN.md)               │
│  - Zasady bezwarunkowe (header #FFFFFF, logo bez wordmark)       │
│  - Implementacja manifesta: paleta, typografia, rytm sekcji      │
│  - Min. 4 JS effects (split headline, counter, magnetic, tilt)   │
│  - Wywołanie CLAUDE_AI_IMAGES_PROCEDURE.md dla obrazów           │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│  ETAP 4 — Visual verify (CLAUDE_LANDING_VERIFY.md)               │
│  - Playwright 3 viewports (1440/768/375)                         │
│  - Checklist wizualny (fade-in, hover, mobile, polskie znaki)    │
│  - Fix znalezionych problemów → re-run                           │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│  COMMIT + PUSH + LINK                                            │
│  git add landing-pages/[slug]/ && git commit && git push         │
│  → https://tn-crm.vercel.app/landing-pages/[slug]/               │
└─────────────────────────────────────────────────────────────────┘
```

---

## FINALNY CHECKLIST — landing gotowy do deployu?

### 🔴 Zasady bezwarunkowe (jeśli którykolwiek FAIL → nie deployuj)

- [ ] Header ma tło **czysto `#FFFFFF`** (nie rgba/backdrop-filter, nie paper)
- [ ] Logo w headerze to **tylko `<img>`** (bez wordmark obok jeśli logo zawiera nazwę)
- [ ] `<script>document.documentElement.classList.add('js')</script>` w `<head>`
- [ ] Fade-in gated: `html.js .fade-in{opacity:0}` (nie goły `.fade-in{opacity:0}`)
- [ ] Safety timeout filtruje `getBoundingClientRect().top < window.innerHeight` (nie bezwarunkowy)
- [ ] Fonty mają `&subset=latin-ext` (polskie znaki)
- [ ] OG image = **pełny URL Supabase** (nie `/landing-pages/...`)
- [ ] Logo = pełny URL Supabase Storage
- [ ] Wszystkie `<img>` z `width` + `height` (CLS)
- [ ] Zero inline `style="height/width/aspect-ratio"` na `<img>`

### 🟡 Kompletność treści (ETAP 2)

- [ ] 12–20 miejsc na obrazy (placeholdery brief 4-polowe lub img)
- [ ] Numeracja sekcji ciągła (np. Nº 01–10)
- [ ] Hero headline ≤ 10 słów, lede ≤ 25 słów
- [ ] 3 persony z imieniem + wiek + sytuacja (z raportu PDF)
- [ ] FAQ ≥ 5 pytań (gwarancja/zwroty obowiązkowe)
- [ ] Offer box: cena + przekreślona + savings + 6-elementowa lista + guarantee
- [ ] Zero „lorem", „TODO", power words
- [ ] Zero UUID-ów obcych workflow w obrazach
- [ ] Zero zakazanych obietnic dostawy (24h, magazyn PL)

### 🟢 Design (ETAP 3)

- [ ] Manifesto zapisany w `landing-pages/[slug]/_brief.md`
- [ ] Kierunek estetyczny ma nazwę WŁASNĄ (nie z 5 presetów)
- [ ] Paleta 60/30/10 zgadza się z `workflow_branding` type=color
- [ ] Typografia: display + body + accent + (opcj.) editorial serif
- [ ] Minimum 2 ciemne sekcje (rytm jasno/ciemno)
- [ ] Signature element powtórzony min. 2× (numeral w hero + finale)
- [ ] **Minimum 4 JS effects** z palety (split headline, counter, magnetic, tilt, parallax)
- [ ] Hover states NIE tylko zmiana koloru (lift + shadow + image scale)
- [ ] Wszystkie animacje respektują `prefers-reduced-motion`

### 🔵 Obrazy (CLAUDE_AI_IMAGES_PROCEDURE.md)

- [ ] Minimum 12 obrazów (hero + bento + rytuał + spec + personas + offer)
- [ ] Wszystkie w jednym photo system (lighting, kadrowanie, grain)
- [ ] Prompt zawiera realism injector (35mm film, Kodak Portra 400, imperfect framing)
- [ ] Shape constraint dla produktu ("MATCH REFERENCE EXACTLY")
- [ ] Persona portraits 4:5, packshot 1:1, lifestyle 4:3
- [ ] Zero tekstu/watermarków w kadrze

### ⚪ Verify (ETAP 4)

- [ ] Playwright screenshot 1440, 768, 375 — wszystkie sekcje renderują
- [ ] Hero above-the-fold widoczne bez scrollowania (desktop + mobile)
- [ ] Mobile menu hamburger działa
- [ ] FAQ accordion click działa
- [ ] Polskie znaki renderują się poprawnie (ą, ę, ć, ł, ń, ó, ś, ż, ź)
- [ ] Bez JS (DevTools disable) → strona nadal pokazuje całą treść

### Deploy

- [ ] Git commit z opisem (co zrobione, jaki kierunek)
- [ ] Git push
- [ ] Vercel deploy zakończony (sprawdź status w 30s)
- [ ] Link do live wersji podany użytkownikowi
- [ ] Manifesto + photo system w repo (`_brief.md` commitowane razem z landingiem)

---

## Najczęstsze błędy i jak unikać

| Błąd | Symptom | Fix |
|------|---------|-----|
| Fade-in bezwarunkowy safety timeout | Cała strona odkrywa się po 2.5s, scroll nic nie robi | Patrz PROCEDURE.md lekcja #1 — filtrować po `getBoundingClientRect` |
| Header nie-biały | Krzywo na ciemnych sekcjach | DESIGN.md sekcja 0 — `background: #FFFFFF` zawsze |
| Brand mockupy jako referencja produktu | Gemini generuje powerbanki z logo | IMAGES Krok 1.2 — hierarchia: products.image_url > ai-generated > infographic |
| Shape drift produktu | Gemini robi owalny robot zamiast prostokątnego | IMAGES 5.1.1 — „MATCH THE PRODUCT EXACTLY" prefix |
| Inline JSON payload (heredoc + jq) | `Unexpected end of JSON input` | IMAGES 6.3 — zapisz payload do pliku, curl `--data-binary @file` |
| Puste komórki grid bento | tile-hero `grid-row:span 2` + 3 zwykłe → 2 dziury | DESIGN.md Layout discipline — policz tiles × span = komórki |
| Stock-photo AI perfekcja | Obrazy za ładne, wyglądają AI | IMAGES 5.2 — realism injector suffix (35mm film, lived-in, candid) |

---

## Useful commands

```bash
# Uruchom całą procedurę dla nowego landingu (trigger dla Claude'a)
# User prompt:
#   "Przygotuj landing dla projektu [UUID] i korzystaj z wytycznych CLAUDE_LANDING_PROCEDURE.md"

# Verify existing landing (one-command)
npm run verify:landing [slug]

# Quick preview bez deploya
python3 -m http.server 8000 --directory landing-pages/[slug]/
# → http://localhost:8000/

# Quick grep sanity check (15 automated checks z REVIEW.md sekcja 0)
FILE="landing-pages/[slug]/index.html" && bash scripts/landing-grep-sanity.sh $FILE
```

---

## Wzorcowe landingi (reference)

| Landing | Kierunek | Use case |
|---------|----------|----------|
| `landing-pages/paromia/` | Editorial/Luxury | Premium AGD, lifestyle |
| `landing-pages/vitrix/` | Panoramic Calm (own) | Architectural premium, AGD smart home |
| `landing-pages/h2vital/` | Organic/Natural | Wellness, health |
| `landing-pages/pupilnik/` | Playful/Toy-like | Pet care, children |
| `landing-pages/vibestrike/` | Retro-Futuristic | Gaming, tech |

---

## Zasady projektowe (one-liner reminders)

- **Hero headline** to 80% decyzji czy user zostanie. Poświęć mu 15 min.
- **Manifesto przed kodem** — nigdy nie zaczynaj CSS bez zapisania _brief.md.
- **3 realne marki referencyjne** zawsze spoza `landing-pages/` (zamknięta pętla = szablon).
- **Film, nie cyfra** — każdy prompt obrazu ma „35mm film, Kodak Portra 400".
- **Shape constraint** zawsze dla produktu — Gemini „wie lepiej" i drift'uje.
- **Header biały zawsze** — bezwarunkowa zasada.
- **Min. 4 JS effects** — bez nich landing wygląda jak PDF.
- **Safety filtruje po pozycji** — nie bezwarunkowy timeout.

---

**Kiedy coś się rozjeżdża** → sprawdź MEMORY.md (ostrzeżenia krytyczne) + CLAUDE.md (ogólne reguły projektu).
