# PLAYBOOK — kąt `lifestyle` (UGC / Z ŻYCIA; autentyczność persony)

> Jeden z 3 kątów zestawu startowego (`STANDARD-GRAFIKI-SKLEPY.md`). Plik: `ad_3_lifestyle.png` (4:5).
> Czytaj po SSOT. DNA layoutu = art-direction kąta `lifestyle` z `buildAdsInstruction()` w `wf2-ads`
> (wzorzec „Kreacji 2" ze starego flow `manus-full-campaign` — organiczny post z życia, nie baner).
> Zastąpił `proof` w defaultach (decyzja Tomka 19.07: „nie rób grafiki z opiniami — zrób coś innego").

## KIEDY UŻYWAĆ
Kadr, który NIE wygląda jak reklama. Buduje zaufanie przez „ktoś taki jak ja już tego używa u siebie
w domu" — realna osoba z persony `dla_kogo` używa produktu w naturalnym, codziennym otoczeniu. Działa
tam, gdzie krzykliwy baner odbija się od oka, a organiczny, ciepły kadr zatrzymuje kciuk („czy to
w ogóle reklama?"). Najsilniejszy dla produktów codziennego użytku, do domu, dla dzieci i **dla
zwierząt** (wtedy: zwierzę + właściciel w jednym kadrze). Domyślny 3. kąt zestawu — komplementarny do
`demo` (packshot-hero) i `problem` (split-screen): dokłada ludzki, „prawdziwy" dowód użycia bez ani
jednej zmyślonej opinii czy liczby.

## ⚠️ REGUŁA KRYTYCZNA — AUTENTYCZNOŚĆ, NIE STOCK
- **Kadr ma wyglądać jak dobre zdjęcie z telefonu, nie jak sesja studyjna.** Ciepłe światło dnia,
  prawdziwe wnętrze (bałagan życia dozwolony), naturalna poza. **ZERO studyjnej perfekcji i ZERO
  stockowego uśmiechu do obiektywu** — to zabija autentyczność i przekaz czyta się jako „reklama",
  czyli dokładnie to, czego ten kąt ma unikać.
- **Persona MUSI się zgadzać z `dla_kogo` (KARTA PRAWDY).** Osoba w kadrze = ten avatar, nie losowy
  model: wiek, kontekst, otoczenie pasują do „dla kogo". Scena nietrafiona w personę = kreklama do
  kogoś innego niż kupujący.
- **Produkt 1:1 z referencji, wyraźnie widoczny W UŻYCIU** — to nadal kadr produktowy (ZG2), tylko
  osadzony w scenie życia. Naturalność otoczenia NIE zwalnia z wierności: kształt/kolor/materiał/
  branding produktu = dokładnie ten z packshotu (bramka G3 obowiązuje).
- **To nie jest `proof`.** Lifestyle NIE niesie opinii, gwiazdek, liczników ani cytowanego
  testimonialu — dowodem jest sama scena użycia, nie deklaracja. (Dla dowodu opinią/liczbami jest
  opcjonalny `proof` — wywoływany jawnie przez `body.angles:['proof']`, patrz `PLAYBOOK-ad-proof.md`.)

## DNA LAYOUTU
- **UGC / Z ŻYCIA:** realna osoba z persony `dla_kogo` (przy produktach dla zwierząt: **zwierzę +
  właściciel**) używa produktu w naturalnym domowym otoczeniu — kuchnia, salon, wejście, ogród.
  Scena spójna z tym, komu produkt służy.
- **Kadr „jak z telefonu":** ciepłe światło dnia, prawdziwe wnętrze, płytka naturalność (nie
  wyreżyserowana martwa natura). Dozwolone lekkie niedoskonałości kadru — dają wiarygodność.
- **Produkt wyraźnie w użyciu:** bohater sceny jest widoczny i rozpoznawalny, dokładnie ten
  z referencji (1:1), w ręce / na miejscu / w akcji — nie odłożony gdzieś w tle.
- **Napisy oszczędne albo wcale:** co najwyżej krótki hook małą/średnią typografią (nie WIELKI
  baner-headline jak w `demo`). Scena ma wyglądać jak **organiczny post, nie kreacja reklamowa** —
  im mniej „bannerowości", tym mocniej działa.
- **ZERO elementów UI na tej kreacji:** żadnych pigułek CTA, przycisków „Kup teraz", ramek, badge-ów,
  callout-strzałek. Interfejs = sygnał „to reklama" = zabija UGC-owy charakter (to jedyny kąt
  z twardym zakazem UI, mocniejszym niż „opcjonalne" z rev3).
- **Logo** mini-marki dyskretnie w rogu 8–12% wysokości, niecentralne (albo jako subtelny podpis na
  dole) — obecne dla message match, ale niekrzyczące; nie może przełamać organicznego klimatu.
- **Rola produktu (ZG8):** kadr WYŁĄCZNIE POZYTYWNY — produkt w radości/spokoju/codziennej wygodzie.
  Nigdy w sąsiedztwie negatywnej emocji (to domena panelu bólu w `problem`, i tam BEZ produktu).
- **Paleta** fotograficzna, ciepła, ze sceny — spójna z akcentem brandu (KARTA PRAWDY). NIGDY białe
  studio (Allegro-look) ani zimne studyjne światło. Lifestyle = ciepła scena życia (odróżnia go od
  clean-hero `demo` na ciemnym/gradiencie i split-screenu `problem`, ZG3).

## COPY PL (przykłady — hook krótki, małą/średnią typografią albo BRAK)
- Hook „z życia" (opcjonalny, mały): „U nas codziennie", „Wreszcie spokój w domu", „Nasz sposób na …",
  „Zosia to pokochała" (o dziecku/zwierzęciu z persony, nie o odbiorcy).
- Często **najlepszy wybór = zero napisów** — sama scena niesie komunikat, hook żyje dopiero
  w primary_text posta.
- Badge / pigułka CTA: ⛔ NIE na tej grafice (patrz ZAKAZY) — trafiają wyłącznie do copy kampanii.
- primary_text (post, 2–3 zdania): 1. zdanie „z życia" / obserwacja użytkownika, korzyść w codziennym
  kontekście, lekkie CTA „Sprawdź"/„Zobacz". Ton bliski, pierwszoosobowy-neutralny. **Otwarcie INNE
  niż w `demo`/`problem`** (zakaz powtarzania tego samego pierwszego zdania w zestawie). Zero
  zmyślonych liczb/opinii.

## ZAKAZY
- ⛔ **Stockowy uśmiech / studyjna perfekcja / pozowanie do obiektywu** — zabija autentyczność, kadr
  czyta się jako reklama. Ciepła, naturalna scena „z telefonu”, nie sesja.
- ⛔ **Białe/zimne studyjne tło** (Allegro-look) — lifestyle żyje w prawdziwym wnętrzu, ciepłym świetle.
- ⛔ **Produkt niewierny referencji** — naturalność sceny NIE jest wymówką dla zniekształceń; produkt
  1:1 z packshotu (ZG2/G3), inaczej regeneracja celowana.
- ⛔ **Elementy UI:** pigułki, przyciski „Kup teraz", badge, ramki, strzałki-callouty, „sticker" cen —
  wszystko, co krzyczy „baner". Ten kąt = organiczny post.
- ⛔ **Przeładowanie tekstem / WIELKI headline** — to layout `demo`, nie lifestyle. Tu hook mały albo
  żaden; ≤~15% płótna na tekst, nigdy akapit.
- ⛔ **Scena niepasująca do persony `dla_kogo`** (inny wiek/kontekst/otoczenie niż avatar z KARTY
  PRAWDY) — reklama trafia wtedy do niewłaściwego kupującego.
- ⛔ **Cytowana opinia / gwiazdki / liczby / testimonial** — to `proof` (opcjonalny), nie lifestyle;
  tu dowodem jest scena, nie deklaracja.
- ⛔ **Produkt w sąsiedztwie negatywnej emocji** (ZG8) — lifestyle jest zawsze pozytywny.
- ⛔ Countdowny / fałszywa pilność / „dostawa 24h" / obce logo / personal attributes.
- ⛔ Recytacja anatomii produktu słowem w prompcie — wygląd niesie ATTACHMENT referencji (ZG2).

## TYPOWE FAIL-e BRAMEK
- **G5 (autentyczność/policy):** model wygenerował „stockową" scenę — idealny uśmiech do kamery,
  studyjne światło, wypucowane wnętrze. Efekt: wygląda jak reklama, nie UGC. Fix: brief jawnie „jak
  zdjęcie z telefonu, ciepłe światło dnia, zero stockowego uśmiechu, zero studyjnej perfekcji";
  pass-2 ocenia „czy to wygląda jak organiczny post".
- **G3 (wierność):** naturalna scena „rozpłynęła" produkt (osoba go zasłania / niewyraźny / inny
  wariant). Fix: produkt musi być wyraźnie widoczny w użyciu i 1:1 z packshotu; side-by-side vs
  paszport mimo sceny życia — wierność NIE jest waivable przez „lifestyle".
- **G5 (persona):** osoba/otoczenie nie pasuje do `dla_kogo` (np. senior zamiast młodej mamy, biuro
  zamiast domu). Fix: seed opisuje avatar z KARTY PRAWDY (wiek, kontekst, wnętrze); pass-2 sprawdza
  dopasowanie do persony.
- **G4 (tekst):** dołożono WIELKI headline / pigułkę / badge → kadr przestał być organiczny i wpadł
  w „baner". Fix: drop UI i wielkiego tekstu; jeśli hook konieczny — mały, poprawne diakrytyki,
  ZG6 fallback (raczej zero napisów niż połamane litery).
- **G5 (różnorodność, ZG3):** lifestyle zlał się wizualnie z `demo`/`problem` (podobna paleta/kadr).
  Fix: lifestyle = ciepła scena z człowiekiem/zwierzęciem w prawdziwym wnętrzu (unikatowy, „ludzki"
  layout); demo = clean product hero + WIELKI hook; problem = split-screen MIT vs FAKT. pHash rozstrzyga.
- **G5 (policy):** hook zabrzmiał jak opinia/health-claim („najlepszy na rynku", „natychmiastowa
  ulga"). Fix: obserwacja z życia / konkret codzienny, bez claimu i bez udawanej opinii.
