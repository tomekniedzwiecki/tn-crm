# Procedura: Generowanie Lead Magnetu dla Workflow

> **WAŻNE**: Zawsze pisz z polskimi znakami diakrytycznymi (ą, ę, ć, ś, ź, ż, ó, ł, ń).

## Kiedy wywołać

Użytkownik mówi: "Zrób lead magnet dla workflow X", "Wygeneruj lead magnet", "Przygotuj lead capture".

## Co generuje

**Interaktywny lead magnet HTML** — prezentacja slajdowa z:
- Gate screen (formularz email przed contentem)
- 5-7 slajdów z wartościowym contentem
- CTA do landing page na końcu (+ link do koszyka jako alternatywa)
- Responsive design (mobile + desktop)
- Swipe/keyboard navigation

**Dodatkowo:**
- Email sequence (5 emaili follow-up)
- Integracja z `lead-upsert` endpoint

## Gdzie zapisać

```
lead-magnets/[nazwa-marki]/
├── interactive.html    # Główny plik (ZAWSZE)
├── lead-magnet.md      # Markdown backup
├── assets.md           # Email sequence, SQL
└── README.md           # Instrukcje
```

---

## Typy lead magnetów

### 1. PDF Poradnik (najczęściej używany)

**Format:** 5-10 stron, edukacyjny, rozwiązuje konkretny problem
**Tytuły:**
- "5 mitów o [temat] które kosztują Cię [ból]"
- "Kompletny poradnik: Jak wybrać [produkt] w 2025"
- "7 błędów przy [czynność] których możesz uniknąć"
- "[X] rzeczy które musisz wiedzieć przed zakupem [produkt]"

**Najlepiej dla:** Produkty wymagające edukacji (zdrowie, tech, specjalistyczne)

---

### 2. Checklist / Lista kontrolna

**Format:** 1-2 strony, konkretne punkty do odhaczenia
**Tytuły:**
- "Checklist: Przed zakupem [produkt] sprawdź te [X] rzeczy"
- "Lista kontrolna: Czy [produkt] jest dla Ciebie?"
- "10 pytań które musisz zadać przed wyborem [produkt]"

**Najlepiej dla:** Produkty z wieloma wariantami, droższe zakupy (>500 zł)

---

### 3. Quiz / Test

**Format:** 5-7 pytań, wynik = rekomendacja produktu
**Tytuły:**
- "Quiz: Który typ [produkt] jest idealny dla Ciebie?"
- "Test: Czy potrzebujesz [produkt]? Sprawdź w 2 minuty"
- "Odkryj swój idealny [produkt] - szybki quiz"

**Najlepiej dla:** Produkty z wariantami (kolory, rozmiary, typy), beauty, fitness

---

### 4. Mini-kurs email (5 dni)

**Format:** 5 emaili, 1 dziennie, buduje zaufanie + edukuje
**Tytuły:**
- "5-dniowy kurs: Jak [osiągnąć cel] z [produkt]"
- "Mini-kurs: Od zera do [efekt] w 5 dni"
- "Darmowy kurs email: Wszystko o [temat]"

**Najlepiej dla:** Produkty z długim cyklem decyzyjnym, premium

---

### 5. Kalkulator / Narzędzie

**Format:** Interaktywny, użytkownik wpisuje dane → dostaje wynik
**Tytuły:**
- "Kalkulator: Ile zaoszczędzisz z [produkt]?"
- "Oblicz swój [parametr] - darmowe narzędzie"
- "Sprawdź czy [produkt] się opłaca - kalkulator ROI"

**Najlepiej dla:** Produkty z oszczędnościami (energia, czas, pieniądze)

---

## Dopasowanie typu do kategorii produktu

| Kategoria | Typ 1 (najlepszy) | Typ 2 (alternatywa) | Dlaczego |
|-----------|-------------------|---------------------|----------|
| **Zdrowie & Wellness** | PDF Poradnik ("5 mitów") | Checklist | Wymaga edukacji, obalanie mitów działa |
| **Smart Home / AGD** | Checklist | Kalkulator oszczędności | Porównanie funkcji, ROI |
| **Narzędzia / DIY** | PDF Poradnik ("Jak wybrać") | Checklist | Edukacja techniczna |
| **Fitness / Sport** | Quiz | Mini-kurs email | Personalizacja, motywacja |
| **Beauty / Skincare** | Quiz | PDF Poradnik | Personalizacja, typy skóry |
| **Kids / Edukacja** | PDF Poradnik (dla rodziców) | Checklist | Edukacja rodziców |
| **Tech / Elektronika** | Checklist | PDF Poradnik | Porównanie specyfikacji |

---

## Struktura lead magnetu (PDF Poradnik)

```markdown
# [TYTUŁ LEAD MAGNETU]
## [Podtytuł z obietnicą wartości]

---

### Wprowadzenie (0.5 strony)
- Hook: problem/ból czytelnika
- Obietnica: co zyska po przeczytaniu
- Krótkie przedstawienie (1 zdanie o marce)

---

### Sekcja 1: [Problem / Mit / Błąd #1]
**Nagłówek przyciągający uwagę**
- Opis problemu (2-3 zdania)
- Dlaczego to błąd (2-3 zdania)
- Rozwiązanie / prawda (2-3 zdania)
- Pro tip lub przykład

---

### Sekcja 2-5: [Kolejne problemy/mity/błędy]
(ta sama struktura)

---

### Podsumowanie (0.5 strony)
- Rekapitulacja głównych punktów
- Jeden konkretny następny krok
- Subtelne CTA (nie sprzedażowe!)

---

### O [Nazwa marki] (0.25 strony)
- 2-3 zdania o produkcie
- Link do strony
- "Masz pytania? Napisz do nas"
```

---

## Proces generowania

### Krok 1: Pobierz WSZYSTKIE dane o produkcie

```bash
# Podstawowe dane workflow
curl -s "https://yxmavwkwnfuphjqbelws.supabase.co/rest/v1/workflows?id=eq.[WORKFLOW_ID]&select=*" \
  -H "apikey: [SERVICE_KEY]" -H "Authorization: Bearer [SERVICE_KEY]"

# Branding (nazwa marki, tagline, opis)
curl -s "https://yxmavwkwnfuphjqbelws.supabase.co/rest/v1/workflow_branding?workflow_id=eq.[WORKFLOW_ID]&type=eq.brand_info&select=*" \
  -H "apikey: [SERVICE_KEY]" -H "Authorization: Bearer [SERVICE_KEY]"

# Raporty produktu (KLUCZOWE — zawierają analizę, USP, grupę docelową)
curl -s "https://yxmavwkwnfuphjqbelws.supabase.co/rest/v1/workflow_reports?workflow_id=eq.[WORKFLOW_ID]&select=*" \
  -H "apikey: [SERVICE_KEY]" -H "Authorization: Bearer [SERVICE_KEY]"
```

> **WAŻNE:** Raporty (szczególnie `report_pdf` i `report_infographic`) zawierają najcenniejsze informacje o produkcie. Przeczytaj je zanim zaczniesz!

---

### Krok 2: Analiza produktu (OBOWIĄZKOWA)

Odpowiedz na pytania:

#### 2.1 Podstawowe informacje

| Pytanie | Gdzie szukać |
|---------|--------------|
| Nazwa marki | `workflow_branding` type=`brand_info` |
| Nazwa produktu | `workflows.offer_name` lub raporty |
| Kategoria | Zdrowie / Tech / Dom / Fitness / Beauty / Kids / Narzędzia |
| Cena | Tani (<200zł), średni (200-800zł), premium (>800zł) |
| Typ klienta | B2C konsument / B2B firma |

#### 2.2 Analiza grupy docelowej

| Pytanie | Znaczenie dla lead magnetu |
|---------|---------------------------|
| **Kim jest kupujący?** | Wiek, płeć, sytuacja życiowa → ton i styl pisania |
| **Jaki ma problem?** | Problem = temat lead magnetu |
| **Co próbował wcześniej?** | "Mity" lub "Błędy" do obalenia |
| **Czego się boi?** | Obiekcje do zaadresowania |
| **Co go przekona?** | Dowody, dane, historie |

#### 2.3 Analiza produktu

| Pytanie | Znaczenie dla lead magnetu |
|---------|---------------------------|
| **Co wyróżnia ten produkt?** | USP = główny punkt edukacyjny |
| **Jakie problemy rozwiązuje?** | Struktura lead magnetu |
| **Jakie ma funkcje?** | Materiał do sekcji |
| **Czym różni się od konkurencji?** | Porównania, obalanie mitów |

#### 2.4 Wybór typu lead magnetu

Na podstawie analizy wybierz typ:

```
KATEGORIA: [np. Zdrowie]
CENA: [np. premium >800zł]
CYKL DECYZYJNY: [krótki/średni/długi]
WYMAGA EDUKACJI: [tak/nie]
MA WARIANTY: [tak/nie]

→ REKOMENDOWANY TYP: [np. PDF Poradnik "5 mitów o..."]
→ ALTERNATYWA: [np. Checklist "Przed zakupem sprawdź..."]
```

---

### Krok 3: Wybór tematu i tytułu

#### Formuły tytułów które działają:

**Dla "Mitów/Błędów":**
- "5 mitów o [temat] które kosztują Cię [ból/pieniądze/czas]"
- "7 błędów przy wyborze [produkt] (i jak ich uniknąć)"
- "[X] rzeczy o [temat] które wszyscy robią źle"

**Dla "Poradnika":**
- "Kompletny poradnik: Jak wybrać [produkt] w 2025"
- "Wszystko co musisz wiedzieć o [temat] zanim kupisz"
- "Od A do Z: [temat] dla początkujących"

**Dla "Checklisty":**
- "Checklist: [X] pytań przed zakupem [produkt]"
- "Lista kontrolna: Czy [produkt] jest dla Ciebie?"
- "Nie kupuj [produkt] zanim nie sprawdzisz tych [X] rzeczy"

**Dla "Quizu":**
- "Quiz: Który [produkt] jest idealny dla Ciebie?"
- "Odkryj swój typ [kategoria] - 2-minutowy test"
- "Test: Czy potrzebujesz [produkt]?"

---

### Krok 4: Napisz lead magnet

#### Zasady pisania:

**TON:**
- Ekspert ale przystępny (nie akademicki)
- Empatyczny (rozumiem Twój problem)
- Konkretny (fakty, liczby, przykłady)
- Polski, naturalny język

**STRUKTURA:**
- Krótkie akapity (max 3-4 zdania)
- Wypunktowania dla łatwości skanowania
- Nagłówki które mówią CO czytelnik zyska
- Pro tipy / wyróżnione cytaty

**SPRZEDAŻ:**
- 80% wartość edukacyjna, 20% o produkcie
- NIGDY nie sprzedawaj wprost w lead magnecie
- Produkt jako "jedna z opcji" lub "przykład rozwiązania"
- CTA na końcu: "Jeśli chcesz dowiedzieć się więcej..."

---

### Krok 5: Przygotuj dodatkowe elementy

#### A) Formularz lead capture

```
NAGŁÓWEK: [Tytuł lead magnetu]
PODTYTUŁ: "Pobierz darmowy poradnik i dowiedz się [obietnica]"

POLA:
- Email (wymagane) — TYLKO EMAIL, bez imienia!

PRZYCISK: "Pokaż →" lub "Wyślij mi poradnik →"

POD FORMULARZEM: "Bez spamu. 3 min czytania."
```

**WAŻNE:** Im mniej pól, tym wyższa konwersja. Samo email wystarcza.

#### B) Popup copy (na landing page)

```
NAGŁÓWEK: "Zanim kupisz, przeczytaj to"
lub: "Darmowy poradnik dla Ciebie"

TEKST: "[1 zdanie o wartości lead magnetu]"

CTA: "Pobierz za darmo →"

TRIGGER: Exit intent / scroll 50% / po 30 sek
```

#### C) Email sequence outline (5 emaili)

```
EMAIL 1 (dzień 0): Dostawa lead magnetu
- Temat: "Twój poradnik jest gotowy!"
- Treść: Link do pobrania + 1 kluczowy insight

EMAIL 2 (dzień 2): Rozwinięcie tematu
- Temat: "[Pytanie związane z tematem]?"
- Treść: Dodatkowa wartość, historia, case study

EMAIL 3 (dzień 4): Obalenie obiekcji
- Temat: "Największy błąd przy [temat]"
- Treść: Adresowanie najczęstszej obiekcji

EMAIL 4 (dzień 6): Social proof
- Temat: "Jak [imię] rozwiązał problem z [temat]"
- Treść: Historia klienta (może być fikcyjna ale realistyczna)

EMAIL 5 (dzień 8): Soft CTA
- Temat: "Gotowy na następny krok?"
- Treść: Delikatne zaproszenie do sprawdzenia produktu
```

---

## Output format

### Główny plik: `lead-magnet-[nazwa].md`

```markdown
---
title: "[Tytuł lead magnetu]"
brand: "[Nazwa marki]"
type: "[PDF Poradnik / Checklist / Quiz / Mini-kurs]"
target_audience: "[Opis grupy docelowej]"
created: "[Data]"
---

# [TYTUŁ]

[Treść lead magnetu...]
```

### Plik pomocniczy: `lead-magnet-[nazwa]-assets.md`

```markdown
# Assety do lead magnetu: [Nazwa]

## Formularz lead capture
[...]

## Popup copy
[...]

## Email sequence
[...]

## Notatki do konwersji PDF
- Sugerowane kolory: [z brandingu]
- Font: [z brandingu]
- Logo: [link do logo z Supabase Storage]
```

---

## Zapisywanie outputu

Zapisz wygenerowane pliki do:

```
c:/repos_tn/tn-crm/lead-magnets/[nazwa-marki]/
├── lead-magnet.md           # Główny content
├── assets.md                # Formularz, popup, email sequence
└── README.md                # Instrukcja użycia
```

```bash
# Utwórz folder
mkdir -p "c:/repos_tn/tn-crm/lead-magnets/[nazwa-marki]"
```

---

## Przykład: H2Vital (generator wodoru)

### Analiza

```
KATEGORIA: Zdrowie & Wellness
PRODUKT: Generator wody wodorowej
CENA: Premium (>1000 zł)
CYKL DECYZYJNY: Długi (dni/tygodnie)
WYMAGA EDUKACJI: TAK (nisza, mało znany temat)
MA WARIANTY: NIE

GRUPA DOCELOWA:
- Osoby 35-55 lat dbające o zdrowie
- Szukają naturalnych metod
- Sceptyczni wobec "cudów" ale otwarci na naukę
- Mają budżet na premium produkty

PROBLEMY/OBAWY:
- "Czy to działa? Czy to nie szarlataneria?"
- "Dlaczego tak drogo?"
- "Czym to się różni od zwykłej wody?"
- "Czy są badania naukowe?"

→ REKOMENDOWANY TYP: PDF Poradnik "5 mitów o wodzie wodorowej"
```

### Tytuł i struktura

```
TYTUŁ: "5 mitów o wodzie wodorowej które powstrzymują Cię przed lepszym zdrowiem"

STRUKTURA:
1. Mit: "Woda wodorowa to kolejny modny trend bez pokrycia"
2. Mit: "Wszystkie generatory wodoru działają tak samo"
3. Mit: "Wystarczy pić więcej zwykłej wody"
4. Mit: "To za drogie jak na wodę"
5. Mit: "Nie ma na to żadnych badań naukowych"

BONUS: "3 pytania które musisz zadać przed zakupem generatora"
```

### Lead magnet (skrócony przykład)

```markdown
---
title: "5 mitów o wodzie wodorowej które powstrzymują Cię przed lepszym zdrowiem"
brand: "H2Vital"
type: "PDF Poradnik"
target_audience: "Osoby 35-55 lat dbające o zdrowie naturalnie"
created: "2026-03-24"
---

# 5 mitów o wodzie wodorowej które powstrzymują Cię przed lepszym zdrowiem

## Wprowadzenie

Słyszałeś o wodzie wodorowej? Prawdopodobnie tak. I prawdopodobnie masz mieszane uczucia.

"Kolejny trend wellness", pomyślałeś. "Pewnie za rok nikt o tym nie będzie pamiętał."

Rozumiem ten sceptycyzm. Internet pełen jest "cudownych" produktów które obiecują wszystko, a dostarczają niewiele. Ale co jeśli powiem Ci, że za wodą wodorową stoją setki badań naukowych — i że większość tego, co "wiesz" na jej temat, to mity?

W tym poradniku obalę 5 najczęstszych mitów i dam Ci konkretne fakty, żebyś mógł podjąć świadomą decyzję.

---

## Mit #1: "Woda wodorowa to kolejny modny trend bez pokrycia"

**Co ludzie mówią:**
"To jak kurkuma, olej kokosowy i wszystkie inne 'superfoods' — modne przez chwilę, potem zapomniane."

**Prawda:**
Wodór molekularny (H2) jako czynnik terapeutyczny jest badany od 2007 roku. Do dziś opublikowano ponad 1000 recenzowanych badań naukowych na temat jego działania.

To nie jest trend — to nauka która dopiero dociera do mainstreamu.

**Kluczowe badania:**
- Badanie z 2010 (Nature Medicine): wodór molekularny jako selektywny antyoksydant
- Badanie z 2018: wpływ na markery stanu zapalnego
- Badanie z 2020: poprawa wydolności u sportowców

> **Pro tip:** Zanim uwierzysz w jakikolwiek "trend wellness", sprawdź PubMed. Jeśli są badania — to nie trend, to nauka.

---

## Mit #2: "Wszystkie generatory wodoru działają tak samo"

**Co ludzie mówią:**
"Po co przepłacać? Kupię najtańszy z Allegro."

**Prawda:**
Różnice w generatorach są OGROMNE — i mają bezpośredni wpływ na to, czy w ogóle pijesz wodę wodorową, czy tylko... wodę.

**Na co zwrócić uwagę:**
- **Stężenie H2** — powinno być min. 1.0 ppm (części na milion). Tanie generatory często dają 0.3-0.5 ppm — za mało, żeby miało znaczenie.
- **Technologia elektrolizy** — membrana PEM (Proton Exchange Membrane) jest standardem. Bez niej dostajesz chlor i ozon zamiast czystego H2.
- **Certyfikaty** — szukaj CE, SGS, badań laboratoryjnych.

> **Pro tip:** Poproś sprzedawcę o raport stężenia H2. Jeśli nie ma — nie kupuj.

---

[... kolejne mity ...]

---

## Podsumowanie

Woda wodorowa to nie magia — to nauka. Ale jak każde narzędzie, działa tylko wtedy, gdy używasz go prawidłowo.

**Co teraz?**

1. Zrób własny research — sprawdź badania na PubMed
2. Jeśli zdecydujesz się na zakup — użyj checklisty z bonusu
3. Daj sobie 30 dni na test — efekty kumulują się z czasem

---

## O H2Vital

H2Vital to generator wody wodorowej z technologią PEM, stężeniem 1.6 ppm i 2-letnią gwarancją. Jeśli chcesz dowiedzieć się więcej, odwiedź [h2vital.pl].

Masz pytania? Napisz do nas — odpowiadamy na każdą wiadomość.
```

### Formularz lead capture

```
NAGŁÓWEK: Pobierz darmowy poradnik
PODTYTUŁ: "5 mitów o wodzie wodorowej które powstrzymują Cię przed lepszym zdrowiem"

POLA:
- Email (wymagane)

PRZYCISK: "Pokaż →"

POD FORMULARZEM: "Bez spamu. 3 min czytania."
```

### Email sequence

```
EMAIL 1 (dzień 0): "Twój poradnik o wodzie wodorowej"
- Link do pobrania
- "Zacząłbym od mitu #3 — to zaskoczyło najwięcej osób"

EMAIL 2 (dzień 2): "Jedno pytanie do Ciebie"
- "Który mit najbardziej Cię zaskoczył?"
- Dodatkowy fakt naukowy
- Zaproszenie do odpowiedzi

EMAIL 3 (dzień 4): "Błąd który kosztował mnie 500 zł"
- Historia (fikcyjna) o zakupie taniego generatora
- Lekcja: nie wszystkie generatory są równe
- Checklist "Na co zwrócić uwagę"

EMAIL 4 (dzień 6): "Jak Ania pozbyła się migren"
- Historia klientki (może być uogólniona)
- Konkretne efekty po 30 dniach
- "Nie obiecuję cudów, ale..."

EMAIL 5 (dzień 8): "Czy masz jeszcze pytania?"
- "Zebrałem najczęstsze pytania od czytelników"
- FAQ format
- Soft CTA: "Jeśli chcesz sprawdzić nasz generator — tutaj link"
```

---

## Integracja z systemem

### Gdzie podpiąć formularz lead capture

1. **Na landing page** — popup exit intent lub sekcja przed FAQ
2. **Endpoint:** `/supabase/functions/lead-upsert` (już istnieje!)
3. **Trigger automatyzacji:** `lead_created` → wysyła email z lead magnetem

### Jak dodać automatyzację

```sql
-- 1. Dodaj email template do settings
INSERT INTO settings (key, value) VALUES
('email_template_lead_magnet_delivery_subject', 'Twój poradnik jest gotowy!'),
('email_template_lead_magnet_delivery_body', '[HTML emaila z linkiem do PDF]');

-- 2. Dodaj automation flow
INSERT INTO automation_flows (name, trigger_type, is_active, category) VALUES
('Lead Magnet - Dostawa PDF', 'lead_created', true, 'lead');

-- 3. Dodaj step: wyślij email
INSERT INTO automation_steps (flow_id, step_type, step_order, config) VALUES
([flow_id], 'action', 0, '{"action_type": "send_email", "email_type": "lead_magnet_delivery"}');
```

### Gdzie hostować PDF

1. Wygeneruj PDF z Markdown (Pandoc, Canva, lub ręcznie)
2. Upload do Supabase Storage: `attachments/lead-magnets/[nazwa].pdf`
3. Link publiczny: `https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/lead-magnets/[nazwa].pdf`

---

## Szablon promptu

```
Wygeneruj lead magnet dla workflow [UUID]

Instrukcje: c:\repos_tn\tn-crm\CLAUDE_LEAD_MAGNET_PROCEDURE.md
Env: c:\repos_tn\tn-crm\.env
```

---

## Checklist przed oddaniem

- [ ] Interaktywny HTML (`interactive.html`) działa na mobile i desktop
- [ ] Gate screen zbiera TYLKO email (podpięty do `lead-upsert`)
- [ ] Gate screen ma benefits list ("W 3 minuty dowiesz się...")
- [ ] 5-7 slajdów z wartościowym contentem
- [ ] Myth box (czerwony) + Truth box (zielony) — wyraźnie oddzielone
- [ ] Badge "MIT" (bez "Nieprawda", bez przekreślenia tytułu)
- [ ] CTA do landing page na ostatnim slajdzie (+ alternatywny link do koszyka)
- [ ] Logo z fixed height + object-fit: contain
- [ ] Branding zgodny z workflow (kolory, fonty)
- [ ] Email sequence outline (5 emaili)

---

## INTERAKTYWNY LEAD MAGNET — Instrukcje

### Struktura slajdów (8 slajdów)

```
0. INTRO      — Tytuł + "Pokaż pierwszy mit" button
1-5. MITY     — 5 slajdów z mitami (MYTH BOX + TRUTH BOX)
6. SUMMARY    — Podsumowanie + checklist
7. CTA        — Przycisk do landing page + alternatywny link do koszyka
```

### Jak analizować produkt

1. **Pobierz dane z Supabase:**
   - `workflows` — nazwa produktu, klient
   - `workflow_branding` — kolory, logo, tagline
   - `workflow_reports` — raporty z analizą (PDF, infografiki)

2. **Zidentyfikuj kategorię:**
   - Zdrowie & Wellness
   - Smart Home / AGD
   - Narzędzia / DIY
   - Fitness / Sport
   - Beauty / Skincare
   - Kids / Edukacja
   - Tech / Elektronika

3. **Znajdź 5 mitów/obiekcji:**
   - Co ludzie mówią negatywnego o tej kategorii produktów?
   - Jakie błędy popełniają kupujący?
   - Czego się boją?
   - Co ich powstrzymuje przed zakupem?

### Formuła mitu (każdy slajd)

**WAŻNE: Układ wizualny MIT vs PRAWDA**

Każdy slajd z mitem ma wyraźnie oddzielone dwie sekcje:

1. **MYTH BOX** (czerwony):
   - Czerwone tło, czerwona ramka
   - Badge "MIT" z ikoną X (SVG)
   - Tytuł mitu w cudzysłowie (BEZ przekreślenia!)
   - Cytowana obiekcja (italic)

2. **TRUTH BOX** (zielony):
   - Zielone tło, zielona ramka
   - Badge "Prawda" z ikoną checkmark (SVG)
   - Fakty obalające mit
   - Lista korzyści (jeśli pasuje)

```html
<!-- Struktura HTML mitu -->
<div class="myth-box">
  <span class="myth-box-label">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
      <path d="M18 6L6 18M6 6l12 12"/>
    </svg>
    MIT
  </span>
  <h2 class="myth-title">"Cytat mitu"</h2>
  <p class="myth-quote">"Typowa obiekcja w cudzysłowie"</p>
</div>

<div class="truth-box">
  <span class="truth-box-label">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
    Prawda
  </span>
  <p>2-3 zdania obalające mit z faktami/liczbami.</p>
  <ul>
    <li>Korzyść 1</li>
    <li>Korzyść 2</li>
  </ul>
</div>
```

**Dlaczego tak?** Czerwony box z "MIT" = fałsz, zielony box z "Prawda" = prawda. Samo rozróżnienie kolorami i etykietami wystarcza — bez przekreślenia tekstu.

### Placeholdery do zastąpienia

W szablonie HTML znajdź i zamień:

| Placeholder | Gdzie szukać |
|-------------|--------------|
| `{{LOGO_URL}}` | `workflow_branding` type=`logo` |
| `{{BRAND_NAME}}` | `workflow_branding` type=`brand_info` → name |
| `{{PRIMARY_COLOR}}` | `workflow_branding` type=`color` role=`primary` |
| `{{LANDING_URL}}` | `https://[marka].pl` — główny CTA |
| `{{CHECKOUT_URL}}` | `https://[marka].pl/checkout?products=...` — alternatywny link |
| `{{PRODUCT_FEATURES}}` | Z raportów lub landing page |

### Przykład: Kategoria → Mity

**Irygator (OraVibe):**
1. "Szczoteczka elektryczna wystarczy"
2. "Irygatory są tylko dla osób z aparatem"
3. "Tanie irygatory działają tak samo"
4. "Irygator może uszkodzić dziąsła"
5. "Efekty są niewidoczne"

**Robot sprzątający (Czystosz):**
1. "Roboty nie sprzątają tak dobrze jak człowiek"
2. "Roboty są tylko dla leniwych"
3. "Wszystkie roboty są takie same"
4. "Robot nie poradzi sobie z moim mieszkaniem"
5. "To gadżet — po miesiącu stoi w kącie"

**Generator wodoru (H2Vital):**
1. "Woda wodorowa to kolejny trend"
2. "Wszystkie generatory działają tak samo"
3. "Wystarczy pić więcej zwykłej wody"
4. "To za drogie jak na wodę"
5. "Nie ma na to badań naukowych"

### Wzorzec referencyjny

Zobacz działający przykład:
```
lead-magnets/oravibe/interactive.html
```

Skopiuj strukturę HTML i zamień:
- Treść slajdów (mity + prawdy)
- Kolory CSS variables
- Logo URL
- Landing page URL (główny CTA)
- Checkout URL (alternatywny link)

---

## CSS Variables do dostosowania

```css
:root {
  --primary: #00B4A6;      /* Z workflow_branding */
  --primary-dark: #009688;
  --accent: #34D399;
  /* ... reszta zostaje */
}
```

---

## Lead-upsert integration

Formularz wysyła do:
```javascript
fetch('https://yxmavwkwnfuphjqbelws.supabase.co/functions/v1/lead-upsert', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: data.get('email'),
    lead_source: 'lead_magnet_[nazwa]',
    notes: 'Interaktywny poradnik: [tytuł]'
  })
});
```

LocalStorage key: `[nazwa]_lead` — zapobiega ponownemu pytaniu.

---

## Gate screen — struktura

Gate screen zbiera email PRZED pokazaniem contentu. Struktura:

```html
<div class="gate-screen">
  <!-- Logo z fixed height -->
  <img src="{{LOGO_URL}}" alt="Logo" class="gate-logo">

  <h1 class="gate-title">{{TYTUŁ LEAD MAGNETU}}</h1>
  <p class="gate-subtitle">Darmowy poradnik który zmieni Twoje podejście do [temat]</p>

  <!-- Benefits list — zwiększa perceived value -->
  <div class="gate-benefits">
    <div class="gate-benefits-title">W 3 minuty dowiesz się:</div>
    <div class="gate-benefit">
      <svg><!-- checkmark --></svg>
      <span>Benefit 1</span>
    </div>
    <div class="gate-benefit">
      <svg><!-- checkmark --></svg>
      <span>Benefit 2</span>
    </div>
    <div class="gate-benefit">
      <svg><!-- checkmark --></svg>
      <span>Benefit 3</span>
    </div>
  </div>

  <!-- Formularz — TYLKO EMAIL -->
  <form class="gate-form" id="gateForm">
    <input type="email" name="email" placeholder="Twój email" required>
    <button type="submit">Pokaż →</button>
  </form>

  <!-- Trust indicators -->
  <div class="gate-trust">
    <span>Bez spamu</span>
    <span>•</span>
    <span>3 min czytania</span>
  </div>
</div>
```

**WAŻNE:** Formularz ma TYLKO pole email — bez imienia. Prostsze = wyższa konwersja.

---

## Logo handling

Logo często ma za dużo pustej przestrzeni w pliku. Rozwiązanie:

```css
/* Gate screen logo */
.gate-logo {
  width: 200px;
  height: 60px;
  object-fit: contain;
}

/* Header logo (mniejsze) */
.header-logo {
  height: 36px;
  width: auto;
  object-fit: contain;
}

/* Slide intro logo */
.slide-intro .slide-logo {
  width: 240px;
  height: 70px;
  object-fit: contain;
}
```

**`object-fit: contain`** + fixed height = logo dopasowuje się do przestrzeni, pusta przestrzeń z pliku jest "przycięta".

---

## CTA na końcu

CTA prowadzi do **landing page** (nie bezpośrednio do koszyka):

```html
<a href="https://[marka].pl" class="cta-button">Zobacz [Nazwa produktu]</a>
<a href="https://[marka].pl/checkout?products=..." class="cta-link">lub przejdź od razu do zamówienia</a>
```

Dlaczego landing page najpierw? Użytkownik może chcieć więcej info przed zakupem.
