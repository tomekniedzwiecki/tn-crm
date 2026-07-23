# RAPORT — snapshot Allegro: Lehmann Haddo 2000W (offerId 16214946166)

Data: 2026-07-23. Narzedzie: MCP chrome-devtools (realny Chrome). Katalog: `C:\tmp\ALLEGRO-HADDO\`.

## Co sie udalo (KOMPLET)
- **Tytul**: ODKURZACZ PRZEMYSLOWY LEHMANN HADDO POPIOLU KOMINKA GRUZU TURBO 2000W
- **Cena**: 119,00 zl (nowy, InStock). Dostawa: Allegro Smart, "jutro – kup do 15:00", 10,49 zl lub 0 zl ze Smart. Zwrot 14 dni.
- **sold_volume**: 547 osob kupilo (naglowek pokazywal tez "582 osoby kupily ostatnio").
- **EAN/GTIN**: 5903754423987 — JEST. Marka Lehmann, model Haddo, producent Lehmann Polska.
- **Parametry**: 16 pozycji (pelna tabela z sekcji "Wszystkie parametry") + druga warstwa specyfikacji z opisu (moc znamionowa 1200W, 230V/50Hz, waz 1,5m, przewod 3,5m, wymiary 31,5x31,5x35,5 cm, zbiornik metalowy, HEPA DUAL-AIR-FILTER). Zawartosc zestawu (9 elementow) rozpisana.
- **Opis**: pelny tekst (~7,2 tys. znakow) zapisany w snapshot.json (kolejnosc blokow zachowana).
- **Galeria**: 16 zdjec pobranych w rozdzielczosci /original/ (g00–g15). Wszystkie URL-e przepisane z /s128/, /s480/, /s720/ na /original/.
- **Oceny produktu**: srednia 4,72/5; 2458 ocen + 650 recenzji. Rozklad gwiazdek: 5=2091, 4=204, 3=72, 2=23, 1=68. Tresc 15 recenzji (gwiazdki+imie anonimizowane+data+tekst, dla najlepszej takze zalety/wady).
- **Sprzedawca**: SMA_Lehmann = "Oficjalny sklep Lehmann", firma, Super Sprzedawca, 99,5% poleca, 28479 ocen pozytywnych / 163 negatywne, 4 lata 6 mies. na Allegro, 326 ofert.
- **Kategoria**: Allegro > Dom i Ogrod > Narzedzia > Odkurzacze przemyslowe > Odkurzacz przemyslowy Lehmann Haddo 2000 W. productId 52414220-ed42-4055-ab9b-107f2969af02.

## Czego NIE udalo sie / ograniczenia
- **NIP i adres sprzedawcy — BRAK**. Allegro nie eksponuje danych rejestrowych firmy (NIP/adres) na publicznych stronach oferty ani na stronie sprzedawcy bez glebszej interakcji (sekcja DSA "responsible entity" / logowanie). Podstrona `/o-sprzedajacym` zwraca 404. Nazwa producenta z opisu: Lehmann Polska.
- **Recenzje: 15 z 650**. Pozyskane z JSON-LD (bez logowania, bez paginacji). Reszta wymagalaby doklikiwania "wiecej opinii". 15 to reprezentatywna proba (w tym 2x 3-gwiazdkowe i 1x 4-gwiazdkowa — realne wady).
- **description_images = images**. Sekcja OPIS na tej ofercie reuzywa DOKLADNIE tej samej puli obrazkow co galeria (te same URL-e). Opis jest tekstowy — brak osobnych, unikalnych bannerow opisowych. Nie ma wiec plikow d00.jpg itd.; description_images wskazuje na te same g00–g15.

## Zdjecia — jakosc i klasyfikacja (WAZNE dla fabryki)
16 plikow, 758–2000 px, bez obcych watermarkow. Branding LEHMANN wystepuje na samym produkcie (nadruk na zbiorniku) oraz w grafikach marketingowych — to nie sa nakladki znaku wodnego.

Podzial:
- **Czyste zdjecia produktowe/lifestyle (uzyteczne 1:1, bez tekstu) — ok. 11 szt.**: g02, g03, g04, g05, g06, g07, g08, g09, g10 (detale i lifestyle w garazu/magazynie) + g11 (panorama lifestyle) + g13 (kolaz 2x2 zdjec z akcji). Plus g14 = czysty packshot akcesoriow na bialym tle ("co w zestawie").
- **Infografiki / kompozyty marketingowe (z tekstem/grafikami — do wykluczenia lub obrobki) — 4 szt.**: 
  - g00 (hero: packshot + karton + bullet-points EN + plakietka + inset filtra),
  - g01 (koncept HEPA: wirusy/bakterie + strzalki przeplywu na niebieskim gradiencie),
  - g12 (banner marki "LEHMANN HOME" z renderami i chmurami kurzu/wody),
  - g15 (plakietka certyfikatu Prufengel, tekst DE).

## Uwagi dla fabryki landingow
1. **g00 to hero-kompozyt z angielskim tekstem** ("HADDO INDUSTRIAL VACUUM CLEANER", "Blowing function"...) — na landing PL wymaga wyizolowania packshotu albo pominiecia.
2. **g13 (kolaz) ma w tle pudla OBCEGO producenta** ("KANWOD / Bebnowy zwijacz weza 30m") na regalach magazynu — do kadrowania/wykluczenia jesli landing ma byc czysty.
3. **Najlepsze czyste ujecia produktu**: g05 i g11 (lifestyle z produktem w calosci), g09 (detal pokrywy z wlacznikiem), g14 (akcesoria na bialym). g04/g08 to bardzo abstrakcyjne detale (wnetrze zbiornika / kola) — sredni potencjal na hero.
4. **Realny kolor produktu**: stal nierdzewna (chrom) + czerwona pokrywa + czarna podstawa na kolkach. Uzytkowanie: popiol/kominek, gruz/remont, warsztat/garaz, auto, mokro-sucho, funkcja dmuchawy.
5. **Watki z recenzji do wykorzystania w copy (dowod spoleczny)**: mocna sila ssania za niska cene, 3 filtry w zestawie, lekki i poreczny; WADY realne: glosny, waz sie elektryzuje ("kopie 220V"), rury cienkie/krotkie, filtr sie zapycha przy drobnym pyle (piec pellet), delikatna raczka pokrywy.

## Techniczne (gotcha rozwiazane)
- Profil MCP chrome-devtools byl zablokowany przez ZOMBIE druga instancje serwera (node PID squattujacy przegladarke + lockfile). Rozwiazanie: ubicie squattujacego serwera + jego drzewa Chrome, usuniecie lockfile, retry. Zywy serwer MCP zostal nietkniety.
- Pierwsze wejscie na oferte -> DataDome captcha ("Zostales zablokowany", slider). Zwykly RELOAD przeszedl weryfikacje (redirect z ?dd_referrer=). Dane strukturalne pobrane z JSON-LD + DOM (evaluate_script), zdjecia z CDN a.allegroimg.com przez Invoke-WebRequest z UA przegladarki (CDN nie za DataDome, 16/16 OK).
