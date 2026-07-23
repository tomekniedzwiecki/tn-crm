# RETRO — SSAWEK (Popiołek) · F8 · tor Allegro→Marka · 2026-07-23

> Faza F8 = mechanizm uczenia (STANDARD §F8). Ten plik domyka pętlę: destyluje przebieg
> F0→F7 do wniosków z NOŚNIKAMI i wskazuje, co poszło do ksiąg trwałych. Deposit wg
> KAPITALIZACJA-OPS §4 (miły dodatek, nie przymus). Materiał źródłowy: `LEDGER.md`
> (wszystkie fazy + odstępstwa świadome) + raporty tej fabryki.

**Meta:** 1. produkt ze źródła `allegro` (DEMO, OAuth-less test) · **PIERWSZA APLIKACJA doktryny
MAPA ZASTOSOWAŃ (F0.6b)** · cena DANA 119 zł · gate-check = **0 FAIL** (PASS 135, mapa_zastosowan PASS:
funkcje=6, SPEKTRUM 6/4) · preview `https://crm.tomekniedzwiecki.pl/sklepy/tomek-niedzwiecki/ssawek/`
· archetyp hero C (przemysłowy/warsztatowy) · akcent `#C2381B` (terakota z pokrywy) ·
Barlow Semi Condensed + Hanken Grotesk · sygnatura S6 · koszt twardego API **$5.90**
($0.30 favicony + $1.86 makiety + $2.74 sceny F3 + $1.00 delta MAPA-ZASTOSOWAŃ; kod $0; praca Claude =
abonament, poza `wf2_costs`).

---

## 1. CO ZADZIAŁAŁO (utrzymać)

- **Drugie zaufane źródło `allegro` przeszło czysto.** Gate F0 rozszerzony o `allegro`
  (`TRUSTED_SNAPSHOT_SOURCES`/`is_trusted_source`, kopie w panel-sync `kalkulacja` i ad-forge;
  test-gate-check 28/28 PASS z nowym `TestTrustedSources`, bez osłabienia `'detail'`). Jedna
  wskazana oferta Allegro (offerId+productId+`/original/`+specs+opinie) = autentyczna jak `detail`.
- **Dane Allegro LEPSZE niż Ali** dla klasy dowodowej: opinie natywne PL (zero tłumaczenia,
  zero „przetłumaczonego" tonu), EAN, czyste zdjęcia `/original/`. To realny argument za torem
  Allegro jako preferowanym, gdy oferta istnieje.
- **Wierność scen 14/14 za 1. rundą** (dwie niezależne pary oczu: generator Opus + świeży Sonnet
  bez promptu/werdyktu-1) — doktryna „prompt=wizja, produkt=referencja" (LL-005) + ref z
  ZRETUSZOWANEGO crop-a (`prod-clean`) zadziałała bez pętli korekt.
- **Branding DIVERSITY-FIRST** (LL-012): 3 metafory ×2, zwycięzca (wir/vortex) pobił skryptowy
  TOP-1 na rubryce 6×T/N @32/@16. Wordmark z fontu (nie gpt-image) — diakrytyki PL czyste.
- **Moduły kanoniczne wklejone VERBATIM** (checkout-inline@2, sticky-buy@1, lightbox@1,
  faq-accordion@1, footer@1, runtime-snippet, pay-badges) — skórka tokenami, mechanika nietykalna;
  wszystkie twarde gate'y (LAYOUT-FAIL 0/14, rubryka 14/14, PASS 0–5, gate-check) zielone
  model-agnostycznie mimo kodu agent-autorskiego (Z4).
- **Podgląd uczciwy bez fejkowania kasy:** produkt nie istnieje na Trevio (decyzja: tylko landing),
  `buildConfig()=null` → `showGuard()` = jawny podgląd nieaktywnej kasy zamiast martwego formularza.

## 2. CO ZGRZYTAŁO (źródło lekcji)

- **Krok `kalkulacja` (Etap 1) N/D w torze Allegro** — cena DANA, brak silnika marży, towar
  klienta = brak kosztu zakupu. Domknięcie `lp_dane/lp_styl_marka/lp_makiety/lp_grafiki` szło
  **`force_kolejnosc=True`** — świadome, ale WIELOKROTNE obejście blokady kolejności faz. Force
  jako mechanizm dla całego toru = zapach; tor potrzebuje wariantu N/D pierwszej klasy. → **LL-066**.
- **Budżet wag obrazów nie złapał ścieżek uploadu tej fabryki.** `wagi.klasy`/`phash.klasy_path`
  matchują `/scenes/` i `/gallery/` (ang.), a upload poszedł do `bud-assets/ssawek/assets/*.webp`
  (płasko) i `.../galeria/` (pol.) → żaden nie zmatchował, wszystko dostało default 120 KB
  (scena straciła headroom 180; kafel nie dostał 100). → **LL-067**.
- **White-label retusz konieczny i nieoczywisty w pipeline.** Kadry Allegro niosły czytelny
  nadruk sprzedawcy „LEHMANN TOOLS" (g07/g11 czoło zbiornika) + tabliczkę znamionową (g09) —
  retusz (clone-stal + pixelate) MUSIAŁ pójść PRZED F3, bo sceny biorą crop produktu jako
  referencję wierności; nierozpoznany na czas = logo wchodzi do każdej sceny. → **LL-068**.
- **Batch scen w tle padł po ~6 scenach** (`gen-scenes.py all` w tle, przebieg przerwany);
  dokończenie synchroniczne dało 14/14. Watchery/batche w tle w sesjach agentowych = ryzyko
  zakleszczenia; synchroniczne dociąganie działa (spójne z pamięcią „Bash polling=sieroty").
  Obserwacja operacyjna, nośnik = ten LEDGER (nie lekcja systemowa).
- **Blipy infry OpenAI** — F2.5/F2: local HIGH gpt-image 520-ował przez Cloudflare (>100 s/obraz),
  poszedł edge MEDIUM; F3: local HIGH zadziałał (10/14 scen). Transient, nie jakość — MEDIUM
  wystarcza (makieta = kontrakt layoutu; kod odtwarza tekst 1:1). Klasa: transient resilience,
  już objęta pamięcią; nośnik = LEDGER + retry w `gen_favicons_local`.
- **Diakrytyki PL częściowo gubione na makietach** przez gpt-image — znana granica; kod F4
  odtwarza copy 1:1. Bez nowej lekcji.

## 3. LEKCJE Z NOŚNIKAMI (deposit → LEKCJE-LANDINGI.md)

Klasy SYSTEMOWE (tor Allegro). Wpisane wierszami do księgi głównej:

| ID | Klasa | Sedno | Status · Nośnik |
|----|-------|-------|-----------------|
| **LL-066** | PROCEDURA + NARZĘDZIE | Tor `source='allegro'`: krok `kalkulacja` N/D (cena DANA, brak marży/kosztu) — potrzebny wariant N/D pierwszej klasy zamiast wielokrotnego `force_kolejnosc` | ZGŁOSZONA · panel-sync `kalkulacja` rozpoznaje `allegro` + STANDARD §F0 tor Allegro |
| **LL-067** | NARZĘDZIE | `wagi.klasy`/`phash.klasy_path` gubią warianty ścieżek uploadu (`/assets/`, `/galeria/`) → default 120 KB zamiast klasy scena/kafel | ZGŁOSZONA · gate-manifest.json (warianty ścieżek) LUB kanon uploadu assets/scenes+assets/gallery |
| **LL-068** | DOKTRYNA + PROCEDURA | White-label retusz = OBOWIĄZKOWY krok kuracji przy `source='allegro'`, PRZED F3 (sceny biorą crop jako ref wierności); clone-stal na nadruku + pixelate tabliczki, CE zostaje | WDROŻONA · STANDARD §F0 Allegro („RETUSZ obowiązkowy") + doprecyzowanie kolejności (F0.5/F3.0) |
| **LL-069** | NARZĘDZIE + DOKTRYNA | Gate `mapa_zastosowan` liczy `## FUNKCJE` jako **WIERSZE TABELI** markdown — sekcja pisana LISTĄ numerowaną = `funkcje=0` ⇒ produkt multi traktowany jak 1-funkcyjny ⇒ **SPEKTRUM cicho SKIP** (szerokość NIE egzekwowana dla dokładnie tego produktu, dla którego doktryna powstała). Fix: FUNKCJE MUSI być tabelą | WDROŻONA · nota w `docs/zbuduje/MAPA-ZASTOSOWAN.md` §GATE („FUNKCJE = tabela, nie lista") + ssawek MAPA przepisana na tabelę (funkcje=6, SPEKTRUM PASS) |

> Doktryna **MAPA ZASTOSOWAŃ** (zawężenie ssawek→tylko kominek) zdeponowana jako **LL-065** +
> CHANGELOG STANDARD 23.07 (ssawek/Popiołek = wzór „anty-Popiołek: nazwa ≥2 funkcji nie koduje
> 1 użycia"). **Rework zakresu WYKONANY w tej sesji** (§6) — LL-069 to nowa lekcja z dogfoodingu doktryny.

## 4. DEPOSIT KAPITAŁU (KAPITALIZACJA-OPS §4)

1. **EXEMPLARY-INDEX** → **TAK**, dopisano wiersz `ssawek`. Uzasadnienie różnorodności rzemieślniczej:
   pierwszy archetyp **C w rejestrze przemysłowym/warsztatowym** (dotąd C tylko uroda: usmieszek),
   pierwszy produkt z toru **Allegro**, akcent terakota `#C2381B` (poza pasmem amber/koral),
   checkout-inline@2 w torze testowym bez publikacji. Poziom `◽ do oceny` (DEMO/test; zakres w
   reworku MAPA-ZASTOSOWAŃ). ⛔ wiersz karmi RZEMIOSŁO (moduły/rytm/mechanika), NIGDY wizję.
2. **Skeleton** → brak nowego kandydata (żadna sekcja nie wyszła „wybitnie i nowatorsko mechanicznie"
   ponad istniejące moduły kanoniczne).
3. **Tokeny** → partytura Popiołka (`--cta:#C2381B`, Barlow Semi Condensed / Hanken Grotesk, tło
   piasek `#F3EDE4`, S6) w `TOKENS-MAKIETY.md` fabryki; archiwum do repo poniżej.
4. **LEKCJE** → 3 wiersze systemowe (§3) → `LEKCJE-LANDINGI.md`.
5. **Archiwum do repo** → PLAN/KARTA-PRAWDY/ICP/PASZPORT/LEDGER/DOPASOWANIE/RETRO żyją w
   `scripts/mockup-tools/FABRYKA-ssawek/` (w repo, nie na Desktopie) + doki w `wf2-docs/ssawek/`.
6. **Koszt** → twarde API $4.90 zdeponowane w `wf2_costs` (openai-image; kod $0; Claude = abonament,
   poza rollupem — dyrektywa Tomka 23.07). Zero markerów $0.

## 5. STAN PANELU

- `lp_finisz` = DONE (kamień landingu domknięty — gate-check REALNIE 0 FAIL z mapa_zastosowan PASS).
  F8 dokłada RETRO do `wf2-docs/ssawek/` (klikalny chip przy `lp_finisz`).
- Kamień **AKCEPT MAKIET** = nadal PENDING (bramka Tomka, retro-akcept) — **NOTA:** makiety zaktualizowane
  o MOZAIKĘ ZASTOSOWAŃ (06-zastosowania desktop+mobile, 6 kafli-światów) — do retro-akceptu RAZEM z resztą.

---

## 6. DELTA MAPA ZASTOSOWAŃ — pierwsza aplikacja doktryny (top wnioski)

Landing był zawężony do świata KOMINKA (sekcja zastosowań = 4 kafle JEDNEJ funkcji, suche ssanie).
Doktryna F0.6b domknęła lukę „co produkt POTRAFI vs co POKAZUJEMY". PRIMARY (popiół/sezon grzewczy)
TRAFNY i ZOSTAŁ; dołożona SZEROKOŚĆ FUNKCJI.

**CO ZADZIAŁAŁO:**
- **Makieta święta dla UKŁADU, nie dla COPY** (doktryna PIVOT): zmiany copy hero/rozwiązanie/faq bez regenu
  makiet 01/04/14 (układ nietknięty), tylko sekcja STRUKTURALNA (zastosowania) → regen makiety 06. Oszczędność:
  3 zbędne regeny makiet nie poszły. Render side-by-side potwierdził brak zmiany układu.
- **2 nowe sceny za 1. rundą, 2 pary oczu ZGODNA** — mokro (WET, ssawka 2w1 + kałuża) czytelnie różni się od
  suchego ssania; pellet = odrębny kontekst kotłowni. Prompt=wizja + produkt=ref (prod-clean) znów bez pętli.
- **Gate egzekwuje szerokość PO fixie FUNKCJE→tabela** (funkcje=6 ⇒ SPEKTRUM 6/4 PASS zamiast SKIP). Sekcja
  = 3 FUNKCJE (sucho/mokro/nadmuch) niesione WIZUALNIE (mozaika + hero-sub + triada), nie markowane.

**CO POPRAWIĆ (→ lekcje):**
- **LL-069 (nowa):** gate liczy FUNKCJE jako WIERSZE TABELI — mapa pisana LISTĄ = `funkcje=0` = cicha utrata
  egzekucji SPEKTRUM dla multi-produktu. Trap tym groźniejszy, że gate świeci zielono (SKIP≠FAIL). Fix wdrożony
  (nota doktryny + ssawek na tabelę). Do rozważenia twardsze: `manifest_proxy` łapie tylko ETYKIETY — realna
  szerokość to krytyk F1.7 (nota już w doktrynie po ZADANIE 0d).
- **Waga scen `/assets/` (LL-067 nadal żywa):** nowe sceny znów wpadły w klasę `inne` 120 KB → ręczna
  re-kompresja <120 KB. Kanon uploadu assets/ do klasy scena wciąż niezałatwiony (zgłoszone LL-067).

**FLYWHEEL DEPOSIT (KAPITALIZACJA-OPS §4):** EXEMPLARY-INDEX wiersz `ssawek` = już obecny (F8 poprzedni);
NIE dubluję. **LL-069 → LEKCJE-LANDINGI.md** (klasa systemowa: narzędzie gate + doktryna). Koszt delty $1.00
→ `wf2_costs` (openai-image). Ssawek pozostaje wzorem „anty-Popiołek" + teraz DOWÓD, że doktryna niesie
szerokość end-to-end (mapa → makieta → sceny → kod → gate PASS).
