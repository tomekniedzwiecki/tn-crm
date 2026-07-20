# Research cenowy — konkurencja i substytuty

**Produkt:** SaaS dla średnich firm budowlanych (podwykonawcy w zamówieniach publicznych) — analiza projektu umowy podwykonawczej vs Kontrakt Główny + KC/PZP, raport kontrolny PDF (kary, waloryzacja, terminy płatności, zatrzymania, pay-when-paid). NIE opinia prawna.
**Data:** 2026-07-20. Kursy pomocnicze: 1 EUR ≈ 4,3 zł, 1 USD ≈ 4,0 zł, 1 CHF ≈ 4,5 zł.
**Uwaga metodologiczna:** ceny netto/brutto podane tak, jak deklarują źródła. Polskie kancelarie i doradcy budowlani masowo NIE publikują cen ("zapytaj o wycenę") — to samo w sobie jest ustaleniem (nietransparentność = nasza przewaga: stała cena + raport w minuty).

---

## Konkurencja bezpośrednia

Kluczowy fakt: **żadne z realnie istniejących polskich narzędzi nie jest wyspecjalizowane w back-to-back analizie umów podwykonawczych w reżimie PZP/KC.** Wszystkie są generyczne ("AI prawnik" / analiza dowolnej umowy) albo to CLM (obieg/podpis), nie analizator ryzyk. To potwierdza lukę z market_report.

| Narzędzie | Co robi | Cena | Model | Źródło |
|---|---|---|---|---|
| **AI Prawnik** (aiprawnik.pro) | Analiza umów + pisma prawne, po polsku, "w 2 min" | **od 99 zł/mies** | abonament, bez umów długoterminowych | https://aiprawnik.pro/ |
| **LEX AI** (lexai.pl) | Analiza umów, research; pdf/docx/txt + skany; "nie zastępuje radcy" | **120 zł/mies** (7-dniowy trial) | abonament | https://lexai.pl/ |
| **LEX Expert AI** (Wolters Kluwer) | Chat oparty wyłącznie na zasobach LEX (komentarze, orzeczenia) | **od 119 zł/mies** (w ramach subskrypcji LEX) | abonament dodatek do LEX | https://lexedit.ai/pl/blog/ai-dla-prawnikow-narzedzia-zastosowania |
| **SmartPrawnik** (smartprawnik.pl) | Ogólny asystent prawny AI, audyt umów | **od ~79 zł/dokument** | per-analiza | https://smartprawnik.pl/ (za market_report) |
| **LexTool** (lextool.pl) | Analiza dokumentów: kluczowe postanowienia, ryzyka, podsumowanie + lista kwestii | brak jawnej ceny | abonament (dla kancelarii) | https://www.lextool.pl/ai-dla-prawnikow |
| **Kancelaria.ai** | Analiza umów z AI, ocena ryzyka online | brak jawnej ceny | — | https://kancelaria.ai/ |
| **Umownik** (umownik.pl) | CLM: tworzenie/podpis/obieg umów. **AI-analiza klauzul dopiero planowana na 2026 — jeszcze nie działa** | **300 zł netto/mies** (1 twórca); kwartalnie 225 zł netto/mies | abonament per-twórca + ~400 zł wdrożenie wzoru | https://www.umownik.pl/cennik/ |
| **SoftwareStudio — Asystent umów AI** | LLM: odpowiedzi o terminach płatności, karach, gwarancjach z dokumentacji | brak jawnej ceny (wdrożenie firmowe) | projekt/custom | https://www.softwarestudio.com.pl/sztuczna-inteligencja/.../asystent-umow-z-ai/ |
| **Lexilio / Mason / FairBuild** (zagr., budowlane) | Conflict report subcontract vs main contract, obligation register, risk dashboard — DOKŁADNIE nasz use-case, ale US/UK/AU, bez PL/KC/PZP | brak cennika, "request demo" | enterprise/custom | https://lexilio.co/platform · https://www.masonqs.com/ · https://fairbuild.ai/ |

**Wniosek z tabeli:** polska "podłoga commodity" za generyczną analizę umowy AI to **99–120 zł/mies**. Nikt nie robi porównania umowy głównej z podwykonawczą pod PZP. Zagraniczne narzędzia budowlane robią to samo co my — ale są niedostępne cenowo i prawnie dla polskiego wykonawcy (patrz niżej).

---

## Zagraniczne contract review AI (kotwica górna — segment enterprise)

| Narzędzie | Cena wejściowa | Model | Uwagi | Źródło |
|---|---|---|---|---|
| **Spellbook** | **~$99/user/mies** (entry) → ~$149 (pro, annual) → **$199–350/user/mies** (enterprise, min 10 stanowisk, min 6 mies.) | per user/mies | podniósł ceny końcem 2025 (enterprise do ~$350) | https://spellbook.com/learn/lawgeex-pricing · https://www.hyperstart.com/blog/spellbook-pricing/ |
| **Legartis** | **Professional CHF 2 500/user/rok**, Team CHF 3 000/user/rok (≈ 11–13,5 tys. zł/user/rok) | per user/rok | jedyny z jawnym cennikiem per-user; jest tier Free i Enterprise | https://www.legartis.ai/ai-packages · https://www.saasworthy.com/product/legartis-ai/pricing |
| **LawGeex** | **~$75 000/rok** (1 typ umowy, 5 userów, wdrożenie, playbook) — dane z 2021 (Forrester TEI) | enterprise flat | **nie sprzedaje nowym klientom** (biznes sprzedany 2023) | https://spellbook.com/learn/lawgeex-pricing |
| **Luminance** | brak jawnych cen; enterprise, długie wdrożenia | enterprise/custom | dla dużych zespołów, M&A | https://www.luminance.com/ · https://www.eesel.ai/blog/luminance-ai-review |
| **Ivo** | brak jawnej ceny; review + redline w Word | per user (custom) | konkurent Spellbook | https://www.spellbook.legal/vs/ivo |
| **DocJuris** | brak jawnej ceny | enterprise/custom | — | (brak publicznego cennika) |

**Wniosek:** realna dolna półka zagranicznego SMB-tooling = **Spellbook ~$99/user/mies ≈ 400 zł/user/mies**. Reszta to enterprise (dziesiątki tys. zł/rok). Dla polskiego średniego wykonawcy **cała ta półka jest poza zasięgiem** — pełni tylko rolę kotwicy "na Zachodzie za to samo płaci się 400 zł/user/mies i więcej".

---

## Substytuty i kotwice cenowe

### a) Godzina prawnika / radcy (dzisiejsze obejście: "wyślę do prawnika")
- Stawka godzinowa: **od 250 zł netto**; typowo **400 zł + 23% VAT/h**; spotykane od 246 zł brutto/h.
- Konsultacja: 30 min ~250 zł, do 1h ~400–500 zł.
- Źródła: https://kancelariaproksa.pl/cennik-radcy-prawnego-koszty-uslugi-prawne-2025/ · https://prawnikpoznanski.pl/cennik-uslug/ · https://linke.pl/cennik/

### b) Analiza pojedynczej umowy — ryczałt (najbliższy substytut)
- **SwiadomyPodpis.pl**: podstawowa **od 249 zł brutto**, rozszerzona **od 349 zł brutto** (korekta zapisów + konsultacja) — ale to cena dla umów **~2–3 strony**. Wielostronicowy kontrakt budowlany = wycena indywidualna. Źródło: https://swiadomypodpis.pl/cennik
- **Analiza umowy budowlanej / podwykonawczej przez wyspecjalizowaną kancelarię** (LexInvest, ProVis/umowyrobotybudowlane): **cena NIEpublikowana — "zapytaj o wycenę"**. Zakres pokrywa dokładnie nasze pola (zakres robót, wynagrodzenie, terminy, kary, odpowiedzialność, odbiory). Nietransparentność + wielostronicowość kontraktu = realnie **znacznie powyżej 349 zł za dokument** (rząd 1–3 tys. zł za poważny kontrakt to typowa praktyka rynkowa dla dedykowanej analizy).
  - Źródła: https://www.lexinvest.pl/analiza-umowy-o-podwykonawstwo-na-roboty-budowlane/ · https://umowyrobotybudowlane.pl/analiza-kontraktu-budowlanego/ · https://swiadomypodpis.pl/budowa

### c) Systemy informacji prawnej (kotwica "narzędzia prawne dla firm")
- **LEX (Wolters Kluwer)**: LEX Dział Prawny **od 103,20 zł netto/mies**; LEX Kancelaria Prawna **od 282,60 zł netto/mies**; formuła miesięczna bez długich umów. Źródło: https://www.lex.pl/
- **Legalis**: znaleziona oferta **460–560 zł brutto/rok** — ale to **cena stowarzyszeniowa (min. 10 dostępów)**, NIE standard komercyjny (komercyjny Legalis dla kancelarii/firm to realnie kilka tys. zł/rok). Traktować ostrożnie. Źródło: https://srm.com.pl/aktualnosci/legalis.html

### d) Doradcy przetargowi / monitoring przetargów (abonamenty branżowe)
- **Ofertis** (monitoring przetargów): **350 zł netto/mies (12 mies.)**, 420 zł (6 mies.), 480 zł (3 mies.); 14 dni trial. Źródło: https://ofertis.pl/abonament/
- **Kontrakt24** (pomoc/doradztwo przetargowe dla wykonawców): oferuje abonament, **cena niepublikowana**. Źródło: https://kontrakt24.com.pl/

**Wniosek z substytutów:** firmowy abonament "narzędzia prawnego/przetargowego" w tej branży żyje realnie w widełkach **~100–480 zł/mies** (LEX 103–282; Ofertis 350–480). Jednorazowa analiza umowy = **249–349 zł za prostą, wielokrotnie więcej za budowlaną**. To jest realna rama cenowa, w której klient już dziś podejmuje decyzje zakupowe.

---

## Co płaci branża budowlana za SaaS (wrażliwość cenowa)

| Narzędzie | Kategoria | Cena | Model | Źródło |
|---|---|---|---|---|
| **Norma EXPERT** (Athenasoft) | Kosztorysowanie | **~6 390 zł netto** (1. stanowisko + Intercenbud); z roczną aktualizacją **~7 790 zł netto** | licencja + aktualizacje (klucz programowy) | https://kosztorysowe.komako.pl/cennik-norma.html · https://alatea.pl/pliki/cenniki/cenniknorma.htm |
| **PlanRadar** | Zarządzanie budową / usterki | Basic **€26**, Starter **€89**, Pro **€129**/user/mies (mies.); rocznie €29/€99/€149 (≈ **110–640 zł/user/mies**) | per user/mies; podwykonawcy/watcherzy gratis | https://www.planradar.com/us/pricing/ |
| **Archdesk** | ERP/zarządzanie budową | cena niepublikowana; **per-user LUB od rocznej objętości budowy** (unlimited users) | custom quote | https://archdesk.com/pricing |
| **Ofertis** | Monitoring przetargów | 350–480 zł netto/mies | abonament firmowy | https://ofertis.pl/abonament/ |

**Wniosek:** branża budowlana **płaci za software** i akceptuje różne modele:
- narzędzie krytyczne, jednorazowo drogie (kosztorysowanie ~6–8 tys. zł) — bez oporów, bo bez niego nie da się startować w przetargach;
- SaaS operacyjny per-user **~110–640 zł/user/mies** (PlanRadar);
- abonament firmowy **~350–480 zł/mies** (monitoring).
Próg akceptacji abonamentu rzędu **kilkuset zł/mies za firmę jest w tej branży normą**, nie barierą.

---

## Ile kosztuje błąd (argumentacja value-based)

Fakty ze źródeł — do komunikacji "abonament = ułamek ryzyka na jednym kontrakcie":
- **Kary umowne:** typowo **0,1–0,3% wynagrodzenia** za dzień/zdarzenie; **łączny limit kar 10% netto do 30% brutto** wynagrodzenia (art. 436 PZP wymusza określenie maksymalnego pułapu). Źródła: https://legalnabudowa.pl/wysokosc-kar-umownych-w-umowach-o-roboty-budowlane · https://zamowieniapubliczne.bieluk.pl/jaki-powinien-byc-maksymalny-dopuszczalny-poziom-kar-umownych/ · https://szkolenia.przetargipubliczne.pl/blog/limit-kar-umownych/
- **Zatrzymania / kaucja gwarancyjna:** standardowo **5–20% wynagrodzenia**; typowo 10% zabezpieczenia + **5% zatrzymania z każdej faktury** na rękojmię/gwarancję. Źródła: https://kancelaria-szip.pl/strefa-wiedzy/artykul/kaucja-gwarancyjna-a-kwota-zatrzymana/ · https://doradztwoprawne.org/2016/10/kaucja-a-zatrzymanie-czesci-wynagrodzenia-w-robotach-budowlanych/
- **Terminy płatności podwykonawcy:** **max 30 dni** od doręczenia faktury (art. 436/143b PZP) — może być skrócony, nie wydłużony. Źródła: https://dsk-kancelaria.pl/blog/platnosc-wynagrodzenia-na-rzecz-podwykonawcy-30-dni.../ · https://www.portalzp.pl/realizacja-umowy/termin-platnosci-podwykonawcom-moze-byc-krotszy-niz-30-dni-1575.html
- **Waloryzacja (art. 439 PZP):** obowiązkowa klauzula waloryzacyjna; wykonawca ma ustawowy obowiązek przenieść waloryzację na podwykonawcę odpowiednio do zmian cen materiałów/kosztów — brak tego zapisu w umowie podwykonawczej = realna strata przy wzroście cen. Źródło: https://ekomentarzpzp.uzp.gov.pl/prawo-zamowien-publicznych/art-439

**Skala liczbowa (do landingu/oferty):** na kontrakcie podwykonawczym 1 mln zł limit kar 10–30% = **100–300 tys. zł** ekspozycji, a zatrzymanie 5–10% = **50–100 tys. zł zamrożonego cash-flow**. Abonament kilkuset zł/mies to **ułamek promila** tej ekspozycji — mocna narracja value-based.

---

## Wnioski kotwicowe

1. **Sufit (górna kotwica) jest wysoki, ale „miękki".** Zagraniczne odpowiedniki naszego use-case (Spellbook ~$99–350/user/mies, Legartis ~11–13 tys. zł/user/rok, LawGeex ~$75k/rok) oraz koszt dedykowanej analizy kancelaryjnej budowlanej (wielostronicowy kontrakt = realnie 1–3 tys. zł za dokument, przy nietransparentnym "zapytaj o wycenę") pozwalają uzasadnić cenę znacznie powyżej generycznego AI. ALE to kotwica narracyjna, nie cennik — polski wykonawca tyle nie zapłaci masowo.

2. **Podłoga to 99–120 zł/mies** — cena generycznych polskich "AI prawników" (AI Prawnik 99, LEX AI 120). Nasz produkt jest wyspecjalizowany (back-to-back PZP/KC), więc **musi** być powyżej tej podłogi, ale **nie może być pozycjonowany ani wyceniony jak "kolejny AI-prawnik za 99 zł"** — inaczej kotwica commodity ściągnie percepcję wartości w dół.

3. **Realna rama abonamentu firmowego: 199–499 zł/mies.** Spójna z tym, co branża już płaci (LEX 103–282 zł/mies, Ofertis 350–480 zł/mies, Umownik 300 zł/mies) i z market_report. Płatnik = właściciel/menedżer kontraktów (1–3 osoby), więc **model per-firma, nie per-user** — per-user (styl PlanRadar/Spellbook) tu nie pasuje, bo decydentów jest niewielu, a licząc stanowiska przegramy z prostotą.

4. **Dodaj wejście per-dokument: ~249–399 zł za pojedynczy raport.** To bije dokładnie w kotwicę "analiza umowy przez kancelarię" (249–349 zł za prostą, drożej i wolniej za budowlaną) i daje niski próg / trial przed abonamentem. Przewaga sprzedażowa: **stała, przewidywalna cena i raport w minuty** kontra kancelaryjne "zapytaj o wycenę" + dni oczekiwania.

5. **Sensowna struktura = hybryda z 2–3 tierami + value-based narracja:**
   - **Per-dokument / wejście:** 249–399 zł za raport (trial, jednorazowi).
   - **Abonament Standard:** ~299–499 zł/mies za firmę (nielimitowane/pakiet raportów, podstawowe flagi ryzyk).
   - **Premium** (aktywni gracze z wieloma kontraktami): 799–999 zł/mies (pełne porównanie Kontrakt Główny ↔ umowa podwykonawcza, nielimit, priorytet).
   Górny pułap ograniczony **wrażliwością cenową branży** (jednorazowe 6–8 tys. zł za kosztorys "boli" — abonamentu powyżej ~500 zł/mies masowo nie kupią), dlatego value-based (kary 10–30%, zatrzymania 5–20%) służy do **uzasadnienia** ceny w widełkach 299–499 zł, a nie do jej windowania ponad 1 tys. zł dla większości rynku. Brak bezpośredniego polskiego konkurenta daje swobodę pozycjonowania — kluczowe: sprzedawać jako **„kontroler ryzyka kontraktowego dla podwykonawców PZP", nie „AI prawnik"**.
