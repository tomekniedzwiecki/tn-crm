# PLAN LANDINGU — ZAKLIPEK (przyklipsowy hub USB do biurka) · F1 · 2026-07-23

> Mini-marka **„Zaklipek"** (prowizoryczna — rezerwacja w F2.5). Cena **34,90 zł DANA** (ODCZYT
> `wf2_products.price`; fabryka landingów NIE zmienia ceny). Źródło faktów = `KARTA-PRAWDY.md`
> (Z7) — każdy claim niesie kotwicę w Karcie, inaczej CUT. Persona = `ICP-GRUPA-DOCELOWA.md`.
> Wygląd produktu = `PASZPORT.md`. White-label: marka „Eswirepro"/„ORICO", sprzedawca „Better
> House Life Store" **NIGDY na stronie**; incydentalne nadruki na kadrach (g2 ekran, g4 okno,
> g5 dysk) = RETUSZ/CROP.

---

## MOTYW PRZEWODNI + KĄT SPRZEDAŻOWY

**Motyw przewodni (metafora korzyści):** **„KRAWĘDŹ, KTÓRA TRZYMA WSZYSTKO POD RĘKĄ".** Produkt
żyje NA KRAWĘDZI biurka/półki/monitora — więc krawędź staje się osią wizualną całego landingu:
pozioma **linia-krawędź** biegnie przez sekcje, a hub jest na niej „zaciśnięty". To NIE „clean
e-commerce" — to jeden fizyczny gest (klips na krawędzi) rozpisany na całą stronę.

**Kąt sprzedażowy (hero = echo hooka, Z1):** *„Porty USB zawsze pod ręką — na krawędzi biurka.
Koniec sięgania za komputer i plątaniny kabli."* Rdzeń USP z KARTY §3: **klips na krawędź
(zakres 5–28 mm) → 4 porty USB 3.0 na wyciągnięcie ręki.**

**HOOKS `?h=N` (message-match do kreacji, podmiana h1+sub):**
- **h1 (PRIMARY):** „Porty USB **zawsze pod ręką** — na krawędzi biurka" (koniec sięgania za jednostkę).
- **h2:** „Koniec **plątaniny kabli** i macania po omacku za obudową" (porządek na biurku).
- **h3:** „Wepnij pendrive, dysk i mysz — **bez wstawania** od biurka" (szybki dostęp + transfer 5 Gbps).

**Zakotwiczenie ceny/ryzyka NAD foldem (redukcja lęku #1 = scam, rynek PL):** płatność **przy
odbiorze** · **zwrot 14 dni** · **wysyłka z Polski**. ⛔ ★/liczby opinii w topbar+hero (trust nad
foldem = redukcja ryzyka, NIE social proof — ★4,6/26 dopiero POD foldem w `opinie`).

**Produkt 1-FUNKCYJNY (zasilany hub USB na klips).** Nie ma ≥2 różnych funkcji → doktryna
szerokości zastosowań (F0.6b) NIE obowiązuje; MAPA-ZASTOSOWAN nie jest wymagana (SPEKTRUM <4 nie
FAIL-uje przy 1 funkcji). RÓŻNE KONTEKSTY biurka (home-office / gaming / kreatywne) = różnorodność
SCENOGRAFII (świat/światło), a nie pokrycie różnych zadań — to jedno zastosowanie w kilku światach.

---

## UCZCIWOŚĆ = KONWERSJA (Z5) — realne minusy z 11 opinii idą do porównania/FAQ, nie chowamy

- **dołączony kabel danych słaby** (op. [8] „the included data transmission cable went to the
  trash") → porównanie/FAQ: „użyj własnego dobrego kabla — dołączony bywa słaby".
- **zakres zacisku 5–28 mm nie do każdego blatu** (op. [10] „the distance for mounting does not
  match") → sekcja `zacisk` + FAQ: podać zakres WPROST, żeby klient sprawdził swój blat.
- **przy energochłonnych urządzeniach bez zasilania porty się „przełączają"** (op. [11] mysz +
  dysk = 1 port naraz) → argument ZA portem DC 5V (korzyść) + FAQ uczciwie.
- **sold_volume = 34** << 1000 → **POMIJAMY na stronie** (§sold: żadnej frazy „tysiące zamówień";
  34 to sprzedaż globalna Ali, nie nasz sklep = „X sprzedanych u nas" byłoby FAŁSZEM).

---

## CONSTRAINTS (twarde ograniczenia F0 — nieprzekraczalne; źródło: KARTA-PRAWDY §0–§5, PASZPORT)

1. **Sprzedajemy WYŁĄCZNIE wariant bazowy: 4 porty USB 3.0 (5 Gbps)**, srebrny aluminium + ABS,
   zacisk regulowany **5–28 mm** z silikonową podkładką antypoślizgową, dodatkowy **port zasilania
   DC 5V**, kompatybilność MacOS/Windows. **Brak danych o wymiarach/wadze → ⛔ zero zmyślonych cm/kg.**
2. **⛔ ZAKAZ claimów innych wariantów:** „10 Gbps" / „USB 3.2 Gen2", „7-in-1", „czytnik kart
   SD/TF", „HDMI" / „4K 60Hz", „12TB". Galeria i część opinii reklamują INNY (droższy) wariant —
   NIE cytować tych cech. Bazowy = zwykły 4-portowy hub USB 3.0, 5 Gbps.
3. **Układ portów bazowego NIEROZSTRZYGNIĘTY** (4× USB-A vs 3× USB-A + 1× USB-C) → copy „4 porty
   USB 3.0" **bez przesądzania rozkładu A/C**; potwierdzenie przy packshocie F3.
4. **Złącze zasilania WĄTPLIWE** (opis „Micro USB" vs obraz „USB-C") → „port zasilania DC 5V"
   **bez przesądzania złącza**.
5. **BRAK wideo produktu** (video_url=null; TikTok = czarny ORICO, off-product) → sekcja `wideo`
   NIE powstaje jako build → **blokada-tomek** (klasa dowodowa, WIDEO.md).
6. **BRAK czystego packshotu** → packshot bazowy (srebrny, 4-port) **generujemy w F3**; kadry
   galerii (g1/g2/g3/g5 po CROP/retuszu) = referencja bryły/stylu, nie gotowy asset.
7. **review na stronę: ★4,6/5 · 26 ocen** (snapshot; brief podawał 27 — bierzemy snapshot).
   **Cena 34,90 zł — NIE zmieniać.** Kanon koloru = **SREBRNY aluminiowy** (⛔ czarny = inny wariant).
8. **White-label 🚫 NIGDY na stronie:** marka „Eswirepro"/„ORICO", sprzedawca „Better House Life
   Store"; incydentalne nadruki (g2 ekran monitora, g4 okno Windows, g5 etykieta dysku) = RETUSZ/CROP.

---

## WZORCE (reuse preflight — EXEMPLARY-INDEX; ⛔ rzemiosło, NIGDY wizja/copy)

Dobór 4 wg **trafności + różnorodności** (KAPITALIZACJA-OPS §1). ⛔ Reuse = moduły / rytm sekcji /
mechanika CTA / gęstość dowodu; ⛔ NIGDY paleta / font / archetyp / świat / copy (te = partytura
pod Zaklipka). Anty-mode-collapse: celowo mieszam światy wzorców.

| wzorzec | poziom | co REUŻYWAM (rzemiosło) | dlaczego trafny |
|---|---|---|---|
| **ugniatek** | ◽ (1. przebieg wf2, 0 FAIL) | **checkout-inline@2 steps** (`data-zc-product`+`data-zc-api`, skórka tokenami dla `#zamow`), **hero-video HERO-STAGE**, TOR-I demo ze stanami (przełącznik jako wzorzec stanów), sticky-buy@1, footer@1 | technicznie najbliższy: inline checkout + hero animowalny + demo ze stanami; sprzęt z jednym akcentem |
| **masazer** | ✅ WZORZEC | **dedykowana sekcja mid-cta**, **demo TOR-I (crossfade stany)**, karta oferty na polu tła (archetyp B), sekcja porównania (2 assety: nasz vs stary sposób), lightbox | wzorcowa mechanika mid-CTA i demo + archetyp B split — rdzeń mojego szkieletu |
| **latarek** | ◽ | **interakcja TOR-I flagowa** (mechanika stanów demo), `lightbox@1`, footer=`section#footer` | najbliższy „mały przedmiot, jeden akcent, TOR-I jako oś"; wzorzec suwaka/stanów pod moją interakcję `zacisk` 5–28 mm |
| **mata** | ✅ WZORZEC (dywersyfikator) | **hero-video-inject** (scena full-bleed jako źródło i2v), `lightbox@1`, gęstość sekcji | celowo RÓŻNY świat (fiolet/Fraunces/„kanapka") — trzyma few-shot od kolapsu; ja idę B + chłodna biel + Bricolage |

⛔ **odpalak/loczek = ANTY-WZORCE** — jeśli sięgam po ich sekcje, WYŁĄCZNIE moduły kanoniczne
(`wideo-rail@1`, `lightbox@1`, `sticky-buy@1`, `faq-accordion@1`), NIGDY plik strony.

---

## CROSS-LANDING (preflight anty-klon)

`gate-check.py zaklipek --cross-only` **nie mógł policzyć maszynowo** (brak jeszcze `index.html`
i bloku `:root` w TOKENS-MAKIETY — F2.5). Partytura wypisana RĘCZNIE tak, by różniła się od **3
poprzednich** landingów w cross-globie gate'a (`sklepy/tomek-niedzwiecki/*/index.html`, mtime).

**3 poprzednicy (od najnowszego):** **home-ulepszek** (`--cta #2D5BFF` niebieski · display
Gabarito) · **home-zaradek** (`--cta #1F2A44` granat · Quicksand/Mulish) · **ssawek**
(`--cta #C2381B` terakota · Barlow Semi Condensed · archetyp C). *(Kontrolnie odbite też od
najświeższych produktów fabryki: ssawek C · rozgrzewek D · koszyk H · ugniatek F.)*

**Różnica na 5/5 osiach (wymagane min. 3/5):**
| oś | Zaklipek | poprzednicy | różni się? |
|---|---|---|---|
| font display | **Bricolage Grotesque** | Gabarito · Quicksand · Barlow Semi Cond. | ✓ (gate font: FAIL-safe) |
| kolor akcentu | **#0A6EBD** (SuperSpeed blue) | #2D5BFF · #1F2A44 · #C2381B | ✓ ΔE ≥ **41** (CIE76; próg 15) |
| archetyp hero | **B** (split 55/45) | C (ssawek) · D · H · F | ✓ (≠ każdy z ostatnich) |
| rodzina tła | **chłodna biel / platyna** | piasek/greige (ssawek) i in. | ✓ |
| świat / materiał | **czysty desk-setup / aluminium** | warsztat/garaż (ssawek) i in. | ✓ |

ΔE (CIE76) akcentu #0A6EBD: **53,7** vs #2D5BFF · **41,7** vs #1F2A44 · **107,8** vs #C2381B →
minimum 41,7 ≫ próg 15. **Wynik cross-landing: 5/5 osi RÓŻNI SIĘ** od 3 poprzednich (i od 4
najświeższych produktów). Sekwencja sekcji (WARN-only) prowadzona ciężarem dowodowym produktu.

---

## PARTYTURA (8 pozycji — KAŻDA z uzasadnieniem; pełny blok tokenów: `TOKENS-MAKIETY.md` w F2.5)

Każda pozycja „ten produkt/persona prowadzi do…", nigdy „jak poprzednio".

1. **font display = Bricolage Grotesque (700/800)** ⟵ aluminiowa listwa o **kanciastym, maszynowo
   ciętym profilu** → charakterny grotesk display z „inżynierskim" pazurem; ≠ Gabarito · ≠
   Quicksand · ≠ Barlow Semi Condensed (3 poprzednie). **Gate font ✓.**
2. **font text = Figtree (400/500/700)** ⟵ humanist o czystych, wąskich cyfrach do gęstych specs
   (4 porty · 5 Gbps · 5–28 mm · 34,90 zł) + ciepły KONTRAST do charakternego display; ⛔ nie
   zimny Inter/Helvetica (KANON).
3. **kolor akcentu `--cta` = #0A6EBD** (SuperSpeed azure) ⟵ **WYPROWADZONY z realnego koloru
   produktu = niebieskie wnętrza gniazd USB 3.0** (kanon USB 3.0 „SuperSpeed blue", PASZPORT:
   „niebieskie wnętrza USB"). Srebro/aluminium jest achromatyczne → biorę **jedyny chromatyczny
   sygnał produktu**, który dodatkowo komunikuje „to prawdziwe USB 3.0". `--cta-ink #FFFFFF`
   (WCAG **5,28:1**). ΔE ≥ 41 vs 3 poprzednie. **Gate akcent ✓.**
4. **rodzina tła = chłodna biel / platyna** `--paper #F7F8FA / #EEF0F4 / #E1E5EC` ⟵ świat
   **czystego, nowoczesnego desk-setupu + szczotkowane aluminium** (TOKENS mapping „tech/clean →
   chłodna biel"); ≠ ciepły piasek ssawka. `--ink #1C2530` (chłodny grafit = echo grafitowego
   panelu portów), `--body #38424E`, `--line #D5DAE2`. Warunek KANONU: wysoka jasność + niskie
   nasycenie + WCAG dla body ✓. **Nota głębi:** świat chłodny → cień miękki, warstwowy, tint
   **łupkowy** `rgba(20,35,60,.06–.10)` (precedens świadomie chłodnej palety = chlodzacy-koc);
   intencja KANONU „nie jeden twardy czarny cień" zachowana + grain 3%.
5. **świat / materiał = czysty nowoczesny desk-setup** (home-office / gaming / kreatywne biurko),
   szczotkowane aluminium, jasny blat (drewno jasne / biel), monitory/laptopy; światło chłodne
   dzienne (okno) + ciepłe wieczorne (lampa home-office). ⟵ ICP §3 (kontekst użycia). ≠
   warsztat/garaż ssawka.
6. **archetyp hero = B (split 55/45)** ⟵ Zaklipek to produkt, który **wymaga JEDNEGO ZDANIA
   wyjaśnienia** („hub na **klips** do krawędzi biurka" — kategoria mało znana; ICP: SOLUTION-aware,
   ale nie zna wariantu na klips). B = copy tłumaczy mechanizm słowem po lewej + scena po prawej
   jako osobny, immersyjny blok **pod hero-video** (dłoń wpina USB w zaciśnięty hub, para z kubka
   = nośnik ruchu); karta oferty (34,90 zł → CTA → pay-row) na płaskim polu tła = czytelny fold.
   **≠ archetyp każdego z ostatnich: C (ssawek) · D (rozgrzewek) · H (koszyk) · F (ugniatek).**
   `archetyp-hero: B`
7. **sygnatura wydawnicza = S3 hairline „LINIA KRAWĘDZI" + znaczniki kalibracji (ticks 5–28 mm)**
   ⟵ motyw = KRAWĘDŹ biurka: ciągła **linia 1px** (krawędź) obejmująca/przecinająca sekcje,
   miejscami ze **skalą/tickami** będącą echem regulacji zacisku **5–28 mm**. Editorial/katalogowe/
   materiałowe; powtórzona świadomie w ≥3 sekcjach (hero baseline, demo step-rule, `zacisk`
   caliper, dividery). ≠ S6 znacznik-rożek ssawka.
8. **dobór i KOLEJNOŚĆ sekcji** ⟵ ciężar dowodowy: hook→trust→ból(bez produktu)→ulga→JAK działa
   (TOR-I)→korzyści z kotwicą w specs→`zacisk` (rozbraja „czy pasuje do mojego blatu")→uczciwe
   porównanie→dowód→mid-cta→oferta+kasa→FAQ→final. Pełen MANIFEST niżej.

---

## MANIFEST SEKCJI

> Format kanoniczny: `` N. `id | typ | status` — opis `` (build) / `` N. `id | typ | blokada-tomek — powód` ``.
> Rdzeń `hero · zamow · final · mid-cta` = build. **Klasa DOWODOWA** (wideo TikTok/UGC, zdjęcia od
> kupujących) — agent NIE MA prawa `SKIP`; po protokole wyczerpania materiału → `blokada-tomek`
> (decyzja „sekcji nie będzie" należy WYŁĄCZNIE do Tomka).

1. `hero | scenowa | build` — archetyp **B** (split 55/45); LEWO: hook big-type + karta mikro-oferty (34,90 zł → CTA → pay-row) + pas trust NAD foldem (COD/14 dni/z Polski). PRAWO: scena desk (dłoń wpina USB w zaciśnięty hub) jako blok **pod hero-video** (HERO-STAGE, produkt PASYWNY → ambient para/dłoń). Mobile: scena kompakt (~45svh) → hook → karta oferty NACHODZĄCA (cena+CTA nad foldem @750).
2. `zaufanie | kodowa | build` — pas COD/redukcja ryzyka: **płatność przy odbiorze · zwrot 14 dni · wysyłka z Polski · MacOS + Windows** (lęk #1 = scam). Separator anty-szew hero↔problem (papier między dwiema scenami).
3. `problem | scenowa | build` — **BÓL BEZ produktu** (EMOCJA↔PRODUKT): sięganie ręką za obudowę/pod biurko do portów, plątanina przedłużaczy USB na blacie, wypinanie jednego by wpiąć drugie. ⛔ zero naszego hubu w kadrze; seed jawnie wyklucza produkt.
4. `rozwiazanie | scenowa | build` — produkt WCHODZI jako ulga: **klips na krawędzi → 4 porty USB 3.0 zawsze pod ręką**; koniec sięgania, koniec plątaniny. (scena ANIM: firana/roślina w oknie = nośnik ruchu, produkt statyka).
5. `demo | scenowa | build` **(TOR-I)** — „jak to działa" 1-2-3: **(1) zaciśnij na krawędzi (śruba, 5–28 mm) → (2) wepnij pendrive/dysk/mysz → (3) porty pod ręką.** Demo „jak działa" = DOMYŚLNIE TOR-I; stany per krok na makietach F2 (osobny kadr/stan), nie statyczna karta.
6. `korzysci | kodowa | build` — cechy→korzyści **z KOTWICĄ w specs** (ikony charcoal): aluminium (solidne, chłodzi — op.[3]) · 4× USB 3.0 5 Gbps (pendrive+dysk+mysz+klawiatura naraz, szybki transfer) · port DC 5V (stabilne zasilanie dysku — op.[11]) · MacOS/Windows. ⛔ zero „10 Gbps/7-in-1".
7. `zacisk | scenowa | build` **(TOR-I flagowa)** — detal mechanizmu + **suwak/konfigurator 5–28 mm** (przeciągasz → zacisk otwiera/zamyka się na różnej grubości blatu) + silikonowa podkładka; **rozbraja obiekcję „czy pasuje do MOJEGO blatu/monitora?"** (op.[10]). Interakcja flagowa (F5) — sygnatura caliper/ticks kulminuje tutaj.
8. `porownanie | kodowa | build` — uczciwie: **hub na klips vs zwykły hub/przedłużacz leżący na biurku**; JEDEN realny minus (Z5): dołączony kabel danych bywa słaby — użyj własnego (op.[8]); zakres 5–28 mm nie do każdego blatu (op.[10]).
9. `mid-cta | scenowa | build` — **DEDYKOWANA sekcja CTA** z zaprojektowanym `.btn.cta` (szkielet CTA; re-CTA na desktopie); scena ciepłe wieczorne biurko, „Zamów Zaklipka — 34,90 zł, przy odbiorze".
10. `opinie | kodowa | build` — realne recenzje (**11 treści**, teksty EN/RU VERBATIM) + `review_stats` **★4,6/5 · 26 ocen POD foldem**; uczciwie, z realnymi minusami (op.[8]/[10]/[11]).
11. `galeria | kodowa | build` — kurowane realne kadry **po CROP/retuszu** (g2 in-use → g5 zacisk → g3 DC5V → g1 lifestyle) + sceny F3; `lightbox@1`. ⛔ retusz nadruków Eswirepro (g2/g5).
12. `wideo | kodowa | blokada-tomek — protokół wyczerpania: ali_snapshot.video_url=null; jedyny klip TT @luckygeek1 = INNY produkt (czarny ORICO, off-product w obie strony); videos_curated „brak realnego wideo produktu" → materiał do pozyskania; kamień TOMKA (WIDEO.md — klasa dowodowa, agent bez prawa SKIP).`
13. `ugc-zdjecia | kodowa | blokada-tomek — protokół wyczerpania: 4 zdjęcia 5★ (rev0×3 + rev1_0); rev0_2=zrzut benchmarku OUT, rev0_0/rev0_1=CZARNY wariant 10Gbps ≠ kanon srebrny, tylko rev1_0=srebrny in-use pasuje → 1/4 zgodne z kanonem; decyzja o sekcji = TOMEK (GALERIA.md — klasa dowodowa, agent bez prawa SKIP).`
14. `zamow | kodowa | build` — `#zamow` = **moduł checkout-inline** (skórka tokenami; wrapper `data-zc-product` ORAZ `data-zc-api`; kontener ≥860 px); **cena 34,90 zł**, COD, packshot bazowy (F3); zaprojektowany `.btn.cta`; kolejność cena→CTA→redukcja ryzyka.
15. `faq | kodowa | build` — `faq-accordion@1` + slot media (sticky packshot); uczciwie: „czy pasuje do mojego blatu?" (5–28 mm) · „czy szybki?" (USB 3.0 / 5 Gbps) · „aluminium czy plastik?" (aluminium) · „udźwignie dysk?" (port DC 5V) · „jaki kabel?" (użyj własnego dobrego — op.[8]) · „MacOS?" (tak). Ikony +/− charcoal.
16. `final | scenowa | build` — FINAL CTA: **życie z produktem** (ogarnięte, ciche biurko wieczorem, porty pod ręką), zaprojektowany `.btn.cta` „Zamawiam Zaklipka". (scena ANIM dolna — ambient wieczorny).

**Nie-sekcje (moduły):** `sticky-buy@1` (mobile) · `footer@1` (źródło drapek).

**Sekcje TOR-I:** `demo` (#5, „jak działa" 1-2-3) · `zacisk` (#7, konfigurator suwak 5–28 mm — interakcja flagowa).

---

## SZKIELET CTA (bramkowany — gate `cta`; ≥4 `[data-checkout]` + dedykowana mid-CTA + final)

| # | miejsce | typ CTA | etykieta | uwaga makiety |
|---|---|---|---|---|
| 1 | **hero** (#1) | karta oferty: cena → `.btn.cta` → pay-row | „Zamawiam — 34,90 zł" | ZAPROJEKTOWANY CTA w kadrze (krytyk +11) |
| 2 | **mid-cta** (#9) | DEDYKOWANA sekcja z `.btn.cta` + cena | „Zamów Zaklipka" | scena + realny button (re-CTA desktop) |
| 3 | **zamow** (#14) | checkout-inline (`data-zc-*`) + `.btn.cta` | „Kup teraz — płacę przy odbiorze" | cena→CTA→redukcja ryzyka |
| 4 | **final** (#16) | `.btn.cta` na scenie życia z produktem | „Zamawiam Zaklipka" | zaprojektowany CTA w kadrze |
| 5 | **sticky-buy@1** (mobile) | pasek dolny: cena + `.btn.cta` | „34,90 zł · Zamów" | moduł, re-CTA (IO po hero) |

Makiety `hero · #zamow · mid-cta · final` MUSZĄ nieść ZAPROJEKTOWANY `.btn.cta` (kształt/kontrast/
etykieta akcji, strefa pod cenę, kolejność cena→CTA) — inaczej REGEN makiety. Gate `cta`:
≥4 `[data-checkout]` ✓ (5), dedykowana `mid-cta` + `final` ✓, ≥1 re-CTA poza hero/sticky/zamow ✓.

---

## FUNKCJE KONWERSJI
- Message-match `?h=N` (HOOKS 1–3: pod ręką / plątanina / szybki dostęp) — podmiana h1+sub.
- `#zamow` checkout-inline Trevio (COD), sticky-buy mobile, mid-CTA dedykowana, re-CTA desktop.
- Trust nad foldem: COD + zwrot 14 dni + wysyłka z Polski + MacOS/Windows (⛔ ★/liczby opinii nad foldem).
- TOR-I: demo 1-2-3 (stany) + `zacisk` konfigurator 5–28 mm (rozbraja „czy pasuje do mojego blatu").
- Uczciwe porównanie + FAQ (realne minusy) = redukcja ryzyka > social-proof (lęk #1 = scam).
- JSON-LD Offer (34,90 zł, PLN) + AggregateRating (4,6/26) — structured data (nie nad foldem wizualnie).

---

## ANTY-MISMATCH (CLAIM → ŹRÓDŁO) — każda korzyść niesie kotwicę; brak = CUT

| CLAIM (copy) | ŹRÓDŁO / KOTWICA (KARTA-PRAWDY) |
|---|---|
| „porty USB zawsze pod ręką, na krawędzi biurka — koniec sięgania za komputer" | tytuł „Clip-type" + opis „Clip-on Design, attach to desk/monitor" + g5 „5–28 mm" (§3 RDZEŃ USP) |
| „solidne aluminium, nie tandetny plastik, chłodzi się" | tytuł „Aluminum" + opis „aluminum alloy and ABS" + opinia [3] „All aluminum, feels really well finished" (§2b/§3) |
| „4 porty USB 3.0, 5 Gbps — pendrive, dysk, mysz, klawiatura naraz; szybki transfer" | tytuł „Multi 4 Ports USB 3.0" + opis „5Gbps" + g4 „4*USB3.0 simultaneously" (§2a/§3) |
| „stabilne zasilanie dysku — dodatkowy port DC 5V" | g3/g5 „DC 5V" + opis „power interface" + op.[11] (mysz+dysk bez zasilania = 1 port) (§2b/§3) |
| „pasuje do blatu/półki/monitora — zacisk 5–28 mm, silikonowa podkładka" | g5 „Adjustable Range 5mm-28mm" + „Anti-Slip Silicone Mat" (§2b) |
| „działa z MacOS i Windows, laptop i desktop" | tytuł + opis „Compatibility with MAC OS", „Desktop Laptop" (§2b) |
| „★ 4,6 / 5 · 26 ocen" | `review_stats` (§5) — POD foldem |
| ⛔ **CUT / ZAKAZ** | „10 Gbps", „USB 3.2 Gen2", „7-in-1", „czytnik SD/TF", „HDMI/4K", „12TB", wymiary/waga (brak danych), „sold 34" jako licznik, marka Eswirepro/ORICO, sprzedawca „Better House Life Store" |

---
*Konsumenci planu: F1.7 (`PRZEWODNIK-GRAFICZNY.md` — casting/świat/osie) · F2.5 (`TOKENS-MAKIETY.md`
— partytura hexami) · F2 (briefy makiet) · F4 (koder). Źródło faktów = `KARTA-PRAWDY.md` (Z7).*
