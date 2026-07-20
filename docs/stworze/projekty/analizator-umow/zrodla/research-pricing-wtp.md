# Research: wrażliwość cenowa i benchmarki pricingowe — Analizator umów podwykonawczych (PZP)

> Produkt: polski SaaS dla średnich firm budowlanych (podwykonawcy w zamówieniach publicznych).
> AI porównuje projekt umowy podwykonawczej z Kontraktem Głównym + KC/PZP → raport ryzyk PDF
> (kary, waloryzacja, terminy płatności, zatrzymania). Nie jest opinią prawną. Płatnik: właściciel/zarząd.
> Data researchu: 2026-07-20. Waluty: benchmarki globalne w USD, WTP i rynek PL w zł.

---

## Profil płatnika i jego budżet (fakty + źródła)

**Kto płaci i jak kupuje.** Płatnikiem jest właściciel/zarząd średniej firmy budowlanej (10–50 osób,
sekcja F). W B2B dominuje **faktura + przelew z odroczonym terminem**, limity kupieckie i procesy
zakupowe wymagające akceptacji księgowości/kilku osób — ale karty firmowe i subskrypcje cykliczne
rosną, a model cykliczny „sprawdza się szczególnie dobrze" na platformach SaaS. Dla płatności
jednorazowych/rocznych standardem pozostaje **proforma → przelew tradycyjny**.
[Shopify — Płatności B2B](https://www.shopify.com/pl/blog/platnosci-b2b) ·
[ideo.pl — Płatności cykliczne B2B](https://www.ideo.pl/e-commerce/wiedza/platnosci-cykliczne-b2c-vs-b2b-jak-zapanowac-nad-umowami-i-fakturami,202.html) ·
[Webankieta — proforma/przelew](https://pomoc.webankieta.pl/pl/articles/5223824-jak-oplacic-konto-przelewem-tradycyjnym-faktura-proforma)

**Budżet IT branży budowlanej — niski, ale rosnący.**
- Cały sektor budowlany wydał na IT **~1 mld zł w 2024 r.**, co to zaledwie **~2% wartości rynku IT** w PL.
- Budownictwo globalnie wydaje **<1% przychodów na IT** — mniej niż 1/3 tego, co motoryzacja; średnia wszystkich branż to ~3–4%.
- Budżety IT firm budowlanych rosły **~+6% r/r w 2024**, ale wiele firm deklarowało utrzymanie lub cięcia.
- **33% polskich firm budowlanych** planuje zwiększyć inwestycje w nowe technologie o **>31%** w perspektywie 3 lat.
[PMR/BPO House — benchmarki IT w budownictwie](https://bpohouse.pl/pl/pub/benchmarki-wydatkow-it-w-budownictwie-polska-i-ue/) ·
[Builder Polska — cyfryzacja budownictwa](https://builderpolska.pl/2025/01/15/cyfryzacja-branzy-budowlanej-ewolucja-zamiast-rewolucji/) ·
[EY — cyfryzacja budownictwa priorytet](https://www.ey.com/pl_pl/insights/digital-first/cyfryzacja-w-branzy-budowlanej-to-priorytet-ai-fy25)

**Wniosek dla profilu:** to płatnik **cenowo-wrażliwy i konserwatywny w IT** (nie kupuje „narzędzia dla
narzędzia"), ale z realnym budżetem i rosnącą presją na cyfryzację. Sprzedaż musi iść przez **ROI/ryzyko**
(uniknięta kara, zamrożone zatrzymanie), nie przez „feature'y AI". Rozliczenie: **faktura/przelew, roczne
lub proforma** — a nie wyłącznie karta.

**Częstotliwość użycia (ile umów/rok).** Twardych danych GUS/UZP o liczbie umów podwykonawczych na firmę
brak (zastrzeżenie z `market_report.md`). Szacunek z danych rynku:
- 2023: **~157 tys.** udzielonych zamówień publicznych, wartość **~280 mld zł**; **roboty budowlane = 33% wartości** (~92 mld zł), ale mają wysoką wartość jednostkową, więc stanowią mniejszą część *liczby* postępowań (rząd wielkości kilkunastu–kilkudziesięciu tys. postępowań budowlanych rocznie).
- Ok. **52 tys. wykonawców** wybranych w postępowaniach (`market_report.md`, źródło UZP).
- Każdy kontrakt na roboty budowlane generuje zwykle **kilku podwykonawców** (branże: instalacje, ziemne, wykończenia).

**Szacunek roboczy:** średnia firma-podwykonawca aktywna w zamówieniach publicznych podpisuje
**~8–25 umów podwykonawczych/rok** (podwykonawcy branżowi po dolnej granicy, wielobranżowi/aktywni
przetargowo — wyżej). To kluczowa liczba dla modelu: przy tej częstotliwości **abonament roczny bije
per-dokument** i buduje nawyk „każda nowa umowa → przepuść przez analizator".
[UZP — sprawozdanie 2023 (PDF)](https://noweprzetargi.pl/wp-content/uploads/2024/08/Sprawozdanie_Prezesa_UZP_z_funkcjonowania_systemu_zamowien_publicznych_w_2023_r.pdf) ·
[Przetargowa — raport UZP 2024](https://przetargowa.pl/newsy/raport-uzp-za-2024-rok-dane-statystyczne-dotyczace-rynku-zamowien-publicznych-po-iv-kwartale-2024-r/)

**Sezonowość:** budownictwo ma szczyt aktywności II–IV kw. (sezon budowlany + domknięcia budżetów
publicznych jesienią); I kw. słabszy. Zakup abonamentu rocznego wygładza tę sezonowość vs per-use, który
skoncentrowałby przychód w sezonie.

---

## Benchmarki SaaS (konwersje, trial, roczne — tabela + źródła)

### Trial → paid wg wymogu karty i pasma ACV

Nasz produkt ma docelowe **ACV 1–5 tys. zł/rok** = **~$250–$1 250** — czyli **poniżej progu „sub-$5K ACV"**,
najniższy segment w benchmarkach (self-serve, niskie tarcie).

| Metryka | Bez karty (opt-in) | Z kartą (opt-out) | Źródło |
|---|---|---|---|
| Trial→paid, mediana ogółem | **14%** (pasmo 8–22%) | **44%** (pasmo 35–55%) | growthspree 2026 |
| Trial→paid, **sub-$5K ACV** | **16–28%** | **48–60%** | growthspree 2026 |
| Efekt karty (agregat) | ~5–6× niżej | **~30%** free→paid | Userpilot / flint |
| „Ekonomia" trial | 45 signupów → **3,6 płacących** | 35 signupów → **10,5 płacących** | ideaproof / buildmvpfast |
| Freemium | 2–8% (mediana 4,5%) | — | growthspree |
| Reverse trial | 18–32% (mediana 24%) | — | growthspree |
| Trial aktywowany vs nie | aktywowany **35–65%** / nieaktywowany 2–8% | — | growthspree |

Kluczowe: **aktywacja (pierwsza realna analiza) tłumaczy 60–75% wariancji konwersji** — ważniejsza niż
długość trialu. Optymalna długość: **14 dni (opt-in)** / **21–30 dni (opt-out)**.
[growthspree — benchmarki 2026](https://www.growthspreeofficial.com/blogs/b2b-saas-trial-to-paid-conversion-rate-benchmarks-2026-by-trial-type-acv-length-credit-card) ·
[Userpilot](https://userpilot.com/blog/saas-average-conversion-rate/) ·
[ChartMogul — SaaS Conversion Report](https://chartmogul.com/reports/saas-conversion-report/) ·
[ideaproof](https://ideaproof.io/questions/good-trial-conversion) ·
[buildmvpfast — CC required?](https://www.buildmvpfast.com/questions/should-i-require-credit-card-for-free-trial-b2b-saas)

### Plany roczne

| Metryka | Wartość | Źródło |
|---|---|---|
| Standardowy rabat roczny | **15–20%**, najczęściej **16,7% = „2 miesiące gratis"** | subscriptionindex / recurly |
| „Round-number" vs 16,7% | 16,7% daje **+31% adopcji** planu rocznego | subscriptionindex |
| Retencja po 12 mies. | **~92% roczny** vs **~68% miesięczny** | baremetrics |
| Redukcja churnu | roczne obniża churn o **20–30%** | fungies / medium |
| Preferencja rocznego | **~42%** kupujących B2B wybiera roczny, gdy jest rabat | subscriptionindex |
| Rabat <15% | rzadko skłania do przejścia; >30% sygnalizuje zawyżony cennik miesięczny | subscriptionindex |

[Subscription Index](https://www.subscriptionindex.com/guides/annual-vs-monthly-pricing) ·
[Recurly research](https://recurly.com/research/saas-benchmarks-for-subscription-plans/) ·
[Baremetrics](https://baremetrics.com/blog/annual-vs-monthly-pricing-better-retention) ·
[Fungies](https://fungies.io/annual-vs-monthly-saas-pricing-strategy/)

### Model (per-seat vs flat vs usage)

- **85% firm SaaS** stosuje jakąś formę usage-based do 2024 (z 30% w 2019); **61% nowych produktów B2B** eksploruje usage-based (OpenView).
- Ale w złożonej sprzedaży **flat/per-seat „łatwiej przełknąć" niż metered z nieprzewidywalnym rachunkiem**.
- Trend 2026: **hybryda „base + consumption"** = przewidywalny dostęp + zmienny nadmiar.
[getmonetizely — 2026 guide](https://www.getmonetizely.com/blogs/the-2026-guide-to-saas-ai-and-agentic-pricing-models) ·
[Flexprice](https://flexprice.io/blog/why-ai-companies-have-adopted-usage-based-pricing) ·
[Stripe — usage-based strategy](https://stripe.com/resources/more/usage-based-pricing-strategy-for-saas)

---

## Per-dokument vs abonament dla tej niszy (analiza + rekomendacja)

**Argumenty za per-dokument (kredyty/pakiety):**
- Naturalna jednostka wartości = **1 analiza = 1 umowa** (łatwe do zrozumienia, płacisz za to, co używasz).
- Niska bariera wejścia — pasuje do konserwatywnego, cenowo-wrażliwego płatnika budowlanego.
- Dobra jako **kotwica/pilot** (pierwsza analiza płatna zamiast trialu bez karty — patrz sekcja trial).

**Argumenty przeciw czystemu usage-based (pułapki potwierdzone danymi):**
- **Bill shock i nieprzewidywalność** — usage-based „pęka", gdy zużycie jest nierówne; pakiety kredytów „nie służą nikomu": ciężcy użytkownicy przepalają w tydzień, lekcy czują, że przepłacają za niewykorzystane.
- **Sześć fatalnych wad pricingu kredytowego** dla AI (softwarepricing.com): m.in. odwraca uwagę od wartości ku „licznikowi", karze aktywne używanie.
- W sprzedaży złożonej klienci wolą **przewidywalny ryczałt** niż metered.
- Sezonowość budownictwa spiętrzyłaby zużycie (a więc i rachunki) w II–IV kw.
[softwarepricing — 6 wad kredytów](https://softwarepricing.com/blog/credit-based-pricing-ai/) ·
[justpaid — usage billing](https://www.justpaid.ai/blog/usage-based-billing-for-ai-companies-a-practical-guide) ·
[data-mania — seats/credits/usage](https://www.data-mania.com/blog/ai-pricing-models-explained-usage-seats-credits-outcome-based-options/)

**Kontekst konkurencji PL (z `market_report.md`):**
- **SmartPrawnik** — audyt umowy **od ~79 zł/dokument** (model per-analiza, ogólny).
- **Umownik** — **~300 zł netto/mies.** abonament + ~400 zł wdrożenie (narzędzie do obiegu umów, nie back-to-back).

### Rekomendacja: HYBRYDA z ryczałtem jako domyślną

1. **Plan roczny flat z „uczciwym limitem" (fair-use)** jako główny produkt — pasuje do częstotliwości
   8–25 umów/rok, buduje nawyk, wygładza sezonowość, daje przewidywalny rachunek na fakturę.
   Rozliczenie **rocznie z góry (proforma/przelew)**, ramowanie **„2 miesiące gratis"** (16,7% vs miesięczny).
2. **Wejście per-dokument jako kotwica/pilot**, nie jako główny model: **pierwsza płatna analiza ~199–299 zł**,
   której koszt **zalicza się na poczet abonamentu rocznego** (usuwa ryzyko „kota w worku" + omija problem
   trialu bez karty u kupującego na fakturę).
3. **Nadmiar ponad limit** wyceniany per-dokument (np. 99–149 zł/analiza) — hybryda „base + consumption",
   ale bez czystego usage-based (chroni przed bill shock i nieprzewidywalnością).

---

## Widełki WTP (podłoga / środek / sufit z uzasadnieniem liczbami)

### Kotwica per-use: ile kosztuje przegląd umowy u prawnika (PL)

| Usługa | Cena | Źródło |
|---|---|---|
| Analiza **rozbudowanej** umowy | **od 400 zł + 23% VAT** | mecenasi / praxilex |
| Sporządzenie/analiza dokumentu | **300–600 zł**; biznesowe **do kilku tys. zł** | kingakonopelko / enterek |
| Konsultacja jednorazowa | **200–500 zł netto** | krmp / kancelariakrs |
| Audyt umowy AI (SmartPrawnik) | **od 79 zł/dokument** | market_report |

[Cennik usług prawnych — mecenasi](https://cennikuslugprawnych.mecenasi.pl/) ·
[praxilex — sprawdzenie umowy](https://praxilex.pl/sprawdzenie-umowy-przez-prawnika-cena/) ·
[Kinga Konopelko — umowa indywidualna](https://kingakonopelko.pl/indywidualna-umowa/) ·
[KRMP — cennik](https://krmp.pl/cennik-uslug/)

**Realna kotwica dla NASZEGO przypadku (nie zwykła umowa, lecz back-to-back: porównanie 2 dokumentów +
KC/PZP + ryzyka):** to zadanie ze średniej/górnej półki złożoności — u wyspecjalizowanego prawnika
budowlanego realnie **800–2 000+ zł za jedną umowę**. Przy **8–25 umowach/rok** to
**~6 000–50 000 zł/rok** samego kosztu przeglądu prawnego — o rząd wielkości powyżej naszego ACV.

### Psychologia „ubezpieczenia od ryzyka"

WTP w B2B rośnie, gdy cenę zakotwiczyć na **następnej-najlepszej alternatywie** (koszt prawnika) i ramować
przez **redukcję ryzyka + awersję do straty** (kupujący silniej unika straty niż dąży do zysku o tej samej
wartości). Ramowanie **total vs miesięcznie** i **jednorazowo vs ciągle** zmienia akceptację tej samej ceny.
Dla nas: kotwica = „1 przegląd u prawnika 800–2000 zł" i „jedna przeoczona kara/zamrożone zatrzymanie =
utrata marży całego kontraktu" → abonament 2–5 tys./rok wygląda jak **tani parasol ubezpieczeniowy**.
[Copperberg — behavioral pricing B2B](https://www.copperberg.com/behavioral-pricing-models-using-psychology-to-drive-b2b-purchasing-decisions/) ·
[Umbrex — value-based pricing](https://umbrex.com/resources/frameworks/marketing-frameworks/value-based-pricing-framework/) ·
[Simon-Kucher — price anchoring](https://www.simon-kucher.com/en/insights/price-anchoring-unlock-growth-behavioral-pricing)

### Widełki WTP (abonament roczny)

| Poziom | Cena/rok (≈ mies.) | Uzasadnienie liczbami |
|---|---|---|
| **PODŁOGA** | **~1 200–1 800 zł/rok** (100–150 zł/mies.) | Musi być tańszy niż **2–3 przeglądy prawne** (2×800=1600 zł) i wyraźnie powyżej commodity per-dokument (SmartPrawnik 79 zł). Poniżej tego cena sygnalizuje „zabawkę", nie narzędzie ochrony ryzyka. Mieści się w budżecie IT nawet cenowo-wrażliwej firmy. |
| **ŚRODEK (kotwica)** | **~2 400–3 600 zł/rok** (200–300 zł/mies.) | Zrównuje z **Umownik ~300 zł/mies.** (porównywalny abonament PL), pokrywa **~10–15 analiz/rok**. ROI: koszt = **~2 przeglądy prawne**, a chroni przy **każdej** z 8–25 umów. Jedna uniknięta zła klauzula (kara/zatrzymanie) = zwrot za kilka lat abonamentu. To domyślny plan „firmowy". |
| **SUFIT** | **~4 800–6 000 zł/rok** (400–500 zł/mies.) | Plan „PM/multi-seat" lub wyższy limit analiz + priorytet. Wciąż **znacznie poniżej** kosztu obsługi prawnej wszystkich umów (6–50 tys./rok) i **ułamek** wartości jednej zamrożonej kaucji zatrzymanej (typowo 5–10% wartości kontraktu). Górna granica, zanim zarząd zażąda formalnego procesu zakupowego/pilota. |

**Per-dokument (a la carte / pilot):** **199–299 zł/analiza** (pojedyncza, zaliczana na abonament);
**pakiety** 5 szt. ~899 zł / 10 szt. ~1 599 zł (rabat 10–20% jak przy planach rocznych). Nadmiar ponad
limit rocznego: **99–149 zł/analiza**.

### Trial: bez karty czy z kartą (specyfika PL)

- **Dane globalne:** karta = ~30% konwersji vs ~5–6× mniej bez karty; sub-$5K ACV z kartą **48–60%**, bez **16–28%**.
- **Ale specyfika PL/B2B:** kupujący płaci **na fakturę/proformę**, rzadko wpina kartę do trialu SaaS — wymóg karty ucina *liczbę* signupów u tej grupy.
- **Rekomendacja:** zamiast klasycznego wyboru „karta/bez karty" → **płatny pilot per-dokument (199–299 zł, zaliczany na abonament)** lub **reverse trial** (pełna funkcja przez 1 analizę, potem plan). To łączy wysoką konwersję modelu „z zobowiązaniem" z realiami płatności na fakturę. Aktywacja = **wykonanie pierwszej realnej analizy** (steruje 60–75% konwersji).

---

### TL;DR rekomendacja pricingowa
- **Model:** abonament **roczny flat z fair-use**, rozliczany proforma/przelew, rabat ramowany „2 miesiące gratis" (16,7%); nadmiar per-dokument (hybryda „base+consumption", bez czystego usage-based → brak bill shock).
- **Kotwica:** 3 plany — **~1 500 / ~3 000 / ~5 400 zł/rok** (podłoga/środek/sufit); środek = domyślny.
- **Wejście:** płatny pilot **~249 zł/analiza** zaliczany na abonament, zamiast trialu bez karty.
- **Narracja:** „tańszy niż 2 przeglądy prawne, chroni przy każdej umowie" — sprzedaż przez ryzyko/ROI, nie przez AI.
