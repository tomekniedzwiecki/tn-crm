# MAPA ASSETÓW — F3 Rozgrzewek (klasy P/U/S/R + allowlista slotów) · 23.07

Baza Storage (publiczny bucket `attachments`):
`https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/bud-assets/rozgrzewek/assets/`
Pliki źródłowe/refy: `.../bud-assets/rozgrzewek/refs/` · UGC źródła: `.../ugc/`
**18 plików assetów** (12 scen S + 2 crop-first R + 1 packshot P + 3 UGC U). Wariant = **granat Blue**.

## Klasy
- **S — scena generowana** (gpt-image-2 multi-ref, derywat makiety Z2): pełnokadrowa fotografia
  lifestyle/packshot; grading do świata (ciepły wieczór).
- **R — surowy realny crop z g0** (klasa dowodowa, WYJĄTEK ŚWIATA — priorytet wierności, ZERO generacji).
- **P — clean packshot** (izolowany granat, alpha; archetyp D — izolacja studyjna).
- **U — UGC realne** (zrehostowane zdjęcia kupujących; bez gradingu i retuszu produktu; WYJĄTEK ŚWIATA).

## Assety (klasa · plik · źródło)
| Plik | Klasa | Format | Źródło / metoda |
|---|---|---|---|
| `sc-hero.webp` / `sc-hero-mobile.webp` | S | WebP q85 | gen; navy-whole+head-face+ref-hero; **+ nośnik ruchu (kubek/para/lampa)** |
| `sc-moment.webp` / `sc-moment-mobile.webp` | S | WebP q85 | gen; ref-moment (sofa/lampa/kubek/świeca) |
| `sc-obszary-neck.webp` | S | WebP q85 | gen; ref-neck (kark) |
| `sc-obszary-shoulder.webp` | S | WebP q85 | gen; ref-shoulder (ramiona) |
| `sc-obszary-back.webp` | S | WebP q85 | gen; ref-back (plecy, zasięg naturalny) |
| `sc-obszary-thigh.webp` | S | WebP q85 | gen; ref-thigh (uda, bez anty-cellulit) |
| `sc-autonomia.webp` / `sc-autonomia-mobile.webp` | S | WebP q85 | gen; ref-autonomia (stolik+lampa, bez portu/kabla) |
| `sc-final.webp` / `sc-final-mobile.webp` | S | WebP q85 | gen; ref-final (stolik+kubek+koc+firanka) |
| `glowica-head.webp` | R | WebP q85 | crop g0 (makro głowicy, 21 kulek+czerw.LED), upscale 2.2× |
| `tryby-panel.webp` | R | WebP q85 | crop g0 (wyświetlacz „9"+3 diody+2 przyciski), upscale 2× |
| `packshot-alpha.png` | P | PNG (alpha) | derywat 01-hero → floodkey biel/brzoskwinia→alpha (cv2) |
| `ugc/ugc-1.webp` | U | WebP q85 | opinia `6-2` (granat w dłoni, głowica góra) — top-crop sliver |
| `ugc/ugc-2.webp` | U | WebP q85 | opinia `7-3` (granat w dłoni, wyświetlacz świeci) |
| `ugc/ugc-3.webp` | U | WebP q85 | opinia `5-1` (realne makro głowicy z czerw. LED) |

## Allowlista slotów (sekcja → dozwolony asset) — dla F4
> Twarda reguła: sekcja renderuje **wyłącznie** asset(y) z tej listy. Poza listą = ZAKAZ (żadnych
> placeholderów, żadnych scen podstawianych jako „dowód produktu").

| Sekcja | Desktop | Mobile | Klasa | Uwaga |
|---|---|---|---|---|
| `hero` | `sc-hero.webp` | `sc-hero-mobile.webp` | S | nośnik ruchu = kubek+para+lampa na brzegu; `packshot-alpha.png` = fallback/baza clean |
| `moment` | `sc-moment.webp` | `sc-moment-mobile.webp` | S | scena LEWA, copy PRAWA (kod) |
| `tryby` | `tryby-panel.webp` | `tryby-panel.webp` | R | etykiety trybów + AKTYWNY wskaźnik = KODOWO (TOR-I) |
| `glowica` | `glowica-head.webp` | `glowica-head.webp` | R | **BEZ dużej cyfry „21"/count-upu** (patrz WIERNOSC §„21"); H2 złagodzone |
| `obszary` | `sc-obszary-{neck,shoulder,back,thigh}.webp` (mozaika 2×2) | te same (sekwencja pionowa) | S | 1 plik/kafel obsługuje d+m |
| `autonomia` | `sc-autonomia.webp` (+ `packshot-alpha.png` mały) | `sc-autonomia-mobile.webp` | S/P | karty parametrów = KODOWO |
| `zdjecia-kupujacych` | `ugc/ugc-1..3.webp` (3 kafle) | `ugc/ugc-1..3.webp` | U | **bramka ≥2 PASS (3 granatowe)**; podpis „Granatowy wariant Blue"; ZERO ocen/liczb |
| `mid-cta` | `packshot-alpha.png` | `packshot-alpha.png` | P | mały izolowany packshot |
| `zamow` (checkout) | `packshot-alpha.png` (miniatura) | `packshot-alpha.png` | P | BEZ selektora kolorów |
| `final` | `sc-final.webp` | `sc-final-mobile.webp` | S | anim #3 = firanka; copy DÓŁ (kod) |
| `faq` | — | — | — | tylko liniowe znaki +/− (kod), zero grafiki |
| `video` | — | — | — | **SKIP** (gate pobieralności/jakości/praw — LEDGER) |

## Sceny animowane (ANIM-3 — nośniki RÓŻNE, produkt statyczny; dla F4/kod)
1. `hero` — **para znad kubka** (obecna w `sc-hero`/`sc-hero-mobile` przy prawej krawędzi).
2. `moment` — **płomień świecy** (świeca obecna w `sc-moment`/`-mobile` na stoliku).
3. `final` — **ruch tkaniny** (firanka obecna w `sc-final`; frędzle koca w `-mobile`).
`prefers-reduced-motion` → pierwsza klatka. ZERO pulsowania produktu / poświaty LED / promieni energii.

## Refy wewnętrzne (NIE assety strony)
`refs/`: `navy-whole`, `head-face`, `head-profile`, `ref-hero/moment/neck/shoulder/back/thigh/autonomia/final`
(kompozycja + wierność do generacji; edge-fallback URL). `refs-cache/ugc-src/` = 10 pobranych klatek
opinii (vision-gate; 7 odrzuconych: pudełka/tekst, wariant szaro-różowy, wariant różowy).

## Koszt F3
`wf2_costs` id `03845cd3-56f3-4066-97d1-6e66455a2d5f` = **$2.24** (12 gen: 8× local HIGH + 4× edge
MEDIUM, 0 regenów), step `lp_grafiki`, stage 3. Crop-first + UGC rehost = **$0**.
