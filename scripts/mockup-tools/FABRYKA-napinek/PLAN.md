# PLAN LANDINGU — NAPINEK (sprężynowy trener ramion i klatki) · F1 · 2026-07-24

> Mini-marka **„Napinek"** (zarezerwowana w F0 `bud_brand_names`; brand-forge potwierdzi favicon w
> F2.5). Cena **144,90 zł DANA** (ODCZYT `wf2_products.price`; fabryka landingów NIE zmienia ceny).
> Źródło faktów = `KARTA-PRAWDY.md` (Z7) — każdy claim niesie kotwicę w Karcie, inaczej CUT.
> Persona = `ICP-GRUPA-DOCELOWA.md`. Zakres = `MAPA-ZASTOSOWAN.md`. Wygląd = `PASZPORT.md`.
> White-label: marka „Rbefeuly"/„HOTWAVE", sprzedawca „Worldly Collective Store" **NIGDY na
> stronie**; broszura „HOTWAVE" (g6) = CROP/ODRZUĆ. Parasol = **Zmyślnik** (sklep platformy).

---

## MOTYW PRZEWODNI + KĄT SPRZEDAŻOWY

**Motyw przewodni (metafora korzyści):** **„NAPIĘCIE, KTÓRE BUDUJE".** Rdzeń produktu = zginasz
drążek wbrew oporowi sprężyny — z tego napięcia rodzi się siła. Osią wizualną jest **ŁUK NAPIĘCIA**:
krzywa, którą drążek zatacza pod obciążeniem, biegnie przez sekcje jako powtarzalny motyw (łuk /
krzywa oporu), a **wielkie liczby oporu 60·75·90** są sygnaturą progresu. To NIE „clean e-commerce"
— to jeden fizyczny gest (napięcie → siła) rozpisany na całą stronę. Energia „domowa, ale
konkretna" (nie ciemna komercyjna siłownia — patrz ICP: świat JASNY).

**Kąt sprzedażowy (hero = echo hooka, Z1):** *„Zbuduj siłę ramion i klatki w domu — jeden drążek,
3 poziomy oporu, kilka minut dziennie."* Rdzeń USP z KARTY §3: **para stalowych sprężyn + 3 poziomy
oporu (60/75/90 lbs) → cały górny korpus bez siłowni.**

**HOOKS `?h=N` (message-match do kreacji, podmiana h1+sub):**
- **h1 (PRIMARY):** „Ramiona i klatka **jak z siłowni** — w domu, w kilka minut dziennie" (trening
  oporowy bez karnetu).
- **h2:** „Jeden drążek zamiast całej siłowni — **3 poziomy oporu**, cały górny korpus" (progres 60→90 lbs).
- **h3:** „Napnij, zegnij, **zbuduj siłę** — bez karnetu i bez wychodzenia z domu" (impuls, prostota).

**Zakotwiczenie ceny/ryzyka NAD foldem (redukcja lęku #1 = scam, rynek PL):** płatność **przy
odbiorze** · **zwrot 14 dni** · **wysyłka z Polski**. ⛔ ★/liczby opinii w topbar+hero (trust nad
foldem = redukcja ryzyka, NIE social proof — ★4,8/9 dopiero POD foldem w `opinie`; 9 ocen = mało,
nie eksponować).

**Produkt WIELOZADANIOWY** (MAPA-ZASTOSOWAN): dwa wektory siły (ściskanie do środka ↔ prostowanie na
zewnątrz) → ≥4 partie (klatka/biceps/plecy/barki, +nogi drugoplan). Doktryna SZEROKOŚCI OBOWIĄZUJE →
**dedykowana sekcja `zastosowania`** (nie wzmianka „nie tylko ramiona"). PRIMARY = ramiona+klatka
(hero, tytuł „Arm Trainer, Chest Workout"); SECONDARY = plecy/barki (sekcja `zastosowania` + demo).

---

## UCZCIWOŚĆ = KONWERSJA (Z5) — realne fakty z 5 opinii + porównania idą do FAQ/porównania

- **wymaga chwili wprawy w technice** (op.[2] „You just need to practice") → FAQ uczciwie: „na
  początku poćwicz technikę — to trener oporowy, ruch kontrolowany, nie na siłę".
- **to sprzęt trzymany w dłoniach, nie „na podłodze"** (op.[2] „when it's on the floor it doesn't
  work") → demo/FAQ: pokazać, że ściskasz/zginasz drążek oburącz.
- **funkcjonalny, nieporęczny** (op.[4] „functional but not bulky") → korzyść „kompaktowy, schowasz".
- **realny minus vs. zwykły drążek (g5 porównanie):** stary typ (pojedyncza sprężyna) rani dłonie /
  robi jedno → nasz: pianka + osłona + 3 poziomy + różne ćwiczenia (uczciwe „czym się różni").
- **sold_volume = 25** << 1000 → **POMIJAMY na stronie** (§sold: żadnej frazy „tysiące"; 25 to
  sprzedaż globalna Ali, nie nasz sklep). **9 ocen = mało → tylko POD foldem, bez licznika nad foldem.**

---

## CONSTRAINTS (twarde ograniczenia F0 — nieprzekraczalne; źródło: KARTA-PRAWDY §0–§5, PASZPORT)

1. **Sprzedajemy JEDNĄ konfigurację:** łamany drążek oporowy, **para stalowych sprężyn** (double-
   layer) w osłonie, **czarna pianka antypoślizgowa + MIĘTOWE/TURKUSOWE pierścienie + CHROM**,
   **3 poziomy oporu 60/75/90 lbs** (~27/34/41 kg), **rebound button** (długość↔opór), **rozkładany**,
   wymiary **67×17 cm**. **Waga = brak danych → ⛔ zero zmyślonych kg.**
2. **Kolor kanoniczny = MIĘTA/TURKUS** (galeria detail g0–g5). ⛔ **ZAKAZ renderowania NIEBIESKIEGO
   wariantu** (g6-cover = inny egzemplarz koloru) jako kanonu.
3. **Partie z dowodem:** ramiona (biceps), klatka, plecy, barki (+nogi DRUGOPLANOWO, g0). ⛔ ZAKAZ
   „6+ mięśni" jako twardej liczby; ⛔ „cardio/spalanie tłuszczu"; ⛔ claimów zdrowotnych/medycznych.
4. **BRAK wideo produktu** (video_url=null; TT niepobrany, okładka off-color+brand) → sekcja `wideo`
   NIE powstaje jako build → **blokada-tomek** (klasa dowodowa, WIDEO.md).
5. **BRAK zdjęć kupujących** (`bud-reviews/…` puste, wszystkie recenzje `images:[]`) → sekcja
   `ugc-zdjecia` → **blokada-tomek** (klasa dowodowa, GALERIA.md).
6. **BRAK czystego packshotu w kanonie** → packshot (turkus) + sceny lifestyle na JASNYM tle
   **generujemy w F3**; kadry galerii (g4/g5 po CROP) = referencja bryły/DANE, nie gotowy asset.
7. **review na stronę: ★4,8/5 · 9 ocen** (`review_stats`) — POD foldem. **Cena 144,90 zł — NIE zmieniać.**
8. **White-label 🚫 NIGDY:** marka „Rbefeuly"/„HOTWAVE", sprzedawca „Worldly Collective Store";
   broszura „HOTWAVE" (g6) = CROP/ODRZUĆ. Sam drążek nie ma czytelnego nadruku.
9. **Świat JASNY** (ICP): dom/kącik treningowy, naturalne światło. ⛔ NIGDY ciemna komercyjna
   siłownia (tło galerii detail); ⛔ casting półnagiego kulturysty (galerii) — zwykła sprawna osoba.

---

## WZORCE (reuse preflight — EXEMPLARY-INDEX; ⛔ rzemiosło, NIGDY wizja/copy)

Dobór wg **trafności + różnorodności**. ⛔ Reuse = moduły / rytm sekcji / mechanika CTA / gęstość
dowodu; ⛔ NIGDY paleta / font / archetyp / świat / copy (partytura pod Napinka). Celowo mieszam światy.

| wzorzec | poziom | co REUŻYWAM (rzemiosło) | dlaczego trafny |
|---|---|---|---|
| **zaklipek** | ✅ (0 FAIL) | checkout-inline (`data-zc-*` skórka `#zamow`), hero-video HERO-STAGE, sticky-buy@1, footer@1, TOR-I demo ze stanami | technicznie najbliższy przebieg wf2; produkt „jeden sprzęt, jeden akcent, demo ze stanami" |
| **ugniatek** | ◽ | **TOR-I demo ze STANAMI** (kroki 1-2-3 jako stany), sekcja `zastosowania` mozaika, sticky-buy | wzorzec sekcji zastosowań i demo krokowego; produkt sprzętowy mechaniczny |
| **masazer** | ✅ WZORZEC | **dedykowana sekcja mid-cta**, sekcja porównania (nasz vs stary sposób — 2 assety), archetyp z kartą na scenie, lightbox | wzorcowa mechanika mid-CTA + porównanie (mam g5 OURS vs OTHER) |
| **rozgrzewek** | ◽ (dywersyfikator) | gęstość sekcji korzyści z kotwicą, `faq-accordion@1` slot media | celowo RÓŻNY świat/partytura — trzyma few-shot od kolapsu |

⛔ **odpalak/loczek = ANTY-WZORCE** — tylko moduły kanoniczne, NIGDY plik strony.

---

## CROSS-LANDING (preflight anty-klon)

Partytura wypisana tak, by różniła się od **3 poprzednio ZBUDOWANYCH** landingów (mtime
`sklepy/tomek-niedzwiecki/*/index.html`): **migotek** (18:23) · **nakrecik** (16:19) · **zaklipek** (16:19).

| oś | Napinek | poprzednicy (3) | różni się? |
|---|---|---|---|
| font display | **Barlow Semi Condensed (800/700)** | Fraunces (migotek) · Space Grotesk (nakrecik) · Bricolage (zaklipek) | ✓ (gate font FAIL-safe) |
| kolor akcentu | **#0F766E** (głęboki turkus) | #E9A03A amber (migotek) · #12B76A emerald (nakrecik) · #0A6EBD blue (zaklipek) | ✓ ΔE ≥ **33** (CIE76; próg 15) |
| archetyp hero | **C** (karta nachodząca na scenę) | A (migotek — BEZPOŚREDNI poprzednik) · A (nakrecik) · B (zaklipek) | ✓ ≠ A (bezpośredni) |
| rodzina tła | **chłodny len / jasny popiel z nutą zieleni** | ciepły płomień (migotek) · … | ✓ |
| świat / materiał | **jasny dom / trening / pianka+chrom+mięta** | świece/wieczór (migotek) · creator/kamera (nakrecik) · desk/aluminium (zaklipek) | ✓ |

ΔE (CIE76) akcentu **#0F766E**: **~46** vs #12B76A (nakrecik emerald — najbliższy) · **~62** vs
#0A6EBD (zaklipek) · **~55+** vs #E9A03A (migotek amber). Minimum ≈46 ≫ próg 15. **Wynik: 5/5 osi
RÓŻNI SIĘ** (archetyp ≠ bezpośredni poprzednik A). Sekwencja sekcji (WARN-only) prowadzona ciężarem
dowodowym produktu. *(Blok `:root` powstaje w F2.5 → wtedy `gate-check.py napinek --cross-only` policzy maszynowo.)*

---

## PARTYTURA (8 pozycji — KAŻDA z uzasadnieniem; pełny blok tokenów: `TOKENS-MAKIETY.md` w F2.5)

1. **font display = Barlow Semi Condensed (800/700)** ⟵ produkt **atletyczny/siłowy** → kondensowany,
   mocny grotesk o „sportowej", jerseyowej energii (napięcie, siła); ≠ Fraunces (migotek) · ≠ Space
   Grotesk (nakrecik) · ≠ Bricolage (zaklipek). TTF dostępny (wordmark F2.5). **Gate font ✓.**
2. **font text = Mulish (400/600/800)** ⟵ humanist o czytelnych, równych cyfrach do liczb siłowych
   (60/75/90 lbs, 67 cm, 144,90 zł) + ciepły KONTRAST do kondensowanego display; ⛔ nie zimny
   Inter/Helvetica (KANON).
3. **kolor akcentu `--cta` = #0F766E** (głęboki turkus) ⟵ **WYPROWADZONY z realnego koloru produktu
   = MIĘTOWE/TURKUSOWE pierścienie uchwytów** (jedyny chromatyczny sygnał; czerń/chrom achromatyczne).
   Kontrolowana pochodna (przyciemniona) dla kontrastu: `--cta-ink #FFFFFF` (WCAG **5,47:1**).
   ΔE ≥ 33 vs 3 poprzednie. **Gate akcent ✓.**
4. **rodzina tła = chłodny len / jasny popiel z nutą zieleni** `--paper #F5F7F5 / #E9EDE9 / #DCE4DE`
   ⟵ świat **domowego treningu, energiczny ale JASNY i czysty** (ICP: nie ciemna siłownia); lekko
   zielono-szary undertone rymuje z turkusowym akcentem i odróżnia od chłodnej-niebieskiej platyny
   zaklipka. `--ink #1C2723` (grafit o ciepło-zielonej temperaturze), `--body #37423C`, `--line #D3DDD5`.
   Warunek KANONU: wysoka jasność + niskie nasycenie + WCAG body ✓. Cień miękki, tint **mchowy**
   `rgba(20,45,35,.06–.11)` + grain 3%.
5. **świat / materiał = jasny dom / kącik treningowy** (mata, roślina, okno; casual-sport), pianka
   czarna + mięta + chrom, naturalne światło dzienne. ⟵ ICP §3/§5. ≠ świece/wieczór migotka, ≠
   ciemna siłownia galerii.
6. **archetyp hero = C (karta nachodząca na scenę)** ⟵ Napinek sprzedaje **WIDOCZNY WYSIŁEK + mocną,
   ale przystępną cenę**; kategoria znana (każdy „łapie" trener ramion) → nie potrzeba splitu-
   wyjaśnienia (B). C = dynamiczna scena repu (osoba zgina drążek przed klatką, napięte ramiona) u
   góry + karta mikro-oferty (144,90 zł → CTA → pay-row) NACHODZĄCA na dolną krawędź sceny = impuls +
   cena; naturalnie przenosi się na mobilny fold. **≠ A (migotek — bezpośredni poprzednik) · ≠ B (zaklipek).**
   `archetyp-hero: C`
7. **sygnatura wydawnicza = S5 „wielkie liczby-jako-grafika"** ⟵ motyw = PROGRES OPORU: wielkie
   atletyczne cyfry **60 · 75 · 90** (poziomy oporu) i **01/02/03** (kroki demo) jako element
   graficzny WEWNĄTRZ sekcji (⛔ NIGDY numeracja sekcji „01/16"); współgra z subtelnym **łukiem
   napięcia** (krzywa 1px jako echo zgiętego drążka). Powtórzona świadomie w ≥3 sekcjach (hero łuk,
   demo 01-02-03, poziomy 60/75/90, mid-cta). ≠ S3 linia zaklipka · ≠ swash migotka.
8. **dobór i KOLEJNOŚĆ sekcji** ⟵ ciężar dowodowy: hook→trust→ból(bez produktu)→ulga(produkt)→JAK
   działa (TOR-I 1-2-3)→**zastosowania (cały górny korpus — SPEKTRUM)**→3 poziomy oporu (demo TOR-I)→
   korzyści z kotwicą w specs→bezpieczeństwo/porównanie (pianka+osłona vs stary drążek)→dowód→mid-cta→
   oferta+kasa→FAQ→final. Pełen MANIFEST niżej.

---

## MANIFEST SEKCJI

> Format kanoniczny: `` N. `id | typ | status — powód` `` (build) / blokada-tomek z powodem. Rdzeń
> `hero · zamow · final · mid-cta` = build. **Klasa DOWODOWA** (wideo TikTok/UGC, zdjęcia kupujących)
> — agent NIE MA prawa `SKIP`; po protokole wyczerpania → `blokada-tomek` (decyzja „sekcji nie
> będzie" = WYŁĄCZNIE Tomek).

1. `hero | scenowa | build` — archetyp **C**; scena: osoba zgina drążek przed klatką (napięte ramiona/klatka) jako blok **pod hero-video** (HERO-STAGE); karta mikro-oferty (144,90 zł → CTA → pay-row) NACHODZĄCA na dolną krawędź sceny; pas trust NAD foldem (COD/14 dni/z Polski). Mobile: scena kompakt (~45svh) → hook big-type → karta NACHODZĄCA (cena+CTA nad foldem @750).
2. `zaufanie | kodowa | build` — pas redukcji ryzyka: **płatność przy odbiorze · zwrot 14 dni · wysyłka z Polski · dla kobiet i mężczyzn (unisex)** (lęk #1 = scam). Separator anty-szew hero↔problem.
3. `problem | scenowa | build` — **BÓL BEZ produktu** (EMOCJA↔PRODUKT): postanowienia bez efektu, nudne/za trudne pompki, niewykorzystany karnet, zwykła sprężyna raniąca dłonie. ⛔ zero naszego drążka w kadrze; seed jawnie wyklucza produkt.
4. `rozwiazanie | scenowa | build` — produkt WCHODZI jako ulga: **weź drążek, napnij, zbuduj siłę — w domu, w kilka minut**; koniec wymówek. (scena ANIM: firana/roślina w oknie = nośnik ruchu; osoba = klasa aktywna, ruch repu).
5. `demo | scenowa | build` **(TOR-I)** — „jak to działa" 1-2-3: **(1) chwyć oburącz → (2) napnij/zegnij drążek wbrew oporowi → (3) rozluźnij i powtórz** (technika kontrolowana — op.[2]). Stany per krok na makietach F2 (osobny kadr/stan), nie statyczna karta.
6. `zastosowania | scenowa | build` — **SPEKTRUM (MAPA-ZASTOSOWAN):** jeden drążek → **klatka · biceps/ramiona · barki · plecy/triceps** (mozaika/toggle, kadr per partia). Rozbraja „to tylko na ramiona"; rdzeń ramiona+klatka, reszta z dowodem galerii (g0). Nogi = ostrożnie/pominąć jako główny claim.
7. `poziomy | scenowa | build` **(TOR-I flagowa)** — **3 POZIOMY OPORU 60 / 75 / 90 lbs** (sygnatura S5 wielkich liczb); konfigurator/przełącznik poziomu + rebound button (długość↔opór); „rośnie z tobą — od startu do zaawansowanego". Interakcja flagowa (F5).
8. `korzysci | kodowa | build` — cechy→korzyści **z KOTWICĄ w specs** (ikony charcoal): stalowa sprężyna dwuwarstwowa (mocny opór, nie traci kształtu — g2) · pianka antypoślizgowa + osłona (pewny chwyt, chroni dłonie — g1/g5) · 3 poziomy (progres) · rozkładany 67×17 cm (schowasz/w podróż). ⛔ zero „6+ mięśni/cardio".
9. `bezpieczenstwo | kodowa | build` — **uczciwe porównanie (g5): Napinek vs zwykły drążek z pojedynczą sprężyną** — pianka + osłona (nie rani dłoni) · 3 poziomy (nie jeden) · rozkładany · różne ćwiczenia. JEDEN realny akcent uczciwości (Z5): na start poćwicz technikę (op.[2]).
10. `mid-cta | scenowa | build` — **DEDYKOWANA sekcja CTA** z zaprojektowanym `.btn.cta` (re-CTA desktop); scena jasny dom, „Zamów Napinka — 144,90 zł, płacisz przy odbiorze".
11. `opinie | kodowa | build` — realne recenzje (**5 treści EN VERBATIM**, teksty bez tłumaczenia) + `review_stats` **★4,8/5 · 9 ocen POD foldem**; uczciwie (op.[2] wskazówka techniki). ⛔ nie eksponować liczby 9 nad foldem.
12. `galeria | kodowa | build` — kurowane realne kadry **po CROP** (g4 wymiary → g5 porównanie) + sceny/packshot F3 (kanon turkus); `lightbox@1`. ⛔ retusz „HOTWAVE" (g6, jeśli użyty jako ref kształtu).
13. `wideo | kodowa | blokada-tomek — protokół wyczerpania: ali_snapshot.video_url=null; klip TT @7141039908677764142/…7539235739989495054 NIEPOBRANY, okładka (g6) = NIEBIESKI wariant + broszura „HOTWAVE" (off-color/brand); videos_curated „brak zweryfikowanego wideo" → materiał do pozyskania; kamień TOMKA (WIDEO.md — klasa dowodowa, agent bez prawa SKIP).`
14. `ugc-zdjecia | kodowa | blokada-tomek — protokół wyczerpania: bud-reviews/1005009863215535 w Storage PUSTE (0 plików, sprawdzone 24.07) + wszystkie 5 recenzji images:[] → 0 zdjęć od kupujących; decyzja o sekcji = TOMEK (GALERIA.md — klasa dowodowa, agent bez prawa SKIP).`
15. `zamow | kodowa | build` — `#zamow` = **moduł checkout-inline** (skórka tokenami; wrapper `data-zc-product` ORAZ `data-zc-api`; kontener ≥860 px); **cena 144,90 zł**, COD, packshot bazowy (F3 turkus); zaprojektowany `.btn.cta`; kolejność cena→CTA→redukcja ryzyka.
16. `faq | kodowa | build` — `faq-accordion@1` + slot media (sticky packshot); uczciwie: „czy to działa / czy trudne?" (poćwicz technikę — op.[2]) · „jaki opór?" (60/75/90 lbs) · „dla kobiet?" (unisex) · „na jakie partie?" (ramiona/klatka/plecy/barki) · „czy się schowa?" (rozkładany, 67×17 cm) · „czy nie rani dłoni?" (pianka + osłona). Ikony +/− charcoal.
17. `final | scenowa | build` — FINAL CTA: **życie z produktem** (osoba po treningu w jasnym domu, drążek pod ręką), zaprojektowany `.btn.cta` „Zamawiam Napinka". (scena ANIM dolna — ambient).

**Nie-sekcje (moduły):** `sticky-buy@1` (mobile) · `footer@1`.
**Sekcje TOR-I:** `demo` (#5, „jak działa" 1-2-3) · `poziomy` (#7, konfigurator 60/75/90 lbs — interakcja flagowa).

---

## SZKIELET CTA (bramkowany — gate `cta`; ≥4 `[data-checkout]` + dedykowana mid-CTA + final)

| # | miejsce | typ CTA | etykieta | uwaga makiety |
|---|---|---|---|---|
| 1 | **hero** (#1) | karta oferty: cena → `.btn.cta` → pay-row | „Zamawiam — 144,90 zł" | ZAPROJEKTOWANY CTA w kadrze (krytyk +11) |
| 2 | **mid-cta** (#10) | DEDYKOWANA sekcja z `.btn.cta` + cena | „Zamów Napinka" | scena + realny button (re-CTA desktop) |
| 3 | **zamow** (#15) | checkout-inline (`data-zc-*`) + `.btn.cta` | „Kup teraz — płacę przy odbiorze" | cena→CTA→redukcja ryzyka |
| 4 | **final** (#17) | `.btn.cta` na scenie życia z produktem | „Zamawiam Napinka" | zaprojektowany CTA w kadrze |
| 5 | **sticky-buy@1** (mobile) | pasek dolny: cena + `.btn.cta` | „144,90 zł · Zamów" | moduł, re-CTA (IO po hero) |

Makiety `hero · #zamow · mid-cta · final` MUSZĄ nieść ZAPROJEKTOWANY `.btn.cta` — inaczej REGEN makiety.

---

## FUNKCJE KONWERSJI
- Message-match `?h=N` (HOOKS 1–3: siłownia w domu / 3 poziomy / bez karnetu) — podmiana h1+sub.
- `#zamow` checkout-inline (COD), sticky-buy mobile, mid-CTA dedykowana, re-CTA desktop.
- Trust nad foldem: COD + zwrot 14 dni + wysyłka z Polski + unisex (⛔ ★/liczby opinii nad foldem).
- TOR-I: demo 1-2-3 (technika) + `poziomy` 60/75/90 (konfigurator — „rośnie z tobą").
- Sekcja `zastosowania` (SPEKTRUM partii) — rozbraja „to tylko ramiona".
- Uczciwe porównanie (g5) + FAQ (technika, partie) = redukcja ryzyka > social-proof (lęk #1 = scam).
- JSON-LD Offer (144,90 zł, PLN) + AggregateRating (4,8/9) — structured data (nie nad foldem wizualnie).

---

## ANTY-MISMATCH (CLAIM → ŹRÓDŁO) — każda korzyść niesie kotwicę; brak = CUT

| CLAIM (copy) | ŹRÓDŁO / KOTWICA (KARTA-PRAWDY) |
|---|---|
| „zbuduj siłę ramion i klatki w domu" | tytuł „Twister Arm Trainer, Chest Workout"; g0 partie; opis „arms, chest" (§0/§2b/§3) |
| „3 poziomy oporu — 60 / 75 / 90 lbs, rośnie z tobą" | g1 „3 resistance types 60/75/90lbs"; g3 diagram poziomów; g4 rebound button (§2b) |
| „mocny opór — stalowa sprężyna dwuwarstwowa, nie traci kształtu" | g1/g2 „precision steel spring", g2 „does not change the shape"; opis „high-strength metal springs" (§2b/§3) |
| „pewny chwyt — pianka antypoślizgowa + osłona, chroni dłonie" | g1 „Elastic leather cover Non-slip", g5 „Foam Wrapped Anti Slip"; g5 (stary drążek rani dłonie) (§2b/§3) |
| „cały górny korpus: ramiona, klatka, plecy, barki" | g0 „Chest/Biceps/Back exercises"; opis „arms, chest, back, shoulders"; MAPA-ZASTOSOWAN (§3) |
| „kompaktowy, rozkładany — schowasz albo weźmiesz w podróż (67×17 cm)" | g2/g5 „Detachable, portable"; g4 wymiary; op.[4] „not bulky" (§2b/§5) |
| „★ 4,8 / 5 · 9 ocen" | `review_stats` (§5) — POD foldem |
| ⛔ **CUT / ZAKAZ** | „6+ mięśni" jako liczba, „cardio/spalanie tłuszczu", claimy zdrowotne, waga w kg (brak danych), „sold 25" jako licznik, NIEBIESKI wariant, marka „Rbefeuly/HOTWAVE", sklep „Worldly Collective Store", nogi jako główna obietnica |

---
*Konsumenci planu: F1.7 (`PRZEWODNIK-GRAFICZNY.md` — casting/świat/osie) · F2.5 (`TOKENS-MAKIETY.md`
— partytura hexami) · F2 (briefy makiet) · F4 (koder). Źródło faktów = `KARTA-PRAWDY.md` (Z7).*
