# ETAP 2.5: Wybór kierunku estetycznego (OBOWIĄZKOWY)

**Kiedy:** po `CLAUDE_LANDING_REVIEW.md` (ETAP 2), przed `CLAUDE_LANDING_DESIGN.md` (ETAP 3).

**Cel:** wybrać świadomy, unikalny kierunek wizualny dla KONKRETNEGO produktu — zamiast domyślnie sięgać po gotowy preset (Editorial/Organic/etc.) i produkować kolejny „AI-generated lookalike".

**Dlaczego obowiązkowy:** bez tego etapu każdy landing premium zaczyna wyglądać jak paromia, każdy pet-care jak pupilnik, każdy wellness jak h2vital. Preset = skrót myślowy. Framework niżej wymusza świeżą analizę per produkt.

**Rezultat:** plik `landing-pages/[slug]/_brief.md` — **commitowany** razem z landingiem (persystentny brief projektu, nie artefakt roboczy). Zawiera Design Manifesto + Photo System + Personas + Decisions log. Steruje decyzjami w ETAP 3 oraz generowaniem obrazów w `CLAUDE_AI_IMAGES_PROCEDURE.md`.

---

## Zasada fundamentalna

**NIE PYTAJ użytkownika o kierunek.** Autonomicznie pobierz dane z Supabase (brand_info, report PDF, products, mockups) i zdecyduj sam. Jeśli brak danych → zgadnij na podstawie kategorii produktu i tagline, potem zapisz w manifesto dlaczego.

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

### Format zapisu
Dla każdej z 3 marek wybierz **JEDNĄ rzecz** do pożyczenia. Nie więcej. To zmusza do selektywności.

```
Ref 1: Dyson → mikrotypograficzne bloki danych technicznych (Space Mono 10px uppercase nad headline)
Ref 2: Muji → paleta papierowa (off-white #F8F6F1, zamiast czystej bieli), dużo pustego miejsca między sekcjami (180px padding)
Ref 3: Linear → kolorowe gradienty w detalach (radial gradient w rogu karty, nie pełne tło)
```

**Zabronione referencje:** inne landingi z `landing-pages/` (zamknięta pętla), Midjourney gallery (AI slop), Dribbble (trend slop), generyczne „modern minimalist" template'y.

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
- TAK → gotowe, przechodzisz do ETAP 3.

### 4.4 Test konfliktu z brandem
Sprawdź brand_info z Supabase:
- Czy paleta manifesto zgadza się z kolorami w `workflow_branding` type=color?
- Czy tone-of-voice w tagline pasuje do tempa?
- Jeśli jest konflikt — **branding ma priorytet** (klient zaakceptował kolory/fonty). Dostosuj manifesto.

---

## Krok 5 — Mapowanie manifesto → decyzje w ETAP 3 (DESIGN)

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

## Krok 6 — Zapisz i przejdź dalej

Użyj Write tool żeby zapisać brief do `landing-pages/[slug]/_brief.md` (commituj razem z landingiem). **NIE używaj `/c/tmp/`** — to artefakty efemeryczne.

Struktura `_brief.md` (sekcje obowiązkowe):
```markdown
# [BRAND] — Landing Brief

**Status:** 🟢/🟡/🔴 · **Kierunek:** [NAZWA] · **Workflow:** [UUID]

## 1. Design Manifesto          (5 linijek z Kroku 3)
## 2. Photo System              (lighting, paleta scen, kadrowanie, realism injector)
## 3. Personas                  (3 z raportu PDF — imię, wiek, cytat)
## 4. Mapping manifesto → kod   (Krok 5, tabela)
## 5. Moodboard (3 marki)       (Krok 2)
## 6. Decisions log             (zmiany od pierwszej wersji, datowane)
## 7. JS Effects zaimplementowane
## 8. Live link
```

Następnie: **ETAP 3 — `CLAUDE_LANDING_DESIGN.md`**. Każda decyzja w ETAP 3 MUSI być zgodna z manifesto. Jeśli coś się kłóci — zaktualizuj manifesto PRZED zmianą kodu.

---

## Checklist wyjściowy

- [ ] Audyt produktu z danych Supabase (nie z głowy)
- [ ] 3 realne marki referencyjne wybrane (spoza `landing-pages/`)
- [ ] Manifesto w `landing-pages/[slug]/_brief.md` — wszystkie 5 linijek wypełnione
- [ ] Nazwa kierunku jest WŁASNA (nie z listy presetów)
- [ ] Test unikalności: manifesto nie pasuje do 5 innych produktów
- [ ] Test ryzyka: min. 1 element odważny
- [ ] Paleta zgadza się z `workflow_branding` type=color
- [ ] Tabela mapowania Krok 5 wypełniona
- [ ] Użytkownik NIE był pytany o nic — wszystkie decyzje oparte na danych

---

## Anty-wzorce (NIE RÓB TEGO)

- ❌ „Wybieram Editorial bo produkt jest premium" — leniwe, prowadzi do kopii paromii
- ❌ „Organic/Natural pasuje bo to wellness" — kategoria ≠ kierunek, zadaj sobie pytanie o EMOCJĘ
- ❌ Pomijanie manifesto i skakanie do ETAP 3 — gwarantowany szablon
- ❌ Referencje typu „like paromia but warmer" — zamknięta pętla stylistyczna
- ❌ Manifesto napisane po zakodowaniu HTML — to racjonalizacja, nie projektowanie
- ❌ Pytanie użytkownika „jaki kierunek preferujesz?" — to TWOJA decyzja oparta na danych

---

## Relacja do pozostałych etapów

| Etap | Plik | Co robi |
|---|---|---|
| 1. Generowanie | `CLAUDE_LANDING_PROCEDURE.md` | HTML z danymi z Supabase |
| 2. Review treści | `CLAUDE_LANDING_REVIEW.md` | kompletność, copy, hero deep dive |
| **2.5. Direction** | **ten plik** | **manifesto kierunku estetycznego** |
| 3. Design polish | `CLAUDE_LANDING_DESIGN.md` | implementacja manifesto w CSS/HTML |
| 4. Wizualna weryfikacja | `CLAUDE_LANDING_VERIFY.md` | Playwright 3 viewporty |

Dopiero po ETAP 4 → commit & deploy.
