# Design Brief — Oculia

<!-- Ten plik jest OBOWIĄZKOWY. scripts/verify-brief.sh blokuje ETAP 2 jeśli któraś sekcja jest pusta. -->
<!-- Wypełnij wszystkie 8 sekcji ZANIM przejdziesz do generowania HTML. -->
<!-- Pełna dokumentacja: docs/landing/01-direction.md -->

## 1. Kierunek manifesta (z 01-direction.md)

- [ ] Panoramic Calm — architectural, tech premium (vitrix)
- [ ] Editorial/Luxury — premium AGD, lifestyle, hygge (paromia)
- [ ] Organic/Natural — wellness, health, spa (h2vital)
- [ ] Playful/Toy — pet, kids, gadgets (pupilnik)
- [ ] Retro-Futuristic — gaming, tech edgy (vibestrike)
- [ ] Rugged Heritage — workwear, outdoor, tools & trades (kafina)
- [x] Nowy (opisz poniżej): **Apothecary Nocturne** — wieczorny rytuał apteczny, edytorialny spokój, apothecary-modern wellness (Aesop / Byredo / Kinfolk). Nie spa „naturalnej zieleni" (h2vital), nie corporate premium. Zamknięte oczy, ciepło grafenu, piętnaście minut bez ekranu. Czarny tusz + szałwia + terakota — nie zielone drzewa i pudrowe róże.

**Uzasadnienie wyboru** (1-2 zdania z auditu produktu): Produkt jest **rytuałem sensorycznej deprywacji** dla managerki pracującej 8-10h przed monitorem — nie gadżetem wellness. Apothecary Nocturne łączy apteczną precyzję (grafen 38-42°C, 5 trybów, CE/RoHS) z wieczornym spokojem (15 minut w ciemności, muzyka, rozluźnione skronie) — żadna inna kategoria z 6 presetów tego nie oddaje.

## 2. Moodboard — 3 realne marki referencyjne (SPOZA landing-pages/)

> Marki z prawdziwego świata, NIE inne landingi z `landing-pages/`. Każda referuje konkretny element wizualny lub tonalny.

1. **Aesop** — apothecary-grade typografia (Fraunces-like serif + mono caption nad headline'em `Nº 03 / Ritual`), paleta papierowa + szałwia, dużo pustego miejsca między sekcjami (120-160px padding), produkt traktowany jak książka, nie gadżet.
2. **Byredo** — sensory poetics w copy („Zamknij oczy. Oddychaj. Wróć." = ich ton), matowe tła terakotowe i midnight-ink, wordmark-centric wizualność, rytuał > feature-list.
3. **Kinfolk magazine** — editorial numbering sekcji (`Nº 01 → Nº 10`), portrait photography bez stock-photo uśmiechów (osoba z zamkniętymi oczami, rozproszone światło przez lniane zasłony), tempo spokojne, duża typografia italic w cytatach.

## 3. Paleta (z workflow_branding type=color)

- **Primary (akcent):** #4F6E5C (deep sage — brand ink, rytuał)
- **Ink (główny tekst):** #1F2420 (midnight ink)
- **Paper (tło):** #F5F1EA (pearl cream)
- **Accent / Gold (opcjonalny):** #C88B65 (terracotta — ciepło grafenu, CTA, moments of warmth)

> Wspierające (użyj oszczędnie): `#A394C4` lilac-dusk (dreamy/evening accents w gradientach), `#A5AFA8` mist gray (dividers, rules, borderlines).
> Paleta 60/30/10:
> - **60% Paper** #F5F1EA — oddech strony
> - **30% Sage** #4F6E5C — brand ink, nagłówki wybijane, ritual markers
> - **10% Terracotta** #C88B65 — TYLKO w: CTA primary button, underline hover, minute-timer separator „15:00"

## 4. Typografia (z workflow_branding type=font)

- **Display (nagłówki):** Fraunces + `&display=swap&subset=latin-ext` (bezpieczne Ł w uppercase — safety #7)
- **Body (treść):** Inter + `&display=swap&subset=latin-ext`
- **Mono / Caption (opcjonalny):** JetBrains Mono (eyebrows `MINUTA 03 · RYTUAŁ` + mikro-dane), Cormorant Garamond (cytaty testimoniale w italic, monumentalny timer hero)

> ⚠️ Sprawdź polskie „Ł" w UPPERCASE — patrz [`docs/landing/reference/safety.md` reguła #7](../../docs/landing/reference/safety.md). Italiana ❌, Fraunces ✅.
> Max 3 rodziny fontów (Fraunces + Inter + Cormorant Garamond; JetBrains Mono w captions liczę jako 3cią bo Cormorant użyty tylko w signature timer + cite, nie ciele).

## 5. Persona główna (z report_pdf)

- **Wiek / zawód / status:** Managerka Magda, 35 lat, middle management w korpo lub własna firma (Warszawa / Poznań / Wrocław). Mąż, dziecko w wieku szkolnym, mieszkanie w bloku lub dom pod miastem. Dochód 12-18k netto.
- **Kluczowy pain point** (co najbardziej frustruje): Pieczenie oczu po siódmej godzinie przed ekranem, wieczorne napięciowe bóle głowy w poniedziałki, cienie pod oczami które nie chcą zniknąć przed porannym spotkaniem. Próbowała już kropli nawilżających, okularów z filtrem niebieskim, szklanki wody — nic nie działa na przyczynę, bo przyczyną jest 8-10 godzin pracy, a tego nie zmieni.
- **Kluczowa motywacja zakupu** (czego oczekuje od produktu): „Piętnaście minut wieczorem dla siebie" — rytuał deprywacji sensorycznej zanim wróci do maili. NIE prezent. NIE gadżet. Coś co działa TERAZ, żeby jutro wyglądała jak wyspana.
- **Cytat brzmiący jak wypowiedź persony** (do testimonials): „Zaczęłam od migreny w niedzielę wieczorem — sięgałam po ibuprofen z automatu. Po trzech tygodniach z Oculia odkładam telefon o 22:30, zakładam masażer na piętnaście minut i rano nie mam worków. Pierwszy raz od lat czuję, że wieczór należy do mnie, nie do ekranu."

## 6. Anty-referencje (co JUŻ JEST w `landing-pages/`, czego NIE powtarzaj)

> Procedura wymaga ZAWSZE budowania od zera (MODE=forge). Tabela poniżej to historia, NIE template'y do kopiowania (memory: `feedback-landing-always-forge.md`).

Sprawdź czy w `landing-pages/` jest już landing podobnego kierunku (vitrix, paromia, h2vital, pupilnik, vibestrike, kafina) — jeśli tak, zanotuj **czego specyficznie nie chcesz powtórzyć**:

- **Już istnieje (najbliższy kierunek):** `h2vital/` — Organic/Natural wellness z miętowymi greenami i zaokrąglonym sans. **NIE POWIELAM:** rounded sans, mint/beige palette, spa-green aesthetic, bubbly iconography. Oculia jest surowsza — midnight ink + deep sage (NIE mint), matowa terakota, Fraunces serif zamiast rounded sans, edytorialna precyzja apteczna zamiast ziołowej miękkości.
- **Już istnieje (drugi kierunek pokrewny):** `paromia/` — Editorial/Luxury z Fraunces + Italiana + paper/ink/gold. **NIE POWIELAM:** złoty akcent (u nas terakota), Italiana (u nas Cormorant Garamond w akcentach), hygge domowy (u nas apothecary-clinical). Magda nie kupuje „cozy atmosphere" — kupuje „reset dla oczu przed jutrzejszym spotkaniem".
- **Czego unikam (signature elements istniejących):** żadnych oversize italic numeral jak w paromia (to ich signature), żadnych zaokrąglonych liści / fal jak w h2vital. Własne: **monumentalny countdown „15:00" w Cormorant Garamond italic** + **minute-markers** `MINUTA 01 → MINUTA 15` numerujące sekcje zamiast klasycznego `Nº 01 → Nº 10`.

## 7. Test anty-generic (4 pytania — wszystkie TAK)

- [x] Czy 3 wybrane marki referencyjne są SPOZA e-commerce? → Aesop (apteczna kosmetyka), Byredo (niszowe perfumy), Kinfolk (magazyn editorial). Żadne nie są „sklepy z masażerami".
- [x] Czy odwracając logo nadal zgaduję branżę (moodboard jest charakterystyczny)? → Sage + terracotta + pearl cream + Fraunces + minute-markers → wellness-rytualny apothecary. Nie wygląda jak kolejny sklep z elektroniką ani jak generic „spa".
- [x] Czy persona NIE pasowałaby do innego baseline'u z tabeli? → Magda managerka wymagająca rytuału sensorycznej deprywacji ≠ Panoramic Calm (zbyt corporate/architectural), ≠ Organic (zbyt ziołowa miękkość), ≠ Playful (wiek/ton nie pasuje), ≠ Retro-Fut (inny vibe), ≠ Rugged (inna płeć/kontekst), ≠ Editorial/Luxury (nie kupuje statusu, kupuje reset).
- [x] Czy manifest w 5 linijkach da się zacytować bez słów „premium", „luxury", „wysoka jakość"? → Tak: „Wieczorny rytuał dla oczu pracujących 10h przed ekranem. Piętnaście minut w ciepłej ciemności. Grafen 38-42°C, poduszki powietrzne, muzyka. Zamknij oczy. Wróć." — zero słów-wytrychów.

## 8. Signature element

> Jeden charakterystyczny element wizualny, który zostanie po obejrzeniu landinga. NIE „nowoczesny design" — coś konkretnego.

**Twój signature element:**

**„Minute-marker" — numerowanie sekcji w minutach rytuału zamiast w numerach kolejnych.** Każda sekcja dostaje własny czas rytuału w postaci micro-eyebrow `MINUTA 01 · RYTUAŁ`, `MINUTA 03 · PROBLEM`, `MINUTA 07 · TECHNOLOGIA`, `MINUTA 12 · GŁOSY`, `MINUTA 15 · KONIEC` (zastępuje klasyczne `Nº 03`). W hero: monumentalny countdown **`15:00`** w Cormorant Garamond italic 280-440px, deep sage #4F6E5C na pearl cream, z subtelnym pulsowaniem opacity 0.65↔1 co 4 sekundy (jak oddech przed zamknięciem oczu) — jedyna animacja tła. Dwukropek w `15:00` jest w terracotta #C88B65.

**Dlaczego to działa:** manifest mówi „piętnaście minut w ciepłej ciemności" — minute-marker zamienia abstract narrative w wizualny measurement. Klient scrollując odczuwa czas rytuału. Paromia ma `Nº 01-10` (klasyczne magazine numbering) — my mamy `MINUTA 01-15` (ritual numbering). To uniwersalne signature, nie-kopiowalne bez zmiany narracji produktu.

**Reguły stosowania:**
- Minute-marker w eyebrow wybranych sekcji (Problem, Solution, Ritual/Features, Voices, Final CTA).
- Pozostałe sekcje używają klasycznego `Nº` (trust-bar, gallery, offer, faq).
- Countdown `15:00` pojawia się TYLKO raz — w hero, jako architektoniczny element tła (pozycja absolute, parallax speed 0.15, z-index 0).
- Kolor timera: sage z terakotową interpunkcją. NIGDY złoty (to paromia).

## 9. Warianty sekcji (autonomicznie wybrane)

- **Hero:** H6 Persona portrait — wellness/beauty/femtech + persona-driven to pierwsza pasująca reguła w drzewie decyzyjnym (rozdz. 4). Magda MUSI zobaczyć kogoś podobnego do siebie używającego produktu z zamkniętymi oczami w wieczornym kontekście. Headline + tagline + CTA po lewej, portret Magdy z masażerem w 5:7 po prawej. Ritual quote pod CTA.
- **Features:** F3 Linear stack — produkt ma **5 trybów + 3 technologie** (Graphene heating, Airbag shiatsu, Bluetooth music) = 5 features wymagających dłuższych opisów z konkretnymi liczbami (38-42°C, 1200mAh, 6-8 sesji, 180° składanie). Bento 2×2 (F1) by zgubił detale. F3 daje każdej funkcji własny scroll-stop + alternacja L/R odzwierciedla rytm oddechowy.
- **Testimonials:** T2 Before/After ze statsami — produkt transformacyjny z **mierzalnymi** pain pointami z raportu PDF: migreny (3×/tydz → 1×), ibuprofen (4/tydz → 0), sen (3h przewracania → 30 min zasypiania). T1 Voices (default) byłby słabszy — Magda chce liczb, nie cytatów.

## 10. Mapowanie manifesto → decyzje w ETAP 4 (DESIGN)

| Decyzja | Wartość z manifesto |
|---|---|
| Hero background | Pearl cream `#F5F1EA` z subtelnym radial gradient sage 8% w prawym-górnym rogu (jak poświata lampki nocnej) |
| Hero headline font-family | Fraunces 400-500 (display) |
| Hero headline font-style | Regular z `<em>` italic na kluczowych słowach („*piętnaście minut*", „*wróć*") |
| Signature element HTML | `<div class="ritual-timer js-parallax" data-speed="0.15">15<span class="tc">:</span>00</div>` absolute w tle hero |
| Dark section rytm | Jedna ciemna sekcja (Solution — midnight ink `#1F2420` tło, pearl cream tekst, sage accent). Reszta pearl cream / soft-sage. |
| Animacja hero | Subtle: js-split na headline (line-by-line fade-in), ritual-timer pulse 4s opacity 0.65↔1, magnetic CTA. Zero parallax shake. |
| Border-radius globalny | 16px karty, 999px pills/CTA, 0 dla dark hero strips |
| Shadow styl | `0 24px 64px -24px rgba(31,36,32,0.18)` — miękki, jak cień świecy |
| Divider między sekcjami | Ultra-cienki 1px `#A5AFA8` mist gray + minute-marker w eyebrow (zastępuje line divider w niektórych sekcjach) |

---

## Checklist wyjściowy ETAP 1

- [x] Audyt produktu z raportu PDF (nie z głowy) — 66% Polaków z wadami wzroku, 90% biurowych z problemami, cena 249-349 mid-premium, 5 trybów, grafen 38-42°C
- [x] 3 realne marki referencyjne wybrane (spoza `landing-pages/`)
- [x] Manifesto napisane — Apothecary Nocturne zdefiniowany
- [x] Nazwa kierunku WŁASNA (nie z 6 presetów)
- [x] Paleta zgodna z workflow_branding (sage #4F6E5C, midnight #1F2420, pearl #F5F1EA, terracotta #C88B65)
- [x] Fonty zgodne z workflow_branding (Fraunces + Inter + Cormorant Garamond)
- [x] Signature element konkretny (minute-marker `MINUTA 01-15` + monumentalny `15:00`)
- [x] Anty-referencje: unikam h2vital rounded/mint oraz paromia gold/Italiana
- [x] Warianty sekcji wybrane: H6 + F3 + T2
