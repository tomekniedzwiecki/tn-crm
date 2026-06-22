# Warstwa Konwersji — playbook przychodowy dla sklepów jednoproduktowych

> Wersja 2026-06-11. Źródło: analiza wieloagentowa (8 niezależnych lensów researchu webowego — Temu/Shein,
> DTC, CRO evidence/Baymard, Shopify apps, rynek PL, interaktywność, pre-checkout, video/UGC) + audyt
> kafina.pl i `shared/conversion-toolkit.js` + **sonda live checkoutu TakeDrop** (Playwright). 109 taktyk
> zebranych → zdeduplikowane → przepuszczone przez krytyka prawnego/technicznego/brandowego.
>
> **Pozycjonowanie względem [upgrade-roadmap-2026-06.md](upgrade-roadmap-2026-06.md) (v5.0):** plan v5.0
> doskonali landing jako **dokument perswazyjny** (uczciwy social proof, mapa obiekcji, trust-microcopy,
> anti-fabrykacja, wizual). Ten dokument to **inna warstwa: mechanika przychodowa i lejek PO kliknięciu** —
> AOV, ostatnia mila checkoutu, odzysk porzuceń, atrybucja, real-data FOMO. Grep v5.0 = **0 trafień** na:
> bundle/selektor ilości, order bump, kalkulator, capture e-mail, recovery, checkout, AOV, real-data licznik.
> To nie powtórka — to brakujące piętro.
>
> **Naczelna zasada (dziedziczona z v5.0):** żaden element nie wchodzi „bo można". Każdy albo (a) zastępuje
> słabszy element, albo (b) to niewidoczny backend (zero gęstości), albo (c) nowy element on-page, który
> spłaca swój budżet Scrollability twardą liczbą (AOV/recovery). Nie powtarzamy błędu Conversion Atlas.

---

## TL;DR — jeden wielki przeframing

Landingi z pipeline'u są **dobrym dokumentem sprzedażowym** i v5.0 domyka resztę. Ale pieniądze nie
przeciekają w treści strony — przeciekają w **czterech miejscach, których nikt jeszcze nie tyka**:

1. **AOV jest zamrożony.** Jeden produkt, jedna cena, jeden link. Multipack z #7 v5.0 to *fasada* — karty
   1/2/3 szt. linkują do tego samego checkoutu (sonda potwierdza: URL TakeDrop nie przyjmuje ilości), więc
   koszyk i tak wkłada 1 szt. Najszybsza dźwignia DTC (+30-50% AOV) jest namalowana, nie podłączona.
2. **Ostatnia mila krwawi.** Checkout TakeDrop ma tytuł „Twój sklep - super okazje!", metodę płatności
   opisaną jako „Stripe" (Polak nie wie co to), zero trustu, generyczny biały szablon po premium landingu.
   Decyzja zakupowa zapada tam, gdzie wygląda jak scam.
3. **Porzucający jest stracony.** Żadnego capture e-maila/telefonu PRZED checkoutem. 82% porzuca koszyk
   (IGE 2025), a my nie mamy nawet adresu, żeby przypomnieć. Recovery calls działają tylko na tych, co już
   doszli do checkoutu.
4. **Atrybucja urywa się na granicy domen.** `tracking.js` zbiera gclid/fbclid, ale nic nie dopina do
   linku `/checkout?products=ID` i nic nie leci do Supabase. Optymalizujemy kampanie po ślepych danych.

Mechanika Temu (koło fortuny, fake countdown, „zostało 3 szt.", fake social proof) jest **w 90% nielegalna
w PL** (Omnibus/UOKiK) albo niszczy premium brand — i projekt słusznie już to wie (toolkit FOMO jest
wyłączany w v5.0 #1). Ale jej *legalne tłumaczenia istnieją* i są w tym playbooku: real-data scarcity,
reveal-kupon za e-mail (stała nagroda, nie loteria), kotwiczenie wartości zamiast fałszywego przekreślenia.

**Co robić: nie dokładać widżetów na stronę. Zbudować niewidoczne piętro (AOV + backend + checkout) i
zamienić istniejące fasady w prawdziwe mechanizmy.** Reszta dokumentu to plan + architektura reużycia.

---

## Część 0 — Czego NIE ruszamy (już dobre / już w planie)

**Kafina ma dobrze (audyt):** 11 CTA z gęstością góra/dół, mocny anchoring ceny, gwarancja 30 dni powtarzana
5×, trust strip, 25 opinii ze zdjęciami, reels+stories, FAQ (6 obiekcji produktowych), sticky/WA/floating
komplet, value stack 6 elementów, sekcja porównania „Dwie epoki", Meta Pixel z `InitiateCheckout`.

**v5.0 już naprawia (NIE dubluję):** #1 wycięcie toolkitu, #2 uczciwy rating (4,6-4,8 nie 5,0 + disclosure
weryfikacji), #4 trust-microcopy pod CTA, #7 multipack jako *wariant wizualny* + comparison „vs zwykłe X",
#8 list założyciela, #11 sticky CTA fix, #12 linia kosztu dostawy w offer-boxie. Mój playbook **zakłada
v5.0 jako bazę** i dokłada to, czego tam nie ma.

---

## Część 1 — WARSTWA AOV: uczyń multipack PRAWDZIWYM (dźwignia #1)

> **Dlaczego najpierw:** to jedyna pozycja, która zwiększa przychód **bez zwiększania ruchu ani CR** —
> czysty mnożnik wartości zamówienia. Evidence: dobrze wdrożone progi ilościowe = **+30-50% AOV**
> (dane branżowe Shopify, stay.ai „9 High-Converting Buy Boxes"); order bump w cenie 10-25% produktu =
> **41% take-rate, +17% przychodu** (Focus Digital 2025); Amazon: 35% przychodu z cross/upsell.

### 1.1 — Realne SKU zestawów w TakeDrop + dynamiczny href (zamiast fasady #7)

**Problem:** #7 v5.0 świadomie linkuje wszystkie karty multipacka do tego samego `products=ID` (słuszna
ostrożność — sonda potwierdza, że `?products=ID-2`, `&quantity=2`, `ID,ID` **nie zmieniają ilości**;
testowane na żywo 2026-06-10). Efekt: karta „2 szt. −10%" obiecuje cenę, której koszyk nie honoruje.

**Co zrobić:**
1. W panelu TakeDrop klienta założyć **osobne produkty**: „X — zestaw 2 szt." i „X — zestaw 3 szt." z
   własnym ID i **realną** ceną pakietową (rabat liczony od faktycznej najniższej ceny z 30 dni za odpowiednią
   liczbę sztuk — Omnibus).
2. Na landingu selektor 3 kart radio (estetyka per brand — dla kafiny metki warsztatowe, nie neony). Inline
   vanilla JS podmienia `href` przycisku CTA **i** sticky-CTA na URL wybranego SKU. ~40 linii JS.
3. **Free-shipping-on-bundle:** ustawić darmową dostawę dla SKU 2-pak/3-pak → karta „2 szt." dostaje badge
   „+ darmowa dostawa". Pasek progu darmowej dostawy = **+10-20% AOV** (growthsuite.net), a tu próg pada
   naturalnie na 2 szt.
4. Karta środkowa „Najczęściej wybierany" (scale 1.05) — decoy effect.

**Do weryfikacji (sonda nie rozstrzygnęła — sklep kafina ma 1 produkt):** czy `?products=ID1,ID2` z **dwoma
różnymi** ID działa (to otworzyłoby bundle bez zakładania nowych SKU). Sprawdzić na sklepie testowym z 2 SKU.
Ścieżka pewna pozostaje: osobny SKU zestawu.

**Legal:** cena zestawu to **nowa oferta**, nie „obniżka" — komunikować „cena zestawu" + oszczędność kwotowo,
nie wielkie przekreślenie. Marker `<!-- DEMO-PRICING -->` jak w #7. **Operacyjnie:** 2-pak = 2 paczki dropshipping
→ policzyć marżę z klientem.

**Premium-safe:** tak — karty jako spójny z brandem element oferty, nie bazar.
**Reużycie:** patrz Część 7 — generator liczy ceny pakietów deterministycznie z ceny jednostkowej + Product DNA
decyduje, czy zestaw w ogóle ma sens (produkt zużywalny/parowalny < 300 zł).

### 1.2 — Order bump: komplementarne akcesorium przed redirectem

**Co:** po kliknięciu „Zamawiam", lekki modal (estetyka brandu, nie krzykliwy): „Dodaj [etui/kubek termiczny/
dripper] za 39 zł?" z **niezaznaczonym** checkboxem + wyraźne „Nie, dziękuję". Wybór przełącza `href` na SKU
zestawu z akcesorium. Take-rate bumpa 10-25% ceny głównej = **41%** (Focus Digital 2025).

**Legal — twarda granica:** checkbox **NIGDY domyślnie zaznaczony** — pre-checked dodatki to *sneak-into-basket*,
dark pattern wprost ścigany przez UOKiK. Akcesorium musi być realnie komplementarne (kafina: kubek/etui/dripper),
inaczej obniża trust premium.

**Zależność:** wymaga, by sklep klienta miał drugi produkt w hurtowni. Dla części projektów = nie dotyczy.
**Density:** zero on-page (modal na intencji kliknięcia, nie sekcja). **Reużycie:** ten sam komponent modala co 1.3.

### 1.3 — Interstitial wyboru pakietu (jeśli nie ma selektora w sekcji)

Alternatywa dla 1.1 gdy nie chcemy kart w sekcji oferty: modal po kliknięciu CTA z 2 kartami (1 szt / 2 szt
−10%) + „tylko 1 szt." Hook na `a[href*="checkout?products="]` **już istnieje w kafinie** (index.html:4094,
`InitiateCheckout`). Take-rate pre-purchase: ClickFunnels +30% frontend revenue; Manta Sleep 16,9% bez rabatu.
**Ryzyko:** dodatkowy krok = friction; modal musi być lekki, natychmiastowy, z wyraźnym pominięciem.

---

## Część 2 — OSTATNIA MILA: checkout TakeDrop (najtańszy zysk, zero density na landingu)

> Pełne ustalenia sondy: [takedrop-checkout-findings-2026-06.md](takedrop-checkout-findings-2026-06.md).
> **To dotyczy KAŻDEGO sklepu klienta — jeden szablon TakeDrop.** Baymard: ukryte koszty + brak trustu w
> checkoucie = **#1 powód porzuceń (48%)**. Premium landing → generyczny checkout = brand whiplash w momencie
> wpisywania danych karty.

**Znalezione na żywo (kafina, 2026-06-10):**

| # | Problem | Fix |
|---|---------|-----|
| 2.1 | `<title>` = „Twój sklep - super okazje!" (placeholder TakeDrop) — widoczny w karcie przeglądarki przy wpisywaniu karty | Zmienić nazwę sklepu w panelu TakeDrop na brand. **Per sklep, do checklisty Etap 5.** |
| 2.2 | Płatność = radio „Stripe" + logo stripe; Polak nie wie co to | Sprawdzić, czy panel pozwala zmienić etykietę na „BLIK · karta · Przelewy24". Jeśli nie — landing musi *przeduczyć*: trust strip „zapłacisz BLIK/kartą" tuż przy CTA, by „Stripe" nie zaskakiwał |
| 2.3 | Zero trustu na checkoucie (brak „30 dni zwrotu / 2 lata gwarancji"), stopka „Powered by TakeDrop" | Sprawdzić możliwość custom HTML/CSS w panelu TakeDrop → wstrzyknąć blok trust + restyling do palety brandu |
| 2.4 | COD = **+19 zł** z badge „Najlepszy wybór", Kurier/InPost 0 zł | Landing słabo komunikuje darmową dostawę (2 wzmianki drobnym drukiem) — patrz 4.x. Zweryfikować, kto steruje badgem „Najlepszy wybór" |
| 2.5 | Pole „Mam kod" istnieje, ale prefill przez URL **nie działa** | Umożliwia legalny exit-intent z realnym kodem (2.6 / 3.x) — popup pokazuje kod + przycisk „kopiuj" + „wklej w polu Mam kod" |
| 2.6 | Pełna nawigacja sklepu (szukajka, wishlist, koszyk) na checkoucie = drogi ucieczki | Jeśli panel pozwala — uprościć checkout (ukryć nawigację). Do weryfikacji |

**Działanie:** jedna sesja w panelu TakeDrop testowego sklepu → spisać, co realnie da się zmienić
(nazwa/title — na pewno; custom CSS/HTML — do sprawdzenia; etykieta płatności — do sprawdzenia; kody — tak,
pole istnieje). Wynik → **checklista „Hardening checkoutu" w Etap 5** (reużycie dla każdego sklepu).

---

## Część 3 — ODZYSK: capture + recovery (zero gęstości, czysty backend)

> 82% porzuca koszyk (Izba Gospodarki Elektronicznej, Omni-commerce 2025). Klaviyo: abandoned-cart flow =
> najwyższy RPR ($3,65) i CR 3,33% ze wszystkich flow; sekwencja 3-mailowa = 6,5× przychodu vs pojedynczy mail.
> Dziś: porzucający przed checkoutem = **0 danych**. To pieniądze leżące na stole.

### 3.1 — Nieblokujący capture e-maila na ścieżce do checkoutu
Pole e-mail + checkbox zgody w modalu pakietu (1.3) **lub** w exit-intent. `blur`/submit → `fetch(keepalive:true)`
POST do edge function `lead-capture` (Supabase `landing_leads`: email, slug, qty, checkout_clicked_at).
Przejście do checkoutu **nigdy nie czeka** na response. **RODO:** zgoda + link do polityki. Pole opcjonalne,
wizualnie drugorzędne (friction!).

### 3.2 — Własny flow recovery 1h / 24h / 72h na Supabase
`pg_cron` co 15 min → edge function `recovery-mailer`: SELECT leady `next_send_at < now() AND converted=false`,
wysyłka przez **istniejący `send-email`** (już w tn-crm), update kroku. Szablony per-brand (ton z brandingu).
Link = `checkout?products=...` z zapamiętaną ilością. **Obowiązkowo:** unsubscribe + linia „Jeśli już zamówiłeś —
zignoruj" (brak webhooka TakeDrop → flagę `converted` ustawiamy dziennym porównaniem z listą zamówień, którą i
tak dotykamy przy recovery calls). Klaviyo: pierwszy mail w 1-4h = szczyt konwersji; **nie dawać rabatu w #1**
(uczy czekania na kod).

**Density:** zero (wszystko niewidoczne). **Reużycie:** raz zbudowane → każdy sklep dostaje recovery przez wpis
slug + szablon. **Spójność z polityką:** w treści ZERO „wysyłka 24h / magazyn w Polsce".

### 3.3 — Domknięcie atrybucji (naprawa istniejącego `tracking.js`)
`tracking.js` zbiera gclid/fbclid/ValueTrack do sessionStorage, ale **nic nie dopina do linku checkoutu i nic
nie leci do Supabase** — atrybucja ginie na granicy domen. Fix: (a) doklejać `utm_*`/`fbclid`/`gclid` do
`href` checkoutu (jeśli TakeDrop je przepuszcza do zamówienia — zweryfikować); (b) wysłać snapshot do
`landing_leads` przy capture. Bez tego optymalizujemy kampanie po ślepych danych. **Powiązanie z memory:**
`project-google-ads-conversion-attribution-gaps` (master-doc pomiaru).

---

## Część 4 — ZAANGAŻOWANIE Z PRAWDZIWYCH DANYCH (selektywnie, z budżetem gęstości)

> Tu mieszka „legalne FOMO" i interaktywność. Każda pozycja jest **opt-in per Product DNA** i spłaca budżet
> Scrollability — nie wchodzą hurtem (to był błąd Atlasu).

### 4.1 — Kalkulator wartości (najbezpieczniejsza prawnie taktyka CRO)
Dla kafiny: „Ile przepalasz w kawiarni rocznie?" — 2 suwaki (kawy/tydzień × cena) → animowany wynik vs koszt
własny + amortyzacja 299 zł. ~80 linii inline JS, **zero backendu**. Evidence: cała kategoria „coffee savings
calculator" istnieje, bo działa (Clive Coffee, iDrinkCoffee pokazuje payback 15 mies. i kieruje do zakupu).
**Legal:** założenia jawne i uczciwe („przy ziarnie 60 zł/kg"), „możesz oszczędzić ok.", nie „oszczędzisz".
**Reużycie:** generator dobiera wzór per produkt (kawa→kawiarnia, parownica→pralnia chemiczna, suszarka→...).
**Density:** to *jest* nowy element — wchodzi tylko gdy produkt ma policzalną alternatywę kosztową.

### 4.2 — Real-data licznik partii (legalny substytut „zostało 3 szt.")
Supabase `landing_stock` (slug, batch_size, remaining, updated_at) + RLS whitelist anon read. Edge function
GET `/stock?slug=` cache 5 min. Render paska **tylko gdy** `remaining/batch < 0.35`; brak odpowiedzi lub
`updated_at > 7 dni` → sekcja **znika** (nigdy fallback na sztywną liczbę). UOKiK: komunikaty „ostatnie sztuki"
są legalne **wyłącznie** gdy opisują realne ograniczenie. **Premium:** cienki pasek w kolorze brandu, zero
czerwieni i migania. **Koszt:** dyscyplina operacyjna (aktualizacja `remaining`).

### 4.3 — Real-data countdown (Omnibus-proof)
Edge function `promo-window` (ends_at, ceny z tabeli `promo_windows` per slug). Render z `Date.now()` vs
`ends_at`; fetch padł → brak timera (**nigdy** hardcode daty). UOKiK ściga „wieczne promocje" — cena w TakeDrop
**musi** wrócić do regularnej po końcu okna (kalendarz promo per klient). Przekreślenie zawsze z „Najniższa cena
z 30 dni: X zł". Nadchodzący Digital Fairness Act (projekt Q4 2026) zaostrzy presję czasową — real-data jest
bezpieczne. **Wdrażać tylko gdy klient prowadzi realne okna promocyjne.**

### 4.4 — Reveal-kupon za e-mail (legalna „spin-the-wheel")
Elegancki reveal (zdrapka `<canvas>` / koperta), **stała** nagroda (np. zawsze −10%), e-mail → `lead-capture`.
Kod założony wcześniej w TakeDrop; popup pokazuje kod + „kopiuj" (prefill URL nie działa — sonda).
**Legal — najważniejsze:** **losowy** rabat = loteria promocyjna wymagająca zezwolenia (ustawa o grach
hazardowych; jest precedens uznania wirtualnego koła za naruszenie). **Stała nagroda = zero losowości = legalne.**
Gamifikowane popupy: 9-13% konwersji vs 3,5% standardowych (OptiMonk/Claspo 2025). **Premium:** reveal, nie neon.

### 4.5 — Mikro social-proof z prawdziwych danych
Toast „ostatnie zamówienia" / licznik właścicieli — **tylko z realnego feedu** (TakeDrop/CRM przez edge
function). Fabrykowany = nieuczciwa praktyka (Omnibus/UCPD). Bez realnego feedu — **nie robić** (toolkit robił
to z hardcoded list = nielegalne, dlatego wyłączone).

---

## Część 5 — VIDEO / UGC następny poziom (mamy reels+stories — co dalej)

- **5.1 Shoppable tap-to-buy w lightboxie reels** — karta z ceną + „Zamawiam" pojawia się po 3s odtwarzania
  (`timeupdate` listener, ~40 linii). Whatmore 2026 (A/B): watcher CVR **+125% median**; Tolstoy: widzowie
  shoppable video 2,2% vs 0,44% strony (5×). **Premium:** jeden slide-in, bez pulsowania, nie zasłania napisów.
- **5.2 Galeria UGC „Zdjęcia od klientów"** nad sekcją oferty — siatka zdjęć (mamy je już w 25 opiniach
  kafiny z CDN). Substytucyjne względem istniejących opinii, nie nowa ciężka sekcja.
- **5.3 Video testimonials (selfie-style, z napisami)** w sekcji opinii — gdy klient dostarczy materiał.
  Talking-head > tekst, ale tylko realne (fake = ryzyko). **Big-bet** (zależy od materiału klienta).

---

## Część 6 — EKSPERYMENT RUCHU: pre-lander (test na poziomie kampanii, nie gęstość strony)

> To **nie** dokładanie do landinga — to **osobny adres docelowy** ad-setu, zgodnie z naszą zasadą routingu
> reklam przez adres, nie UTM. Testowane A/B na poziomie ad-setów przez raporty `workflow_ad_reports`.

- **6.1 Quiz jako pre-lander** (model IL MAKIAGE: 20M+ quizów, $380M gross 2022; Octane AI: quiz-takers
  konwertują 7-25% vs 2-3%). Anchor `#quiz`, 3-5 pytań, wynik = persona + dobrane argumenty + CTA.
  **Uwaga doktrynalna:** Quiz Funnel był *wycofany* z on-page (za ciężki — [quiz-funnel-research.md]). Jako
  **pre-lander** (osobna strona dla wybranego ad-setu) omija zarzut gęstości landinga. Mierzyć pełny lejek
  quiz_start → complete → purchase, nie sam CR quizu. **Legal:** przy 1 produkcie nie udawać „algorytm dobrał
  produkt" — dobieramy argumenty, nie produkt.
- **6.2 Advertorial / listicle „7 powodów"** jako pre-lander dla zimnego ruchu Meta. SplitBase×Snow: +25%
  ROAS. **Legal:** oznaczyć jako materiał marketingowy (kryptoreklama = UOKiK), bez fałszywych „mediów" i
  zmyślonych autorów-ekspertów.

---

## Część 7 — ARCHITEKTURA REUŻYCIA (sedno: „AI robi to, co robił zespół")

> Wymóg usera: *„od razu myśleć jak to zrobić, aby każdy kolejny projekt mógł skorzystać"* + *„skoro mamy AI,
> możemy wdrożyć to, co kiedyś robiły zespoły"*. Poniżej system, nie lista łatek do kafiny.

### 7.1 — `conversion-toolkit.js` → **toolkit-v2** (real-data, config-driven, inline)
Stary toolkit jest usuwany (v5.0 #1) bo jego moduły FOMO są fake. **Nie wskrzeszamy go — budujemy następcę**
zgodny z self-contained (inline, zero `<script src>`): te same nazwy modułów, ale **każdy czyta realne dane**
(stock/promo/social z Supabase edge functions) i **degraduje do ukrycia** gdy danych brak. Konfiguracja przez
mały obiekt `init({slug, brand, modules})` wklejany inline. Wzorzec już sprawdzony: WhatsApp widget + ReviewsWidget
czytają config z bazy przez REST — to właściwy kierunek dla reszty.

### 7.2 — Backend Supabase (raz zbudowany → każdy sklep przez slug)
| Tabela / function | Rola | Część |
|---|---|---|
| `landing_leads` + edge `lead-capture` | capture e-mail/qty/atrybucja | 3.1, 3.3, 4.4 |
| edge `recovery-mailer` + `pg_cron` | flow 1h/24h/72h przez `send-email` | 3.2 |
| `landing_stock` + edge `/stock` | real-data licznik partii | 4.2 |
| `promo_windows` + edge `/promo-window` | real-data countdown | 4.3 |
| kody rabatowe w TakeDrop | reveal-kupon | 4.4 |

RLS: każdy publiczny klucz = osobna policy whitelist (memory `feedback-settings-anon-whitelist`). Klucz anon
jest w kodzie strony — **żadnych sekretów**, tylko read-whitelist i insert-only z walidacją.

### 7.3 — Pipeline: nowy krok generujący **Warstwę Konwersji per produkt**
Tu jest „AI = zespół". Zespół CRO robił ręcznie, per produkt: liczył ekonomię zestawów, projektował wzór
kalkulatora, pisał drzewo quizu, układał tabelę porównań, pisał 3 maile recovery, dobierał akcesorium do bumpa.
**Generator (rozszerzenie forge) robi to z `workflow_id`** — z danych produktu/persony/ceny/brandu:
- ceny pakietów (deterministyczna formuła z ceny jednostkowej — jak guardrail #7),
- stałe kalkulatora (alternatywa kosztowa dobrana per kategoria produktu),
- komplementarne akcesorium do order-bumpa (z hurtowni klienta),
- 3 szablony recovery w tonie brandu,
- konfig `init()` toolkit-v2 (które moduły włączyć wg Product DNA).
Output → `_brief.md` sekcja „Warstwa Konwersji" + inline w landingu. **Każdy kolejny projekt dostaje to z
konfiguracji, nie ręcznie.**

### 7.4 — Egzekwowanie (spójne z v5.0)
Każdy nowy element przechodzi `verify-landing.sh` (fake urgency = FAIL, COD-only-dla-TN, Omnibus). Real-data
moduły **z definicji** przechodzą (brak hardcoded liczb scarcity). Nowe checki: marker `DEMO-PRICING` przy
zestawach, obecność zgody RODO przy capture, brak hardcode daty w countdownie. **Rollout WARN→FAIL** jak w v5.0.

---

## Część 8 — CZARNA LISTA (czego NIE robimy, choć Temu robi)

> Świadoma decyzja — wdrożenie byłoby nielegalne, off-brand lub obniżyłoby zaufanie do nieznanego sklepu
> (klient i tak się waha, czy to nie scam). Trzymamy to spisane, by nie wracało „bo konkurencja ma".

| Mechanika Temu/Shein | Dlaczego NIE | Nasz legalny odpowiednik |
|---|---|---|
| Koło fortuny z losowym rabatem | Loteria promocyjna = zezwolenie (precedens UOKiK); wizualnie bazar | 4.4 reveal ze **stałą** nagrodą |
| Fake countdown (evergreen reset) | Wprost ścigane przez UOKiK; własne 04-design H.4 zakazuje | 4.3 real-data z `promo_windows` |
| „Zostało 3 szt." z palca | Fabrykowana scarcity = dark pattern (UOKiK, kara do 10% obrotu) | 4.2 real-data `landing_stock` |
| Fake social proof („Anna z Krakowa kupiła") z hardcoded list | Nieuczciwa praktyka (Omnibus/UCPD) | 4.5 tylko z realnego feedu, inaczej brak |
| Fałszywe przekreślenie 399→299 bez historii | Omnibus: wymóg najniższej ceny z 30 dni | adnotacja 30-dniowa lub anchor wartością (kalkulator) |
| „Zweryfikowany zakup" na każdej opinii z AliExpress | Omnibus: wymóg realnej weryfikacji opinii | v5.0 #2 disclosure „charakter poglądowy" |
| Pre-checked dodatki w koszyku | Sneak-into-basket, UOKiK | 1.2 bump zawsze odznaczony |
| „Wysyłka 24h / magazyn w PL" | To dropshipping — nieprawda | uczciwy czas w FAQ (7-14 dni) |
| Stos 6 floating widgetów naraz | Wizualny spam, mobilny stack już ciasny | jeden cel naraz, density budget |

---

## Część 9 — Kolejność wdrożenia i pomiar

**Mapowanie na wymiary v5.0:** W2 (konwersja żywych sklepów) — wszystko poniżej; W3 (bezpieczeństwo prawne) —
Część 2/8 i legal-guardraile; W5 (trwałość) — Część 7 reużycie.

1. **Tydzień 1 — zero ryzyka, najtańsze:** Część 2 (hardening checkoutu — 1 sesja w panelu TakeDrop) +
   adnotacja Omnibus przy cenie. Czysta higiena, mierzalne od razu (spadek porzuceń na checkoucie).
2. **Tydzień 1-2 — dźwignia #1:** 1.1 realne SKU zestawów + free-shipping-on-bundle na **jednym** sklepie
   pilotażowym. Zmierzyć AOV przed/po. To decyduje, czy budujemy generator (7.3).
3. **Tydzień 2-3 — backend odzysku:** 3.1 capture + 3.2 recovery flow + 3.3 atrybucja. Zero density, czysty
   przychód z porzuceń. Reużywalne od pierwszego dnia.
4. **Tydzień 3-4 — zaangażowanie selektywnie:** 4.1 kalkulator (kafina) + 5.1 shoppable reels. Każde z
   budżetem density, A/B gdzie się da.
5. **Później — real-data FOMO (4.2/4.3/4.4):** dopiero gdy backend stoi i klient prowadzi realne okna/stany.
6. **Eksperyment:** 6.1/6.2 pre-landery jako osobne ad-sety, mierzone ROAS-em.
7. **Równolegle — system:** 7.1 toolkit-v2 + 7.3 generator, gdy pilot 1.1 potwierdzi AOV.

**Jak poznamy, że działa:** AOV i koszt zakupu z pętli raportowej Etap 4/5 (`workflow_ad_reports`),
porównanie kwartalne; recovery — przychód z flow / liczba leadów; checkout — spadek porzuceń (gdy TakeDrop
da dane). Żadna pozycja nie wchodzi bez zadeklarowanego efektu — zasada v5.0.

---

### Źródła (weryfikowalne)
Gemius „E-commerce w Polsce 2025" (BLIK 72%, InPost 87%, multi-payment +52%); Izba Gospodarki Elektronicznej
Omni-commerce 2025 (porzucenia 82%); Baymard Institute (ukryte koszty 48% porzuceń, 200k+ h badań); Spiegel/
Northwestern (rating 4,2-4,7 > 5,0); Focus Digital 2025 (order bump 37,8%/41,3% take-rate); Klaviyo (abandoned
flow RPR $3,65, 3-mail 6,5×); stay.ai „9 High-Converting Buy Boxes" (multipack +30-50% AOV); Whatmore Shoppable
Video Benchmarks 2026 (+125% watcher CVR); Tolstoy (5× CVR); IL MAKIAGE/ODDITY (quiz 20M+, $380M); OptiMonk/
Claspo 2025 (gamified popup 9-13%); UOKiK — stanowisko ws. dark patterns + dyrektywa Omnibus (art. 4 ust. 2
ustawy o cenach). Surowe dane researchu: `c:/tmp/research.json`, audyty: `c:/tmp/audits.json`.
