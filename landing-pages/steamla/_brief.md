# Design Brief — Steamla

## 1. Kierunek manifesta (z 01-direction.md)

- [ ] Panoramic Calm — architectural, tech premium (vitrix)
- [ ] Editorial/Luxury — premium AGD, lifestyle, hygge (paromia)
- [ ] Organic/Natural — wellness, health, spa (h2vital)
- [ ] Playful/Toy — pet, kids, gadgets (pupilnik)
- [ ] Retro-Futuristic — gaming, tech edgy (vibestrike)
- [ ] Rugged Heritage — workwear, outdoor, tools & trades (kafina)
- [x] Nowy: **Swiss Grid** — modułowy Helvetica, lewa krawędź, 12-col grid, zero ornamentu (Vitsoe / Dieter Rams / IBM ThinkPad)

**Uzasadnienie wyboru** (1-2 zdania z auditu produktu):
Steamla = utility (czyści) + precision (1500 W, 3 bary, 15 s) + evidence (jedyny składnik: H₂O). Swiss Grid DNA = utility · precision · evidence · solo · quiet · present · public — 6/7 match (jedyna oś rozjazdu: intimate vs public; Swiss jest „documenter manualem" przedstawiającym dane bezosobowo, co pasuje do specyfikacji urządzenia AGD).

## 2. Moodboard — 3 realne marki referencyjne (SPOZA landing-pages/)

> Marki z prawdziwego świata, NIE inne landingi z `landing-pages/`. Każda referuje konkretny element wizualny lub tonalny.

1. **Vitsoe (półki 606 system)** — strict 12-col modular grid, Helvetica Now, lewe wyrównanie, cienkie 1px rule lines dzielące moduły, zero gradient/cieni.
2. **Dieter Rams / Braun documentation** — left-aligned spec sheets, hierarchia przez wielkość (nie kolor), pure white tło, jedyny accent jako Signal Red przy CTA.
3. **IBM ThinkPad design archives** — modular info layout, Inter/Helvetica + jednostki w mono, bezosobowy dokumentalny ton ("dokumentacja produktu", nie "marketing").

## 3. Paleta (Swiss Grid — pure white + black + 1 signal accent)

- **Paper (tło):** `#FFFFFF` Pure White (Swiss strict — NIE cream, NIE off-white)
- **Ink (tekst, CTA solid):** `#000000` Absolute Black (Swiss strict)
- **Accent (1 highlight per sekcja):** `#3DB5C9` Steam Teal (brand primary z workflow) zamiast Signal Red — zachowuje brand identity
- **Grid Gray (secondary text):** `#707070`
- **Rule Gray (1px borders dzielące moduły):** `#DADADA`

> Brand `#E09A3C` Amber Glow / `#E8B4A0` Warm Clay / `#F6F3ED` Linen Cream — wszystkie pomijane przez Swiss Grid „pure white + black" filozofię. Steam Teal `#3DB5C9` zostaje jako jedyny brand-derived akcent.

## 4. Typografia (Swiss Grid — Helvetica/Inter, zero serifa)

- **Display (nagłówki):** `Helvetica Neue` z fallbackiem `Inter` 500/600 — swiss archetype, oversized lewe-wyrównane (64-140px)
- **Body (treść):** `Inter` 400/500 — body i sub
- **Tight (spec labels, jednostki):** `Inter Tight` 500/600 — opcjonalne dla `[01]` footnote markers, info-box labels

> Brand workflow proponuje Fraunces + Caveat — oba ZAKAZANE w Swiss Grid. Inter jest brand-friendly i atlas-friendly (zachowuje brand spójność z body Inter).
> Polskie „Ł" UPPERCASE: Helvetica Neue + Inter renderują czysto, line-height ≥ 1.4 zachowane.

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
**12-col grid z widocznymi 1px rule lines** dzielącymi każdy moduł + **oversized left-aligned h1 (clamp 64-140px Helvetica 500)** w hero, ułożone jak strona spec-sheet'u Vitsoe lub Dieter Rams documentation. Każdy claim oznaczony przypisem `[01]`, `[02]` z odniesieniem na dole sekcji.

Drugi element wspierający: **info-box panel** (ramka 1px solid ink, padding 24px, label `SPEC — 2026` w mono caps + lista `dl/dt/dd` z kluczem-wartością) zamiast typowego trust-bara — info-box renderuje specyfikację jak spec-sheet inżynierski.

## 9. Warianty sekcji (z [`section-variants.md`](../../docs/landing/reference/section-variants.md), LIMITED przez allowed_variants w Style Lock)

- **Hero:** H5 Oversized typography — left-aligned, oversized h1 jako pure typographic statement (Swiss archetype) + col-span-4 info-box po prawej dla spec/cena
- **Features:** F3 Linear stack — pionowe 12-col rows z numbered claims (01/02/03), zgodne z DNA „documenter manualem"
- **Testimonials:** T5 Single hero z pionową linią — jedyny acceptable wariant w Swiss; pojedynczy pull-quote z 1px rule po lewej, bez avatar-grid (T5 nie wymaga >1 testimonial)

---

## 10. STYLE LOCK — wybrany styl z Atlas (OBOWIĄZKOWE od v4.0)

> Ta sekcja jest **kontraktem** — łamiesz ją = FAIL w `verify-style-lock.sh`.

### 10.1 Wybrany styl
- **Style ID:** `swiss-grid`
- **Plik:** [`docs/landing/style-atlas/swiss-grid.md`](../../docs/landing/style-atlas/swiss-grid.md)

### 10.2 Product DNA (z Kroku 9a.1)
- Utility↔Ritual: **utility** (czyści, narzędzie — kotwice: Anker PowerCore, Dyson V15)
- Precision↔Expression: **precision** (3 bary, 1500 W, 15 s, 105 °C — kotwice: Swiss watch, sous-vide cooker)
- Evidence↔Feeling: **evidence** (jedyny składnik H₂O — kotwice: Anker mAh specs, Dyson „99% pick up")
- Solo↔Community: **solo** (sprzątasz sam_a — kotwice: Skincare serum, Notebook)
- Quiet↔Loud: **quiet** (bez ornamentu, dokumentacja produktu — kotwice: Muji, Aesop apothecary)
- Tradition↔Future: **present** (parowanie nowoczesne, ale dokumentacja klasyczna swiss — kotwice: Dieter Rams legacy, IBM ThinkPad)
- Intimate↔Public: **public** (specyfikacja jest dokumentem publicznym, „documenter manualem" — Swiss DNA przesuwa intimate Steamla na public przez bezosobowy register)

Match z wybranym stylem: **6/7**. Argumentacja (1 zdanie): Swiss Grid (utility · precision · evidence · solo · quiet · present · public) pasuje 6/7 osi do Steamla — różnica: Swiss preferuje public bo to dokumentacja produktu (jak spec-sheet Braun HL70), nie intimate ritual. Steamla ma silną stronę „precision · evidence" (1500 W / 3 bary / 15 s / 105 °C / 350 ml) która natywnie kupuje się jako dokumentacja techniczna.

### 10.3 MUSZĄ być użyte (auto-paste z pliku stylu)
- Display font: `Helvetica Neue` lub `Inter` w `font-family`
- Tło body: `#FFFFFF` (pure white, nie cream)
- Grid 12-col widoczny: `grid-template-columns: repeat(12, 1fr)` minimum 1 wystąpienie
- Min 3 sekcje left-aligned (`text-align: left` lub brak `text-align: center`)
- `border-radius: 0` dla cards/tiles (cards owalne zakazane)
- Primitive 1 (12-col grid z 1px rule lines) obecny
- Primitive 5 (info-box panel z `SPEC — 2026` label) obecny

### 10.4 NIE WOLNO użyć (auto-paste)
- **Fonty:** NIE `Fraunces`, `Playfair`, `Archivo Black`, `Caveat`, `Cormorant`
- **Layout:** NIE centered hero (Swiss strict: lewe wyrównanie), NIE full-bleed color, NIE bento 2×2 z zaokrągleniami
- **Elementy:** NIE stickers, NIE badges owalne (border-radius:50%), NIE hover shadows
- **Kolory:** NIE gradient tła, NIE warm cream, NIE gold (#E09A3C / #C9A961)
- **Motion:** NIE `.js-split`, NIE `.js-parallax`, NIE `.magnetic`, NIE `.js-tilt`

### 10.5 Section Architecture (z pliku stylu sekcja 8)
Required (min 10): Header (minimalist left brand), Mobile Menu, Hero (12-col grid + oversized left h1), Info Box Panel (zamiast trust bar), Features (12-col + 4-6 modułów), How It Works (3 numbered rows), Spec Table (tabelaryczne, monospace), Comparison (tabela 2-col strict), Offer (left-aligned, NIE centered), Footer (12-col grid)
Optional: Problem (left heading), Testimonials T5 (1 pullquote z pionową linią)
Forbidden: Centered hero, Poster full-bleed color, Bento 2×2 z zaokrągleniami, Sticker badges, Gradient backgrounds

### 10.6 Motion Budget (z pliku stylu sekcja 10 — level: still)
```yaml
js_effects_required: [.fade-in]
js_effects_forbidden: [.js-split, .js-parallax, .magnetic, .js-tilt]
js_effects_count: { counter_min: 0, magnetic_min: 0, tilt_min: 0, parallax_min: 0 }
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
  - apothecary-label
  - clinical-kitchen
  - editorial-print
  - swiss-grid            # ✅ wybrany — "Modular grid wspiera klarowną politykę zwrotu"
  - poster-utility
  - rugged-heritage
  - playful-toy
incompatible:
  - brutalist-diy         # raw/rebel vs corporate guarantee
  - retro-futuristic      # cyber/dark vs trust-first
```

**Coupling z sekcją 10 STYLE LOCK:** swiss-grid jest w `compatible` → match potwierdzony. Modular 12-col grid renderuje politykę zwrotu jako klarowną tabelę (3-row procedure 01/02/03), a info-box panel jest naturalnym domem dla guarantee badge.

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
