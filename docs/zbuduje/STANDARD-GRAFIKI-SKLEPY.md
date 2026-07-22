# STANDARD-GRAFIKI-SKLEPY — fabryka statycznych grafik reklamowych FB/IG (workflow v2 „Sklepy")

**Status: OBOWIĄZUJE — wersja 1.1 (2026-07-19, decyzja Tomka „fabryka banerów = ad-forge/fal,
Manus USUNIĘTY z modułu" + zestaw startowy = ŁĄCZNIE 3 kreacje 4:5).** SSOT kroku `ads_grafiki` (Etap 5
„Materiały i kampania"). Struktura wzorowana 1:1 na `STANDARD-LANDING-SKLEPY.md` (Z1–Z8, fazy
F0–F8) i `GENERATOR-VIDEO-STRATEGIA.md` (0–0j). Research FB/IG 2026 + wzorce fabryk landingów
i wideo — źródła na końcu. **Wykonawca zaczyna od: „przeczytaj CAŁY ten standard".**

**🎯 Cel: grafiki mają SPRZEDAWAĆ i uczyć fabrykę. Zestaw = 3 koncepcyjnie różne reklamy do
testu A/B, każda wierna produktowi i landingowi, mierzona po publikacji.** Kontekst: ~90% ruchu
mobile z Reels/FB (impuls), rynek PL (lęk #1 = scam), checkout na osobnej domenie platformy,
COD dostępny. Statyk to wciąż 60–70% konwersji Meta dla tanich gadżetów impulse-buy/COD i
najtańsze A/B (swap w minuty). Dla płatnego ruchu grafika jest AMUNICJĄ — musi być tania
w produkcji, ale nigdy tania w jakości.

**Silnik (D1):** generacja = **`scripts/mockup-tools/ad-forge.py` (fal: nano-banana-pro/nb2)**,
odpalany w sesji Claude Code. **Manus USUNIĘTY z modułu** (decyzja Tomka 19.07 — edge `wf2-ads`
skasowany, kolumny `ads_manus_*` zdjęte migracją `20260719l`). Jakość = proces operatora Claude
Code — fazy **G0–G8**, bramki z dowodami, emisje do panelu przez `scripts/mockup-tools/panel-sync.py`
(kontrakt `docs/zbuduje/MOST-PANEL.md`). Bramka QA (deterministyczne pomiary) = `scripts/mockup-tools/ad-gate.py`.

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
(string-ref jest gubiony po cichu — cała fabryka generowała bez referencji do 17.07). Model
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

**ZG9 — SILNIK = fal (nano-banana-pro/nb2) przez ad-forge; Manus USUNIĘTY z modułu (decyzja
Tomka 19.07).** Generacja banerów wf2 idzie WYŁĄCZNIE przez `scripts/mockup-tools/ad-forge.py`
(fal — full-design nano-banana-pro, best-of-2; challenger nano-banana-2). Edge `wf2-ads` i cały
tor Manusa (kolumny `ads_manus_*`, kill-switch `WF2_ADS_MANUS_ENABLED`, breaker/reset w panelu)
zostały USUNIĘTE z modułu. Odporność/koszt/pętla poprawek żyją teraz w ad-forge:
- brak danych/refów/branding gate G0 → STOP fazy (uzupełnij F0 landingu, nie zmyślaj);
- literówka/scramble w tekście → drugi kandydat / chirurgiczny `nano-banana-pro/edit` fix /
  fallback overlay (bramka tekstu G4, litera-po-literze);
- morf/niewierność produktu → drugi kandydat → surgical fix → regeneracja (bramka wierności G3);
- awaria fal (brak kredytów/timeout joba) → przebieg zatrzymany, RECLAIM opłaconych jobów po
  restarcie sesji; awaria generatora = brak grafik, nie gorsze grafiki.
NB: workflow v1 i lejek /sklep (`bud-ads`) nadal używają Manusa — to ich osobny tor, nietknięty.

**ZG10 — ⛔ ZAKAZ CEN NA KREACJACH (Tomek 22.07: „W banerach reklamowych nie podawaj cen
NIGDY").** Żadna kwota (cena produktu, przekreślenia, „od X zł") nie ma prawa pojawić się na
banerze ANI w primary/headline zestawu reklam — ceny prowadzi silnik cen (`wf2-price-engine`,
fazy 1–6) i zmieniają się w czasie życia kampanii; baner z ceną = kłamstwo po pierwszej zmianie
i przymus przegenerowania. Cena żyje WYŁĄCZNIE na landingu (runtime `wf2-landing-api`).
Dozwolone: „PŁATNOŚĆ PRZY ODBIORZE" / „za pobraniem" (metoda płatności, nie kwota).
Egzekwowanie: builder full-design nie emituje bloku ceny (kąt problem = trust pill zamiast
ceny); bramka G4 czyta każdy blok tekstu — wykryta kwota = twardy FAIL.

---

## 1. FAZY FABRYKI (G0→G8; wykonawca = agent-operator; silnik = ad-forge/fal)

**§1-sync — 🔌 EMISJA DO PANELU (część DEFINICJI DONE każdej fazy).** Fabryka pracuje w plikach/
edge; panel `/tn-sklepy → projekt.html` = jedyne okno Tomka na postęp. Reguła nadrzędna z fabryki
wideo obowiązuje tu 1:1: **brak emisji = etap niezaliczony.** Po wskazanych fazach operator emituje
przez `panel-sync.py` (import `panel_sync as ps` — payloady PL bez pułapki cp1250, albo CLI):
awans sub-kroku `step_update(...)`, artefakty oglądalne `artifact_add(...)`, koszt `cost_add(...)` (koszt fal
loguje `ad-forge --finalize` sam, `kind='fal'`; patrz §6), wpis osi czasu `activity_add(...)`. Mapa faza→sub-krok `agr_*` = sekcja „EMISJE DO PANELU" niżej.
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

### G2 — GENERACJA (ad-forge / fal)
**Cel:** wygenerować ŁĄCZNIE 3 kreacje w JEDNYM przebiegu ad-forge.
**Kroki:** `python ad-forge.py <product_id> [--angles demo,problem,lifestyle]` (default kąty
`demo`/`problem`/`lifestyle`, format 4:5). Full-design nano-banana-pro (fal), best-of-2/kąt →
pliki `ad_1_demo.png` / `ad_2_problem.png` / `ad_3_lifestyle.png` (4:5, render min. 1350×1688,
cel 1536×1920) + `campaign.json`. `--dry` = plan+koszt bez generacji. Kąty walidowane białą listą
`demo`/`problem`/`lifestyle`/`proof`; `proof` (opinie/liczby) = OPCJONALNY, wchodzi TYLKO na jawne
`--angles …,proof` (decyzja Tomka 19.07: zero grafik z opinii w defaultach — zamiast `proof` idzie
`lifestyle`).
**⚠️ ZG9:** silnik = WYŁĄCZNIE ad-forge/fal, Manus usunięty. Awaria fal (kredyty/timeout joba) →
przebieg zatrzymany, RECLAIM opłaconych jobów po restarcie sesji; nie generuj niczym poza ad-forge.
**Bramka G2 (T/N):** [T] 3 pliki obecne · [T] `campaign.json`
z 3 wpisami `{angle,headline,badge,primary_text}`. [N] → faza `agr_generacja` = `blocked` + powód.
**Emisja:** `agr_generacja` → `done` (lub `blocked` przy awarii); note z przebiegu (silnik, joby, koszt);
**koszt fal loguje `ad-forge --finalize`** (`wf2_costs` kind='fal', step_key='agr_generacja') — operator
NIE emituje własnego `cost_add` (ad-forge robi to idempotentnie); najwyżej WERYFIKUJE, że wiersz kosztu istnieje.

### G3 — BRAMKA WIERNOŚCI (dwie pary oczu)
**Cel:** żadna kreacja nie sprzedaje nieistniejącego produktu.
**Narzędzie:** `ad-gate.py <katalog_png> --out dowody/` (miniatury + pomiary) + werdykt agentowy.
Wejście: surowe pliki ad-forge `ad_<n>_<angle>.png` LUB kanoniczne rehosty `ad_<angle>_<fmt>.png`
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

### G3a — BRAMKA ANATOMII (ludzie i zwierzęta) — v10.1
**Cel:** żadna kreacja nie pokazuje uciętego/rozjeżdżonego ciała człowieka ani zwierzęcia. Luka
systemowa ujawniona na **Macie akupresury 20.07** (leżąca kobieta miała UCIĘTY/niespójny TUŁÓW —
ciało znikało nienaturalnie pod ręcznikiem): fabryka pilnowała produktu, liter, przekazu i USP-momentu,
ale ŻADNA bramka nie sprawdzała ANATOMII postaci. Ta bramka jest teraz **odrębną pozycją checklisty QA**
obok wierności produktu (G3 = produkt; G3a = ludzie/zwierzęta).
**Metoda:** AGENT (vision) ogląda **KANDYDATÓW i FINAŁY** (nie tylko finał — kandydat z wadą odpada,
zanim zostanie wybrany). Prewencja: brief KAŻDEGO kąta niesie zdanie „Any human or animal in the scene
must be anatomically complete and natural; if partially covered, the silhouette underneath must remain
coherent." (`ANATOMY_SENTENCE`/`FD_ANATOMY` w `build_fulldesign`, `SQUARE_RECOMPOSE`, overlay).
**Bramka G3a (T/N, per kandydat i finał):**
- [T] **(a) ciało kompletne w logice kadru** — nic nie znika/nie urywa się nienaturalnie; przykrycie
  (ręcznik/mebel/produkt) zachowuje SPÓJNĄ sylwetkę pod spodem (żadnego uciętego/zlanego z meblem tułowia);
- [T] **(b) liczba i budowa** kończyn / dłoni / palców / uszu poprawna (bez dodatkowych/brakujących, bez zrostów);
- [T] **(c) naturalna poza i proporcje** (żadnych niemożliwych zgięć/skręceń/skali);
- [T] **(d) twarz bez deformacji** (rysy spójne, oczy/usta naturalne).
FAIL któregokolwiek = **kandydat odpada → drugi kandydat → regeneracja** (`--regen <kąt>`; nowy brief niesie
już zdanie prewencyjne). Kąt/kadr bez ludzi i zwierząt (np. czysty packshot demo) = N/D (nota „brak postaci").
→ dowód: werdykt w `ANATOMY.json` (`state.anatomy_verdicts`) + kompozyty `dowody/WIERNOSC-<kąt>.png`.
**Emisja:** werdykty anatomii wchodzą do noty `agr_qa` (linia „… · anatomia: PASS/FAIL · …").

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
**Kroki (robi `ad-forge --finalize`, operator weryfikuje):**
- **Blob (panel/back-compat):** `wf2_products.ads_creatives` elementy `{angle,format:'45',
  headline,primary_text,badge,image_url,approved}`.
- **Rejestr:** UPSERT `wf2_creatives` per kreacja (slug `${productSlug||productId}-ad-${angle}-45`):
  `media_type='image'`, `angle`, `format='45'`, `ai_labeled=true`, `status='ready'`, `public_url`,
  `project_id`, `product_id`, `cost_usd = koszt_fal / liczba_grafik`, `meta={engine:'fal',
  headline,badge}`. Po publikacji Meta dopisz `meta_ad_ids` + `status='published'` (bez tego
  `wf2-ads-sync` nie dopasuje statystyk — kreacja niemierzalna).
- **Artefakty:** INSERT/refresh `wf2_artifacts` kind='ad_creative' (label `AD <angle> 45`, url,
  `meta={angle,format}`; dedup po `product_id+step_key+label`).
- **Storage (D6):** `attachments/bud-assets/<slug>/ads/ad_<angle>_45.png`; fallback bez slug:
  `ai-generated/wf2/<productId>/`.
**Bramka G7 (T/N):** [T] każda zaakceptowana kreacja ma wiersz `wf2_creatives` (media_type=image)
· [T] `ai_labeled=true` · [T] pliki w `bud-assets/<slug>/ads/`.
**Emisja:** `agr_final` → `done`; 3 kreacje w `bud-assets/<slug>/ads/` — wiersze `wf2_artifacts`
kind='ad_creative' (label `AD <angle> <fmt>`, dedup po `product_id+step_key+label`) zapisał już
`ad-forge --finalize`; **operator NIE robi `artifact_add(kind='ad_creative')`** (panel-sync dedupuje po URL,
a ad-forge zapisuje URL z sufiksem `?v=<stamp>` → ręczny „czysty" URL = DRUGI kafel tej samej kreacji) — tylko
WERYFIKUJE, że wiersze istnieją; koszt fal też już zalogowany przez ad-forge (weryfikacja, bez
ponownego `cost_add`); `activity_add('ads_done', '🏁 …')`.

### G8 — RETRO
**Cel:** lekcje wracają do standardu. Po zamknięciu produktu wpisz nowe wnioski (który KĄT/layout
wygrał w wynikach, gdzie padła bramka, jaki fail generatora) do CHANGELOG tego SSOT i/lub do
właściwego playbooka. To jest cała racja bytu pętli wyników.

---

## 2. FORMATY

**Standard (decyzja Tomka 19.07 + v10 „dodaj KWADRAT"): 3 kąty × DWA formaty = `45` (4:5 pion
1080×1350; render 1536×1920) **i** `11` (1:1 kwadrat 1080×1080; render 1536×1536).** Flaga
`--formats` (default **`45,11`**). Pliki `ad_<angle>_45.png` + `ad_<angle>_11.png`. 4:5 = główny feed
Meta 2026 (FB+IG Feed, Threads, Explore); 1:1 = kwadratowe placementy feedu + placement-asset-
customization (Meta samo skaluje z kwadratu bez brzydkiego auto-cropu). **Kwadrat = PRZEKOMPOZYCJA
finału 4:5** (tryb oszczędny, 1 kandydat, seed 4:5 + refy produktu; patrz CHANGELOG v10), nie osobna
reklama — te same copy/hook/brand, tylko układ dopasowany do 1:1. Litery przechodzą bramkę NA NOWO
(przekompozycja przerysowuje układ).

**9:16 (1080×1920) = ROZSZERZENIE NA PRZYSZŁOŚĆ, nie generowane domyślnie.** Parametr `formats`
w edge zostaje (default `['45']`); jawne `formats:['916']` da `ad_<n>_<angle>_916.png` z safe-zonami
w prompcie. **Safe-zones 9:16 (Stories/Reels ~75% inventory — auto-crop Advantage+ psuje kadr):**
góra **14%** (270 px, badge platformy), dół **35%** (670 px, Reels UI/CTA), boki **6%** (65 px).
Tekst i logo POZA strefami (edge-to-edge = przycięty). `ad-gate.py` nakłada overlay stref na pliki
`*_916*` i flaguje treść/tekst w strefach ZASŁANIANYCH (góra/dół). Gdy fabryka wejdzie w 9:16 — produkować NATYWNIE
(nie auto-crop): 4:5 gubi się do 9:16 (czarne pasy / ucięta góra-dół).

**Rozdzielczość renderu (rev3):** 1080×1350 to KANONICZNA specyfikacja 4:5 Meta (minimum), ale
renderujemy w wysokiej jakości — **min. 1350×1688 px, cel 1536×1920** — bo pliki idą do płatnych
kampanii i detale/typografia muszą być ostre. Brief ad-forge (`buildAdsInstruction`) żąda tego wprost.

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
| G2 (ad-forge/fal) | `agr_generacja` → done / blocked | note z przebiegu (silnik, joby, koszt); **koszt fal: auto-log `ad-forge --finalize`** (`wf2_costs` kind='fal') — operator NIE robi własnego `cost_add` (dublowałby nagłówek bloku) |
| G3–G5 (bramki) + G6 (akcept) | `agr_qa` → done | note-tabela werdyktów; **PUBLIC** dowody (side-by-side + thumb-320 + report.json) → `bud-assets/<slug>/ads/dowody/` (`kind='proof'`) |
| G7 (rejestr) | `agr_final` → done | 3 kreacje w `bud-assets/<slug>/ads/` — wiersze `wf2_artifacts` (`kind='ad_creative'`, meta={angle,format}, dedup product_id+step_key+label) i `wf2_creatives` (`creative_upsert`, media_type=image, ai_labeled=true) zapisał `ad-forge --finalize`; **operator NIE robi `artifact_add(kind='ad_creative')`** (panel-sync dedupuje po URL vs ad-forge `?v=<stamp>` → dublowałby kafel) — tylko WERYFIKUJE; koszt fal też z ad-forge (bez ponownego `cost_add`); `activity_add('ads_done', '🏁 …')` |
| AWARIA fal (kredyty/timeout) | bieżący | sub-krok `blocked` + note z powodem (panel MA pokazać, że utknęło — nie ciszę); wznowienie = RECLAIM opłaconych jobów po restarcie sesji ad-forge |

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

**Koszty:** silnik = **fal (nano-banana-pro, best-of-2) ~$0.45/baner** przez ad-forge. **Koszt loguje
`ad-forge --finalize` automatycznie** (`wf2_costs` `step_key='agr_generacja'`, stage=5, kind='fal',
note z liczbą jobów) — to JEDYNE źródło kosztu generacji; operator NIE emituje własnego `cost_add`
(nagłówek bloku sumuje wszystkie wiersze `ads_grafiki` → dublet = zawyżony koszt). Suma w nagłówku
bloku panelu. Warianty hooków = ~$0 (nakładka kodem); challenger nano-banana-2 (A/B) ~$0.10/obraz,
NIE publikowany.
*(Kontekst historyczny: silnik Manus (~$0.30/task) i fallback Gemini (~$0.04/obraz) USUNIĘTE
z modułu 19.07 — cały tor generacji przeszedł na ad-forge/fal.)*

---

## 7. CHECKLIST PRZED PUBLIKACJĄ (gate — wszystkie PASS)

- [ ] 3 kreacje 4:5 (kanon 1080×1350; render wysokorozdzielczy **min. 1350×1688**, cel 1536×1920 —
      rev3), pliki `ad_<n>_<angle>.png`, ≤30 MB.
- [ ] Wierność (G3): każda kreacja produktowa ZGODNA vs paszport, dwie pary oczu, dowód-plik.
- [ ] Anatomia (G3a): każdy człowiek/zwierzę na kreacji (kandydaci i finały) — ciało kompletne,
      spójna sylwetka pod przykryciem, poprawne kończyny/dłonie/palce/uszy, naturalna poza, twarz bez
      deformacji; werdykt w `ANATOMY.json`.
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

- **2026-07-20 (v10.1) — BRAMKA ANATOMII (ludzie/zwierzęta) + AUDYT WSTECZ (feedback Tomka: „leżąca
  kobieta na Macie ma UCIĘTY/niespójny TUŁÓW — ciało znika nienaturalnie pod ręcznikiem"):**
  - **Lekcja G8 (klasa: LUKA BRAMKOWA — anatomia postaci).** Fabryka miała bramki produktu (G3),
    ciągłości, tekstu (G4), polityki (G5) i USP-momentu — ale ŻADNA nie sprawdzała ANATOMII ludzi/zwierząt.
    Model nano-banana-pro potrafi urwać/rozjechać tułów leżącej osoby (ciało wtapia się w ręcznik/matę),
    a wszystkie inne bramki to przepuszczają, bo produkt i litery są OK. Root-cause: pilnowaliśmy produktu,
    liter i przekazu, nie CIAŁ.
  - **Fix FABRYKI (nie pliku):** (1) **zdanie prewencyjne** `ANATOMY_SENTENCE` („Any human or animal in
    the scene must be anatomically complete and natural; if partially covered, the silhouette underneath
    must remain coherent.") wstrzykiwane do briefu KAŻDEGO kąta: `FD_ANATOMY` w `build_fulldesign`
    (i pochodne: `regen_fd_angle`/`gen_square_full`/`do_hookvariants`/`do_portfolio`), doklejone do
    `SQUARE_RECOMPOSE` (kwadrat oszczędny) i do `full_prompt` (tor overlay — PAIN ma ludzi z definicji);
    (2) **nowa BRAMKA G3a ANATOMII** — vision-checklista KANDYDATÓW i FINAŁÓW (`ANATOMY_GATE_QUESTIONS`,
    `print_anatomy_gate`): (a) ciało kompletne / spójna sylwetka pod przykryciem, (b) liczba i budowa
    kończyn/dłoni/palców/uszu, (c) naturalna poza/proporcje, (d) twarz bez deformacji; FAIL = kandydat
    odpada → drugi kandydat → regeneracja; (3) werdykty agenta → `ANATOMY.json` → `state.anatomy_verdicts`
    (CLI `--anatomia`), wchodzą do noty `agr_qa` (`_qa_lines`: „… · anatomia: PASS/FAIL · …"). Bramka
    G3a to ODRĘBNA pozycja checklisty QA obok G3 (produkt) — patrz §1 fazy i §7.
  - **AUDYT WSTECZ (vision, 3 produkty — 20.07):** obejrzano WSZYSTKIE opublikowane finały (demo/problem/
    lifestyle × 4:5 + 1:1) oraz bazy wariantów hooków. **Drapek** (9e4b1df9…): PASS wszystkie — psy anatomicznie
    naturalne (4 łapy, poprawne pozy/ogony, brak zrostów). **Masażer** (557ed2b0…): PASS wszystkie — zielona
    „silikonowa dłoń" to PRODUKT (nie ludzka anatomia); dłonie/twarze/karki kobiet naturalne (lifestyle: realna
    dłoń 4 palce+kciuk poprawna). **Mata** (9b377ae8…): **1 FAIL — demo 4:5 i demo 1:1** (leżąca twarzą w dół
    kobieta miała UCIĘTY/niespójny TUŁÓW: tors kończył się w połowie pleców, pod ręcznikiem brak sylwetki bioder/nóg —
    kryterium (a)); problem, lifestyle oraz WSZYSTKIE bazy hooków = PASS.
  - **REGENERACJA FAIL-i:** mata demo zregenerowane best-of-2 z nowym briefem `FD_ANATOMY`. Oba kandydaty
    naprawiły anatomię (kobieta leży na PLECACH jako jedna spójna sylwetka); wybrano c1 (c0 odrzucony — literówka
    „CTA \|" przed przyciskiem = bramka liter FAIL). Kwadrat 1:1 przekomponowany z nowego 4:5 (litery + anatomia
    czyste). `--finalize` MERGE po (kąt,format) — podmieniono TYLKO demo·45 i demo·11, problem/lifestyle nietknięte.
    Koszt fal: **~$0.675** (2×0.225 regen 4:5 + 1×0.225 kwadrat; `wf2_costs` kind='fal', osobny wiersz). ad-gate PASS,
    KOMPLET bramek (litery/wierność/ciągłość/**anatomia**/klik) na nowych finałach = PASS. Foldery czyste
    (`MATA-BANERY-FINALNE`) zaktualizowane.
  - Zasada: **każdy kadr z człowiekiem/zwierzęciem = kandydat na anatomiczny defekt; osoba leżąca/częściowo
    zakryta (ręcznik/mata/mebel) to strefa ryzyka #1 — sylwetka pod przykryciem MUSI zostać spójna.**

- **2026-07-19 (v10) — FORMAT 1:1 (KWADRAT) DODANY DO FABRYKI (dyrektywa Tomka „dodaj KWADRAT"):**
  ad-forge produkuje teraz DWA formaty per kąt: `45` (4:5 pion 1536×1920) **i** `11` (1:1 kwadrat
  1536×1536, kanon 1080×1080). Flaga `--formats` (default **`45,11`**). **TRYB OSZCZĘDNY 1:1
  (root-decyzja):** kwadrat rodzi się z GOTOWEGO finału 4:5 (przekompozycja przez `nano-banana-pro/edit`
  — finał 4:5 jako `image_urls[0]` = jedyne źródło layoutu/copy/stylu + do 2 refów produktu dla
  wierności; prompt `SQUARE_RECOMPOSE`), **1 kandydat/format** (bez best-of-2 — koszt ~$0.225/kwadrat
  zamiast pełnej generacji). Bramka LITER **litera-po-literze** (przekompozycja PRZERYSOWUJE układ —
  litery są ryzykiem #1) + szybka wierność = AGENT (vision) na kompozycie `dowody/KWADRAT-<kąt>.png`
  (4:5 źródło | 1:1 | packshot); FAIL → `--gen-11 <kąt>` (retry oszczędny) → `--regen-11 <kąt>`
  (pełna generacja kwadratu, aspect 1:1, bez seeda). Kwadraty powstają na `--finalize` z ustalonych
  finałów 4:5 (albo osobno `--gen-11 all` bez `--finalize` do rewizji przed publikacją).
  **Publikacja (rozbudowa, nie przebudowa):** pliki `ad_<kąt>_11.png` → `bud-assets/<slug>/ads/`;
  blob `ads_creatives` = elementy `{angle,format:'11'}` OBOK `{format:'45'}` (MERGE po `(kąt,format)`,
  legacy bez `format` = `'45'`); `wf2_creatives` slug `<slug>-ad-<kąt>-11` (format='11'); artefakty
  `AD <kąt> 11`; koszt kwadratów = OSOBNY wiersz `wf2_costs` (`kind='fal'`, note „kwadraty 1:1") — baza
  4:5 idempotentna po note, więc dogenerowanie 1:1 do istniejącego produktu NIE re-loguje 4:5.
  **Panel `adsGrafikiBlock`:** badge formatu `4:5`/`1:1`/`9:16` (fix: `11`→`1:1`), copy per KĄT
  (dedup — te same copy dla obu formatów), galeria pokazuje oba formaty per kąt. `sync_finalne`
  dokłada `*-1x1.png` do czystego folderu. Lekcja: **kwadrat to przekompozycja, nie nowa reklama —
  seed 4:5 trzyma spójność (message-match ZG1), refy produktu trzymają wierność (ZG2), a że model
  PRZERYSOWUJE układ, litery MUSZĄ przejść bramkę na nowo (nie dziedziczą się z 4:5).**
  Walidacja E2E v10 (3 produkty, ~$4.05): Drapek (`9e4b1df9…`) + Masażer (`557ed2b0…`) — po 3 kwadraty 1:1
  z istniejących finałów 4:5, tryb oszczędny, PIERWSZY przebieg bez poprawek (litery 100% verbatim,
  wierność OK). Mata akupresury (`9b377ae8…`) — pełny przebieg od zera (4:5 best-of-2 + 3 kwadraty +
  9 wariantów hooków), też czysto za pierwszym razem.
  - **Lekcja G8 (klasa: GENERALIZACJA BEZ-BRANDU — ujawniona na Macie akupresury `9b377ae8…`, produkt
    bez marki/logo/styl-mastera).** ART-DIRECTION lifestyle i baza `no_hook` HARDKODOWAŁY „the small brand
    logo" / „Put the brand LOGO in a corner" — dla produktu bez logo model WYMYŚLIŁBY fałszywy wordmark
    (łamie white-label + uczciwość). **Fix FABRYKI (nie pliku):** logo w briefie jest teraz WARUNKOWE od
    `has_logo` — `{LOGO}` placeholder w `FD_ART["lifestyle"]` (pusty gdy brak logo), gałąź `no_hook` mówi
    „this product has NO brand logo — do NOT add any logo or wordmark", a `brand_line` przy braku logo dokłada
    twarde „do NOT invent, draw or place any logo/wordmark". Efekt: Mata wyszła CZYSTA i bezmarkowa (zero
    wymyślonego znaku) w 4:5, 1:1 i wariantach hooków — pierwszy przebieg, bez ani jednego obejścia. Zasada:
    **brak logo = brak logo (nie wymyślaj); slug brak → użyj istniejącego albo wygeneruj i zapisz przez
    panel-sync. Wellness (akupresura): framing relaks/rytuał/napięcie przez regułę `build_copy_prompt` (v9) —
    zero claimów medycznych, kontrast NASTROJU nie ciała.**

- **2026-07-19 (v9) — GENERALIZACJA FABRYKI = DRUGI PRODUKT (Masażer „Odprężek", `557ed2b0…`, ~$2.03 /
  8.1 zł, 3 finały + 9 wariantów hooków):** pierwszy przebieg po Drapku ujawnił, że fabryka była
  **zahardkodowana pod jeden produkt** (pies + deska + smakołyki) w CAŁEJ warstwie generacji. Trzy lekcje:
  - **Lekcja G8 #1 (klasa: HARDCODE SCENARIUSZA — największa).** `FD_ART`, `FD_USP_MOMENT`, schemat
    `build_copy_prompt`, `CLICK_GATE_QUESTIONS`, hinty callloutów demo, `fidelity_surgical_fix` i
    `_fd_product_para` opisywały DOSŁOWNIE psa drapiącego deskę po smakołyk. Co gorsza, **full-design
    IGNOROWAŁ `scene_vision`/`pain_vision` z copy** (copy generuje je per-produkt!) i wklejał scenariusz
    psa. Masażer wygenerowałby psa z masażerem. **Fix FABRYKI (nie pliku):** `FD_ART`/`FD_USP_MOMENT`/
    schemat copy przepisane PRODUCT-AGNOSTIC (opisują tylko KOMPOZYCJĘ/layout/światło); `build_fulldesign`
    wstrzykuje `{SCENE}`/`{PAIN}`/`{MINI}` z copy do art-direction danego kąta. Zasada: **subiekt/AKCJĘ
    niesie `scene_vision` (per produkt), szablon niesie tylko kompozycję.** Efekt: masażer wyszedł wierny
    (zielony pikowany korpus + silikonowa dłoń+kciuk + srebrny panel + grzanie) bez ani jednego ręcznego
    obejścia; diakrytyki w wersalikach 100% (Ę Ó Ł Ń Ś Ć ż).
  - **Lekcja G8 #2 (klasa: RECLAIM CROSS-PRODUCT — bug ujawniony DOPIERO na 2. produkcie).** Tagi ledgera
    fal w trybie single-product (`hbase_*`, `%s_c%d`) NIE były namespace'owane slugiem, więc `_reclaim_paid`
    (poluje ledger po `project+"_"+tag`) **dociągnął OPŁACONE bazy Drapka** do przebiegu masażera i
    opublikował 9 błędnych wariantów (pies pod hasłem „RELAKS NA KANAPIE"). **Fix FABRYKI:** slug-namespace
    WSZYSTKICH tagów single-product (`slug__hbase_%s`, `slug__%s_c%d`) — spójnie z trybem portfelowym
    (`do_portfolio` już to robił). Sprzątanie: 9 artefaktów usunięte + storage nadpisany + regeneracja
    (`slug__hbase_*` → brak matchu Drapka). **Reguła nadrzędna: każdy tag ledgera fal MUSI być per-produkt,
    inaczej RESUME/RECLAIM przecieka między produktami przy wspólnym ledgerze.**
  - **Lekcja G8 #3 (klasa: POLITYKA WELLNESS).** Masażer = kategoria zdrowie/wellness → ryzyko Meta
    (claimy medyczne, before/after ciała, personal attributes). Dopisano twardą regułę do `build_copy_prompt`:
    framing = relaks/komfort/odprężenie/ulga w napięciu mięśni, ZAKAZ „koniec bólu"/„leczy"/„natychmiastowa
    ulga"; w kącie problem dozwolony wyłącznie kontrast NASTROJU/napięcia tej samej osoby (zmęczenie→ulga),
    NIE transformacja ciała. `FD_HONESTY` już zawierał „NO medical/wellness claims; NO before/after of a
    human body". Wygenerowane hooki wyszły bezpieczne („Napięcie, które puszcza", „Napięcie → odprężenie").
  - **Drobne luki (zalogowane, nie blokujące):** (a) brand fonty (Baloo 2/Caveat/Nunito Sans) nie ma w
    `fonts/` → nakładka hooków renderuje fallback Montserrat-Black; main finały renderuje model (nbpro) więc
    krój OK — tylko warianty hooków w innym kroju (do dosypania TTF do `FONT_MAP`). (b) MULTI-REF wziął 1 kadr
    lifestyle (`g1`, kobieta z produktem) jako „packshot" — wierność i tak OK, ale dobór refów mógłby
    preferować czyste packshoty. (c) model raz wyrenderował literalne „CTA |" przed CTA w bazie `no_hook`
    (jednorazowy quirk; main finał czysty). WNIOSEK OGÓLNY: **każdy nowy produkt jest testem generalizacji —
    hardcode jednego produktu = dług, który spłaca dopiero drugi.**

- **2026-07-19 (v1.1) — MANUS USUNIĘTY Z MODUŁU (decyzja Tomka: „fabryka banerów = ad-forge/fal"):**
  edge `wf2-ads` SKASOWANY, gałąź routingu `ads_manus_task_id→wf2_products→wf2-ads` wycięta z
  `manus-webhook`, kolumny `wf2_products.ads_manus_*` (task_id/status/step/started_at/completed_at)
  zdjęte migracją `20260719l_wf2_manus_removal.sql` (`ads_creatives` ZOSTAJE — pisze tam ad-forge).
  Panel `/tn-sklepy`: usunięty pill running/failed, link manus.im, przyciski „Reset (po doładowaniu
  kredytów)" i „Alternatywa: Manus", funkcje `wf2AdsGenerate/Sweep/Reset` — zostaje galeria +
  akcept + timeline `agr_*` + koszty + CTA „Generuj przez ad-forge". `package.json`: usunięty
  `deploy:wf2-ads` (i z agregatu `deploy:wf2`). Silnik = WYŁĄCZNIE fal (nano-banana-pro/nb2) przez
  `ad-forge.py`. **ZAKRES = tylko wf2**: workflow v1 (`manus-full-campaign` / `manus_task_id`) i lejek
  /sklep (`bud-ads` / `bud_sessions.ads_manus_*`) NIETKNIĘTE — tam Manus zostaje. ZG9 przepisany,
  sekcje D1/§1/G2/G3/G7/§2/§5/§6 zsynchronizowane. `wf2-ads-sync` (sync Meta) i `wf2-gpt`/`wf2-gen`
  (copy/sceny ad-forge) to OSOBNE funkcje — nietknięte.

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
  do bud-assets/<slug>/ads/dowody/, activity. Panel: CTA „Generuj przez ad-forge (sesja)" — jedyny silnik
  (Manus usunięty 19.07, patrz wpis niżej). GOTCHA: PATCH labeli z polskimi znakami przez czysty UTF-8 Python, NIE curl
  (cp1250 psuje diakrytyki w bazie).

- **2026-07-22 — v9 LEKCJE PRZEBIEGU ZARADEK (3 produkty, pass-2 wyłapał realne FAIL-e):**
  (1) **Scena użycia vs USP:** dla produktów „zdalnych/bezdotykowych" (pilot, sterowanie) model
  uparcie lepi dłoń do ekranu — 2 fixy edit NIE przestawiły pozy; skuteczne = przepisanie
  `scene_vision` w state (produkt-bohater BEZ telefonu/dłoni) + `--regen` kąta. Edit dobrze robi
  retusze lokalne (usuń obiekt/okrąg dotyku), źle — zmiany kompozycji.
  (2) **Kąt problem dla produktów wellness:** PRZED wolno pokazywać wyłącznie CZYNNOŚĆ
  (niewygodne sięganie/ręczne ugniatanie), NIGDY stan ciała (grymas bólu, trzymanie się za plecy,
  strefy bólu) — pierwotny brief „napięcie→odprężenie" = twardy FAIL G5 (wellness before-after);
  hook przerobiony na kontrast METODY („RĘCZNE UGNIATANIE → 6 GŁOWIC") przechodzi.
  (3) **SQUARE_RECOMPOSE potrafi odjechać** — wygenerować NOWĄ scenę zamiast przekompozycji
  (incydent Ugniatek 1:1: inna kompozycja + „Ügniatek" + czerwona strefa bólu + inne urządzenie);
  bramka kwadratu (litery VERBATIM + zgodność kompozycji z 4:5) jest OBOWIĄZKOWA per format,
  fix = ponowny `--gen-11` kąta.
  (4) **Scramble-plakietki na korpusie produktu:** edit odtwarzający napis marki na plakietce
  losuje pseudo-marki (GJUMAGA/MARSEUI/MEZEXEX) — po 1 nieudanym ficie NIE losować dalej:
  usunąć napis DETERMINISTYCZNIE (PIL: blend sąsiednich pasów korpusu + blur) albo kazać editowi
  usunąć plakietkę całkiem („czysty korpus" = pominięcie detalu, nie fałszerstwo).
  (5) **Wyciek nazwy fontu do copy:** model potrafi doklieć nazwę kroju do tekstu na banerze
  („za pobraniem in Figtree") — bramka G4 musi czytać KAŻDY blok tekstu litera-po-literze,
  także drobny.
  (6) **Kotwice cech niewidzialnych (Bluetooth):** linia calloutu ma wskazywać fale sygnału /
  korpus, nie przycisk — kotwica na przycisku sugeruje fałszywą funkcję przycisku.
