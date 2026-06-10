# ETAP 5 — VERIFY: wizualna weryfikacja Playwright (OBOWIĄZKOWY)

> **Safety rules:** [`reference/safety.md`](reference/safety.md) — wszystkie 10 reguł.

**Kiedy uruchomić:** po ETAP 4 (design polish), PRZED ETAP 6 (mobile) i deployem.

**Cel:** wyłapać bugi, które nie są widoczne w kodzie — ucięte elementy, overlapping, złamane mobile, puste sekcje przez `opacity:0` bez JS-gate'u.

**Dlaczego obowiązkowy:** jedno zdarzenie kosztowało godziny — cała strona renderowała się jako pusta ivory plama, bo `.fade-in { opacity:0 }` nie miało fallbacku ([`reference/safety.md` #2](reference/safety.md)). Code review tego nie wyłapuje.

---

## Krok 1 — `verify-landing.sh` (33 grep checks)

```bash
bash scripts/verify-landing.sh [slug]
```

**Target:** `GATE: PASS` z verify-landing.sh (exit 0 = 0 FAIL i ≤3 WARN). `GATE: WARN-EXCEEDED` (exit 2) = kontynuuj + odnotuj w raporcie. NIE używaj liczbowych progów — liczba checków zmienia się między wersjami, exit code nie.

### Co sprawdza `verify-landing.sh` — 10 grup checks (~33 testy)

Każdy check odpowiada konkretnej regule z [`reference/safety.md`](reference/safety.md) lub wzorcowi z [`reference/patterns.md`](reference/patterns.md).

#### Grupa 1: Obrazy i placeholdery
| Check | Reguła | Test |
|---|---|---|
| Placeholdery/figury (12-20) | safety #4 | count `class="*-figure*-placeholder*bento-image*"` |
| Brak obcych workflow (UUID ≤1) | obce zdjęcia (02-generate.md) | count unique `ai-generated/[uuid]` |

#### Grupa 2: Numeracja sekcji
| Check | Reguła | Test |
|---|---|---|
| Ciągła numeracja Nº (8-12 sekcji) | architektura 14 sekcji | count unique `Nº [0-9]+` |

#### Grupa 3: Header discipline
| Check | Reguła | Test |
|---|---|---|
| Header BEZ backdrop-filter (tło #FFFFFF) | safety #9 | `grep .header backdrop-filter` = 0 |
| Logo bez wordmark obok (warn) | DESIGN sekcja 0.2 | extract `<a class="logo">` content |
| Logo.png istnieje (warn) | hosting assetów | `ls landing-pages/$SLUG/logo.png` |

#### Grupa 4: Fade-in safety
| Check | Reguła | Test |
|---|---|---|
| html.js gate w `<head>` | safety #2 | `grep documentElement.classList.add..js` |
| Safety timeout filtruje po pozycji | safety #2 (krytyczne) | `grep rect.top.*window.innerHeight` |

#### Grupa 5: Image-box discipline
| Check | Reguła | Test |
|---|---|---|
| Zero inline img sizing | DESIGN sekcja G | `grep <img.*style.*(height\|width\|aspect-ratio)` = 0 |
| grid-row:span 2 — brak (warn) | layout discipline | `grep grid-row.*span 2` = 0 |

#### Grupa 6: Meta & fonts
| Check | Reguła | Test |
|---|---|---|
| OG image = pełny URL Supabase | safety #10 | `grep og:image.*yxmavwkwnfuphjqbelws` |
| Fonty BEZ `subset=latin-ext` | safety #10 | `grep subset=latin-ext` = 0 (anty-wzorzec) |
| Meta title ≤ 60 znaków | SEO | length `<title>` |
| Meta description ≤ 160 znaków | SEO | length meta description |

#### Grupa 7: JS effects
| Check | Reguła | Test |
|---|---|---|
| Split headline (`.js-split`) (warn) | DESIGN D.1, patterns #17 | `grep class="*js-split"` |
| Number counters (`.js-counter`) ≥ 2 | patterns #18 | count `class="js-counter"` ≥ 2 |
| Magnetic CTA (`.magnetic`) ≥ 2 | patterns #19 | count `class="*magnetic*"` ≥ 2 |

#### Grupa 8: Copy quality
| Check | Reguła | Test |
|---|---|---|
| Zero korporacyjnych power words | reference/copy.md | `grep -i innowacyjn\|najwyższ\|charakteryzuje się\|implementacj\|kompleksow` = 0 |
| Zero lorem/TODO | safety #4 | `grep -i lorem\|TODO\|placeholder text` = 0 |
| Zero zakazanych obietnic dostawy | safety #6 | `grep -i 24h\|magazyn\|D+1` = 0 |

#### Grupa 9: Offer Box / CTA (DESIGN sekcja H)
| Check | Reguła | Test |
|---|---|---|
| Stara cena przekreślona | DESIGN H.2 | `grep offer-price-old\|line-through` ≥ 1 |
| Savings badge | DESIGN H.2 | `grep offer-price-save\|save-badge` ≥ 1 |
| Savings text („Oszczędzasz N zł") | DESIGN H.2 | `grep -i oszczędzasz` ≥ 1 |
| Rating nad CTA (warn) | DESIGN H.3 | `grep offer-rating\|★★★★★` ≥ 1 |
| Trust strip (3 ikony) | DESIGN H.3 | `grep offer-trust\|trust-strip` ≥ 1 |
| Payment logo BLIK | safety #6, DESIGN H.3 | `grep BLIK` ≥ 1 |
| Zero BNPL (PayPo/Klarna/Twisto/raty) | safety #6 | `grep -i paypo\|klarna\|twisto\|raty` = 0 |
| Zero „za pobraniem" / COD | safety #6 | `grep -i pobranie\|COD` = 0 |
| Guarantee microcopy pod CTA | DESIGN H | `grep offer-guarantee` ≥ 1 |
| Guarantee z konkretem N dni (warn) | reference/copy.md (Risk Reversal) | `grep -i [0-9]+ dni` ≥ 1 |
| Zero fake urgency („tylko dziś" / „zostało X szt.") | reference/copy.md | `grep -i tylko dziś\|zostało.*szt` = 0 |
| Sticky CTA mobile (warn) | DESIGN H.7 | `grep class.*sticky-cta` ≥ 1 |

#### Grupa 10: Brief persistence
| Check | Reguła | Test |
|---|---|---|
| `_brief.md` istnieje (warn) | ETAP 1 enforcement | `ls landing-pages/$SLUG/_brief.md` |

**Pełny kod:** [`scripts/verify-landing.sh`](../../scripts/verify-landing.sh) — 297 linii bash.

---

## Krok 2 — Sprawdź że Playwright jest zainstalowany

```bash
ls /c/repos_tn/tn-crm/node_modules/.bin/playwright 2>/dev/null || \
  (cd /c/repos_tn/tn-crm && npm install -D playwright && npx playwright install chromium)
```

Pierwsze uruchomienie pobiera Chromium (~150 MB, ~1 min).

---

## Krok 2.5 — **chrome-devtools MCP audit (PREFEROWANY, gdy MCP dostępny)** 🔌

> Wprowadzone 2026-05-21 — chrome-devtools MCP daje to czego `verify-landing.sh` grep nie wyłapie: **żywe interakcje, console errors, performance metrics, fade-in opacity stan po load**. Patrz [`mcp-landing-tools`](../../../Users/tomek/.claude/projects/c--repos-tn/memory/mcp-landing-tools.md).

**Kiedy ten krok:** jeśli `mcp__chrome-devtools__*` tools są dostępne w sesji (sprawdź `ToolSearch` z `select:` jeśli niepewny). Jeśli nie — pomiń, idź do Kroku 3 (Playwright bash fallback).

**URL do auditu:** local file `file:///c:/repos_tn/tn-crm/landing-pages/[slug]/index.html` LUB live preview po deploy `https://tn-crm.vercel.app/landing-pages/[slug]/`. Preferuj live URL — wtedy Vercel deploy też weryfikowany.

### 2.5.1 — Console errors gate

```
chrome-devtools.navigate(url=https://tn-crm.vercel.app/landing-pages/[slug]/)
chrome-devtools.wait_for_events(event=load)
chrome-devtools.console_messages(level=error)
```

**Reguła:** ZERO `error`-level messages. Najczęstsze winowajcy:
- Brakujący asset (404 z `attachments/landing/[slug]/`) — sprawdź upload do Supabase Storage
- `Uncaught ReferenceError` w toolkit script (zła konfiguracja `ConversionToolkit.init`)
- CORS na zewnętrzne assety (fontów, opinii AliExpress)
- Mixed content (http:// asset na https:// stronie)

**FAIL → STOP**, napraw zanim deploy.

### 2.5.2 — Performance metrics (LCP/CLS/FCP/INP)

```
chrome-devtools.record_traces(url=..., emulate=mobile)
chrome-devtools.analyze_insights()
chrome-devtools.lighthouse_audits(categories=['performance'], throttling='mobile_3g_fast')
```

**Targets (zgodne z [`reference/pagespeed.md`](reference/pagespeed.md) sekcja 1):**

| Metryka | Target mobile | Target desktop |
|---|---|---|
| **LCP** | < 2.5s | < 1.5s |
| **CLS** | < 0.1 | < 0.05 |
| **FCP** | < 1.8s | < 1.0s |
| **INP** | < 200ms | < 100ms |
| **Performance score** | ≥ 90 | ≥ 95 |

**Diagnoza częstych problemów:**
- LCP > 2.5s → hero image bez `fetchpriority="high"` LUB nie-WebP / nie-/render/image/ URL
- CLS > 0.1 → `<img>` bez `width`/`height` LUB fonty bez `display=swap`
- FCP > 1.8s → blokujące fonty (brak `preconnect`) LUB inline CSS > 50KB

**FAIL → wróć do `pagespeed.md` checklist sekcja 8.**

### 2.5.3 — Smoke test interakcji (krytyczne — grep tego NIE łapie)

Headline: każdy click below jest **autonomicznym testem** — failure jednego nie blokuje pozostałych, ale loguj wszystkie jako WARN/FAIL.

```
# 1. CTA hero scrolluje do #offer
chrome-devtools.click(selector='.hero .btn-primary')
chrome-devtools.wait_for_events(event=scroll_end, timeout=2000)
chrome-devtools.gather_metrics(metrics=['scroll_y'])
# Oczekiwane: scroll_y > 0 i offer-box w viewport
```

```
# 2. Sticky CTA mobile (375×812) klikalny
chrome-devtools.new_page(viewport={width:375, height:812})
chrome-devtools.navigate(url=...)
chrome-devtools.wait_for_events(event=load)
chrome-devtools.click(selector='.sticky-cta, .ct-mobile-bar')
# Oczekiwane: scroll do #offer LUB modal opens
```

```
# 3. Reels lightbox otwiera + zamyka (jeśli landing ma sekcję reels)
chrome-devtools.click(selector='.reels-card:first-child')
chrome-devtools.wait_for_events(event=animation_end, timeout=1500)
chrome-devtools.snapshot(name='reels_lightbox_open')
chrome-devtools.click(selector='.reels-lightbox-close')
chrome-devtools.wait_for_events(event=animation_end, timeout=1500)
chrome-devtools.snapshot(name='reels_lightbox_closed')
# Oczekiwane: snapshot 1 ma .reels-lightbox.open, snapshot 2 NIE
```

```
# 4. FAQ accordion otwiera się
chrome-devtools.click(selector='.faq-item:first-child .faq-question')
chrome-devtools.snapshot(name='faq_open')
# Oczekiwane: .faq-item ma class .active LUB .faq-answer height > 0
```

```
# 5. Mobile menu (hamburger)
chrome-devtools.new_page(viewport={width:375, height:812})
chrome-devtools.navigate(url=...)
chrome-devtools.click(selector='#hamburger, .hamburger')
chrome-devtools.snapshot(name='mobile_menu_open')
# Oczekiwane: #mobileMenu ma class .open / .active
```

### 2.5.4 — Fade-in opacity check (safety #2 — żywy)

`verify-landing.sh` sprawdza ŻE `html.js` gate istnieje. **Chrome-devtools MCP sprawdza CZY działa.** Najgroźniejszy bug w historii landingów: cała strona ivory plama bo `.fade-in{opacity:0}` bez safety timeout.

```
chrome-devtools.navigate(url=...)
chrome-devtools.wait_for_events(event=load)
chrome-devtools.script_evaluation(code=`
  const els = document.querySelectorAll('.fade-in');
  const invisible = Array.from(els).filter(el => {
    const cs = window.getComputedStyle(el);
    return parseFloat(cs.opacity) < 0.1;
  });
  ({
    total: els.length,
    invisible_count: invisible.length,
    invisible_above_fold: invisible.filter(el => el.getBoundingClientRect().top < window.innerHeight).length
  })
`)
```

**Reguła:** `invisible_above_fold` musi być **0**. Każdy fade-in element widoczny w pierwszym viewporcie MUSI być visible po load (po IntersectionObserver + safety timeout 3s). Jeśli > 0 → fade-in bug, wracaj do safety #2.

### 2.5.5 — Screenshoty 3 viewports przez MCP (zamiast bash scriptu)

```
chrome-devtools.new_page(viewport={width:1440, height:900})
chrome-devtools.navigate(url=...)
chrome-devtools.screenshots(full_page=true, save_to='C:/tmp/[slug]_shots/desktop_full.png')

chrome-devtools.new_page(viewport={width:768, height:1024})
chrome-devtools.navigate(url=...)
chrome-devtools.screenshots(full_page=true, save_to='C:/tmp/[slug]_shots/tablet_full.png')

chrome-devtools.new_page(viewport={width:375, height:812})
chrome-devtools.navigate(url=...)
chrome-devtools.screenshots(full_page=true, save_to='C:/tmp/[slug]_shots/mobile_full.png')
```

Po tym pomiń Krok 3 (Playwright screenshoty) — masz już artefakty. Przejdź do Kroku 4 (Read screenshots).

### 2.5.6 — Cleanup

```
chrome-devtools.close_page()  # zamknij wszystkie otwarte taby
```

---

## Krok 3 — Screenshoty 3 viewports (Playwright fallback, gdy MCP niedostępny)

```bash
bash scripts/screenshot-landing.sh [slug]
```

Lub ręcznie przez `_shoot.mjs`:

```bash
mkdir -p /c/tmp/[slug]_shots
cd /c/repos_tn/tn-crm && node _shoot.mjs
```

**Skrypt screenshot zapisuje do `C:/tmp/[slug]_shots/`:**
- `desktop_full.png` (1440x900, fullPage)
- `desktop_hero.png` (1440x900, viewport)
- `desktop_900.png`, `desktop_1800.png`, `desktop_2700.png` (mid-scroll)
- analogicznie dla `tablet` (768x1024) i `mobile` (375x812)

---

## Krok 4 — Obejrzyj screenshoty (Read tool)

**Obowiązkowo:**

- `desktop_hero.png` — czy headline czytelny, CTA widoczne, hero visual nie wychodzi za ramkę
- `desktop_full.png` — czy WSZYSTKIE sekcje renderują się (jeśli widzisz pustą ivory plamę → fade-in bug, safety #2)
- `mobile_hero.png` — czy hero mieści się, CTA full-width, trust elementy widoczne
- `mobile_full.png` — czy sekcje mają sensowny rytm, nie ma „przerw" ani overlapu
- `tablet_full.png` — czy bento się składa poprawnie, czy hero grid się nie psuje

---

## Krok 5 — Checklist wizualny

### Hero
- [ ] Headline czytelny i w całości na 1440 / 768 / 375
- [ ] CTA primary widoczne above-fold (bez scrollowania)
- [ ] Hero visual / placeholder nie wychodzi za viewport
- [ ] Editorial numeral / glow / animacja nie nakłada się na tekst

### Renderowanie sekcji
- [ ] Trust strip pokazuje się w pełni (jedna linia desktop, vertical mobile)
- [ ] Manifesto / Problem — tekst ma hierarchię (nie jest „blob")
- [ ] Features (bento) — karty mają różne rozmiary (nie wszystkie identyczne)
- [ ] Ritual / How it works — 3 kroki wyrównane na desktop, stacked na mobile
- [ ] Spec sheet (jeśli jest) — kontrastowe tło widoczne
- [ ] Comparison — dwie kolumny renderują równo
- [ ] Voices / Testimonials — pull quotes czytelne
- [ ] FAQ — accordion działa (kliknij sam)
- [ ] Offer card — cena widoczna, CTA kontrastowy
- [ ] Final CTA banner — headline + CTA
- [ ] Footer — 4 kolumny / mobile stacked

### Mobile-specific
- [ ] Hero spec stack nie nakłada się na placeholder (safety #3 — dual bank)
- [ ] Cookie banner mieści się (max 50% wysokości viewportu)
- [ ] Hamburger działa (kliknij, zobacz menu)
- [ ] Wszystkie CTA są min. 44px wysokie

### Typography (safety #7)
- [ ] Polskie znaki (ą ę ć ł) renderują się poprawnie
- [ ] UPPERCASE diakrytyki (Ł, Ó, Ś) nie obcięte
- [ ] Italics w `em` są wyraźnie inne niż regular
- [ ] Editorial fonts (Fraunces, Cormorant) ładują się (nie fallback Times)

### JS / Interakcja (safety #2)
- [ ] `html.js` class jest dodana (DevTools → `<html class="js">`)
- [ ] Fade-in faktycznie fade'uje (nie pop) — scroll powoli i patrz
- [ ] Bez JS (wyłącz w DevTools) → strona nadal pokazuje całą treść above-fold

---

## Krok 6 — Napraw znalezione problemy

Wróć do ETAP 2 (kod) lub ETAP 4 (design). Po naprawie ponownie uruchom:

```bash
bash scripts/verify-landing.sh [slug]
bash scripts/screenshot-landing.sh [slug]
```

---

## Krok 7 — Przejdź do ETAP 6 Mobile Polish

VERIFY tylko wyłapuje bugi. **[`06-mobile.md`](06-mobile.md)** systematycznie dopracowuje mobile na 375px:

- Bash grep scan (touch targets, overflow-x, 100vw leaks, images bez width/height)
- Checklist 10 obszarów (A–J)
- Copy-paste mobile-only fixy
- Finalna certyfikacja 5/5 przed deployem

**Przejdź całą procedurę MOBILE.md PRZED auto-deploy.**

---

## Sprzątanie po sesji

```bash
rm /c/repos_tn/tn-crm/_shoot.mjs /c/repos_tn/tn-crm/_debug*.mjs 2>/dev/null
```

Nie commituj skryptów screenshot do repo — są utility.

---

## Najczęstsze bugi wyłapane przez tę weryfikację

| Bug | Symptom w screencie | Fix | Reguła |
|-----|---------------------|-----|--------|
| `.fade-in { opacity:0 }` bez JS gate | Desktop/mobile full page = pusta ivory plama | Dodaj `html.js` gate | safety #2 |
| Hero spec badges absolute | Mobile: nakłada się na placeholder text | Duplikuj jako static pod figurą (dual bank) | safety #3 |
| Cookie banner za wysoki | Mobile: zakrywa CTA w hero | `padding:12px 14px` na mobile | DESIGN sekcja H.7 |
| Mobile menu nie chowa się | Pierwsze otwarcie widać menu | `transform:translateY(-100%)` + `.open { translateY(0) }` | — |
| Overflow horizontal | Pasek scrolla poziomy | `body { overflow-x: hidden }` + sprawdź elementy z `width > 100%` | MOBILE obszar H |
| Hero headline ucięte | „Niena..." zamiast „Nienagannie" | `font-size: clamp(Xpx, Yvw, Zpx)` — mniejszy min | MOBILE obszar B |
| **Trust strip rozjeżdża się** | Mobile: każdy element w nowej linii | `.trust-item { white-space:nowrap }` + na ≤900px `flex-direction:column` | patterns #15 |
| **„Ł" w UPPERCASE wychodzi nad belkę** | Italiana renderuje L jak apostrof | Wymień Italiana → Cormorant Garamond | safety #7 |
| **Header rgba+backdrop nieczytelny mobile** | Słaby kontrast nad treścią | `background: #FFFFFF` solid | safety #9 |

---

## Failure modes (AUTO-RUN mode)

| Warunek | Akcja | Max retry | Fallback |
|---------|-------|-----------|----------|
| chrome-devtools MCP niedostępny | Pomiń Krok 2.5, użyj Playwright bash (Krok 3) | — | kontynuuj normalnie |
| **chrome-devtools console errors > 0** | Zdiagnozuj per typ (404, ReferenceError, CORS), napraw, re-test | 3 | **STOP + raport, NIE deploy** |
| **chrome-devtools LCP > 4s mobile** | Sprawdź hero image (`fetchpriority`, format WebP, `/render/image/`), `preconnect` fontów | 2 | Kontynuuj jako WARN, deploy ale poinformuj usera |
| **chrome-devtools `invisible_above_fold` > 0 (fade-in bug)** | Napraw per safety #2 — `html.js` gate + safety timeout filtrujący `rect.top` | 2 | **STOP + raport, NIE deploy (krytyczne — ivory plama)** |
| chrome-devtools click smoke test fail (CTA / reels / FAQ) | Sprawdź event handler w JS, re-test | 2 | Kontynuuj jako WARN, raport |
| Playwright nie działa | `npm install -D playwright && npx playwright install chromium` | 1 | STOP — wymaga manual install |
| Screenshot pokazuje pustą stronę (ivory plama) | fade-in bug — napraw per safety #2 | 2 | STOP + raport |
| Screenshot bug nieznany | Ręczny fix ostatniego diffa, re-shoot | 2 | STOP + pokaż screenshot userowi |
| `verify-landing.sh` `GATE: FAIL` (exit 1) | Fix per-check, re-run | 3 | **STOP + raport, NIE deploy (safety violation)** |
| Trust strip rozjeżdża się na mobile | Apply patterns #15 fix | 2 | kontynuuj do ETAP 6 |

---

## Po ETAP 5 — przejdź do ETAP 5.5 (Visual Review, v4.1)

Screenshoty zrobione, ale code review nie ocenia jakości wizualnej. **OBOWIĄZKOWY ETAP 5.5:**

```bash
# 1. Wygeneruj prompt-template
bash scripts/review-landing-visual.sh $SLUG
```

Wypisuje listę screenshotów + 8 kryteriów oceny (hierarchia, signature element, kontrast, spacing, CTA visibility, polskie diakrytyki, AI images vs placeholdery, spójność ze stylem).

```
2. Read tool'em obejrzyj wszystkie screenshoty z _shots/:
   - desktop_full.png + tablet_full.png + mobile_full.png (overview)
   - desktop_y900.png (hero+nav), desktop_y2000.png (bento), desktop_y7000.png (offer)
   - mobile_y900.png + mobile_y5000.png

3. Zapisz raport do landing-pages/$SLUG/_visual-review.md w formacie:
   - 3 sekcje: Desktop / Tablet / Mobile
   - Min 3-4 verdykty per sekcja: ✅ PASS / ⚠️ WARN / ❌ FAIL z konkretną obserwacją
   - Verdict: GO (lub NO-GO jeśli ≥1 FAIL)

4. bash scripts/review-landing-visual.sh $SLUG --check
   # exit 0 = OK do dalej; exit 1 = blokuje deploy
```

**Po PASS** → [`06-mobile.md`](06-mobile.md) (jeśli visual review wskazał mobile issues — inaczej skip do PRE-COMMIT).

**Dlaczego osobny etap:** `verify-landing.sh` to grep — łapie safety violations, długości, klasy CSS. Nie ocenia czy hero wygląda atrakcyjnie, czy bento ma rytm, czy CTA wygląda klikalnie. Visual review (Claude jako reviewer) to zamyka.
