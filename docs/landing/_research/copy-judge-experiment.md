# Eksperyment: wewnętrzny copy-judge vs Manus (v5.0, FAZA 5.1)

> Status: **OTWARTY** — rozstrzygnięcie po 3 kolejnych landingach z AUTO-RUN.
> Decyzja bramkowa wpływa na projekt 5.2 roadmapy (kontrakt data-copy).

## Hipoteza

Wewnętrzny copy-judge (Claude w roli zewnętrznego krytyka DR, edytujący HTML bezpośrednio)
osiąga jakość ≥ Manusa przy: −10-15 min pipeline'u, zero zależności od kredytów Manusa
(udokumentowane awarie: feedback-manus-credit-limit), działaniu dla WSZYSTKICH 16 stylów
(apply-copy.mjs jest niekompatybilny z apothecary/clinical — memory).

## Protokół (per landing, 3 kolejne landingi AUTO-RUN)

1. Po ETAP 3 GATE: PASS zapisz kopię copy: `git stash` nie — po prostu `cp index.html /c/tmp/[slug]-pre-copy.html`.
2. **Ścieżka B (judge):** wykonaj procedurę z 03-5-copy-review.md „Ścieżka B" na żywym HTML.
   Zapisz wynik: `cp index.html /c/tmp/[slug]-judge.html`.
3. **Ścieżka A (Manus):** przywróć pre-copy, odpal `bash scripts/review-copy-manus.sh` +
   `node scripts/apply-copy.mjs` (jeśli styl kompatybilny; jak nie — odnotuj „A niewykonalne
   dla stylu X" = punkt dla B). Zapisz: `cp index.html /c/tmp/[slug]-manus.html`.
4. **Porównanie ślepe:** rubryka jakości copy 5 osi 1-5 (konkret/liczby-z-briefu/VOC-brzmienie/
   obiekcje-timing/rytm-zdań) dla obu wersji + screenshot hero obu → ocena Tomka
   („która wersja sprzedaje?") bez informacji która jest która.
5. Do landingu trafia wersja LEPSZA (a przy remisie — B, bo tańsza).

## Tabela wyników

| Landing | Styl | B (judge) śr. | A (Manus) śr. | Czas B | Czas A | Wybór Tomka | Zwycięzca |
|---|---|---|---|---|---|---|---|
| (1) | | | | | | | |
| (2) | | | | | | | |
| (3) | | | | | | | |

## Decyzja bramkowa (po 3 landingach)

- **B ≥ A w ≥2/3** → Ścieżka B zostaje domyślną; Manus = fallback na życzenie;
  projekt 5.2 „kontrakt data-copy" **SKREŚLONY** (istniał głównie po to, żeby Manus
  działał dla wszystkich stylów).
- **A > B w ≥2/3** → Manus zostaje; wdrażamy 5.2 data-copy (specyfikacja: upgrade-plan #32).
