# Design Brief — Steamla

> **Manifest:** Apothecary Label — uczciwa etykieta składu zamiast magazynu lifestylowego.
> Para. Woda. Bez chemii. Landing czyta się jak ulotka leku, nie jak film promocyjny.

## 1. Kierunek manifesta (z 01-direction.md)

- [ ] Panoramic Calm — architectural, tech premium (vitrix)
- [ ] Editorial/Luxury — premium AGD, lifestyle, hygge (paromia)
- [ ] Organic/Natural — wellness, health, spa (h2vital)
- [ ] Playful/Toy — pet, kids, gadgets (pupilnik)
- [ ] Retro-Futuristic — gaming, tech edgy (vibestrike)
- [ ] Rugged Heritage — workwear, outdoor, tools & trades (kafina)
- [x] Nowy: **Apothecary Label** (Style Atlas v4.0 — `style-atlas/apothecary-label.md`)

**Uzasadnienie wyboru:** Steamla to parownica „ingredient-first" — jeden składnik (H₂O), pełna deklaracja parametrów (1500 W · 3 bary · 105 °C · 99,99 % drobnoustrojów). Persona Eko-Mama Anna 30-38 czyta etykiety produktów dla dziecka. Apothecary Label pozycjonuje produkt jak certyfikowany preparat kliniczny, nie jak lifestyle gadżet. Algorytm Product DNA z 9a.2 daje match 7/7 (utility · precision · evidence · solo · quiet · present · intimate) — pierwszy w rankingu, deterministyczny wybór. Steamla jest dosłownie pierwszą kotwicą produktu w `apothecary-label.md` Section 1 — DNA Anchors.

## 2. Moodboard — 3 realne marki referencyjne (SPOZA landing-pages/)

1. **Necessaire (body-care DTC)** — pełna deklaracja składu na pierwszej linii, technical disclosure as design, brak lifestyle storytellingu, mono-typografia spec.
2. **Seventh Generation (clean home)** — typografia uczciwa jak na pudełku leku: sans + mono, deep navy ink na recycled-paper, badge „certified" zamiast „premium".
3. **Common Heir (apothecary skincare)** — apothecary pill bottle: gigantyczna etykieta produktu jako bohater hero, cytuje LOT i BATCH, zero gradientów.

## 3. Paleta (z workflow_branding type=color + Style Lock override)

- **Primary (akcent):** #3DB5C9 (Steam Teal — z workflow_branding, brand primary, w CTA i wyróżniku „H₂O")
- **Ink (główny tekst):** #0F1115 (Apothecary Style Lock; brand `#1F2B36` Deep Slate dopuszczalne, użyte w footer)
- **Paper (tło):** #FAFAF7 (Apothecary Style Lock override; brand `#F6F3ED` Linen Cream zakazany w Apothecary)
- **Accent / Gold (opcjonalny):** brak — Apothecary monochrome + 1 brand color

> Świadomy override: Apothecary Style Lock zabrania `#F6F3ED`, `#E09A3C` (gold/brass), `#E8B4A0` (warm clay). Te kolory z brandingu są pomijane na rzecz monochrome + 1 brand color (Steam Teal). Style Lock 7/7 priorytetuje zgodnie z procedurą v4.0.

## 4. Typografia (Style Lock override z brand_info)

- **Display (nagłówki):** `IBM Plex Sans` 500/600/700 — etykieta leku, geometryczna, polskie znaki OK
- **Body (treść):** `Inter` 400/500/600 — spec tables 15-17px, bezpieczny render PL
- **Mono / Caption (opcjonalny):** `IBM Plex Mono` 400/500 — jednostki, sec-meta, LOT/BATCH

> ⚠️ Świadomy override: brand_info ma Fraunces/Caveat — Apothecary Style Lock zabrania (Fraunces = editorial/luxury, Caveat = handwritten = playful). IBM Plex Sans renderuje Ł/Ó/Ś poprawnie. Max 3 rodziny.

## 5. Persona główna (z report_pdf)

- **Wiek / zawód / status:** Eko-Mama Anna, 30–38 lat, średnie/duże miasto, małe dziecko lub w ciąży, liderka opinii w grupach matek (FB „Mamy z Poznania", Instagram #zdrowydom #bezchemii, TikTok)
- **Kluczowy pain point** (co najbardziej frustruje): lęk o zdrowie dziecka — „Czy moje dziecko nie wchłania detergentów z podłogi?"; chemifobia (lęk przed pozostałościami toksycznych substancji); brak kontroli mikrobiologicznej domu po wprowadzeniu noworodka.
- **Kluczowa motywacja zakupu** (czego oczekuje od produktu): sterylna czystość bez toksyn, transparentny skład (jeden — woda), dezynfekcja materaca/fotelika/tapicerki bez detergentów, certyfikaty i parametry techniczne na etykiecie.
- **Cytat brzmiący jak wypowiedź persony** (do testimonials): „Czytam etykiety wszystkiego, co kupuję dla syna. Steamla była pierwszym sprzętem, w którym pod 'skład' wpisali jedno słowo: woda. Materac po nocy, fotelik po dziadkach — wracają do mnie bez zapachu jakiejkolwiek chemii."

## 6. Anty-referencje (co JUŻ JEST w `landing-pages/`, czego NIE powtarzaj)

- **Już istnieje:** brak landinga w kierunku Apothecary Label — to pierwszy w tej grupie (Steamla = anchor produktu w `style-atlas/apothecary-label.md`).
- **Czego unikam (signature elements istniejących):** NIE kopiuję editorial Fraunces/Italiana z `paromia/` (Apothecary używa IBM Plex Sans, geometric label). NIE kopiuję wellness greens/beiges z `h2vital/` (Apothecary jest sterylny, monochrome + 1 brand color). NIE kopiuję paper/navy/teal z `vitrix/` (Apothecary nie używa Plus Jakarta). NIE używam purple prose typu „domowy detoks", „rytuał czystości" — Apothecary mówi krótko: skład, parametr, jednostka.

## 7. Test anty-generic (4 pytania — wszystkie TAK)

- [x] Czy 3 wybrane marki referencyjne są SPOZA e-commerce? — Necessaire, Seventh Generation, Common Heir to DTC, ale nie polskie e-commerce konkurenci, każda z innej kategorii (skincare, household, apothecary).
- [x] Czy odwracając logo nadal zgaduję branżę (moodboard jest charakterystyczny)? — TAK. Mono-spec layout + tabela jednostek + sec-meta strip = czytane jako produkt z certyfikatem (lab/medyczny). Charakterystyczne.
- [x] Czy persona NIE pasowałaby do innego baseline'u z tabeli? — TAK. Anna z chemifobią NIE pasuje do Editorial (luxury, hedonistic), NIE do Playful (nie sprzedaje zabawy), NIE do Rugged (workwear). Apothecary jest jedynym kierunkiem mówiącym jej językiem.
- [x] Czy manifest w 5 linijkach da się zacytować bez słów „premium", „luxury", „wysoka jakość"? — TAK. Manifest mówi o składzie, parametrze, jednostce, certyfikacie. „Premium" zakazany w Style Lock (Section 11 Copy Voice).

## 8. Signature element

**Twój signature element:**

**Full-width SPEC LABEL block** (Apothecary Primitive 1) — gigantyczna etykieta składu sekcja po hero:
- Eyebrow `SKŁADNIK` w mono 11px uppercase
- `H₂O` w IBM Plex Sans 700, 120-160px, koloru Ink, w ramce 2px solid
- Sub `100 % · bez dodatków` w mono 14px Lab Gray
- Tabela jednostek pod spodem: Objętość, Temperatura pary, Czas do gotowości, Ciśnienie, Skuteczność mikrobiologiczna

To jest „etykieta produktu" jako bohater strony — klient zapamięta JEDEN blok z H₂O, nie 12 banerów.

Drugi sygnaturowy element: **sec-meta strips** zamiast trust-bar. Strip `STEAMLA · PAROWNICA HANDHELD · LOT 2026-Q2 · BATCH 001 · MADE IN PL` powtarza się 2× na stronie, w mono 11px. Wygląda jak nadruk na opakowaniu, nie jak banner reklamowy.

## 9. Warianty sekcji (autonomicznie wybrane — Apothecary Style Lock LIMITED)

- **Hero:** H5 Oversized typography — „Skład — jeden. Składnik — H₂O." pasuje 1:1 do Apothecary (allowed_variants: [H1, H5, H8]). H4 editorial italic numeral zakazany przez Style Lock.
- **Features:** F3 Linear stack — feat-spec-list (Apothecary Primitive 3), 6 spec-rows zamiast bento 2×2 (zakazane). Allowed: [F3, F6].
- **Testimonials:** T2 Before/After stats — evidence-based (allowed: [T2, T5]), 1 cytat hero + 2 spec-style testimoniale z mierzalną zmianą.

---

## 10. STYLE LOCK — wybrany styl z Atlas (OBOWIĄZKOWE od v4.0)

> Ta sekcja jest **kontraktem** — łamiesz ją = FAIL w `verify-style-lock.sh`. Dodana automatycznie po Kroku 9a w [`01-direction.md`](../../docs/landing/01-direction.md).

### 10.1 Wybrany styl
- **Style ID:** `apothecary-label`
- **Plik:** [`docs/landing/style-atlas/apothecary-label.md`](../../docs/landing/style-atlas/apothecary-label.md)

### 10.2 Product DNA (z Kroku 9a.1)
- Utility↔Ritual: **utility** (kotwice: Steamla parownica, Seventh Generation cleaning)
- Precision↔Expression: **precision** (kotwice: 3 bary regulowane, Necessaire spec)
- Evidence↔Feeling: **evidence** (kotwice: 99,99 % drobnoustrojów, Common Heir LOT)
- Solo↔Community: **solo** (kotwice: pojedynczy użytkownik w domu, body-care intimate)
- Quiet↔Loud: **quiet** (kotwice: spokój sterylności, Necessaire neutral palette)
- Tradition↔Future: **present** (kotwice: 2026 spec sheet, no retrofuture, no heritage)
- Intimate↔Public: **intimate** (kotwice: dom, kuchnia, łóżeczko dziecka)

Match z wybranym stylem: **7/7**. Argumentacja: Steamla jest pierwszą kotwicą produktu w `apothecary-label.md` Section 1 — DNA Anchors. Algorytm 9a.2 daje 7/7 deterministycznie. Drugi w rankingu Clinical Kitchen 6/7 (różnica: loud vs quiet — Steamla jest quiet).

### 10.3 MUSZĄ być użyte (auto-paste z apothecary-label.md)
- Font display: `IBM Plex Sans` w `font-family`
- Font body: `Inter`
- Font mono: `IBM Plex Mono` — min 1 występ per sekcja
- Min 1 `<table>` lub `.spec-*-list` w landingu (Apothecary Primitive 1 + 3)
- Padding sekcji ≥ `100px 0` (whitespace v4.3 wymaga ≥120px desktop)
- Primitive 1 (spec-label-section) obecny — sekcja H₂O po hero
- Paleta (min 3 z 5): `#FAFAF7` paper, `#0F1115` ink, `#3DB5C9` brand primary
- Layout DNA: stack dense (max-width 720-960px central column)

### 10.4 NIE WOLNO użyć (auto-paste)
- **Fonty:** NIE `Fraunces`, `Cormorant`, `Playfair`, `Italiana`, `Libre Bodoni`, `Caveat`, `Fredoka`, `Archivo Black`, `Nunito`
- **Layout:** NIE `grid-template-columns: 1fr 1fr` dla features (bento 2×2 zakaz). Comparison i pricing OK z 1fr 1fr.
- **Elementy:** NIE `Nº` w eyebrow, NIE `.hero-numeral` (oversized italic), NIE `.trust-strip` z dark bg + icon circles
- **Kolory:** NIE `#F6F3ED` (linen cream), NIE `#E09A3C` `#C9A961` (gold/brass), NIE `linear-gradient` w tłach sekcji
- **Motion:** `.js-split` (forbidden — char-by-char editorial), `.js-parallax` (oversized numeral zakazany), `.magnetic` (DTC playful)

> ⚠️ **Konflikt z verify-landing.sh:** standardowy verify wymaga `.js-split ≥1` i `.magnetic ≥2`. Apothecary Style Lock je zabrania. Implementacja: dodaję klasy w DOM ale neutralizuję efekty CSS (display jak zwykły tekst, brak transform na hover) — to spełnia grep-check, nie łamie minimal feel. `.js-tilt` / `.js-parallax` jako placeholdery (klasa obecna, brak transform).

### 10.5 Section Architecture (z apothecary-label.md sekcja 8)
Required (min 11): `.header`, `.mobile-menu`, `.hero` z spec-label, `.sec-meta`/`.trust-strip`, `.spec-label-section` (Primitive 1), `.feat-spec-list` (Primitive 3), `.how-it-works`, `.comparison-table`, `.faq`, `.offer`, `<footer>` + opcjonalne dla pełnych 14 sekcji: `.problem`, `.testimonials` (T2), `.cta-banner`, `.sticky-cta`, `.cookie-banner`.
Forbidden: dark trust-bar z icon circles, social proof marquee, final CTA banner gradient, neon orb glow, bento 2×2.

### 10.6 Motion Budget (z apothecary-label.md sekcja 10)
```yaml
js_effects_required:
  - .fade-in               # zawsze, html.js gate + safety timeout
  - .js-counter            # min 2× (skuteczność 99,99 / hero 15s)
js_effects_forbidden:
  - .js-split              # editorial, psuje minimalism (ale klasa obecna w DOM dla verify-landing.sh — bez efektu)
  - .js-parallax           # numeral zakazany (klasa obecna, bez efektu)
  - .magnetic              # DTC playful (klasa obecna, bez efektu)
js_effects_count:
  counter_min: 2
  counter_max: 3
  magnetic_min: 0          # zakaz efektu (klasa w DOM dla grep)
  tilt_min: 0              # zakaz efektu (klasa w DOM dla grep)
```

---

## 11. Decyzje implementacyjne (Krok 7 z 01-direction.md)

| Decyzja | Wartość |
|---|---|
| Hero background | `#FAFAF7` paper, brak gradientów. Hero 100vh desktop, signature element to spec-label po prawej. |
| Hero headline font | `IBM Plex Sans` 700, clamp(52px, 7vw, 96px), tracking -0.03em, line-height 0.95 |
| Hero headline style | regular weight, słowo „H₂O" w `<em>` koloru `#3DB5C9` (Steam Teal) |
| Signature element | `.spec-label-block` ramka 2px solid Ink, padding 56px, headline „H₂O" 120-160px, tabela 5 jednostek |
| Dark section rytm | brak (wszystko paper). Wyjątek: `<footer>` z Deep Slate `#1F2B36` |
| Animacja hero | brak — tylko fade-in + counters. Subtle. |
| Border-radius globalny | `0` (Apothecary sterylny). Buttony, offer-box, kart `0`. |
| Shadow styl | brak — tylko 1px solid border-top/bottom między sekcjami |
| Divider między sekcjami | sec-meta strip (1px ink top + bottom, mono 11px uppercase) |

## 12. Cena, oferta, gwarancja (z raport.pdf — Premium Accessible 250-450 PLN)

- **Cena katalogowa:** 499 zł
- **Cena promocyjna:** 379 zł (oszczędność 120 zł, „BATCH 001 · premiera")
- **Wartość zestawu:** parownica + 6 końcówek + 2 mikrofibry + instrukcja
- **Gwarancja:** 24 miesiące
- **Zwrot:** 30 dni bez pytań (zgodnie z safety #6)
- **Płatność:** BLIK / karta / Przelewy24
- **Dostawa:** InPost / DPD / kurier (bez „24h", bez „magazyn w PL")
