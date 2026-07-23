# KARTA PRAWDY — SSAWEK (odkurzacz przemysłowy do popiołu/gruzu) · F0.6 · 2026-07-23

JEDYNE źródło faktów landingu (Z7). Claim bez kotwicy w tej karcie = CUT. Puste pole = „brak
danych", nigdy zmyślanie. Każda liczba oznaczona: **[KONKRET]** (konkret kupowanego wariantu) /
**[SPEC]** (z tabeli parametrów) / **[BEŁKOT-CUT]** (odrzucone).

## 0. Tożsamość produktu
- **Klasa:** odkurzacz przemysłowy (bezworkowy, mokro/sucho, z funkcją nadmuchu) do popiołu z
  kominka, gruzu/gipsu po remoncie, warsztatu/garażu, auta. Metalowy (stalowy) zbiornik.
- **Slug roboczy fabryki:** `ssawek`. **Mini-marka = ODŁOŻONA do F2.5** (tor Allegro→Marka:
  landing dostaje NOWĄ tożsamość; marka i sprzedawca z aukcji NIGDY nie trafiają na stronę).
- **Źródło danych:** oferta Allegro `16214946166` („Oficjalny sklep Lehmann"), productId
  `52414220-ed42-4055-ab9b-107f2969af02`, EAN `5903754423987`. **source='allegro' = ZAUFANE**
  (konkretna oferta = autentyczne dane; gate F0 rozszerzony 23.07). Snapshot pobrany 2026-07-23.
- **⛔ WHITE-LABEL:** marka „Lehmann"/„Lehmann Tools"/„Lehmann Home", model „Haddo",
  sprzedawca „Oficjalny sklep Lehmann", certyfikat imienny — **NIGDY na stronie**. Nazwy własne
  na kadrach galerii = RETUSZ (patrz GALERIA.md).
- **Kategoria (WEWNĘTRZNA, nie na stronę):** Dom i Ogród > Narzędzia > Odkurzacze przemysłowe.

## 1. Cena
- **Cena PL: 119 zł** [KONKRET] — **cena DANA** (cena klienta z aukcji Allegro). ⚠️ Tor
  Allegro→Marka: **BRAK kalkulacji marży i silnika cen** — cena nie jest wyliczana ani
  modyfikowana przez fabrykę. Koniec ceny zgodny z regułą (<150 → pełne/bez końcówki „,90"; 119 zł
  jak w ofercie).
- **Koszt zakupu: NIE DOTYCZY** (towar klienta — brak kosztu zakupu, brak przeliczenia NBP,
  brak `cost_purchase`).
- Dostawa w ofercie źródłowej: Allegro Smart (0/10,49 zł), zwrot 14 dni — **NA STRONIE** obowiązują
  warunki sklepów fabryki (COD + zwrot 14 dni, checkout Trevio), NIE warunki Allegro.

## 2. Specyfikacja 1:1 (VERBATIM z parametrów oferty) — [SPEC]
| Parametr | Wartość |
|---|---|
| Marka | Lehmann *(WEWN. — white-label, nie na stronę)* |
| Seria / Kod producenta | MOCNY BEZWORKOWY DO GIPSU GRUZU POPIOŁU |
| Maksymalna moc | **2000 W** *(patrz §2a — moc MAKS/turbo, NIE znamionowa)* |
| Napięcie zasilania | 230 V |
| Zasilanie | sieciowe |
| Zasięg pracy | 5 m |
| Waga urządzenia | 4,7 kg |
| Waga z opakowaniem | 4,9 kg |
| Pojemność zbiornika | 20 l |
| EAN (GTIN) | 5903754423987 |
| Stan | Nowy |
| Zawiera baterie | nie |
| Informacje dodatkowe | bezworkowy, do gipsu, funkcja dmuchawy, kominkowy |

### 2a. ⚠️ ROZBIEŻNOŚĆ MOCY 2000 W vs 1200 W — ROZSTRZYGNIĘCIE (pułapka claimów!)
Oferta podaje DWIE różne liczby mocy, obie z aukcji (obie mają kotwicę):
- **Moc maksymalna / „wydajnościowa" / turbo = 2000 W** [SPEC: „Maksymalna moc"; też tytuł „TURBO
  2000W" i opis „Moc wydajnościowa 2000W"]. To figura SZCZYTOWA/marketingowa (typowy dla
  odkurzaczy „P max" — chwilowy pobór/rozruch), NIE ciągły pobór silnika.
- **Moc znamionowa (rated) = 1200 W** [SPEC z opisu: „Moc znamionowa: 1200W"]. To RZECZYWISTY,
  ciągły pobór elektryczny silnika.

**REGUŁA NA STRONĘ (uczciwość = konwersja, Z5):**
1. „2000 W" wolno pokazać **WYŁĄCZNIE** jako etykietuje to sprzedawca — **„moc maksymalna 2000 W"**
   / „turbo 2000 W". ⛔ ZAKAZ formy „silnik 2000 W", „2000 W mocy ciągłej", „pobiera 2000 W".
2. W tabeli specyfikacji podać OBIE: „Moc maksymalna: 2000 W" **oraz** „Moc znamionowa: 1200 W" —
   to zdejmuje ryzyko wprowadzenia w błąd (dwie liczby jawnie rozróżnione).
3. Hero/hook może użyć „2000 W" jako liczby-sygnatury (echo aukcji), ale zawsze z dopiskiem
   „maks." przy pierwszym wystąpieniu. Nie budować obietnicy wydajności na 2000 W bez „maks.".

## 2b. Druga warstwa specyfikacji (z OPISU — [SPEC], gdy brak w tabeli parametrów)
| Parametr | Wartość |
|---|---|
| Producent | Lehmann Polska *(WEWN.)* |
| Napięcie / częstotliwość | 230 V / 50 Hz |
| Zbiornik | metalowy, stal nierdzewna (żaroodporny) |
| Funkcja nadmuchu (dmuchawa) | Tak |
| Bezworkowy | Tak |
| Odkurzanie na sucho | Tak (oraz mokro — 2w1 ssawka podłogowa) |
| Długość węża | 1,5 m |
| Długość przewodu | 3,5 m |
| Filtr | HEPA (system „DUAL-AIR-FILTER"), 4× większa powierzchnia filtracyjna |
| Wymiary (dł.×sz.×wys.) | 31,5 × 31,5 × 35,5 cm |
| Certyfikat | Prüfengel (03/25, lic. 250212002) — **[deklaracja sprzedawcy]**, patrz §3 |

### Zawartość zestawu (9 elementów) [SPEC — z opisu + packshot g14]
3× wielorazowy filtr koszowy · okrągła metalowa ssawka · szczelinowa metalowa ssawka · 3× rura
ssąca 30 cm · metalowy wąż ssący 1,5 m · zmywalny filtr HEPA · redukcja do elektronarzędzi ·
ssawka podłogowa mokro/sucho 2w1 · instrukcja PL.

## 3. Destylacja opisu sprzedawcy — FAKT / BEŁKOT
**FAKTY (z kotwicą — wolno użyć jako feature→benefit):**
- Metalowy/stalowy zbiornik, żaroodporny → „znosi gorący popiół, nie odkształca się"
  (kotwica: spec „Zbiornik metalowy, stal nierdzewna").
- Bezworkowy, system filtra koszowego + 3 filtry w zestawie → „bez kupowania worków, filtry
  pierzesz i używasz na przemian" (kotwica: spec „Bezworkowy" + zestaw 3× filtr koszowy;
  potwierdzone w opiniach — „3 filtry w zestawie, można prać na przemian").
- Funkcja nadmuchu (dmuchawa) → „zdmuchniesz liście/uprzątniesz teren wokół domu" (kotwica: spec
  „funkcja dmuchawy" + opinia „chcesz dmuchnąć liście? Pyk, zrobione").
- Mokro/sucho, ssawka 2w1 → „zbierze pył, popiół i wodę" (kotwica: zestaw + opinie „zbiera wodę").
- Kompaktowy, 4,7 kg → „lekki, poręczny, łatwo przenieść" (kotwica: spec „Waga 4,7 kg" + wiele
  opinii „mały, lekki, poręczny").
- Filtr HEPA → „zatrzymuje drobny pył, chroni silnik" (kotwica: spec „Filtr HEPA").

**BEŁKOT / OSTROŻNIE (CUT albo forma zawężona):**
- „zatrzymuje do 99,99% zanieczyszczeń" — **[deklaracja sprzedawcy, nie miara zweryfikowana]** →
  nie podawać jako twardy fakt liczbowy; dozwolone „filtr HEPA zatrzymuje drobny pył" bez „99,99%".
- „system antystatyczny" — **BEŁKOT-CUT**: opinie WPROST przeczą („rura się elektryzuje i kopie
  220V", „waż się elektryzuje"). ⛔ ZAKAZ claimu antystatycznego (nieuczciwy wobec dowodów).
- „najlepszy odkurzacz", „bez kompromisów", „wszechstronny sprzęt który zastąpi inne urządzenia" —
  **BEŁKOT-CUT** (superlatywy bez miary).
- Certyfikat **Prüfengel** — **[deklaracja sprzedawcy]**: to komercyjne, płatne oznaczenie
  („Deutsche Verbrauchertests"), NIE norma prawna (jak CE) ani niezależny test konsumencki
  rangi Stiftung Warentest. ⛔ NIE budować z niego claimu „certyfikowana jakość/bezpieczeństwo".
  Można pominąć całkowicie. CE (na tabliczce g09) = zgodność formalna, nie argument marketingowy.

## 4. Warianty
**1 wariant** (jeden model, jedna konfiguracja: stal + czerwona pokrywa + czarna podstawa na
kółkach). Bez wyboru wariantu/koloru na stronie. Jedna cena PL 119 zł.

## 5. Dowód społeczny
- **Ocena: ★ 4,72 / 5** [KONKRET] · **2458 ocen** · **650 recenzji tekstowych** (dostęp do 15
  pełnych treści — reszta za paginacją). Rozkład gwiazdek [SPEC]: 5★=2091 · 4★=204 · 3★=72 ·
  2★=23 · 1★=68.
- **Opinie natywne PL** (bez tłumaczenia — realny rynek PL). 15 treści zapisane niżej (§5a).
  Zawierają REALNE minusy (uczciwość Z5) — do sekcji porównania/FAQ, nie ukrywać.
- **sold_volume = 547** [SPEC, WEWNĘTRZNY]: w torze Allegro to REALNA sprzedaż TEGO sprzedawcy,
  ale **NIE naszego sklepu** → „X sprzedanych u nas" = FAŁSZ = ZAKAZ. 547 < 1000, więc nie
  stosujemy nawet nieprzypisanej frazy „tysiące zamówień". **POMIJAMY na stronie**; rola = tylko
  wewnętrzny sygnał doboru.
- **shop/sprzedawca** („Oficjalny sklep Lehmann", SMA_Lehmann, dane oceny sprzedawcy) — **🚫 NIGDY
  na stronie** (white-label; grep-gate F6).

### 5a. Recenzje PL (15 treści — VERBATIM, imiona zanonimizowane przez Allegro)
1. ★5 (2026-05-08): „...któryś z kolei odkurzacz w garażu, mega mocny, ma dodatkowe filtry... o
   wiele lepszy niż wcześniejsze (np. z Lidla)... radzi sobie super. Polecam." Zalety: cena, moc,
   wydajność. Wady: „troszkę liche wykonanie, trzeba się delikatnie obchodzić".
2. ★5 (2025-11-11): „Za tą cenę super! Mocny (niestety głośny), radzi sobie z popiołem z kominka;
   większe kawałki popiołu/niewypalonego drewna zapychają rurę, ale wystarczy wyłączyć i wytrzepać.
   Bardzo głośny, nie da się długo używać. Polecam."
3. ★4 (2024-09-25): „...taka ruletka [jakość]. Testowane domowo — dywan 2 cm włosia. Chcesz dmuchnąć
   liście? Pyk. Kupiłam do majsterkowania — podłączenie do wyrzynarki, wióry, kurz... dla mnie kosmos."
4. ★5 (2023-10-12): „idealny do garażu, auta i prac sprzątających, duża moc ssąca, mała waga...
   trzeba uważać, bo malutka rączka u góry pokrywy jest delikatna. Silnik nie jest zbyt głośny."
5. ★5 (2026-04-13): „Bardzo dobrze wciąga popiół. Głośny, ale szybko ogarnia kominek. Filtr się
   zapycha — trzeba stuknąć o podłogę; szybko grzeje się silnik. Za te pieniądze naprawdę warto."
6. ★5 (2025-10-08): „Do prac garażowych i aut. Spełnia funkcję. Moc ok, cena ok. Kabel mógłby być
   dłuższy, ale to szukanie minusów na siłę. Zadowolony."
7. ★5 (2025-01-11): „Bardzo lekki. 5 gwiazdek z uwzględnieniem ceny. Powietrze wyrzuca do góry —
   nie podrzuca sierści z powrotem jak poprzedni. Przemysłowy odkurzacz do użytku w domu."
8. ★5 (2025-08-28): „Moc, wykonanie i efekt bardzo dobry — kupiłem do czyszczenia pieca na pellet,
   świetny. Wąż elastyczny bez zastrzeżeń, ale rury to porażka; użyłem rur ze starego odkurzacza."
9. ★3 (2026-02-06): „Do czyszczenia kominka sprawdził się doskonale, hałas w normie. Dodatkowe
   szczotki/ssawki NIE pasują do tego modelu — wstyd. Samochodu się nie odkurzy."
10. ★5 (2025-08-18): „Duża moc mimo małych gabarytów, do sprzątania auta, działki; zasysa ziemię,
    drobne kamienie, zbiera wodę. Rurki do szczotki cienkie, ale dają radę."
11. ★5 (2026-03-07): „Spoko, ciągnie dobrze, fajnie że 3 filtry w zestawie — można prać na przemian.
    Ale ta rura to tragedia, elektryzuje się i kopie 220 V."
12. ★5 (2025-10-09): „Dobrze wciąga popiół i małe kamyki, prosty w obsłudze. Wada: metalowe wyczystki
    do pieca za krótkie, ostre na końcach — rysują czyszczoną powierzchnię."
13. ★5 (2025-08-17): „Dobra siła ssania, mały poręczny, dobrze wykonany, do czyszczenia pieca w
    zupełności wystarczy. Filtr wstępny + 2 filtry zapasowe. Polecam."
14. ★5 (2025-07-28): „Za te pieniądze (139 zł) to wariat [w sensie: super]. Aluminiowe końcówki
    dość ostre, krótki wąż, poza tym wszystko działa; radzi sobie z pyłem, kurzem, kominkiem."
15. ★3 (2025-11-27): „Cena niska, wykonanie ok, ale NIE nadaje się do drobnego pyłu (po szlifowaniu
    ścian, popielnik pieca na pellet) — filtr zapycha się, częste czyszczenie co kilka minut."

**Wzorce z opinii (do copy — plusy):** mocne ssanie za niską cenę · 3 filtry prać na przemian ·
lekki/poręczny · świetny do popiołu z kominka i pieca · wyrzut powietrza do góry (nie podrywa
kurzu) · funkcja dmuchawy działa · zbiera wodę.
**Wzorce z opinii (REALNE minusy — do porównania/FAQ uczciwie):** głośny · rura/wąż się elektryzuje
(„kopie 220 V") → ⛔ obala claim antystatyczny · rury cienkie/krótkie · filtr zapycha się przy
bardzo drobnym pyle (szlif gładzi, popielnik pellet) — trzeba stukać/czyścić często · silnik szybko
się grzeka · rączka pokrywy delikatna · dodatkowe akcesoria mogą nie pasować.

## 6. Materiał wizualny → `gallery_curated`
Kuracja 16 kadrów: **11 keep** (lifestyle + detale + packshot akcesoriów) / **5 odsiew** (2
infografiki, banner marki, badge certyfikatu, kolaż z obcym brandem KANWOD). Retusz logo Lehmann
wymagany na g07/g09/g11 (+ advisory g05). Pełne werdykty i powody: `GALERIA.md` oraz
`bud_tt_products.gallery_curated`.

## 7. Wygląd i wideo
- **PASZPORT wizualny:** `PASZPORT.md` (cechy dyskryminujące + „czego NIE MA").
- **Wideo:** oferta Allegro **NIE zawiera wideo** → `videos_curated` = nota „brak materiału".
  Sekcja wideo TikTok/UGC = klasa dowodowa (F1a): decyzja o jej losie należy do Tomka
  (blokada-tomek), nie do fabryki — materiał do pozyskania na dalszym etapie.
