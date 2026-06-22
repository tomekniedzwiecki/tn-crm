# K1 — dobór produktu + przejścia kierunków + K2/K3 (projekt wdrożeniowy)

**Status:** zatwierdzony kierunek (decyzja Tomka 2026-06-21: K1 ma AKTYWNIE proponować produkty; źle dobrany produkt psuje wszystko). Powstał z workflow research (4 agenty web + synteza). Pełny research-prose w transkrypcie workflow; tu = decyzje + kontrakt + checklista.

## Werdykt źródła propozycji
- **MVP = AI + live web_search** → nowa funkcja `bud-products` (fork `bud-assess`, Responses API + `web_search`, gpt-5.5). Realne sygnały (AliExpress orders, Allegro „sprzedane", Amazon Best Sellers, TikTok) z **obowiązkowym `sygnal_popytu` + `ref_url`** per propozycja (brak źródła = odrzut w sanity-check). Zero nowej integracji/sekretów.
- **AliExpress Affiliate API = enrichment później** (`aliexpress.affiliate.hotproduct.query`, pole `lastest_volume`=realna liczba zamówień + `product_main_image_url`). Gated (akceptacja konta 1-2 dni), podpis (preferuj `sign_method=hmac` SHA256, natywny w Deno). Wspólny interfejs `ProductCandidate` + adapter `aliexpress`/`web`. **Tomek: załóż konto na `portals.aliexpress.com` (darmowe) — gdy przyjdzie, dołożę adapter.**
- CJ Dropshipping odrzucone (sygnał `listedNum` za słaby jako jedyny).
- **Zdjęcia w kartach: NIE generujemy w MVP** (5× gpt-image = ~0,20 USD + 30 s na każde „pokaż inne"). Realne zdjęcia dopiero w `<projekt>` po wyborze (lub `product_main_image_url` przy AliExpress).

## Rubryka „winning product" (PL, zł, COD) — steruje propozycjami + bramką
**Twarde progi:** cena detaliczna 80–300 zł · marża ≥ 2,5–3× landed cost (≥ ~70–90 zł/szt. przed reklamą) · waga < ~1,4 kg, kompaktowy, niekruchy, paczkomatowy, bez baterii/montażu/rozmiarówki · scroll-stop < 3 s (problem-solver/wow, sprzedawalny wideo) · trudno dostępny stacjonarnie · szeroka grupa + evergreen.
**Czerwone flagi (odrzut):** markup < 2× / cena < ~80 zł · odzież z rozmiarówką/obuwie/bielizna (zwroty) · tania elektronika BT · szkło/ceramika · trademark/podróbki · suplementy/medyczne/regulowane/broń · kruchy/wielkogabarytowy · dosłowny klon nasyconego rynku BEZ kąta (sama konkurencja ≠ flaga).
**Sygnał popytu (każda propozycja MUSI mieć dowód):** liczba zamówień/sprzedaży · reklamy żyjące 2+ tyg. · trend stabilny/rosnący · ocena ≥4,5.
**Copy bez żargonu (AWE):** „produkt, który ludzie już masowo kupują", „zarabiasz 2–3× tego co płacisz", „tani i łatwy w wysyłce", „nie kupisz w markecie obok". ZAKAZ: winning product/markup/CAC/saturacja.

## Flow K1
0. `<kierunki>` → track=k1.
1. **Zawężenie kategorii** (2–4 pytania klikalne, NIGDY otwarte „jaki produkt"): zainteresowania `<opcje_multi>` (dom/kuchnia, zwierzęta, uroda, fitness, auto, biuro, eko, dziecko) → budżet `<suwak>` → styl `<opcje>` (premium/przystępny/niszowy) → opcja „dobierz za mnie". Zapis `bud_sessions.niche`.
2. **5 propozycji** — model wystawia marker `<propozycje_zadaj>{kategoria,budzet,styl,wyklucz}`; backend woła `bud-products`, streamuje `event: bud_propozycje {status,items}`. Front renderuje karuzelę kart (reuse CSS `.car`). Jedna karta = „najmocniejszy strzał".
3. **Akcje:** [Biorę ten]→„Wybieram: {nazwa}" · [Pokaż inne]→nowa piątka (bufor/page; anti-fatigue: po 2-3 rundach AI przejmuje ster) · [Zmień kategorię]→krok 1 · [Mam jednak własny produkt]→K2 · [Mam własny pomysł]→K3.
4. **Bramka+podgląd+werdykt** (istniejące): `<ocena>` na WYBRANY produkt → `bud-assess` (akcent k1) → `<projekt>` (sklep/karta_produktu/logo/lifestyle) → `<werdykt>` zielony z `idea_source='ai'`.

## Kontrakt techniczny (linchpin — wszystkie 3 warstwy muszą się zgadzać)
- **Marker (model→backend):** `<propozycje_zadaj>{"kategoria","budzet","styl","wyklucz":[]}</propozycje_zadaj>`
- **`ProductCandidate`:** `{id, nazwa, opis_1zd, czemu_sie_sprzedaje, est_cena_detaliczna_pl, est_koszt_zakupu, est_marza_zl, sygnal_popytu, kategoria, ref_url, najmocniejszy}`
- **SSE (backend→front):** `event: bud_propozycje` z `{status:'szukam'}` → `{status:'gotowe', items: ProductCandidate[]}`
- **`bud-products` (wewnętrzna, service-role):** `POST {sessionId, kategoria, budzet, styl, wyklucz[], page} → {items}`; web_search; czyta `budowanie_prompt_products_system`; bufor 8-10 (serwuj 5); log `bud_usage` kind `products`.
- **Stan:** `bud_sessions.product_input = {kandydaci[], pokazane_ids[], iterations, wybrany, wlasny}` (K2 używa `wlasny`). `niche` = kategoria+filtry.
- **Przełączenie kierunku:** front → `body {event:'switch_track', track:'k2'|'k3', message}`; bud-chat nadpisuje `track` + **reset stanu pochodnego** (niche/product_input/assessment/verdict/problem_summary/preview_*/market_report/economics/gtm/landing_url/business_plan = null) — serwerowy `mergeBrief reset:true`.

## K2 / K3 (dopracowanie)
- **K2 „mam produkt":** zbierz `product_input.wlasny` (nazwa/gdzie sprzedaje/cena `<suwak>`/url/zdjęcia/marka) → audyt `<sekcje>` („co przecieka"→„co zmieniamy") → bramka akcent k2 (sprzedaje się dziś? marża vs możliwa) → rebrand+makieta+plan wzrostu. BEZ `bud-products` (chyba że pivot przy słabym → wtedy `<propozycje>`).
- **K3 „mam pomysł":** doprecyzuj pomysł → bramka akcent k3 (popyt/sprzedawalność/sezon) → gdy słaby: `<propozycje>` zawężone do niszy pomysłu (płynny pivot); gdy mocny: marka+GTM. `idea_source` `wlasny`/`wspolny`.

## Checklista wdrożeniowa
- **A. Migracja:** `bud_usage_kind_check += 'products'` ✅ (20260621).
- **B. `bud-products`** (fork bud-assess) + wpis `budowanie_prompt_products_system` w `_shared/bud-prompts.ts` + seed klucza.
- **C. `bud-chat`:** przechwyt `<propozycje_zadaj>`→`runProducts`→zapis `product_input`→SSE `bud_propozycje`; `event:'switch_track'`+reset; markery do HIDDEN_MARKS/`visibleText()`.
- **D. Prompty (settings):** `budowanie_sparing_prompt` (flow K1 + rubryka + marker), `budowanie_etap_kierunki` (karty wyjścia K1→K2/K3), `budowanie_etap_gate` (K1 `<ocena>` na wybrany produkt).
- **E. Front `/sklep/`:** parser+renderer `bud_propozycje` (karuzela + 5 akcji `data-*`), karty wyjścia (`switch_track`), „pokaż inne/wybieram/zmień kategorię", markery do HIDDEN.
- **F. (Później)** adapter `aliexpress` w bud-products.

## Otwarte decyzje (przyjęte domyślne — skoryguj jak usiądziesz)
1. API: start AI-research, AliExpress jako enrichment (załóż konto afiliacyjne). 2. Karty bez generowanych zdjęć w MVP. 3. Nowy marker `<propozycje>` (nie reuse `<karuzela>`). 4. Anti-fatigue 2-3 rundy. 5. K3 słaby→pokazuj propozycje. 6. Bufor 8-10 kandydatów.
