# PARTIALE-PROMPTY — reużywalne bloki wstrzykiwane 1:1 do promptów generacji

> **📌 NOTA — ten plik = STATYCZNY PREFIX do prompt-cachingu (Faza 0).** Konsoliduje w jednym
> miejscu bloki-partiale, które dziś żyją jako proza rozsiana po `STANDARD-LANDING-SKLEPY.md`,
> `TOKENS-MAKIETY.md`, `GRAFIKA-Z-MAKIETY.md`, `PRZEWODNIK-GRAFICZNY.md` i są wstrzykiwane **1:1**
> do promptów makiet/scen. **Część ZMIENNA (PASZPORT konkretnego produktu, ICP konkretnej persony,
> wypełniona PARTYTURA danego landingu) NIE jest w tym pliku — doklejana jest PO prefiksie**,
> per-landing (patrz wskaźniki do SSOT przy każdym partialu).
>
> **⚠️ TEN PLIK JEST ADDYTYWNY (konsolidacja, nie autorytet).** SSOT-y wymienione przy każdym
> bloku pozostają JEDYNYM źródłem prawdy. Gdy SSOT się zmienia → zregeneruj odpowiedni blok tutaj
> (wskaźnik `@ssot` prowadzi do pliku + nagłówka + przybliżonych linii). Rozjazd między tym plikiem
> a SSOT rozstrzyga SSOT.
>
> **⛔ Bloki wyciągnięte DOSŁOWNIE — każde słowo pracuje. Nie przeredagowywać przy kopiowaniu.**

---

## 1. STYLE-DNA / akapit KANON (manifest stylu — do KAŻDEGO promptu makiety)

`@wersja` v1 · 2026-07-21 (doktryna SSOT: 2026-07-20 — podział KANON/PARTYTURA)
`@ssot` `docs/zbuduje/TOKENS-MAKIETY.md` → nagłówek **„## PRZYKŁAD WYPEŁNIONY"**, blok `## KANON`
(≈ l. 255–266); doktryna nadrzędna: **„## 🎼 KANON vs PARTYTURA"** (≈ l. 33–93) i **„KIEDY i GDZIE"**
(≈ l. 97–113). Krzyżowo: `STANDARD-LANDING-SKLEPY.md` bullet **„STYLE-DNA tekstowe w KAŻDYM prompcie"**
(≈ l. 621–624) + **„🎯 STYLE-DNA MAKIET"** (≈ l. 520–524).
`@rola` Wstrzykiwany do KAŻDEGO promptu makiety (hero, każda sekcja, każda para mobile) jako
niezmienny akapit STYLE-DNA. **Ten blok = część STATYCZNA (identyczna w każdym landingu).**
**Część ZMIENNA = `## PARTYTURA`** (oba kroje, hex akcentu, rodzina tła, filled|outline, sygnatura,
archetyp hero + jednozdaniowe uzasadnienie per pozycja) — doklejana PO tym bloku, z `TOKENS-MAKIETY.md`
per-landing (F2.5, krok `lp_styl_marka`).

```
## KANON  (przepisane 1:1 — identyczne w każdym landingu)
8pt:     8·16·24·32·48·64·96 · sekcja desktop 112 / mobile 72 · content-w 1180 · kolumna 50–75 zn.
TYPO:    ratio 1.333 · H1 desktop clamp 56–80 · H1 mobile floor 38 · body 17/1.55 · eyebrow caps 0.2em
TŁO:     jasne (wysoka jasność, niskie nasycenie, WCAG dla body) · ⛔ ciemne tła, ⛔ neon
AKCENT:  DOKŁADNIE JEDEN, scope {CTA · swash · gwiazdki ★} · ikony funkcjonalne = --ink
FONTY:   para z KONTRASTEM (display ≠ text) · ⛔ mono-font · ⛔ zimny tech jako jedyny krój
SERIA:   jeden radius · jeden styl ikon · jeden styl trust-pill (desktop == mobile)
GŁĘBIA:  cienie warstwowe CIEPŁE (key+ambient, tint sepiowy .06–.12, nie czerń) · grain 2–4%
OFERTA:  cena → CTA → redukcja ryzyka · pas zaufania · ⛔ ★/liczby opinii nad foldem
MODUŁY:  mechanika i proporcje z MODULY.md NIETYKALNE (skóra = tokeny)
SYGNATURA: musi istnieć i powtarzać się w ≥3 sekcjach
```

---

## 2. „DOKŁADNIE JEDNA SEKCJA I NIC WIĘCEJ" (anty-przeciek makiety, +10)

`@wersja` v1 · 2026-07-21 (incydent SSOT: mata/Kłujek 20.07)
`@ssot` `docs/zbuduje/STANDARD-LANDING-SKLEPY.md` → bullet **„✅ KRYTYK — CHECKLISTA STYLE-DNA"**,
pozycja **„(+ 10) 🩹 ANTI-BLEED"** (≈ l. 594–601).
`@rola` Wstrzykiwany do KAŻDEGO promptu makiety (F2/F3 generacja scen). Domyka halucynowanie
pełnego bloku hero+oferta+benefity na „lekkich" sekcjach (pas CSS, demo, akordeon, chipy) —
gdzie gpt-image zapełnia pustą kanwę, przemycając klejmy zdrowotne i zakazane materiały poza
kontrolą KARTY/PASZPORTU. **Część ZMIENNA = konkretne wykluczenia materiałów/klejmów TEGO
produktu** (z KARTA-PRAWDY / PASZPORT) — doklejana PO tej klauzuli.

```
(+ 10) 🩹 ANTI-BLEED (mata/Kłujek 20.07): makieta = DOKŁADNIE JEDNA sekcja i nic więcej.
gpt-image na „lekkich" sekcjach (pas CSS, demo, akordeon, chipy) zapełnia pustą kanwę
HALUCYNUJĄC pełny blok hero+oferta+benefity — dokleja wordmark, cenę, ★rating, chipy-korzyści.
To przemyca klejmy zdrowotne i zakazane materiały (regeneracja/sen/„len/bawełna/ABS") poza
kontrolą KARTY/PASZPORTU. Do KAŻDEGO promptu makiety: „EXACTLY ONE SECTION AND NOTHING ELSE"
+ jawny zakaz wordmark/ceny/★/benefit-chips/klejmów/nazw materiałów, jeśli nie należą do tej
sekcji. Krytyk: dorobiony element spoza sekcji = REGEN. Klejm zdrowotny / materiał sprzeczny
ze specem = REGEN bezwarunkowy (nie „uwaga-copy").
```

> **Klauzula-string do wstrzyknięcia (EN, 1:1):** `EXACTLY ONE SECTION AND NOTHING ELSE`
> + jawny zakaz wordmark/ceny/★/benefit-chips/klejmów/nazw materiałów, jeśli nie należą do tej sekcji.

---

## 3. PASZPORT wierności — cechy dyskryminujące + „CZEGO NIE MA" (anty-halucynacja)

`@wersja` v1 · 2026-07-21 (SSOT: Latarek 17.07 = PASZPORT; ZASADA NADRZĘDNA 18.07)
`@ssot` `docs/zbuduje/STANDARD-LANDING-SKLEPY.md` → **„WIERNOŚĆ PRODUKTU — 4 WARUNKI"**, warunek
**„(0) PASZPORT PRODUKTU"** (≈ l. 1042–1048); proces F3A: **„F3A — GATE WIERNOŚCI DO SKUTKU"**
(≈ l. 747–758). Reguła nadrzędna promptu: `docs/zbuduje/GRAFIKA-Z-MAKIETY.md` → **„## 4b …"**,
blok **„⛔ ZASADA NADRZĘDNA PROMPTU"** (≈ l. 182–195).
`@rola` PASZPORT (część ZMIENNA, per-produkt) wstrzykiwany do KAŻDEGO promptu z produktem —
**ale UWAGA na regułę nadrzędną niżej**: cechy paszportu służą do WERYFIKACJI po generacji (gate
F3A), a prompt NIGDY nie opisuje, JAK produkt wygląda (wygląd niesie WYŁĄCZNIE referencja `image[0]`).
Ten blok = STATYCZNA doktryna, jak paszport jest (i NIE jest) wstrzykiwany + anty-halucynacyjna
sekcja „CZEGO NIE MA". **Część ZMIENNA = sama treść PASZPORT.md danego produktu (tabela K cech,
„CZEGO NIE MA") — doklejana z `FABRYKA-*/<slug>/PASZPORT.md`.**

```
(0) PASZPORT PRODUKTU — spisany RAZ per produkt z galerii (agent vision): geometria
i proporcje liczbowo, materiały/kolory, KAŻDY element funkcjonalny z pozycją (wyświetlacz —
co dokładnie pokazuje!, przyciski, osłony, końcówki) + sekcja „CZEGO NIE MA" (archetypy,
w które model ucieka) + OBOWIĄZKOWA tabela „Cechy dyskryminujące" (K wierszy
`| Cecha | Musi być | FAIL jeśli |` — klasa produktu + elementy tożsamości; to ONA jest
checklistą gate'u F3A cecha-po-cesze i źródłem K dla `gate-check.py`). Wstrzykiwany do KAŻDEGO
promptu z produktem. Zapis: archiwum `FABRYKA-*/<slug>/PASZPORT.md`.
```

> **⛔ ZASADA NADRZĘDNA PROMPTU (feedback Tomka 18.07 — źródło losowego dryfu produktu):**
> **Prompt NIGDY nie opisuje, JAK produkt wygląda — opisuje TYLKO wizję sceny** (co się dzieje, gdzie,
> światło, emocja, kompozycja, kadr). Wygląd produktu definiuje **WYŁĄCZNIE referencja** (`image[0]`
> packshot) + prefix generate-image „Image 1 = EXACT product, reproduce unchanged, change ONLY the
> scene". Słowny opis cech w prompcie („flat thin board", „wooden edge 2-3 cm", „add black loop, NOT
> metal") **KONKURUJE z referencją i sprowadza generację na złe tory** — model interpretuje SŁOWA
> zamiast odwzorować OBRAZ, stąd „raz produkt 1:1, raz inny". Cechy paszportu służą WYŁĄCZNIE do
> WERYFIKACJI po generacji (gate F3A), **NIGDY jako tekst promptu**.

---

## 4. Typ osadzenia sceny — A `fade()` full-bleed vs B/C `fullframe()`

`@wersja` v1 · 2026-07-21 (SSOT: 2026-07-16 + incydent `prawda-d.webp` 20.07)
`@ssot` `docs/zbuduje/GRAFIKA-Z-MAKIETY.md` → **„## 1. ROZPOZNANIE WARSTW"**, blok
**„### TYP OSADZENIA SCENY"** (≈ l. 34–49); receptura promptu: **„## 3. RECEPTURY → REGEN
referencyjny"** #3/#4 (≈ l. 82–99). Krzyżowo: `STANDARD-LANDING-SKLEPY.md` F3 (**„⚠️ F3A #2 —
SENSOWNOŚĆ OSADZENIA"**, ≈ l. 757–758).
`@rola` Orzekany Z MAKIETY per scena PRZED generacją/cięciem; decyduje, czy prompt sceny dostaje
klauzulę fade (typ A) czy pełny kadr (typ B/C). **Część ZMIENNA = litera A/B/C + `#HEX` pola
treści konkretnej sceny** — doklejana per grafika.

```
| Typ osadzenia | Co widać na makiecie | Czego wymaga scena |
|---|---|---|
| A. full-bleed z copy NA scenie | tekst/karta/CTA leżą NA obrazie (hero, sekcje pełnoekranowe z napisem na zdjęciu) | strefa przejścia: pole treści „fade seamlessly into flat solid #HEX", PŁYNNE, zintegrowane ze scenografią; kod kładzie tekst na tym polu |
| B. split / kadr-w-kolumnie | scena w JEDNEJ kolumnie, copy w DRUGIEJ kolumnie na tle sekcji (obok, nie na obrazie) | PEŁNY KADR od krawędzi do krawędzi, ⛔ ZERO fade, ZERO pola na copy — kod przytnie `object-fit:cover` do swojej kolumny |
| C. slot / kafel (galeria, „gdzie", karty demo) | zdjęcie w małym prostokącie/kaflu obok innych | PEŁNY KADR kafla, ⛔ ZERO fade; ewentualny margines robi kod, nie obraz |

Reguła twarda: fade/negative-space robimy wyłącznie dla typu A. Dla B i C martwe pole
koloru = defekt (twardy prostokąt bez sensu w kolumnie — incydent `prawda-d.webp` 20.07: ~40%
kadru wylane na krem z ostrą pionową krawędzią, choć copy było w osobnej kolumnie). Przy
wątpliwości „czy copy jest NA scenie, czy obok" — sprawdź, gdzie w makiecie stoją bboxy tekstu:
wewnątrz regionu sceny = A; poza nim (inna kolumna/sekcja) = B/C.
```

> **Odwzorowanie w prompcie REGEN (1:1 z §3):**
> — **A** → `#3` strefa treści „fade seamlessly into flat solid #HEX", przejście PŁYNNE i
> zintegrowane ze scenografią, ⛔ NIGDY twardy prostokąt koloru z ostrą krawędzią; `#4` REMOVE all text/UI.
> — **B/C** → ⛔ ZERO negative space, ZERO fade — PEŁNY KADR od krawędzi do krawędzi (kod przytnie
> `object-fit:cover`); tylko `#4` REMOVE text/UI.

---

## 5. F1.7 seedy — struktura seedów (casting z ICP · anty-szew · CTA-w-kadrze)

`@wersja` v1 · 2026-07-21 (SSOT: PRZEWODNIK 17.07 + cross-landing 20.07 + anty-szew 21.07)
`@ssot` `docs/zbuduje/PRZEWODNIK-GRAFICZNY.md` → **„## SEEDY PROMPTÓW"** (≈ l. 118–123),
**„## ZAWARTOŚĆ (4 bloki)"** pkt 2 anty-szew (≈ l. 41–51) i pkt 3 KARTA SEKCJI (≈ l. 69–89),
**„WEJŚCIE — ICP…"** (≈ l. 21–25). CTA-w-kadrze: `STANDARD-LANDING-SKLEPY.md` **„(+ 11) 🎯 CTA
W KADRZE"** (≈ l. 602–607). Krzyżowo: `STANDARD-LANDING-SKLEPY.md` **„F1.7"** (≈ l. 316–332).
`@rola` Reguły budowy seeda (2–3 zd. EN per sekcja) wchodzącego do promptu makiety F2. **Część
ZMIENNA = konkretny casting z ICP §5, konkretny świat/materiał, KONKRET „avoid: …" poprzedniego
landingu, litera strony obrazu (L/P)** — doklejana per sekcja z `PRZEWODNIK-GRAFICZNY.md` danego
landingu.

**5a. Struktura seeda (SEEDY PROMPTÓW):**
```
2-3 zdania EN per sekcja; paszport doklejany OSOBNO (nie w seedzie). Zawsze:
strefa treści = miękki fade; klauzula `avoid: same world as previous section`
oraz (20.07) klauzula cross-landing: `avoid: <świat/materiał poprzedniego landingu>` —
wypisana KONKRETEM z przewodnika poprzedniego landingu (np. „avoid: warm wooden home interior,
soft morning window light" gdy poprzedni landing grał tym światem), nie ogólnikiem.
```

**5b. Casting z ICP (WEJŚCIE F0.6a):**
```
WEJŚCIE — `ICP-GRUPA-DOCELOWA.md` (STANDARD §F0.6a), gdy istnieje. Casting człowieka, świat/
wnętrze, stylizacja i rekwizyty KAŻDEJ karty sekcji (pkt 3) wyprowadza się z ICP §5 (casting)
i §3 (kontekst użycia) — bohater kadru = persona rdzeniowa ICP, sceneria = jej realne wnętrze,
ANTY-CASTING = §5. To domyka oś 5 („świat/materiał ← persona + kontekst użycia") realnym źródłem,
nie zgadywanką. Brak pliku ICP = osąd agenta jak dotąd (artefakt opcjonalny, niebramkowany).
```

**5c. Anty-szew pełnokadrowy (pkt 2, reguła rytmu):**
```
⛔ ANTY-SZEW PEŁNOKADROWY (21.07, Tomek na macie problem↔prawda: „te dwie sekcje źle wyglądają,
bo zdjęcia się łączą między sekcjami"): dwie SĄSIEDNIE sekcje z pełnokadrową sceną (typ B/C —
`fullframe`, obraz dochodzi do krawędzi sekcji) NIE MOGĄ mieć obrazu po TEJ SAMEJ stronie —
inaczej oba kadry stykają się krawędź-w-krawędź w twardy SZEW (spotęgowany, gdy sceny różnią się
światłem/skalą i gdy podziały kolumn się nie pokrywają → jeszcze schodek). Rozwiązania (w kolejności
preferencji): (1) ZIG-ZAG — obraz raz PRAWO, raz LEWO (na granicy zawsze foto↔papier, nie foto↔foto;
editorial rytm); (2) sekcja ROZDZIELAJĄCA między nimi (pasek zaufania/pełna kopia/karta na papierze —
scena kontenerowana z marginesem papieru, nie full-bleed); (3) ostatecznie jedną z nich kontenerować
(rounded card + margines papieru), by nie „bleedowała" w sąsiada. Karta sekcji (pkt 3) zapisuje STRONĘ
obrazu; przewodnik projektuje naprzemienność OD RAZU, nie łata jej w kodzie. Sekcja kontenerowana
(demo-karta, zestaw-shell, galeria) NIE liczy się jako pełnokadrowy sąsiad (papier ją izoluje).
```

**5d. CTA-w-kadrze (STANDARD +11, na makietach `hero · oferta · mid-cta · final`):**
```
(+ 11) 🎯 CTA W KADRZE (szkielet CTA, Tomek 20.07: „za mało CTA; dedykowanej sekcji nie ma;
do makiet dodać prośbę o zaprojektowane CTA"): czy makiety `hero · oferta #zamow · mid-cta · final`
mają ZAPROJEKTOWANY przycisk `.btn.cta` — kształt/kontrast/czytelna etykieta akcji, strefa pod cenę,
kolejność cena→CTA? Brak zaprojektowanego CTA na którejś z tych 4 makiet = REGEN makiety (nie
„przycisk dorobi koder" — goły re-CTA dodany w kodzie = FAIL projektowy). Sekcja mid-CTA bez CTA
w kadrze = ta sama wada, o której mówił Tomek, o krok subtelniejsza.
```

---

## Mapa: STATYCZNY PREFIX (ten plik) ↔ część ZMIENNA (doklejana PO)

| # | partial (STATYCZNY prefix — tu) | część ZMIENNA (per-landing, doklejana PO) | źródło zmiennej |
|---|---|---|---|
| 1 | akapit `## KANON` | `## PARTYTURA` (kroje, hex akcentu, rodzina tła, ikony, sygnatura, archetyp) | `TOKENS-MAKIETY.md` (F2.5) |
| 2 | „EXACTLY ONE SECTION…" + szkielet wykluczeń | konkretne materiały/klejmy TEGO produktu | KARTA-PRAWDY / PASZPORT |
| 3 | doktryna paszportu + ZASADA NADRZĘDNA + „CZEGO NIE MA" | tabela K „Cechy dyskryminujące" produktu | `PASZPORT.md` |
| 4 | tabela typów A/B/C + reguła twarda fade/fullframe | litera A/B/C + `#HEX` pola treści sceny | orzeczenie per grafika |
| 5 | reguły seeda (fade · avoid · anty-szew · CTA · casting) | casting ICP §5, świat, „avoid: …", strona L/P | `PRZEWODNIK-GRAFICZNY.md` / `ICP-GRUPA-DOCELOWA.md` |
| 6 | *(brak — MAPA jest w całości ZMIENNA)* | ZASTOSOWANIA + SPEKTRUM + PRIMARY danego produktu (co pokazać, w jakim zakresie) | `MAPA-ZASTOSOWAN.md` (F0.6b) |

> **⛔ MAPA ZASTOSOWAŃ = część ZMIENNA, doklejana PO statycznym prefiksie — NIGDY do bloku KANON.**
> Zakres zastosowań jest per-produkt (inny dla każdego landingu), więc wstawienie go do `## KANON`
> (statyczny prefiks, ten sam wszędzie) **rozbiłoby prompt-caching Fazy 0**. MAPA wchodzi tam, gdzie
> PARTYTURA/PASZPORT/ICP — jako zmienna doklejka. Konsument: brief F1 (zasięg primary/secondary),
> seedy F1.7 (pokrycie zastosowań scen), G1 kreacje (kąt = zastosowanie).
