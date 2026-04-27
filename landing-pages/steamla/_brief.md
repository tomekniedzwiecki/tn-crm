# Design Brief — Steamla

## 1. Kierunek manifesta (z 01-direction.md)

- [ ] Panoramic Calm — architectural, tech premium (vitrix)
- [ ] Editorial/Luxury — premium AGD, lifestyle, hygge (paromia)
- [ ] Organic/Natural — wellness, health, spa (h2vital)
- [ ] Playful/Toy — pet, kids, gadgets (pupilnik)
- [ ] Retro-Futuristic — gaming, tech edgy (vibestrike)
- [ ] Rugged Heritage — workwear, outdoor, tools & trades (kafina)
- [x] Nowy: **Apothecary Label** — uczciwa etykieta produktu, jeden składnik, evidence-first (handheld parownica jako narzędzie sterylne, nie magazyn lifestylowy)

**Uzasadnienie wyboru** (1-2 zdania z auditu produktu):
Steamla = utility (czyści) + precision (1500 W, 3 bary, 15 s) + evidence (jedyny składnik: H₂O). Style Atlas literalnie wymienia "Parownica ręczna eko-mamy (Steamla)" jako DNA Anchor #1 dla Apothecary Label (7/7 match osi DNA).

## 2. Moodboard — 3 realne marki referencyjne (SPOZA landing-pages/)

> Marki z prawdziwego świata, NIE inne landingi z `landing-pages/`. Każda referuje konkretny element wizualny lub tonalny.

1. **Necessaire (body care)** — spec-first design, technical disclosure jako estetyka, paper white tło + ink heading + jeden brand color jako akcent.
2. **Common Heir (apothecary supplements)** — pill-bottle-as-hero, oversized produkt label z monospace ingredient stamp, filozofia "skład > marketing".
3. **Seventh Generation (eco cleaning)** — uczciwa typografia pudełka: geometric sans + mono na jednostki, recycled-paper beige (tu wymieniony na paper white przez Style Lock), deep ink. Składnik wyeksponowany jak na opakowaniu leku.

## 3. Paleta (z workflow_branding type=color, ograniczona Style Lock apothecary-label)

- **Primary (akcent):** `#3DB5C9` Steam Teal (z brand) — CTA, 1-2 highlights
- **Ink (główny tekst):** `#0F1115` (Style Atlas Apothecary — sterylne ink)
- **Paper (tło):** `#FAFAF7` Paper White (Style Atlas — laboratorium, nie cream)
- **Lab Gray:** `#6B6F76` (Style Atlas — meta, units, footnotes)
- **Seal Red (opcjonalny):** `#C53030` (Style Atlas — ostrzeżenia liczbowe)

> Brand `#E09A3C` Amber Glow (gold/brass) i `#F6F3ED` Linen Cream są ZAKAZANE w Apothecary Label (sekcja 10.4) → ignorujemy z brand palette zgodnie ze Style Lock.

## 4. Typografia (z Style Lock apothecary-label, NIE z brand workflow)

- **Display (nagłówki):** `IBM Plex Sans` 500/600/700 + `&display=swap&subset=latin-ext`
- **Body (treść):** `Inter` 400/500/600 + `&display=swap&subset=latin-ext`
- **Mono (jednostki, ingredients, version numbers):** `IBM Plex Mono` 400/500 + `&display=swap&subset=latin-ext`

> Brand workflow proponuje Fraunces + Inter + Caveat — Fraunces i Caveat są ZAKAZANE w Apothecary Label (sekcja 10.4). Stosujemy stack Style Atlas.
> Polskie „Ł" UPPERCASE: IBM Plex Sans renderuje czysto, line-height ≥ 1.4 zachowane.

## 5. Persona główna (z report_pdf + brand_info)

- **Wiek / zawód / status:** Kobieta 30-42 lata, mama 1-2 dzieci (najmłodsze 0-5 lat) lub osoba z alergią na roztocza/pleśń. Mieszkanie 50-90 m², dom + samochód. Dochód powyżej średniej, czyta składy kosmetyków i detergentów.
- **Kluczowy pain point** (co najbardziej frustruje): Nie wie, co dokładnie zostaje na materacu po praniu chemicznym. Nie ufa "ekologicznym" detergentom z 30 niewymawialnymi składnikami. Boi się że zaalergizuje dziecko / pogorszy kaszel.
- **Kluczowa motywacja zakupu** (czego oczekuje od produktu): Chce mieć JEDNO narzędzie z JEDNYM składnikiem (woda) i metryką którą można sprawdzić (105 °C zabija roztocza/pluskwy). Nie chce eksperymentować na materacu dziecka — musi działać OD RAZU, z bezpieczną opcją zwrotu.
- **Cytat brzmiący jak wypowiedź persony** (do testimonials): "Kupuję detergenty i czytam skład jak ulotkę leku. Chcę narzędzie, które ma jedną pozycję na liście — wodę. To wszystko."

## 6. Anty-referencje (co JUŻ JEST w `landing-pages/`, czego NIE powtarzaj)

> Procedura wymaga ZAWSZE budowania od zera (MODE=forge). Tabela poniżej to historia, NIE template'y do kopiowania.

Sprawdź czy w `landing-pages/` jest już landing podobnego kierunku (vitrix, paromia, h2vital, pupilnik, vibestrike, kafina) — jeśli tak, zanotuj **czego specyficznie nie chcesz powtórzyć**:

- **Już istnieje:** `glassnova` (clinical-kitchen) — robot do mycia okien, KPI dashboards, Helvetica Neue + IBM Plex Mono, mocno data-viz
- **Czego unikam (signature elements istniejącego):** NIE kopiuję dashboardów / chartów / KPI cards z glassnova — Apothecary używa etykiet + tabel (label aesthetics, NIE charts). Steamla nie ma "dashboard pomiarowego" — ma `SKŁADNIK: H₂O — 100%` jako headline sekcji.
- **Już istnieje:** `h2vital` (organic-natural) — ten sam segment "wellness/zdrowie", ale ritual+feeling+tradition. Steamla = utility+evidence+present (lab metaphor, NIE wellness retreat).
- **Czego unikam:** NIE używam botanical greens, NIE soft serif italics, NIE "ritual" copy. Steamla = label leku, h2vital = wellness sklep.

## 7. Test anty-generic (4 pytania — wszystkie TAK)

- [x] Czy 3 wybrane marki referencyjne są SPOZA e-commerce? (Necessaire = clean beauty DTC, Common Heir = supplements DTC, Seventh Generation = eco-cleaning — wszystkie poza polskim e-commerce z parownicami)
- [x] Czy odwracając logo nadal zgaduję branżę (moodboard jest charakterystyczny)? (TAK — paper white + ink + spec-label dominanta + mono jednostki = "uczciwa etykieta", branża apothecary/lab; bez logo nadal czytasz "narzędzie ze składu")
- [x] Czy persona NIE pasowałaby do innego baseline'u z tabeli? (NIE pasowałaby do Editorial/Luxury — persona nie szuka prestiżu; nie pasowałaby do Playful — persona unika emocji i humoru; nie pasowałaby do Rugged — persona nie jest "trades & outdoor")
- [x] Czy manifest w 5 linijkach da się zacytować bez słów „premium", „luxury", „wysoka jakość"? (TAK — manifest brzmi: "Skład — jeden. Składnik — H₂O. 1500 W. 3 bary. 15 sekund. Nic więcej.")

## 8. Signature element

> Jeden charakterystyczny element wizualny, który zostanie po obejrzeniu landinga. NIE „nowoczesny design" — coś konkretnego.

**Twój signature element:**
**Full-width "spec-label" block** — gigantyczna etykieta produktu w środku strony: ramka 2px solid ink, padding 56px, headline `H₂O` w IBM Plex Sans 700 na 80-160px (clamp), pod nim `100% · bez dodatków` w mono caps i tabela specyfikacji `Objętość | 350 ml`, `Temperatura pary | 105 °C`, `Czas do gotowości | 15 s`. Etykieta wygląda jak strona ulotki leku przeniesiona na A2.

Drugi element wspierający: **sec-meta strip** w pełnej szerokości (`STEAMLA · LOT 2026-Q2 · BATCH 001 · PAROWNICA HANDHELD`) zamiast standardowego trust-bara z ikonami w kółkach.

## 9. Warianty sekcji (z [`section-variants.md`](../../docs/landing/reference/section-variants.md), LIMITED przez allowed_variants w Style Lock)

- **Hero:** H8 Split z ceną — guarantee w pre-headline + cena w CTA = naturalny dom dla Risk Reversal + Apothecary spec-stack
- **Features:** F3 Linear stack — pasuje do spec-row format (NIE bento 2×2, które jest forbidden)
- **Testimonials:** T2 Before/After stats — evidence-based, "byłem sceptyczny → wypróbowałem → kupiłem na stałe" struktura wpasowuje się w Risk Reversal narrative

---

## 10. STYLE LOCK — wybrany styl z Atlas (OBOWIĄZKOWE od v4.0)

> Ta sekcja jest **kontraktem** — łamiesz ją = FAIL w `verify-style-lock.sh`.

### 10.1 Wybrany styl
- **Style ID:** `apothecary-label`
- **Plik:** [`docs/landing/style-atlas/apothecary-label.md`](../../docs/landing/style-atlas/apothecary-label.md)

### 10.2 Product DNA (z Kroku 9a.1)
- Utility↔Ritual: **utility** (czyści, narzędzie)
- Precision↔Expression: **precision** (3 bary, 1500 W, 15 s, 105 °C — twarde liczby)
- Evidence↔Feeling: **evidence** (jedyny składnik H₂O — fakt, nie aspiracja)
- Solo↔Community: **solo** (sprzątasz sam_a, intymny dotyk materaca dziecka)
- Quiet↔Loud: **quiet** (calm wellness, bez chemii, ciche dźwięki — para)
- Tradition↔Future: **present** (parowanie zna każda babcia, ale nowoczesna realizacja 1500 W)
- Intimate↔Public: **intimate** (kuchnia, sypialnia, fotelik dziecka)

Match z wybranym stylem: **7/7**. Argumentacja (1 zdanie): Style Atlas literalnie wymienia "Parownica ręczna eko-mamy (Steamla)" jako pierwszy DNA Anchor — perfect alignment.

### 10.3 MUSZĄ być użyte (auto-paste z pliku stylu)
- Display font: `IBM Plex Sans` w `font-family`
- Mono font: `IBM Plex Mono` — min 1 występ per sekcja
- Min 1 `<table>` lub `.spec-*-list` w landingu
- Padding sekcji ≥ `100px 0` (grep CSS)
- Primitive 1 (`.spec-label-section`) obecny — gigantyczny `H₂O` block
- Paleta: `#FAFAF7` (paper) + `#0F1115` (ink) + `#3DB5C9` (Steam Teal jako brand accent)
- Layout DNA: stack dense, max 720-880px central column, ZERO bento 2×2

### 10.4 NIE WOLNO użyć (auto-paste)
- **Fonty:** NIE `Fraunces`, `Cormorant`, `Playfair`, `Italiana`, `Libre Bodoni`, `Caveat`, `Fredoka`, `Archivo Black`, `Nunito`
- **Layout:** NIE `grid-template-columns: 1fr 1fr` dla features (bento 2×2 zakaz)
- **Elementy:** NIE `Nº` w eyebrow, NIE `.hero-numeral` (oversized italic), NIE `.trust-strip` z dark bg + icon circles
- **Kolory:** NIE `#F6F3ED` (linen cream), NIE `#E09A3C` `#C9A961` (gold/brass), NIE `linear-gradient` w tłach sekcji
- **Motion:** NIE `.js-split`, NIE `.js-parallax`, NIE `.magnetic`

### 10.5 Section Architecture (z pliku stylu sekcja 8)
Required (min 10 z 12): Header, Mobile Menu, Hero, Sec Meta Strip, Spec Label Big, Features as Spec Rows, How It Works, Comparison Table, FAQ, Offer, Footer
Forbidden: Trust Bar dark (z ikonami w kółkach), Social Proof Marquee, Final CTA Banner (wide)

### 10.6 Motion Budget (z pliku stylu sekcja 10)
```yaml
js_effects_required: [.fade-in, .js-counter]
js_effects_forbidden: [.js-split, .js-parallax, .magnetic]
js_effects_count: { counter_min: 1, counter_max: 3, magnetic_min: 0, tilt_min: 0, parallax_min: 0 }
```

---

## 11. CONVERSION LOCK — wybrany mechanizm psychologiczny (OBOWIĄZKOWE od v4.2)

> Ta sekcja jest **kontraktem** — łamiesz ją = FAIL w `verify-conversion-lock.sh`.

### 11.1 Wybrany mechanizm
- **Mechanism ID:** `risk-reversal`
- **Plik:** [`docs/landing/conversion-atlas/risk-reversal.md`](../../docs/landing/conversion-atlas/risk-reversal.md)

### 11.2 Conversion DNA (z Kroku 9b.1)
- Pain↔Aspiration: **pain** (kotwice: strach przed chemią w domu dziecka, lęk przed pogorszeniem alergii — kupujący ucieka przed STRATĄ, nie goni aspiracji)
- Decision basis: **mixed** (kotwice: twarde fakty 1500 W / 3 bary / 105 °C, ale finalna decyzja emocjonalna — bezpieczeństwo dziecka)
- Awareness stage: **solution-aware** (kotwice: parownice istnieją na rynku, persona zna kategorię; ostatnia obiekcja = "czy ta konkretnie zadziała na MÓJ materac")
- Risk appetite: **risk-averse** (kotwice: alergicy nie eksperymentują, mama dziecka nie testuje na fotelik samochodowy bez gwarancji odzysku pieniędzy)
- Decision speed: **quick** (kotwice: po hero + offer + guarantee detail = decyzja, NIE longform investigation)

Match z wybranym mechanizmem: **5/5**. Argumentacja (1 zdanie): Risk-averse + solution-aware persona z konkretnym pain (chemia + zdrowie dziecka) = klasyczny target Risk Reversal — guarantee jest closer-em ostatniej obiekcji.

### 11.3 Hero formula (auto-paste z pliku mechanizmu)

```
Pre-headline: „30 DNI TESTU. ZWROT BEZ PYTAŃ."
H1: „Steamla — czystość, której skład czytasz w jednej linijce. 30 dni testu na własnym materacu, zwrot bez pytań."
Sub: „Wypróbuj w domu. Materac, fotelik, tapicerka — para 105 °C. Nie pasuje? Wracamy 100% kwoty + odbieramy paczkę kurierem."
Primary CTA: „Wypróbuj 30 dni — 599 zł"
Secondary signal: „30 dni gwarancji + odbiór z domu + 4,8/5 z 612 opinii"
```

### 11.4 MUSZĄ być użyte (auto-paste z pliku mechanizmu)
- **rr_hero_guarantee**: hero (h1 / pre-header / sub) zawiera frazę z liczbą dni gwarancji (regex: `\b(30|60|90|100) (dni|nocy) (gwaranc|test|próby|na zwrot|bez ryzyka)\b`)
- **rr_section_present**: sekcja `.risk-reversal-detail` (krok-po-kroku jak działa zwrot)
- **rr_guarantee_amplification**: ≥2 wzmocnienia guarantee — frazy `bez pytań`, `bez formularza`, `odbiór z domu`, `100% zwrot`, `pełna kwota`, `bez negocjacji`
- **rr_offer_guarantee_prominent**: w sekcji offer obecny element `.offer-guarantee` / `.guarantee-badge` z większą widocznością niż w innych mechanizmach
- **rr_cta_trial_framing**: primary CTA używa `Wypróbuj` / `Przetestuj` zamiast `Kup` (min 1 z 2 CTA)

### 11.5 NIE WOLNO użyć (auto-paste)
- **forbidden_no_returns_lang**: NIE `brak zwrotu`, `sprzedaż finalna`, `bez zwrotu`, `nie zwraca`
- **forbidden_fine_print_dominant**: NIE `chyba że`, `wyjątek`, `nie obejmuje`, `z wyłączeniem`, `tylko jeśli` w hero/offer (wyjątki tylko w fine-print sekcji)
- **forbidden_short_guarantee**: NIE guarantee <14 dni w hero (Steamla = 30 dni)
- **forbidden_pas_drama**: NIE `boli`, `kosztuje`, `tracisz`, `frustruje` w h1 hero (to PAS, nie Risk Reversal)
- **forbidden_curiosity_clickbait**: NIE pytania-clickbaity „Co [X] zaskakuje?" w h1

### 11.6 Style compatibility (z pliku mechanizmu sekcja 9)
```yaml
forces: []                # Risk Reversal jest stylistycznie neutralny
compatible:
  - panoramic-calm
  - apothecary-label      # ✅ wybrany — "Klinicyzm + medical-grade guarantee = match"
  - clinical-kitchen
  - editorial-print
  - swiss-grid
  - poster-utility
  - rugged-heritage
  - playful-toy
incompatible:
  - brutalist-diy         # raw/rebel vs corporate guarantee
  - retro-futuristic      # cyber/dark vs trust-first
```

**Coupling z sekcją 10 STYLE LOCK:** apothecary-label jest w `compatible` → match potwierdzony.

### 11.7 Section sequence (z pliku mechanizmu sekcja 5)

**Sekcje wymagane (extra ponad standard 14):**
- `.risk-reversal-detail` — eksplicytna sekcja krok-po-kroku jak działa zwrot (3 kroki, max 30 sekund userowi, konkretne dni / metody / wyjątki typu „nawet jeśli używałeś")

**Sekcje pominięte:**
- Heavy storytelling / longform — Risk Reversal = quick decision
- Identity gallery — niepotrzebne, klient już zdecydowany kategorialnie

### 11.8 Offer formulation (z pliku mechanizmu sekcja 6)

```
Price display: 599 zł (jednoznacznie, jedna cena, bez old-price strikethrough — Apothecary nie kreuje sztucznej obniżki)
Guarantee: „30 dni testu w domu. Zwracamy 100% kwoty bez pytań + odbiór paczki z domu na nasz koszt."
Payment options: BLIK / Karta / Przelew (standard)
Trust strip (sec-meta variant — Apothecary): „30 DNI GWARANCJI · ODBIÓR Z DOMU · BEZPIECZNA PŁATNOŚĆ · POLSKA OBSŁUGA"
```
