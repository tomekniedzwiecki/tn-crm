# PROSPEKTOR — katalog wertykali (research 2026-07-23)

> Źródło seedu migracji `20260723a_wfp_v2.sql` i punkt odniesienia. Research Opus + WebSearch
> (saturacje `[zweryf.]` potwierdzone wyszukiwarką; reszta = ocena ekspercka do potwierdzenia
> raportem branżowym per wertykal — akcja `vertical_research`).
> KLUCZOWE ODKRYCIE: ~80% „oczywistych" nisz operacyjnych jest już zajętych przez tanie polskie
> produkty; wolne pasma = **compliance/dokumentacja z cyklicznym terminem** oraz **koordynacja
> wokół specyficznego artefaktu branżowego**. Wpisy priority 1 = świadomy rejestr „tu NIE
> idziemy i dlaczego" (wartość katalogu, nie balast).

Kolumny: key · name · pain · wedge_hint · saturation (+nota) · priority 1-5 (5=strzelaj najpierw) · operator_persona

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

## Model działania modułu wertykali (SSOT logiki — patrz też PROSPEKTOR-PLAN.md CZĘŚĆ II)

Cykl życia: `katalogowy → w_badaniu → zbadany —(GO)→ w_prospectingu → w_grze → zajety`
oraz `—(NO_GO)→ odrzucony` (+ `wstrzymany`; re-badanie odrzuconych po N mies. możliwe).
Raport branżowy AI (akcja `vertical_research`) = BRAMKA przed prospectingiem: 8 sekcji
(rynek PL / decydent / ból zweryfikowany / konkurencja z NAZWAMI / regulacje / wedge+ekonomia /
persona+gdzie szukać / werdykt GO-NO_GO + score). Scoring 6 osi (0-2 pkt): fragmentacja×2,
saturacja×3, siła bólu×2, willingness-to-pay×2, persona operatora×2, wedge clarity×1.
Twarde NO_GO: dedykowany lider / rynek <2000 firm / brak osiągalnej persony / rdzeń pokryty
systemem rządowym (CEPiK/eWniosekPlus/EKOB/CEEB) bez miejsca na warstwę OPS.
Zasady: nie badać wszystkich naraz (na żądanie wg priority); generyk field-service ≠ zajęte
(to sygnał bólu — szansa na dedykowany wedge); jeden wertykal = jeden operator (zajety blokuje
prospecting); raporty się starzeją — re-badanie dozwolone.
