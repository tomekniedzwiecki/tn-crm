# CHOREOGRAFIA-ANIMACJI — etap F5.0: każda sekcja żyje, całość mówi jednym językiem

**Status: OBOWIĄZUJE (2026-07-17; zasada Tomka „przechodząc po stronie czuć, że żyje" +
research Sonnet).** Każda sekcja ma JEDEN własny motyw animacji wynikający z JEJ treści,
wszystkie motywy zbudowane z tych samych tokenów (MOTION-DNA). Rozszerza istniejący system
`.reveal`/`.in`/`[data-stagger]`/`.cu`/`--t` — NIE zastępuje go i NIE dodaje drugiego IO.

## 1. MOTION-DNA — generowany RAZ per landing (choreograf), wstrzykiwany do briefów

```
### MOTION-DNA: <slug>
OSOBOWOŚĆ RUCHU (1 zd., z osobowości marki z planu F1):
  np. „ciepły/opiekuńczy → miękkie ease-out, krótkie dystanse, nic nie skacze"
  vs „energetyczny → sprężysty, dłuższy dystans, lekki overshoot ≤4%".
TOKENY (kod zapisuje w :root — jedno źródło, zero magic numbers):
  --mo-dur-s:.42s  --mo-dur-m:.6s  --mo-dur-l:.72s   (wejścia NIGDY >.72s)
  --mo-ease: cubic-bezier(.2,.7,.2,1)   (energetyczny: (.34,1.2,.4,1))
  --mo-dist: 22px   (opiekuńczy 16-22 / energetyczny 28-36)
  --mo-stagger: 60ms (sloty dowodu mogą 45ms; łączny stagger sekcji ≤ ~500ms)
SKALA INTENSYWNOŚCI (choreograf przypisuje sekcjom — budżet całości):
  L1 dyskretny  = bazowy .reveal (fade+translateY) — akapity, FAQ, stopka
  L2 charakterny = L1 + 1 właściwość-motyw (rotate ≤1.2°, scale-from .96, clip,
                   scaleX łącznika, glow-opacity) — sekcje dowodu/treści
  L3 flagowy    = interakcja --t / scroll-scrubbed — MAX 1-2 NA STRONĘ
BUDŻET: ≤2×L3 · ≤1 ambient-loop · reszta L1/L2. Nadmiar L3 = tandeta.
```

## 2. SPEC PER SEKCJA (kompaktowy — sekcji ~12)

```
[sekcja-id] | L1/L2/L3 | MOTYW ≤6 słów (z TREŚCI sekcji, nie generyczny)
STORYBOARD (2-3 zd.): co robi ruch i czemu pasuje do tej treści.
TRIGGER: view-once (IO .in) | scroll-scrubbed | idle-ambient | hover/press
PROPS: wyłącznie transform/opacity (+@property do koloru); STAGGER: tak(krok)/nie
FALLBACK: reduced-motion → [stan statyczny] · no-JS → treść widoczna
```
Przykłady motywów z treści: porównanie = „karta prostuje się ku nam" (rotate 1.2°→0,
wiersz przewagi rozjaśnia się ostatni); opinie = „karty rzucone na stół" (stagger,
naprzemienna rotacja ±1°→0, scale .97→1); demo 1-2-3 = „kroki zapalają się sekwencyjnie"
(numer scale 1.06 + glow, łącznik scaleX 0→1); hero = wejście H1→sub→CTA kaskadą DNA.

## 3. PIPELINE (w F5, PRZED creative technologist interakcji flagowej)

- **F5.0 CHOREOGRAF** — 1 call gpt-5.6-sol (`high`, cap ~4k, TEKST bez obrazów).
  Input: lista sekcji z DOM (id + rola + 1 zdanie treści) + osobowość marki z F1 + ten
  format. Output: MOTION-DNA + tablica SPEC-ów per sekcja. To PLAN, nie kod. Choreograf
  OZNACZA sekcje L3 — ich pełny spec robi się szablonem z INTERAKCJE-KATALOG (nie dublować).
- **F5.1 IMPLEMENTACJA = JEDEN wspólny moduł** (nie kod per sekcja!): 1 call kodera →
  jeden blok CSS (klasy motywów sterowane `data-mo="tilt|cards|steps|…"` na sekcjach
  + tokeny w :root) + rozszerzenie ISTNIEJĄCEGO IO (`.reveal`→`.in`) o warianty
  `.reveal[data-mo=…]`. Sekcje dostają TYLKO atrybuty data-mo/data-stagger. Zero drugiego
  obserwatora, zero konfliktów ID.
- **F5.2 WERYFIKACJA (CDP):** (a) scroll przez stronę — każda sekcja dostaje `.in`
  (classList, nie „z obrazu"); (b) trace podczas scrolla: brak long-tasks, ≥55fps, CLS=0;
  (c) emulacja prefers-reduced-motion → zero ruchu mimowolnego, pełna treść; (d) CPU 4× →
  płynnie; (e) interakcje L3: gate stanów min/max (F6b).

## 4. ZASADY TWARDE (web 2026)

Animować WYŁĄCZNIE transform/opacity (+interpolowane @property); ZAKAZ box-shadow/height/
width/top/left/filter-blur w pętli; background-image nie animuje się (2 warstwy + crossfade).
Scroll-driven CSS (`animation-timeline: view()`) preferowany dla L2 z `@supports` +
fallbackiem na istniejący IO; JS-rAF tylko dla L3. `prefers-reduced-motion` obowiązkowo
(gate `html.anim` już jest; RM → treść pełna, interakcje działają bez teasera). Wejścia
420-720ms. `will-change` tylko na L3 i tylko na czas ruchu. Hover-only = martwe na mobile —
każdy efekt ma odpowiednik press/scroll. Autoplay-teaser tylko L3 (1 cykl → oddaj kontrolę).

## 5. ANTY-WZORCE (FAIL)

particles/confetti · tilt-on-everything · parallax wielowarstwowy · wejścia >720ms ·
identyczny AOS-fade hurtem (brak motywu per sekcja = martwota) · scroll-hijack ·
>2 sekcje L3 · ambient w wielu sekcjach naraz · ruch przy reduced-motion · CLS z animacji.
