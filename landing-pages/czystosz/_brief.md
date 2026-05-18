# Brief — Czystosz Landing v2 (Image-driven)

**Workflow:** f3b555f4-3516-4082-8467-4669673cea14
**Klient:** Arkadiusz Bakuła (arkadiuszbakula@gmail.com, +48512276922)
**Data:** 2026-05-17
**Eksperyment:** GPT-image-2 generuje mockupy → Claude koduje (zastępuje wybór baseline z tabeli presetów)

---

## 1. Produkt

**Model:** ILIFE A30 PRO (robot odkurzacz + mop combo)
**Reference:** https://ae-pic-a1.aliexpress-media.com/kf/S97700a5ef7d04f9f9e6af13f85c4f0c1l.jpg
**Source:** AliExpress https://pl.aliexpress.com/item/1005010131006429.html

**Specy konkretne (HARD numbers do landinga):**
- LiDAR 3.0 — nawigacja, mapowanie domu
- Stacja samoopróżniająca — worek 4L, 60 dni bez serwisu
- 5000 Pa moc ssania (silne na dywany)
- 180 min czas pracy (do 100m² na jednym ładowaniu)
- Funkcja mopowania (zbiornik na wodę)
- App: strefy zakazane, harmonogramy, raporty z czyszczenia

---

## 2. Grupa docelowa

**Persona główna (z brand_info + ai_prompt sesji):**
- Kobieta 32-38, zapracowana mama, 1-2 dzieci, dom 60-100m² (mieszkanie / dom skandynawski)
- Pracująca / freelancerka, mało wolnych chwil, ceni czas
- NIE tech-enthusiast — chce żeby DZIAŁAŁO bez konfiguracji
- Budżet: 1500-2500 zł — premium-affordable (nie Roomba S9+)
- Wartości: czas dla rodziny > wieczna pucha, mniej zmartwień

**Pain (z czego się rezygnuje gdy kupuje):**
- "Soboty znikają na sprzątaniu"
- "Po pracy nie mam siły odkurzać"
- "Sierść kota wszędzie, codzienna walka"
- "Mąż obiecuje że odkurzy — nie odkurza"

**Trigger zakupu:**
- "Chcę żeby było po prostu czysto, bez myślenia"
- "60 dni bez dotykania kurzu" — JEDYNY taki USP w segmencie

---

## 3. Pozycjonowanie (USP one-liner)

**Czystosz to robot, który mapuje twój dom raz, a potem 60 dni sam dba o czystość.**

NIE konkurujemy z Roombą na premium specach. KONKURUJEMY z chwilą wolnego czasu w sobotę.

**Tagline (z brand_info):** „Czystość bez wysiłku."

---

## 4. Charakter designu — DECYZJA

### Baseline: **„Modern Calm Tech"** (własny kierunek, NIE z tabeli 6 presetów)

**Dlaczego nie z presetów:**
- Editorial/Luxury (paromia) — za elitarne, klient mid-market, nie luxury
- Panoramic Calm (vitrix) — najbliżej, ale za bardzo eteryczne, brak tech credentials
- Organic (h2vital) — zielone/naturalne, nie pasuje do robota
- Playful (pupilnik) — pet-friendly cute, dla mamy zapracowanej zbyt zabawne
- Retro-Futuristic (vibestrike) — synthwave, kompletnie nie ten segment
- Rugged Heritage (kafina) — workwear/craft, nie ten produkt

### Inspiracje (mood board):
- **Aesop** — minimalist beauty brand, generous whitespace, asymmetric grids
- **Notion landing** — clean ale ciepły, sporo białej przestrzeni, friendly tone
- **iRobot product page** — ale w midrange wykonaniu (nie premium)
- **Linear / Vercel landing** — precision typography, ALE bez tech-bro vibe
- **Kinfolk lifestyle photography** — ciepło, naturalne światło, slow life
- **Apple AirPods page asymmetry** — big product hero floating w whitespace

### Anti-patterns (czego NIE robić):
- ❌ Generic SaaS gradient hero + 3-column bullets feature
- ❌ Apple cold dark mode tech aesthetic
- ❌ Stock-photo „perfect family" tropes
- ❌ Gradient neony, glow effects, glassmorphism
- ❌ Bento grid masonry (zbyt 2024 SaaS)
- ❌ Tech-bro „join the future" copy

### DO RÓB:
- ✅ Asymetryczne layouty, big editorial photography
- ✅ Generous whitespace (powietrze = spokój brand promise)
- ✅ Numbered sections w Space Mono (01 / NOWY STANDARD)
- ✅ Big display metrics (5000 Pa | 180 min | 60 dni) jako duże cyfry editorialne
- ✅ Teal accent dyscyplinowany — 10-15% surface, nie wszędzie
- ✅ Orange CTA tylko 2-3x na całej stronie (rzadkie = klikalne)
- ✅ Real lifestyle photo: mama z kawą, robot cicho w tle
- ✅ Direct copy: konkrety, liczby, brak purple prose

### Kolory (z workflow_branding):
- Primary: `#00B4A0` Fresh Teal — accents, labels, section markers
- Anchor: `#1E3A5F` Deep Navy — headlines (NIE czysta czerń)
- CTA: `#FF6B35` Energy Orange — tylko buttony primary CTA (oszczędnie)
- Body text: `#0F1419` Carbon
- Muted: `#4A5568` Slate
- Background: `#FFFFFF` + `#F7FAFC` Cloud (alt sections)

### Fonty (z workflow_branding):
- Heading: `Plus Jakarta Sans` (700/800) — modern friendly geometric sans
- Body: `Inter` (400/500/600) — readable, neutral
- Accent / labels / numbers: `Space Mono` (400/700) — tech credentials sygnał

---

## 5. Struktura — 14 sekcji

1. **Header** — fixed, white solid, logo + nav 4 anchor + CTA orange
2. **Hero** — full-bleed lifestyle photo (mama+kawa+robot in tle), large asymmetric editorial headline po lewej, 3 spec metric pills po prawej
3. **Trust strip** — 4 ikony+claim w jednej linii: gwarancja 2 lata · dostawa 48h · 14 dni zwrot · aplikacja PL
4. **Problem/Solution** — split: lewo „Co kradnie ci sobotę" 3 bullety pain / prawo „Co dostajesz" 3 bullety gain
5. **Product showcase** — full-bleed studio photo robot + stacja, numbered specs po lewej (3 punkty Space Mono)
6. **Tech / LiDAR diagram** — isometric floor plan z teal dashed path, opis nawigacji
7. **Big specs row** — 3 megacyfry 5000 / 180 / 60 z opisami
8. **Personas / Use cases** — 3 karty: rodzina z dzieckiem · właściciel kota · mieszkanie 60m², każda z konkretną historią
9. **How it works** — 3-step numbered timeline (rozpakuj · uruchom · żyj)
10. **Testimonials** — 1 hero quote + 2 sidekick cards, photos + verified badge
11. **FAQ accordion** — 6 pytań (dywany, sierść, schody, hałas, mopowanie, gwarancja)
12. **Offer box** — biała karta z teal border, cena 1499 zł z przekreślonym 1899, 4 check benefits, orange full-width CTA, BLIK/karta/przelew note
13. **Final CTA** — full-bleed evening living room photo, robot wraca do stacji, headline „Daj sobie 60 dni spokoju."
14. **Footer** — logo + 3 linki + copyright + brand email klienta

---

## 6. Copy hooks (direct response, NIE purple prose)

**Headline hero:** „Czystość bez wysiłku."
**Sub hero:** „Robot Czystosz odkurza, mopuje i sam się opróżnia. 60 dni wolności od sprzątania."

**Section 04 problem:** „Co kradnie ci sobotę"
- Odkurzasz, wracasz po 2h — już znowu sierść
- Mopowanie po odkurzaniu = pół dnia z głowy
- Dzieci, kot, kurz — codzienna walka, której nie wygrasz

**Section 04 solution:** „Co dostajesz z Czystoszem"
- Robot mapuje dom raz, omija przeszkody zawsze
- Odkurza + mopuje w jednym przebiegu
- 60 dni bez dotykania kurzu — stacja sama się opróżnia

**Section 07 megaspec labels:**
- 5000 Pa / Moc ssania na dywany
- 180 minut / Bateria na 100m²
- 60 dni / Bez serwisu

**Offer box value-stack:**
- Robot Czystosz + stacja samoopróżniająca
- Aplikacja po polsku + harmonogramy
- 2 lata gwarancji producenta
- Dostawa 48h kurierem
- 14 dni na zwrot bez pytań

**Final CTA:** „Daj sobie 60 dni spokoju."

---

## 7. Płatności (zgodnie z `feedback-payment-methods.md`)

- BLIK
- Karta (Visa/Mastercard)
- Przelew

**ZAKAZ:** „za pobraniem", „raty", „PayPo", „Klarna", „Twisto", „24h", „magazyn w Polsce"

---

## 8. CTA & linki

**Domena klienta:** TBD (sprawdzić workflow_takedrop)
**Link checkout:** `[KLIENT MUSI WPROWADZIĆ — products=ID format]`
**Telefon:** +48512276922 (opcjonalnie w footer)
**Email landingu:** TBD (sprawdzić legal_data)

---

## 9. Reference images (do GPT-image-2)

- Logo: https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/branding/f3b555f4-3516-4082-8467-4669673cea14/logo_1774016670586_unnamed__1_.jpg
- Produkt: https://ae-pic-a1.aliexpress-media.com/kf/S97700a5ef7d04f9f9e6af13f85c4f0c1l.jpg

## 10. Mockupy designu (GPT-image-2)

3 wygenerowane mockupy w `design-mockups/`:
- `01-hero.png` — header + hero (1536x1024)
- `02-mid.png` — features + product + big specs (1024x1536)
- `03-lower.png` — testimonials + offer + final CTA (1024x1536)

Te mockupy są **visual reference podczas kodowania** — sekcje, layout, kompozycja, mood. NIE są to obrazy podstawiane do landinga (te są generowane osobno per-sekcja jeśli potrzeba).
