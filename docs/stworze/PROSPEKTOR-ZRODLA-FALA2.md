# PROSPEKTOR — MAPA ŹRÓDEŁ KONTAKTÓW, FALA 2 (research 2026-07-23)

> Mapa źródeł per wertykal dla 9 wertykali Fali 2. Ten sam reżim prawny i format importu co Fala 1
> (patrz `PROSPEKTOR-BAZA.md`). Cel per wertykal: **JEDEN partner-operator**, potrzeba
> **150–300 dobrych rekordów** (`nazwa;www;email;miasto`) — **jakość > wolumen**.
> Rdzeń pozyskiwania niezmiennie: **CEIDG (filtr PKD) → enrichment e-maila ze strony WWW**;
> poniżej mapujemy SKRÓTY (gotowe listy z e-mailami/www z półki) tam, gdzie istnieją.
> Wszystkie twierdzenia zweryfikowane przez 3 równoległe researche źródłowe (grupy A/B/C, 23.07.2026),
> z wejściem na strony i sprawdzeniem regulaminów/robots.txt.

## ŹRÓDŁA ZAKAZANE (obowiązuje jak w Fali 1 — NIE proponować)

Panorama Firm, pkt.pl, Oferteo, Google Maps/Places, katalog.janachowska.pl — regulaminowe zakazy
masowego zbioru/agregacji (patrz `PROSPEKTOR-BAZA.md` §„Źródła zakazane"). Dozwolony wyłącznie ręczny
pojedynczy lookup. W Fali 2 dochodzą **katalogi weselne** (patrz DJ-weselni) — w większości zabramkowane
formularzem lub z zakazem agregacji → traktować jak ⛔ do czasu indywidualnej weryfikacji regulaminu.

## Legenda statusów

- ✅ nadaje się — otwarty kontakt (e-mail/www wprost), brak regulaminowego zakazu agregacji
- ⚠️ częściowo — brak e-maili wprost / tylko namierzanie / robots ogranicza warstwę / geo-skew / regulamin niejasny
- ⛔ zakazane — regulamin zabrania agregacji lub brak jakiegokolwiek kontaktu do pozyskania

---

## 1. pracownie-protetyczne (protetyka dentystyczna)

Laboratoria/pracownie techniki dentystycznej (protezy, korony, mosty na zlecenie gabinetów).

| Źródło | URL | Status | Wolumen | E-mail/www wprost? | Format | Metoda | Nota prawna / robots |
|---|---|---|---|---|---|---|---|
| **CEIDG PKD 32.50.A** | dane.biznes.gov.pl (Hurtownia) | ⚠️ | duży, ale zaszumiony | e-mail gdy nie zastrzeżony | API/JWT | filtr PKD → enrichment | kod **współdzielony** (wyroby medyczne/„chirurgiczny") → wysoki szum, mocny filtr enrichment po WWW |
| Stowarzyszenia/izby techników dentystycznych | (branżowe) | ⚠️ | niski | rzadko listy z e-mailem | HTML/profil | ręczny lookup | brak otwartej ogólnopolskiej listy pracowni z kontaktami |
| Katalogi wystawców targów (CEDE i in.) | katalogi wystawców | ⚠️ | średni | www częściej niż e-mail | HTML/PDF | ręczny + enrichment | sprawdzić regulamin katalogu przed jakąkolwiek automatyzacją |

- **Rekomendacja #1:** CEIDG **PKD 32.50.A** (2025) / **32.50.Z** (2007) + enrichment WWW. Uwaga: to kod
  współdzielony z produkcją wyrobów medycznych/chirurgicznych — konieczny mocny filtr (nazwa zawiera
  „protetyka/pracownia protetyczna/technika dentystyczna" + weryfikacja strony).
- **Rekomendacja #2:** listy wystawców targów dentystycznych (ręczny zasiew nasion do enrichmentu).
- **E-maile z półki?** **NIE.** Brak otwartej listy pracowni — wertykal **rejestrowy** (CEIDG + enrichment).

---

## 2. serwis-fotowoltaiki (serwis posprzedażowy PV)

Firmy serwisujące/konserwujące instalacje PV (nie tylko montaż).

| Źródło | URL | Status | Wolumen | E-mail/www wprost? | Format | Metoda | Nota prawna / robots |
|---|---|---|---|---|---|---|---|
| **SBF Polska PV — lista członków** | polskapv.pl | ✅/⚠️ | średni (członkowie) | www wprost, e-mail częściowo | HTML lista/profile | ręczny + enrichment | stowarzyszenie branżowe; dane publikowane do kontaktu — art. 14 w 1. mailu |
| **CEIDG PKD 43.21.Z + 33.14.Z** | dane.biznes.gov.pl | ✅ | duży | e-mail gdy nie zastrzeżony | API/JWT | filtr PKD → enrichment | 43.21.Z instalacje elektryczne; **33.14.Z naprawa/konserwacja** = trafny dla serwisu posprzedażowego |
| Sieci certyfikowanych instalatorów marek (SMA/Fronius/Huawei/SolarEdge) | portale „znajdź instalatora" | ⚠️/⛔ | zmienny | rzadko pełne e-maile | mapa/pinezki | ręczny lookup | producenci rzadko publikują pełną listę z e-mailami; część portali = ToS zakaz zbioru |

- **Rekomendacja #1:** SBF Polska PV (polskapv.pl) jako zasiew jakościowy + **CEIDG 43.21.Z/33.14.Z** jako trzon.
- **Rekomendacja #2:** enrichment z „znajdź instalatora" marek — tylko ręcznie, bez masówki (ToS).
- **E-maile z półki?** **CZĘŚCIOWO** (lista członków SBF), reszta CEIDG + enrichment.

---

## 3. monitoring-legionella (badania/monitoring Legionella w instalacjach wodnych)

Laboratoria akredytowane + firmy higieny wody/dezynfekcji instalacji.

| Źródło | URL | Status | Wolumen | E-mail/www wprost? | Format | Metoda | Nota prawna / robots |
|---|---|---|---|---|---|---|---|
| **PCA — wykaz akredytowanych laboratoriów badawczych** | pca.gov.pl | ⚠️ (autorytatywny) | średni (labor. z zakresem Legionella) | www/kontakt tak; e-mail w PDF-ach zakresów | wyszukiwarka + PDF zakresów | **ręczny/PDF harvest** | **robots blokuje warstwę /ajax** (dynamiczny filtr) → nie skryptować zapytań; pobierać statyczne PDF zakresów akredytacji |
| **CEIDG PKD 71.20.B** | dane.biznes.gov.pl | ✅ | duży | e-mail gdy nie zastrzeżony | API/JWT | filtr PKD → enrichment | 71.20.B „pozostałe badania i analizy techniczne" — dla firm usługowych/higieny wody |
| Stowarzyszenia higieny/wody | branżowe | ⚠️ | niski | zmiennie | HTML | ręczny | zasiew uzupełniający |

- **Rekomendacja #1:** PCA (segment laboratoriów, autorytatywny) — harvest **ręczny/z PDF-ów zakresów**,
  bo robots blokuje dynamiczny endpoint /ajax; NIE automatyzować warstwy wyszukiwarki.
- **Rekomendacja #2:** CEIDG **71.20.B** + enrichment dla firm usługowych (dezynfekcja/monitoring instalacji).
- **E-maile z półki?** **CZĘŚCIOWO** (PCA daje autorytatywny zbiór labor., ale nie „jednym klikiem"; reszta CEIDG).

---

## 4. posrednicy-nieruchomosci-aml (biura pośrednictwa; kąt AML)

Zawód zderegulowany 2014 → **brak centralnego rejestru pośredników i licencji**. GIIF nie publikuje listy
instytucji obowiązanych. Skrót = wykazy federacji/stowarzyszeń.

| Źródło | URL | Status | Wolumen | E-mail/www wprost? | Format | Metoda | Nota prawna / robots |
|---|---|---|---|---|---|---|---|
| **WSPON — wykaz członków** | wspon.org.pl | ✅ | **~375 e-maili wprost** | **e-mail + www wprost** | HTML lista | ręczny/lekki harvest wg robots | dane publikowane do kontaktu; **geo-skew: Warszawa/Mazowsze** |
| **Regionalne stowarzyszenia PFRN — wykazy** | pfrn.pl → stowarzyszenia regionalne | ✅/⚠️ | średni per region | zmiennie (część z e-mailem) | HTML wykazy | ręczny per region | uzupełnia pokrycie krajowe poza Warszawą |
| **CEIDG PKD 68.31.Z** | dane.biznes.gov.pl | ✅ | duży | e-mail gdy nie zastrzeżony | API/JWT | filtr PKD → enrichment | trzon krajowy; łączyć z wykazami dla jakości |

- **Rekomendacja #1:** **WSPON** (~375 e-maili wprost) jako rdzeń jakościowy + **regionalne wykazy PFRN**
  na pokrycie poza Mazowszem.
- **Rekomendacja #2:** CEIDG **68.31.Z** + enrichment na uzupełnienie krajowe.
- **E-maile z półki?** **TAK** (WSPON + wykazy PFRN dają e-maile wprost; wymaga zszycia regionów).

---

## 5. operatorzy-vendingu (firmy operatorskie automatów vendingowych)

Rynek skoncentrowany, mały uniwersum profesjonalnych operatorów.

| Źródło | URL | Status | Wolumen | E-mail/www wprost? | Format | Metoda | Nota prawna / robots |
|---|---|---|---|---|---|---|---|
| **PSV — lista członków** | (Polskie Stow. Vendingu) /czlonkowie/ | ✅ | **~55 operatorów** | **e-mail + www wprost** | HTML lista | ręczny/lekki harvest wg robots | dane publikowane do kontaktu; ~55 pokrywa gros profesjonalnego segmentu |
| **CEIDG PKD 47.99.Z** | dane.biznes.gov.pl | ✅/⚠️ | duży, zaszumiony | e-mail gdy nie zastrzeżony | API/JWT | filtr PKD → enrichment | 47.99.Z = pozasklepowa sprzedaż detaliczna (szeroki) → mocny filtr po nazwie „vending/automaty" |

- **Rekomendacja #1:** **PSV /czlonkowie/** (~55, e-mail+www wprost) — cały profesjonalny rdzeń „z półki".
- **Rekomendacja #2:** CEIDG **47.99.Z** + enrichment na „długi ogon" mniejszych operatorów (mocny filtr nazwy).
- **E-maile z półki?** **TAK** (PSV pokrywa segment profesjonalny; wolumen mały, ale to natura rynku).

---

## 6. zespoly-dj-weselni (DJ-e / zespoły na wesela)

Głównie osoby fizyczne / mikrofirmy. **Brak rejestru, brak otwartych list.** Katalogi weselne
zabramkowane formularzem lub z zakazem agregacji.

| Źródło | URL | Status | Wolumen | E-mail/www wprost? | Format | Metoda | Nota prawna / robots |
|---|---|---|---|---|---|---|---|
| **CEIDG PKD 90.01.Z** | dane.biznes.gov.pl | ⚠️ | duży, rozproszony | e-mail gdy nie zastrzeżony | API/JWT | filtr PKD → enrichment | 90.01.Z „wystawianie przedstawień artystycznych"; **osoby fizyczne → RODO ostrożniej** (adresy firmowe/ogólne) |
| Katalogi weselne (typu zabramkowane) | (różne) | ⛔ | — | za formularzem / zakaz agregacji | profile | — | traktować jak lista zakazanych do czasu indywidualnej weryfikacji regulaminu |
| Stowarzyszenia DJ | (branżowe) | ⚠️ | niski | rzadko listy z e-mailem | HTML | ręczny | brak otwartego ogólnopolskiego wykazu z kontaktami |

- **Rekomendacja #1:** CEIDG **90.01.Z** + enrichment, z twardym filtrem na adresy firmowe/ogólne (RODO — osoby fiz.).
- **Rekomendacja #2:** brak realnej alternatywy z półki — katalogi weselne ⛔/zabramkowane.
- **E-maile z półki?** **NIE — PEŁNA LUKA.** Jedyna droga: CEIDG + enrichment; planować niższy wolumen i
  wzmożoną ostrożność RODO (dane osób fizycznych).

---

## 7. oslony-okienne-markizy (rolety, markizy, żaluzje fasadowe, pergole — na wymiar)

| Źródło | URL | Status | Wolumen | E-mail/www wprost? | Format | Metoda | Nota prawna / robots |
|---|---|---|---|---|---|---|---|
| **Lokatory dealerów producentów** (Selt, Anwis, Portos, Aluprof) | „znajdź salon/dystrybutora" na stronach producentów | ✅/⚠️ | średni/duży (dealerzy) | **www często wprost**, e-mail czasem | mapa/pinezki + lista | ręczny + enrichment | dealerzy publikowani do kontaktu; sprawdzić robots strony producenta przed skryptem |
| **CEIDG PKD 43.32.Z + 22.23.Z** | dane.biznes.gov.pl | ✅ | duży | e-mail gdy nie zastrzeżony | API/JWT | filtr PKD → enrichment | 43.32.Z zakładanie stolarki bud. (montaż); 22.23.Z produkcja wyrobów z tworzyw dla budownictwa |

- **Rekomendacja #1:** lokatory dealerów producentów (www wprost → szybki enrichment e-maila ze strony dealera).
- **Rekomendacja #2:** CEIDG **43.32.Z/22.23.Z** + enrichment na trzon krajowy.
- **E-maile z półki?** **CZĘŚCIOWO** (lokatory dają www; e-mail zwykle przez enrichment).

---

## 8. zimowe-utrzymanie (odśnieżanie/utrzymanie terenów; latem często zieleń)

| Źródło | URL | Status | Wolumen | E-mail/www wprost? | Format | Metoda | Nota prawna / robots |
|---|---|---|---|---|---|---|---|
| **CEIDG PKD 81.29.Z (+ 81.30.Z)** | dane.biznes.gov.pl | ✅ | duży | e-mail gdy nie zastrzeżony | API/JWT | filtr PKD → enrichment | 81.29.Z pozostałe sprzątanie (odśnieżanie); 81.30.Z tereny zieleni (sezon letni tych samych firm) |
| **OSTO — stowarzyszenie branżowe** (zid. przez grupę C) | (branżowe) | ⚠️ | niski | zmiennie | HTML | ręczny | zasiew niszowy; sprawdzić otwartość wykazu i robots przed automatyzacją |
| Przetargi publiczne (BIP gmin/GDDKiA) | portale przetargowe / BIP | ⚠️ | średni | nazwa+NIP zwycięzcy; **e-mail rzadko** | HTML/PDF ogłoszeń | ręczny + enrichment | informacja publiczna (ustawa o otwartych danych); pracochłonne, kontakt do dorobienia |

- **Rekomendacja #1:** CEIDG **81.29.Z (+81.30.Z)** + enrichment — trzon roboczy.
- **Rekomendacja #2:** OSTO (niszowy wykaz) + zwycięzcy przetargów (nazwa+NIP → enrichment e-maila).
- **E-maile z półki?** **NIE (prawie).** Wertykal głównie **rejestrowy** (CEIDG + enrichment); OSTO i przetargi
  to tylko uzupełnienie.

---

## 9. bhp-outsourcing (zewnętrzna obsługa BHP, szkolenia, nadzór)

| Źródło | URL | Status | Wolumen | E-mail/www wprost? | Format | Metoda | Nota prawna / robots |
|---|---|---|---|---|---|---|---|
| **BUR — Baza Usług Rozwojowych (PARP)** | uslugirozwojowe.parp.gov.pl | ✅ | duży | dane podmiotów (NIP, kontakt) | **API read-only** + portal | eksport/API → filtr usług BHP | publiczny rejestr, podmioty rejestrują usługi same → kontakt obecny; **stary RIS (WUP) wygaszony 1.01.2026** |
| **OSPSBHP — oddziały/członkowie** | ospsbhp.pl | ⚠️/✅ | średni | zmiennie (część oddziałów z listami) | HTML per oddział | ręczny + enrichment | stowarzyszenie służby BHP; pokrycie zależne od oddziału |
| **CEIDG PKD 74.90.Z / 85.59.B** | dane.biznes.gov.pl | ✅ | duży | e-mail gdy nie zastrzeżony | API/JWT | filtr PKD → enrichment | 74.90.Z działalność profesjonalna; 85.59.B szkolenia — uzupełnienie |

- **Rekomendacja #1:** **BUR (PARP)** — **API read-only**, publiczny, z danymi kontaktowymi podmiotów;
  filtr po usługach BHP. Najczystszy skrót całej Fali 2. (Uwaga: stary RIS wygaszony 1.01.2026 — nie używać.)
- **Rekomendacja #2:** OSPSBHP (oddziały) + CEIDG **74.90.Z/85.59.B** na uzupełnienie.
- **E-maile z półki?** **TAK** (BUR = read-only API z kontaktami; najlepsze źródło Fali 2).

---

## RANKING WERTYKALI FALI 2 — wg łatwości pozyskania bazy

Od „gotowe e-maile z półki" → do „tylko CEIDG + enrichment":

| # | Wertykal | Główny skrót | Ocena |
|---|---|---|---|
| 1 | **bhp-outsourcing** | BUR/PARP — **API read-only** z kontaktami | 🟢 e-maile z półki (najlepszy) |
| 2 | **operatorzy-vendingu** | PSV /czlonkowie/ (~55, e-mail+www wprost) | 🟢 e-maile z półki (mały, ale kompletny segment) |
| 3 | **posrednicy-nieruchomosci-aml** | WSPON (~375 e-maili) + wykazy PFRN | 🟢 e-maile z półki (trzeba zszyć regiony; geo-skew WSPON) |
| 4 | **serwis-fotowoltaiki** | SBF Polska PV (polskapv.pl) + CEIDG 43.21.Z/33.14.Z | 🟡 częściowo z półki |
| 5 | **oslony-okienne-markizy** | lokatory dealerów producentów (www wprost) + CEIDG 43.32.Z/22.23.Z | 🟡 częściowo (www z półki, e-mail przez enrichment) |
| 6 | **monitoring-legionella** | PCA (autorytatywny, ale robots blokuje /ajax → PDF/ręcznie) + CEIDG 71.20.B | 🟡 częściowo (nie „jednym klikiem") |
| 7 | **pracownie-protetyczne** | CEIDG 32.50.A (kod współdzielony → szum) + enrichment | 🟠 luka — głównie CEIDG |
| 8 | **zimowe-utrzymanie** | CEIDG 81.29.Z/81.30.Z + enrichment; OSTO/przetargi niszowo | 🟠 luka — głównie CEIDG |
| 9 | **zespoly-dj-weselni** | CEIDG 90.01.Z + enrichment (katalogi ⛔/zabramkowane) | 🔴 PEŁNA LUKA + ryzyko RODO (osoby fiz.) |

**Wertykale z luką źródłową (czekają na CEIDG + enrichment):** protetyka (7), zimowe-utrzymanie (8) —
głównie rejestrowe; **zespoly-dj-weselni (9) — pełna luka**, brak jakiegokolwiek skrótu z półki, dodatkowo
podwyższone ryzyko RODO (dane osób fizycznych → wyłącznie adresy firmowe/ogólne).
Legionella (6) częściowo ograniczona (robots blokuje dynamiczny filtr PCA → harvest ręczny/z PDF-ów).

## BRAMKA COMPLIANCE (identyczna jak Fala 1 — obowiązuje każdy import)

1. Tylko adresy firmowe/ogólne (biuro@, kontakt@) lub opublikowane do kontaktu biznesowego.
   Dla DJ-weselnych (osoby fizyczne) — reżim zaostrzony: bezwzględnie tylko adresy firmowe/ogólne.
2. Stopka **art. 14 RODO** + źródło danych + opt-out w pierwszym mailu (wfp-engine).
3. Suppression nieodwracalny; unikalne indeksy nip/email/www chronią re-import.
4. Pole `source` per rekord (np. 'bur', 'psv', 'wspon', 'pfrn', 'pca', 'polskapv', 'ceidg', 'dealer-selt').
5. Test równowagi (LIA) dla uzasadnionego interesu — jednorazowy dokument przy pierwszej wysyłce z rejestrów.
6. **robots.txt** respektowany przy KAŻDYM skrypcie harvestującym (potwierdzone: PCA blokuje /ajax →
   tam tylko ręcznie/PDF; WSPON, PSV, lokatory dealerów — sprawdzić ścieżkę listy przed skryptem).
7. **PKD 2007 → 2025**: do 31.12.2026 filtrować po OBU kodach (klucz powiązań: klasyfikacje.stat.gov.pl).

## STATUS

- [x] Research Fali 2 (3 grupy równoległe, 23.07.2026) — źródła zweryfikowane URL-ami/regulaminami.
- [ ] Harvest skrótów z półki (BUR, PSV, WSPON+PFRN, polskapv, lokatory dealerów) — do zrobienia po decyzji.
- [ ] Wniosek CEIDG Hurtownia Danych — **czeka na Tomka** (wspólny z Falą 1; obsłuży wertykale rejestrowe 7–9).
- [ ] Enrichment crawler (www → e-mail) — wspólny z Falą 1; kluczowy dla protetyki, zimowego, DJ, markiz.
