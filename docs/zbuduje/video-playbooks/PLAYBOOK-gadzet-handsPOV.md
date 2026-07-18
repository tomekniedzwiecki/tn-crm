# PLAYBOOK — archetyp GADŻET / HANDS-ONLY POV

> Narzędzia, AGD, akcesoria, gadżety. Wzorzec pokazuje **ręce + produkt w akcji, bez mówiącej twarzy do kamery**.
> Test 3 produktów 17.07 (śrubokręt/słuchawka/uchwyt) przeszedł bramki za 1. razem, śr. **$2,57/kreację**.
> Czytaj po SSOT (`GENERATOR-VIDEO-STRATEGIA.md` sekcje 0d, 0e) i przed `PROCEDURA-OPERATORA.md`.

## 1. Rozpoznanie archetypu (rób to PRZED planem silników)
Archetyp czytasz z WZORCA, nie z produktu. Hands-POV = kadry dłoni operujących produktem, makro mechanizmu, brak eye-contactu i brak synchronizowanej mowy. Jeśli wzorzec ma choć jedną scenę „gadam do kamery" → to NIE ten archetyp, idź do `PLAYBOOK-beauty-talkinghead.md`. Wszystkie 3 wzorce gadżetowe z testu 17.07 okazały się hands-only — to reguła, nie wyjątek dla tej kategorii.
> **Reguła rozstrzygająca (gadżet + gadający/reagujący prezenter — UGC reakcja/testimonial):** wybieraj **gadzet-handsPOV**, a NIE beauty. Kondensacja 15 s (SSOT 0c) i tak tnie gadanie jako pierwsze, więc mowa nie przetrwa montażu — hands-only na mechanizmie/rezultacie zostaje dowodem. `beauty-talkinghead` bierz WYŁĄCZNIE, gdy twarz/emocja JEST treścią dowodu (produkt działa NA ciele/twarzy).

## 2. Mapa silników — DOMYŚLNIE SAM KLING FLF
Cała kreacja = **Kling 2.5 FLF** (`flf` w render.py): zero OmniHuman, zero Motion Control → zero ryzyka dryfu twarzy, koszt spada ~2×. To jest domyślny i preferowany stack tego archetypu.
- **flf** — każda scena mechanizmu/akcji: klatka startowa + `tail_image_url` (para first→last), `duration:"5"`, `cfg_scale:0.5`. Deterministyczny i oglądany klatka-po-klatce → **bez best-of-N**.
- **mc** (Kling 2.6 Motion Control) — WYJĄTKOWO, tylko gdy scena wymaga gestu całego przedramienia/ciała, którego swobodna generacja nie utrzyma (dryfuje w niemożliwe pozy). Warunek: masz driving 3-10 s z oryginału (mikro-timing) ORAZ spisałeś, co robi każda dłoń (patrz §6 duplikat). Wtedy scena dostaje n=2.
- **omnihuman** — NIGDY w tym archetypie (nie ma twarzy do animowania).
- Klatki: **nano-banana/edit** ($0.039/obraz) z packshotu Ali — patrz `PROMPTY-BIBLIOTEKA.md` szablon (1) i (2).

## 3. Szkielet blueprintu 15 s (beaty z 0c)
4-6 cięć, żadne ujęcie >2,5-3 s. Jedna idea (mechanizm ALBO rezultat), nie obie.
1. **HOOK ≤2 s** — makro produktu JUŻ w akcji (nie zapowiadaj). Najmocniejsza klatka na sam początek. `flf`.
2. **DEMO/MECHANIZM 2-7 s** — jeden feature, pokazany parą FLF first→last (np. bit wchodzi → wkręt siedzi). To rdzeń dowodu.
3. **DOWÓD/REZULTAT 7-13 s** — efekt gotowy / before-after, ręka prezentuje wynik. To konwertuje.
4. **CTA 13-15 s** — produkt hero ale ŻYWY (dłoń obraca/dotyka), jedna komenda. Nie martwy packshot.
Plan montażu = JSON zgodny z `montaz.py` (wzór `pilot-lokowka/plany-15s.json`); kondensacja z już wyrenderowanych klipów = $0 (czysty ffmpeg).

## 4. Domyślne pola KARTA (`KARTA.json` instancja z `KARTA.template.json`)
- `archetype: "gadzet-handsPOV"`, `identity.face_ref: null`, `identity.eye_color: null` (brak twarzy = brak bramki tożsamości).
- `product.anatomy_str` — VERBATIM z galerii **Ali white-label**, NIGDY z brandowanego packshotu TikTok Shop (shop bywa INNYM produktem — uchwyt 17.07 miał pad „MECH STYLE").
- `product.functional_count` — LICZBA elementów funkcyjnych (bitów/ramion/szczęk) STAŁA we wszystkich scenach; to główna checklista ciągłości (§6 morf).
- `product.hsv_color` + `product.cv_reliable`:
  - Produkt **wyrazisty barwnie** (pomarańczowy/żółty/niebieski korpus) → podaj wąski zakres HSV, `cv_reliable: true` → `cv_precheck` liczy egzemplarze twardo, $0.
  - Produkt **gunmetal / czarny / srebrny / przezroczysty / w kolorze skóry** → maska HSV bezużyteczna, `cv_reliable: false` → licznik egzemplarzy robi VLM wiersz-na-klatkę (bramka nie ufa CV). Większość narzędzi metalowych wpada tutaj — to norma archetypu.
  - **Emisyjne gradienty (RGB LED, podświetlenie tęczowe/pulsujące)** → mimo jaskrawego koloru maska HSV się rozpada (barwa zmienna w czasie i po powierzchni, przepały świecenia) → `cv_reliable: false`, licznik egzemplarzy robi VLM.
- `screens_and_text` — „bez czytelnych napisów w kadrze" (patrz §6 glify).

## 5. Które sceny dostają n=2 (best-of-N)
Domyślnie **żadna** — FLF jest deterministyczny i oglądany. `n:2` ustaw TYLKO na: (a) scenę z fizyką płynów (woda/para/olej/klej się leje — najczęstszy rozpad w kulminacji), (b) wyjątkową scenę `mc`. Auto-wybór: wygrywa kandydat z najmniejszą liczbą flag bramki. Koszt +$0.35-0.5/scenę.

## 6. PUŁAPKI SPECYFICZNE (z audytów — bramka per-klatka ich NIE łapie)
1. **MORF PRODUKTU MIĘDZY SCENAMI** (śrubokręt = 3 różne narzędzia w jednym spocie). OBOWIĄZEK: **jeden master-frame produktu** (jeden packshot-master z Ali → jedna klatka nano-banana z kanoniczną tożsamością), a WSZYSTKIE klatki produktowe **FLF-chainuj z tego samego mastera** (`only change X`, patrz `PROMPTY-BIBLIOTEKA.md` (2)), nie generuj każdej sceny niezależnie. `functional_count` musi być identyczna w każdej scenie — bramka liczy elementy per scena.
   - **Konflikt z wymogiem 3 dystansów:** master-chaining dziedziczy KOMPOZYCJĘ mastera, więc klatki o **INNYM dystansie/kadrze** (makro ↔ plan) generuj **z PACKSHOTU Ali, NIE z mastera** — tożsamość i tak z tego samego korzenia (packshot), a kadr nie usztywnia się do jednego dystansu. Master-chainuj wyłącznie klatki o TYM SAMYM kadrze.
   - **Cały wzorzec w innym kolorze/wariancie niż nasza galeria Ali:** renderuj ZAWSZE wg Ali, a kolor/wariant wzorca wpisz do `forbidden_leaks` (referencja ruchu silnie ciągnie model ku barwie wzorca).
2. **PSEUDO-GLIFY na etykietach/bitach/skali** (mikro-napisy = bełkot glifów = AI-tell). Reguła projektowa: **kadruj BEZ czytelnych napisów** — etykiety poza kadrem, rozmyte DOF, albo makro tak blisko, że tekst nie mieści się. Małe i nieostre = OK; wyraźny glif = ODRZUT.
3. **GHOSTING sztywnych części przy szybkim ruchu** (podwójny obrys metalu przy motion-blur). Prompt ruchu: **unikaj pełnych obrotów** (żadnego „full spin/360° rotation") — używaj „slow rotation", „subtle handheld micro-drift". Sztywne = wolne.
4. **AFORDANCJA NARZĘDZIA: oś narzędzia = oś pracy.** Wkrętak wzdłuż osi wkręta (nie bokiem), bit wkładany czołem w gniazdo, szczęki chwytają w płaszczyźnie chwytu. Bit „wkładany bokiem" = ODRZUT. Wpisz oś pracy w `grammar.physics` KARTY i w prompt.
5. **ARANŻACJA REKWIZYTÓW STAŁA między scenami** — te same przedmioty na blacie, ta sama strona kadru, brak teleportacji rekwizytów bez cięcia narracyjnego. Blat/tło = jeden kanon (`scenography.layout`).

## 7. Hooki pianowe (gdy sygnaturowy wow wzorca to PIANA)
Generatory rozpadają dynamikę piany w bąble/blob (najczęstszy tell kulminacji). Gdy wow wzorca to piana, wybierz:
- **(a) Substytucja hookiem strumieniowym — BEZPIECZNA, DOMYŚLNA.** Zamień pianę na ciągły strumień/rozprysk cieczy (`{PHYSICS_FLUID}`, `{KARTA.product.fluid}`) — pełna kontrola fizyki, zero ryzyka blobu.
- **(b) Piana świadomie — tylko gdy piana JEST dowodem.** Wygeneruj **statyczną klatkę piany z nano-banana** (gęsta, realistyczna) i dodaj **minimalny ruch FLF** (subtelny micro-drift, `n=2`, ostra bramka) — NIE generuj dynamiki narastania piany. Klatka niesie realizm, FLF tylko ożywia.

**Trade-off:** (a) jest tania i pewna, ale traci sygnaturowy „moment piany" — akceptowalne, bo w 15 s liczy się rezultat, nie widowisko. (b) zachowuje wow za cenę wyższego ryzyka i kosztu (`n=2` + możliwe odrzuty bramki), więc bierz ją tylko, gdy piana realnie sprzedaje produkt.
