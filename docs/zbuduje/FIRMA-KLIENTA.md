# FIRMA KLIENTA — research + rekomendacja modułu „Twoja firma"

> Raport z badania 2026-07-21 (deep-research: 27 źródeł, 24/25 twierdzeń zweryfikowanych 3-0
> + 4 celowane rundy: white-label/API, banki, nierejestrowana w e-commerce, wakacje ZUS + UX).
> Cel: klienci /sklep bez firmy mają ją realnie założyć — z maksymalną pomocą, poczuciem
> bezpieczeństwa i kontroli, bez paraliżu.

## 0. TL;DR — rekomendacja

1. **White-label rejestracji JDG NIE istnieje** na polskim rynku (zweryfikowane). I nie jest
   potrzebny: „marką" jest portal klienta TN — moduł-konsjerż **„Twoja firma"** prowadzi
   przez wszystko, a sam podpis (15–40 min, bezpłatny) klient składa osobiście — **prawnie
   nie da się tego zautomatyzować** (pełnomocnik nie może zarejestrować JDG online).
2. **Ścieżka domyślna: „Załóż firmę z inFakt"** — darmowa asysta z żywym księgowym (1–3 dni)
   albo samodzielnie w apce (15 min, integracja z CEIDG). Księgowość dalej też inFakt
   (e-commerce od ~189 zł netto/mies.) → jedna ręka prowadzi klienta, a decyzje podatkowe
   (ryczałt 3% vs 8,5%, VAT od startu) podejmuje **ich** księgowy, nie my (granica doradztwa
   podatkowego). Afiliacja: 160 zł/sprzedaż All Inclusive (System Partnerski Bankier).
3. **Ścieżka alternatywna: bank** — mBank (~10 min, bez bycia klientem, premia ~700 zł,
   konto 0 zł) lub ING (CEIDG+ZUS+US w jednym wniosku, darmowe fakturowanie bez limitu,
   afiliacja dla TN: 300 zł/konto + 100 zł/założenie firmy przez program ING dla Firm).
   Bonus banku = najsilniejszy argument „firma na start się OPŁACA".
4. **Działalność nierejestrowana ≠ default.** Nadaje się tylko jako krótki mostek i tylko dla
   części produktów — pułapka VAT (art. 113 ust. 13 pkt 1 lit. f: elektronika/kosmetyki/AGD
   sprzedawane online = obowiązkowy VAT od PIERWSZEJ sprzedaży), brak EORI (import),
   hurtownie żądają NIP. Komunikacyjnie zostaje jako „możesz zacząć od dziś" — ale proces
   prowadzi do JDG przed startem kampanii.
5. **Timing:** przygotowanie firmy = od dnia rezerwacji (0 zł, edukacja + profil zaufany);
   rejestracja = tuż przed startem sklepu/kampanii (dane sprzedawcy są potrzebne do stron
   prawnych — krok pl_dane; a licznik ulg ZUS zaczyna tykać dopiero od rejestracji).

---

## 1. Fakty prawne 2026 (zweryfikowane)

### Rejestracja JDG
- Bezpłatna, w pełni online (biznes.gov.pl / mObywatel / banki), 15–40 min; wpis tego samego
  lub następnego dnia roboczego. Jeden wniosek CEIDG-1 = automatycznie GUS (REGON), US (NIP),
  ZUS (płatnik); VAT-R i ZUA/ZZA można dołączyć w tym samym formularzu („jedno okienko").
  Źródła: biznes.gov.pl/pl/portal/ou736, bip.stat.gov.pl.
- Podpis: Profil Zaufany / e-dowód / podpis kwalifikowany — **osobisty**. Zapowiadane od
  1.11.2026: rejestracja JDG wyłącznie online przez mObywatel (gov.pl — do obserwacji).
- **Pełnomocnik NIE może zarejestrować JDG przez internet** (biznes.gov.pl/pl/portal/00174
  verbatim); tylko osobiście w urzędzie (pełnomocnictwo pisemne, 17 zł). Po rejestracji
  pełnomocnik wpisany w rubryce 28 CEIDG-1 może zmieniać/zawieszać/wykreślać wpis.

### Drabina kosztów ZUS (oś czasu dla klienta)
| Okres | Co płaci | Ile (2026) |
|---|---|---|
| Mies. 1–6: **ulga na start** | tylko zdrowotna | ~432,54 zł/mies. (min., skala) |
| Mies. 7–30: **preferencyjny ZUS** | społeczne od 30% min. wynagrodzenia + zdrowotna | 420,86 zł (bez chorobowego) / 456,18 zł (z) + zdrowotna |
| Potem: **Mały ZUS Plus** (przychód roczny ≤120 000 zł; nie w 1. roku; od 2026 max 36 mies. w oknie 60 mies.) | proporcjonalnie do dochodu | zmienna |
| Pełny ZUS | społeczne | 1 926,76 zł/mies. (z chorobowym; 1 788,29 bez) + zdrowotna |
- **Wakacje składkowe:** 1 dowolny miesiąc/rok zwolnienia ze składek społecznych (budżet
  państwa je finansuje; zdrowotna zostaje). Wniosek RWS przez eZUS w miesiącu poprzedzającym.
  Łączy się z preferencyjnym i MZ+; **NIE łączy się z ulgą na start**. Pomoc de minimis.

### Podatki dropshipping (ryczałt)
- **3%** — sprzedaż we własnym imieniu (handel; przychód = pełna cena) — nasz model Trevio.
- **8,5% / 15%** — pośrednictwo detal/hurt (przychód = prowizja).
- Stawka wynika z FAKTYCZNEGO modelu (PKWiU), nie z wyboru; interpretacje KIS 2025–26
  (m.in. 0112-KDSL1-2.4011.329.2025). Ryzyko przekwalifikowania 3%→8,5% = realne pole sporu
  → decyzja stawki ZAWSZE u księgowego klienta.
- VAT: zwolnienie podmiotowe podniesione do **240 000 zł (2026)**, ALE patrz pułapka niżej.

### ⚠️ Pułapka VAT dla sklepu internetowego (art. 113 ust. 13 pkt 1 lit. f/g)
Sprzedaż PRZEZ INTERNET tych towarów **odbiera zwolnienie z VAT od pierwszej sztuki**
(obowiązkowy VAT-R, także na działalności nierejestrowanej):
- preparaty kosmetyczne i toaletowe (PKWiU 20.42.1),
- komputery, wyroby elektroniczne i optyczne (PKWiU 26),
- **urządzenia elektryczne (PKWiU 27)** — np. masażery, lokówki, endoskopy, elektronika
  z /trendy!,
- maszyny/urządzenia niesklasyfikowane (PKWiU 28), części samochodowe/motocyklowe (lit. g).
Wniosek dla fabryki: większość portfeli zawiera produkty z PKWiU 26/27 → **klient zwykle
będzie VAT-owcem od startu** (spójne z cennikiem — marże liczymy NETTO). VAT-R zaznacza się
w tym samym wniosku CEIDG-1. Decyzję potwierdza księgowy.

### Działalność nierejestrowana 2026 — ocena
- Limit **kwartalny** 225% min. wynagrodzenia = **10 813,50 zł/kwartał** (~3 600 zł/mies.,
  ~43 250 zł/rok); po przekroczeniu = automatycznie DG, 7 dni na wpis do CEIDG
  (art. 5 Prawa przedsiębiorców; biznes.gov.pl/pl/portal/00115).
- Działa: sprzedaż wysyłkowa bez kasy fiskalnej (poz. 36 załącznika — zapłata w całości na
  rachunek; **COD nie psuje zwolnienia**, gdy kurier przekazuje pobranie na konto z
  identyfikacją paczek), PIT raz w roku (PIT-36, „inne źródła", koszty odliczalne),
  uproszczona ewidencja sprzedaży (od 2026 wzór ESDN), bez ZUS, posługuje się PESEL.
- NIE działa: pułapka VAT jw. (elektronika/kosmetyki = VAT od 1. sprzedaży, czyli NIP i tak
  potrzebny), **import bez EORI niemożliwy** (odprawa wymaga firmy), hurtownie B2B żądają NIP,
  § 4 rozporządzenia o kasach (elektronika/perfumy = kasa od 1. sprzedaży), pełne obowiązki
  konsumenckie/RODO i tak obowiązują, ryzyko przekwalifikowania „zorganizowanego sklepu
  z reklamą" na DG mimo limitu (interpretacja). Reforma celna UE 1.07.2026 znosi de minimis
  150 EUR. Praktycy dla dropshippingu ODRADZAJĄ (Shoper, tax4ecommerce i in.).
- **Rola w naszym procesie:** psychologiczny mostek („sprzedaż od dziś jest legalna — limit
  ~10,8 tys. zł/kwartał"), realnie krótki: pierwszy skuteczny tydzień kampanii zjada limit.

---

## 2. Rynek usług „załóż firmę" + partnerzy (zweryfikowane 21.07.2026)

| Podmiot | White-label | API | Asysta JDG | Program partnerski |
|---|---|---|---|---|
| **inFakt** | NIE | TAK (rozbudowane: faktury, koszty, ZUS, KSeF, webhooki — docs.infakt.pl) | **TAK, darmowa**: z księgowym (1–3 dni) lub samodzielnie w apce (15 min, integracja CEIDG); klient podpisuje PZ/bankowością | 160 zł/sprzedaż All Inclusive (System Partnerski Bankier — systempartnerski.pl) |
| **ifirma** | NIE | TAK (do 1000 dok./mies.) | **TAK, darmowa**: konsultacje CEIDG ~45 min, rejestracja + US/ZUS/VAT | 100 zł (biuro rach.) / 50 zł (księgowość) / 10 zł (Faktura+); wypłata od 500 zł |
| **wFirma** | NIE | TAK (v2, doc.wfirma.pl) | częściowo (domknięcie po CEIDG-1) | **30% DOŻYWOTNIO** (dopóki konto aktywne), cookie 90 dni, kwartalne wypłaty, wymóg 10 nowych klientów/rok |
| **Fakturownia** | TAK — ale **tylko fakturowanie** (moduł SaaS w naszej apce, nasza marka; cennik niepubliczny — integracje@fakturownia.pl) | TAK | NIE | 30%/24 mies. („Stałe Przychody") LUB rabaty do 100% |
| **Firmove (ING+Comarch)** | NIE | — | TAK (asystent + księgowa ING, bonus konta do 1800 zł) | przez program ING (niżej) |
| **CashDirector** | **TAK — private-label pełnej księgowości, ale dla BANKÓW** (mBank mOrganizer, Millennium, Credit Agricole, BNP, Nest); dla marki niebankowej = kontakt handlowy B2B (+48 600 602 467), brak publicznej oferty | — | pośrednio | B2B |

### Banki — założenie JDG z bankowości (wszystkie z podpisem PZ klienta)
| Bank | Flow JDG | Bonus dla nowej firmy | Afiliacja dla TN | Księgowość w pakiecie |
|---|---|---|---|---|
| **mBank** | ~10 min, bez bycia klientem, CEIDG+NIP+REGON+konto | ~700 zł „łatwej" premii; konto 0 zł na zawsze | PolecamBank (trzeba być klientem): 250–350 zł za „założenie firmy" | fakturowanie darmowe (mOrganizer); pełna księgowość płatna |
| **ING** | CEIDG+**ZUS+US**+konto w 1 wniosku; opcja z księgową | do 1800 zł (transze) | **Program Partnerski ING dla Firm (ingdlabiznesu.pl): 300 zł/konto + 100 zł/założenie firmy** — otwarty dla przedsiębiorców | **fakturowanie darmowe bez limitu**; pełna 6 mies./1 zł |
| PKO BP | iPKO/IKO, e-Urząd | do 4200 zł (transze, do 30.06.2026) | nie potwierdzono | e-Księgowość (płatna?) |
| Erste (d. Santander) | online, z poradą inFakt | do 1400 zł | „Polecam mój bank": 300 zł/konto firmowe (karty podarunkowe) | tylko porada inFakt |
| Millennium | apka, wyszukiwarka PKD | do 5000 zł (transze, do 30.09.2026) | nie potwierdzono | płatna osobno |
| Pekao / Alior | tak, ale wymagają bycia klientem | do 3000 / 4200 zł | nie potwierdzono | nie potwierdzono |
Sieci afiliacyjne (konta firmowe ~300–400 zł/szt.): System Partnerski Bankier (próg 50 zł),
MyLead, ComperiaLead, eBrokerPartner.

Uwaga: bonusy „do X zł" to sumy transz warunkowych — klientowi komunikować „łatwą" część
(500–700 zł), nie sufit.

---

## 3. Granice prawne (czego NIE robimy)
1. **Nie podpisujemy i nie składamy wniosku za klienta** — podpis PZ jest osobisty;
   pełnomocnictwo działa tylko offline w urzędzie. Portal = przygotowanie + prowadzenie.
2. **Nie doradzamy podatkowo** (ustawa o doradztwie podatkowym, art. 2–3): porady/opinie
   o zobowiązaniach podatkowych = tylko doradca/adwokat/radca. Wolno: informacje ogólne,
   edukacja, checklisty, wypełnianie formularzy, prowadzenie ksiąg. Sformułowanie „wybierz
   ryczałt 3%" w TWOJEJ sytuacji = zastrzeżone → zawsze przekierowanie do księgowego partnera.
3. **Transparentność afiliacji** — audytorium z lękiem #1=scam: link partnerski oznaczamy
   („dzięki temu ta pomoc jest dla Ciebie darmowa") — buduje zaufanie zamiast je palić.

---

## 4. Projekt modułu portalu „Twoja firma" (wg mapy wf2-portal z 21.07.2026)

Model data-driven — punkty zmiany (wzorzec: krok `pl_konto_klient`, migracja 20260720c):
1. **Migracja SQL**: INSERT do `wf2_step_defs` — propozycja: JEDEN krok `firma`
   (owner='client', scope='project', Etap 1 lub 3 przed `pl_dane`, milestone_label
   „Firma zarejestrowana") z checklistą faz zamiast 3 osobnych kroków; na końcu
   `SELECT wf2_ensure_steps(id)`.
2. **`wf2-portal/index.ts` → CLIENT_FIELD_WHITELIST**: `firma: ['forma','nip','data_rejestracji']`
   (forma: nierejestrowana|jdg; NIP po rejestracji → prefill podpowiedzi do pl_dane).
3. **`wf2-portal/checklist-map.ts`**: tłumaczenia pozycji (fail-closed!).
4. **`tn-sklepy/portal.html`**: wpis w `WS_CLIENT` (guide krok-po-kroku) + `TASK_ORDER`
   (przed `pl_dane`); mirror checklisty adminowej w `projekt.html` (obiekt `WS`) VERBATIM.

### Zawartość kroku (3 fazy w jednej checkliście)
**Faza A — Przygotuj (0 zł, od dnia rezerwacji):**
- oś czasu kosztów (grafika: 0 zł rejestracja → 6 mies. ~433 zł → 24 mies. ~880 zł łącznie
  ze zdrowotną → bonus banku na starcie „zwraca" pierwsze miesiące),
- załóż Profil Zaufany (link + instrukcja; przez bank = 5 min),
- przygotuj dane (dowód, adres wykonywania działalności — może być mieszkanie),
- „co się otworzy" (hurtownie, import, konto firmowe z premią, faktury, brak limitu
  przychodu, koszty firmowe) — sekcja motywacyjna.
**Faza B — Zarejestruj (przed startem sklepu; ~15–40 min):**
- ścieżka domyślna: przycisk „Załóż firmę z darmowym księgowym (inFakt)" [link afiliacyjny],
- alternatywa (zwijana): „w swoim banku — z premią na start" (mBank/ING),
- dla samodzielnych: nasza instrukcja kreatora biznes.gov.pl (~13 sekcji) z defaultami
  FABRYKI jako informacją ogólną (PKD 47.91.Z sprzedaż wysyłkowa; ulga na start TAK;
  „o formie opodatkowania i VAT porozmawiaj z księgowym — przy elektronice VAT zwykle
  obowiązkowy od 1. sprzedaży"),
- pole `nip` + `data_rejestracji`; „Zrobione" = kamień milowy z celebracją
  („🎉 Masz firmę! Jesteś jednym z ~2,7 mln przedsiębiorców w CEIDG").
**Faza C — Po rejestracji:**
- konto firmowe z bonusem (link), księgowość (afiliacja), wniosek e-ZUS potwierdzenie ulgi
  na start, przepisz dane do zadania „Dane rozliczeniowe" (pl_dane → auto-publikacja stron
  prawnych sklepu — synergie już istnieją),
- przypomnienie o wakacjach składkowych (od 7. miesiąca).

### UX-playbook (wzorce z badania Stripe Atlas / ZenBusiness / doola / mObywatel)
1. Proces = 3 nazwane fazy, status zawsze widoczny (tracker jak Atlas Submit→Incorporate→Grow).
2. Twarda obietnica czasu („firma w 1 dzień roboczy, podpis zajmuje kwadrans").
3. „Wszystko przygotowane — Ty tylko podpisujesz" (mObywatel sam pobiera dane z rejestrów).
4. Człowiek w tle: darmowa rozmowa z księgowym inFakt/ifirma = konsjerż bez naszego ryzyka.
5. Zero urzędu: cały proces z telefonu; e-Doręczenia jako „jeden prowadzony krok".
6. Celebracja kamienia + natychmiastowa nagroda (bonus banku = odpowiednik kredytów Stripe’a).
7. Autorytet + dowód społeczny (liczby CEIDG, „tak samo zaczynał X ze sklepem Y").
8. Jedna decyzja na ekran; opcje alternatywne zwinięte (progressive disclosure).
9. Post-completion: moduł nie kończy się na wpisie — prowadzi do konta, księgowości, pl_dane.
10. Framing na obiekcje leadów: „ile to kosztuje" adresować WCZEŚNIE (oś czasu), „scam"
    rozbrajać transparentnością (co my z tego mamy: wspólny biznes — Twoja firma = warunek
    wypłat COD na TWOJE konto; ew. jawna afiliacja).

---

## 5. Otwarte decyzje Tomka
1. **Partner domyślny**: inFakt (rekomendacja) vs ifirma; zapisy do programów: System
   Partnerski Bankier (inFakt), Program Partnerski ING dla Firm, panel wFirma (30% recurring
   — wymóg 10 klientów/rok), Fakturownia „Stałe Przychody".
2. **Czy pokazywać ścieżkę nierejestrowaną** (rekomendacja: tak, jako mostek z wyraźnym
   „krótko i nie dla elektroniki"), czy od razu prowadzić wszystkich do JDG.
3. **Moment wymuszenia**: czy „Firma zarejestrowana" ma być twardą bramką przed ads_start
   (rekomendacja: tak — wypłaty COD i tak idą na NRB klienta, a strony prawne wymagają
   danych sprzedawcy).
4. **CashDirector white-label** — kontakt handlowy przy skali (dziś przedwczesne).
5. Treść komunikacji (kierunek kreatywny = decyzja Tomka).

## 6. Główne źródła
biznes.gov.pl (00115, 00151, 00174, 00284, ou736, ou710) · zus.pl · forsal.pl (11253081) ·
fakturownia.pl (white-label, nierejestrowana 2026, program partnerski) · infakt.pl
(/zaloz-firme, developers, blog partnerski) · ifirma.pl (rejestracja-firmy, konsultacje-ceidg,
api, pomoc/program-partnerski) · wfirma.pl/program-partnerski + doc.wfirma.pl ·
firmove.pl/zakladanie-firmy · cashdirector.pl · mbank.pl / ing.pl + ingdlabiznesu.pl/partnerzy /
pkobp.pl / erste.pl / bankmillennium.pl / pekao.com.pl / aliorbank.pl · bankier.pl (rankingi,
System Partnerski) · lexlege.pl (art. 113 VAT) · gofin.pl (kasy, poz. 36) ·
poradnikprzedsiebiorcy.pl (wakacje, kasy) · interpretacje KIS 2025–26 · stripe.com/atlas ·
zenbusiness.com · doola.com · gov.pl (mObywatel Firma).
