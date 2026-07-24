# BRIEF-ADS — ZAKLIPEK (przyklipsowy hub USB) · zestaw statycznych banerów · G1 · 2026-07-24

> Krok fabryki grafik `ads_grafiki` / sub-kroki `agr_*` (Etap 5). SSOT: `docs/zbuduje/STANDARD-GRAFIKI-SKLEPY.md`
> + playbooki `ad-playbooks/PLAYBOOK-ad-{demo,problem,lifestyle}.md`. Silnik = `scripts/mockup-tools/ad-forge.py`
> (fal nano-banana-pro, best-of-2). Zestaw pod PIERWSZY ad set — generacja + Storage + panel, **ZERO publikacji do Meta**.

## G0 — WEJŚCIE (dziedziczenie z fabryki landingu) — PASS
- Produkt `wf2_products` `07e194e7-b39a-4ddc-a5fc-f27dc065625c`, slug **zaklipek**, cena **34,90 zł**
  (⛔ ZG10 — cena NIGDY na banerze), status `gotowy`.
- `ali_snapshot.source='detail'` = **ZAUFANE** (gate F0 PASS) → `review_stats` odblokowane (★4,6/5 · 26 ocen).
- Referencje produktu = OBIEKTY z realnej aukcji (g1/g2/g3/g5, `bud-products/1005008397815113/`) — pikselowa prawda,
  NIE reimaginacja z opisu (ZG2). MULTI-REF do generacji: g1 (lifestyle pod monitorem) + g2 (in-use, porty pod ręką)
  + g3 (detal DC 5V).
- Brand (ZG5): logo-combo.png (mini-marka **Zaklipek**), paleta akcent **#0A6EBD** (USB SuperSpeed blue), font Bricolage
  Grotesque (800) / Figtree, styl-master. Landing live message-match: `https://sprytko.pl/zaklipek`
  (hero „Porty pod ręką", badge „Płatność przy odbiorze / ZA POBRANIEM", akcent #0A6EBD — kopia banera = echo hero).
- **Marka:** sklep = **Sprytko** (sprytko.pl); produkt / mini-marka na kreacji = **Zaklipek** (logo-combo.png,
  1:1 z landingiem — ZG1/ZG5). Wordmark Zaklipek widoczny 8–12% wys., niecentralny.

## Message match (ZG1) — jedna obietnica całego zestawu
„**Porty USB zawsze pod ręką na krawędzi biurka**" — koniec sięgania za komputer i plątaniny kabli.
Wariant sprzedawany = **bazowy: 4 porty USB 3.0 (5 Gbps), aluminium, klips 5–28 mm, port DC 5V**.
⛔ ZAKAZ (KARTA §2a): „10 Gbps", „USB 3.2 Gen2", „7-in-1", „czytnik kart SD/TF", „HDMI", „4K 60Hz" — to INNE, droższe warianty.

## ZESTAW — 3 kąty × 2 formaty (kanon SSOT) = 6 kreacji
Formaty: **4:5 (1080×1350, feed Meta)** + **1:1 (1080×1080, kwadratowy feed)** — `--formats 45,11` (default fabryki).
Kąty domyślne = `demo` / `problem` / `lifestyle` (3 koncepcyjnie różne byty, ZG3). Copy PL z KARTY PRAWDY,
diakrytyki OBOWIĄZKOWE (ZG6), JEDNA obietnica/grafikę, ⛔ zero ceny (ZG10). Copy finalne ląduje w `campaign.json`
(silnik gpt-5.6-sol regeneruje przy generacji — poniżej plan z dry-run):

### KĄT 1 — DEMO (clean product hero + WIELKI hook; produkt-bohater)
- Hook baner: **„4 PORTY USB POD RĘKĄ"** · headline „PORTY POD RĘKĄ" · subline „USB 3.0 na krawędzi".
- Callouty (opcjonalne, minimalizm=premium): „4× USB 3.0", „ŚRUBA ZACISKU", „PORT DC 5V".
- Rola produktu: POZYTYWNA — bohater na czystym tle (gradient grafit/blue), zaciśnięty na krawędzi.
- Badge opcjonalny: „Płatność przy odbiorze". Primary: benefit „porty tam, gdzie ich potrzebujesz" + lekkie CTA.

### KĄT 2 — PROBLEM (split MIT↔FAKT; ból BEZ produktu → ZG8)
- Hook: **„ZA KOMPUTEREM → POD RĘKĄ"** · headline „KONIEC SIĘGANIA Z TYŁU" (bezosobowo — ZAKAZ „Masz problem…").
- Panel bólu: użytkownik sięga za komputer, plątanina kabli — **BEZ naszego produktu** (klasa S-kontekst, gate cech go nie dotyczy).
- Panel FAKT: produkt na krawędzi + checkmarki „Porty pod ręką · Mniej sięgania · Mniej plątaniny".

### KĄT 3 — LIFESTYLE (UGC „z życia"; produkt w użyciu, ZERO UI)
- Hook mały/średni: **„WPINAJ BEZ SZUKANIA"** · „Przy monitorze, nie za komputerem".
- Scena: jasne poranne home-office, osoba wpina pendrive pod monitorem — kadr „jak z telefonu", ciepłe światło, zero stockowego uśmiechu.
- Primary: obserwacja z życia + „Zamów Zaklipek z płatnością przy odbiorze".

## BRAMKA WIERNOŚCI (G3) — cechy dyskryminujące (PASZPORT) — checklista twarda
- **bryła:** płaska podłużna listwa + pionowy kołnierz zacisku (kształt „L/haczyk"); NIE sześcian/walec.
- **materiał/kolor:** srebrne/szczotkowane ALUMINIUM (bazowy) + grafitowy panel portów; ⛔ NIE czarna obudowa jako kanon.
- **porty:** rząd 4× USB 3.0 (niebieskie wnętrza USB-A), mała dioda LED.
- **zacisk:** pionowa szczęka za krawędź + śruba motylkowa; zakres 5–28 mm; silikonowa podkładka.
- **zasilanie:** osobny port DC 5V.
- ⛔ CZEGO NIE MA: czytnika kart, „10Gbps"/HDMI/„4K", nóżek/podstawki, wyświetlacza/pokręteł.
- ⛔ **WHITE-LABEL:** żadnego „Eswirepro" / „ORICO" na kadrze (retusz/regen jeśli wycieknie z refów g2/g4/g5).

## BRAMKI G3a / G4 / G5
- **Anatomia (G3a):** problem + lifestyle mają postać — ciało kompletne, kończyny/dłonie poprawne, twarz bez deformacji.
- **Tekst (G4):** headline czytelny @320px, diakrytyki poprawne, ≤~20% płótna, ⛔ ZERO kwoty (ZG10 — twardy FAIL).
- **Polityka (G5):** zero personal attributes / before-after wellness / słów-triggerów; `ADS-BLOCKLISTA-PL.md` czysta;
  zero obcych logo; `ai_labeled=true`. Różnorodność: pHash 3 kątów ≥ próg (3 różne layouty/palety/role).
- Dozwolone risk-reversal: „Płatność przy odbiorze" / „za pobraniem" / „14 dni na zwrot" (metoda/warunki, NIE kwota).

## ⚠️ OGRANICZENIA NARZĘDZIA (zalogowana blokada, nie obejście)
- **Kąt `proof` NIEGENEROWALNY** przez ad-forge (`ALLOWED_ANGLES=["demo","problem","lifestyle"]`) — mimo że KARTA daje
  uczciwy dowód (★4,6/5 · 26 ocen, source=detail) i playbook `proof` istnieje. Zgodnie z SSOT `proof` jest OPCJONALNY
  i poza defaultami („nie rób grafiki z opiniami" — Tomek 19.07). Przekaz proof (solidne aluminium, COD/14 dni) rozłożony
  na badge COD + hero „aluminium/solidne" w demo. Włączenie proof = zmiana wspólnego `ad-forge.py` (ALLOWED_ANGLES) —
  poza zakresem tego wątku (inny wątek pracuje nad landing/hero). → do decyzji Tomka.
- **Format `9:16` NIEGENEROWALNY** przez ad-forge (`ALLOWED_FORMATS=["45","11"]`; 916 = „rozszerzenie na przyszłość,
  nie generowane" — STANDARD §2). 9:16 wymaga NATYWNej generacji (nie auto-crop 4:5). Zestaw pokrywa formaty feedowe
  1:1 (wymóg zadania) + 4:5 (wymóg standardu). 9:16 = do dogenerowania gdy fabryka wejdzie w Stories/Reels.

## KOSZT (de-ryzyko)
- 4:5: 3 kąty × best-of-2 × $0.225 = **~$1.35**. Kwadraty 1:1 (przekompozycja oszczędna): 3 × $0.225 = **~$0.675**.
  Razem **~$2.0**. Twardy cap `--budget` na przebieg. Koszt loguje `ad-forge --finalize` do `wf2_costs` (kind='fal').
