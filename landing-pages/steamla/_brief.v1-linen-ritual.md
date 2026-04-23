# Design Brief — Steamla

<!-- Wypełnione 2026-04-23 przez Claude w AUTO-RUN (UUID 4e129c97-13a6-4287-97e0-d76fa2c97e44) -->

## 1. Kierunek manifesta (z 01-direction.md)

- [ ] Panoramic Calm — architectural, tech premium (vitrix)
- [ ] Editorial/Luxury — premium AGD, lifestyle, hygge (paromia)
- [ ] Organic/Natural — wellness, health, spa (h2vital)
- [ ] Playful/Toy — pet, kids, gadgets (pupilnik)
- [ ] Retro-Futuristic — gaming, tech edgy (vibestrike)
- [ ] Rugged Heritage — workwear, outdoor, tools & trades (kafina)
- [x] Nowy (opisz poniżej): **Linen Ritual** — spokój ceremonialny, woda jako sakrum, materiały naturalne (len, bawełna, ceramika), tabular spec block w stylu etykiety produktu spożywczego

**Uzasadnienie wyboru** (1-2 zdania z auditu produktu): Produkt sprzedaje brak — brak chemii, brak składu, brak ingerencji w dom alergika. Dominanta emocjonalna to ulga i czyste sumienie („wiem, co wdycha moje dziecko"), a nie czystość jako performance; to wyklucza techniczną paletę (Karcher-blue) i luksusowy gloss (paromia-gold) i wymaga papieru, mosiężnego akcentu raz na pięć sekcji oraz typografii z wagą rytuału, nie z wagą spec sheeta.

## 2. Moodboard — 3 realne marki referencyjne (SPOZA landing-pages/)

1. **Aesop** — uczciwa lista składników jako estetyka; papierowa kremowa paleta (Linen Cream #F6F3ED mirror), Fraunces-kompatybilna edytorska typografia, ton „apothecary, nie laboratorium"
2. **Muji** — generous white space (padding sekcji 140–180px), tabular spec bloki jak na metce bawełnianej koszulki, zero dekoracji, każdy element ma funkcję
3. **The Row** — absence of decoration, materiał jako komunikat (len, surowa bawełna), fotografia „produkt w codziennym świetle", nie studyjny gloss

## 3. Paleta (z workflow_branding type=color)

- **Primary (akcent):** #3DB5C9 (Steam Teal — używany TYLKO w: underline hover linków, ring wokół CTA na hover, cienka linia steam-thread SVG)
- **Ink (główny tekst):** #1F2B36 (Deep Slate)
- **Paper (tło):** #F6F3ED (Linen Cream)
- **Accent / Gold (opcjonalny):** #E09A3C (Amber Glow — mosiężny akcent, numeracja sekcji Nº, hover ceny)

Uzupełniająco: #E8B4A0 (Warm Clay — cotton highlights w card bg), #8A9BA8 (Mist Gray — body secondary)

## 4. Typografia (z workflow_branding type=font)

- **Display (nagłówki):** Fraunces + `&display=swap&subset=latin-ext`
- **Body (treść):** Inter + `&display=swap&subset=latin-ext`
- **Mono / Caption (opcjonalny):** Caveat (podpisy testimonialowe „— Joanna, mama dwójki alergików") + `&display=swap&subset=latin-ext`

> Fraunces ma pełne wsparcie polskich Ł/Ą/Ę w UPPERCASE — safety #7 spełniony. Italiana odrzucona.

## 5. Persona główna (z report_pdf + brand_info + mockupów)

- **Wiek / zawód / status:** Kobieta 32-42, matka 1-2 dzieci (najczęściej 3-8 lat), część ma alergika w domu (pyłki, roztocza, skóra atopowa); zawód „świadoma konsumentka" — HR, PR, marketing, dietetyk, terapeuta; Warszawa/Wrocław/Trójmiasto; mieszkanie w bloku lub dom pod miastem.
- **Kluczowy pain point** (co najbardziej frustruje): „Czytam skład szamponu dziecka przez lupę, a potem polewam fotelik samochodowy środkiem z hurtowni, którego nie rozumiem. Po godzinie maluch liże ten fotelik." Brak zaufania do środków czystości, wybór między brudem a chemią.
- **Kluczowa motywacja zakupu** (czego oczekuje od produktu): Jedna rzecz, która działa na wszystko (fotelik → materac → dywan → kuchnia), używa tylko zwykłej wody i nie wymaga filozofowania. Para = starsza niż każdy detergent, rozumiała ją babcia.
- **Cytat brzmiący jak wypowiedź persony** (do testimonials): „Mój syn ma atopowe zapalenie skóry i kontaktowe reakcje. Przez trzy lata wyklepywałam każdy materac na balkon. Steamla wraca do mnie codziennie — z jednym składem, H₂O, i to wszystko, czego potrzebuje jego skóra."

## 6. Anty-referencje (co JUŻ JEST w `landing-pages/`, czego NIE powtarzaj)

- **Już istnieje: paromia** — Editorial/Luxury. Fraunces też jest u nas, ale paromia łączy Fraunces z Italiana + paper/ink/gold (luksusowy gloss). **Czego unikam:** Italiana (nie obsługuje „Ł"), złoty akcent na chłodnej paper-white palecie, tonalność „magazine luxury editorial". Steamla jest cieplejsza (linen kremowy, nie chłodny paper), mosiężny E09A3C zastępuje gold, drugi font to pragmatyczny Inter zamiast Italiana.
- **Już istnieje: vitrix** — Panoramic Calm (tech premium, architektura). **Czego unikam:** Plus Jakarta Sans + Instrument Serif, paper/navy/teal architectural, tech mockup split hero. Steamla nie jest tech — jest rytualna.
- **Już istnieje: h2vital** — Organic/Natural (wellness). **Czego unikam:** rounded sans + greens/beiges z apteki ziołowej. Steamla ma ciepłe linen + mosiądz, nie zieleń; mówi „para starsza niż chemia", nie „natura leczy".
- **Moje signature elements są własne:** monumentalny spec block „H₂O / 100%" w stylu etykiety produktu + steam-thread SVG (cienka pionowa linia pary) między sekcjami. Tego nie ma w paromii / vitrixie / h2vitalu.

## 7. Test anty-generic (4 pytania — wszystkie TAK)

- [x] Czy 3 wybrane marki referencyjne są SPOZA e-commerce? (Aesop = apteka/cosmetics, Muji = dom/odzież, The Row = fashion)
- [x] Czy odwracając logo nadal zgaduję branżę (moodboard jest charakterystyczny)? (papier + mosiądz + steam-thread + Fraunces heading = apothecary/clean-living, nie generic AGD)
- [x] Czy persona NIE pasowałaby do innego baseline'u z tabeli? (eko-mama 32-42 z alergikiem nie pasuje ani do luxury paromii, ani do tech vitrixa, ani do playful pupilnika)
- [x] Czy manifest w 5 linijkach da się zacytować bez słów „premium", „luxury", „wysoka jakość"? (manifest używa: „woda jako sakrum", „ceremonialny rytuał", „materiały naturalne", „spec block jak etykieta")

## 8. Signature element

**„H₂O / 100%" spec block** — monumentalny prostokątny blok w stylu etykiety produktu (myśl: etykieta butelki oliwy oliwkowej lub miodu), z tabular-numbers: „SKŁAD: H₂O 100%" nad „ZAWARTOŚĆ ZBIORNIKA: 350 ml" nad „TEMP. PARY: 105°C" nad „CZAS GOTOWOŚCI: 15 s". Font Fraunces w headerze bloku (wersaliki, tracking +0.08em), body Inter mono-numbers. Kolorystyka: linen cream bg, deep slate text, cienka mosiężna ramka 1px Amber Glow. Umieszczony w hero obok headline i w osobnej sekcji „Skład, który zmieści się na dłoni".

Dodatkowo: **steam-thread SVG** — cienka, lekko falująca pionowa linia (1.5px stroke Mist Gray z opacity 0.4) przepływająca między sekcjami w lewym marginesie, dająca ruch bez animacji na całe tło. Przerywa się w 3 miejscach, kropelkowa końcówka.

## 9. Warianty sekcji (autonomicznie wybrane wg drzewa decyzyjnego section-variants.md §4)

- **Hero:** H8 Split z ceną widoczną — parownica ~599 zł (price point <800 zł, comparison shopper-persona — eko-mama zestawia ze sobą Philipsa, Karchera i Zelmera). Pierwsza pasująca reguła: „Value/budget product (<800 zł), comparison shopper" → H8.
- **Features:** F1 Bento 2×2 — standardowy produkt, 4 feature'y (bez chemii / 15s do pary / 1500W 3 bar / bezpieczne dla dziecka). Default wygrywa: brak smart-home/editorial/complex-narrative.
- **Testimonials:** T2 Before/After ze statsami — transformacja mierzalna (15 min na fotelik vs 2 h wywietrzania, 99,9% roztoczy, 0 ml chemii). Pierwsza pasująca: „Transformation product z mierzalnymi liczbami" → T2.
