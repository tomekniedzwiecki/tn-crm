# FUNDAMENT WIEDZY + PROJEKT PIPELINE — dobór perełki K1 (`bud-products`)

Dokument do realizacji. Część A = wiedza do wstrzyknięcia modelowi (settings). Część B = przeprojektowanie pipeline'u pod istniejący kod `bud-products` (Deno edge, OpenAI Responses + RapidAPI „Aliexpress True API").

Pliki odniesienia (absolutne):
- `c:\repos_tn\tn-crm\supabase\functions\bud-products\index.ts` (funkcja do zmiany)
- `c:\repos_tn\tn-crm\supabase\functions\_shared\bud-prompts.ts` (rejestr promptów → nowe klucze tutaj)
- `c:\repos_tn\tn-crm\docs\zbuduje\PLAN-K1-DOBOR-PRODUKTU.md` (kontrakt `ProductCandidate`, flow, czerwone flagi — Część A jest jego rozbudową, NIE zastąpieniem)

Kluczowa diagnoza obecnego kodu (dlaczego propozycje są płaskie): pipeline kończy się na `fetchAliexpressViaRapid` → search po słowie → `sort=LAST_VOLUME_DESC` → filtr ceny 60–400 zł → zwrot OD RAZU (`index.ts` linie 639–654). To jest „weź TOP po wolumenie" — czyli z definicji łapie produkty NAJDŁUŻEJ na rynku i najbardziej nasycone. Nie ma drugiej tury OpenAI, nie ma scoringu, nie ma odrzutu nudnych. To trzeba przebudować na: szeroki zaciąg → scoring OpenAI → TOP perełki.

---

## CZĘŚĆ A — PLAYBOOK „WINNING PRODUCT" (PL) + RUBRYKA SCORINGOWA

Treść poniżej (sekcje A1–A7) idzie jako jeden string do nowego klucza settings `budowanie_produkt_playbook`. Pisana jako instrukcja dla modelu w drugim tygodniu („wstrzykujemy fundament").

### A1. Definicja perełki (jeden akapit do promptu)

> Perełka to fizyczny produkt, po którym od razu widać, że warto go sprzedawać na polskim rynku przez dedykowany landing i płatny ruch (Meta/TikTok). Łączy NARAZ pięć rzeczy: (1) rozwiązuje jeden konkretny, odczuwalny problem albo daje natychmiastowy efekt „wow"; (2) da się to pokazać w 3–5 sekund wideo bez słów (before/after lub produkt „w akcji"); (3) zostawia marżę 2,5–3× kosztu, czyli realnie 70–120 zł na sztukę przed reklamą; (4) jest świeży/rosnący — łapany na wznoszącym zboczu trendu, nie na szczycie nasycenia; (5) jest lekki, niekruchy, paczkomatowy i prosty (bez rozmiarówki, baterii, montażu). Dodatkowo NIE da się go kupić w markecie obok ani tanio na Allegro/Temu w identycznej formie — bo wtedy klient nie ma powodu czekać na wysyłkę z landingu. Produkt, który nie spełnia choć jednego z punktów 1–3, NIE jest perełką, choćby się dobrze sprzedawał na AliExpress.

### A2. Twarde progi (liczby — auto-odrzut poza widełkami)

| Parametr | Próg | Uzasadnienie |
|---|---|---|
| Cena detaliczna (landing) | **80–250 zł** sweet-spot; twarde 60–300 zł | strefa impulsu w PL (do ~150 zł czysty impuls); poniżej 80 zł nie utrzyma marży + CPA; powyżej 300 zł klient „przemyśliwa" |
| Mnożnik (markup) | **≥ 2,5×**, cel 3× landed cost | poniżej 2× = auto-odrzut; marża musi pokryć CPA + zwroty + prowizje |
| Marża brutto/szt. | **≥ 70 zł**, cel 90–120 zł | musi wchłonąć CPA 20–30 zł + nieodebrane COD; PL marże są niższe niż „amerykańskie" |
| Koszt zakupu (Ali) | orientacyjnie **30–80 zł** | by zmieścić 3× w cenie 90–250 zł |
| CPA docelowe (po optymalizacji) | 20–30 zł; benchmark startowy 30–50 zł | musi się zmieścić w marży |
| AOV (cel koszyka z bundlem) | ~**200–250 zł** | średnia PL 204–247 zł — kotwica do bundle/upsell |
| Waga / gabaryt | < ~**1,4 kg**, kompaktowy, paczkomatowy | koszt wysyłki rośnie skokowo z gabarytem; Paczkomat = 83–87% preferencji |
| Trwałość | niekruchy, bez szkła/ceramiki, prosty w obsłudze | zwroty/reklamacje zjadają marżę |
| Demo wideo | korzyść czytelna w **≤ 3 s bez dźwięku** | „silent scroll test" — twardy filtr |

### A3. Rubryka scoringowa 0–100 (z wagami) — rdzeń drugiej tury OpenAI

Model ocenia każdego realnego kandydata na 7 osiach. Suma ważona = score 0–100. **Każda oś osobno ma minimum (gate) — jeden czerwony na osi krytycznej = dyskwalifikacja niezależnie od sumy.**

| # | Oś | Waga | 0 punktów (min) | Max punktów | Gate? |
|---|---|---|---|---|---|
| 1 | **Problem / WOW** | 22 | nudne commodity, „meh", znane z marketu | rozwiązuje palący problem ALBO efekt „nigdy tego nie widziałem", reakcja „co to jest?!" | TAK — <8/22 = odrzut |
| 2 | **Demonstrowalność (wideo/landing)** | 20 | nie da się pokazać efektu bez tłumaczenia słowami | wyraźny before/after lub akcja satysfakcjonująca do oglądania w 3 s | TAK — <7/20 = odrzut |
| 3 | **Marża / ekonomia** | 18 | markup <2× lub marża <70 zł lub cena poza 60–300 zł | markup ≥3×, marża 90–120 zł, cena w sweet-spocie 80–250 zł | TAK — markup<2× = odrzut |
| 4 | **Świeżość / timing (anty-nasycenie)** | 15 | klasyk od lat, plateau, „każdy to ma", fad po szczycie (pionowy spike + klif) | wznoszące zbocze, młody trend, okno otwarte, mało żyjących reklam | częściowo — patrz A5 |
| 5 | **Mass-appeal / evergreen** | 10 | mikro-nisza jednorazowa, sezon punktowy | szeroka grupa, powtarzalny popyt, cały rok | nie |
| 6 | **Dosięgalność PL (Meta/TikTok/COD)** | 8 | niesprzedawalny wideo, kategoria blokowana w reklamach, nie pasuje do COD | UGC-friendly, łatwy hook, działa na TikTok/Reels, działa z BLIK+COD | nie |
| 7 | **Logistyka** | 7 | ciężki/kruchy/duży/wymaga montażu/rozmiarówki | lekki, paczkomatowy, niekruchy, plug-and-use | TAK — kruchy/rozmiarówka = odrzut |

**Reguła progowa:** kandydat trafia do TOP tylko gdy `score ≥ 70` **i** wszystkie osie-gate spełnione. Model sortuje malejąco i zwraca TOP 5–6. Jeśli mniej niż 5 przekroczy 70 — zwróć ile jest (min. 3), nie naciągaj słabych.

**Definicja „co daje 0, co daje max" dla modelu (wstrzyknąć dosłownie):**
- Problem/WOW: 0 = „ładny pojemnik" / „kolejny organizer"; max = „lampka projektująca zachód słońca na ścianę", „odplamiacz z natychmiastowym efektem na oczach".
- Demonstrowalność: 0 = suplement / coś, czego działania nie widać; max = produkt, którego efekt rozsadza pierwsze 3 s klipu.
- Marża: 0 = sprzedasz za 49 zł, kosztuje 35 zł; max = kupujesz za 35 zł, sprzedajesz za 120 zł i nie wygląda tanio.
- Świeżość: 0 = fidget spinner / klasyk z 2019; max = produkt, który dopiero wchodzi, reklamy konkurencji młode i nieliczne.

### A4. Czerwone flagi — twardy odrzut (model NIE proponuje)

- markup < 2× lub cena detaliczna < ~80 zł (ekonomia się nie spina przy paid + COD),
- odzież z rozmiarówką / obuwie / bielizna (zwroty),
- szkło / ceramika / produkty kruche w transporcie Ali→PL,
- tania elektronika BT / skomplikowana elektronika (RMA, oczekiwania jakościowe),
- suplementy / produkty medyczne / regulowane / broń / chemia (demo + prawo + blokady reklam),
- trademark / podróbki / licencje,
- wielkogabarytowy / ciężki / wymagający montażu lub baterii „w komplecie",
- niedemonstrowalny w 3 s (oblewa silent scroll test) — nawet przy dobrej marży,
- commodity dostępne w dziesiątkach identycznych ofert na Allegro lub tanio na Temu/Shein (wojna cenowa),
- dosłowny klon nasyconego rynku BEZ własnego kąta (uwaga: sama konkurencja ≠ flaga — patrz A5).

### A5. Sygnały NASYCENIA / „za długo na rynku" — jak wykryć i jak preferować świeże

Ważna zasada (z researchu): **liczba sprzedawców sama w sobie NIE dyskwalifikuje** (korelacja konkurencja↔marża ≈ 0). Dyskwalifikuje: cienka marża + brak wow + identyczne kreacje. Dlatego model ma czytać KSZTAŁT i TEMPO, nie sam licznik.

Sygnały, że produkt jest świeży/rosnący (PREFEROWAĆ):
- trend rosnący/stabilny przez 3–6 mies. (łagodne zbocze, nie pionowy skok),
- reklamy konkurencji młode i RÓŻNORODNE (różne hooki, 5–20 aktywnych), nie 50+ kopiuj-wklej,
- mała/umiarkowana liczba sprzedawców i wolne tempo przyrostu,
- na AliExpress: wysoka ocena (≥4,5) + rosnący, ale nie astronomiczny wolumen.

Sygnały NASYCENIA / schyłku (KARAĆ na osi 4, przy ekstremach odrzucać):
- bardzo wysoki `lastest_volume` przy starym, „klasycznym" produkcie = rynek dojrzały, wszyscy to mają,
- trend płaski/spadkowy w oknie wielomiesięcznym,
- fad: pojedynczy pionowy spike + klif (chwilowa moda),
- „każdy dropshipper to pokazywał" / produkt z list bestsellerów spy-tooli (okno zamknięte),
- 50+ identycznych reklam / 80–150+ identycznych ofert / przyrost sprzedawców 30%+/tydz.

**Operacjonalizacja w danych, które MAMY** (bez nowych integracji):
- `lastest_volume` z RapidAPI: traktuj jako **proxy dojrzałości, nie jakości**. Bardzo wysoki wolumen przy generycznym produkcie = sygnał NASYCENIA (kara na osi 4), NIE plus. Sweet-spot = produkt z realnym, ale umiarkowanym wolumenem + wysoką oceną.
- `evaluate_rate` ≥ 4,5 = zdrowy sygnał jakości (niski return risk, oś 1/7).
- `web_search` w drugiej turze (opcjonalnie, patrz B3): model sprawdza świeżość trendu i gęstość reklam dla TOP kandydatów — to zamienia „wolumen" na realny sygnał timingu.

### A6. Specyfika PL (zł, COD, Allegro, kanały, co flopuje)

- **Cena w zł, impuls do ~150 zł**, akceptowalnie do ~250 zł. Nie myśleć w USD przy ocenie pod klienta.
- **BLIK to główna metoda (lider), COD jest drugorzędny i malejący**, ale podnosi konwersję u nowej marki (zdejmuje ryzyko pierwszego zakupu). Landing pod perełkę = BLIK + szybki przelew + COD jako opcja. Produkt musi pasować do COD (tani support, niski return, by nieodebrane paczki nie zabiły marży).
- **Paczkomat InPost = domyślna dostawa** (83–87% preferencji). Produkt musi być paczkomatowy.
- **Allegro vs landing:** perełkę pod paid social sprzedajemy na dedykowanym landingu (0% prowizji, kontrola marki/WOW), nie na Allegro (prowizja + wojna cenowa spłaszcza WOW). Przewaga w PL = marketing + landing + UGC, NIE cena.
- **Kanały:** TikTok Ads w PL 2–5× tańszy niż Meta (CPM 8–30 zł vs ~37 zł) — produkt demonstrowalny wideo + TikTok = najtańszy zasięg. Spark Ads/UGC sprzedają lepiej niż opis.
- **Co flopuje w PL:** odzież/obuwie (zwroty, przesycenie), zegarki (skrajnie nasycone), ogólna elektronika, generyczny tani towar (przegrywa z Temu — 66% udziału w odwiedzinach zakupowych). Konkurowanie ceną = przegrana.
- **Nisze z potencjałem:** dom/kuchnia (efekt wow/oszczędność czasu), zwierzęta, uroda/kosmetyk-gadżet, fitness, auto-akcesoria, biuro/home-office, eko, dziecko, biżuteria (lekka, zerowe zwroty), akcesoria GSM.

### A7. Copy bez żargonu dla klienta AWE (etatowiec) — słownik tłumaczeń

Model NIGDY nie pokazuje klientowi słów: winning product, markup, CAC/CPA, saturacja, ROAS, unit economics, scroll-stop, demand validation. Tłumaczy na ludzki:

| Pojęcie wewnętrzne | Co mówimy klientowi |
|---|---|
| winning product / wysoki score | „produkt, po którym od razu widać, że się sprzeda" |
| markup ≥3× / wysoka marża | „zarabiasz 2–3× tego, co za niego płacisz" |
| demonstrowalność / scroll-stop | „świetnie wygląda na krótkim filmiku — zatrzymuje przewijanie" |
| rozwiązuje problem | „ludzie realnie tego potrzebują, nie kupują z nudów" |
| niska saturacja / świeży | „jeszcze nie każdy to sprzedaje — łapiemy to na fali wzrostu" |
| nasycony / za długo na rynku | „tego jest już wszędzie pełno, marże spadły" |
| paczkomatowy / lekki | „tani i łatwy w wysyłce — wchodzi do paczkomatu" |
| retail unavailability | „nie kupisz tego w markecie obok" |
| sygnał popytu (volume) | „ludzie już masowo to zamawiają" |

---

## CZĘŚĆ B — PROJEKT PIPELINE `bud-products` (wielostopniowy)

Nowy flow zastępuje obecne „search → TOP po wolumenie → zwróć". Trzy etapy: **szeroki zaciąg konceptów → realne produkty z Ali → re-analiza/scoring OpenAI**. Diagram:

```
[input: kategoria, budzet, styl, wyklucz]
      │
ETAP 1  OpenAI (gpt-5.1, JSON)  ── 1 call ──> 15–20 angielskich konceptów produktowych (nie generycznych)
      │
ETAP 2  RapidAPI /api/v3/products  ── N calls ──> 20–40 realnych kandydatów (tytuł, cena USD, obraz, volume, rate, kategoria, link)
      │   (opc.) hot-products-download per category_id ── M calls ──> realny lastest_volume gdy search daje 0
      │
ETAP 3  OpenAI (gpt-5.5, JSON)  ── 1 call ──> scoring 0–100 wg rubryki A3, odrzut słabych/nasyconych, TOP 5–6 perełek
      │   (opc.) web_search dla TOP — walidacja świeżości trendu
      ▼
[items: ProductCandidate[] wzbogacone o score, problem, kąt WOW, pomysł na landing]
```

### B1. ETAP 1 — OpenAI: zrozum klienta + wygeneruj szeroko (15–20 konceptów)

Zamiast obecnego `deriveKeywordsEN` (6 fraz, gpt-5.1, `reasoning_effort: low`, generyczne) — nowy, mocniejszy generator konceptów. Model dostaje **playbook A wstrzyknięty** i ma wygenerować 15–20 RÓŻNYCH angielskich haseł wyszukiwania nakierowanych na perełki, nie generyczne kategorie.

- **Model:** gpt-5.1 (tani, JSON mode), `reasoning_effort: 'medium'` (nie low — chcemy pomysłowości, nie listy słów),
- **Wejście:** `kategoria`, `budzet`, `styl`, `wyklucz[]` + fundament z `budowanie_produkt_playbook` (sekcje A1, A4, A6 — definicja perełki, czerwone flagi, co flopuje w PL),
- **Wyjście (JSON mode):** `{"koncepty":[{"en":"sunset projection lamp","nisza":"dekoracja/nastrój","problem_wow":"efekt wow w pokoju w 3 s"}, ...]}` — 15–20 pozycji,
- **Klucz settings:** `budowanie_produkt_keywordgen` (nowy).

Szkic system-promptu (do `budowanie_produkt_keywordgen`):

> Jesteś łowcą perełek e-commerce pod rynek polski (dropshipping + dedykowany landing + reklamy TikTok/Meta). Z kategorii/zainteresowań klienta wygeneruj 15–20 RÓŻNYCH, KONKRETNYCH angielskich fraz wyszukiwania na AliExpress — każda to inny produkt-perełka, nie generyczna kategoria. Kieruj się definicją perełki i czerwonymi flagami [PLAYBOOK]. Każda fraza ma celować w produkt, który: rozwiązuje konkretny problem ALBO daje efekt wow, da się pokazać w 3 s wideo, zmieści się w 80–250 zł detalu po markupie 3×, jest lekki i paczkomatowy. UNIKAJ: generycznych haseł („kitchen gadget", „pet accessories"), odzieży z rozmiarówką, szkła, elektroniki BT, suplementów, produktów masowo dostępnych w marketach/na Temu. Preferuj świeże/rosnące koncepty nad klasyki. Frazy 2–4 słowa, realne hasła wyszukiwarki AliExpress (po angielsku). Pomiń wszystko z listy „już pokazane". Zwróć WYŁĄCZNIE JSON: `{"koncepty":[{"en":"...","nisza":"...","problem_wow":"..."}]}`.

Dlaczego 15–20, nie 6: drugiej turze scoringu trzeba dać z czego wybierać. Z 6 fraz × 1–2 produkty = max ~10 kandydatów, w tym duplikaty — to za mało, by odrzucić nudne i zostawić 5 perełek. 15–20 konceptów → 20–40 realnych produktów → realna selekcja.

### B2. ETAP 2 — AliExpress (RapidAPI): pobierz realne produkty + sygnał świeżości

Rozszerzenie obecnego `fetchAliexpressViaRapid`. Cel: ~20–40 realnych kandydatów z obrazem/ceną/sygnałem.

- **Ile fraz odpytać:** nie wszystkie 15–20 (limit RapidAPI + latencja). Weź **8–10 najlepszych konceptów** (model w ETAP 1 może je uszeregować polem `priorytet`, albo bierzemy pierwsze 8–10). 1 request na frazę, `page_size=5`. To **8–10 calli RapidAPI** (vs obecne 6).
- **Które pola brać** (już mapowane w `mapRapidProduct`, `index.ts` 472–511): `product_title`, `product_main_image_url`, `target_sale_price` (USD→PLN = KOSZT), `lastest_volume`, `evaluate_rate`, `second_level_category_name`/`first_level_category_name`, `product_id`, `promotion_link`/`product_detail_url`. Dodatkowo zachować `category_id` (do ewentualnego hot-products-download).
- **Z każdej frazy bierz TOP 3–4** (nie 1–2 jak teraz) — szerszy zaciąg do scoringu. Dedup po `product_id` + tytule (jak teraz).
- **NIE filtrować twardo ceną na tym etapie** poza skrajnościami (np. <40 zł lub >500 zł detalu). Obecny filtr sweet-spot 60–400 zł przenosi się do scoringu OpenAI (oś 3) — backend ma zebrać szeroko, model ma ocenić. To naprawia obecny problem „za wczesnego odsiewu".
- **NIE sortować po `LAST_VOLUME_DESC` jako jedynym kluczu** — to systematycznie łapie najbardziej nasycone. Zostaw sort w API (daje produkty z realnym popytem), ale różnorodność niszową rób przez wiele fraz (już jest), a finalny wybór oddaj scoringowi.

**Sygnał wolumenu / świeżości — `lastest_volume` w search bywa 0:**
- `/api/v3/products` często zwraca `lastest_volume = 0` (znane ograniczenie search).
- `hot-products-download` po `category_id` zwraca realny `lastest_volume`. **Rekomendacja MVP: NIE wołać hot-products dla każdego kandydata** (M dodatkowych calli = palenie limitu RapidAPI). Zamiast tego:
  - jeśli `lastest_volume > 0` w search → użyj jako sygnału (kara/nagroda na osi 4 wg A5),
  - jeśli `0` → przekaż do ETAP 3 z flagą `volume_unknown:true`; model nie karze za brak wolumenu (zgodnie z notatką w pamięci: „lastest_volume=0 jest NIEMIARODAJNY"), tylko ocenia jakościowo + opcjonalnie web_search.
  - **Opcja PRO (decyzja Tomka, B6):** po scoringu, dla samych TOP 5–6, dociągnąć realny `lastest_volume` przez hot-products-download po ich `category_id` (tylko 1–2 calle, bo TOP-y wpadają w kilka kategorii). To daje twardy „ludzie masowo zamawiają" do karty bez palenia limitu.

Wyjście ETAP 2: tablica ~20–40 obiektów `{id, nazwa(EN/oryginalna), est_koszt_zakupu, est_cena_detaliczna_pl, image, ref_url, kategoria, lastest_volume, evaluate_rate, volume_unknown, koncept_nisza}`.

### B3. ETAP 3 — OpenAI: RE-ANALIZA / SCORING → TOP 5–6 perełek

To jest brakujący „wróć do OpenAI z ~20 propozycjami i przeanalizuj jeszcze raz". Wysyłamy realnych kandydatów (tytuły + ceny + wolumen + ocena + kategoria) i każemy ocenić wg rubryki A3.

- **Model:** gpt-5.5 (mózg + jakość; spójnie z `BUD_PRODUCTS_MODEL`),
- **Wejście:** playbook A (cały — A3 rubryka + A4 flagi + A5 nasycenie + A7 słownik) + lista ~20–40 kandydatów jako JSON,
- **Tryb:** `response_format: json_object` (Chat Completions) ALBO Responses API. **Web_search opcjonalnie** — patrz niżej,
- **Klucz settings:** `budowanie_produkt_scoring` (nowy).

**Decyzja web_search w ETAP 3:** dwa warianty.
- **Wariant A (tańszy, MVP):** scoring BEZ web_search — model ocenia z samych danych Ali (tytuł, cena, volume, rate, kategoria) + swojej wiedzy. 1 call, ~5–8 s. Wystarcza, bo świeżość proxy'ujemy przez `lastest_volume` + jakościową ocenę.
- **Wariant B (mocniejszy, „jak guru"):** scoring z web_search ograniczonym do `max_tool_calls: 2` — model dla 2–3 najlepiej rokujących sprawdza świeżość trendu / gęstość reklam (Meta Ad Library PL, TikTok). +0,02 USD, +10–15 s. **Rekomendacja: start Wariant A, włącz B flagą `BUD_PRODUCTS_SCORING_WEBSEARCH`** gdy Tomek chce wyższą jakość kosztem latencji.

Szkic system-promptu (do `budowanie_produkt_scoring`):

> [PLAYBOOK — wstrzyknięty: A3 rubryka z wagami, A4 czerwone flagi, A5 sygnały nasycenia, A7 słownik bez żargonu]
> Dostajesz listę REALNYCH produktów z AliExpress (tytuł, koszt zakupu w zł, szacowana cena detaliczna w zł, liczba zamówień, ocena, kategoria). Twoje zadanie: oceń KAŻDY wg rubryki 7 osi (0–100), zastosuj gate'y (jeden czerwony na osi krytycznej = odrzut, score=0), ODRZUĆ produkty nudne, commodity, nasycone (bardzo wysoki wolumen przy generycznym produkcie = sygnał nasycenia, nie plus), kruche, z rozmiarówką, o markupie <2×. Wyłoń TOP 5–6 PEREŁEK (score ≥70, posortowane malejąco). Jeśli mniej niż 5 przekroczy 70 — zwróć tyle ile jest (min. 3), NIE naciągaj słabych do liczby.
> Dla każdej perełki zwróć: spolszczoną nazwę handlową (nie surowy tytuł Ali), problem który rozwiązuje (jedno zdanie), kąt WOW (co zatrzymuje scroll), dlaczego sprzeda się w PL (impuls/cena/grupa), pomysł na hook landingu/wideo (1 zdanie), score (0–100) + krótkie uzasadnienie per oś. Opisy klientowi pisz BEZ żargonu (słownik A7). Zwróć WYŁĄCZNIE JSON wg kontraktu.

**Kontrakt JSON wyjścia ETAP 3** (rozszerza `ProductCandidate` o pola scoringowe; backend mapuje z powrotem na `ProductCandidate` dla front/`bud-chat`):

```json
{
  "perelki": [
    {
      "id": "rapid-1005006...",            // PRZENIEŚ z kandydata wejściowego (linkowanie do obrazu/linku/ceny)
      "nazwa": "Lampka projekcyjna Zachód Słońca",
      "opis_1zd": "Rzuca na ścianę realistyczny zachód słońca — pokój zmienia klimat w 3 sekundy.",
      "czemu_sie_sprzedaje": "Efekt wow widać od razu na filmiku, ludzie już masowo to zamawiają, a w markecie tego nie kupisz.",
      "problem_wow": "natychmiastowy nastrój/dekoracja bez remontu",
      "kat_wow": "before/after ciemnego pokoju w 3 s",
      "dlaczego_pl": "cena impulsowa ~120 zł, szeroka grupa (młodzi, pary, dekoracja), świetne na TikTok",
      "pomysl_landing": "hero = wideo ciemny pokój → zachód słońca na ścianie",
      "est_koszt_zakupu": 38,
      "est_cena_detaliczna_pl": 119,
      "est_marza_zl": 81,
      "sygnal_popytu": "ponad 8000 zamówień, ocena 4.8",
      "kategoria": "Oświetlenie dekoracyjne",
      "ref_url": "https://...",
      "image": "https://...",                // PRZENIEŚ z kandydata (model NIE generuje URL)
      "score": 86,
      "score_osie": {"problem_wow":19,"demo":18,"marza":16,"swiezosc":12,"mass":9,"pl":7,"logistyka":5},
      "najmocniejszy": true
    }
  ]
}
```

**KRYTYCZNE dla mapowania:** model musi PRZENIEŚĆ `id`, `image`, `ref_url`, `est_koszt_zakupu`, `est_cena_detaliczna_pl` z kandydata wejściowego (nie wymyślać URL ani cen — to dane z Ali). Backend po scoringu robi join po `id` z listą z ETAP 2, by mieć pewne `image`/`ref_url`/ceny, a od modelu bierze tylko warstwę „inteligentną" (nazwa PL, problem, kąt, score). To zabezpiecza przed halucynacją linków/obrazów. Następnie `normalizeCandidate` (już istnieje) domyka kontrakt `ProductCandidate` i gwarantuje dokładnie jeden `najmocniejszy`.

### B4. Koszt / latencja / limity / cache

**Koszt per uruchomienie (jeden zestaw propozycji):**
| Etap | Zasób | Ilość | Koszt |
|---|---|---|---|
| 1 keywordgen | gpt-5.1, ~800 in / ~600 out tok. | 1 call | ~$0.007 |
| 2 search | RapidAPI /api/v3/products | 8–10 calli | wg planu RapidAPI (kwota/mies., nie per-call) |
| 2 (opc.) hot-products | RapidAPI, dla TOP | 1–2 calle | jw. |
| 3 scoring | gpt-5.5, ~3–4k in / ~2k out tok. | 1 call | ~$0.075 |
| 3 (opc.) web_search | Responses, max 2 | 0–2 | +$0.02 |
| **Razem OpenAI** | | **2–3 calle** | **~$0.08–0.10** |

To ~0,35–0,40 zł za zestaw propozycji — akceptowalne (sparing K1 jest darmowy w 1. rozmowie). Loguj jak teraz do `bud_usage` kind `products`, ale rozbij na dwa wpisy (keywordgen + scoring) albo jeden zbiorczy z `meta.stages`.

**Latencja:** ETAP 1 ~3 s + ETAP 2 8–10 calli sekwencyjnie ~10–15 s (lub **równolegle `Promise.all` → ~3–4 s**, zalecane) + ETAP 3 ~6–8 s (Wariant A) lub ~15 s (Wariant B z web_search). **Cel < 20 s** → ETAP 2 MUSI być równoległy (obecny kod robi pętlę sekwencyjną — przerobić na `Promise.allSettled`). To największa wygrana czasowa.

**Limit RapidAPI:** „Aliexpress True API" ma limit miesięczny (kwota requestów). Obecnie 6 calli/zestaw; nowy = 8–10 (+1–2 hot-products). Zabezpieczenia:
- **Cache fraza→produkty** w tabeli (np. `bud_product_cache(keyword, products_json, fetched_at)`) z TTL 24–48 h. Te same nisze (dom/kuchnia, zwierzęta) powtarzają się między klientami — cache tnie RapidAPI dramatycznie.
- **Cap calli per request** (env `BUD_PRODUCTS_MAX_RAPID_CALLS`, default 10).
- Przy „pokaż inne" (paginacja) — najpierw serwuj z bufora kandydatów z ETAP 2/3 (zwracaj 5, trzymaj resztę jak teraz w `product_input.kandydaci`), a dopiero po wyczerpaniu bufora rób kolejny zaciąg. To zerowy koszt na 2–3 rundy „pokaż inne".

**OpenAI limity:** retry już jest (`openaiFetchRetry`, `rapidSearch` ma 1 retry). Dla ETAP 1/3 dołożyć ten sam wzorzec retry+timeout (zgodnie z notatką „odporność na blipy OpenAI").

### B5. Co zmienić w kodzie `bud-products`

Pliki i punkty zmian (`c:\repos_tn\tn-crm\supabase\functions\bud-products\index.ts`):

1. **`deriveKeywordsEN` (520–539) → rozbudować do ETAP 1**: 15–20 konceptów zamiast 6 fraz, `reasoning_effort: 'medium'`, czyta `budowanie_produkt_keywordgen` z settings (nie hardcode promptu w `sys`). Zwraca `{koncepty[]}` z polami `en/nisza/problem_wow`.
2. **`fetchAliexpressViaRapid` (541–597) → ETAP 2**: odpytuje 8–10 konceptów **równolegle** (`Promise.allSettled`), `page_size=5`, TOP 3–4/frazę, **zdejmuje twardy filtr sweet-spot 60–400** (zostają tylko skrajności <40/>500), zachowuje `category_id`, `lastest_volume`, `evaluate_rate`, `volume_unknown`. Zwraca ~20–40 kandydatów (NIE 6).
3. **Nowa funkcja `scoreCandidates(kandydaci, zadanie)` → ETAP 3**: 1 call gpt-5.5, czyta `budowanie_produkt_scoring` + `budowanie_produkt_playbook`, JSON mode, zwraca `{perelki[]}`. Join po `id` z listą wejściową (pewne `image`/`ref_url`/ceny). Opcjonalny web_search za flagą.
4. **Handler `Deno.serve` (635–675)**: ŚCIEŻKA 0 zmienia się z „zwróć rapid od razu" na **ETAP 1 → ETAP 2 → ETAP 3**. Obecny early-return po `fetchAliexpressViaRapid` (642–649) USUNĄĆ — teraz wynik ETAP 2 leci do scoringu, dopiero ETAP 3 zwraca `items`. Zachować fallback: jeśli ETAP 3 padnie, zwróć top-N z ETAP 2 (degradacja, lepsza niż 502). Jeśli RapidAPI niedostępny → istniejąca ścieżka web_search (677+) zostaje nietknięta.
5. **`logRapidUsage` (236–248)**: rozszerzyć `meta` o `stages: {keywordgen_calls, rapid_calls, scoring_call, websearch_calls}` i realny `cost_usd` (teraz 0 — ale ETAP 1/3 kosztują OpenAI; policz jak `logCost`).
6. **Cache (opcjonalnie, B4)**: nowa tabela `bud_product_cache` + odczyt/zapis w ETAP 2.

Nowe klucze settings — dopisać do `c:\repos_tn\tn-crm\supabase\functions\_shared\bud-prompts.ts` (BUD_PROMPTS) i zseedować:

```ts
{ key: 'budowanie_produkt_playbook', label: 'Dobór produktu — playbook „winning product" (PL)', group: 'Deliverables — generatory', stage: '1', editable: true, min: 800, max: 12000, note: 'Fundament wiedzy K1: definicja perełki, progi, rubryka scoringowa 7 osi, czerwone flagi, nasycenie, specyfika PL, słownik bez żargonu. Wstrzykiwany do keywordgen i scoringu.' },
{ key: 'budowanie_produkt_keywordgen', label: 'Dobór produktu — generator konceptów (ETAP 1)', group: 'Deliverables — generatory', stage: '1', editable: true, min: 300, max: 6000, note: 'Z niszy klienta → 15–20 angielskich konceptów-perełek. JSON {koncepty[]}. Czyta bud-products ETAP 1.' },
{ key: 'budowanie_produkt_scoring', label: 'Dobór produktu — scoring/re-analiza (ETAP 3)', group: 'Deliverables — generatory', stage: '1', editable: true, min: 800, max: 12000, note: 'Ocenia realnych kandydatów wg rubryki 7 osi, odrzuca słabe/nasycone, zwraca TOP 5–6 perełek. JSON {perelki[]}. Czyta bud-products ETAP 3.' },
```

Obecny `budowanie_prompt_products_system` (linia 59 rejestru) zostaje jako prompt **ścieżki fallback web_search** (gdy RapidAPI niedostępny) — nie usuwać, to bezpiecznik.

Wstrzyknięcie playbooku: w ETAP 1 i ETAP 3 doklej `budowanie_produkt_playbook` przed właściwym promptem (jak `SYSTEM_PROMPT + '\n\n' + buildUser`, linia 693). Jeden playbook, dwa miejsca użycia — single-source zgodnie z konwencją rejestru.

### B6. Otwarte decyzje dla Tomka

1. **Ile konceptów / calli RapidAPI** — proponuję 15–20 konceptów (ETAP 1) → odpytać 8–10 (ETAP 2). Więcej = lepsza selekcja, ale szybciej zjada limit RapidAPI. Akceptujesz 8–10 calli/zestaw (vs obecne 6), czy trzymać 6?
2. **hot-products-download dla realnego wolumenu** — wołać dla TOP 5–6 po scoringu (1–2 calle, twardy sygnał „masowo zamawiają" do karty), czy zostawić sam `lastest_volume` z search + ocenę jakościową? (Rekomendacja: TAK dla TOP, bo to perełki które klient zobaczy.)
3. **web_search w scoringu (Wariant B)** — domyślnie OFF (taniej/szybciej) z flagą `BUD_PRODUCTS_SCORING_WEBSEARCH`, czy od razu ON dla maksymalnej jakości („jak guru")? Koszt +0,02 USD i +~10 s.
4. **Cache fraza→produkty** — wdrażamy tabelę `bud_product_cache` (TTL 24–48 h) od razu (oszczędność RapidAPI), czy w drugim kroku po pomiarze zużycia limitu?
5. **Próg score do TOP** — 70/100 (proponowany). Wyżej = mniej, ale mocniejsze perełki (ryzyko <5 propozycji); niżej = pełna piątka, ale mniej „oczywistych". Trzymać 70?
6. **Model scoringu** — gpt-5.5 (jakość). Zgoda na koszt ~0,08–0,10 USD/zestaw, czy testowo gpt-5.1 dla scoringu (taniej, ryzyko słabszej selekcji)?
7. **Co przy <3 perełkach po scoringu** — auto-poszerzyć (dociągnąć kolejne koncepty z ETAP 1 + jeszcze jeden zaciąg RapidAPI, +latencja/koszt), czy zwrócić ile jest i pozwolić „pokaż inne"? (Rekomendacja: zwróć ile jest, „pokaż inne" dociąga.)

---

Podsumowanie różnicy vs dziś: obecnie `bud-products` zwraca surowy TOP-po-wolumenie z AliExpress (linie 639–654) — czyli najbardziej nasycone, bez oceny problem/WOW/marża/świeżość. Po zmianie: szeroki inteligentny zaciąg konceptów (ETAP 1) → realne produkty (ETAP 2) → druga tura OpenAI ze scoringiem 7-osiowym i odrzutem nudnych/nasyconych (ETAP 3) → TOP 5–6 perełek z problemem, kątem WOW i pomysłem na landing. Cała wiedza sterująca = jeden playbook w settings (`budowanie_produkt_playbook`), wstrzykiwany do obu calli OpenAI, edytowalny z panelu „Źródło prawdy" zgodnie z istniejącą konwencją rejestru `bud-prompts.ts`.
