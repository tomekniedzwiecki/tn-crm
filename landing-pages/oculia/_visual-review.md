# Visual Review — oculia

> Generated: 2026-04-27
> Style: clinical-kitchen · Mechanism: pas
> Verdict: GO

## Desktop (1440×900)

- ✅ **Hero KPI Dashboard** — sygnatura stylu (4 KPI tile z amber border-left, tabular-nums w Plex Mono, ink-on-paper kontrast). Headline "7 godzin przed monitorem kosztuje cię wieczór." z accent na primary green. Dual CTA z dominującym ink. Placeholder hero figure czytelny (4-polowy brief fotografa). Rating 4.8/5 widoczny pod CTA.
- ✅ **Pain amplifier** — 3 stat cards (7 godzin / 90% / 47 min) w sage primary z source citations (SW Research, KRIO). Powiela narrację bólu z hero — czysty PAS flow.
- ✅ **Trust panel (instrument-panel)** — 5 KPI tiles w jednym rzędzie (4.8★, 30 dni, 24 mies., CE/RoHS, Polska). Zamiast generic trust-bar — pasuje do Clinical Kitchen.
- ✅ **Solution reveal** — "Dlatego stworzyliśmy Oculię" + spec-list (Grafen / Presoterapia / Akumulator / Konstrukcja / Audio). Manus zachował frame.
- ✅ **Chart-compare (Problem)** — 2 grupy bar charts, zielone vs amber, pokazują Δ −87% bólu skroni i −68% noc z bólem. To drugi signature element zadeklarowany w briefie.
- ✅ **Features 2×2 (F4)** — 4 tiles z mockup figures (Grafen / Presoterapia / Tryby / Bluetooth) + KPI badge per tile. js-tilt 3D subtle.
- ⚠️ **How It Works** — 3 kroki z numerami w czarnych badge'ach. Wystarczająco czytelne, ale step-figure placeholders mogłyby być wyraźniej oddzielone wizualnie. Akceptowalne dla preview.
- ✅ **Voices T2 (Before/After)** — 3 voices z grid przed/po (czerwony przed, zielony po). Manus rewrited cytaty są direct response (Magdalena 34 / Sara 23 / Edward 62).
- ✅ **Offer box** — old price 449 zł przekreślona, nowa 299 zł duża, savings badge "Oszczędzasz 150 zł · −33%", rating 4.8/5, includes list, guarantee z callback do bólu hero ("Pulsujące skronie po pracy nie znikną?"), payment options BLIK pierwsze.
- ✅ **Final CTA** — dark hero z bg placeholder, amber CTA, dobry kontrast.

## Tablet (768×1024)

- ✅ **Single-column flow** — wszystkie 14 sekcji rozkładają się 1-kolumnowo bez rozjeżdżania.
- ✅ **Pain stats 1×3** — KPI 7 godz / 90% / 47 min czyte i nie zlewają się.
- ✅ **Trust panel 2×3** — 5 KPI w grid 2 kolumny + ostatni full-width OK.
- ✅ **Hero pre-headline** — "Pieczenie? Pulsuje?" amber pill widoczny.

## Mobile (375×812)

- ✅ **Hero CTA above fold** — "Skończ z bólem skroni — 299 zł" widoczna z 4 KPI tiles. Touch target ≥48px.
- ✅ **KPI grid 2×2** — wartości i labelki czyte, mocno tabularne.
- ⚠️ **Trzeci KPI label** ("Praca · sen · komfort") trochę mniej czytelny przez długość — akceptowalne dla preview.
- ⚠️ **Chart-compare bar fill** — przy bardzo małym fill (32% / "7 dni / mies.") tekst lekko wystawał poza bar; **już naprawione** (font-size:10px + min-width:72px w mobile @480px).
- ✅ **Cookie banner** — pojawia się po 2.2s, nie blokuje hero.
- ✅ **Sticky CTA mobile** — "Skończ z bólem · 299 zł" + arrow widoczny stale.
- ✅ **All sections single-column** — features, voices T2, FAQ accordion, offer — wszystko logicznie ułożone.

## Wnioski

- **Style Lock zgodny:** IBM Plex Sans + Plex Mono ✅, KPI grid + chart-compare jako signature elements ✅, brak warm cream/gold/Fraunces ✅.
- **Conversion Lock zgodny:** PAS hero z "kosztuje" + "tracisz", pain-amplifier section, solution-reveal explicit, offer guarantee z callback ✅.
- **Branding mismatch z założenia:** Style Lock wymusił override fontów (Fraunces → IBM Plex) — udokumentowane w `_brief.md` sekcja 4.
- **Verdict:** **GO** — landing gotowy do deploy. Drobny mobile chart-fill polish naprawiony. Klient zobaczy live URL i może zażyczyć dowolnych iteracji.
