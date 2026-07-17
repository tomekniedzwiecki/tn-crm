# LOGISTYKA — model zakupów i łańcucha dostaw (SSOT)

> Audyt i decyzje: 2026-07-17 (Fable, na bazie 3 raportów researchu: API portali /
> model łańcucha / weryfikacja sprzedawców — pełne raporty w transkryptach sesji).
> Kontekst systemu: RADAR-TRENDOW.md. Status: FUNDAMENT WDROŻONY (zakładka Logistyka
> w /trendy + bud_offers/bud_test_orders), integracje API etapami.

## 0. Rama biznesowa (na tym stoi wszystko)

- **Klient-operator sprzedaje we własnym imieniu** (jego firma, jego regulamin) → z mocy
  prawa to ON ponosi rękojmię, zwroty 14 dni, odpowiedzialność produktową. NIE DA SIĘ tego
  scedować. Panel Tomka tę odpowiedzialność OBSŁUGUJE (dokumenty, procesy), nie przejmuje.
- **Tomek = centralny operator logistyki** (% od przychodu → interes w sprzedaży i kontroli):
  jedno zaplecze (konta u agentów/API) obsługuje WSZYSTKIE sklepy klientów. Klient nie dotyka
  Chin w ogóle — "Ty sprzedajesz, resztą zajmujemy się my".
- **Dźwignia modelu: agregacja wolumenu.** 10 sklepów × 30 zam./mies. = 300 zam./mies.
  w jednym koncie agenta → warunki dużego gracza przy małych klientach.
- **Zakaz konkurencji TakeDrop (do 31.03.2028): fizyczne TYLKO white-label** → etapy 2/3
  formować jako operacje/hurt W IMIENIU klienta, nie jako platformę Tomka.
- **Rozliczenia:** koszt towaru finansuje klient (portfel/depozyt w panelu — NIE karta Tomka;
  nie mieszać kosztu towaru z prowizją %). Do potwierdzenia z księgowym przy Etapie 3.

## 1. ⚠️ Zmiana reguł gry od 1.07.2026

Koniec zwolnienia de minimis €150 + **ryczałt €3 cła za KAŻDĄ sztukę** z krajów trzecich
(także z IOSS). Dropship z Chin po sztuce = +~13 zł/paczkę. Wniosek strategiczny: dropship
chiński to TYLKO etap walidacji; ekonomia pcha do zapasu EU/PL (cło raz od partii).

## 2. Model 3 etapów (horyzont — pokazywalny klientowi)

| Etap | Kiedy (progi) | Realizacja | Koszt/czas |
|---|---|---|---|
| **1. Walidacja (dropship)** | 0→~30 zam./mies./sklep | Ali Choice (5-12 dni) / CJ z CN; pierwsze sztuki nawet ręcznie | towar+wysyłka+€3/szt.; 5-30 dni |
| **2. Agent + branding + magazyn EU** | zagregowane ~30+ zam./DOBĘ (suma sklepów!) — u nas próg efektywnie niższy | CJ/HyperSKU/SourcinBox: branding paczek bez MOQ, QC, konsolidacja; bestsellery → zapas magazyn EU/PL agenta (bez €3/szt.) | ~$1,5-1,7 taniej/zam. vs Ali; 3-10 dni |
| **3. Import + fulfillment PL** | ~500+ zam./mies. NA PRODUKT, sezon pewny | partie 50-200 szt. (fracht lotniczy 5-10 dni, EORI, PUESC), magazyn: Allegro One (abonament 99 zł, welcome 100 szt. gratis) / InPost / Omnipack; wysyłka PL 1-2 dni | 5-10 zł/zam. pick&pack; cło/VAT raz od partii; min. operatora 800-3700 zł/mies. |

Narracja dla klienta (bez żargonu, bez obietnic terminowych): „Ruszamy → Marka na paczce →
Własny magazyn w Polsce. Przez cały czas operacje trzymamy my."

## 3. Stos API (sourcing + zamówienia)

| Warstwa | Narzędzie | Status dostępu |
|---|---|---|
| **Zamówienia + fracht (kręgosłup)** | **CJ Dropshipping API** (free 1000 req/d, order create, magazyny EU/PL, sub-konta multi-store, sourcing requests 5/d — „znajdź mi to taniej" w 48 h; oficjalny MCP dla Claude!) | self-service — konto do założenia (Tomek) |
| **Najszerszy katalog + order API** | **AliExpress Open Platform (DS API)** — `ds.product.get`, `ds.order.create` | wniosek (konto sprzedawcy, approval 1-2 dni) — złożyć od razu |
| **„Ten sam produkt u wielu sprzedawców" (image, cross-platform)** | **AliPrice partner API** (jedyni: Ali/1688/Taobao/Amazon); do czasu dostępu: nasze runnery reverse-image + CJ sourcing requests | kontakt partnerski — zainicjować |
| **Dane Ali (mamy!)** | RapidAPI true-api (`ali_snapshot`: ceny/recenzje/sprzedawca) | działa |
| **Porównanie PL** | **Allegro API** (odczyt ofert + ratingi Super Sprzedawcy; ZAKUP tylko ręcznie — brak buy-API) | rejestracja aplikacji, darmowe |
| **Tani sourcing na skalę** | OTAPI/Onebound (1688/Taobao image-search + order przez agenta CSSBuy ~6%) | Etap 2+ |
| **EU fast-lane na skalę** | BigBuy API (katalog EU, 24/48 h dispatch, order+tracking) | Etap 2/3, subskrypcja |

NIE-opcje: Allegro buy-API (nie istnieje), Temu (partner-gated, sprzedażowe), DHgate
(brak order-API), scrapery Apify jako fundament (szara strefa TOS — tylko awaryjnie).

## 4. Weryfikacja oferty i sprzedawcy (silnik w bud-offers)

**KILL-GATES (auto-odrzut, punkty ich nie odkupią):** wiek sklepu <6 mies. · świeży sklep
+ >1000 zamówień (kupiony wolumen) · positive <90% · cena <55% mediany dopasowanych ofert
(podróbka/scam) · marka premium tanio · zdjęcia stock/kradzione.

**SCORING 0-100:** positive% (0-20) · wolumen zamówień (0-20) · wiek sklepu (0-15) ·
DSR opis/wysyłka/komunikacja (0-25) · badge (0-8) · recenzje-foto realne (0-7) · rozkład
ocen realistyczny (0-5). Progi: **≥75 kupuj · 55-74 test-order obowiązkowy · <55 tylko backup**.

**WYBÓR OFERTY ≠ najtańsza:** najtańsza SPOŚRÓD score ≥70 z akceptowalnym czasem dostawy PL.
Mediana ceny liczona z dostawą do PL po dedupie wariantów (phash + parametry, NIE SKU).
Historia cen (Alitools/Pricearchive) demaskuje fake-obniżki. Paradoks 100%: sklep 100%/30
opinii < sklep 97%/10k opinii.

**Allegro bije Chiny** gdy liczy się czas (24-48 h vs 2-4 tyg.) i zwroty — dla produktów
wrażliwych czasowo/sezonowych PL-sourcing mimo wyższej ceny zakupu.

## 5. Test-order (bramka przed podpięciem produktu do sklepu klienta)

Obowiązkowy dla: każdego nowego produktu, zmiany sprzedawcy, score 55-74. Zamawiać 2-3
kandydatów NARAZ (porównanie jakości i realnego czasu obok siebie). Checklista odbioru:
realny czas do PL · zgodność ze zdjęciami/wersją · materiał/wykonanie · działanie ·
opakowanie (brak chińskich cenówek/ulotek dostawcy — przecieki!) · reverse-photo fizycznego
produktu. Wynik w panelu (pass/fail + notatki + zdjęcia).

## 6. Ryzyka (skrót — pełna tabela w raporcie researchu)

€3/szt. (→ szybciej do EU stock) · paczki brandowane Choice (→ agent od Etapu 2; w E1 to
koszt walidacji) · zwroty 13-15% wolumenu WLICZONE w marżę (polityka „no-return" NIELEGALNA;
zwrot bez odsyłki = decyzja per przypadek) · GPSR: responsible person w UE przy imporcie
(Etap 3 = świadoma decyzja+dokumentacja; radar już odrzuca kosmetyki/medyczne) · IOSS klienta
wpięty w realizację (bez tego konsument płaci VAT na odprawie = zwroty) · white-label
(TakeDrop) · kapitał w zapasie tylko dla bestsellerów z pewnym oknem (sezon pilnowany radarem).

## 7. Architektura w systemie (wdrożona)

- **`bud_offers`** — oferty zakupu per produkt (source: aliexpress/cj/allegro/1688/bigbuy/
  other; sprzedawca, cena+dostawa PLN, czas dni, seller_score + gates + breakdown jsonb,
  status: candidate/verified/rejected/chosen/backup). Seed z istniejących `chosen_link`/
  `ali_candidates`/`ali_snapshot` (dotychczasowe dopasowania = pierwsze oferty).
- **`bud_test_orders`** — test-ordery (oferta, koszt, daty, checklista jsonb, werdykt).
- **`bud_tt_products.logistics_status`** — lejek: none → sourcing → verified →
  test_ordered → ready → (eu_stock / pl_stock). `chosen_offer_id`.
- **`bud-offers`** (edge, adminGate) — CRUD ofert, silnik kill-gates+scoring, seed
  z snapshotu, mediana/porównanie.
- **Panel /trendy → widok „Logistyka"**: lejek statusów logistycznych approved, per produkt
  tabela ofert (dodawanie linkiem — panel dociąga co się da), wybór oferty głównej+backup,
  tracker test-orderów z checklistą, akcje zmiany statusu.

## 8. Action items TOMKA (konta — wymagają firmy/decyzji)

1. Konto CJ Dropshipping (self-service, od ręki) → potem klucz API do panelu; rozważyć
   od razu MCP CJ dla Claude.
2. Wniosek AliExpress Open Platform / DS API (konto sprzedawcy + developer, 1-2 dni).
3. Kontakt partnerski AliPrice (partner.aliprice.com) — cross-platform image API.
4. Rejestracja aplikacji Allegro API (odczyt ofert/ratingów).
5. Z księgowym przed Etapem 3: model importera (wariant B: Tomek hurtowo → faktura B2B),
   IOSS klientów, EORI.
