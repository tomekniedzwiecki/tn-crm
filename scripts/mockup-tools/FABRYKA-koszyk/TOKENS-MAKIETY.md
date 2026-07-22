# TOKENS-MAKIETY — ODSĄCZEK (partytura serii; F2, 22.07.2026)

Kanon warsztatu (rytm 8pt, jasne tła, ≤3 kolory + 1 akcent, para fontów z kontrastem,
jeden radius, ciepła głębia + grain) = TOKENS-MAKIETY.md §KANON (globalny). Poniżej PARTYTURA
tego landingu — uzasadniona w PLAN.md, odchylenia od niej w obrębie partytury NIE są defektem.

## Paleta (jasne tła — twarde)
| token | wartość | rola |
|---|---|---|
| --paper | #F4EFE5 | tło strony (ciepły len) |
| --paper-2 | #EDE6D8 | pasma/pola sekcji |
| --paper-3 | #E3DBC9 | głębszy plan (rzadko) |
| --card | #FFFCF6 | karty near-white |
| --ink | #221E16 | nagłówki (ciepły grafit) |
| --body | #37322A | tekst |
| --line | #DCD5C8 | hairlines/bordery |
| --cta | #176B3A | JEDYNY akcent: butelkowa zieleń — CTA/aktywne stany/strzałki sygnatury |
| --cta-hover | #115530 | hover CTA |
| --cta-ink | #FFFFFF | tekst na CTA |

Kontrast: #176B3A na #F4EFE5 = ~5,6:1 (WCAG AA OK); ink na paper ~13:1.

## Typografia
- Display: **Bricolage Grotesque** (geometryczno-warsztatowy, latin-ext ✓ — plik fonts/BricolageGrotesque.ttf).
- Body/UI: **Figtree** (latin-ext ✓ — fonts/Figtree.ttf).
- Skala TYPOGRAFII ŻYWEJ (LEKCJA ugniatka — briefy kodu dostają JAWNĄ skalę): H1 desktop
  clamp(26–34px), H1 mobile clamp(22–26px), H2 desktop 24–30px, H2 mobile 20–24px,
  body 17px/1.55, ceny 28–36px. Makiety mogą rysować większe H1 (plansza), kod trzyma skalę żywą.

## Kształt i głębia
- Radius serii: **14px** (duży) / 8px (mały). Ikony: outline 1.5px w ink.
- Cienie ciepłe (tint sepia): sm 0 1px 2px rgba(46,38,24,.06); md + 0 10px 26px rgba(46,38,24,.10).
- Grain subtelny na pasmach paper-2 (opcjonalny), nigdy na kartach.
- Trust-pills: wypełnienie --card, 1px --line, tekst ink.

## Sygnatura serii
**Cienkie łukowe strzałki trajektorii** w kolorze --cta (grot mały, łuk ćwiartkowy/półkolisty),
prowadzą ruch: zanurz→wyjmij→zawieś / rozłóż↔złóż. Rysowane w LAYOUCIE (SVG/CSS), NIGDY
wpieczone w fotografie. ZAKAZ: technicznych calloutsów (Ugniatek), dużych liczb (mata),
pisma odręcznego.

## archetyp-hero: H (stos zoning'owy mobile-first)
Kadr (scena sc-hero, ~45svh na mobile) → hook big-type (Bricolage, ink na lnie) → karta
mikro-oferty (--card, border --line, cień sepia, radius 14; cena → CTA → pay-row). Widoczna
granica stref. Desktop = te same trzy strefy w kompozycji pionowej z szerszym kadrem
(scena 3:2 ograniczona wysokością, treść obok/pod wg makiety).

## STYLE-DNA (blok EN — VERBATIM w każdym briefie makiet)
STYLE-DNA: warm linen page #F4EFE5 with section bands #EDE6D8 and near-white cards #FFFCF6;
ink #221E16, body #37322A, hairlines #DCD5C8; EXACTLY ONE accent bottle-green #176B3A used
only for CTA, active states and thin arc-arrows with small arrowheads (the series signature —
motion trajectories, drawn as UI graphics, never baked into photos); icons thin 1.5px outline
in ink; display font Bricolage Grotesque (characterful geometric grotesque), text font Figtree;
one series radius 14px; trust-pills card fill, 1px hairline border, ink text; soft warm
sepia-tinted layered shadows, subtle grain on bands only; light backgrounds only. Polish
diacritics correct. No watermarks, no phone frames.
