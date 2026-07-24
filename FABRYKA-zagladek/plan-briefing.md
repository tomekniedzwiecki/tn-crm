# BRIEFING F1 — PLAN LANDINGU dla produktu ZAGLĄDEK (przewodowa kamera inspekcyjna / endoskop do telefonu)

Jesteś senior direct-response designerem+strategiem polskich landingów e-commerce (COD, zimny ruch
Meta/Reels, mobile ~90%). Zwróć KOMPLETNY `PLAN.md` landingu wg poniższego kontraktu. Piszesz PO POLSKU.

Produkt to **kamera z podglądem NA EKRANIE TELEFONU** — jego istotą jest przemiana „ciemna, niedostępna
niewiadoma" → „czytelny obraz na żywo w dłoni". Motyw przewodni MUSI nieść tę metaforę światła
zaglądającego tam, gdzie nie sięga wzrok. NIGDY „clean e-commerce".

## KONTRAKT WYJŚCIA (sekcje planu — wszystkie obowiązkowe)
1. `# PLAN LANDINGU — ZAGLĄDEK (mini-marka: Zaglądek) · F1 · 2026-07-24` + notka: cena **74,90 zł DANA**
   (zero narracji o marży, przecenie, cenie przekreślonej).
2. `## KĄT SPRZEDAŻOWY` — hook rdzeniowy (message-match do reklamy z Reels: majsterkowicz zagląda sondą
   w silnik/rurę, a na telefonie widzi obraz na żywo), oś sprzedaży, 3 filary Z KOTWICAMI z KARTY PRAWDY
   (niżej). Zakotwiczenie ryzyka NAD foldem: **płatność przy odbiorze · zwrot 14 dni**.
   ⛔ Nad foldem ZERO social proof liczbowego (★, „X ocen", liczniki). `sold_volume=946 < 1000` → POMIJAMY
   (żadnych „setek/tysięcy zamówień", żadnej pilności). Gwiazdki/oceny WYŁĄCZNIE w sekcji `opinie` POD foldem.
3. `## PARTYTURA` — decyzje z uzasadnieniem „ten produkt/persona prowadzi do…", NIGDY „jak poprzednio":
   - **rodzina tła** — JASNE tła OBOWIĄZKOWO (świat warsztatu/garażu: ciepły greige + czyste, chłodnawe
     światło robocze). ⛔ Rodzina tła NIE może być ciemna. **Ciemność występuje TYLKO jako element SCENY**
     (wnętrze silnika/rury/szczeliny — realny „ciemny obiekt inspekcji"), ZAWSZE rozwiązana rozświetlonym
     obrazem na ekranie; ciemny panel dozwolony wyłącznie jako lewa połowa dyptyku hero (metafora), nie jako
     tło sekcji.
   - **kolor akcentu WYPROWADZONY z realnego koloru produktu/kadrów** — obejrzałeś załączone kadry: produkt
     jest czarny na błękitnym tle detali, ale kolorem-sygnałem jest **ciepła bursztynowo-złota POŚWIATA
     8 diod LED** (kadr c-glowka-8mm — pierścień LED świeci złotem) oraz rozświetlony ekran live-view.
     To dosłownie „światło, które zapala się w ciemności" = rdzeń obietnicy. Akcent = **luminous bursztyn/złoto
     LED** (rekomendacja `#EFA019`; dopuszczalny zakres luminous amber-gold — dopracuj HEX + podaj rolę
     i WCAG-bezpieczny ink dla przycisku CTA). ⛔ NIE zsuwaj w matowy/skórzany ochr — akcent ma świecić jak
     dioda, nie jak glina. Musi spełnić **ΔE≥15** od `#C2381B` (terakota), `#0B6B64` (morska zieleń),
     `#176B3A` (butelkowa), `#7440A8` (fiolet). JEDEN akcent chromatyczny; jaśniejsze stany = tinty tego złota.
   - **para krojów Google Fonts (latin-ext)** — charakter „precyzyjne narzędzie techniczne, ciepłe nie zimne":
     rekomendacja **display = Archivo** (engineered grotesk, język przyrządu pomiarowego) + **text = IBM Plex
     Sans** (instrument sans, świetne cyfry do specyfikacji). Możesz dobrać inną parę, ale MUSI być poza
     zakazanymi (niżej), latin-ext, z wyraźnym kontrastem display↔text.
   - **sygnatura wydawnicza (1 element)** — rekomendacja: **narożniki celownika/kadru podglądu** (viewfinder
     brackets „⌐ ¬") — tematyczne „zaglądasz / kadrujesz podgląd", powtórzone oszczędnie w ≥3 sekcjach.
     Nowa względem poprzedników (rożek/stitching). Wybór Twój, ale JEDNA spójna sygnatura.
   - **`archetyp-hero: <litera>`** — dozwolone TYLKO **D / E / F / G** (patrz CROSS-LANDING). Rekomendacja **F
     (dyptyk)**: lewa połowa = ciemna, niedostępna szczelina/wnętrze (silnik/rura) z zapalającą się poświatą
     LED; prawa = ten sam obraz „na żywo" rozświetlony na ekranie telefonu w dłoni. Dyptyk sam w sobie JEST
     argumentem (przed↔po, niewidoczne↔widoczne). Uzasadnij wybór; jeśli wybierzesz inną literę z puli —
     opisz kompozycję i dlaczego prowadzi lepiej.
   - **dobór i KOLEJNOŚĆ sekcji** z uzasadnieniem per sekcja.
   ⛔ CROSS-LANDING (MUSISZ różnić się od poprzedników fabryki — inaczej gate `cross_landing` zablokuje w F6):
   - ssawek/Popiołek: archetyp **C**, akcent terakota `#C2381B`, fonty **Barlow Semi Condensed + Hanken Grotesk**;
   - ugniatek: archetyp **A**, akcent morska zieleń `#0B6B64`, **Space Grotesk + Work Sans**;
   - odsaczek: archetyp **H**, akcent zieleń butelkowa `#176B3A`, **Bricolage Grotesque + Figtree**;
   - zapinek (ten sam sklep Patencik, w budowie): archetyp **B**, akcent fiolet `#7440A8`, **Fraunces + Manrope**.
   Wymagane: archetyp ∈ {D,E,F,G}; para krojów spoza {Barlow+Hanken, SpaceGrotesk+WorkSans, Bricolage+Figtree,
   Fraunces+Manrope}; akcent ΔE≥15 od czterech powyższych (bursztyn LED spełnia).
4. `## MANIFEST SEKCJI` — format KANONICZNY, KAŻDA pozycja w backtickach:
   `` N. `id | typ | status — powód` `` gdzie `typ ∈ scenowa|kodowa`, `status ∈ build|SKIP|blokada-tomek`,
   numeracja liczbami całkowitymi, powód OBOWIĄZKOWY dla SKIP/blokada-tomek.
   **Rdzeń OBOWIĄZKOWY jako build:** `hero`, `zamow` (checkout-inline 74,90), `mid-cta`, `final`.
   WYMAGANE dodatkowo w TYM landingu (produkt wielofunkcyjny + JEST dowód):
   - `zastosowania | scenowa | build` — **OBOWIĄZKOWA, ANTY-ZAWĘŻENIE**. Produkt niesie **≥2 RÓŻNE FUNKCJE**
     (podgląd + rejestracja + wyławianie magnesem/hakiem + podgląd lusterkiem) i **7 światów zastosowań**
     (motoryzacja · rury/kanalizacja · ściany/instalacje · wentylacja/kominy · wyławianie przedmiotów ·
     elektronika/PCB · AGD/sprzęt). Szerokości NIE WOLNO upchnąć w jednej sekcji-dodatku „nie tylko do aut" —
     dedykowana sekcja (mozaika kafli-światów lub toggle per-użycie). Persona waży KOLEJNOŚĆ (PRIMARY =
     motoryzacja/dom), NIGDY nie wycina spektrum.
   - `opinie | kodowa | build` — **JEST materiał: 20 opinii, wszystkie 5★, z treścią** (EN→PL). POD foldem.
     ★ i oceny WYŁĄCZNIE tutaj. ⛔ NIE prezentuj `review_stats` Ali (4,8/366 ocen) jako „naszych" ani „X
     sprzedanych u nas" — to oceny aukcji źródłowej; pokaż realne teksty recenzji jako 5★ bez liczników
     podszywających się pod nasz sklep.
   - `zdjecia-kupujacych | kodowa | build` — **JEST materiał: 4 wybrane zdjęcia** (`r_2-0` unboxing/zestaw ·
     `r_8-3` produkt w dłoni · `r_7-2` akcesoria hak/magnes/lusterko · `r_9-0` telefon z apką) w Storage
     `bud-reviews/1005006318991119/`. **NIE `blokada-tomek`** — materiał istnieje. Reguła par: podpis z TEJ
     SAMEJ opinii co zdjęcie.
   - `demo | scenowa | build` — „jak działa" 1-2-3: **pobierz apkę Useeplus → podłącz wtyk 2w1 (USB-C/Lightning)
     → patrz na żywo na telefonie**. Kandydat **TOR-I** (interakcja). Tu OSADŹ jedyny klip firmowy jako dowód
     live-view / hero-video (patrz WIDEO niżej).
   - `detale-specyfikacja`, `trust`, `galeria`, `faq`, `stopka` — wg osądu (patrz TWARDE ZASADY / MATERIAŁ).
   **WIDEO — decyzja planu:** materiał = **1 klip firmowy** (`ali_snapshot.video_url`; brak TikToka/UGC-wideo).
   SKIP zabroniony bez powodu — **materiał JEST**. To NIE klasa dowodowa „TikTok/UGC" (brak takiego klipu),
   więc klip wolno **osadzić w `demo`/jako hero-video** albo dać minimalną sekcję `wideo | kodowa | build`
   (1 kafel). Rekomendacja: OSADZIĆ w `demo`/hero-video (1-kaflowy rail wygląda ubogo) — w manifeście zapisz
   jawnie, że klip jest WYKORZYSTANY (nie pominięty). Gate klatki środkowej i dyskwalifikatory wykona F4.
5. `## SCENY ANIMOWANE (ANIM-3)` — **hero + DWIE sekcje** (rozrzut góra/dół), każda `{sekcja · nośnik ruchu ·
   beat pętli}`. **KLASA PRODUKTU (uwaga specjalna):** produkt jest **AKTYWNY w sensie OBRAZU NA EKRANIE** —
   beat MOŻE pokazywać rozświetlający się obraz z sondy / narastającą poświatę 8 LED w ciemnej szczelinie /
   odświeżenie live-view na telefonie. **ALE bryła sondy, główki i telefonu POZOSTAJE RIGID — NEG na morfing
   bryły** (obraz „żyje", metal nie). Nośniki naturalne: poświata LED w ciemności · pojawiający się obraz na
   ekranie · delikatny dryf światła w kadrze. Preferuj osadzenie B/C fullframe; ⛔ nie sekcje TOR-I, nie
   zamow/faq. `prefers-reduced-motion` = statyczna klatka końcowa (obraz już rozświetlony).
6. `## TOR-I` — wskaż JEDNĄ sekcję demonstrującą korzyść interakcją. Kandydat główny: **`demo`** — stepper
   „1 Pobierz apkę Useeplus · 2 Podłącz 2w1 · 3 Patrz na żywo" (rozbraja obiekcję „czy zadziała z MOIM
   telefonem"). Alternatywnie toggle światów w `zastosowania`. Uzasadnij wybór.
7. `## LISTA GRAFIK` — per sekcja `{rola · ujęcie/ref · kontekst/świat · skala}`. Wykorzystaj 5 kadrów keep
   (c-glowka-8mm, c-glowka-led, c-modul, c-zlacze, c-motoryzacja) + sceny GENEROWANE multi-ref (BRAK czystego
   packshotu!). Refy OBOWIĄZKOWE dla generacji bryły: **c-glowka-8mm + c-glowka-led + c-modul**. Trzymaj:
   dokładnie **8 diod LED**, wtyk **2w1** (USB-C + doczepiany Lightning), giętka szyjka; ⛔ nie dorabiaj
   własnego ekranu/monitorka, WiFi, baterii, pełnej wodoodporności, logo marki na produkcie.
8. `## FUNKCJE KONWERSJI` — sticky-buy (74,90 zł), mid-cta (dedykowana), mechanika wszystkich CTA → `#zamow`
   (checkout-inline na stronie), FAQ z obiekcjami z ICP.
9. `## TABELA ANTY-MISMATCH CLAIM→ŹRÓDŁO` — KAŻDY claim planu z kotwicą ∈ {tytuł detail, specs, galeria detail,
   opis-FAKTY po destylacji, opinie}. Claim bez źródła = usuń; claim o klasie produktu bez źródła = STOP.
10. `## WZORCE (reuse preflight)` — tabela `{wzorzec · poziom · co REUŻYWAM (rzemiosło) · dlaczego trafny}`.
    Trafne dla klasy elektronika/warsztat: **zmiescik** (parametry/zestaw), **masazer** (mid-cta + demo),
    **ugniatek** (checkout-inline@2 steps `data-zc-*`, hero pod animację, rzemiosło 1. przebiegu wf2),
    **mata** (dywersyfikator: hero-video-inject, scena-w-tle, lightbox). ⛔ **loczek/odpalak = ANTY-WZORCE** —
    wyłącznie moduły kanoniczne (`wideo-rail@1`, `lightbox@1`), NIGDY plik strony/wizja/copy.

## TWARDE ZASADY
- Jasne tła; JEDEN akcent (bursztyn LED); motyw = metafora korzyści (światło zaglądające w niewiadomą).
- **Jedyne liczby dozwolone w copy:** `3 MP` / `1920×1440` / `30 FPS` / kąt `70°` / ostrość `2–10 cm` /
  `8 LED` / `8 mm` i `5,5 mm` / długości `1–10 m` / `IP67` (⚠️ ZAWSZE z zastrzeżeniem „sonda/obiektyw",
  NIGDY „kamera wodoodporna/podwodna") / `USB-C + Lightning` / `74,90 zł` / `14 dni`. **ZERO innych liczb**
  (nie: 0–45°C, nie: 366 ocen / 4,8 / 946 / 96,1%, nie: mocy/kg/procentów).
- ⛔ WHITE-LABEL: **DUTRIEUX**, **ZCF-004**, **GLODEER Store** — NIGDY na stronie (grep gate F6).
- ⛔ Zakazy: numeracja sekcji „01/12" na stronie; fałszywa pilność/liczniki/timery; claimy MEDYCZNE
  (to NIE endoskop medyczny); „profesjonalny/industrialny" bez miary; „kamera podwodna" bez zastrzeżenia
  IP67-sonda; absoluty jakości; egzotyka z opisu (lotnictwo/kosmos/wiertnie/„search & rescue").
- Mini-marka **Zaglądek** na landingu; marka parasolowa sklepu **Patencik** (stopka).
- CTA prowadzi do `#zamow` (checkout-inline na stronie) + sticky-buy mobile. Cena 74,90 zł — fabryka NIE modyfikuje.

## KARTA PRAWDY (jedyne źródło faktów — Z7)
- Klasa: **przewodowa kamera inspekcyjna (endoskop/boroskop) do telefonu**, obraz TYLKO na telefonie
  (brak własnego ekranu). Cena PL: **74,90 zł**.
- FAKTY z kotwicami (wolno użyć):
  - Podłączenie bezpośrednio do telefonu/iPada **bez WiFi-boxa**; wtyk **2w1 USB-C + Lightning** (iOS/Android
    z OTG) — [OPIS + galeria c-zlacze]
  - Matryca **3 MP CMOS, obraz HD 1920×1440** — [OPIS]
  - **30 FPS** — [OPIS]
  - **8 diod LED, regulowana jasność** (moduł z pokrętłem) — [OPIS + c-glowka-8mm + c-modul]
  - **IP67 — wodoodporny TYLKO obiektyw/sonda** („for camera lens only") — [OPIS+SPEC-badge] ⚠️ nie „kamera podwodna"
  - Rejestracja **zdjęć (JPEG) i wideo (MP4)** na telefonie — [OPIS]
  - Kąt widzenia **70°**; ostrość efektywna **2–10 cm** — [OPIS]
  - Średnica główki **8 mm** oraz wariant **5,5 mm** — [SPEC]+[SKU+GALERIA]
  - Przewód sztywny/półsztywny; długości **1 / 2 / 3,5 / 5 / 10 m** (parametr FUNKCJONALNY, nie estetyka) — [SPEC]+[SKU]
  - System **iOS / Android** (Android wymaga OTG) — [OPIS/SPEC]
  - Aplikacja **Useeplus** (App Store / Google Play) — [OPIS+GALERIA g5]
  - **Zestaw: kabel-kamera + hak + magnes + lusterko boczne + instrukcja** — [OPIS + g2 inset + UGC r_2-0/r_7-2]
  - Kompatybilność iPhone 5–15, iPady 8-pin i USB-C, Android USB-C z OTG — [OPIS]
- CZEGO NIE MA (zakaz dorabiania): własny ekran/monitor · WiFi/bezprzewodowość · bateria · zoom optyczny/
  autofokus · pełna wodoodporność urządzenia (IP67 = tylko sonda) · logo marki na produkcie · obsługa Windows/Mac ·
  konotacje medyczne.
- BEŁKOT (CUT): „industrial grade", „newest", „High Resolution" bez miary, egzotyczna lista zastosowań,
  „underwater/waterproof camera" bez zastrzeżenia.
- Dowód: `sold 946 < 1000` → POMIJAMY. `review_stats` (4,8/366) = aukcji źródłowej → NIGDY jako nasze.
  Opinie: **20×5★ z treścią** → sekcja `opinie`. Zdjęcia kupujących: **SĄ** (4 wybrane) → sekcja `zdjecia-kupujacych`.

## MAPA ZASTOSOWAŃ (spektrum — persona NIE zawęża; F0.6b)
- **PRIMARY (hero):** inspekcja motoryzacyjna i domowa „zajrzyj tam, gdzie nie sięga wzrok" — najsilniejszy
  dowód wizualny (c-motoryzacja: silnik + live-view na iPhonie) + message-match dla majsterkowicza/DIY.
- **SPEKTRUM (sekcja `zastosowania` — 7 światów):** motoryzacja/silnik · rury i kanalizacja (do 10 m) ·
  ściany i instalacje · wentylacja/kominy · wyławianie przedmiotów magnesem/hakiem · elektronika/PCB (ostrość
  2–10 cm) · AGD/sprzęt. FUNKCJE: podgląd na żywo · rejestracja zdjęć/wideo · wyławianie (magnes/hak) · podgląd
  za róg (lusterko). ⛔ ≥2 różne funkcje = szerokość PROWADZONA, nie markowana „nie tylko X".

## ICP / PERSONA (F0.6a — casting/ton)
- Kto: majsterkowicze i „złota rączka" 25–55, przewaga mężczyzn + realny wątek prezentowy (kobieta kupuje
  dla partnera/ojca). Właściciele domów i aut, drobni fachowcy-hobbyści. Cena 74,90 zł = impuls / niedrogi
  prezent użytkowy.
- Ból/JTBD: „muszę zobaczyć/wyjąć coś tam, gdzie nie sięgam wzrokiem ani ręką — bez rozbierania/kucia".
  Wyzwalacz: konkretna awaria/zguba (rura, silnik, szczelina, wentylacja).
- Obiekcje (→ FAQ): „czy zadziała z MOIM telefonem?", „czy obraz będzie czytelny?", „czy sztywny kabel wejdzie
  w zakręt?", „czy to nie zabawka?".
- Casting sceny: dłonie majsterkowicza/fachowca (lub mężczyzna 30–55 w roboczym), telefon z podglądem na
  żywo, realne otoczenie (silnik / rura pod zlewem / ściana / deska rozdzielcza). **ANTY-CASTING:** sale
  medyczne/operacyjne, sceny podwodne/nurkowanie, egzotyka (lotnictwo/kosmos), laboratoryjny „industrial"
  sztafaż, stock-uśmiech do kamery.
- Ton: rzeczowy, praktyczny, „po męsku" konkretny; ciepłe „zajrzyj tam, gdzie nie sięga wzrok". Słowa-klucze:
  zajrzeć, sonda, na żywo, na telefonie, wąskie miejsca, doświetlenie, wyłów.

## MATERIAŁ WIZUALNY (kuracja — realne kadry keep; upload Storage)
- **c-glowka-8mm** — makro główki 8 mm z pierścieniem 8 LED (tożsamość produktu; kotwiczy akcent i beat ANIM).
- **c-glowka-led** — główka na giętkiej szyjce + zwój kabla („wchodzi w wąskie miejsca/zakręty").
- **c-modul** — moduł z pokrętłem regulacji jasności LED.
- **c-zlacze** — wtyk 2w1 USB-C + Lightning (kompatybilność).
- **c-motoryzacja** — mechanik + silnik + live-view na iPhonie (dowód PRIMARY, message-match hero).
BRAK czystego packshotu → sceny/packshot GENEROWANE multi-ref (refy: c-glowka-8mm + c-glowka-led + c-modul).
Kolejność galerii: c-glowka-8mm → c-glowka-led → c-modul → c-zlacze → c-motoryzacja.
Zdjęcia kupujących (Storage `bud-reviews/1005006318991119/`): r_2-0 · r_8-3 · r_7-2 · r_9-0 (podpis z parą opinii).
WIDEO: 1 klip firmowy (ali_snapshot.video_url) → osadzić w `demo`/hero-video (gate klatki F4).

Załączone obrazy: [1] c-motoryzacja — PRIMARY, produkt w użyciu + live-view (kanon hero/message-match);
[2] c-glowka-8mm — tożsamość produktu, pierścień 8 LED (kotwica akcentu i sceny ANIM).
