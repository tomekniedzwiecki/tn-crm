## KONCEPCJA

**Motyw przewodni: „Domowa seria”** — diagonalna szyna maszyny staje się osią całej kompozycji, a segmentowany pasek powtórzeń zamienia zwykły salon w osobisty rytuał treningowy bez estetyki siłowni ani katalogowego „clean e-commerce”.

**Narracja strony — 5 zdań:**

1. Użytkowniczka z Reelsa od razzu trafia na znajomy ruch maszyny pokazany w prawdziwym mieszkaniu, z kobietą podobną do niej, nie zawodową fitness-modelką.  
2. Nachodząca na scenę karta od razu porządkuje impuls zakupowy: cena, CTA, płatność i 14 dni na zwrot.  
3. Interaktywne demo wyjaśnia mechanikę w trzech prostych stanach: ustaw, oprzyj się, napnij i suń.  
4. Kolejne sekcje odpowiadają dowodami produktowymi na pytania o regulację, możliwe ćwiczenia, stabilność, udźwig i składanie.  
5. Po obejrzeniu realnych klipów użytkowniczka przechodzi do checkoutu bez wyboru wariantu, a finalne FAQ usuwa ostatnie obiekcje bez presji i fałszywej pilności.  

**Hook hero — message match:**

| Parametr | H1 | Sub |
|---|---|---|
| `?h=1` — dom/core | **Brzuch i core. U siebie.** | Składana maszyna z ruchomym wózkiem, 5 wysokościami, 2 kątami nachylenia i licznikiem LCD. (Karta: produkt; regulacja; LCD) |
| `?h=2` — regulacja | **Zacznij lżej. Podkręć, gdy jesteś gotowa.** | Ustawiasz 1 z 5 wysokości i 1 z 2 kątów; wyższe ustawienie oznacza większą trudność. (Karta: opis + g5) |
| `?h=3` — składanie | **Trening kończysz. Sprzęt składasz.** | Konstrukcja składa się z użyciem zawleczki zabezpieczającej, dzięki czemu po ćwiczeniach możesz ją odłożyć. (Karta: opis) |

## PARTYTURA

1. **Font display — Archivo Expanded/SemiExpanded 700–800:** ten produkt i persona prowadzą do szerokiego, plakatowego kroju, bo potrzebna jest energia treningu bez agresywnego języka siłowni; H1 ma `clamp(56px, 6vw, 80px)` na desktopie, minimum 38 px na mobile i skalę 1.333.  
2. **Font text — Figtree 400–700:** ten produkt i persona prowadzą do miękkiego, czytelnego tekstu, bo funkcje i obiekcje trzeba wyjaśniać ciepło oraz bez technicznego chłodu; body 17/1.55, kolumny 50–75 znaków, eyebrow caps z trackingiem 0.2em.  
3. **Akcent — `--cta: #A21CAF`:** ten produkt i persona prowadzą do jednego fuksjowo-fioletowego impulsu, bo kolor ma sygnalizować energię, ale nie konkurować z różową pianką; akcent występuje wyłącznie na CTA, swashach i ostatniej kresce sygnatury traktowanej jako swash, bez kolorowania ikon i tekstu body.  
4. **Rodzina tła — `#F7F5FB`, `#F0ECF7` i biel:** ten produkt i persona prowadzą do rozbielonej lila-mgły, bo wspiera ona spokojny świat domowej regularności, zachowuje wysoką jasność i kontrast WCAG oraz eliminuje ciemne i neonowe powierzchnie.  
5. **Materiał i świat — prawdziwe polskie mieszkanie:** ten produkt i persona prowadzą do salonu z panelami, dywanem, kanapą, rośliną i oknem, bo sprzęt ma wyglądać wiarygodnie w codziennym otoczeniu; jeden radius 24 px, ikony liniowe 1.75 px w `--ink`, cienie key+ambient z sepiowym tintem 0.08 i grain 3%.  
6. **Archetyp hero — C, karta nachodząca na scenę:** ten produkt i persona prowadzą do lifestyle’u zakończonego ofertową kartą, bo pionowy ruch z Reelsa wymaga szybkiej identyfikacji produktu, a ujemny margines naturalnie umieszcza cenę w mobilnym foldzie.  
7. **Sygnatura — „pasek powtórzeń”:** ten produkt prowadzi do pięciu segmentów z zaakcentowaną ostatnią kreską oraz typograficznych liczb `5`, `2` i `≈200`, bo bezpośrednio łączą rytm serii z 5 wysokościami, 2 kątami i udźwigiem około 200 kg.  
8. **Dobór i kolejność sekcji:** ten produkt i persona prowadzą do sekwencji hero → problem → TOR-I → regulacja → wideo → partie → wytrzymałość → mid-CTA → składanie → zamówienie → final, bo najpierw trzeba zrozumieć ruch, potem zobaczyć dowody i dopiero wtedy zamknąć decyzję; siatka 8·16·24·32·48·64·96, sekcje 112 px desktop/72 px mobile i content width 1180 px.  

## MANIFEST SEKCJI

1. `hero | scenowa | build` — scena odtwarza kontekst reklamy i natychmiast domyka ofertę ceną, CTA oraz redukcją ryzyka.  
2. `problem | kodowa | build` — agitacja PAS dla zimnego ruchu; kontrast METOD, nie ciał; bez produktu i bez generacji.  
3. `jak-cwiczysz | kodowa | build` — TOR-I tłumaczy mechanikę bez pseudonauki i bez zmuszania użytkowniczki do oglądania całego filmu.  
4. `regulacja | kodowa | build` — typograficzne `5` i `2` odpowiadają na obiekcję „czy nie będzie za trudne?”.  
5. `wideo | kodowa | build` — pionowe klipy 9:16 pokazują biało-różowy produkt w ruchu i są najmocniejszym materiałem demonstracyjnym (liczba kart = liczba klipów, które przejdą gate; min. 2).  
5b. `zdjecia-kupujacych | scenowa | build` — sekcja dowodowa: 3 realne kadry biało-różowego produktu od kupujących (konsola LCD, U-kształtny wałek, rozpakowanie z kartonu), tokeny lila-mgła + radius 24/12, podpis „zdjęcia od kupujących”, ZERO ocen/gwiazdek/liczb; wpięta między `wideo` a `wiele-partii`. **Dodana 23.07 po feedbacku Tomka — sekcja dowodowa obowiązkowa, wpięta bez makiety jako naprawa post-hoc (manifest ją pomijał).**  
6. `wiele-partii | scenowa | build` — pokazuje, że sprzęt obsługuje ćwiczenia brzucha, talii, pośladków, ramion i nóg.  
7. `wytrzymalosc | scenowa | build` — trójkątna konstrukcja, pogrubione rurki i udźwig odpowiadają na pytanie, czy produkt jest stabilnym sprzętem, a nie lekkim gadżetem.  
8. `mid-cta | kodowa | build` — przechwytuje decyzję po najważniejszych dowodach, bez rabatu, timera i sztucznej pilności.  
9. `skladanie | scenowa | build` — pokazuje dwa uczciwe stany produktu i użycie zawleczki, bez deklarowania nieznanych wymiarów po złożeniu.  
10. `galeria-dowodowa | scenowa | SKIP` — dwa czyste kadry, jedna grafika 480×480 i pięć infografik z wypalonym tekstem nie tworzą wystarczająco mocnej, spójnej galerii premium.  
11. `opinie | kodowa | SKIP` — pięć generycznych opinii EN i zbyt mała baza ocen nie dają wiarygodnego materiału do osobnej sekcji social proof.  
12. `zamow | kodowa | build` — checkout na stronie pozwala wybrać COD, BLIK lub płatność online bez zbędnego wyboru koloru.  
13. `final | kodowa | build` — FAQ rozbraja obiekcje o kolor, regulację, udźwig, montaż, składanie i LCD, po czym wraca jednym CTA do zamówienia.  

## SEKCJE

**1. `hero`**

- **Cel:** w ciągu pierwszego ekranu połączyć kontekst reklamy, produkt, cenę i bezpieczny kolejny krok.
- **Treść:**
  - Eyebrow: **„TWOJA DOMOWA SERIA”**.
  - Sygnatura: pięć kresek, ostatnia jako fuksjowy swash.
  - H1 i sub dynamiczne według `?h=1/2/3` z tabeli w koncepcji.
  - Cena: **„429,00 zł”**. (Karta: cena)
  - CTA: **„Zamawiam Brzuszek”**.
  - Redukcja ryzyka: **„Płatność przy odbiorze, BLIK lub online · 14 dni na zwrot”**. (Karta §5b)
  - Trust-pill: **„Składana konstrukcja”**. (Karta: opis)
  - Trust-pill: **„2 kąty · 5 wysokości”**. (Karta: opis + g5)
  - Trust-pill: **„Udźwig ≈ 200 kg”**. (Karta: spec + g3)
- **Układ:** lifestyle 16:9/4:5 u góry; karta mikro-oferty szerokości 520–600 px nachodzi na dolną krawędź sceny o 64 px desktop i 40 px mobile; na mobile cena oraz CTA muszą mieścić się w naturalnym pierwszym foldzie.
- **Rola grafiki:** kobieta 28–45 wykonuje crunch na biało-różowej maszynie w jasnym salonie; kamera jest zablokowana, osoba i produkt pozostają statyczne w bazowej klatce, a fizyczną pętlę tworzą poruszająca się firanka, liście rośliny i zmienne światło poranka.
- **CTA:** `Zamawiam Brzuszek` → `#zamow`; bez gwiazdek, liczby opinii, przeceny i dostępności magazynowej.

---

**2. `problem`**

- **Cel:** dla zimnego ruchu z Reelsa nazwać frustrację dotychczasowych metod i zbudować most do „u siebie, po swojemu” — agitacja w duchu PAS, kontrast METOD, nie ciał.
- **Treść:**
  - Eyebrow: **„ZNASZ TO?”**.
  - H2: **„Mata, karnet, aplikacja — i tak się to rzuca.”**
  - Kafelek kontrastu 1: **„Brzuszki na macie → boli kręgosłup i szyja, a nuda wygrywa.”** (kotwica: ICP §4)
  - Kafelek kontrastu 2: **„Karnet na siłownię → drogo, daleko, brak czasu.”** (kotwica: ICP §4)
  - Kafelek kontrastu 3: **„Ab-roller i aplikacje → za trudne na start, porzucone po tygodniu.”** (kotwica: ICP §4)
  - Domknięcie-most: **„Dlatego robisz to u siebie, po swojemu — na sprzęcie, który reguluje trudność.”** (kotwica: opis + g5)
- **Układ:** pas kodowy z trzema kafelkami kontrastu METOD (ikony outline w `--ink`), pod nimi jedno zdanie-most; BEZ grafiki scenowej, BEZ produktu i BEZ generacji.
- **Rola grafiki/kodu:** wyłącznie kod — trzy kafelki z ikonami liniowymi w `--ink`, bez fotografii i bez packshotu; kontrast dotyczy METOD, nie ciał (ZAKAZ body-shamingu).
- **CTA:** brak głównego CTA; sekcja prowadzi wprost do `#jak-cwiczysz` (TOR-I).

---

**3. `jak-cwiczysz`**

- **Cel:** pokazać zasadę działania w trzech zrozumiałych krokach.
- **Treść:**
  - Eyebrow: **„JAK ĆWICZYSZ”**.
  - H2: **„Ustaw. Oprzyj się. Napnij i suń.”** (Karta: produkt; regulacja)
  - Stan 1 — **„Ustaw poziom”**: „Wybierz 1 z 5 wysokości i 1 z 2 kątów nachylenia; wyższe ustawienie zwiększa trudność.” (Karta: opis + g5)
  - Stan 2 — **„Oprzyj się stabilnie”**: „Kolana lub łokcie opierasz na pogrubionym, U-kształtnym wałku piankowym, a przy konsoli masz dwa dodatkowe wałki pod klatkę lub przedramiona.” (Karta: galeria + opis)
  - Stan 3 — **„Napnij i suń”**: „Przedni wózek porusza się po szynie na 3 zestawach cichych kółek.” (Karta: galeria + opis)
  - Mikrocopy LCD: **„LCD pokazuje powtórzenia, czas i kalorie jako funkcje licznika.”** (Karta: opis)
- **Układ:** na desktopie duży produkt po lewej i trzy kontrolki stanu po prawej; na mobile pionowy sticky-stage z kartami kroków wchodzącymi kolejno podczas scrollu.
- **Rola grafiki/kodu:** wyretuszowany cutout g0 w warstwach DOM, pozycje wózka i aktywne punkty podparcia zaznaczane animowanymi maskami SVG w kolorze `--ink`; akcent pozostaje wyłącznie na małym swashu aktywnego kroku.
- **CTA:** brak głównego CTA; tekstowy link **„Zobacz poziomy trudności”** prowadzi do `#regulacja`.

---

**4. `regulacja`**

- **Cel:** pokazać progresję bez obietnic efektu i bez sugerowania jednego poziomu dla każdej osoby.
- **Treść:**
  - Eyebrow: **„REGULUJESZ TRUDNOŚĆ”** + pasek pięciu powtórzeń.
  - H2: **„Nie musisz zaczynać od najtrudniejszego ustawienia.”**
  - Duża liczba: **„5”**, podpis: **„wysokości”**. (Karta: opis + g5)
  - Duża liczba: **„2”**, podpis: **„kąty nachylenia”**. (Karta: opis + g5)
  - Body: **„Wyższe ustawienie oznacza większą trudność, więc możesz dobrać poziom od początkującego do zaawansowanego.”** (Karta: opis + g5)
  - Mikrocopy: **„Poziom dobieraj do własnych możliwości i poprawnej techniki ruchu.”**
- **Układ:** dwie duże liczby zajmują 60% sekcji; obok kodowy model boczny ramy z przełącznikiem `Łagodniej / Trudniej`, bez dodawania skali liczbowej nieobecnej w danych.
- **Rola grafiki/kodu:** uproszczony SVG A-frame odwzorowujący dwa kąty oraz pięć pozycji, z pełnym produktem jako zdjęciowym punktem odniesienia.
- **CTA:** **„Wybieram swój poziom”** → `#zamow`.

---

**5. `wideo`**

- **Cel:** przenieść wiarygodność materiału short-video na stronę bez platformowego chaosu i liczbowego social proof.
- **Treść:**
  - Eyebrow: **„ZOBACZ RUCH”**.
  - H2: **„Najpierw zobacz. Potem ustaw po swojemu.”**
  - Lead: **„Krótkie pionowe klipy pokazują biało-różową maszynę w prawdziwych wnętrzach.”** (Karta: materiał wideo)
  - Karta 1: **„Brzuszek w użyciu”**. (Karta: materiał wideo)
  - Karta 2: **„Demo: 8 ćwiczeń”**. (Karta: materiał wideo)
  - Karta 3: **„Ruch wózka po szynie”**. (Karta: materiał wideo; produkt)
  - Karta 4: **„Biało-różowy wariant w domu”**. (Karta: materiał wideo)
  - *(Tytuły kart kandydackie — realna liczba wg noty wykonawczej.)*
- **Nota wykonawcza:** liczba kart = liczba klipów, które przejdą pobranie (yt-dlp) i gate; **min. 2 klipy**; poniżej 2 → sekcja wideo składana do demo w `jak-cwiczysz` (TOR-I).
- **Układ:** snap-rail 9:16; na desktopie 3,25 karty w widoku, na mobile 1,15 karty, żeby zasugerować możliwość przesunięcia.
- **Rola grafiki/kodu:** self-hosted MP4/WebM, poster, `playsinline`, przycisk play/pause i napisy; bez liczników odtworzeń, komentarzy, ocen, czarno-czerwonego wariantu i kulturysty.
- **CTA:** pod railem **„Sprawdź, co możesz ćwiczyć”** → `#wiele-partii`.

---

**6. `wiele-partii`**

- **Cel:** poszerzyć postrzeganą użyteczność produktu bez twierdzeń o odchudzaniu lub spalaniu.
- **Treść:**
  - Eyebrow: **„WIĘCEJ NIŻ JEDEN RUCH”**.
  - H2: **„Nie tylko brzuch.”** (Karta: Training Site + g4)
  - Lead: **„Maszyna jest przeznaczona do ćwiczeń brzucha, talii, pośladków, ramion i nóg.”** (Karta: spec Training Site + g4)
  - Karta **„Brzuch i core”**: „Wózek z wałkiem porusza się po pochyłej szynie podczas ruchu crunch.” (Karta: produkt; galeria + opis)
  - Karta **„Talia i pośladki”**: „W materiałach produktu pokazano wariant side leg raise.” (Karta: g4)
  - Karta **„Ramiona”**: „Do treningu ramion służą linki lub gumy oporowe z piankowymi uchwytami.” (Karta: galeria + opis)
  - Karta **„Nogi”**: „U podstawy znajdują się paski lub strzemiona pedałów, a nogi są wymienione w obszarach treningu.” (Karta: galeria + opis; spec Training Site)
- **Układ:** desktop 2×2 z naprzemiennym zdjęciem i typografią; mobile jako pionowy editorial rail bez karuzeli ukrywającej treść.
- **Rola grafiki:** jedna bohaterka i to samo mieszkanie w czterech jasnych kadrach; każdy kadr pokazuje wyłącznie konfigurację potwierdzoną materiałami, bez strzałek, mięśniowych heatmap i sylwetek „przed/po”.
- **CTA:** brak; sekcja prowadzi bezpośrednio do dowodu konstrukcyjnego.

---

**7. `wytrzymalosc`**

- **Cel:** odpowiedzieć na obiekcję „czy to wytrzyma moją wagę?”.
- **Treść:**
  - Eyebrow: **„KONSTRUKCJA”** + pasek powtórzeń.
  - H2: **„Trójkątna rama. Konkretna nośność.”**
  - Duża liczba: **„≈ 200 kg”**, podpis: **„deklarowany udźwig”**. (Karta: 440 lbs ≈ 200 kg; spec + g3)
  - Body: **„Konstrukcja ma trójkątny układ A-frame i pogrubione metalowe rurki.”** (Karta: spec + g3)
  - Detal: **„Dwie poprzeczki są zakończone antypoślizgowymi końcówkami.”** (Karta: galeria + opis)
  - Detal: **„Obudowę wykonano z ABS.”** (Karta: spec)
  - Doprecyzowanie: **„440 lbs według specyfikacji produktu, czyli około 200 kg.”** (Karta: spec + g3)
- **Układ:** niski, jasny kadr konstrukcji po lewej; po prawej duża typografia `≈200` oraz trzy cechy z ikonami w `--ink`.
- **Rola grafiki:** detal dolnych poprzeczek, diagonalnej belki, punktów łączenia i antypoślizgowych zakończeń; bez wizualnych testów obciążeniowych, których faktycznie nie wykonano.
- **CTA:** brak.

---

**8. `mid-cta`**

- **Cel:** zebrać decyzję po regulacji, wideo, zastosowaniach i danych konstrukcyjnych.
- **Treść:**
  - H2: **„Gotowa ustawić swoją serię?”**
  - Produkt: **„Brzuszek — biało-różowy”**. (Karta: decyzja wykonawcza)
  - Cena: **„429,00 zł”**. (Karta: cena)
  - CTA: **„Przechodzę do zamówienia”**.
  - Redukcja ryzyka: **„Płatność przy odbiorze, BLIK lub online · 14 dni na zwrot”**. (Karta §5b)
- **Układ:** jasny pas z dużym swashem za nagłówkiem, packshotem i ofertą w jednej linii desktop; na mobile packshot, cena, CTA i ryzyko w pionie.
- **Rola grafiki/kodu:** wyretuszowany packshot g0, bez dodatkowych badge’y i bez znaku producenta.
- **CTA:** `Przechodzę do zamówienia` → `#zamow`.

---

**9. `skladanie`**

- **Cel:** pokazać, że produkt można złożyć, nie sugerując nieznanych wymiarów ani konkretnego miejsca przechowywania.
- **Treść:**
  - Eyebrow: **„PO TRENINGU”**.
  - H2: **„Po serii składasz sprzęt, nie plan.”**
  - Body: **„Maszyna ma składaną konstrukcję z zawleczką zabezpieczającą, dzięki czemu po treningu możesz ją złożyć i odłożyć.”** (Karta: opis)
  - Krok 1: **„Zwolnij zawleczkę zgodnie z instrukcją.”** (Karta: opis)
  - Krok 2: **„Złóż konstrukcję.”** (Karta: opis)
  - Krok 3: **„Zabezpiecz ją przed odłożeniem.”** (Karta: zawleczka zabezpieczająca)
  - Mikrocopy: **„Produkt jest opisany jako łatwy w montażu i jest dostarczany z instrukcją.”** (Karta: opis + opinie)
  - Podpis UGC: **„Rzeczywisty kadr biało-różowego produktu po złożeniu.”** (Karta: UGC; wyłącznie po weryfikacji wariantu i praw do publikacji)
- **Układ:** dwustanowy dyptyk `rozłożona / złożona`, ale na jasnym tle i bez podawania proporcji lub wymiarów; stan złożony niesie realne zdjęcie UGC `2-0` jako główny wizual („zdjęcie od kupującego”).
- **Rola grafiki:** wygenerowana scena z tą samą kobietą składającą maszynę obok kanapy (stan rozłożony) oraz — dla stanu złożonego — realne zdjęcie UGC `2-0` jako GŁÓWNY wizual; generacja złożonego tylko warunkowo (multi-ref g0 + UGC, gate F3A; przy FAIL wyłącznie UGC).
- **CTA:** **„Zamawiam składany Brzuszek”** → `#zamow`.

---

**12. `zamow`**

- **Cel:** zamknąć transakcję na stronie bez wariantów, bundle’i i pozornego wyboru.
- **Treść:**
  - Eyebrow: **„ZAMÓWIENIE”**.
  - H2: **„Twój Brzuszek. Jeden wariant, bez zgadywania.”**
  - Produkt: **„Brzuszek — składana maszyna do ćwiczeń brzucha i core”**. (Karta: produkt)
  - Wariant: **„Kolor: biało-różowy”**. (Karta: decyzja wykonawcza)
  - Cena produktu: **„429,00 zł”**. (Karta: cena)
  - Metody płatności: **„Przy odbiorze”**, **„BLIK”**, **„Płatność online”**. (Karta §5b)
  - Redukcja ryzyka: **„Masz 14 dni na zwrot.”** (Karta §5b)
  - Przycisk finalizujący: **„Zamawiam z obowiązkiem zapłaty”**.
  - Trust-pill: **„14 dni na zwrot”**, **„Płatność przy odbiorze”**, **„BLIK/online”**. (Karta §5b)
- **Układ:** desktop 5/7 — sticky podsumowanie produktu po lewej, formularz po prawej; mobile — packshot, cena, dane, dostawa, płatność, podsumowanie i legalny przycisk w jednej kolumnie.
- **Rola grafiki/kodu:** wyretuszowany g0; formularz z polami kontaktowymi i adresowymi, wyborem metody dostawy oraz płatności, ale bez selektora koloru.
- **Wymóg transakcyjny:** przed przyciskiem muszą być widoczne pozycje **„Dostawa: [metoda i koszt]”** oraz **„Razem: [kwota końcowa]”**; nie wolno domyślnie komunikować darmowej dostawy.
- **CTA:** wyłącznie prawnie jednoznaczne **„Zamawiam z obowiązkiem zapłaty”**.

---

**13. `final`**

- **Cel:** domknąć pozostałe pytania i dać powrót do formularza.
- **Treść FAQ:**
  - **„Jaki kolor otrzymam?”** — „Sprzedajemy wyłącznie wariant biało-różowy; w checkoutcie nie ma wyboru koloru.” (Karta: decyzja wykonawcza)
  - **„Jak reguluje się trudność?”** — „Masz 2 kąty nachylenia i 5 wysokości; wyższe ustawienie oznacza większą trudność.” (Karta: opis + g5)
  - **„Jaki jest udźwig?”** — „Deklarowany udźwig to 440 lbs, czyli około 200 kg.” (Karta: spec + g3)
  - **„Czy można ją złożyć?”** — „Tak, konstrukcja jest składana i korzysta z zawleczki zabezpieczającej.” (Karta: opis)
  - **„Czy montaż jest trudny?”** — „Produkt jest opisany jako łatwy w montażu i jest dostarczany z instrukcją.” (Karta: opis + opinie)
  - **„Co pokazuje LCD?”** — „Licznik pokazuje powtórzenia, czas i kalorie; wskazanie kalorii jest funkcją licznika, nie obietnicą spalania ani efektu sylwetkowego.” (Karta: opis; zakazy)
  - **„Jak chronione są kolana?”** — „Kolana opierają się na pogrubionym, U-kształtnym wałku piankowym zaprojektowanym z myślą o komforcie podparcia.” (Karta: opis + g2)
  - **„Jak mogę zapłacić?”** — „Przy odbiorze, BLIK-iem lub online.” (Karta §5b)
  - **„Ile mam czasu na zwrot?”** — „14 dni.” (Karta §5b)
  - Panel końcowy: **„Ustaw poziom. Zrób swoją serię. Złóż.”** (Karta: regulacja + składanie)
  - Cena: **„429,00 zł”**. (Karta: cena)
- **Układ:** dwukolumnowy accordion desktop, pojedyncza kolumna mobile; pod nim jasna karta końcowa z paskiem powtórzeń i skrótem `5 wysokości · 2 kąty · ≈200 kg`.
- **Rola grafiki/kodu:** accordion dostępny klawiaturą, bez dekoracyjnej fotografii odciągającej uwagę od odpowiedzi.
- **CTA:** **„Przejdź do zamówienia”** → `#zamow`.

## GRAFIKI

**Typy osadzenia:** `A` — scena szeroka/bleed w granicach jasnej sekcji, `B` — obraz w zamkniętym module 24 px, `C` — scena z nachodzącą kartą ofertową.

| ID | Opis kadru | Typ | Viewport desktop + mobile |
|---|---|---:|---|
| `G-HERO-LOOP` | Jasny polski salon o poranku, kobieta 28–45 w realistycznej sylwetce wykonuje crunch na wiernie odtworzonej biało-różowej maszynie; kamera zablokowana, produkt i osoba statyczne, porusza się wyłącznie firanka, roślina i światło. | C | D: 1920×1120, M: 1080×1440 |
| `G-REG-SIDE` | Czysty boczny profil A-frame z czytelną diagonalną szyną, otworami regulacji i dwoma wariantami kąta; brak strzałek oraz wypalonego tekstu. | B | D: 1600×1100, M: 1080×1350 |
| `G-PARTIE-CORE` | Ta sama kobieta w ruchu crunch, prawdziwy dywan i kanapa, pełna widoczność punktów podparcia. | B | D: 1200×1500, M: 1080×1350 |
| `G-PARTIE-GLUTE` | Potwierdzony materiałami wariant side leg raise, bez retuszu sylwetki i bez fantazyjnej scenerii. | B | D: 1200×1500, M: 1080×1350 |
| `G-PARTIE-ARMS` | Ćwiczenie ramion z linkami oporowymi i piankowymi uchwytami, maszyna pozostaje w kadrze jako źródło linek. | B | D: 1200×1500, M: 1080×1350 |
| `G-PARTIE-LEGS` | Czysty detal pasków/strzemion u podstawy — BEZ stopy (funkcja pasków niezweryfikowana), maszyna w kadrze jako kotwica; ten sam salon, bez fantazyjnej scenerii. | B | D: 1200×1500, M: 1080×1350 |
| `G-WYTRZ-DETAL` | Niski, jasny kadr konstrukcji: dwie poprzeczki podłogowe z antypoślizgowymi końcówkami, diagonalna belka, punkty łączenia; bez osoby, bez testów obciążeniowych. | B | D: 1600×1100, M: 1080×1350 |
| `G-SKLAD-ROZLOZ` | Lewy kadr dyptyku: maszyna rozłożona przy kanapie, kobieta klęka przy zawleczce (dłoń na mechanizmie, bez twarzy). | B | D: 1200×1500, M: 1080×1350 |
| `G-SKLAD-ZLOZ` | Prawy kadr dyptyku: stan złożony niesie realne zdjęcie UGC `2-0` (główny wizual, „zdjęcie od kupującego”); generacja tylko warunkowo (multi-ref g0 + UGC, gate F3A). | B | D: 1200×1500, M: 1080×1350 |

**Crop-first (bez generacji, $0):**
- Retusz `g0` (usunięcie nadruku „MERACH" z konsoli flat-fillem + crop badge'a „440 lbs" z rogu) → **packshot kanoniczny**: mid-cta, zamow, cutout warstwowy TOR-I `jak-cwiczysz`.
- UGC z opinii `2-0` (maszyna złożona na podłodze) → rehost, mały kadr dowodowy w `skladanie` z podpisem „zdjęcie od kupującego".
- `g6` (lifestyle 480×480) → co najwyżej kafel drugorzędny; NIE do hero (za mała rozdzielczość).

## FUNKCJE KONWERSJI

- **Sticky-buy (moduł kanoniczny sticky-buy@1):** po przescrollowaniu hero wjeżdża pasek z miniaturą, ceną „429,00 zł" i CTA „Zamawiam Brzuszek" → `#zamow`; na mobile przycisk pełnej szerokości.
- **Interakcja flagowa TOR-I (`jak-cwiczysz`):** trzy kontrolki stanów sterują CAŁĄ sceną — pozycja wózka na szynie (transform po ścieżce), podświetlenie aktywnego punktu podparcia (maska SVG w `--ink`), podpis kroku; stan 1 domyślny, przełączanie scrollem (mobile sticky-stage) i klikiem.
- **Count-up (tylko liczby z Karty):** `5` i `2` w `regulacja`, `≈200` w `wytrzymalosc` — animacja przy pierwszym wejściu w viewport, z `prefers-reduced-motion` → wartości statyczne.
- **Przełącznik „Łagodniej / Trudniej" (`regulacja`):** przestawia uproszczony SVG A-frame między 2 kątami i 5 pozycjami wysokości; bez skali liczbowej spoza danych.
- **Pasek powtórzeń (sygnatura):** 5 segmentów wypełnia się sekwencyjnie przy scrollu w sekcjach z sygnaturą; ostatni segment w akcencie.
- **Mikrointerakcje:** CTA hover/press (scale 0.98 + cień key), karty partii hover-lift 4 px, accordion FAQ z rotacją chevronu; wszystko ≤200 ms, 55–60 fps, CLS=0.

## RYZYKA

1. **White-label MERACH (najwyższe):** nadruk na konsoli w KAŻDYM kadrze z g0/UGC → retusz przed użyciem; generacje z NEG „no printed brand text/logo"; grep gate F6 na „MERACH"/„Shop1103659154".
2. **Zero obietnic efektu:** żadnego odchudzania, spalania, „płaskiego brzucha w X dni", body-shamingu; „kalorie" wyłącznie jako funkcja licznika LCD; bez czasów treningu („10 minut dziennie" = ZAKAZ — brak kotwicy).
3. **Wierność konstrukcji w generacjach:** model ucieka w ławeczki/rowerki/steppery — gate F3A na cechy: pochyła belka + suwający wózek + U-wałek + konsola LCD + 2 wałki + linki; każda scena z produktem multi-ref z wyretuszowanego g0.
4. **Anatomia scen ćwiczeń:** klęk na U-wałku, chwyt kierownicy, side leg raise — gate anatomii (nadgarstki/kolana/proporcje); realna sylwetka, nie fitness-modelka.
5. **Jeden wariant:** wszystkie sceny biało-różowe; czarno-niebieski NIGDZIE (nawet w tle); FAQ komunikuje brak wyboru koloru.
6. **Social-proof:** zero liczb (7 ocen / 168 szt. / odtworzenia klipów); UGC tylko z podpisem „zdjęcie od kupującego", bez gwiazdek.
7. **Transakcyjność:** „Zamawiam z obowiązkiem zapłaty" przy finalizacji; dostawa i suma widoczne przed przyciskiem; bez „darmowej dostawy" i fałszywej pilności.

archetyp-hero: C