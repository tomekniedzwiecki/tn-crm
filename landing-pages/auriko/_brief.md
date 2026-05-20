# Design Brief — Auriko

## 1. Kierunek manifesta (z 01-direction.md)

- [ ] Panoramic Calm — architectural, tech premium (vitrix)
- [ ] Editorial/Luxury — premium AGD, lifestyle, hygge (paromia)
- [ ] Organic/Natural — wellness, health, spa (h2vital)
- [ ] Playful/Toy — pet, kids, gadgets (pupilnik)
- [ ] Retro-Futuristic — gaming, tech edgy (vibestrike)
- [ ] Rugged Heritage — workwear, outdoor, tools & trades (kafina)
- [x] **Nowy: Instrument Care — clinical precision z intymnym ciepłem rodzinnego rytuału.**

**Uzasadnienie wyboru** (1-2 zdania z auditu produktu): Auriko to czyścik uszu z kamerą HD 1080p, żyroskopem 6-axis i silikonem klasy medycznej — produkt wykonuje pracę z chirurgiczną precyzją, ale używany jest wieczorem po kąpieli, w łazience, między rodzicem a dzieckiem. Potrzebuje języka wizualnego klinicznego (KPI, dashboardy, cite-able dane), ale w paletą i fotografią ocieploną do warmth Philips Avent / Medela.

## 2. Moodboard — 3 realne marki referencyjne (SPOZA landing-pages/)

1. **Philips Avent** — clinical trust + warm undertone, packshot na ciepło białym tle, dane „1000h testów klinicznych" w body, ale ojciec trzymający butelkę w hero. Auriko czerpie z połączenia clinical evidence + intimate scene.
2. **DJI Mavic** — dashboard hero z product mockup, rozłożone specs jako KPI grid, technical drawing z callouts. Auriko: kamera HD 1080p, żyroskop 6-axis, app screen mockup z live podgląd.
3. **Withings Body Smart** — IBM Plex Sans + Mono mix, liczby jako design element (tabular-nums), chart-driven trust, „4,8/5 · 12 470 opinii" jako instrument panel zamiast ikon w kółkach.

## 3. Paleta (z workflow_branding type=color)

- **Primary (akcent):** #4F6BED  (Aurora Blue — używana w danych, chart bars, primary CTA, brand hit w mockupie aplikacji)
- **Ink (główny tekst):** #0F172A  (Instrument Ink — body text, data liczby)
- **Paper (tło):** #F8FAFC  (Lab White — tło sekcji, dashboardy)
- **Accent / Warm:** #FFB29D  (Care Coral — używana w 2 miejscach: warm undertone w persona section + offer badge, jako Philips Avent „warmth")
- **Support (warn):** #FACA4D  (Signal Amber — używana w 1 miejscu: highlight w `<em>` headline + before/after delta)
- **Chart gray:** #94A3B8  (slate, grid lines, ph backgrounds)

## 4. Typografia (z workflow_branding type=font)

- **Display (nagłówki):** Sora 500/600/700 + `&display=swap&subset=latin-ext` — geometric tech sans, blisko IBM Plex Sans w mood, ale z miękkimi rounded terminalami (mniej clinical-cold). Klient zaakceptował.
- **Body (treść):** Inter 400/500/600 + `&display=swap&subset=latin-ext` — neutralny czytelny sans, dobre PL diakrytyki, najlepsza para z Sora.
- **Mono / Caption:** IBM Plex Mono 400/500 + `&display=swap&subset=latin-ext` — liczby specyfikacji, readouts, KPI labels. **Wymiana z Caveat** — Style Lock Clinical Kitchen zabrania Caveat (handwriting), a tech voice wymaga mono.

> ⚠️ Sprawdzone PL „Ł" w UPPERCASE: Sora 600 line-height 1.4 testowane OK.
> 3 rodziny fontów (Sora + Inter + IBM Plex Mono), wszystkie z subset=latin-ext.

## 5. Persona główna (z brand_info + report PDF)

- **Wiek / zawód / status:** 30-38, rodzic małych dzieci (3-7 lat), klasa średnia, capsule wardrobe + smart home, kupuje Philips Avent / Babymoov, scrolluje Instagram parentingowy
- **Kluczowy pain point** (co najbardziej frustruje): Czyszczenie uszu maluchowi „na ślepo" — patyczek wchodzi w nie wiadomo co, dziecko się wierci, latarka w komórce nic nie pokazuje, lekarz mówi „nie używaj patyczka" ale alternatywy nie ma. Lęk że uszkodzi błonę bębenkową albo wepchnie woskowinę głębiej.
- **Kluczowa motywacja zakupu** (czego oczekuje od produktu): WIDZIEĆ. Kontrola wzrokowa zamiast zgadywania. Mieć dane (kamera HD na ekranie aplikacji), bo dane = bezpieczeństwo. Premium tech który zmniejsza lęk rodzicielski, nie kolejny gadżet z Amazon.
- **Cytat brzmiący jak wypowiedź persony** (do testimonials): „Pierwszy raz nie zgaduję. Po kąpieli małej włączam apkę, widzę wszystko na ekranie, wyciągam dokładnie to czego dotykam. 30 sekund i jest gotowe."

## 6. Anty-referencje (co JUŻ JEST w `landing-pages/`, czego NIE powtarzaj)

- **Już istnieje:** [`landing-pages/vitrix/`](../vitrix/) — Panoramic Calm (myjka do okien smart). DNA nakłada się (utility · precision · evidence · solo · future), ale vitrix to wide-shot architectural premium z Plus Jakarta + Instrument Serif + paper/navy/teal.
- **Czego unikam (signature elements istniejącego):** NIE kopiuję Plus Jakarta + Instrument Serif (Auriko ma Sora + Inter), NIE kopiuję paper/navy/teal palety (Auriko ma Lab White + Aurora Blue + Care Coral warm undertone), NIE robię panoramic full-bleed architectural shot w hero (Auriko ma intimate baby scene + dashboard split). Vitrix dotyczy szyb, Auriko dotyczy intymnego rodzicielskiego rytuału — różne hero shots, różne fotografia briefs.

## 7. Test anty-generic (4 pytania — wszystkie TAK)

- [x] Czy 3 wybrane marki referencyjne są SPOZA e-commerce? — Philips Avent (medical/baby), DJI (drones tech), Withings (health hardware) — wszystkie product brandy nie pure DTC e-commerce
- [x] Czy odwracając logo nadal zgaduję branżę (moodboard jest charakterystyczny)? — TAK, dashboardy + KPI + warm intimate persona = premium baby/medical tech
- [x] Czy persona NIE pasowałaby do innego baseline'u z tabeli? — Rodzic 30-38 z premium tech mindset NIE pasuje do paromia (luxury food/lifestyle), h2vital (wellness spa), pupilnik (playful toys), vibestrike (gaming), kafina (heritage trades). Częściowo vitrix, ale vitrix to smart home owner, nie rodzic w łazience.
- [x] Czy manifest w 5 linijkach da się zacytować bez słów „premium", „luxury", „wysoka jakość"? — Manifest mówi „clinical precision", „intimate warmth", „instrument care", „dashboard evidence", „wieczorny rytuał" — zero „premium/luxury/wysoka jakość"

## 8. Signature element

> Jeden charakterystyczny element wizualny, który zostanie po obejrzeniu landinga.

**Twój signature element:** **„Instrument Panel KPI cards"** — każda sekcja wizualna ma 2-4 KPI tile z dużą liczbą tabular-nums w Sora 600 + label w IBM Plex Mono 11px uppercase. Pierwszy w hero (4 KPI: kamera 1080p · żyroskop 6-axis · silikon medical-grade · aplikacja w 10s). Drugi w trust panel zamiast ikon w kółkach (4,8/5 · 12 470 opinii · 2 lata gwarancji · 30 dni zwrotu). Trzeci w testimonials jako before/after stats. Całość spina aesthetyka „instrument readout" (jak Withings dashboard, DJI Fly), z brand hit Aurora Blue jako bar fill / chart accent.

## 9. Warianty sekcji (autonomicznie wybrane)

- **Hero:** H3 Dashboard mockup — Auriko ma aplikację z live podglądem kamery, drzewo decyzyjne (smart home / IoT / app-controlled) jednoznacznie wskazuje H3. Hero = product image (czyścik w ręce) + mockup aplikacji telefon z live podglądem ucha + 4 KPI grid.
- **Features:** F4 Cards z mockupami — app-controlled produkt + Style Lock Clinical Kitchen allowed: [F4, F1]. Cards z piktogramami + app mockupy są ideałem dla pokazania funkcji aplikacji.
- **Testimonials:** T2 Before/After stats — evidence-driven brand voice, Style Lock allowed: [T2, T1]. Każdy testimonial z KPI delta („PRZED: lęk i zgadywanie / PO: 30 sekund, zero stresu") — data-driven jak Withings.

---

## 10. STYLE LOCK — wybrany styl z Atlas

### 10.1 Wybrany styl
- **Style ID:** `clinical-kitchen`
- **Plik:** [`docs/landing/style-atlas/clinical-kitchen.md`](../../docs/landing/style-atlas/clinical-kitchen.md)

### 10.2 Product DNA (z Kroku 9a.1)
- Utility↔Ritual: **dual** (utility — czyszczenie uszu / ritual — wieczorny moment po kąpieli; kotwice: Philips Avent podgrzewacz utility + Matcha tea ritual)
- Precision↔Expression: **precision** (kamera HD 1080p, żyroskop 6-axis, silikon medical-grade; kotwice: Swiss watch + Thermometer medical)
- Evidence↔Feeling: **evidence** (widzisz co dotykasz = literalne data; kotwice: Anker mAh + Medela clinical trials)
- Solo↔Community: **solo** (intymna pielęgnacja rodzic-dziecko, prywatne; kotwice: Skincare serum + Meditation app)
- Quiet↔Loud: **moderate** (delikatność + technical confidence, ani szept ani krzyk; kotwice: Philips Avent + Withings)
- Tradition↔Future: **future** (aplikacja, HD streaming, tech-forward; kotwice: DJI drone + AirPods Max)
- Intimate↔Public: **intimate** (łazienka rodzinna, prywatna sprawa; kotwice: Skincare routine + Face cream)

Match z `clinical-kitchen` (utility · precision · evidence · solo · moderate · future · intimate): **6/7** (różnica tylko dual vs utility — Auriko ma silniejszy ritual aspekt niż czyste utility). Argumentacja: Clinical Kitchen kotwice (Philips Avent, Medela, Anker, DJI, Withings) dosłownie opisują DNA Auriko — premium tech w intymnym medical-baby kontekście; alternatywne style (Panoramic Calm 5/7, Apothecary Label 5/7) tracą na intimate vs public lub future vs present.

### 10.3 MUSZĄ być użyte (auto-paste z pliku stylu)
- Font display: **Sora** w font-family (zastępca IBM Plex Sans — z brandingu klienta, geometric tech sans w tym samym mood spectrum)
- Font body: **Inter** (zastępca IBM Plex Sans body weight — z brandingu klienta)
- Font mono: **IBM Plex Mono** (zachowane z Style Lock — Caveat z brandingu wymieniony jako forbidden w Style Lock, mono potrzebne dla KPI labels)
- Paleta min 3 z 5: **#F8FAFC** (Lab White) + **#0F172A** (Ink) + **#4F6BED** (Aurora Blue accent)
- Min 1 `.kpi-grid` (primitive 1 Hero Dashboard)
- Min 1 `.chart-compare` lub bar visual (primitive 2)
- Min 4 sekcje z tłem #F7F9FB lub #FFFFFF
- Min 8 unique specs (liczba + jednostka) w całym landingu
- Min 3 `.js-counter` (KPI cards)
- Section architecture min 11 sekcji
- Signature primitive #1 (KPI dashboard hero) obecny

### 10.4 NIE WOLNO użyć (auto-paste)
- **Fonty:** NIE `Fraunces`, `Cormorant`, `Playfair`, `Italiana`, `Archivo Black`, `Caveat`
- **Layout:** NIE editorial-column, NIE Nº eyebrow, NIE full-bleed color sekcji (Poster style)
- **Elementy:** NIE warm cream tło (#F6F3ED), NIE gold accent (#C9A961), NIE script handwriting, NIE italic em w h1/h2 (em jako normal-style)
- **Kolory:** NIE `#F6F3ED`, NIE `#E09A3C`, NIE `#C9A961`
- **Motion:** NIE `.js-parallax`, NIE `.js-split` (Style Lock forbidden), NIE `.magnetic` (Style Lock forbidden, zbyt DTC)

### 10.5 Section Architecture (z pliku stylu sekcja 8)
Required (min 11): Header, Mobile Menu, Hero Dashboard (.hero-dashboard), Instrument Panel (.trust-panel ZAMIAST trust-bar ikon), Problem z liczbami (.problem), Features Cards (.bento z mockupami), How It Works (3 steps z mockups), Comparison Bar Charts (.chart-compare), Testimonials z KPI (data-driven), FAQ, Offer (spec-dense), Final CTA, Footer
Forbidden: Editorial eyebrow Nº, warm cream sections, script/handwriting accent

### 10.6 Motion Budget (z pliku stylu sekcja 10)
```yaml
js_effects_required:
  - .fade-in
  - .js-counter            # min 3 (KPI cards)
  - .js-tilt               # OK na cards feature (min 2)
js_effects_forbidden:
  - .js-split              # za editorial
  - .js-parallax           # za miękkie
  - .magnetic              # zbyt DTC
js_effects_count:
  counter_min: 3
  counter_max: 10
  tilt_min: 2
```

---

## 11. Tabela mapowania manifesto → kod (Krok 7)

| Decyzja | Wartość z manifesto |
|---|---|
| Hero background | #F8FAFC (Lab White) z subtle radial gradient rgba(79,107,237,0.04) → transparent w prawym górnym rogu |
| Hero headline font-family | Sora 600 |
| Hero headline font-style | regular, `<em>` z color #4F6BED (NIE italic — Style Lock forbids italic em w h1/h2) |
| Signature element HTML | `.kpi-grid` 2×2 z `<strong class="js-counter" data-target="1080" data-suffix="p HD">` |
| Dark section rytm | Brak ciemnych sekcji (Clinical Kitchen = chłodny minimalizm, Lab White dominant) |
| Animacja hero | subtle (pulsujące koncentryczne kręgi rgba(79,107,237,0.08) — nawiązanie do „aperture" kamery + heartbeat) |
| Border-radius globalny | 12px (cards), 8px (KPI tiles), 6px (buttons), 999px (badges) |
| Shadow styl | `0 1px 2px rgba(15,23,42,0.04), 0 8px 24px rgba(15,23,42,0.06)` (clinical clean, no warm tone) |
| Divider między sekcjami | none (whitespace + subtle alternating bg #FFFFFF / #F8FAFC) |
