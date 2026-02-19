# Procedura: Generowanie Landing Page dla Workflow

> **WAŻNE**: Zawsze pisz z polskimi znakami diakrytycznymi (ą, ę, ć, ś, ź, ż, ó, ł, ń) — dotyczy to całego copy na landing page (nagłówki, opisy, FAQ, CTA).

## Kiedy wywołać

Uzytkownik mowi np.: "Zrob landing dla workflow X", "Wygeneruj strone sprzedazowa", "Zbuduj landing page".

## Wymagane dane wejsciowe

1. **workflow_id** — UUID workflow
2. **Branding** — dane z tabeli `workflow_branding` (brand_info, colors, fonts)
3. **Raport PDF** — raport typu `report_pdf` z analiza produktu, USP, grupa docelowa
4. **Produkt** — dane z `workflow_products` (nazwa, opis, cena)
5. **Deep Research** — opcjonalnie dodatkowy kontekst od uzytkownika

## Co generuje

Kompletny plik `index.html` gotowy do wrzucenia do folderu `landing-pages/[nazwa-marki]/`.

## Architektura strony (sekcje)

Kazdy landing sklada sie z tych sekcji w kolejnosci:

| # | Sekcja | Funkcja | Elementy |
|---|--------|---------|----------|
| 1 | **Header** | Nawigacja | Logo, linki (Funkcje, Opinie, FAQ), CTA button, hamburger mobile |
| 2 | **Mobile Menu** | Nawigacja mobilna | Fullscreen overlay z linkami |
| 3 | **Hero** | Pierwsze wrazenie | Headline, subheadline, dual CTA, badges, hero image/video, glow effects |
| 4 | **Trust Bar** | Budowanie zaufania | 4-5 ikon z wartosciami (gwarancja, dostawa, etc.) |
| 5 | **Problem** | PAS: Agitacja | Headline z pytaniem, opis bolu, statystyki, wizualizacja |
| 6 | **Solution (Bento)** | Prezentacja produktu | Grid 2x2 z features, spotlight hover effect |
| 7 | **How It Works** | Edukacja | 3 kroki z ikonami i opisami |
| 8 | **Comparison** | Wyzszość vs konkurencja | Tabela porownawcza |
| 9 | **Social Proof** | Dowod spoleczny | Marquee z logami, karty z opiniami |
| 10 | **FAQ** | Eliminacja obiekcji | Accordion z 5-7 pytaniami |
| 11 | **Offer** | Finalizacja | Product box z cena, lista zawartosci, CTA, gwarancja |
| 12 | **CTA Banner** | Ostatnia szansa | Prosty headline + CTA |
| 13 | **Footer** | Informacje | 3 kolumny: brand, linki, kontakt |
| 14 | **Sticky CTA** | Mobile conversion | Przyklejony przycisk na dole (tylko mobile) |
| 15 | **Cookie Banner** | Compliance | RODO zgoda |

## Wzorce designu

> **WAŻNE**: Domyślnie ZAWSZE używaj jasnego motywu (białe tło). Ciemny motyw stosuj TYLKO gdy użytkownik wyraźnie o to poprosi lub produkt jest stricte z kategorii gaming/tech.

### Unikaj typowych wzorców "AI-generated" (WAŻNE!)

**NIE UŻYWAJ tych elementów — wyglądają generycznie:**

| Element | Dlaczego źle | Co zamiast |
|---------|--------------|------------|
| `border-left: 4px solid [kolor]` na kartach | Typowy wzorzec AI, wygląda tanio | Subtelny cień + hover effect |
| Tabela porównawcza z ✓ i ✗ | Najbardziej oczywisty wzorzec AI | Dwie karty z opisowym tekstem |
| Czerwone/pomarańczowe kolory dla statystyk "problemu" | Zbyt oczywiste, krzykliwe | Użyj text-primary lub neutralnych kolorów |
| Ikonki z checkmarks w każdym elemencie listy | Przewidywalne, nudne | Prosta lista lub numeracja |
| Gradient border-top na kartach | Wygląda na wygenerowane | Brak lub bardzo subtelny |
| "Neon glow" efekty na wszystkim | Przestarzałe, 2020 | Subtelne cienie, blur |

**Zasada ogólna:** Jeśli element wygląda jak z szablonu lub "zbyt designersko" — usuń go. Prostota > efekty.

### Motyw jasny (DOMYŚLNY - używaj zawsze!)
- Background: `#FFFFFF` (główny) i `#F8FAFC` (sekcje alternatywne)
- Tekst: `#111827` (dark) z `#6B7280` (secondary)
- Akcenty: kolory z brandingu (primary, secondary, accent)
- Efekty: subtle shadows, soft gradients, clean borders
- Karty: białe z delikatnym cieniem i border `#E5E7EB`
- Header/Footer: białe lub bardzo jasne

### Wykorzystanie kolorów marki w sekcjach (WAŻNE!)

Kolory z brandingu (primary, secondary, accent) powinny być widoczne w **każdej sekcji** landing page. Nie zostawiaj sekcji czysto białych/szarych — dodawaj subtelne gradienty i akcenty.

| Sekcja | Tło | Akcenty kolorystyczne |
|--------|-----|----------------------|
| **Hero** | Gradient: `rgba(primary,0.03)` → white → `rgba(secondary,0.03)` | Glow z primary, badge z primary |
| **Trust Bar** | Gradient: `rgba(primary,0.04)` → `rgba(secondary,0.04)` | Ikony w primary, hover z primary shadow |
| **Problem** | Ciepły odcień primary: `#FFF5F0` lub podobny | Statystyki w kolorze ostrzegawczym |
| **Solution/Bento** | White → `rgba(secondary,0.05)` | Naprzemienne ikony primary/secondary na kartach |
| **How It Works** | Ciepły odcień accent: `#FFF8E7` | Numery kroków w różnych kolorach (primary → secondary → green) |
| **Comparison** | `rgba(secondary,0.05)` → white | Podświetlona kolumna produktu z `rgba(primary,0.08)` |
| **Testimonials** | White → `rgba(primary,0.03)` | Gwiazdki w accent, avatary w primary-soft |
| **FAQ** | `rgba(secondary,0.05)` → white | Ikony strzałek w primary |
| **Offer** | Gradient: `rgba(primary,0.05)` → white → `rgba(secondary,0.05)` | Animowany border z primary+secondary+accent, cena w primary |
| **CTA Banner** | **Gradient: primary → secondary** (pełne kolory!) | Biały tekst, biały przycisk z primary tekstem |
| **Footer** | Jasny `#FAFAFA` | Border-top gradient primary → secondary |

### Przykłady CSS dla kolorowych tł sekcji

```css
/* Hero - ciepły gradient */
.hero { background: linear-gradient(135deg, #FFF7F3 0%, #FFF 50%, #F0FDFA 100%); }

/* Trust Bar - subtelny gradient z border */
.trust-bar {
  background: linear-gradient(90deg, rgba(primary,0.04) 0%, rgba(secondary,0.04) 100%);
  border-top: 1px solid rgba(primary,0.1);
}

/* Problem - ciepły orange */
.problem { background: linear-gradient(180deg, #FFFBF8 0%, #FFF5F0 100%); }

/* CTA Banner - pełne kolory! */
.cta-banner { background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%); }
.cta-banner .cta-title { color: #FFFFFF; }
.cta-banner .btn-primary { background: #FFFFFF; color: var(--primary); }
```

### Hover effects z kolorami marki

```css
.trust-item:hover {
  border-color: var(--primary);
  box-shadow: 0 4px 12px rgba(primary, 0.15);
}

.bento-card:hover {
  border-color: var(--primary);
  box-shadow: 0 12px 24px rgba(primary, 0.15);
}

/* Naprzemienne kolory dla kart */
.bento-card:nth-child(2):hover { border-color: var(--secondary); }
.bento-card:nth-child(2) .bento-icon { background: rgba(secondary, 0.1); }
.bento-card:nth-child(2) .bento-icon svg { color: var(--secondary); }
```

### Motyw ciemny (TYLKO na życzenie - tech/gaming)
- Background: `#0A0A0A` lub `#0D1117`
- Tekst: `#FFFFFF` z opacity 0.5-1.0
- Akcenty: neonowe (cyan, magenta, lime)
- Efekty: glow, particles, noise texture
- Przyklad: VibeStrike

## Tech Stack (vanilla)

```
- HTML5 semantic
- CSS3 (custom properties, grid, flexbox)
- Vanilla JS (intersection observer dla fade-in, hamburger)
- Google Fonts
- Zero dependencies
```

## CSS Architecture

### Zmienne CSS (root)
```css
:root {
  /* Brand Colors */
  --primary: [kolor z brandingu];
  --secondary: [kolor z brandingu];
  --accent: [kolor z brandingu];
  --neutral-dark: [kolor z brandingu];
  --neutral-mid: [kolor z brandingu];
  --neutral-light: [kolor z brandingu];

  /* Derived */
  --primary-soft: rgba([primary], 0.08);
  --primary-glow: rgba([primary], 0.25);

  /* Typography */
  --font-heading: '[font-heading]', sans-serif;
  --font-body: '[font-body]', sans-serif;
  --font-accent: '[font-accent]', monospace;
}
```

### Utility Classes
```css
.container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
.fade-in { opacity: 0; transform: translateY(40px); transition: 0.8s; }
.fade-in.visible { opacity: 1; transform: translateY(0); }
.section-label { font-family: var(--font-accent); font-size: 11px; text-transform: uppercase; letter-spacing: 3px; }
```

### Responsive Breakpoints
```css
@media (max-width: 768px) { /* Tablet/Mobile */ }
@media (max-width: 480px) { /* Small mobile */ }
@media (max-width: 380px) { /* Extra small */ }
```

## Komponenty

### Header (Glassmorphism)
```css
.header {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  backdrop-filter: blur(20px);
  background: rgba([bg], 0.7);
  border-bottom: 1px solid rgba([primary], 0.08);
}
```

### Trust Bar (WAŻNE - jedna linia!)

**Trust Bar MUSI być w jednej linii na desktop.** Użyj `flex-wrap: nowrap` i kompaktowych rozmiarów.

```css
.trust-items {
  display: flex;
  justify-content: center;
  gap: 20px;           /* NIE 48px - za duże! */
  flex-wrap: nowrap;   /* WAŻNE: nowrap na desktop */
}

.trust-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;  /* Kompaktowy padding */
  flex-shrink: 0;
}

.trust-icon {
  width: 40px;         /* NIE 48px */
  height: 40px;
  flex-shrink: 0;
}

.trust-text {
  white-space: nowrap; /* Zapobiega łamaniu tekstu */
}

.trust-text strong { font-size: 13px; }
.trust-text span { font-size: 12px; }

/* Mobile - wtedy flex-wrap: wrap */
@media (max-width: 768px) {
  .trust-items {
    flex-wrap: wrap;
    gap: 16px;
  }
}
```

### Hero Glow Effect
```css
.hero-glow {
  position: absolute; width: 900px; height: 900px; border-radius: 50%;
  background: radial-gradient(circle, rgba([primary], 0.2) 0%, transparent 70%);
  animation: glow-pulse 4s ease-in-out infinite alternate;
}
```

### Hero Background Animation (WYMAGANE!)

**KAŻDY landing MUSI mieć subtelną animację W TLE sekcji hero** dopasowaną do produktu. Animacja jest dekoracyjna — placeholder/zdjęcie produktu pozostaje jako główny element wizualny!

#### Zasady:
- Animacja jest **w tle**, nie zastępuje placeholdera na zdjęcie
- Musi być **subtelna** (opacity 0.1-0.4, delikatne ruchy)
- Powinna **nawiązywać do produktu** (nie generyczna)
- Nie może rozpraszać od głównej treści

#### Typy animacji w zależności od produktu:

| Kategoria produktu | Typ animacji | Elementy |
|-------------------|--------------|----------|
| **Urządzenia masujące/wibracyjne** | Pulsujące fale/kręgi | Koncentryczne kręgi rozchodzące się jak wibracje |
| **Napoje/żywność** | Unoszące się cząsteczki | Bąbelki, kropelki płynące w górę |
| **Kosmetyki/beauty** | Delikatne fale | Płynne, organiczne kształty |
| **Tech/gadżety** | Geometryczne elementy | Linie, siatki, subtelne kształty |
| **Ciepło/termoterapia** | Ciepłe cząsteczki | Pomarańczowe/czerwone punkty unoszące się |

#### Struktura HTML (dodaj po hero-glow):

```html
<section class="hero">
  <div class="hero-glow"></div>
  <div class="hero-glow-2"></div>

  <!-- Background animation - DODAJ TO -->
  <div class="hero-bg-animation">
    <div class="vibration-wave vibration-wave-1"></div>
    <div class="vibration-wave vibration-wave-2"></div>
    <div class="vibration-wave vibration-wave-3"></div>
    <div class="heat-particles">
      <span></span><span></span><span></span><span></span><span></span>
    </div>
  </div>

  <div class="container">
    <!-- ... reszta hero (zdjęcie produktu POZOSTAJE!) -->
  </div>
</section>
```

#### CSS dla animacji tła:

```css
.hero-bg-animation {
  position: absolute;
  top: 50%;
  right: 10%;
  transform: translateY(-50%);
  width: 500px;
  height: 500px;
  pointer-events: none;
  z-index: 0;
}

/* Pulsujące fale - subtelne kręgi */
.vibration-wave {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  border: 1px solid rgba(var(--primary-rgb), 0.1);
  animation: vibration-pulse 4s ease-out infinite;
}

.vibration-wave-1 { width: 200px; height: 200px; }
.vibration-wave-2 { width: 300px; height: 300px; animation-delay: 1s; }
.vibration-wave-3 { width: 400px; height: 400px; animation-delay: 2s; }

@keyframes vibration-pulse {
  0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.4; }
  100% { transform: translate(-50%, -50%) scale(1.2); opacity: 0; }
}

/* Unoszące się cząsteczki */
.heat-particles span {
  position: absolute;
  width: 6px;
  height: 6px;
  background: rgba(var(--secondary-rgb), 0.3);
  border-radius: 50%;
  animation: particle-float 6s ease-in-out infinite;
}

@keyframes particle-float {
  0%, 100% { transform: translateY(0); opacity: 0.3; }
  50% { transform: translateY(-20px); opacity: 0.6; }
}

/* Responsive - zmniejsz i przyciemnij na mobile */
@media (max-width: 768px) {
  .hero-bg-animation {
    width: 300px;
    height: 300px;
    opacity: 0.5;
  }
}
```

#### Wskazówki:

1. **Subtelność > efektowność** — animacja ma być ledwo zauważalna
2. **Użyj kolorów marki** z niską opacity (0.1-0.3)
3. **Pozycja** — zazwyczaj po prawej stronie, za zdjęciem produktu
4. **Mobile** — zmniejsz rozmiar i opacity lub ukryj całkowicie
5. **Dostosuj typ animacji** — zmień w zależności od produktu (fale dla masażerów, bąbelki dla napojów, itp.)

### Bento Card with Spotlight
```css
.bento-card .spotlight {
  position: absolute; width: 300px; height: 300px; border-radius: 50%;
  background: radial-gradient(circle, rgba([primary], 0.08) 0%, transparent 70%);
  pointer-events: none; opacity: 0; transition: opacity 0.4s;
}
.bento-card:hover .spotlight { opacity: 1; }
```

### Shimmer Button
```css
.btn-shimmer::after {
  content: ''; position: absolute; top: 0; left: -100%; width: 60%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  animation: shimmer 3s infinite;
}
@keyframes shimmer { 0% { left: -100%; } 100% { left: 200%; } }
```

### Border Beam (Offer Box)
```css
.offer-box::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
  background: linear-gradient(90deg, var(--primary), var(--accent), var(--primary));
  animation: border-beam 3s linear infinite; background-size: 200% 100%;
}
```

### Marquee (Infinite Scroll)
```css
.marquee-track {
  display: flex; gap: 48px; width: max-content;
  animation: marquee 25s linear infinite;
}
@keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
```

## Copywriting Framework (PAS)

### Problem Section
```
Headline: Pytanie retoryczne dotyczace bolu klienta
"Dlaczego czujesz sie [bol]?"
"Czy Twoja [rzecz] naprawde [dziala]?"

Body: Opis problemu z empatia
"Codziennie Twoj organizm stacza niewidzialna walke..."

Agitate: Wzmocnienie bolu (czerwony/magenta kolor)
"[Statystyka]% Polakow zmaga sie z [problem]"
```

### Solution Section
```
Headline: Odpowiedz na problem
"Poznaj [MARKA] — [obietnica w 3-5 slowach]"

Features (Bento):
- Feature 1: Glowna przewaga technologiczna
- Feature 2: Bezpieczenstwo/jakosc
- Feature 3: Wygoda uzytkowania
- Feature 4: Efekt koncowy/korzysci
```

### Offer Section
```
Badge: "BESTSELLER" / "LIMITOWANA OFERTA"
Headline: Nazwa pakietu
Price: [cena] PLN (przekreslona stara cena)
Savings: "Oszczedzasz [kwota] PLN"
Includes: Lista 4-6 elementow z checkmarks
CTA: "Zamow teraz" / "Odbierz swoja [korzysci]"
Guarantee: "30 dni na testy. Zwrot bez pytan."
```

## Placeholder Images

Uzywaj systemu placeholder zamiast prawdziwych obrazow:

```html
<div class="img-placeholder" style="aspect-ratio: 16/9;">
  <div class="ph-icon"><svg>...</svg></div>
  <span class="ph-label">Hero Image</span>
  <span class="ph-size">1920×1080</span>
</div>
```

CSS:
```css
.img-placeholder {
  position: relative; overflow: hidden;
  background: var(--anthracite);
  border: 1px solid rgba([primary], 0.1);
  display: flex; align-items: center; justify-content: center;
  flex-direction: column; gap: 12px;
}
```

## Wymagane zdjęcia na landing page

**WAŻNE**: Każdy landing page wymaga przygotowania następujących zdjęć/grafik. Użyj placeholderów podczas generowania, ale poinformuj użytkownika o potrzebie dostarczenia tych materiałów.

### Lista wymaganych zdjęć

| # | Sekcja | Nazwa | Rozmiar | Opis |
|---|--------|-------|---------|------|
| 1 | **Hero** | Hero Product | 1200×900 | Główne zdjęcie produktu na białym/przezroczystym tle |
| 2 | **Problem** | Problem Visual | 800×600 | Ilustracja problemu (np. zmęczony człowiek, stary produkt) |
| 3 | **Solution/Bento** | Feature 1-4 | 640×360 | 4 zdjęcia ilustrujące funkcje/cechy produktu |
| 4 | **How It Works** | Krok 1-3 | 600×450 | 3 zdjęcia pokazujące kolejne kroki użycia |
| 5 | **Testimonials** | Avatar 1-3 | 56×56 | 3 zdjęcia profilowe klientów (okrągłe) |
| 6 | **Offer** | Zestaw produktu | 800×450 | Zdjęcie kompletnego zestawu/pakietu |

### Suma: 12-14 zdjęć na landing

### Wskazówki dotyczące zdjęć

1. **Hero Product**:
   - Produkt na białym lub przezroczystym tle
   - Wysokiej jakości (min. 1200px szerokości)
   - Pokazuje produkt z najlepszej strony

2. **Feature images (Bento)**:
   - Mogą być zbliżenia detali produktu
   - Mogą pokazywać produkt w użyciu
   - Spójny styl wizualny

3. **How It Works**:
   - Jasne, instruktażowe zdjęcia
   - Pokazują kolejne etapy użycia
   - Mogą zawierać ręce użytkownika

4. **Testimonials avatars**:
   - Prawdziwe zdjęcia lub stockowe
   - Spójne oświetlenie i styl
   - Twarze zwrócone do kamery

5. **Offer zestaw**:
   - Wszystkie elementy zestawu widoczne
   - Flat lay lub lekko pod kątem
   - Profesjonalne oświetlenie

### Alternatywy gdy brak zdjęć

- Użyj zdjęć stockowych (Unsplash, Pexels)
- Wygeneruj AI (Midjourney, DALL-E)
- Użyj mockupów produktowych
- W ostateczności: zostaw placeholdery i poproś klienta o dostarczenie

## JavaScript (minimal)

```javascript
// Intersection Observer dla fade-in
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });
document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// Hamburger menu
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  mobileMenu.classList.toggle('open');
});

// Close mobile menu on link click
document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    mobileMenu.classList.remove('open');
  });
});

// Spotlight effect for bento cards
document.querySelectorAll('.bento-card').forEach(card => {
  const spotlight = card.querySelector('.spotlight');
  if (spotlight) {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      spotlight.style.left = (e.clientX - rect.left) + 'px';
      spotlight.style.top = (e.clientY - rect.top) + 'px';
    });
  }
});

// Cookie banner
const cookieBanner = document.getElementById('cookieBanner');
const cookieBtn = document.getElementById('cookieAccept');
if (!localStorage.getItem('cookiesAccepted')) {
  setTimeout(() => cookieBanner.classList.add('show'), 2000);
}
cookieBtn.addEventListener('click', () => {
  localStorage.setItem('cookiesAccepted', 'true');
  cookieBanner.classList.remove('show');
});
```

## Proces tworzenia

1. **Pobierz dane** z Supabase:
   - workflow (nazwa, opis)
   - workflow_branding (brand_info, colors, fonts)
   - workflow_products (nazwa produktu, cena)
   - workflow_reports (raport PDF - USP, persony)

2. **Przeanalizuj kontekst**:
   - Kategoria produktu (tech/health/sport/beauty)
   - Grupa docelowa (wiek, plec, styl zycia)
   - Glowne bole klienta (pain points)
   - USP (unikalna przewaga)

3. **Wybierz motyw**:
   - Ciemny (tech, gaming, biohacking)
   - Jasny (health, beauty, wellness)

4. **Napisz copy** dla kazdej sekcji:
   - Hero: headline + subheadline + badges
   - Problem: agitacja z statystykami
   - Solution: 4-5 features
   - FAQ: 5-7 pytan
   - Offer: pakiet z cena

5. **Wygeneruj HTML**:
   - Uzyj wzorcow z istniejacych landingow
   - Dostosuj kolory i fonty z brandingu
   - Dodaj placeholdery na obrazy

6. **Zapisz plik**:
   - Sciezka: `landing-pages/[nazwa-marki-lowercase]/index.html`
   - Pojedynczy plik (inline CSS + JS)

7. **Skonfiguruj URL** w `vercel.json`:
   - Landingi domyslnie dostepne pod `/lp/[slug]`
   - Dla dedykowanego URL dodaj rewrite w `vercel.json`

## Konfiguracja URL (Vercel)

Landing pages są hostowane na `crm.tomekniedzwiecki.pl`.

### Domyślny URL
Wszystkie landingi są automatycznie dostępne pod:
```
https://crm.tomekniedzwiecki.pl/lp/[nazwa-folderu]
```

Np. `/lp/dentaflow`, `/lp/vibestrike`, `/lp/h2vital`

### Dedykowany URL (bez /lp/)
Aby landing był dostępny pod krótszym URL (np. `/h2vital`), dodaj rewrite do `vercel.json`:

```json
{ "source": "/h2vital", "destination": "/landing-pages/h2vital/index.html" },
{ "source": "/h2vital/", "destination": "/landing-pages/h2vital/index.html" },
```

### Deploy
Po zmianach w `vercel.json`:
```bash
git add . && git commit -m "Add landing page route" && git push
```

Vercel automatycznie zdeployuje zmiany.

## Komendy curl (Supabase)

```bash
# Pobierz branding
curl -s "https://yxmavwkwnfuphjqbelws.supabase.co/rest/v1/workflow_branding?workflow_id=eq.[WORKFLOW_ID]&select=*" \
  -H "apikey: [SERVICE_KEY]" \
  -H "Authorization: Bearer [SERVICE_KEY]"

# Pobierz produkty
curl -s "https://yxmavwkwnfuphjqbelws.supabase.co/rest/v1/workflow_products?workflow_id=eq.[WORKFLOW_ID]&select=*" \
  -H "apikey: [SERVICE_KEY]" \
  -H "Authorization: Bearer [SERVICE_KEY]"
```

## Logo z projektu

Logo znajduje się w tabeli `workflow_branding` z `type='logo'`. URL w polu `file_url`.

### Przetwarzanie logo

**KRYTYCZNE:** Logo z Supabase zawsze ma duże białe marginesy (np. 1024x1024). **ZAWSZE** przytnij je po pobraniu!

#### Szybka metoda (ZALECANA - jedna komenda)

```bash
cd /c/repos_tn/tn-crm && node -e "
const sharp = require('sharp');
sharp('landing-pages/[SLUG]/logo.png')
  .trim()
  .png()
  .toFile('landing-pages/[SLUG]/logo_trimmed.png')
  .then(() => {
    require('fs').renameSync('landing-pages/[SLUG]/logo_trimmed.png', 'landing-pages/[SLUG]/logo.png');
    console.log('Logo przycięte');
  });
"
```

#### Kroki:
1. **Pobrać logo** z Supabase storage (curl)
2. **Przyciąć marginesy** używając sharp.trim()
3. **Sprawdzić** wynik używając Read tool

### Skrypt do przetwarzania (Node.js + sharp)

**Wariant A: Tylko przycięcie marginesów (NAJCZĘŚCIEJ WYSTARCZY)**
```javascript
const sharp = require('sharp');
sharp('logo_original.png').trim().png().toFile('logo.png');
```

**Wariant B: Logo MA białe tło (rzadziej)**
```javascript
const sharp = require('sharp');

async function processLogo() {
  const { data, info } = await sharp('logo_original.png')
    .trim()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = new Uint8Array(info.width * info.height * 4);
  for (let i = 0; i < info.width * info.height; i++) {
    const r = data[i * 3], g = data[i * 3 + 1], b = data[i * 3 + 2];
    const isWhite = r > 250 && g > 250 && b > 250;
    pixels[i * 4] = r;
    pixels[i * 4 + 1] = g;
    pixels[i * 4 + 2] = b;
    pixels[i * 4 + 3] = isWhite ? 0 : 255;
  }

  await sharp(pixels, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png()
    .toFile('logo.png');
}
processLogo();
```

Uruchomienie:
```bash
node process-logo.js
```

### CSS dla logo

```css
.logo { display: flex; align-items: center; text-decoration: none; }
.logo img { height: 48px; width: auto; object-fit: contain; }
```

### HTML

```html
<a href="#" class="logo">
  <img src="/landing-pages/[slug]/logo.png" alt="[NAZWA MARKI]">
</a>
```

### WAŻNE: Ścieżki do assetów

**Zawsze używaj ścieżek bezwzględnych** do obrazków i innych assetów:

```html
<!-- ŹLE (nie działa z rewrite) -->
<img src="logo.png">

<!-- DOBRZE -->
<img src="/landing-pages/h2vital/logo.png">
```

Dlaczego? Gdy landing jest serwowany pod `/h2vital` (rewrite), przeglądarka szuka `logo.png` pod `/h2vital/logo.png`, ale plik jest fizycznie w `/landing-pages/h2vital/logo.png`.

Wzór ścieżki: `/landing-pages/[nazwa-folderu]/[plik]`

## Conversion Toolkit (CRO)

**ZAWSZE dodawaj Conversion Toolkit** do każdego landing page, aby zwiększyć konwersję.

### Komponenty dostępne w toolkit:

| Komponent | Wpływ na konwersję |
|-----------|-------------------|
| Exit Intent Popup | +15-20% |
| Urgency Timer (evergreen 24h) | +9-15% |
| Stock Counter | +10-12% |
| Social Proof Toast | +5-8% |
| Live Visitors | +3-5% |
| Floating CTA | +5-10% |
| Progress Bar | engagement |

### Integracja

Dodaj przed `</body>`:

```html
<script src="/landing-pages/shared/conversion-toolkit.js"></script>
<script>
  document.addEventListener('DOMContentLoaded', function() {
    ConversionToolkit.init({
      brand: {
        primary: '[KOLOR-ACCENT]',
        secondary: '[KOLOR-PRIMARY]',
        name: '[NAZWA-MARKI]',
        ctaUrl: '#offer'
      },
      exitPopup: {
        enabled: true,
        headline: 'Czekaj! Nie przegap tej okazji',
        subheadline: '[OFERTA SPECJALNA]',
        ctaText: 'Odbierz ofertę',
        dismissText: 'Nie, dziękuję'
      },
      urgency: {
        enabled: true,
        countdown: { enabled: true, position: 'both', text: 'Oferta wygasa za:' },
        stock: { enabled: true, initial: 20, min: 3 }
      },
      socialProof: {
        enabled: true,
        liveVisitors: { enabled: true },
        recentPurchases: { enabled: true }
      },
      scrollCTA: { enabled: true, text: 'Zamów teraz', pulse: true },
      progressBar: { enabled: true },
      extraCTAs: { enabled: true }
    });
  });
</script>
```

Pełna dokumentacja: `/landing-pages/shared/README.md`

**WAŻNE:** Toolkit automatycznie dodaje klasę `ct-has-urgency-bar` do body i przesuwa header o 52px (44px na mobile). Header landing page MUSI mieć `position: fixed` i `top: 0` aby to działało poprawnie. Urgency bar ma explicite ustawioną wysokość (nie padding) z flexbox centrowaniem zawartości.

## Mobile-First Best Practices

### Conversion Toolkit - co robi automatycznie

Toolkit (`conversion-toolkit.js`) **automatycznie obsługuje**:
- Urgency bar: 52px desktop, 44px mobile (explicite height, nie padding!)
- Header offset: `top: 52px` desktop, `top: 44px` mobile
- Body padding-top gdy urgency bar aktywny
- Mobile bottom bar zamiast floating CTA na ≤768px
- Toast pozycjonowany nad mobile bar
- Trust badges kompaktowy layout na mobile (pills)
- Body padding-bottom: 70px na mobile

**Nie musisz pisać tych stylów** - toolkit je wstrzykuje. Twój landing musi tylko:

### Co landing page MUSI mieć

#### 1. Header z position: fixed
```css
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  /* reszta stylów... */
}
```

#### 2. Hero z padding dla headera
```css
.hero {
  padding-top: [wysokość headera + margines];
}

/* Toolkit AUTOMATYCZNIE doda te style: */
/* body.ct-has-urgency-bar .header { top: 52px; } */
/* body.ct-has-urgency-bar { padding-top: 52px; } */
```

Jeśli chcesz dodatkowy padding w hero dla urgency bar, dodaj w landing page:
```css
body.ct-has-urgency-bar .hero {
  padding-top: [bazowy padding + ~50px];
}
```

#### 3. NIE dodawaj własnego sticky CTA
Toolkit ma wbudowany `mobileBar` - nie twórz duplikatu `.sticky-cta`!

### Breakpoints Reference

| Breakpoint | Urgency Bar | Header Offset | Komponenty |
|------------|-------------|---------------|------------|
| >768px (desktop) | 52px | top: 52px | Floating CTA, Sticky Bar |
| ≤768px (mobile) | 44px | top: 44px | Mobile Bottom Bar |
| ≤480px (small) | 44px | top: 44px | Mniejsze fonty/spacing |

### Mobile Checklist

- [ ] Header ma `position: fixed; top: 0;`
- [ ] NIE ma duplikatu sticky CTA (toolkit ma mobileBar)
- [ ] Hero ma odpowiedni padding dla headera
- [ ] Bento cards w jednej kolumnie na mobile
- [ ] FAQ accordion działa na touch
- [ ] Hamburger menu działa i zamyka się po kliknięciu linku

### Częste błędy do unikania

1. **Duplikat CTA** - nie dodawaj `.sticky-cta` gdy używasz Conversion Toolkit
2. **Header bez position: fixed** - toolkit wymaga fixed header z top: 0
3. **Nadpisywanie stylów toolkit** - nie pisz własnych stylów dla `.ct-*` klas
4. **Brak padding w hero** - hero musi mieć padding na header (toolkit doda offset dla urgency)

## Checklist przed oddaniem

- [ ] Wszystkie sekcje obecne (header -> footer)
- [ ] Kolory i fonty z brandingu
- [ ] Logo z projektu (przycięte, przezroczyste tło)
- [ ] **Ścieżki bezwzględne** do wszystkich assetów (`/landing-pages/[slug]/...`)
- [ ] Responsive (768px, 480px, 380px)
- [ ] Fade-in animacje działają
- [ ] Hamburger menu działa
- [ ] Sticky CTA na mobile
- [ ] Cookie banner
- [ ] Placeholdery na wszystkie obrazy
- [ ] CTA buttony linkują do #offer
- [ ] Meta tags (title, description, OG)
- [ ] **Conversion Toolkit zintegrowany** (exit popup, urgency, social proof)
- [ ] Route w `vercel.json` (jeśli dedykowany URL)
- [ ] Git commit & push

## WAŻNE: Deploy na koniec

**Zawsze po wygenerowaniu landing page wykonaj deploy:**
```bash
git add . && git commit -m "Add [nazwa-marki] landing page" && git push
```

Vercel automatycznie zdeployuje zmiany po pushu do `main`.

**ZAWSZE podaj użytkownikowi link do live wersji:**
```
https://tn-crm.vercel.app/[slug]
```

Przykład: `https://tn-crm.vercel.app/nomabar`
