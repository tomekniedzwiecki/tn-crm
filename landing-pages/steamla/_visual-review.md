# Visual Review — Steamla (v4.1)

> ETAP 5.5 — przeprowadzony 2026-04-27 po Playwright screenshotach (3 viewports + 5 mid-scroll).
> Style Lock: `apothecary-label` · Conversion Lock: `risk-reversal`

## Desktop (1440 × 900)

- ✅ Hero split layout — text + CTA z lewej, mockup parownicy z prawej (foteklik dziecka). Pre-headline "30 DNI TESTU" widoczne, h1 z H₂O w Steam Teal akcent. CTA dual: "Wypróbuj 30 dni — 599 zł" + "Jak działa".
- ✅ Sec-meta strip + 5-cell trust counter row (1500 W, 105 °C, 3 bary, 350 ml, 30 dni). Animowane js-counter aktywne.
- ✅ Spec Label Big (Apothecary signature primitive) — gigantyczny H₂O ~160px, 7-wierszowa spec table, footnote SGS Polska. Dominanta strony, vibe medical-label.
- ⚠️ Problem section — placeholder mockup nie pasuje semantycznie (mężczyzna w warsztacie zamiast detergentów); klient wymieni na realne zdjęcie.
- ✅ Features F3 Linear stack — 6 spec-rows z mono key (01 · SKŁAD ... 06 · BEZPIECZEŃSTWO), display strong + body text, footnote sup.
- ✅ How It Works — 3 kroki w grid border-style, każdy z placeholder briefem fotografa (4-pole P · STEP).
- ✅ Risk Reversal Detail — DOMINUJĄCA dark sekcja, Steam Teal numerals 01/02/03, fineprint "bez ukrytych wyjątków". Buduje zaufanie do guarantee.
- ✅ Comparison table — 4 kolumny (Steamla highlighted), 6 wierszy parametrów, tick `●` w Steam Teal, dane konkretne.
- ✅ Personas — 3 cards z mockupami parownicy w użyciu (fotelik, samochód, sofa). Logo overlay z brand session.
- ✅ Testimonials T2 Before/After — 2 testimoniale z stat boxes (przed/po), display stats w primary color, cytaty 80+ znaków.
- ✅ FAQ — 7 pytań details/summary, 80+ znaków odpowiedzi, hover state.
- ✅ Offer Box — biała kompozycja z guarantee badge `30` Steam Teal, price old (749) + new (599) + save (-20%), 4-cell trust strip, BLIK pierwsze. CTA z trial framing.
- ✅ Final CTA + footer — duży white card, hero-style heading, mockup 16:9 final-cta-figure, dark footer 4 kolumny.

## Tablet (768 × 1024)

- ✅ 1-column hero, nav widoczny w pełni, sticky-cta nieaktywne (≥768px breakpoint).
- ⚠️ Trust strip 5-cell wraps w 2 wierszach — ostatnia 30 dni / Gwarancja sama w drugim wierszu z border-right wciąż widoczny. Drobny issue.
- ✅ Spec Label Big — H₂O dominanta zachowana, table responsywna.
- ✅ Features stack 1-column z 220px key column.
- ✅ Risk Reversal grid wraps do 1 column z border-bottom.

## Mobile (375 × 812)

- ✅ Hero text + figure stacked, hero-spec-stack-mobile 3-col grid (1500 W / 3 bary / 15 s) pod obrazkiem, CTA primary 100% width touch target.
- ✅ Sticky CTA aktywne na dole z "Wypróbuj 30 dni — 599 zł".
- ✅ Trust strip mobile 2-col grid (3 wiersze), ostatnia 30 dni / Gwarancja zajmuje pełną szerokość (grid-column 1/3).
- ✅ Spec Label Big skala 64px H₂O (clamp), spec-table 50/50 columns, czytelne.
- ✅ Features F3 stack 1-col, padding 20px 0, key 11px caps + body text.
- ✅ How It Works kroki ułożone jeden pod drugim z placeholder briefami P · STEP 01/02/03.
- ⚠️ Hero figure max-height 60vh dodane post-screenshot — może wymagać re-screenshot w ETAP 6.

## Verdict: GO

**Style Lock:** 15/15 PASS · **Conversion Lock:** 6/6 PASS · **Verify-landing:** 65 PASS / 2 WARN / 0 FAIL.

Drobne uwagi w mockupach (problem section, brand-session overlays na personas) — klient i tak wymieni placeholdery na realne zdjęcia produktu Steamla po dostawie pierwszej partii.

Verdict: GO
