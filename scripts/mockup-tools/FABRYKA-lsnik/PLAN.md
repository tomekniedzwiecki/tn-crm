# PLAN LANDINGU — LŚNIK (listwa LED ambient do bagażnika) · F1 · 2026-07-24

> Mini-marka **„Lśnik"** (ZAREZERWOWANA `bud_brand_names`, F0.6). Cena **34,90 zł DANA** (ODCZYT
> `wf2_products.price`; fabryka NIE zmienia ceny). Źródło faktów = `KARTA-PRAWDY.md` (Z7) — każdy
> claim niesie kotwicę, inaczej CUT. Zakres = `MAPA-ZASTOSOWAN.md`. Wygląd produktu = `PASZPORT.md`.
> White-label: produkt bez marki (Brand=NONE); ⛔ logo „Changan"/tablica z okładki TikTok (g6) NIGDY
> na stronie. Persona wnioskowana inline (brak osobnego ICP — zachowanie dozwolone, F0.6a).

---

## MOTYW PRZEWODNI + KĄT SPRZEDAŻOWY

**Motyw przewodni (metafora korzyści):** **„ŚWIETLNY OBRYS, KTÓRY SAM WITA PO OTWARCIU KLAPY".**
Produkt rysuje ciągłą LINIĄ światła cały obrys bagażnika i zapala się SAM, gdy podnosisz klapę.
Więc osią wizualną landingu jest **świetlna linia-obrys** biegnąca przez sekcje (sygnatura) + gest
„otwierasz → rozświetla się". To NIE „clean e-commerce" — to jeden fizyczny moment (klapa w górę,
bagażnik tonie w cieple/bieli światła) rozpisany na całą stronę.

**Kąt sprzedażowy (hero = echo hooka, Z1; PRIMARY z MAPY):** *„Otwierasz klapę — bagażnik sam wita
Cię światłem."* Rdzeń USP z KARTY §3: **auto-czujnik (otwarcie klapy → świeci, zamknięcie → gaśnie)
+ ciepły/biały świetlny obrys wokół całej ramy.**

**HOOKS `?h=N` (message-match do kreacji, podmiana h1+sub):**
- **h1 (PRIMARY):** „Otwierasz klapę — bagażnik **sam wita Cię światłem**" (auto-czujnik + wow obrys).
- **h2 (utility/ból):** „Koniec **szukania po omacku** w ciemnym bagażniku" (widzisz, co pakujesz).
- **h3 (wow/dekoracja):** „Świetlny **obrys**, który robi z Twojego bagażnika **premium**" (car-look).

**Zakotwiczenie ceny/ryzyka NAD foldem (redukcja lęku #1 = scam, rynek PL):** płatność **przy
odbiorze** · **zwrot 14 dni** · **wysyłka z Polski** · **12 V — pasuje do każdego auta**. ⛔ ★/liczby
opinii nad foldem (★4,6/16 dopiero POD foldem w `dowod`).

**Produkt DWU-FUNKCYJNY (MAPA F0.6b): utility (oświetlenie strefy ładunkowej) + ambient (dekoracja
„wow").** Doktryna szerokości OBOWIĄZUJE: **PRIMARY → hero** (auto-światło + wow), **SECONDARY →
sekcja `zastosowania`** (zakupy po zmroku · szukanie drobiazgów · dekoracja premium · biwak/tailgate ·
elastyczne poprowadzenie) + hero-sub spektrum. ⛔ NIE upychać szerokości w jedną wzmiankę „nie tylko X".

---

## UCZCIWOŚĆ = KONWERSJA (Z5) — realne minusy z 5 opinii idą do porównania/FAQ, nie chowamy

- **instrukcja oryginalna po chińsku** (op.[4] „i only need instructions") → FAQ: „damy prostą
  instrukcję PL, montaż krok po kroku".
- **przy niektórych autach nie obejmie 1:1 całej ramy / trzeba dociąć** (op.[5] „Doesn't fit the boot…
  looks great around the panoramic roof trim") → sekcja `porownanie`/FAQ + `kolor`/`demo`: „elastyczna,
  **docinasz na długość swojego auta**; poprowadzisz też przy dachu/progach".
- **sold_volume = brak** → **POMIJAMY na stronie** (żadnej frazy „tysiące zamówień"; brak danych).

---

## CONSTRAINTS (twarde ograniczenia F0 — nieprzekraczalne; źródło: KARTA §0–§5, PASZPORT)

1. **Sprzedajemy WYŁĄCZNIE wariant 2M** (biały LUB ciepły biały — oba $7.06). **⛔ 4M poza marżą**
   (~36,40 zł landed) — nie oferować. Cena PL jedna: **34,90 zł**; wybór koloru = ta sama cena.
2. **Kolory = tylko biały / ciepły biały.** ⛔ ZAKAZ RGB/tęczy/„16 mln kolorów" (leaflet wymienia
   czerwony/niebieski = INNE warianty katalogu, POZA sprzedawaną konfiguracją; PASZPORT).
3. **⛔ ZAKAZ dorabiania: pilota / aplikacji / Bluetooth / trybów / „X diod" / adresowalnych pikseli** —
   to prosty auto-czujnik on/off, gładka LINIA światła (PASZPORT „CZEGO NIE MA"). Brak danych = CUT.
4. **Efekt „dynamiczny/scanning" = wizualny (opis), NIE parametr liczbowy** — pokazać sceną/animacją
   hero, ⛔ nie „X trybów/prędkości".
5. **Specs PUSTE → ⛔ zero zmyślonych cm/kg/lumenów/W.** Konkrety (silikon, DC 12V, 2M, biały/ciepły,
   auto-czujnik, wodoodporny, cięty) mają kotwicę w OPISIE + galerii + instrukcji kupujących (§2b).
6. **BRAK wideo produktu** (video_url=null; TikTok = surowy, wypalony tekst + Changan + tablica) →
   sekcja `wideo` = **blokada-tomek** (WIDEO.md); efekt dynamiczny oddany animacją hero (F5).
7. **BRAK czystego packshotu** → packshot (zwój biały/ciepły + przewód + montaż na ramie) **generujemy
   w F3**; kadry galerii (g0–g5 po CROP/retuszu) = referencja bryły/światła, nie gotowy asset.
8. **review na stronę: ★4,6/5 · 16 ocen** (snapshot). **Cena 34,90 zł — NIE zmieniać.**
9. **White-label:** produkt bez marki (Brand=NONE); ⛔ logo „Changan"/chińska tablica/eksponowana marka
   auta NIGDY na stronie; auto w scenach = **neutralne** (bez czytelnego logo/tablicy).

---

## WZORCE (reuse preflight — EXEMPLARY-INDEX; ⛔ rzemiosło, NIGDY wizja/copy)

Dobór wg **trafności + różnorodności**. ⛔ Reuse = moduły / rytm sekcji / mechanika CTA / gęstość
dowodu; ⛔ NIGDY paleta / font / archetyp / świat / copy (te = partytura pod Lśnika).

| wzorzec | co REUŻYWAM (rzemiosło) | dlaczego trafny |
|---|---|---|
| **drapek** | **archetyp C (karta nachodząca na scenę)** jako wzorzec mechaniki fold+cena; `sticky-buy@1`, `footer@1` | najbliższy układ hero C (impuls + mocna oferta, fold z ceną na mobile) |
| **migotek** | **hero-video-inject** (scena świetlna full-bleed jako źródło i2v), `lightbox@1`, gęstość scen nastrojowych | najbliższy „produkt świetlny, scena = argument" — ale ja idę C (≠ jego A), tło kamień (≠ jego krem), font Montserrat (≠ Fraunces) |
| **masazer** | **dedykowana sekcja mid-cta**, **demo TOR-I (crossfade stany)**, sekcja porównania (nasz vs stary sposób), `lightbox@1` | wzorcowa mechanika mid-CTA i demo 1-2-3 (montaż) |
| **zaklipek** | **checkout-inline** (`data-zc-product`+`data-zc-api`, skórka tokenami dla `#zamow`), TOR-I konfigurator jako wzorzec przełącznika (→ mój `kolor` biały↔ciepły), sticky-buy | inline checkout + interakcja-przełącznik jako wzorzec pod `kolor` |

⛔ **odpalak/loczek = ANTY-WZORCE** — jeśli sięgam po ich sekcje, WYŁĄCZNIE moduły kanoniczne.

---

## CROSS-LANDING (preflight anty-klon)

`gate-check.py lsnik --cross-only` policzy maszynowo w F6 (po `index.html` i bloku `:root` w
TOKENS-MAKIETY). Partytura wypisana RĘCZNIE, by różniła się od **3 poprzednich** (cross-glob, mtime).

**3 poprzednicy (od najnowszego):** **migotek** (`--cta #E9A03A` amber · display Fraunces · **archetyp
A**) · **nakrecik** (`--cta #12B76A` zielony · Space Grotesk) · **zaklipek** (`--cta #0A6EBD` azure ·
Bricolage Grotesque · archetyp B).

**Różnica na 5/5 osiach (wymagane min. 3/5):**
| oś | Lśnik | poprzednicy | różni się? |
|---|---|---|---|
| font display | **Montserrat (800)** | Fraunces · Space Grotesk · Bricolage | ✓ (gate font: FAIL-safe) |
| kolor akcentu | **#C21F30** (czerwień lamp tylnych) | #E9A03A · #12B76A · #0A6EBD | ✓ ΔE(min) = **58,8** (CIE76; próg 15) |
| archetyp hero | **C** (karta nachodząca na scenę) | **A** (migotek) · B (zaklipek) | ✓ (≠ bezpośrednio poprzedni A) |
| rodzina tła | **ciepły kamień / greige** | krem (migotek) · chłodna platyna (zaklipek) | ✓ |
| świat / materiał | **auto nocą / podjazd, świetlny bagażnik** | świece/wnętrze (migotek) · desk-setup (zaklipek) | ✓ |

ΔE (CIE76) akcentu #C21F30: **58,8** vs #E9A03A · **120,3** vs #12B76A · **100,4** vs #0A6EBD →
min. 58,8 ≫ próg 15. **Wynik cross-landing: 5/5 osi RÓŻNI SIĘ.** Sekwencja sekcji (WARN-only)
prowadzona ciężarem dowodowym produktu.

---

## PARTYTURA (8 pozycji — KAŻDA z uzasadnieniem; pełny blok tokenów: `TOKENS-MAKIETY.md` w F2.5)

1. **font display = Montserrat (800/900)** ⟵ produkt automotive/premium (sportowy Changan w źródle,
   „premium car look") → **geometryczny, pewny grotesk** o mocnej obecności przy dużych rozmiarach;
   ≠ Fraunces (migotek) · ≠ Space Grotesk (nakrecik) · ≠ Bricolage (zaklipek). **Gate font ✓.**
2. **font text = Mulish (400/600/800)** ⟵ **humanist** o czystych cyfrach do liczb (34,90 zł · 2M ·
   12V · ★4,6/16) + ciepły KONTRAST do geometrycznego display; ⛔ nie zimny Inter/Helvetica (KANON).
3. **kolor akcentu `--cta` = #C21F30** (czerwień tylnych świateł) ⟵ światło produktu jest **białe/
   ciepłe** (achromatyczne / amber kolidujący z migotkiem ΔE<15) → biorę **realny sygnał chromatyczny
   ŚWIATA**: czerwień lamp tylnych auta (g0/rev0/g6 pokazują świecącą czerwień tylnych świateł obok
   listwy). Czerwień = automotive (tył auta), wysoka konwersja CTA, WCAG. `--cta-ink #FFFFFF`
   (kontrast **5,94:1**). ΔE(min) = 58,8 vs 3 poprzednie. **Gate akcent ✓.**
4. **rodzina tła = ciepły KAMIEŃ / greige** `--paper #F7F4EF / #EFE9E1 / #E3DBCE` ⟵ świat premium-
   automotive (jasny beton/showroom, ciepła neutralność interieru) — jasny, ciepły, ale **NIE krem**
   (≠ migotek) i **NIE chłodna platyna** (≠ zaklipek); czerwień pięknie kontruje na ciepłym kamieniu.
   `--ink #22201D` (ciepły grafit), `--body #3A362F` (WCAG 10,95:1), `--line #DAD1C2`. Warunek KANONU:
   wysoka jasność + niskie nasycenie + WCAG body ✓. Głębia: cień ciepły `rgba(60,40,20,.06–.12)` + grain 3%.
5. **świat / materiał = auto nocą/wieczorem (podjazd, parking, garaż-showroom); świecący bagażnik SUV/
   kombi** ⟵ kontekst użycia (KARTA/MAPA); ciemne wnętrze auta + ciepły/biały obrys światła; auto
   NEUTRALNE (bez marki/tablicy). Światło: ciepłe wieczorne + biała noc + refleks lakieru. ≠ świece
   migotka, ≠ desk-setup zaklipka.
6. **archetyp hero = C (karta nachodząca na scenę)** ⟵ produkt IMPULSOWY (Reels, ~90% mobile), a
   **scena świecącego bagażnika JEST argumentem** (efekt widoczny gołym okiem). C trzyma scenę jako
   bohatera (u góry, full-width), a **karta mikro-oferty (34,90 zł → CTA → pay-row) wjeżdża na jej
   dolną krawędź** ujemnym marginesem → fold z ceną na mobile. **≠ archetyp A migotka (bezpośrednio
   poprzedni)** — A byłby idealny (scena=argument), ale jest zajęty; C oddaje ten sam immersyjny efekt,
   dokładając twardy fold cenowy. `archetyp-hero: C`
7. **sygnatura wydawnicza = „ŚWIETLNA LINIA OBRYSU" (S3-var)** ⟵ motyw = świetlny obrys bagażnika:
   ciągła **cienka linia 1px z subtelnym blaskiem** (echo listwy LED) obejmująca/przecinająca sekcje,
   miejscami rozjaśniona/„zapalona" w akcencie; powtórzona świadomie w ≥3 sekcjach (hero baseline,
   rozwiązanie, demo, dividery). Editorial/materiałowa; **charakter świetlny** (⛔ nie odręczny swash).
   ≠ sygnatura migotka.
8. **dobór i KOLEJNOŚĆ sekcji** ⟵ ciężar dowodowy: hook(auto+wow)→trust→ból(ciemny bagażnik, bez
   produktu)→ulga(otwierasz→świeci)→SPEKTRUM zastosowań→JAK zamontować (TOR-I)→wybór koloru (TOR-I
   flagowa)→korzyści z kotwicą→uczciwe porównanie→mid-cta→dowód(opinie+UGC)→oferta+kasa→FAQ→final.
   Pełen MANIFEST niżej.

---

## MANIFEST SEKCJI

> Format kanoniczny: `` N. `id | typ | status` — opis `` (build) / `` N. `id | typ | blokada-tomek — powód` ``.
> Rdzeń `hero · zamow · final · mid-cta` = build. **Klasa DOWODOWA** (wideo TikTok/UGC, zdjęcia od
> kupujących) — agent NIE MA prawa `SKIP`; brak materiału → `blokada-tomek` (decyzja „sekcji nie
> będzie" wyłącznie Tomka).

1. `hero | scenowa | build` — archetyp **C**; GÓRA: pełnoszeroka scena świecącego bagażnika (auto nocą, ciepły/biały obrys wokół ramy). DÓŁ: karta mikro-oferty (34,90 zł → `.btn.cta` „Zamawiam" → pay-row) NACHODZĄCA ujemnym marginesem + pas trust NAD foldem (COD/14 dni/z Polski/12V). Mobile: scena ~45svh → hook big-type (H1 ≥38px) → karta oferty nachodząca (cena+CTA @750). ⛔ ★/liczby opinii nad foldem.
2. `zaufanie | kodowa | build` — pas redukcji ryzyka: **płatność przy odbiorze · zwrot 14 dni · wysyłka z Polski · 12 V — pasuje do każdego auta**. Ikony charcoal, trust-pill jeden styl. Separator anty-szew hero↔problem.
3. `problem | scenowa | build` — **BÓL BEZ produktu**: ciemny bagażnik nocą, ktoś świeci telefonem-latarką w zębach, szuka po omacku, gubi drobiazgi. ⛔ zero naszej listwy w kadrze; seed jawnie wyklucza produkt.
4. `rozwiazanie | scenowa | build` (ANIM) — produkt WCHODZI jako ulga: **podnosisz klapę → świetlny obrys sam się zapala** (auto-czujnik); ciepłe/białe światło zalewa strefę ładunkową. Nośnik ruchu: liście/gałąź nad podjazdem + zapłon światła.
5. `zastosowania | scenowa | build` — **SPEKTRUM (F0.6b, ≥2 funkcje): mozaika 4–5 użyć** — zakupy po zmroku (widzisz, co pakujesz) · szukanie drobiazgów na ciemnym parkingu · ozdobny „wow"-obrys (car-look) · biwak/tailgate wieczorem · elastyczne poprowadzenie (dach panoramiczny/progi — op.[5]). Realne kadry galerii jako kafle.
6. `demo | scenowa | build` **(TOR-I)** — „jak zamontujesz" 1-2-3: **(1) wepnij 2-żyłowy przewód w oryginalną lampę klapy → (2) wciśnij/wklej silikonową taśmę wzdłuż ramy → (3) dotnij nadmiar — gotowe, otwierasz i świeci.** Stany per krok na makietach F2. Montaż bezinwazyjny.
7. `kolor | scenowa | build` **(TOR-I flagowa)** — **przełącznik Biały ↔ Ciepły biały**: scena bagażnika zmienia barwę światła → rozbraja „którą barwę wybrać", pokazuje swatch (oba 34,90 zł). Interakcja flagowa (F5).
8. `korzysci | kodowa | build` — cechy→korzyści **z KOTWICĄ** (ikony charcoal, bento NIErówne): auto-czujnik (samo świeci — op./instrukcja) · silikon elastyczny, **cięty na długość** (każde auto) · **montaż bezinwazyjny** (wpięcie w lampę, bez wiercenia) · **wodoodporny** · biały/ciepły · **DC 12 V** (uniwersalne). ⛔ zero RGB/pilota/„X diod".
9. `porownanie | kodowa | build` — uczciwie: **Lśnik (auto-obrys) vs latarka telefonu / doraźna lampka**; JEDEN realny minus (Z5): przy niektórych autach docinasz / nie obejmie 1:1 ramy (op.[5]) — elastyczna, docinasz na długość; instrukcja oryginalna po chińsku (damy PL — op.[4]).
10. `mid-cta | scenowa | build` (ANIM) — **DEDYKOWANA sekcja CTA** z zaprojektowanym `.btn.cta`; scena wieczorny podjazd, bagażnik świeci, ładunek; „Zamów Lśnika — 34,90 zł, za pobraniem".
11. `dowod | kodowa | build` — **opinie** (5 treści EN VERBATIM) + `review_stats` **★4,6/5 · 16 ocen POD foldem** + **ZDJĘCIA OD KUPUJĄCYCH 5★** (rev0 in-use biały · rev2 unboxing · rev1 pudełko — DOWODOWA, materiał JEST = build) + rząd **galerii produktu** (kadry kurowane g5/g0/g3/g1 po CROP, `lightbox@1`). Uczciwie: op.[4]/[5].
12. `zamow | kodowa | build` — `#zamow` = **moduł checkout-inline** (skórka tokenami; wrapper `data-zc-product` ORAZ `data-zc-api`; kontener ≥860 px); **cena 34,90 zł**, **swatch koloru (Biały/Ciepły biały)**, COD, packshot F3 (zwój + montaż); zaprojektowany `.btn.cta`; kolejność cena→CTA→redukcja ryzyka.
13. `faq | kodowa | build` — `faq-accordion@1` + slot media (sticky packshot): „pasuje do mojego auta?" (elastyczna, cięta) · „montaż trudny?" (bezinwazyjny, wpięcie w lampę, instrukcja PL) · „biały czy ciepły?" (Twój wybór, ta cena) · „świeci sama?" (auto-czujnik) · „wodoodporna?" (tak) · „jakie zasilanie?" (12 V — każde auto). Ikony +/− charcoal.
14. `final | scenowa | build` (ANIM) — FINAL CTA: **życie z produktem** (wieczorny podjazd, bagażnik świeci ciepło, ładujesz zakupy/rower), zaprojektowany `.btn.cta` „Zamawiam Lśnika".
15. `wideo | kodowa | blokada-tomek — protokół wyczerpania: ali_snapshot.video_url=null; jedyny klip = źródłowy TikTok @blazexel (467k) POKAZUJE produkt, ale surowy, z wypalonym „Dynamic trunk lights" + logo Changan + chińska tablica → niezdatny (prawa/branding); videos_curated „brak czystego wideo" → efekt dynamiczny oddany animacją hero (F5); własny klip do pozyskania = kamień TOMKA (WIDEO.md — klasa dowodowa, agent bez prawa SKIP).`

**Nie-sekcje (moduły):** `sticky-buy@1` (mobile) · `footer@1`.
**Sekcje TOR-I:** `demo` (#6 montaż 1-2-3) · `kolor` (#7 przełącznik biały↔ciepły — interakcja flagowa).
**BUILD z makietą d+m:** 1–14 (14 sekcji). **blokada-tomek (bez makiety):** `wideo`.

---

## SZKIELET CTA (bramkowany — gate `cta`; ≥4 `[data-checkout]` + dedykowana mid-CTA + final)

| # | miejsce | typ CTA | etykieta | uwaga makiety |
|---|---|---|---|---|
| 1 | **hero** (#1) | karta oferty nachodząca: cena → `.btn.cta` → pay-row | „Zamawiam — 34,90 zł" | ZAPROJEKTOWANY CTA w kadrze |
| 2 | **mid-cta** (#10) | DEDYKOWANA sekcja z `.btn.cta` + cena | „Zamów Lśnika" | scena + realny button (re-CTA desktop) |
| 3 | **zamow** (#12) | checkout-inline (`data-zc-*`) + `.btn.cta` + swatch | „Kup teraz — płacę przy odbiorze" | cena→CTA→redukcja ryzyka |
| 4 | **final** (#14) | `.btn.cta` na scenie życia z produktem | „Zamawiam Lśnika" | zaprojektowany CTA w kadrze |
| 5 | **sticky-buy@1** (mobile) | pasek dolny: cena + `.btn.cta` | „34,90 zł · Zamów" | moduł, re-CTA (IO po hero) |

Makiety `hero · #zamow · mid-cta · final` MUSZĄ nieść ZAPROJEKTOWANY `.btn.cta` (kształt/kontrast/
etykieta akcji, strefa pod cenę, kolejność cena→CTA) — inaczej REGEN makiety.

---

## FUNKCJE KONWERSJI
- Message-match `?h=N` (HOOKS 1–3: auto-światło+wow / ból-po-omacku / premium-obrys) — podmiana h1+sub.
- `#zamow` checkout-inline platformy (COD) + **swatch koloru**, sticky-buy mobile, mid-CTA dedykowana, re-CTA desktop.
- Trust nad foldem: COD + zwrot 14 dni + z Polski + 12V/każde auto (⛔ ★/liczby opinii nad foldem).
- TOR-I: demo montaż 1-2-3 (stany) + `kolor` przełącznik biały↔ciepły (flagowa, rozbraja wybór barwy).
- Uczciwe porównanie + FAQ (realne minusy) = redukcja ryzyka > social-proof (lęk #1 = scam).
- JSON-LD Offer (34,90 zł, PLN) + AggregateRating (4,6/16) — structured data (nie nad foldem wizualnie).

---

## ANTY-MISMATCH (CLAIM → ŹRÓDŁO) — każda korzyść niesie kotwicę; brak = CUT

| CLAIM (copy) | ŹRÓDŁO / KOTWICA (KARTA-PRAWDY) |
|---|---|
| „otwierasz klapę — bagażnik sam wita Cię światłem" | opis „lights up upon opening… auto off when closing" + instrukcja rev2 „开箱即亮" + g3 „induction" (§2b/§3 RDZEŃ USP) |
| „świetlny obrys wokół całej ramy — ciepły lub biały" | galeria g0–g4 (światło biegnie wokół ramy) + `variants` (2M White/Warm) (§2b/§4) |
| „elastyczna, docinasz na długość swojego auta" | opis „flexible soft tube… bend without breaking" + instrukcja rev2 (cięcie) + op.[5] (§2b/§3) |
| „montaż bezinwazyjny — wpinasz w oryginalne światło, bez wiercenia" | opis „wiring free" + pudełko rev1 „non-destructive invisible installation" (§2b/§3) |
| „nie boi się deszczu — wodoodporna" | opis „Waterproof Design… rain, splashes" (§2b/§3) |
| „12 V — pasuje do każdego auta" | instrukcja rev2 „DC 12V" (§2b) |
| „widzisz, co pakujesz i wyjmujesz po zmroku" | opis „bright light… spot and retrieve items in low-light" + g0 (§3) |
| „★ 4,6 / 5 · 16 ocen" | `review_stats` (§5) — POD foldem |
| ⛔ **CUT / ZAKAZ** | RGB/tęcza/„16 mln kolorów", pilot/apka/Bluetooth/tryby, „X diod"/adresowalne piksele, 4M (poza marżą), wymiary/waga/lumeny/W (brak danych), „sold" jako licznik, marka „Changan"/tablica, nazwa sprzedawcy |

---
*Konsumenci planu: F1.7 (`PRZEWODNIK-GRAFICZNY.md` — casting/świat/osie) · F2.5 (`TOKENS-MAKIETY.md`
— partytura hexami) · F2 (briefy makiet) · F4 (koder). Źródło faktów = `KARTA-PRAWDY.md` (Z7);
zakres = `MAPA-ZASTOSOWAN.md`; wygląd = `PASZPORT.md`.*
