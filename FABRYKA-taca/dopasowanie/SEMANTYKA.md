# SEMANTYKA — PASS 5 (finalny pass a11y/semantyki) · Rozmrozik · 23.07 (F8 finisz)

Przegląd `index.html` pod kątem hierarchii nagłówków, alt-ów, aria/label kontrolek (TOR-I ×2 +
akordeon), landmarków, `lang`, focus-visible, touch-targets. **Braki naprawione w kodzie** —
werdykty niżej (finisz F8; publish po naprawie).

## Werdykty
| Obszar | Werdykt | Ustalenie / naprawa |
|---|---|---|
| `lang` dokumentu | **PASS** | `<html lang="pl">` — obecny, poprawny. |
| Hierarchia nagłówków | **PASS** | Dokument = **1× `<h1>`** (hero, `class="display hr-title"`). Rozmrozik NIE rotuje hooków (brak problemu 3×h1 z Rozgrzewka). Każda sekcja niżej ma `<h2>` (jeden na sekcję), bez przeskoków poziomów. |
| Alt-y obrazów | **PASS** | Wszystkie `<img>` mają opisowy `alt` (produkt/scena/kontekst), bez keyword-stuffingu. SVG dekoracyjne: `aria-hidden="true"`. Kadry UGC (ugc-1..3) z alt opisującym wariant czarny. |
| TOR-I #1 (jak-działa — stepper) | **PASS** | `role="tablist"` + `aria-label`; kroki `role="tab"`, `aria-selected`, `aria-controls`, roving `tabindex`; panel `role="tabpanel"` `aria-labelledby`. Stan „uruchomione" z `role="status"`. |
| TOR-I #2 (pojemność — steki/ryba) | **PASS** | `role="tablist"` `aria-label="Wybierz zawartość komory"`; taby `role="tab"` + `aria-controls`; panele `role="tabpanel"`. Crossfade steak↔fish (MOTION-DNA). |
| Akordeon FAQ | **PASS** | Natywne `<details>/<summary>` ×9 — dostępne z definicji (klawiatura + stan `open` = implicit expanded); zero custom-aria do utrzymania. Ikona `+/−` = `<span aria-hidden>`. |
| Karuzela wideo | **PASS** | Kafle `role="button"` `tabindex="0"` + `aria-label="Odtwórz wideo — <autor>"`; kropki nawigacji `aria-label`/`aria-current`. Autor marketplace zneutralizowany (patrz niżej). |
| Podsumowanie kasy (rozwijane) | **PASS** | `zc-sum-bar` z `aria-expanded` (sync JS) + `aria-controls`. Logika checkoutu NIETYKANA (TPAY/zc-*). |
| Landmarki | **PASS (po naprawie)** | `<header class="topbar">` ✓, `<footer id="footer">` ✓. Było **brak `<main>`**. NAPRAWA: dodany `<main id="main">` obejmujący wszystkie sekcje treści (hero…final); footer i sticky-buy poza `<main>`. |
| Focus-visible | **PASS** | Linki i kontrolki mają `:focus-visible { outline … }` (16 wystąpień); brak globalnego `outline:none` bez zamiennika. |
| Touch-targety (mobile) | **PASS (po naprawie)** | Dwa linki tekstowe miały wys. <44 px: `.jd-link` („Zobacz, ile mieści →", 26 px) i link „Przejdź do zamówienia →" w sekcji wideo (20 px). NAPRAWA: `display:inline-flex; align-items:center; min-height:44px` — obszar dotyku ≥44 px, typografia (font-size/underline) bez zmian. |
| Kontrast CTA | **PASS (po naprawie)** | Hero CTA „Zamawiam Rozmrozik" (biały na `#E8590C`) miał 3.58:1 przy 17 px → poniżej AA. NAPRAWA: `.btn/.btn.cta` font-size 17→19 px (fw 700) → tekst „large" (≥18.66 px bold) → próg AA 3:1 spełniony. Kolor marki `#E8590C` NIETKNIĘTY. |

## Zmiany w kodzie (finisz F8, publish po naprawie)
1. `<main id="main">` … `</main>` — wrapper landmarku treści (po `</header>`, przed `<footer>`; sticky-buy poza main).
2. `min-height:44px` + `inline-flex` na `.jd-link` oraz na linku „Przejdź do zamówienia →" (touch ≥44 px).
3. `.btn/.btn.cta` font-size 17→19 px (kontrast AA-large dla białego tekstu na akcencie).
4. `object-position: 50% 42%` na obrazach dyptyku hero (`.hr-frame img`) i sceny final (`.fn-final__media img`) — sterowany kadr (crop-lint P1→P2, produkt w kadrze).
5. Autor wideo `@aliexpress.us` → „Klient TikTok" (usunięcie nazwy marketplace — STANDARD; aria-label + data-author + etykieta).

## Bez zmian (świadomie)
- Kolejność/treść sekcji, copy, layout — nietknięte (finisz dotyka tylko a11y/wag/gate).
- Logika checkoutu (`zc-checkout`, `data-zc-*`, TPAY, submit) — **NIETYKANA** (strefa główna sesja).
  Link-fallback `.zc-fallback` (kontrast 1:1, `hidden`) należy do modułu checkout — nie ruszany.
- hero-video (`hero-loop-pp.mp4`) i JSON-LD (offers już usunięte przez główną sesję) — NIETKNIĘTE.
