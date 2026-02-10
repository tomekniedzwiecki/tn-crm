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

### Motyw ciemny (tech/gaming/biohacking)
- Background: `#0A0A0A` lub `#0D1117`
- Tekst: `#FFFFFF` z opacity 0.5-1.0
- Akcenty: neonowe (cyan, magenta, lime)
- Efekty: glow, particles, noise texture
- Przyklad: VibeStrike

### Motyw jasny (health/beauty/wellness)
- Background: `#F8FAFC` lub `#FFFFFF`
- Tekst: `#111827` (neutral-dark)
- Akcenty: pastelowe (teal, mint, coral)
- Efekty: subtle shadows, gradients
- Przyklad: OraVibe/DentaFlow

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

### Hero Glow Effect
```css
.hero-glow {
  position: absolute; width: 900px; height: 900px; border-radius: 50%;
  background: radial-gradient(circle, rgba([primary], 0.2) 0%, transparent 70%);
  animation: glow-pulse 4s ease-in-out infinite alternate;
}
```

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

Logo z projektu często ma białe tło i nadmiarowe marginesy. Przed użyciem na landingu należy:

1. **Pobrać logo** z Supabase storage
2. **Przyciąć** (trim whitespace)
3. **Usunąć białe tło** (zrobić przezroczyste)

### Skrypt do przetwarzania (Node.js + sharp)

```javascript
// process-logo.js
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
npm install sharp --save-dev
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
- [ ] Route w `vercel.json` (jeśli dedykowany URL)
- [ ] Git commit & push

## WAŻNE: Deploy na koniec

**Zawsze po wygenerowaniu landing page wykonaj deploy:**
```bash
git add . && git commit -m "Add [nazwa-marki] landing page" && git push
```

Vercel automatycznie zdeployuje zmiany po pushu do `main`.
