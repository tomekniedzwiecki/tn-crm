# MAPA ASSETÓW — ZAKLIPEK (F3 grafiki produkcyjne) · 2026-07-24

Asset → sekcja → rola/slot → klasa obrazu (P/U/S/R wg `OBRAZY-ROLE.md`) → ujęcie → źródło →
TYP OSADZENIA (A=full-bleed copy NA scenie / B=split kadr-w-kolumnie / C=kafel-slot; wg
`GRAFIKA-Z-MAKIETY §1`). **CROP z zaakceptowanej makiety = pixel-perfect, $0** (makiety Zaklipka
mają JUŻ czyste rendery scen — tekst leży OBOK sceny). REGEN tylko tam, gdzie tekst leżał NA scenie.

Folder assetów: `scripts/mockup-tools/FABRYKA-zaklipek/assets/`
Rehost Storage: `bud-assets/zaklipek/assets/<plik>.webp` (bucket `attachments`).

## Packshot (klasa P)
| plik | sekcja / slot | klasa | ujęcie | źródło | osadzenie |
|---|---|---|---|---|---|
| `packshot-base.png` | `#zamow` karta checkout · hero mikro-oferta · `sticky-buy` · `faq` sticky-media | **P** | studyjny 3/4, izolowany na bieli | CROP lewej strony `14-zamow.png` | packshot na karcie (nie scena) |
| `packshot-base-transparent.png` | wariant do kompozycji na kolorze (opcjonalny; podstawowy = opaque) | **P** | j.w. + alfa (flood-fill tła) | CROP + flood-fill | — |

## Sceny sekcji (klasa S) — pełny kadr pod tekst HTML
| plik | sekcja | rola | klasa | ujęcie | źródło | osadzenie |
|---|---|---|---|---|---|---|
| `sc-hero-d.png` | `hero` (desktop) | tło prawej kolumny (split 55/45) | **S** | dłoń wpina USB, biurko/monitor/kubek, front-3/4 L | CROP prawej `01-hero.png` | **B** — object-fit cover, ZERO fade |
| `sc-hero-m.png` | `hero` (mobile) | tło górnej strefy (~50svh) | **S** | j.w., kadr pionowy | CROP góry `01-hero-m.png` | B/A mobile — scena góra, karta pod |
| `sc-problem.png` | `problem` (desktop) | tło lewej kolumny — **BÓL BEZ PRODUKTU** | **S** | dłoń za obudową PC w plątaninie kabli (ZERO naszego hubu) | CROP lewej `03-problem.png` | **B** — object-fit cover |
| `sc-problem-m.png` | `problem` (mobile) | tło górnej strefy | **S** | j.w., kadr pionowy | CROP góry `03-problem-m.png` | B |
| `sc-rozwiazanie.png` | `rozwiazanie` (desktop) | tło prawej kolumny (ULGA) | **S** | produkt na krawędzi biurka, okno/roślina/firana, front-R 3/4 | CROP prawej `04-rozwiazanie.png` | **B** |
| `sc-rozwiazanie-m.png` | `rozwiazanie` (mobile) | tło górnej strefy | **S** | j.w., kadr pionowy | CROP góry `04-rozwiazanie-m.png` | B |
| `sc-demo-01.png` | `demo` krok 1 (TOR-I stan) | kafel „Zaciśnij na krawędzi" | **S** | zacisk + linijka 5–28 + dłoń na śrubie, detal boczny | CROP kafla `05-demo.png` | **C** — kafel, ZERO fade |
| `sc-demo-02.png` | `demo` krok 2 (TOR-I stan) | kafel „Wepnij urządzenia" | **S** | dłoń wpina pendrive, front bliski | CROP kafla `05-demo.png` | **C** |
| `sc-demo-03.png` | `demo` krok 3 (TOR-I stan) | kafel „Porty pod ręką" | **S** | 4 porty z wpiętymi kablami, front bliski | CROP kafla `05-demo.png` | **C** |
| `sc-zacisk.png` | `zacisk` (TOR-I flagowa, desktop) | tło lewej kolumny / karta detalu | **S** | mechanizm zacisku + skala 5–28 mm + dłoń na pokrętle | CROP lewej `07-zacisk.png` | **B/C** — kadr w kolumnie |
| `sc-zacisk-m.png` | `zacisk` (mobile) | tło górnej strefy | **S** | j.w., kadr pionowy | CROP góry `07-zacisk-m.png` | B |
| `sc-midcta.png` | `mid-cta` (dedykowana CTA) | tło full-bleed pod copy+`.btn.cta` | **S** | wieczorne biurko, osoba przy laptopie, lampa, produkt na krawędzi | **REGEN** (ref=`09-mid-cta.png`, „remove text/UI") | **A** — kod kładzie scrim+CTA na scenie |
| `sc-final.png` | `final` (FINAL CTA) | tło full-bleed pod copy+`.btn.cta` | **S** | życie z produktem: lampa, kubek z parą, firana, miasto, produkt na krawędzi | **REGEN** (ref=`16-final.png`, „remove text/UI") | **A** — kod kładzie scrim+CTA |

## Galeria (klasa S — czyste rendery produktu; `lightbox@1`)
| plik | slot | klasa | ujęcie | źródło | osadzenie |
|---|---|---|---|---|---|
| `gal-01.png` | `galeria` kafel 1 | **S** | dłoń wpina USB (biurko, top-down) | CROP kafla `11-galeria.png` | **C** |
| `gal-02.png` | `galeria` kafel 2 | **S** | spód zacisku, caliper 5–28 mm (izolowany) | CROP kafla `11-galeria.png` | **C** |
| `gal-03.png` | `galeria` kafel 3 | **S** | 3/4 z portem **DC 5V** (izolowany) | CROP kafla `11-galeria.png` | **C** |
| `gal-04.png` | `galeria` kafel 4 | **S** | montaż pod monitorem (iMac), lifestyle szeroki | CROP kafla `11-galeria.png` | **C** |

## OG / social (poza tabelą wierności F3A)
| plik | rola | źródło |
|---|---|---|
| `og.png` (1200×630) | OG image (meta og:image / twitter:image) | kompozyt: wordmark `logo-combo.png` + `packshot-base.png` + sygnatura krawędzi/ticki, tło #F7F8FA |

## Anty-monotonia (gate `min_distinct_product_views ≥ 5`)
**≥12 różnych ujęć produktu**: packshot studio · hero dłoń+USB (eye-level) · rozwiazanie na krawędzi
z peryferiami · demo-01 zacisk+linijka · demo-02 pendrive · demo-03 kable · zacisk mechanizm boczny ·
gal-01 top-down · gal-02 spód caliper · gal-03 DC 5V · gal-04 pod monitorem · mid-cta wieczór ·
final wieczór. Żaden kadr nie powtarza się 1:1. `problem` = BEZ produktu (EMOCJA↔PRODUKT). **PASS.**

## Nuty dla F4 (koder)
- Sceny **B/C** (hero/problem/rozwiazanie/demo/zacisk/galeria) = `object-fit:cover`, ⛔ ZERO fade,
  ZERO pola koloru — kod przycina do kolumny/kafla; border-radius kart robi KOD (crop = surowa treść).
- Sceny **A** (mid-cta/final) = full-bleed pod treścią; kod kładzie **scrim-plateau** (`--paper`/ciemny
  tint od krawędzi do bloku treści, opacity ≥~0.9 pod tekstem) + `.btn.cta`. Scena już czysta (bez tekstu).
- Packshot = TYLKO slot P (karta oferty/sticky/faq/hero-oferta) — ⛔ nie wklejać packshotu w scenę sceniczną.
- Diakrytyki: teksty z KARTY/PLAN (Z2), NIE z pikseli. Sceny nie niosą wypalonego copy PL.
- Wagi: rehost WebP q82 max-width wg roli; 1. ekran (hero-d + packshot) ≤350 KB łącznie — patrz LEDGER F3.
