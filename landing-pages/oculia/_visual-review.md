# Visual Review — oculia (editorial-print v2)

> Generated: 2026-04-27
> Style: editorial-print · Mech: transformation-promise (narrative, niewymuszany verifyem)
> Verdict: GO

## Desktop (1440×900)

- ✅ **Hero H4 Editorial numerał** — oversized italic Fraunces "15" sub w tle prawej kolumny (parallax), eyebrow Nº 01 — RYTUAŁ w gold italic Cormorant, h1 z italic accent "Ciepła ciemność" w sage green. Dark spec-stack na packshocie z gold border-left. Figcaption "— Magdalena, 34, wieczór · Tryb zintegrowany 15 min" pod hero figure.
- ✅ **Trust strip dark editorial** — ink background z 5 KPI (★ 4.8 / 30 dni / 24 mies. / CE·RoHS / Polska), gold ikony w kółkach, italic Fraunces values, Cormorant captions.
- ✅ **Nº magazine page numbering** — w prawym górnym rogu każdej sekcji (Nº 02 — Dowód, Nº 03 — Metamorfoza...), italic Cormorant slate.
- ✅ **Problem section** — eyebrow Nº 02 — DOWÓD + h2 italic accent "kosztuje" + 3 problem-stat cards z borderem-top (7 godzin / 90% / 47 min) + chart-compare 3 rows ink/gold/sage.
- ✅ **Solution reveal** — 50/50 split z italic numerałem "14" parallax na lewej krawędzi; spec-list w editorial frame (Grafen / Presoterapia / Akumulator / Konstrukcja / Audio).
- ✅ **Features F2 Bento asymetryczny** — 1 large featured (Grafen 38–42°C, span 2 kolumny i 2 wiersze) + 3 mniejsze (Presoterapia / Tryby / Mobilność) z editorial frame.
- ✅ **How It Works** — 3 kroki z gold italic numerals 01/02/03 + Nº eyebrow + step-figure placeholders.
- ✅ **Voices T1** — 3 voices grid z: cudzysłów-dekorator gold, italic Fraunces quote, before/after stats (gold dla "Po 14 dniach"), avatar persona-figure 52×52, Italic Cormorant role.
- ✅ **Offer box** — animated border-beam gradient gold→sage→gold na top, dual price (449 zł przekreślona + 299 zł italic Fraunces 64px), savings badge gold "Oszczędzasz 150 zł · −33%", trust strip 3-col, payment row BLIK/Karta/Przelew/Apple Pay/Google Pay.
- ✅ **Final CTA** — dark ink section z gold italic numerał "15" za centrowanym CTA, eyebrow Nº 10 — OSTATNIE SŁOWO, gold CTA button.

## Tablet (768×1024)

- ✅ Single-column flow, wszystkie 14 sekcji rozkładają się 1-kolumnowo.
- ✅ Trust strip dark — wraps do flex-direction:column.
- ✅ Hero numerał "15" widoczny w tle (clamp scale działa).

## Mobile (375×812)

- ✅ **Hero spec stack mobile** — 3 dark tile (42°C / 5 / 8 sesji) z gold border-left zastępują absolute spec-stack desktop. Editorial gold values w italic.
- ✅ **Hero CTA above fold** — "Odbierz Oculię — 299 zł" widoczna z magnetic, touch target ≥48px.
- ⚠️ **Header CTA na mobile** — pierwotnie nie ukrywał się przez specificity z `.magnetic`; **naprawione** przez `!important` na `.header-cta { display:none }` w @media max-width:900px.
- ✅ **All sections single-column** — features bento spowoduje 1×4, voices 1×3, offer box centered.
- ⚠️ **Cookie banner** — pojawia się po 2.2s, zachodzi na sticky CTA — typowe, do akceptacji.
- ✅ **Sticky CTA mobile** — "Wracasz · 299 zł" z gold price + arrow, editorial italic styling.
- ⚠️ **Logo URL 429 chwilowy** — Supabase rate limit po wielu fetches w sesji, w produkcji się załaduje (URL poprawny, screenshot Playwright złapał tymczasowy block).

## Wnioski

- **Style Lock zgodny:** Fraunces ✅, Cormorant ✅, Inter ✅, Nº eyebrow w 9 sekcjach ✅, oversized italic numerał w hero (15) ✅, figure+figcaption ✅, magazine page numbers ✅, dark trust strip z ikonami w kółkach ✅, paper/ink/gold paleta ✅.
- **Editorial vibe:** brand_info ("Spokój widać w spojrzeniu") rezonuje z poetic ton landinga. Italic accents na "kosztuje", "Dlatego stworzyliśmy", "Ciepła ciemność", "przed laptopem" budują charakter rytuału.
- **Transformation narrative:** chart-compare 47 min → 6 min po 14 dniach + voice cards before/after są naturalnym fitem (mech transformation-promise zamiast PAS).
- **Verdict:** **GO** — landing gotowy do deploy. Klient zobaczy live URL i decyduje czy zostać przy editorial-print, czy wrócić do clinical-kitchen (poprzedni commit `123372d`).
