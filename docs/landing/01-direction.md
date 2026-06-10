# ETAP 1 — DIRECTION: audyt + manifesto + baseline decision (OBOWIĄZKOWY)

> **Safety rules:** [`reference/safety.md`](reference/safety.md) — zasady bezwarunkowe, obowiązują niezależnie od kierunku.

## Kiedy uruchomić

Po ETAP 0 (walidacja danych Supabase). **PRZED jakąkolwiek linią HTML.**

## Dlaczego tu, a nie później

Historycznie (do 2026-04) ten etap był „2.5" — uruchamiany PO wygenerowaniu HTML. Efekt: Claude wybierał baseline z tabeli 6 presetów bez audytu produktu, a manifesto było „poprawkowaczem po fakcie". To powodowało dryf kierunku (Editorial↔Panoramic Calm) bez danych workflow.

**Obecnie:** manifesto PRZED HTML = baseline jest **skutkiem** audytu, nie zgadywanką z tabeli. Patrz [`CHANGELOG.md`](CHANGELOG.md).

## Input

- UUID workflow z walidacji ETAP 0
- `brand_info` z `workflow_branding` (Supabase)
- `report_pdf` z `workflow_reports` (strategiczny — persony, pain points)
- `workflow_products` (opcjonalnie — jeśli brak, dedukcja z brand_info)

## Output

- `landing-pages/[slug]/_brief.md` — **commitowany** (persystentny brief projektu)
- Decyzja `MODE=forge` — ZAWSZE (kopiowanie baseline usunięte w v3.1, memory feedback-landing-always-forge.md)
- `bash scripts/verify-brief.sh [slug]` exit 0 (wymagane do przejścia do ETAP 2)

---

## Zasada fundamentalna

**NIE PYTAJ użytkownika o kierunek.** Autonomicznie pobierz dane z Supabase i zdecyduj sam. Jeśli brak danych → zgadnij na podstawie kategorii produktu i tagline, potem zapisz w manifesto dlaczego.

Manifesto to **kontrakt z samym sobą**. Jeśli nie umiesz go napisać w 5 linijkach — nie wiesz co robisz. Wróć do raportu PDF.

---

## Krok 1 — Audyt produktu (5 pytań, autoresearch)

Odpowiedz na każde pytanie **po pobraniu danych**, nie z głowy. Źródła: `workflow_branding` (brand_info), `workflow_reports` (report_pdf), `workflow_products`, mockupy.

### 1.1 Kategoria podwójna
- **Funkcjonalna** (co robi): np. „robot do mycia okien", „parownica ręczna", „podkład pod dziecko"
- **Emocjonalna** (co DAJE klientowi): **spokój / status / kontrola / zabawa / ulga / identyfikacja**

> Kierunek wizualny odpowiada kategorii EMOCJONALNEJ, nie funkcjonalnej. Robot do okien może sprzedawać „kontrolę" (tech minimalism) ALBO „wolny weekend" (lifestyle warm) — to dwa różne landingi.

### 1.2 Persona główna z raportu PDF
Skopiuj z sekcji „Grupa docelowa" raportu dosłownie:
- Wiek
- Płeć / sytuacja rodzinna
- Zawód / dochód
- **Inspiracje wizualne** (jeśli raport ich nie podaje — dedukuj: „30-letnia HR-owka z Warszawy, capsule wardrobe" → Cos, Arket, Kinfolk magazine; „45-letni przedsiębiorca, SUV, domek pod Warszawą" → Mercedes, Rolex marketing, Wine Spectator)

### 1.3 Price point i pozycjonowanie cenowe
- Budget (< 300 zł) → energia, zabawa, kolory nasycone
- Mid (300–1000 zł) → czystość, przestrzeń, jeden odważny akcent
- Premium (1000–3000 zł) → powaga, edytorialność, rzadki akcent złota/mosiądzu
- Luxury (> 3000 zł) → cisza, dużo pustego miejsca, Didone / Didot, subtelność

### 1.4 Moment i częstotliwość użycia
- **Codzienność** → ergonomia, jasne ikony, prostota
- **Rytuał tygodniowy** → okazja, estetyka „vibu" (np. niedzielne sprzątanie, wieczorny masaż)
- **Okazja / prezent** → dramatyzm, unboxing, storytelling

### 1.5 Od czego uciekać (anty-referencje)
- **Bezpośredni konkurenci** (wpisz 3 marki) — ich estetyka = czego Twój landing NIE może przypominać
- **AI-slop patterns** (zawsze unikaj): purple-to-blue gradient, checkmark ✓ tabele, neon glow orbs na wszystkim, generic bento z identycznymi kartami, border-left: 4px solid

### 1.6 — VOC: język klienta z realnych opinii (v5.0)

> Audyt produktu bez tego kroku to **zamknięty obieg AI**: persona z report_pdf, który sam
> jest outputem LLM. VOC = jedyny zewnętrzny sygnał rynkowy w pipeline. Research
> (Copyhackers/CXL): copy „ukradzione" z języka klientów bije wymyślone, bo brzmi jak
> myśli czytelnika.

**Źródła w kolejności (krok WARUNKOWY z jawnym fallbackiem):**
1. **`workflow_reviews`** — jeśli `count > 0` dla workflow (przypadek regeneracji po Etapie 5)
2. **Opinie AliExpress** — jednorazowy read-only fetch z `feedback.aliexpress.com/pc/searchEvaluation.do`
   po `workflow_products.source_url` (procedura i pułapki jak w ETAP 5/Krok 2 w workflow.html).
   NIE zapisuj do workflow_reviews — to robi Etap 5.
3. **Brak source_url / fetch fail / <5 użytecznych opinii** → wpisz w sekcji briefu jedną linię
   `VOC: BRAK DANYCH — [powód]` i kontynuuj pipeline (zero STOP).

**Z opinii wyciągnij 5-15 DOSŁOWNYCH fraz** do `_brief.md` sekcji „Język klienta (VOC)",
w trzech koszykach: **pain / benefit / obiekcje**. Wypełniaj TYLKO koszyki, na które są
realne frazy (pain w opiniach marketplace często nie istnieje — NIE fabrykuj).

**TWARDY FILTR:** odrzucaj frazy o dostawie / wysyłce / paczce / sprzedawcy (kolizja
z zakazem „24h / magazyn PL") oraz frazy o cenie z perspektywy AliExpress (inny price point).

**Użycie:** frazy VOC = surowiec dla headline'ów, benefitów, testimoniali i mapy obiekcji
(sekcja 12). Hero powinno powtarzać obietnicę głównej frazy benefit (message match z reklamą).

### 1.7 — Big Idea + mechanizm + poziom świadomości rynku (v5.0, NAJWAŻNIEJSZY KROK KONWERSYJNY)

> Bez tego kroku łuk perswazyjny (Problem→Solution→Proof→Offer) jest IDENTYCZNY dla
> produktu kupowanego z bólu i z ciekawości. To była największa luka konwersyjna audytu.

Ustal i zapisz do `_brief.md` sekcji „Big Idea" (3 linie, format maszynowy):

1. **`big-idea:`** — JEDNA idea sprzedażowa w 1 zdaniu („dlaczego ten produkt, dlaczego teraz").
   Test: czy da się ją powiedzieć klientowi w windzie i wzbudzić „aha"?
2. **`mechanism:`** — unique mechanism: CO konkretnie w produkcie czyni obietnicę wiarygodną
   (z opisu/spec produktu — NIE wymyślone; to anty-Linovo dla treści). Np. „ceramiczna stopa
   30 kPa", „5 stref o różnej gęstości pianki".
3. **`awareness:`** — poziom świadomości rynku wg Schwartza, wyprowadzony z kategorii + ceny:
   - `problem-aware` — klient zna ból, nie zna rozwiązań (innowacyjne gadżety, nowe kategorie)
   - `solution-aware` — zna typ rozwiązania, nie zna produktu (większość AGD/wellness)
   - `product-aware` — porównuje konkretne produkty (nasycone kategorie, niski ticket)

**Konsekwencje DETERMINISTYCZNE (wybierasz w ETAP 2, nie „wedle uznania"):**

| `awareness:` | Hero | Kolejność sekcji |
|---|---|---|
| `problem-aware` | pain-hook (nazwany ból + obietnica) | **Problem PRZED benefitami**, agitacja mocniejsza |
| `solution-aware` | mechanizm + dowód (liczba spec) | standardowa (Problem krótszy, Solution rozbudowane) |
| `product-aware` | oferta + differentiator w hero | Comparison wyżej (zaraz po Solution), Offer szybciej |

---

## Krok 2 — Moodboard z 3 realnych marek (NIE z naszej biblioteki)

**KRYTYCZNE:** referencje wizualne ciągnij **spoza e-commerce landingów** (i **spoza `landing-pages/`**). Po co: unikniesz zamkniętej pętli stylistycznej.

### Skąd czerpać

| Kategoria produktu | Dobre referencje |
|---|---|
| Premium AGD / tech | Dyson, Apple, Bang & Olufsen, Vitsœ, Leica |
| Wellness / beauty | Aesop, Le Labo, Byredo, Glossier, Vacation |
| Home / lifestyle | Muji, Tekla, HAY, Loro Piana, The Row |
| Pet / kids / fun | Bark, Mini (cars), Graza, Omsom, Liquid Death |
| Architecture / spatial | Kinfolk magazine, Cereal magazine, Herman Miller, Knoll |
| Food / drink | Dough, Ghia, Partake, Fly by Jing |
| Tech / SaaS (tylko dla elementów) | Linear, Vercel, Stripe, Arc Browser |
| Workwear / outdoor | Filson, Red Wing, Yeti, Cereal „Tools", Patagonia |

### Format zapisu
Dla każdej z 3 marek wybierz **JEDNĄ rzecz** do pożyczenia. Nie więcej. To zmusza do selektywności.

```
Ref 1: Dyson → mikrotypograficzne bloki danych technicznych (Space Mono 10px uppercase nad headline)
Ref 2: Muji → paleta papierowa (off-white #F8F6F1, zamiast czystej bieli), dużo pustego miejsca między sekcjami (180px padding)
Ref 3: Linear → kolorowe gradienty w detalach (radial gradient w rogu karty, nie pełne tło)
```

**Zabronione referencje:** inne landingi z `landing-pages/` (zamknięta pętla), Midjourney gallery (AI slop), Dribbble (trend slop), generyczne „modern minimalist" template'y.

**🗂️ SWIPE CORPUS (v5.0 — preferowane źródło):** [`_research/swipe/swipe-corpus-2026-Q2.md`](../landing/_research/swipe/swipe-corpus-2026-Q2.md)
— ~20 anotowanych, ZWERYFIKOWANYCH referencji (Co brać / Czego NIE brać / Pasuje do stylów)
+ 5 wzorców przekrojowych. Cytuj z korpusu zamiast z pamięci modelu — każda pozycja ma
wskazane techniki odtwarzalne w czystym CSS/HTML. Tabela kategorii niżej = fallback,
gdy korpus nie ma nic dla kategorii produktu. Odświeżanie korpusu: kwartalnie (poza AUTO-RUN).

### 🔌 21st.dev / magic MCP — kiedy zerknąć, kiedy NIE

> **TYLKO research, NIGDY do generowania kodu na ten landing.** Patrz [`mcp-landing-tools`](../../../Users/tomek/.claude/projects/c--repos-tn/memory/mcp-landing-tools.md).

[21st.dev/s](https://21st.dev/s) ma bibliotekę kilkudziesięciu animowanych komponentów (bento, hero variants, motion patterns). Można na nią zerknąć **wyłącznie** gdy:

✅ **OK use case:** „brakuje mi nowego motion effect do `motion-library.md`" / „chcę nowy hero variant H11 do `section-variants.md`" → spojrzeć na komponent 21st.dev, **podchwycić zasadę ruchu**, **przepisać w vanilla HTML/CSS** zgodnie ze Style Atlas + safety rules.

❌ **ZAKAZANE:** wywołać `magic` MCP do generowania komponentu na konkretny landing. Generuje React + framer-motion + shadcn/ui + Inter font + gradient mesh + glassmorphism = **wrong stack + AI slop dla polskich DR konwersji**. Niemożliwe do wstawienia bez 100% przepisania, a jak przepisujesz to po co używałeś?

❌ **ZAKAZANE jako "ref" w briefie:** nie dodawaj 21st.dev komponentu do listy 3 referencji marek (Krok 2). Referencje to **realne marki** (Dyson, Aesop, Linear) — nie biblioteki UI.

**Heurystyka praktyczna:** 21st.dev = źródło inspiracji do rozbudowy procedury (raz na sezon). NIE jest narzędziem do tego landingu. Jeśli się skusisz „zerknąć żeby zobaczyć co tam mają" — pamiętaj że każda minuta tam to risk pójścia w generic SaaS aesthetic zamiast premium polskiej direct response.

---

## Krok 3 — Design Manifesto (5 linijek)

Zapisz w `landing-pages/[slug]/_brief.md` dokładnie w tym formacie:

```markdown
# [MARKA] — Design Manifesto

## Kierunek: [NAZWA WŁASNA]
Nie z presetu. Nazwa musi opisywać mood, nie kategorię. Przykłady dobrych: "Panoramic Calm", "Clinical Warmth", "Workshop Precision", "Sunday Slow", "Nocturne Minimal".

## Tempo
[spokojne / rytmiczne / energiczne / dramatyczne / ciche]
Jedno słowo. Decyduje o padding sekcji, długości animacji, gęstości tekstu.

## Typografia
Display: [font] — [dlaczego, np. "geometryczne litery jak inżynierskie rysunki techniczne"]
Body: [font] — [czytelny, neutralny]
Accent: [font] — [monospace/editorial/script, użycie w 2-3 miejscach max]

## Paleta 60/30/10
Dominant 60%: [kolor + hex] — jak „oddech" strony
Secondary 30%: [kolor + hex] — główny charakter marki
Accent 10%: [kolor + hex] — użyty TYLKO w: [lista 3 miejsc max]

## Signature element
Jedna rzecz wizualna, którą klient zapamięta. Nie „gradientowy border" — to nikt nie zapamięta. Przykłady mocne: „monumentalna liczba 5800 PA w stylu zegara kolejowego nad hero", „każda sekcja ma własny numer N/10 w rogu jak w gazecie", „produkt otoczony siatką architektoniczną jak rysunek techniczny".

## Od czego świadomie uciekam
[3-5 wzorców z Kroku 1.5]
```

---

## Krok 4 — Walidacja anty-generic

Po napisaniu manifesto odpowiedz szczerze:

### 4.1 Test unikalności
Czy dokładnie TEN manifesto pasowałby do 5 innych produktów?
- TAK → manifesto jest za ogólne. Wróć do Kroku 1, znajdź coś specyficznego dla produktu.
- NIE → przejdź dalej.

### 4.2 Test ryzyka
Czy w manifesto jest przynajmniej JEDEN element, który ryzykuje (może się klientowi nie spodobać)?
- NIE → to szablon. Dodaj coś odważnego (kolor, typografia, layout move).
- TAK → przejdź dalej. Ryzyko = charakter.

### 4.3 Test portfolio
Czy pokazałbyś ten landing jako case study swojemu najlepszemu klientowi?
- NIE → brakuje polotu. Wzmocnij signature element.
- TAK → gotowe, przechodzisz do Kroku 5.

### 4.4 Test konfliktu z brandem
Sprawdź brand_info z Supabase:
- Czy paleta manifesto zgadza się z kolorami w `workflow_branding` type=color?
- Czy tone-of-voice w tagline pasuje do tempa?
- Jeśli jest konflikt — **branding ma priorytet** (klient zaakceptował kolory/fonty). Dostosuj manifesto.

---

## Krok 5 — Anty-referencje (co JUŻ JEST, czego NIE powielać)

> ⚠️ **Ta tabela to ANTY-REFERENCJE, NIE template'y do kopiowania.** Każdy nowy landing budujesz **od zera** zgodnie z manifestem (patrz Krok 6). Tabela służy żebyś wiedział co już istnieje i NIE powtarzał tego samego designu.

| Kierunek z manifesta | Co już zrobiliśmy (anty-referencja) | Czego NIE powtarzaj |
|---|---|---|
| **Panoramic Calm** | [`landing-pages/vitrix/`](../../landing-pages/vitrix/) | Nie kopiuj Plus Jakarta + Instrument Serif + paper/navy/teal — wymyśl własną typografię i paletę pod swoją markę |
| **Editorial/Luxury** | [`landing-pages/paromia/`](../../landing-pages/paromia/) | Nie kopiuj Fraunces + Italiana + paper/ink/gold — Twoja marka ma swoje fonty z `workflow_branding` |
| **Organic/Natural** | [`landing-pages/h2vital/`](../../landing-pages/h2vital/) | Nie kopiuj rounded sans + greens/beiges — własny moodboard |
| **Playful/Toy** | [`landing-pages/pupilnik/`](../../landing-pages/pupilnik/) | Nie kopiuj rounded bouncy + emoji — własny vibe |
| **Retro-Futuristic** | [`landing-pages/vibestrike/`](../../landing-pages/vibestrike/) | Nie kopiuj neon on black + glitch — własna interpretacja |
| **Rugged Heritage** | [`landing-pages/kafina/`](../../landing-pages/kafina/) | Nie kopiuj Archivo + dark hero + stamp badges — własne signature elements |

**Zasada fundamentalna:** procedura ma być uniwersalna — **musi działać nawet gdyby `landing-pages/` było puste**. Tabela powyżej to tylko historia, nie biblioteka template'ów.

**Co MOŻESZ kopiować:** snippety z [`reference/patterns.md`](reference/patterns.md) — to safety primitywy (fade-in safe, dual-bank mobile, header solid, magnetic CTA), nie layouty. Składasz świeżo pod manifest.

---

## Krok 6 — MODE=forge (zawsze, jedyna opcja)

> **Decyzja architektoniczna (memory: feedback-landing-always-forge.md):** każdy landing budujesz **od zera**. NIE kopiujesz istniejących baseline'ów (`cp -r landing-pages/$BASE` jest **zakazane**). Procedura ma być uniwersalna.

```bash
SLUG="nowa-marka"
mkdir -p landing-pages/$SLUG
# _brief.md już jest z Kroku 8
```

→ ETAP 2 ([`02-generate.md`](02-generate.md)) buduje **szkielet 14 sekcji od zera**, używając:
- Architektury sekcji z `02-generate.md` (header → hero → trust → ... → footer)
- Snippetów copy-paste z [`reference/patterns.md`](reference/patterns.md) (fade-in safe, dual-bank, magnetic CTA, etc.)
- Manifesta z `_brief.md` jako **jedynego** drivera designu (paleta, typografia, signature, tempo)

**Dlaczego nie copy-adapt:**
- **Local maxima** — kopiowanie istniejącego baseline = powielanie jego błędów + brak ewolucji
- **Klient widzi „rodzeństwo" landingów** zamiast unikalnej marki
- **AI-slop** — adaptacja sprawdzonego layoutu wygląda jak kolejna iteracja tego samego
- **Procedura nie jest uniwersalna** — gdyby `landing-pages/` było puste, copy-adapt by nie działał

**Tradeoff:** forge zajmuje ~2× więcej czasu niż adaptacja, ale daje **świeży, unikalny landing** za każdym razem.

---

## Krok 7 — Mapowanie manifesto → decyzje w ETAP 4 (DESIGN)

Manifesto musi przekładać się 1:1 na konkretne decyzje w kodzie. Wypełnij tabelę w pliku manifesto:

| Decyzja | Wartość z manifesto |
|---|---|
| Hero background | [paleta dominant + opis tła] |
| Hero headline font-family | [display z manifesto] |
| Hero headline font-style | [regular / italic em na kluczowych słowach / all-caps] |
| Signature element HTML | [konkretny kod w zarysie] |
| Dark section rytm | [ile sekcji ciemnych? które?] |
| Animacja hero | [subtle / none / dramatic + opis] |
| Border-radius globalny | [0 / 4px / 8px / 16px / 24px — jedna wartość dla spójności] |
| Shadow styl | [kolor, offset, opisz] |
| Divider między sekcjami | [line / wave / numbered / none] |

Jeśli którakolwiek decyzja jest pusta → manifesto jest niekompletne, wróć do Kroku 3.

---

## Krok 8 — Zapisz `_brief.md`

Skopiuj szablon i wypełnij:

```bash
cp landing-pages/_templates/_brief.template.md landing-pages/$SLUG/_brief.md
# Edytuj wszystkie 8 sekcji
```

**Struktura `_brief.md`** (sekcje 1-8 + 10 obowiązkowe; 9, 11-13 wg opisu):

1. Kierunek manifesta (z 6 presetów lub „nowy")
2. Moodboard — 3 realne marki referencyjne (spoza landing-pages/)
3. Paleta (3-4 kolory z workflow_branding)
4. Typografia (2-3 fonty z workflow_branding + ``)
5. Persona główna (z report_pdf — wiek/zawód/pain/motywacja)
6. Anty-referencje (co JUŻ JEST w `landing-pages/`, czego NIE powtarzasz)
7. Test anty-generic (4 odpowiedzi TAK)
8. Signature element
9. **Warianty sekcji** (wybór Hero/Features/Testimonials z [`reference/section-variants.md`](reference/section-variants.md). Dopisywane autonomicznie przez Claude w ETAP 2 przed generowaniem HTML)
10. **STYLE LOCK** (Krok 9a — Style ID + maszynowe linie `lock-*` + MUSZĄ/NIE WOLNO)
11. **Wow Moments** (ETAP 4 — 3 explicit wow moments)
12. **Mapa obiekcji (v5.0, OBOWIĄZKOWA)** — 5 najmocniejszych obiekcji dla TEGO produktu,
    każda w jednej grep-owalnej linii: `- [obiekcja] → sekcja: [nazwa] → rozbrojenie: [1 zdanie]`.
    Wymogi: min 1 obiekcja produkt-specyficzna SPOZA 4 kanonicznych (cena / jakość vs tańsze
    z Allegro/Ali / czas dostawy / zwrot-gwarancja), wyprowadzona z Product DNA lub VOC.
    **Reguła budżetowa:** rozbrojenie inline = PRZEPISANIE istniejącego zdania sekcji
    (max +1 krótka linia per sekcja, ZERO nowych liczb ponad budżet Scrollability —
    preferuj reuse liczb już obecnych). FAQ tylko domyka skróty — obiekcję rozbrajaj
    W MIEJSCU jej powstawania (objection timing).
13. **Big Idea + VOC + Liczby kanoniczne (v5.0, OBOWIĄZKOWE)** — trzy bloki maszynowe:
    - `big-idea:` / `mechanism:` / `awareness:` (Krok 1.7)
    - „Język klienta (VOC)" — 5-15 dosłownych fraz w koszykach pain/benefit/obiekcje
      LUB linia `VOC: BRAK DANYCH — [powód]` (Krok 1.6)
    - „Liczby kanoniczne" — KAŻDA liczba planowana na landing jako wiersz
      `wartość | jednostka | źródło` (źródło = konkretne pole: workflow_products.description,
      report PDF str. N, opinia #N, specyfikacja AliExpress). Whitelist auto-seed: cena
      i oszczędność z oferty, „14 dni" (zwrot ustawowy), „30 dni" (gwarancja jeśli w ofercie),
      rating z pasma 4,6-4,8. **Liczba-sierota w copy = USUŃ albo dopisz do briefu
      Z weryfikowalnym źródłem; dopisanie bez źródła ZABRONIONE** (tekstowy odpowiednik
      incydentu Linovo).

**NIE używaj `/c/tmp/`** — `_brief.md` jest commitowany razem z landingiem (persystentny brief projektu).

---

## Krok 9a — Product DNA + Style Pick z Atlas (OBOWIĄZKOWY od v4.0)

> **Wprowadzone 2026-04-23.** Rozwiązuje problem konwergencji landingów do tego samego zestawu fontów/layoutów/patternów mimo różnych manifestów. Od v4.0 wybór stylu jest **deterministyczny** przez Product DNA → match z Style Atlas, nie subiektywny „Claude wymyśla".

### 9a.1 — Wypełnij Product DNA (7 etykiet)

Na bazie `brand_info`, `report_pdf`, `workflow_products` odpowiedz na 7 osi z [`style-atlas/README.md`](style-atlas/README.md):

| Oś | Wartość | Uzasadnienie (1 zdanie) | 2 kotwice z DNA Anchors |
|----|---------|-------------------------|-------------------------|
| Utility ↔ Ritual | __ | | |
| Precision ↔ Expression | __ | | |
| Evidence ↔ Feeling | __ | | |
| Solo ↔ Community | __ | | |
| Quiet ↔ Loud | __ | | |
| Tradition ↔ Future | __ | | |
| Intimate ↔ Public | __ | | |

**Zasada kotwic:** dla każdej etykiety musisz wymienić 2 produkty z [DNA Anchors tabeli](style-atlas/README.md#product-dna-anchors--kotwice-per-o%C5%9B) które uzasadniają wybór. Jeśli nie możesz znaleźć 2 kotwic w danej kategorii — DNA jest błędne.

### 9a.2 — Algorytmiczny Style Pick

Dla każdego z 19 stylów w [`style-atlas/`](style-atlas/) oblicz match:

```
match = count(DNA dimensions gdzie styl ma = wartość produktu) / 7
```

Top-3 score'y = kandydaci. **Pierwszy w rankingu wygrywa**, z regułą LRU niżej.

**LRU anti-repetition (v5.0 — działa ZAWSZE, nie tylko przy remisie):**
Dotychczas anti-repetition odpalał się wyłącznie przy tie-breaku — gdy ten sam styl
wygrywał czysto dla podobnych produktów (typowe: mid-price utility → evidence-cluster),
powtarzalność nie była niczym blokowana (potwierdzenie w danych: H3/F4/T2 + clinical-kitchen
w 4 landingach z rzędu — `bash scripts/landing-performance-stats.sh`).

1. Ustal 2 OSTATNIE wygenerowane landingi: `ls -t landing-pages/*/_brief.md | head -2`
   i odczytaj ich Style ID (sekcja 10.1).
2. Jeśli Top-1 == styl użyty w OBU ostatnich landingach **ORAZ** runner-up ma match
   gorszy o ≤1 punkt → **wybierz runner-upa** (zapisz w 9a.3: „LRU: top-1 [styl] użyty
   w 2 ostatnich; runner-up [styl] match −1").
3. Jeśli runner-up gorszy o ≥2 punkty → Top-1 zostaje (dopasowanie > świeżość) —
   ale odnotuj w briefie linię `LRU-override: match-gap ≥2`.

Tie-break (gdy 2+ style mają ten sam match):
1. Wyklucz style użyte 2× lub więcej w ostatnich 5 landingach
2. Jeśli nadal tie — weź styl z niższym `style_id` alphabetycznie (deterministyczne)

**Przykład dla Steamla:**
- DNA: `utility · precision · evidence · solo · quiet · present · intimate`
- Match:
  - **Apothecary Label** 7/7 → wygrywa
  - Clinical Kitchen 6/7 (różni się loud: moderate vs quiet)
  - Swiss Grid 5/7 (różni się public vs intimate, quiet vs quiet ✓)

### 9a.3 — Argumentacja wyboru (1 zdanie)

Claude NIE wybiera stylu, tylko argumentuje dlaczego Top-1 (wygrany algorytmicznie) pasuje. Jeśli Claude NIE może argumentować — DNA jest błędne, wróć do 9a.1.

### 9a.4 — Przeczytaj plik wybranego stylu CAŁOŚCIOWO

Otwórz `style-atlas/[style-id].md`. Przeczytaj WSZYSTKIE 12 sekcji. Internalizuj:
- Font stack (konkretne nazwy)
- Paleta (konkretne hex)
- Section Architecture (ile sekcji, które)
- Allowed Variants (H/F/T limited)
- Motion Budget (js effects required/forbidden)
- MUSZĄ / NIE WOLNO listy

### 9a.5 — Wygeneruj STYLE LOCK do `_brief.md` sekcja 10

Skopiuj sekcje `MUSZĄ` i `NIE WOLNO` z pliku stylu do `_brief.md` sekcja 10 (auto-paste). Ta sekcja staje się **kontraktem** — łamiesz = FAIL w `verify-style-lock.sh`.

---

## Krok 9 — verify-brief.sh (OBOWIĄZKOWY GATE)

```bash
bash scripts/verify-brief.sh $SLUG
```

**Exit 0:** Brief kompletny → przejdź do ETAP 2 (`02-generate.md`).

**Exit 1:** Brief niekompletny → wróć do Kroku 8, uzupełnij brakujące sekcje. Powtórz aż exit 0.

**Skrypt sprawdza:**
- 8 sekcji obecnych (`## 1.` do `## 8.`)
- Sekcja 1: któryś kierunek zaznaczony `[x]`
- Sekcja 2: 3 marki wypełnione (3 numerowane wpisy z `**`)
- Sekcja 3: paleta nie ma więcej niż 1 placeholdera `______`
- Sekcja 6: anty-referencje wypełnione (≥50 znaków treści)
- Sekcja 7: wszystkie 4 testy anty-generic na TAK `[x]`

**Bez valid briefa NIE przechodź do ETAP 2.** To jest twardy gate — autonomous mode w `landing-autorun.sh` wymusza max 3 retries, potem STOP + raport.

---

## Checklist wyjściowy

- [ ] Audyt produktu z danych Supabase (nie z głowy)
- [ ] 3 realne marki referencyjne wybrane (spoza `landing-pages/`)
- [ ] Manifesto napisane — 5 linijek wypełnionych
- [ ] Nazwa kierunku jest WŁASNA lub świadomie wybrana z 6 presetów
- [ ] Test unikalności: manifesto nie pasuje do 5 innych produktów
- [ ] Test ryzyka: min. 1 element odważny
- [ ] Paleta zgadza się z `workflow_branding` type=color
- [ ] Tabela mapowania Krok 7 wypełniona
- [ ] Anty-referencje wypełnione (sekcja 6 — co już jest, czego nie powtarzasz)
- [ ] `_brief.md` zapisany w `landing-pages/[slug]/`
- [ ] `verify-brief.sh` exit 0
- [ ] Użytkownik NIE był pytany o nic — wszystkie decyzje oparte na danych

---

## Anty-wzorce (NIE RÓB TEGO)

- ❌ „Wybieram Editorial bo produkt jest premium" — leniwe, prowadzi do kopii paromii
- ❌ „Organic/Natural pasuje bo to wellness" — kategoria ≠ kierunek, zadaj sobie pytanie o EMOCJĘ
- ❌ Pomijanie manifesto i skakanie do ETAP 2 — gwarantowany szablon (verify-brief.sh i tak zatrzyma)
- ❌ Referencje typu „like paromia but warmer" — zamknięta pętla stylistyczna
- ❌ Manifesto napisane po zakodowaniu HTML — to racjonalizacja, nie projektowanie
- ❌ Pytanie użytkownika „jaki kierunek preferujesz?" — to TWOJA decyzja oparta na danych
- ❌ `cp -r landing-pages/$BASE` — kopiowanie istniejących baseline'ów jest **zakazane** (memory: `feedback-landing-always-forge.md`, [`reference/safety.md` #1](reference/safety.md))

---

## Failure modes (AUTO-RUN mode)

| Warunek | Akcja | Max retry | Jeśli nadal fail |
|---------|-------|-----------|------------------|
| `verify-brief.sh` exit 1 (missing section) | Uzupełnij brakującą sekcję, re-run | 3 | STOP + raport do usera |
| Anty-generic test fail (4.1-4.4) | Przepisz manifesto, zmień marki referencyjne | 2 | STOP — zbyt generic |
| Brak pasującego baseline (≥3 czerwone flagi) | MODE=forge (szkielet od zera) | — | kontynuuj (to jest valid path) |
| Brak `report_pdf` (`workflow_reports`) | Dedukuj personę z `brand_info` + tagline | 1 | STOP — wróć do CLAUDE_BRANDING_PROCEDURE.md |
| Brak `brand_info` | STOP — wróć do CLAUDE_BRANDING_PROCEDURE.md | 0 | STOP |

---

## Relacja do pozostałych etapów

| Etap | Plik | Co robi |
|---|---|---|
| 0. Walidacja | (`landing-autorun.sh` lub `02-generate.md` ETAP 0) | Bash check Supabase |
| **1. Direction** | **ten plik (`01-direction.md`)** | **manifesto + baseline + verify-brief** |
| 2. Generate | [`02-generate.md`](02-generate.md) | HTML zgodny z briefem |
| 3. Review | [`03-review.md`](03-review.md) | weryfikacja treści (gate = exit code verify-landing.sh) |
| 4. Design polish | [`04-design.md`](04-design.md) | implementacja manifesto + offer box |
| 5. Verify | [`05-verify.md`](05-verify.md) | Playwright 3 viewporty |
| 6. Mobile | [`06-mobile.md`](06-mobile.md) | mobile polish 375px |

Po ETAP 6 (jeśli verify-all-landings.sh PASS) → auto commit + push + deploy. Patrz [`README.md`](README.md) sekcja AUTO-RUN protocol.
