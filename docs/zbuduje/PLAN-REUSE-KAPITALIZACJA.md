# PLAN — KAPITALIZACJA FABRYKI LANDINGÓW (reuse bez utraty unikatowości)

> Cel: sprawić, by **każdy kolejny landing był tańszy i szybszy niż poprzedni**, bez utraty jakości
> i bez produkcji „skórek" (kopii 1:1). Powstało z 4 dogłębnych analiz (granica reuse↔unikatowość,
> hotspoty kosztu z dowodów maty/masażera, inwentarz istniejących assetów, research branżowy).
> Status: PLAN do decyzji Tomka. Data: 2026-07-21.

> **⚙️ PRZERAMOWANIE (decyzja Tomka 21.07): priorytet = JAKOŚĆ, koszt drugorzędny.** *„Mi nawet
> nie chodzi o koszty… chcę to zoptymalizować tam, gdzie się da."* Czytaj cały plan pod tym kątem:
> optymalizujemy **czas / spójność / rework** wyłącznie tam, gdzie to **PODNOSI albo NIE RUSZA**
> jakości; metryki kosztowe niżej są drugorzędne. **Wdrożenie:** wszystkie fazy realizowane —
> runbook operacyjny = `KAPITALIZACJA-OPS.md`; status per-artefakt w §ROADMAPA (dół pliku).

---

## 0. TEZA (jedno zdanie)

**Fabryka nie walczy z reuse — walczy z reuse w niewłaściwej warstwie.** Reużywaj AGRESYWNIE
*rzemiosło* (prefiks promptów, mechanikę, szkielety sekcji, strukturę tokenów) — to **podnosi**
jakość i nie rusza tożsamości. Regeneruj ZAWSZE *pomysł* (paleta, para fontów, świat/sceny,
archetyp-dobór, realne copy) — to jedyny wektor, który robi rozpoznawalność.

To potwierdzają dwa niezależne źródła:
- **Nasza doktryna** KANON vs PARTYTURA (`TOKENS-MAKIETY.md:33-93`): mylenie ich dało zbieżność
  masażer↔Drapek **9/10** („ta sama strona z podmienionym produktem").
- **Badania** (Diversity Collapse, Verbalized Sampling): sztywne **formaty i exemplary** obniżają
  entropię generacji i prowadzą do *mode collapse*; struktura i tokeny — nie. Czyli: reużywaj
  strukturę do woli, exemplary/formaty — ostrożnie.

---

## 1. MAPA 3 WARSTW — co reużywać i JAK

| Warstwa | Co to | Reuse | Ryzyko dla unikatowości | Chroni gate |
|---|---|---|---|---|
| **A · INWARIANT** (KANON-mechanika) | mechanika modułów R13 + JS + proporcje, runtime-snippet, pay-badges (SVG), checkout/legal, struktura tokenów (nazwy zmiennych), skala 8pt/typo, scope 1 akcentu, gate infra, procedura wierności kodu (`ir.root.css` 1:1) | **KOPIA 1:1 — obowiązkowa** | **ZEROWE** (kopia tu *podnosi* jakość) | `layout_diff`, `finalny_pass` (pay-badges-imitacje), `panel_sync` (footer) |
| **B · PARAMETRYCZNY** (reuse STRUKTURY, zmienne WARTOŚCI) | struktura tokenów-ról, biblioteki-katalogi: archetypy hero A–H, sygnatury S1–S8, rodziny tła (8), szkielety sekcji (headless), framework copy, archetyp persony (ICP), szablony promptów | **reuse STRUKTURY, generuj WARTOŚCI** | **NISKIE–ŚREDNIE** (bezpieczne, dopóki reuse ≠ wartości) | `cross_landing` (pilnuje że wartości dywergują) |
| **C · GENERATYWNY** (= PARTYTURA) | paleta (hexy), para fontów, kolor akcentu, archetyp-DOBÓR litery, świat/sceny/seedy/storyboard, realne copy, packshoty, sygnatura-dobór | **ZAWSZE od nowa** | — (tu ŻYJE tożsamość) | `cross_landing` (font=FAIL, ΔE<15=FAIL, archetyp=FAIL), `phash` (wewnątrz), `wiernosc` |

**Reguła operacyjna:** *Reuse skeletonu sekcji ≠ reuse palety. Reuse frameworku copy ≠ reuse
narracji. Reuse struktury tokenów ≠ reuse hexów.* Warunek przejścia bramki: **≥3 z 5 osi różnicy**
wobec bezpośrednio poprzedniego landingu (rodzina tła · akcent · font display · archetyp · świat).

---

## 2. GDZIE REALNIE BOLI (i czego NIE trzeba budować)

Dowody z realnych buildów (mata, masażer):
- **Koszt bazowego przebiegu jest OPANOWANY** (~$5/landing). To NIE tu jest problem.
- **Realny wyciek #1 — F3 regeneracje scen:** mata **11 z 15 scen przegenerowanych** (defekt typu
  osadzenia), masażer regen pozy „szpon" **+$1.10** + reframe 4 scen mobile.
- **Realny wyciek #2 — rundy poprawek PO „gotowe":** masażer **$4.92 → ~$10.6 (2.15×)** — hero-video,
  reframe mobile, mid-CTA jako sekcja, regen pozy. To rework, nie bazowy przebieg.
- **Oba wycieki są już zaadresowane DOKTRYNALNIE** po macie (typ osadzenia, hero-pod-video,
  MANIFEST SEKCJI, szkielet CTA — wszystko bramkowane).

**Wniosek strategiczny:** największego zwrotu **nie da nowy kod generujący**, tylko dwie rzeczy:
1. **EGZEKUCJA pre-decyzji na WEJŚCIU** (typ osadzenia A/B/C, hero-pod-video, MANIFEST/CTA) — żeby
   regeneracje w ogóle nie powstawały. (Dług spłacony po macie; pilnować, by nie wracał.)
2. **KAPITALIZACJA** — przestać startować każdy landing „od zera", skoro mamy już 12 zbudowanych
   i 6 sprawdzonych modułów. To jest brakujące koło zamachowe.

---

## 3. SIEDEM DŹWIGNI (ranking wg: zysk × niskie ryzyko × łatwość)

### 🥇 1. PROMPT CACHING prefiksu — natychmiast, zero ryzyka
- **Co:** cache statycznego prefiksu żądania (Anthropic: cache-hit = **0.1× ceny**, Opus 4.8
  $5→$0.50/M tok). Prefiks per landing = `[doktryna fabryki + KANON + style-lock + zakazy copy +
  kontrakty szkieletów + tokeny produktu]`, breakpoint na OSTATNIM statycznym bloku, `[brief sekcji]`
  po nim (dynamika na końcu).
- **Dźwignia:** przy N sekcjach × iteracje płacisz pełny prefiks RAZ, potem 0.1×. Tnie koszt (do 10×
  na prefiksie) **i wall-clock** (mniej tokenów = mniej ryzyka deadline Edge 330s).
- **Ryzyko unikatowości: ZEROWE** — cache nie zmienia outputu.
- **U nas:** dziś re-wysyłamy ten sam KANON/style-lock kilkanaście razy na landing. Pułapka do
  uniknięcia: breakpoint NIGDY na bloku z timestampem/briefem (hash prefiksu nie trafi → 0 hitów).

### 🥈 2. SKELETON-FIRST — biblioteka headless szkieletów sekcji
- **Co:** koder F4 przestaje pisać sekcję „od zera", dostaje **headless szkielet** (kontrakt: DOM,
  sloty treści, responsywność, a11y, harness animacji, typ osadzenia sceny jako enum) i wypełnia go
  tokenami + sceną + copy. (Branża: v0 komponuje z shadcn, Relume miksuje komponenty; badania Athena/
  Biscuit: „GUI skeletons" jako warstwa pośrednia = mniej błędów.)
- **Dźwignia:** eliminuje 60–80% pracy inżynierskiej per sekcja (a11y/responsywność/kontrakty scen),
  którą dziś rozwiązujemy od nowa. F3A dostaje stały kontrakt („sensowność osadzenia" łatwiejsza, gdy
  typ osadzenia to enum ze szkieletu).
- **Ryzyko: NISKIE**, JEŚLI szkielet jest headless (struktura + zachowanie), a wygląd = tokeny+sceny+copy.
  Szkielet zaszywający wartości wizualne = klony. Zasada: **szkielet mówi *co* i *jak się zachowuje*;
  tokeny+sceny+copy mówią *jak wygląda*.**
- **U nas:** mamy 6 modułów (mechanika), ale ~7 nawracających sekcji (problem, korzyści, `porownanie`,
  `opinie`, `galeria`, `material`, offer-box `#zamow`) NIE jest wydzielonych — powtarzamy je w 12 landingach.

### 🥉 3. TOKENY 3-WARSTWOWE per-produkt (rozwój „manifestu stylu")
- **Co:** primitive (surowe wartości) → semantic (role: `--paper`, `--ink`, `--cta`) → component.
  Jeden plik tokenów per-produkt wstrzykiwany do niezmienionych szkieletów (pkt 2). Mamy zalążek
  (`sklep-design-tokens-manifest-stylu.md` + `:root` w TOKENS-MAKIETY).
- **Dźwignia:** tokeny to WEKTOR, który nadaje unikatowość szkieletom z pkt 2 → **2 i 3 wdrażać razem**.
- **Ryzyko: NISKIE** (tu żyje unikatowość). Odwrotne ryzyko: za wąska paleta tokenów → „tak samo, tylko
  inny kolor". Mitygacja: tokeny obejmują osie, które OKO widzi (typo + skala + rytm + charakter
  cieni/radius + **tempo motion**), nie tylko hue.

### 4. VARIANT-GEN (Quality-Diversity) + VERBALIZED SAMPLING — dla A/B kierunków
- **Co:** generuj warianty przez **ograniczenia + sterowaną losowość** („constrain first, randomize
  second"), nie przez temperaturę. Osie wariancji jawne: `{archetyp świata × paleta-rodzina × typ
  osadzenia × topologia hero × tempo motion × framework copy}`. Archiwum **MAP-Elites**: generuj
  nadmiarowo, gate'y przepuszczają, do archiwum trafia 1 najlepszy na „niszę" (behavioral descriptor).
  Dla WYBORÓW KREATYWNYCH: **Verbalized Sampling** („wygeneruj 5 kierunków wraz z prawdopodobieństwami")
  odzyskuje 1.6–2.1× różnorodności bez utraty jakości.
- **Dźwignia:** to jest silnik naszego „A/B kierunków" i „optymalizacje bez pytania" — daje realnie
  różne warianty zamiast klonów, i archiwum, które **utrzymuje różnorodność MIĘDZY produktami**
  (koniec „bliźniaków").
- **Ryzyko: to technika PRZECIW klonom.** Bez zdefiniowanych osi = szum albo pozorna różnorodność.

### 5. GOLDEN EXEMPLARY — TYLKO dla warstwy rzemiosła
- **Co:** few-shot najlepszymi przykładami podnosi „podłogę jakości" (czysty kod, escaping, rytm).
- **Ryzyko: NAJWYŻSZE z listy — główny wektor mode collapse.** Dlatego twarde reguły:
  - **NIGDY jeden stały exemplar.** Pula + dobór 2–5 per brief (trafność + wzajemna różnorodność).
  - **Rotacja** — użyty ostatnio ma niższą wagę.
  - Exemplary WYŁĄCZNIE dla „jak dobrze wykonać" (kod/rytm), **NIGDY dla „co wymyślić"** (wizja/kierunek/copy) — tam Verbalized Sampling (pkt 4).
- **To rozdziela dwie rzeczy, które łatwo pomylić: reużywalność RZEMIOSŁA (chcemy) vs reużywalność
  POMYSŁU (zabija A/B).**

### 6. RAG dla copy/patternów
- **Co:** indeks sprawdzonych frameworków copy (PAS/AIDA/obiekcje→odpowiedzi), warstwy konwersji,
  profili obiekcji person; retriever dobiera per brief, gpt-5.6 pisze ŚWIEŻE copy na szkielecie.
- **Ryzyko: ŚREDNIE.** Retrieval musi zwracać **wzorzec/framework (abstrakcję), nie gotowe zdania** —
  inaczej przecieka dosłowny tekst innego landingu. Pattern-level, nie sentence-level.
- **U nas:** mamy `warstwa-konwersji-playbook.md`, `leady-sklep-profil-obiekcje.md` — surowce do indeksu.
  Zakazy (`24h/PL`, `raty/pobranie`) = filtry guardrail na warstwie retrievalu.

### 7. FLYWHEEL biblioteki — zasada organizująca (nie pojedyncze wdrożenie)
- **Co:** buduj tak, by KAŻDY landing POWIĘKSZAŁ bibliotekę. Dane branżowe: dojrzały system = **2.6×
  szybciej w 2. roku, >3× przy pełnej adopcji**.
- **Antidotum na „grawitację domowego stylu":** do biblioteki wracają **SZKIELETY + TOKENY +
  WARIANTY-w-archiwum** (strukturalne/parametryczne), **NIGDY „gotowe landingi jako exemplar do
  kopiowania"**. Flywheel kapitalizuje RZEMIOSŁO, nie POMYSŁY.

---

## 4. FUNDAMENT KAPITALIZACJI — co zbudować i w jakiej kolejności

Luki (z inwentarza — mamy 12 landingów i 6 modułów, ale):

| # | Brakujący asset | Dlaczego krytyczny | Koszt budowy |
|---|---|---|---|
| **F-1** | **`EXEMPLARY-INDEX.md`** — rejestr 12 landingów (slug · typ produktu · archetyp hero · użyte moduły · sekwencja sekcji · akcent/font · ocena jakości · link) | Dziś ZERO rejestru → każdy landing startuje „od zera". Odblokowuje retrieval po typie produktu, few-shot, reuse skeletonów, i zasila `cross_landing` prawdziwym „N poprzednich". **Dane JUŻ istnieją.** | **NAJTAŃSZY / najwyższy ROI** |
| **F-2** | **Skeletony sekcji → `moduly/`** w konwencji `@N`: `porownanie-tabela@1`, `opinie@1`, `offer-box@1` (100% pokrycia w 12 landingach) | Rozszerza sprawdzoną maszynerię modułów; każde wydzielenie natychmiast tnie koszt N+1 | tani (znany wzorzec) |
| **F-3** | **`PARTIALE-PROMPTY.md`** — wersjonowane partiale: STYLE-DNA, „EXACTLY ONE SECTION", zakazy PASZPORT, typ osadzenia, seedy F1.7 | Dziś składane ad-hoc jako proza w 3 plikach; jeden plik wstrzykiwany 1:1 = spójność + baza pod prompt-caching (pkt 3.1) | tani |
| **F-4** | **`LEKCJE-LANDINGI.md`** — księga główna lekcji (kopia dojrzałego wzorca z `docs/stworze/LEKCJE-FABRYKI.md` L-001…L-070) | Fabryka aplikacji już to ma; landingów NIE — `RETRO.md` per-slug giną (dokładnie ta klasa problemu, którą fabryka aplikacji rozwiązała) | średni |
| **F-5** | **Biblioteka ARCHETYPÓW PERSON + FRAMEWORKÓW COPY** (indeks RAG) | ICP dziś per-landing i opcjonalny; brak reużywalnych szablonów person i copy | średni (pod pkt 6) |
| **F-6** | **Archiwum artefaktów per-landing DO REPO** (dziś: Desktop jednego kompa, nieobecny → gate'y SKIP-ują, wiedza nie-wersjonowana) | Single-point-of-failure; bez tego flywheel nie ma paliwa | średni, ważny |

---

## 5. ZABEZPIECZENIA JAKOŚCI (żeby reuse nie zrobił skórek)

1. **`cross_landing` ZOSTAJE nietknięty** — font=FAIL, ΔE<15=FAIL, archetyp=FAIL. To jedyny check
   patrzący MIĘDZY landingami; on definiuje „minimalny budżet różnicy".
2. **Exemplary tylko dla rzemiosła; wizja przez Verbalized Sampling + rotację.** (Diversity Collapse.)
3. **Flywheel deponuje SZKIELETY + TOKENY + WARIANTY — NIGDY gotowe landingi jako wzorzec do kopiowania.**
4. **Reuse ≠ w warstwie C.** Każda pozycja PARTYTURY musi mieć uzasadnienie w `PLAN.md` („ten
   produkt/persona prowadzi do…"), inaczej F2.5 niezamknięty.
5. **Failure modes jako checklist krytyka** (z analizy granicy):
   - reuse tokenów 1:1 → klon · PARTYTURA udająca KANON („clinical-warmth" narzucony) · reuse
     przewodnika → ten sam świat · reuse archetypu → rodzeństwo · reuse copy → ta sama narracja ·
     (odwrotne) „naprawianie" PARTYTURY do normy poprzednika · kodowanie mechaniki od zera · badge z pamięci.

---

## 6. MAPA WDROŻENIA FAZAMI

| Faza | Zakres | Zysk | Ryzyko | Nakład |
|---|---|---|---|---|
| **FAZA 0 — „darmowe" (dni)** | (a) **Prompt caching** prefiksu · (b) **`EXEMPLARY-INDEX.md`** · (c) egzekucja pre-decyzji (typ osadzenia / hero-pod-video / MANIFEST-CTA) jako twarda checklista wejścia | koszt/tok ↓ do 10× na prefiksie; wall-clock ↓; koniec „startu od zera"; koniec regeneracji z reworku | ZEROWE | mały |
| **FAZA 1 — rdzeń (tydzień)** | (a) **`PARTIALE-PROMPTY.md`** (wydziel partiale) · (b) **Skeletony sekcji** `porownanie/opinie/offer-box @1` · (c) **Tokeny 3-warstwowe** per-produkt (razem ze skeletonami) | F4 „wypełnij kontrakt" zamiast „pisz od zera"; N+1 realnie tańszy | NISKIE (headless + tokeny nie ruszają tożsamości) | średni |
| **FAZA 2 — inteligencja (2 tyg.)** | (a) **RAG copy/patterny** (framework, nie zdania) · (b) **Variant-gen QD + Verbalized Sampling** dla A/B kierunków · (c) **Biblioteka person** | lepsze copy pass-first; realnie różne warianty; różnorodność między produktami wymuszona | ŚREDNIE (pilnować granularności retrievalu + osi wariancji) | większy |
| **FAZA 3 — flywheel (ciągłe)** | (a) **`LEKCJE-LANDINGI.md`** + pętla deponowania aktywów po każdym landingu · (b) **Archiwum do repo** | krzywa kosztu krańcowego opada; poprawka propaguje się na wszystko | najniższe bieżące, najwyższy zwrot długoterminowy | rozłożony |

### 🟢 STATUS WDROŻENIA (2026-07-21 — wszystkie fazy zrealizowane, self-verified)

| Artefakt | Faza | Plik | Stan |
|---|---|---|---|
| Runbook operacyjny reuse | 0-3 | `KAPITALIZACJA-OPS.md` | ✅ |
| Rejestr wzorców (12 landingów) | 0 | `EXEMPLARY-INDEX.md` | ✅ zweryfikowany (12/12, spot-check 3, outliery ΔE oznaczone) |
| Prompt-cache prefix-first | 0 | `PARTIALE-PROMPTY.md` + nota w `wf2gpt-call.py` + STANDARD §7a(e) | ✅ (zero zmian w kodzie proxy) |
| Preflight pre-decyzji | 0 | `KAPITALIZACJA-OPS §3` | ✅ |
| Partiale promptów (statyczny prefiks) | 1 | `PARTIALE-PROMPTY.md` | ✅ 5 bloków 1:1 z SSOT |
| Skeletony sekcji (headless) | 1 | `moduly/{porownanie-tabela,opinie,offer-box}@1.html` + `MODULY.md` | ✅ headless potwierdzony niezależnie (0 hex/rgba/font); recurrence 12/10/10 z 12 |
| Kontrakt tokenów (3 warstwy) | 1 | `TOKEN-KONTRAKT.md` | ✅ wg realnego `:root` mata/masażer/Drapek |
| RAG copy + variant-gen QD + persony | 2 | `FAZA2-COPY-WARIANTY.md` | 🟡 PROJEKT gated — **wyłączone** do akceptu Tomka + pilotu side-by-side |
| Księga lekcji (flywheel wiedzy) | 3 | `LEKCJE-LANDINGI.md` | ✅ 25 lekcji, nośniki zweryfikowane |
| Pętla deponowania + archiwum→repo | 3 | `KAPITALIZACJA-OPS §4` | ✅ procedura (egzekucja per landing) |

> **Bezpieczeństwo jakości:** wszystkie ✅ są ADDITYWNE (nowe pliki/moduły/noty) — **zero zmian
> w logice generacji i zero w kodzie bramek**; jedyna wrażliwa na jakość Faza 2 jest 🟡 wyłączona.

---

## 7. METRYKI (czy flywheel działa)

- **Koszt / landing** (bazowy vs z reworkiem) — cel: trend malejący N→N+1.
- **Wall-clock / landing** — cel: malejący (caching + skeletony).
- **Liczba regeneracji F3** / landing — cel: →0 (pre-decyzje).
- **Rundy poprawek po „gotowe"** — cel: →0 (bramki wejścia).
- **`cross_landing` pass-first-try** — cel: 100% (różnorodność projektowana, nie łatana).
- **% sekcji z modułu/skeletonu** (nie od zera) — cel: rosnący.
- **Cache hit-rate** prefiksu — cel: >90% wywołań po pierwszym.

---

## PODSUMOWANIE JEDNYM AKAPITEM

Reużywaj **agresywnie** to, co nie rusza tożsamości: **prefiks promptów (cache), mechanikę i
szkielety sekcji (headless), strukturę tokenów** — to tnie koszt i *podnosi* jakość. Reużywaj
**ostrożnie** exemplary i formaty (rotacja + Verbalized Sampling + archiwum QD), bo to jedyny
udowodniony wektor klonów. **Nigdy** nie reużywaj warstwy C (paleta/świat/archetyp/copy) — ją
zawsze generuj świeżo, a `cross_landing` tego pilnuje. Zacznij od FAZY 0 (dni, zero ryzyka:
prompt-caching + rejestr exemplarów), bo tam jest największy stosunek zysku do wysiłku, a fundament
pod resztę (skeletony, tokeny, RAG, flywheel) buduje się na tym rejestrze.
