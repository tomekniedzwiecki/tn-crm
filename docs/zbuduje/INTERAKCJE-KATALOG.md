# INTERAKCJE-KATALOG — wzorce world-class dla landingów fabryki (F5)

**Status: OBOWIĄZUJE (2026-07-16, research Sonnet: Awwwards/Apple-teardowny/MDN/Chrome).**
**ZASADA NADRZĘDNA:** interakcja premium **demonstruje KORZYŚĆ produktu w momencie
wątpliwości klienta** — nie „robi wow". Suwak/kontrolka, która zmienia tylko liczbę lub
jedną wartość = gadżet (anty-wzorzec #12). Kontrolka ma zmieniać SCENĘ/doświadczenie.

## KATALOG (wybór per typ produktu; waga: 🟢 CSS 🟡 JS+assety 🔴 frame-sequence)

| # | Wzorzec | Dla | Vanilla — sedno |
|---|---|---|---|
| 1 | 🔴 Scroll-telling frame-sequence (Apple) | produkt „z ruchem" (hero/jak działa) | sticky+wrapper ~300vh, scrollProgress→klatka na canvas (rAF); mobile 30-60 klatek WebP, preload 10, reszta po LCP |
| 2 | 🟢 Sprite `steps()` + `animation-timeline: view()` | krótkie pętle 7-20 klatek | spritesheet, object-position steps(N), zero JS; fallback = 1. klatka |
| 3 | 🟡 **Product simulator suwakiem** | regulowana korzyść (świt, kolory LED, kompresja) | range→`--t` na kontenerze; WSZYSTKIE warstwy sceny z `calc(var(--t))`; suwak zmienia SCENĘ nie liczbę |
| 4 | 🟡 Before/After reveal | efekt widoczny (pompka, cera) | 2 obrazy, clip-path inset z `--x` (pointermove/range); mobile auto-tam-i-z-powrotem w viewport |
| 5 | 🟡 Sticky-scene state change | 3 kroki / tryby | sticky 100dvh, IO progi przełączają .is-active stanów przy nieruchomym produkcie |
| 6 | 🟡 Exploded view | „inżynieria w środku" | warstwy PNG/SVG jednego renderu, translate3d w strony + opacity etykiet, view-timeline |
| 7 | 🟢 **Gradient/światło przez `@property`** | zmiany barwy (niebo, LED) | zarejestrowane `--c1/--c2 syntax:'<color>'` → przeglądarka INTERPOLUJE kolor gradientu (inaczej się nie da) |
| 8 | 🟢 View Transitions API | warianty/miniatura→detal | startViewTransition + view-transition-name; fallback = zmiana natychmiastowa |
| 9 | 🟡 FLIP (WAAPI) | reflow (pakiety, „do koszyka") | First/Last/Invert + element.animate |
| 10 | 🟢 Magnetyczne/stanowe CTA | każde CTA | pointermove→translate max ~6px; mobile: mocny press-state |
| 11 | 🟢 Narracja liczb view-driven | parametry PRAWDZIWE | @property <integer> / IO once |
| 12 | 🟢 Kinetic reveal nagłówka | przejścia aktów | split na SŁOWA (nie litery — PL!), view() entry; JEDEN mocny reveal na sekcję |
| 13 | 🟡 Parallax warstw packshotu | hero premium desktop | 2-3 warstwy różne mnożniki; OSZCZĘDNIE, mobile off |
| 14 | 🟢 Ambient loop spoczynku | nastrój (świt/oddech światła) | @keyframes 15-30s na @property/opacity; reduced-motion → statyczny |
| 15 | 🟡 „Dotknij tryb" | dźwięki/programy | chipy→`--mode`; audio TYLKO za gestem |

**Wzorzec-matka #3 (simulator `--t`) rozwiązuje wiele produktów jedną mechaniką:**
budzik: `--t`=przebieg poranka (niebo @property granat→złoto, słońce translateY+lum,
brightness pokoju 0.35→1.05, zegar 04:00→06:30 liczony z --t, packshot świeci z --t;
sterowanie: range ORAZ scrollProgress sekcji sticky dzielą `--t`; spoczynek = ambient #14) ·
maska LED: `--t`→hue 7 barw na packshocie · pompka: `--t`→clip before/after.

## SZABLON SPEC-a INTERAKCJI dla gpt-5.6-sol (effort NAJWYŻSZY wykonalny)
LLM dowozi wybitną interakcję gdy dostaje STANY+PRZEJŚCIA+KRYTERIA, nie prozę.
NIE podawaj gotowego kodu (ogranicza) — podawaj KONTRAKT:
```
### INTERAKCJA: [nazwa]
1. CEL SPRZEDAŻOWY (1 zdanie): jaką wątpliwość rozbraja / korzyść pokazuje + moment lejka.
2. STORYBOARD (4-6 klatek kluczowych): t=0.0 [co widać] · t=0.4 [...] · t=1.0 [...]
3. STANY I STEROWANIE: zmienna (--t 0→1) · źródła (range + scrollProgress, dzielą stan)
   · co napędza (lista warstw) · stan spoczynku (ambient gdy brak interakcji i motion OK)
4. STACK/OGRANICZENIA: 1 plik, vanilla, zero bibliotek; transform/opacity/interpolowane
   custom properties; lista assetów; zakaz frame-sequence [jeśli dotyczy]
5. KRYTERIA AKCEPTACJI (liczby!): 60fps mid-Android · INP<200ms · CLS 0 ·
   reduced-motion: zero ruchu mimowolnego, funkcja DZIAŁA · bez JS czytelne statycznie ·
   waga <X KB · klawiatura (strzałki na range, focus widoczny)
6. FEEL (1-2 zdania): np. „miękki, oddechowy, ease-out ~600ms, barwa płynie bez pasów
   — @property, nie opacity-crossfade"
7. ZAKAZY: lista anty-wzorców poniżej.
8. PĘTLA: self-review względem pkt 5 do wyczerpania, dopiero potem oddaj.
```

## ANTY-WZORCE (zakazy twarde — „tandeta 2026")
particles/gwiazdki/bąbelki · tilt/parallax na wszystkim · pływający 3D-obiekt bez funkcji ·
AOS-fade hurtowo na każdej sekcji · fake-liczniki/„kupiło 347 osób"/resetujące się odliczanie ·
ciemne „kosmiczne" tła · marquee logotypów · scroll-hijack/smooth-scroll przejmujący gest ·
animacje opóźniające treść (intra/„loading experience") · AI-poetic copy przy animacjach ·
autoplay z dźwiękiem · kontrolka zmieniająca tylko liczbę · efekty tylko-hover (mobile!) ·
brak prefers-reduced-motion.

## LEKCJA LATARKA (17.07) — STANY INTERAKCJI PRZED/PO
Interakcja typu „zobacz X" (LED pokazuje żyłkę, przed/po efektu) WYMAGA realnej PARY stanów:
- ZAKAZ: jeden obraz + filtr CSS jako stan bazowy, gdy filtr nie UKRYWA efektu (Latarek:
  desaturacja nie chowała żyłki → suwak „nie działał" wizualnie mimo poprawnego JS).
- Para z DRYFEM kadru (generacje nie są pixel-aligned) → **crossfade z ostrą krzywą**
  `opacity: clamp(0,(var(--t) - .4)*5,1)` (strefa duchów zawężona do t≈.4-.6), NIE wipe
  z linią podziału (szew zdradza różnicę kadrów). Wipe tylko przy parze pixel-aligned
  (jeden obraz przetworzony deterministycznie, np. filtr który NAPRAWDĘ ukrywa efekt).
- Gate F6(b): screenshot stanu min vs max (teaser zatrzymany przez event input) — SSIM <0.9.
