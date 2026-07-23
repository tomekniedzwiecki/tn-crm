# RETRO — SSAWEK (Popiołek) · F8 · tor Allegro→Marka · 2026-07-23

> Faza F8 = mechanizm uczenia (STANDARD §F8). Ten plik domyka pętlę: destyluje przebieg
> F0→F7 do wniosków z NOŚNIKAMI i wskazuje, co poszło do ksiąg trwałych. Deposit wg
> KAPITALIZACJA-OPS §4 (miły dodatek, nie przymus). Materiał źródłowy: `LEDGER.md`
> (wszystkie fazy + odstępstwa świadome) + raporty tej fabryki.

**Meta:** 1. produkt ze źródła `allegro` (DEMO, OAuth-less test) · cena DANA 119 zł ·
gate-check F7 = 0 FAIL · preview live `https://crm.tomekniedzwiecki.pl/sklepy/tomek-niedzwiecki/ssawek/`
· archetyp hero C (przemysłowy/warsztatowy) · akcent `#C2381B` (terakota z pokrywy) ·
Barlow Semi Condensed + Hanken Grotesk · sygnatura S6 · koszt twardego API **$4.90**
($0.30 favicony + $1.86 makiety + $2.74 sceny; kod $0; praca Claude = abonament, poza `wf2_costs`).

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

> Doktryna **MAPA ZASTOSOWAŃ** (zawężenie ssawek→tylko kominek) NIE jest tu duplikowana —
> została już zdeponowana jako **LL-065** + CHANGELOG STANDARD 23.07 (ssawek/Popiołek = wzór
> „anty-Popiołek: nazwa ≥2 funkcji nie koduje 1 użycia"). Rework zakresu prowadzi równoległa sesja.

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

- `lp_finisz` = DONE (kamień landingu domknięty w sesji kodu). F8 NIE zmienia statusu kroku —
  dokłada TYLKO dokument RETRO do `wf2-docs/ssawek/` (klikalny chip przy `lp_finisz`).
- Kamień **AKCEPT MAKIET** = nadal PENDING (bramka Tomka, retro-akcept) — poza zakresem F8.
