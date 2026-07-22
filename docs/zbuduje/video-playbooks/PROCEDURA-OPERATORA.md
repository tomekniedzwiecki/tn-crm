# PROCEDURA OPERATORA — runbook przebiegu fabryki AI-video

> Kanoniczny bieg od produktu z /trendy do finalnej kreacji 15 s. Prowadzi agent-operator, który zna TYLKO te dokumenty.
> Kolejność lektury: SSOT `GENERATOR-VIDEO-STRATEGIA.md` → właściwy `PLAYBOOK-*` (archetyp) → `PROMPTY-BIBLIOTEKA.md` → TEN plik.
> Skrypty rdzenia: `scripts/video-factory/{ingest,fal,render,montaz,qa_gate}.py` + `KARTA.template.json`. Media robocze: `C:\tmp\video-factory\<proj>\`.

## Cel jakościowy
Kreacja najwyższej klasy **za pierwszym razem**. Test 17.07 (3 produkty z samej dokumentacji) to potwierdził: 3/3 przeszły bramki, śr. $2,57/kreację. Utrzymanie tego = trzymanie się kroków i bramek poniżej.

## 🎯 ZASADA NADRZĘDNA: WIERNOŚĆ WZORCOWI (rewizja 20.07, decyzja Tomka)
Celem jest **maksymalne odwzorowanie oryginalnego virala** w granicach 15 s i naszych twardych zasad — NIE „ładna reklama w naszym stałym stylu fabryki". Odwzorowujemy **NOŚNIK viralności** wzorca (`blueprint.wzorzec.viral_carrier`), a nie tylko szkielet scen. Cztery wymiary wierności (żaden nie jest opcjonalny):
- **Twarz/emocja/testimonial** → REPRODUKUJEMY twarz i mówioną emocję. **Nigdy nie wycinamy twarzy „bo kondensacja i tak tnie gadanie" — to była OSZCZĘDNOŚĆ, nie zasada, i została wycofana.** Jeśli wzorzec żył na twarzy (np. mata @thebeccaflores — testimonial „desk job → napięcie → ulga"), twarz MUSI być, choćby produkt nie działał bezpośrednio na ciele. Kondensuj testimonial do 1-2 mówionych beatów Z twarzą (omnihuman); jeśli tylko część scen niesie emocję — **HYBRYDA** (twarz na beatach testimonialu + kref/flf na demie/rezultacie).
- **Tempo cięć** → liczba ujęć z `wzorzec.target_cuts_15s` (pochodna `cut_rhythm.cuts_per_min`), NIE sztywne 6×2,5 s. Wzorzec szybki (>40 cięć/min → ~10-14 ujęć/15 s, krótkie) vs wolny/atmosferyczny (<18 → ~3-4 ujęcia dłuższe).
- **Warstwa mowy/dźwięku** → `wzorzec.voice_mode`: mówiony testimonial = VO zsynchronizowane z TWARZĄ; trending-sound/vibe bez mowy = wariant **music-forward** (nie wpychaj VO tam, gdzie oryginał go nie miał — rób to jako świadomy A/B, nie domyślnie).
- **Atmosfera/światło/kadrowanie** → jak wzorzec (`scenography` w KARCIE).

**Twarde granice zostają** (NIE ustępują wierności): 15 s; twarz twórcy ZAWSZE podmieniona na naszą personę; audio ZAWSZE nasze; logo/brand poza kadrem; oznaczenie AI. Ustępują wierności tylko zasady, które były **domyślną oszczędnością**: hands-POV-zamiast-twarzy, stały rytm 6 scen, VO-zawsze-off-screen. **Koszt i ryzyko dryfu twarzy = świadomie akceptowane** (wierność > oszczędność). Jeśli jakakolwiek inna reguła fabryki kłóci się z wiernością wzorcowi — wierność wygrywa; zgłoś konflikt w raporcie.

## ⛔ REGUŁA NADRZĘDNA: BRAK EMISJI DO PANELU = ETAP NIEZALICZONY
Proces MUSI być widoczny w panelu `/tn-sklepy` na bieżąco (decyzja Tomka 19.07). Po wskazanych KROKACH operator emituje przez `scripts/mockup-tools/panel-sync.py` (import lub CLI): (a) awans sub-kroku `step_update(project, product, 'avi_*', status, note=...)`, (b) artefakty oglądalne `artifact_add(..., step='avi_*')`, (c) koszt `cost_add(...)` i wpis osi czasu `activity_add(...)`. Mapa emisji — sekcja „EMISJE DO PANELU" niżej. Etap bez emisji = niewykonany; panel i proces NIE mogą się rozjechać.

---

## KROK 0 — Wejście i archetyp
0. **INTEGRALNOŚĆ REKORDU (incydent stolik 19.07 — rekord radaru SKAŻONY danymi innego
   produktu przez nocny cron):** pobierz `cover` rekordu i OBEJRZYJ własnymi oczami — czy
   pokazuje produkt z nazwy? Sprawdź `tt_shop.title` i `ali_snapshot.title`. Rozjazd →
   prawda jest w BLIŹNIACZYCH rekordach (trajektoria `max_plays` + `ali_candidates`);
   napraw rekord PRZED przebiegiem.
1. **WYBÓR WZORCA = proces, nie „top wg plays" (decyzja Tomka 19.07):**
   - **Oś A (liczby, automat):** `python wzorzec_score.py <tt_product_id>` — ranking
     kandydatów (rekord główny + `tt_shop.videos[]` + bliźniaki) wg: plays/followers
     (viral-ratio: 2M plays na koncie 1,8k = algorytm pchał SCHEMAT), engagement z wagą
     saves/shares, log-plays, świeżość, powtarzalność (twins).
   - **Oś B (odtwarzalność stackiem)** — obejrzyj covery top-2-3 i oceń: archetyp
     (hands-POV bez twarzy = tanio/pewnie; talking-head = drożej + ryzyko tożsamości),
     fizyka (płyny/sypkie/szybkie ruchy = ryzyko renderów), **zgodność wariantu produktu
     z naszą galerią Ali** (inny kolor/materiał = tarcie forbidden_leaks — stolik!), czy
     schemat przeżyje wymianę audio na nasze (viral z trending-soundu traci najwięcej).
   - **Oś C (zdatność reklamowa Meta/cold):** hook czytelny w 2 s BEZ dźwięku, produkt
     duży i jasny; problem→rozwiązanie > czysta estetyka; po 5 s wiadomo co to jest.
   - **Wybór + uzasadnienie LOGUJESZ w `blueprint.wzorzec`** (pole `wybor`: score, co
     przeważyło, które osie). Wzorce #2-3 NIE idą do kosza → KROK 10b (hook z innego wzorca).
   Galerię bierz z Ali white-label (`gallery_curated`/snapshot `detail`, NIGDY shop-packshot).
2. Pobierz mp4 wzorca szybko (linki TikTok gniją): `python -m yt_dlp`.
3. **Rozpoznaj archetyp z WZORCA** (nie z produktu): hands-POV / beauty-talkinghead / auto-POV. Otwórz właściwy playbook — on ustawia mapę silników, szkielet i domyślne pola KARTY. To decyzja #1: dobór silników zależy od archetypu (0d/1).
   - **Reguła rozstrzygająca — WIERNOŚĆ WZORCOWI (rewizja 20.07, wycofuje wersję sprzed):** archetyp i obecność TWARZY czytasz z NOŚNIKA VIRALNOŚCI wzorca (`blueprint.wzorzec.viral_carrier`), nie z kategorii produktu ani z chęci oszczędzenia. Jeśli wzorzec wiralił na TWARZY / emocji / reakcji / testimonialu (choćby produkt NIE działał na ciele) → **beauty-talkinghead i reprodukuj twarz**; kondensacja 15 s NIE jest powodem, by ją wyciąć (skróć testimonial do 1-2 mówionych beatów z twarzą, resztę oddaj hands-POV = **HYBRYDA**). `gadzet-handsPOV` (bez twarzy) tylko gdy wzorzec sam był hands-POV. Ustaw `wzorzec.reproduce_face` i `voice_mode` w blueprincie zgodnie z tą decyzją. (Poprzednia reguła „gadżet+głowa → hands-POV, bo kondensacja tnie gadanie" była oszczędnością — patrz ZASADA NADRZĘDNA.)
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
**KARTA = checklista BRAMEK, NIE tekst promptów** (rewizja 19.07): do promptów generacji idzie nazwa produktu + REFERENCJE-OBRAZY + akcja + zakazy (`forbidden_leaks`→negative); anatomia słowna zostaje w bramce (porównanie z packshotem per-element). Tekst opisujący wygląd walczy z obrazem i bywa błędny — incydent drapek. Braki w KARCIE = braki w bramce.

## KROK 3 — BLUEPRINT (agent vision)
Dekonstruuj wzorzec do JSON wg **`blueprint.template.json`** (schemat OBOWIĄZKOWY od 19.07; wzór wypełnienia: `pilot-lokowka/blueprint-v2-przyklad-lokowka.json`): sceny z rolami, emocjami (min. 4 zwroty — beauty), akcjami OBU RĄK, briefami klatek EN, promptami ruchu, kwestiami PL z tagami v3. Kondensuj do 15 s wg 0c (jedna idea, 4-6 cięć, ujęcia ≤2,5-3 s). Blok `consistency` (twarz/kabel/rekwizyty/stany).
**NOŚNIKI VIRALOWOŚCI (nowe pola — bez nich blueprint niekompletny):** blok `wzorzec` (audio_character — CO robił dźwięk oryginału; on_screen_text; cut_rhythm; loop; reaction_sound; comment_driver), blok `loop_close` (ostatnia klatka = echo pierwszej — projektuj PARĘ hook↔CTA razem; SSOT 0c LOOP CLOSE), per scena `has_physical_action` + `sfx[]` (0h „dźwięk na akcję"), `hook_design` (typ wg HOOK-STANDARD; dla gadżetów domyślnie problem-first; ciemny hook = FAIL).
### ⛔ BRAMKA TOMKA #1 (30 s): AKCEPT BLUEPRINTU — przed jakąkolwiek generacją.
> **Tryb autonomiczny (nocny/agentowy):** obie bramki Tomka (#1 blueprint, #2 klatki-klucze) są **aktywne TYLKO gdy przebieg jest interaktywny**. W trybie autonomicznym operator **sam akceptuje i LOGUJE decyzję** (uzasadnienie w raporcie = retro-akceptacja wg pamięci fabryki; Tomek nie jest bramką klikania). Realną, egzekwowalną bramką pozostaje `qa_gate` (KROK 7) — jej nie wolno samo-zaakceptować w żadnym trybie.

## KROK 4 — AUDIO
VO ElevenLabs v3 per scena (tagi emocji + pauzy; ~14 zn/s; celuj ~10% krócej niż video; **REJESTR first-person/story, ZAKAZ broadcast-sloganów** — PROMPTY (5)). Muzyka Stable Audio 2.5 z łukiem pod NASZĄ oś czasu (drop na reveal; zamawiaj +60% długości — fade-out gotcha). **SFX diegetyczne (0h): wygeneruj foley-hit dla KAŻDEJ akcji z blueprintu + ambient bed świata sceny** (`fal-ai/elevenlabs/sound-effects`, grosze — PROMPTY (5b)); przy wzorcu ASMR sygnaturowy dźwięk produktu w hooku GŁOŚNIEJSZY niż muzyka. Sceny mówione: driving OmniHuman = kwestia + `apad=pad_dur=0.6`. Payloady → `PROMPTY-BIBLIOTEKA.md` (5).
**VO dłuższe niż scena = defekt mapowania, nie miksu:** scena mówiona trwa = **długość kwestii + 0,6 s**, ALBO dawaj VO **co drugą scenę**. `montaz.py` **drukuje ostrzeżenie przy kolizji** (VO dłuższe niż jego scena) — kolizja = **przeprojektuj mapowanie kwestii na sceny, NIE ściszaj ani nie przycinaj VO**.
**TWARDY CHECK długości VO (przed montażem):** dla każdej sceny mówionej **czas VO ≤ dur sceny − 10%**. Jeśli dłuższy → **skróć tekst kwestii i przegeneruj VO PRZED montażem** (nie wchodź do `montaz.py` z za długim VO — przycinanie/ściszanie zakazane).

## KROK 5 — KLATKI (nano-banana/edit)
**PRE-KROK — zamaż branding u źródła:** jeśli packshot Ali ma **czytelne logo/napis**, **ZAMAŻ je na źródłowym obrazie** (`drawbox`/blur) PRZED generacją. Klauzula `{ANTI_TEXT}` w prompcie NIE usuwa loga z obrazu wejściowego — model je wtedy przerysowuje. Dopiero zamazany packshot idzie jako referencja tożsamości.
Generuj wg `PROMPTY-BIBLIOTEKA.md` (1) role obrazów + (2) pary FLF. **Master-frame produktu** raz z packshotu → wszystkie klatki produktowe chainuj z niego (`only change X`) — anty-morf. Referencja pozy = TYLKO układ; tożsamość z Ali; twarz z face_ref.
- **Anty-morf vs wymóg 3 dystansów (rozstrzygnięcie konfliktu):** master-chaining dziedziczy KOMPOZYCJĘ mastera, więc klatki o **INNYM dystansie/kadrze** (makro ↔ plan pełny) generuj **z PACKSHOTU Ali, NIE z mastera** — tożsamość i tak pochodzi z tego samego źródła (packshot = korzeń mastera), a nie usztywnisz kadru. Master-chainuj tylko klatki o TYM SAMYM kadrze (`only change X`).
### ⛔ BRAMKA TOMKA #2 (30 s): ARKUSZ KLATEK-KLUCZY — przed renderami. Reszta autonomiczna (retro-akceptacja). W trybie autonomicznym: samoakcept agenta z uzasadnieniem w raporcie (patrz nota przy BRAMCE #1).
- **Na arkuszu zweryfikuj kluczowe POD-ELEMENTY produktu** (końcówka/dysza/przycisk/gniazdo) — nie tylko sylwetkę. Jeśli **master ma zły pod-element**, **przegeneruj MASTER przed chainowaniem** (błąd mastera propaguje się na wszystkie klatki produktowe).

### REFY kref — ZDROWA PROPORCJA (zestaw 19.07: 2 martwe joby po $0.56)
Frontal/reference o ekstremalnej proporcji (wąski pionowy crop ~1:3, np. pędzel 130×400)
= job kref umiera na serwerze BEZ statusu FAILED (response_url zwraca 422; poll wisi
w nieskończoność). Wąskie cropy narzędzi PADDUJ do proporcji ≥ ~2:3
(`ffmpeg pad=iw*2.2:ih*1.1:...:white`) PRZED użyciem jako element. Objaw rozpoznasz po:
render biegnie >2× dłużej niż siostrzane sceny + reclaim nie widzi wyniku.
Przy okazji: `reclaim` zapisuje pod tag_full Z PREFIKSEM projektu (zestaw_hook.mp4), a
render_scenes bez prefiksu (hook.mp4) — po reclaim sprawdź duplikaty i uporządkuj nazwy.

## KROK 6 — RENDER
`render.render_scenes(scenes, outdir, project="<proj>")`. Silnik per scena z playbooka: `flf` / `mc` (driving 3-10 s, character_orientation) / `omnihuman` (audio+prompt ekspresji).
**best-of-N (`n:2`) TYLKO na:** sceny `mc`, sceny `omnihuman`, sceny fizyki płynów. FLF i klatki nano — bez N. Auto-wybór PO werdyktach bramki (KROK 7): `qa_gate.select_best(gen_dir, tag)` — bierze PASS z najmniejszą liczbą flag i kopiuje na `<tag>.mp4` (+`.pass`); żaden kandydat bez PASS → pętla poprawek, NIE wybór „najmniej złego".
Sceny FAILED zostawiają `<tag>.failed`; poll odporny (status_url/response_url z submita; blip HTTP liczy się dopiero po 3 z rzędu — job jest już OPŁACONY).
**PAD SESJI (uśpienie/crash) = NIE re-submituj:** joby żyją server-side i są opłacone. `python fal.py reclaim <outdir>` czyta ledger i dociąga wyniki po `response_url` (re-poll darmowy; ślepy re-submit = drugi bill). Pomija tagi z istniejącym plikiem/`.failed`.

## RÓWNOLEGŁOŚĆ — wzorzec przebiegu (skraca wall-clock ~40-60 min → ~10-15 min)
**Zasada:** `fal.gen()` jest BLOKUJĄCY (submit+poll+download naraz) — w pętli SERIALIZUJE generacje. Dla WIELU niezależnych generacji ZAWSZE `fal.gen_batch(jobs, outdir=GEN, max_parallel=8, project=<slug>)` (submit-all → poll-all → download, okno przesuwne). Rendery scen: `render.render_scenes()` — **już równoległy, NIE cofać do pętli**. Audio nie ma zależności → leci JEDNĄ falą razem z klatkami-FIRST i schodzi z krytycznej ścieżki.

**Zmierzone (masażer 18.07):** przebieg złożony z ~26 pojedynczych `gen()` zamiast 3-4 batchy. Rozkład czystego passa v2 (10:56 E2E): klatki 3 nano SEKW 1:17 · bramka 0:44 · **render 3 RÓWNOLEGLE 4:52 (jedyna nieredukowalna generacja)** · QA+fidelity 2:29 · VO 4 SEKW 0:50 (regenowane DOPIERO po renderze!) · montaż 0:44. W głównym passie v1 blok audio (13 calli, 2:07) leżał osobną fazą NA ścieżce krytycznej, a klatki w 2 sekwencyjnych fazach z 3-min bramkami między nimi. Suma sekwencyjnego narzutu do odzyskania: ~4-5 min czekania na serializowane submity + ~2 min bloku audio na ścieżce krytycznej.

**Szkielet (co startuje razem, co na co czeka):**
```
KROK 0-3  Ingest / KARTA / blueprint / refy (bramka Tomka #1) — jak dotąd.
FALA A  (jeden gen_batch, RÓWNOLEGLE, max_parallel=8):
   • WSZYSTKIE klatki-FIRST (wzajemnie niezależne)
   • CAŁE audio: muzyka + ambient + VO×N + SFX×N   ← ZERO zależności, schodzi z krytycznej ścieżki
FALA B  (drugi gen_batch, po Fali A):
   • klatki-LAST i klatki chainowane z persony/hooka (ZALEŻĄ od FIRST)
   • SFX: trim ffmpeg lokalnie PO pobraniu (raw 10 s → okno)
BRAMKA klatek (agent, samoakcept #2 + log) — na komplecie klatek.
RENDER  render.render_scenes(sceny, GEN, project=slug)  ← równoległy (~5 min)
   W TLE oczekiwania: emisje panel-sync + siatki QA klipów, które JUŻ spadły + plan montażu.
BRAMKA qa_gate + product_gate (KROK 7/7.5) — nie-samoakceptowalna.
MONTAŻ  montaz.build(...) + napisy — lokalne.
```

**Reguły zależności (NIE złamać):** klatka LAST zależy od FIRST → osobna fala; klatka chainowana z persony (`hook_first`) → po wygenerowaniu tej persony; FIRSTy różnych scen są niezależne → jedna fala; audio i klatki-FIRST są wzajemnie niezależne → wspólna Fala A; rendery zależą od klatek (+audio dla omnihuman) → po bramce klatek.

**Wspólne konto fal (DRUGA SESJA):** `max_parallel=8` — okno PRZESUWNE (nowy job wchodzi gdy zwolni się slot), nie sztywne fale. Bez limitu zagłodzisz drugą sesję; za niski = wolniej. Kolejka fal i tak dyspozycjonuje do limitu konta, nadmiar czeka IN_QUEUE ZA DARMO (submit nie dostaje 429). Różne biegi = różne `project=` (izolacja kosztów w ledgerze; saldo licz i tak przez `fal.balance()`, nie sumę est_usd).

**Szacowany nowy wall-clock (czysty pass, bez iteracji):** klatki+audio ~2 min (było ~6) · bramka klatek ~2 min · render ~5 min (nieredukowalne) · QA/montaż częściowo za renderem ~2 min → **~10-12 min** (było ~18 min czysty / 40-60 min z iteracjami; iteracje kompresują się tak samo).

**Szablon:** `scripts/video-factory/projekty/_szablon_przebiegu.py` — kopiuj per projekt; wypełnij `frames_first_spec()`/`frames_last_spec()`/`audio_spec()`/`scenes_spec()`. Orkiestracja tam, prompty/refy zostają w plikach projektu (KARTA/blueprint).

**⛔ CZEGO NIE ROBIĆ dla minut (zepsuje jakość/bramki):**
- NIE batchuj klatek-LAST razem z FIRST (dostaniesz puste/stare refy — LAST edytuje FIRST).
- NIE zwijaj bramek `qa_gate`/`product_gate` ani przeglądu WIERSZ-NA-KLATKĘ — zbiorcza ocena przepuściła 2× duplikat (KROK 7). Bramka = jedyna nie-samoakceptowalna kontrola.
- NIE podnoś `max_parallel` bez limitu na WSPÓLNYM koncie — zagłodzisz drugą sesję, a i tak nie przyspieszysz generacji (kolejka fal dyspozycjonuje do limitu konta).
- NIE równoleglij refinera/SeedVR2 (biling od megapikseli wyczerpał konto 18.07) — domyślnie OFF.
- NIE przycinaj/ściszaj VO ani nie skracaj renderów, żeby zdążyć — jakość first-time to cała wartość (kolizja VO = przeprojektuj mapowanie, KROK 4).
- NIE łącz RÓŻNYCH projektów w jednym `gen_batch` bez różnych `project=` (ledger miesza koszty po tagu).

### MASTER-WNĘTRZE — spójność scenografii przy WIELU kadrach tej samej przestrzeni (zestaw v2, 20.07)
Gdy kreacja ma wiele UJĘĆ tej samej przestrzeni (kabina auta, kuchnia, łazienka), klatki FIRST
generowane niezależnie z cropów narzędzi dają KAŻDĄ scenę w INNEJ przestrzeni (4 różne auta
w 15 s — odrzut Tomka). FIX: wybierz JEDNĄ klatkę-kanon przestrzeni (master-wnętrze) i każdą
klatkę FIRST generuj jako "NEW ANGLE of the SAME car/room" z masterem jako Image 1 + cropem
narzędzia jako Image 2; master dokładaj też do reference_image_urls kref. Analog master-frame
produktu, zastosowany do SCENOGRAFII. Bramka: porównanie każdej sceny z masterem (materiały/
kolory/światło), nie tylko produktu z packshotem.

## KROK 5b — WIERNOŚĆ NA KLATKACH (0i — PRZED renderami)
**DOKTRYNA „EDYTUJ PRAWDĘ" (v3 — nadrzędna):** klatki produktowe = nano-EDYCJA packshotu
(otoczenie/aktor dorysowane WOKÓŁ pikseli produktu); produkt STATYCZNY wewnątrz sceny
(first+last z TEJ SAMEJ bazy); zmiana stanu mechanizmu = CIĘCIE+SFX między scenami, NIGDY
ciągła animacja; bramka wierności na siatkach 4-6 fps CAŁEJ sceny (morfy żyją MIĘDZY
klatkami kluczowymi — incydent v2). Szczegóły: SSOT 0i.
1. **Paszport mechanizmu**: wytnij refy stanów (`mechanism_states`) z packshotów i LIFESTYLE
   (obraz realnego działania!); stany powierzchni (np. rysy) — jeden kanoniczny ref.
2. **`last()` ZAWSZE z `[first, ref_stanu]`** („Image 2 = EXACT identity+state — correct any
   drift") — chainowanie tylko z first = wbudowany dryf (incydent drapek).
3. **Preflight kontraktu**: każda scena demo ma `kontrakt_produktowy` (stan/kąt/skala/
   elementy/uzycie/must_show) — brak = STOP. Klatka łamie kontrakt → **inpaint-fix** nano
   (`[zla_klatka, ref_stanu]`, „replace ONLY the mechanism to match Image 2") zanim spalisz FLF.
4. **PROMPTY = INTENCJA + REFY + ZAKAZY** (rewizja 19.07): wygląd produktu niosą WYŁĄCZNIE
   obrazy („the product from the reference images, EXACTLY as-is"); słowem opisujesz akcję
   i użycie; negativem — czego ma nie być. ZAKAZ recytowania anatomii w promptach.
5. **PRE-NEUTRALIZACJA REFÓW kref (stolik 19.07 — koszt lekcji $4.5 i 2 rundy renderów):**
   refy `elements` PRZECIEKAJĄ CAŁĄ zawartością do scen o ciasnym kadrze — scenografią
   (granatowa poduszka/boazeria/marmur z packshotu) i rekwizytami (LAPTOP Z LOGO APPLE
   z refa użycia!). Kotwica tła w prompcie NIE wystarcza. PRZED pierwszym renderem:
   każdy ref z „krzykliwą" scenografią → nano-neutralizacja ($0.04: „zmień TYLKO otoczenie
   na neutralne, produkt nietknięty"); refy = zneutralizowany frontal (multi-view tylko
   gdy sceny renderują się w scenerii zbliżonej do refów, jak masażer).
6. **KAŻDY inpaint-fix klatki OBEJRZYJ w PEŁNEJ rozdzielczości przed renderem** — skrawek
   granatu przy krawędzi kadru przeżył 2 fixy niezauważony na miniaturze 420px i kosztował
   rundę renderu (nano słabo usuwa obiekty przy krawędzi; ratunek: crop w montażu, $0).

### SPRZĘŻONE KLATKI PĘTLI — poprawki bazy planuj PRZED renderami (lampka 19.07)
Gdy pętla używa wspólnych plików klatek (np. `cta_last = hook_first` — echo 1:1), każda
późniejsza poprawka hooka KASKADUJE na wszystkie sceny sprzężone (re-render 2× FLF + ryzyko
zepsucia PASS-ów). Dlatego: (a) krytykę klatki hooka rób NAJSUROWIEJ przed renderami;
(b) po renderach poprawiaj tylko elementy NIE-sprzężone (VO, SFX, okna montażowe, grading);
(c) zmiany sprzężonych ujęć realizuj jako WARIANT w packu hooków, nie przeróbkę bazy.
Gotcha nano przy okazji: „przesuń dłoń NA obiekt" potrafi wygenerować DRUGI obiekt w dłoni
(duplikat głowicy = exactly_one) — gesty dotyku planuj w BRIEFIE pierwotnej generacji.

## KROK 7 — BRAMKA WIZYJNA KLIPU (`qa_gate.py`) — egzekwowalna
Dla KAŻDEGO klipu przed montażem:
1. `python qa_gate.py precheck <klip> <KARTA.json>` (lub `cv_precheck()` z modułu) — TYLKO gdy `cv_reliable:true`: maska HSV (sumuje zakresy z `hsv_ranges` przy hue-wrap) + connectedComponents = twardy licznik egzemplarzy, $0. **Interpretacja flag: >1 obiekt = duplikat egzemplarza LUB piana/blob z rozpadu fizyki — OBIE złe, oba to ODRZUT.** Gdy `cv_reliable:false` (kolory skórne/metal) → NIE ufaj CV, licznik robi VLM.
2. `make_grids` → siatki 3×3 (2 fps; MC próbkuj 4 fps).
3. Przegląd agentem z checklistą KARTY: **WIERSZ NA KLATKĘ** (nr, #obiektów produktu, #dłoni, flagi) — ZAKAZ oceny zbiorczej (zbiorcza przepuściła 2× duplikat 17.07). Sprawdzasz: liczbę egzemplarzy, `functional_count` (ciągłość), dłonie, twarz+oczy vs face_ref, tło, fizykę w ruchu, glify, afordancję, **ANATOMIĘ POSTACI (pkt 3b)**.
   - **3b. ANATOMIA CAŁEJ POSTACI (incydent „brak tyłowia" mata 20.07 — kobieta bez bioder i nóg, tułów stapiał się z pościelą, a kładła się OBOK maty):** per klatka z człowiekiem sprawdź KOMPLETNOŚĆ ciała — tułów→biodra→nogi→stopy istnieją i są ciągłe (żadna część nie „znika" pod rekwizytem/pościelą inaczej niż przez JAWNE kadrowanie), proporcje wiarygodne, ciało nie stapia się z tłem/rekwizytem, kończyny bez nienaturalnych póz (nogi pionowo w górę przy „relaksie" = REJECT). **PREWENCJA w briefach klatek (KROK 5): każda klatka z osobą MUSI specyfikować pozę CAŁEGO ciała** („her hips, bent knees and feet clearly visible on the duvet") — brief „osoba przy rekwizycie" bez pozy nóg = model amputuje dolną połowę; do negative dopisuj `missing legs, missing hips, body merging with bedding, floating body`. **Placement z kontraktu egzekwuj w RUCHU:** „kładę się NA macie" = w klatce LAST ciało NA macie (kolce widoczne po OBU stronach tułowia) — model unika kładzenia ciała na kolcach i bez wymuszenia kładzie osobę OBOK. Wymuszaj parą FLF (first=poza kompletna, last=stan docelowy), nie samym promptem ruchu.
   - **3c. RE-BRAMKA PRZY REUSE:** klip z poprzedniej wersji użyty w nowym montażu z INNYM `ss`/`dur` = **nowa bramka na pełnym oknie ekspozycji** — stary `.pass` NIE obowiązuje (scena lezenie v1 grała 2,5 s i przeszła; w v2.1 grała 4,85 s i pokazała amputowaną anatomię + kładzenie obok maty).
4. `save_verdict(clip, "PASS"|"REJECT", flags)` → `<klip>.verdict.json` + `<klip>.pass` przy PASS. REJECT → wróć do KROK 5/6 (pętla poprawek do wyczerpania).

### KROK 7.5 — PRODUCT-FIDELITY GATE (`product_gate.py`) — egzekwowalna, NIE-samoakceptowalna
Po `.pass` WSZYSTKICH scen, PRZED montażem (montaz `require_fidelity` i tak odmówi bez markera):
1. Kompozyty side-by-side per scena (`product_gate.py sbs <packshot> <klatka> <out>`; 3-4/scenę:
   first/mid/last + apogeum mechanizmu; packshot dobrany do KONTRAKTOWEGO stanu sceny).
2. **Rubryka per-ELEMENT** (`KARTA.product.elements[]`): agent emituje WIERSZ NA ELEMENT × klatkę
   (obecny? WIERNY konstrukcyjnie/pozycyjnie? jak zniekształcony?) — zakaz oceny zbiorczej;
   werdykt sceny = min po elementach. + werdykt `kontrakt_produktowy` (must_show/must_not_show).
3. **IDENTITY BOARD**: `product_gate.py board <out> <packshot1> <packshot2> <cropy scen...>` →
   wiersz-na-kafelek „ten sam przedmiot co kotwica?"; NIESPÓJNY = REJECT scen odstających.
4. Zapis: `save_fidelity(...)` per scena + `finalize(gen_dir, board_verdict)` → `fidelity.pass`
   TYLKO przy komplecie PASS+CONSISTENT. Deterministyczny floor: `size_floor` (produkt <8% kadru
   w scenie demo = flaga). REJECT → pętla naprawcza KROK 5b (≤2 regeneracje; 3. = eskalacja).
   Dla scen best-of-N: fidelity na KANDYDATACH przed `select_best` (REJECT dyskwalifikuje).

## KROK 8 — MONTAŻ (`montaz.py`)
Plan JSON (sceny {id,plik,ss,dur,vo,vf_extra,has_physical_action,sfx[],handheld} + audio {music,mus_offset,dip,peak,ambient}); wzór `plany-15s.json`. `build(...)` **odmówi bez `.pass`** każdego klipu (`require_pass=True`) **oraz przy scenie z akcją fizyczną bez SFX** (`require_sfx=True` — bramka 0h); bypassy tylko świadomie na już zbramkowanym materiale. Wbudowane: grade-match per scena, globalne ziarno-zszywka, **micro-handheld domyślnie ON** (opt-out per scena `handheld:false` — logowany), VO na startach scen, dip/peak muzyki + ducking, **SFX/ambient osobną gałęzią bez duckingu**, limiter + **normalizacja do -14 LUFS** (mierz-i-przesuń, zachowuje dynamikę), 48 kHz. Cięcia hands-POV w apogeum akcji (0b.5 aneks), koniec = LOOP CLOSE (audio ciągłe przez granicę pętli, bez akcentu-stopu). BEZ napisów (Tomek robi osobno).

### KROK 8b — MIKS ASMR-FORWARD (gdy `wzorzec.audio_character` = raw-diegetic / asmr / cisza-i-reakcja; otwieracz 20.07, uwaga Tomka: „ASMR to ważny element niektórych video i musisz umieć z tym pracować")
Wzorce tej klasy sprzedają produkt DŹWIĘKIEM przy niemal statycznym obrazie — kopiowanie ich z pełną muzyką zabija nośnik. Reguły:
1. **SFX generuj jako „close-up ASMR recording: …, very close microphone, dry, NO music, NO reverb"** (Stable Audio; 10 s + trim) — osobne dźwięki na: start/klik, PRACĘ CIĄGŁĄ (2-3 s, kładzione na każdej scenie akcji), TARCIE/teksturę materiału i PAYOFF (pop/brzęk). Sygnaturowy dźwięk produktu MUSI istnieć jako plik, nie „w muzyce".
2. **Muzyka: `dip` od hooka do payoffu włącznie (`dip_gain` ~0.10-0.15, `music_gain` ~0.5)** — pierwszy akt = raw-diegetic (SFX gain 0.85-1.0 na 1. planie), muzyka wchodzi pełna dopiero w drugim akcie (serie/CTA) = słyszalny kontrast dwuaktowy. Payoff wybija się na tle dipu zamiast `peak`.
3. **Beat MAKRO**: jedno ujęcie ekstremalnego zbliżenia strefy kontaktu (tekstura materiału w ostrości) BEZ VO, z samym dźwiękiem pracy — obraz z bliska + dźwięk z bliska = rdzeń ASMR. Bonus: w makro widać realny ruch mechanizmu (przesuw tekstury), którego szerokie kadry nie niosą.
4. **VO oszczędnie** — nie kładź kwestii na beatach ASMR (makro/payoff); oddech między kwestiami to element formatu.
5. Weryfikacja pomiarowa: profil mean-dB per sekunda MUSI pokazywać dwa akty (cichy diegetyczny → głośniejszy z muzyką); intymna cisza w beacie makro jest CELOWA — nie „naprawiać" jej jako dziury muzyki (por. check_music: groove-pauzy legalne).

## KROK 9 — REFINER (opcjonalny; **cold DR = OFF**)
**Domyślnie NIE refinuj kreacji na zimny ruch DR** — „native/ugly" ma wyższy thumbstop od polished na cold, a refiner robi materiał „bardziej reklamowym" ZA $3-4. SeedVR2 tylko dla hero/retargetingu/brandu, WYŁĄCZNIE przez `refine.py` (chunki ≤4.8 s — model tnie dłuższe wejście do 5 s). **KOSZT REALNY ~$3-4/final 15 s** (biling od MEGAPIKSELI wyjścia — to on wyczerpał konto 18.07); przed refine sprawdź `fal.balance()`. ZAKAZY: interpolacja 60 fps (soap-opera), CodeFormer klatka-po-klatce, Topaz na max, forensiczne AI-detectory jako bramka.

## KROK 10 — CHECKLIST KOŃCOWY (przed oddaniem)
- [ ] Każdy klip ma `.pass`; montaż nie użył bypassu.
- [ ] `functional_count` produktu identyczna we WSZYSTKICH scenach (anty-morf).
- [ ] Zero czytelnych glifów (etykiety/ekrany/zegary rozmyte lub poza kadrem).
- [ ] Fizyka płynów bez piany/blobów; sztywne części bez ghostingu (brak pełnych obrotów).
- [ ] Afordancja OK (oś narzędzia = oś pracy; ręce na kierownicy gdy auto jedzie).
- [ ] **Anatomia postaci kompletna w KAŻDEJ klatce** (biodra/nogi/stopy istnieją i ciągłe; ciało nie stapia się z pościelą/rekwizytem; placement kontraktu w ruchu — „NA macie" znaczy NA, nie obok); klipy reuse re-bramkowane na pełnym oknie (KROK 7 pkt 3b/3c).
- [ ] (beauty) twarz+oczy stabilne vs face_ref; jeden egzemplarz; brak biżuterii/lakieru.
- [ ] Tożsamość z Ali (nie shop-packshot); rekwizyty/scenografia bez teleportacji.
- [ ] Ledger sprawdzony (`ledger.json`); brak napisów wypalonych.
- [ ] **Pętla domknięta** (ostatnia klatka = echo hooka; audio bez akcentu-stopu na granicy).
- [ ] **Każda akcja fizyczna słyszalna** (SFX na timestampach; ambient bed obecny) — montaż i tak odmówi bez tego, ale sprawdź czy hity siedzą NA akcji.
- [ ] Handheld nałożony (lub opt-out zalogowany); cięcia hands-POV w apogeum akcji (bez freeze na granicach scen).
- [ ] VO w rejestrze first-person (zero broadcast-sloganów); skóra z teksturą (nie woskowa).
- [ ] **`fidelity.pass` obecny**; identity-board CONSISTENT; każda scena demo spełnia `kontrakt_produktowy` (mechanizm W DZIAŁANIU, nie „obok").
- [ ] **FEEL-MATCH z wzorcem (bramka wierności — 20.07):** obejrzyj WZORZEC i finał BEZPOŚREDNIO po sobie (side-by-side jest też w panelu: krok Wideo → „Oryginał (wzorzec)") i odpowiedz na 4 pytania: (1) **nośnik viralności odtworzony?** (`viral_carrier` — twarz jest, gdy wzorzec żył na twarzy; `reproduce_face` zrealizowane); (2) **tempo cięć w tolerancji?** (liczba ujęć finału vs `target_cuts_15s` ±30%); (3) **warstwa mowy zgodna z `voice_mode`?** (testimonial-synced ≠ VO-offscreen ≠ music-forward); (4) **atmosfera/kadry jak wzorzec?** (światło, dystanse, energia). Każde NIE = wpis w raporcie z uzasadnieniem LUB pętla naprawcza. Werdykt loguj w nocie `avi_final`.

## KROK 10b — PACK WARIANTÓW HOOKA (max 3 wersje — decyzja Tomka 19.07)
Po akceptacji bazy dorób do ad setu **do 2 wariantów hooka na wspólnym rdzeniu** (razem MAX 3 pliki):
1. **Cold-open re-cut** ($0): technika z HOOK-STANDARD — 1,2 s money-shotu na przód, body ≤16 s.
2. **Świeże ujęcie hookowe** (~$0,45): 1-2 klatki nano ($0,039) + 1 Kling FLF 5 s ($0,35) + remontaż $0; INNY typ hooka z rankingu (nie odcień tego samego). **Najlepiej: hook wg schematu WZORCA #2 z rankingu `wzorzec_score`** (KROK 0) — jedna kreacja testuje wtedy DWA udowodnione schematy naraz zamiast dwóch odcieni jednego.
Warianty przechodzą bramkę hooka (jasność/typ/ruch) i trafiają do `wf2_creatives.variants`; każdy wariant = ta sama pętla wyników po publikacji.

## KROK 11 — REJESTR KREACJI + PĘTLA WYNIKÓW (obowiązkowy po finale)
Fabryka bez tego jest ślepa na własną skuteczność — rodowód kreacji MUSI trafić do bazy:
1. **Archiwum:** finał (+ warianty `_refined`/`_subs`) → prywatny bucket `wf2-video/video-factory/<slug>/` (`npx supabase storage cp <plik> ss:///wf2-video/video-factory/<slug>/<plik> --experimental --linked`). Finał dla panelu/Meta → PUBLICZNY `attachments/bud-assets/<slug>/ads/kreacja_15s.mp4` (panel-sync / op store).
2. **Rejestr:** INSERT/UPDATE `wf2_creatives` (slug UNIQUE = katalog `projekty/<slug>`): `archetype`, `pattern_tiktok_url` (WZORZEC = rodowód!), `engine_mix`, `cost_usd` (z ledgera), `storage_path`, `public_url`, `variants`, `ai_labeled`. Artefakty tekstowe (KARTA, blueprint, plan) commituj do `scripts/video-factory/projekty/<slug>/`.
3. **Po publikacji reklamy:** dopisz `meta_ad_ids` (ad_id z Meta) + `status='published'` — bez tego sync NIE dopasuje statystyk do kreacji.
4. **Wyniki czytaj z widoków:** `wf2_creative_perf` (per kreacja: thumbstop = 3s/impr, hold_50, p100_rate, ctr, purchases) i `wf2_pattern_perf` (per archetyp). Zasila je dzienny cron `wf2-ads-sync-daily` (6:20; wymaga sekretu `WF2_META_TOKEN`; metryki video z wierszy `level='ad'`; P&L liczy TYLKO `level='campaign'`).
5. **Nauka:** wnioski z wyników (który archetyp/wzorzec trzyma hook, gdzie ludzie odpadają) wpisuj do KART/playbooków — to jest cała racja bytu pętli.

---

## EMISJE DO PANELU (mapa KROK → sub-krok `avi_*` → co leci)
Sub-kroki wideo = natywne `wf2_step_defs` z `sub_of='ads_wideo'` (timeline w warsztacie kroku Wideo; artefakty/koszty/checklisty wiszą na `(product_id, 'avi_*')`). Statusy `wf2_products.video_status` = rollup dla badge.

| Po KROKU | Sub-krok | Emisja (panel-sync) |
|---|---|---|
| 0 (start) | — | `product_meta`: `video_status='planning'`, `video_pattern_tiktok_url`; `artifact_add(avi_wzorzec, kind='link', url=<tiktok>)` + **OBOWIĄZKOWO oryginał do porównania (lekcja Zaradek 22.07 — Tomek nie miał z czym porównać kreacji):** mp4 wzorca → **PRIVATE** `wf2-video/<slug>/wzorzec.mp4` + siatka klatek `wzorzec_strip.jpg`, potem `artifact_add(kind='wzorzec_ref', url='wf2-video/<slug>/wzorzec.mp4')` i `artifact_add(kind='wzorzec_strip', ...)` — panel renderuje je signed-URL-em (konwencja z przebiegu masazer). ⛔ mp4 wzorca NIGDY do PUBLIC bud-assets (cudzy content). Wzorzec ODRZUCONY (np. obca marka) też wgraj — z labelem „ODRZUCONY + powód"; `activity_add('video_start', ...)` |
| 2 (KARTA) | `avi_wzorzec` → done | note: „archetyp X · N scen · cuts/min"; `artifact_add(kind='doc', KARTA — storage='repo')`; `video_status='rendering'` |
| 3 (blueprint, samoakcept #1) | `avi_blueprint` → done | note z uzasadnieniem samoakceptu; `artifact_add(kind='doc', BLUEPRINT — storage='repo')` |
| 5 (klatki, samoakcept #2) | `avi_klatki` → done | **PUBLIC** arkusz klatek-kluczy jpg → `bud-assets/<slug>/video/frames/` (`storage_upload` + `artifact_add(kind='proof')`); koszt klatek `cost_add(note='<slug> klatki')` |
| 7 (wszystkie .pass) | `avi_render_qa` → done | `video_status='qa'` w trakcie; **PUBLIC** siatki QA `grid_*.jpg` → `bud-assets/<slug>/video/qa/` (`kind='proof'`); note-tabela werdyktów („6/7 PASS; hook 2×REJECT→fix"); koszt renderów `cost_add(note='<slug> rendery')` |
| 8 (montaż) | `avi_montaz` → done | note: „−14 LUFS · SFX/ambient · LOOP OK"; **PUBLIC** kreacja robocza → `bud-assets/<slug>/video/preview/` (`kind='video'`) |
| 11 (rejestr) | `avi_final` → done | finał → **PUBLIC** `bud-assets/<slug>/ads/kreacja_15s.mp4`; `product_meta`: `video_status='done'`, `video_url`, `video_cost_usd` (z ledgera), `video_ai_labeled=true`; `creative_upsert(slug, ..., public_url=...)`; `cost_add` total-korekta; `activity_add('video_done', '🏁 ...')` |
| REJECT / 403 / pad | bieżący | sub-krok `in_progress`/`blocked` + note z powodem (panel MA pokazać, że utknęło — nie ciszę) |

GOTCHA (drapek 19.07): `npx supabase storage cp` z absolutnym `C:/...` jako źródłem = `LegacyStorageUnsupportedOperationError` — kopiuj plik do cwd (tn-crm) i podawaj ścieżkę WZGLĘDNĄ.

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


## HOOK (obowiazkowy krok blueprintu — pelny standard: HOOK-STANDARD.md)
Projektuj na 1,7 s; hook dziala BEZ dzwieku i BEZ napisow; klatka 1 = duzy produkt-w-akcji
lub twarz + ruch; scena hooka JASNA (lift cieni przy ciemnym materiale); zero intro. Nazwij
typ hooka wzorca i odtworz jego sile lub uzyj typu z rankingu per kategoria. Domyslna
technika $0: COLD-OPEN (1,2 s money-shotu z crop-zoom 1,25x + lift, potem body, total <=16 s).
Do kazdej kreacji dolacz hook_caption_pl (sugestia napisu dla narzedzia Tomka).
