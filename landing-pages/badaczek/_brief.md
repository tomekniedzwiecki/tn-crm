# Design Brief — Badaczek

<!-- Produkt: kieszonkowy mikroskop cyfrowy dla dzieci (model 372). Sklep jednoproduktowy. -->
<!-- Źródła: workflow_branding (brand_info, 6 kolorów, 3 fonty), Raport Strategiczny (8 str.), wygląd produktu (AliExpress ref). -->

## 1. Kierunek manifesta (z 01-direction.md)

- [ ] Panoramic Calm — architectural, tech premium (vitrix)
- [ ] Editorial/Luxury — premium AGD, lifestyle, hygge (paromia)
- [x] Organic/Natural — wellness, health, spa (h2vital) → **adaptacja: „Polowy Dziennik" (warm naturalist)**
- [ ] Playful/Toy — pet, kids, gadgets (pupilnik)
- [ ] Retro-Futuristic — gaming, tech edgy (vibestrike)
- [ ] Rugged Heritage — workwear, outdoor, tools & trades (kafina)
- [ ] Nowy (opisz poniżej):

**Uzasadnienie wyboru** (1-2 zdania z auditu produktu): Persona główna (świadoma matka 28-45, estetyka Montessori/Reggio/Waldorf) wprost **odrzuca krzykliwy, tani plastik na rzecz barw ziemi, drewna i stonowanych pasteli** — a USP produktu to „spokojna technologia" (bez aplikacji, bez sieci, bez krzyku). Czysty Playful/Toy (bright/loud) konfliktowałby i z personą, i z paletą brandu (szałwia/terakota/bursztyn), dlatego biorę Organic/Natural i ocieplam go do naturalistycznego „polowego dziennika małego odkrywcy" (zaokrąglone karty, ręczne notatki Caveat, motyw soczewki powiększającej).

## 2. Moodboard — 3 realne marki referencyjne (SPOZA landing-pages/)

> Marki z prawdziwego świata, NIE inne landingi z `landing-pages/`.

1. **Kinfolk magazine** — spokojny, naturalistyczny layout: dużo światła, beżowo-szałwiowa paleta, fotografia rodzinna „bez stock-uśmiechów", typografia oddychająca. Stąd: tempo i whitespace.
2. **Tinybop / Montessori-toy packaging (np. Lovevery)** — edukacyjne marki dla dzieci, które wyglądają jak przedmiot do salonu rodzica, nie zabawka z hipermarketu: ziemiste kolory, zaokrąglenia, ilustracja zamiast krzyku. Stąd: ton „premium ale ciepły, dla świadomego rodzica".
3. **Field Notes / National Geographic Kids field guide** — estetyka dziennika przyrodnika: ręczne adnotacje, etykiety okazów, „N/10" obserwacji, papier. Stąd: signature „Dziennik Badacza" (ręczne notatki Caveat) i motyw soczewki.

## 3. Paleta (z workflow_branding type=color)

- **Primary (akcent — Szałwiowa Zieleń):** #7C9C74
- **Ink (główny tekst — Ciemna Kora):** #2E3528
- **Paper (tło — Naturalna Biel):** #F7F4EC
- **Accent / Gold (Miodowy Bursztyn — echo żółtego produktu):** #E8A94B
- **Secondary (Terakota — CTA/akcent ciepły):** #C97B5D
- **Muted (Kamień Polny — meta/podpisy):** #8B8678

## 4. Typografia (z workflow_branding type=font)

- **Display (nagłówki):** `Nunito` 800/900 (rounded heavy)
- **Body (treść):** `Nunito` 400/600/700
- **Accent / Caption (ręczne notatki, „Dziennik Badacza"):** `Caveat` 600/700

> ⚠️ **Branding wybrał `Fredoka` na display — świadomie podmieniam na `Nunito` 800/900** (safety #10, udokumentowany incydent KidSnap 2026-04-20: Fredoka latin-ext niespójnie pobierana w Chromium → polskie ą/ę/ł renderują się fallbackiem). Nunito Black = ten sam zaokrąglony, przyjazny, „dziecięcy" charakter + bulletproof polskie znaki. Caveat (wybrany przez brand) zostaje na akcent. Body Nunito zgodne z brandingiem. Efekt: 2 rodziny fontów (Nunito + Caveat) — szybszy LCP.
> Google Fonts BEZ `&subset=latin-ext` (safety #10). Max 3 rodziny.

## 5. Persona główna (z report_pdf)

- **Wiek / zawód / status:** Świadoma, ambitna matka 28-45 lat (KUPUJĄCY); dziecko-użytkownik 3-11 lat. Persona poboczna: dziadkowie/chrzestni 45-65+ kupujący prezent premium (urodziny, Dzień Dziecka, Komunia, święta).
- **Kluczowy pain point** (co najbardziej frustruje): paraliżujące poczucie winy, że dziecko spędza popołudnia biernie przewijając filmiki na telefonie — i frustracja zabawkami, które tracą atrakcyjność po kilku minutach.
- **Kluczowa motywacja zakupu** (czego oczekuje od produktu): edukacyjna, rozwijająca rozrywka, która NIE wymaga odrzucenia technologii — „ekran, który nie izoluje, lecz otwiera oczy na świat"; wspólny moment z dzieckiem.
- **Cytat brzmiący jak wypowiedź persony** (do testimonials): „Bałam się, że to kolejny ekran, który połknie mu uwagę. A on od tygodnia ogląda przez Badaczka liście, sól, własny włos — i ciągnie mnie, żebym patrzyła z nim."

## 6. Anty-referencje (co JUŻ JEST w `landing-pages/`, czego NIE powtarzaj)

- **Już istnieje:** h2vital (Organic/Natural — jonizator wody, wellness dla dorosłych).
- **Czego unikam (signature elements istniejącego):** NIE kopiuję rounded-sans + greens/beiges + blob-shapes z h2vital w wersji „wellness dla dorosłych". Moja marka jest dla dziecka-odkrywcy: własny signature = motyw okrągłej soczewki powiększającej (lens-reveal) + ręczne notatki przyrodnicze Caveat („Dziennik Badacza"), których h2vital nie ma. Inna fotografia (dziecko + natura, nie szklanka wody), inny ton (odkrywczy, nie spa). Produkt jest fizycznie ŻÓŁTY — paleta ziemi/bursztynu oprawia go, nie maskuje.

## 7. Test anty-generic (4 pytania — wszystkie TAK)

- [x] Czy 3 wybrane marki referencyjne są SPOZA e-commerce? (Kinfolk, Lovevery/Tinybop packaging, Field Notes/NatGeo Kids — magazyn, edukacja, dziennik terenowy)
- [x] Czy odwracając logo nadal zgaduję branżę? (soczewka + ręczne notatki + motyw okazów = odkrywanie/nauka dla dzieci, czytelne bez nazwy)
- [x] Czy persona NIE pasowałaby do innego baseline'u? (świadoma matka-naturalistka ≠ persona wellness-dorosły h2vital ani gadżeciarz pupilnik)
- [x] Czy manifest da się zacytować bez słów „premium/luxury/wysoka jakość"? (TAK — „ekran, który oddaje dziecku świat, zamiast go zabierać")

## 8. Signature element

**Twój signature element:** **„Okno powiększenia" (lens-reveal)** — okrągła soczewka-viewport, w której świat zwykły (matowy liść/scena) zmienia się w świat powiększony (żywy mikrokosmos) z etykietą „1000×". Powtarza się w hero i przy dowodach. Drugi powtarzalny motyw: **ręczne notatki „Dziennik Badacza"** w foncie Caveat — podpisy/strzałki jak na marginesie dziennika przyrodnika małego badacza. Razem: landing wygląda jak ciepły terenowy dziennik odkryć, nie jak karta produktu z marketplace.

## 9. Warianty sekcji (z section-variants.md, LIMITED przez allowed_variants w Style Lock)

- **Hero:** H6 Persona portrait — persona matka+dziecko z mikroskopem + cytat; pasuje do identity-seeking i emocjonalnego zakupu rodzinnego (organic-natural allowed: H6/H1/H2).
- **Features:** F1 Bento 2×2 — 4 zaokrąglone karty „spokojnej technologii" (bez aplikacji / 1000× / wspólny ekran IPS / mobilność USB-C); czyste i skanowalne, mało tekstu (persona nie znosi ściany tekstu). (allowed: F1/F3)
- **Testimonials:** T1 Voices quote grid — 3 głosy: mama, babcia/dziadek (prezent), ciocia/nauczycielka; pokrywa obie persony zakupowe. (allowed: T1/T5)

## 10. STYLE LOCK — wybrany styl z Atlas (OBOWIĄZKOWE od v4.0)

### 10.1 Wybrany styl
- **Style ID:** `organic-natural`
- **Plik:** `docs/landing/style-atlas/organic-natural.md`

lock-font-display: Nunito
lock-font-body: Nunito
lock-font-accent: Caveat
lock-hex: #F7F4EC
lock-hex: #7C9C74
lock-hex: #2E3528
lock-hex: #C97B5D
lock-hex: #E8A94B

### 10.2 Product DNA (z Kroku 9a.1)
- Utility↔Ritual: ritual (doświadczenie odkrywania, nie tylko „powiększa" — kotwice: matcha ceremony, La Mer)
- Precision↔Expression: expression (matka kupuje charakter/cud odkrycia, nie spec — kotwice: Kinfolk, Graza)
- Evidence↔Feeling: feeling (zakup emocją: ulga od ekranów, wspólny moment — kotwice: La Mer, Sezane)
- Solo↔Community: dual (dziecko + rodzic patrzą razem na ekran IPS — kotwica: owner+pet pupilnik)
- Quiet↔Loud: quiet (USP „spokojna technologia", paleta ziemi, anty-loud — kotwice: Muji, Aesop)
- Tradition↔Future: present (nowoczesne urządzenie w naturalistycznej ramie — kotwica: present-day gadget)
- Intimate↔Public: social (wspólne odkrywanie + prezent statusowy od dziadków — kotwice: Yeti pokazywany, gift)

Match z organic-natural: 4/7 (ritual·feeling·quiet·intimate↔social blend). Argumentacja (1 zdanie): czysty pick algorytmiczny faworyzował Playful Toy 6/7, ale jego „Bright primary palette" (MUST) i „loud" wprost łamią paletę brandu (ziemia) i personę (odrzuca krzyk) — branding > Atlas, więc biorę organic-natural (rounded sans + ciepła ziemia + Caveat + quiet), zgodny z fontami i kolorami klienta.

### 10.3 MUSZĄ być użyte (auto-paste z pliku stylu)
- Font display: `Nunito` 800/900 w font-family (zamiennik Fredoki, safety #10)
- Font body: `Nunito` 400/600/700; accent `Caveat`
- Paleta (min 3 z 6): #F7F4EC paper, #7C9C74 sage, #2E3528 ink, #C97B5D terakota, #E8A94B bursztyn
- Rounded corners 16-24px (signature primitive organic-natural)
- Layout DNA: editorial column + soft curved/organic shapes w tłach
- Caveat handwritten script accents (signature „Dziennik Badacza")
- Section architecture min: 14 sekcji

### 10.4 NIE WOLNO użyć (auto-paste)
- **Fonty:** NIE Fredoka/Fredoka One (PL bug, safety #10), NIE Inter/Roboto/Arial jako display, NIE Italiana
- **Layout:** NIE hard Swiss grid, NIE bento 2×2 z ostrymi rogami, NIE dashboard/charts
- **Elementy:** NIE krzykliwy plastik / neon, NIE checkmarki ✓/✗ w porównaniu, NIE stock-uśmiechy
- **Kolory:** NIE neon, NIE czysty #000/#FFF jako tło treści, NIE fiolet AI-slop (#6366f1/#8b5cf6)
- **Motion:** organic-natural „subtle" — NIE glitch, NIE confetti, NIE auto-play video w hero, NIE agresywny tilt/parallax

### 10.5 Section Architecture (z pliku stylu sekcja 8)
Required (min 14): Header, Mobile Menu, Hero, Trust Bar, Problem, Solution(Bento), How It Works, Comparison, Testimonials, FAQ, Offer, Final CTA, Footer, Sticky CTA.
Forbidden: neon/saturated, dashboards, hard square bento.

### 10.6 Motion Budget (z pliku stylu sekcja 10)
```yaml
js_effects_required: [.fade-in]
js_effects_forbidden: []   # organic-natural: subtle, brak twardych zakazów (counter/tilt opcjonalne, raczej unikać)
js_effects_count: { }
```

## 11. Wow Moments (audyt z ETAP 4)

### Wow Moment 1
- **Strefa:** hero zone
- **Lokalizacja:** sekcja Hero
- **Element:** „Okno powiększenia" — okrągła soczewka nad fotografią hero; brzeg = scena zwykła, wnętrze = mikrokosmos powiększony z etykietą „1000×", subtelny pierścień LED i krzyżyk celownika.
- **Czemu unique:** dosłownie demonstruje, co robi produkt (mikroskop) — żaden landing wellness/organic tego nie ma; to nie „ładne zdjęcie", to mechanizm produktu jako element wizualny.
- pattern-id: custom-lens-reveal
- selector: .lens-reveal
- **Implementation status:** ✅ obecny w HTML

### Wow Moment 2
- **Strefa:** mid zone
- **Lokalizacja:** sekcja How It Works / Solution
- **Element:** ręczne notatki „Dziennik Badacza" — podpisy i strzałki w foncie Caveat na marginesie kroków (np. „liść paproci → dżungla", „kryształ soli"), jak w dzienniku przyrodnika.
- **Czemu unique:** marginalia odręczne wyprowadzone z realnego akcesorium produktu („Dziennik Badacza") — brand-specific, nieprzenoszalne na inną markę bez zmiany.
- pattern-id: custom-field-note
- selector: .field-note
- **Implementation status:** ✅ obecny w HTML

### Wow Moment 3
- **Strefa:** conversion zone
- **Lokalizacja:** przed sekcją Offer
- **Element:** odręczna notka właściciela sklepu (Tomasz Orzechowski) z podpisem Caveat + miejsce na portret — dlaczego wybrał Badaczka do swojego sklepu (spokojna technologia, ekran który nie izoluje).
- **Czemu unique:** prawdziwa polska twarz właściciela = differentiator zaufania vs anonimowe Temu; przy decyzji zakupowej, nie generyczny badge „100% gwarancji".
- pattern-id: founder-note
- selector: .founder-note
- **Implementation status:** ✅ obecny w HTML

## 12. Mapa obiekcji (v5.0, OBOWIĄZKOWA)

- „To kolejny ekran, zaszkodzi oczom / przebodźcuje" → sekcja: Problem + Solution → rozbrojenie: to ekran IPS bez aplikacji, sieci i powiadomień — kieruje wzrok dziecka na liść i kroplę wody, nie na algorytm.
- „Dziecko pobawi się 5 minut i odłoży, jak każdą zabawkę" → sekcja: Solution (bento) → rozbrojenie: każda próbka to nowy widok — sól, włos, skrzydło muchy — więc nuda się nie domyka, a rodzic ogląda razem.
- „Za skomplikowane dla przedszkolaka" → sekcja: How It Works → rozbrojenie: trzy kroki — włącz, przyłóż, patrz na ekranie; gotowy od razu po wyjęciu z pudełka, bez instalacji.
- „Tani chiński bubel, oszustwo z internetu" (dziadkowie) → sekcja: Comparison + Trust/Offer → rozbrojenie: marka z polską obsługą, 2 lata gwarancji i 30 dni na zwrot — nie anonimowa oferta z marketplace.
- „Czy warto tyle, skoro na Allegro są tańsze" (cena vs marketplace) → sekcja: Comparison + Offer → rozbrojenie: tańsze to zdjęcia z fabryki bez wsparcia; tu pełen zestaw odkrywcy, ekran IPS bez mrużenia oka i opieka po zakupie.

## 13. Big Idea + VOC + Liczby kanoniczne (v5.0, OBOWIĄZKOWE)

### 13.1 Big Idea (Krok 1.7)
big-idea: Badaczek to ekran, który oddaje dziecku świat zamiast go zabierać — zamienia każdy spacer w wyprawę badawczą bez aplikacji i bez powiadomień.
mechanism: „spokojna technologia" — kieszonkowy mikroskop z 2-calowym ekranem IPS i powiększeniem 1000×, bez aplikacji, bez internetu, bez dźwięków; pokazuje mikroświat na ekranie, na który patrzy się we dwoje.
awareness: solution-aware — kategoria „mikroskop cyfrowy dla dzieci" jest znana (KidLupe, Allegro), klient porównuje marki; różnicujemy zaufaniem, USP „spokojnej technologii" i premium, z krótkim wejściem problem-aware (wina za ekrany).

### 13.2 Język klienta — VOC (Krok 1.6)
VOC: BRAK DANYCH — workflow_reviews=0; source_url AliExpress nie sczytany (CDN .avif, twardy filtr na frazy o dostawie/sprzedawcy). Poniżej język PERSONY z Raportu Strategicznego (research, nie opinie marketplace):
- pain: „znów spędziło popołudnie, bezmyślnie przewijając filmiki na telefonie"
- benefit: „ekran, który nie izoluje, lecz otwiera oczy na cuda natury"
- benefit: „intryguje w równej mierze siedmiolatka, co jego rodzica" (wspólna obserwacja)

### 13.3 Liczby kanoniczne
| wartość | jednostka | źródło |
|---------|-----------|--------|
| 1000 | × (powiększenie) | Raport sek.1 (spec model 372) |
| 2 | cale (ekran IPS) | Raport sek.1 |
| 178 | ° (kąt widzenia IPS) | Raport sek.1 |
| 2 | godziny (bateria 600 mAh) | Raport sek.1 |
| 64 | GB (karta microSD max) | Raport sek.1 |
| 199 | zł (cena przed) | rekomendacja cenowa raport sek.1/5 (kotwica) |
| 149 | zł (cena teraz) | rekomendacja cenowa 149-169 zł raport sek.1 |
| 50 | zł (oszczędność) | 199 − 149 |
| 4,7 | /5 rating | pasmo 4,6-4,8 (copy.md cz.3 §0) + disclaimer stopka |
| 30 | dni (zwrot) | polityka oferty / prawo |
| 24 | miesiące (gwarancja) | rekomendacja raport sek.5 |
