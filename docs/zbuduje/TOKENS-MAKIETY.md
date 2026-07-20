# TOKENS-MAKIETY — SSOT mikro-tokenów makiety (STYLE-DNA landingu)

**Status: OBOWIĄZUJE (2026-07-19, „pełny zestaw ulepszeń designu makiet" — decyzja Tomka po
syntezie 3 analiz: audyt procesu + research desktop + research mobile).** Jeden plik na landing
codyfikuje DNA wizualne jako TWARDE tokeny tekstowe. Powód powstania: makiety A/B/C jednego
landingu dryfowały (inny styl ikon outline↔filled, trust-pill raz biały raz amber, różne
radiusy galeria vs demo, amber rozlany poza CTA) — bo „STYLE-DNA z głowy" pisano od nowa per
makieta. Tokeny domykają ten dryf SYSTEMOWO: jedno źródło, wstrzykiwane do KAŻDEGO promptu.

**AKTUALIZACJA 2026-07-20 — PODZIAŁ NA KANON I PARTYTURĘ (decyzja Tomka po audycie 4 gotowych
landingów).** Audyt dał werdykt **masażer ↔ Drapek = 9/10** w skali „jak bardzo wyglądają jak ta
sama strona z podmienionym produktem" — oba najnowsze, oba PO doktrynie z 19.07. Wniosek: ten SSOT
podniósł jakość i **jednocześnie zacieśnił zbieżność**, bo traktował jako niezmienne rzeczy, które
powinny być zmienne. Cytat z audytu: *„wymiana palety i zdjęć nie wystarcza — sygnaturę robi mapa
sekcji + para font-display + kształt CTA"*. Ten plik dzieli się odtąd na **KANON** (poziom
warsztatu, nietykalny) i **PARTYTURĘ** (tożsamość, wyprowadzana z produktu i persony per landing).

## PO CO (i dlaczego to zamyka dryf A/B/C/radius/ikon)

Bez wspólnego SSOT każda makieta sekcji dostaje własną, lekko inną interpretację palety, fontów,
radiusa i ikon → strona wygląda jak sklejona z 3 projektów. TOKENS-MAKIETY.md = **jeden akapit
STYLE-DNA**, identyczny w prompcie hero, każdej sekcji i każdej pary mobile → wszystkie generacje
dzielą DOKŁADNIE te same hexy, role, radius, styl ikon i trust-pill. Koniec z „kafle demo
kwadratowe, galeria xl", „ikona korzyści outline, ikona materiału filled", „trust-pill raz
kremowy raz pomarańczowy".

**To jest źródło akapitu „STYLE-DNA tekstowe w KAŻDYM prompcie" (STANDARD §F2)** — nie duplikat,
tylko jego JEDYNE, wypełnione konkretami źródło. Wcześniej ten akapit składano ad-hoc; teraz
pochodzi z tego pliku 1:1.

---

## 🎼 KANON vs PARTYTURA (rdzeń doktryny, 20.07)

Dwie warstwy o RÓŻNYM statusie. Mylenie ich było źródłem zbieżności 9/10: fabryka broniła obu
tak samo twardo, więc wariancja uciekła w miejsca, które nic nie zmieniają (odcień kremu,
wartość radiusa), a rzeczy decydujące o rozpoznawalności (mapa sekcji, para fontów, kształt
i kolor CTA, archetyp hero) były de facto zamrożone.

### KANON — POZIOM WARSZTATU, nietykalny, IDENTYCZNY w każdym landingu
To NIE jest szablon wyglądu. To jest zestaw rzeczy, które odróżniają robotę seniora od roboty
amatora — i dlatego nie podlegają „unikatowości" (Z6 nie zwalnia z rzemiosła):
- **rytm 8pt** — drabina `8·16·24·32·48·64·96`, wszystkie odstępy z niej; hojny whitespace
  (padding sekcji desktop 96–128 / mobile 64–80); szerokość treści ~1160–1200, kolumna 50–75 znaków.
- **skala typograficzna z KONTRASTEM** — modularna (1.333, 1.5 dla wielkiego H1), H1 desktop
  56–80px, **H1 mobile floor 36–40px**, body 16–18/lh 1.5–1.6.
- **JASNE TŁA** — twarda reguła anty-scam (persona: lęk #1 = oszustwo). ⛔ ciemne tła, ⛔ neon.
  **ALE „jasne" ≠ „kremowe"** — patrz rodzina dozwolona w §2 (krem, kość słoniowa, piasek,
  glina/terakota rozbielona, chłodna biel, blady szałwiowy, bladoróżowy, jasny błękit).
  Warunek KANONU: wysoka jasność + niskie nasycenie + WCAG dla body. Rodzina = partytura.
- **≤3 kolory i DOKŁADNIE JEDEN akcent** w całym landingu, ze scope'em twardym
  {CTA · sygnatura/swash · gwiazdki ★}. Ikony funkcjonalne ZAWSZE `--ink`. **KTÓRY to kolor
  = partytura.**
- **para fontów z KONTRASTEM** — display i text MUSZĄ być różnymi krojami o różnym charakterze.
  ⛔ mono-font (jeden krój na wszystko), ⛔ zimny tech jako JEDYNY krój. **KTÓRE kroje = partytura.**
- **jeden radius serii · jeden styl ikon (filled|outline) · jeden styl trust-pill** — trzymane
  we wszystkich sekcjach i w OBU viewportach.
- **cienie CIEPŁE/miękkie** (warstwowe key+ambient, tint sepiowy — nie czysta czerń) + **grain 2–4%**.
- **mechanika modułów kanonicznych** (`moduly/MODULY.md`) — proporcje i JS NIETYKALNE; moduł
  skóruje się tokenami.
- **hierarchia oferty** — cena → CTA → redukcja ryzyka; pas zaufania obecny;
  ⛔ ★/liczby opinii nad foldem.
- **ISTNIENIE sygnatury wydawniczej** — powtarzalny detal spinający cały landing musi być.
  **JAKI to detal = partytura** (§8).

### PARTYTURA — TOŻSAMOŚĆ, wyprowadzana z PRODUKTU i PERSONY, inna w każdym landingu
Każda pozycja MUSI mieć **jawne uzasadnienie w `PLAN.md`** („dlaczego TEN produkt/persona
prowadzi do TEJ decyzji") — decyzja bez uzasadnienia = decyzja z przyzwyczajenia:
| pozycja | zapis | źródło decyzji |
|---|---|---|
| rodzina fontu **display** | `--font-display` | charakter produktu (miękki/techniczny/rzemieślniczy) |
| rodzina fontu **tekstowego** | `--font-text` | czytelność + kontrast do display |
| **kolor akcentu** | `--cta` | **wolno (i ZALECA SIĘ) wyprowadzić z realnego koloru produktu** |
| **rodzina tła** | `--paper*` | świat produktu (kuchnia/łazienka/warsztat/sypialnia) |
| materiał/tekstura świata, nastrój, pora dnia | seedy F1.7 | persona + kontekst użycia |
| **archetyp hero** | `archetyp-hero:` w `PLAN.md` | biblioteka archetypów (STANDARD §F2 pkt 2) |
| **dobór i KOLEJNOŚĆ modułów sekcji** | plan F1 | ciężar dowodowy produktu, nie nawyk |
| **detal pełniący rolę sygnatury** | §8 niżej | motyw przewodni |

**⚠️ ODCHYLENIE PER PRODUKT W OBRĘBIE PARTYTURY NIE JEST DEFEKTEM I NIE WOLNO GO „NAPRAWIAĆ"
DO NORMY.** Landing z fontem display innym niż poprzedni, akcentem w zieleni butelkowej i tłem
piaskowym nie jest „rozjechany" — jest ZGODNY z doktryną. Cofanie do wartości z poprzedniego
landingu wolno stosować **wyłącznie wobec KANONU**. Precedens do niepowtarzania: 19.07 cofnięto
body `#4B504A` → `#33281F` z uzasadnieniem „mglisty" — poprawna była tylko część o kontraście
(KANON: WCAG), nie część o odcieniu (PARTYTURA).

**Kontrola:** różnicę między landingami egzekwuje maszynowo `gate-check.py` blok
**`cross_landing`** (font display · ΔE akcentu · archetyp hero · sekwencja sekcji) — patrz GATE
niżej. Osie różnorodności MIĘDZY landingami: `PRZEWODNIK-GRAFICZNY.md` §2b.

---

## KIEDY i GDZIE

- **Generowany w F2.5** (krok panelu `lp_styl_marka`), zaraz po **STYL-MASTERZE** (F2 pkt 1) —
  bo styl-master = plansza DNA (specimen: paleta z rolami, 2 fonty z rolami, swash, plusiki,
  radius, styl ikon, trust-pill, próbka głębi), z której agent SPISUJE tokeny. Kolejność:
  F1.7 przewodnik → **styl-master → TOKENS-MAKIETY.md** → hero-makieta → makiety sekcji → pary mobile.
- **Wstrzykiwany do KAŻDEGO promptu makiety** (hero, każda sekcja, każda para mobile) jako
  niezmienny akapit STYLE-DNA — obraz styl-mastera jako ref + TEN tekst razem są stabilniejsze
  niż sam obraz (STANDARD §F2 „STYLE-DNA tekstowe").
- **Per-landing (Z6):** F2.5 WYPEŁNIA tokeny konkretami TEGO landingu, **w pliku z jawnie
  rozdzielonymi sekcjami `## KANON` (przepisana 1:1 z tego SSOT) i `## PARTYTURA` (decyzje TEGO
  landingu + jednozdaniowe uzasadnienie per pozycja)**. Niezmienna jest **STRUKTURA RÓL**
  (display vs label/liczby vs body; scope jedynego akcentu; jeden radius; jeden styl ikon;
  jeden trust-pill; skala 8pt; skala typo). Zmienne per-landing są KONKRETY (oba kroje, hex
  akcentu, rodzina tła, filled|outline, sygnatura, archetyp hero) — to one dają tożsamość.
  Partytura bez uzasadnienia = F2.5 niezamknięty.
- Zapis: `FABRYKA-*/<slug>/TOKENS-MAKIETY.md`. Chip w panelu (`lp_styl_marka`, pole `tokens_url`).

---

## FORMAT (blok tokenów — F2.5 wypełnia kolumnę „konkret TEGO landingu")

Nazwy zmiennych = te same, których używają moduły kanoniczne (`moduly/*.html`: `--paper*`,
`--line`, `--ink`, `--body`, `--cta`, `--radius-lg`, `--shadow-*`) — koder wkleja `:root{}` bez
tłumaczenia nazw (spójność z modułami + z blokiem `ir.root.css` w F4).

### 1. FONTY — 2 kroje z KONTRASTEM (koniec mono-Baloo)

**KANON = kontrast pary. PARTYTURA = konkretne kroje.** ⛔ „Baloo 2 bo zawsze" — Baloo 2 nie jest
już domyślną: to JEDNA z możliwych odpowiedzi, a po masażerze i Drapku (oba Baloo 2) obciążona
dowodem zbieżności. **Font display MUSI się różnić od 3 poprzednio zbudowanych landingów**
(gate `cross_landing.font_display` = FAIL). Kierunek doboru: charakter produktu → charakter kroju
(domowo-miękki → zaokrąglony display · rzemieślniczy/materiałowy → serif z pazurem ·
sprzętowy/warsztatowy → ciepły grotesk kondensowany · pielęgnacyjny/kosmetyczny → display serif
z wysokim kontrastem grubości).

| token | rola | reguła (niezmienna) | konkret (F2.5 per-landing) |
|---|---|---|---|
| `--font-display` | marka / H1 / H2 / duże liczby-jako-grafika | **KANON:** wyrazista twarz marki z czytelną osobowością, różna od `--font-text`. **PARTYTURA:** rodzina kroju — uzasadniona charakterem produktu, ≠ 3 poprzednie landingi | np. „Fraunces 700/800" |
| `--font-text` | **eyebrow · LICZBY · CENY · wymiary · długie akapity · label UI** | **KANON:** WYRAZISTY i ciepły, rozróżnialny od display na pierwszy rzut oka. **⛔ ZIMNY tech (Inter/Helvetica/Roboto/system-ui sam) = FAIL kalibracji premium.** **PARTYTURA:** humanist (Nunito Sans / Mulish / Karla) LUB ciepły grotesk kondensowany — dobrany tak, by „rymował" z display, nie powtarzał go | np. „Karla 400/600/800" |
| `--font-accent` | swash `.hi`/`.ac` (kursywny akcent pod 1 słowem) | opcjonalny 3. krój TYLKO na swash (np. Fraunces italic) — nie liczy się jako „para" | np. „Fraunces italic 500" |

**Reguła twarda (KANON):** mono-typeface (jeden krój na display+liczby+ceny+body) = **łagodny
kontrast = FAIL** (research premium 17.07). Display i text MUSZĄ być rozróżnialne na pierwszy rzut
oka. **Reguła twarda (PARTYTURA):** `--font-display` identyczny z którymkolwiek z 3 poprzednich
landingów = **FAIL gate'u `cross_landing`** — nie „ostrzeżenie smakowe", tylko blokada.

### 2. PALETA + ROLE (z REGUŁĄ scope'u jedynego akcentu)

**RODZINA TŁA = PARTYTURA (rozszerzone 20.07).** „Jasne tło" ≠ „kremowe tło". Zawężenie do kremu
było nawykiem, nie regułą — i to ono najmocniej robiło z landingów rodzeństwo. Dozwolona rodzina
jasnych, z której partytura WYBIERA jedną (i trzyma ją konsekwentnie w `--paper/-2/-3`):
**krem · kość słoniowa · piasek · glina/terakota rozbielona · chłodna biel · blady szałwiowy ·
bladoróżowy · jasny błękit.** Warunek KANONU dla każdej: **wysoka jasność + niskie nasycenie +
kontrast WCAG dla body**. ⛔ nadal: ciemne tła, neon, mocno nasycone pola pod długim tekstem.
Wybór rodziny prowadzi ŚWIAT produktu (kuchnia → kość słoniowa/glina; łazienka/pielęgnacja →
blady błękit/szałwia; warsztat/garaż → piasek; sypialnia → bladoróż/krem).

| token | rola | reguła (KANON / partytura) | konkret (F2.5) |
|---|---|---|---|
| `--paper` / `--paper-2` / `--paper-3` | tła sekcji (warstwowe: jasne→ciemniejszy odcień tej samej rodziny) | **KANON: ⛔ ZAKAZ ciemnych teł/neonu**, wysoka jasność, niskie nasycenie, WCAG dla body. **PARTYTURA: rodzina** z listy wyżej — ⛔ „krem, bo poprzedni miał krem" | np. `#F7F4EE / #EDE8DE / #E1DACB` |
| `--ink` | nagłówki + **WSZYSTKIE ikony funkcjonalne** (korzyści/materiał/kroki/lupa/FAQ +−) | prawie-czerń o temperaturze rodziny tła (ciepły grafit na kremie, chłodniejszy na błękicie); **ikona funkcjonalna NIGDY w kolorze akcentu** | np. `#2A211B` |
| `--body` | tekst akapitowy | **KANON: kontrast — ⛔ `#000` (tanio), ⛔ zbyt jasny na długiej stronie (`#6E6053` = mgła).** **PARTYTURA: odcień** — prawie-czerń dostrojona do rodziny tła (brąz / grafit / grafit-zieleń); ⛔ cofanie odcienia „do normy z poprzedniego landingu" | np. `#33281F` |
| `--line` | hairline 1px, plusiki „+", crop-marks | odcień rodziny tła przyciemniony o 2 kroki — **nie** szary neutralny | np. `#DFD3BF` |
| **`--cta`** | **JEDYNY akcent landingu** (nazwa tokena historyczna — rola: akcent, nie „amber") | **KANON — scope TWARDY: TYLKO {przycisk `.btn.cta` · swash `.hi`/`.ac` pod 1 słowem · gwiazdki ratingu ★}. NIC WIĘCEJ.** ⛔ ikony, lupa, kroki demo, materiał, trust-pill, dividery. **⛔ akcent NIE rozciąga się na LICZBĘ ratingu obok gwiazdek** („4,7/5" = `--font-text` charcoal; dryf złapany na 08/11 masażera 19.07). **PARTYTURA — KTÓRY to kolor:** patrz nota „akcent z produktu" niżej; ΔE < 15 wobec 3 poprzednich landingów = FAIL | np. `#1E6E5A` |
| `--trust-pill` | pigułka zaufania (chip „14 dni", „za pobraniem") | **KANON: JEDEN styl globalnie** = fill z rodziny tła (`--paper`) + tekst/border `--ink`. ⛔ raz biały, raz w kolorze akcentu | fill `--paper`, border `--line`, tekst `--ink` |

> **🎨 AKCENT WOLNO (I ZALECA SIĘ) WYPROWADZIĆ Z REALNEGO KOLORU PRODUKTU (20.07 — najostrzejszy
> dowód z audytu).** Do 19.07 doktryna robiła coś dokładnie odwrotnego: gdy fabryka wyprowadziła
> kolor z produktu, natychmiast usuwała go z interfejsu. Tokeny masażera niosły JAWNY ZAKAZ —
> `--green` *„appears ONLY in the product photography and in the logo, **never as a UI accent**"* —
> więc jedyny kolor pochodzący z produktu był z UI wykluczony, a UI dostawało ten sam amber co
> poprzedni landing. **Ta reguła jest USUNIĘTA.** Odtąd: kolor produktu (lub jego kontrolowana
> pochodna: przyciemniona/nasycona wersja tej samej rodziny) jest **preferowanym** kandydatem na
> `--cta`, bo daje akcent, którego żaden inny produkt nie ma. Warunki KANONU zostają w mocy:
> to nadal **DOKŁADNIE JEDEN** akcent, w tym samym twardym scope, z kontrastem WCAG dla tekstu na
> przycisku (`--cta-ink` dobierany do akcentu, nie odwrotnie) i czytelny na wybranej rodzinie tła.
> Gdy kolor produktu jest nieużywalny jako akcent (achromatyczny, zbyt jasny, zlewa się z tłem) —
> partytura wybiera kolor z sąsiedztwa świata produktu i **zapisuje w `PLAN.md`, dlaczego nie z
> produktu**. ⛔ „amber bo ciepły" bez uzasadnienia = decyzja z przyzwyczajenia.

> **Nota spójności z kodem:** STANDARD §3 (l. „NIE zmieniać samego tokena `--cta`") zabrania
> REMAPOWANIA wartości `--cta` w trakcie budowy (dzielą go węzły, które historycznie były ciepłe).
> To reguła KODU (nie mutuj żywego tokena). Amber-scope to reguła DESIGNU MAKIETY: **na nowej
> makiecie ikony funkcjonalne od początku są rysowane w charcoal (`--ink`), więc nie odwołują się
> do `--cta` w ogóle** — sprzeczności brak. Przykład dryfu do wyeliminowania: FAQ +/− na `--blush`
> (moduł `faq-accordion@1`) → nowa makieta/skóra rysuje +/− w `--ink`.

### 3. GŁĘBIA — warstwowe CIEPŁE cienie + grain (koniec jednego czarnego cienia)

| token | reguła | konkret (F2.5) |
|---|---|---|
| `--shadow-sm` / `--shadow-md` / `--shadow-lg` | **3-4 warstwy: key przy krawędzi + ambient miękki**, tint **brązowo-sepiowy** `rgba(80,50,20,α)`, α **0.06–0.12**. ⛔ jeden twardy `0 10px 30px rgba(0,0,0,.3)` = tanio | np. `0 1px 2px rgba(80,50,20,.06), 0 8px 24px rgba(80,50,20,.10)` |
| `--grain` | subtelny grain/noise **2–4%** na tłach papieru (dowolna rodzina jasnych) = analogowe ciepło; SVG `feTurbulence` opacity ≤`.05`, JEDNO źródło (nie PNG) | `feTurbulence baseFrequency ~.9, opacity .04` |

### 4. RADIUS — jeden dla całej serii

| token | reguła | konkret (F2.5) |
|---|---|---|
| `--radius-lg` (+ `--radius-sm` dla drobnych) | **JEDEN radius serii** na wszystkich kartach/media/galerii/demo/kaflach. ⛔ galeria xl + demo kwadrat (dziś rozjazd) | np. `--radius-lg:20px; --radius-sm:12px` |

### 5. STYL IKON — filled ALBO outline (jeden, trzymany wszędzie)

| token | reguła | konkret (F2.5) |
|---|---|---|
| `--icon-style` | **WYBÓR: `filled` LUB `outline`** — trzymany w OBU viewportach i we WSZYSTKICH sekcjach. Rozjazd (outline↔filled między sekcjami / desktop↔mobile) = regeneracja. Kolor = `--ink` (charcoal), NIE amber | np. `outline, stroke 1.75px, --ink` |

### 6. SKALA 8pt (rytm + hojny whitespace = luksus)

| token | reguła | konkret (F2.5) |
|---|---|---|
| `--s1..--s7` | twarda siatka **8/16/24/32/48/64/96px** — wszystkie odstępy z tej drabiny (koniec 58px ad-hoc) | `8·16·24·32·48·64·96` |
| padding sekcji | desktop **96–128px**, mobile **64–80px** między głównymi sekcjami | `--sect-pad-d:112px; --sect-pad-m:72px` |
| szerokość treści | **~1160–1200px**; kolumna tekstu **50–75 znaków** | `--content-w:1180px` |

### 7. SKALA TYPO (modularna)

| token | reguła | konkret (F2.5) |
|---|---|---|
| skala | **Perfect Fourth 1.333** (Fifth 1.5 dla wielkiego H1) | ratio 1.333 |
| `--h1-d` / `--h1-m` | H1 desktop **56–80px**; **H1 mobile FLOOR 36–40px** (dziś 31px = za skromnie = FAIL) | `clamp(38px,8vw,72px)` |
| `--body-fs` | body **16–18px**, line-height **1.5–1.6** | `17px / 1.55` |
| eyebrow | ALL-CAPS, tracking **0.2em**, `--font-text`, `--ink` | — |

### 8. SYGNATURA WYDAWNICZA — powtarzalny detal spinający landing (PARTYTURA)

**KANON:** sygnatura MUSI istnieć — jeden detal, powtórzony świadomie w ≥3 sekcjach, który robi
wrażenie „to jest projekt, nie skład". **PARTYTURA: KTÓRY detal.** Wybór jeden (max dwa
współgrające), zapisany w tokenach + uzasadniony motywem przewodnim w `PLAN.md`:

| # | sygnatura | jak wygląda | pasuje do |
|---|---|---|---|
| S1 | **swash kursywny** | kursywny serif pod JEDNYM słowem nagłówka (`.hi`/`.ac`) | produkty domowe, pielęgnacja, „miękkie" korzyści |
| S2 | **plusiki `+` w rogach** | znaczniki 1px w narożnikach kart/sekcji (crop-marks) | techniczne, precyzyjne, „inżynierskie" |
| S3 | **hairline-ramka** | ciągła linia 1px obejmująca treść sekcji z marginesem | editorial, katalogowe, materiałowe |
| S4 | **stempel/pieczęć** | okrągły lub kątowy znak z mikro-typografią (gwarancja, „testowane") | rzemieślnicze, zaufanie jako oś |
| S5 | **numeracja krokowa** | duże cyfry-jako-grafika WEWNĄTRZ sekcji (demo 01/02/03) — ⛔ NIGDY numeracja sekcji „01/12" | produkty z procesem/instrukcją |
| S6 | **znacznik-rożek** | trójkątny/ścięty narożnik na kartach i mediach, zawsze z tej samej strony | sprzętowe, „mocne", warsztatowe |
| S7 | **podkreślenie-marker** | nieregularne, ręczne podkreślenie pod frazą (SVG stroke) | lifestyle, impuls, ciepłe |
| S8 | **taśma/taped-photo** | zdjęcia „przyklejone" narożnikiem, lekki obrót ≤2° | UGC-first, opinie jako oś |

⛔ Sygnatura identyczna z poprzednim landingiem przy JEDNOCZEŚNIE tym samym archetypie hero =
regeneracja; obie pozycje są w partyturze po to, żeby się rozjeżdżać.

### 9. ARCHETYP HERO (PARTYTURA — pełna biblioteka w STANDARD §F2 pkt 2)

Token informacyjny (nie CSS): `archetyp-hero: <litera>` — kopiowany do `TOKENS-MAKIETY.md`
z `PLAN.md`. **Reguła twarda: archetyp NIE MOŻE powtórzyć archetypu bezpośrednio poprzedniego
zbudowanego landingu** (gate `cross_landing.archetyp`). Biblioteka A–H, opis układów i dobór pod
typ produktu: `STANDARD-LANDING-SKLEPY.md` §F2 pkt 2 „BIBLIOTEKA ARCHETYPÓW HERO".

---

## PRZYKŁAD WYPEŁNIONY (ilustracja — F2.5 podmienia na konkrety landingu)

**Plik per-landing MA mieć te dwa nagłówki — sekcja KANON przepisana bez zmian, sekcja PARTYTURA
z uzasadnieniem przy KAŻDEJ pozycji (F2.5 nie zamyka się bez uzasadnień).**

```
## KANON  (przepisane 1:1 — identyczne w każdym landingu)
8pt:     8·16·24·32·48·64·96 · sekcja desktop 112 / mobile 72 · content-w 1180 · kolumna 50–75 zn.
TYPO:    ratio 1.333 · H1 desktop clamp 56–80 · H1 mobile floor 38 · body 17/1.55 · eyebrow caps 0.2em
TŁO:     jasne (wysoka jasność, niskie nasycenie, WCAG dla body) · ⛔ ciemne tła, ⛔ neon
AKCENT:  DOKŁADNIE JEDEN, scope {CTA · swash · gwiazdki ★} · ikony funkcjonalne = --ink
FONTY:   para z KONTRASTEM (display ≠ text) · ⛔ mono-font · ⛔ zimny tech jako jedyny krój
SERIA:   jeden radius · jeden styl ikon · jeden styl trust-pill (desktop == mobile)
GŁĘBIA:  cienie warstwowe CIEPŁE (key+ambient, tint sepiowy .06–.12, nie czerń) · grain 2–4%
OFERTA:  cena → CTA → redukcja ryzyka · pas zaufania · ⛔ ★/liczby opinii nad foldem
MODUŁY:  mechanika i proporcje z MODULY.md NIETYKALNE (skóra = tokeny)
SYGNATURA: musi istnieć i powtarzać się w ≥3 sekcjach

## PARTYTURA  (decyzje TEGO landingu — każda z uzasadnieniem)
display   = Bricolage Grotesque (700/800)   ⟵ produkt sprzętowy, kanciasty profil obudowy
text      = Karla (400/600/800)             ⟵ humanist, wąskie cyfry — długa tabela specs
accent(swash) = Fraunces italic (500)
--paper   #F2F4F1 / #E8ECE6 / #DCE3D9       ⟵ rodzina BLADY SZAŁWIOWY: świat łazienki/pielęgnacji
--ink     #22271F   --body #2E3529   --line #CBD4C6
--cta     #1E6E5A                           ⟵ WYPROWADZONY z realnego koloru produktu (butelkowa
                                               zieleń obudowy); --cta-ink #FFFFFF (WCAG 5.4:1)
--shadow-md  0 1px 2px rgba(30,50,40,.06), 0 10px 26px rgba(30,50,40,.10)
--radius-lg 20px / --radius-sm 12px  ·  IKONY: outline 1.75px, --ink
sygnatura = S2 plusiki „+" w rogach     ⟵ produkt precyzyjny; poprzedni landing miał S1 swash
archetyp-hero = D (packshot centralny)  ⟵ ≠ archetyp poprzedniego landingu (B split)
```

---

## GATE (egzekucja)

- **F2.5 zamknięty dopiero z TOKENS-MAKIETY.md** — plik obowiązkowy artefaktu `lp_styl_marka`
  (chip w panelu). Docelowo w `files.wymagane` gate-check + reguła w `panel_sync doc_wymagane`
  (analogicznie do `WIERNOSC.md`): brak pliku = FAIL fazy. **Dopisać wiersz w `gate-manifest.json`
  ZANIM tokeny wejdą na stałe do fabryki** (patrz STANDARD §1: nowy artefakt bez wiersza w
  manifeście = etap niekompletny) — to jedyna zmiana KODU/konfiguracji poza docs, świadomie
  wydzielona do osobnego przebiegu.
- **KRYTYK makiet (F2, przed akceptem)** sprawdza zgodność KAŻDEJ makiety z tokenami — checklista
  STYLE-DNA (STANDARD §F2, bullet „🎯 STYLE-DNA MAKIET"): para fontów z realnym kontrastem?
  akcent tylko CTA+swash+rating (ikony charcoal)? jeden styl ikon i jeden radius w całej serii?
  jeden styl trust-pill? głębia = warstwowe ciepłe cienie? **czy ten landing dałoby się pomylić
  z poprzednim — na których osiach się różni?** Rozjazd **KANONU** na makiecie = regeneracja
  makiety (nie łatanie kodem — Z2). Odchylenie w **PARTYTURZE** = zamierzone, **nie regeneruj**.
- **🔒 GATE CROSS-LANDING (20.07) — `gate-check.py` blok `cross_landing`, progi w
  `gate-manifest.json`.** Porównuje budowany landing z **N=3 poprzednio zbudowanymi**
  (kolejność = czas modyfikacji `sklepy/tomek-niedzwiecki/<slug>/index.html`):
  - `--font-display` identyczny z którymkolwiek z 3 poprzednich → **FAIL**
  - **ΔE (CIE76/Lab) koloru akcentu < 15** wobec któregokolwiek z 3 poprzednich → **FAIL**
  - **archetyp hero** identyczny z BEZPOŚREDNIO poprzednim → **FAIL** (źródło: linia
    `archetyp-hero: <litera>` w `PLAN.md`)
  - **sekwencja `<section id>`** podobna w >80% (LCS-Dice, po normalizacji aliasów) do
    bezpośrednio poprzedniego → **WARN** (nie FAIL — rdzeń sekcji bywa wymuszony produktem,
    ale >80% to sygnał, że plan F1 poszedł z nawyku)
  Brak poprzedników / brak danych (nie wykryto fontu, brak `PLAN.md`) = **SKIP**, nie crash.
  To jest domknięcie asymetrii wykrytej w audycie 20.07: fabryka miała pełen aparat wykrywający
  ZA MAŁO spójności (SSOT + STYLE-DNA w każdym prompcie + checklista krytyka + „rozjazd tokenu =
  regeneracja") i **ZERO mechanizmu wykrywającego ZA MAŁO różnicy** — `gate-check.py` był
  w całości zakotwiczony w jednym slugu, a phash near-dup działał tylko WEWNĄTRZ landingu.

---

## GRANICE (czego tokeny NIE robią)

- Nie zastępują **makiety** (Z2 — makieta jest święta); tokeny to WSPÓLNY słownik stylu, makieta
  to konkretny layout sekcji.
- Nie łamią **Z6** — wspólny jest KANON (struktura ról + poziom warsztatu), różna PARTYTURA.
  Dwa landingi z tą samą strukturą ról, ale inną parą fontów, inną rodziną tła, innym akcentem
  i innym archetypem hero = poprawnie unikatowe. **Ta sama partytura w dwóch landingach = defekt,
  nawet gdy każdy z osobna jest ładny** (werdykt audytu 20.07: masażer ↔ Drapek 9/10).
- Nie ruszają **mechaniki modułów** (`MODULY.md`) — moduł skóruje się TOKENAMI, proporcje i JS
  nietykalne. Tokeny to skóra, moduł to szkielet.
- Wszystko MUSI mieścić się w **poziomie warsztatu = KANON**: jasne tło (rodzina dowolna z listy),
  DOKŁADNIE JEDEN akcent w twardym scope, para fontów z kontrastem, rytm 8pt, ciepła głębia,
  hierarchia oferty. ⛔ ciemne tła, neon, mono-font, zimny tech jako jedyny krój, >3 kolory,
  ★/liczby opinii nad foldem (persona lęk #1 = scam — redukcja ryzyka > social proof; STANDARD §4).
  **„Clinical-warmth" NIE jest już opisem obowiązkowej palety** (krem+amber+display zaokrąglony) —
  to była PARTYTURA udająca KANON i to ona zrobiła rodzeństwo. Obowiązkowy jest poziom rzemiosła,
  nie konkretny nastrój.

---

## POWIĄZANIA
- **STANDARD-LANDING-SKLEPY.md** — **Z6 (główne zasady, nie szablon — egzekwowane przez PARTYTURĘ
  i gate cross-landing)**, §F2 (STYL-MASTER pkt 1 = plansza DNA → tokeny; **pkt 2 = BIBLIOTEKA
  ARCHETYPÓW HERO**; bullet „🎯 STYLE-DNA MAKIET" = reguły + checklista KRYTYKA; F2.4 pary),
  §2 ZASADY WIZUALNE (allow-lista akcentu, DNA typograficzne), §5 (budżet fontów: 2 kroje),
  §1 mapa faz (`lp_styl_marka`).
- **PRZEWODNIK-GRAFICZNY.md** (F1.7) — karta sekcji nosi detale UI (ikony charcoal/akcent,
  trust-pill, mikro-interakcja, hero ostra fotografia, FAQ media), formalizowane tu w F2.5;
  **§2b OSIE CROSS-LANDING** = 3 z 5 osi różnicy wobec poprzedniego landingu.
- **gate-check.py / gate-manifest.json** — blok `cross_landing` (progi jako DANE:
  `n_poprzednich`, `delta_e_min`, `sekwencja_pct_warn`).
- **moduly/MODULY.md** — nazwy tokenów = kontrakt skórowania modułów; `faq-accordion@1` ma slot
  `.faq-media` (użyć — koniec „gołego akordeonu").
- **SEKCJA-Z-MAKIETY.md** (F4) — `ir.root.css` wkleja `:root{}` z tymi tokenami 1:1 (zakaz
  re-aproksymacji zmierzonych wartości).
