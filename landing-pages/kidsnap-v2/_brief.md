# KidSnap v2 — Landing Brief

**Workflow:** `e8110441-614f-4c8c-9b41-6ee8cdf26860`
**Customer:** Jakub Kubisch
**Produkt:** Cyfrowy aparat fotograficzny dla dzieci z natychmiastowym drukiem termicznym
**Cena:** 299 zł (zestaw Pro, było 449 zł)
**Motywacja v2:** v1 złamała 10+ safety rules (brak html.js, brak subset=latin-ext, dropshipping fraza, zero JS effects). v2 budowana od zera zgodnie z v3.6 procedurą.

## 1. Kierunek manifesta (z 01-direction.md)

- [ ] Panoramic Calm — architectural, tech premium (vitrix)
- [ ] Editorial/Luxury — premium AGD, lifestyle, hygge (paromia)
- [ ] Organic/Natural — wellness, health, spa (h2vital)
- [x] **Playful/Toy** — pet, kids, gadgets (pupilnik-adjacent)
- [ ] Retro-Futuristic — gaming, tech edgy (vibestrike)
- [ ] Rugged Heritage — workwear, outdoor, tools & trades (kafina)

**Uzasadnienie wyboru:** Produkt dla dzieci (4-10 lat), rodzic kupuje. Kluczowe emocje: radość + kreatywność + nostalgia (polaroid-like druk). Playful/Toy ale z „edited whimsy" — design-led, nie kiczowaty clipart. Myślenie: Djeco (toys) + Instax (nostalgia polaroid) + BEIS (soft pastels premium) — NIE infantylny plastic.

## 2. Moodboard — 3 realne marki referencyjne (SPOZA landing-pages/)

1. **Instax Mini (Fujifilm)** — nostalgia polaroid-feel + simplicity (shutter button iconography, „klik" moment), biały + pastele. Pożyczka: **framowanie zdjęć w white polaroid border** z spot shadow jak na świeżo wywołanym polaroidzie.
2. **Djeco** (francuska marka zabawek) — kolorowe ale curated, ilustracje w stylu retro-ksiązki dziecięcej, NIE clipart. Pożyczka: **ciepła kolorystyka + handwritten accent w Caveat** (nie Comic Sans feel).
3. **BEIS Travel** — soft pastels + playful-premium + nonchalant elegance. Pożyczka: **rounded corners 24-32px** wszędzie (card radius, button radius) + cream/ivory tła zamiast pure white.

**Wspólny mianownik:** radość + kreatywność + design-led (nie billboard reklamowy) + **rodzic czuje że to dobrze zaprojektowany produkt, nie plastik z chińskiej hurtowni**.

## 3. Paleta (z workflow_branding)

- **Primary (Sky Blue):** `#4FC3F7` — główny akcent, aparat, scenery
- **Accent (Coral Pop):** `#FF7F7F` — CTA, serce, energia, „klik!"
- **Flash (Sunny Yellow):** `#FFD54F` — badge, flash effect, highlights
- **Ink (Deep Indigo):** `#1A237E` — tekst główny (nie czerń — ciepły)
- **Paper (Cloud White):** `#FFFBF8` — tła (cream/ivory, nie pure white jak Instax)
- **Muted (Blue Gray):** `#78909C` — tekst drugorzędny, captions

## 4. Typografia (KRYTYCZNE — polskie znaki!)

- **Display:** `Nunito` wagi 800-900 (Black, Ultra Black) — bulletproof polskie znaki, bold i wyrazisty jak headline. Wcześniej miało być `Fredoka` ale empirycznie Playwright/Chromium nie pobierał poprawnie jej latin-ext subsetu → polskie „ą/ę/ż" fallbackowały na cienki system font = MIXED typography w jednym wyrazie (patrz `feedback-landing-fonts-polish.md` incident KidSnap v2 2026-04-20).
- **Body:** `Nunito` wagi 400-700 — ten sam family co display, mniej wag do pobrania, szybszy LCP.
- **Accent/Handwriting:** `Caveat` (400, 500, 600) — **NIE Patrick Hand** (tamten nie ma polskich znaków!). Używana w badge/label/polaroid-caption, max 3 miejsca.
- **Google Fonts URL BEZ `&subset=latin-ext`** — anty-wzorzec. Patrz memory `feedback-landing-fonts-polish.md`.
- **Total:** 2 font families (Nunito + Caveat), 9 wag łącznie — mniej niż typowe 3 fonts × 4 wag.

## 5. Persona główna (z auditu produktu)

- **Wiek / zawód:** 32-45 lat, rodzic (mama lub tata), mieszka w mieście (Warszawa/Kraków/Wrocław), 2 dzieci w wieku 4-10 lat, dochód 8-18k netto
- **Inspiracje wizualne:** IKEA Family, Oysho, Beis Travel, Instagram momblog w stylu @cup_of_jo
- **Kluczowy pain point:** „Moje dziecko ciągle przy telefonie/tablecie. Chcę coś żeby wyszło na świat, było kreatywne, zrobiło coś własnymi rękoma. Ale nie chcę kolejnej plastikowej zabawki za 50 zł, która się zepsuje po tygodniu."
- **Kluczowa motywacja:** kreatywność dziecka + alternatywa dla smartfonu + produkt który rodzic też chętnie trzyma w ręku (design-led, nie kiczowaty).
- **Cytat persony:** „Zamiast 3 godzin YouTube w sobotę rano — cała rodzina wyszła na spacer. Córka fotografowała kota, chmury, swój rower. Wieczorem mieliśmy 14 wydruków na lodówce. I ona NIE poprosiła o iPada."

## 6. Anty-referencje (co JUŻ JEST w `landing-pages/`, czego NIE powtarzam)

- **pupilnik** — NIE kopiuję bouncy emoji + pet-theme + rose
- **paromia** — NIE luxury Italiana + paper/gold
- **kafina** — NIE rugged workwear + stamp badges
- **vitrix** — NIE tech architectural + navy
- **NIE używam:** Comic Sans, stockowe „happy family z tabletem", clipart, cyberpunk neon, chłodne katalogowe białe tło Instax'a, infantylny papuśkowy rainbow
- **NIE kopiuję v1 kidsnap** — v1 wygląda jak template-copy, złamała 10+ safety rules, budujemy od zera

## 7. Test anty-generic (4 pytania — wszystkie TAK)

- [x] 3 referencje SPOZA e-commerce? — Instax Mini, Djeco, BEIS Travel — realne marki, żadna to landing z `landing-pages/`
- [x] Odwracając logo zgaduję branżę? — TAK, cyan+coral+yellow + polaroid-frame + „klik!" + dzieci → kids creative toy
- [x] Persona NIE pasowałaby do innego baseline'u? — TAK. 38-letnia mama 2-ki dzieci szukająca alternatywy dla smartfonu nie pasuje do kafiny/paromii/vitrix
- [x] Manifest bez „premium/luxury"? — TAK: „Djeco + Instax + BEIS = toy ale design-led, rodzic chętnie trzyma w ręku"

## 8. Signature element

> **Polaroid-frame treatment** dla każdego placeholdera zdjęcia: biały border 16px + soft shadow + lekkie przechylenie (-2deg/+1deg alternating) + „handwritten caption" w Caveat pod zdjęciem („Kasia, las, 4 października"). Każdy placeholder wygląda jak świeżo wywołane zdjęcie przyklejone do lodówki.

**Drugi pomocniczy:** Coral „klik!" speech bubble w hero (small, w rogu) — signature moment product experience. Emoji-free, handwritten w Caveat.

**Zakazane (byłyby clichowe):** ~~duży flash emoji ⚡~~, ~~kropki konfetti~~, ~~rainbow gradient~~, ~~sparkle stars~~.

## 9. Warianty sekcji (autonomicznie wybrane — ETAP 2)

- **Hero:** **H8 Split z ceną** — rodzic = comparison shopper, 299 zł widoczne od razu, value-focused headline („299 zł zamiast tabletu za 2000 zł"). Split lewo text + prawo packshot aparatu na cream tle z polaroid-floating.
- **Features:** **F1 Bento 2×2 klasyczny** — default dla 4 kluczowych features (natychmiastowy druk, dla dzieci 4+, bezpieczna plastikowa konstrukcja, long battery). Proste + czytelne dla rodzica w 30 sek.
- **Testimonials:** **T4 UGC wall** — PERFECT dla tej kategorii. Rodzice z Insta wrzucają zdjęcia dzieci z KidSnap. Grid 4×2 square tiles, `@username` na każdym. Autentyczny social proof > wymyślone cytaty.

**Diff vs istniejące baseliny:**
- v1 kidsnap: H1 Split + F1 Bento + T1 Voices → v2 ma **H8 Split z ceną + F1 + T4 UGC** (2/4 różnice)
- pupilnik: full emoji Playful → v2 „edited whimsy", polaroid-treatment, minimal emoji (2/4)
- Inne baseliny — paradigm completely different (3-4/4 różnice).
