# Procedura dopracowania designu Landing Page

**Kiedy wywołać:** Po zakończeniu weryfikacji treści (CLAUDE_LANDING_REVIEW.md).

Ta procedura przekształca "poprawny szablon" w **wyróżniającą się stronę marki**.

---

## 1. Analiza obecnego stanu

Przed zmianami odpowiedz:
1. **Czy strona wygląda jak szablon?** (generyczna, przewidywalna, "widziałem to 100 razy")
2. **Co jest charakterystyczne dla tej marki?** (kolory, ton, energia)
3. **Jaki jest jeden element, który ktoś zapamięta?** (jeśli nie ma — musisz go stworzyć)

---

## 2. Wybór kierunku estetycznego

Strona musi mieć **ODWAŻNY, SPÓJNY KIERUNEK**. Wybierz jeden:

| Kierunek | Charakterystyka | Dla jakich produktów |
|----------|-----------------|---------------------|
| **Luxury/Refined** | Dużo białej przestrzeni, subtelne animacje, złote/srebrne akcenty | Premium, kosmetyki, biżuteria |
| **Playful/Toy-like** | Zaokrąglone kształty, żywe kolory, bounce animations | Produkty dla dzieci, pet care, gadżety |
| **Brutalist/Raw** | Mocne kontrasty, surowe fonty, grid-breaking elementy | Tech, startupy, edgy brands |
| **Organic/Natural** | Miękkie gradienty, naturalne kolory, fluid shapes | Wellness, eko, zdrowie |
| **Editorial/Magazine** | Duża typografia, asymetryczne layouty, dużo zdjęć | Lifestyle, moda, artykuły |
| **Retro-Futuristic** | Neon na ciemnym, glitch effects, cyber vibes | Gaming, tech, młody target |

**ZAPISZ WYBRANY KIERUNEK** — wszystkie decyzje muszą być z nim spójne.

---

## 3. Checklist elementów do dopracowania

### A. Typografia — NIE UŻYWAJ GENERYCZNYCH FONTÓW

**Zakazane:** Inter, Roboto, Arial, Open Sans, system fonts

**Sprawdź:**
- [ ] Heading font jest charakterystyczny i pasuje do kierunku
- [ ] Body font jest czytelny ale nie nudny
- [ ] Jest font akcentowy (np. do cytatów, badge'ów)
- [ ] Rozmiary tworzą wyraźną hierarchię (nie 16/18/20 — raczej 16/24/48)
- [ ] Line-height i letter-spacing są dopracowane

**Sugestie fontów wg kierunku:**
- Luxury: Playfair Display, Cormorant, Libre Baskerville
- Playful: Quicksand, Nunito, Fredoka, Baloo 2
- Brutalist: Space Mono, IBM Plex Mono, Archivo Black
- Organic: Lora, Merriweather, Source Serif Pro
- Editorial: Fraunces, Newsreader, Libre Bodoni

### B. Kolory — DOMINACJA + AKCENT, NIE RÓWNOMIERNY ROZKŁAD

**Sprawdź:**
- [ ] Jest wyraźny kolor dominujący (>60% powierzchni)
- [ ] Akcent jest MOCNY i używany oszczędnie
- [ ] Gradienty są subtelne lub odważne — nie "w połowie drogi"
- [ ] Ciemne tła mają głębię (nie czysty #000000)
- [ ] Jasne tła mają ciepło lub chłód (nie czysty #FFFFFF)

**Techniki:**
```css
/* Zamiast czystej czerni */
--bg-dark: #0a0a0f;  /* z nutą granatu */
--bg-dark: #0f0a0a;  /* z nutą burgundu */

/* Zamiast czystej bieli */
--bg-light: #fefdfb;  /* ciepła */
--bg-light: #f8fafc;  /* chłodna */
```

### C. Przestrzeń i układ — PRZEŁAM PRZEWIDYWALNOŚĆ

**Sprawdź:**
- [ ] Nie wszystkie sekcje mają ten sam padding
- [ ] Jest przynajmniej jeden element "grid-breaking" (wychodzi poza kontener)
- [ ] Jest asymetria lub overlap gdzieś na stronie
- [ ] Negatywna przestrzeń jest celowa, nie przypadkowa
- [ ] Karty/elementy nie są wszystkie identyczne

**Techniki:**
- Sekcja hero może być wyższa niż 100vh
- Element może "wystawać" poza swoją sekcję
- Tekst może nachodzić na obraz
- Różne sekcje mogą mieć różne szerokości kontenera

### D. Animacje i micro-interactions — QUALITY OVER QUANTITY

**Sprawdź:**
- [ ] Page load ma orchestrated reveal (staggered animations)
- [ ] Hover states są zaskakujące (nie tylko kolor)
- [ ] Scroll animations dodają wartość (nie rozpraszają)
- [ ] Jest przynajmniej jeden "wow moment"
- [ ] Animacje są płynne (60fps, transform/opacity only)

**Techniki:**
```css
/* Staggered reveal */
.card:nth-child(1) { animation-delay: 0ms; }
.card:nth-child(2) { animation-delay: 100ms; }
.card:nth-child(3) { animation-delay: 200ms; }

/* Zaskakujący hover */
.card:hover {
  transform: translateY(-8px) rotate(-1deg);
  box-shadow: 20px 20px 0 var(--accent);
}
```

### E. Tekstury i tła — DODAJ GŁĘBIĘ

**Sprawdź:**
- [ ] Tła nie są "płaskie" (mają gradient, noise, pattern)
- [ ] Jest przynajmniej jedna sekcja z wyróżniającym się tłem
- [ ] Shadows mają kolor (nie czysty czarny)
- [ ] Jest coś interesującego w tle hero (nie plain gradient)

**Techniki:**
```css
/* Noise texture overlay */
.section::before {
  content: '';
  position: absolute;
  inset: 0;
  background: url("data:image/svg+xml,...") repeat;
  opacity: 0.03;
}

/* Colored shadows */
box-shadow: 0 20px 40px rgba(var(--primary-rgb), 0.15);

/* Mesh gradient */
background:
  radial-gradient(at 20% 30%, var(--color1) 0%, transparent 50%),
  radial-gradient(at 80% 70%, var(--color2) 0%, transparent 50%);
```

### F. Detale, które robią różnicę

**Sprawdź:**
- [ ] Ikony są spójne stylistycznie (nie mix różnych zestawów)
- [ ] Buttony mają charakterystyczny kształt (nie generic rounded)
- [ ] Dividers/separatory są ciekawe (nie zwykła linia)
- [ ] Liczby/statystyki mają wyróżniający styl
- [ ] Badge'e/tagi mają osobowość

---

## 4. Proces dopracowania

### Krok 1: Audit
Przejrzyj całą stronę i zanotuj:
- Co wygląda generycznie?
- Co można wzmocnić?
- Gdzie brakuje charakteru?

### Krok 2: Hero jako priorytet
Hero to 80% pierwszego wrażenia. Upewnij się że:
- Wizualnie zatrzymuje scrollowanie
- Ma unikalny element (animacja, układ, efekt)
- Natychmiast komunikuje ton marki

### Krok 3: Signature elements
Stwórz 2-3 elementy powtarzające się na stronie:
- Charakterystyczny styl kart
- Unikalny sposób prezentacji liczb
- Spójny styl hover effects

### Krok 4: Polish pass
Przejdź sekcja po sekcji i dopracuj detale:
- Spacing
- Shadows
- Border radius
- Transitions

---

## 5. Anty-wzorce (NIE RÓB TEGO)

- ❌ Wszystkie sekcje z tym samym paddingiem i layoutem
- ❌ Karty które różnią się tylko treścią
- ❌ Gradienty purple-to-blue na białym tle (AI slop)
- ❌ Hover = tylko zmiana koloru
- ❌ Fonty Inter, Roboto, Arial
- ❌ Czysta czerń (#000) i biel (#FFF)
- ❌ Box-shadow z czarnym kolorem
- ❌ Brak żadnych animacji
- ❌ Wszystko idealnie wycentrowane

---

## 6. Checklist przed zakończeniem

- [ ] Strona ma wyraźny kierunek estetyczny
- [ ] Jest przynajmniej jeden "wow moment"
- [ ] Typografia jest charakterystyczna
- [ ] Kolory mają głębię i ciepło/chłód
- [ ] Animacje są płynne i celowe
- [ ] Detale są dopracowane
- [ ] Strona NIE wygląda jak szablon

---

## 7. Raport dla użytkownika

Po zakończeniu przedstaw:

```
## Design Review: [nazwa]

### Kierunek estetyczny: [wybrany kierunek]

### Wprowadzone zmiany:
- [lista zmian wizualnych]

### Signature elements:
- [elementy charakterystyczne dla tej strony]

### Link: https://tn-crm.vercel.app/landing-pages/[nazwa]/
```
