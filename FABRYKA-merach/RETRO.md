# RETRO — FABRYKA-merach (Brzuszek)

## F8 — FINISZ / DOMKNIĘCIE (2026-07-23)

Domknięcie panelu wf2 dla Brzuszka (ULEPSZEK / Patryk Skrzypniak). Landing LIVE:
https://ulepszek.pl/brzuszek. Gate: **42 FAIL → 4 FAIL** (wszystkie 4 = udokumentowany MIS-SCOPE / FP
narzędzi; zero realnych defektów otwartych). manifest-check.py: exit 0 po re-publish.

### NOWE WNIOSKI (LEKSYKON LEKCJI)

- **LL — checkout dwukolumnowy = mis-scope gate `checkout-inline`.** Gdy sekcja `#zamow` jest CUSTOM
  (karta produktu + moduł `.zc-checkout` obok siebie w `.zm-grid`), moduł jest ZAGNIEŻDŻONY w `<div>`,
  a `id="zamow"` siedzi na `<section>` (kotwica ~90 reguł CSS + JS). Kanon gate (`id`+`class`+`data-zc-*`
  na JEDNYM elemencie, jak Rozgrzewek) architektonicznie nie pasuje. Moduł działa przez
  `querySelector('.zc-checkout')`. Wniosek: NIE przenosić `id` (złamie sekcję / duplikat id w ścieżce
  płatności) — udokumentować jako mis-scope, checklista „GATE-CHECK=0 FAIL" = false (wzorzec Rozgrzewka).
- **LL — packshot alpha ≤120 KB: resize + `Image.quantize(FASTOCTREE)` ZACHOWUJE gładką alfę (tRNS).**
  RGBA-PNG cutowanego produktu nie zejdzie ≤120 KB bez palety (RGBA 560 px = 192 KB, posterize 4b = banding).
  FASTOCTREE na RGBA daje P-PNG z per-index tRNS → 7–8% pikseli semi-transparentnych PRZETRWA (AA edges OK) —
  to NIE jest progowanie/czyszczenie alfy (biel-na-bieli nietknięta). 816→**57 KB**. Weryfikacja: histogram
  kanału alfa (są wartości 16–239, nie tylko 0/255). ⛔ nazwy pliku nie zmieniać (`data-zc-thumb-src`).
- **LL — Storage upsert: pierwszy odczyt public URL bywa STALE (edge cache).** Bezpośrednio po PUT
  `object/…` public GET potrafi zwrócić STARĄ wagę; `list` metadata.size jest AUTORYTATYWNE (pokazuje nową).
  Re-weryfikacja plain GET po chwili = nowa waga, `age=None`. NIE panikować — potwierdzić przez list + ponowny GET.
- **LL — makiety w Storage = `.webp`, gate FILES chce `makiety/*.png`.** Pobrać 22 `.webp` i skonwertować
  do `.png` lokalnie (mobile w nazwie zachowuje sufiks). 11 mobile / 12 sekcji → nota `mobile-makiety-wyjatek`
  w LEDGER dla sekcji render-only dodanej po F2.
- **LL — `dopasowanie/WIERNOSC.md` maszynowy: komórka werdyktu MUSI mieć prefiks `WIERNOŚĆ:`.** Regex gate
  to `WIERNO\S{0,3}…(ZGODNA|REAL|…)` — samo „ZGODNA" w kolumnie NIE łapie (nagłówek nie jest częścią
  wiersza). Format: `WIERNOŚĆ: ZGODNA` + kolumna `pass-2` zaczynająca się od `TAK` + `PASS≥K` w kolumnie cech.
- **LL — LL-048 (przypomnienie egzekwowane):** JSON-LD `Product` NIGDY z węzłem `offers`/`price` — cenę
  prowadzi silnik cen (runtime `[data-price]`); cena zapieczona w SERP = kłamstwo. Wycięto cały `offers`.
- **LL — gate dla parasola klienta:** ścieżka kodu `sklepy/patryk-skrzypniak/brzuszek/…` (NIE domyślny
  `tomek-niedzwiecki`) → gate wołać z `--code <ścieżka>` + `--product-key` = **TT-id** (`a7b70e6a…`), nie wf2-id.
- **LL — detail-lint P0 dup-asset over-flaguje ZAMIERZONY reuse packshotu.** Gdy packshot niesie
  pozycjonowane callouty (TOR-I „jak-cwiczysz") i jednocześnie jest shotem produktu w mid-cta/zamow
  (allowlist MAPA-ASSETOW), swap złamałby anotacje. To projektowy reuse, nie lenistwo — udokumentować.

### CHANGELOG F8

- Struktura archiwum: `galeria-kuracja/GALERIA.md`, `RETRO.md`, `dopasowanie/SEMANTYKA.md`,
  `dopasowanie/WIERNOSC.md` (maszynowy), `makiety/` (22 PNG), `ir/05b-zdjecia-kupujacych-IR.json`,
  `DOPASOWANIE.md` (12 werdyktów rubryki + 12 MOBILE-390 + wiersz `zdjecia-kupujacych`).
- Wagi: 6 assetów recompress + upsert (packshot 816→57, arms 129→99, sklad-rozloz 145→95,
  tt1-poster 63→51, tt3-poster 69→55, tt2.mp4 2727→2400). Backup packshot 816 KB w FABRYKA-merach.
- Landing (re-publish 200): JSON-LD `offers` usunięte (LL-048); pigułki zamow `white-space:normal`,
  pigułki hero = chipy poziome (`flex:0 1 auto` + `nowrap` etykieta + kontener `flex-wrap:wrap`);
  touch-targety `.jd-jak__link` + link wideo ≥44 px; #regulacja H2 `font clamp(32,4vw,54)` + kolumna
  `6fr:6fr` (kolizja słowa „najtrudniejszego" z obrazem — zweryfikowane wizualnie chrome-devtools 1280/1440).
- **LL — pigułki/chipy „ucięte" NAPRAWIA się szerokością, nie zawijaniem tekstu.** `white-space:normal +
  overflow-wrap:anywhere` na wąskim chipie ŁAMIE słowa w środku (wygląda gorzej niż ucięcie). Właściwie:
  chip poziomy `flex:0 1 auto` + `white-space:nowrap` (etykieta 1 linia) + kontener `flex-wrap:wrap`
  (chipy zawijają się w wiersze). Weryfikacja WIZUALNA obowiązkowa — pomiar „scrollW≤offsetW" mówi „nie ucięte",
  ale nie widzi brzydkiego łamania śródwyrazowego.
- **LL — kolizja nagłówek↔obraz w 2-kol: winne jest DŁUGIE SŁOWO, nie max-width.** Gdy najdłuższe słowo
  (px) > szerokość kolumny tekstu, przepełnia kolumnę niezależnie od `max-width` (słowo się nie zawija).
  Fix = zmniejszyć font nagłówka (słowo węższe) i/lub poszerzyć kolumnę tekstu, aż `słowo.right < obraz.left`
  z buforem. Zmierzyć realnie (getBoundingClientRect swash vs media), nie zgadywać z `ch`.
- Semantyka PASS: 1×h1, `lang=pl`, 22/22 alt, header/section×12/footer, 37 aria-label / 35 role,
  reduced-motion pełne (`dopasowanie/SEMANTYKA.md`).
- Mis-scope/FP (4 FAIL): `[cta] checkout-inline` (custom 2-kol), `[finalny_pass P0]` packshot-dup
  (reuse projektowy), `[finalny_pass P1]` 2× kontrast (toggle biel-na-bieli + hidden `.zc-fallback`).
  `[cross_landing]` = PASS (mis-scope nie odpalił).
- Koszty: wideo zalogowane zbiorczo przez główną sesję ($1.47); finisz $0.

### CO POSZŁO DOBRZE / DO POPRAWY

- **Dobrze:** archiwum konwencji gate złożone od zera bez regresji; alfa packshotu zachowana mimo
  14× redukcji wagi; zero dotknięcia ścieżki płatności / TPAY / hero-video v2.
- **Do poprawy (nieblokujące):** jawny `<main>` landmark; ewentualny `pngquant/oxipng` w toolchainie
  (dałby RGBA-8bit-alpha ≤120 KB ze smukłymi krawędziami zamiast palety); gate `checkout-inline` mógłby
  akceptować `#zamow > .zc-checkout` (querySelector-root) jako wariant kanonu dla custom 2-kol.
