# PROTOKOŁY — ODBIÓR MVP oraz PRZEKAZANIE STERÓW — WZORY

Dwa niezależne wzory w jednym pliku. Wykonawca: **Tomasz Niedźwiecki AI** (JDG, ul. Grawerska 30L, 51-180 Wrocław, NIP 6972240255). Zamawiający/Operator: **{{KLIENT_NAZWA}}**.

---

## A. PROTOKÓŁ ODBIORU MVP

Sporządzony w dniu **{{DATA_ODBIORU}}** do umowy o wykonanie i wdrożenie aplikacji z dnia **{{DATA_UMOWY}}** (dalej: „Umowa" / „Umowa Budowy"), dotyczący aplikacji **{{ROBOCZA_NAZWA_APLIKACJI}}**. Odbiór następuje zgodnie z **procedurą odbioru z § 4 Umowy** (m.in. brak uwag Zamawiającego w terminie 7 dni od zgłoszenia MVP do odbioru = dokonanie odbioru).

### 1. Przedmiot odbioru
Przedmiotem odbioru jest **MVP** aplikacji wraz z funkcjami określonymi w **Załączniku nr 1 do Umowy**. Zestawienie funkcji poddanych odbiorowi:

| Lp. | Funkcja (wg Załącznika nr 1) | Zrealizowana | Uwagi |
|----:|------------------------------|:------------:|-------|
| 1 | {{FUNKCJA_1}} | ☐ tak / ☐ nie | {{UWAGA_1}} |
| 2 | {{FUNKCJA_2}} | ☐ tak / ☐ nie | {{UWAGA_2}} |
| 3 | {{FUNKCJA_3}} | ☐ tak / ☐ nie | {{UWAGA_3}} |
| … | {{FUNKCJA_N}} | ☐ tak / ☐ nie | {{UWAGA_N}} |

### 2. Uwagi Zamawiającego
{{UWAGI_OGOLNE — lista usterek / braków / drobnych poprawek, jeśli są}}

### 3. Decyzja o odbiorze
- ☐ **Odbiór bez zastrzeżeń** — MVP zgodne z Załącznikiem nr 1.
- ☐ **Odbiór z zastrzeżeniami** — MVP odebrane; usterki z pkt 2 (niemające charakteru istotnego / nieuniemożliwiające korzystania) Wykonawca usunie w terminie **{{TERMIN_USTEREK}}**.
- ☐ **Odmowa odbioru** — z powodu wad istotnych opisanych w pkt 2; nowy termin odbioru: **{{NOWY_TERMIN}}**.

### 4. Skutki
1. **Dzień podpisania niniejszego protokołu (odbiór bez zastrzeżeń lub z zastrzeżeniami) — albo bezskuteczny upływ 7-dniowego terminu na uwagi (§ 4 ust. 2 Umowy) — jest datą odbioru** i **początkiem biegu 30-dniowej gwarancji** na błędy, liczonej od daty odbioru (§ 4 ust. 3 Umowy).
2. Odbiór z zastrzeżeniami nie zwalnia Wykonawcy z obowiązku usunięcia usterek wymienionych w pkt 2/3.
3. Protokół nie modyfikuje pozostałych postanowień Umowy (w tym Udziału, opieki i zasad przeniesienia praw).

|  |  |
|---|---|
| **Wykonawca** | **Zamawiający** |
| ................................ | ................................ |
| Tomasz Niedźwiecki | {{KLIENT_REPREZENTANT}} |

---

## B. PROTOKÓŁ PRZEKAZANIA STERÓW

Sporządzony w dniu **{{DATA_PRZEKAZANIA}}** do umowy o wykonanie i wdrożenie aplikacji z dnia **{{DATA_UMOWY}}** (dalej: „Umowa" / „Umowa Budowy"), dotyczący aplikacji **{{ROBOCZA_NAZWA_APLIKACJI}}**.

### 1. Podstawa przekazania
- ☐ Osiągnięcie **50 stałych klientów** aplikacji w dniu **{{DATA_OSIAGNIECIA_50}}**.
- ☐ Upływ **12 miesięcy od Startu produkcyjnego** (§ 1 ust. 4 Umowy) — stery przechodzą na Operatora niezależnie od liczby klientów.
- ☐ Inna uzgodniona podstawa: **{{PODSTAWA_UZGODNIONA}}**.

Z tym dniem Zamawiający (**Operator**) przejmuje **operacyjne prowadzenie** biznesu, zgodnie z Umową.

### 2. Obowiązki operacyjne przekazane Operatorowi
- ☐ bieżąca obsługa klientów i komunikacja;
- ☐ obsługa płatności i rozliczeń jako merchant of record (własny Stripe / kanał płatności);
- ☐ marketing, sprzedaż i pozyskiwanie klientów;
- ☐ obsługa treści i codzienna administracja aplikacją (poziom operatora);
- ☐ inne: **{{INNE_OBOWIAZKI}}**.

### 3. Co pozostaje po stronie Wykonawcy
Po przekazaniu sterów Wykonawca nadal świadczy — na zasadach Umowy:
- **opiekę / utrzymanie** aplikacji (dostępność, aktualizacje bezpieczeństwa, obsługa błędów w ramach opieki);
- **doradztwo strategiczne** (rola doradcy);
- inne uzgodnione świadczenia: **{{INNE_SWIADCZENIA_WYKONAWCY}}**.

**Udział** Wykonawcy (rev-share) obowiązuje nadal na zasadach Umowy — przekazanie sterów **nie** jest wykupem Udziału (wykup reguluje § 9 Umowy oraz odrębna umowa wykupu).

### 4. Potwierdzenie
Strony potwierdzają dokonanie przekazania sterów w zakresie z pkt 2 oraz kontynuację świadczeń z pkt 3.

|  |  |
|---|---|
| **Wykonawca** | **Operator** |
| ................................ | ................................ |
| Tomasz Niedźwiecki | {{KLIENT_REPREZENTANT}} |

---

## NOTATKI (do usunięcia)

- **Kiedy używać (A):** przy odbiorze MVP. Kluczowe: **data odbioru = start 30-dniowej gwarancji** (§ 4 ust. 3 Umowy) — dlatego protokół musi być datowany i podpisany. Odbiór działa też **milcząco**: brak uwag Zamawiającego w 7 dni od zgłoszenia MVP = odbiór (§ 4 ust. 2). Listę funkcji przepisz 1:1 z Załącznika nr 1 do umowy (SSOT).
- **Kiedy używać (B):** przy osiągnięciu 50 klientów (lub innym uzgodnionym progu), gdy klient przejmuje operacyjnie biznes. Podkreśla, że **Udział i opieka trwają dalej** — to nie koniec współpracy ani wykup.
- **Do uzupełnienia:** daty, nazwa aplikacji, lista funkcji + uwagi, reprezentanci; w B — podstawa przekazania i checklisty obowiązków.
- **Forma podpisu:** dokumentowa wystarczy (podpis odręczny na wydruku albo podpis elektroniczny/skan). To nie umowa przenosząca prawa — QES nie jest potrzebny.
- Nie myl protokołu B z **umową wykupu Udziału** (`UMOWA-WYKUPU-UDZIALU-DRAFT.md`) — to dwa różne zdarzenia.
