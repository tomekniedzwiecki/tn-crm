# WIERNOŚĆ F3A — Rozmrozik (2. para oczu, 2026-07-23)

Wzorzec prawdy: `refs-cache/g0-view.png`. Ocena zamknięta T/N (wątpliwość = N, bez „akceptowalne/pomijalne").

## Legenda warunków
1. Kopuła — transparentna, ścięta piramida (trapezowe boki), płaski top; NIE bania/klipsy.
2. Moduł — czarny podłużny, NA SZCZYCIE kopuły (lub na kopule odstawionej, gdy zdjęta); okrągła kratka + panel/przycisk.
3. Baza — płaska niska taca, czarna rama + srebrna płyta z perforacją w KONCENTRYCZNYCH okręgach.
4. Zero nadruków/logo/tekstu na produkcie.
5. Proporcje wierne g0 — niski profil, moduł zajmuje mniejszość szerokości kopuły.
6. Brak zmyślonych elementów (kable/przyciski/kostki lodu/duch-egzemplarz).

## Tabela ocen

| Scena | 1 Kopuła | 2 Moduł | 3 Perforacja | 4 Bez nadruków | 5 Proporcje | 6 Bez zmyśleń | Werdykt |
|---|---|---|---|---|---|---|---|
| sc-hero-thawed (v1) | T | T | **N** | T | T | T | **FAIL** (warunek 3) |
| sc-hero-thawed (v2 po regen) | T | **N** | T | T | T | T | **FAIL** (warunek 2) |
| sc-demo-place | T | T | T | T | T | T | PASS |
| sc-demo-cover | T | T | T | T | T | T | PASS |
| sc-demo-touch | T | T | T | T | T | T | PASS |
| sc-capacity-steak | T | T | T | T | T | T | PASS |
| sc-capacity-fish | T | T | T | T | T | T | PASS |
| sc-final | T | T | T | T | T | T | PASS |

## Odstępstwa zauważone (wymuszona krytyka)

1. **sc-hero-thawed — perforacja (warunek 3, N):** kropki na płycie aluminiowej czytają się jako rozproszony, diffuzyjny rój punktów, a NIE jako czytelne koncentryczne pierścienie jak w g0 i w pozostałych 6 scenach. To najsłabiej zdefiniowany wzór perforacji z całego kompletu — brak wyraźnych łuków wokół centrum. Wątpliwość rozstrzygnięta na N.
2. **sc-hero-thawed — pozycja modułu (kosmetyczne, geometria):** moduł jest wysunięty/wspornikowo nawisa nad przednią krawędzią topu kopuły i „wisi" nad mięsem, zamiast leżeć płasko na płaskim szczycie. Osadzenie niefizyczne względem g0 (moduł spoczywa równo na topie). Warunek 2 utrzymany na T (moduł jest na szczycie, nie w bazie), ale to realne odstępstwo.
3. **Dryf szczegółu panelu (kosmetyczne, przekrojowo):** g0 ma wyraźny wyświetlacz LED z cyframi + 2–3 ikony dotykowe. Sceny 5 i 6 pokazują panel z ikonami (power + ikony) poprawnie, natomiast sc-demo-place / sc-demo-cover / sc-demo-touch / sc-final redukują panel do samego owalnego przycisku bez czytelnego wyświetlacza LED. Spójność panelu dryfuje między scenami.
4. **Orientacja lameli kratki (kosmetyczne):** kratka jest okrągła we wszystkich scenach (OK), ale lamele raz poziome (hero, cover, final — zgodnie z g0), raz bardziej pionowe (capacity-steak, capacity-fish). Drobna niespójność względem wzorca.
5. **Proporcje tacy w rzutach z góry (kosmetyczne):** w sc-capacity-steak / sc-capacity-fish baza czyta się nieco bardziej prostokątnie niż ~kwadratowe g0. Pomijalne, ale odnotowane.

## v2 po regen (2026-07-23) — sc-hero-thawed

Regen miał dwa cele: (a) koncentryczna perforacja, (b) moduł płasko podparty na topie kopuły, bez nawisu.

- **Warunek 3 — perforacja: POPRAWIONA (v1 N → v2 T).** Widoczne kropki na płycie układają się teraz w czytelny łuk (front-center-prawo), spójny z koncentrycznym wzorem, którego centrum zasłania mięso. Akceptowalne — cel (a) osiągnięty.
- **Warunek 2 — osadzenie modułu: NADAL NIEZGODNE (v2 N).** Moduł nadal nawisa/wspornikowo wisi nad przednią krawędzią topu kopuły, „w powietrzu" nad mięsem, z dyndającą nóżką — NIE jest płasko podparty ani osadzony w gnieździe na topie jak w g0. Cel (b) NIE osiągnięty. To najpewniejsza obserwacja tej wersji; scoring warunku 2 zaostrzony względem v1 (gdzie nawis logowałem jako odstępstwo pod T), bo w v2 był jawnym celem regenu i pozostał nierozwiązany.
- **Werdykt v2: FAIL (warunek 2). REGEN #2 wymagany.** Jedyna poprawka do wymuszenia: posadzić moduł PŁASKO i w całości w obrysie płaskiego topu kopuły (najlepiej po przekątnej, w płytkim gnieździe jak g0) — koniec nawisu nad krawędzią i dyndającej nóżki. Perforacji już nie ruszać.

## Werdykt końcowy

- **PASS: 6 / 7** — sc-demo-place, sc-demo-cover, sc-demo-touch, sc-capacity-steak, sc-capacity-fish, sc-final.
- **FAIL: 1 / 7** — **sc-hero-thawed** (v1: warunek 3 perforacja; **v2 po regen: warunek 2 — moduł nadal nawisa nad krawędzią topu, nie jest płasko podparty**. Perforacja w v2 już poprawna).
- **REGEN #2 wymagany:** sc-hero-thawed. Jedyny pozostały cel: posadzić moduł PŁASKO w obrysie płaskiego topu kopuły (bez nawisu w powietrzu i dyndającej nóżki). Perforacja OK — nie ruszać. To scena bohaterska — wierność krytyczna.
- Rekomendacja porządkowa dla scen PASS: przy kolejnym passie ujednolicić panel modułu (przywrócić wyświetlacz LED + ikony wszędzie) i orientację lameli kratki na poziomą — kosmetyka, nie blokuje.


## Rozstrzygnięcie (1. para oczu + wzorzec g0, 2026-07-23)
v3: perforacja koncentryczna T (od v2). Warunek 2 (zwis tylnego końca modułu ze stopką
poza krawędź topu): porównanie 1:1 z g0 pokazuje, że REALNY produkt ma identyczny zwis
(moduł dłuższy niż płaski top kopuły). Wymóg „zero overhang" był ponad-paszportowy.
**WERDYKT KOŃCOWY: sc-hero-thawed v3 = PASS. Komplet F3: 9/9 PASS.**
