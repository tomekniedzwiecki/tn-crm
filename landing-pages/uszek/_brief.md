# Uszek — Landing Brief

**Status:** 🟡 W opracowaniu (ETAP 2.5 → 3) · **Kierunek:** Visible Care · **Workflow:** `ac3deb9c-9079-4394-b1d8-95e043a3cdd4`

---

## 1. Design Manifesto

### Kierunek: **Visible Care** (Widoczna Troska)

Nie „medical tech" (zimno), nie „family wellness" (banał). Uszek to **moment precyzyjnej troski w domowej kuchni** — dziecko na kolanach, kamera pokazuje prawdę, rodzic widzi zanim zrobi. To jest **gabinet rodziny**: cisza i precyzja, ale w świetle z kuchennego okna, a nie z jarzeniówki.

### Tempo: **Spokojne z precyzją**

Spokojne jak lekarz rodzinny, nie jak spa. Duży oddech między sekcjami (100–140px), ale w każdej sekcji wyraźna linia/rytm mono-numerów. Animacje powolne (400–800ms, cubic-bezier), bez bouncy/playful.

### Typografia

- **Display:** `Plus Jakarta Sans` 700/800 — nowoczesny geometryczny z ciepłym charakterem (nie sztywny jak Inter, nie redakcyjny jak Fraunces). Dopasowany do kategorii health-tech „human, not clinical".
- **Body:** `Inter` 400/500 — neutralny, czytelny, powszechny (nie wyróżnia się, co jest zaletą: tekst ma się czytać, nie popisywać).
- **Accent:** `DM Mono` 400/500 — **signature mover**: mono-numery w rogach sekcji (Nº 01/06), dane techniczne (1080p · 3,5 mm · IPX6), eyebrows nad headline'ami. Mono = „to są fakty, nie marketing".

### Paleta 60/30/10

- **Dominant 60%:** `#FBFAF7` warm off-white (oddech strony, ciepło papieru + teal subtle hints `#F0F9FF`)
- **Secondary 30%:** `#1A1F2E` Deep Navy (headline'y, ciemne sekcje — powaga, trust) + `#00B4A6` Medical Teal (CTA, linki, akcenty produktowe — health-tech)
- **Accent 10%:** `#FFB547` Care Amber — tylko w: (a) ikona guarantee 30 dni, (b) hover state primary CTA glow, (c) podkreślenie w hero headline („na oślep" — amber underline jak pomarańczowy highlighter w karcie pacjenta)

### Signature element: **Medical chart numbering + mono data strip**

Każda sekcja ma w lewym górnym rogu `Nº 03 / 09` w DM Mono 11px uppercase navy, jak numer w karcie pacjenta. Hero ma pod headline **mono data strip**: `1080p · 3,5 mm · iOS + Android · IPX6` — pierwszy sygnał powagi technicznej zanim user doczyta copy. Na końcu strony (finale CTA) gigantyczny numer sekcji powraca jako tło (10vw, opacity .06) — domyka rytm redakcyjny.

### Od czego świadomie uciekam

- **Zimny clinical blue** (Bebird, Medicover) — Uszek to dom, nie szpital
- **AliExpress neon + emoji burst** (⚡🔥✅) — tanio, nie pasuje do ceny premium 149 zł
- **Purple-to-blue gradient** (AI slop) — zero gradientów na dużych powierzchniach
- **Zdjęcia produktu na czystej bieli studio** — zawsze kontekst domowy (łazienka, kuchnia, kolana rodzica)
- **Rodzinne „happy family" stock pose** — zamiast: moment skupienia (rodzic patrzy na ekran, dziecko spokojne)

---

## 2. Photo System

### Lighting

Miękkie naturalne światło boczne z okna, pora: **poranek 8:00–10:00** lub **popołudnie 15:00–17:00**. Rozproszone (zachmurzone niebo lub koronka firanki). Nie złote, nie dramatyczne — **neutralne dom rodzinny**. Jeden praktyczny akcent: lampka nocna, światło z lodówki, odbicie ekranu telefonu na twarzy.

### Paleta w scenach

- **Tła:** biały kafel łazienki z cieniami, jasne drewno kuchenne, ciepły len pokrowców, ceramika matowa
- **Akcenty:** teal `#00B4A6` subtelnie — recznik, kubek, pokrowiec na telefon; amber `#FFB547` okazjonalnie — drewniany blat, mosiężne gałki
- **Unikamy:** pomarańcze ciepłe jak zachód słońca, neony, saturacja festiwalowa, total-white lab vibe

### Kadrowanie

- **Hero:** low-angle half-body, produkt na pierwszym planie w dłoni, telefon drugi plan z podglądem, twarz rodzica miękko rozmyta
- **Persony:** half-body 4:5, twarz + ramiona, patrząc NIE w kamerę (patrząc na dziecko / ekran / z boku)
- **Detale:** macro 1:1 silikonowej końcówki, USB-C, kabla — tactile, fibers visible
- **Kroki:** instruktażowe 4:3, TYLKO ręce + produkt + telefon, bez twarzy

### Post-processing

Subtle 35mm film grain (Kodak Portra 400), lekko cieplejsze cienie, neutralne light, **brak HDR**. 5% desaturacji w midtones. Imperfect framing — lekki tilt 1–2°, jeden element lived-in (kubek z kawą obok, ręcznik w nieładzie).

### Negatywy — NIGDY

- Neon glow na produkcie
- Tekst / watermark / logo UI w kadrze
- Studio white seamless
- Stock-pose „pointing at product" + zamknięte oczy + perfect smile
- Ojciec w garniturze pochylający się nad dzieckiem (korpo-rodzicielstwo)
- Medycyna: maski, fartuchy, stetoskopy, probówki — to NIE jest szpital

---

## 3. Personas (z raportu PDF)

| # | Imię | Wiek | Sytuacja | Scena hero dla niej/niego |
|---|------|------|----------|----------------------------|
| 1 | **Magda** | 34 l., Wrocław | Mama 2 dzieci, HR-owka, mieszkanie w bloku z klasą, capsule wardrobe, łazienka z białym kaflem | Rano, łazienka, Magda siedzi na brzegu wanny, 5-letnia córka na kolanach, spokojna; Uszek w dłoni Magdy, telefon na pralce pokazuje podgląd ucha. Magda patrzy na ekran, nie na kamerę. Len i pastel. |
| 2 | **Kamil** | 29 l., Warszawa | Dev/gadżeciarz, słuchawki nauszne 8h, mieszkanie z roślinami i biurkiem z setupem, bluza oversized | Wieczór, biurko z dwoma monitorami, Kamil siedzi bokiem, słuchawki nauszne zdjęte wiszą na stojaku, w dłoni Uszek, na ekranie iPhone obok wyraźny podgląd przewodu słuchowego. Neutralna mina skupienia. |
| 3 | **Jan** | 67 l., mniejsze miasto / miasteczko | Emeryt, samodzielny, mieszkanie z ciepłym drewnem, stoły zastawione książkami. Kupione często przez córkę na prezent. | Popołudnie, salon z fotelem uszakiem, Jan w okularach, na kolanach tablet z podglądem, Uszek w dłoni pewnie. Obok na stoliku herbata w szklance. Mina „znów słyszę świat". |

---

## 4. Mapping manifesto → kod (ETAP 3)

| Decyzja | Wartość |
|---|---|
| Hero background | warm off-white `#FBFAF7` z subtelną teksturą papieru (noise 3%), BEZ gradient blobs/glow |
| Hero headline font | `Plus Jakarta Sans` 800, `clamp(34px, 5.5vw, 62px)`, line-height 1.08 |
| Hero headline font-style | Amber underline (`#FFB547`, 6px) pod „na oślep" — jak highlighter |
| Signature element HTML | `<span class="section-num">Nº 03 / 09</span>` w lewym górnym rogu każdej sekcji, DM Mono 11px uppercase navy |
| Dark section rytm | **Sekcje ciemne:** Spec Sheet (Nº 05), CTA Banner finale (Nº 10). Reszta jasna lub paper-warm. Rytm: jasno · jasno · jasno · jasno · **CIEMNO** · jasno · jasno · jasno · jasno · **CIEMNO** |
| Animacja hero | Split headline reveal (18ms per char, cubic-bezier .2,.8,.2,1), mono data strip fade-in z opóźnieniem 400ms, produkt image subtle float (no ring, no glow rings) |
| Border-radius globalny | **14px** dla kart, 999px dla badge/button, 4px dla data strip items |
| Shadow styl | `0 14px 40px rgba(26,31,46,.08)` — navy-tinted, miękkie, nie czarne |
| Divider między sekcjami | Thin navy line `1px solid rgba(26,31,46,.08)` + mono label „— N/9 —" wyśrodkowany nad linią |
| JS effects obowiązkowe | (1) split headline hero, (2) counter na statach „8/10 Polaków", „4,8/5", „30 dni", (3) magnetic primary CTA, (4) tile tilt max 3° na bento cards, (5) parallax hero-numeral finale |

---

## 5. Moodboard (3 referencje — spoza landing-pages/)

| Marka | Co pożyczam | Dlaczego |
|-------|-------------|----------|
| **Oura Ring** (oura.com) | Mono numbers w metric cards (`72 bpm · 95% SpO2`) na neutralnym papierze, ciepła biel | Health-tech bez kliniczności. Uszek trust-bar i spec sheet bierze ich styl liczb. |
| **Muji** (muji.com) | Ciepła off-white paleta `#FBFAF7`, dużo pustego miejsca między sekcjami, ikony płaskie bez dramatu | Przeciwwaga dla „tech edgy" — Uszek ma być domowy, nie start-upowy |
| **Bang & Olufsen** (bang-olufsen.com) | Detail macro photography — zdjęcia tekstury gumki głośnika, przełącznika, pokrętła | Detal końcówki silikonowej, USB-C portu, przycisku — showcase musi mieć gatunek macro craft |

**Zabronione:** Bebird, Medicover, prywatne kliniki, AliExpress style, inne landingi z `landing-pages/`.

---

## 6. Decisions log

| Data | Zmiana | Powód |
|------|--------|-------|
| 2026-04-19 | Pierwsze uwagi klienta (punkty 1–12) wprowadzone w copy+CSS | Klient: hero typography, 30d zwrot, disclaimer non-medical, cookies RODO, mobile spacing, zł baseline, line-height CTA, usunięcie dostawy 24h/magazynu PL |
| 2026-04-19 | Złagodzenie specyfikacji: „silikon medyczny" → „silikonowe końcówki", „polska aplikacja" → „aplikacja mobilna" | Brak weryfikacji u dostawcy (raport mówi „silikon medyczny LUB poliwęglan"); język apki nieznany |
| 2026-04-19 | _brief.md utworzony (ETAP 2.5 — retro) | Landing był wygenerowany bez manifesta; piszemy teraz żeby zasilić ETAP 3 (obrazy AI + design polish) |

---

## 7. JS Effects zaimplementowane

- [ ] `.js-split` — split headline reveal hero H1 „Koniec z czyszczeniem uszu **na oślep**"
- [ ] `.js-counter` — counters na 8/10 Polaków, 4.8 ocena, 30 dni gwarancji
- [ ] `.magnetic` — primary CTA hero + offer + finale
- [ ] `.tile` tilt 3° — bento cards (Solution)
- [ ] `.hero-numeral` parallax — finale „10" jako gigantyczny background numeral

---

## 8. Live link

https://tn-crm.vercel.app/landing-pages/uszek/

**Status Vercel:** ✅ Live (auto-deploy z main)
