# PLAYBOOK — kąt `proof` (social / viral; dowód prawdziwy)

> Jeden z 3 kątów zestawu startowego (`STANDARD-GRAFIKI-SKLEPY.md`). Plik: `ad_3_proof.png` (4:5).
> Czytaj po SSOT. DNA = ulepszony `angleArt('proof')` z `wf2-ads`. Kąt najbardziej wrażliwy na politykę.

## KIEDY UŻYWAĆ
Obiekcja „czy to w ogóle działa / czy nie oszustwo?" (lęk #1 rynku PL). Dowód społeczny jako
GŁÓWNY wizual: energia viralowa („Hit z TikToka"), realna liczba z kotwicą, surowy socialowy
vibe zamiast wypolerowanej reklamy (native bije polished na zimnym ruchu; 42% top-performerów DTC
to „brzydkie"/lo-fi). Domyślny wybór, gdy produkt faktycznie pochodzi z `/trendy` (rodowód TikToka
jest PRAWDZIWY) albo gdy KARTA PRAWDY daje uczciwy dowód (`review_stats` przy `source='detail'`).

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
  z wzorca TikToka istnieje). Inaczej to zmyślona pieczęć = CUT.

## DNA LAYOUTU
- Produkt-bohater na **CIEMNYM lub mocno kontrastowym tle** (odróżnia proof od demo=paleta sceny
  i problem=blok koloru marki, ZG3) + wyrazista PIECZĘĆ/stempel „Hit z TikToka" / „Viralowy hit"
  jako element graficzny (nie zdanie).
- Surowszy, socialowy vibe: wyrazista skondensowana typografia, energia „native".
- Opcjonalny wariant social-proof: opinia 5★ z KARTY PRAWDY (prawdziwa, `source='detail'`) jako
  główny wizual + mały produkt — TYLKO gdy dowód jest realny i uczciwy.
- Logo mini-marki 8–12%, niecentralne. CTA-pigułka „Kup teraz" na kontraście.
- **Uwaga na „ZAKAZ ciemnych teł" sklepów:** proof MOŻE użyć ciemnego/kontrastowego tła (to reguła
  reklam feedu, nie landingów) — ale to WYJĄTEK kątu proof, spójny z akcentem marki, nie domyślny
  ciemny motyw całego zestawu.

## COPY PL (przykłady — headline 3–6 słów)
- „Hit prosto z TikToka" (gdy prawda)
- „Sprawdzony przez tysiące" (bez licznika, gdy ≥1000 globalnie)
- „Ocena 4,8 — zobacz czemu" (TYLKO gdy `source='detail'` i liczba prawdziwa)
- Badge: „Hit z TikToka" / „Viralowy hit" / „Płatność przy odbiorze".
- primary_text: 1. zdanie = dowód/rodowód, 2. korzyść, lekkie CTA „Sprawdź". Zero zmyślonych liczb.

## ZAKAZY
- ⛔ **Fałszywy testimonial ludzki** / zmyślona cytowana opinia / twarz „klienta" z wymyśloną
  historią (Meta deceptive + FTC).
- ⛔ **Gwiazdki, liczby, oceny, recenzje ZMYŚLONE** albo gdy `source≠'detail'`.
- ⛔ „X sprzedanych u nas" / licznik globalnej sprzedaży Ali jako naszej (ZG4 §sold).
- ⛔ **Interfejs / logo TikToka**, obce marki, znaki wodne platform.
- ⛔ „Hit z TikToka" gdy produkt NIE pochodzi z `/trendy` (zmyślony rodowód).
- ⛔ Countdowny / fałszywa pilność / „dostawa 24h".

## TYPOWE FAIL-e BRAMEK
- **G5 (policy):** proof wygenerował „zadowolonego klienta" z opinią zamiast prezentera. Fix: brief
  jawnie „AI-prezenter demonstruje, NIE testimonial"; pass-2 policy sprawdza intencję kadru.
- **G5 (policy):** zmyślone „4,9 · 2500 opinii" mimo `source≠'detail'`. Fix: liczby zablokowane
  na G0 gdy source≠detail; bez kotwicy = grafika bez liczby.
- **G3 (wierność):** ciemne tło ukryło zniekształcenie produktu (kontrast maskuje kształt). Fix:
  side-by-side vs paszport mimo ciemnego tła; inset/kotwica kształtu.
- **G4 (tekst):** pieczęć „Hit z TikToka" scramble'uje diakrytyki. Fix: krótka, ZG6 fallback
  (drop pieczęć zamiast łamać litery), quality wysoka.
- **G5 (różnorodność):** proof zlał się z demo (oba „hero produktu"). Fix: proof = statyczny hero
  + pieczęć na CIEMNYM/kontrastowym tle; demo = produkt w AKCJI + paleta sceny. pHash rozstrzyga.
