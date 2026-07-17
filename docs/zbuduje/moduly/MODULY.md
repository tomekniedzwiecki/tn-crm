# MODUŁY KANONICZNE — biblioteka mechaniki sekcji (fabryka landingów)

**Status: OBOWIĄZUJE (2026-07-17, audyt R13).** Powód powstania: werdykty vision
odpuszczały defekty mechaniki („Kafle mniejsze niż makieta — bez wpływu na charakter"),
a każdy landing kodował mechanikę od zera → regresje (slivery wideo Odpalaka). Moduł =
zamrożona, przetestowana mechanika sekcji wydzielona z OSTATNIEGO DOBREGO landingu.

## ZASADA UŻYCIA (twarda)
> **Koder MUSI użyć modułu jako BAZY MECHANIKI, gdy budowana sekcja ma tu odpowiednik.**
> Skórowanie = TYLKO tokeny/kolory/promienie/cienie/treść (patrz kontrakt w nagłówku pliku).
> **Pisanie mechaniki od zera dla sekcji, która ma moduł = ODSTĘPSTWO** — raportowane w
> LEDGER (`ODSTĘPSTWO: sekcja X kodowana bez modułu Y, powód: …`). Z6 (design per projekt)
> dotyczy WYGLĄDU, nie MECHANIKI — mechanika jest wspólna i sprawdzona.

Kontrakt każdego modułu (co wolno / czego nie ruszać / anty-wzorzec) jest w komentarzu
nagłówkowym pliku `<moduł>@<wersja>.html`. Proporcje i JS = nietykalne; tokeny = do skórki.

## INDEKS

| moduł | wersja | plik | źródło (landing@commit · data) | kontrakt (skórka / nietykalne) |
|---|---|---|---|---|
| **wideo-rail** | @1 | `wideo-rail@1.html` | loczek@8726382b · 2026-07-17 | skórka: tokeny/kolory/radius, liczba kafli N (→ `repeat(N,1fr)`). NIETYKALNE: flex 0 0 68% + snap (mobile), aspect-ratio 9/16, grid `repeat(N,1fr)` (desktop), cały JS (IO-autoplay, unmute-exclusive, kropki). ⛔ `grid-auto-flow:column;grid-auto-columns:1fr` = slivery. |
| **lightbox** | @1 | `lightbox@1.html` | loczek@8726382b · 2026-07-17 | skórka: kolory/radius/blur overlaya i ×. NIETYKALNE: delegacja na `document` z `.closest('.gitem')`, odczyt `data-full`/alt, zamknięcie tło/×/Escape. ⛔ osobny listener per kafel. |
| **sticky-buy** | @1 | `sticky-buy@1.html` | loczek@8726382b · 2026-07-17 | skórka: tokeny/kolory/radius, treść (marka/cena/metody), href. NIETYKALNE: fixed + translateY(120%)→.show, `@media(min-width:900px){display:none}`, body padding-bottom, IO na `.hero`. ⛔ pokazywanie od razu / na desktopie. |
| **faq-accordion** | @1 | `faq-accordion@1.html` | loczek@8726382b · 2026-07-17 | skórka: tokeny/kolory/radius, treść pytań, obraz media. NIETYKALNE: grid `1.62fr 1fr` + bp 820px, natywny `<details>/<summary>` (ZERO JS), ikona ::before/::after, media sticky top:90px. ⛔ przepisanie na JS accordion. |

## WERSJONOWANIE
- `@N` w nazwie pliku = wersja mechaniki. Zmiana mechaniki (nowe zachowanie/proporcje) =
  nowy plik `@N+1` + wpis w CHANGELOG poniżej; stara wersja zostaje (landingi ją pinują).
- Zmiana kosmetyczna dokumentacji nie bumpuje wersji.
- Źródłem wersji jest ZAWSZE konkretny commit dobrego landingu (nie „z głowy").

## CHANGELOG
- **2026-07-17 — @1 (wszystkie 4):** wydzielone z `loczek@8726382b` (ostatni dobry przed
  audytem R13). Loczek/Odpalak jako pliki landingów idą do kosza — moduły przejmują ich
  sprawdzoną mechanikę. Powód: audyt R13 wykrył, że werdykty vision odpuszczały regresje
  mechaniki (slivery wideo, kafle < makieta) — mechanika przestaje być „per landing".

## POWIĄZANIA
- Egzekwowanie: `STANDARD-LANDING-SKLEPY.md` (F4 — kontrakt użycia modułów) + `SEKCJA-Z-MAKIETY.md`
  (Krok 5 — rubryka werdyktu) + `scripts/mockup-tools/gate-check.py` (LAYOUT-diff łapie
  regresje mechaniki nawet gdy vision je przepuści).
- Typy sekcji (kodowa vs scenowa) i progi: `scripts/mockup-tools/gate-manifest.json`
  (`sekcja_typy`, `layout_diff`).
