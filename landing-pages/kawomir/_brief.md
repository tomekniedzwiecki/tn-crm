# Design Brief — Kawomir

<!-- Wypełniony 2026-05-06 dla workflow 711ce166-67a4-4299-9e98-63df5f65e6ac -->

## 1. Kierunek manifesta (z 01-direction.md)

- [ ] Panoramic Calm — architectural, tech premium (vitrix)
- [ ] Editorial/Luxury — premium AGD, lifestyle, hygge (paromia)
- [ ] Organic/Natural — wellness, health, spa (h2vital)
- [ ] Playful/Toy — pet, kids, gadgets (pupilnik)
- [ ] Retro-Futuristic — gaming, tech edgy (vibestrike)
- [x] Rugged Heritage — workwear, outdoor, tools & trades (kafina) — **adaptowany z fontami klienta**
- [ ] Nowy (opisz poniżej):

**Uzasadnienie wyboru:** Kawomir to przenośny ekspres dla mężczyzn w trasie — kierowcy TIR-ów, vanlife, wędkarze, ojcowie pakujący się o świcie. Maskulinizm blue-collar premium, kawa jako rytuał heritage (mosiądz, espresso, leather), DNA match 5/7 z Rugged Heritage. Fonty z workflow_branding (Unbounded/DM Sans/Caveat) zastępują domyślny stack Archivo+Inter+IM Fell English (priorytet brandu klienta — patrz 01-direction.md sekcja 4.4).

## 2. Moodboard — 3 realne marki referencyjne (SPOZA landing-pages/)

1. **Filson** — heritage workwear; oversized headlines z waxed-cotton paletą charcoal+brass, manifesto-style copy „Made in Seattle since 1897", zdjęcia z planu w niskim świetle
2. **Yeti** — masculine outdoor premium; produkt zawsze w terenie (kabina, pickup, vanlife), nie w studiu; podpisy techniczne Mono z numerami specs (cubic feet, mAh)
3. **Stumptown Coffee Roasters** — kawa rzemieślnicza; etykiety w stylu LOT/ISSUE, brass+cream paleta, zdjęcia rąk-z-kubkiem o świcie zamiast smiling stocku

## 3. Paleta (z workflow_branding type=color)

- **Primary (akcent / bursztyn crema):** #B8722E
- **Ink / Espresso (główny tekst):** #3D2817
- **Paper / Mleko w Kawie (tło):** #F4EDE0
- **Accent / Miedź Bursztynowa:** #D4A24C
- **Antracyt Smoła (dark hero):** #1A1814
- **Popiół Drzewny (border/muted):** #6B5D4F

## 4. Typografia (z workflow_branding type=font)

- **Display (nagłówki):** `Unbounded` 500/700/900 + `&display=swap`
- **Body (treść):** `DM Sans` 400/500/700 + `&display=swap`
- **Accent (handwritten):** `Caveat` 400/700 + `&display=swap`

> Polskie znaki: Unbounded ✅ (latin extended), DM Sans ✅, Caveat ✅. Sprawdzone w fonts-polish memory.
> Max 3 rodziny fontów — spełnione.
> NIE dodawaj `&subset=latin-ext` do Google Fonts v2 (regression — patrz feedback-landing-fonts-polish).

## 5. Persona główna (z report_pdf — Premium_Espresso_Brand_Blueprint.pdf)

- **Wiek / zawód / status:** Mężczyzna 30-50 lat — kierowca TIR-a w międzynarodowej trasie, właściciel małej firmy budowlanej z kamperem, wędkarz weekendowy, ojciec dwójki dzieci pakujący się o 4:30, przedsiębiorca jeżdżący autem służbowym po Polsce
- **Kluczowy pain point:** Pierwsze espresso dnia zostawione na blacie w domu lub zastąpione „tankiem z benzyny" z MOP-u. Termos zimnej kawy do 8:00. Brak rytuału w trasie.
- **Kluczowa motywacja zakupu:** Mieć pierwszą kawę dnia tak dobrą jak w domu — niezależnie czy stoję na zjeździe pod Pyrzowicami, w kabinie o świcie, czy nad jeziorem o 5:00. Niezależność, kontrola, rytuał wzięty ze sobą.
- **Cytat brzmiący jak wypowiedź persony:** „W trasie po Niemczech było już 7 rano i nadal jechałem na herbacie z termosu. Kawomir mam teraz pod ręką w kabinie — espresso jak z domu, w dwie minuty na MOP-ie."

## 6. Anty-referencje (co JUŻ JEST w `landing-pages/`, czego NIE powtarzaj)

> Procedura wymaga ZAWSZE budowania od zera (MODE=forge).

- **Już istnieje:** `landing-pages/kafina/` — kierunek Rugged Heritage (kawa też!)
- **Czego unikam (signature elements istniejącego):** NIE kopiuję Archivo + IM Fell English + brass stamp `LOT 2026 · ISSUE 001` z kafiny. Moje fonty: Unbounded display + DM Sans body + Caveat handwritten (z workflow_branding klienta). Mój signature: **„Czas zegara kierowcy"** — duża monumentalna godzina `04:30` w Unbounded 900 nad hero (rytuał wczesnego espresso w trasie), zamiast stamp badges. Kafina ma waxed cream tło — ja mam dwustronną paletę: dark hero antracyt + cream paper na sekcjach narracyjnych (rytm noc → świt).

## 7. Test anty-generic (4 pytania — wszystkie TAK)

- [x] Czy 3 wybrane marki referencyjne są SPOZA e-commerce? (Filson — workwear heritage, Yeti — outdoor masculine, Stumptown — kawa rzemieślnicza, wszystkie poza polską platformą e-commerce)
- [x] Czy odwracając logo nadal zgaduję branżę? (TAK — bursztyn+antracyt+mosiądz + zegar 04:30 = kawa-w-trasie, nie jakikolwiek e-commerce)
- [x] Czy persona NIE pasowałaby do innego baseline'u z tabeli? (TAK — kierowca TIR pakujący się o 4:30 NIE pasuje do Editorial/Luxury, Organic, Playful, Retro; tylko Rugged Heritage / Outdoorsy Expedition)
- [x] Czy manifest da się zacytować bez słów „premium", „luxury", „wysoka jakość"? (TAK — manifest mówi o „pierwszym espresso dnia", „rytuale 4:30", „bagażniku który pakuje się sam", brak generic adjektywów)

## 8. Signature element

> Jeden charakterystyczny element wizualny.

**„Zegar kierowcy 04:30"** — duża monumentalna godzina `04:30` w Unbounded 900 (wieje 280-440px na desktop) w rogu hero, w bursztyn+miedź gradient, jako tag rytuału wczesnego espresso. Powtarza się jako mała sygnatura `04:30 / 05:15 / 06:00` przy stat-cardach (zamiast „4-6h", „73%", „2x" generic ekranowych — stat-cardy mówią o godzinach, nie procentach), oraz jako podpis w finałowej sekcji `nie zostawisz pierwszego espresso na blacie domu`.

## 9. Warianty sekcji (z section-variants.md)

- **Hero:** H2 Editorial Slab (oversized headline + side product) — pasuje do Rugged Heritage allowed_variants `[H2, H7, H4]`
- **Features:** F2 Bento Asymmetric (jeden duży kafelek z signature spec + 3 mniejsze) — Rugged allowed `[F2, F1]`
- **Testimonials:** T6 Quote Stack heritage — Rugged allowed `[T6, T5]`

---

## 10. STYLE LOCK — Rugged Heritage (adaptacja: fonty klienta)

### 10.1 Wybrany styl
- **Style ID:** `rugged-heritage` (adapted)
- **Plik:** [`docs/landing/style-atlas/rugged-heritage.md`](../../docs/landing/style-atlas/rugged-heritage.md)

### 10.2 Product DNA
- Utility↔Ritual: **dual** (parzy kawę + ritual o 4:30)
- Precision↔Expression: **balanced** (specs 20bar/7500mAh + charakter męski)
- Evidence↔Feeling: **blend** (mAh dane + emocja „pierwsze espresso z trasy")
- Solo↔Community: **solo** (samotnie w kabinie/aucie)
- Quiet↔Loud: **moderate** (męski stoicki, nie krzyczy)
- Tradition↔Future: **tradition** (espresso, mosiądz, kawa rzemieślnicza)
- Intimate↔Public: **public** (vanlife setup, manifest stylu życia)

Match z Rugged Heritage: **5/7** (różnice: utility vs dual, evidence vs blend — oba stylu Rugged są bardziej „pure utility" ale nasz produkt ma silniejszy ritual layer; akceptowalne, top-1 w Atlas, drugi Outdoorsy Expedition 4/7).

Argumentacja (1 zdanie): Kawomir to kawa-przenośna-dla-mężczyzn-w-trasie z paletą bursztyn/espresso/mosiądz/antracyt, idealnie pokrywa się z dark hero + brass accent + heritage typography Rugged Heritage; Outdoorsy Expedition byłby trafny dla samego vanlife, ale produkt to kawa, nie sprzęt biwakowy.

### 10.3 MUSZĄ być użyte (auto-paste z pliku stylu — z adaptacją fontów klienta)

- Font display: **Unbounded** (zamiast Archivo — branding klienta priorytet, regula 4.4)
- Font body: **DM Sans** (zamiast Inter — branding klienta)
- Font accent: **Caveat** (zamiast IM Fell English — branding klienta)
- Paleta (min 3 z 6): #1A1814 (dark hero), #F4EDE0 (cream paper), #B8722E (bursztyn primary), #D4A24C (mosiądz accent), #3D2817 (espresso ink)
- Layout DNA: **Dark hero + cream sections + brass accent + editorial with utility**
- Signature primitive #1: dark hero z cream + brass accent — obecny
- Section architecture min: **14 sekcji**
- Heritage typography (oversized display + serif/script accent dla labels)

### 10.4 NIE WOLNO użyć (auto-paste)

- **Layout:** NIE Rugged dla wellness/clean/modern tech (nasza domena coffee/tools — OK)
- **Tonalność:** NIE generic premium/luxury hasła („wysoka jakość", „przyszłość kawy")
- **Stamp badges typu kafina (`LOT 2026 · ISSUE 001` w mosiężnej ramce):** NIE — to anty-referencja kafiny, używam zegara 04:30 jako swojego signature
- **Motion:** NIE `.js-parallax`, NIE `.js-tilt` (heritage = stable, nie kinetic)
- **Frazy zakazane (memory):** NIE „24h", NIE „magazyn w Polsce", NIE „za pobraniem", NIE „raty", NIE „PayPo/Klarna/Twisto"

### 10.5 Section Architecture

Required (min 14): header, hero, trust-bar, gallery, problem, solution-bento, how-it-works (steps), personas, comparison, package, testimonials, faq, offer, cta-banner, footer + sticky-cta + cookie-banner = 17 wizualnych bloków.

### 10.6 Motion Budget

```yaml
js_effects_required: [scroll-reveal, header-scrolled, faq-accordion, stock-counter, cookie-banner]
js_effects_forbidden: [.js-parallax, .js-tilt]
js_effects_count: { scroll_reveal_min: 5, magnetic_cta_optional: true }
```

---

## Mapowanie manifesto → decyzje DESIGN

| Decyzja | Wartość |
|---|---|
| Hero background | Antracyt Smoła `#1A1814` z subtelnym noise + radial brass glow w prawym rogu |
| Hero headline font-family | Unbounded 900 (uppercase) |
| Hero headline font-style | Mixed: główny czarny tekst kremowy + jedno słowo bursztyn (highlight „Twoja kawa wsiada z Tobą") |
| Signature element HTML | `<div class="hero-clock">04:30</div>` — Unbounded 900 280-440px gradient bursztyn→miedź, absolute positioned w hero corner |
| Dark section rytm | Hero (dark) → trust (cream) → gallery (cream) → problem (cream) → solution (dark) → steps (cream) → personas (cream) → comparison (dark) → package (cream) → testimonials (cream) → faq (cream) → offer (cream) → cta-banner (dark gradient) → footer (dark) |
| Animacja hero | Subtle: clock fade-in delay 0.4s + scale 0.95→1, draw-line steam puff (3 ścieżki SVG) z opacity 0→0.4 |
| Border-radius globalny | 8px (heritage = pewne kanty, nie pillowy) |
| Shadow styl | `0 16px 48px rgba(26,24,20,0.18), 0 4px 12px rgba(184,114,46,0.08)` — espresso shadow z brass tint |
| Divider między sekcjami | Mosiężna linia 2px `#D4A24C` 64px wide, centered, dla każdej sekcji nagłówka (zamiast standard label) |

---

## Szczegóły contentowe (do ETAP 2)

**Cena:** 199 zł brutto (oryginalna 399 zł — typowy markup TakeDrop dla tego segmentu).
**CTA URL:** `https://kawomir.pl/checkout` (placeholder — brak `selected_product_id` external_id i domeny w bazie; do podmienienia gdy klient dostarczy).
**Logo główne:** `https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/ai-generated/711ce166-67a4-4299-9e98-63df5f65e6ac/1777895117372_0.png` (logo premium, is_main:true).
**Hero image:** `https://ae-pic-a1.aliexpress-media.com/kf/S3c6835cc323b4eb3be7baef39b1ba2408.jpg` (product shot z aliexpress) — alternatywa: użyć mockup kierowca w kabinie TIR-a.
**Mockupy z Supabase (10 dostępnych):** kierowca w kabinie, vanlife w górach, kawa na masce auta MOP, kubek wraca z trasy, ojciec pakuje się przed trasą, klucze i ekspres na siedzeniu, dziennik trasy, vanlife setup w kamperze, czyszczenie ekspresu na MOP-ie, unboxing prezentu dla taty.

**Domena:** brak w bazie. Używam `kawomir.pl` jako placeholder (typowy pattern dla TakeDrop projektów). Do potwierdzenia z klientem.

---

## 11. Photo System (generowanie obrazów AI — 2026-07-14)

> Referencja produktu: `https://ae-pic-a1.aliexpress-media.com/kf/S3c6835cc323b4eb3be7baef39b1ba2408.jpg`
> **Prawda o produkcie (Shape Constraint):** matowy CZARNY walec pionowy ~17 cm, rozszerzana czarna górna pokrywa, JEDEN okrągły podświetlany na ZIELONO przycisk power z przodu, mała ikona baterii pod przyciskiem, perforowany kropkowany pasek przy dole, wkręcany czarny brew head na dole wydający espresso. Cały korpus czarny, BEZ napisów/logo na urządzeniu. (Copy mówi „bursztynowe akcenty" — to NIEPRAWDA o produkcie; bursztyn pochodzi WYŁĄCZNIE ze sceny/światła, nie z korpusu.)

### Lighting
Zimne, niebieskawe światło przedświtu (04:30–06:15) + ciepły bursztynowy rim-light wschodu odbity na czarnym korpusie. Praktyczne, przygaszone źródła (lampka kabiny, deska rozdzielcza). Low-key, cinematic.

### Paleta w scenach
- Tła: antracyt/smoła (#1A1814), ciemne wnętrza kabin/kamperów, asfalt MOP, świt nad jeziorem
- Akcenty: bursztyn/miedź (wschód słońca, crema espresso, poświata deski rozdzielczej) — TYLKO w otoczeniu
- Czego unikamy: jasne studio na białym tle, neony, ciepłe „golden hour" pocztówkowe przesycenie, kuchnia domowa

### Kadrowanie
Editorial, męskie, produkt w realnym kontekście persony (kabina TIR, kamper, maska auta na MOP). Lekki tilt, dokumentalne.

### Post-processing
35mm film (Kodak Portra 400), delikatny grain, mild halation, lekko zdesaturowane cienie z ciepłymi światłami.

### Negatywy — NIGDY
Text/labels/watermarks · biały packshot studio · zmyślone przyciski/LED/porty poza referencją · bursztynowy korpus (korpus jest CZARNY) · uśmiechnięty stock „point at product" · kuchnia/biuro.

### Stały SHAPE prefix (każdy prompt)
`MATCH THE PRODUCT IN THE REFERENCE IMAGE EXACTLY — do not redesign or modify its shape. Product: a compact matte-black cylindrical portable espresso machine ~17cm tall, flared black top cap, one round glowing green power button on the front, a small battery indicator icon below it, a perforated dotted band near the base, and a black screw-on brew head at the bottom dispensing espresso. Entirely matte-black body, no logos or text on the device.`

### Stały REALISM suffix (każdy prompt)
`Shot on 35mm film (Kodak Portra 400), slightly grainy, mild halation, imperfect hand-held framing with a slight tilt, lived-in feel. Candid documentary photography, not a studio product shot, not a render, not CGI. Slightly off-center. No text, no captions, no labels, no watermarks, no writing, no signage.`

### Matryca slotów (14 obrazów → `ai-generated/kawomir/`)
| # | Slot | CSS box | aspect_ratio | Scena |
|---|---|---|---|---|
| 1 | hero | 4/5 | 4:5 | Kabina TIR, deska rozdzielcza, świt, kubek espresso z cremą |
| 2 | gallery-1 (duży) | ~0.65 | 2:3 | Szeroka kabina TIR 04:30, kierowca w tle |
| 3 | gallery-2 | ~1/1 | 1:1 | Kamper/vanlife Bieszczady, produkt na blacie |
| 4 | gallery-3 | ~1/1 | 1:1 | Maska auta na MOP, kubek + produkt, świt |
| 5 | gallery-4 | ~1/1 | 1:1 | Powrót z trasy — kubek/produkt w dłoni |
| 6 | gallery-5 | ~1/1 | 1:1 | Pakowanie o 04:15, torba + produkt |
| 7 | step-1 | 4/3 | 4:3 | Ręce wkładają kapsułkę + wodę (close-up) |
| 8 | step-2 | 4/3 | 4:3 | Zielony przycisk wciśnięty, świeci (close-up) |
| 9 | step-3 | 4/3 | 4:3 | Espresso leci do kubka na masce auta |
| 10 | persona-1 | 4/3 | 4:3 | Kierowca TIR w kabinie, half-body, świt |
| 11 | persona-2 | 4/3 | 4:3 | Vanlife/wędkarz nad jeziorem o 5:00 |
| 12 | persona-3 | 4/3 | 4:3 | Przedsiębiorca/ojciec pakuje się przed autem |
| 13 | package | 1/1 | 1:1 | Flat-lay zestawu (ekspres, kabel USB-C, adaptery, etui) |
| 14 | offer | 16/10 | 3:2 | Poziomy packshot zestawu na ciemnym rugged tle |

Provider: **Gemini 3 Pro Image Preview** (override). final-cta = gradient CSS, brak slotu obrazu.
