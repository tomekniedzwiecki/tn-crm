# GRAFIKA-Z-MAKIETY — warstwa graficzna sekcji: rozpoznanie i ekstrakcja 1:1

**Status: OBOWIĄZUJE (2026-07-16 późny wieczór; zasada Tomka + synteza 2× research Sonnet).**

**ZASADA (Tomek):** grafiki nadają stronie styl i robią największe wrażenie — używamy ich jak
najwięcej. Dla KAŻDEJ sekcji makiety trzeba rozpoznać, co jest **WARSTWĄ GRAFICZNĄ** (sceny,
foto-pasy — np. „morze" w 02-trust, duże zdjęcia sekcji — np. 05-benefits, ornamenty), a co
**ELEMENTEM KODOWYM** (tekst, przyciski, karty, ikony, listy). Każdy element graficzny musi
zostać dostarczony jako OSOBNY plik wyciągnięty z zaakceptowanej makiety (1:1), a kod buduje
na nim resztę. Dotyczy każdej sekcji — nie tylko hero.

## 1. ROZPOZNANIE WARSTW (per makieta, PRZED kodowaniem)

**Vision-checklist (agent ogląda makietę + bboxy z IR; NIE liczy pikseli):** dla każdego
dużego regionu orzeknij:
1. WARSTWA: grafika (foto/scena/pas/ornament) czy KOD (tekst/przycisk/karta/ikona/lista)?
   Przycisk/pill/karta z gradientem i tekstem = KOD (mała powierzchnia + ostry prostokąt
   + tekst). Foto-pas / scena / blask / łuk = GRAFIKA.
2. TYP grafiki: `scena-fullbleed` | `pas-dekoracyjny` | `zdjecie-w-karcie` | `ornament`.
3. Czy zawiera PRODUKT? Czy ma wypalony TEKST/UI (overlay)?
4. Rekomendacja: crop czy regeneracja (drzewo niżej).
5. Klasa OBRAZY-ROLE (P/U/S/R) + zgodność z allowlistą slotu.
Frosted-glass karta na scenie = KOD, ale tło POD nią to część sceny-fullbleed (nie wycinać
dziury — scena idzie w całości, kod nakłada glass).

**Detektor algorytmiczny `detect_graphic_regions` (mockup-ir.py) — SPEC gotowy, do
implementacji:** klasyfikacja kafli 24px w Lab (kluczowy dyskryminator foto/flat =
`chroma_spread`>10 + `lum_var`>14; flat = `delta_bg`<18 + `lum_var`<6; UI = OCR-hit /
gęste krawędzie w małym prostokącie), morfologia + typowanie geometrią (pas = ≥0.9·W przy
krawędzi; fullbleed = ≥30% area + 2 krawędzie; ornament = fill<0.35), wynik w IR.json jako
`graphic_regions[{bbox,typ,ma_overlay_tekstu,rekomendacja,confidence}]`, confidence<0.65 ⇒
werdykt vision. Pseudokod: raport researchu 16.07 (transkrypt sesji fabryki).

### TYP OSADZENIA SCENY (oś: gdzie leży COPY względem sceny) — decyduje o tym, czy scena ma fade
Zanim wygenerujesz/wytniesz scenę, orzeknij **z makiety**, jak copy jest osadzone względem niej.
To NIE to samo co „TYP grafiki" — to relacja **tekst↔scena**, i ona sama decyduje, czy scena
potrzebuje strefy przejścia (fade), czy ma być pełnym kadrem:

| Typ osadzenia | Co widać na makiecie | Czego wymaga scena |
|---|---|---|
| **A. full-bleed z copy NA scenie** | tekst/karta/CTA leżą NA obrazie (hero, sekcje pełnoekranowe z napisem na zdjęciu) | **strefa przejścia**: pole treści „fade seamlessly into flat solid #HEX", PŁYNNE, zintegrowane ze scenografią; kod kładzie tekst na tym polu |
| **B. split / kadr-w-kolumnie** | scena w JEDNEJ kolumnie, copy w DRUGIEJ kolumnie na tle sekcji (obok, nie na obrazie) | **PEŁNY KADR** od krawędzi do krawędzi, ⛔ ZERO fade, ZERO pola na copy — kod przytnie `object-fit:cover` do swojej kolumny |
| **C. slot / kafel** (galeria, „gdzie", karty demo) | zdjęcie w małym prostokącie/kaflu obok innych | **PEŁNY KADR** kafla, ⛔ ZERO fade; ewentualny margines robi kod, nie obraz |

**Reguła twarda:** fade/negative-space robimy **wyłącznie dla typu A**. Dla B i C martwe pole
koloru = defekt (twardy prostokąt bez sensu w kolumnie — incydent `prawda-d.webp` 20.07: ~40%
kadru wylane na krem z ostrą pionową krawędzią, choć copy było w osobnej kolumnie). Przy
wątpliwości „czy copy jest NA scenie, czy obok" — sprawdź, gdzie w makiecie stoją bboxy tekstu:
wewnątrz regionu sceny = A; poza nim (inna kolumna/sekcja) = B/C.

## 2. DRZEWO DECYZYJNE EKSTRAKCJI (per element graficzny)

```
1. Region BEZ wypalonego tekstu/UI?
   ├─ TAK → 2
   └─ NIE → 4
2. Rozdzielczość regionu w makiecie ≥ potrzeba wyświetlania? (full-bleed 1x ≤1536px = OK)
   ├─ TAK → ► CROP (pixel-perfect, darmowy — DOMYŚLNY)
   ├─ NIE, content miękki (woda/bokeh/gradient) → ► CROP + LANCZOS ×1.3-2.0 + UnsharpMask
   └─ NIE, content ostry → ► REGEN (świadom sufitu 1536 — wyższej rozdz. NIE będzie)
3. Potrzebny inny aspekt / reframe / rozszerzenie kadru? → ► REGEN
4. Tekst/UI NA grafice:
   ├─ na PŁASKIM kolorze → ► CROP + paint-over płaskim #HEX w PIL (pixel-perfect, darmowy)
   └─ na FAKTURZE/scenie → ► EDITS+MASK (soft-mask, najbliższe zachowanie tła; ⚠️ BEZ
      `input_fidelity` — nie istnieje w gpt-image-2, patrz §3; wymaga rozszerzenia
      generate-image — sekcja 5) LUB REGEN referencyjny (akcept „semantycznie ta sama")
```

**⚠️ DRYF a WIERNOŚĆ — granica twarda (spina się z §4b F3A):** „dryf = cecha metody
scene-from-mockup" usprawiedliwia **WYŁĄCZNIE obiekty NIE-produktowe** (rekwizyty, tło,
scenografia, dłoń). **Każda cecha PRODUKTU z tabeli „Cechy dyskryminujące" paszportu jest
twarda** — jej dryf = NIEZGODNA = powrót do pętli regeneracji (§4b), nie waiver. Rekwizyt wolno
przepuścić tylko z notą w LEDGER + zgodą obu par oczu.

## 3. RECEPTURY

**CROP:** bbox z IR (0-1000 → px), `Image.crop`, krawędzie wchodzące w treść = feather
(alfa-rampa numpy) albo wypełnienie próbkowanym płaskim `#HEX` tła + gradient alfy; pasy
bezszwowe = mirror+blend końców. Eksport PNG (alfa jeśli feather) → upload `attachments`.
⚠️ Storage render API NIE upscaluje (resize-only) — nie używać do powiększania.

**REGEN referencyjny (gpt-image-2):** ref = zaakceptowana makieta + CZYSTY packshot
(NIGDY infografika — zatruwa paletę). Prompt: **numerowane REQUIREMENTS** (giną w prozie):
#1 same room/framing/light · #2 produkt SAME size and position as reference (+ krótki opis
sylwetki — edit potrafi zmienić kształt) · **#2b gdy sekcja jest KOLEJNĄ sceną produktową:
wymuś INNY kąt/kontekst niż już użyte pozy („avoid: same upright pose as hero") — inaczej
„SAME placement" produkuje klony (incydent Loczek 17.07: hero=03=12 ta sama poza)** ·
#3/#4 **ZALEŻĄ OD TYPU OSADZENIA** (patrz „TYP OSADZENIA SCENY" niżej):
— **full-bleed z copy NA scenie** → #3 strefa treści „fade seamlessly into flat solid #HEX",
przejście PŁYNNE i zintegrowane ze scenografią (spokojne pole podłogi/światła), ⛔ NIGDY twardy
prostokąt koloru z ostrą krawędzią; #4 REMOVE all text/UI, leave empty negative space.
— **split / kadr-w-kolumnie** (copy OBOK, w osobnej kolumnie na tle sekcji) → ⛔ **ZERO negative
space, ZERO fade** — PEŁNY KADR wypełniony sceną/produktem od krawędzi do krawędzi (kod przytnie
`object-fit:cover` do kolumny); tylko #4 REMOVE text/UI. Dodanie pola na copy = martwy pas w
kolumnie sceny (incydent `prawda` 20.07). **Dryf REKWIZYTÓW (obiekty
NIE-produktowe: tło, dłoń, odłożone akcesoria scenografii) = cecha metody** (SSIM cap ~0.7) —
oceniaj kierunkowo + werdykt vision. **⛔ To NIE dotyczy PRODUKTU: dryf którejkolwiek cechy
z tabeli „Cechy dyskryminujące" paszportu = NIEZGODNA = powrót do pętli F3A (§4b), NIGDY
usprawiedliwiany jako „cecha metody".**

**EDITS+MASK (inpainting):** `/v1/images/edits`, `image[]`=makieta (baza pierwsza),
`mask`=PNG tych samych wymiarów (alfa=0 = edytuj; z bboxów tekstu z IR + feather).
**NIE pixel-perfect** (soft-mask, rerender całości) — tylko dla tekstu na fakturze.
Wymaga rozszerzenia `generate-image/index.ts` (pola `edit_image_url`, `mask_url`;
gałąź edits); `wf2-gen` = proxy, bez zmian. [TODO]
⚠️ KOREKTA 17.07: **`input_fidelity` NIE dotyczy gpt-image-2** (parametr odrzucany —
wierność inputu wbudowana); wcześniejsza nota o `input_fidelity` obowiązuje tylko przy
zejściu na gpt-image-1/1.5.

## 3a. ARSENAŁ GRAFICZNY — co generować poza scenami/packshotami (klasa [D-art])

Grafika landingu to nie tylko sceny i packshoty (research 17.07). Dozwolony arsenał
dekoracyjny cięty z arkuszy (biel→alpha, klasa **[D-art]** — reguły w STANDARD F3.4):
- **hand-drawn akcenty** (arkusz: strzałki/podkreślenia markerem/kółka, 1 kolor akcentu,
  felt-tip, na czystej bieli) — najwyższy zwrot „human" przy małym ryzyku; max 2-3/stronę,
  nakładka `mix-blend-mode:multiply`, nigdy POD tekstem wymagającym kontrastu;
- **podkłady badge/pieczęci** (ząbkowany seal/ribbon, flat, 1 kolor, PUSTY środek) —
  **tekst PL zawsze nakłada KOD** (diakrytyki!); prosty seal lepiej w czystym SVG;
- **ramki washi-tape / polaroid / torn-paper** pod realne UGC (rotate ~2°, collage-feel;
  ramka = D-art, zawartość = klasa U — osobne tagi);
- **serie spot-ilustracji** z JEDNEGO arkusza 3×3 (wspólna paleta ≤3 kolorów) — tylko dla
  marek „ciepłych"; clinical/tech → zostać przy flat SVG;
- **tekstury papieru/lnu** — OSTROŻNIE: gpt-image NIE robi prawdziwego seamless; kafel
  1536² jako `cover` bez repeat, albo mirror-blend szwu w PIL (test `np.roll`).
**Reguła WEKTOR-FIRST (twarde NIE dla AI-PNG):** section dividers, wielkie liczby kroków
(typografia!), noise/grain (SVG `feTurbulence`, opacity ≤.05), proste seale, watermark-
patterny, izometryczne 3D-scenki (AI-slop tell), confetti. Format D-art: WebP/PNG z alfą,
512px (drobne) / 1024px (detal), data-URI dla małych.

## 4. WERYFIKACJA 1:1 — REGION-SSIM (nie cała sekcja!)

Wytnij TEN SAM bbox z makiety i z grafiki/renderu → wspólny rozmiar → SSIM sub-rectu;
bboxy usuniętego tekstu MASKUJ przed pomiarem. Progi: crop → ~1.0 z definicji (sanity
wyrównania); regen/edits → kierunkowo (cap ~0.7), twardy pomiar tylko na warstwie treści.
[TODO] `render-diff.py --region x,y,w,h [--mask-bbox ...]`.

## 4a. PODMIANA SCENY PO AKCEPCIE = GATE KOMPOZYCJI (incydent Odpalak 17.07)
Scena już osadzona na landingu (przeszła dowód dopasowania / widział ją Tomek) jest
ZAMROŻONA jak makieta. Każda podmiana (np. „tylko poprawka LCD") wymaga: (a) regen z
ORYGINALNĄ sceną jako ref + „SAME scene, SAME composition and framing, only change: …";
(b) gate PODWÓJNY: wierność paszportu ORAZ kompozycja vs oryginał (vision: to samo
kadrowanie? produkt to samo miejsce/rozmiar? ten sam aspekt!); (c) FAIL → zostaje
oryginał. Incydent: „poprawka LCD" podmieniła sceny 3:2/2:3 na generacje 1:1 (pikselowa
forma aspektu = cichy fallback, „zaakceptowany" przez agenta) → regres kompozycji na
live. **⛔ NIGDY pikselowa forma aspektu ('1536x1024') — ZAWSZE stringowa ('3:2'/'2:3'/
'1:1'); fallback do 1:1 przy scenie niekwadratowej = FAIL, nie „akceptowalne".**

## 4b. WERYFIKACJA WIERNOŚCI PRODUKTU (F3A) — DO SKUTKU (bramka F3→F4)

**Status: OBOWIĄZUJE (18.07; proces F3A).** Powód: grafika produktowa niezgodna z faktycznym
produktem przechodziła, bo werdykt wierności miał **JEDNĄ parę oczu** (generator, który sam
zamówił obraz) i furtkę „dryf = cecha metody" (incydent Latarek 17.07: grinder-pen zamiast
gilotyny — klient dostałby INNY produkt). **Żadna grafika produktowa (klasa S/P użyta w kodzie)
nie wchodzi do F4, dopóki nie ma werdyktu WIERNOŚĆ ∈ {ZGODNA, REAL, ESKALACJA+nota LEDGER}.**
Egzekwuje `gate-check.py` (blok `wiernosc`; artefakt `dopasowanie/WIERNOSC.md`).

**🔺 TRÓJKĄT DOWODU (jeden obraz side-by-side, per grafika):**
1. **GRAFIKA** — wygenerowana scena / packshot produkcyjny.
2. **PASZPORT — tabela „Cechy dyskryminujące"** (K cech; `PASZPORT.md` §Cechy dyskryminujące,
   format `| Cecha | Musi być | FAIL jeśli |`) → każda cecha oceniana PASS/FAIL na grafice.
3. **REALNY KADR Ali** — najczystszy packshot z galerii `detail` (⚠️ NIGDY tylko vs makieta —
   makieta może już nieść dryf). Porównanie cecha-po-cesze idzie ZAWSZE vs realny produkt.

**👁️👁️ DWIE NIEZALEŻNE PARY OCZU (twarde — nie jedna):**
- **pass-1 — generator**: cecha-po-cesze vs paszport + realny kadr; wypełnia K flag PASS/FAIL
  + werdykt wstępny.
- **pass-2 — ŚWIEŻY Sonnet**, który NIE widział promptu generacji ANI werdyktu-1: dostaje tylko
  grafikę + tabelę cech + realny kadr i pytanie „czy to TEN produkt? cecha-po-cesze". **Rozjazd
  między parami = NIEZGODNA** (konserwatywnie, nie uśredniaj).
- Werdykt **ZGODNA wymaga: 0 FAIL cech ∧ PASS ≥ K ∧ pass-2 = TAK.**

**⛔ FAIL cechy PRODUKTU = NIGDY waivable.** Cechy z paszportu (klasa produktu, elementy
tożsamości: wyświetlacz / ostrze / mechanizm / dwubarwność **/ PROPORCJE / GRUBOŚĆ / PROFIL
bryły**…) są twarde — 1 FAIL = NIEZGODNA. **Profil/proporcje = cecha TWARDA na równi z kolorem
i elementami: „produkt płaski w oryginale nie może być gruby na scenie" (incydent Drapek 18.07 —
cienka deska ścierna wyszła jako gruby drewniany klocek ~5–8 cm; gate cech łapał kolor/elementy,
ale NIE proporcje/grubość). Za gruba / za bryłowata / złe proporcje vs realny kadr = NIEZGODNA.**
**Dryf REKWIZYTU-nie-produktu** (tło, dłoń, odłożone akcesorium scenografii) wolno przepuścić
WYŁĄCZNIE z notą w LEDGER („co dryfnęło + dlaczego to nie produkt") i **zgodą OBU par** — to
jedyna furtka. Furtka „dryf PRODUKTU = cecha metody" NIE ISTNIEJE.

**⛔ ZASADA NADRZĘDNA PROMPTU (feedback Tomka 18.07 — źródło losowego dryfu produktu):**
**Prompt NIGDY nie opisuje, JAK produkt wygląda — opisuje TYLKO wizję sceny** (co się dzieje, gdzie,
światło, emocja, kompozycja, kadr). Wygląd produktu definiuje **WYŁĄCZNIE referencja** (`image[0]`
packshot) + prefix generate-image „Image 1 = EXACT product, reproduce unchanged, change ONLY the
scene". Słowny opis cech w prompcie („flat thin board", „wooden edge 2-3 cm", „add black loop, NOT
metal") **KONKURUJE z referencją i sprowadza generację na złe tory** — model interpretuje SŁOWA
zamiast odwzorować OBRAZ, stąd „raz produkt 1:1, raz inny". Cechy paszportu służą WYŁĄCZNIE do
WERYFIKACJI po generacji (gate F3A), **NIGDY jako tekst promptu**. Generacja bezpośrednia (agent woła
OpenAI z pominięciem generate-image) MUSI powtórzyć ten sam prefix + trzymać prompt czysto scenowy.
⚠️ **`input_fidelity` NIE dla gpt-image-2** (§3 / korekta 17.07 — HTTP 400 `invalid_input_fidelity_model`;
parametr istnieje tylko na gpt-image-1). Na gpt-image-2 (model fabryki) wierność płynie z referencji +
prefiksu + czystego promptu — **walidacja A/B 18.07 to potwierdziła: sam czysty prompt (bez opisu cech)
dał produkt WIERNIEJSZY** niż prompt opisowy (benefit: przywrócona linia wymiennego panelu, którą opis
słowny zgubił). Czysty prompt jest też ODPORNIEJSZY (brak kruchych fraz „flat thin board, NOT box" do utrzymania).

**🔒 EGZEKWOWANIE (globalne, nie tylko zapis doktryny):** przed KAŻDĄ generacją sceny produktowej
uruchom `scripts/mockup-tools/prompt-lint.py "<prompt>" --expect-product-ref`. Wykrywa opis cech
produktu w prompcie (wymiary, materiały-produktu, „NOT metal/box", elementy: schowek/pętla/panel,
bezpośredni opis „the board is…") ORAZ brak prefiksu referencji. **≥1 flaga = przepisz prompt na
czysto scenowy przed generacją** (nie generuj z opisem produktu). Zapisz finalny prompt per grafikę
do `LEDGER.md` (audyt — gate/człowiek może przelintować cały zestaw: `prompt-lint.py --file <prompty>`).
Reguła obowiązuje TAK SAMO agenta wołającego OpenAI bezpośrednio, jak ścieżkę przez generate-image.

**🪜 DRABINA REGENERACJI → ESKALACJA (do skutku, max 3 rundy):**
NIEZGODNA → regeneracja **NIE przez dopisanie słownego opisu cechy**, lecz przez: (1) **czystszy/inny
realny packshot jako ref**, na którym cecha (która FAILowała) jest wyraźnie widoczna — referencja niesie
cechę, nie słowa; (2) **poprawę WIZJI SCENY**, jeśli kadr przesłania cechę lub wymusza zły kąt (np.
„side loop visible in frame" jako element KOMPOZYCJI sceny, nie opis produktu); (3) tylko na gpt-image-1
(NIE -2) dołożyć `input_fidelity:high`. Po **3 rundach** bez ZGODNA → **ESKALACJA** (wybierz, zapisz w LEDGER):
(a) inny **realny packshot** jako ref; (b) **crop-first** — wytnij produkt z realnego kadru
zamiast generować; (c) **scena BEZ produktu** + realny `<img>` produktu na stronie
(najbezpieczniejszy default dla produktów złożonych); (d) **nota do Tomka** (świadoma decyzja).
ESKALACJA bez noty LEDGER = FAIL gate; `rundy > 3` bez ESKALACJA = FAIL.

**📝 FORMAT WIERSZA `dopasowanie/WIERNOSC.md`** (gate-check parsuje tę tabelę po kolumnach):

| grafika | klasa | ujęcie | pass-1 (generator) | pass-2 (świeży Sonnet) | cechy K (po cesze) | rundy | WIERNOŚĆ |
|---|---|---|---|---|---|---|---|
| scenes/hero-d.webp | S | hero | ZGODNA 6/6 | TAK — ten sam produkt | Klasa:PASS · Wierzch:PASS · Boki:PASS · Schowek:PASS · Pętla:PASS · Marka:PASS | 1 | WIERNOŚĆ: ZGODNA |
| scenes/problem.webp | S | problem | rekwizyt: obcinaczki złagodzone | TAK — produkt 6/6 wierny | Klasa:PASS · Wierzch:PASS · Boki:PASS · Schowek:PASS · Pętla:PASS · Marka:PASS (dryf REKWIZYTU) | 3 | WIERNOŚĆ: ESKALACJA — nota LEDGER, zgoda obu par |
| scenes/packshot-oferta.webp | P | packshot | REAL — realny kadr Ali | — | — | — | WIERNOŚĆ: REAL |

Kolumny: **pass-2** = lead TAK/NIE (świeży osąd); **cechy** = `Nazwa:PASS/FAIL` po cesze
(≥K wpisów — 0 FAIL i PASS≥K przy ZGODNA); **rundy** = liczba regeneracji; **WIERNOŚĆ** ∈
{ZGODNA, NIEZGODNA, ESKALACJA, REAL}. **REAL** = realny kadr (crop galerii) = PASS bez cech.
**NIEZGODNA** w pliku = pętla niedomknięta = FAIL gate. Grafiki nie-produktowe (wideo mp4,
postery tt, UGC, D-art, brand, pay-badges, OG) — NIE w tabeli (gate je wyklucza).

**Komplementarność z PASS 5 (FINALNY-PASS.md):** F3A działa **PER GRAFIKA, PRZED kodem** (czy
render = ten produkt?); PASS 5 SEMANTYKA działa na **CAŁEJ stronie PO kodzie** (czy podpisy/role/
dane spójne). Oba potrzebne — F3A nie zwalnia z PASS 5 i odwrotnie.

## 4c. GATE ANATOMII CZŁOWIEKA (część F3A — feedback Tomka 22.07, hero-L Ugniatka)

**Powód:** hero LIVE z człowiekiem miał OBIE dłonie z wykręconymi nadgarstkami i nienaturalnym
chwytem uchwytów — gate wierności patrzył na PRODUKT, nikt nie miał obowiązkowego punktu
„czy CZŁOWIEK jest anatomicznie poprawny". Nienaturalna anatomia obniża zaufanie do całej strony.

**PREWENCJA (w prompcie — nie dopuszczać, nie tylko łapać):**
- Wizja sceny z człowiekiem PREFERUJE proste układy dłoni: dłoń owinięta wokół uchwytu,
  dłoń płasko na powierzchni, ręce skrzyżowane/wzdłuż ciała. ⛔ UNIKAJ w wizji: chwyty
  oburącz za plecami/za głową, splecione palce, silne skróty perspektywiczne dłoni,
  trzymanie dwóch uchwytów jednocześnie w trudnej pozie — to generatorowi wychodzi najgorzej.
- Do promptu scen z widocznymi rękami DOPISZ (to opis CZŁOWIEKA-scenografii, nie produktu —
  zasada „prompt = wizja sceny" go dopuszcza): `natural relaxed hands, straight wrists,
  anatomically correct comfortable grip` + NEG: `twisted or bent-back wrists, contorted
  fingers, extra or fused fingers, impossible hand poses`.
- Wybieraj kadry, gdzie dłonie są DRUGOPLANOWE (małe w kadrze / częściowo zasłonięte) —
  im większa dłoń w kadrze, tym większe ryzyko.

**WERDYKT (obowiązkowy punkt obu par oczu F3A dla KAŻDEJ sceny z widocznym człowiekiem):**
- **ANATOMIA:** dłonie (5 palców, zgięcia w naturalne strony, nadgarstki bez wykręceń,
  chwyt ergonomicznie możliwy i sensowny), twarz (symetria, oczy), kończyny (proporcje,
  stawy zginają się we właściwą stronę). Werdykt per scena: `anatomia: OK` albo
  `anatomia: FAIL — <co>`.
- **1 FAIL anatomii = REGEN** (drabina jak przy cechach produktu; anatomia NIE jest
  waivable notą — wykręcona dłoń to nie „rekwizyt scenografii").
- Zapis w `dopasowanie/WIERNOSC.md` w kolumnie uwag/cech wiersza sceny: `anatomia:OK`
  (sceny bez człowieka — pomiń; gate nie wymaga wpisu dla packszotów).

## 5. FAKTY TWARDE (nie odkrywać ponownie)

- Makiety i output gpt-image-2 = max **1536×1024 / 1024×1536** — regen nie podnosi rozdz.
- `generate-image` z referencjami woła `/images/edits` (bez maski) — dryf rekwizytów to
  cecha editów bez maski. **INCYDENT 17.07: do tego dnia `reference_images` jako STRINGI
  były gubione po cichu (ref.url===undefined) — CAŁA fabryka generowała bez referencji,
  czysto z promptu.** Od 17.07: stringi → typ 'ref', produkt/logo wymagają obiektów
  `{url,type}`, brak załadowanej referencji = twardy błąd, produkt sortowany jako image[0].
- Edits+mask w gpt-image = soft-mask + pełny rerender (nie DALL·E-2-style podstawienie).
- Jedyna prawdziwie pixel-perfect ścieżka = CROP (+ paint-over na płaskim).
