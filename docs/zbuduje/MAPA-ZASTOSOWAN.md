# MAPA ZASTOSOWAŃ — doktryna anty-zawężenia prezentacji produktu (krok F0.6b)

**Status: OBOWIĄZUJE (2026-07-23, dyrektywa Tomka; klasa DOKTRYNALNA).** Synteza 3 analiz
(architektonicznej, audytu pipeline i audytu dowodowego 9 landingów). Nośnik lekcji:
`LEKCJE-LANDINGI.md` (ssawek/Popiołek + koszyk/durszlak).

## PO CO (problem, który to zamyka)
Fabryka SYSTEMATYCZNIE zawęża prezentację produktów wieloużytkowych (audyt: 5/7 przypadków —
ssawki pokazane tylko na kominku, koszyk tylko przy smażeniu mimo kategorii „durszlak").
Mechanizm zawężenia był ROZPROSZONY i BEZ WŁAŚCICIELA: **KARTA PRAWDY (F0.6) niesie szerokie
fakty**, ale mapuje je na `cecha→korzyść` i JEDNO „użycie→demo"; potem **ICP** wybiera jedną
personę, **PLAN** jedną metaforę, oś przewodnika „≥3 konteksty" mierzy SCENOGRAFIĘ (nie użycia),
a **nazwa marki** koduje jedno zastosowanie (anty-wzorzec „Popiołek"). Luka **„co produkt POTRAFI
vs co POKAZUJEMY"** nie miała właściciela — MAPA ZASTOSOWAŃ jest tym właścicielem.

**Kontrwzorce, które DZIAŁAŁY (wzór do kopiowania):**
- **Skrolik** — sekcja per użycie + hero-sub wymienia WSZYSTKIE zastosowania.
- **Ugniatek** — szerokość niesiona RDZENIEM + toggle interaktywny (użytkownik przełącza użycia).

**Produkty jednozadaniowe (Rozmrozik/Drapek) słusznie WĄSKIE — doktryna NIE wymusza sztucznej
szerokości.** Szerokość obowiązkowa dopiero, gdy mapa niesie ≥2 RÓŻNE FUNKCJE.

## MIEJSCE W FLOW
`Karta (F0.6) → Mapa (F0.6b) → ICP (F0.6a)`. Mapa POWSTAJE PO Karcie, PRZED ICP — bo **ICP pisze
się ZNAJĄC spektrum** (persona może ważyć KOLEJNOŚĆ zastosowań, nie może wyciąć zdolności).
Zapis instancji per produkt: **`FABRYKA-*/<slug>/MAPA-ZASTOSOWAN.md`** (ten plik = doktryna +
szablon, jak `PRZEWODNIK-GRAFICZNY.md`). Konsumenci: **F1** (PLAN deklaruje zasięg: primary→hero,
secondary→sekcje), **F1.7** (oś POKRYCIE ZASTOSOWAŃ przewodnika), **F2.5** (rubryka nazwy),
**copy/FAQ** (pytania z zastosowań), **G1 kreacje ads** (kąt = zastosowanie).

## ŹRÓDŁA PRODUCENTA MAPY (Sonnet/Haiku — osąd ZAMKNIĘTY, nie kreacja)
Zakres wyprowadza się z FAKTÓW, nie z persony. Producent mapy czyta:
- **KARTA-PRAWDY.md** (funkcje, specs, warianty, opis po destylacji);
- **`ali_snapshot`**:
  - **`title`** (⚠️ **PIERWSZORZĘDNA kotwica funkcji** — tokeny w tytule aukcji niosą zdolności,
    które kategoria gubi: `filter`/`mesh`/`strainer`/`odcedzacz`/`na mokro`/`wet&dry`/`blower`/
    `dmuchawa`. Tytuł jest pisany przez sprzedawcę POD wyszukiwanie realnych zastosowań);
  - **`specs.Type`** (i pokrewne pola typu w `properties.list` — np. „Type: Wet and Dry" =
    **PIERWSZORZĘDNA kotwica funkcji**; kategorie w drzewie AliExpress bywają generyczne
    „Vacuum Cleaner", więc `title`+`specs.Type` biorą pierwszeństwo przed `categories`);
  - `reviews.text_pl` (jak KUPUJĄCY realnie używają — najbogatsze źródło nieoczywistych
    zastosowań), `description`, `categories` (⚠️ kategoria „durszlak"/„odcedzacz" = twardy sygnał
    funkcji, którą landing pominął przy koszyku — ale gdy kategoria generyczna, ustępuje
    `title`/`specs.Type`), `properties`;
- **pola K1 z `bud_sessions.product_input`**: `problem_wow` / `kat_wow` / `pomysl_landing`
  (dziś PORZUCANE po Etapie 1 — **REUŻYĆ gdy istnieją**: to pierwotna intuicja doboru produktu);
- **tytuły `videos_curated`** (klipy TT pokazują użycia, których snapshot nie opisuje).

**Obowiązkowy przegląd WSZYSTKICH dostępnych opinii** — nie próbki. Opinia to najczęstsze źródło
zastosowania, którego producent by nie wymyślił (ssawka do klawiatury, koszyk do odcedzania).

## ⛔ TWARDA ZASADA ANTY-ZAWĘŻENIA (dosłownie — cytować w briefach)
> **ICP steruje CASTINGIEM · TONEM · JĘZYKIEM · AKCENTAMI. NIGDY ZAKRESEM ZASTOSOWAŃ.**
> **Zakres wyprowadza MAPA z FAKTÓW+OPINII niezależnie od persony; persona może ważyć KOLEJNOŚĆ,
> nie może wycinać zdolności.**

## KONFLIKT MAPA ↔ KARTA
Konflikt rozstrzyga **KARTA** (dokładnie jak ICP — Z7: Karta = jedyne źródło faktów). Mapa nie
wprowadza zdolności, których Karta/specs nie potwierdzają; zastosowanie bez kotwicy dowodowej
= poza mapą (albo klasa `[WNIOSEK]` — patrz niżej).

---

## PROCES 4 KROKÓW (A → B → C → D)

### A. FUNKCJE
Każdy PARAMETR specyfikacji → ZDOLNOŚĆ (co produkt fizycznie potrafi). To lista FUNKCJI, nie
zastosowań: „ssie sprężonym strumieniem" (funkcja) ≠ „czyści klawiaturę" (zastosowanie).
Liczba RÓŻNYCH funkcji decyduje o obowiązku SZEROKOŚCI (≥2 → argument „jedno zamiast trzech").

### B. ZASTOSOWANIA — wyczerpująca lista, KAŻDE z KLASĄ DOWODU
Wyczerpująco (nie „główne 2-3"). KAŻDE zastosowanie niesie klasę dowodu:

| Klasa | Znaczenie | Reguła użycia w landingu |
|---|---|---|
| `[OPINIE]` | realny cytat kupującego | mocny dowód — cytat wolno pokazać |
| `[SPEC]` | wynika ze specyfikacji | fakt twardy |
| `[OPIS]` | z opisu producenta (po destylacji, nie bełkot) | fakt |
| `[KATEGORIA]` | z `categories` snapshotu (np. „durszlak") | sygnał funkcji do POKAZANIA |
| `[WIDEO]` | z tytułu `videos_curated` (klip TT) | dowód wizualny |
| `[WNIOSEK]` | wywnioskowane, jawnie oznaczone | **wolno pokazać w scenie zgodnej z funkcją; NIGDY jako claim liczbowy w copy — ANTY-MISMATCH F1 (GALERIA-ALI §5) obowiązuje** |

### C. SHOWCASE (per zastosowanie: JAK pokazać)
Dla KAŻDEGO zastosowania: jak je pokazać — scena / demo (TOR-I) / liczba / before-after — plus
**siła wizualna 1–5** (jak mocno to zastosowanie „sprzedaje się" obrazem). SHOWCASE łączy
zastosowanie z nośnikiem prezentacji, żeby PLAN wiedział, gdzie je posadzić.

### D. SELEKCJA
- **PRIMARY** = JEDEN kąt komercyjny — **hero prowadzi TYLKO nim** (message-match Z1 nienaruszony;
  hero nie rozprasza się listą).
- **SZEROKOŚĆ** = OBOWIĄZKOWA, gdy mapa ma **≥2 RÓŻNE FUNKCJE** (argument sprzedażowy „jedno
  zamiast trzech"). Produkt 1-funkcyjny: szerokość NIE jest wymuszana.
- **SPEKTRUM** światów — lista światów/kontekstów rozdzielona separatorem `·` (kominek · auto ·
  klawiatura · kaloryfer …). Nośnik anty-zawężenia dla gate'u.
- **MAPA→MANIFEST** — mapowanie na sekcje landingu:
  `hero = PRIMARY · zastosowania = LISTA (sekcja/ toggle/ hero-sub) · demo = FUNKCJE · faq = pytania`.

---

## WZORCE DYSTRYBUCJI SZEROKOŚCI (z audytu 9 landingów)
Gdy mapa ma ≥2 funkcje, szerokość rozkłada się jednym z nośników:
1. **hero-sub wymienia SPEKTRUM** (wzór **Skrolik** — pod H1 lista wszystkich zastosowań);
2. **sekcja per użycie** (każde zastosowanie = własny blok scenowy);
3. **toggle interaktywny** (wzór **Ugniatek** — użytkownik przełącza użycia; TOR-I);
4. **mozaika kafli** (siatka zastosowań z podpisami).

**⛔ ZAKAZ:** upchnięcie CAŁEJ szerokości w JEDNEJ sekcji-dodatku typu „nie tylko X", gdy mapa
ma ≥2 FUNKCJE — to markuje szerokość zamiast ją prowadzić (dokładnie ten błąd dał zawężenie).

## SEKCJA „zastosowania" = TYP SCENOWY (biblioteka sekcji)
Nowy typ sekcji: **`zastosowania`** — scenowa (mozaika / toggle / per-użycie). Alias w
`gate-manifest.json` (grupa `benefits/korzysci/06`, gdzie realnie mieszka `06-zastosowania`).
Plan (F1a MANIFEST SEKCJI) wpisuje `zastosowania | scenowa | build`, gdy mapa niesie ≥2 funkcje.

---

## SZABLON PER PRODUKT (skopiuj do `FABRYKA-*/<slug>/MAPA-ZASTOSOWAN.md`)
Nagłówki KANONICZNE — parsuje je gate `mapa_zastosowan` (`gate-check.py`). Nie zmieniać markerów.

```markdown
# MAPA ZASTOSOWAŃ — <marka/slug>

## FUNKCJE
| # | Parametr (spec) | Funkcja (zdolność) |
|---|---|---|
| 1 | <parametr> | <co produkt potrafi> |
| 2 | <parametr> | <co produkt potrafi> |

## ZASTOSOWANIA
| # | Zastosowanie | Klasa dowodu | Kotwica (cytat/spec/kategoria) |
|---|---|---|---|
| 1 | <użycie> | [OPINIE] | „<cytat kupującego>" |
| 2 | <użycie> | [SPEC]   | <parametr> |
| 3 | <użycie> | [KATEGORIA] | categories: <...> |
| 4 | <użycie> | [OPIS]   | <fakt z opisu> |
| 5 | <użycie> | [WIDEO]  | tytuł klipu TT |
| 6 | <użycie> | [WNIOSEK]| <przesłanka; NIE claim liczbowy> |
(wyczerpująco — min. 6 wierszy z klasą dowodu; jednozadaniowy produkt też enumeruje realne konteksty)

## SHOWCASE
| Zastosowanie | Jak pokazać (scena/demo/liczba/before-after) | Siła wizualna 1-5 |
|---|---|---|
| <użycie> | <nośnik> | 4 |

## SELEKCJA
**PRIMARY:** <jeden kąt komercyjny — hero prowadzi tylko nim>
**SZEROKOŚĆ:** obowiązkowa (mapa ma ≥2 funkcje) | n/d (produkt 1-funkcyjny)
**SPEKTRUM:** świat1 · świat2 · świat3 · świat4 · świat5
**MANIFEST:** hero=PRIMARY · zastosowania=<sekcja/toggle/hero-sub> · demo=<funkcje> · faq=<pytania>
```

## GATE (maszynowy — `gate-check.py` blok `mapa_zastosowan`)
- **Plik istnieje** dla NOWYCH landingów (mtime kodu ≥ `wymagany_od_data: 2026-07-23`; starsze = SKIP).
- **`## ZASTOSOWANIA`** ≥ `min_zastosowania` (default 6) wierszy z tagiem klasy dowodu = FAIL, jeśli mniej.
- **`SPEKTRUM`** ≥ `min_swiaty` (default 4) światów = FAIL — **tylko gdy mapa deklaruje ≥2 FUNKCJE**
  (produkt 1-funkcyjny: SKIP z notą, bez sztucznej szerokości).
- **`[OPINIE]`** obecne — liczone **PO WIERSZACH tabeli `## ZASTOSOWANIA`** (regex klasy dowodu na
  wierszach danych), NIE substring w bloku (proza „[OPINIE] — celowo nieobecne" dawała fałszywy PASS).
- **`PRIMARY`** zadeklarowany · **nośnik szerokości w landingu** (sekcja zastosowań / hero-sub
  spektrum / toggle) przy ≥2 funkcjach = WARN (miękkie przypomnienia).
- **DEGRADACJA progu `min_zastosowania`**: gdy mapa niesie **≥2 FUNKCJE** i **SPEKTRUM przechodzi**
  (≥`min_swiaty` światów), niedobór wierszy `## ZASTOSOWANIA` (<`min_zastosowania`) **degraduje do
  WARN** (`min_zastosowania_degrade_severity`) — szerokość jest już dowiedziona, próg „6" mierzy
  tylko odrobienie enumeracji, nie szerokość. **Twardy FAIL zostaje TYLKO gdy SPEKTRUM nie przechodzi**
  (brak wtedy i szerokości, i enumeracji).

> **⚠️ NOTA o `nośniku szerokości (proxy)`:** ten gate potwierdza jedynie **OBECNOŚĆ ETYKIET**
> (nazwa sekcji `zastosowania` / token `spektrum`/`toggle`/`hero-sub` w kodzie/PLAN) — **NIE
> potwierdza REALNEGO niesienia szerokości** (czy sekcja faktycznie prowadzi ≥`min_swiaty` różnych
> światów, a nie 4 kafle jednej funkcji). **Egzekucja SEMANTYCZNA szerokości należy do KRYTYKA F1.7**
> (oś POKRYCIE ZASTOSOWAŃ przewodnika i rubryka makiety), **nie do proxy.** Zielone proxy ≠ szerokość
> dowieziona — to tylko brak czerwonego alarmu „zapomniałeś nazwać nośnik".

Progi = DANE w `gate-manifest.json` (tuning tam, nie w kodzie).
