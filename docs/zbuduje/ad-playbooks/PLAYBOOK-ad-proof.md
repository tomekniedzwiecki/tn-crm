# PLAYBOOK — kąt `proof` (authority / premium close-up; dowód prawdziwy)

> Jeden z 3 kątów zestawu startowego (`STANDARD-GRAFIKI-SKLEPY.md`). Plik: `ad_3_proof.png` (4:5).
> Czytaj po SSOT. DNA = art-direction kąta `proof` z `buildAdsInstruction()` w `wf2-ads`
> (rev3 PREMIUM, wzorzec ze starego flow `manus-full-campaign`). Kąt najbardziej wrażliwy na politykę.

## KIEDY UŻYWAĆ
Obiekcja „czy to w ogóle działa / czy nie oszustwo?" (lęk #1 rynku PL). Zaufanie budujemy przez
**AUTHORITY / klasę premium**: dramatyczny close-up detalu produktu (widać jakość materiału/
wykonania) + JEDEN uczciwy element zaufania. Wrażenie „drogiej, sprawdzonej marki" robi więcej niż
krzyk „viral". Domyślny wybór, gdy produkt faktycznie pochodzi z `/trendy` (rodowód TikToka jest
PRAWDZIWY) albo gdy KARTA PRAWDY daje uczciwy dowód (`review_stats` przy `source='detail'`).

## ⚠️ REGUŁA KRYTYCZNA — DOWÓD PRAWDZIWY, NIE UDAWANY
- **`proof` ≠ fałszywy testimonial-człowiek.** AI-awatar = WYŁĄCZNIE prezenter DEMONSTRUJĄCY
  produkt, NIGDY „zadowolony klient" z wymyśloną opinią (Meta deceptive practices + FTC; zaufanie
  do UGC-człowieka 81% vs AI 63% — udawany testimonial spala i tak).
- **Liczby TYLKO z kotwicą (ZG4):** `review_stats` / oceny wyłącznie gdy `ali_snapshot.source=
  'detail'`; `sold_volume` wg §sold KARTY PRAWDY — liczba Ali jest GLOBALNA ≠ nasz sklep, więc
  „X sprzedanych u nas" = FAŁSZ = ZAKAZ. Dozwolona co najwyżej JEDNA nieprzypisana fraza bez
  licznika („sprawdzony produkt, tysiące zamówień na świecie") przy ≥1000. Konkretna prawdziwa
  liczba > „tysiące zadowolonych".
- **„Hit z TikToka" / „Viralowy hit" dozwolone TYLKO gdy produkt faktycznie z `/trendy`** (rodowód
  z wzorca TikToka istnieje). Inaczej: dyskretna pieczęć „Sprawdzony wybór" — bez claimu virala.

## DNA LAYOUTU
- **AUTHORITY / PREMIUM CLOSE-UP:** dramatyczny, macro CLOSE-UP produktu — detal materiału/
  mechanizmu/wykonania, **płytka głębia ostrości** (bokeh tła), przemyślane, „drogie" światło.
  To odróżnia proof od `demo` (CAŁY produkt + WIELKI hook) i `problem` (split-screen), ZG3.
- **JEDEN element zaufania złożony elegancko w kompozycję:** albo **prawdziwe liczby** z sekcji
  „PRAWDZIWE LICZBY" / KARTY PRAWDY (ocena/„ponad X zamówień" — z kotwicą), albo **dyskretna
  pieczęć** („Hit z TikToka" gdy z `/trendy`, inaczej „Sprawdzony wybór") jako subtelny element
  graficzny. Jeden, nie kilka — nadmiar „dowodów" obniża wiarygodność.
- **Typografia elegancka, dużo światła i oddechu** — klasa premium, nie „krzykliwy socialowy baner".
  Minimalizm buduje autorytet: im mniej elementów, tym drożej wygląda.
- **Logo** mini-marki 8–12% wysokości, niecentralne.
- **CTA-pigułka „Kup teraz" i badge = OPCJONALNE** — dodawaj tylko, gdy wzmacniają kompozycję;
  domyślnie wystarcza close-up + jeden element zaufania.
- **Tło** dobierz pod klasę premium (ciemne/kontrastowe lub jasne, „studyjne-drogie" z bokeh) —
  spójne z akcentem marki. To WYJĄTEK od „ZAKAZ ciemnych teł" sklepów (reguła feedu, nie landingu),
  ale ciemne tło NIE jest już obowiązkowe — liczy się premium detal i światło, nie sam mrok.

## COPY PL (przykłady — headline 2–6 słów)
- „Hit prosto z TikToka" (gdy prawda / `/trendy`)
- „Sprawdzony wybór" (gdy produkt NIE z `/trendy`)
- „Sprawdzony przez tysiące" (bez licznika, gdy ≥1000 globalnie)
- „Ocena 4,8 — zobacz czemu" (TYLKO gdy `source='detail'` i liczba prawdziwa)
- Badge (OPCJONALNY): „Hit z TikToka" (gdy `/trendy`) / „Sprawdzony wybór" / „Płatność przy odbiorze".
- primary_text: 1. zdanie = dowód/rodowód, 2. korzyść, lekkie CTA „Sprawdź". Zero zmyślonych liczb.

## ZAKAZY
- ⛔ **Fałszywy testimonial ludzki** / zmyślona cytowana opinia / twarz „klienta" z wymyśloną
  historią (Meta deceptive + FTC).
- ⛔ **Gwiazdki, liczby, oceny, recenzje ZMYŚLONE** albo gdy `source≠'detail'`.
- ⛔ „X sprzedanych u nas" / licznik globalnej sprzedaży Ali jako naszej (ZG4 §sold).
- ⛔ **Interfejs / logo TikToka**, obce marki, znaki wodne platform.
- ⛔ „Hit z TikToka" gdy produkt NIE pochodzi z `/trendy` (zmyślony rodowód) — wtedy „Sprawdzony wybór".
- ⛔ Kilka konkurujących „dowodów" naraz / krzykliwy socialowy zgiełk — JEDEN element zaufania,
  klasa premium.
- ⛔ Countdowny / fałszywa pilność / „dostawa 24h".

## TYPOWE FAIL-e BRAMEK
- **G5 (policy):** proof wygenerował „zadowolonego klienta" z opinią zamiast prezentera/detalu. Fix:
  brief jawnie „premium close-up produktu + JEDEN uczciwy element zaufania, NIE testimonial";
  pass-2 policy sprawdza intencję kadru.
- **G5 (policy):** zmyślone „4,9 · 2500 opinii" mimo `source≠'detail'`. Fix: liczby zablokowane
  na G0 gdy source≠detail; bez kotwicy = grafika z pieczęcią „Sprawdzony wybór", bez liczby.
- **G3 (wierność):** close-up + płytka głębia ukryły zniekształcenie produktu (bokeh maskuje kształt).
  Fix: side-by-side vs paszport mimo close-upu; detal MUSI być realnym detalem z referencji.
- **G4 (tekst):** pieczęć/liczba scramble'uje diakrytyki. Fix: krótka, ZG6 fallback (drop pieczęć
  zamiast łamać litery), quality wysoka.
- **G5 (różnorodność):** proof zlał się z demo (oba „hero produktu"). Fix: proof = MACRO close-up
  detalu + płytka głębia + jeden element zaufania, elegancko/„z oddechem"; demo = CAŁY produkt +
  WIELKI hook. pHash rozstrzyga.
