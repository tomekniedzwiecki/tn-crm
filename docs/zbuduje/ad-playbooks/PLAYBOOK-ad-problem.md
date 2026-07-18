# PLAYBOOK — kąt `problem` (plakat DR / PAS; ból BEZ produktu)

> Jeden z 3 kątów zestawu startowego (`STANDARD-GRAFIKI-SKLEPY.md`). Plik: `ad_2_problem.png` (4:5).
> Czytaj po SSOT + `PRZEWODNIK-GRAFICZNY.md` (EMOCJA↔PRODUKT). DNA = NAPRAWIONA art-direction kąta `problem` w `buildAdsInstruction()` w `wf2-ads` (dawniej `angleArt()`).

## KIEDY UŻYWAĆ
Zimny ruch, gdy ból jest OSTRY i rozpoznawalny (plączące się kable, tępy nóż, rozlana kawa,
zmarnowany czas). Klasyczny plakat direct-response / schemat PAS (Problem–Agitacja–Rozwiązanie):
nazwij ból → pokaż stary sposób/frustrację → wskaż wyjście. Najlepszy, gdy klient NIE szuka
produktu, ale zna problem.

## ⚠️ REGUŁA KRYTYCZNA — EMOCJA↔PRODUKT (D4 / ZG8)
**Ból pokazujemy BEZ naszego produktu.** Kadr problemu = stary sposób (obcinaczki, plątanina
kabli, zwykły nóż), frustracja właściciela albo SAM problem — nasz produkt POZA kadrem bólu.
Produkt może pojawić się WYŁĄCZNIE w strefie ROZWIĄZANIA / CTA (dolna część plakatu, jako
„wyjście"). ⛔ Nasz produkt NIGDY w sąsiedztwie negatywnej emocji (strach/stres/opór/ból) —
oko czyta „to ON jest źródłem stresu" niezależnie od copy (incydent Drapek: pies kulący się
przy NASZEJ desce = przekaz odwrotny do intencji). **Poprzedni prompt „produkt jako naprawa
problemu" TO ŁAMAŁ — tu jest naprawiony.** Przejście „przed→po" rozgrywa się kompozycyjnie
(górna strefa = problem bez produktu → dolna strefa = rozwiązanie z produktem), NIGDY jako
mini before/after w jednym kadrze przy produkcie.

## DNA LAYOUTU
- Kompozycja DZIELONA (plakat DR): **duży, gruby headline** na PEŁNYM bloku koloru marki
  (jedyny kąt z płaskim blokiem koloru — to go odróżnia od demo/proof, ZG3); ciężka plakatowa
  typografia, wysoki kontrast.
- **Strefa górna/dominująca = PROBLEM bez produktu:** stary sposób / frustracja / sam problem.
  Referencja tej strefy = styl-master lub scena, NIE packshot (packshot wciąga produkt do kadru).
- **Strefa dolna/mniejsza = ROZWIĄZANIE:** czysty produkt-in-use jako wyjście + CTA-pigułka
  „Kup teraz". Tu (i tylko tu) produkt jest wierny referencji.
- Badge risk-reversal „Płatność przy odbiorze" pasuje idealnie (COD zdejmuje ryzyko decyzji).
- Logo mini-marki 8–12%, niecentralne.

## COPY PL (przykłady — hook nazywa ból BEZOSOBOWO, headline 3–6 słów)
- „Znowu plączą się kable?" (o problemie, nie o odbiorcy)
- „Koniec z tępym nożem"
- „Ile czasu na to tracisz?"
- Rozwiązanie/dół: „Zrób to raz a dobrze — Kup teraz".
- Badge: „Płatność przy odbiorze" / „14 dni na zwrot".
- primary_text: hak-ból w 1. zdaniu (bezosobowo), krótka agitacja, wyjście + lekkie CTA „Zamów".

## ZAKAZY
- ⛔ **Personal attributes** (najczęstszy odrzut copy Meta): „Masz problem z…", „Wstydzisz się…",
  „Twój bałagan" — ZAKAZ. Ból nazywamy bezosobowo lub przez sytuację, nie oskarżamy odbiorcy.
- ⛔ **Nasz produkt w strefie bólu / przy negatywnej emocji** (ZG8) — produkt tylko w rozwiązaniu.
- ⛔ Before/after wellness / implied „produkt obok zdrowej osoby" (rozszerzony ban Meta 2026).
- ⛔ Słowa-triggery: „natychmiastowa ulga", „gwarantowane rezultaty", „efekt w 24h".
- ⛔ Sensacja/szok, przesadzona dramatyzacja bólu (Meta ban na shock).
- ⛔ Dwa konkurujące bóle na jednym plakacie — JEDEN problem, JEDNA obietnica.

## TYPOWE FAIL-e BRAMEK
- **G3/G5 (EMOCJA↔PRODUKT):** model wciągnął nasz produkt do strefy bólu (bo dostał packshot-ref
  do całości). Fix: strefa problemu ref = styl-master, seed jawnie WYKLUCZA nasz produkt
  („no <our product> in the problem frame") + wymusza stary sposób. Werdykt kąta bez produktu
  w kadrze = klasa S-kontekst (gate cech produktu jej nie dotyczy; warunek = 0 forbidden + rola
  „przed").
- **G5 (policy):** headline oskarża odbiorcę („Masz…?"). Fix: przeredaguj bezosobowo.
- **G4 (tekst):** duży headline na bloku koloru = najczęstsze miejsce scramble PL. Fix: krótko,
  quality wysoka, Read + porównanie z `campaign.json`; ZG6 fallback.
- **G5 (różnorodność):** problem zlał się z demo/proof przez podobną paletę. Fix: problem = płaski
  blok koloru marki (unikatowy dla tego kąta); demo = paleta sceny; proof = ciemne/kontrastowe tło.
