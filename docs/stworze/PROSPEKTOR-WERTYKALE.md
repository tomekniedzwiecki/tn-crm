# PROSPEKTOR — katalog wertykali (research 2026-07-23)

> Źródło seedu migracji `20260723a_wfp_v2.sql` i punkt odniesienia. Research Opus + WebSearch
> (saturacje `[zweryf.]` potwierdzone wyszukiwarką; reszta = ocena ekspercka do potwierdzenia
> raportem branżowym per wertykal — akcja `vertical_research`).
> KLUCZOWE ODKRYCIE: ~80% „oczywistych" nisz operacyjnych jest już zajętych przez tanie polskie
> produkty; wolne pasma = **compliance/dokumentacja z cyklicznym terminem** oraz **koordynacja
> wokół specyficznego artefaktu branżowego**. Wpisy priority 1 = świadomy rejestr „tu NIE
> idziemy i dlaczego" (wartość katalogu, nie balast).

Kolumny: key · name · pain · wedge_hint · saturation (+nota) · priority 1-5 (5=strzelaj najpierw) · operator_persona

## FILOZOFIA v3 (2026-07-23, decyzja Tomka) — kolejność, nie odrzucanie

Katalog wertykali **nie odrzuca nisz z góry** — ustala wyłącznie KOLEJNOŚĆ, w jakiej się do
branż odzywamy (fale prospectingu 1-3; kolumna `wfp_verticals.wave`). Nie da się prospectować
wszystkich naraz, więc fala = priorytet czasowy, a nie wyrok. **Obecność dużego lub dedykowanego
dostawcy oprogramowania ≠ NO_GO.** Reguła generalna (z sekcji C researchu, wpisana też do promptu
`wfp_prompt_vertical`): lider zawsze zostawia luki — zadaniem jest AKTYWNIE znaleźć **wedge obok
lidera**: mniejszą, ale ważną funkcję/proces, którego lider nie robi wcale albo robi źle
(specyficzna dokumentacja, zgody, cykliczne terminy, artefakt branżowy, rozliczenia niszowe),
i wokół której da się zbudować całe narzędzie — dokładnie jak `/sparing`. Status `'odrzucony'`
zostaje w słowniku, ale **wyłącznie jako świadoma decyzja PO raporcie branżowym** (werdykt NO_GO +
decyzja człowieka), z możliwością re-badania nowym promptem. **FILOZOFIA MAŁEGO RYNKU (decyzja
Tomka 23.07): ŻADNEGO sztywnego progu liczby firm.** Nisza na 200-500 firm często jest
nieobsłużona DOKŁADNIE dlatego, że była za mała dla klasycznego software house'u — a nas AI czyni
rentownymi przy małej skali; mały rynek z przymusem bólu i bez konkurencji = realne pokrycie
30-50%. Oceniamy **ekonomię pokrycia** (liczba firm × realne pokrycie × cena), nie liczbę firm.
Twarde NO_GO tylko gdy: brak osiągalnej persony operatora, po realnym zbadaniu konkurencji
naprawdę nie da się wskazać sensownego wedge'a, rdzeń rozwiązuje system rządowy bez miejsca na
warstwę operacyjną, albo ekonomia pokrycia nie spina się nawet optymistycznie (~30+ płacących).
**Od v3 samo istnienie lidera NIGDY nie jest powodem odrzucenia bez raportu** (reguła „dedykowany
lider = twarde NO_GO" z v2 została usunięta także z sekcji „Model działania" niżej i z promptu).
Migracje: `20260723b_wfp_v3_kolejnosc.sql` (cofa seedowe 'odrzucony' → 'katalogowy', dodaje `wave`,
podmienia prompt) + `20260723c_wfp_v3_seed_fal.sql` (38 nowych nisz + przydział fal). Stan bazy po
v3: **140 wertykali** (fala 1 = 6, fala 2 = 9, fala 3 = 72, bez fali = 53).

## Budownictwo i dom

| key | name | pain | wedge_hint | saturation | saturation_note | priority | operator_persona |
|---|---|---|---|---|---|---|---|
| stolarnia-na-wymiar | Stolarnie / meble na wymiar | Rozjazd między pomiarem, projektem, produkcją a akceptacją klienta — poprawki giną w SMS-ach | Etapowy status zlecenia z wizualną akceptacją projektu przez klienta (link) + harmonogram montażu | srednia | Ciężkie ERP meblowe + arkusze; brak lekkiego dedykowanego lidera | 4 | Właściciel 2–4 os. pracowni, rzemieślnik-perfekcjonista wściekły na chaos zleceń |
| brukarstwo | Brukarze / układanie kostki | Wyceny „na oko", brak dokumentacji postępu, spory o zakres z inwestorem | Wycena z obmiaru + dziennik zdjęć postępu i odbiór z podpisem klienta | niska | Brak dedykowanego; generyczne kalkulatory | 3 | Właściciel ekipy brukarskiej z ambicją „zrobić to porządniej" |
| dekarstwo | Dekarze | Wyceny dachów, zamówienia materiału, koordynacja ekip i pogody | Kalkulator pokrycia z obmiaru + oferta PDF + harmonogram ekip | srednia | Generyczne field-service; kalkulatory producentów blachy | 3 | Majster dekarski z 1–2 ekipami |
| remonty-wykonczenia | Ekipy remontowo-wykończeniowe | Klient nie wie, na jakim etapie remont; płatności etapowe się rozjeżdżają | Harmonogram etapów z galerią postępu i płatnościami milestone dla klienta | srednia | Trello + arkusze; brak dedykowanego PL lidera | 3 | „Złota rączka premium" rosnący z 1 do 3 ekip |
| bramy-ogrodzenia | Bramy, ogrodzenia, automatyka | Wycena z pomiaru, koordynacja montażu, serwis gwarancyjny automatyki | Konfigurator wyceny + kartoteka zamontowanej automatyki z przypomnieniem serwisu | niska | Brak dedykowanego | 3 | Były spawacz z własną firmą montażową |
| instalacje-elektryczne | Elektrycy | Rozproszone zlecenia, protokoły pomiarowe bez ewidencji terminów | Zlecenia + generator protokołów pomiarowych z terminem następnych badań | srednia | Generyczne (RO App, Serwis Planner) | 3 | Elektryk z uprawnieniami SEP, jednoosobowa DG |
| projektowanie-wnetrz | Projektanci wnętrz | Moodboardy, listy zakupowe i budżet klienta rozsypane w mailach i Pintereście | Panel projektu z listą zakupową, budżetem i akceptacją koncepcji przez klienta | srednia | Milanote/Pinterest + intl Programa; brak lekkiego PL | 3 | Projektantka solo z rosnącą liczbą zleceń |
| nadzor-budowlany | Inspektorzy nadzoru inwestorskiego | Dziennik budowy, raporty foto i usterki na papierze i w telefonie | Cyfrowy dziennik budowy + raport foto + punch list do inwestora | niska | Fieldwire/PlanRadar drogie; PL segment SME pusty | 4 | Inspektor z uprawnieniami, były kierownik budowy na swoim |
| przeglady-budynkow | Firmy przeglądów okresowych (art. 62) | Pilnowanie terminów rocznych/5-letnich przeglądów w portfelu budynków | Kalendarz obowiązkowych przeglądów z alertami + archiwum protokołów per obiekt | srednia | Rządowy c-KOB/EKOB pokrywa książkę; warstwa OPS cienka | 3 | Inżynier robiący przeglądy dla wspólnot |
| wiercenie-studni | Studnie głębinowe / geologia | Dokumentacja odwiertów, formalności wodnoprawne, harmonogram wiertnicy | Kartoteka odwiertów z dokumentacją + planowanie sprzętu | niska | Nisza, brak software | 2 | Właściciel firmy wiertniczej (mały rynek) |
| serwis-komputerowy | Serwis komputerowy / IT dla MŚP | Tickety, umowy SLA, ewidencja sprzętu klientów | Helpdesk + ewidencja sprzętu i umów | wysoka | Gęsto: RMM/PSA (NinjaOne, Atera) + generyczne | 1 | NIE priorytet |

## Zdrowie i ciało

| key | name | pain | wedge_hint | saturation | saturation_note | priority | operator_persona |
|---|---|---|---|---|---|---|---|
| gabinet-fizjoterapii | Gabinety fizjoterapii | Rejestracja, EDM, dokumentacja terapii | — (rynek zajęty) | wysoka | [zweryf.] Medyc, Medfile, eGabinet, RSQ Physio; EDM obowiązkowe od 2021 | 1 | NIE wchodzimy |
| dietetycy | Dietetycy | Bilansowanie jadłospisów, rozliczenia | — | wysoka | KCalmar, Dietetyk Pro, Aliant, DietaOnline | 1 | NIE wchodzimy |
| gabinety-beauty | Salony beauty / fryzjer / kosmetyka | Rezerwacje, no-show, powiadomienia | — ZABETONOWANE | wysoka | Booksy dominuje absolutnie | 1 | NIE wchodzimy |
| studia-tatuazu | Studia tatuażu i piercingu | Zadatki, zgody zdrowotne, portfolio, wieloetapowe projekty | Rezerwacja z zadatkiem + cyfrowe zgody/ankieta + galeria projektu | srednia | Booksy pokrywa rezerwację; specyfika (zgody, zadatki) słabo | 3 | Tatuator-właściciel studia budujący markę |
| podologia | Gabinety podologiczne | Dokumentacja stopy, nawroty, wizyty cykliczne | Karta podologiczna z foto „przed/po" + cykl wizyt | srednia | Booksy (rezerwacja); dokumentacja słabo pokryta | 3 | Podolog-edukator prowadzący gabinet |
| logopedia | Gabinety logopedyczne | Dokumentacja terapii dzieci, komunikacja z rodzicami, ćwiczenia do domu | Karta terapii + wysyłka ćwiczeń do domu + postęp dla rodzica | niska | Nisza, brak dedykowanego | 3 | Logopeda z gabinetem i pasją do metodyki |
| psychoterapia | Gabinety psychoterapii | Rezerwacje, notatki sesji, rozliczanie pakietów | Rezerwacja + prywatne notatki sesji + rozliczanie pakietów | srednia | Proksi, Booksy; specyfika terapii słabo | 3 | Psychoterapeuta z gabinetem i grupą współpracowników |
| optycy | Salony optyczne | Zamówienia szkieł, historia korekcji, serwis opraw | Kartoteka korekcji + status zamówienia szkieł u dostawcy | srednia | Optiplus + medyczne; częściowo pokryte | 2 | Optyk-właściciel salonu |

## Motoryzacja

| key | name | pain | wedge_hint | saturation | saturation_note | priority | operator_persona |
|---|---|---|---|---|---|---|---|
| warsztat-samochodowy | Warsztaty samochodowe | Zlecenia, historia napraw, powiadomienia | — gęsto | wysoka | [zweryf.] Integra Car 7, Asystent Warsztat, mpWarsztat, Warsztat24, Motowarsztat, abcWarsztatu | 1 | NIE wchodzimy |
| osk-szkoly-jazdy | Ośrodki szkolenia kierowców (OSK) | Kursanci, grafik instruktorów, płatności | — gęsto | wysoka | [zweryf.] OskSoft, eOSK, CarDriveManager, Apkadoprawka, Portal OSK | 1 | NIE wchodzimy |
| przechowalnia-opon | Wulkanizacja / hotele opon | Sezonowa ewidencja przechowywanych opon + przypomnienia o wymianie | Ewidencja „hotelu opon" (lokalizacja, sezon) + auto-SMS o terminie | srednia | Częściowo w programach warsztatowych; lekki dedykowany brak | 3 | Właściciel wulkanizacji rozwijający przechowalnię |
| laweta-pomoc-drogowa | Pomoc drogowa / lawety | Dyspozycja zgłoszeń, lokalizacja, rozliczenia z ubezpieczycielami | Dyspozytornia zgłoszeń z lokalizacją i statusem + rozliczenie | niska | Brak dedykowanego PL | 3 | Właściciel firmy holowniczej z kilkoma lawetami |
| detailing | Studia detailingu | Rezerwacje pakietów, dokumentacja „przed/po", up-sell powłok | Rezerwacja pakietów + protokół stanu + przypomnienie o odnowieniu powłoki | srednia | Booksy (rezerwacja); specyfika detailingu słabo | 3 | Właściciel studia, pasjonat-influencer |
| blacharnia-lakiernia | Blacharnie / lakiernie | Kosztorysy szkód, komunikacja z ubezpieczycielem, statusy naprawy | Status naprawy powypadkowej dla klienta + kartoteka szkody | srednia | Audatex/Eurotax (kosztorys) + warsztatowe | 2 | Właściciel bezgotówkowej blacharni |
| komisy-samochodowe | Komisy / handel autami | Stan magazynowy aut, publikacja ofert, koszty per pojazd | Magazyn aut z rentownością per pojazd + multi-publikacja ofert | srednia | Narzędzia OtoMoto + generyczne | 2 | Właściciel komisu chcący panować nad marżą |

## Usługi profesjonalne

| key | name | pain | wedge_hint | saturation | saturation_note | priority | operator_persona |
|---|---|---|---|---|---|---|---|
| firmy-ppoz | Firmy ochrony ppoż (przeglądy gaśnic/hydrantów) | Terminy przeglądów i legalizacji sprzętu rozsiane po obiektach; papierowe zawieszki | Rejestr sprzętu ppoż per obiekt z terminami przeglądów + etykiety QR | niska | Brak dedykowanego PL; status quo = papierowe kontrolki | 5 | Właściciel firmy ppoż, były strażak z uprawnieniami |
| firmy-ddd | Firmy DDD (deratyzacja/dezynsekcja) | Dokumentacja stacji monitoringu, karty kontroli, raporty HACCP na audyty klienta | Mapa stacji + karty kontroli + auto-raport HACCP per obiekt | niska | [zweryf.] Brak dominującego software; wymogi HACCP/IFS/BRC = przymus dokumentacji | 5 | Technik DDD z 15-letnim stażem zakładający firmę |
| bhp-outsourcing | Firmy obsługi BHP | Pilnowanie ważności szkoleń/badań pracowników klientów, oceny ryzyka | Rejestr ważności szkoleń/badań per pracownik klienta z alertami wygaśnięcia | srednia | Kilka dedykowanych + generyczne; mocno rozdrobnione | 4 | Behapowiec-freelancer obsługujący 20–30 firm |
| serwis-udt | Serwis wózków widłowych / urządzeń UDT | Terminy badań UDT, przeglądy i historia serwisu maszyn u klientów | Kartoteka maszyn z terminami UDT/przeglądów + historia serwisu | niska | Generyczne field-service; specyfika UDT niepokryta | 4 | Serwisant wózków z własną firmą |
| geodeci | Firmy geodezyjne | Zarządzanie zleceniami, operatami i formalnościami ODGiK | Rejestr zleceń z etapami formalności + archiwum operatów | srednia | C-Geo, WinKalk (obliczenia); zarządzanie zleceniami cienkie | 3 | Geodeta uprawniony, 2–3 os. firma |
| rzeczoznawcy | Rzeczoznawcy majątkowi | Operaty, baza transakcji porównawczych, terminy | Generator operatu z bazą porównań + rejestr zleceń | srednia | Nisza; kilka dedykowanych | 2 | Rzeczoznawca solo z rosnącą liczbą zleceń |
| tlumacze | Biura / freelancerzy tłumaczeń | Projekty, stawki per słowo, terminy | Zarządzanie zleceniami z wyceną per słowo i terminami | srednia | XTRF/Trados (duzi); segment SME cienki | 2 | Tłumacz przysięgły budujący małe biuro |
| kancelarie-prawne | Kancelarie prawne / adwokackie | Sprawy, terminy procesowe, rozliczanie czasu | — gęsto | wysoka | Kleos, Legito, Mecenas.iT, Admiral | 1 | NIE priorytet |
| kosztorysanci | Kosztorysanci budowlani | Kosztorysy, obmiary, wersje ofert | — pokryte | wysoka | Norma, Zuzia, Rodos | 1 | NIE wchodzimy |
| agencje-marketingowe | Małe agencje marketingowe | Projekty, akceptacje kreacji, raporty | — | wysoka | Asana/ClickUp + dedykowane | 1 | NIE priorytet |

## Edukacja i dzieci

| key | name | pain | wedge_hint | saturation | saturation_note | priority | operator_persona |
|---|---|---|---|---|---|---|---|
| obozy-kolonie | Organizatorzy obozów i kolonii | Zapisy, zgody rodziców, płatności ratalne, listy uczestników, komunikacja | Zapisy na turnusy z cyfrowymi zgodami, ratami i komunikacją do rodziców | niska | Generyczne formularze; brak dedykowanego lidera | 4 | Organizator obozów sportowych/harcerskich, sezonowa skala |
| korepetycje | Ośrodki korepetycji | Grafik lektorów, rozliczenia, komunikacja z rodzicami | Grafik zajęć + rozliczenia + raport postępu dla rodzica | srednia | Overlap z narzędziami szkół językowych | 2 | Nauczyciel prowadzący własny „punkt korepetycji" |
| szkoly-tanca | Szkoły tańca | Zapisy na kursy, karnety, obecności | Zapisy + karnety + obecności na grupach | srednia | ActiveNow, Fitssey; częściowo pokryte | 2 | Instruktor-właściciel szkoły tańca |
| zlobki-przedszkola | Żłobki / przedszkola niepubliczne | Obecności, opłaty, komunikacja z rodzicami | — zajęte | wysoka | LiveKid dominuje segment | 1 | NIE wchodzimy |
| szkoly-jezykowe | Szkoły językowe | Grupy, obecności, płatności, lektorzy | — pokryte | wysoka | LangLion, ProgMan, Fireberry | 1 | NIE priorytet |
| akademie-sportowe | Kluby / akademie sportowe | Składki, obecności, komunikacja z rodzicami | — zajęte | wysoka | [zweryf.] ProTrainUp dominuje + Vibeclass, LumaPro, SportsManago | 1 | NIE wchodzimy |

## Eventy i kreatywni

| key | name | pain | wedge_hint | saturation | saturation_note | priority | operator_persona |
|---|---|---|---|---|---|---|---|
| zespoly-dj-weselni | Zespoły / DJ-e weselni | Ryzyko podwójnej rezerwacji terminu, zadatki, ustalenia z parą | Kalendarz terminów z blokadą double-bookingu + zadatek + formularz ustaleń z parą | niska | Brak dedykowanego PL; Excel + telefon | 4 | Muzyk/DJ grający 40+ imprez rocznie, obsesyjny organizator |
| wynajem-sprzetu-eventowego | Wypożyczalnie sprzętu eventowego (namioty, stoły, nagłośnienie) | Dostępność sprzętu w terminach, kolizje rezerwacji, logistyka dowozu | Kalendarz dostępności z rezerwacją terminową + lista załadunku | niska | Booqable (intl) drogie; PL segment pusty | 4 | Właściciel wypożyczalni namiotów/sprzętu |
| fotografia-slubna | Fotografowie / kamerzyści ślubni | Rezerwacja terminu, umowa, wybór zdjęć, dostawa galerii | Rezerwacja z umową + galeria do wyboru zdjęć przez parę | srednia | Pixieset/Pic-Time (galeria); workflow rezerwacja+umowa PL cienki | 3 | Fotograf ślubny solo skalujący sezon |
| wedding-planner | Wedding plannerzy | Checklisty, budżet, koordynacja podwykonawców i gości | Panel wesela z budżetem, listą podwykonawców i harmonogramem dnia | niska | Intl Aisle Planner; PL = arkusze | 3 | Wedding plannerka solo rosnąca w markę |
| wypozyczalnia-sukni | Wypożyczalnie sukien / strojów | Rezerwacje egzemplarzy, przymiarki, kaucje, obieg pralni | Kalendarz rezerwacji egzemplarza + przymiarki + obieg kaucji/pralni | niska | Brak dedykowanego | 3 | Właścicielka salonu sukien ślubnych/wieczorowych |
| dmuchance-animatorzy | Wynajem dmuchańców / animatorzy | Dostępność atrakcji w terminach, dowóz, kolizje | Kalendarz dostępności atrakcji + rezerwacja + logistyka dowozu | niska | Brak dedykowanego | 3 | Właściciel firmy z atrakcjami dla dzieci |
| kwiaciarnie | Kwiaciarnie | Zamówienia z dostawą, przypomnienia o okazjach klienta | Zamówienia z dostawą + przypomnienia o rocznicach/okazjach | srednia | Generyczne e-commerce; dedykowany florysta cienki | 3 | Właścicielka z ambicją abonamentów kwiatowych |
| catering-eventowy | Catering eventowy / bankietowy | Wyceny menu per liczba gości, koordynacja obsługi i logistyki | Wycena menu per liczba gości + karta eventu z logistyką obsługi | srednia | Catering DIETETYCZNY zajęty; bankietowy słabo pokryty | 3 | Szef kuchni-właściciel firmy na wesela |
| florystyka-eventowa | Florystyka eventowa / dekoracje | Wyceny dekoracji, moodboardy, koordynacja realizacji na miejscu | Wycena dekoracji z moodboardem + lista realizacji na dzień eventu | niska | Brak dedykowanego | 2 | Florystka eventowa z portfolio na IG |

## Rolnictwo i zieleń

| key | name | pain | wedge_hint | saturation | saturation_note | priority | operator_persona |
|---|---|---|---|---|---|---|---|
| pielegnacja-zieleni | Firmy utrzymania terenów zielonych | Powtarzalne koszenia/pielęgnacja wg umów, dowód wykonania, harmonogram ekip | Harmonogram cyklicznych zleceń + dowód wykonania (foto/GPS) dla zarządcy | srednia | [zweryf.] JobJet (generyczny) obecny; dedykowany dla kontraktów cienki | 4 | Właściciel firmy ogrodniczej z kontraktami na osiedla/gminy |
| szkolki-roslin | Szkółki roślin / gospodarstwa szkółkarskie | Aktualne listy dostępności dla odbiorców B2B, stany, rezerwacje partii | Katalog dostępności B2B z rezerwacją partii + cennik hurtowy | niska | Brak dedykowanego PL; PDF-y i telefon | 4 | Właściciel szkółki sprzedający do centrów ogrodniczych |
| uslugi-rolnicze | Usługi rolnicze (kombajnowanie, opryski) | Zlecenia sezonowe, ha do zrobienia, harmonogram maszyn, rozliczenia | Rejestr zleceń polowych z ha, harmonogramem maszyn i rozliczeniem | niska | Nisza; AgroAsystent (ewidencja) obok | 3 | Rolnik-usługodawca z parkiem maszyn |
| gospodarstwa-rolne | Gospodarstwa rolne (ewidencja, dopłaty) | Ewidencja zabiegów, wniosek o dopłaty, notatnik polowy | — (częściowo gov + dedykowane) | srednia | eWniosekPlus (gov), AgroAsystent, AgriConn | 2 | Nowoczesny gospodarz |
| pszczelarstwo | Pasieki komercyjne | Ewidencja uli, przeglądy, produkcja i sprzedaż miodu | Karta ula z przeglądami + ewidencja produkcji i sprzedaży | srednia | BeePlus/Apiary (intl); niska skłonność do abonamentu u hobbystów | 2 | Pszczelarz zawodowy ze 100+ ulami |
| lesnictwo-uslugi | Usługi leśne (ZUL) | Zlecenia pozyskania drewna, brygady, rozliczenia z nadleśnictwem | Rejestr zleceń leśnych z brygadami + rozliczenie m³ | niska | Nisza; brak dedykowanego | 2 | Właściciel Zakładu Usług Leśnych |
| architektura-krajobrazu | Pracownie architektury krajobrazu | Projekty, zestawienia roślin, kosztorysy | — pokryte | srednia | Gardenphilia DESIGNER, Wymarzony Ogród | 2 | Projektant zieleni |

## Produkcja i rzemiosło

| key | name | pain | wedge_hint | saturation | saturation_note | priority | operator_persona |
|---|---|---|---|---|---|---|---|
| pracownie-protetyczne | Pracownie protetyki dentystycznej (dental lab) | Obieg zleceń od gabinetów (kolor, termin, kurier), status pracy | Przyjęcie zlecenia od gabinetu z terminem/kolorem/statusem + powiadomienie kuriera | niska | Brak dominującego PL; intl LabManager drogie | 4 | Technik dentystyczny obsługujący wiele gabinetów |
| kamieniarstwo | Kamieniarze / zakłady nagrobkowe | Zlecenia nagrobków z projektem, formalności cmentarne, terminy | Zlecenie nagrobka z wizualizacją, formalnościami cmentarza i statusem dla rodziny | niska | Brak dedykowanego PL | 4 | Kamieniarz-właściciel zakładu (często rodzinny biznes) |
| pracownie-krawieckie | Pracownie krawieckie / poprawki | Bilety na sztukę odzieży, terminy odbioru, powiadomienie „gotowe" | Bilet zlecenia per sztuka + SMS „gotowe do odbioru" | niska | Brak dedykowanego; zeszyt | 3 | Krawcowa z pracownią i stałą klientelą |
| tapicerstwo | Tapicerzy / renowacja mebli | Wyceny z materiału, „przed/po", terminy realizacji | Wycena z doborem materiału + galeria „przed/po" + status realizacji | niska | Brak dedykowanego | 2 | Tapicer-rzemieślnik z portfolio |
| jubilerstwo | Jubilerzy / złotnicy | Zlecenia custom, naprawy, wycena z gramatury kruszcu | Zlecenie custom + naprawa z wyceną wg gramatury + status dla klienta | niska | Nisza; generyczne | 2 | Złotnik-projektant biżuterii na zamówienie |
| producenci-okien | Producenci okien / drzwi (mali) | Zamówienia z pomiaru, harmonogram produkcji i montażu | Zamówienie z obmiaru + harmonogram produkcji i montażu | srednia | ERP okienne (WinDoors) dla większych; mikro cienki | 2 | Właściciel małej stolarki otworowej |
| browary-rzemieslnicze | Browary rzemieślnicze | Planowanie warek, receptury, akcyza, sprzedaż | Planowanie warek z recepturą + ewidencja akcyzowa | srednia | Breww/Ollie (intl); PL nisza mała | 2 | Piwowar-właściciel małego browaru |
| masarnie-rzemieslnicze | Masarnie / wędliniarnie rzemieślnicze | Receptury, HACCP, zamówienia lokalnych odbiorców | Zamówienia B2B + receptury + dokumentacja HACCP | niska | Nisza; ERP spożywcze dla dużych | 2 | Masarz-właściciel zakładu z lokalną marką |

## Logistyka i handel

| key | name | pain | wedge_hint | saturation | saturation_note | priority | operator_persona |
|---|---|---|---|---|---|---|---|
| asenizacja | Wywóz nieczystości (asenizacja/szambo) | Harmonogram cyklicznych odbiorów, sprawozdawczość do gminy, ewidencja klientów | Harmonogram odbiorów cyklicznych + ewidencja + sprawozdanie do gminy | niska | Brak dedykowanego; obowiązki sprawozdawcze gminne = przymus | 4 | Właściciel firmy asenizacyjnej z beczkowozem |
| przeprowadzki | Firmy przeprowadzkowe | Wyceny z obmiaru, harmonogram ekip i aut, spis mienia | Wycena z obmiarem + harmonogram ekip + spis mienia | niska | Brak dedykowanego PL | 3 | Właściciel firmy z 2–3 ekipami |
| odpady-bdo | Firmy odbioru / transportu odpadów | Obieg BDO, trasy odbioru, ważenia, ewidencja | Warstwa OPS nad BDO — trasy, ważenia, ewidencja odbiorów | srednia | BDO (gov); warstwa operacyjna cienka | 3 | Właściciel firmy transportu odpadów |
| pralnie | Pralnie / pralnie chemiczne | Bilety na sztukę, tagowanie, powiadomienie o gotowości | Bilet per sztuka z tagiem + SMS o gotowości + rozliczenie | niska | Brak dedykowanego PL; systemy pralni przemysłowych dla dużych | 3 | Właściciel pralni chemicznej / sieci punktów |
| wypozyczalnie-sprzetu | Wypożyczalnie sprzętu i narzędzi | Dostępność egzemplarzy, kaucje, umowy, stan techniczny | Kalendarz dostępności egzemplarza + umowa, kaucja, protokół stanu | srednia | Booqable (intl); PL segment budowlany cienki | 3 | Właściciel wypożyczalni sprzętu budowlanego |
| serwis-gsm | Serwisy telefonów / elektroniki | Bilety napraw z IMEI, części, statusy dla klienta | Bilet naprawy z IMEI + zamówienie części + status dla klienta | srednia | RepairDesk (intl); PL punkt-GSM cienki | 3 | Właściciel punktu napraw GSM |
| transport-tsl | Transport / spedycja | Zlecenia, giełdy ładunków, rozliczenia kierowców | — gęsto | wysoka | Trans.eu, Timocom + liczne TMS | 1 | NIE wchodzimy |

## Sport i rekreacja

| key | name | pain | wedge_hint | saturation | saturation_note | priority | operator_persona |
|---|---|---|---|---|---|---|---|
| szkoly-narciarskie | Szkoły / instruktorzy narciarstwa | Sezonowe rezerwacje lekcji, przydział instruktorów, odwołania (pogoda) | Rezerwacja lekcji z przydziałem instruktora + obsługa odwołań | niska | Brak dedykowanego PL; Excel sezonowy | 3 | Szef szkoły narciarskiej w kurorcie |
| wypozyczalnie-wodne | Wypożyczalnie kajaków / spływy | Rezerwacje sezonowe, logistyka transportu, kaucje | Rezerwacja spływu z logistyką transportu + kaucja | niska | Brak dedykowanego | 3 | Właściciel wypożyczalni kajaków / organizator spływów |
| lowiska-komercyjne | Łowiska komercyjne | Rezerwacje stanowisk, sprzedaż zezwoleń, ewidencja połowów | Rezerwacja stanowisk + sprzedaż zezwoleń + ewidencja połowów | niska | Nisza; brak dedykowanego | 2 | Właściciel łowiska komercyjnego |
| scianki-wspinaczkowe | Ścianki / kluby wspinaczkowe | Wejścia, karnety, kursy, rezerwacja instruktora | Karnety + wejścia + zapisy na kursy | srednia | Fitssey, eFitney (generyczne) | 2 | Właściciel ścianki |
| trenerzy-personalni | Trenerzy personalni | Plany treningowe, rozliczenia pakietów, komunikacja | — pokryte | wysoka | FitBudd, Trainerize, Fitssey | 1 | NIE priorytet |

## Zwierzęta

| key | name | pain | wedge_hint | saturation | saturation_note | priority | operator_persona |
|---|---|---|---|---|---|---|---|
| hotele-dla-zwierzat | Hotele / pensjonaty dla zwierząt | Kalendarz pobytów, wymóg szczepień, opieka, raporty dla właściciela | Kalendarz pobytów z weryfikacją szczepień + raport dnia dla właściciela | srednia | Booksy (rezerwacja) częściowo; boarding-specyfika słabo | 3 | Właściciel hotelu dla psów, behawiorysta |
| stajnie-osrodki-jezdzieckie | Ośrodki jeździeckie / stajnie | Rezerwacje jazd, karnety, pensjonat koni | — (kilku graczy) | srednia | [zweryf.] EQUITA, Horstable, Horsee | 2 | Właściciel stajni / ośrodka |
| hodowle-psow | Hodowle psów rasowych (ZKwP) | Mioty, rodowody, lista oczekujących na szczenięta | Ewidencja miotów + rodowody + lista oczekujących kupujących | niska | Nisza; niska skłonność do abonamentu | 2 | Hodowca z afiksem ZKwP |
| weterynaria | Gabinety weterynaryjne | Wizyty, dokumentacja, przypomnienia | — gęsto | wysoka | [zweryf.] VetFile, Lecznica-3000, Klinika XP, Vetoteka | 1 | NIE wchodzimy |
| groomerzy | Salony groomerskie | Rezerwacje, karta pupila, cykl strzyżeń | — Booksy | wysoka | Booksy dominuje rezerwacje | 1 | NIE priorytet |

## Gastronomia

| key | name | pain | wedge_hint | saturation | saturation_note | priority | operator_persona |
|---|---|---|---|---|---|---|---|
| cukiernie-torty | Cukiernie / torty na zamówienie | Zamówienia tortów okolicznościowych (termin, projekt, smak, odbiór), kolizje terminów | Przyjęcie zamówienia tortu z projektem, terminem odbioru i zadatkiem | niska | Brak dedykowanego PL; zeszyt + Messenger | 4 | Cukiernik z listą zamówień weselnych |
| piekarnie-rzemieslnicze | Piekarnie rzemieślnicze | Planowanie produkcji wg zamówień B2B, rozwóz do punktów | Zamówienia B2B + planowanie produkcji + rozwóz do sklepów/kawiarni | niska | Nisza; ERP piekarskie dla dużych | 3 | Piekarz z odbiorcami HoReCa |
| food-trucki | Food trucki | Kalendarz eventów/lokalizacji, rezerwacje na imprezy zamknięte | Kalendarz lokalizacji + rezerwacje food trucka na eventy | niska | Nisza; brak dedykowanego | 2 | Właściciel food trucka jeżdżący po eventach |
| winiarnie-enoteki | Winnice / enoteki | Sprzedaż, degustacje, klub wina, akcyza | Rezerwacja degustacji + klub wina + sprzedaż z akcyzą | niska | Nisza mała | 2 | Właściciel winnicy z winoturystyką |
| catering-dietetyczny | Catering dietetyczny (pudełkowy) | Diety, produkcja, pakowanie, logistyka dostaw | — zajęte | wysoka | [zweryf.] Caterings.pl, niceGastro, Mobilny Catering, bs4 | 1 | NIE wchodzimy |
| restauracje-pos | Restauracje / bary (POS) | Zamówienia, płatności, kuchnia | — gęsto | wysoka | Gastro, Bistro, Dotykačka, POSbistro | 1 | NIE wchodzimy |

## Turystyka

| key | name | pain | wedge_hint | saturation | saturation_note | priority | operator_persona |
|---|---|---|---|---|---|---|---|
| organizatorzy-eventow-firmowych | Organizatorzy integracji / eventów firmowych | Oferty, koordynacja podwykonawców, budżet klienta | Konfigurator oferty integracji + koordynacja podwykonawców + budżet | niska | Brak dedykowanego | 3 | Właściciel firmy robiącej integracje B2B |
| przewodnicy-piloci | Przewodnicy / piloci wycieczek | Kalendarz zleceń, wyceny grup, rozliczenia | Kalendarz zleceń z wyceną grupy + rozliczenie | niska | Nisza; brak dedykowanego | 2 | Licencjonowany przewodnik górski/miejski |
| agroturystyka | Gospodarstwa agroturystyczne | Rezerwacje, atrakcje, komunikacja z gośćmi | Rezerwacja pobytu + pakiet atrakcji + komunikacja z gościem | srednia | Overlap z PMS pensjonatowym | 2 | Gospodarz agroturystyki |
| pensjonaty-male | Małe pensjonaty / domki | Rezerwacje z wielu kanałów, kalendarz, kaucje | — gęsto | wysoka | PMS/channel manager (Hotres, Wubook, Booking sync) | 1 | NIE priorytet |

## Bezpieczeństwo i obowiązki cykliczne (compliance)

| key | name | pain | wedge_hint | saturation | saturation_note | priority | operator_persona |
|---|---|---|---|---|---|---|---|
| kominiarstwo | Firmy kominiarskie | Pilnowanie terminów obowiązkowych przeglądów w portfelu budynków, archiwum e-protokołów CEEB | Kalendarz obowiązkowych przeglądów per budynek + auto-przypomnienia + archiwum protokołów | srednia | [zweryf.] CEEB (gov) na e-protokół; eDomki generyczny; CRM firmy cienki | 4 | Mistrz kominiarski obsługujący wspólnoty |
| serwis-kotlow-gazowych | Serwis kotłów / instalacji gazowych | Cykliczne przeglądy gazowe w budynkach, terminy i protokoły | Kalendarz przeglądów gazowych per obiekt + protokoły + przypomnienia | srednia | Generyczne field-service; specyfika gazowa cienka | 3 | Serwisant gazowy z uprawnieniami |
| serwis-pomp-ciepla | Serwis / montaż pomp ciepła i klimatyzacji | Zlecenia montażu, przeglądy gwarancyjne (F-gazy), historia | — (dużo, w tym generyczne) | wysoka | [zweryf.] Integra Serwis, Kambit, Serwisoft, Locatick, RO App, iService | 2 | Instalator OZE z własną firmą |
| firmy-alarmowe | Firmy alarmowe / monitoringu | Montaże, przeglądy systemów, umowy monitoringu i SIM | Kartoteka instalacji klienta + przeglądy systemów + umowy monitoringu | srednia | Generyczne field-service | 2 | Właściciel firmy zabezpieczeń technicznych |
| wisp-isp-lokalni | Lokalni operatorzy internetu (WISP/ISP) | Abonenci, rozliczenia, zgłoszenia awarii, ewidencja sprzętu | Billing abonentów + zgłoszenia awarii + ewidencja urządzeń | srednia | Kilka dedykowanych + generyczne; mały ISP cienki | 2 | Właściciel lokalnego ISP w małym mieście |

## Rejestr „NIE wchodzimy" — dodatkowo zweryfikowane, zajęte

| key | name | saturation_note | priority |
|---|---|---|---|
| zaklady-pogrzebowe | Zakłady pogrzebowe | [zweryf.] Velario, TuSoft/Funeral System, Silenta, eSEZ, RO App — silna persona, ale rynek software zajęty | 1 |
| serwis-rowerowy | Serwisy rowerowe | [zweryf.] BikeWorkshop/CrankDesk, RowerNeo, SerwisPlanner, CycloPick — zaskakująco gęsto | 1 |
| firmy-sprzatajace | Firmy sprzątające | [zweryf.] EasyWeek, RO App, Infortes 4Services, CRM Vision — generyczne field-service pokrywają | 2 |

## NOWE NISZE v3 (research GPT 23.07.2026)

Źródło: research `gpt-5.6-sol` + web_search (4 kąty, 23.07.2026) → dedup względem 102 istniejących
→ **38 najlepszych nisz**. Koszt researchu: **$2.88**. Seed migracją `20260723c_wfp_v3_seed_fal.sql`
(UPSERT `ON CONFLICT (key) DO NOTHING` — nie rusza istniejących). Trzy NOWE kategorie: *Serwis
techniczny i instalacje*, *Nieruchomości i administracja*, *Zawody regulowane i finanse*; klaster
inspekcyjny dołączył do istniejącej *Bezpieczeństwo i compliance*, reszta do kategorii z v2.

**Dwa klastry-dźwignie (zbuduj rdzeń raz, reskinuj per wertykal):**
1. **Paszport egzemplarza + kalendarz terminów** — cała kategoria „Serwis techniczny i instalacje"
   + klaster inspekcyjny w „Bezpieczeństwo i compliance". Jeden rdzeń: urządzenie/egzemplarz z kodem
   QR/NFC → historia + protokół podpisywany na miejscu + auto-termin następnej czynności
   (kontroli/legalizacji/przeglądu), z blokadą dopuszczenia po terminie. Reskin per wertykal: F-gaz,
   wagi, oczyszczalnie, uzdatnianie wody, PV, opomiarowanie, aparatura medyczna, baseny, regały,
   place zabaw, sprzęt wysokościowy (PPE).
2. **Compliance zawodów regulowanych 2025-26** — „Zawody regulowane i finanse" + część
   „Nieruchomości i administracja". Świeży przepis tworzy przymus dokumentacji → wedge = generator
   „teczki zgodności": AML (pośrednicy nieruchomości), KRAZ + jawność płac od 24.12.2025 (agencje
   zatrudnienia), system kaucyjny od 1.10.2025 (vending), PPWR od 12.08.2026 (drukarnie etykiet
   i opakowań), unijne zasady najmu krótkiego od 20.05.2026 (operatorzy najmu krótkiego).

**Runners-up (odpadły przy dedupie/kapie 40 — warte dodania w kolejnej iteracji):**
`serwis-ladowarek-ev`, `serwis-autoklawow` (→ nota w serwis-aparatury-medycznej),
`przeglady-drabin-podestow` i `kontrole-zawiesi` (→ nota w przeglady-sprzetu-wysokosciowego),
`serwis-separatorow`, `renowacja-skory-obuwia`, `serwis-instrumentow`, `serwis-kas-fiskalnych`,
`serwis-wentylacji-rekuperacji`, `posrednicy-kredytowi`, `kantory-stacjonarne-aml`,
`serwis-lodzi-jachtow` (sezonowy-wiosna), `walidacja-lancucha-chlodniczego`,
`doradcy-podatkowi-cpd`, `agencje-celne`.

**Świadomie ODRZUCONE w researchu (nie weszły do katalogu):** `biura-rachunkowe-ksef` (wedge KSeF
świeży, ale 40-70k rynku i SaldeoSMART/Optima zabetonowane — wysokie ryzyko),
`apteki-niezalezne-compliance` (rdzeń w ekosystemie Kamsoft KS-AOW), `notariusze-aml` (persona
zamożna, nie „ekspert z niedosytem"), `serwis-klimatyzacji` mieszkaniowej (pokrywa istniejący
`serwis-pomp-ciepla`), `medycyna-pracy` (Medyc/mMedica/KS-SOMED — EDM zajęty).

**W katalogu:** pod filozofią v3 wszystkie seedowe `'odrzucony'` z v2 wróciły do `'katalogowy'`
(migracja 20260723b) — jedyny wertykal po świadomej decyzji NO_GO to **firmy-ppoz** (raport
branżowy 12/24; dedykowani gracze: gasnica-control.pl, ppozmanager.pl, techpres, qrsystem),
zostaje bez fali z możliwością re-badania nowym promptem wedge-obok-lidera.

### Serwis techniczny i instalacje (NOWA — klaster: paszport egzemplarza + kalendarz terminów)

| key | name | priority | pain | wedge_hint | saturation_note | operator_persona |
|---|---|---|---|---|---|---|
| serwis-chlodnictwa-fgaz | Serwis chłodnictwa komercyjnego / F-gaz | 4 | Kontrole szczelności, ilość czynnika i wpisy do CRO dla setek agregatów rozproszone między papierem, Excelem i CRO | Auto-kalendarz kontroli szczelności liczony z rodzaju/ilości czynnika + mobilny protokół + gotowa paczka do wpisu w CRO | Montero, Relup, iService, Locatick (generyczne field-service); CRO=gov; nowe przepisy F-gaz rozszerzają zakres | Właściciel 2-8-os. serwisu chłodniczego obsługującego sklepy, gastronomię, magazyny |
| serwis-wag-legalizacja | Serwis i legalizacja wag (metrologia) | 4 | Wagi handlowe/magazynowe/przemysłowe mają cykliczne terminy legalizacji, plomby, świadectwa; klient widzi koniec ważności dopiero przed kontrolą | Paszport metrologiczny urządzenia auto-składający protokół, świadectwo i termin następnej legalizacji w pakiet dla klienta | Brak dedykowanego SaaS; Excel/ERP/generyczne FSM | Metrolog / były serwisant producenta prowadzący lokalny serwis wag |
| serwis-oczyszczalni-przydomowych | Serwis przydomowych oczyszczalni ścieków | 5 | Instalator traci kontakt po montażu, choć oczyszczalnia wymaga przeglądów, wywozu osadu, kontroli dmuchawy i dokumentów do kontroli gminy | Paszport oczyszczalni przekazywany właścicielowi po montażu — baza instalacji zamienia się w cykliczny kalendarz serwisów i wywozów | Brak dedykowanego; generyczne CRM/field-service | Lokalny instalator budujący powtarzalny przychód serwisowy z własnej bazy montaży |
| serwis-uzdatniania-wody | Serwis systemów uzdatniania wody | 4 | Wymiany wkładów, sól, dezynfekcja, regeneracja złóż dla setek zmiękczaczy/filtrów/RO pilnowane ręcznie | Kalendarz serwisowy z typu urządzenia i zużycia wody + 1 klik do zamówienia właściwego kompletu materiałów | Apki producentów (MyDafi, Waters); brak niezależnego systemu wielu marek | Mały instalator sanitarny / sprzedawca filtrów z portfelem kilkuset instalacji |
| serwis-fotowoltaiki | Serwis instalacji PV (posprzedażowy) | 4 | Po boomie rośnie liczba instalacji do przeglądów/gwarancji, ale historia urządzeń zostaje u instalatora lub w mailach klienta | Cyfrowy paszport instalacji PV importowany ze zdjęć i faktur + termin przeglądu + raport serwisowy | Feldi, Locatick, Fieldworker (generyczne); monitoring falowników to nie proces serwisowy | Były monter/kierownik ekip PV, który przeszedł na niezależny serwis wielu marek |
| serwis-opomiarowania | Serwis ciepłomierzy / wodomierzy / podzielników | 4 | Tysiące liczników w budynkach z różnymi terminami legalizacji i dostępnością lokatorów; nieudana akcja = powtórne objazdy i reklamacje wspólnot | Kampania wymiany w budynku: umawianie lokatorów na sloty + zamknięcie kompletności całego pionu/nieruchomości | Brak dedykowanego dla małych wykonawców; systemy producentów liczników | Kierownik małej firmy montersko-odczytowej dla wspólnot/spółdzielni/zarządców |
| serwis-aparatury-medycznej | Serwis aparatury medycznej i laboratoryjnej | 3 | Dziesiątki urządzeń z osobnymi paszportami i terminami; serwis ręcznie odtwarza historię i protokoły PN-EN 62353 (dot. też sprzętu dentystycznego i autoklawów) | Cyfrowy paszport urządzenia po QR: historia pomiarów, termin przeglądu, protokół podpisywany na miejscu | MMEwidencja NOVA, XEMI, CareControl po stronie placówki; strona serwisu cienka | Niezależny inżynier biomedyczny / właściciel małego pogwarancyjnego serwisu |
| serwis-basenow | Serwis basenów i technologii basenowej | 3 | Otwarcia/zamknięcia kumulują się w kilka tygodni; serwis musi pamiętać konfigurację instalacji, chemię, kolejność zaworów, zdjęcia stanu każdego obiektu | Procedura sezonowa basenu: checklista z konfiguracji konkretnej instalacji + dawki chemii + potrzebne części | Generyczne field-service, Feldi, Locatick; sezonowy (piki wiosna/jesień) | Instalator basenów rozwijający abonamentowy serwis kilkudziesięciu obiektów |

### Bezpieczeństwo i compliance (klaster inspekcyjny — inspekcje z terminem ważności)

| key | name | priority | pain | wedge_hint | saturation_note | operator_persona |
|---|---|---|---|---|---|---|
| przeglady-regalow | Przeglądy regałów magazynowych | 4 | Inspektor dokumentuje tysiące słupów/trawersów/uszkodzeń na planach magazynu, potem ręcznie śledzi naprawy i coroczne terminy | Mobilna mapa magazynu: uszkodzenie na konkretnym elemencie + zdjęcie + auto-status zielony/pomarańczowy/czerwony | PRSES Inspect, Playmatec pokrewne; reszta PDF/generyczne inspection | Doświadczony monter/inspektor regałów obsługujący magazyny niezależnie |
| inspekcje-placow-zabaw | Inspekcje placów zabaw i siłowni plenerowych | 4 | Kontrole rutynowe/funkcjonalne/roczne dla gmin, wspólnot, przedszkoli; zdjęcia usterek i normy ręcznie składane w raporty | Inspekcja urządzenia po QR z checklistą zależną od typu sprzętu + porównanie zdjęcia usterki przed/po naprawie | Playmatec; reszta Excel/generyczne inspection | Solo-inspektor bezpieczeństwa placów zabaw / mały wykonawca montujący urządzenia |
| przeglady-sprzetu-wysokosciowego | Przeglądy sprzętu chroniącego przed upadkiem (PPE) | 5 | Uprzęże, linki, urządzenia samohamowne, punkty kotwiczące mają osobne numery i terminy; karty sprzętu wciąż w segregatorach (dot. też drabin/podestów i zawiesi) | Skan QR/NFC — natychmiast status dopuszczenia, historia oględzin, powód wycofania; blokada dopuszczenia po terminie | Scafftag/Laddertag = tylko tagi; brak silnego SaaS PL | Instruktor pracy na wysokości / były specjalista dostawcy sprzętu na własnych inspekcjach |
| monitoring-legionella | Monitoring i badania Legionella w budynkach | 4 | Plany poboru próbek, punkty czerpalne, wyniki lab, działania naprawcze i rebadania w wielu hotelach/DPS/szpitalach/obiektach sportowych | Mapa instalacji z punktami poboru auto-układająca harmonogram badań + workflow działań naprawczych po przekroczeniu | LIMS obsługuje próbki, nie portfel obiektów i działań naprawczych | Ekspert instalacji wodnych/higieny lub lab uruchamiający wyspecjalizowaną usługę abonamentową |
| pomiary-srodowiska-pracy | Pomiary środowiska pracy (lab terenowe) | 3 | Częstotliwości pomiarów hałasu/pyłów/drgań/chemii pilnowane osobno dla każdego stanowiska; sprawozdania i przypomnienia ręcznie | Matryca stanowisko-czynnik auto-wyznaczająca termin następnego pomiaru i zakres zlecenia z ostatniego wyniku | LIMS/generyczne systemy lab; brak lekkiego SaaS dla ekip terenowych | Były pracownik lab akredytowanego prowadzący własną małą ekipę pomiarową |
| audyty-higieny-zywnosci | Audyty higieny i badania mikrobiologiczne żywności | 3 | Doradca/lab cyklicznie pobiera wymazy i próbki, pilnuje planów HACCP i działań korygujących w wielu lokalach; wyniki w osobnych PDF | Plan poboru przypisany do punktów na planie zakładu — po wyniku auto-otwiera działanie korygujące i termin rebadania | HACCP Pilot/POLHACCP (lokal), LIMS (lab); brak wspólnego workflow usługodawca-klient | Technolog żywności / były inspektor jakości z małą firmą audytową współpracującą z lab |

### Produkcja i rzemiosło (klaster: akceptacja wersji przed produkcją)

| key | name | priority | pain | wedge_hint | saturation_note | operator_persona |
|---|---|---|---|---|---|---|
| szklo-na-wymiar | Zakłady szklarskie / szkło na wymiar | 5 | Pomiary, rysunki, rodzaj szkła, obróbki, otwory krążą w zdjęciach i wiadomościach; pomyłka wersji = drogi element od nowa | Karta tafli z wymiarowanym rysunkiem + 1 przycisk akceptacji wersji przez klienta PRZED produkcją; kontrola jednostek/tolerancji | MonitGlass; CAD/ERP dla większych producentów | Właściciel rodzinnego zakładu (kabiny, lustra, balustrady, szkło kuchenne) |
| szyldy-reklamy-swietlne | Pracownie szyldów, kasetonów, reklam świetlnych | 4 | Jedno zlecenie ma wiele wizualizacji/wymiarów/wariantów podświetlenia; klient akceptuje inną wersję niż ta na produkcji | Portal akceptacji makiety na zdjęciu elewacji zamrażający zatwierdzoną wersję jako jedyny plik produkcyjny | iwarePrint/PrintFlow częściowo; brak dominującego dedykowanego | Właściciel małej pracowni reklamy wizualnej z ploterem/frezarką/montażem |
| haft-nadruki-odziez | Hafciarnie / znakowanie odzieży | 4 | Rozmiary, sztuki, kolory, techniki i wersje logo w arkuszach i wiadomościach; łatwo pomylić wariant w partii | Interaktywna matryca sztuka-rozmiar-kolor-nadruk z akceptacją próbki i zamrożeniem specyfikacji partii | iwarePrint częściowo; brak dla mikrohafciarni | Właściciel małej hafciarni/drukarni odzieżowej dla firm, klubów, szkół |
| grawer-personalizacja | Grawernie / personalizacja laserowa | 4 | Treści personalizacji dla wielu sztuk w mailach/Excelu; literówka lub zły egzemplarz = reklamacja całej partii | Walidator personalizacji per egzemplarz: klient zatwierdza podgląd każdej treści — zamknięta kolejka produkcyjna | Gravostyle steruje maszyną, nie obiegiem zlecenia | Właściciel pracowni laserowej (tabliczki, prezenty, identyfikatory, krótkie serie B2B) |
| drukarnie-etykiet-opakowania | Drukarnie etykiet i opakowań (krótkie serie) | 4 | Wiele wersji projektu/materiału/oznaczeń; trzeba udowodnić, która wersja i surowiec trafiły do partii; PPWR od 12.08.2026 podnosi wagę danych o materiale/recyklingu | Akceptacja zgodności przed drukiem: klient zatwierdza wersję etykiety z materiałem, ostrzeżeniami i deklaracjami opakowania | iwarePrint, PrintVis, ERP prepress; brak lekkiego SaaS; PPWR = świeży ból | Technolog/właściciel lokalnej drukarni cyfrowej obsługującej setki małych marek |
| konserwacja-obiektow | Konserwacja dzieł sztuki, antyków, zabytków | 4 | Każdy obiekt wymaga protokołu stanu, obszernej dokumentacji foto, etapów prac i zatwierdzania zmian zakresu — w folderach, Wordzie, mailach | Chronologiczna karta konserwatorska generująca dokumentację przed/w trakcie/po bez ręcznego układania zdjęć | Brak dedykowanego SaaS PL | Samodzielny konserwator / mała pracownia (kolekcjonerzy, parafie, instytucje) |
| hydraulika-silowa-regeneracja | Regeneracja hydrauliki siłowej | 4 | Siłownik/pompa trafia do rozbiórki bez identyfikacji, po której zmienia się zakres i cena; części i ustalenia trudno powiązać z podzespołem | Karta podzespołu z trwałym kodem, zdjęciami po rozbiórce i akceptacją kosztorysu regeneracji PRZED zamówieniem części | Brak dedykowanego dla małych; Integra Serwis/FSM | Właściciel warsztatu regeneracji siłowników/pomp/rozdzielaczy (budownictwo, rolnictwo, przemysł) |
| przezwajanie-silnikow | Przezwajanie silników / regeneracja pomp | 3 | Podobne silniki/pompy bez historii parametrów, uzwojenia, części i prób; klient oczekuje szybkiej decyzji po diagnozie | Cyfrowa metryka egzemplarza z przyjęcia, parametrów uzwojenia i końcowego protokołu testowego | Brak dedykowanego SaaS; generyczne serwisowe/ERP | Elektromechanik prowadzący mały zakład przezwajania i napraw pomp |
| wyroby-ortopedyczne-na-miare | Pracownie zaopatrzenia ortopedycznego na miarę | 3 | Skan/odlew, zalecenie, projekt, poprawki po przymiarce i wydanie w osobnych teczkach; e-zlecenie NFZ nie pokrywa procesu wykonawczego | Oś wykonania wyrobu łącząca skan, projekt, przymiarki, korekty i potwierdzenie wydania pacjentowi | NFZ e-zlecenie=refundacja; Posturologia.pl (wkładki) częściowo; proces wykonawczy = gap | Technik ortopeda z małą pracownią (wkładki, ortezy, protezy, obuwie) |

### Nieruchomości i administracja (NOWA)

| key | name | priority | pain | wedge_hint | saturation_note | operator_persona |
|---|---|---|---|---|---|---|
| zarzadzanie-najmem-dlugoterminowy | Firmy zarządzające najmem mieszkań | 4 | Przy zmianie najemcy ginie chronologia zdjęć, usterek, liczników, kluczy i potrąceń z kaucji — spory z najemcą i właścicielem | Mobilny protokół przejęcia/zdania lokalu z porównaniem zdjęć punkt po punkcie + auto-dossier potrąceń z kaucji | Rentumi, simpl.rent; moduł protokół/kaucja cienki | Właściciel małej firmy zarządzającej kilkudziesięcioma mieszkaniami dla inwestorów |
| zarzadcy-najmu-krotkiego | Operatorzy najmu krótkoterminowego | 4 | Rejestracja lokali, numery obiektów, wymogi ppoż/sanit, regulaminy i zgodność ogłoszeń na wielu platformach; unijne zasady udostępniania danych od 20.05.2026 | Paszport zgodności lokalu: 1 karta pilnująca numeru rejestracyjnego, dokumentów, terminów i publikacji poprawnego numeru we wszystkich kanałach | IdoBooking, Hotres, KWHotel = rezerwacje/channel; compliance gap; UE 2026 = świeży ból | Były city manager / operator 10-80 apartamentów sfrustrowany Excelem i zmianami prawa |
| facility-management-mikro | Mikrofirmy facility management | 4 | Obowiązki z umów najmu/polis/przeglądów/decyzji o różnych cyklach pilnowane w Excelu i kalendarzu | Macierz obowiązków obiektu auto-wyliczająca terminy + kompletny dowód wykonania każdego obowiązku dla właściciela | Singu FM, Planon, Archibus dla dużych portfeli; mikro cienki | Były techniczny zarządca prowadzący małą firmę FM dla kilku budynków |

### Zawody regulowane i finanse (NOWA)

| key | name | priority | pain | wedge_hint | saturation_note | operator_persona |
|---|---|---|---|---|---|---|
| posrednicy-nieruchomosci-aml | Biura pośrednictwa nieruchomości — AML | 4 | Dla transakcji trzeba dokumentować identyfikację klienta/beneficjenta, ocenę ryzyka, PEP, sankcje; CRM-y skupiają się na ofertach | Generator teczki AML transakcji: KYC + ocena ryzyka + wyniki sprawdzeń + uzasadnienie w 1 audytowalny PDF | ASARI/IMO/Virgo=oferty; iAML/SystemAML osobno; teczka transakcji=gap; presja egzekwowania AML | Samodzielny pośrednik / właściciel biura 2-5 agentów odpowiadający sam za AML |
| agencje-zatrudnienia-kraz | Agencje zatrudnienia (KRAZ) / pracy tymczasowej | 4 | Dane o skierowaniach/zatrudnieniach/cudzoziemcach do sprawozdawczości KRAZ zbierane osobno od ATS; nowe obowiązki jawności płac od 24.12.2025 | Licznik KRAZ zapisujący przy każdym kandydacie zdarzenie sprawozdawcze + karta zgodności skierowania blokująca zmianę przy braku dokumentu/stawki | HRappka, Traffit, enova = ATS; sprawozdawczość KRAZ = gap | Właściciel małej agencji rekrutacji/pracy tymczasowej dla jednej branży/regionu |
| agencje-ochrony | Małe agencje ochrony fizycznej / imprez | 4 | Obsada wymaga pilnowania list kwalifikowanych, badań, szkoleń, pozwoleń; w sezonie imprez trzeba w kilka dni zebrać kwalifikowaną obsadę i udokumentować obecność | Silnik dopuszczenia pracownika do posterunku blokujący grafik przy braku/wygaśnięciu wymaganego dokumentu lub niepokryciu planu zabezpieczenia | Generyczne workforce/guard-tour; brak lekkiego lidera compliance PL | Były kierownik/dowódca zmiany prowadzący lokalną agencję kilkunastu-kilkudziesięciu osób |

### Usługi profesjonalne (nowe wpisy v3)

| key | name | priority | pain | wedge_hint | saturation_note | operator_persona |
|---|---|---|---|---|---|---|
| biegli-sadowi | Biegli sądowi (praktyka indywidualna) | 4 | Postanowienia, akta, terminy opinii, wezwania, ewidencja godzin i rachunki z wielu sądów różnymi kanałami; przekroczenie terminu szkodzi reputacji | Rejestr zleceń sądowych odczytujący z postanowienia termin/pytania/zakres — po zakończeniu generuje zgodny rachunek z ewidencji pracy | OPINIA (ekspertyzy techniczne) niszowo; brak systemu operacyjnego dla biegłych | Doświadczony specjalista pracujący jako jednoosobowy biegły dla kilku sądów |
| mediatorzy-sadowi | Stali mediatorzy / centra mediacji | 3 | Równoległe sprawy z różnych sądów i od klientów prywatnych: terminy, bezstronność, zgody, protokoły, ugody, poufny obieg dokumentów | Kreator teczki mediacji generujący z 1 przebiegu zaproszenia, zgody, protokół, projekt ugody i pakiet zwrotny do sądu | Brak dedykowanego SaaS; generyczne kancelaryjne/kalendarze | Aktywny mediator (praktyka jednoosobowa / małe centrum) obsługujący kilka sądów |
| swiadectwa-audyty-energetyczne | Świadectwa i audyty energetyczne budynków | 3 | Obliczenia w programie i rejestrze gov, ale zebranie danych wejściowych/zdjęć/rzutów/oświadczeń od klienta wciąż mailem; audyt do dotacji wymaga wielu wersji i załączników | Portal zlecenia sprawdzający kompletność danych PRZED obliczeniami + checklista kompletności audytu zależna od programu finansowania | ArCADia-TERMOCAD, Audytor OZC = obliczenia; CRCEB gov; intake/kompletność = gap; EPBD/dotacje 2026 | Solo-inżynier / małe biuro seryjnie wykonujące świadectwa i audyty |
| pracownie-architektoniczne | Pracownie architektoniczne (formalności) | 3 | Mapy, warunki, uzgodnienia branżowe, decyzje i poprawki urzędu do skoordynowania; e-Budownictwo obsługuje złożenie, nie przygotowanie kompletnego pakietu | Mapa zależności formalnych projektu pokazująca brakujące uzgodnienia + auto-aktualizacja terminów po każdym wezwaniu urzędu | e-Budownictwo/SOPAB (gov); BIM/PM generyczny; koordynacja formalności = gap | Architekt prowadzący pracownię 1-5 os. samodzielnie koordynujący formalności |

### Logistyka i handel / Budownictwo i dom / Turystyka / Rolnictwo i zieleń (nowe wpisy v3)

| key | name | kategoria | priority | pain | wedge_hint | saturation_note | operator_persona |
|---|---|---|---|---|---|---|---|
| operatorzy-vendingu | Operatorzy automatów vendingowych | Logistyka i handel | 4 | Rozwóz i rozliczenie na setkach maszyn; system kaucyjny od 1.10.2025 komplikuje ceny, ewidencję opakowań i rozrachunki kaucji | Rozliczenie kaucji per automat i trasa: porównanie zatowarowania, sprzedaży i należnej kaucji bez przebudowy telemetrii | Nayax/Televend = telemetria; kaucja = gap i świeży ból | Właściciel regionalnej firmy z 30-300 automatami w biurach/szkołach/zakładach |
| przewoznicy-autokarowi | Przewoźnicy autokarowi / wynajem autobusów | Logistyka i handel | 4 | Wycieczki/wesela/wakacje = ostre piki; jedna realizacja wymaga pojazdu, kierowców, czasu pracy, listy pasażerów, parkingów i częstych zmian godzin | Karta wyjazdu grupowego udostępniana 1 linkiem kierowcy/organizatorowi/opiekunom z zawsze aktualną godziną, miejscem i numerem autokaru | Softra, fireTMS = TMS; brak prostego produktu dla mikroprzewoźników grupowych | Właściciel 2-10 autokarów sam sprzedający przejazdy i układający grafik |
| oslony-okienne-markizy | Producenci/monterzy rolet, żaluzji, markiz, pergoli | Budownictwo i dom | 4 | Pomiar robi monter, wycenę biuro, produkcję warsztat; ręczne przepisywanie wymiarów i wariantów = pomyłki i powtórne wizyty | Mobilny protokół pomiarowy, który po podpisie klienta staje się nieedytowalną kartą produkcyjną i montażową | Stolcad Professional, VINCENT dla producentów; mikro pomiar-produkcja = gap; sezonowy (szczyt wiosna-lato) | Właściciel lokalnej firmy mierzącej/produkującej/montującej osłony i markizy na wymiar |
| kempingi-camper-parki | Kempingi, camper parki, pola namiotowe | Turystyka | 3 | W wakacyjne weekendy trzeba na jednej mapie upchnąć kampery/przyczepy/namioty o różnych wymiarach, pilnując prądu, sanitariatów, przyjazdów bez rezerwacji | Tetris parcelowy: auto-rozmieszczenie rezerwacji wg wymiarów zestawu i infrastruktury, minimalizujące luki | Connect Camp, KWHotel; zagraniczne PMS kempingowe; sezonowy (lato) | Właściciel rodzinnego pola / manager małego camper parku w miejscowości turystycznej |
| zimowe-utrzymanie | Firmy zimowego utrzymania terenów | Rolnictwo i zieleń | 3 | Przy opadach wszystkie kontrakty ruszają naraz; trzeba dysponować pojazdy wg priorytetów i udowodnić klientowi godzinę przejazdu, posypania i zużycie materiału | Dowód wykonania kontraktu: auto-oś czasu z GPS, zdjęciami przed/po i warunkami pogodowymi dla każdego obiektu | Generyczne GPS/TMS/field-service; brak lidera wertykalnego; sezonowy (zima; sprzedaż VIII-XI) | Właściciel kilku pługopiaskarek / firmy łączącej sezonowo utrzymanie terenów |

## PLAN FAL PROSPECTINGU

Fala = kolejność odzywania się (kolumna `wfp_verticals.wave`), nie ranking wartości: 1 = start,
2 = po wnioskach z fali 1, 3 = później, NULL = bez przydziału. Przydział migracją
`20260723c_wfp_v3_seed_fal.sql`. **Stan: fala 1 = 6, fala 2 = 9, fala 3 = 72, bez fali = 53.**

### Fala 1 — start VIII-IX 2026 (6 wertykali)
Kryterium doboru (z migracji): 6 RÓŻNYCH kategorii, sezonowość neutralna, persona osiągalna mailem,
niska saturacja — najczystszy sygnał do pierwszej partii testowej.

| key | kategoria | uzasadnienie |
|---|---|---|
| firmy-ddd | Usługi profesjonalne | P5; przymus dokumentacji HACCP/IFS/BRC na audyty klienta = silny cykliczny ból; pustka software'owa; technik DDD osiągalny. |
| szklo-na-wymiar | Produkcja i rzemiosło | P5; pomyłka wersji = drogi element od nowa → akceptacja wersji przed produkcją to twardy ROI; rodzinny zakład = jasna persona. |
| serwis-oczyszczalni-przydomowych | Serwis techniczny i instalacje | P5; paszport egzemplarza zamienia bazę montaży w powtarzalny przychód serwisowy; instalator = klarowna persona; sezonowość neutralna. |
| asenizacja | Logistyka i handel | Obowiązki sprawozdawcze gminne = przymus; brak dedykowanego; właściciel beczkowozu prosty do namierzenia. |
| biegli-sadowi | Usługi profesjonalne | P4; brak systemu operacyjnego dla biegłych; terminy opinii + rachunki z ewidencji = ból reputacyjny; jednoosobowa praktyka = idealna persona eksperta. |
| cukiernie-torty | Gastronomia | Zeszyt + Messenger jako status quo; zamówienia z terminem/zadatkiem/kolizją = codzienny ból; cukiernik-marka osiągalny. |

### Fala 2 — po wnioskach z fali 1 (9 wertykali)
Kryterium: dywersyfikacja kategorii + świeżość prawna + okna sezonowe (zimowe-utrzymanie sprzedaje
się PRZED zimą, osłony/DJ-e po sezonie). **Report-first** (najpierw raport wedge, dopiero potem
prospecting): `monitoring-legionella`, `posrednicy-nieruchomosci-aml`, `bhp-outsourcing`.

| key | kategoria | uzasadnienie / uwaga |
|---|---|---|
| pracownie-protetyczne | Produkcja i rzemiosło | P4 (v2); obieg zleceń gabinet→lab; brak dominującego PL. |
| serwis-fotowoltaiki | Serwis techniczny i instalacje | Fala posprzedażowa po boomie PV; paszport instalacji; niezależny serwis wielu marek. |
| monitoring-legionella | Bezpieczeństwo i compliance | **report-first**; LIMS obsługuje próbki, nie portfel obiektów i działań naprawczych. |
| posrednicy-nieruchomosci-aml | Zawody regulowane i finanse | **report-first**; presja egzekwowania AML; teczka transakcji = gap obok CRM ofertowych. |
| operatorzy-vendingu | Logistyka i handel | Świeży ból: system kaucyjny od 1.10.2025; rozliczenie kaucji per automat/trasa. |
| zespoly-dj-weselni | Eventy i kreatywni | Okno sezonowe — odzywać się PO sezonie weselnym; double-booking + zadatki. |
| oslony-okienne-markizy | Budownictwo i dom | Sezonowy (szczyt wiosna-lato) — po sezonie; protokół pomiarowy → nieedytowalna karta produkcyjna. |
| zimowe-utrzymanie | Rolnictwo i zieleń | Sezonowy — **sprzedaż VIII-XI (PRZED zimą)**; dowód wykonania kontraktu z GPS/foto. |
| bhp-outsourcing | Bezpieczeństwo i compliance | **report-first**; rynek rozdrobniony z kilkoma graczami; wedge = rejestr ważności szkoleń/badań per pracownik klienta. |

### Fala 3 — reszta wartościowych, P3-P5 (72 wertykale)
Na początek fali: `przeglady-sprzetu-wysokosciowego` (P5). Skład: 29 nowych nisz v3 + 43 istniejące
z katalogu v2.

- **Nowe v3 (29):** serwis-chlodnictwa-fgaz, serwis-wag-legalizacja, serwis-uzdatniania-wody,
  serwis-opomiarowania, serwis-aparatury-medycznej, serwis-basenow, przeglady-regalow,
  inspekcje-placow-zabaw, przeglady-sprzetu-wysokosciowego, pomiary-srodowiska-pracy,
  audyty-higieny-zywnosci, szyldy-reklamy-swietlne, haft-nadruki-odziez, grawer-personalizacja,
  drukarnie-etykiet-opakowania, konserwacja-obiektow, hydraulika-silowa-regeneracja,
  przezwajanie-silnikow, wyroby-ortopedyczne-na-miare, zarzadzanie-najmem-dlugoterminowy,
  zarzadcy-najmu-krotkiego, facility-management-mikro, agencje-zatrudnienia-kraz, agencje-ochrony,
  mediatorzy-sadowi, swiadectwa-audyty-energetyczne, pracownie-architektoniczne,
  przewoznicy-autokarowi, kempingi-camper-parki.
- **Istniejące z katalogu v2 (43):** stolarnia-na-wymiar, nadzor-budowlany, serwis-udt,
  wynajem-sprzetu-eventowego, pielegnacja-zieleni, szkolki-roslin, kamieniarstwo, kominiarstwo,
  obozy-kolonie, brukarstwo, dekarstwo, remonty-wykonczenia, bramy-ogrodzenia,
  instalacje-elektryczne, projektowanie-wnetrz, przeglady-budynkow, studia-tatuazu, podologia,
  logopedia, psychoterapia, przechowalnia-opon, laweta-pomoc-drogowa, detailing, geodeci,
  fotografia-slubna, wedding-planner, wypozyczalnia-sukni, dmuchance-animatorzy, kwiaciarnie,
  catering-eventowy, uslugi-rolnicze, pracownie-krawieckie, przeprowadzki, odpady-bdo, pralnie,
  wypozyczalnie-sprzetu, serwis-gsm, szkoly-narciarskie, wypozyczalnie-wodne, hotele-dla-zwierzat,
  piekarnie-rzemieslnicze, organizatorzy-eventow-firmowych, serwis-kotlow-gazowych.

### Bez fali — wave NULL (53 wertykale)
- **P1-P2 z katalogu v2** — rynki zajęte lub o niskiej willingness-to-pay (np. serwis-komputerowy,
  gabinet-fizjoterapii, dietetycy, gabinety-beauty, warsztat-samochodowy, osk-szkoly-jazdy,
  kancelarie-prawne, kosztorysanci, agencje-marketingowe, zlobki-przedszkola, szkoly-jezykowe,
  akademie-sportowe, transport-tsl, trenerzy-personalni, weterynaria, groomerzy,
  catering-dietetyczny, restauracje-pos, pensjonaty-male, zaklady-pogrzebowe, serwis-rowerowy).
  Pod v3 mają status `'katalogowy'` (już NIE `'odrzucony'`) — **re-badanie nowym promptem
  wedge-obok-lidera dozwolone**, mogą awansować do fali po pozytywnym raporcie.
- **firmy-ppoz** — raport branżowy **NO_GO 12/24** (dedykowani gracze: gasnica-control.pl,
  ppozmanager.pl, techpres, qrsystem). Świadoma decyzja po badaniu; status `'zbadany'` verdict
  no_go; bez fali. Re-badanie nowym promptem możliwe.

## WEDGE OBOK LIDERA — 5 wzorców myślenia

**Reguła generalna (sekcja C researchu, wpisana do promptu `wfp_prompt_vertical`):** obecność
dużego lub dedykowanego dostawcy oprogramowania NIE dyskwalifikuje branży. Lider zawsze zostawia
luki — zadaniem jest AKTYWNIE znaleźć **wedge obok lidera**: mniejszą, ale ważną funkcję/proces,
którego lider nie robi wcale albo robi źle (specyficzna dokumentacja, zgody, cykliczne terminy,
artefakt branżowy, rozliczenia niszowe), i wokół której da się zbudować całe narzędzie. NO_GO
dopiero, gdy po realnym zbadaniu konkurencji wedge'a naprawdę nie ma.

1. **Beauty — Booksy (rezerwacje).** Wedge NIE jest kalendarzem. Booksy umawia wizytę, ale nie
   posiada **dokumentacji zabiegowej kosmetologii estetycznej**: karta skóry z foto przed/po,
   cyfrowe zgody i patch-testy (kwasy, mezoterapia), plan pielęgnacyjny i przypomnienia o powtórce
   zabiegu. → Narzędzie „karta zabiegu + zgody zdrowotne + silnik retencji (rebooking)" wokół tego,
   czego Booksy nie dotyka. (Analogicznie `groomerzy`: kartoteka pupila — cykl strzyżeń,
   temperament, alergie, foto fryzur — obok rezerwacji Booksy.)
2. **Warsztaty samochodowe — Integra/mpWarsztat/Motowarsztat (zlecenia+magazyn).** Software
   obsługuje wnętrze warsztatu; słaba jest **komunikacja z klientem i zaufanie**: status naprawy
   + wideo-inspekcja usterki + **zdalna akceptacja rozszerzonego zakresu** (jak w blacharni
   bezgotówkowej). Wedge = redukcja sporów i wyższy up-sell przez cyfrową akceptację — plus silnik
   przypomnień o przeglądzie/OC wg przebiegu (retencja). Buduj wokół „klient widzi i zatwierdza",
   nie wokół zlecenia.
3. **Weterynaria — VetFile/Lecznica-3000/Vetoteka (EDM).** Wedge NIE jest kartoteką medyczną
   (zabetonowana, EDM wymóg). Luka = **strona właściciela**: cyfrowa książeczka zdrowia dostępna
   dla właściciela, przypomnienia o szczepieniach/odrobaczaniu/profilaktyce, triaż teleporady,
   kanał komunikacji właściciel↔lecznica. Wedge = zaangażowanie i retencja właściciela (owner-app)
   obok kliniki — lecznica kupuje „mniej no-show na profilaktyce".
4. **Catering — Caterings.pl/niceGastro/bs4 (pudełkowy/dietetyczny).** Software dietetyczny
   obsługuje subskrypcje i produkcję powtarzalnych diet. Nie robi **cateringu eventowego/
   bankietowego**: wycena menu per liczba gości, karta eventu z logistyką obsługi i harmonogramem
   dnia. Wedge = przenieść ciężar z „produkcja diety" na „wycena i koordynacja jednorazowego
   eventu na wesele/firmę" — inny artefakt (event), którego lider pudełkowy nie ma.
5. **Studia tatuażu — Booksy (rezerwacja+zadatek).** Booksy bierze zadatek i termin, ale nie robi
   **cyfrowych zgód zdrowotnych + ankiety przeciwwskazań + galerii wieloetapowego projektu**
   (sesje, gojenie, poprawki). Wedge = „zgody + portfolio projektu klienta" — dokumentacja
   zdrowotna wymagana przy tatuażu/piercingu, której rezerwacyjny lider strukturalnie nie
   obsługuje. (Ten sam schemat stosuj do `podologia`: karta stopy z foto przed/po + cykl wizyt
   obok rezerwacji Booksy.)

**Reguła generalna:** obecność lidera rezerwacji/EDM/ERP = sygnał, że rdzeń TRANSAKCYJNY jest
zajęty → szukaj **artefaktu, którego lider nie posiada** (dokumentacja / zgody / dowód wykonania /
paszport urządzenia / akceptacja wersji) i zbuduj całe narzędzie wokół niego. To dokładnie
mechanika /sparingu.

## Model działania modułu wertykali (SSOT logiki — patrz też PROSPEKTOR-PLAN.md CZĘŚĆ II)

Cykl życia: `katalogowy → w_badaniu → zbadany —(GO)→ w_prospectingu → w_grze → zajety`
oraz `—(NO_GO)→ odrzucony` (+ `wstrzymany`; re-badanie odrzuconych po N mies. możliwe).
Raport branżowy AI (akcja `vertical_research`) = BRAMKA przed prospectingiem: 8 sekcji
(rynek PL / decydent / ból zweryfikowany / konkurencja z NAZWAMI / regulacje / wedge+ekonomia /
persona+gdzie szukać / werdykt GO-NO_GO + score). Scoring 6 osi (0-2 pkt): fragmentacja×2,
saturacja×3, siła bólu×2, willingness-to-pay×2, persona operatora×2, wedge clarity×1.
Twarde NO_GO (v3): brak osiągalnej persony / po realnym zbadaniu konkurencji NIE DA SIĘ wskazać
wedge'a / rdzeń pokryty systemem rządowym (CEPiK/eWniosekPlus/EKOB/CEEB) bez miejsca na warstwę
OPS / ekonomia pokrycia nie spina się nawet optymistycznie (~30+ płacących przy realnym pokryciu).
**Sam dedykowany lider NIGDY nie jest powodem NO_GO** — najpierw szukamy wedge'a obok lidera
(FILOZOFIA v3 wyżej). **Mała liczba firm NIGDY nie jest samodzielnym powodem NO_GO** — liczy się
ekonomia pokrycia (FILOZOFIA MAŁEGO RYNKU wyżej; sztywny próg „<2000 firm" USUNIĘTY 23.07 decyzją
Tomka). W razie wątpliwości „go" z niższym score, decyduje człowiek.
Zasady: nie badać wszystkich naraz (na żądanie wg priority); generyk field-service ≠ zajęte
(to sygnał bólu — szansa na dedykowany wedge); jeden wertykal = jeden operator (zajety blokuje
prospecting); raporty się starzeją — re-badanie dozwolone.
