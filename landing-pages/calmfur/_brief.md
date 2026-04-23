# Design Brief — Calmfur

<!-- Manifesto commitowany razem z landingiem (źródło prawdy projektu). -->

## 1. Kierunek manifesta (z 01-direction.md)

- [ ] Panoramic Calm — architectural, tech premium (vitrix)
- [ ] Editorial/Luxury — premium AGD, lifestyle, hygge (paromia)
- [ ] Organic/Natural — wellness, health, spa (h2vital)
- [ ] Playful/Toy — pet, kids, gadgets (pupilnik)
- [ ] Retro-Futuristic — gaming, tech edgy (vibestrike)
- [ ] Rugged Heritage — workwear, outdoor, tools & trades (kafina)
- [x] Nowy (opisz poniżej): **Sunday Groom Ritual** — papierowo-editorialny mood rytuału niedzielnego poranka z psem, zbudowany wokół emocji "ciszy" (<65 dB) i "trzymania jak grzebień, nie maszyna". Nie tech bento, nie spa-organic, nie playful pet — intymny rytuał dwóch ciepłych ciał na kanapie.

**Uzasadnienie wyboru** (1-2 zdania z auditu produktu): Calmfur nie sprzedaje "urządzenia do sierści", sprzedaje 15 minut spokoju w niedzielny poranek — dla psa lękowego i dla właściciela, który nie chce trzymać golden retrievera za barierką. Emocja kluczowa = SPOKÓJ (explicite w nazwie marki i tagline "Spokojna sierść. Spokojny dom.") — żaden istniejący baseline nie trafia w ten mix editorial + pet warmth.

## 2. Moodboard — 3 realne marki referencyjne (SPOZA landing-pages/)

1. **Aesop** — apothekarski papier jako tło + Space Mono mikrocaption 10px uppercase nad seryfowym headline. Pożyczamy sposób prezentacji specyfikacji numerycznych (99% / 65 dB / HEPA 3) jako ledwo widoczne etykiety, nie jako banery.
2. **Ghia** — caffèterry evening brand z paletą amber+ivory+pine. Pożyczamy: amber #D9A064 jako jedyny nasycony akcent na tle papierowej ivory, nigdy jako pełne tło sekcji.
3. **Kinfolk magazine** — duże `Nº 01 — Nº 06` numerowanie sekcji, wielomiejscowe whitespace (padding 120-160px desktop), Fraunces headline ze świadomym italic na słowach-emocjach („poranek", „spokój"). Pożyczamy numerowanie sekcji + italic emphasis.

## 3. Paleta (z workflow_branding type=color)

- **Primary (akcent):** #D9A064 (Warm Amber — CTA, podkreślenia, highlight na liczbach)
- **Ink (główny tekst):** #2B3639 (Charcoal Pine — ciepła zielono-szara, nie pure black)
- **Paper (tło):** #F5F1EB (Cotton Cloud — off-white papierowy, NIE czysta biel)
- **Accent / Gold (opcjonalny):** #8FB5C7 (Mist Blue — poranne światło) + #7A9D8C (Sage Pulse — strefy „bezpieczeństwa" psa) + #C4BBAB (Oat Fog — karty, separatory)

60/30/10: 60% Cotton Cloud paper, 30% Charcoal Pine ink, 10% Warm Amber accent — Mist Blue + Sage Pulse + Oat Fog jako drugorzędne neutrale, po 3-4% każdy.

## 4. Typografia (z workflow_branding type=font)

- **Display (nagłówki):** Fraunces + `&display=swap`
- **Body (treść):** DM Sans + `&display=swap`
- **Mono / Caption (opcjonalny):** Caveat (handwritten — TYLKO w: podpisach przy signature numbers, voice marginaliach w personach, microcopy w CTA) + Space Mono 10px uppercase w mikrokapcjach (Aesop-style "Nº 01 · CICHY FAKT")

> Polskie „Ł" w UPPERCASE: Fraunces ✅ (safety #7).
> Max 3 rodziny fontów (Fraunces + DM Sans + Caveat; Space Mono stosowany rzadko, tylko w mikrocaption, można pominąć na rzecz DM Sans uppercase).
> BEZ `subset=latin-ext` (feedback-landing-fonts-polish.md).

## 5. Persona główna (z report_pdf + brand description)

- **Wiek / zawód / status:** 32-42 lata, kobieta lub mężczyzna, większe miasto (Warszawa/Kraków/Trójmiasto), dochód 8-18k netto, praca zdalna lub hybrydowa (IT/marketing/projektowanie), mieszkanie 60-90m² lub dom pod miastem, pies średniej-dużej rasy (Golden Retriever, owczarek, labrador, border collie — rasy długowłose).
- **Kluczowy pain point** (co najbardziej frustruje): Pies stresuje się na widok trimera/odkurzacza (warczenie, wibracje) — groomerska sesja kończy się dyszącym, roztrzęsionym zwierzęciem. Alternatywa: kanapa pokryta sierścią, rolka przed każdym wyjściem, Roomba która zbiera 30% tego co pies zostawia w 2 godziny, a trwa 24/7.
- **Kluczowa motywacja zakupu** (czego oczekuje od produktu): Nie „pozbyć się sierści" — odzyskać niedzielny poranek jako intymny rytuał (pies + właściciel + kawa), a nie gilotynową walkę o pielęgnację. Chce narzędzia, które trzyma się jak grzebień, nie jak przemysłowa maszyna.
- **Cytat brzmiący jak wypowiedź persony** (do testimonials): „Mój Rocky jest owczarkiem lękowym — do tej pory każda sesja u groomera kończyła się trzęsieniem przez 6 godzin. Pierwszy raz użyłam Calmfur w niedzielę, pies nawet nie podniósł głowy. Po piętnastu minutach kanapa była czysta, a on dalej spał."

## 6. Anty-referencje (co JUŻ JEST w `landing-pages/`, czego NIE powtarzaj)

- **Już istnieje (pet-adjacent):** `landing-pages/pupilnik/` — kierunek Playful/Toy (rounded bouncy, emoji-heavy, zabawa).
- **Czego unikam (signature elements istniejącego):** Zero emoji, zero rounded bubbly. Calmfur nie jest zabawką dla pupila — to rytuał dla właściciela, który kocha psa jak członka rodziny. Typografia edytorialna (Fraunces italic), nie rounded-geometric. Kolory stonowane ivory+pine+amber, nie sugar-rush pink+mint.
- **Już istnieje (editorial):** `landing-pages/paromia/` — Editorial/Luxury (Fraunces+Italiana, paper+ink+gold).
- **Czego unikam:** Italiana ❌ (safety #7 — Ł w UPPERCASE się łamie). Gold accent zastępuję Warm Amber (cieplejszy, mniej „wine bar", bardziej „kuchenna lampa"). Mood: nie kolacja we dwoje przy winie, tylko niedzielny poranek w piżamie z psem na kanapie. Calmfur ma Caveat handwritten (pet personal diary vibe) zamiast czystego Fraunces-only editorial.

## 7. Test anty-generic (4 pytania — wszystkie TAK)

- [x] Czy 3 wybrane marki referencyjne są SPOZA e-commerce? — Aesop (apteka-kosmetyki hybrid), Ghia (beverage), Kinfolk (magazine). Żadna nie sprzedaje urządzeń AGD ani produktów pet.
- [x] Czy odwracając logo nadal zgaduję branżę (moodboard jest charakterystyczny)? — Tak, paleta papier/pine/amber + Caveat dziennikowy + signature specs 99%/65 dB/HEPA w Fraunces italic = „urządzenie do pielęgnacji, kontekst dom+pet, nie spa, nie tech". Branża czytelna bez logo.
- [x] Czy persona NIE pasowałaby do innego baseline'u z tabeli? — Nie. Właściciel owczarka lękowego w niedzielny poranek nie jest persona vitrix (B2B tech), paromia (fine dining lifestyle), h2vital (wellness junkie), pupilnik (kid-first playful), vibestrike (gamer), ani kafina (workwear trades). Jest na przecięciu pet+slow-home+hygge, dla którego nie ma presetu.
- [x] Czy manifest w 5 linijkach da się zacytować bez słów „premium", „luxury", „wysoka jakość"? — Tak. Słowa rdzenne manifesta: cicha, papierowa, rytualna, intymna, trzyma się jak grzebień.

## 8. Signature element

**Oversized liczby specyfikacji w Fraunces italic (280-360px desktop) z podpisem w Caveat handwritten, jak z osobistego dziennika groomera.**

Trzy liczby traktowane jak edytorialny headline — każda zajmuje pełną sekcję jak magazine page, nie karta bento:
- **99%** → podpis Caveat „sierści zebranej u źródła, nie w rolce przed wyjściem"
- **65 dB** → podpis Caveat „cisza ekspresu do kawy, nie odkurzacza"
- **HEPA 3** → podpis Caveat „trzy filtry: kurz, alergen, drobina sierści"

Numerowane jako `Nº 01 → Nº 03 · TRZY CICHE FAKTY` w DM Sans 10px uppercase letter-spacing 0.2em nad każdą liczbą (Aesop reference). Ten signature wraca potem w karcie produktu (liczby w sidebarze) i w FAQ (`Nº 01 pytanie / Nº 02 pytanie`).

## 9. Warianty sekcji (autonomicznie wybrane)

- **Hero:** H4 Editorial numerał — produkt premium z trzema mocnymi liczbami spec (99% sierści / 65 dB / HEPA 3), 99% jako monumentalna liczba tła w Fraunces italic trafia w signature element (drzewo: „Premium AGD >1500 zł z mocną liczbą spec" pierwsza reguła pasująca, H4 wygrywa).
- **Features:** F2 Bento asymetryczny — paper+ink+amber premium editorial (Ghia/Aesop refs), hero tile ciemna (Charcoal Pine) z 99% liczbą + 5 mniejszych kart opisujących cechy (cisza, HEPA, ergonomia, akumulator, bezpieczne zęby, szczotka cicha) (drzewo: „Premium editorial (paromia, luxury lifestyle)" pasuje).
- **Testimonials:** T1 Voices quote grid — 3 głosy od właścicieli różnych długowłosych ras (Golden, owczarek lękowy, border collie) plus jeden cytat od groomera; default dla produktu bez 1 killer voice ani mierzalnych before/after transformacji (drzewo: default reguła, T1).
