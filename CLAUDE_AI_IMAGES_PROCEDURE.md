# Procedura generowania obrazów AI dla landing pages

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

**Szablon promptu:**

```
[SYTUACJA]: [KTO] używa [PRODUKT - dokładny opis z referencji] w [GDZIE - realistyczne miejsce].

[KONTEKST]: [Co robi, dlaczego, jaki problem rozwiązuje].

[SZCZEGÓŁY WIZUALNE]: [Oświetlenie, perspektywa, nastrój].

[STYL]: Professional product photography, [lifestyle/instructional/advertising] style. Photorealistic.
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

### 4.1 Hero - zawsze pełna szerokość

```html
<div class="hero-image">
  <img src="[URL]" alt="[Nazwa produktu] w akcji"
       style="width: 100%; max-width: 600px; border-radius: 24px; box-shadow: 0 20px 60px rgba(0,0,0,0.15);">
</div>
```

### 4.2 Solution/Bento - jako pierwszy element grid

```html
<div class="bento-card bento-image fade-in" style="grid-column: span 2; padding: 0; overflow: hidden;">
  <img src="[URL]" alt="[Opis]" style="width: 100%; height: 320px; object-fit: cover;">
</div>
```

### 4.3 How it works - obraz nad każdym krokiem

```html
<div class="step fade-in">
  <div class="step-image" style="margin-bottom: 20px; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.1);">
    <img src="[URL]" alt="Krok X - [Opis]" style="width: 100%; height: 180px; object-fit: cover;">
  </div>
  <div class="step-number">X</div>
  <h3 class="step-title">...</h3>
  ...
</div>
```

### 4.4 Responsive - dodaj CSS dla mobile

```css
@media (max-width: 900px) {
  .bento-image {
    grid-column: span 1 !important;
  }
}
```

---

## KROK 5: Weryfikacja i deploy

### 5.1 Checklist przed deployem

- [ ] Hero ma obraz produktu
- [ ] Wszystkie obrazy pokazują TEN SAM produkt (spójność)
- [ ] Obrazy są osadzone w realistycznym kontekście klienta
- [ ] Brak abstrakcyjnych/oderwanych od rzeczywistości grafik
- [ ] Alt texty są opisowe
- [ ] Responsive działa na mobile

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

1. **Generowanie bez referencji produktu** - obrazy będą niespójne
2. **Abstrakcyjne tła** - używaj realistycznych wnętrz klientów
3. **Pomijanie Hero** - Hero ZAWSZE musi mieć obraz
4. **Ignorowanie raportów** - raporty zawierają kluczowe info o kliencie
5. **Generyczne osoby** - pokazuj konkretną grupę docelową (wiek, płeć, sytuacja)
6. **Zbyt dużo obrazów** - 5-7 obrazów wystarczy, nie rób galerii

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

