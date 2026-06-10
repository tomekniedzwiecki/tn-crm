# Design Brief — Cervana

<!-- ETAP 1 (DIRECTION) — poduszka ortopedyczna profil motylkowy. Workflow d2b3dc36-51e8-489d-9fc0-76be9da0d084 -->

## 1. Kierunek manifesta (z 01-direction.md)

- [ ] Panoramic Calm — architectural, tech premium (vitrix)
- [ ] Editorial/Luxury — premium AGD, lifestyle, hygge (paromia)
- [ ] Organic/Natural — wellness, health, spa (h2vital)
- [ ] Playful/Toy — pet, kids, gadgets (pupilnik)
- [ ] Retro-Futuristic — gaming, tech edgy (vibestrike)
- [ ] Rugged Heritage — workwear, outdoor, tools & trades (kafina)
- [x] Nowy: **Restorative Precision** (Clinical Warmth) — szeryfowa elegancja + spokojna paleta snu + jeden medyczny akcent. Autorytet wyrobu medycznego, który nie krzyczy.

**Uzasadnienie wyboru** (1-2 zdania z auditu produktu): Produkt to wyrób ortopedyczny (precyzja, 5 stref, certyfikaty) sprzedawany w intymnym kontekście sypialni i regeneracji snu — kupujący potrzebuje DOWODU (evidence), ale podany ciepło i spokojnie, bez krzykliwego DTC. To dokładnie profil Clinical Warmth: dowód medyczny + cisza premium.

## 2. Moodboard — 3 realne marki referencyjne (SPOZA landing-pages/)

> Marki z prawdziwego świata, NIE inne landingi z `landing-pages/`.

1. **Aesop** — etykieta-jako-design: spokojny, papierowy ton, typograficzna powściągliwość, dużo światła między elementami. Stąd: sec-meta strip i „karta wyrobu" zamiast krzykliwych badge'ów.
2. **Bang & Olufsen** — precyzja i cisza premium: jeden akcent koloru, czarne na spokojnym tle, poczucie inżynierii. Stąd: pojedynczy teal akcent + ciemna sekcja anatomii jak arkusz techniczny.
3. **Maude / Necessaire** — clean wellness z jawnym składem (technical disclosure as design): parametry i certyfikaty pokazane wprost, bez owijania. Stąd: footnoted claims `[n]` + comparison table.

## 3. Paleta (z workflow_branding type=color)

- **Primary (akcent):** #0E7A6E (Deep Teal — CTA, akcenty, liczby kluczowe)
- **Ink (główny tekst):** #141C2E (Midnight — body, headings, ciemne sekcje)
- **Paper (tło):** #F3F6F8 (Cloud — tło wszystkich sekcji, NIE czysta biel)
- **Accent (sekundarny):** #9385C9 (Restful Lavender — eyebrow, detale snu) · #4FD8C4 (Aqua Lift — highlight oddychalności/mesh) · #64708A (Slate Mist — meta, captiony)

> Brand ma priorytet (safety #4.4): paleta klienta zastępuje domyślny ciepły papier #F7F4ED Atlasu — Cloud #F3F6F8 jest brandowym, spokojnym (chłodnym) papierem snu, też NIE czystą bielą.

## 4. Typografia (z workflow_branding type=font)

- **Display (nagłówki):** Fraunces 500/600/700 (+ italic) — szeryf = autorytet medyczny + ciepło, poprawne polskie „Ł" w UPPERCASE.
- **Body (treść):** Plus Jakarta Sans 400/500/600/700 — neutralny, czytelny w spec-rows i FAQ.
- **Label/Accent (mono-like):** Space Grotesk 400/500/700 — UPPERCASE letter-spaced dla sec-meta, jednostek, numeracji stref 01–05.

> ⚠️ Konflikt ze Style Lock clinical-warmth (Cormorant/Inter/Manrope): **branding klienta ma priorytet** (safety #4.4 + memory feedback-verify-style-lock-vs-branding). Zachowuję CAŁĄ strukturę clinical-warmth (spec-label, sec-meta, comparison table, footnoted claims, subtle motion), tylko font display = Fraunces (szeryf PL-safe, ten sam editorial-medyczny feel). Bez `&subset=latin-ext`. Max 3 rodziny.

## 5. Persona główna (z report_pdf)

- **Wiek / zawód / status:** Marta „Siedząca w Napięciu", 36 lat, Poznań, starszy analityk finansowy w korporacji, dochód ~8200 zł netto, 9 godzin dziennie przy biurku, dwoje dzieci. Śpi głównie na boku.
- **Kluczowy pain point:** Prawie codziennie budzi się ze sztywnością karku i tępym bólem z tyłu głowy, który w ciągu dnia przeradza się w migrenę napięciową. Permanentne zmęczenie — ratuje się kawą i ibuprofenem.
- **Kluczowa motywacja zakupu:** Chce obudzić się bez bólu i swobodnie obrócić głowę od pierwszego poranka — bez ćwiczeń, wizyt u fizjoterapeuty i kolejnej „twardej jak kamień" poduszki z marketu.
- **Cytat brzmiący jak wypowiedź persony:** „Próbowałam już taniej poduszki ortopedycznej z marketu — była twarda jak kamień i ból tylko się nasilił. Bałam się, że ta będzie tak samo. Po trzeciej nocy przestałam budzić się ze sztywnym karkiem."

## 6. Anty-referencje (co JUŻ JEST w `landing-pages/`, czego NIE powtarzaj)

- **Już istnieje:** vitrix (Panoramic Calm), h2vital (Organic/Natural — wellness). Najbliżej tematycznie h2vital (zdrowie/wellness).
- **Czego unikam:** NIE kopiuję rounded sans + greens/beiges z h2vital — Cervana ma własną, chłodno-spokojną paletę snu (teal/lavender/cloud) i szeryf Fraunces zamiast rounded. NIE używam Panoramic Calm Instrument Serif + dashboard mockup z vitrix — tu autorytet buduje „karta wyrobu" i spec-rows, nie ekrany app. Brak bento 2×2 (clinical-warmth zakazuje).

## 7. Test anty-generic (4 pytania — wszystkie TAK)

- [x] Czy 3 wybrane marki referencyjne są SPOZA e-commerce? (Aesop, B&O, Maude — beauty/audio/wellness brands, nie landingi)
- [x] Czy odwracając logo nadal zgaduję branżę? (sygnet „C" jako profil głowy/szyi w negatywnej przestrzeni + paleta snu = wyrób na kark)
- [x] Czy persona NIE pasowałaby do innego baseline'u? (Marta z migreną napięciową od biurka — zbyt specyficzna na generyczny wellness)
- [x] Czy manifest da się zacytować bez słów „premium/luxury/wysoka jakość"? (TAK — „dowód medyczny podany ciepło i cicho")

## 8. Signature element

> Jeden charakterystyczny element wizualny, który zostanie po obejrzeniu landinga.

**Twój signature element:** **„Karta wyrobu — Anatomia 5 stref"** — pełnoszerokościowy blok w ramce 2px (Midnight), na ciemnym tle jak arkusz techniczny: sylwetka profilu motylkowego z 5 ponumerowanymi strefami podparcia `01–05` (Space Grotesk uppercase) — centralne wgłębienie, wałek szyjny, platformy boczne, wycięcia barkowe, skrzydła na ramiona. Każda strefa = jedna linia spec-row z opisem działania. To „dowód inżynierii", nie reklama.

## 9. Warianty sekcji (z section-variants.md, LIMITED przez allowed_variants w Style Lock)

- **Hero:** H1 Split klasyczny — copy + CTA lewo, hero-figure (packshot poduszki) prawo. (allowed: H1, H5, H8 → H1 top-1 dla wyrobu z mocną liczbą „5 stref")
- **Features:** F3 Linear stack (spec-rows `feat-spec-list`/`feat-key`) — jedyny dozwolony, = primitive „karta wyrobu".
- **Testimonials:** T2 Before/After (evidence) — pasuje 1:1 do narracji PAS „poranek przed vs po", mierzalny kontrast.

---

## 10. STYLE LOCK — wybrany styl z Atlas (OBOWIĄZKOWE od v4.0)

### 10.1 Wybrany styl
- **Style ID:** `clinical-warmth`
- **Plik:** docs/landing/style-atlas/clinical-warmth.md

<!-- Maszynowe tokeny lock (v5.0) — REQUIRED dla verify-style-lock.sh; branding > Atlas -->
lock-font-display: Fraunces
lock-font-body: Plus Jakarta Sans
lock-font-accent: Space Grotesk
lock-hex: #F3F6F8
lock-hex: #0E7A6E
lock-hex: #141C2E

### 10.2 Product DNA (z Kroku 9a.1)
- Utility↔Ritual: dual (wyrób który wykonuje pracę: podpiera kark [kotwice: Shark steam mop, Dyson V15] + wieczorny rytuał snu [Aesop hand wash, matcha set])
- Precision↔Expression: precision (5 stref, model 2102, wymiary 60×23, profil 7–12 cm [Swiss watch, thermometer medical])
- Evidence↔Feeling: evidence (86% statystyk, Oeko-Tex/CertiPUR, fizjoterapeuta, 4.9/5 [Medela clinical trials, Dyson 99%])
- Solo↔Community: solo (sen jest czynnością solitarną [sleep tracker, skincare serum])
- Quiet↔Loud: quiet (premium smart-wellness, cisza w sypialni [Aesop, Muji])
- Tradition↔Future: present (nowoczesne smart-wellness, biomechanika [Linear, modern wellness])
- Intimate↔Public: intimate (sypialnia, prywatna sprawa zdrowia [sleep tracker, skincare routine])

Match z wybranym stylem: **6/7** (różni się tylko oś Utility↔Ritual: styl=utility, produkt=dual). Argumentacja: clinical-warmth to jedyny styl Atlas zaprojektowany pod „szeryf + ciepła/spokojna paleta + autorytet medyczny" — został wręcz wyodrębniony z landingu poduszki ortopedycznej; Apothecary (6/7 tie) odpada bo zakazuje serif/cream a brand ma Fraunces.

### 10.3 MUSZĄ być użyte (auto-paste z pliku stylu, z adaptacją brandową)
- Font display: `Fraunces` w font-family (zamiast Cormorant — branding ma priorytet, safety #4.4)
- Font label: `Space Grotesk` — min 1 wystąp per sekcja (sec-meta / jednostki / numeracja stref)
- Min 1 `<table>` lub `.feat-spec-list` (Comparison Table + spec-rows F3)
- Padding sekcji ≥ `100px 0`
- Primitive 1 (spec-label „Karta wyrobu — Anatomia 5 stref") obecny
- Spokojny papier `#F3F6F8` (Cloud) jako tło sekcji — NIE czysta biel
- Brand primary `#0E7A6E` (Deep Teal) jako akcent + sec-meta strip ZAMIAST dark trust-bar
- Footnoted claims `[n]` + stopka źródłowa w footerze

### 10.4 NIE WOLNO użyć (auto-paste)
- **Fonty:** NIE `IBM Plex`, `Archivo Black`, `Caveat`, `Fredoka`, `Nunito`, `Italiana`
- **Layout:** NIE `grid-template-columns: 1fr 1fr` dla features (bento 2×2 zakaz) — features = F3 Linear stack
- **Elementy:** NIE `Nº` w eyebrow, NIE `.hero-numeral` (oversized italic w tle), NIE dark `.trust-strip` z icon-circles
- **Kolory:** NIE czysta biel `#FFFFFF` jako tło sekcji, NIE `linear-gradient` w tłach sekcji, NIE złoto bright `#C9A961`
- **Motion:** NIE `.js-split`, NIE `.js-parallax`, NIE `.magnetic`, NIE `.js-tilt` (motion budget = subtle: tylko fade-in + js-counter)

### 10.5 Section Architecture (z pliku stylu sekcja 8)
Required (min 12): Header · Mobile Menu · Hero (H1) · Sec Meta Strip (zamiast Trust Bar) · Problem (PAS) · Spec Label/Anatomia (sygnaturowa, F3) · How It Works (3 kroki) · Comparison Table · Personas (2 segmenty) · Testimonials (T2) · FAQ (5–7) · Offer · Final CTA (solid brand, NIE gradient) · Footer (footnotes) · Sticky CTA (mobile)
Forbidden: Trust Bar dark z icon-circles · Social Proof Marquee · Bento 2×2

### 10.6 Motion Budget (z pliku stylu sekcja 10)
```yaml
js_effects_required: [.fade-in, .js-counter]
js_effects_forbidden: [.js-split, .js-parallax, .magnetic, .js-tilt]
js_effects_count: { counter_min: 1, counter_max: 3 }
```
