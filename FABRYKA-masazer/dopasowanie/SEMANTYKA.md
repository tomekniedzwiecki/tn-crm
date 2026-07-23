# SEMANTYKA — PASS 5 (finalny pass a11y/semantyki) · Rozgrzewek · 23.07

Przegląd `index.html` pod kątem hierarchii nagłówków, alt-ów, aria/label kontrolek (TOR-I + akordeon),
landmarków, `lang`, focus-visible, touch-targets. **Braki naprawione w kodzie** — werdykty niżej.

## Werdykty
| Obszar | Werdykt | Ustalenie / naprawa |
|---|---|---|
| `lang` dokumentu | **PASS** | `<html lang="pl">` — obecny, poprawny. |
| Hierarchia nagłówków | **PASS (po naprawie)** | Było **3× `<h1>`** (rotujące hooki hero A/B/C). NAPRAWA: hook-1 zostaje jedynym `<h1>`; hook-2 i hook-3 → `<p class="display hr-title">` (identyczna klasa/styl, rotacja sterowana `data-hook`+CSS klas `.hr-hook-N`, nie tagiem — animacja F5 nietknięta). Dokument = **1× h1**; sekcje niżej mają `<h2>` (jeden na sekcję), kolejność bez przeskoków poziomów. |
| Alt-y obrazów | **PASS** | Wszystkie `<img>` mają opisowy `alt` (produkt/scena/kontekst), bez keyword-stuffingu. Zaktualizowane przy P0-dedup: `tryby-panel.webp` alt=„Wyświetlacz Rozgrzewka: cyfra 9, trzy diody trybów i dwa przyciski”; `sc-autonomia.webp` alt=„Granatowy Rozgrzewek odłożony na nocnym stoliku obok ciepłej lampy”. SVG dekoracyjne: `aria-hidden="true" focusable="false"`. |
| TOR-I (tryby — zakładki) | **PASS** | `role="tablist"` + `aria-orientation="horizontal"` + `aria-label="Tryby urządzenia"`; taby `role="tab"`, `aria-selected`, `aria-controls="tr-mode-panel"`, roving `tabindex` (0/-1); panel `role="tabpanel"` `aria-labelledby`. Wskaźniki statusu z `.tr-sr` (tekst dla SR). Poprawny wzorzec ARIA Tabs. |
| Akordeon FAQ | **PASS** | Natywne `<details>/<summary>` — dostępne z definicji (klawiatura + stan `open` = implicit expanded); zero custom-aria do utrzymania. Ikona `+/−` = `<span aria-hidden>`. |
| Podsumowanie kasy (rozwijane) | **PASS** | `zc-sum-bar` z `aria-expanded` (sync JS) + `aria-controls="zc-sum-details"`. |
| Landmarki | **PASS (po naprawie)** | `<header>` (topbar) ✓, `<footer id="footer">` (stopka strony) ✓. Było **brak `<main>`**. NAPRAWA: dodany `<main id="main">` obejmujący wszystkie sekcje treści (hero…final); footer i sticky-buy poza `<main>`. `<footer class="ob-footer">` w sekcji obszary = sekcjonujący footer treści (HTML5 dozwolony, zostaje). |
| Focus-visible | **PASS** | Linki i kontrolki mają `:focus-visible { outline: 2px solid … ; outline-offset }`; brak globalnego `outline:none` bez zamiennika. |
| Touch-targety (mobile) | **PASS (po naprawie)** | 4 linki tekstowe (`.mo-link`, `.gl-link`, `.ob-link`, `.ug-link`) miały wys. 23–26 px < 44. NAPRAWA: `display:inline-flex; align-items:center; min-height:44px` — obszar dotyku ≥44 px, typografia (font-size/underline) bez zmian. |

## Zmiany w kodzie (PASS 5)
1. Hooki hero 2 i 3: `<h1>` → `<p class="display hr-title">` (jeden h1 w dokumencie).
2. `<main id="main">` … `</main>` — wrapper landmarku treści (po `</header>`, przed footer-style/`<footer>`).
3. `min-height:44px` + inline-flex na `.mo-link`/`.gl-link`/`.ob-link`/`.ug-link` (touch ≥44 px).
4. Alt-y zaktualizowane dla podmienionych slotów `tryby-panel.webp` i `sc-autonomia.webp`.

## Bez zmian (świadomie)
- Kolejność/treść sekcji, copy, layout — nietknięte (PASS 5 dotyka tylko semantyki/a11y).
- `<footer class="ob-footer">` (sekcjonujący, wewnątrz `#obszary`) — poprawny HTML5, zostaje.
- Logika checkoutu (`zc-checkout`, TPAY) — NIETYKANA.
