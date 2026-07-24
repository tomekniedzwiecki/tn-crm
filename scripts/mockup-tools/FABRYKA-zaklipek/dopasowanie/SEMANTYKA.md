# SEMANTYKA (PASS 5) — ZAKLIPEK (przyklipsowy hub USB) · audyt semantyczny HTML · 2026-07-24

Werdykt: **PASS** (0 defektów blokujących dostępność/SEO). Metoda: audyt ŻYWEGO
`sklepy/tomek-niedzwiecki/zaklipek/index.html` (2407 linii) — hierarchia nagłówków, landmarki,
alt-teksty, ARIA interakcji (tablist demo, range zacisk, akordeon FAQ), `lang`, dane strukturalne.

## 1. Hierarchia nagłówków (jeden h1, h2 per sekcja treści)
| kontrola | stan | werdykt |
|---|---|---|
| Dokładnie JEDEN `<h1>` (hero) | 1× h1 („porty zawsze pod ręką", hero) | PASS |
| `<h2>` prowadzi każdą sekcję treści | 12× h2 (problem/rozwiazanie/demo/korzysci/zacisk/porownanie/mid-cta/opinie/galeria/zamow/faq/final) | PASS |
| Brak przeskoków poziomów (h1→h3 bez h2) | h3 tylko WEWNĄTRZ kart/kroków (podrzędne wobec h2 sekcji) | PASS |
| `zaufanie` (pas trust) bez nagłówka | świadome — strip ikon+etykiet, nie sekcja narracyjna (rola prezentacyjna) | PASS |

> 14 `<section id>`; 13 niesie nagłówek (h1 hero + 12 h2). `zaufanie` = pas zaufania (ikony/etykiety
> jako lista), celowo beznagłówkowy — nie łamie hierarchii.

## 2. Landmarki (header / section[id] / footer / nav)
| landmark | obecność | uwaga |
|---|---|---|
| `<header>` | 2× (topbar hero + `<header class="zc-head">` w bloku zamów) | PASS |
| `<section id="…">` | 14 (hero…final) — każda sekcja = osobny landmark z id | PASS |
| `<footer>` | 1× (moduł footer@1) | PASS |
| `<nav aria-label="Stopka">` | 1× (linki stopki, jawna etykieta nawigacji) | PASS |
| `<main>` | BRAK — sekcje są bezpośrednim rodzeństwem pod topbar/hero | OBSERWACJA (nie-blokująca) |

> `<main>` nieobecny: strona landingowa = liniowy ciąg sekcji `id` między `<header>` a `<footer>`.
> Nawigacja po sekcjach działa (id-anchory), struktura czytelna dla czytników. Do rozważenia
> owinięcie sekcji treści w `<main>` przy najbliższym dotknięciu kodu (nie-blokujące, nie regresja).

## 3. Alt-teksty obrazów
| kontrola | stan | werdykt |
|---|---|---|
| Każdy `<img>` ma atrybut `alt` | 16/16 `<img>` z `alt` | PASS |
| Alt opisowy (nie nazwa pliku) | alt = treść sceny/produktu (PL), nie „sc-hero-d.webp" | PASS |
| Scena tła (hero-video) / dekoracja | scena niesie treść → alt opisowy; brak pustych alt-śmieci | PASS |

## 4. ARIA interakcji
| interakcja | ARIA | werdykt |
|---|---|---|
| **demo** (TOR-I, 3 stany) | `role="tablist"` ×1 + `role="tab"` ×3 + `role="tabpanel"` ×3 + `aria-selected` ×6 (stan aktywny/nieaktywny) | PASS |
| **zacisk** (TOR-I, suwak 5–28 mm) | `<input type="range" aria-label="Grubość blatu w milimetrach" aria-valuemin=5 aria-valuemax=28 aria-valuenow=14>` | PASS |
| **FAQ** (akordeon 6 pozycji) | `aria-expanded` ×15 (przełączniki accordion + rozwijane) domyślnie zwinięte (+) | PASS |
| etykiety kontrolek | `aria-label` ×25 (przyciski/nawigacja/kontrolki bez widocznej etykiety tekstowej) | PASS |

## 5. `lang` + dane strukturalne (JSON-LD)
| kontrola | stan | werdykt |
|---|---|---|
| `<html lang="pl">` | obecne | PASS |
| JSON-LD `application/ld+json` | 1 blok: `Product` + `Brand` + `Offer` + `AggregateRating` (4,6 / 26 ocen) | PASS (spójne z KARTĄ) |
| OG / meta opis | `og:title` + `og:image` + `og:type` + `<meta name="description">` | PASS |

> ⚠️ **Nota dla go-live (nie defekt semantyczny, defekt kontraktu publikacji):** `Offer.price "34.90"`
> jest zapieczona w JSON-LD. Gate `published` (LL-048) FAIL-uje cenę w JSON-LD offers na LIVE — cena
> ma żyć wyłącznie przez `[data-price]` runtime (silnik cen). Orkiestrator usuwa blok `offers` przed
> publikacją. W trybie preview (obecnym) gate `published` = SKIP, więc nie blokuje F6-F8.

## 6. Kontrola krzyżowa podpis ↔ obraz (spójność semantyczna, spot-check)
| sekcja | podpis | obraz | zgodne? |
|---|---|---|---|
| hero | „porty zawsze pod ręką" | hub na krawędzi biurka, 4× USB (sc-hero-d) | TAK |
| problem | „porty tam, gdzie ich nie dosięgasz" | dłoń w plątaninie kabli za PC (BEZ produktu) | TAK |
| zacisk | „Czy Zaklipek pasuje do Twojego biurka? 5–28 mm" | przekrój zacisku + suwak grubości blatu | TAK |
| opinie | „★4,6/5 · 26 ocen" | 6 kart cytatów (oryginał EN + polski gist) | TAK (kotwica KARTA §5) |
| galeria | „Port DC 5V / Montaż pod monitorem" | realne konteksty użycia huba | TAK |

## 7. Werdykt
**PASS 5 SEMANTYKA: PASS** — 1 h1 + h2-per-sekcja, landmarki header/section/footer/nav (obserwacja:
brak `<main>`, nie-blokująca), 16/16 alt, ARIA kompletne dla obu TOR-I + FAQ, `lang="pl"`, JSON-LD
spójny z KARTĄ. Jedyna nota LIVE (JSON-LD price) = kontrakt publikacji, nie semantyka — domyka orkiestrator.
