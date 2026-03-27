# Procedura generowania obrazów AI dla landing pages

## WAŻNE: Działaj autonomicznie

**Nie pytaj o pozwolenie na każdy krok.** Wykonaj całą procedurę od początku do końca bez zatrzymywania się:
- Czytaj pliki bez pytania
- Generuj obrazy bez pytania
- Edytuj HTML bez pytania
- Commituj i pushuj bez pytania

Użytkownik uruchomił tę procedurę świadomie - oczekuje gotowego rezultatu, nie pytań.

---

## Kiedy używać

Gdy użytkownik prosi o:
- "wygeneruj obrazy dla landing page"
- "dodaj zdjęcia do strony"
- "uzupełnij grafiki"
- lub przy tworzeniu nowego landing page (po wygenerowaniu HTML)

---

## KROK 1: Pobierz dane workflow

### 1.1 Znajdź workflow po nazwie marki

```bash
curl -s "https://yxmavwkwnfuphjqbelws.supabase.co/functions/v1/get-workflow-data?brand_name=NAZWA_MARKI"
```

Funkcja zwraca:
- `workflow.id` - ID workflow
- `product.image_url` - **KRYTYCZNE** - zdjęcie referencyjne produktu
- `product.name`, `product.description` - opis produktu
- `branding` - kolory, fonty, tagline

### 1.2 Pobierz raporty z workflow

Raporty zawierają kluczowe informacje o grupie docelowej. Przeczytaj je z Supabase:

```sql
SELECT name, file_url, notes
FROM workflow_reports
WHERE workflow_id = 'ID_WORKFLOW';
```

**Lub** przeczytaj bezpośrednio pliki raportów (PDF/DOCX) jeśli są dostępne.

**Z raportów wyciągnij:**
- Kim jest typowy klient (wiek, płeć, sytuacja życiowa)
- Gdzie używa produktu (dom, biuro, mieszkanie, dom jednorodzinny)
- Jakie ma problemy (brak czasu, fizyczne ograniczenia, frustracje)
- Jaki styl życia prowadzi
- Jakie ma obawy przed zakupem

---

## KROK 2: Analiza landing page

### 2.1 Przeczytaj całą stronę

```bash
Read landing-pages/[nazwa]/index.html
```

### 2.2 Przeanalizuj KAŻDĄ sekcję indywidualnie

**Dla każdej sekcji w HTML odpowiedz na pytania:**

1. **Czy sekcja ma już miejsce na obraz?** (img tag, placeholder, div z background)
2. **Czy obraz jest potrzebny dla przekazu tej sekcji?**
3. **Jeśli nie ma miejsca ale powinno być** → EDYTUJ HTML żeby dodać miejsce na obraz

**Zasady:**
- **Hero** - ZAWSZE musi mieć obraz produktu (jeśli nie ma, dodaj)
- **Problem** - obraz pokazujący frustrację/ból klienta wzmacnia przekaz
- **Solution/Features** - produkt w akcji buduje zaufanie
- **How it works** - wizualna instrukcja ułatwia zrozumienie
- **Testimonials** - NIE generuj twarzy, użyj avatarów/inicjałów
- **FAQ** - tekst wystarczy
- **Offer** - zestaw produktów zwiększa postrzeganą wartość

**Każdy landing jest inny** - nie zakładaj że ma konkretne sekcje. Przeczytaj HTML i dostosuj się do tego co jest.

### 2.3 Określ kontekst wizualny

Na podstawie raportów i strony odpowiedz:

1. **Kto jest na zdjęciu?** (np. kobieta 35-45 lat, właścicielka mieszkania)
2. **Gdzie się dzieje scena?** (np. nowoczesne mieszkanie z dużymi oknami)
3. **Jaki problem rozwiązuje?** (np. mycie wysokich okien bez ryzyka)
4. **Jaki jest nastrój?** (np. ulga, wygoda, nowoczesność)

---

## KROK 3: Generowanie obrazów

### 3.1 Endpoint

```
POST https://yxmavwkwnfuphjqbelws.supabase.co/functions/v1/generate-image
```

### 3.2 Parametry

```json
{
  "prompt": "SZCZEGÓŁOWY PROMPT - patrz sekcja 3.3",
  "count": 1,
  "workflow_id": "nazwa-folderu",
  "type": "hero|solution|step1|step2|step3|offer",
  "reference_image_url": "URL_ZDJĘCIA_PRODUKTU"
}
```

### 3.3 Zasady tworzenia promptów

**KRYTYCZNE - każdy prompt MUSI zawierać:**

1. **Dokładny opis produktu** z referencji (kolor, kształt, detale)
2. **Realistyczny kontekst klienta** (nie abstrakcyjne tło)
3. **Konkretną sytuację użycia** (nie "produkt na białym tle")
4. **Styl fotografii** (product photography, lifestyle, instructional)
5. **"No text, no captions, no labels, no watermarks"** - ZAWSZE na końcu każdego promptu

**ZAKAZ HALUCYNACJI - opisuj TYLKO to co widzisz na referencji:**
- NIE dodawaj funkcji/przycisków/wyświetlaczy których nie ma na produkcie
- NIE wymyślaj efektów (spray wodny, LED, animacje) jeśli ich nie widać
- NIE zgaduj kolorów ani detali - opisuj TYLKO widoczne elementy
- Jeśli czegoś nie widzisz na zdjęciu referencyjnym - NIE opisuj tego

**Szablon promptu:**

```
[SYTUACJA]: [KTO] używa [PRODUKT - dokładny opis z referencji] w [GDZIE - realistyczne miejsce].

[KONTEKST]: [Co robi, dlaczego, jaki problem rozwiązuje].

[SZCZEGÓŁY WIZUALNE]: [Oświetlenie, perspektywa, nastrój].

[STYL]: Professional product photography, [lifestyle/instructional/advertising] style. Photorealistic. No text, no captions, no labels, no watermarks.
```

### 3.4 Przykłady promptów dla różnych sekcji

**HERO (zawsze wymagane):**
```
A white robotic window cleaner (exact model from reference - square shape with blue accents)
attached to a large floor-to-ceiling window in a modern apartment.
A woman in her 40s watches from a comfortable sofa, relaxed and smiling.
Bright natural daylight, city view through sparkling clean glass.
The robot is actively cleaning, visible water spray.
Professional product photography, lifestyle advertising style. Photorealistic, high-end.
```

**PROBLEM:**
```
A frustrated woman in her 40s standing on an unstable ladder, struggling to clean
a high window with a traditional squeegee. Worried expression, tense posture.
Modern apartment interior, the window is clearly dirty and streaked.
Natural lighting, documentary style. Shows the real struggle of manual window cleaning.
```

**SOLUTION/BENTO:**
```
Close-up of [DOKŁADNY OPIS PRODUKTU] on a glass surface, showing the cleaning mechanism
in action. Microfiber pads visible, water spray system active.
Crystal clear glass on one side, being cleaned on the other.
Studio product photography with soft natural light. Premium tech aesthetic.
```

**HOW IT WORKS - Step 1 (Attach):**
```
Human hands placing [DOKŁADNY OPIS PRODUKTU] onto a window surface.
Close-up showing the moment of attachment, suction activation visible.
Modern home interior, natural daylight. Instructional photography style.
Clear, educational composition showing the action.
```

**HOW IT WORKS - Step 2 (Start):**
```
A finger pressing the START button on [DOKŁADNY OPIS PRODUKTU].
The robot is attached to glass, LED indicator glowing.
Close-up of control panel. Clean, bright setting.
Instructional product photography, step-by-step guide style.
```

**HOW IT WORKS - Step 3 (Result):**
```
Before/after split view: left side shows dirty, smudged window glass,
right side shows crystal clear, sparkling clean glass with [PRODUKT] visible.
Dramatic difference in clarity. Sunlight streaming through the clean side.
Professional advertising photography, transformation reveal style.
```

**OFFER (zestaw):**
```
Complete product set laid out on a clean surface: [PRODUKT], remote control,
cleaning pads, power adapter, safety rope, user manual.
All items neatly arranged, premium unboxing aesthetic.
Studio product photography, e-commerce style. White/light background.
```

---

## KROK 4: Wstawianie obrazów do HTML

### 4.0 WAŻNE: Używaj CSS, NIE inline styles!

**NIGDY nie używaj inline styles dla obrazów.** Obrazy z fixed height/width się ucinają na różnych ekranach.

Zamiast tego:
1. Dodaj klasę CSS z `aspect-ratio` i `object-fit: cover`
2. Użyj tylko klasy w HTML, bez `style="..."`

### 4.1 Wymagane klasy CSS dla obrazów

**⚠️ KRYTYCZNE: Landing page ma style tylko dla `.img-placeholder` - MUSISZ dodać style dla `img`!**

Gdy zamieniasz placeholder na prawdziwy obraz, HTML zmienia się z:
```html
<div class="hero-product"><div class="img-placeholder">...</div></div>
```
na:
```html
<div class="hero-product"><img src="..." alt="..."></div>
```

**Ale style `.hero-product .img-placeholder` NIE DZIAŁAJĄ dla `img`!** Musisz dodać osobne style dla `img`.

**ZAWSZE dodaj ten blok CSS po sekcji `.img-placeholder` (przed HEADER):**

```css
/* ═══════════════════════════════════════════════════════════
   IMAGE STYLES (replacing placeholders)
═══════════════════════════════════════════════════════════ */

.hero-product img {
  width: 100%;
  aspect-ratio: 3/4;
  object-fit: cover;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
}

.problem-visual img {
  width: 100%;
  aspect-ratio: 4/3;
  object-fit: cover;
  border-radius: var(--radius-xl);
}

.bento-image img {
  width: 100%;
  aspect-ratio: 16/9;
  object-fit: cover;
  border-radius: var(--radius-md);
}

.step-image img {
  width: 100%;
  aspect-ratio: 4/3;
  object-fit: cover;
  display: block;
}

.offer-product img {
  width: 100%;
  aspect-ratio: 1/1;
  object-fit: cover;
  border-radius: var(--radius-lg);
}
```

**Dlaczego to ważne:**
- `aspect-ratio` - utrzymuje proporcje obrazu
- `object-fit: cover` - obraz wypełnia kontener bez rozciągania
- `width: 100%` - obraz skaluje się z kontenerem
- `display: block` - usuwa dolny margines pod obrazem

### 4.2 HTML - zamień placeholder na img

**Przed (placeholder):**
```html
<div class="hero-product">
  <div class="img-placeholder">
    <div class="ph-icon">...</div>
    <span class="ph-label">Hero Image</span>
  </div>
</div>
```

**Po (z obrazem):**
```html
<div class="hero-product">
  <img src="[URL]" alt="[Nazwa produktu] - opis kontekstu">
</div>
```

**Wzorce dla każdej sekcji:**

| Sekcja | Kontener | Aspect Ratio |
|--------|----------|--------------|
| Hero | `.hero-product` | 3/4 |
| Problem | `.problem-visual` | 4/3 |
| Bento/Solution | `.bento-image` (wewnątrz `.bento-card`) | 16/9 |
| Steps | `.step-image` (wewnątrz `.step-card`) | 4/3 |
| Offer | `.offer-product` | 1/1 |

**Przykłady zamian:**

```html
<!-- Problem -->
<div class="problem-visual fade-in">
  <img src="[URL]" alt="Tradycyjne sprzątanie - frustracja">
</div>

<!-- Bento card z obrazem -->
<div class="bento-card fade-in">
  <div class="bento-image">
    <img src="[URL]" alt="Produkt w akcji">
  </div>
  <div class="bento-icon">...</div>
  <h3 class="bento-title">...</h3>
</div>

<!-- Step -->
<div class="step-card fade-in">
  <div class="step-image">
    <img src="[URL]" alt="Krok 1 - Napełnij zbiornik">
  </div>
  <div class="step-content">...</div>
</div>

<!-- Offer -->
<div class="offer-product">
  <img src="[URL]" alt="Kompletny zestaw z akcesoriami">
</div>
```

**WAŻNE:**
- Zachowaj istniejącą strukturę HTML (kontenery, klasy)
- Zamień tylko wnętrze - `div.img-placeholder` → `img`
- Alt text musi być opisowy (dla SEO i accessibility)

**Offer (pełna struktura):**
```html
<div class="offer-box fade-in">
  <div class="offer-product">
    <img src="[URL]" alt="[Nazwa zestawu]">
  </div>
  <div class="offer-content">
    <!-- treść oferty -->
  </div>
</div>
```

---

## KROK 5: Weryfikacja i deploy

### 5.1 Sekcje które MUSZĄ mieć obrazy (checklist)

| Sekcja | Obraz | Aspect Ratio | Co pokazuje |
|--------|-------|--------------|-------------|
| **Hero** | ZAWSZE | 1:1 | Produkt w lifestyle context |
| **Problem** | TAK | 4:3 | Frustracja/ból klienta |
| **Solution/Bento** | TAK | 21:9 | Produkt w akcji |
| **How it works** | TAK (każdy krok) | 16:10 | Instrukcja krok po kroku |
| **Offer** | TAK | 1:1 | Kompletny zestaw produktowy |
| Testimonials | NIE | - | Avatary/inicjały |
| FAQ | NIE | - | Tekst wystarczy |

### 5.2 Checklist przed deployem

- [ ] **Wszystkie wymagane sekcje mają obrazy** (Hero, Problem, Solution, Steps, Offer)
- [ ] **Brak inline styles na img** - wszystko przez klasy CSS
- [ ] **CSS ma aspect-ratio** dla każdego typu obrazu
- [ ] **Responsive działa** - sprawdź na mobile
- [ ] Wszystkie obrazy pokazują TEN SAM produkt (spójność)
- [ ] Obrazy są osadzone w realistycznym kontekście klienta
- [ ] Alt texty są opisowe

### 5.2 Deploy na Vercel

```bash
cd /c/repos_tn/tn-crm
git add landing-pages/[nazwa]/
git commit -m "[Nazwa]: Add AI-generated product images"
git push
```

### 5.3 Podaj link użytkownikowi

```
https://tn-crm.vercel.app/landing-pages/[nazwa]/
```

---

## Typowe błędy - NIE RÓB TEGO

### Błędy CSS/HTML (powodują ucięte obrazy!)

1. **Inline styles z fixed height** - `style="height: 180px"` → obraz się ucina
2. **Brak aspect-ratio w CSS** - obraz rozjeżdża layout
3. **Brak object-fit: cover** - obraz się rozciąga/ściska
4. **Inline grid styles** - `style="display: grid"` → nie działa responsive

**ROZWIĄZANIE:** Zawsze używaj klas CSS z `aspect-ratio` i `object-fit: cover`

### Błędy generowania

5. **Generowanie bez referencji produktu** - obrazy będą niespójne
6. **Abstrakcyjne tła** - używaj realistycznych wnętrz klientów
7. **Pomijanie sekcji** - Hero, Problem, Solution, Steps, Offer MUSZĄ mieć obrazy
8. **Ignorowanie raportów** - raporty zawierają kluczowe info o kliencie
9. **Generyczne osoby** - pokazuj konkretną grupę docelową (wiek, płeć, sytuacja)
10. **Zbyt dużo obrazów** - 5-7 obrazów wystarczy, nie rób galerii
11. **Tekst na obrazach** - NIGDY nie generuj napisów, etykiet, watermarków
12. **Halucynowanie funkcji** - NIE dodawaj przycisków, LED, sprayu których nie ma na referencji

---

## Sekcje które NIE potrzebują obrazów AI

- **Testimonials** - używaj avatarów/inicjałów, nie generuj twarzy
- **FAQ** - tekst wystarczy
- **Footer** - logo wystarczy
- **Trust bar** - ikony/loga partnerów

---

## Podsumowanie flow

```
1. Pobierz workflow data (produkt + image_url)
2. Przeczytaj raporty → zrozum klienta (wiek, płeć, gdzie mieszka, problemy)
3. Przeczytaj CAŁY landing HTML
4. Przeanalizuj KAŻDĄ sekcję:
   - Czy ma miejsce na obraz?
   - Czy obraz wzmocni przekaz?
   - Jeśli nie ma miejsca ale powinno być → edytuj HTML
5. Napisz prompty osadzone w realiach klienta
6. Generuj z reference_image_url (spójność produktu!)
7. Wstaw do HTML (edytuj jeśli trzeba dodać miejsce)
8. Deploy + link
```

