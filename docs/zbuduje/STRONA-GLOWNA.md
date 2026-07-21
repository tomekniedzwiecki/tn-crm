# STRONA GŁÓWNA SKLEPU (krok `pl_glowna`) — SSOT

> Wersja 1.0 · 2026-07-21 · właściciel: fabryka landingów (workflow v2 „Sklepy")
> Narzędzie: `scripts/mockup-tools/home-forge.py` · Publikacja: `platform-sync.py home`
> Koncepcja: sesja 0a6253d4 (analiza Sonnet 5) · Pierwsze wdrożenie: Trafionek (baacc66f)

## 0. CZYM JEST (i czym NIE jest)

Strona główna sklepu (path `""` na platformie Trevio) = **mała witryna-rozdzielnia marki
parasolowej**: galeria produktów portfela linkująca do ich landingów + otoczka marki
(logo, tagline, zaufanie COD/14 dni). Odbiorcy: ciekawscy z reklam sprawdzający, czy sklep
istnieje; wejścia z domeny; boty GEO/SEO; linki w stopkach landingów.

⛔ **NIE jest landingiem.** Świadomie NIE zawiera: mikro-oferty w hero, sekcji
problem→rozwiązanie, demo 1-2-3, wideo, porównań, offer-boxa, sticky-buy, długiego copy.
Cała sprzedaż dzieje się na landingach produktów. Dokładanie treści produktowej na home =
duplikacja = ryzyko anty-doorway na CAŁĄ domenę.

**Ruch płatny NIGDY nie idzie na stronę główną** (reklamy → landingi produktów).

## 1. KANON STRONY GŁÓWNEJ (stały dla każdego parasola — poziom warsztatu)

Mapa sekcji (5 rdzeniowych + 1 opcjonalna, mobile-first, wszystko na jednej stronie):

1. **Topbar** — logo-combo parasola (lewa) + slim linia zaufania „Płatność przy odbiorze ·
   14 dni na zwrot". Bez rozbudowanej nawigacji (maks. kotwica „Produkty").
   ⛔ bez ★/liczby opinii nad foldem (lęk #1 leada = scam; redukcja ryzyka > social proof).
2. **Intro parasola (nad foldem)** — H1 = nazwa + tagline; pod nim **answer-first 40–75 słów**
   (co to za sklep + „każdy produkt ma własną markę i stronę" + COD/14 dni). Jedyna proza
   na stronie. Zero superlatywów (ton promocyjny szkodzi GEO).
3. **Pas zaufania** — jeden rząd redukcji ryzyka (COD · 14 dni · bezpieczne płatności);
   może być zrośnięty z intro.
4. **Galeria produktów (rdzeń)** — siatka kart; pierwszy rząd częściowo widoczny nad foldem.
5. **(Opcjonalnie) banda „jak to działa"** — 1-2 zdania między galerią a stopką; włączać
   przy 1-2 produktach (wypełnia stronę bez fałszywych placeholderów).
6. **Footer = moduł `footer@1`** (skórka w tokenach parasola; komplet linków prawnych
   `{{REGULAMIN_URL}}` itd. — podmienia je `platform-sync` przy publikacji; `{{DOSTAWA_URL}}`
   jest wycinane automatycznie). ★/rating dozwolone TYLKO tu, wyłącznie realne.

**Anatomia karty produktu** (stała; siatka wg dyscypliny `galeria@1` — kolumny, jedna
proporcja, cover):

- **Obraz** — jeden kadr per produkt, WSZYSTKIE karty w tej samej proporcji (domyślnie 1/1;
  4/5 dopuszczalne gdy wszystkie kadry pionowe). Reguła wyboru kadru (idempotentna):
  `scenes/oferta.webp` → `gallery-curated/…` pierwszy kadr → `scenes/hero-d.webp`.
- **Nazwa mini-marki** — w foncie display PARASOLA (nie produktu!).
- **Hook** — jedno zdanie (źródło: 1. zdanie meta-description landingu; fallback: descriptor
  z `platform_name` po „—").
- **Cena** — widoczna (sygnał realnego sklepu), initial z bazy + hydratacja
  `wf2-landing-api` (`data-wf2-product="<uuid>"`), format PL „179,00 zł".
- **CTA** — „Zobacz <Mini-marka>" (rozdzielnia, nie sprzedaż — ⛔ „Zamawiam"). Cała karta
  = `<a>` na landing produktu.

**Rama karty należy do PARASOLA, nie do produktu.** Radius, tło, cień, typografia, kolor
CTA — wszystko w tokenach parasola, identyczne na każdej karcie. Indywidualność produktu
niesie WYŁĄCZNIE fotografia (kolor produktu żyje w kadrze). Model „muzeum": jednakowe
passe-partout, różne obrazy. ⛔ recolor karty/CTA na akcent produktu = patchwork = FAIL.

**Równe szanse portfela**: karty jednakowej wagi, kolejność wg `sort_order`/`created_at`;
⛔ badge „bestseller/hit" faworyzujące produkt (zasada feed = równe szanse).

**Zachowanie wg liczby produktów**: 1 → karta „featured" na szerokość (⛔ samotna mała
karta w pustej siatce) + banda „jak to działa"; 2-3 → jeden rząd; 4+ → zawijanie
(auto-fit minmax ~280px, 3→2→1 kolumn). Obsługa obu stanów w CSS szablonu.

**Reszta kanonu warsztatu** (jak TOKENS-MAKIETY): rytm 8pt, jasne tła (⛔ ciemne),
DOKŁADNIE JEDEN akcent UI, para fontów z kontrastem, jeden radius, touch-targets ≥40px,
fonty latin-ext, `prefers-reduced-motion`, brak h-scrolla 320-1920.

**Życie z materiałów landingów (v1.1 — gdy assety istnieją, reuse za 0 zł):**
- **Wideo w KAFLU KARTY (v1.2, decyzja Tomka: wideo = zdjęcie produktu, NIE hero)** —
  `<video>` w kontenerze mediów karty (poster=cover, muted+playsinline+loop,
  `preload="none"`, start/pauza przez IntersectionObserver; reduced-motion = obraz;
  blok `<!--IFVID-->…<!--/IFVID-->` wycinany przez render gdy brak klipu).
  Dobór klipu (home-forge `_hero_video`): `card-loop-m` → `card-loop` → `hero-loop-m`/
  `hero-loop` **TYLKO po detekcji fade** (`_fade_frame`: stddev dolnych 28% klatki @2,5 s
  < 12 = klip „pod copy hero" — ODRZUCONY, karta zostaje na packshocie).
  ⛔ Hero-loopy typu fade (kremowa strefa pod copy landingu) NIGDY do kafla.
  **card-loop = generacja dedykowana** (gdy hero-loop odpada): scena FULLFRAME pion 2:3
  z refami packshot+hero (wierność! 2 pary oczu), zaprojektowana pod animację
  (DOMINUJĄCY fizyczny nośnik ruchu — firana/zwierzę/tkanina, nie światło), gpt-image
  HIGH → Kling 2.5 i2v `tail_image_url`=first (pętla; kontrola RMS first↔last <12) →
  ffmpeg 720px mp4+webm → `bud-assets/<slug>/video/card-loop-m.*`. Koszt ~1,5 zł/klip.
- **Hero intro** = statyczny medalion z sygnaturą marki (⛔ rotator wideo w hero —
  wycofany decyzją Tomka 21.07; wideo żyje w kartach).
- **Hover-swap kart** — drugi kadr `{{CARD_IMG2}}` (hero-d → demo-a → demo-01, różny od
  covera) nakładany opacity na hover/focus; tylko `@media (hover:hover)` i tylko karty
  BEZ wideo (`.has-vid` wyłącza swap).

## 2. PARTYTURA (per marka parasolowa — z kontraktu marki `wf2_projects`)

| pozycja | źródło | Trafionek (wzorzec) |
|---|---|---|
| rodzina tła | `palette` bg/bg-alt/border | krem #FDF8F2 / #F6EDE2 / #E7DCCD |
| para krojów | `fonts` | Fredoka / Nunito (latin-ext) |
| **jedyny akcent UI** | `palette` primary | red #E63946 (CTA + sygnatura) |
| drugi kolor marki | — | **zamknięty w GRAFICE logo** — nie w chromie UI |
| sygnatura | metafora z `brand.json` | motyw „trafienia" (ptaszek/metka) |
| archetyp intro | decyzja per marka | kompozycja logo+tagline+motyw |
| ton copy | `brand_opis` | ciepły, rzeczowy |

Inny parasol = inny wyraz (kroje/akcent/tło/sygnatura), ta sama STRUKTURA ról.
Kierunek kreatywny = decyzja fabryki (nie pytać). Odchylenie partytury ≠ defekt.

## 3. AUTOMATYZACJA — architektura „szablon raz, render wiele"

**Problem**: strona ma być unikalna per projekt (GPT), ale aktualizowana przy KAŻDYM nowym
gotowym produkcie (idempotentnie, bez dryfu i bez kosztu).
**Rozwiązanie**: dwuwarstwowo.

1. **`build` (RAZ per projekt)** — gpt-5.6-sol (Z4: kod ZAWSZE GPT; `wf2gpt-call.py`)
   dostaje brief-celu (dane marki + moduły + kanon) i generuje `template.html` z twardym
   kontraktem markerów:
   - `<!--CARDS:START-->` … `<!--CARDS:END-->` — kontener kart (zawartość = wynik renderu),
   - `<!--CARD-TEMPLATE … CARD-TEMPLATE-->` — wzorzec JEDNEJ karty w komentarzu,
     z placeholderami `{{CARD_URL}} {{CARD_IMG}} {{CARD_NAME}} {{CARD_HOOK}} {{CARD_PRICE}}
     {{CARD_PID}} {{CARD_CTA}} {{CARD_ALT}}`,
   - `<!--ITEMLIST:START-->` … `<!--ITEMLIST:END-->` — slot na `<script type="application/ld+json">`
     (OnlineStore + ItemList; generowany przez render),
   - `{{CANONICAL_URL}}`, `{{OG_URL}}`, meta `robots noindex` (zdejmuje publikacja na domenie),
   - CSS obsługuje stan `.cards--single` (featured) i siatkę N kart.
2. **`render` (przy każdej zmianie portfela/cen — $0, bez GPT)** — deterministyczny:
   czyta bazę, klonuje CARD-TEMPLATE per produkt, wstrzykuje między CARDS, przebudowuje
   JSON-LD ItemList. Te same wejścia → identyczny HTML.

⚠️ Ręczne poprawki w `index.html` giną przy renderze — poprawki designu robi się w
`template.html` (lub build od nowa), poprawki danych w bazie.

**Produkt pojawia się w galerii gdy**: `status='gotowy'` **ORAZ** `platform_page_url`
ustawione (landing opublikowany — zero martwych linków) **ORAZ** okładka rozwiązywalna
(HTTP 200). Produkty `w_budowie`/kandydaci NIE wchodzą.

**Dane wejściowe** (jedyne źródła — idempotencja):
- `wf2_projects`: name, tagline, brand_opis, palette, fonts, logo_url, favicon_url, domain
- `wf2_products` (filtr wyżej): id, slug, platform_name, price, platform_page_url, repo_path
- Storage `bud-assets/<slug>/scenes|gallery-curated/…` (okładki), `bud-assets/parasol-<slug>/brand/`
- meta-description z `sklepy/…/<slug>/index.html` (hook)

**Pliki w repo**: `sklepy/tomek-niedzwiecki/home-<parasol>/{template.html,index.html}`.

## 4. PROCEDURA KROKU (wykonuje sesja fabryki / autopilot)

```
python scripts/mockup-tools/home-forge.py build      <projekt>  # collect→brief→GPT→template→render
python scripts/mockup-tools/home-forge.py og         <projekt>  # OG 1200×630 z logo (Pillow, $0) → Storage
python scripts/mockup-tools/cardloop-forge.py run    <projekt>  # klipy kafli: scan→gen card-loopów dla FADE→render+publish
python scripts/mockup-tools/home-forge.py render     <projekt>  # re-render kart z bazy (aktualizacje)
python scripts/mockup-tools/home-forge.py publish    <projekt>  # platform-sync home + td_shop_url + panel-sync pl_glowna
```

**`cardloop-forge.py` (automat klipów kafli):** `scan` = stan klipów per produkt
(card-loop ✅ / hero-loop ✅ / 🔴 FADE = potrzebny card-loop / ⚪ brak). `gen` = dla FADE:
scene-brief (gpt-5.6-sol vision, effort high) → scena gpt-image HIGH 1024×1536 z refami
packshot+hero → BRAMKA wierności vision 5×T/N (FAIL → regeneracja, max 2 → eskalacja) →
Kling 2.5 i2v `tail_image_url`=first → kontrola pętli RMS <12 (retry 1×) → ffmpeg 720px
mp4+webm → `bud-assets/<slug>/video/card-loop-m.*` + dowody QA (`video/qa/`). Werdykt
vision = PIERWSZA para oczu; **sesja fabryki = DRUGA para oczu** (ogląda QA-klatki przed
zamknięciem kroku). Koszt ~1,5 zł/klip. `run` = gen + home-forge render + publish.

Nowy produkt gotowy (po jego `pl_landing`) → `render` + `publish`. To zdanie jest też
częścią prompt-mapy `pl_landing`-następstw: krok `pl_glowna` pozostaje `done`, aktualizacja
= idempotentny re-render.

**Weryfikacja (przed `publish` = gate kroku):**
1. Linki kart → landingi HTTP 200; liczba kart == liczba produktów kwalifikujących.
2. Ceny na kartach == `wf2_products.price` (initial) + hydratacja działa (konsola czysta).
3. visual-verify (agent): desktop 1280 + mobile 390 — brak h-scrolla, karty równe,
   diakrytyki OK, logo ostre, kontrast WCAG na CTA.
4. Rubryka 6×T/N: (a) wygląda jak sklep tej marki? (b) ≤6 sekcji, zero treści landingowej?
   (c) jeden akcent UI? (d) karty = rama parasola, foto niesie produkt? (e) ★ tylko
   w footerze i realne? (f) JSON-LD bez aggregateRating sklepu?
   Każde N = poprawka i ponowna runda (pętla do wyczerpania).

## 5. GEO / SEO

- **title**: „<Marka> — <tagline>”. **description**: answer-first 2-3 zdania (te same fakty
  w widocznym HTML — boty nie wykonują JS).
- **JSON-LD @graph**: `OnlineStore` (name, description, logo, url) + `ItemList`
  (element → url landingu, name, cena 1:1 z bazą). ⛔ ŻADNEGO `aggregateRating` sklepu
  (brak realnych recenzji sklepu). Product JSON-LD żyje na landingach — nie dublować.
- **noindex/canonical**: szablon niesie `noindex` + `{{CANONICAL_URL}}`; `platform-sync home`
  zdejmuje noindex i wstawia canonical TYLKO na domenie docelowej (jak landingi).
- Pixel: strona główna NIE inicjuje pixela (platforma wstrzykuje sama; zero drugiego init).
  `window.trevio?.viewItemList?.()` defensywnie, jeśli SDK istnieje.

## 6. BUDŻET

Limit **≤15 zł/stronę**; cel realny **<1 zł**: kod = 1 call gpt-5.6-sol (~0,3-0,5 zł),
okładki+logo = reuse (0 zł), OG = Pillow (0 zł). Generacja NOWEJ grafiki (np. scena
brandowa intro) = wyjątek świadomie uzasadniony w nocie kroku, nadal w limicie.

## 7. PUŁAPKI (z koncepcji — nie powtarzać)

1. **Patchwork tęczy** — akcent produktu recoloruje kartę/CTA. Rama = parasol, zawsze.
2. **Rozdęcie w landing** — sekcje problem/demo/opinie na home = anty-doorway.
3. **Martwe linki** — produkt bez opublikowanego landinga w galerii; mieszane proporcje kadrów.
4. **Marnotrawstwo** — generowanie nowych grafik zamiast reuse scen.
5. **GEO-grzechy** — zmyślony aggregateRating, ton promocyjny, fakty tylko w JS,
   zapomniany noindex na starterze / niezdjęty na domenie.
6. **Utrata idempotencji** — ręczne tweaki w index.html; edycje = template lub baza.
7. **Cache Trevio (domena custom)** — starter świeży od razu, domena custom trzyma snapshot
   >2h po PUT. **Flush = `unpublish` → `publish`** na tej samej ścieżce (propagacja do ~2 min;
   dla home path:"" w oknie flushu platforma chwilowo pokazuje default). Po każdym re-publish
   na domenie custom — flush. Szczegóły: platforma-api/README „CACHE DOMENY CUSTOM".

## CHANGELOG

- **1.3 (2026-07-21 noc)** — AUTOMAT card-loopów: `cardloop-forge.py` (scan/gen/run) —
  tor ręczny z v1.2 zamieniony w narzędzie fabryki (scene-brief GPT → scena z refami →
  bramka wierności vision → Kling pętla → RMS → upload → dowody QA); prompt-mapa pl_glowna
  z krokiem (2b); dyrektywa Tomka „fabryka ma tak działać".
- **1.2 (2026-07-21 noc)** — korekta Tomka: wideo w KAFLACH kart (nie hero; rotator
  wycofany). Card-loopy dedykowane dla klipów z fade (masażer+drapek: scena fullframe →
  Kling, ~1,5 zł/klip); heurystyka `_fade_frame` blokuje fade-klipy automatycznie;
  fix wycieku szablonu (render wycina referencyjny CARD-TEMPLATE — komentarze HTML
  się nie zagnieżdżają).
- **1.1 (2026-07-21 wieczór)** — decyzja Tomka „wykorzystać hero-video z landingów":
  rotator hero-video (desktop, klipy portfela po kolei, chip-link) + hover-swap kart;
  marker HEROVIDS + {{CARD_IMG2}} w kontrakcie; home-forge collect zbiera hero_video/cover2.
  Benchmark koderów na identycznym briefie: gpt-5.6-sol 8,5/10 (~1,0 zł, 90 s) vs
  kimi-k3 7/10 (~0,40 zł, 390 s, TYLKO stream, lokalny runner) — default zostaje gpt-5.6-sol.
- **1.0 (2026-07-21)** — pierwsza wersja: koncepcja (Sonnet 5) + architektura
  szablon/render + home-forge.py + wdrożenie Trafionka.
