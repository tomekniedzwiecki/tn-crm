# LANDING-RESEARCH — Majster Blisko

> Research pod landing marketplace'u drobnych prac domowych. Dwa wejścia: **„Potrzebuję pomocy"** (klient, 0 zł)
> i **„Jestem fachowcem"** (płacący user, abonament 99/149 zł). Start w jednym mieście. Grupa docelowa obejmuje **seniorów**.
> Data: 2026-07-22.
>
> **Metoda.** Tor A (topowe SaaS) — realne pomiary w przeglądarce (Playwright 1.61, viewport 1440×900, `getComputedStyle` +
> pełnostronicowe screenshoty). Tor B (serwisy niszy + wzorce dual-audience) — WebFetch/WebSearch (Fixly.pl blokuje boty 403 →
> dane odzyskane z WebSearch, nic nie zmyślone). Screenshoty: sekcja 6.
>
> **Powiązane pliki projektu:** `PRICING-FINAL.md` (99/149/+39/+19, rok=10 mies., gwarancja startowa), `DECYZJE.md`,
> `NAZWA-KANDYDACI.md`, `HANDOFF-PACK.md`. Wcześniejszy wzorzec metody: `C:\repos_tn\fachmat\landing-research.md`
> (inny produkt — generator ofert PDF; przenosimy tylko destylat benchmarków SaaS i doktrynę „uczciwych dowodów").

---

## 0. Fundament — co landing MUSI uszanować (z decyzji projektu)

Zanim wzorce — twarde ramy, które zmieniają dobór wzorców względem „zwykłego" SaaS:

1. **Dwie persony, jedna płaci.** Klient publikuje zlecenie za **0 zł**; przychód pochodzi **wyłącznie od fachowca** (99 zł solo / 149 zł firma). To rozstrzyga, kogo „sprzedaje" landing — patrz sekcja 2.
2. **Zimny start po stronie podaży.** Research WTP: 67% marketplace'ów umiera po stronie podaży; fachowiec zapłaci dopiero, gdy zobaczy **realne zlecenia**. Stąd darmowy klient = paliwo, które sprzedaje fachowca.
3. **Brak triala** (twarda decyzja klienta). Zamiast triala: **darmowy skrócony podgląd zleceń** („zobacz, że w Twoim obszarze są świeże zlecenia" — bez kontaktu i ofertowania). Karta dopiero przy zakupie.
4. **Zero userów na starcie.** Nie mamy liczb, recenzji, historii. Dowód = **mechanika** (ochrona kontaktu, gwarancja startowa, oceny dwustronne, „0 zł za zlecenie"), nie zmyślona skala — patrz sekcja 4.
5. **Senior w grupie docelowej.** Min. 16–18 px, wysoki kontrast (czarny na białym), **język bez anglicyzmów** (obcy żargon → senior czuje, że „chcą go naciągnąć"), duże przyciski, widoczny kontakt jako kotwica zaufania, zero migających animacji. Dotyczy zwłaszcza ścieżki KLIENTA.
6. **Jedno miasto = gęstość.** Wąski obszar to przewaga: „fachowcy z Twojej dzielnicy" brzmi wiarygodniej niż globalne liczby, których i tak nie mamy.

---

## 1. Wzorce do adaptacji — per benchmark (konkretne wartości)

### 1A. Topowe SaaS — pomiary Playwright (22.07.2026)

| Benchmark | H1 (font-size / waga / tracking / line-height / font) | Słowa H1 | H1:body | CTA nad zgięciem | Sekcje / wys. strony | Jak pokazują produkt |
|---|---|---|---|---|---|---|
| **Linear** | 64px / 510 / −1.41px (−0.022em) / 1.0 / Inter Variable | 8 | **4.27×** | 2 realne (Sign up solid + „New Coding Sessions") | 9 / 10 898px | Realny zrzut UI (ciemny), wysuwa się tuż pod hero, **lewy** dosunięty |
| **Stripe** | 48px / **300 (light)** / −0.96px (−0.020em) / 1.15 / söhne-var | 24 (długi) | — | 2 (Explore Payments solid + See pricing) | 15 / 14 633px | Animowany **gradient** + zielony tekst H1; bento: mock checkoutu na telefonie + wielki stat „3.8%" |
| **Attio** | 64px / 600 / −1.28px (−0.020em) / 0.95 / interDisplay | 4 | 3.56× | 2 (Talk to sales outline + Start for free solid) | 13 / 17 668px | Realny zrzut UI (jasny) **wyśrodkowany** pod hero + pill-ogłoszenie nad H1 |
| **Vercel** | 64px / 400 / **−3.84px (−0.060em)** / 1.0 / Geist Sans | 2 | 4.0× | 2 (Deploy now solid + Talk to sales outline) | 10 / **5 333px (krótka)** | **Znak marki** — świecący czarny trójkąt 3D (canvas/WebGL), NIE UI + pasek logo (marquee) |
| **Framer** | 54px / 500 / −2.16px (−0.040em) / 1.0 / GT Walsheim | 9 | 4.5× | 2 (Get started solid + Download app) | 6 / 10 923px | **Autoodtwarzane wideo** produktu w akcji (AI buduje stronę na żywo) |

**Ruch — zmierzone czasy (nie ogólniki):**
- **Mikro-interakcje (hover):** Linear 0.16s / 0.1s (72 + 52 elementów), Vercel 0.1s / 0.15s (79 + 56). To „domyślny" hover topowego SaaS: **0.1–0.16s**.
- **Reveal sekcji (makro):** Linear 0.4s (25 el.), Attio `enter` **0.5s ease** (6 el.), Stripe bento „fade-in-up" **0.75s** cubic-bezier. Zakres **0.4–0.75s ease-out**.
- **Sygnatura Stripe:** transition **0.3s** na WSZYSTKIM (507 elementów!) — jednolity, spokojny rytm całej strony.
- **JEDEN element „żywy" ambient na stronę:** Linear grid-dots 2.8s `steps(1)` + shine 2.2s + marquee 30s; Attio **radar „pipeline" 3.6s ease-in-out** + signal-roller 24s; Vercel marquee logo **40s linear** + blask trójkąta; Framer **„ghost" 0.75s** (kursor-AI) ×32; Stripe animowany gradient hero.
- **Czego NIE animują:** treści statycznych (nagłówki, akapity, cennik nie „wjeżdżają" gadżetowo). Ruch jest albo mikro-hover, albo jeden powolny ambient, albo powściągliwy reveal. Reduced-motion respektowane.

**Rytm sekcji / biel:** pionowy padding sekcji **128px** (Linear), **152/112px** (Attio), **120–200px** (Framer). Kolumna treści wąska: Linear H1 kontener 1436px ale tekst realnie ~720px; Vercel kolumna H1 **444px** (bardzo wąska, 3-kolumnowy asymetryczny hero); Stripe hero-tekst ~958px. **Wniosek: dużo bieli, kolumna treści ~600–960px, ostra hierarchia.**

**Dowody (gdzie w osi):** pasek logo/liczb **od razu pod hero** (Vercel: BLACKBOX.AI · Schwab · DoorDash · OpenAI · Supreme · Weather Co · Polymarket jako marquee). Wielkie liczby-efekty rozsiane w treści (Stripe „$X", Attio „30 000+", stat „3.8%"). **Social proof najpierw, cennik głęboko** (osobno / na dole) — najpierw narracja, potem prośba o pieniądze.

**Sygnatura premium (1 na stronę):** Linear — chłodny, realny zrzut UI + panel czatu „Opus 4.8" + subtelny grid ambient. Stripe — płynący gradient i zielony H1. Attio — animowany **radar „pipeline"** (metafora „agentic revenue"). Vercel — świecący **trójkąt 3D** (czysty znak marki, zero UI). Framer — **wideo produktu w akcji** (pokaż magię, nie opowiadaj).

**Wspólny mianownik 5/5 → reguły dla nas:**
- Nagłówek **krótki (2–9 słów), duży (48–64px), ciasny tracking (−0.02…−0.04em), line-height ~1.0**, waga 400–600.
- **Dokładnie 2 CTA** w hero: solid primary + outline/ghost secondary. Nigdy 3.
- **Produkt widać natychmiast, nad zgięciem, 0 kliknięć** (zrzut / wideo / znak).
- **Pasek dowodu od razu pod hero.**
- Ruch **powściągliwy:** hover 0.1–0.16s, reveal 0.4–0.5s ease-out, **jeden** ambient.
- Skala **h1:body ≈ 4×**, kolumna treści wyśrodkowana, dużo bieli.
- Strona długa (5k–18k px), **cennik głęboko** — najpierw wartość, potem cena.

**Uwaga adaptacyjna dla seniora:** minimum 48–64px H1 zostaje, ale **body podnosimy do 18px** (nie 15px jak Linear), kontrast maksymalny, a „jeden ambient" ma być **wolny i nierozpraszający** (nie migający) — inaczej łamiemy regułę seniorów z sekcji 0.

### 1B. Serwisy niszy — PL pay-per-lead, zagraniczne marketplace usług

**Fixly.pl** (PL, pay-per-lead, własność OLX)
- Hero/title jako dowód skali w samym nagłówku: *„wybierz najlepszego spośród **569 245 wykonawców**!"* + obietnica *„znajdź fachowca w 30 sekund"*.
- Model = **odwrócone ogłoszenia**: klient opisuje potrzebę za darmo, fachowiec **płaci za odblokowanie kontaktu (lead)**. Cena leada 5–100 zł zależnie od kategorii; doładowania od 50 zł, kwota schodzi automatycznie.
- **WZORZEC do przejęcia (neutralizacja lęku o koszt):** ~50% kategorii darmowych + **„Pakiet Powitalny — do 5 pierwszych zleceń za darmo"**. Ryzyko fachowca na starcie = 0.

**Oferteo.pl** (PL, pay-per-lead, od 2008)
- Hero: *„Otrzymaj oferty od firm"*. Subline: *„Od budowy domu po usługi dla firmy… Pomożemy Ci w każdym temacie."*
- CTA per persona: *„Porównaj oferty"* / *„Znajdź Wykonawcę"* (klient) · *„Dołącz do firm"* / *„Jesteś Specjalistą…? Załóż bezpłatne konto"* (fachowiec).
- **Twarde liczby-dowody na stronie:** 23 841 617 ofert wysłanych · 13 308 868 klientów · 780 710 usługodawców · 80% oszczędności czasu · 30% budżetu.
- Dźwignia do fachowca: cytat *„Nie tracę już czasu na szukanie zleceń"* + obietnica *„Klienci zdecydowani na zakup usługi"* (leady wysokiej intencji). Lead 5–200 zł.

**Booksy Biz** (booksy.com — strona DLA usługodawcy, abonament — najbliższy nasz benchmark modelu)
- Hero: *„Business app built for barbers, stylists & salon owners"* (aplikacja **stworzona dla** konkretnego fachu). Subline łączy narzędzia + *„a marketplace of local clients actively searching for you"* + dowód *„330 000+ pros trust Booksy"*.
- **WZORZEC prezentacji abonamentu:** **$29.99/mc, WSZYSTKO wliczone, brak ukrytych opłat**, *„14-day trial, no credit card"*, dodatkowy pracownik **+$20/mc**, *„We do not charge commissions… we will never charge your clients"*. Jedna stała cena + zero prowizji + trial bez karty.
- Dowody: 330k+ pros · 44 mln+ klientów · +20% rezerwacji · −25% no-show. CTA: *„Start free now"*.

**Thumbtack /pro** (USA, pay-per-lead)
- Messaging: *„meet more customers"*, *„conversations with real customers, not just views"*. Dowód: *„Over 4 million customers joined… in the last 12 months"*. Cytat-dźwignia: *„…it gave me confidence…opportunity's gonna fall in your lap."*
- Cena leada $8–150 (większość $25–75), płacisz **tylko** gdy klient się odezwie.
- **WZORZEC (kontrola budżetu neutralizuje lęk):** ustawiasz **max cenę leada** (np. $10) i **tygodniowy budżet** (np. $90) → dostajesz tylko leady ≤$10 i system stopuje przy wyczerpaniu budżetu.

**TaskRabbit /become-a-tasker** (USA, strona wykonawcy)
- Hero: *„Earn money your way"* (Zarabiaj po swojemu). Dźwignie: *„be your own boss"*, *„set your own rates — you choose what you'll do, when, and what you'll charge"*, *„keep **100%** of what you charge, plus tips"*, zarobek *„$20–89/hr"*. Platforma bierze na siebie marketing i pozyskanie klientów.

**Airtasker** (dwustronny — WZORZEC „1 landing, 2 persony")
- Hero **neutralny, ustawiony pod klienta**: *„Get Anything Done"*. Subline: *„Post any task. Pick the best person. Get it done."*
- **Dwa równoległe CTA:** *„Post your task for free"* (klient, **primary solid**) · *„Earn money as a Tasker"* (wykonawca, **secondary ghost**). **Dwie ścieżki, NIE toggle.** Homepage prowadzi popytem; sekcja wykonawcy niżej, ale jego CTA obecne już w hero.
- Dowody: 1M+ klientów · 2.5M+ zleceń · 4M+ recenzji · 160 000 Taskerów zarobiło na platformie.

**Destylat niszy → co bierzemy:**
1. **Klient — model odwrócony jest zaletą do sprzedania:** *„Opisz, czego potrzebujesz — fachowcy sami się zgłoszą"* (Fixly). Prostota + brak kosztu + wybór + opinie.
2. **Fachowiec — dźwignie:** popyt („klienci już szukają"), brak marnowania czasu (Oferteo), zarobek u siebie („bez prowizji, co uzgodnisz zostaje u Ciebie" — TaskRabbit/Booksy), **kontrola i brak ryzyka** (Fixly Pakiet Powitalny / Thumbtack budżet).
3. **Abonament po Booksy:** jedna stała cena, wszystko w środku, zero prowizji, jasny dodatek per-pracownik — dokładnie nasza struktura (99/149 + 39).
4. **Nasza przewaga nad PL pay-per-lead (Fixly/Oferteo):** u nich jedno wygrane zlecenie ≈ 100 zł w samych kontaktach; u nas **cały miesiąc = 99 zł, bez opłaty za kontakt**. To jest główny hak sprzedażowy fachowca.
5. **Dowód lokalny zamiast globalnych liczb** (których nie mamy): „fachowcy z Twojej dzielnicy", opinie sąsiadów, gwarancja — nie „569 245 wykonawców".

---

## 2. Dual-audience hero — jak robią to marketplace'y + REKOMENDACJA

**Trzy modele w naturze:**
- **(a) Toggle/przełącznik w jednym hero** — rzadki w marketplace usług; rozdwaja komunikat, dla seniora mylący. **Odrzucamy.**
- **(b) Dwie równoległe ścieżki na homepage** (Airtasker): neutralny headline o rezultacie + **primary CTA taniej strony** (klient) i wyraźny **secondary CTA płacącej strony** (fachowiec). Homepage prowadzi popytem, płacący ma równoległy przycisk.
- **(c) Dominanta jednej strony + osobny, pełny landing sprzedażowy dla drugiej** (Booksy, Thumbtack, TaskRabbit): płacąca persona dostaje WŁASNĄ podstronę (własny hero, dowody, jawny cennik, gratis-na-start) — bo tam leży konwersja na pieniądze.

**Kto jest „targetem" naszego landingu głównego?** Klient płaci 0, fachowiec płaci — więc instynkt mówi „sprzedawaj fachowcowi". Ale fachowiec kupi **tylko, gdy zobaczy realny popyt**, a popyt = darmowe zlecenia klientów. Klient jest też **masowo pozyskiwalny** (reklama do całego miasta na intencję „naprawa pralki [Miasto]") i **tani** w akwizycji. Dlatego:

### ★ REKOMENDACJA (model b + c połączone)

1. **Landing główny (root, to co reklamujemy do miasta) prowadzi KLIENTEM.** Wzorzec Airtaskera: **neutralny headline o rezultacie** + **primary solid CTA klienta** („Potrzebuję pomocy — za darmo") i **równoległy, wyraźny secondary CTA fachowca** („Jestem fachowcem →"). Niska bariera 0 zł = szybko budujemy masę zleceń, które są „towarem" sprzedawanym fachowcowi.
2. **Osobny, mocny landing sprzedażowy `/dla-fachowca`** — to tu leży przychód, więc ta strona „sprzedaje" najmocniej: własny hero, dowód „ilu klientów/zleceń już czeka w Twoim mieście", jawny cennik 99/149, gwarancja startowa, founding −50%, darmowy podgląd zleceń jako furtka wartości. **Reklamy do fachowców kierujemy PROSTO tutaj**, nie na root.
3. **Bez toggle. Dwa duże, opisane przyciski**, primary solid dominuje wizualnie nad secondary ghost (unikamy decision fatigue; czytelne dla seniora).
4. **Zgodność z doktryną TN „Dwie persony — NIE miksować":** każda strona sprzedaje JEDNĄ personę. Root nie „miksuje" ofert — prowadzi klienta i tylko **przekierowuje** fachowca drzwiami do `/dla-fachowca`.
5. **Opcjonalny wariant dla seniorów:** jeśli analityka pokaże mylenie ścieżek, dołożyć lekki **ekran-wybór** („Czego potrzebujesz? [Szukam fachowca] / [Jestem fachowcem]") jako pierwszą, prostą bramkę — ale domyślnie startujemy od klient-dominanta z drzwiami fachowca (mniej tarcia dla masowego ruchu klienckiego).

**Jednym zdaniem:** *root = klient-dominanta z drzwiami fachowca (Airtasker), przychód konwertuje osobny landing `/dla-fachowca` (Booksy/Thumbtack).*

---

## 3. Warianty nagłówka hero PO POLSKU

Reguły: ≤6 słów, język niszy, senior-czytelne, bez anglicyzmów. (Marka robocza „Majster Blisko" — w nagłówku nie powtarzamy jej dosłownie, żeby nie brzmiał jak logo.)

### Ścieżka KLIENTA (dominanta rootu)
1. **„Popsuło się? Majster jest blisko."** — problem→rozwiązanie, ciepłe, w 100% dla seniora; „blisko" = rdzeń USP.
2. **„Wrzuć zlecenie. Fachowcy się odezwą."** — mechanizm (odwrócony model Fixly), sprawcze, darmowość dopowiada subline.
3. **„Znajdź majstra w swojej okolicy."** — najprostsze, najbezpieczniejsze, lokalność wprost.

*Rezerwowe:* „Naprawy domowe? Zgłoś — ktoś przyjedzie." · „Twój majster — tuż za rogiem." · „Za darmo znajdź fachowca blisko."

### Ścieżka FACHOWCA (landing `/dla-fachowca`)
1. **„Zlecenia z okolicy. Bez prowizji."** — główny hak vs pay-per-lead; krótkie, dumne.
2. **„Płać raz. Odbieraj lokalne zlecenia."** — stały abonament kontra opłata za każdy kontakt.
3. **„Świeże zlecenia z Twojego powiatu."** — lokalność + świeżość (powiat = jednostka sprzedaży).

*Rezerwowe:* „99 zł za miesiąc zleceń, nie za lead." · „Więcej roboty z Twojej okolicy." · „Zarabiaj u siebie — bez pośredników."

### 3 sublinie z konkretem (KLIENT)
1. **„Opisz usterkę i dodaj zdjęcie — w kilka minut dostajesz oferty od fachowców z Twojego powiatu. Publikacja zlecenia jest darmowa."**
2. **„Koniec obdzwaniania znajomych i grup na Facebooku. Wrzucasz zlecenie za 0 zł, a lokalni majstrzy z ocenami od sąsiadów przysyłają Ci ceny."**
3. **„Za darmo mówisz, co się zepsuło. Fachowcy z okolicy odpowiadają ofertą — wybierasz tego z najlepszą oceną i ceną. Twój numer widzi dopiero wybrany wykonawca."**

### 3 sublinie z konkretem (FACHOWIEC)
1. **„Widzisz wszystkie świeże zlecenia ze swojego powiatu i odpowiadasz krótką ofertą. Jeden stały abonament 99 zł/mc — zamiast płacić za każdy kontakt jak u konkurencji."**
2. **„U innych jedno wygrane zlecenie to ~100 zł za same kontakty. U nas cały miesiąc lokalnych zleceń kosztuje 99 zł — a pierwszy miesiąc bez zleceń w Twojej okolicy zwracamy."**
3. **„2 powiaty w cenie, oceny od klientów budują Twoją pozycję, a Ty decydujesz, na co odpowiadasz. Bez prowizji od zlecenia, bez opłaty za lead."**

---

## 4. Dowody zaufania, które mamy UCZCIWIE na starcie (zero zmyślania)

Nie mamy userów, recenzji ani historii. **Nie udajemy skali.** Zamiast „X 000 fachowców" — mechanika i uczciwe fakty:

**Wspólne / dla klienta:**
- **Ochrona kontaktu (najmocniejszy dowód dla nieufnego klienta):** *„Twój numer telefonu widzi dopiero wybrany fachowiec — nie cała platforma."* (mechanika z HANDOFF §3.6). Konkretna, prawdziwa, rozbraja lęk „zaraz mnie zasypią telefonami".
- **„0 zł za zlecenie":** *„Publikacja zlecenia i oferty są darmowe. Płacisz wyłącznie wybranemu wykonawcy — za wykonaną pracę."*
- **Oceny dwustronne:** *„Po zakończeniu obie strony wystawiają oceny. Fachowców oceniają sąsiedzi z Twojej okolicy."* (odróżnia od anonimowych gwiazdek).
- **Transparentność wykonawcy:** badge *„Firma"* / *„Osoba prywatna"* + ikona *„Wystawia fakturę/rachunek"* przy każdej ofercie (D-10). Uczciwość = zaufanie.
- **Konto realne, nie bot:** *„Każdy fachowiec ma zweryfikowany numer telefonu (kod SMS)."* (A-02).
- **Lokalność jako dowód:** *„Zbudowane dla [Miasto] — zlecenia i fachowcy tylko z Twojej okolicy."* Precyzja lokalna > pusta skala.
- **Samodeklaracja uprawnień (uczciwie):** przy elektryce *„Fachowiec deklaruje świadectwo SEP (numer widoczny na profilu)"* — mówimy prawdę o zakresie weryfikacji (D-04), zamiast obiecywać nadzór, którego v1 nie robi.

**Dla fachowca (`/dla-fachowca`):**
- **Gwarancja startowa (flagowy dowód, zdejmuje ryzyko zimnego startu):** *„Pierwszy opłacony miesiąc bez ANI JEDNEGO zlecenia w Twojej okolicy? Zwracamy 99/149 zł."* (zapis regulaminu; realizacja: ręczny refund operatora).
- **Bez prowizji / bez opłat za lead:** *„Stały abonament zamiast płacenia za każdy kontakt. Co uzgodnisz z klientem, zostaje u Ciebie."* (dźwignia TaskRabbit/Booksy + kontra do Fixly/Oferteo).
- **Darmowy podgląd zleceń przed zakupem** (zamiast triala): *„Zobacz za darmo, ile zleceń jest teraz w Twoim obszarze — zanim zapłacisz."*
- **Founding member (uczciwa rzadkość, nie fałszywa presja):** *„Pierwsi fachowcy w [Miasto]: −50% przez 3 miesiące."*

**Czego NIE robić:**
- Nie zmyślać liczb userów, zleceń, gwiazdek ani „zaufało nam X firm".
- Nie kopiować „569 245 wykonawców" / „330 000+ pros" — to broń Fixly/Booksy, nie nasza na starcie.
- Cytaty klientów/fachowców dopinamy **dopiero, gdy będą prawdziwi** (format niszy: imię + fach + dzielnica). Do tego czasu dowodem jest mechanika i lokalność.

> Zasada: dopóki nie mamy liczb, dowodem jest **mechanika (ochrona kontaktu + gwarancja + oceny dwustronne) + lokalność + „0 zł za zlecenie"**, a nie wymyślona skala.

---

## 5. Jak pokazać cennik fachowca (99/149/+39/+19, rok=10 mies., gwarancja)

**Struktura (wzorzec Booksy — jedna jasna cena, wszystko w środku):**
- **Dwie karty obok siebie:** „Fachowiec (solo) **99 zł/mc**" i „Firma **149 zł/mc**". Jedna wielka liczba per karta (tabular/`.money`), reszta jako lista pod spodem. Cennik **głęboko na stronie**, po narracji i darmowym podglądzie — nie w hero (5/5 SaaS).
- **W każdej karcie od razu:** *„2 powiaty w cenie · wszystkie funkcje · bez prowizji od zlecenia · bez opłat za kontakt."*
- **Dodatki jako drobny „rozbuduj" pod kartami** (nie zaśmiecać głównej ceny): *„+39 zł/mc pracownik · +19 zł/mc dodatkowy powiat."*

**Przełącznik mies./rok (rok = 10 miesięcy, −16,7%):**
- Rama sprzedażowa zamiast procentu: **„Płać za 10 miesięcy, korzystaj przez 12"** lub **„2 miesiące gratis przy płatności rocznej"**. Rabat tylko na abonament główny; dodatki roczne z góry (nota drobnym drukiem).

**Kotwica wartości w języku fachowca (nie żargon SaaS):**
- **Główny hak (anti-pay-per-lead):** *„U konkurencji jedno wygrane zlecenie to ~100 zł za same kontakty. U nas cały miesiąc lokalnych zleceń kosztuje 99 zł."*
- **Przelicznik na jego świat:** *„Zwraca się z jednego zlecenia w miesiącu"* (przy zleceniu 150–400 zł i marży 40–60% — z PRICING-FINAL).

**Gwarancja startowa jako plakietka na karcie** (zdejmuje ryzyko zimnego startu):
- *„Pierwszy miesiąc bez zleceń w Twojej okolicy? Zwracamy 99 zł."* — umieścić WIDOCZNIE przy cenie, nie w regulaminie.

**Brak triala → furtka wartości przed ceną:**
- Zamiast „14 dni za darmo": **CTA „Sprawdź, ile zleceń jest teraz u Ciebie"** otwiera darmowy skrócony podgląd zleceń (bez karty, bez kontaktu). To nasz odpowiednik triala i najsilniejszy dowód popytu tuż przy cenniku.
- Kartę pokazujemy dopiero w Stripe Checkout, przy zakupie — nigdy wcześniej.

**Founding member (rzadkość na starcie):**
- Baner nad cennikiem: *„Pierwsi fachowcy w [Miasto]: −50% przez 3 miesiące"* (Stripe Coupons/Promotion Codes; kod tworzy operator).

**Reguły z niszy do przejęcia:** jedna stała cena „wszystko w środku, zero ukrytych opłat, zero prowizji" (Booksy) · „za darmo na start" jako neutralizator lęku (Fixly Pakiet Powitalny = nasza gwarancja + darmowy podgląd) · NIE straszyć ratami/„od-do", jedna liczba duża i jasna (reguła seniora + `feedback-payment-methods`).

---

## 6. Screenshoty (w scratchpadzie — do wglądu przy projektowaniu)

Katalog: `C:\Users\tomek\AppData\Local\Temp\claude\c--repos-tn\1dae9151-9346-46a1-9794-e5ecd55baca6\scratchpad\landing-bench\`

- `linear-hero.jpeg`, `linear-full.jpeg`
- `stripe-hero.jpeg`, `stripe-full.jpeg`
- `attio-hero.jpeg`, `attio-full.jpeg`
- `vercel-hero.jpeg`, `vercel-full.jpeg`
- `framer-hero.jpeg`, `framer-full.jpeg`
- `measurements.json` (surowe pomiary `getComputedStyle`), `measure.js` (skrypt Playwright)

*(Serwisy niszy — Tor B — analizowane przez WebFetch/WebSearch; Fixly.pl blokuje boty 403, dane z WebSearch z cytatami. Booksy/Thumbtack/TaskRabbit/Airtasker — cytaty z żywych stron/opisów, nic nie zmyślone.)*
