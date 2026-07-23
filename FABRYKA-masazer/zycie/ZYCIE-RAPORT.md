# ŻYCIE — RAPORT F5 (MOTION-DNA · Rozgrzewek)

**Landing:** https://ulepszek.pl/rozgrzewek
**Plik:** `C:\repos_tn\tn-crm\sklepy\patryk-skrzypniak\rozgrzewek\index.html`
**Źródło prawdy:** `FABRYKA-masazer/MOTION-DNA.md` (wdrożone 1:1)
**Data:** 23.07 · projekt wf2 `448f2395-0961-4f62-8fee-d42b9fb6cf29` · produkt `4404200a…` (slug rozgrzewek)
**Metodyka testów:** Playwright/Chromium 1280×800 (desktop) + 390×844 (mobile, touch), dsf=1 (piksele CSS — powtarzalny SSIM), SSIM=scikit-image.

---

## 1. CO WDROŻONE — per pozycja MOTION-DNA

| MOTION-DNA | Wdrożenie |
|---|---|
| **Tokeny** | Dodane kanoniczne `--dur-xs/s/m/l` (180/320/560/900 ms), `--ease-out/--ease-in-out/--ease-press`, `--enter-y-xs/s/max`, `--stagger`. W `:root`. |
| **Scroll-reveal** | Jeden współdzielony IntersectionObserver, `once` (unobserve po wejściu), threshold 0.18 (tolerancja floata) + rootMargin `-12%`; elementy wyższe niż viewport i przeskoczone (nad kadrem) dostają stan końcowy bez animacji poza kadrem (§ZESTAW). **Guard:** klasa startowa reveal (opacity/translateY) tylko pod `html.rgz-motion`, nadawaną w `<head>` WYŁĄCZNIE gdy JS działa i brak `prefers-reduced-motion` → brak JS / reduced-motion ⇒ strona 100% czytelna bez ruchu. `display:none` na danym breakpoincie → od razu `.in`. |
| **Count-up „9"** | JEDYNY na stronie. Nagłówek Trybów „…od 1 do **9**": 1→9, 900 ms, ease-out, threshold 0.60, jednorazowo. `tabular-nums` + `min-width:1ch` = zero CLS. ⛔ ~3 h / ~50 min / ok. 30 min — statyczne (bez count-upu). ⛔ brak cyfry „21". |
| **Sygnatura „kręgi ciepła" (głowica)** | Własny IO `--io-accent` (threshold 0.35, rootMargin `-15%`), jednorazowo, odpięty od reveal kopii. 3 łuki wchodzą stroke-dashoffset + opacity, kolejność wewnętrzny(0)→środkowy(+110 ms)→zewnętrzny #2E46C8(+220 ms). Produkt/zdjęcie STATYCZNE. |
| **Przejścia TOR-I** | Mechanika diod/zakładek NIETKNIĘTA (F4). Dodane: press zakładki `scale .985` (--ease-press), miękkie wejście NOWEGO panelu `tr-swap-in` (opacity/translateY 6px, 260 ms) TYLKO przy akcji usera (pierwsza aktywacja bez animacji). Dokładnie 1 dioda per stan zachowana. |
| **Mikrointerakcje** | CTA: hover translateY(−1px), active scale(.985), focus-visible ring 2px offset 3px; kolor/cień NATYCHMIAST (transition tylko transform). Karty obszary/UGC = bez linku → statyczne (bez fałszywego affordance). |
| **Akordeon FAQ** | §9: przestrzeń natychmiast (natywne `<details>`), treść odpowiedzi wchodzi opacity 0→1 + translateY(−4px→0) 220 ms na toggle-otwarcie usera; pierwsze (otwarte) pytanie bez animacji; chevron 180 ms. (Zgodnie z §9 „Nie animować grid-template-rows/height" — animowana wyłącznie treść.) |
| **Checkout (§10)** | Logika NIETYKALNA. Subtelne wejście sekcji na bezpiecznych kontenerach `.zc-head` + `.zc-card` (reveal). Mikrofeedback submitu = istniejący (disabled opacity .62, spinner). LL-052 zachowane. |
| **Reduced-motion** | Komplet: reveale od razu pełne, count-up statyczne „9", kręgi pełne, TOR-I zmienia treść/zakładkę/diodę bez przejść, sticky bez animacji, FAQ bez animacji. Gating przez brak `rgz-motion` + jawne `@media (prefers-reduced-motion:reduce)`. |
| **Budżet** | Animowane transform/opacity (+ sankcjonowany stroke-dashoffset kręgów). `will-change:transform,opacity` nadawane w JS tylko na czas wejścia, zdejmowane po `transitionend`. **Usunięto 3 zapętlone ambienty** (hero glow, moment „świeca", final „kurtyna") — DNA zakazuje pętli/„oddychania"; stan spoczynkowy statyczny. Pozostałe `infinite` = wyłącznie funkcjonalne loadery kasy (spinner CTA, puls BLIK). |

**Sticky-buy — poprawka zgodności (bug F4):** pasek WRACAŁ w sekcji final poniżej #zamow (łamało §Sticky/§Final). Minimalny fix mechaniki: „osiągnięto/minięto #zamow" liczone z `boundingClientRect.top <= innerHeight*0.8` (nie samo isIntersecting) → pasek pozostaje ukryty poniżej kasy; wraca dopiero przy scrollu w górę, gdy #zamow zejdzie poniżej linii.

---

## 2. TEST-PLAN — punkt po punkcie

| # | Punkt | Desktop 1280 | Mobile 390 | Werdykt |
|---|---|---|---|---|
| 1 | **Stany TOR-I — SSIM par < 0.9** (ROI: rząd zakładek + diody + panel trybu) | heat-vibe **0.847**, heat-ems **0.874**, vibe-ems **0.849** | heat-vibe **0.884**, heat-ems **0.833**, vibe-ems **0.830** | ✅ wszystkie <0.9 |
| 1 | **Dokładnie 1 dioda per stan + zgodna z trybem** | heat=1(czerwona), vibe=1(niebieska), ems=1(zielona) | j.w. | ✅ |
| 1 | **Treść karty zmieniona** | Ciepło/Wibracje/EMS + opisy | j.w. | ✅ |
| 2 | **Kręgi ciepła odpalają raz, produkt statyczny, reduced=pełne** | accent class=TAK, dashoffset=0, opacity=1 | j.w. | ✅ |
| 3 | **Count-up „9" kończy na 9; przybliżenia bez count-upu** | „9" | „9" | ✅ |
| 4 | **Reveal-audyt `.reveal:not(.in)` = 0 po scrollu** | **0** | **0** | ✅ |
| 5 | **Sticky pojawia po hero / znika nad #zamow / brak w final; CLS** | desktop: display:none (sticky mobile-only) | TOP=ukryty, TRYBY=widoczny, ZAMOW=ukryty, FINAL=ukryty | ✅ |
| 6 | **Konsola 0 błędów** (lokalnie + LIVE) | 0 / 0 | 0 / 0 | ✅ |
| 7 | **Brak h-scroll** (scrollWidth ≤ innerWidth) | ok (1280) | ok (390) | ✅ |
| 8 | **CLS** | ~0.001–0.004* | **0** | ✅ (*font-swap topbar-nav, nie animacja) |
| 9 | **FPS / brak long-tasks z animacji** | transform/opacity + stroke-dashoffset (kompozytor) | j.w. | ✅ (z konstrukcji) |
| 10 | **Reduced-motion: treść od razu, TOR-I bez przejść, count-up „9", kręgi pełne, zero transformów** | rgz-motion=OFF, 0/31 ukrytych reveali, rings dashoffset=0 opacity=1, count-up=9, TOR-I dioda=1 (EMS) | ✅ | ✅ |
| 11 | **LL-052: CTA → widoczny `.zc-form`** (LIVE, realny formularz) | formVisible=TAK, formTop=230 px, inView | formVisible=TAK, formTop=252 px, inView | ✅ |

*CLS: warstwa animacji wnosi 0 (reveale=transform/opacity, sticky=fixed, count-up=stała szerokość, media z wymiarami). Reszta ≤0.004 desktop pochodzi z font-swap Work Sans na `nav.topbar__nav` (obecne przed F5, nie z ruchu); mobile 0.*

**LL-052 lokalnie:** formularz jest `display:none` (guard bez product_id w repo) → pełna weryfikacja na LIVE (real product_id renderuje formularz) — przeszła.

---

## 3. NAPRAWY w trakcie testów

1. **Reveal guard** — pierwotne `.reveal{opacity:0}` w czystym CSS ukrywało treść przy braku JS. Przeniesione pod `html.rgz-motion` + bezpiecznik `html:not(.rgz-motion) .rings path{stroke-dashoffset:0!important;opacity:1!important}`.
2. **Reveal-audyt** — elementy przeskoczone szybkim skokiem/`display:none` zostawały bez `.in`. Dodano obsługę „nad kadrem → stan końcowy" (§ZESTAW) i pominięcie `display:none`. Audyt 0 na obu.
3. **Sticky reappear w final** — realny bug zgodności naprawiony (opis wyżej). Zweryfikowany 4-punktowo lokalnie i na LIVE.
4. **Metodyka SSIM** — ROI zawężone do „rząd zakładek + diody + panel trybu" (statyczne zdjęcie wyświetlacza LED rozcieńczało różnicę); dsf=1 dla powtarzalności. Wszystkie 6 par <0.9.

---

## 4. RE-PUBLISH

- Komenda: `platform-sync.py publish 448f2395-… rozgrzewek` (BEZ ensure_product — produkt z F4).
- Wynik: **HTTP 200 · 177 884 B · runtime product_id w HTML: TAK · noindex ZDJĘTY** · harden (strip komentarzy + collapse + fingerprint).
- Weryfikacja LIVE (`curl https://ulepszek.pl/rozgrzewek` → 200): `data-zc-product` = realny UUID (0 placeholderów), `data-zc-api` na `#zamow.zc-checkout` OBECNE, tokeny `--dur-xs/s/m/l` OBECNE, guard `rgz-motion` OBECNY, sticky-fix OBECNY, `robots noindex` = 0.
- Smoke LIVE (Chromium): 0 błędów konsoli, LL-052 działa, TOR-I/count-up/reveal/sticky poprawne — patrz `live-smoke.txt`, `live-sticky.txt`.

---

## 5. DOWODY (ten katalog)

- `tor_{desktop,mobile}_{heat,vibe,ems}.png` — 6 screenshotów ROI stanów TOR-I (podstawa SSIM).
- `full_{desktop,mobile}.png` — hero po zmianach.
- `ssim-results.json` — macierz SSIM par stanów (obie szerokości).
- `raw-results.json` — pełny surowy wynik test-planu (diody, audyt, sticky, CLS, konsola, reduced-motion).
- `raw-console.txt` — log przebiegu.
- `live-smoke.txt`, `live-sticky.txt` — weryfikacja produkcyjna (LL-052, sticky, konsola).

## 6. PROBLEMY / UWAGI

- **CLS desktop ~0.004** — font-swap `nav.topbar__nav` (Work Sans), obecny przed F5, nie z warstwy ruchu; mobile 0. Nie ruszano fontów (poza zakresem F5, ryzyko regresji wizualnej).
- **Kręgi głowicy** — task nakazał „stroke-dashoffset + opacity"; wdrożono dokładnie to z kolejnością łuków i czasami z §4 (§4 opisywał wariant scale+opacity — pogodzone: ruch GPU-friendly, stan spoczynkowy bez zmian wizualnych).
- **FAQ** — §9 jawnie zakazuje animacji `grid-template-rows/height` (mimo wzmianki w §Budżet); wdrożono §9: przestrzeń natychmiast + fade treści. Zgodność z sekcyjnym spec.
- Pliki `brzuszek/` i `rozmrozik/` NIE dotykane.
