# GENERATOR VIDEO — strategia (v0.2, 2026-07-17)

> **PILOT WYKONANY 17.07 — FLOW DZIAŁA E2E.** Reklama 24 s z lokówki (top produkt /trendy,
> wzorzec 32,6 mln plays) wygenerowana za **~$3.50** (ledger: `C:\tmp\video-factory\ledger.json`).
> Wynik: `C:\tmp\video-factory\lokowka\out\ad_v1.mp4`. Narzędzia: edge `bud-fal-proxy`
> (submit/poll/store, gate x-tools-secret, klucz `BUD_FAL_API_KEY` server-side) + skrypty
> `tn-crm/scripts/video-factory/` (ingest→frames→animate→assemble; kopie robocze
> `C:\tmp\video-factory\tools\`). PRZEBIEG: yt-dlp → PySceneDetect (15 scen) → blueprint
> (agent vision, cut 8 scen) → paszport produktu nano-banana z galerii Ali ($0.039!) →
> klatki otwierające nano-banana/edit [kotwica persony + packshot] → Kling 2.5 Turbo Pro 5 s/scena →
> ElevenLabs PL (fal, turbo-v2.5) → ffmpeg (trim do timingu oryginału + drawtext PL + VO).
> USTALENIA Z PILOTA: (1) nano-banana trzyma personę i produkt między scenami z 2 referencji —
> to wystarcza zamiast drogich multi-ref modeli; (2) Kling > Wan 480p (ostrość) i nie morfuje
> twarzy/produktu do ~4 s, degradacja możliwa w 5. sekundzie (scena CTA ucięta do 3,2 s);
> (3) fal poll: używać `status_url`/`response_url` z submit (modele z pod-ścieżką mają inny base;
> response_url nano-banana BEZ sufiksu /response); (4) Kling/Wan bez aspect_ratio — pion przez
> pionowy obraz wejściowy; duration to STRING („5" / Veo „8s"); (5) upload mp4 przez store/base64
> pada (546) — media wynikowe trzymać lokalnie albo dograć signed-upload; (6) packshoty TikTok Shop
> = BRANDOWANE (TYMO) — referencje TYLKO z galerii Ali white-label; (7) VO ElevenLabs licz ~14 zn/s,
> celuj w ~10% mniej niż długość video i dociągnij atempo ≤1.15; (8) **LIP-SYNC = osobny krok**:
> i2v animuje usta „na ślepo" → sceny mówione przepuścić przez **Kling LipSync a2v**
> (`fal-ai/kling-video/lipsync/audio-to-video`, {video_url, audio_url}, video 2-10 s,
> ~$0.03/klip, ~12 min) — na PEŁNYCH 5 s klipach z wycinkiem finalnej ścieżki VO od startu
> sceny (sceny <2 s nie przechodzą limitu; trim po lipsyncu ustawia idealną zgodność);
> jakość twarzy zachowana; `lipsync_batch.py`. Finał z lip-syncem: `ad_v2.mp4` (~$3.57 łącznie).
>
> **ITERACJA v3/v4 (17.07 po feedbacku Tomka: „za bardzo AI"):** (9) post-hoc lip-sync ODRZUCONY —
> sceny mówione generować **OmniHuman 1.5** (`fal-ai/bytedance/omnihuman/v1.5`, {image_url, audio_url,
> prompt}, ~$0.83/scenę 5 s) — usta+mimika+gesty z NASZEGO audio od podstaw; w A/B bije Kling AI Avatar
> v2 Pro (wygładza twarz, gubi sync). (10) **Muzyka: Stable Audio 2.5** (`fal-ai/stable-audio-25/
> text-to-audio`, $0.20/utwór, licencyjnie czysta do reklam) — łuk dynamiki opisywany w prompcie
> Z NASZĄ osią czasu (drop na reveal); miks: sidechain ducking + loudnorm -14 LUFS/-1 dBTP/48 kHz
> (`assemble_v3/v4.py`). (11) Post realizmu: fps=30 + drift zoompan + eq + winieta + noise temporalne.
> (12) **NAJWIĘKSZY AI-tell wg audytu (agent, ocena 5/10): DRYF TOŻSAMOŚCI między scenami** —
> nano-banana z 1 kotwicą NIE wystarcza; fix: kanoniczna twarz z ujęcia hero (`face_ref.png`) +
> face-swap odstających klatek nano-bananą + regeneracja OmniHumanem; ciągłość REKWIZYTÓW (kabel!)
> sprawdzać między scenami; wersja bez twarzy (makro produktu) = najtańszy unik dryfu.
> (13) Napisy: NIE wypalać (Tomek robi w osobnym narzędziu). Finał: **`ad_v4.mp4`** (~$13.3 łącznie
> z nauką; czysty koszt powtórki takiego spotu ~$6-7). PĘTLA: generuj → audyt agentem (frames 1 fps +
> granice scen + AI-tells) → poprawki → re-montaż.

Cel: narzędzie fabryki, które na podstawie TRENDUJĄCEGO video z TikToka (produkty z /trendy)
generuje NASZE AI-video reklamowe z NASZYM produktem — zachowując schemat, który udowodnił
zasięgi: hook, rytm cięć, kadry, strukturę narracji. Wyjście: gotowe kreacje 9:16 pod Meta/TikTok Ads.

Status: STRATEGIA (nic nie zbudowane). Research bazowy zrobiony 17.07 (2 agenci Sonnet:
modele+ceny, techniki replikacji; 1 agent Explore: infrastruktura).

---

## 0. REGUŁY EMOCJI I DEMO (z analizy porównawczej oryginał vs nasze v4, 17.07 — Tomek: „totalnie inna historia")

Nasze v4 odtworzyło SCHEMAT scen, ale nie ODDZIAŁYWANIE. Pomiar różnic (ja + agent, klatka po klatce + audio):

1. **PROCES, nie POZA.** W oryginale w każdej klatce dzieje się czynność (druga ręka podaje pasmo,
   naciąg włosów, wskazanie palcem, wypuszczenie loka). Zakaz kadrów „trzyma produkt obok twarzy".
2. **MECHANIZM NA EKRANIE = dowód.** Włosy widocznie wciągane/wirujące w komorze + cykl
   załaduj→czekaj→wypuść LOK, powtórzony z progresją. Bez tego demo nie istnieje.
   Narzędzie: Kling first+last frame (`tail_image_url`) + inserty makro komory.
3. **ASYMETRIA = retencja.** Połowa głowy nakręcona/połowa prosta przez ~70% video
   (transformacja trwa na ekranie). Zakaz skoku proste→pełne loki.
4. **KRZYWA EMOCJI, min. 4 zwroty:** sceptyczny deadpan (hook) → skupienie/napięcie →
   ZASKOCZENIE+śmiech przy pierwszym loku → duma/„patrzcie" → drugi szok „trzyma się po
   godzinach" (lustro). Wzrok krąży: kamera↔urządzenie↔włosy (nie stały eye-contact).
   OmniHuman: jawny prompt ekspresji per scena.
5. **AUDIO ŻYJE:** oryginał ma rozpiętość ~30 dB (cisza-suspens przy patrzeniu → wybuch reakcji
   → kulminacja przy lustrze); nasz flat -17±1 dB czyta się jako „reklama". VO = ElevenLabs v3
   z tagami emocji ([skeptical]/[gasp]/[laughs]) i PAUZAMI; miks z realną dynamiką
   (mean ~-23 dB, piki do -6; dip muzyki w suspensie, podbicie na reveal).
6. **Język filmowy:** 3 dystanse (makro twarzy / plan średni / hero+makro produktu), cięcia
   co 1,5-3 s, pattern-interrupt makro twarzy w 1-2 s, handheld jitter; finał = potrząsanie
   lokami obiema rękami (objętość), pointa = lustro w innym pokoju.
7. **Niedoskonałość aktorki/scenerii** (sprany T-shirt, potargane pasma, clutter) > uroda.

## 0b. REGUŁY SYSTEMOWE FABRYKI (z potrójnego audytu segmentu, 17.07 wieczór)

Trzy niezależne audyty (detale / ciągłość / grade) tego samego segmentu → reguły NA KAŻDY produkt:

1. **KARTA PRODUKTU** — przed produkcją spisać kanoniczną anatomię z packshotu (dla lokówki:
   korona 6 ząbków = 2 wysokie płatki + 4 proste, wałek rose-gold, 2 listki + Y-LED + przycisk
   na rękojeści, cienki RÓŻOWY kabel). **REWIZJA 19.07 (Tomek — „nie opisuj detali, model
   umie sam, jeśli go nakierujesz"): anatomia jest CHECKLISTĄ BRAMKI, NIE tekstem promptu.**
   Do promptów generacji idzie: NAZWA produktu + REFERENCJE-OBRAZY („the scratch board from
   the reference images, kept EXACTLY as-is") + akcja/intencja + ZAKAZY. Słowny opis wyglądu
   w prompcie WALCZY z obrazem i potrafi wygrać — dowód: KARTA drapka kłamała („wnęka przy
   lewym końcu"), zdjęcia mówiły center-right, model słuchał BŁĘDNEGO TEKSTU wbrew poprawnym
   refom. Przecieki z referencji pozy (szary kabel TYMO, pierścionki, lakier) = odrzut klatki
   (to egzekwuje bramka, nie prompt).
2. **KARTA SCENOGRAFII** — jeden kanoniczny layout tła (dla pilota: półka z kosmetykami przy
   LEWEJ krawędzi, zasłona wafel za plecami, ciepłe okno) + strona ekranu urządzenia
   (prawa dłoń, prawa skroń, prawa strona kadru). Flip sceny = naprawa hflip w montażu.
3. **GRAMATYKA CZYNNOŚCI** — z klipów referencyjnych spisać, jak człowiek FIZYCZNIE wykonuje
   czynność, i wpisać w briefy scen (lokówka: urządzenie DOCIŚNIĘTE do skroni; pasmo
   prowadzone z góry POD NAPIĘCIEM drugą ręką; uwolnienie = zjazd urządzenia W DÓŁ wzdłuż
   pasma, lok wysuwa się spodem; wzrok wyprzedza czynność; urządzenie stale w JEDNEJ dłoni,
   druga ma ciągłą rolę: podaje→prowadzi→wskazuje).
4. **GRADE-MATCH w montażu** — silniki mają różne looki (pomiar: Kling MC ostry/ciepły,
   FLF-makro +10 jasności/najchłodniejsze/płaskie, OmniHuman −6 jasności/wygładzony).
   Zawsze: wyznacz scenę-kotwicę → signalstats YAVG/U/SAT per scena → eq/colortemperature/
   unsharp per odstająca scena → GLOBALNE ziarno `noise=alls=5:allf=t` na całość jako zszywka.
5. **CIĘCIA NA ODDECHU** — cięcie tylko w pauzie audio; akcja „dokańcza się" przed cięciem.
   **ANEKS per-archetyp (audyt 19.07):** to reguła dla TALKING-HEAD/beauty (payoff emocji musi
   wylądować). Dla **hands-POV/auto tnij w APOGEUM akcji** (match-on-action: ruch przechodzi
   PRZEZ cięcie, ostatnia klatka sceny N = początek akcji sceny N+1, bez freeze na granicy) —
   oko śledzi ruch, nie szew AI; cięcie na martwej pauzie obnaża dwa przybite ujęcia.
6. **BRAMKA TOŻSAMOŚCI** — kolor oczu/twarz w każdej scenie vs face-ref (OmniHuman potrafi
   zmienić kolor oczu!); jawne „warm brown eyes" w promptach + kontrola klatek wyjściowych.
7. **JEDEN EGZEMPLARZ PRODUKTU + BRAMKA WIZYJNA KLIPU** (incydent 17.07: Motion Control
   zhalucynował DRUGI egzemplarz lokówki w wolnej dłoni, bo driving miał tam gestykulację;
   wyrywkowe QA co ~2 s nie złapało). Reguły: (a) karta produktu w promptach MC/FLF zawiera
   „EXACTLY ONE device in the scene, the other hand is EMPTY"; (b) negative prompt: second
   device, duplicate product; (c) przy WYBORZE drivingu spisz, co robi KAŻDA dłoń — jeśli
   manipuluje obiektem, klatka startowa musi dać jej właściwy obiekt albo zmień fragment;
   (d) KAŻDY klip przed montażem przechodzi `qa_gate.py` (klatki 2 fps → siatki 3×3 →
   przegląd agentem z checklistą karty: liczba urządzeń, anatomia, dłonie, twarz, tło, fizyka).

## 0c. STANDARD 15 SEKUND (decyzja Tomka 17.07 + research)

**Domyślny format = JEDNA kreacja ~15 s** (doprecyzowanie Tomka 17.07: na razie fabryka robi
JEDNĄ kreację; para kreacji/warianty hooka = opcja na później, po akceptacji jakości).
Kanoniczny łuk jednej kreacji = pełny viral w kondensacie: hook sceptyka → mechanizm →
payoff z reakcją → CTA (wzór: kreacja A). Research: 15 s wygrywa na zimnym ruchu — krótszy film = wyższy hold
rate, a completion to najsilniejszy sygnał dystrybucji (15 s @55% hold > 30 s @35%); benchmarki:
hook rate cel 30-35% (elita 40%+), completion 15-sekundówki ≥30%.

**Szablon beatów 15 s:** HOOK ≤2 s (produkt/efekt OD RAZU, nie zapowiadaj; decyzja widza ~1,7 s)
→ DEMO/MECHANIZM 2-7 s (pokazuj, nie tłumacz; jeden feature) → DOWÓD/TRANSFORMACJA 7-13 s
(reakcja/before-after; to konwertuje) → CTA 13-15 s (jedna komenda). 4-6 cięć, żadne ujęcie >2,5-3 s.

**LOOP CLOSE (domyślne zakończenie — audyt viralowości 19.07):** kreacja NIE kończy się twardym
stopem z akcentem muzyki — pętla = rewatch, a rewatch to najsilniejszy sygnał algorytmu (watch-time
>100%; drugie obejrzenie tego samego widza waży więcej niż świeże wyświetlenie). Trzy wymogi:
(1) ostatnia klatka = ECHO pierwszej (kadr/światło/pozycja produktu — projektowane w blueprincie,
pole `loop_close`); (2) audio ciągłe przez granicę pętli (muzyka bar-aligned, BEZ „domknięcia
akcentem"/fade); (3) ostatnia linia VO ustawia pierwszą. Pętla KOMPOZYCYJNA, nie gadżet
rewind/reset. CTA zostaje (13-15 s), ale wizualnie scena CTA wraca do kadru hooka.

**REJESTR VO (audyt 19.07):** first-person/story („Tata dostał to na Dzień Ojca…"), luźna
niedoskonała dykcja (ElevenLabs stability niżej, pauzy); ZAKAZ broadcast-sloganów
(„Pięć w jednym. Sprawdź sam." = ad-feel, zabija native). Szczegóły i lista zakazanych
fraz: PROMPTY-BIBLIOTEKA (5).

**Algorytm kondensacji virala → 15 s:** (1) zmapuj master na beaty; (2) wybierz JEDNĄ ideę
(mechanizm ALBO transformacja); (3) wytnij w kolejności: gadanie/intro → drugi dowód →
setup problemu; (4) najmocniejszą klatkę na sam początek jako hook; (5) 40-80 słów VO;
(6) OBOWIĄZKOWE przeżywają zawsze: hook wizualny, mechanizm w akcji, jedna transformacja, jeden CTA.

**PACK WARIANTÓW HOOKA (decyzja Tomka 19.07: MAX 3 WERSJE):** zamiast pary pełnych produkcji —
**1 kreacja BAZOWA + do 2 wariantów hooka na wspólnym rdzeniu** (razem max 3 pliki do ad setu).
Warianty i koszty: re-cut cold-open (HOOK-STANDARD, remontaż $0) · świeże ujęcie hookowe
(1-2 klatki nano $0,039/szt + 1 Kling FLF 5 s $0,35 + remontaż $0 ≈ **$0,45**). Cały pack
≈ koszt bazy + $0-0,9. To godzi standard „jednej kreacji" z Andromedą (CENNIK §2b: 1 kampania
= 1 ad set z kilkoma plikami — pliki ≠ produkcje; resztę slotów wypełniają grafiki wf2-ads).
Kadencja po zwycięzcy: refresh hooka triggerowany CPM/frequency, zmieniaj JEDEN element.

**Warsztat:** plan kreacji = JSON zgodny z `montaz.py` (sceny {id,plik,ss,dur,vo,vf_extra} +
audio {music,mus_offset,dip,peak}); wzór: `C:\tmp\video-factory\lokowka\plany-15s.json`
(kreacja A „Test na żywo" = sceptyk→mechanizm→lok+śmiech, drop na wyjściu loka; kreacja B
„Efekt i dowód" = makro-szok→asymetria→lustro-trwałość, drop na lustrze). Kondensacja z już
wyrenderowanych klipów = $0 (czysty ffmpeg).

## 0d. LEKCJE GENERALIZACJI (test 3 produktów naraz, 17.07 wieczór)

Trzej agenci-operatorzy przeprowadzili pełne pipeline'y z SAMEJ dokumentacji (SSOT+README+skrypty)
— wszystkie 3 kreacje 15 s przeszły bramki za pierwszym przebiegiem, śr. koszt **$2,57/kreację**
(śrubokręt $2,29 / słuchawka $2,64 / uchwyt $2,79). Wnioski:

1. **Archetyp wzorca DECYDUJE o stacku:** wszystkie 3 wzorce gadżetowe to hands-only POV
   (bez twarzy!) → cała kreacja = Kling FLF, zero OmniHuman/MC, zero ryzyka dryfu twarzy,
   koszt spada ~2×. Talking-head (lokówka) to wzorzec kategorii beauty, nie uniwersalny.
   ZAWSZE czytaj archetyp z wzorca zanim zaplanujesz silniki.
2. **NEG w render.py był produktowo skażony** (pink/curler wyciekał do gunmetal narzędzia) →
   NEG rdzenia = tylko wady generyczne; cechy produktowe w `negative_extra` per scena
   (z karty produktu). NAPRAWIONE w render.py.
3. **Ledger-tagi wymagają prefiksu projektu** → render_scenes(project=...). NAPRAWIONE.
4. **Ingest: AdaptiveDetector potrafi dać 2 sceny na 61 s** → fallback ContentDetector przy
   <=2 scenach. NAPRAWIONE. Gdy i to zawiedzie: ręczne siatki klatek.
5. Shop-packshoty bywają INNYM produktem (uchwyt: pad „MECH STYLE") — reguła „shop = tylko
   pozy" potwierdzona; tożsamość ZAWSZE z galerii Ali.
6. Telefon/rekwizyty ekranowe: generyczna mapa/czarny ekran bez marek — przeszło bramkę.
7. Znany words-tell na makro: mikro-napisy na bitach = pseudo-glify (małe/rozmyte OK;
   wyraźne = odrzut). Do checklisty bramki.

## 0e. MAPA PODNIESIENIA JAKOŚCI O KLASĘ (synteza 3 agentów, 17.07 noc)

**Audyt 3 kreacji ujawnił klasy defektów, których bramka per-klatka NIE łapie:** (1) MORF
PRODUKTU MIĘDZY SCENAMI (śrubokręt = 3 różne narzędzia w jednym spocie!), (2) rozpad fizyki
w kulminacji (woda→piana/blobby w słuchawce), (3) pseudo-glify na ekranach/etykietach/zegarach,
(4) ghosting sztywnych części przy motion-blur, (5) afordancja (bit wkładany bokiem, kierowca
bez rąk na kierownicy w jadącym aucie). TOP wspólne tells: glify > morf > ciągłość scenografii
> fizyka > plastikowa skóra/palce.

**WDROŻONE (17.07):** KARTA.template.json (jedno źródło: prompty+negative_extra+checklista);
qa_gate v2 = checklista rozszerzona o ciągłość między scenami/fizykę/glify/afordancję +
WYMÓG wiersza-na-klatkę (zakaz oceny zbiorczej) + `save_verdict()` → `<klip>.verdict.json`
+ sidecar `.pass`; montaz.py ODMAWIA montażu bez `.pass` (require_pass, bypass jawny).

**STATUS DŹWIGNI (po audycie 18.07 — trzy raporty agentów):**
1. ✅ **Best-of-N (N=2) TYLKO na mc/omnihuman** — WDROŻONE w komplecie: render rozwija `__cN`,
   a auto-wybór robi `qa_gate.select_best(gen_dir, tag)` (PASS z najmniejszą liczbą flag →
   kopiuje na tag docelowy; żaden PASS = pętla poprawek, NIE „najmniej zły"). +$1-1.5/spot.
2. ✅/⏳ **Pre-checki CV**: `cv_precheck` NAPRAWIONY 18.07 (audyt wykrył `NameError` —
   `ranges` niezdefiniowane; nie wyszło wcześniej, bo wszystkie produkty walidacyjne miały
   `cv_reliable:false`); obsługuje `hsv_ranges` (hue-wrap, czerwienie) + CLI
   `python qa_gate.py precheck <klip> <KARTA>`. ⏳ Embedding twarzy (insightface) ODŁOŻONY
   świadomie — opłaci się dopiero przy powrocie do archetypu beauty (dziś dominuje hands-POV).
3. ❌ **OCR-sweep** — ODRZUCONY po audycie: pseudo-glify wymagają analizy temporalnej, nie OCR;
   prewencja kadrem (KROK 5) + przegląd VLM już to łapią. Nie wracać bez nowych danych.
4. ✅ **SeedVR2 refiner** — WYŁĄCZNIE `refine.py` (chunki ≤4.8 s; model tnie dłuższe wejście
   do 5 s). UWAGA KOSZT: bilingowany od MEGAPIKSELI wyjścia (2× upscale!) = realnie ~$3-4/15 s,
   nie $0.9 — to on wyczerpał konto (403, 18.07). Dawny `montaz.refine_seedvr` (cały klip
   1 callem = desync) USUNIĘTY. **POLITYKA (audyt skuteczności 19.07): na ZIMNY ruch DR
   refiner OFF** — „ugly/native" ma wyższy thumbstop od polished na cold (+15-25%), a glossy
   refiner robi z kreacji „reklamę" ZA $3-4; ON tylko dla hero/retargetingu/brandu.
5. ❌ **Routing na Kling v3** — ODRZUCONY po audycie: +50-140% kosztu za marginalny zysk;
   afordancję dłoni domykają master-frame/FLF-chaining + bramka. Nie podmieniać stacku.
6. ✅ **Playbooki per-archetyp** — komplet w `docs/zbuduje/video-playbooks/`.
7. ✅ **2 bramki Tomka po 30 s** — w PROCEDURZE (tryb autonomiczny: samoakcept + log).
8. ✅ **ZAKAZY z researchu:** interpolacja 60 fps dla UGC (soap-opera), CodeFormer
   klatka-po-klatce, Topaz na max, forensiczne AI-detectory jako bramka jakości.
10. ✅ **PRODUCT-FIDELITY GATE (19.07)** — domyka klasę defektów #1 (MORF PRODUKTU MIĘDZY
   SCENAMI): `functional_count` NIE wystarcza (ślepy na kształt/konstrukcję — incydent drapek).
   Kontrakt+bramka: sekcja **0i**; `product_gate.py`; montaz `require_fidelity`.
9. ✅ **Odporność/budżet (18.07):** transient-retry w pollach (`fal.gen`, `render` — blip HTTP
   nie spisuje OPŁACONEGO joba na straty), `python fal.py reclaim <outdir>` (dociąga opłacone
   joby po padzie sesji z response_url w ledgerze — re-poll darmowy, re-submit = drugi bill),
   `fal.balance()`/`fal.preflight(floor)` = REALNE saldo przez op `billing` proxy (sekret
   `BUD_FAL_ADMIN_KEY`, klucz Admin fal server-side) — `est_usd` bywa zaniżony (SeedVR2!),
   saldo jest jedynym źródłem prawdy budżetu.

## 0f. NOCNA WALIDACJA FABRYKI (17/18.07) — WERDYKT: FABRYKA DZIAŁA

Cel nocy (Tomek): NIE stare pliki — FABRYKA ma robić wszystkie NASTĘPNE video najlepiej jak się da.

**Wdrożone tej nocy:** cv_precheck w bramce (HSV licznik egzemplarzy; hsv_calibrate; cv_reliable
— lekcja: pastelowy róż≈skóra, emisyjne RGB — maska bezużyteczna; białe łapie też PIANĘ jako
flagę „podejrzana klatka"); best-of-N w render.py (n=2 tylko mc/omnihuman); verdict.json +
sidecar .pass + montaz require_pass; refiner SeedVR2 = `refine.py` (chunki ≤4.8 s, mezzanine
720p bo proxy <8MB, 2× upscale → downscale 1080 = supersampling, re-mux audio; koszt REALNY
~$3-4/15 s — od megapikseli, patrz 0e pkt 4); fal.set_project()
(izolacja budżetu per projekt); ingest 0-cięć→1 scena; ostrzeżenie kolizji VO w montaz;
**katalog `docs/zbuduje/video-playbooks/`**: 3 playbooki per-archetyp + PROMPTY-BIBLIOTEKA
(w tym payloady audio i wariant FLF rotation/reveal) + PROCEDURA-OPERATORA (runbook z bramkami).

**WALIDACJA E2E (głośnik indukcyjny 5w1, operator WYŁĄCZNIE z dokumentacji): PASS za 1. pełnym
przebiegiem, $3.25.** Bramka zadziałała wzorcowo: REJECT sceny charge (morf głowicy + halucynowany
pręcik + glif baterii) → naprawa root-cause (re-projekt kadru, nie n=2) → PASS. Finał:
`C:\tmp\video-factory\glosnik\out\kreacja_15s.mp4`. 10 luk dokumentacji z raportu operatora
załatane tej samej nocy (reguła rozstrzygania archetypu „gadżet+prezenter→handsPOV"; payloady
audio; reguła VO>scena; samoakcept GATE A/B w trybie autonomicznym; functional_count jako
zestaw; dubel wzorów). Pętla walidacja→poprawki-do-fabryki DOMKNIĘTA.

## 0g. PĘTLA WYNIKÓW (18.07) — kreacja → Meta → wyniki → nauka do KART

Wniosek finalnego przeglądu (3 agentów): produkcja+jakość domknięte, ale bez danych z kampanii
hipoteza „kopiujemy wzorzec = dziedziczymy viralowość" była NIESPRAWDZALNA. Wdrożone szyny:
- **`wf2_creatives`** = rejestr kreacji z RODOWODEM (slug=katalog `projekty/<slug>`, archetyp,
  `pattern_tiktok_url`, engine_mix, koszt, `meta_ad_ids`, storage_path/public_url/variants);
  seed: 6 kreacji z 17-18.07. Artefakty tekstowe w git (`scripts/video-factory/projekty/`),
  finały w archiwum `wf2-video/video-factory/<slug>/` (bucket PRIVATE; finał dla panelu/Meta
  → PUBLICZNY `attachments/bud-assets/<slug>/ads/`).
- **`wf2-ads-sync`** (edge + cron `wf2-ads-sync-daily` 6:20): Graph API insights
  `level=campaign` (P&L; anty-podwójne liczenie) + `level=ad` z metrykami video
  (3s/p25-100/thruplay) → `wf2_ad_stats`; dopasowanie `creative_id` po `meta_ad_ids`;
  health-scan kont (account_status → alert w `wf2_activities`); wykluczenie konta Tomka
  act 1537… + log. **Wymaga sekretu `WF2_META_TOKEN`** (system-user, partner access BM) —
  do tego czasu zwraca `{skipped}` (cichy cron).
- **Widoki:** `wf2_creative_perf` (per kreacja: thumbstop=3s/impr, hold_50=p50/3s, p100_rate,
  ctr, purchases) i `wf2_pattern_perf` (per archetyp). Operator: PROCEDURA KROK 11.
Metryki-kompas kreacji: thumbstop (hook ≤2 s działa?) → hold_50 (demo trzyma?) → p100+ctr
(CTA domyka?). Decyzje kampanijne (KILL/skalowanie) = CENNIK-PLAN, NIE ta pętla.

## 0h. WARSTWA DŹWIĘKU DIEGETYCZNEGO (audyt 3 agentów 19.07 — jednogłośny brak #1)

Do 19.07 miks = TYLKO VO + muzyka. Prysznic bez szumu wody, zatrzask bez „klik", odkładany
telefon bez stuknięcia → mózg widza czyta „render/makieta", nie świat. Muzyka+VO = „reklama",
dźwięk diegetyczny = „rzeczywistość". Najboleśniejszy incydent: wzorzec słuchawki (32 mln plays)
był czystym ASMR WODY — sygnaturowy dźwięk produktu wypadł z pipeline'u w całości.

**Reguły (egzekwowane, nie sugerowane):**
1. **DŹWIĘK NA AKCJĘ** — każde WIDOCZNE zdarzenie fizyczne dostaje foley-hit na swoim
   timestampie (klik, woda-on, bit-seat, spust, posadzenie, tap). Blueprint: scena z akcją ma
   `has_physical_action: true` + listę `sfx[]`; **`montaz.py` ODMAWIA montażu** sceny z akcją
   bez sfx (bramka `require_sfx`, lustro `require_pass`).
2. **AMBIENT BED OBOWIĄZKOWY** — cichy ton świata per kreacja (echo łazienki, pomruk kabiny,
   room-tone biurka) na niskim gainie (~0.12) zabija „próżnię"; generuj ≥ długości kreacji.
3. **ASMR-HOOK**: gdy `wzorzec.audio_character = raw-diegetic/ASMR`, w hooku sygnaturowy
   dźwięk produktu JEST GŁOŚNIEJSZY niż muzyka (HOOK-STANDARD typ 2 to już mówił — teraz
   blueprint to realizuje).
4. **Miks**: SFX/ambient idą OSOBNĄ gałęzią (bez sidechain!) — dźwięk akcji nie może być
   duszony przez VO; hero-hity umiarkowanie, bed nisko. Generacja SFX: PROMPTY-BIBLIOTEKA (5b).
5. **Ludzka reakcja w hands-POV = DŹWIĘKIEM** (gasp, „o ja", westchnienie ulgi — pole
   `wzorzec.reaction_sound` w blueprincie), NIE doklejaną twarzą.
**Anty-reguły:** bez kreskówkowego sound-designu (dźwięk na każdy mikroruch), bez SFX
zagłuszających VO, bez trendujących ścieżek z TikToka (IP — audio ZAWSZE nasze).

## 0i. WIERNOŚĆ PRODUKTU: KONTRAKT + BRAMKA (feedback Tomka 19.07 — priorytet, budżet +20%)

Incydent drapek: mechanizm szufladki miał INNĄ KONSTRUKCJĘ niemal w każdej scenie (ramka /
recesowana wnęka / zsuwany panel; pozycja lewo/środek/prawo), a bramka to przepuściła — bo
ocenia per-klip, z pamięci, a `functional_count` jest ŚLEPY NA KSZTAŁT (1 pokrywa = 1 pokrywa,
nieważne że to ramka). Tomek: „tylko jedna scena pokazuje, jak działa produkt… to kluczowe,
żeby reklama działała, a nie odstraszała". System = PREWENCJA + BRAMKA na wspólnym kontrakcie:

**ZASADA NADRZĘDNA PROMPTÓW (Tomek 19.07): INTENCJA + REFERENCJE + ZAKAZY.**
Dobry model wie, jak pokazać produkt, jeśli go NAKIEROWAĆ — nadmiar poleceń go gubi.
Podział ról informacji:
- **JAK PRODUKT WYGLĄDA → WYŁĄCZNIE ZDJĘCIA** (packshoty/stany/lifestyle jako refy +
  „match the reference images exactly"). ZERO słownych opisów anatomii w promptach —
  tekst walczy z obrazem i bywa błędny (incydent: KARTA kłamała, model poszedł za tekstem).
- **CO SIĘ DZIEJE i JAK PRODUKT DZIAŁA → słowem** (akcja, intencja sceny, użycie —
  krótko, bez mikro-reżyserii detali).
- **CZEGO MA NIE BYĆ → negative/zakazy** (to zostaje twarde: morfy, ranty, zawiasy,
  brandy, duplikaty — mówimy jak video NIE ma wyglądać).
- Szczegółowe listy elementów/anatomii żyją w KARCIE jako **checklista BRAMKI** —
  bramka porównuje wynik z packshotem per-element; prompt tego nie recytuje.

**UMIEJSCOWIENIE UŻYCIA NA CIELE (incydent masażer 19.07: urządzenie na GARDLE zamiast
na KARKU — produkt wierny, użycie błędne):** wierność produktu ≠ wierność UŻYCIA. Reguły:
1. Sceny użycia na ciele mają w kontrakcie `placement_ref` = zdjęcie lifestyle z POPRAWNYM
   założeniem (obraz-kotwica umiejscowienia — zgodnie z doktryną: użycie też pokazujemy
   ZDJĘCIEM, nie tylko słowem) + `placement` słownie JEDNOZNACZNIE anatomicznie.
2. **Słownik anatomii PL→EN (dwuznaczności zakazane):** kark = "nape / back of the neck /
   upper trapezius, seen from behind-side" (NIGDY samo "neck" — model wybiera PRZÓD szyi,
   bo tam produkt widać); nadgarstek/łydka/lędźwie itd. — zawsze doprecyzowane stroną ciała.
3. **Bramka**: rubryka product_gate dostaje obowiązkowy wiersz per scena „UMIEJSCOWIENIE ==
   placement_ref?" — rozjazd = REJECT sceny (nawet gdy produkt idealny).

**PREWENCJA (generacja — zrób wiernie za 1. razem):**
1. **Per-frame packshot re-injection (ROOT-CAUSE, $0):** `last()` dostaje `[first, packshot
   właściwego STANU]` z rolą „Image 2 = EXACT product identity+state — correct any drift".
   (Drapek: last chainowany TYLKO z first = dryf wbudowany w kod.)
2. **PASZPORT MECHANIZMU** (`KARTA.product.mechanism_states{}`): obraz-ref per stan mechanizmu,
   wycięty z packshotów/LIFESTYLE (lifestyle-demo = często JEDYNY obraz realnego działania —
   drapek go w ogóle nie używał!). Scena→stan→ref, zawsze jako OBIEKT-ref (nie opis!).
3. **KONTRAKT PRODUKTOWY SCENY** (`blueprint.sceny[].kontrakt_produktowy`): stan mechanizmu
   per klatka, JEDEN kanon kąta na kreację, `skala_min_pct` (demo ≥55% szer. kadru),
   elementy_wymagane, `mechanizm_w_dzialaniu` (demo pokazuje ZMIANĘ STANU lub UŻYCIE, nie
   „produkt obok"), must_show/must_not_show (w tym anty-spoiler: wnęka zamknięta przed sceną
   nagrody). **Preflight-walidator: scena demo bez kontraktu = STOP przed generacją.**
4. **Inpaint-fix mechanizmu PRZED FLF** (~$0.04/klatka): klatka łamie kontrakt → nano-edit
   `[zla_klatka, ref_stanu]` „replace ONLY the mechanism to match Image 2" — taniej niż
   re-render Klinga. Max 3-4 refy/klatkę, każdy z JAWNĄ rolą (DOG/PRODUCT/MECHANISM/SURFACE).
5. **Stany powierzchni jako ref** (np. `scratched-surface`): efekty użycia (rysy!) generowane
   RAZ jako kanon — nie „białe kredowe bazgroły" wymyślane per scena.

**BRAMKA `product_gate.py` (KROK 7.5, po qa_gate, przed montażem):**
- **Kompozyty side-by-side** packshot|klatka (3-4/scena) — VLM porównuje 1:1, nie z pamięci.
- **Rubryka per-ELEMENT** (`KARTA.product.elements[]`): wiersz-na-element×klatka; werdykt
  sceny = min po elementach; ZAKAZ oceny zbiorczej „anatomia ok".
- **Kontrakt użycia**: brak must_show w scenie demo / obecny must_not_show = REJECT.
- **IDENTITY BOARD** (cross-scenowy — tego brakowało): jeden rząd = 2 packshoty-kotwice +
  crop produktu z KAŻDEJ sceny; wiersz-na-kafelek „ten sam przedmiot?"; NIESPÓJNY = REJECT
  scen odstających.
- **Werdykty**: `<klip>.fidelity.json` + `gen/fidelity_board.json`; `fidelity.pass` TYLKO gdy
  wszystkie sceny PASS + board CONSISTENT; **montaz `require_fidelity=True` ODMAWIA bez
  markera**; `select_best` dyskwalifikuje REJECT i sortuje po fidelity_score.
- PASS = wszystkie elementy WIERNE (konstrukcja+pozycja+kształt, nie tylko „jest") + kontrakt
  + spójność. „Ładne, ale konstrukcja inna" = REJECT, nie MINOR.
- Deterministyka przy `cv_reliable:false` = TYLKO floor (`size_floor`: produkt <8% kadru)
  i przesłanki; decyzję podejmuje VLM na kompozytach (czerń psa == czerń deski).
**Pętla naprawcza:** bramka zwraca listę defektów per-element → prewencja re-warunkowuje
(ref stanu do KAŻDEJ klatki, zaostrzone elementy) → regen TYLKO failujących scen; **≤2
regeneracje/kreację** w budżecie +20% (~$0.5-0.7: gate $0.05-0.15 + inpainty + 1-2 FLF);
3. porażka = eskalacja, nie loop-burn.
**Czego NIE robić:** zmiana silnika na v3 „dla spójności" (0e pkt 5) · refiner „żeby było
ładniej" · rotacje 360° (ghosting) · dosypywanie zdań do anatomy_str (mechanizm wchodzi
OBRAZEM) · >4 refy na klatkę · maska HSV na czarne/drewniane produkty.
**WALIDACJA v2 (19.07): NIEWYSTARCZAJĄCA — Tomek odrzucił.** Klatki kluczowe przeszły bramkę,
ale mechanizm psuł się W RUCHU między nimi (pokrywa unosiła się jak zawias; w połowie sceny
deska stawała się tacą z rantem). Lekcja meta: **bramka na rzadkich klatkach ≠ funkcja
w ruchu**. Pomniejsze: `size_floor` bezużyteczny na czarnym w high-key; pozycję elementu
weryfikuj na kompozycie (nie z pamięci — „wnęka na środku" była zgodna z packshotem).

**DOKTRYNA v3 „EDYTUJ PRAWDĘ" (19.07 — z jedynej udanej sceny: „raz się udało = przepis"):**
1. **Klatki produktowe = nano-EDYCJA PACKSHOTU** (dorysuj otoczenie/psa/dłoń WOKÓŁ realnych
   pikseli produktu; „keep the product EXACTLY as-is, add..."), NIGDY generacja produktu
   z opisu/refów. Piksele prawdy = geometria prawdy.
2. **PRODUKT STATYCZNY WEWNĄTRZ SCENY**: first i last sceny budowane NA TEJ SAMEJ bazie
   packshotu (stan identyczny; zmienia się TYLKO aktor/dłoń/rysy) — Kling nie ma czego
   morfować w produkcie.
3. **ZMIANA STANU MECHANIZMU = CIĘCIE + SFX, NIE ANIMACJA.** Ciągła transformacja mechaniczna
   to najsłabsza umiejętność video-modeli — tam rodzą się zawiasy/tace. Zamknięta → CIĘCIE
   (z sygnaturowym dźwiękiem, np. drewniane „szzzk") → otwarta. Montaż sprzedaje zmianę,
   dźwięk czyni ją realną. (Opcjonalny 1-s makro-insert dwóch stanów pośrednich = też CIĘCIE.)
4. **BRAMKA GĘSTA W RUCHU**: fidelity ocenia siatki 4-6 fps CAŁEJ sceny (nie first/mid/last);
   jawne zakazy per produkt (rant/taca, zawias, teleport wnęki). PASS klatek ≠ PASS sceny.

**0i-b. REFERENCE-TO-VIDEO — model WIDZI produkt w ruchu (research 19.07):**
Root-cause morfu: FLF dostaje 2 klatki + tekst — packshotu nie widzi nigdy. Na fal istnieje
klasa modeli z kotwicą tożsamości OBIEKTU przez cały klip:
- **`fal-ai/kling-video/o1/reference-to-video`** — GŁÓWNY kandydat na silnik scen
  produktowych (`kref`): `elements[{frontal_image_url: packshot, reference_image_urls:
  [3-4 widoki + stany mechanizmu]}]` + `image_urls[0]` = nasza nano-klatka „z prawdy"
  jako start frame („Take @Image1 as the start frame..."); 9:16, 3-10 s, **$0.112/s
  ($0.56/5 s)**. BEZ tail_image — kotwica tożsamości zamiast przypięcia końca.
- **`fal-ai/kling-video/o1/video-to-video/reference`** (`kmcref`) — Motion Control
  z kotwicą produktu (driving + elements, max 4 refy łącznie) — na halucynację
  „drugiego egzemplarza".
- **Vidu Q2 reference-to-video** (720p $0.30/klip, do 7 refów) — tani backup/cross-scene.
- Veo 3.1 reference = tylko hero/brand ($0.40/s); Wan VACE deprecated — NIE budować.
**Reguła doboru per scena:** wierność produktu w ruchu (demo/mechanizm/makro) → `kref`
(+multi-view refy!); precyzyjna kompozycja KOŃCA (loop-close, before/after) → FLF; kref
TYLKO na sceny, gdzie morf zabija sprzedaż (+~24% na kreacji przy 2 scenach). Refy
kumulują się z doktryną „edytuj prawdę" (start frame z realnych pikseli), NIE zastępują
jej; zmiana stanu mechanizmu NADAL cięciem (kotwica przybija tożsamość, nie fizykę
transformacji). Multi-view packshoty (front/3-4/bok/mechanizm-open) = najsilniejszy
pojedynczy fix po samym „daj referencję" — jeden frontal nie ogranicza geometrii 3D.
Refy czyste ≥1024px (upscale STILLA przed użyciem, bez przesharpienia). cfg ~0.5;
morfy do negative („hinged lid, tray rim, morphing construction").
**PILOT WYKONANY (drapek board, 19.07): kref WYGRYWA.** Ten sam brief i klatka startowa,
na której FLF halucynował otwarcie wnęki w ~3,3 s: Kling O1 z elements (frontal prod-closed
+ refy prod-open/lifestyle) utrzymał deskę IDENTYCZNĄ przez pełne 5 s (recenzja 20 klatek
4 fps: zamknięta pokrywa, stały szew/pętla, zero rantu/zawiasu), $0.56. **`kref` WDROŻONY
w render.py** (engine 'kref', EST 0.56). Vidu = backup nietestowany (odpalać tylko, gdy
kref zawiedzie na innym produkcie).

## 0j. RÓWNOLEGŁOŚĆ fal.ai — `gen_batch` (nie `gen()` w pętli) [pomiar 20.07]

- **LIMIT KONTA (zmierzony empirycznie 20.07): ~12 równoległych** jobów `IN_PROGRESS` (test:
  20× flux-pro submitnięte naraz → 12 biegło jednocześnie, 8 czekało `IN_QUEUE`; plateau=12).
  Zgodne z fal docs: nowe konto = 2, skaluje się **do 40** z zakupem kredytów (>40 = enterprise);
  to konto siedzi na ~12. Skrypty testowe: `scratchpad/conc_test*.py`.
- **KLUCZOWE: `submit()` (kolejka) NIGDY nie dostaje 429.** Nadmiar ponad limit czeka w `IN_QUEUE`
  ZA DARMO (kolejka nie liczy się do limitu), fal dyspozycjonuje gdy zwolni się runner → **submit-all
  jest bezpieczny niezależnie od limitu** (twardo: 10 jobów wisiało IN_QUEUE 90s+ bez błędu).
- **REGUŁA: pojedyncze generacje rób przez `fal.gen_batch(jobs)`, NIE `gen()` w pętli.** `gen()` jest
  BLOKUJĄCY (submit+poll+download naraz → klipy sekwencyjnie). `gen_batch` = uogólniony wzorzec
  render.py (submit WSZYSTKICH → poll-all → download): `jobs=[{model,payload,tag}]`, zwraca
  `{tag: ścieżka}` (gdy `outdir`) albo `{tag: wynik_dict}` (gdy `outdir=None` — własne nazwy/num_images>1).
  Odporność jak gen/render (4 transient z rzędu = `.failed`, dociągalny `reclaim`). CLI: `fal.py batch
  <jobs.json> <outdir> [proj] [maxN]`. **`render.py render_scenes()` JUŻ jest równoległy — nie ruszać.**
- **`max_parallel`**: `None` = submit wszystko (kolejka i tak trzyma limit). Na **WSPÓŁDZIELONYM koncie**
  ustaw `max_parallel` (okno PRZESUWNE, nie fale), by nie zająć wszystkich ~12 slotów i nie zagłodzić
  drugiej sesji — sensowny default 4-6 (zostawia sloty współlokatorowi).
- **PROJECT-PREFIX (problem z 20.07: ledger mieszał 2 równoległe sesje — moje hero + reklama innej
  sesji — po tagu):** równoległe zadania MUSZĄ używać RÓŻNYCH `project` (`gen_batch(..., project='hero')`
  lub `fal.set_project()`), inaczej koszty w ledgerze zlewają się po tagu. Atrybucja = suma `est_usd`
  po prefiksie tagu; **saldo prawdy = `fal.balance()`, NIE suma est** (billing propaguje ASYNC — delta
  before/after pojedynczego szybkiego testu bywa $0; licz kumulatywnie).
- **GDZIE UŻYĆ W FABRYCE:** (a) `render.py` klipy — ✓ już równoległe; (b) **`gen_audio.py`
  (VO+music+ambient+SFX, ~13 jobów/kreację) — DZIŚ sekwencyjne w pętli `gen()`, NAJWIĘKSZY zysk**
  (~3-4 min → ~30-60s): `gen_batch(outdir=None)` + download/postproc (ffmpeg trim SFX) per tag;
  (c) **`genframes.py` klatki nano-banana** — sekwencyjne: batchuj wszystkie `first` (niezależne), potem
  drugą falą wszystkie `last` (chainowane z uploadu first); (d) **przyszłe hero-video landingów**
  (klip per landing / warianty hooka) → gen_batch z `project=<slug>`.
- **OBRAZY gpt-image (wf2-gen → generate-image) — JUŻ RÓWNOLEGŁE:** bud-mockup / generate-campaign-batch /
  bud-landing-gen fan-outują przez `Promise.all`/`allSettled` (count:1 per obraz, N osobnych edge-inwokacji
  gpt-image-2 → równolegle). NIE bottleneck. (Jedyny sekwencyjny zakątek: JEDEN call generate-image
  z `count>1` + provider **gemini** pętli `for i<min(count,4)`; gpt-image-2 robi `n` w jednym callu
  server-side, a batch-callery używają count:1 — więc martwe. Zrównoleglać NIE trzeba.)
- **LEKCJA modeli ZIMNYCH:** obskurne preview (`fal-ai/ltx-video`) = brak ciepłych runnerów, wiszą
  w `IN_QUEUE` minutami (10 jobów, 90s+, zero dispatchu) — do fabryki brać CIEPŁE (Kling/nano-banana/
  flux/Wan/OmniHuman). Transient 503 na status-pollu się zdarza (test: 2/20) → dlatego gen_batch/gen/
  render tolerują 4 błędy z rzędu (job już OPŁACONY, dociągalny).

## 1. Stan wyjściowy (fakty z kodu, 17.07)

- **NIE MAMY pobranych plików mp4.** Radar trzyma wyłącznie LINKI: `bud_tt_products.tiktok_url`
  + `tt_shop.videos[]` (do 12 video per produkt: url, plays, likes, cover, author). Media w Storage
  to tylko okładki (`attachments/bud-covers/`) i packshoty (`bud-shop-imgs/`, `images_hosted`).
  → **Prerekwizyt #0: downloader mp4** (yt-dlp sprawdzony w repo przy reelsach,
  `scripts/generate-reels.py`). TikTok linki gniją — pobierać szybko po approve.
- Mamy za to unikatowy atut: **korpus zwalidowanych trendów z metrykami** (plays/likes/sold_count
  per video, ~194 approved) + **packshoty produktów** + galerie Ali (`gallery_curated`) + most do
  fabryki (`wf2_products.tt_product_id`). Generator to brakujące ogniwo: trend → kreacja reklamowa.
- Zero istniejących integracji z modelami video (grep: brak veo/kling/sora/runway).

## 2. Architektura rekomendowana: „STORYBOARD + FIRST-FRAME" (nie end-to-end prompt)

Nie istnieje model „weź mp4 + zdjęcie produktu → wierna kopia". Maksymalną wierność oryginałowi
daje pipeline hybrydowy — szkieletem jest ścieżka B (kontrola produktu i timingu), ścieżka A
(video-to-video) tylko punktowo:

1. **INGEST**: mp4 (yt-dlp) → **PySceneDetect** → lista scen (start/end/duration w ms) +
   metryki rytmu (cięcia/min — viralowe TikToki: 8–15 cięć/min, hook w 1–2 s).
2. **DEKONSTRUKCJA** (vision: Gemini/Claude per scena): typ ujęcia, ruch kamery, tekst na ekranie
   (OCR + timing), rola sceny (Hook / Problem / Demo / Proof / CTA) → **BLUEPRINT** (beat map, JSON).
   Blueprint to abstrakcyjny SCHEMAT — nie kopiujemy pikseli oryginału, odtwarzamy strukturę.
3. **PASZPORT PRODUKTU**: 2–3 czyste packshoty z `images_hosted`/`gallery_curated`
   (te same zasady co w fabryce: obiekty {url,type:'product'}, NIGDY string-refy —
   lekcja incydentu 17.07).
4. **GENERACJA per scena** — silnik dobierany do typu ujęcia:
   - kadr statyczny / prosty ruch → **first-frame trick**: generujemy/edytujemy pierwszą klatkę
     sceny z REALNYM packshotem (Nano Banana / Flux Kontext / gpt-image-2), potem
     image-to-video na długość sceny. To jedyna droga do wiernej etykiety/kształtu produktu.
   - złożony ruch kamery → video-to-video restyle (Runway Aleph / Luma Modify / Wan VACE),
     tylko gdy first-frame nie wystarcza; UWAGA: v2v przerysowuje produkt.
   - produkt w wielu scenach → reference-to-video (Kling Elements / Vidu multi-ref).
5. **AUDIO**: NIE kopiujemy oryginalnej ścieżki (trendujący dźwięk = brak licencji do reklam).
   Voiceover ElevenLabs wg skryptu z blueprintu + muzyka z biblioteki komercyjnej;
   natywne audio Veo/Kling tylko jako ambient/SFX.
6. **MONTAŻ** (ffmpeg, deterministyczny): sceny sklejone w ORYGINALNYM timingu (te same
   długości ms = ten sam rytm), tekst na ekranie w tych samych momentach, napisy, CTA.
7. **GATE JAKOŚCI + COMPLIANCE**: (a) wierność produktu — gate vs REALNE zdjęcie (jak w fabryce,
   pętla poprawek do wyczerpania); (b) zakaz przeniesienia chronionych elementów oryginału
   (twarz, logo konkurenta, tło 1:1, audio); (c) **obowiązkowe oznaczenie AI** — Meta i TikTok
   wymagają disclosure dla „AI-modified product demonstration" (to dokładnie nasza kategoria);
   brak → odrzucenie reklamy, recydywa → restrykcje konta.

Zasada prawna wbudowana w design: **format/schemat nie podlega ochronie, wykonanie tak**.
Pipeline REGENERUJE (nasze ujęcia, nasz produkt, nasze audio wg cudzego schematu), nie PRZEKLEJA.

## 3. Modele i koszty (zweryfikowane 17.07, ceny API/fal.ai)

| Rola w pipeline | Model | Cena | Uwagi |
|---|---|---|---|
| **Koń roboczy i2v** | Kling 2.5 Turbo Pro (fal.ai) | ~$0.07/s → $0.70/10 s | najlepszy stosunek jakość/cena, Elements do spójności produktu |
| **Premium i2v + audio** | Veo 3.1 Fast (Gemini API) | $0.10–0.12/s → ~$1.20/10 s | 3 obrazy ref, natywne audio; Standard $0.40/s tylko do hero-kreacji |
| **Budżet / wolumen** | Wan 2.5 (fal.ai) | $0.05/s → $0.50/10 s | najtańszy z audio |
| **Multi-ref produktu** | Vidu Q2/Q3 (fal.ai) | ~$1.30/10 s (Q3 taniej) | do 7 referencji, najlepszy cross-shot consistency produktu |
| **V2V restyle (punktowo)** | Runway Aleph / Wan VACE | Gen-4 Turbo $0.05/s | trzyma ruch kamery i timing 1:1 |
| **First-frame edit** | Nano Banana / Flux Kontext / gpt-image-2 | grosze/klatka | podmiana produktu w klatce z zachowaniem światła |
| **UGC „gadająca głowa"** | OmniHuman 1.5 (fal.ai) | $0.16/s → ~$1.60/10 s | awatar z 1 zdjęcia + audio |
| **Voiceover** | ElevenLabs | grosze/klip | standard broadcast, PL OK |

**Koszt jednego GOTOWEGO video reklamowego (15–30 s, 4–6 scen):**
- stack budżetowy (Kling/Wan + first-frame): **$1.50–3 za surowy przebieg**;
  z retry ×2–3 na sceny (realizm z fabryki obrazów) → **~$4–8 ≈ 15–30 zł**.
- stack premium (Veo 3.1 Standard na hero-sceny): do ~$15–25 ≈ 60–100 zł.
- dekonstrukcja + montaż: pomijalne (<$0.20).
- Wniosek biznesowy: **kreacja video za ~20 zł vs UGC-twórca $50–500** — testy A/B hooków
  stają się tanie; wariantować hook (pierwsze 2 s) przy wspólnej reszcie = najtańsza iteracja.

Agregator: **fal.ai jako jedna integracja** (Kling, Wan, Vidu, Seedance, Hailuo, OmniHuman,
Veo, Sora pod jednym API + webhooki) — krytyczne, bo edge functions mają wall-clock 400 s,
a generacje video bywają dłuższe → wzorzec: job queue + webhook/polling, NIE synchroniczny call.

## 4. Ryzyka i wątki, które trzeba mieć na radarze

1. **Wierność etykiety** — żaden model nie gwarantuje drobnego tekstu na opakowaniu; first-frame
   trick z realnym packshotem to mitygacja, ale wymaga walidacji na NASZYCH produktach (pilot).
2. **Ruch kamery z 2 klatek** — złożone ujęcia (orbit, whip-pan) mogą wymagać v2v; koszt+dryf produktu.
3. **Prawa**: schemat OK, ale NIE przenosić twarzy/scenografii/logo/audio oryginału. Przy skali —
   konsultacja IP. Trendujący dźwięk → zamiennik z Commercial Music Library.
4. **Oznaczanie AI**: Meta + TikTok wymagają etykiety (C2PA); wbudować jako obowiązkowy krok,
   nie opcję. Sora-app ma widoczny watermark — używać API, nie aplikacji.
5. **Polityki treści**: Sora restrykcyjna na marki/IP; produkty beauty/health (nasza nisza!) mogą
   wpadać w dodatkowe polityki reklamowe Meta (before/after, claims zdrowotne) — dekonstrukcja
   musi flagować ryzykowne claimy z oryginału zamiast je kopiować.
6. **Gnicie linków TikTok** — video znikają/prywatnieją; pobierać mp4 przy approve w /trendy
   (hook obok bud-tt-rehost), bucket prywatny (cudzy content = materiał badawczy, nie do publikacji).
7. **Ceny/wersje modeli zmieniają się co tygodnie** — decyzję o modelu podejmować na poziomie
   konfiguracji (settings), nie hardkodu; pilot przed commitem do jednego dostawcy.

## 5. Program pracy agentów badawczych (Sonnet 5) — faza MATERIAŁ

Każdy agent = osobne, samowystarczalne zadanie z konkretnym artefaktem wyjściowym.
Zrobione 17.07: ✅ R-A modele+ceny, ✅ R-B techniki replikacji (wyniki wyżej).

- **R1 — Downloader i korpus** (agent + kod): niezawodne pobieranie mp4 z TikToka w skali
  (yt-dlp: sukces %, anti-bot, alternatywy ScrapeCreators/oEmbed), polityka storage (prywatny
  bucket `bud-tt-videos/`), pobranie korpusu startowego: top ~30 approved wg product_score.
  Artefakt: działający skrypt + 30 mp4 w storage + tabela pokrycia.
- **R2 — Taksonomia schematów** (agent z vision): przepuścić korpus przez PySceneDetect +
  opis vision → ile FORMATÓW faktycznie żyje w naszej niszy (unboxing, problem-solution,
  ASMR-demo, before/after, „TikTok made me buy it", talking-head)? Rozkład: długości, cięcia/min,
  typ hooka, rola tekstu na ekranie, obecność twarzy. Artefakt: BLUEPRINT-SCHEMA.json (format
  zapisu schematu) + katalog blueprintów korpusu + ranking formatów wg metryk (plays/sold).
- **R3 — Pilot wierności produktu** (agent + API fal.ai): ten sam brief + packshoty 3 naszych
  produktów (łatwy/średni/trudny — np. z etykietą tekstową) × 4 modele (Kling 2.5, Veo 3.1 Fast,
  Wan 2.5, Vidu Q2). Ocena: wierność kształtu/etykiety, dryf między scenami, koszt realny z retry.
  Artefakt: macierz wyników + rekomendacja konia roboczego. Budżet: ~$20–30.
- **R4 — Pilot first-frame** (agent + generate-image/fal): podmiana produktu w klatce oryginału
  (Nano Banana vs Flux Kontext vs gpt-image-2) + i2v z tej klatki. Mierzymy: czy kadr/światło
  oryginału przeżywa, czy etykieta czytelna po animacji. Artefakt: raport + najlepszy przepis.
- **R5 — Compliance operacyjne** (agent researchowy): JAK technicznie oznaczyć AI w Meta Ads
  Managerze i TikTok Ads (gdzie klikać/jakie pole API), polityki kategorii beauty/health/gadżety,
  C2PA w praktyce (czy pliki z fal.ai/Veo niosą metadane). Artefakt: checklist publikacji kreacji.
- **R6 — Architektura w tn-crm** (agent Plan): job queue na generacje (tabela `video_jobs`,
  webhook fal.ai → edge, deadline'y, koszty per job logowane jak w fabryce), panel podglądu
  kreacji przy produkcie w /trendy lub /tn-sklepy, konfiguracja modeli w settings.
  Uwzględnić: edge wall-clock 400 s, pg_cron timeout 5 s, sekrety przez digest.
  Artefakt: plan implementacji (SSOT GENERATOR-VIDEO-PLAN.md).

Kolejność: R1 → (R2 ∥ R3 ∥ R4) → R5 ∥ R6 → decyzja Tomka → implementacja.
R2–R4 to serce: bez zwalidowanej wierności produktu nie budujemy automatu.

## 6. Otwarte decyzje Tomka

1. Zakres pilota: które 3 produkty do R3/R4 (propozycja: top score z różną trudnością etykiety).
2. Budżet pilota (~$30–50 łącznie R3+R4) — zielone światło?
3. Gdzie żyje generator docelowo: przycisk przy produkcie w /trendy, etap „Kampanie" w
   /tn-sklepy/projekt, czy oba?
4. Czy kreacje mają też zasilać makiety/landing (spójny key visual), czy video niezależne?
