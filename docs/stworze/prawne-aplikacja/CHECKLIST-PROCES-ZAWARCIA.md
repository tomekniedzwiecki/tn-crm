# Checklista procesu: od leada do startu budowy aplikacji

> **Metryczka**
> - **Status:** DRAFT do weryfikacji Tomka
> - **Data sporządzenia:** 2026-07-21
> - **Wersja:** v1
> - **Do czego służy:** operacyjna checklista prawno-procesowa lejka /aplikacja — kolejność kroków, kto co robi, jakim dokumentem i gdzie są pułapki (zwłaszcza konsumenckie). Nie zastępuje umów — porządkuje ich użycie.
> - **Komplet dokumentów** (folder `docs/stworze/prawne-aplikacja/`): Regulamin, Umowa Budowy v4 (+ Załączniki 1–4), Oświadczenie statusu kontrahenta, Zgoda „Inspiracje", NDA (jednostronne / wzajemne), Przewodnik QES, Polityka Prywatności /aplikacja, Aneks zmiany zakresu, Protokół odbioru i przekazania, Umowa wykupu Udziału.

---

## Mapa procesu (skrót)

```
1. Rozmowa z AI (darmowa / 49 zł)
      ↓
2. Rezerwacja 500 zł (w pełni zwrotna)
      ↓
3. Rozmowa 1:1 + plan przedsięwzięcia   [opcjonalnie: NDA]
      ↓
4. Wysyłka kompletu do podpisu
      ↓
5. Podpis QES (albo papier) + faktura
      ↓
6. Kickoff / start prac   [w trakcie: aneksy zmiany zakresu]
      ↓
7. Odbiór MVP (protokół)
      ↓
8. Rozruch do 50 klientów
      ↓
9. Przekazanie sterów (protokół)
      ↓
10. (kiedyś) Wykup Udziału
```

---

## Krok po kroku

### 1. Rozmowa z Asystentem AI
- **Kto:** Klient + Asystent AI.
- **Dokument / podstawa:** **Regulamin** (akceptacja przed rozmową), **Polityka Prywatności /aplikacja**. Pierwsza rozmowa darmowa; każda kolejna 49 zł.
- **Pułapki:**
  - **49 zł = usługa cyfrowa na żądanie.** Przy płatności musi być checkbox: żądanie natychmiastowego wykonania + przyjęcie do wiadomości utraty prawa odstąpienia po pełnym wykonaniu (**art. 38 ust. 1 pkt 1 UoPK** — mechanizm usługowy przesądzony w Regulaminie §8). Przy odstąpieniu w trakcie — zapłata proporcjonalna (**art. 35 UoPK**). Sprawdź brzmienie checkboxa w kasie.
  - Przycisk zamówienia musi wskazywać **obowiązek zapłaty** (art. 17 UoPK — np. „Zamawiam z obowiązkiem zapłaty").
  - Asystent AI **wyraźnie oznaczony jako AI** (art. 50 AI Act, od 2.08.2026).
  - Potwierdzenie umowy na **trwałym nośniku** (e-mail) po zakupie.

### 2. Rezerwacja współpracy — 500 zł
- **Kto:** Klient płaci; Tomek przyjmuje.
- **Dokument / podstawa:** **Regulamin § 9** (Umowa Rezerwacyjna zawierana przez wpłatę po akceptacji Regulaminu). Potwierdzenie na trwałym nośniku.
- **Pułapki:**
  - **500 zł jest W PEŁNI ZWROTNE** — to **zaliczka**, **nie zadatek** (wyłączony art. 394 k.c.). Nie obiecywać „przepada".
  - Zwrot: 7 dni od decyzji o niezawieraniu współpracy; automatyczny zwrot, jeśli umowa nie zawarta w 60 dni [wg regulaminu, do potwierdzenia].
  - **Sama rezerwacja 500 zł NIE tworzy projektu w systemie** (decyzja Tomka 21.07 — projekt wf2/wfa powstaje dopiero po pełnej płatności za budowę). Nie startować prac na samej rezerwacji.

### 3. Rozmowa 1:1 + plan przedsięwzięcia  ·  [opcjonalnie NDA]
- **Kto:** Tomek + Klient.
- **Dokument / podstawa:** czynności przygotowawcze **nieodpłatne** (§ 9 ust. 2 Regulaminu); **plan przedsięwzięcia** (zakres MVP, model przychodów, harmonogram). Kontakt w 3 dni robocze od wpłaty [do potwierdzenia].
- **Opcjonalnie NDA:** jeśli **Klient** chce zabezpieczyć swój pomysł przed ujawnieniem szczegółów — **NDA jednostronne** (Tomek jako zobowiązany) albo **NDA wzajemne** (gdy obie strony wymieniają poufne know-how). NDA podpisać **przed** ujawnieniem wrażliwych szczegółów.
- **Pułapki:**
  - Poufność i tak wynika z § 13 Umowy Budowy (dwustronna) — NDA to warstwa **przed** umową, na etapie rozmów.
  - Nie składać wiążących obietnic wyników (§ 14 Regulaminu — zobowiązanie starannego działania, brak gwarancji przychodu).
  - Ustalić **status kontrahenta** już tu (Konsument / PNPK / Przedsiębiorca / spółka) — determinuje kształt umowy i faktury.

### 4. Wysyłka kompletu do podpisu
- **Kto:** Tomek → Klient.
- **Dokument / paczka:**
  1. **Umowa Budowy v4** (uzupełnione `{{...}}`: dane stron, `{{FEE_PERCENT}}`=10, `{{TERMIN_TYGODNI}}`, nazwa robocza),
  2. **Załącznik 1** — Zakres MVP (zaakceptowany mailowo),
  3. **Załącznik 2** — DPA (art. 28 RODO),
  4. **Załącznik 3** — Pouczenie o odstąpieniu + formularz + **oświadczenie o żądaniu rozpoczęcia prac** (tylko Konsument/PNPK),
  5. **Załącznik 4** — komponenty open-source + oświadczenie AI,
  6. **Oświadczenie o statusie kontrahenta,**
  7. **Zgoda „Inspiracje"** — **opcjonalna**, osobny checkbox/dokument, niezaznaczony domyślnie,
  8. **Przewodnik QES,**
  9. (dla aplikacji) **Polityka Prywatności aplikacji** — do wdrożenia w produkcie (Załącznik 1 wymienia ją w zakresie MVP).
- **Pułapki:**
  - **Konsument/PNPK — kluczowa pułapka odstąpienia:** domyślnie prace **nie ruszają przez 14 dni** (prawo odstąpienia, § 14). Aby zacząć wcześniej, Klient musi złożyć **wyraźne żądanie rozpoczęcia prac** (Załącznik 3). Bez tego żądania **nie zaczynać budowy** — inaczej ryzyko braku zapłaty za wykonane prace przy odstąpieniu.
  - **Skutki wcześniejszego rozpoczęcia:** przy odstąpieniu przed pełnym wykonaniem — zapłata proporcjonalna wg **Harmonogramu wartości Etapów** (art. 35 UoPK). Po pełnym wykonaniu za wyraźną zgodą i po pouczeniu — prawo odstąpienia **wygasa** (art. 38 UoPK).
  - **Zgoda „Inspiracje" jest dobrowolna** — brak zgody nie wpływa na warunki. Nie łączyć jej z akceptacją umowy w jeden „pakiet".
  - Wzór umowy udostępnić **przed** zawarciem (transparencja przedkontraktowa, art. 12 UoPK).

### 5. Podpis + faktura
- **Kto:** obie strony podpisują; Tomek wystawia fakturę.
- **Dokument / podstawa:** **Umowa Budowy § 16** — forma **pisemna** albo **QES obu stron**. Podpis wg **Przewodnika QES**.
- **Pułapki:**
  - **Przeniesienie praw autorskich wymaga formy pisemnej pod rygorem nieważności** (art. 53 pr. aut.). **Skan, zdjęcie podpisu ani Profil Zaufany NIE wystarczą.** QES obu stron = forma pisemna (art. 78¹ k.c.).
  - Przy PAdES: drugi podpisujący dokłada podpis do **oryginalnego** podpisanego pliku (ponowny zapis PDF unieważnia pierwszy podpis).
  - **Faktura:** cena budowy **12 500 zł netto (15 375 zł brutto)**, płatna z góry w całości przy zawarciu; **rezerwacja 500 zł zaliczana** → do zapłaty pozostaje ok. **14 875 zł brutto**. Ustalić z księgową: faktura zaliczkowa vs końcowa, stawka VAT, moment obowiązku podatkowego. Na życzenie Klienta — faktura.
  - **Prawa autorskie przechodzą dopiero z chwilą PÓŹNIEJSZEGO z: odbioru danego rezultatu i zapłaty CAŁOŚCI ceny za budowę** (§ 8 ust. 2) — nie „z chwilą podpisu".

### 6. Kickoff / start prac  ·  [w trakcie: aneksy]
- **Kto:** Tomek (fabryka TN App) + Klient (materiały, akcepty).
- **Dokument / podstawa:** projekt `wfa_*` powstaje po pełnej płatności; **bramka zgody konsumenckiej** — prace nie startują, dopóki nie ma żądania rozpoczęcia (art. 21 ust. 2 UoPK) albo nie minęło 14 dni. Termin: `{{TERMIN_TYGODNI}}` od spełnienia: zapłata + materiały + akcept Zakresu MVP.
- **Zmiany zakresu w trakcie:** **Aneks zmiany zakresu** dla nowych funkcji spoza Zakresu MVP (wycena osobno, § 3 ust. 2). Poprawki błędów i drobne korekty — w cenie.
- **Pułapki:**
  - Nie startować bez **kompletu materiałów i akceptu Zakresu MVP** (czas oczekiwania wydłuża termin).
  - Każda „nowa funkcja" bez aneksu = ryzyko sporu o zakres w cenie. Aneks **przed** wykonaniem.
  - Akcepty robocze (zakres, nazwa, harmonogram) mogą iść mailowo (§ 16 ust. 5); **zmiana samej umowy** — tylko forma pisemna/QES.

### 7. Odbiór MVP
- **Kto:** Tomek prezentuje; Klient odbiera.
- **Dokument / podstawa:** **Protokół odbioru** (część „Protokół odbioru i przekazania"). Start produkcyjny po akceptacji (§ 4). **30-dniowa gwarancja** usuwania błędów od startu.
- **Pułapki:**
  - Zgodność usługi cyfrowej wobec Konsumenta/PNPK (rozdz. 5b UoPK) — protokół nie wyłącza odpowiedzialności ustawowej.
  - Uwagi z prezentacji: rozróżnić „poprawka w cenie" vs „nowa funkcja = aneks".

### 8. Rozruch do 50 klientów
- **Kto:** Tomek prowadzi rozruch; Klient jako operator.
- **Dokument / podstawa:** § 1 i § 6 umowy — Udział **10% Przychodu** naliczany od startu, pobór przez **Stripe Connect** (Partner = *merchant of record*). Stała opieka i serwis bez dodatkowych opłat (§ 7).
- **Pułapki:**
  - **Wyłączny kanał płatności** — Partner przyjmuje płatności tylko przez zintegrowane kanały (zakaz omijania systemu, § 6 ust. 4).
  - Koszty zmienne (prowizje Stripe, SMS, API, AI przy wolumenie) obciążają **Partnera** od 1. dnia (§ 11).
  - Infrastruktura: 12 mies. płaci Tomek, potem podział 90/10.

### 9. Przekazanie sterów
- **Kto:** Tomek → Partner (samodzielne prowadzenie).
- **Dokument / podstawa:** **Protokół przekazania** (przekazanie prowadzenia; Tomek pozostaje doradcą i utrzymuje płatności/opiekę do wykupu). Repo *read-only* na żądanie po zapłacie całości (§ 8 ust. 9 lit. b).
- **Pułapki:**
  - **Udział trwa do wykupu** także po przekazaniu sterów / wypowiedzeniu opieki (§ 6 ust. 2, § 15 ust. 3) — to nie koniec Udziału.
  - Pełne repo + komplet dostępów produkcyjnych + administracja infrastrukturą przechodzą dopiero **przy wykupie** (§ 8 ust. 9 lit. a, § 9 ust. 2).

### 10. (kiedyś) Wykup Udziału
- **Kto:** Partner wykupuje.
- **Dokument / podstawa:** **Umowa wykupu Udziału**; § 9 umowy — po 12 mies. od startu, cena = **36× średniej miesięcznej kwoty Udziału** z ostatnich 12 mies.
- **Pułapki:**
  - Z chwilą zapłaty wykupu wygasają Udział i opieka (§ 7); Tomek przekazuje administrację, dostępy i pełne repo.
  - Zbycie biznesu z pominięciem procedury: kary tylko wobec Przedsiębiorcy; wobec Konsumenta/PNPK — wymagalność ceny wykupu (§ 10).

---

## Szybka ściąga: dokument → moment użycia

| Dokument | Moment |
|---|---|
| Regulamin + Polityka Prywatności /aplikacja | akceptacja przed rozmową / rezerwacją |
| NDA (jednostronne / wzajemne) | opcjonalnie, przed ujawnieniem szczegółów (krok 3) |
| Umowa Budowy + Załączniki 1–4 | wysyłka do podpisu (krok 4–5) |
| Oświadczenie statusu kontrahenta | z umową (krok 4–5) |
| Załącznik 3 — żądanie rozpoczęcia prac | Konsument/PNPK, z umową; **warunek startu przed 14 dniami** |
| Zgoda „Inspiracje" | opcjonalnie, osobno (krok 4) |
| Przewodnik QES | z paczką do podpisu (krok 4) |
| Faktura (zaliczkowa/końcowa) | przy zawarciu / pełnej płatności (krok 5) |
| Aneks zmiany zakresu | w trakcie budowy, przy nowych funkcjach (krok 6) |
| Protokół odbioru | odbiór MVP (krok 7) |
| Protokół przekazania | przekazanie sterów (krok 9) |
| Umowa wykupu Udziału | wykup (krok 10) |
| Polityka Prywatności aplikacji (wzór Partnera) | wdrożenie w produkcie (krok 6–7, Zakres MVP) |

---

## NOTATKI ROBOCZE (do usunięcia przed użyciem operacyjnym)

1. **[DO POTWIERDZENIA] Bramka zgody konsumenckiej dla TN App.** Opisałem ją analogicznie do mechanizmu z Umowy Budowy (§ 14, art. 21 ust. 2 UoPK). CLAUDE.md opisuje szczegółowo bramkę `work_consent` dla **wf2 (sklepy)**; dla **wfa (aplikacje)** trzeba potwierdzić, czy istnieje analogiczna twarda bramka w portalu /twoj-biznes TN App i czy fabryka sprawdza ją przed startem Etapu 1. Jeśli nie — wdrożyć albo pilnować ręcznie wg tej checklisty.
2. **[DO POTWIERDZENIA] Faktura — zaliczkowa vs końcowa i VAT.** Zostawiłem oba warianty; moment obowiązku VAT (w tym przy poborze application_fee w Stripe) do ustalenia z księgową (spójne z notatką v4 umowy). Kwota po rezerwacji ~14 875 brutto zakłada 23% VAT.
3. **[DO POTWIERDZENIA] Terminy z Regulaminu.** 3 dni robocze na kontakt po wpłacie i 60-dniowy auto-zwrot rezerwacji są w Regulaminie oznaczone jako [DO POTWIERDZENIA — TOMEK]. Ta checklista je powtarza — zsynchronizować po decyzji.
4. **[DO POTWIERDZENIA] Które NDA domyślnie.** Wpisałem: jednostronne (Tomek zobowiązany, chroni pomysł Klienta) jako domyślne dla ostrożnego Klienta; wzajemne, gdy obie strony wnoszą know-how. Potwierdź domyślny wybór i czy NDA w ogóle proponować proaktywnie, czy tylko na prośbę Klienta.
5. **Reżim 49 zł — art. 38 ust. 1 pkt 1 UoPK (zsynchronizowano z Regulaminem §8).** Regulamin przesądził mechanizm usługowy (usługa cyfrowa wykonywana natychmiast na żądanie): utrata prawa odstąpienia po pełnym wykonaniu za wyraźną zgodą, zapłata proporcjonalna przy odstąpieniu w trakcie (art. 35). Checklista używa już tylko art. 38 ust. 1 pkt 1 — wariant „pkt 13" wycofany z treści operatywnej.
6. **[DO POTWIERDZENIA] Prawa autorskie a moment przejścia.** Podkreśliłem, że prawa przechodzą z chwilą **późniejszego** z: odbioru danego rezultatu i zapłaty CAŁOŚCI ceny (§ 8 ust. 2), nie z podpisu. Istotne przy fakturze zaliczkowej — jeśli płatność jest rozbita, do pełnej zapłaty (i odbioru) prawa nie przechodzą (przed tym: wąska licencja testowa).
