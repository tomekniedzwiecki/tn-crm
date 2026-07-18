# PLAYBOOK — kąt `demo` (full-bleed akcja / benefit-callouts)

> Jeden z 3 kątów zestawu startowego (`STANDARD-GRAFIKI-SKLEPY.md`). Plik: `ad_1_demo.png` (4:5).
> Czytaj po SSOT. DNA layoutu = ulepszona art-direction kąta `demo` z `buildAdsInstruction()` w `wf2-ads` (dawniej `angleArt()`).

## KIEDY UŻYWAĆ
Najsilniejszy kadr „na zimno". Produkt sam się tłumaczy przez DZIAŁANIE: mechanizm, „wow"
w akcji, multi-funkcyjność. Domyślny wybór gdy korzyść jest WIZUALNA i rozstrzygalna w 0,5 s
(oko widzi, co produkt robi, zanim przeczyta headline). Dwa tryby — wybierz wg produktu:
- **A. FULL-BLEED AKCJA** — produkt mid-use wypełnia cały kadr, energia ruchu; dla produktów,
  gdzie sam gest niesie dowód (narzędzie tnie, urządzenie działa, efekt się dzieje).
- **B. BENEFIT-CALLOUTS** — produkt w centrum + 3–4 wyniesienia z cienkimi liniami/strzałkami;
  dla produktów multi-funkcja, gdzie przewaga = lista konkretnych cech („ładuje 3 naraz · kabel
  2 m · mieści się w kieszeni").

## DNA LAYOUTU
- **Full-bleed:** produkt w AKCJI / mid-use wypełnia CAŁY kadr, dynamiczna diagonala, sens ruchu;
  headline na kontrastowym pasku/overlayu (nie luźny tekst); mały czysty inset produktu solo dla
  wierności kształtu. **Paleta FOTOGRAFICZNA z samej sceny** — BEZ płaskiego bloku koloru marki
  (to odróżnia demo od problem). Światło naturalne/kierunkowe, nie białe studio (Allegro-look).
- **Benefit-callouts:** produkt center na spójnym tle marki; 3–4 wyniesienia (ikona/krótka fraza)
  połączone cienkimi liniami z konkretnymi punktami produktu; hierarchia: headline-rezultat u góry
  → produkt → callouty wokół → CTA-pigułka „Kup teraz" na dole. Callouty = KONKRET z KARTY PRAWDY
  z kotwicą, nie ogólniki.
- **Wspólne:** logo mini-marki 8–12% wysokości w rogu (niecentralne, 1:1 z `logo-combo.png`);
  CTA „Kup teraz" jako element UI (pigułka, wysoki kontrast do palety TEJ kreacji); JEDNA obietnica.
- **Rola produktu (ZG8):** kadr POZYTYWNY — produkt jest bohaterem w akcji/rezultacie. Nigdy
  w sąsiedztwie negatywnej emocji.

## COPY PL (przykłady — dopasuj do produktu, headline 3–6 słów)
- Hook rezultatu (full-bleed): „Wkręt siedzi w 3 sekundy", „Cały bałagan znika", „Ostrość jak nowa".
- Benefit-callouts (headline + wyniesienia): headline „Trzy urządzenia. Jeden kabel." +
  callouty: „Ładuje 3 naraz", „Kabel 2 m", „Mieści się w kieszeni".
- Badge (TYLKO prawdziwy): „Płatność przy odbiorze" / „14 dni na zwrot".
- primary_text (post, 2–3 zdania): hak w 1. zdaniu (rezultat), korzyść z kotwicą, lekkie CTA
  „Sprawdź"/„Zamów". Zero zmyślonych liczb.

## ZAKAZY
- ⛔ Białe/studyjne tło na full-bleed (wygląda jak Allegro) — paleta z samej sceny.
- ⛔ Płaski blok koloru marki jako tło (to layout kąta `problem`, nie demo — różnorodność ZG3).
- ⛔ Więcej niż JEDNA obietnica; „wow" rozbite na 2 konkurujące komunikaty.
- ⛔ Callouty-ogólniki bez kotwicy w KARCIE PRAWDY („najlepszy", „premium") — CUT (ZG4).
- ⛔ Ceny na grafice zmyślone/przekreślone fake; countdowny; „dostawa 24h".
- ⛔ Recytacja anatomii produktu słowem w prompcie — wygląd niesie ATTACHMENT referencji (ZG2).

## TYPOWE FAIL-e BRAMEK
- **G3 (wierność):** produkt w ruchu zniekształcony (proporcje/profil) — full-bleed kusi model
  do „artystycznej" deformacji. Fix: mocna referencja-obiekt + inset solo jako kotwica kształtu.
- **G4 (tekst):** callouty = dużo krótkich stringów = pole do scramble/glifów PL. Fix: minimalizuj
  liczbę fraz (≤4), krótkie, ZG6 fallback (drop badge/callout zamiast łamać litery).
- **G5 (różnorodność):** demo zlało się z proof (oba „produkt-bohater"). Fix: demo = AKCJA/ruch +
  paleta sceny; proof = statyczny hero + pieczęć na kontraście. pHash musi je rozróżnić.
- **G5 (policy):** callout brzmi jak health-claim („natychmiastowa ulga"). Fix: konkret funkcjonalny
  z kotwicą, nie obietnica zdrowotna.
