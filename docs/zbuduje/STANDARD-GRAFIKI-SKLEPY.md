# STANDARD-GRAFIKI-SKLEPY — fabryka statycznych grafik reklamowych FB/IG (workflow v2 „Sklepy")

**Status: OBOWIĄZUJE — wersja 1.0 (2026-07-19, decyzja Tomka „albo Manus, albo ma się nie
wykonać" + zestaw startowy = ŁĄCZNIE 3 kreacje 4:5).** SSOT kroku `ads_grafiki` (Etap 5
„Materiały i kampania"). Struktura wzorowana 1:1 na `STANDARD-LANDING-SKLEPY.md` (Z1–Z8, fazy
F0–F8) i `GENERATOR-VIDEO-STRATEGIA.md` (0–0j). Research FB/IG 2026 + wzorce fabryk landingów
i wideo — źródła na końcu. **Wykonawca zaczyna od: „przeczytaj CAŁY ten standard".**

**🎯 Cel: grafiki mają SPRZEDAWAĆ i uczyć fabrykę. Zestaw = 3 koncepcyjnie różne reklamy do
testu A/B, każda wierna produktowi i landingowi, mierzona po publikacji.** Kontekst: ~90% ruchu
mobile z Reels/FB (impuls), rynek PL (lęk #1 = scam), checkout na osobnej domenie platformy,
COD dostępny. Statyk to wciąż 60–70% konwersji Meta dla tanich gadżetów impulse-buy/COD i
najtańsze A/B (swap w minuty). Dla płatnego ruchu grafika jest AMUNICJĄ — musi być tania
w produkcji, ale nigdy tania w jakości.

**Dwutorowość (D1):** silnik generacji = edge `wf2-ads` (Manus; mechanika odporności/timeoutów/
sweep/locków NIETYKALNA). Jakość = proces operatora Claude Code — fazy **G0–G8**, bramki
z dowodami, emisje do panelu przez `scripts/mockup-tools/panel-sync.py` (kontrakt
`docs/zbuduje/MOST-PANEL.md`). Bramka QA (deterministyczne pomiary) = `scripts/mockup-tools/ad-gate.py`.

---

## 0. ZASADY NADRZĘDNE ZG1–ZG9 (rozstrzygają każdy konflikt niżej)

**ZG1 — MESSAGE MATCH z landingiem.** Reklama kontynuuje rozmowę, którą kończy landing: ten
sam ból, ta sama obietnica, ten sam key visual (ujęcie produktu, paleta, wordmark z KARTY
PRAWDY), ta sama oferta/cena. Hook grafiki = echo hero landingu; jeśli landing ma mapę
`HOOKS={1..3}` (`?h=N`), kreacja danego kąta linkuje `?h=N` z hookiem pasującym do jej headline.
CTA kampanii (gdy pojawia się na grafice — „Kup teraz", element OPCJONALNY wg rev3) = pierwszy
krok na landingu (zamów/COD). Dryf głosu/wizualu/obietnicy
przy skali (3 dryfy z Motion) łapie KARTA PRAWDY + bramki — nie budujemy osobnej narracji reklamy.

**ZG2 — 🖼️ WIERNOŚĆ PRODUKTU ŚWIĘTA (doktryna „edytuj prawdę").** Produkt na grafice = pikselowa
prawda z referencji, nie reimaginacja z opisu. **Referencje = OBIEKTY `{url,type}`, NIGDY stringi**
(string-ref jest gubiony po cichu — cała fabryka generowała bez referencji do 17.07). Manus
dorysowuje TŁO / scenę / tekst WOKÓŁ realnych pikseli produktu; kształt, kolor, materiał,
proporcje, etykieta = 1:1 z landingiem („the product from the reference images, kept EXACTLY
as-is"). **Anatomia produktu żyje w BRAMCE (checklista `PASZPORT.md` § „Cechy dyskryminujące"),
NIE w tekście promptu** (rewizja 19.07: słowny opis wyglądu walczy z obrazem i bywa błędny —
incydent Karty drapka). Do promptu idzie: NAZWA + REFERENCJE-OBRAZY + AKCJA/intencja + ZAKAZY.

**ZG3 — RÓŻNORODNOŚĆ: 3 kąty = 3 BYTY.** Zestaw to test A/B — 3 grafiki muszą być KONCEPCYJNIE
różne (inny layout, inne tło/paleta, inny charakter typografii, inna rola produktu), nie 3
re-skiny jednego szablonu. **Andromeda skleja wizualnie podobne ady w jeden „byt"** (10
wariantów tej samej grafiki konkuruje o 1 slot) → dwie podobne kreacje = test nic nie mierzy.
Różnorodność jest MIERZONA (pHash pairwise, `ad-gate.py`) i bramkowana (ZG7/G5).

**ZG4 — UCZCIWOŚĆ = KONWERSJA (rynek PL).** COD jako risk-reversal (badge „Płatność przy
odbiorze" — wg rev3 OPCJONALNY na grafice, dodawany tylko gdy wzmacnia kompozycję; domyślnie
żyje w copy kampanii), zero fałszywej pilności/countdownów, zero zmyślonych liczb. **Każda
liczba na grafice pochodzi WYŁĄCZNIE z danych produktu z kotwicą:** cena z `lp_dane.fields.cena_pl`,
oceny/`review_stats` TYLKO gdy `ali_snapshot.source='detail'` (search-galeria = inny produkt).
Brak twardej liczby = grafika obywa się bez niej (jakościowy komunikat), nigdy zmyślanie.
`sold_volume` wg §sold KARTY PRAWDY (liczba Ali GLOBALNA ≠ nasz sklep → licznik/„X sprzedanych
u nas" = FAŁSZ = ZAKAZ). `shop{}` (nazwa sprzedawcy Ali) 🚫 NIGDY na grafice (white label).

**ZG5 — DZIEDZICZENIE BRANDU (nie duplikować źródła prawdy).** Grafiki żyją na TYM SAMYM
`wf2_products` co landing → `KARTA-PRAWDY.md` (F0.6) i `PASZPORT.md` są już zbudowane. Grafika
dziedziczy DNA marki: **(a)** logo mini-marki (`wf2_artifacts` kind='branding' / `brand_dir`
→ `logo-combo.png`) umieszczone 1:1, 8–12% wysokości, niecentralne; **(b)** `styl_master_url`
jako attachment referencyjny stylu; **(c)** paletę + fonty z `wf2_steps[lp_styl_marka].data.fields`
(klucze `paleta`, `font`/`fonty` — czytać tolerancyjnie); **(d)** URL landingu live
(`wf2_products.platform_page_url`) z instrukcją „wejdź, przeanalizuj hero/paletę/ton, dopasuj
message match". Branding z KARTY PRAWDY WYGRYWA z modą (spójność > „neon pod feed"), ale CTA/hook
MUSI mieć wysoki kontrast do feedu — akcentu nie chować w pastelu.

**ZG6 — TEKST-NA-GRAFICE = RYZYKO #1.** To defekt klasy #1 grafik (analog „pseudo-glifów"
z wideo): AI miesza polskie diakrytyki i scramble'uje wyrazy. Reguły: renderuj TYLKO krótki
tekst — przede wszystkim WIELKI hook/headline (**2–4 słowa**, do 6 dopuszczalne, ≤~27 znaków);
przycisk „Kup teraz" i badge ≤3 słowa są OPCJONALNE (rev3 — tylko gdy wzmacniają kompozycję,
minimalizm = premium), poprawna polszczyzna z diakrytykami, ZERO akapitów/fine-printu na grafice,
tekst ≤~20% płótna (algorytm down-weightuje tekst-heavy mimo zniesienia formalnego limitu).
**„Drop the badge rather than render broken letters"** — jak renderowany tekst byłby niepewny/
połamany, zostaw SAM WIELKI hook, resztę napisów (badge/pigułkę/checkmarki) odpuść. Nigdy słowo
z literówką/scramble. Egzekwuje bramka G4.

**ZG7 — BRAMKI ROZSTRZYGAJĄ, NIE AUTOR (dowody, nie deklaracje).** Jakość grafiki potwierdza
DOWÓD-PLIK (side-by-side, miniatura @320px, raport pHash), nie zdanie operatora „wygląda dobrze".
Bramki G3–G5 są NIESAMOAKCEPTOWALNE: wierność ma DWIE pary oczu (pass-1 generator + pass-2
ŚWIEŻY agent Sonnet bez kontekstu i werdyktu-1; rozjazd = NIEZGODNA). Werdykt = artefakt w
`bud-assets/<slug>/ads/dowody/`, nie notatka z pamięci.

**ZG8 — EMOCJA↔PRODUKT (transfer twardy z PRZEWODNIK-GRAFICZNY).** **Nasz produkt pojawia się
TYLKO w kadrach POZYTYWNYCH / rozwiązania** (demo w akcji, `lifestyle` — scena „z życia" persony,
efekt/„po", oferta, packshot, CTA).
**Kąt/kadr „problem" pokazuje BÓL BEZ naszego produktu** — stary sposób, frustrację albo sam
problem. ⛔ Nasz produkt NIGDY w sąsiedztwie negatywnej emocji (strach/stres/walka/opór/ból) —
oko czyta „to ON jest źródłem stresu" niezależnie od copy (incydent Drapek: pies kulący się przy
NASZEJ desce). Przejście „przed→po" rozgrywa się przez rolę produktu w kompozycji, nie w jednym
before/after w kadrze. Obecny prompt „produkt jako naprawa problemu" TO ŁAMIE — kąt problem
poprawiony wg D4 (patrz `PLAYBOOK-ad-problem.md`).

**ZG9 — MANUS ALBO NIC (D2b — zero silników zastępczych).** Silnik generacji = **WYŁĄCZNIE
Manus** (decyzja Tomka 19.07). NIE ma fallbacku Gemini ani gpt-5.1-copy — cały ten tor wycięty
z `wf2-ads`. **Tryby awarii = kontrolowany STOP, nigdy cicha degradacja jakości:**
- kill-switch `WF2_ADS_MANUS_ENABLED`≠1 lub brak `MANUS_API_KEY` → edge zwraca **503**
  („generator wyłączony") BEZ generacji;
- brak kredytów / timeout >32 min / sweep >40 min / 0 obrazów → `ads_manus_status='failed'`
  + `ads_manus_step` z powodem + alert Slack + **ŻADNEJ generacji zastępczej**;
- breaker: `failed` → STOP (kolejne wywołania zwracają failed z komunikatem o resecie).
- **Wznowienie WYŁĄCZNIE ręczne:** operator/Tomek doładowuje kredyty Manus i resetuje breaker
  w panelu (przycisk „Reset (po doładowaniu kredytów)" → zeruje `ads_manus_status/step/task_id/
  started_at`); dopiero potem `force:true` generuje od nowa. Awaria generatora = brak grafik,
  nie gorsze grafiki.

---

## 1. FAZY FABRYKI (G0→G8; wykonawca = agent-operator; silnik = edge wf2-ads/Manus)

**§1-sync — 🔌 EMISJA DO PANELU (część DEFINICJI DONE każdej fazy).** Fabryka pracuje w plikach/
edge; panel `/tn-sklepy → projekt.html` = jedyne okno Tomka na postęp. Reguła nadrzędna z fabryki
wideo obowiązuje tu 1:1: **brak emisji = etap niezaliczony.** Po wskazanych fazach operator emituje
przez `panel-sync.py` (import `panel_sync as ps` — payloady PL bez pułapki cp1250, albo CLI):
awans sub-kroku `step_update(...)`, artefakty oglądalne `artifact_add(...)`, koszt `cost_add(...)` (⚠ NIE dla Manusa — koszt generacji
loguje EDGE sam przy pullu; patrz §6), wpis osi czasu `activity_add(...)`. Mapa faza→sub-krok `agr_*` = sekcja „EMISJE DO PANELU" niżej.
Checklisty = tekst **VERBATIM** z obiektu `WS.ads_grafiki` w `projekt.html` (panel merguje po
dokładnym `t` — literówka/„ulepszenie" = sierota).

### G0 — WEJŚCIE (dziedziczenie z fabryki landingu)
**Cel:** zebrać całe DNA bez budowania drugiego źródła prawdy.
**Wejście:** produkt `wf2_products` (ten sam co landing), `KARTA-PRAWDY.md` + `PASZPORT.md`
(F0.6 landingu — DZIEDZICZONE), brand (`logo-combo.png`, paleta, fonty, `styl_master_url`),
landing URL live (`platform_page_url`), gate `ali_snapshot.source='detail'`.
**Kroki:** (1) potwierdź `source='detail'` — inaczej liczby/`review_stats` są zablokowane
(ZG4); (2) wczytaj tabelę „Cechy dyskryminujące" z PASZPORTU = checklista bramki G3; (3) ustaw
referencje produktu jako OBIEKTY (`buildProductRefs` → `{url,type:'product'}`); (4) zbierz brand
(logo/paleta/fonty/styl-master/landing URL).
**Bramka G0 (T/N):** [T] karta+paszport istnieją · [T] `source='detail'` · [T] ≥1 czysta
referencja produktu jako OBIEKT · [T] logo + paleta + landing URL dostępne. Którekolwiek [N]
→ STOP (uzupełnij fazę F0 landingu, nie zmyślaj).
**Emisja:** `agr_brief` → `in_progress`; `activity_add('ads_start', ...)`.

### G1 — BRIEF PER KĄT
**Cel:** 3 briefy = 3 koncepcyjnie różne byty, każdy zakotwiczony w prawdziwych bólach.
**Kroki:** dla każdego z kątów `demo` / `problem` / `lifestyle` (zestaw domyślny; `proof` jest
OPCJONALNY — patrz `PLAYBOOK-ad-proof.md` — i wchodzi TYLKO na jawne `body.angles:['proof']`)
otwórz właściwy playbook
(`ad-playbooks/PLAYBOOK-ad-<angle>.md`) i wypisz: rolę/hook (echo hero landingu; hooki z
`lp_plan` jeśli są), WIELKI hook/headline PL 2–4 słowa (do 6), badge (TYLKO prawdziwy, OPCJONALNY
na grafice), primary_text 2–3 zdania,
rolę produktu w kompozycji (ZG8 — dla `problem` produkt POZA strefą bólu). Brief = INTENCJA +
REFERENCJE-OBRAZY + ZAKAZY, bez recytacji anatomii (ZG2).
**Bramka G1 (T/N):** [T] 3 różne kąty · [T] każdy headline ≤6 słów, PL, korzyściowy · [T] brief
`problem` jawnie WYKLUCZA nasz produkt ze strefy bólu · [T] każda liczba ma kotwicę w karcie ·
[T] każdy badge prawdziwy. → dowód: `BRIEF-ADS.md` (repo/desktop).
**Emisja:** `agr_brief` → `done`; note „3 kąty · hooki: …"; `artifact_add(kind='doc', BRIEF-ADS.md,
storage='repo')`.

### G2 — GENERACJA (edge wf2-ads / Manus)
**Cel:** wygenerować ŁĄCZNIE 3 kreacje w JEDNYM tasku Manusa.
**Kroki:** invoke `wf2-ads {product_id, force?}` (default `angles=['demo','problem','lifestyle']`,
`formats=['45']`). Manus: 1 task = 3 pliki `ad_1_demo.png` / `ad_2_problem.png` / `ad_3_lifestyle.png`
(4:5, 1080×1350) + `campaign.json`. Poll status; przy `running` link `https://manus.im/app/{task_id}`.
Edge waliduje `angles` białą listą `demo`/`problem`/`lifestyle`/`proof`; `proof` (opinie/liczby) =
OPCJONALNY, wchodzi TYLKO na jawne `body.angles:['proof']` (decyzja Tomka 19.07: zero grafik z opinii
w defaultach — zamiast `proof` idzie `lifestyle`).
**⚠️ ZG9:** jeśli edge zwraca 503 („generator wyłączony") lub `failed` → NIE ma ścieżki
zastępczej. Zgłoś stan, poczekaj na ręczny reset (kredyty). Nie generuj niczym innym.
**Bramka G2 (T/N):** [T] `ads_manus_status='completed'` · [T] 3 pliki obecne · [T] `campaign.json`
z 3 wpisami `{angle,headline,badge,primary_text}`. [N] → faza `agr_generacja` = `blocked` + powód.
**Emisja:** `agr_generacja` → `done` (lub `blocked` przy failed); note z task_id; `artifact_add
(kind='link', url=manus.im/app/{task_id})`; **koszt Manusa loguje EDGE automatycznie przy pullu**
(`wf2_costs` kind='manus', step_key='ads_grafiki') — operator NIE emituje `cost_add(kind='manus')`
(dublet: dedup po `note` nie złapie, bo noty się różnią → zawyżony koszt w nagłówku bloku); najwyżej
WERYFIKUJE, że wiersz kosztu istnieje.

### G3 — BRAMKA WIERNOŚCI (dwie pary oczu)
**Cel:** żadna kreacja nie sprzedaje nieistniejącego produktu.
**Narzędzie:** `ad-gate.py <katalog_png> --out dowody/` (miniatury + pomiary) + werdykt agentowy.
Wejście: surowe pliki Manusa `ad_<n>_<angle>.png` LUB kanoniczne rehosty `ad_<angle>_<fmt>.png`
(parser rozpoznaje OBIE konwencje — inaczej kąt='?' i bramka różnorodności ZG3 nic nie mierzy).
Dla KAŻDEJ kreacji: kompozyt side-by-side `packshot | kreacja` vs tabela „Cechy dyskryminujące"
paszportu, **cecha-po-cesze**. **DWIE PARY OCZU:** pass-1 = agent generujący, pass-2 = ŚWIEŻY
agent Sonnet bez promptu i werdyktu-1. Rozjazd par = NIEZGODNA.
**Bramka G3 (T/N, per kreacja):** [T] kształt/proporcje/profil zgodne (cecha PRODUKTU = NIGDY
waivable) · [T] kolor/materiał zgodne · [T] etykieta/branding produktu zgodne · [T] obie pary
zgodne. FAIL cechy produktu → regeneracja celowana (G2 force) max 3 rundy → eskalacja
(inna referencja / nota Tomka). Kąt `problem` bez produktu w kadrze = klasa S-kontekst — gate
cech produktu jej nie dotyczy, warunek = 0 forbidden + rola = „przed" (nota „scena bez produktu").
→ dowód: `dowody/AD-<angle>.png` + werdykt w `dowody/WIERNOSC-ADS.md`.

### G4 — BRAMKA TEKSTU / CZYTELNOŚCI
**Cel:** żadnej połamanej polszczyzny; headline czytelny w kciuku.
**Narzędzie:** `ad-gate.py` (miniatury @320px + pHash; overlay safe-zone TYLKO dla `*_916*` — dla
domyślnego zestawu 4:5 skrypt NIE liczy marginesu ani kontrastu) + odczyt agentowy tekstu.
**Margines ≥8% i kontrast ≥4.5:1 dla 4:5 = werdykt agenta na miniaturze @320px, nie pomiar skryptu.**
**Bramka G4 (T/N, per kreacja):** [T] headline czytelny jako miniatura @320px · [T] zero
pseudo-glifów/scramble; diakrytyki poprawne (Read grafiki + porównanie z `campaign.json`) ·
[T] tekst i logo ≥8% od krawędzi (nic przyciętego) · [T] kontrast tekst/tło ≥4.5:1 · [T] tekst
≤~20% płótna · [T] JEDNA obietnica na grafikę. FAIL tekstu → regeneracja LUB fallback ZG6
(zostaw SAM WIELKI hook, drop badge/pigułkę/checkmarki). → dowód: `dowody/ad_<n>_<angle>_320.png` +
`dowody/report.json`.

### G5 — BRAMKA POLITYKI + RÓŻNORODNOŚCI
**Cel:** zestaw przejdzie Meta i realnie mierzy 3 warianty.
**Bramka G5 policy (T/N, per kreacja):** [T] zero personal attributes („Masz problem z…",
„Wstydzisz się…") · [T] zero before/after wellness (w tym implied „produkt obok zdrowej osoby")
· [T] zero słów-triggerów (cure/treat/„gwarantowane rezultaty"/„efekt w 24h"/„natychmiastowa
ulga") · [T] blocklista `ADS-BLOCKLISTA-PL.md` czysta · [T] zero obcych logo / TikTok UI · [T]
`lifestyle` = scena UGC „z życia" (ciepła, autentyczna, produkt w użyciu), NIGDY stockowy uśmiech/
studyjna perfekcja/elementy UI · [T] **gdy w zestawie jest OPCJONALNY `proof`:** `proof` = AI-prezenter
demonstrujący, NIGDY fałszywy testimonial-człowiek · [T] flaga AI ustawiona
(`ai_labeled=true`). **Bramka różnorodności (T/N):** [T] pHash pairwise między 3 kątami ≥ próg
(3 różne byty — próg w `ad-gate.py`) · [T] 3 różne layouty/palety/role produktu. FAIL różnorodności
→ regeneracja najbliższej pary z innym playbookiem. → dowód: `dowody/report.json` (pHash) +
`dowody/POLITYKA-ADS.md`.

### G6 — AKCEPT TOMKA W PANELU (bramka ludzka per kreacja)
**Cel:** człowiek decyduje, które kreacje idą na Meta.
**Kroki:** w panelu (galeria 3 kreacji, badge kąta + „AI", lightbox) Tomek toggluje ✓/✗ per
kreacja (zapis `approved` w `wf2_products.ads_creatives`, team RLS). **Tryb autonomiczny (nocny):**
operator sam akceptuje i LOGUJE decyzję (retro-akceptacja wg pamięci fabryki — Tomek nie jest
bramką klikania; realną egzekwowalną bramką są G3–G5, których nie wolno samo-zaakceptować).
**Bramka G6 (T/N):** [T] ≥1 kreacja `approved=true` (inaczej brak amunicji do publikacji).
**Emisja:** `agr_qa` → `done`; note-tabela werdyktów G3–G5 („3/3 wierność PASS; pHash OK;
zaakceptowano 2/3"); **PUBLIC** dowody → `bud-assets/<slug>/ads/dowody/` (`artifact_add(kind='proof')`).

### G7 — REJESTR + EMISJE
**Cel:** rodowód każdej kreacji trafia do bazy (inaczej fabryka jest ślepa na skuteczność).
**Kroki (robi edge po sukcesie Manusa, operator weryfikuje):**
- **Blob (panel/back-compat):** `wf2_products.ads_creatives` elementy `{angle,format:'45',
  headline,primary_text,badge,image_url,approved}`.
- **Rejestr:** UPSERT `wf2_creatives` per kreacja (slug `${productSlug||productId}-ad-${angle}-45`):
  `media_type='image'`, `angle`, `format='45'`, `ai_labeled=true`, `status='ready'`, `public_url`,
  `project_id`, `product_id`, `cost_usd = koszt_taska / liczba_grafik`, `meta={engine:'manus',
  headline,badge}`. Po publikacji Meta dopisz `meta_ad_ids` + `status='published'` (bez tego
  `wf2-ads-sync` nie dopasuje statystyk — kreacja niemierzalna).
- **Artefakty:** INSERT/refresh `wf2_artifacts` kind='ad_creative' (label `AD <angle> 45`, url,
  `meta={angle,format}`; dedup po `product_id+step_key+label`).
- **Storage (D6):** `attachments/bud-assets/<slug>/ads/ad_<angle>_45.png`; fallback bez slug:
  `ai-generated/wf2/<productId>/`.
**Bramka G7 (T/N):** [T] każda zaakceptowana kreacja ma wiersz `wf2_creatives` (media_type=image)
· [T] `ai_labeled=true` · [T] pliki w `bud-assets/<slug>/ads/`.
**Emisja:** `agr_final` → `done`; 3 kreacje w `bud-assets/<slug>/ads/` — wiersze `wf2_artifacts`
kind='ad_creative' (label `AD <angle> <fmt>`, dedup po `product_id+step_key+label`) zapisał już EDGE
przy pullu; **operator NIE robi `artifact_add(kind='ad_creative')`** (panel-sync dedupuje po URL, a edge
zapisuje URL z sufiksem `?v=<stamp>` → ręczny „czysty" URL = DRUGI kafel tej samej kreacji) — tylko
WERYFIKUJE, że wiersze istnieją; koszt Manusa też już zalogowany przez edge (weryfikacja, bez
ponownego `cost_add`); `activity_add('ads_done', '🏁 …')`.

### G8 — RETRO
**Cel:** lekcje wracają do standardu. Po zamknięciu produktu wpisz nowe wnioski (który KĄT/layout
wygrał w wynikach, gdzie padła bramka, jaki fail Manusa) do CHANGELOG tego SSOT i/lub do
właściwego playbooka. To jest cała racja bytu pętli wyników.

---

## 2. FORMATY

**Standard (decyzja Tomka 19.07): ŁĄCZNIE 3 KREACJE = 3 kąty × 1 format 4:5 (1080×1350) w JEDNYM
tasku Manusa.** Pliki `ad_<n>_<angle>.png` (back-compat 1:1 parsera). 4:5 = domyślny feed Meta
2026 (FB+IG Feed, Threads, Explore) — więcej pionu = wyższy dwell/CTR na mobile niż 1:1.

**9:16 (1080×1920) = ROZSZERZENIE NA PRZYSZŁOŚĆ, nie generowane domyślnie.** Parametr `formats`
w edge zostaje (default `['45']`); jawne `formats:['916']` da `ad_<n>_<angle>_916.png` z safe-zonami
w prompcie. **Safe-zones 9:16 (Stories/Reels ~75% inventory — auto-crop Advantage+ psuje kadr):**
góra **14%** (270 px, badge platformy), dół **35%** (670 px, Reels UI/CTA), boki **6%** (65 px).
Tekst i logo POZA strefami (edge-to-edge = przycięty). `ad-gate.py` nakłada overlay stref na pliki
`*_916*` i flaguje treść/tekst w strefach ZASŁANIANYCH (góra/dół). Gdy fabryka wejdzie w 9:16 — produkować NATYWNIE
(nie auto-crop): 4:5 gubi się do 9:16 (czarne pasy / ucięta góra-dół).

**Rozdzielczość renderu (rev3):** 1080×1350 to KANONICZNA specyfikacja 4:5 Meta (minimum), ale
renderujemy w wysokiej jakości — **min. 1350×1688 px, cel 1536×1920** — bo pliki idą do płatnych
kampanii i detale/typografia muszą być ostre. Prompt `wf2-ads` żąda tego wprost.

**Twarde limity:** max **30 MB**/obraz; tekst ≤~**20%** powierzchni (algorytm down-weightuje
tekst-heavy); WIELKI hook/headline **2–4 słowa** (do 6), ≤~27 znaków; JEDNA obietnica/grafikę;
logo 8–12% wysokości, niecentralne (top-left / bottom-right). Anatomia zwycięskiej statyki
(elementy = tylko te, które realnie pracują — **minimalizm = premium wg rev3**, „im mniej
elementów, tym drożej wygląda"): WIELKI hook nazywający ból/rezultat · jeden wizual rozstrzygalny
w 0,5 s · JEDNA obietnica · dowód/USP jako główny wizual (proof) · **CTA-czasownik „Kup teraz"
i badge = OPCJONALNE** (dodawaj tylko gdy wzmacniają kompozycję) · logo niecentralne.

---

## 3. POLITYKA META (twarde — bramka G5)

- **AI disclosure (2026, EGZEKWOWANE):** kreacja AI-generated MUSI nieść etykietę „AI info";
  nieujawnione AI = odrzucenie + retroaktywne flagowanie konta. Kompozyt realnego packshotu
  w tło AI = szara strefa (brak progu „substantially modified") → **flagujemy jako AI zawsze**:
  `ai_labeled=true` w `wf2_creatives`, a checklist `ads_zestaw` wymaga „AI info" przy publikacji.
- **Personal attributes (najczęstszy odrzut copy):** ZAKAZ „Ty/Twój" implikującego wadę odbiorcy
  („Masz cellulit?", „Wstydzisz się…"). Hook nazywa ból BEZOSOBOWO / przez produkt, nie oskarża
  usera.
- **Before/after Health&Wellness ZAKAZANE**, w 2026 rozszerzone na implied („produkt obok
  zdrowej/szczęśliwej osoby"). Dla gadżetów beauty/zdrowie: claimy zdrowotne flagować w KARCIE,
  nie pokazywać.
- **Słowa-triggery:** cure/treat/heal/fix, „gwarantowane rezultaty", „efekt w 24h", „natychmiastowa
  ulga", sensacja/szok, self-perception (dieta/odchudzanie).
- **Zakazy COD/dropship (spójne z fabryką):** zero „dostawa 24h"/„magazyn w Polsce", zero
  fałszywej pilności/countdownów, zero cen-przekreślonych fake, zero obcych logo / TikTok UI.
- **Blocklista komentarzy:** `docs/zbuduje/ADS-BLOCKLISTA-PL.md` (wgrywana na stronę FB w Pre-flight,
  ZANIM poleci pierwszy ad; Moderation Assist NIE działa na reklamach — tylko keyword blocklist).
- **`proof` ≠ fałszywy testimonial:** AI-awatar = WYŁĄCZNIE prezenter demonstrujący, NIGDY
  „zadowolony klient" (Meta deceptive practices + FTC; zaufanie do UGC-człowieka 81% vs AI 63%).

---

## 4. REJESTR I PĘTLA WYNIKÓW

**Rejestr (D5):** każda kreacja = wiersz `wf2_creatives` (`media_type='image'`, `angle`, `format`,
`pattern_ref` = URL z Meta Ad Library) + wiersz `wf2_artifacts` kind='ad_creative'. Blob
`wf2_products.ads_creatives` ZOSTAJE (panel, back-compat), elementy rozszerzone o `angle`,
`format`, `approved`. Bez rejestru `wf2-ads-sync` nie dopisze `creative_id` po `meta_ad_ids`
→ grafiki są ślepe na wyniki (stan wideo sprzed 18.07).

**Kompas statyki (thumbstop wideo NIE istnieje dla obrazu):** **CTR → CPC → ATC → CPA.** „Hook"
statyka = CTR (0,5 s decyduje o zatrzymaniu). Metryki `video_3s`/`hold_50`/`p100` są NULL dla
`media_type='image'`.
- Widok `wf2_creative_perf` (rozszerzony): dodane `media_type/angle/format` + `ctr` (clicks/impr),
  `cpc` (spend/clicks), `cpa` (spend/purchases); thumbstop/hold NULL dla obrazu.
- Nowy widok `wf2_angle_perf` (`media_type='image'`, group by `angle`+`format`): spend/impressions/
  clicks/ctr/purchases/cpa. Nauka „który KĄT wygrywa" → wraca do playbooków (G8).
Zasila je cron `wf2-ads-sync` (dopasowanie po `meta_ad_ids` — bez zmian w funkcji; wymaga sekretu
`WF2_META_TOKEN`, bez niego pętla cicha).

**Fatigue i rotacja:** half-life statyki **7–14 dni** przy skali → moduł zakłada CIĄGŁĄ produkcję,
nie „jedna grafika na zawsze". Rotacja gdy CPM/frequency rośnie; po zwycięzcy iteruj JEDEN element
(hook/kolor/oferta — „small tweak = double-digit CTR lift"), nie przebudowa całości.

---

## 5. EMISJE DO PANELU (mapa faza → sub-krok `agr_*`)

Sub-kroki grafik = natywne `wf2_step_defs` z `sub_of='ads_grafiki'` (stage=5; timeline w warsztacie
kroku „Grafiki", artefakty/koszty/checklisty wiszą na `(product_id, 'agr_*')` — wzór avi_* z wideo).
Kontrakt emisji = `panel-sync.py`; checklisty VERBATIM z `WS.ads_grafiki`.

| Po fazie | Sub-krok | Emisja (panel-sync) |
|---|---|---|
| G0 (start) | `agr_brief` → in_progress | `activity_add('ads_start', …)` |
| G1 (briefy) | `agr_brief` → done | note „3 kąty · hooki: …"; `artifact_add(kind='doc', BRIEF-ADS.md — storage='repo')` |
| G2 (Manus) | `agr_generacja` → done / blocked | note z task_id; `artifact_add(kind='link', url=manus.im/app/{task_id})`; **koszt Manusa: auto-log EDGE** (`wf2_costs` kind='manus') — operator NIE robi `cost_add(kind='manus')` (dublowałby nagłówek bloku) |
| G3–G5 (bramki) + G6 (akcept) | `agr_qa` → done | note-tabela werdyktów; **PUBLIC** dowody (side-by-side + thumb-320 + report.json) → `bud-assets/<slug>/ads/dowody/` (`kind='proof'`) |
| G7 (rejestr) | `agr_final` → done | 3 kreacje w `bud-assets/<slug>/ads/` — wiersze `wf2_artifacts` (`kind='ad_creative'`, meta={angle,format}, dedup product_id+step_key+label) i `wf2_creatives` (`creative_upsert`, media_type=image, ai_labeled=true) zapisał EDGE; **operator NIE robi `artifact_add(kind='ad_creative')`** (panel-sync dedupuje po URL vs edge `?v=<stamp>` → dublowałby kafel) — tylko WERYFIKUJE; koszt Manusa też z edge (bez ponownego `cost_add`); `activity_add('ads_done', '🏁 …')` |
| FAILED / 503 / breaker | bieżący | sub-krok `blocked` + note z powodem + info „generator = WYŁĄCZNIE Manus, reset po doładowaniu kredytów" (panel MA pokazać, że utknęło — nie ciszę) |

GOTCHA (jak w wideo): `panel-sync.py` czyta service-role sam (UTF-8) — payloady PL bez `curl|python`
(cp1250). Miniatury/dowody = `storage_upload(...)` → `artifact_add(kind='proof')`.

---

## 6. MODELE I KOSZTY (D10)

**Modele procesu operatora (zgodnie ze STANDARD-LANDING §Z8):**
- **Sonnet** = DOMYŚLNY: bramki (G3–G5 werdykty wizyjne, osąd zamknięty), briefy per kąt,
  ocena różnorodności, pass-2 wierności (świeży, bez kontekstu).
- **Haiku** = czyste skrypty/REST: uruchomienie `ad-gate.py`, odczyt REST, panel-sync, invoke edge.
- **Opus** = TYLKO otwarta kreacja bez gate'u za nią: koncept nietypowego kąta / rozwój samej
  fabryki (standard, playbooki, bramki). Bramki są siatką bezpieczeństwa model-agnostyczną →
  tańszy agent jest bezpieczny, bo gate łapie spadek jakości przed publikacją.

**Koszty:** silnik = **Manus ~$0.30/task** (1 task = 3 kreacje → ~$0.10/kreacja). **Koszt loguje
EDGE `wf2-ads` automatycznie po udanym pullu** (`wf2_costs` `step_key='ads_grafiki'`, stage=5,
kind='manus', note='N grafik (task …)') — to JEDYNE źródło kosztu Manusa; operator NIE emituje
własnego `cost_add(kind='manus')` (nagłówek bloku sumuje wszystkie wiersze `ads_grafiki` → dublet
= zawyżony koszt). Suma w nagłówku bloku panelu.
*(Kontekst historyczny: usunięty fallback Gemini kosztował ~$0.04/obraz — tańszy, ale niższa
jakość tekstu/layoutu; ZG9 rozstrzyga na rzecz jakości Manusa. Toru Gemini w kodzie NIE MA.)*

---

## 7. CHECKLIST PRZED PUBLIKACJĄ (gate — wszystkie PASS)

- [ ] 3 kreacje 4:5 (kanon 1080×1350; render wysokorozdzielczy **min. 1350×1688**, cel 1536×1920 —
      rev3), pliki `ad_<n>_<angle>.png`, ≤30 MB.
- [ ] Wierność (G3): każda kreacja produktowa ZGODNA vs paszport, dwie pary oczu, dowód-plik.
- [ ] Tekst (G4): zero scramble/pseudo-glifów, diakrytyki OK, @320px czytelny, safe-margin ≥8%.
- [ ] Polityka (G5): zero personal attributes / before-after wellness / słów-triggerów / obcych
      logo; blocklista czysta; `proof` bez fałszywego testimonialu.
- [ ] Różnorodność (G5): pHash 3 kątów ≥ próg — 3 różne byty.
- [ ] Message match (ZG1): hook = echo hero landingu; CTA = zamów/COD; paleta/wordmark z karty.
- [ ] Flaga AI (ZG9/G5): `ai_labeled=true`; „AI info" ustawione przy publikacji Meta.
- [ ] Akcept (G6): ≥1 kreacja `approved=true`.
- [ ] Rejestr (G7): wiersze `wf2_creatives` (media_type=image) + `wf2_artifacts` (ad_creative);
      pliki w `bud-assets/<slug>/ads/`; koszt w `wf2_costs`.
- [ ] Po publikacji: `meta_ad_ids` + `status='published'` dopisane (inaczej wyniki ślepe).

---

## 8. ŹRÓDŁA

Research FB/IG 2026 (formaty Meta 4:5/9:16, anatomia zwycięskiej statyki 5–6 elementów, policy
AI-label/personal-attributes/before-after, fatigue 7–14 dni, kompas CTR→CPC→ATC→CPA) · fabryki
kanoniczne: `STANDARD-LANDING-SKLEPY.md` (Z1–Z8, KARTA PRAWDY §1a, F3A wierność 2 pary oczu),
`GENERATOR-VIDEO-STRATEGIA.md` (0–0j, best-of-N, pętla `wf2_creatives`), `PRZEWODNIK-GRAFICZNY.md`
(EMOCJA↔PRODUKT), `GRAFIKA-Z-MAKIETY.md` (edytuj prawdę, refy=obiekty), `OBRAZY-ROLE.md` (klasy
P/U/S/R), `ADS-BLOCKLISTA-PL.md`.

---

## CHANGELOG DECYZJI (G8)

- **2026-07-19 — ZESTAW KĄTÓW: `proof` (opinie/liczby) WYPADA z defaultów** (decyzja Tomka: «nie
  rób grafiki z opiniami»); zamiast niego `lifestyle` (UGC z życia persony — wzorzec Kreacji 2 ze
  starego `manus-full-campaign`). `proof` = OPCJONALNY przez `body.angles:['proof']`. Edge waliduje
  `angles` białą listą `demo`/`problem`/`lifestyle`/`proof`; default = `['demo','problem','lifestyle']`
  (`wf2-ads` `ANGLES`), pliki `ad_1_demo`/`ad_2_problem`/`ad_3_lifestyle`. Nowy `PLAYBOOK-ad-lifestyle.md`
  (autentyczność, zero stockowego uśmiechu, zero UI, produkt 1:1 w naturalnym użyciu); `PLAYBOOK-ad-proof.md`
  oznaczony jako OPCJONALNY (box na górze). Zsynchronizowane: G1/G2/G5, ZG8, FORMATY. Źródło prawdy DNA
  kątów pozostaje `buildAdsInstruction()` w `wf2-ads`.

- **2026-07-19 — rev3 ART-DIRECTION PREMIUM** (feedback Tomka po 1. przebiegu: «fatalna jakość
  vs stary flow»): wzorce przywrócone ze starego `manus-full-campaign` (Clean Hero / MIT vs FAKT /
  Authority close-up), pigułki CTA i badge zdegradowane do opcjonalnych, minimalizm = premium,
  wymóg wysokiej rozdzielczości (min. 1350×1688). Zasady uczciwości rev2 (kotwice liczb,
  EMOCJA↔PRODUKT, personal attributes) bez zmian. Źródło prawdy DNA kątów = `buildAdsInstruction()`
  w `wf2-ads`; playbooki `ad-playbooks/PLAYBOOK-ad-{demo,problem,proof}.md` przepisane pod rev3
  (demo: clean product hero + WIELKI hook 2–4 słowa na ciemnym/gradientowym tle, wzorzec „3 MINUTY.";
  problem: split-screen MIT vs FAKT — panel bólu BEZ produktu, panel FAKT z produktem + 2–3
  checkmarki; proof: authority/premium close-up detalu + JEDEN element zaufania). Sekcje FORMATY/
  ZG4/ZG6 zsynchronizowane (CTA-pigułka i badge OPCJONALNE, fallback = sam WIELKI hook, render
  w wysokiej rozdzielczości).

- **2026-07-19 (v1.0 — powstanie SSOT + rev2 decyzji Tomka):** krok `ads_grafiki` podniesiony
  do pełnej fabryki na wzór landingów/wideo. **ZG9 „Manus albo nic"** (D2b): CAŁY tor fallback
  Gemini/gpt-5.1-copy wycięty z `wf2-ads`; awaria = kontrolowany 503 / `failed` + reset ręczny,
  nigdy cicha degradacja jakości. **Zestaw startowy = ŁĄCZNIE 3 kreacje** (3 kąty × 1 format 4:5
  w JEDNYM tasku Manusa; pliki `ad_<n>_<angle>.png` — back-compat); 9:16 + safe-zones = opisane
  rozszerzenie na przyszłość, nie default. Zasady ZG1–ZG9, fazy G0–G8 z bramkami-dowodami,
  bramka `ad-gate.py`, sub-kroki `agr_*` (sub_of='ads_grafiki'), rejestr `wf2_creatives`
  media_type='image' + widok `wf2_angle_perf`, kompas CTR→CPC→ATC→CPA. Playbooki per kąt
  (`ad-playbooks/PLAYBOOK-ad-{demo,problem,proof}.md`). Kąt `problem` naprawiony wg EMOCJA↔PRODUKT
  (produkt POZA strefą bólu). Modele: Sonnet domyślnie, Haiku skrypty, Opus tylko otwarta kreacja.

- **2026-07-19 — pierwszy przebieg E2E (Drapek, task `ZavkgNowkZjTSTYN6Ys65X`, ~14 min, $0.30):**
  3/3 kreacje dowiezione, rejestr + artefakty + koszt zapisane automatycznie; liczby w „proof"
  poprawnie zakotwiczone (4,7/5 · 1548 → „ponad 1500 zamówień" — ZG4 działa). **Lekcja G8 #1
  (klasa: KOMPOZYCJA BLOKU TEKSTU):** w „demo" badge przykrył drugą linię headline'a
  („Zetrzyj pazury" przycięte) = FAIL bramki G4 czytelności. Fix FABRYKI (nie pliku): twarda
  reguła anty-overlap w prompcie `wf2-ads` (rezerwa pionowa na pełny headline PRZED pigułkami;
  brak miejsca → 1 linia headline albo drop badge). Obserwacja #2: primary_text wszystkich
  3 kątów otwierał się tym samym zdaniem („Napięcie znika. Zostaje zabawa.") — przy
  kompletowaniu ads_zestaw pilnować 5 RÓŻNYCH tekstów; kandydat na regułę promptu, jeśli
  się powtórzy. Obserwacja #3: kąt „problem" w stylu ilustracyjnym — produkt w strefie
  rozwiązania mniej wierny (skrytka z klockami zamiast karmy); bramka G3 ma to łapać,
  styl ilustracyjny NIE zwalnia z wierności skrytki/proporcji.

- **2026-07-19 — lekcja G8 #2 (klasa: DIAKRYTYKI-WERSALIKI), przebieg rev3 Drapka (task
  `ARoCy6ya4Rw6Xvdu2tvKhW`, ~10 min):** jakość klasy agencyjnej osiągnięta (Clean Hero /
  split MIT-FAKT / Authority close-up, 1664×2080), ale silnik obrazowy Manusa GUBI polskie
  znaki w WIELKICH literach („ZAMOWIEN.", „STARY SPOSOB") przy poprawnych małych literach.
  Fix FABRYKI: twarda reguła w prompcie — samokontrola wizualna każdego napisu litera po
  literze po wygenerowaniu; zgubiony znak = regeneracja / zapis zdaniowy. Bramka G4 ma
  wersalikowe diakrytyki jako osobny punkt kontroli.

- **2026-07-19 — SILNIK B „ad-forge" (tor lokalny bez Manusa; powód: 2× timeout kredytowy
  Manusa + dyrektywa Tomka „może przez image 2.0 / fal.ai"):** `scripts/mockup-tools/ad-forge.py`
  — pełny lokalny orkiestrator: dane+refy z REST (port buildProductRefs/readBranding) →
  copy+wizje scen (wf2-gpt, z dezambiguacją produktu po tytule aukcji) → sceny gpt-image-2
  quality HIGH bezpośrednio z api.openai.com (bez limitu edge; `--engine gemini` alternatywnie)
  → crop 4:5 + upscale 1536×1920 → **CAŁA typografia PL + logo NAKŁADANE KODEM** (Pillow,
  font marki z resolvera, fallback Montserrat-Black; logo zawsze na jasnej pigułce
  z bounding-checkiem i heurystyką jasności rogu) → ad-gate → publikacja panel-sync
  (storage kanoniczny, blob MERGE po kącie, rejestr, koszt, agr_generacja). PROMPTY SCEN =
  KIERUNKOWE (zasada Tomka: cel/wizja/nastrój w 3–6 zdaniach; wygląd produktu niosą WYŁĄCZNIE
  referencje; dla demo wizja sceny = wskazówka studyjna bez ludzi). Sceny surowe zapisywane →
  `--recompose` = poprawki typografii/logo za $0. Walidacja E2E Drapek: 3 kreacje HIGH ~7 min
  ~$1.00, diakrytyki (też wersaliki) 100% poprawne — klasa niedostępna dla silnika A (Manus
  renderuje litery sam). Tor A (Manus, edge wf2-ads) zostaje jako alternatywa; wybór silnika
  = decyzja operatora per przebieg.

- **2026-07-19 — rev4 KOMPOZYCJE BANEROWE DR (feedback Tomka: „to sesja studyjna, nie banery —
  ma konwertować" + research zwycięskich statyk i niszy pet):** warstwa kompozycji ad-forge
  przebudowana z „premium minimal" na blueprinty DR: demo=CALLOUT/ANATOMIA (hook-pytanie na
  scrimie + 3 pigułki-benefity z liniami do części produktu + badge COD + pas CTA),
  problem=PRZED/PO „stres→spokój" (split, pigułki PRZED/PO, BLOK CENY z lp_dane + „za
  pobraniem" + CTA), lifestyle=CANDID (marker-naklejka ze strzałką + kapsułka „za pobraniem",
  zero pasów). Typografia px@1080 wg researchu (hook 72-92, callouty 36-44, cena 90-120,
  CTA 50-58, min 30), kontrast ≥4,5:1, ścieżka Z. UCZCIWOŚĆ bez zmian: zero fikcyjnych
  przecen/urgency/gwiazdek; cena TYLKO prawdziwa. Lekcja nadrzędna: scena AI = 55-70%
  powierzchni i wygląda jak zdjęcie klienta (nie katalog); PERSWAZJA żyje w warstwie
  wektorowej. Benchmark silników scen (fal.ai, $0.55): nano-banana-2/edit ($0.12, natywne
  4:5) i flux-2-pro/edit ($0.045) biją cenowo gpt-image-2 HIGH przy równej/lepszej scenie —
  wybór silnika czeka na decyzję Tomka.

- **2026-07-19 — v7 WIERNOŚĆ PRODUKTU (feedback Tomka po akcepcie v6: „produkt wygląda nieco
  inaczej niż faktycznie — pilnuj tego"):** mechanizmy przeniesione z fabryki VIDEO/landingów:
  (1) MULTI-REF — 3 różne kadry produktu z gallery_curated[keep] do nbpro (root-cause fix:
  1 packshot = model zgadywał geometrię; morf zniknął bez ani jednego fixu); (2) KARTA.json =
  checklista 4-6 cech dyskryminujących (bramka, NIE tekst promptu); (3) bramka wierności per
  kandydat (vision, side-by-side, T/N per cecha; drabina: drugi kandydat → surgical fix →
  regeneracja); (4) bramka CIĄGŁOŚCI między kreacjami (lekcja „morf" z video); (5) dowody
  WIERNOSC-<angle>.png + WIERNOSC-CIAGLOSC.png; (6) publikacja bramkowana (--finalize po
  przejściu checklisty). FULL-DESIGN v6+v7 = OBOWIĄZUJĄCY STANDARD fabryki grafik
  (model projektuje cały baner; bramki: tekst litera-po-literze + wierność + ciągłość).

- **2026-07-19 — v8 MOST PANEL 1:1 (życzenie Tomka: „fabryka i panel 1:1, jak wideo/landingi"):**
  krok przemianowany na **„Banery reklamowe"**, sub-kroki wg realnego procesu (Brief: karta+copy /
  Generacja scen (fal, best-of-2) / Bramki: litery·wierność·ciągłość·klik / Finał: publikacja+
  warianty hooków). `ad-forge --finalize` emituje KOMPLET: step_update wszystkich agr_* z notami
  z faktów (silnik, joby, koszt, werdykty bramek per kąt), checklist głównego kroku (7 pozycji,
  kontrakt VERBATIM: stała ADS_GRAFIKI_CHECKLIST w ad-forge == WS w panelu; poz. 7 „zaakceptowane"
  = bramka Tomka, zawsze OFF po publikacji + reset approved), fields.grafiki_url, dowody kind='proof'
  do bud-assets/<slug>/ads/dowody/, activity. Panel: CTA „Generuj przez ad-forge (sesja)", Manus =
  oznaczona alternatywa. GOTCHA: PATCH labeli z polskimi znakami przez czysty UTF-8 Python, NIE curl
  (cp1250 psuje diakrytyki w bazie).
