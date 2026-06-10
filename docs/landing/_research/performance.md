# Performance — pętla kalibracyjna (v5.0)

> Warstwa A generowana przez `scripts/landing-performance-stats.sh` (data: 2026-06-10).
> Warstwa B — procedura niżej (Claude + MCP Meta, na żądanie / kwartalnie).

## Sekcja A — metadane projektowe per landing (auto)

| slug | styl | H/F/T | awareness | liczby-claimy | brief mtime |
|---|---|---|---|---|---|
| auriko | clinical-kitchen | H3/F4/T2 | - | 177 | 2026-05-20 |
| brizka | panoramic-calm | H3/F4/T2 | - | 153 | 2026-05-13 |
| caffora | - | -/-/- | - | 75 | 2026-04-20 |
| calmfur | apothecary-label | -/-/- | - | 37 | 2026-04-27 |
| cervana | clinical-warmth | H1/F3/T2 | - | 93 | 2026-06-10 |
| cervila | clinical-warmth | H1/F3/T2 | - | 55 | 2026-05-29 |
| cremio | editorial-print | H4/F2/T5 | - | 102 | 2026-05-13 |
| czystosz | - | -/-/- | - | 76 | 2026-05-17 |
| glassnova | - | -/-/- | - | 95 | 2026-04-27 |
| hovira | clinical-kitchen | H3/F4/T2 | - | 123 | 2026-05-20 |
| hydrium | clinical-kitchen | H3/F4/T2 | - | 95 | 2026-05-13 |
| innerscan-v2 | - | -/-/- | - | 84 | 2026-04-20 |
| kafina | - | -/-/- | - | 94 | 2026-04-20 |
| kawomir | rugged-heritage | H2/F2/T6 | - | 117 | 2026-05-06 |
| kidsnap | - | -/-/- | - | 108 | 2026-04-20 |
| lensora | panoramic-calm | H3/F1/T1 | - | 93 | 2026-05-29 |
| linovo | japandi-serenity | H1/F3/T5 | - | 42 | 2026-06-10 |
| lissio | editorial-print | H4/F2/T5 | - | 82 | 2026-05-22 |
| oculia | editorial-print | -/-/- | - | 138 | 2026-04-27 |
| parivo | - | -/-/- | - | 165 | 2026-04-22 |
| parlio | panoramic-calm | H3/F1/T1 | - | 90 | 2026-05-29 |
| paronik | - | H4/F3/T1 | - | 127 | 2026-04-23 |
| patrzajka | cottagecore-botanical | H1/F3/T1 | - | 51 | 2026-05-13 |
| postawnik | apothecary-label | H1/F3/T2 | - | 86 | 2026-05-06 |
| rysulek | organic-natural | -/-/- | - | 107 | 2026-05-13 |
| steamla | apothecary-label | H5/F3/T2 | - | 71 | 2026-04-27 |
| uchutek | - | -/-/- | - | 123 | 2026-05-13 |
| vakuo | clinical-kitchen | H3/F4/T2 | - | 115 | 2026-05-29 |
| vapoflow | apothecary-label | H1/F3/T2 | - | 125 | 2026-05-24 |
| vitrix | - | -/-/- | - | 260 | 2026-04-20 |
| windox | - | H4/F2/T2 | - | 91 | 2026-04-22 |
| wodorum | editorial-print | H4/F1/T2 | - | 120 | 2026-05-13 |
| zdroik | panoramic-calm | H1/F1/T1 | - | 108 | 2026-05-29 |


## Sekcja B — ROAS z kampanii Meta (PROCEDURA dla Claude'a, nie skrypt)

Dla landingów z `workflow_ads.meta_mcp_enabled = true`:

1. Zmapuj slug → workflow (grep po brand w `_brief.md` / workflow_id w komentarzu —
   NIGDY nie zakładaj slug=brand, memory project-landing-slug-vs-brand).
2. Przez MCP: `ads_insights_performance_trend` per konto/kampania → **koszt zakupu + ROAS**
   (NIE CTR — CTR mierzy kreację reklamową, nie landing).
3. Obowiązkowa kolumna `link_verified`: czy POTWIERDZONO (adres docelowy reklamy), że
   kampania prowadzi na TEN landing — bez tego wiersz nie wchodzi do analizy.
4. Dopisz do tabeli poniżej (append, z datą pomiaru).

| data | slug | workflow | ROAS | koszt zakupu | link_verified |
|---|---|---|---|---|---|

## Sekcja C — wnioski kalibracyjne (po ≥2 kwartałach danych)

Pytania do odpowiedzi DANYMI: (1) czy landingi 8-12 liczb biją <8 i >12? (2) które warianty
H/F/T korelują z niższym kosztem zakupu per kategoria? (3) czy awareness-dopasowanie hero
(F2 v5.0) zmienia wyniki? Wnioski → korekty progów w 02-generate / drzewa w section-variants.
