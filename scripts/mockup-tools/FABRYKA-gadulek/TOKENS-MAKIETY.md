# TOKENS-MAKIETY — GADULEK · F2.5 · 2026-07-24

SSOT tokenów makiety wstrzykiwany do KAŻDEGO promptu (kod `common.py DNA`). Podział **KANON**
(poziom warsztatu — identyczny wszędzie) + **PARTYTURA** (tożsamość TEGO landingu, każda pozycja
z uzasadnieniem). Źródło partytury = `PLAN.md §5`.

## KANON (przepisane z SSOT — nietykalne, identyczne w każdym landingu)
- Rytm 8pt (8/16/24/32/48/64/96); padding sekcji desktop 96–128px, mobile 64–80px; treść ~1160–1200px; kolumna 50–75 znaków.
- Jasne tła (wysoka jasność, niskie nasycenie, WCAG dla body). ⛔ ciemne tła i neon.
- **JEDEN akcent** w twardym scope: **CTA · swash pod 1 słowem · gwiazdki ratingu · aktywne stany · sygnatura**. WSZYSTKIE ikony funkcjonalne = charcoal `--ink`.
- **Para fontów z kontrastem:** display (twarz marki) + osobny wyrazisty krój na eyebrow/liczby/label/body. ⛔ jeden krój na wszystko; ⛔ zimny mono.
- JEDEN radius serii; JEDEN styl ikon (outline ALBO filled) w OBU viewportach i wszystkich sekcjach.
- Głębia = warstwowe CIEPŁE cienie (tint, nie czarny) + grain 2–4%. Trust-pill jeden styl globalnie.
- Body = prawie-czerń dostrojona do rodziny tła (nie `#000`, nie mglisty jasny).
- Skala modularna 1.333 (1.5 dla wielkiego H1); body 16–18/lh 1.5–1.6; H1 desktop 56–80px; **H1 mobile floor 36–40px**.
- Sygnatura wydawnicza: eyebrow ALL-CAPS tracking 0.2em nad oversized display H2 (kontrast skali ≥1:5); ⛔ numeracja sekcji „0N/NN".

## PARTYTURA (decyzje TEGO landingu — każda „ten produkt/persona prowadzi do…")

### Kroje
- **`--font-display` = Fredoka (600/700)** ⟵ marka dziecięcej zabawki: krój miękki, zaokrąglony, „poduszkowaty", ale nie przedszkolny bazgroł. H1/H2/marka/cena/wielkie liczby. ≠ Fraunces/Space Grotesk/Bricolage (3 poprzednie). Plik wordmarku: `fonts/Fredoka-Bold.ttf` / `Fredoka-SemiBold.ttf`.
- **`--font-text` = Alegreya Sans (400/500/700)** ⟵ ciepły humanist z czytelnymi cyframi i WYRAŹNYM kontrastem wobec masywnej, rounded Fredoki (koniec „mono-rounded"). Eyebrow/body/label/specs/mikrocopy.
- Skala: H1 desktop 60px, mobile 40px; H2 40/28; body 17/1.55; eyebrow 13 caps tracking .2em.

### Kolor (role)
- **`--cta` = #C5265B (malina)** ⟵ WYPROWADZONY z różowego wariantu Gadulka (jedyny „ciepły" sygnał produktu; radosny, gender-neutralny jako marka). Biały na `--cta` = **5,53:1** (WCAG AA ✓). Scope: TYLKO CTA · swash · ★rating · aktywne stany · malinowa fala.
- `--cta-d` #A81E4E (hover) · `--cta-ink` #FFFFFF.
- `--ink` #3C1F28 (tekst główny — ciepła prawie-czerń) · `--body` #574C44 · `--line` #F0E2D6 (hairline).
- ⛔ Pastelowy BŁĘKIT produktu = TYLKO w packshotach/scenach, NIGDY jako drugi akcent UI. ΔE duże vs amber/zielony/azure poprzedników. **Gate akcent ✓.**

### Rodzina tła (jasna, ciepła — pokój dziecka / książka obrazkowa)
- `--paper` #FFF8EF (krem) · `--card` #FFFDF9 (kość słoniowa) · `--peach` #FFE9DC (jasna brzoskwinia, pasma/sekcje) · `--paper-3` #FBE3D4 (głębszy krem).
- Głębia: cień warstwowy tint sepiowo-różowy `rgba(120,40,70,.06–.12)` + grain 3%. ⛔ zero granatu/czerni/platyny/chłodnej bieli.

### Radius / ikony / sygnatura
- **`--radius` = 20px** (karty) / **12px** (chipy/przyciski małe) ⟵ zaokrąglenie „zabawkowe", echo miękkiego korpusu.
- **`--icon-style` = outline** (1.9px, charcoal `--ink`, jeden zestaw) w OBU viewportach.
- **Sygnatura = „malinowa fala między okienkami"** ⟵ metafora rozmowy urządzenie↔urządzenie: miękka linia sygnału z anteny → przez ekran → separator sekcji; plusiki „+", falki, zaokrąglone rogi ramek-ekranów (książka obrazkowa). ⛔ NIE symbol WiFi.

### Archetyp / świat
- **`archetyp-hero: H`** (stos zoning mobile-first) ⟵ ~90% ruchu mobile, impuls; hero pionowy: scena „widzą się" → hook → karta oferty. ≠ A (migotek/nakrecik) · ≠ B (zaklipek).
- **Świat/materiał** = dziecięcy dom + podwórko/park/kemping; matowy plastik, jasne drewno, tkaniny, kredowe rysunki, kartonowe kryjówki; casting dzieci 4–7 (ICP §5).

### Bohater (PASZPORT)
- Para krótkofalówek **błękit + róż** z żywym ekranem (twarz drugiego dziecka / UI); krótka antena z falkami; oczko kamery nad ekranem; kratka głośnika; duży owalny przycisk rozmowy; pętla na smycz; Type-C. **CZEGO NIE MA** (NEG): smartfon/smartwatch, dotyk, antena teleskopowa, metal, wodoodporne, obca marka „magecam", czarny martwy ekran.

### Cross-landing (gate)
5/5 osi różni się od migotek(amber/Fraunces/A) · nakrecik(zielony/Space Grotesk/A) · zaklipek(azure/Bricolage/B): akcent malina · font Fredoka · archetyp H · tło krem/brzoskwinia · świat dziecięcy dom+podwórko.

### Dane twarde do wstrzyknięcia (VERBATIM w promptach makiet)
Cena **„89,90 zł"** (za 2 sztuki) · **★4,7/5 · 687 ocen · 93,4%** (TYLKO w `opinie`) · ekran **2,0" IPS** · wideo **480P** · zasięg **100–400 m** · bateria **600 mAh**, ład. **1–2 h**, praca **3–5 h** · wymiary **12,4×5,4 cm** · wiek **3+** · warianty par **niebieski+niebieski / niebieski+różowy / różowy+różowy**.
