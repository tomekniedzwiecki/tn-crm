# GALERIA — kuracja AliExpress (F0.5, ZAKLIPEK) · 2026-07-23

Aukcja źródłowa: `1005008397815113`, **source=detail (ZAUFANE, gate F0 PASS)**. 7 kadrów
(`ali_snapshot.images`): g0–g5 = galeria detail (WebP 800–1724 px), g6 = okładka klipu TikTok
(jpg 2160×3840). Werdykty zapisane też w `bud_tt_products.gallery_curated`. Proporcje g1–g5 =
kwadrat 1/1 (`--gal-aspect: 1/1`); g0 ~1/1; g6 pionowy 9/16.

⚠️ **CECHA KLUCZOWA TEJ GALERII:** brak JAKIEGOKOLWIEK czystego packshotu bez tekstu — **każdy
kadr g0–g5 to infografika/lifestyle z wypalonym tekstem ENG** i większość reklamuje **droższe
warianty** (7-in-1 / 10 Gbps / czytnik kart), nie sprzedawany wariant bazowy (4-port USB 3.0).
Wniosek dla F3: czysty packshot wariantu bazowego = **do wygenerowania** (crop g0/g2 = referencja
bryły, nie gotowy asset). Kolejność on-page (F4): lifestyle → in-use → detal.

## KEEP (4) — na stronę PO CROP-ie tekstu (klasa R)
| kadr | rola | werdykt | retusz/crop | uwaga |
|---|---|---|---|---|
| g2 | in-use — ręka wpina pendrive, porty pod monitorem | KEEP (CROP) | ✂️ usuń burned „Make Ports Easy to Reach" + dolne paski prędkości „10Gbps/5Gbps/480Mbps"; retusz „Eswirepro" na ekranie jeśli czytelny | najlepszy kadr „porty pod ręką"; pokazuje front z portami USB-A + USB-C |
| g1 | lifestyle — listwa pod monitorem iMac, biurko | KEEP (CROP) | ✂️ usuń burned „Better Office" + inset produktu (prawy górny) | czysta scena biurko/monitor; produkt mały ale osadzony w kontekście |
| g5 | detal — mechanizm zacisku + śruba, „5–28 mm" | KEEP (CROP/DANE) | ✂️ crop samego zacisku + DC5V; retusz etykiety „Eswirepro" na dysku w tle | **[DANE]: zakres 5–28 mm, anti-slip mat, DC5V** → §2b KARTY |
| g3 | detal — port zasilania DC 5V, śruba zacisku | KEEP (CROP/DANE) | ✂️ usuń burned „With Power Supply / DC 5V / Stable Running" | **[DANE]: port DC 5V** → §2b; makro portu zasilania |

## ODSIEW (3) — NIE na stronę; TREŚĆ → materiał do KARTY
| kadr | klasa | werdykt | dlaczego | treść → KARTA |
|---|---|---|---|---|
| g0 | infografika-render (obcy wariant) | ODRZUĆ (jako packshot) | wypalone „Powerful 7-in-1 Expansion / 10Gbps Clamp Docking Station"; pokazuje wariant **7-in-1 z czytnikiem SD/TF** (NIE bazowy) | render bryły aluminiowej = referencja kształtu do F3 (crop), ⛔ NIE claimy „7-in-1/10Gbps" |
| g4 | lifestyle-infografika + zrzut apki | ODRZUĆ | wypalone „AS a phone stander / Unlimited Expansion" + okno kopiowania Windows z „Eswirepro" + ikony | **[OPIS/DANE]: „4*USB3.0 interface can be used simultaneously"** → §2b (4 porty); użycie jako podstawka pod telefon |
| g6 | inny-egzemplarz (obcy brand) | ODRZUĆ | okładka TikTok = **czarny hub z logo „ORICO"**, plastik — INNY produkt/marka niż srebrny aluminiowy Eswirepro | tożsamość produktu (GALERIA-ALI §2 „inny-egzemplarz"); ⛔ nie używać |

## Zdjęcia kupujących (z recenzji — pula do sekcji „zdjęcia od kupujących", klasa dowodowa)
Filtr twardy: tylko `stars == 5`. Dostępne 4 zdjęcia z 2 recenzji 5★ (RANKING przy buildzie, nie tu):
| zdjęcie | recenzja | ocena | ocena wstępna |
|---|---|---|---|
| rev0_0 | [1] test prędkości | ★5 | kandydat — **czarny** wariant 10Gbps na blacie z kablami; ostry; ⚠️ kolor ≠ kanon srebrny |
| rev0_1 | [1] | ★5 | kandydat MOCNY — ostre makro frontu (4 porty), ale **czarny 10Gbps** (inny wariant) |
| rev0_2 | [1] | ★5 | ❌ ODRZUĆ — zrzut benchmarku CrystalDiskMark (zrzut apki, off-product) |
| rev1_0 | [2] | ★5 | kandydat — **srebrny** wariant zaciśnięty na ramie łóżka (in-use, pasuje do kanonu); dość oddalony |
Uwaga: rozstrzygnięcie sekcji „zdjęcia kupujących" = klasa dowodowa (F1a) → **decyzja Tomka**
(blokada-tomek), nie fabryki. Materiał policzony w F-1 (LEDGER).

## Białe-labelowe RETUSZE (przed użyciem kadru na stronie)
- **g2** — „Eswirepro" na ekranie monitora (jeśli czytelne po crop) → retusz.
- **g4** — ścieżka „…\Eswirepro" w oknie Windows → CROP okna (kadr i tak ODRZUCONY as-is).
- **g5** — etykieta „Eswirepro" na dysku w tle → retusz/crop.
Produkt sam (aluminiowa listwa) NIE ma czytelnego nadruku marki — dobrze.

## Notatka kompozycji
Galeria uboga po odsiewie (GALERIA-ALI §4 fallback): keep = 4 crop-kandydaci (2 lifestyle/in-use
+ 2 detal). **Hero i główny packshot = F3 (generacja/crop pod wariant bazowy 4-port srebrny)** —
brak gotowego czystego packshotu. Proporcje kafli 1/1. Sekcja galerii on-page: g2 (in-use) → g5
(detal zacisk) → g3 (detal DC) → g1 (lifestyle), uzupełnione scenami F3.
