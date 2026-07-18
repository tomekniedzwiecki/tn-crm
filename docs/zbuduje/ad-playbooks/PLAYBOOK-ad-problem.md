# PLAYBOOK — kąt `problem` (MIT vs FAKT / split-screen; ból BEZ produktu)

> Jeden z 3 kątów zestawu startowego (`STANDARD-GRAFIKI-SKLEPY.md`). Plik: `ad_2_problem.png` (4:5).
> Czytaj po SSOT + `PRZEWODNIK-GRAFICZNY.md` (EMOCJA↔PRODUKT). DNA = art-direction kąta `problem`
> w `buildAdsInstruction()` w `wf2-ads` (rev3 PREMIUM, wzorzec ze starego flow `manus-full-campaign`).

## KIEDY UŻYWAĆ
Zimny ruch, gdy ból jest OSTRY i rozpoznawalny (plączące się kable, tępy nóż, rozlana kawa,
zmarnowany czas). Kadr działa na kontraście dwóch światów: **STARY SPOSÓB / MIT** kontra
**NASZ SPOSÓB / FAKT** — nazwij ból po stronie „starej", pokaż spokojne wyjście po stronie „naszej".
Najlepszy, gdy klient NIE szuka produktu, ale zna problem i wierzy w „mit", że tak musi być.

## ⚠️ REGUŁA KRYTYCZNA — EMOCJA↔PRODUKT (D4 / ZG8)
**Ból pokazujemy BEZ naszego produktu.** Panel problemu (MIT / STARY SPOSÓB) = stary sposób
(obcinaczki, plątanina kabli, zwykły nóż), frustracja właściciela albo SAM problem — nasz produkt
POZA tym panelem. Produkt pojawia się WYŁĄCZNIE po stronie ROZWIĄZANIA (panel FAKT / NASZ SPOSÓB),
jako „wyjście". ⛔ Nasz produkt NIGDY w sąsiedztwie negatywnej emocji (strach/stres/opór/ból) —
oko czyta „to ON jest źródłem stresu" niezależnie od copy (incydent Drapek: pies kulący się przy
NASZEJ desce = przekaz odwrotny do intencji). **Poprzedni prompt „produkt jako naprawa problemu"
TO ŁAMAŁ — tu jest naprawiony.** Przejście „przed→po" rozgrywa się kompozycyjnie między panelami
(panel MIT bez produktu → panel FAKT z produktem), NIGDY jako mini before/after w jednym kadrze
przy produkcie.

## DNA LAYOUTU
- **SPLIT-SCREEN: dwa kontrastujące panele MIT vs FAKT** (mocny kontrast wizualny obu stron —
  to odróżnia `problem` od clean-hero `demo` i close-up `proof`, ZG3). Kompozycja czytelna,
  wyraźna linia podziału.
- **Panel PROBLEMU (MIT / STARY SPOSÓB) = BEZ produktu:** realistyczna, dokumentalna foto bólu/
  frustracji / starego sposobu; tonacja chłodniejsza, „ciasna". Etykieta np. „MIT:" / „STARY SPOSÓB".
  Referencja tej strefy = styl-master lub scena, NIGDY packshot (packshot wciąga produkt do kadru bólu).
- **Panel ROZWIĄZANIA (FAKT / NASZ SPOSÓB) = z produktem:** nasz produkt w użyciu, **jasne, ciepłe
  światło**, spokój i klasa premium; **2–3 krótkie checkmarki** korzyści (✓ konkret z kotwicą).
  Etykieta „FAKT:" / nazwa mini-marki. Tu (i tylko tu) produkt jest wierny referencji 1:1.
- **Headline BEZOSOBOWO** (ZAKAZ „Masz problem z…", „Wstydzisz się…" — personal attributes Meta);
  może działać jako para etykiet „MIT: … / FAKT: …".
- **Logo** mini-marki 8–12% wysokości, niecentralne.
- **CTA-pigułka „Kup teraz" i badge „Płatność przy odbiorze" = OPCJONALNE** — badge risk-reversal
  pasuje idealnie (COD zdejmuje ryzyko), ale dodawaj tylko, gdy wzmacnia kompozycję; nie zaśmiecaj
  splitu. Domyślnie badge żyje w copy kampanii.

## COPY PL (przykłady — headline nazywa ból BEZOSOBOWO, MIT vs FAKT)
- „MIT: kable muszą się plątać" / „FAKT: jeden ruch i porządek"
- „STARY SPOSÓB: tępy nóż" / „NASZ SPOSÓB: czysto i szybko"
- „Ile czasu na to tracisz?" (o sytuacji, nie o odbiorcy)
- Checkmarki (panel FAKT): „✓ w 3 sekundy · ✓ raz a dobrze · ✓ bez bałaganu".
- Badge (OPCJONALNY): „Płatność przy odbiorze" / „14 dni na zwrot".
- primary_text: hak-ból w 1. zdaniu (bezosobowo), krótka agitacja, wyjście + lekkie CTA „Zamów".

## ZAKAZY
- ⛔ **Personal attributes** (najczęstszy odrzut copy Meta): „Masz problem z…", „Wstydzisz się…",
  „Twój bałagan" — ZAKAZ. Ból nazywamy bezosobowo lub przez sytuację, nie oskarżamy odbiorcy.
- ⛔ **Nasz produkt w panelu bólu / przy negatywnej emocji** (ZG8) — produkt tylko w panelu FAKT.
- ⛔ Before/after wellness / implied „produkt obok zdrowej osoby" (rozszerzony ban Meta 2026).
- ⛔ Słowa-triggery: „natychmiastowa ulga", „gwarantowane rezultaty", „efekt w 24h".
- ⛔ Sensacja/szok, przesadzona dramatyzacja bólu (Meta ban na shock).
- ⛔ Dwa konkurujące bóle na jednym plakacie — JEDEN problem, JEDNA obietnica.

## TYPOWE FAIL-e BRAMEK
- **G3/G5 (EMOCJA↔PRODUKT):** model wciągnął nasz produkt do panelu bólu (bo dostał packshot-ref
  do całości). Fix: panel MIT ref = styl-master, seed jawnie WYKLUCZA nasz produkt
  („no <our product> in the MIT / problem panel") + wymusza stary sposób. Werdykt panelu bez
  produktu = klasa S-kontekst (gate cech produktu jej nie dotyczy; warunek = 0 forbidden + rola
  „przed").
- **G5 (policy):** headline oskarża odbiorcę („Masz…?"). Fix: przeredaguj bezosobowo / na MIT vs FAKT.
- **G4 (tekst):** etykiety „MIT:/FAKT:" + checkmarki = kilka krótkich napisów = pole do scramble PL.
  Fix: krótko, quality wysoka, Read + porównanie z `campaign.json`; ZG6 fallback (drop checkmark/
  badge zamiast łamać litery).
- **G5 (różnorodność):** problem zlał się z demo/proof przez podobną paletę. Fix: problem =
  split-screen MIT vs FAKT (unikatowy layout, kontrast dwóch stron); demo = clean product hero +
  WIELKI hook; proof = premium close-up detalu. pHash rozstrzyga.
