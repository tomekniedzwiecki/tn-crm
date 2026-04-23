# Design Brief — Steamla (v2 — Apothecary Label)

<!-- v2 rebuild 2026-04-23 z System v4 Style Atlas — poprzedni brief: _brief.v1-linen-ritual.md -->
<!-- Style Atlas pick: apothecary-label (utility·precision·evidence·solo·quiet·present·intimate) -->

## 1. Kierunek manifesta (z 01-direction.md)

- [ ] Panoramic Calm
- [ ] Editorial/Luxury
- [ ] Organic/Natural
- [ ] Playful/Toy
- [ ] Retro-Futuristic
- [ ] Rugged Heritage
- [x] Nowy (z Style Atlas): **Apothecary Label** — uczciwa etykieta składu zamiast magazynu lifestylowego

**Uzasadnienie wyboru** (1-2 zdania): Steamla sprzedaje BRAK — brak chemii, brak składu, brak interpretacji. Etykieta produktu spożywczego/leku (Thrive Market, Seventh Generation) to dokładnie ta metafora — pokazujemy skład dużą czcionką zamiast opowiadać historię o ceremonii.

## 2. Moodboard — 3 realne marki referencyjne (SPOZA landing-pages/)

1. **Thrive Market** — private label packaging: duży spec block „Ingredients: Organic Olive Oil" jako dominanta strony produktu, pionowy stack
2. **Seventh Generation** — uczciwa typografia pudełka: geometric sans + mono, recycled-paper beige + deep navy, zero lifestyle photography
3. **Common Heir** — apothecary pill bottles: oversized product label jako layout strony, bottle-as-hero, technical disclosure

## 3. Paleta (z workflow_branding + Apothecary Style Lock)

- **Primary (akcent):** `#3DB5C9` (Steam Teal — brand, używany TYLKO jako CTA + 1-2 highlights per sekcja)
- **Ink (główny tekst):** `#0F1115` (Apothecary Ink)
- **Paper (tło):** `#FAFAF7` (Paper White — NIE linen cream, chłodniejsze)
- **Accent / Gray:** `#6B6F76` (Lab Gray — meta, units, secondary text)
- Support: `#C53030` (Seal Red) — ostrzegawcze liczby, 1-2x max

## 4. Typografia (z Apothecary Style Lock)

- **Display (nagłówki):** `IBM Plex Sans` 500/600/700 + `&display=swap`
- **Body (treść):** `Inter` 400/500/600 + `&display=swap`
- **Mono:** `IBM Plex Mono` 400/500 + `&display=swap`

> IBM Plex Sans ma pełne PL. Italiana/Fraunces/Cormorant ZAKAZ (Apothecary forbidden fonts).

## 5. Persona główna (z report_pdf + brand_info)

- **Wiek / zawód / status:** Kobieta 32-42, matka 1-2 dzieci (3-8 lat), często z alergikiem w domu (AZS, pyłki, roztocza); zawód świadomej konsumentki — HR, PR, marketing, dietetyk, terapeuta; Warszawa/Wrocław/Trójmiasto
- **Kluczowy pain point:** „Czytam skład szamponu dziecka przez lupę, a potem polewam fotelik samochodowy środkiem z hurtowni, którego nie rozumiem. Po godzinie maluch liże ten fotelik."
- **Kluczowa motywacja zakupu:** Jedna rzecz, która działa wszędzie na zwykłej wodzie. Para = starsza niż każdy detergent, rozumiała ją babcia.
- **Cytat:** „Mój syn ma atopowe zapalenie skóry. Przez trzy lata wyklepywałam każdy materac na balkon. Steamla wraca do mnie codziennie — z jednym składem, H₂O."

## 6. Anty-referencje (co JUŻ JEST w `landing-pages/`, czego NIE powtarzaj)

- **paromia** (Editorial/Luxury) — Fraunces + Italiana + gold-magazine. Steamla rebuild v2 eliminuje cały Fraunces stack.
- **vitrix** (Panoramic Calm) — Plus Jakarta + architectural tech. Steamla nie jest tech ani architectural.
- **h2vital** (Organic) — rounded sans + greens/beiges. Steamla jest cold paper-white, nie warm wellness.
- **Poprzednia wersja Steamla v1** (Linen Ritual z Fraunces + Nº) — ten sam editorial/magazine błąd który był cause rebuildu. Rebuild v2 ELIMINATES Fraunces, Nº, oversized italic numeral, dark trust-strip z ikonami w kółkach, warm linen cream, gold accent.

## 7. Test anty-generic (4 pytania — wszystkie TAK)

- [x] Czy 3 wybrane marki referencyjne są SPOZA e-commerce landingów? (Thrive Market = grocery, Seventh Generation = household, Common Heir = apothecary)
- [x] Czy odwracając logo nadal zgaduję branżę? (Paper white + IBM Plex + oversized „H₂O 100%" spec-label = clean-household/apothecary, nie generic AGD)
- [x] Czy persona NIE pasowałaby do innego baseline'u? (eko-mama 32-42 z alergikiem pasuje tylko do Apothecary/Clinical, nie do luxury/playful/tech)
- [x] Czy manifest da się zacytować bez „premium", „luxury", „wysoka jakość"? (manifest używa: „uczciwa etykieta", „spec block", „laboratoryjne", „evidence-based")

## 8. Signature element

**Full-width `H₂O / 100%` spec label section** (Apothecary primitive 1): ramka 2px solid ink, padding 56px, gigantyczny `H₂O` w IBM Plex Sans 700 (clamp 80-160px), tabelka spec pod spodem w IBM Plex Mono (Objętość 350 ml · Temperatura pary 105°C · Czas do gotowości 15 s). Umieszczony jako drugi blok po hero.

Dodatkowo: **sec-meta strip** primitive 2 — `PRODUKT · LOT 2026-Q2 · BATCH 001 · STEAMLA HANDHELD` w pełnej szerokości kontenera, zamiast ciemnego trust-bar z ikonami w kółkach.

## 9. Warianty sekcji (z Allowed Variants w Style Lock)

- **Hero:** H8 Split z ceną — value budget (<800 zł), comparison shopper. Mieszczę się w allowed [H1, H5, H8].
- **Features:** F3 Linear stack — features jako spec-rows (nie bento). Allowed [F3, F6] — F3 native match dla Apothecary spec-row format.
- **Testimonials:** T2 Before/After ze statsami — evidence-based (liczby przed/po). Allowed [T2, T5] — T2 native match (evidence).

---

## 10. STYLE LOCK — wybrany styl z Atlas (OBOWIĄZKOWE od v4.0)

### 10.1 Wybrany styl
- **Style ID:** `apothecary-label`
- **Plik:** [`docs/landing/style-atlas/apothecary-label.md`](../../docs/landing/style-atlas/apothecary-label.md)

### 10.2 Product DNA (z Kroku 9a.1)
- Utility↔Ritual: **utility** — kotwice: Anker powerbank, Dyson V15
- Precision↔Expression: **precision** — kotwice: Withings waga, sous-vide cooker
- Evidence↔Feeling: **evidence** — kotwice: Anker 20000 mAh, Medela trials
- Solo↔Community: **solo** — kotwice: Meditation app, skincare serum
- Quiet↔Loud: **quiet** — kotwice: Muji notebook, Aesop apothecary
- Tradition↔Future: **present** — nie tradycja (para stara ale produkt nowoczesny), nie future (bez apki)
- Intimate↔Public: **intimate** — kotwice: skincare routine, sleep tracker

Match z wybranym stylem: **7/7**. Argumentacja: Steamla pasuje do Apothecary Label w każdym wymiarze DNA — jest to produkt utility (sprząta), precision (3 bary/1500W/350ml specs), evidence-based (H₂O 100%), solo w użyciu, quiet (nie manifesto), present (nie tradycja, nie future), intimate (prywatne sprzątanie fotelika dziecka, nie manifest społeczny).

### 10.3 MUSZĄ być użyte (auto-paste z pliku stylu)
- Display font: `IBM Plex Sans` w `font-family` (grep-sprawdzalne)
- Mono font: `IBM Plex Mono` — min 1 występ per sekcja
- Min 1 `<table>` lub `<dl>` lub `.spec-*-list` w landingu
- Padding sekcji ≥ `100px 0` (grep CSS)
- Primitive 1 (`.spec-label-section`) obecny
- Tło: `#FAFAF7` paper white — min 4 sekcje

### 10.4 NIE WOLNO użyć (auto-paste z pliku stylu)
- **Fonty:** NIE `Fraunces`, `Cormorant`, `Playfair`, `Italiana`, `Libre Bodoni`, `Caveat`, `Fredoka`, `Archivo Black`, `Nunito`
- **Layout:** NIE `grid-template-columns: 1fr 1fr` dla features (bento 2×2 zakaz)
- **Elementy:** NIE `Nº` w eyebrow, NIE `.hero-numeral` (oversized italic), NIE `.trust-strip` dark z icon circles
- **Kolory:** NIE `#F6F3ED` linen cream, NIE `#E09A3C` `#C9A961` gold/brass, NIE `linear-gradient` sekcji
- **Motion:** NIE `.js-split`, NIE `.js-parallax`, NIE `.magnetic`, NIE `.js-tilt`

### 10.5 Section Architecture (z pliku stylu sekcja 8)
Required (min 11): Header, Mobile Menu, Hero (z spec-label), Sec Meta Strip (zamiast trust-bar), Spec Label Big Section (sygnaturowa), Features as Spec Rows, How It Works, Comparison Table, FAQ, Offer minimal, Footer

Optional: Problem, Testimonials Spec-style, Sticky CTA

Forbidden: Trust Bar dark z ikonami w kółkach, Social Proof Marquee, Final CTA Banner wide

### 10.6 Motion Budget (z pliku stylu sekcja 10)
```yaml
level: subtle
js_effects_required:
  - .fade-in               # zawsze
  - .js-counter            # min 1 (dla 99,9% roztoczy lub innej specyfikacji)
js_effects_forbidden:
  - .js-split              # char-by-char za editorial
  - .js-parallax           # brak oversized italic numeral w tle → bezcelowe
  - .magnetic              # za DTC/playful
  - .js-tilt               # zbyt polish
js_effects_count:
  counter_min: 1
  counter_max: 3
  magnetic_min: 0          # ZAKAZ
  tilt_min: 0              # ZAKAZ
  parallax_min: 0          # ZAKAZ
```
