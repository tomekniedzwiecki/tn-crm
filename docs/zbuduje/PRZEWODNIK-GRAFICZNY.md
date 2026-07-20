# PRZEWODNIK GRAFICZNY — całościowy plan warstwy wizualnej landingu (krok F1.7)

**Status: OBOWIĄZUJE (2026-07-17, feedback Tomka do Loczka: „zdjęcia produktu
bardzo podobne, niczym się nie różnią").** Katalog ujęć per sekcja (STANDARD §2
PRODUKT W SCENACH) wymusił różne POZY, ale NIE różne ŚWIATY — wszystkie kadry
Loczka: różowe studio, jedno światło, produkt bez otoczenia → oko czyta „to samo
zdjęcie". Poza to najsłabszy dyferencjator; człowiek rejestruje najpierw ŚWIAT
(miejsce + światło + emocja). Diagnoza-wzorzec do unikania niżej.

**ROZSZERZENIE 2026-07-20 (audyt 4 landingów, werdykt masażer ↔ Drapek 9/10):** osie z pkt 2
działały tylko WEWNĄTRZ jednego landingu. Doszła warstwa **CROSS-LANDING (pkt 2b)** — nowy landing
musi różnić się od poprzedniego na min. 3 z 5 osi (rodzina tła · kolor akcentu · font display ·
archetyp hero · świat/materiał). Podział decyzji na KANON i PARTYTURĘ: `TOKENS-MAKIETY.md`.

## PO CO (i dlaczego PRZED makietami)
Sceny powstają W makietach (F2). Bez całościowego planu każdą makietę projektuje
się w izolacji → świat się nie różnicuje. Przewodnik = storyboard operatora robiony
RAZ per landing, PO planie F1, PRZED makietami F2. Jedna decyzja o CIĄGU całości,
nie 13 lokalnych decyzji o pozie.

## ZAWARTOŚĆ (4 bloki)
1. ŁUK NARRACYJNY — każda sekcja = klatka filmu: świat-problem (BEZ naszego produktu —
   stary sposób/ból) → produkt WCHODZI jako rozwiązanie → mechanizm z bliska → dowód na
   człowieku → życie z produktem → packshot zaufania → finał emocjonalny. Sąsiednie klatki
   różnią się rytmem (szeroki→makro→człowiek→detal), całość składa się w historię. **Przejście
   „przed→po" rozgrywa się MIĘDZY sekcjami, NIGDY w jednym kadrze** (patrz reguła EMOCJA↔PRODUKT).
2. OSIE RÓŻNORODNOŚCI (minimum na landing):
   - ≥3 KONTEKSTY: studio brandowe + prawdziwe wnętrze (adekwatne do persony:
     łazienka/toaletka/sypialnia/garaż/kuchnia/auto) + na człowieku
   - ≥3 SKALE: makro detal / średni produkt / szeroki lifestyle
   - ≥2 ŚWIATŁA: studio miękkie + naturalne (okno/poranek/wieczór/noc)
   - CZŁOWIEK w ≥30% grafik (dłoń/model bez twarzy — realizm)
   - ≥2 PERSPEKTYWY
   REGUŁA RYTMU: dwie SĄSIEDNIE sekcje NIE dzielą tego samego kontekst+skala.
2b. **OSIE RÓŻNORODNOŚCI MIĘDZY LANDINGAMI (20.07 — druga warstwa, cross-landing).**
   Osie z pkt 2 działają WEWNĄTRZ jednego landingu (klauzula seedów `avoid: same world as
   previous SECTION`) — i to wystarczało, dopóki landingów było kilka. Audyt 4 gotowych stron
   20.07 dał werdykt **masażer ↔ Drapek = 9/10** („ta sama strona z podmienionym produktem"),
   bo różnorodność wewnętrzna nie chroni przed powtórzeniem CAŁEJ partytury w kolejnym landingu.
   **Nowy landing MUSI różnić się od BEZPOŚREDNIO POPRZEDNIEGO na min. 3 z 5 osi:**
   | # | oś | źródło decyzji | gdzie zapisana |
   |---|---|---|---|
   | 1 | **rodzina tła** (krem / kość słoniowa / piasek / glina / chłodna biel / szałwia / bladoróż / jasny błękit) | świat produktu | `TOKENS-MAKIETY.md` PARTYTURA |
   | 2 | **kolor akcentu** (domyślnie wyprowadzony z realnego koloru produktu) | produkt | `TOKENS-MAKIETY.md` PARTYTURA |
   | 3 | **font display** | charakter produktu | `TOKENS-MAKIETY.md` PARTYTURA |
   | 4 | **archetyp hero** (A–H, STANDARD §F2 pkt 2) | najmocniejszy argument sprzedażowy | `PLAN.md` → `archetyp-hero:` |
   | 5 | **świat / materiał** (miejsce, faktura, pora dnia) | persona + kontekst użycia | ten przewodnik, pkt 2 i karty sekcji |
   Osie 1-4 mierzy maszynowo `gate-check.py` blok `cross_landing` (font = FAIL, ΔE akcentu <15 =
   FAIL, archetyp == poprzedni = FAIL, sekwencja sekcji >80% = WARN); oś 5 ocenia krytyk (pyt. 8
   checklisty F2). **„Inny produkt i inne zdjęcia" NIE liczą się jako oś** — to zawartość, nie
   partytura; dokładnie ta pomyłka dała 9/10.
3. KARTA SEKCJI (szablon per sekcja):
   sekcja → rola w narracji → ujęcie {kadr / kontekst / światło / człowiek /
   perspektywa} → emocja → co ma poczuć klient → seed promptu (2-3 zd. EN) →
   powiązanie z sąsiadami (kontrast / kontynuacja) →
   **DETAL UI {ikony: charcoal (funkcjonalne) / amber TYLKO akcent · trust-pill: jeden styl
   (kremowy z charcoal) · mikro-interakcja: intencja (press/reveal/slide-in) · wariant layoutu:
   scena-full / split 55/45 / bento / grid-twarze}** — atrybuty formalizowane w F2.5
   (`TOKENS-MAKIETY.md`), tu deklarowane per sekcja, żeby świat i UI szły spójnie.

   **Notatki UI per typ sekcji (19.07 — dociążenie chudych sekcji + spójność):**
   - **hero:** OSTRA fotografia (produkt bohaterem, mniej blur). **Kadr hero podporządkowany
     ARCHETYPOWI z `PLAN.md` (`archetyp-hero:` A–H, STANDARD §F2 pkt 2)** — split editorial,
     karta nachodząca, packshot na płaskim polu i dyptyk potrzebują RÓŻNYCH kadrów; archetyp
     wybrany, ale sfotografowany „jak poprzednio" = oś 4 niezaliczona. Akcent = tylko
     CTA+swash+rating; ikony charcoal.
   - **FAQ:** UŻYJ slotu media modułu `faq-accordion@1` (sticky packshot obok akordeonu) —
     ⛔ „goły akordeon"; ikona „+/−" = charcoal (nie amber/blush).
   - **zaufanie / COD-strip:** wypełnij PEŁNĄ wysokość sekcji (⛔ martwa dolna 1/3) — ikony
     kroków charcoal, trust-pill jeden styl.
   - **desktop↔mobile:** ta sama sekcja = ten sam bohater + jeden styl ikon w obu (patrz
     STANDARD §F2.4); rozjazd = regeneracja mobile.
4. SPÓJNOŚĆ mimo różnorodności = wspólne DNA:
   paleta akcentów + produkt wierny PASZPORTOWI + JEDEN motyw przewodni
   (np. Loczek: „pasmo po spirali"). Różne światy — jeden bohater, jeden motyw.

## ROLA PRODUKTU W ŁUKU (EMOCJA↔PRODUKT) — TWARDA REGUŁA (Drapek 18.07)
Powód: scena PROBLEM Drapka pokazała psa KULĄCEGO SIĘ DEFENSYWNIE przy NASZEJ desce (uszy do
tyłu, cofa łapę) → przekaz „nasz produkt = źródło stresu", odwrotny do intencji. Root-cause:
karta sceny PROBLEM seedowała nasz produkt do kadru („warms up toward a calm wooden board scene"
/ „obok łagodniejsza zapowiedź deski" — mini before/after w JEDNYM kadrze), a generacja F3 z
packshotem-refem wzmocniła produkt i porzuciła słabo określony stary sposób (obcinaczki).
- **Nasz produkt = TYLKO sceny pozytywne / rozwiązania:** hero (obietnica), rozwiązanie/USP
  (ulga), demo (w akcji), efekt/„po" (rezultat), oferta (packshot), final (życie z produktem).
- **Scena PROBLEM/„przed" = BÓL BEZ naszego produktu:** stary sposób (obcinaczki/gilotynka +
  opór/strach psa), frustracja właściciela ALBO sam problem (długie pazury). ROLA sceny w karcie
  jawnie oznaczona {przed/rozwiązanie/efekt}.
- ⛔ **Nasz produkt NIGDY w scenie z negatywną emocją** (strach/stres/walka/opór/odrzucenie/ból) —
  sąsiedztwo produkt+negatyw kanibalizuje przekaz niezależnie od copy. Negatyw = ZAWSZE stary
  sposób lub sam problem. Przejście „przed→po" = MIĘDZY sekcjami, NIGDY w jednym kadrze.
- **Seed sceny PROBLEM jawnie WYKLUCZA nasz produkt** (klauzula „no <our product>/board/gadget in
  frame" + wymuszenie starego sposobu). **Generacja F3: ref = styl-master, NIE packshot** (packshot
  wciąga produkt do kadru). Kontrola końcowa: FINALNY-PASS PASS 5 pyt. 6.

## WYJĄTKI OD REGUŁY ŚWIATA (świadome)
- Opinie (klasa U): surowe UGC, ramkowane — autentyczność > spójność świata.
- Oferta „Zamów" (klasa P): czysty packshot na jasnym jednolitym — świadomie clean.
- Pasek zaufania / FAQ: ikony/CSS, bez świata.
Reguły osi liczą się na sekcjach-scenach (S/hero/lifestyle/demo/benefits/final).

## SEEDY PROMPTÓW
2-3 zdania EN per sekcja; paszport doklejany OSOBNO (nie w seedzie). Zawsze:
strefa treści = miękki fade; klauzula `avoid: same world as previous section`
**oraz (20.07) klauzula cross-landing: `avoid: <świat/materiał poprzedniego landingu>`** —
wypisana KONKRETEM z przewodnika poprzedniego landingu (np. „avoid: warm wooden home interior,
soft morning window light" gdy poprzedni landing grał tym światem), nie ogólnikiem.

## GATE (krytyk ocenia SAM przewodnik, przed makietami)
„Czy z samych opisów ujęć widać RÓŻNORODNOŚĆ i CIĄG?" — matryca osi wypełniona,
reguła rytmu spełniona (żadna para sąsiadów kontekst+skala), człowiek ≥30%,
motyw przewodni obecny w ≥2 klatkach. **CROSS-LANDING (pkt 2b): czy ten przewodnik różni się
od przewodnika poprzedniego landingu na ≥3 z 5 osi — wymienionych po nazwie?**
„Inny produkt" ≠ oś; <3 osie = przeprojektuj partyturę (F2.5), nie pojedyncze karty sekcji. **EMOCJA↔PRODUKT: żadna karta nie łączy naszego
produktu z negatywną emocją; seed sceny PROBLEM jawnie WYKLUCZA nasz produkt (stary
sposób/frustracja) = warunek PASS** (naruszenie = FAIL, przeprojektuj kartę sceny).
FAIL → przeprojektuj przewodnik, nie makiety.
Mapa assetów F3 wskazuje KARTĘ PRZEWODNIKA per asset. Gate-check F6: plik
`FABRYKA-*/<slug>/PRZEWODNIK-GRAFICZNY.md` = WYMAGANY (brak = STOP).

## WZORZEC-ANTY (Loczek 17.07, czego unikać)
11 kadrów, 6 osi: kontekst 10/11 różowe studio (0 wnętrz) · skala 0 szerokich
lifestyle · światło 1 setup · człowiek 27% (<30%) · perspektywa ~1 (frontal
eye-level) · emocja 100% katalogowa. Różowy produkt na różowym tle = niski
kontrast figura-tło = wzmocnienie „sameness". Pełny naprawczy przewodnik 13
sekcji Loczka: archiwum landingu (`FABRYKA-17.07/loczek/PRZEWODNIK-GRAFICZNY.md`).
