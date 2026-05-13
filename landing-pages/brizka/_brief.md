# Design Brief — Brizka

<!-- ETAP 1 manifest — patrz docs/landing/01-direction.md -->

## 1. Kierunek manifesta (z 01-direction.md)

- [ ] Panoramic Calm — architectural, tech premium (vitrix)
- [ ] Editorial/Luxury
- [ ] Organic/Natural
- [ ] Playful/Toy
- [ ] Retro-Futuristic
- [ ] Rugged Heritage
- [x] **Steam Velocity** — fresh tech utility (Panoramic Calm derivative) + chronograph signature

**Uzasadnienie wyboru:** Brizka to utility · precision · evidence · solo · moderate · present · intimate (parownica 1500 W, 15 s start, 100 °C, 1200 ml). DNA pasuje 5/7 do Panoramic Calm (różni się: moderate vs quiet, intimate vs public) — Plus Jakarta Sans z brandingu klienta = native match. Steamla (DNA 7/7 z Apothecary Label) już zajęła „etykietowy" preset; Brizka różnicuje się tempem (rytmiczne, 15 s start) i akcentem cytrynowym #FFE66D zamiast warm cream — bliżej Linear/Apple niż Le Labo.

## 2. Moodboard — 3 realne marki referencyjne (SPOZA landing-pages/)

1. **Dyson V15** — split hero packshot + monumentalne dashboard liczby (1500 W obok stoper-grade chronografu). Brizka pożycza tę „big spec" estetykę.
2. **Linear (linear.app)** — subtelne radialne gradienty teal w rogu kart, lewa-aligned typografia Plus Jakarta. Brizka pożycza paletę teal/charcoal + clean grid.
3. **Aesop softer line (web)** — sznurek delikatnego cytrusu (Lemon Burst #FFE66D) jako accent dolnej linii sekcji. Brizka pożycza „1 odważny accent na sekcję, reszta cisza".

## 3. Paleta (z workflow_branding type=color)

- **Primary (akcent):** `#2EC4B6` (Steam Teal)
- **Secondary:** `#A0E7E5` (Frost Blue — soft fill, kpi cards bg)
- **Accent (Lemon Burst):** `#FFE66D` — uppercase eyebrow, underline pod kluczowymi liczbami, max 3 miejsca per sekcja
- **Ink (główny tekst):** `#1A1A2E` (Charcoal)
- **Paper (tło):** `#F7FAFC` (Cloud White)
- **Stone Gray:** `#6B7280` (secondary text, captions)

## 4. Typografia (z workflow_branding type=font)

- **Display (nagłówki):** `Plus Jakarta Sans` 500/600/700/800 + `&display=swap&subset=latin-ext`
- **Body (treść):** `Inter` 400/500/600/700 + `&display=swap&subset=latin-ext`
- **Accent (handwriting):** `Caveat` 400/700 — używany w 2 miejscach: pull-quote w testimonials + signature pod offer box („Czysty dom. Czysta głowa.")

> Polskie „Ł" w UPPERCASE: Plus Jakarta Sans bezpieczne, Caveat bezpieczne, Inter bezpieczne.

## 5. Persona główna (z report_pdf)

- **Wiek / zawód / status:** 32–45 lat, dual-income couple z dzieckiem lub psem; oboje pracują (HR, IT, project management), własne M lub dom + auto SUV/kombi. Dochód 12–25 k netto/mies. razem.
- **Kluczowy pain point:** sobotni poranek znika w sprzątaniu — kuchnia, łazienka, auto, fugi. Detergenty drażnią skórę dziecka / alergia / kichanie psa. Tracony „weekend gain": pojechać na rower, do parku, wyspać się.
- **Kluczowa motywacja zakupu:** odzyskać sobotę. Sprzątanie skompresowane do 30 minut, bez chemii (gospodarstwo z dzieckiem/psem), bez 6-minutowego rozgrzewania jak w klasycznej parownicy.
- **Cytat brzmiący jak wypowiedź persony:** „Nie chcę negocjować z sobotnim porankiem. Włączam, 15 sekund, jadę. Po 30 minutach mam czystą kuchnię i resztę dnia dla siebie."

## 6. Anty-referencje (co JUŻ JEST w `landing-pages/`, czego NIE powtarzam)

- **Już istnieje:** [`landing-pages/vitrix/`](../../landing-pages/vitrix/) — Panoramic Calm pełna (Plus Jakarta + Instrument Serif + paper/navy/teal, smart window cleaner)
- **Już istnieje:** [`landing-pages/steamla/`](../../landing-pages/steamla/) — Apothecary Label parownica eko (etykiety + monospace + cream)
- **Czego unikam (signature elements istniejącego):**
  - Nie kopiuję paper #F7F5F0 + navy #0B1F3A z vitrix — Brizka ma Cloud White + Charcoal (chłodniejsze, świeższe)
  - Nie używam Instrument Serif italic eyebrow (vitrix signature) — zastępuję uppercase Plus Jakarta Sans 600 letter-spacing 0.18em + cytrynowy underline
  - Nie kopiuję dark hero z kafiny ani warm cream cards Apothecary — Brizka jest fresh/clean, nie artisanal
  - Nie używam architectural overlay grid (vitrix) — moja sygnatura to chronograf (stoper-style liczby 15 / 30 / 99,9 / 1500 z ringiem), nie panorama
  - Nie kopiuję `landing-pages/h2vital/` rounded cream + sage greens — Brizka jest cool, nie warm/wellness

## 7. Test anty-generic (4 pytania — wszystkie TAK)

- [x] Czy 3 wybrane marki referencyjne są SPOZA e-commerce? (Dyson product page + Linear SaaS + Aesop — wszystkie spoza naszej biblioteki landingów)
- [x] Czy odwracając logo nadal zgaduję branżę (moodboard jest charakterystyczny)? (chronograf 15 s + para 100 °C + teal/cytryna = czas + para = utility household tech)
- [x] Czy persona NIE pasowałaby do innego baseline'u z tabeli? (Steamla = eko-mama solo, alergia centralnie; Brizka = dual-income couple ratujący weekend — inna scena)
- [x] Czy manifest w 5 linijkach da się zacytować bez słów „premium", „luxury", „wysoka jakość"? („Powiew czystości w 15 sekund" + tempo rytmiczne + cytrynowy akcent + chronograf — bez ani jednego z tych słów)

## 8. Signature element

**„Chronograf 15 s / 30 min / 99,9 % / 1500 W"** — duży teal ring (180–280 px) z monumentalną liczbą wewnątrz (Plus Jakarta 800, tabular-nums, letter-spacing -0.04em). Pod liczbą uppercase caption („START", „W 30 MINUT", „BAKTERII", „MOCY"). Cytrynowy `#FFE66D` underline 4 px na 1 cyfrze (np. pod „15"). Chronograf pojawia się **3 razy w landingu**: hero (4× w grid), Solution (1× duży „30 min" jako bohater sekcji), Final CTA (1× counter-up od 0 do 30).

Plus subtle handwritten `Caveat` „Czysty dom. Czysta głowa." pod offer box — jeden moment ludzkiego oddechu w landingu inżynierskim.

## 9. Warianty sekcji (z section-variants.md)

- **Hero:** H3 — Dashboard mockup split (chronograf grid 2×2 + packshot z prawej)
- **Features:** F4 — Cards z mockupami (4 kafelki: kuchnia / łazienka / auto / fugi)
- **Testimonials:** T2 — Before/After stats (KPI obok każdej wypowiedzi: „minuty zaoszczędzone / detergent zero zł / dziecko bez kataru")

---

## 10. STYLE LOCK — wybrany styl z Atlas

### 10.1 Wybrany styl
- **Style ID:** `panoramic-calm`
- **Plik:** [`docs/landing/style-atlas/panoramic-calm.md`](../../docs/landing/style-atlas/panoramic-calm.md)

### 10.2 Product DNA (z Kroku 9a.1)
- Utility↔Ritual: **utility** (kotwice: Anker PowerCore, Dyson V15)
- Precision↔Expression: **precision** (kotwice: DJI Mavic, Vitrix — 1500 W, 15 s, 100 °C measurable)
- Evidence↔Feeling: **evidence** (kotwice: Withings, Philips Avent — 99,9 % bakterii first)
- Solo↔Community: **solo** (kotwice: Dyson V15, Shark steam mop)
- Quiet↔Loud: **moderate** (kotwice: Aesop softer + Linear)
- Tradition↔Future: **present** (kotwice: Linear, Stripe)
- Intimate↔Public: **intimate** (kotwice: Philips Avent, La Mer)

Match z `panoramic-calm`: **5/7** (różni się: moderate vs quiet, intimate vs public). Argumentacja: Plus Jakarta Sans + paletka cool tech = native dla Brizki, dwie różnice nie zmieniają stack'a; signature primitives Panoramic Calm (dashboard mockup hero, wide images, gradient subtle) dokładnie obsługują „chronograf + packshot" hero variant.

### 10.3 MUSZĄ być użyte (auto-paste z pliku stylu)
- Font display: `Plus Jakarta Sans` 600/700 w `font-family` (grep PASS wymagany)
- Font body: `Plus Jakarta Sans` jako default body, `Inter` jako alternate body (klient zaakceptował oba)
- Paleta min 3 z 5 (adaptacja brandingu klienta): `#2EC4B6` (teal odpowiednik) + `#1A1A2E` (ink odpowiednik) + `#F7FAFC` (paper odpowiednik)
- Layout DNA: panorama wide + dashboard mockup hero
- Signature primitive #1 obecny: dashboard mockup hero split (chronograf 2×2 + packshot)
- Section architecture min: 14 sekcji
- Motion budget moderate: `.fade-in`, `.js-counter` ≥ 4 (chronograf), `.magnetic` ≥ 2, `.js-tilt` ≥ 2

### 10.4 NIE WOLNO użyć (auto-paste)
- **Fonty:** NIE `Fraunces`, `Cormorant`, `Playfair`, `Italiana`, `Archivo Black`, `IBM Plex`
- **Layout:** NIE editorial column z numerowanym Nº eyebrow, NIE 12-col strict Swiss rule lines
- **Elementy:** NIE warm cream tła `#F6F3ED`, NIE gold accent, NIE stamp badges, NIE poster full-bleed color
- **Kolory:** NIE `#F6F3ED` (warm cream Apothecary), NIE `#0B1F3A` (vitrix navy — własny Charcoal #1A1A2E), NIE `#E09A3C`
- **Motion:** NIE `.js-parallax`, NIE `.js-split` (za editorial)

### 10.5 Section Architecture (z pliku stylu sekcja 8)
Required (min 14): Header, Mobile Menu, Hero (chronograf dashboard split), Trust Bar (KPI panel), Problem, Solution (chronograf 30 min hero), How It Works (3 kroki), Features (F4 — 4 strefy), Comparison (Brizka vs detergent vs klasyczna parownica), Testimonials (T2 — Before/After z KPI), FAQ, Offer, Final CTA (Charcoal dark), Footer, Sticky CTA.

Forbidden: Editorial Nº eyebrow, warm cream sections, script body, stamp badges, full-bleed poster.

### 10.6 Motion Budget
```yaml
js_effects_required: [.fade-in, .js-counter, .magnetic, .js-tilt]
js_effects_forbidden: [.js-parallax, .js-split]
js_effects_count:
  counter_min: 4
  magnetic_min: 2
  tilt_min: 2
```

---

## Krok 7 — Mapowanie manifesto → decyzje w ETAP 4 (DESIGN)

| Decyzja | Wartość z manifesto |
|---|---|
| Hero background | `#F7FAFC` Cloud White + radial gradient teal 8 % w prawym dolnym rogu |
| Hero headline font-family | Plus Jakarta Sans 700/800 |
| Hero headline font-style | regular (NIE italic) — „Powiew czystości w 15 sekund" z cytrynowym underline pod „15 sekund" |
| Signature element HTML | `<div class="chrono-ring"><strong class="js-counter" data-target="15">0</strong><em>s</em></div>` z teal ringiem 4 px |
| Dark section rytm | 1 sekcja ciemna: Final CTA (Charcoal #1A1A2E) — kontrast przed footerem |
| Animacja hero | subtle: fade-in 600ms + counter-up 1.6s do 15 / 30 / 99,9 / 1500 |
| Border-radius globalny | 16 px (cards, buttons), chronograf ring `border-radius: 50%` |
| Shadow styl | `0 14px 40px -20px rgba(46, 196, 182, 0.28)` (teal-tinted) na cards + `0 8px 24px -12px rgba(26, 26, 46, 0.12)` na CTA |
| Divider między sekcjami | hairline 1 px `#A0E7E5` 30 % opacity (Frost Blue) — subtle |
