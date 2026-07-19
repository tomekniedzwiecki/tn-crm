# SEKCJE-INTERAKTYWNE

> **⚠️ Stany „z jednej klatki" = pułapka SSIM (masażer 19.07):** gdy stany A/B/C wyprowadzasz
> z tej samej sceny (spójność!), baza obrazów potrafi mieć SSIM ~0.98 — realną różnicę MUSI
> dowieźć warstwa UI/nakładek. Test stanów mierz na WYRENDEROWANYM stanie (obraz+UI razem),
> a SSIM samych obrazów bazowych policz PRZED budową jako wczesny sygnał ryzyka. — TOR-I: osobny proces dla sekcji interaktywnych

**Status: OBOWIĄZUJE (2026-07-17; feedback Tomka po demo Loczka „Trzy ruchy do loka":
sekcja interaktywna wymaga OSOBNEGO procesu — projektowania, testowania i dopracowania
do skutku, żeby finalny efekt był ZGODNY Z PLANEM).**

## ZASADA NADRZĘDNA
Sekcja interaktywna nie jest „sekcją + dołożoną animacją". To DEMONSTRACJA korzyści,
która musi zostać zaprojektowana (kontrakt), zbudowana w izolacji, przetestowana
automatycznie na stanach i doprowadzona do zgodności ze SPEC-I — albo świadomie
zdegradowana do wariantu statycznego. Martwa interakcja (klik bez widocznej zmiany
sceny) jest GORSZA niż jej brak. Root cause demo Loczka: makieta zaprojektowała
statyczne karty + ozdobny toggle, kod wiernie to przeniósł (Z2), gate F6(b) złapał
martwotę za późno i tylko dla interakcji oznaczonych jako flagowe.

## T0 — KWALIFIKACJA (w F2, na makietach; NIE w trakcie kodowania)
Sekcja wchodzi na TOR-I jeśli spełnia ≥1:
- niesie interakcję flagową z INTERAKCJE-KATALOG (#1–9, #13, #15);
- jest sekcją „jak działa" / demo 1-2-3 / symulacją / porównaniem przed-po /
  konfiguratorem / wyborem wariantu na packshocie.
Sekcja demo „jak działa" jest DOMYŚLNIE TOR-I. Kwalifikację zapisuje plan/choreograf
tagiem `TOR-I` + poziom L3 przy sekcji. SKUTEK: makieta tej sekcji MUSI pokazać STANY
demonstracji (kadr per krok), nie statyczną kartę — inaczej regeneracja makiety przed
akceptem (Z2: braki naprawiamy GRAFIKĄ, nie kodem).

## T1 — SPEC-I.md (kontrakt, przed kodem)
Per sekcja: `FABRYKA-*/<slug>/interakcje/<sekcja>-SPEC-I.md`. Format (szablon SPEC-a
z INTERAKCJE-KATALOG + obowiązkowe): CEL DEMONSTRACYJNY = co klient ma ZROZUMIEĆ;
STORYBOARD STANÓW A→trigger→B + klatki pośrednie; ASSETY PER STAN — realne kadry/sceny
(spina się z polityką PRODUKT W SCENACH — każdy stan to osobne ujęcie!); KRYTERIA
AKCEPTACJI MIERZALNE — SSIM stanów, czas przejścia, fps, INP, viewporty, no-JS,
reduced-motion. SPEC-I wchodzi do briefu MAKIETY (żeby stany były na kadrze) i do
briefu kodera.

## T2 — SANDBOX (implementacja izolowana)
Sekcja kodowana jako osobny plik `interakcje/<sekcja>-sandbox.html` (samodzielny: te
same tokeny :root + fonty co landing, tylko ta sekcja). Iterowana do skutku ZANIM
trafi do index.html. Koder = gpt-5.6-sol, najwyższy wykonalny effort.

## T3 — TEST AUTOMATYCZNY INTERAKCJI (detail-lint --probe / chrome-devtools MCP)
Ładuj sandbox → assety `naturalWidth>0` → zrzut STANU A → wykonaj trigger → 2–3 zrzuty
W TRAKCIE + zrzut STANU B → asercje:
- SSIM(A,B) < 0.9 w oczekiwanym regionie (realna zmiana; inaczej FAIL martwej interakcji);
- klatki pośrednie ≠ A i ≠ B (przejście istnieje, nie skok);
- 0 błędów konsoli; czas przejścia w widełkach SPEC-I;
- działa 390px (tap ≥44px) i 1280px; reduced-motion → funkcja działa, zero ruchu
  mimowolnego;
- WERDYKT VISION na klatkach: „czy to DEMONSTRUJE cel ze SPEC-I?" TAK/NIE.
Wynik → `interakcje/<sekcja>-test/` (A/mid/B × 2 viewporty + werdykt.txt).

## T4 — PĘTLA DO ZGODNOŚCI Z PLANEM
Iteruj T2↔T3 aż wszystkie kryteria SPEC-I zielone (rewrite-not-patch przy istotnym
odchyleniu). LIMIT N=4. Po N bez sukcesu → ŚWIADOMY DOWNGRADE: wariant statyczny
wysokiej jakości (sekwencja zdjęć / karty ze stanami) + wpis do LEDGER.md z powodem
i datą. NIGDY martwa resztka.

## T5 — MONTAŻ i T6 — DEFINICJA GOTOWE
Zielony sandbox → montaż markerowy do index.html → ponowny T3 na żywej stronie
(regresja integracji). Sekcja TOR-I GOTOWA gdy w archiwum: SPEC-I.md + sandbox.html +
klatki testu (A/mid/B × 2 viewporty) + werdykt vision. Brak = F6 FAIL. Downgrade =
„gotowe" tylko z wpisem LEDGER.

## ANTY-WZORCE (poza katalogiem)
Toggle zmieniający tylko `.is-active` przycisku · karta „jak działa" bez zdjęcia kroku ·
zdjęcie=filtr CSS udający stan gdy filtr nic nie ukrywa (Latarek) · demonstracja
degradowana do „mikro-interakcji" żeby ominąć gate.
