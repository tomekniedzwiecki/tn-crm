# PROCEDURA OPERATORA — runbook przebiegu fabryki AI-video

> Kanoniczny bieg od produktu z /trendy do finalnej kreacji 15 s. Prowadzi agent-operator, który zna TYLKO te dokumenty.
> Kolejność lektury: SSOT `GENERATOR-VIDEO-STRATEGIA.md` → właściwy `PLAYBOOK-*` (archetyp) → `PROMPTY-BIBLIOTEKA.md` → TEN plik.
> Skrypty rdzenia: `scripts/video-factory/{ingest,fal,render,montaz,qa_gate}.py` + `KARTA.template.json`. Media robocze: `C:\tmp\video-factory\<proj>\`.

## Cel jakościowy
Kreacja najwyższej klasy **za pierwszym razem**. Test 17.07 (3 produkty z samej dokumentacji) to potwierdził: 3/3 przeszły bramki, śr. $2,57/kreację. Utrzymanie tego = trzymanie się kroków i bramek poniżej.

---

## KROK 0 — Wejście i archetyp
1. Weź produkt z /trendy: wzorcowe video (`bud_tt_products` / `tt_shop.videos[]`, top wg plays) + galerię Ali white-label (`gallery_curated`, NIGDY shop-packshot — bywa innym produktem).
2. Pobierz mp4 wzorca szybko (linki TikTok gniją): `python -m yt_dlp`.
3. **Rozpoznaj archetyp z WZORCA** (nie z produktu): hands-POV / beauty-talkinghead / auto-POV. Otwórz właściwy playbook — on ustawia mapę silników, szkielet i domyślne pola KARTY. To decyzja #1: dobór silników zależy od archetypu (0d/1).
   - **Reguła rozstrzygająca — gadżet + gadająca/reagująca głowa (UGC reakcja/testimonial):** wybieraj **gadzet-handsPOV**, bo kondensacja 15 s (0c) i tak tnie gadanie jako pierwsze; **beauty-talkinghead WYŁĄCZNIE**, gdy twarz/emocja JEST treścią dowodu (produkt działa NA ciele/twarzy).
4. **Budżet/ledger — otag projekt:** na starcie przebiegu wywołaj `fal.set_project("<slug>")` (prefiksuje WSZYSTKIE tagi calli tego biegu; `fal.py` ma już `set_project()` i atomowy zapis). Koszt projektu = suma tagów z tym prefiksem w `ledger.json`.
   - ⛔ **BRAMKA SALDA (przed jakąkolwiek generacją):** `fal.preflight(floor_usd=15)` — REALNE saldo konta przez op `billing` proxy. Saldo < floor → STOP, nie zaczynaj biegu, którego nie dokończysz (403 w połowie = opłacone sceny bez finału; incydent 18.07). Po drogich etapach (refine!) sprawdzaj `fal.balance()` ponownie. Jeśli op `billing` zwraca błąd „BUD_FAL_ADMIN_KEY not set" — sekret nie skonfigurowany; zgłoś Tomkowi i do tego czasu licz budżet po staremu (suma `est_usd`).
   - **Suma `est_usd` po prefiksie tagu = tylko running-total pomocniczy.** `est_usd` bywa ZANIŻONY (SeedVR2 bilingowany od megapikseli — realnie ~$3-4/15 s). Pole `ledger.spent_usd` jeszcze bardziej orientacyjne (równoległe calle). Źródłem prawdy jest `fal.balance()`.

## KROK 1 — INGEST
`python ingest.py <mp4> <outdir>` → `ingest.json` (sceny PySceneDetect, klatki first/mid/last, cuts/min). Fallback ContentDetector przy ≤2 scenach jest wbudowany; gdy i to zawiedzie → ręczne siatki klatek. Przy **braku jakichkolwiek cięć** ingest zwraca **1 scenę = całość** (fix w kodzie już jest) — wtedy dekonstrukcję robisz **siatkami klatek**, nie licząc na podział na sceny. Zmapuj master wzorca na beaty 0c.
- **Sceny za długie = zła dekonstrukcja:** gdy pojedyncza scena zajmuje **>40% długości wzorca** (`ingest.json` ma pole `warning` — PySceneDetect przegapił cięcia), NIE ufaj podziałowi — przejdź na **ręczną siatkę klatek `fps=1`** i sam wyznacz beaty.

## KROK 2 — KARTA PRODUKTU (jedyne źródło prawdy)
Skopiuj `KARTA.template.json` → `C:\tmp\video-factory\<proj>\KARTA.json` i wypełnij z galerii Ali:
- `archetype`, `product.anatomy_str` VERBATIM, `product.functional_count` (liczba stała!), `product.exactly_one`, `product.forbidden_leaks` (→ `negative_extra`), `product.hsv_color` + `product.cv_reliable` (patrz playbook: false dla gunmetal/czarny/srebrny/przezroczysty/koloru skóry), `product.fluid` (nazwa cieczy do `{PHYSICS_FLUID}` lub null), `scenography`, `grammar` (kroki + rola obu dłoni + fizyka/oś pracy), `identity` (face_ref+eye_color lub null), `screens_and_text`.
- **HSV nie „na oko":** `qa_gate.hsv_calibrate(packshot, cx_rel, cy_rel)` próbkuje region packshotu (współrzędne względne 0-1) i zwraca sugerowany zakres + werdykt `cv_reliable` (auto-wykrywa pasmo skóry). Wynik wpisz do KARTY; ręczny zakres tylko gdy kalibracja niemożliwa.
- **`cv_reliable=false` MUSISZ ustawić także gdy** (poza metalem/skórą/LED): (a) **kolor FRAGMENTARYCZNY** na produkcie — rozproszone plamy/wzór/print → `connectedComponents` liczy PLAMY, nie egzemplarze; (b) **odcień przy hue-wrap 0/180 (CZERWIENIE!)** — H pęknięty na dwa końce skali; jeśli mimo to używasz maski, wypełnij `KARTA.product.hsv_ranges` DWOMA zakresami (obsłużone w `qa_gate`); (c) **kolor produktu kolidujący z elementami sceny** (tło/rekwizyt w tym samym zakresie HSV). **REGUŁA: zawsze zweryfikuj zakres HSV względem sceny** — jeśli tło/rekwizyty wpadają w maskę → `cv_reliable:false`, licznik robi VLM.
- **Tożsamość gdy CAŁY WZORZEC pokazuje inny kolor/wariant niż nasza galeria Ali:** renderuj **ZAWSZE wg Ali** (galeria = jedyna prawda tożsamości), a kolor/wariant wzorca **wpisz do `forbidden_leaks`** — model referencji ruchu silnie ciągnie ku barwie wzorca, bez tego przecieknie.
KARTA wchodzi VERBATIM do promptów i JEST checklistą bramki. Braki w KARCIE = braki w bramce.

## KROK 3 — BLUEPRINT (agent vision)
Dekonstruuj wzorzec do JSON (wzór `pilot-lokowka/blueprint-v2-przyklad-lokowka.json`): sceny z rolami, emocjami (min. 4 zwroty — beauty), akcjami OBU RĄK, briefami klatek EN, promptami ruchu, kwestiami PL z tagami v3. Kondensuj do 15 s wg 0c (jedna idea, 4-6 cięć, ujęcia ≤2,5-3 s). Blok `consistency` (twarz/kabel/rekwizyty/stany).
### ⛔ BRAMKA TOMKA #1 (30 s): AKCEPT BLUEPRINTU — przed jakąkolwiek generacją.
> **Tryb autonomiczny (nocny/agentowy):** obie bramki Tomka (#1 blueprint, #2 klatki-klucze) są **aktywne TYLKO gdy przebieg jest interaktywny**. W trybie autonomicznym operator **sam akceptuje i LOGUJE decyzję** (uzasadnienie w raporcie = retro-akceptacja wg pamięci fabryki; Tomek nie jest bramką klikania). Realną, egzekwowalną bramką pozostaje `qa_gate` (KROK 7) — jej nie wolno samo-zaakceptować w żadnym trybie.

## KROK 4 — AUDIO
VO ElevenLabs v3 per scena (tagi emocji + pauzy; ~14 zn/s; celuj ~10% krócej niż video). Muzyka Stable Audio 2.5 z łukiem pod NASZĄ oś czasu (drop na reveal). Sceny mówione: driving OmniHuman = kwestia + `apad=pad_dur=0.6`. Payloady obu silników → `PROMPTY-BIBLIOTEKA.md` (5).
**VO dłuższe niż scena = defekt mapowania, nie miksu:** scena mówiona trwa = **długość kwestii + 0,6 s**, ALBO dawaj VO **co drugą scenę**. `montaz.py` **drukuje ostrzeżenie przy kolizji** (VO dłuższe niż jego scena) — kolizja = **przeprojektuj mapowanie kwestii na sceny, NIE ściszaj ani nie przycinaj VO**.
**TWARDY CHECK długości VO (przed montażem):** dla każdej sceny mówionej **czas VO ≤ dur sceny − 10%**. Jeśli dłuższy → **skróć tekst kwestii i przegeneruj VO PRZED montażem** (nie wchodź do `montaz.py` z za długim VO — przycinanie/ściszanie zakazane).

## KROK 5 — KLATKI (nano-banana/edit)
**PRE-KROK — zamaż branding u źródła:** jeśli packshot Ali ma **czytelne logo/napis**, **ZAMAŻ je na źródłowym obrazie** (`drawbox`/blur) PRZED generacją. Klauzula `{ANTI_TEXT}` w prompcie NIE usuwa loga z obrazu wejściowego — model je wtedy przerysowuje. Dopiero zamazany packshot idzie jako referencja tożsamości.
Generuj wg `PROMPTY-BIBLIOTEKA.md` (1) role obrazów + (2) pary FLF. **Master-frame produktu** raz z packshotu → wszystkie klatki produktowe chainuj z niego (`only change X`) — anty-morf. Referencja pozy = TYLKO układ; tożsamość z Ali; twarz z face_ref.
- **Anty-morf vs wymóg 3 dystansów (rozstrzygnięcie konfliktu):** master-chaining dziedziczy KOMPOZYCJĘ mastera, więc klatki o **INNYM dystansie/kadrze** (makro ↔ plan pełny) generuj **z PACKSHOTU Ali, NIE z mastera** — tożsamość i tak pochodzi z tego samego źródła (packshot = korzeń mastera), a nie usztywnisz kadru. Master-chainuj tylko klatki o TYM SAMYM kadrze (`only change X`).
### ⛔ BRAMKA TOMKA #2 (30 s): ARKUSZ KLATEK-KLUCZY — przed renderami. Reszta autonomiczna (retro-akceptacja). W trybie autonomicznym: samoakcept agenta z uzasadnieniem w raporcie (patrz nota przy BRAMCE #1).
- **Na arkuszu zweryfikuj kluczowe POD-ELEMENTY produktu** (końcówka/dysza/przycisk/gniazdo) — nie tylko sylwetkę. Jeśli **master ma zły pod-element**, **przegeneruj MASTER przed chainowaniem** (błąd mastera propaguje się na wszystkie klatki produktowe).

## KROK 6 — RENDER
`render.render_scenes(scenes, outdir, project="<proj>")`. Silnik per scena z playbooka: `flf` / `mc` (driving 3-10 s, character_orientation) / `omnihuman` (audio+prompt ekspresji).
**best-of-N (`n:2`) TYLKO na:** sceny `mc`, sceny `omnihuman`, sceny fizyki płynów. FLF i klatki nano — bez N. Auto-wybór PO werdyktach bramki (KROK 7): `qa_gate.select_best(gen_dir, tag)` — bierze PASS z najmniejszą liczbą flag i kopiuje na `<tag>.mp4` (+`.pass`); żaden kandydat bez PASS → pętla poprawek, NIE wybór „najmniej złego".
Sceny FAILED zostawiają `<tag>.failed`; poll odporny (status_url/response_url z submita; blip HTTP liczy się dopiero po 3 z rzędu — job jest już OPŁACONY).
**PAD SESJI (uśpienie/crash) = NIE re-submituj:** joby żyją server-side i są opłacone. `python fal.py reclaim <outdir>` czyta ledger i dociąga wyniki po `response_url` (re-poll darmowy; ślepy re-submit = drugi bill). Pomija tagi z istniejącym plikiem/`.failed`.

## KROK 7 — BRAMKA WIZYJNA KLIPU (`qa_gate.py`) — egzekwowalna
Dla KAŻDEGO klipu przed montażem:
1. `python qa_gate.py precheck <klip> <KARTA.json>` (lub `cv_precheck()` z modułu) — TYLKO gdy `cv_reliable:true`: maska HSV (sumuje zakresy z `hsv_ranges` przy hue-wrap) + connectedComponents = twardy licznik egzemplarzy, $0. **Interpretacja flag: >1 obiekt = duplikat egzemplarza LUB piana/blob z rozpadu fizyki — OBIE złe, oba to ODRZUT.** Gdy `cv_reliable:false` (kolory skórne/metal) → NIE ufaj CV, licznik robi VLM.
2. `make_grids` → siatki 3×3 (2 fps; MC próbkuj 4 fps).
3. Przegląd agentem z checklistą KARTY: **WIERSZ NA KLATKĘ** (nr, #obiektów produktu, #dłoni, flagi) — ZAKAZ oceny zbiorczej (zbiorcza przepuściła 2× duplikat 17.07). Sprawdzasz: liczbę egzemplarzy, `functional_count` (ciągłość), dłonie, twarz+oczy vs face_ref, tło, fizykę w ruchu, glify, afordancję.
4. `save_verdict(clip, "PASS"|"REJECT", flags)` → `<klip>.verdict.json` + `<klip>.pass` przy PASS. REJECT → wróć do KROK 5/6 (pętla poprawek do wyczerpania).

## KROK 8 — MONTAŻ (`montaz.py`)
Plan JSON (sceny {id,plik,ss,dur,vo,vf_extra} + audio {music,mus_offset,dip,peak}); wzór `plany-15s.json`. `build(...)` **odmówi bez `.pass`** każdego klipu (`require_pass=True`; bypass tylko świadomie na już zbramkowanym materiale). Wbudowane: grade-match per scena, globalne ziarno-zszywka, VO na startach scen, dip/peak muzyki + ducking, limiter (nie loudnorm), post realizmu, 48 kHz. BEZ napisów (Tomek robi osobno).

## KROK 9 — REFINER (opcjonalny)
SeedVR2 WYŁĄCZNIE przez `refine.py` (chunki ≤4.8 s — model tnie dłuższe wejście do 5 s) — odbudowa tekstury bez agresywnego sharpeningu. **KOSZT REALNY ~$3-4/final 15 s** (biling od MEGAPIKSELI wyjścia, 2× upscale — to on wyczerpał konto 18.07); przed refine sprawdź `fal.balance()`. ZAKAZY: interpolacja 60 fps (soap-opera), CodeFormer klatka-po-klatce, Topaz na max, forensiczne AI-detectory jako bramka.

## KROK 10 — CHECKLIST KOŃCOWY (przed oddaniem)
- [ ] Każdy klip ma `.pass`; montaż nie użył bypassu.
- [ ] `functional_count` produktu identyczna we WSZYSTKICH scenach (anty-morf).
- [ ] Zero czytelnych glifów (etykiety/ekrany/zegary rozmyte lub poza kadrem).
- [ ] Fizyka płynów bez piany/blobów; sztywne części bez ghostingu (brak pełnych obrotów).
- [ ] Afordancja OK (oś narzędzia = oś pracy; ręce na kierownicy gdy auto jedzie).
- [ ] (beauty) twarz+oczy stabilne vs face_ref; jeden egzemplarz; brak biżuterii/lakieru.
- [ ] Tożsamość z Ali (nie shop-packshot); rekwizyty/scenografia bez teleportacji.
- [ ] Ledger sprawdzony (`ledger.json`); brak napisów wypalonych.

---

## GDZIE ŁAPIEMY 9 DZISIEJSZYCH INCYDENTÓW (mapa bramka→incydent)
| # | Incydent | Łapany w |
|---|----------|----------|
| 1 | Morf produktu między scenami (śrubokręt = 3 narzędzia) | KROK 5 (master-frame + FLF-chaining) prewencyjnie; KROK 7 pkt 3 (`functional_count` per klatka) detekcyjnie |
| 2 | Rozpad fizyki płynów w kulminacji (woda→piana/blob) | KROK 6 (`n:2` na scenach płynów) + KROK 7 pkt 1 (>1 obiekt = blob) i pkt 3 (fizyka w ruchu) |
| 3 | Pseudo-glify na ekranach/etykietach/zegarach | KROK 5 (kadr bez czytelnych napisów) prewencyjnie; KROK 7 checklista „glify" |
| 4 | Ghosting sztywnych części przy motion-blur | KROK 5/6 (prompt bez pełnych obrotów) prewencyjnie; KROK 7 „fizyka w ruchu, podwójny obrys" |
| 5 | Afordancja (bit bokiem / kierowca bez rąk na kierownicy) | KROK 2 (`grammar.physics` oś pracy) + KROK 7 checklista „afordancja" |
| 6 | Duplikat egzemplarza w wolnej dłoni (MC) | KROK 6 driving-check dłoni + `EXACTLY ONE`; KROK 7 `cv_precheck` (twardy licznik) / VLM per klatka |
| 7 | Dryf tożsamości twarzy między scenami (OmniHuman) | KROK 6 (`n:2` omnihuman) + KROK 7 bramka tożsamości (embedding vs face_ref); fix: face-swap nano + regen |
| 8 | Zmiana koloru oczu (OmniHuman) | KROK 5/6 „warm brown eyes" w promcie + KROK 7 checklista „oczy vs face_ref" |
| 9 | Skażenie NEG cechą produktową / shop-packshot innym produktem | KROK 2/5 (`negative_extra` z KARTY, nie rdzeń NEG; tożsamość WYŁĄCZNIE z Ali) |


## SeedVR2 — zmierzone ograniczenia (17.07 noc)
- Model przetwarza MAKS ~5 s na wywolanie (dluzsze wejscie -> ucieta 5 s odpowiedz) i zwraca 2x upscale.
- Uzywaj `scripts/video-factory/refine.py` (tnie final na kawalki 4,8 s, refinuje, downscaluje do 1080x1920, skleja, przenosi audio). Koszt REALNY ~$3-4 na final 15 s (biling od MEGAPIKSELI wyjscia — zmierzone 18.07 przez wyczerpanie konta; est $0.9 bylo zanizone).
- Zysk potwierdzony wizualnie: ostrzejsze krople/tekstury/krawedzie bez przeostrzenia. Stosuj PO akceptacji tresci (to ostatni krok, nie naprawa defektow).


## Lekcje z audytu walidacji (myjka, 18.07 noc — werdykt 7/10, zero defektow krytycznych)
1. POD-ELEMENTY PERYFERYJNE (waz, wlot, zlacza, kabel, akcesoria) MUSZA byc w `anatomy_str`
   i miec JEDNA konfiguracje we wszystkich partiach klatek — rezydualny morf hydrauliki powstal,
   bo dwie partie generacji mialy rozne warunkowanie (zolty wlot vs karbowany waz). Wszystkie
   klatki produktu warunkuj TYM SAMYM packshotem/masterem takze dla akcesoriow.
2. SCENA MOCY pokazuje efekt W KAZDEJ KLATCE: brief sceny "power/demo" musi jawnie zadac
   widocznego strumienia/dzialania przez caly czas trwania (klatka first I last z efektem);
   bramka odrzuca scene mocy bez widocznego efektu.
3. Brak wypalonego CTA-tekstu = POLITYKA (napisy Tomek robi zewnetrznie) — ale ostatnia scena
   musi miec WIZUALNY beat CTA (hero produktu + gest); audytorow zewnetrznych uprzedzac w briefie.


## NAPISY (opcjonalny krok po finale)
Gdy zamowienie obejmuje wersje z napisami: `python scripts/video-factory/napisy.py <final.mp4>` -> `_subs.mp4` (styl rolek: word-by-word pop, aktywne slowo zolte; PL glify OK — Montserrat Black). Oryginal bez napisow ZAWSZE zostaje. Po pierwszym renderze obejrzyj klatke z polskimi znakami i sprawdz szerokosc fraz.
