# Design Brief — Paronik

## 1. Kierunek manifesta (z 01-direction.md)

- [ ] Panoramic Calm — architectural, tech premium (vitrix)
- [ ] Editorial/Luxury — premium AGD, lifestyle, hygge (paromia)
- [ ] Organic/Natural — wellness, health, spa (h2vital)
- [ ] Playful/Toy — pet, kids, gadgets (pupilnik)
- [ ] Retro-Futuristic — gaming, tech edgy (vibestrike)
- [ ] Rugged Heritage — workwear, outdoor, tools & trades (kafina)
- [x] Nowy (opisz poniżej): **Clinical Precision**

**Uzasadnienie wyboru** (1-2 zdania z auditu produktu):

Paronik to ręczny odkurzacz parowy 1500W/3bar/15s — konkurencyjna przewaga tylko w danych technicznych (Karcher SC 2 grzeje się 6.5 min, Paronik 15s). Persona podwójna: eco-mama (bezpieczeństwo dzieci, zero detergentów) + car detailer (precyzja, parametry) — wspólny mianownik to **kontrola nad mikroskopowym środowiskiem**, dlatego landing musi wyglądać jak instrument pomiarowy (inżynieryjna typografia, chłodna paleta, dane na pierwszym planie).

## 2. Moodboard — 3 realne marki referencyjne (SPOZA landing-pages/)

> Marki z prawdziwego świata, NIE inne landingi z `landing-pages/`. Każda referuje konkretny element wizualny lub tonalny.

1. **Dyson** — mikrotypograficzne bloki danych nad headline (JetBrains Mono 10–12px uppercase z separatorami: `1500W · 3 BAR · 15 SEC · 99.99%`), clean engineering aesthetic bez storytellingu — produkt „mówi danymi", nie metaforami.
2. **Apple (AirPods marketing)** — clinical precision, dużo pustej przestrzeni, produkt unosi się nad abstrakcyjnym tłem z subtelnym gradientem Mist White → Steam Blue, typografia geometric bez serif.
3. **Method (home cleaning)** — chłodna paleta pastel bez cliché „zielono-eko" — dowód że produkt czyszczący może być desirable object, nie narzędziem w plastikowej butelce.

## 3. Paleta (z workflow_branding type=color)

- **Primary (akcent):** #2E86DE (Steam Blue)
- **Ink (główny tekst):** #1A202C (Deep Graphite)
- **Paper (tło):** #E8F4FD (Mist White)
- **Accent / Gold (opcjonalny):** #4FD1C5 (Electric Mint — TYLKO w spec chips, key numerach, divider labels, hover states)

Kolory wsparcia (z branding): #64748B (Slate Gray — subtitles), #F1F5F9 (Arctic Fog — alternate bg).
Logika 60/30/10: Mist White 60% (paper), Deep Graphite 30% (ink + jedna ciemna sekcja), Steam Blue + Electric Mint 10% (akcent).

## 4. Typografia (z workflow_branding type=font)

- **Display (nagłówki):** Space Grotesk (500/600/700) + `&display=swap`
- **Body (treść):** Inter (400/500/600/700) + `&display=swap`
- **Mono / Caption (opcjonalny):** JetBrains Mono (400/700) — spec chips, timer 00:15, section numbers `Nº 01/10`

> ⚠️ Polskie „Ł" w UPPERCASE Space Grotesk mieści się w line-height 1.4 (testowane na „PRZEJDŹ", „ŻEBY"). Bez `subset=latin-ext` (feedback-landing-fonts-polish.md — przekreślałoby Core latin-ext z CJK duplikatami). Max 3 rodziny fontów — na limit.

## 5. Persona główna (z report_pdf)

- **Wiek / zawód / status:** Świadoma Anna, 32 lata. Matka dwójki dzieci (2 i 5 lat), pracuje zawodowo (biuro, HR/marketing), mieszka w nowym budownictwie w średnim mieście. Drugorzędnie: Marek Fan Detailingu (28, właściciel kilkuletniego auta klasy premium — persona w testimonials, nie hero).
- **Kluczowy pain point** (co najbardziej frustruje): Po jej podłodze raczkuje dziecko, a ona nie ufa już butelkom z detergentem. Ma lekki kaszel po sprzątaniu — nie wie czy to przypadek. Fugi w łazience szorowała 40 minut — nadal szare. Ma pół godziny przerwy, zanim dzieci wrócą z placu zabaw.
- **Kluczowa motywacja zakupu** (czego oczekuje od produktu): Kontrola sterylności domu bez kompromisu zdrowotnego. Chce **dowodu** (99.99% eliminacji, 100°C, certyfikat), nie obietnicy. Szuka „smart" — czegoś co robi więcej w krótszym czasie.
- **Cytat brzmiący jak wypowiedź persony** (do testimonials): „Przestałam kupować kolejne butelki. Paronik grzeje się 15 sekund — zdążę zanim młodszy się obudzi. Fugi jak nowe, bez szorowania. I wiem, że to tylko para — nic po niej nie zostaje na rękach dziecka."

## 6. Anty-referencje (co JUŻ JEST w `landing-pages/`, czego NIE powtarzaj)

> Procedura wymaga ZAWSZE budowania od zera (MODE=forge). Tabela poniżej to historia, NIE template'y do kopiowania (memory: `feedback-landing-always-forge.md`).

- **Już istnieje:** `vitrix` (Panoramic Calm), `paromia` (Editorial), `kafina` (Rugged Heritage), `h2vital` (Organic). Żaden nie pasuje kierunkiem — Clinical Precision to nowy typ.
- **Czego unikam (signature elements istniejących):**
  - NIE kopiuję Plus Jakarta + Instrument Serif z vitrix/paromia — Paronik ma Space Grotesk + JetBrains Mono (engineering, nie editorial)
  - NIE kopiuję dark hero + stamp badges z kafiny — Paronik ma jasne Mist White hero z monumentalnym cyfrowym timerem
  - NIE kopiuję Fraunces italic numerala z paromia — Paronik ma mono-timer JetBrains Mono jak stoper laboratoryjny
  - NIE kopiuję paper/ink/gold paromia — Paronik ma paper/ink/STEAM BLUE/electric mint
- **AI-slop explicitly zakazany:** purple-to-blue gradient jako pełne tło (Steam Blue tylko jako micro-accent), neon glow orbs, border-left: 4px solid, bento z identycznymi kartami, checkmark ✓ w feature tabelach.

## 7. Test anty-generic (4 pytania — wszystkie TAK)

- [x] Czy 3 wybrane marki referencyjne są SPOZA e-commerce? (Dyson — hardware, Apple — hardware, Method — FMCG w tradycyjnym retail. Żadna nie jest online-only landingiem.)
- [x] Czy odwracając logo nadal zgaduję branżę? (Monumentalny timer `00:15` + spec-line `1500W · 3 BAR · 99.99% · 1200 ML` jednoznacznie mówi „instrument pomiarowy / tech hardware".)
- [x] Czy persona NIE pasowałaby do innego baseline'u? (Eco-mama z JetBrains Mono spec chips to zderzenie wartości — nie pasuje ani do editorial paromia, ani do organic h2vital. Wymaga własnego Clinical Precision.)
- [x] Czy manifest w 5 linijkach da się zacytować bez „premium"/„luxury"/„wysoka jakość"? (Używam „inżynieryjnej precyzji", „instrumentu pomiarowego", „kontroli mikroskopowej".)

## 8. Signature element

> Jeden charakterystyczny element wizualny, który zostanie po obejrzeniu landinga. NIE „nowoczesny design" — coś konkretnego.

**Twój signature element:**

**Monumentalny timer `00:15` w JetBrains Mono 180–260px** nad/obok hero headline, z mikro-scale linią poniżej: `1500W · 3 BAR · 99.99% · 1200 ML`. Timer imituje cyfrowy wyświetlacz urządzenia pomiarowego — statyczny, czysty, bez blinkowania. Każda sekcja ma **własny numer w rogu** (`Nº 01/10` JetBrains Mono 11px uppercase Slate Gray) — editorial meets engineering. Divider między sekcjami to cienka 1px linia Electric Mint z micro-label z lewej (`SECTION.03 — SHOW_DON'T_TELL`).

### Tabela mapowania manifesto → decyzje ETAP 4

| Decyzja | Wartość |
|---|---|
| Hero background | Mist White #E8F4FD jednolity, subtelny radial gradient Electric Mint 5% w prawym-dolnym rogu |
| Hero headline font-family | Space Grotesk 600 |
| Hero headline font-style | regular, z italic em na kluczowym słowie (`_bez chemii_` lub `_w 15 sekund_`) |
| Signature element HTML | `<div class="timer-monolith">00:15</div>` JetBrains Mono 220px + `<div class="spec-scale">1500W · 3 BAR · 99.99% · 1200 ML</div>` |
| Dark section rytm | jedna ciemna sekcja Deep Graphite (Technical Excellence, Sekcja E) — kontrast z Mist White |
| Animacja hero | subtle — timer statyczny, tło z lekką siatką engineering-style (dots 0.08 opacity) |
| Border-radius globalny | 4px (engineering feel, nie 16px soft) |
| Shadow styl | `0 1px 2px rgba(26,32,44,0.06), 0 8px 24px rgba(46,134,222,0.05)` — clinical subtle |
| Divider między sekcjami | cienka 1px linia Electric Mint + micro-label `SECTION.NN — NAME` |

## 9. Warianty sekcji (autonomicznie wybrane)

- **Hero:** H4 Editorial numerał — monumentalna liczba tła idealnie przekłada się na signature element manifesta (`00:15` JetBrains Mono jako tło hero zamiast typowego numeralu serifowego — clinical tech przekierowanie H4 z editorial luxury w engineering).
- **Features:** F3 Linear stack — 4 features tech Paronika wymagają dłuższego opisu (1500W/3bar/100°C/99.99%, 6-stopniowa regulacja, 1200ml zbiornik vs 200ml Karcher SC1, akcesoria) — każda dostaje własny scroll-stop z image L/R alternacją.
- **Testimonials:** T1 Voices quote grid — 3 persony (Anna eco-mama, Marek detailer, Kasia właścicielka psów) każda z innym use-case, default siatka z avatarami pasuje do clinical precision layoutu (bez dramatyzmu T5 single hero ani UGC-ness T4).
