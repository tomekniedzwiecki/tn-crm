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
| **checkout-inline** | @1 | `checkout-inline@1.html` | zbudowany od zera · 2026-07-20 (CHECKOUT-INLINE-SPEC + research Baymard/PL-prawo) | skórka: tokeny `--zc-*` (paleta/promienie/cień/font), copy nagłówka (`.zc-eyebrow`/`.zc-h2`), chipy trust + dane firmy `.zc-merchant`, miniatura/nazwa/cena z KONFIGURACJI, opcjonalny dekoracyjny backdrop. NIETYKALNE: CAŁY JS (config z wf2-landing-api blok `platform` LUB `data-zc-config`; clientId `trv_cid`→localStorage→UUIDv7; lazy-load dostaw/płatności; flow cart/item→checkout-details→order/cart; BLIK 6-box + polling 2,5 s/max 90 s; COD inline; redirect online; walidacja PL on-blur), STRUKTURA i KOLEJNOŚĆ pól (Imię i nazwisko→Telefon→E-mail→Ulica i numer→Kod→Miejscowość, 1 kolumna, etykiety nad polami, autocomplete+inputmode+enterkeyhint), brzmienie przycisku **„Zamawiam z obowiązkiem zapłaty"** (art. 17 ust. 3–4 UoPK), checkbox regulaminu NIE pre-checked, eventy (trevio addToCart/beginCheckout/addShippingInfo/paymentInitiated/purchase\|purchaseOnDelivery; Meta AddToCart/InitiateCheckout@submit + Purchase eventID=orderId TYLKO COD/BLIK-sukces). Desktop ≥900px: formularz + sticky kolumna podsumowania. **Wariant layoutu `layout` = flat (default) \| steps** (steps = micro-konfigurator: 4 wizualne kroki Kontakt[E-mail→Telefon]/Adres/Dostawa/Płatność na JEDNEJ stronie, bez „Dalej"; reorder pól przez DOM przy init, NIE CSS `order`; auto-advance on-blur + zwijanie ukończonych do podsumowania + edycja wstecz = NIETYKALNE; skórka = tokeny `--zc-step-*` + tytuły kroków); włączany `data-zc-config.layout='steps'` LUB atrybut `data-zc-layout="steps"`. **identify** (oba layouty): `window.trevio.identify({EmailHash\|PhoneHash})` po pozytywnej walidacji e-maila/telefonu on-blur, raz per wartość. ⛔ pole kodu rabatowego widoczne / liczniki presji / rejestracja / 2 kolumny pól na mobile / pre-checked checkbox / autocomplete="off" / label „Zamawiam"/„Kup teraz" / fbq Purchase przy redirect / ukrywanie COD. |

## WERSJONOWANIE
- `@N` w nazwie pliku = wersja mechaniki. Zmiana mechaniki (nowe zachowanie/proporcje) =
  nowy plik `@N+1` + wpis w CHANGELOG poniżej; stara wersja zostaje (landingi ją pinują).
- Zmiana kosmetyczna dokumentacji nie bumpuje wersji.
- Źródłem wersji jest ZAWSZE konkretny commit dobrego landingu (nie „z głowy").

## CHANGELOG
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
