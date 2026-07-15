# BRIEF — sklep „Znajdzik" (projekt rozwojowy workflow v2)

## Marka parasolowa
- **Nazwa:** Znajdzik (REKOMENDACJA — czeka na akcept; alternatywy: Odkrytka, Skarbka)
- **Domena:** znajdzik.pl (wolna 15.07, niekupiona — bramka Tomka)
- **Tagline:** „Sprytne znaleziska, które ułatwiają życie"
- **Opis:** Znajdzik to miejsce, w którym co chwilę odkrywasz sprytne rzeczy, które naprawdę
  ułatwiają życie — wyławiamy pojedyncze, dopracowane znaleziska i pokazujemy je po ludzku,
  bez ściemy i korpomowy. Asortyment rotuje.
- **Maskotka-kierunek:** sympatyczny dzik-poszukiwacz (dziki ryją i znajdują — ownable story).
- **Ton:** ciepły, konkretny, po ludzku; lekki humor OK; ZERO krzyku, fałszywej pilności,
  obietnic dostawy. COD + zwrot 14 dni = risk-reversal (dozwolone i wskazane).

## Design tokens (manifest stylu — obowiązuje na stronie głównej i landingach)
- Tło `#FCF8F2` (krem) · Tekst `#29241F` (ciepły grafit) · Akcent `#E8795A` (terakota)
- CTA `#DC5322` (cegła, biały tekst) · Sukces `#3E8E6E` (szałwia) · Subtelne tła/bordery `#EFE4D2` (piasek)
- Fonty NA LANDINGACH (budżet LCP — STANDARD-LANDING-SKLEPY.md): **1 rodzina custom = Fraunces**
  (nagłówki, 600+700, preload+swap+latin-ext); **body/UI = system-font stack**. (Plus Jakarta
  Sans/Nunito zostają w identyfikacji marki poza landingami: panel, materiały, dokumenty.)
- Charakter: ciepły, czysty, zaufany e-commerce; ZERO neonowego dropshipping-vibe.

## ⚡ KONWERSJA — obowiązuje `docs/zbuduje/STANDARD-LANDING-SKLEPY.md` (15.07)
Cel CR 3%+ (zimny Meta, mobile). Filary: message match (moduł hero `?h=N` z hookami z kroku
Branding — kreacja N linkuje `?h=N`), kompletna mikro-oferta w 1. ekranie, COD jako narracja
1-2-3 przy każdym CTA, sticky bar mobile, FAQ nad finalnym CTA, LCP<2,5 s, eventy
VC/ATC(klik CTA)/IC(wyjście do kasy) + link decoration — spięte z CP2 systemu testów.

## Architektura sklepu (API platformy sklepy.niedzwiecki.ai)
- Strona główna = otoczka marki + galeria produktów testowych (linkuje do podstron).
- Każdy produkt = podstrona z landingiem 1-produktowym.
- CTA na landingu = **checkout_url z API produktu (per wariant)** — do czasu API placeholder
  `<a data-checkout="PRODUCT_SLUG" href="#">`; podmiana przy publikacji przez API.
- Pixel Meta na wszystkich stronach + link decoration (fbclid/_fbp/_fbc) przy przejściu do kasy.
- Lejtmotyw strony głównej: „galeria sprytnych znalezisk — jeden dzik-poszukiwacz, pięć małych
  «aha!»: włosy, sen, majsterka, dziecięca radość, pakowanie. Zamiast «promocja» — «patrz,
  co znalazłem»."

## Portfel (branding produktowy — szczegóły w krokach `branding` w panelu)
| # | Produkt (display) | Kategoria | Cena test | Hero-kierunek |
|---|---|---|---|---|
| 1 | Lokówka, która sama kręci loki | Uroda | 35,15 | „Loki, które robią się same" |
| 2 | Chłodzący koc na upalne noce | Dom/sen | 34,01 | „Chłód, który czujesz od razu" (SEZON) |
| 3 | Kamera, która zagląda wszędzie | Tech | 35,41 | „Zobacz to, czego nie widać" |
| 4 | Jeździk-koparka, która naprawdę kopie | Dzieci | 240,01 | „Prawdziwa koparka na dziecięcą miarę" (COD!) |
| 5 | Pompka, która zmieści więcej | Podróże | 63,37 | „Zmieść więcej, dopnij bez walki" (SEZON) |

## Plan sesji (landingi — metodyka TN App: krótkie, domykane, z dowodami)
- **S1** Szablon fabryczny landingu Znajdzik: tokens + sekcje (hero/problem/demo/opinie/oferta
  COD/FAQ/CTA) + pixel snippet + data-checkout + link decoration. Kryterium: przechodzi
  verify-landing (0 FAIL) na produkcie #2 (koc — sezon, priorytet).
- **S2** Landing #2 koc (pełna procedura landingowa + pętla krytyka do wyczerpania).
- **S3** Landing #1 lokówka. **S4** #5 pompka. **S5** #3 endoskop. **S6** #4 jeździk.
- **S7** Strona główna (galeria 5 znalezisk + otoczka marki).
- Po S2: grafiki reklamowe (Manus) dla koca — reszta po kolejnych landingach.
- Zdjęcia: REALNE z aukcji Ali (snapshot `bud-products/<id>/`), NIGDY generowane AI produktu.

## Gotchas
- 3/5 aukcji było `search` — endoskop potwierdzony detail 15.07; lokówka+koc rebuild w toku;
  PRZED kampanią każda aukcja musi być `detail` (WORKFLOW-V2-TESTY.md §8).
- Ceny: przy zmianie kosztu z potwierdzonej aukcji przeliczyć cenę testową (+15%, końcówka .x9/.01).
- Checkout na domenie platformy → eventy Purchase przez CAPI platformy (wymóg zgłoszony developerowi).
