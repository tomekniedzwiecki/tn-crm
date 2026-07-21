# MODUŁY KANONICZNE — biblioteka mechaniki sekcji (fabryka landingów)

**Status: OBOWIĄZUJE (2026-07-17, audyt R13).** Powód powstania: werdykty vision
odpuszczały defekty mechaniki („Kafle mniejsze niż makieta — bez wpływu na charakter"),
a każdy landing kodował mechanikę od zera → regresje (slivery wideo Odpalaka). Moduł =
zamrożona, przetestowana mechanika sekcji wydzielona z OSTATNIEGO DOBREGO landingu.

## ZASADA UŻYCIA (twarda)
> **Koder MUSI użyć modułu jako BAZY MECHANIKI, gdy budowana sekcja ma tu odpowiednik.**
> Skórowanie = TYLKO tokeny/kolory/promienie/cienie/treść (patrz kontrakt w nagłówku pliku).
> **Pisanie mechaniki od zera dla sekcji, która ma moduł = ODSTĘPSTWO** — raportowane w
> LEDGER (`ODSTĘPSTWO: sekcja X kodowana bez modułu Y, powód: …`). Z6 (design per projekt)
> dotyczy WYGLĄDU, nie MECHANIKI — mechanika jest wspólna i sprawdzona.

Kontrakt każdego modułu (co wolno / czego nie ruszać / anty-wzorzec) jest w komentarzu
nagłówkowym pliku `<moduł>@<wersja>.html`. Proporcje i JS = nietykalne; tokeny = do skórki.

## INDEKS

| moduł | wersja | plik | źródło (landing@commit · data) | kontrakt (skórka / nietykalne) |
|---|---|---|---|---|
| **wideo-rail** | @1 | `wideo-rail@1.html` | loczek@8726382b · 2026-07-17 | skórka: tokeny/kolory/radius, liczba kafli N (→ `repeat(N,1fr)`). NIETYKALNE: flex 0 0 68% + snap (mobile), aspect-ratio 9/16, grid `repeat(N,1fr)` (desktop), cały JS (IO-autoplay, unmute-exclusive, kropki). ⛔ `grid-auto-flow:column;grid-auto-columns:1fr` = slivery. |
| **lightbox** | @1 | `lightbox@1.html` | loczek@8726382b · 2026-07-17 | skórka: kolory/radius/blur overlaya i ×. NIETYKALNE: delegacja na `document` z `.closest('.gitem')`, odczyt `data-full`/alt, zamknięcie tło/×/Escape. ⛔ osobny listener per kafel. |
| **sticky-buy** | @1 | `sticky-buy@1.html` | loczek@8726382b · 2026-07-17 | skórka: tokeny/kolory/radius, treść (marka/cena/metody), href. NIETYKALNE: fixed + translateY(120%)→.show, `@media(min-width:900px){display:none}`, body padding-bottom, IO na `.hero`. ⛔ pokazywanie od razu / na desktopie. |
| **faq-accordion** | @1 | `faq-accordion@1.html` | loczek@8726382b · 2026-07-17 | skórka: tokeny/kolory/radius, treść pytań, obraz media. NIETYKALNE: grid `1.62fr 1fr` + bp 820px, natywny `<details>/<summary>` (ZERO JS), ikona ::before/::after, media sticky top:90px. ⛔ przepisanie na JS accordion. |
| **footer** | @1 | `footer@1.html` | drapek@2026-07-18 · montaż finalny | skórka: tokeny/kolory/radius, treść (marka/claim/rating/copyright/teksty linków), favicon. NIETYKALNE: 3 strefy `.foot-top` (marka+claim+rating / linki prawne / zaufanie) + `.foot-bottom`, KOMPLET linków (Regulamin·Polityka·Zwroty·Dostawa·Kontakt) z placeholderami `{{*_URL}}`, pay-badges kanoniczne, siatka 3→2→1 (bp 820/520), touch ≥40px, ZERO JS. ⛔ „stopka = jedna linijka wyśrodkowana" / wordmark z obrazka. |
| **porownanie-tabela** | @1 | `porownanie-tabela@1.html` | masazer#porownanie · 2026-07-21 (+ honest-minus z drapek) | skórka: tokeny/kolory/promienie, treść (nazwy kolumn, punkty list, obraz), liczba `<li>`, tło. NIETYKALNE: grid `1fr 1px 1fr` + bp 760 (`.cmp-div` stretch → pozioma hairline na mobile), kolumna „inni" = `.muted` (kontrast bez agresji), `.cmp-minus` = OBOWIĄZKOWA nota uczciwości (mechanizm zaufania), `.cmp-fig` 5/4→16/11. Fonty przez `--font-display`. ⛔ usunięcie cmp-minus / puffery „robi wszystko" / przepisanie na `<table>` lub macierz 15 wierszy / czerwone „✗" przekreślenia konkurencji / 1 kol bez hairline. |
| **opinie** | @1 | `opinie@1.html` | masazer#opinie · 2026-07-21 (+ gwiazdki-per-karta z drapek) | skórka: tokeny/kolory/promienie, treść (ocena+liczność+%, cytaty, zdjęcia, etykiety), liczba kart, wypełnienie ★ (inline `width:PROC%` / liczba ★ + `.off`), tło. NIETYKALNE: nakładka ułamkowa `.rstars` (warstwa `--line` + przycięta `--star`) z aria-label niosącym realną ocenę, siatka `repeat(4,1fr)`→2(≤900)→1(≤520), `.ophoto` 1/1 `object-fit:cover`, `.oquote::before` cudzysłów, ocena zbiorcza jako osobne pudełko. Fonty `--font-display`/`--font-text`, ZERO JS. ⛔ karuzela/slider JS / gwiazdki bez aria lub szerokość ≠ ocena / wymyślone cytaty. |
| **offer-box** | @1 | `offer-box@1.html` | masazer#zamow · 2026-07-21 (+ off-hr/tarcza z drapek) | skórka: tokeny/kolory/promienie, treść (nagłówek, „Co dostajesz"+lista, cena, etykieta CTA, risk-reversal, microcopy, ocena), packshot, dekoracyjne „+", tło. NIETYKALNE: grid `.95fr 1.05fr` + bp 820 → 1 kol z packshotem NAD kartą (`order:-1`); **KONTRAKT KONWERSJI** — komplet: „Co dostajesz"+lista, cena(`data-price`), CTA `.btn.cta`(`data-checkout`), risk-reversal `.off-reassure`, `.off-pay`=pay-badges KANON (blik·visa·mc·cod)+`.ret-badge`, ocena `.off-rate` (`.rstars` ułamkowa); hooki `data-checkout`/`data-price`. Fonty `--font-display`/`--font-text`. pay-badges = SLOT (wklej wspólny kanon, jak footer@1). ⛔ brak risk-reversal / brak pay-badges / CTA bez `data-checkout` / ukrycie COD / cena bez `data-price` / packshot pod kartą na mobile. |
| **galeria** | @1 | `galeria@1.html` | masazer+mata#galeria · 2026-07-21 (fix aspect/lightbox/podpisy) | skórka: tokeny/kolory/promienie, eyebrow+tytuł, **`--gal-aspect` (wg ZMIERZONYCH zdjęć!)**, `--gal-cols`, liczba kadrów (3–6), object-position per kadr, `.gal-card--wide` (span 2). NIETYKALNE: **kontrakt lightbox@1 (`.gitem` + `data-full` — podgląd DZIAŁA, nie nawiguje)**, `object-fit:cover` + JEDEN `--gal-aspect` dla wszystkich, **PODPIS = co kadr NAPRAWDĘ pokazuje (anti-drift)**, siatka N→2(≤900)→1(≤620), focus-visible `--cta`, ZERO własnego JS. ⛔ zaszyty prostokąt (3/4.75) na kwadratach = przycięte boki / `<a href>` bez `preventDefault` = nawigacja do pliku / `data-lightbox` (martwy atrybut) / podpis „z planu" ≠ zdjęcie / upscaling plików <~300px. |
| **checkout-inline** | @1 | `checkout-inline@1.html` | zbudowany od zera · 2026-07-20 (CHECKOUT-INLINE-SPEC + research Baymard/PL-prawo) | skórka: tokeny `--zc-*` (paleta/promienie/cień/font), copy nagłówka (`.zc-eyebrow`/`.zc-h2`), chipy trust + dane firmy `.zc-merchant`, miniatura/nazwa/cena z KONFIGURACJI, opcjonalny dekoracyjny backdrop. NIETYKALNE: CAŁY JS (config z wf2-landing-api blok `platform` LUB `data-zc-config`; clientId `trv_cid`→localStorage→UUIDv7; lazy-load dostaw/płatności; flow cart/item→checkout-details→order/cart; BLIK 6-box + polling 2,5 s/max 90 s; COD inline; redirect online; walidacja PL on-blur), STRUKTURA i KOLEJNOŚĆ pól (Imię i nazwisko→Telefon→E-mail→Ulica i numer→Kod→Miejscowość, 1 kolumna, etykiety nad polami, autocomplete+inputmode+enterkeyhint), brzmienie przycisku **„Zamawiam i płacę"** / przy wybranym COD **„Zamawiam i płacę przy odbiorze"** (dynamiczne `ctaLabelText()`; oba komunikują obowiązek zapłaty — art. 17 ust. 3–4 UoPK; standard fabryki, decyzja Tomka 21.07), checkbox regulaminu NIE pre-checked, eventy (trevio addToCart/beginCheckout/addShippingInfo/paymentInitiated/purchase\|purchaseOnDelivery; Meta AddToCart/InitiateCheckout@submit + Purchase eventID=orderId TYLKO COD/BLIK-sukces). Desktop ≥900px: formularz + sticky kolumna podsumowania. **Wariant layoutu `layout` = flat (default) \| steps** (steps = micro-konfigurator: 4 wizualne kroki Kontakt[E-mail→Telefon]/Adres/Dostawa/Płatność na JEDNEJ stronie, bez „Dalej"; reorder pól przez DOM przy init, NIE CSS `order`; auto-advance on-blur + zwijanie ukończonych do podsumowania + edycja wstecz = NIETYKALNE; skórka = tokeny `--zc-step-*` + tytuły kroków); włączany `data-zc-config.layout='steps'` LUB atrybut `data-zc-layout="steps"`. **identify** (oba layouty): `window.trevio.identify({EmailHash\|PhoneHash})` po pozytywnej walidacji e-maila/telefonu on-blur, raz per wartość. ⛔ pole kodu rabatowego widoczne / liczniki presji / rejestracja / 2 kolumny pól na mobile / pre-checked checkbox / autocomplete="off" / label „Zamawiam"/„Kup teraz" / fbq Purchase przy redirect / ukrywanie COD. |

## WERSJONOWANIE
- `@N` w nazwie pliku = wersja mechaniki. Zmiana mechaniki (nowe zachowanie/proporcje) =
  nowy plik `@N+1` + wpis w CHANGELOG poniżej; stara wersja zostaje (landingi ją pinują).
- Zmiana kosmetyczna dokumentacji nie bumpuje wersji.
- Źródłem wersji jest ZAWSZE konkretny commit dobrego landingu (nie „z głowy").

## CHANGELOG
- **2026-07-21 — galeria@1 (NOWY) + fix żywej galerii maty:** wydzielony kanoniczny moduł galerii
  produktowej (był kodowany per-landing). Powód powstania = **realny defekt na macie zgłoszony przez
  Tomka**: (1) kafle `aspect-ratio:3/4.75` (wysoki prostokąt) + `object-fit:cover` **przycinały
  kwadratowe zdjęcia po bokach** (zmierzone: keep1–3 ≈1:1, keep4 pion, keep5 szeroki 2.4:1); (2)
  lightbox **nie robił `preventDefault`**, a kafle to `<a href>` → klik **nawigował do gołego .webp**
  („dziwne działanie") + martwy `data-lightbox` zamiast kontraktowego `data-full`; (3) **podpisy
  pomieszane** („Wałek pod kark" wisiał na makro kolców; „Zestaw w pokrowcu" na płaskiej macie).
  **REGUŁA NADRZĘDNA modułu: kafel MUSI pasować do proporcji zdjęć, które faktycznie mamy** —
  koder mierzy realne pliki i ustawia `--gal-aspect` (domyślnie 1/1 dla kwadratowych zdjęć Ali);
  ⛔ nigdy zaszyty prostokąt na kwadratach. Podpis = co kadr NAPRAWDĘ pokazuje (anti-drift).
  Żywa mata naprawiona 1:1 wg modułu (kwadrat + `data-full` + `preventDefault` + podpisy), zrzut
  kafli zweryfikowany okiem. Egzekucja: doktryna w STANDARD/GRAFIKA (galeria = zawsze moduł).
- **2026-07-21 — checkout-inline@1: CTA „Zamawiam i płacę (przy odbiorze)"** — decyzja Tomka:
  standard fabryki. Label dynamiczny `ctaLabelText()`: COD → „Zamawiam i płacę przy odbiorze",
  inne metody → „Zamawiam i płacę" (oba brzmienia = obowiązek zapłaty wprost, art. 17 UoPK OK).
  Aktualizacja w recalcTotal() + setBusy(); kopie (usmieszek-checkout, mata) 1:1. Bez bumpu
  wersji (zmiana kontraktowa treści CTA, zero zmian flow).
- **2026-07-21 — checkout-inline@1: fix kosmetyczny mobile** — `.zc-total-v` dostał
  `white-space:nowrap` (pasek „Razem do zapłaty" zawijał samo „zł" do drugiej linii @375px;
  znalezione przy osadzeniu na macie). Bez bumpu wersji (kosmetyka, zero zmian mechaniki).
  Kopie zaktualizowane 1:1: usmieszek-checkout, mata. Drugie osadzenie modułu = landing maty
  (`sklepy/tomek-niedzwiecki/mata/`, wariant steps, skórka aliasami tokenów — wzorzec STANDARD).
- **2026-07-21 — porownanie-tabela@1 · opinie@1 · offer-box@1 (NOWE, 3× headless skeleton):**
  wydzielone 3 nawracające sekcje z ~12 landingów `sklepy/tomek-niedzwiecki/*` jako reużywalne,
  HEADLESS moduły (struktura DOM + mechanika + a11y + SLOTY na treść; ZERO tożsamości — kolory
  I fonty przez tokeny, zero hexów/krojów/realnego copy). Powód: te 3 typy sekcji były kodowane
  per-landing (jak wcześniej wideo/faq/sticky) → ryzyko regresji mechaniki; sprawdzony szkielet =
  mniej bugów. **Additywne — istniejące `index.html` NIETKNIĘTE, koder MOŻE użyć.**
  Źródła (zsyntetyzowana najlepsza wersja z najlepszych landingów):
  • **porownanie-tabela@1** ← masazer#porownanie (2-kol „my↔inni" + hairline) + honest-minus z drapek.
    „tabela" = sprawdzony wzorzec DWÓCH KOLUMN (NIE `<table>`); nietykalna nota uczciwości `.cmp-minus`.
  • **opinie@1** ← masazer#opinie (ocena zbiorcza + siatka kart ze zdjęciem) + gwiazdki-per-karta z drapek.
    Nietykalna nakładka ułamkowa `.rstars` (aria niesie ocenę), siatka 4→2→1, `.ophoto` 1/1.
  • **offer-box@1** ← masazer#zamow (najpełniejsza karta) + off-hr/tarcza z drapek. Zamraża
    KONTRAKT KONWERSJI (co dostajesz · cena · CTA · risk-reversal · pay-badges+zwrot · ocena) i hooki
    `data-checkout`/`data-price`; pay-badges = SLOT na kanon (jak footer@1, bez zaszytych hexów logotypów).
  **Nota konwencji:** te 3 idą dalej niż footer@1/sticky-buy@1 (które zaszywały „Baloo 2") — fonty
  wyłącznie przez `--font-*`, zgodnie z NAJNOWSZĄ konwencją landingów (mata definiuje
  `--font-display`/`--font-text`/`--font-accent`; jej `.rstars` = `var(--font-display)`). Pełny headless =
  wygląd wychodzi w 100% z tokenów. Skórka MUSI zdefiniować `--font-display` + `--font-text`.
- **2026-07-21 — checkout-inline@1 (ROZSZERZENIE, bez bumpu wersji):** dodany wariant layoutu
  `layout` = flat (default) \| **steps** oraz eventy **identify**. Rozszerzenie PRZED pierwszym
  produkcyjnym użyciem (v3 = flat już żyje) — dlatego bez `@2`; flat vs steps = A/B do
  rozstrzygnięcia na realnym ruchu. `steps` = micro-konfigurator wizualny: 4 kroki (Kontakt
  [E-mail→Telefon] / Adres dostawy / Sposób dostawy / Płatność) na jednej stronie, zero „Dalej",
  zero przeładowań; auto-advance po walidacji on-blur (zwija ukończony do „✓ + skrót" + „Zmień",
  rozwija następny, focus + scrollIntoView block:'nearest'), klik w nagłówek = edycja wstecz,
  submit z niekompletnym krokiem rozwija pierwszy niekompletny. **Reorder pól rozwiązany przez DOM**
  (JS przenosi te SAME inputy/name/id do kontenerów `.zc-step` przy init steps — NIE przez CSS
  `order`, który rozjeżdża kolejność TAB/focus; flat = markup nietknięty → kontrakt kolejności flat
  zachowany „za darmo"; E-mail przed Telefonem występuje TYLKO w steps). Skórka steps = nowe tokeny
  `--zc-step-*` + tytuły kroków; mechanika = NIETYKALNA. **identify** (oba layouty): po pozytywnej
  walidacji e-maila/telefonu (on-blur) `window.trevio.identify({EmailHash:<email>})` /
  `({PhoneHash:'+48'+9 cyfr})`, raz per wartość (dedup), forma pól wg guide GET /docs z fallbackiem
  `{type,value}`; brak `window.trevio` = cicho pomijane. Demo `usmieszek-checkout/` przełączone na
  `layout:'steps'` (osobna ścieżka demo-steps; flat żyje na v3). Kontrakt modułu zaktualizowany
  (sekcja WARIANT LAYOUTU + IDENTIFY w nagłówku pliku).
- **2026-07-20 — checkout-inline@1 (NOWY):** pierwszy kanoniczny checkout OSADZONY w sekcji
  `#zamow` landinga (COD + BLIK inline, płatność online = redirect). Powód powstania: Public
  Storefront API Trevio (`api.trevio.pl/storefront/*`, bez klucza, keyed websiteId+clientId —
  odkryte 20.07) umożliwiło własny checkout na landingu bez wyjścia do kasy platformy. Cel:
  konwersja (COD = wpisz adres i klikasz) + brak wyjścia z landinga + pełna atrybucja
  (reuse clientId z ciastka `trv_cid` SDK platformy — inaczej atrybucja pusta). Zbudowany OD
  ZERA wg `CHECKOUT-INLINE-SPEC.md` (flow potwierdzony empirycznie, zamówienie 17998771) +
  research UX (Baymard) i PL-prawo (art. 17 ust. 3–4 UoPK: brzmienie przycisku „Zamawiam z
  obowiązkiem zapłaty" = warunek zawarcia umowy; checkbox regulaminu NIE pre-checked; BLIK 6
  boxów; kod pocztowy liberalny; telefon +48). Zasila go rozszerzony `wf2-landing-api` (nowy
  blok odpowiedzi `platform: {website_id, product_id, variant_id}`). Demo: `sklepy/
  tomek-niedzwiecki/usmieszek-checkout/` (tryb override `data-zc-config`, sklep „test").
  Świadome ograniczenia v1: tylko kurier DoorToDoor (paczkomaty → @2), bez kodów rabatowych,
  quantity=1, bez faktury firmowej (invoice:false).
- **2026-07-18 — footer@1 (NOWY):** pierwszy kanoniczny footer fabryki, wydzielony z `drapek`
  (montaż finalny). Powód: Tomek — „footer praktycznie nie ma, a to ważne miejsce: regulamin,
  polityka prywatności, elementy zaufania". Footer = STANDARD każdego landingu (patrz STANDARD F4).
  Struktura: marka+claim+rating / komplet linków prawnych (placeholdery {{*_URL}}) / warstwa
  zaufania (pay-badges + chipy) / copyright. Bez JS.
- **2026-07-17 — @1 (wszystkie 4):** wydzielone z `loczek@8726382b` (ostatni dobry przed
  audytem R13). Loczek/Odpalak jako pliki landingów idą do kosza — moduły przejmują ich
  sprawdzoną mechanikę. Powód: audyt R13 wykrył, że werdykty vision odpuszczały regresje
  mechaniki (slivery wideo, kafle < makieta) — mechanika przestaje być „per landing".

## POWIĄZANIA
- Egzekwowanie: `STANDARD-LANDING-SKLEPY.md` (F4 — kontrakt użycia modułów) + `SEKCJA-Z-MAKIETY.md`
  (Krok 5 — rubryka werdyktu) + `scripts/mockup-tools/gate-check.py` (LAYOUT-diff łapie
  regresje mechaniki nawet gdy vision je przepuści).
- Typy sekcji (kodowa vs scenowa) i progi: `scripts/mockup-tools/gate-manifest.json`
  (`sekcja_typy`, `layout_diff`).
