# Procedura zakładania kampanii Meta Ads przez MCP — v2.1

> **Uniwersalna, powtarzalna, zoptymalizowana pod WYNIKI.** Buduje kampanię Meta bezpośrednio
> przez Meta MCP dla sklepów klientów (TakeDrop, COD, rynek PL, zimny ruch, niski budżet).
> v2 (2026-06-10) zastępuje prosty „spec cowork" zestawem domyślnych opartych na researchu
> najlepszych praktyk 2025-2026 (6 wymiarów, źródła w `tn-crm-mcp-campaign-creation.md` / output workflow).
> v2.1: spięta z procedurą contentu v2 (`CLAUDE_ADS_COPY_PROCEDURE.md`).
>
> Filozofia v2 w jednym zdaniu: **przy niskim budżecie i nowym pixelu o WYNIKACH decyduje
> (1) poprawny TRACKING, (2) KONSOLIDACJA budżetu, (3) właściwy EVENT optymalizacji — nie targetowanie.**

## Pełny flow (content → kampania)

1. **Content** (→ `CLAUDE_ADS_COPY_PROCEDURE.md` v2): pipeline `generate-campaign-batch` =
   research Manus → 5 spójnych KONCEPTÓW (copy z risk-reversal COD + image_prompt + video_hook)
   → grafiki Gemini z referencją produktu. Wynik w `workflow_ads.ad_copies` + `ad_creatives`.
2. **Kampania** (ten plik): gate'y → kampania → 1 grupa → kreacje+reklamy z konceptów →
   grupa+reklamy ACTIVE, kampania PAUSED → raport.

---

## ZASADY BEZWZGLĘDNE

1. **Kampania PAUSED, grupa + reklamy ACTIVE** (decyzja Tomka 2026-06-10). Dzieci ze statusem ACTIVE
   nie emitują, dopóki rodzic-kampania jest PAUSED — a publikacja to wtedy JEDEN przełącznik (kampania)
   zamiast siedmiu. Tworzenie idzie PAUSED (API tak tworzy), po zbudowaniu włącz `ads_activate_entity`
   na ad secie i każdej reklamie. Publikacja kampanii = wyłącznie Tomek ręcznie po review.
2. **Nie dotykaj metody płatności.** Bez karty `ads_create_ad` MOŻE paść (`No Payment Method`, subcode
   `1359188` — Trenbox) — ale nie zawsze (Doodlo 2026-06-10: 5 reklam PAUSED utworzonych mimo
   `has_payment_method=false`; weryfikacja karty przesunięta na aktywację). Próbuj utworzyć, zgłoś kartę
   jako prerekwizyt publikacji, nie naprawiaj.
3. **Potwierdź konto przed pierwszym zapisem** (zła kampania = budżet klienta X na koncie Y).
4. **Beneficjent/Płatnik (DSA)** wymagane na każdej grupie w EU — beneficjent = marka klienta, płatnik = podmiot finansujący.
5. **Nie blokuj się na „idealnym".** Jeśli brakuje CAPI/wideo/custom eventów — zbuduj to, co się da,
   i wypisz prerekwizyty (sekcja 9). Lepszy działający szkielet + lista braków niż nic.
6. **Klient ma rolki? → DWIE kampanie** (decyzja Tomka 2026-06-10, Kafina). Jeśli workflow ma video
   od klienta (`workflow_video.video_links` / MP4 w `attachments/landing/<slug>/reels/` po dedupie
   z `generate-reels.py`) — twórz OD RAZU dwie kampanie: `<marka>-static-ic-<RRRR-MM>` (grafiki
   z `ad_creatives`) + `<marka>-reels-ic-<RRRR-MM>` (reklamy wideo z rolek, KROK 6b). Każda z własną
   1 szeroką grupą i tym samym eventem optymalizacji. Budżet dzienny per kampania = ten z dyspozycji
   Tomka (uwaga: 2 kampanie = 2× spend gdy obie włączone — zaznacz w raporcie). Brak video → tylko statyczna.

---

## TL;DR — NOWE DOMYŚLNE (v2 vs stare)

| Parametr | Stare (v1/cowork) | **NOWE (v2)** | Dlaczego |
|---|---|---|---|
| Liczba grup | 2 demograficzne | **1 szeroka** | budżet/ad set < próg nauki → wieczna „Learning Limited"; konsolidacja = gęstszy sygnał |
| Event optymalizacji | Purchase od startu | **drabina: InitiatedCheckout → Purchase → Delivered** | decyzja Tomka 2026-06-10: NIE ViewContent/AddToCart — zbierają tani ruch klikaczy bez intencji; IC = najniższy event z realną intencją zakupu. Purchase od startu nadal NIE (nowy pixel ~0 zakupów/tydz) |
| Targetowanie | wiek/płeć twarde (adv_audience=0) | **broad + Advantage+ Audience ON** | broad to default 2025-2026; „kreacja jest targetowaniem" |
| Budżet | 10 zł sztywno | **realny próg 40-60 zł/dzień; 10 zł = „tani sygnał, nie licz na zakupy"** | (CPA×50)/7; 10 zł nie kupi 10 zakupów/tydz |
| Liczba reklam | 5 ×2 grupy = 10 | **3-5 RÓŻNYCH konceptów w 1 grupie** | różnorodność > wolumen (Andromeda); 10 reklam na 10 zł = każda głodzona |
| Format | statyk 1:1 | **statyk 4:5 + dołóż wideo 9:16 Reels ASAP** | wideo: +27% CTR/−26% CPC; 9:16+4:5 = ~90% delivery |
| CTA | „Sprawdź szczegóły"→LEARN_MORE | **„Kup teraz"→SHOP_NOW** + copy „Płatność przy odbiorze" | COD: pay-on-receipt to główny argument zaufania PL |
| Link | goły URL | **+UTM-y (`utm_source=meta`...)** | atrybucja w GA/CRM; znany luk pomiaru |
| Tracking | nieweryfikowany | **gate: pixel MUSI odpalać event + CAPI** | Trenbox: 0 zdarzeń/7 dni = ślepa kampania |
| Typ kampanii | CBO | **CBO (NIE Advantage+ Shopping)** | ASC wygrywa dopiero ~50 zakupów/tydz — u nas praktycznie nigdy |

---

## KROK 1 — Dane workflow (Supabase MCP, `yxmavwkwnfuphjqbelws`)

Jak w v1: pobierz `brand_info`, landing (`takedrop.landing_url`→fallback `sales_page_url`),
`ad_creatives[]`, `ad_copies.versions[]`, `campaign_spec`, `workflow_ads`
(`meta_ad_account_id`, `pixel_id`, `page_assigned`). Marka = `brand_info.name`.

## KROK 2 — Gate'y PRE-FLIGHT (sprawdź ZANIM cokolwiek tworzysz)

Kampania konwersyjna bez tego = spalony budżet. Każdy ❌ to STOP / prerekwizyt dla Tomka:

1. **Konto reklamowe** — `ads_get_ad_accounts`; `meta_ad_account_id` lub mapuj po marce/firmie,
   POTWIERDŹ z Tomkiem, zapisz. `is_ads_mcp_enabled=true`, `account_status=ACTIVE`.
   Zapamiętaj `has_payment_method`, `min_daily_budget_cents`.
2. **Strona FB** — `ads_get_ad_account_pages`; jeśli `[]` → strona niepodpięta (reklam nie zrobisz).
   Strony w BM klienta są niewidoczne przez MCP (`ads_get_pages_for_business` na BM klienta = Authorization Error)
   — poproś Tomka o `page_id` LUB przypięcie strony do konta. **Prosząc o page_id ZAWSZE podaj bezpośredni link:**
   `https://business.facebook.com/latest/settings/pages?business_id=737839566050751` (BM Tomka — widzi tam
   też strony klientów udostępnione partnersko; kolumna „Identyfikator" = page_id). Strona zwykle nazywa się
   jak marka (wyjątki się zdarzają — Trenbox=„Sfera AI").
   UWAGA: `page_id` z BM klienta DZIAŁA w `ads_create_creative`/`ads_create_ad` (zweryfikowane: Doodlo 2026-06-10).
   **Page warm-up:** strona NIE może być pusta — 3-5 postów organicznych + zdjęcia + About/kontakt.
3. **Pixel + zdarzenia** — `ads_get_datasets` → dataset marki. **`ads_get_dataset_stats` — czy
   w ogóle odpala JAKIKOLWIEK event?** 0 zdarzeń = tracking zepsuty, NIE delivery. Sprawdź też
   `ads_get_dataset_quality` (EMQ — cel ≥7, idealnie 8+). Pixel z 0 eventów = kampania ślepa → STOP, napraw tracking.
4. **CAPI (server-side)** — w 2025-2026 praktycznie obowiązkowy (pixel-only gubi 18-40% konwersji;
   PL: zgody TCF blokują pixel w przeglądarce). Dla **COD krytyczne**: Purchase musi odpalać na
   **złożeniu/potwierdzeniu zamówienia**, NIE na płatności (jej nie ma). Jeśli TakeDrop tego nie
   wysyła server-side → zanotuj jako prerekwizyt, kampania jedzie na samym pixelu (gorzej).
5. **Płatność** — `has_payment_method`; false = buduj paused do kreacji, reklamy czekają na kartę.
6. **Landing/zaufanie PL** (wpływa na zatwierdzenie reklam i CPA) — widoczne: InPost Paczkomat +
   czas dostawy, prawo 14 dni zwrotu, NIP/kontakt/realne zdjęcia, „za pobraniem" bez ukrytych opłat,
   ZERO fałszywych liczników. Brak = ryzyko bana + wysoki bounce.

## KROK 3 — Kampania (`ads_create_campaign`)

```
objective: OUTCOME_SALES, buying_type: AUCTION,
campaign_daily_budget: <budżet_zł * 100>   (realnie celuj 40-60 zł = 4000-6000),
campaign_bid_strategy: LOWEST_COST_WITHOUT_CAP,  special_ad_categories: "[]"
```
**NIE** Advantage+ Shopping (ASC) — wygrywa dopiero ~50 zakupów/tydz/konto; u tych klientów to
nieosiągalne, zostań przy manualnym CBO. ASC rozważ tylko dla breakout sklepu z realnym wolumenem.

## KROK 4 — Grupa odbiorców: JEDNA, szeroka (`ads_create_ad_set`)

```
billing_event: IMPRESSIONS, optimization_goal: OFFSITE_CONVERSIONS,
conversion_locations: WEBSITE, destination_type: WEBSITE,
promoted_object: {"pixel_id":"<PIXEL>","custom_event_type":"<EVENT Z DRABINY — KROK 5>"},
targeting: {"geo_locations":{"countries":["PL"],"location_types":["home","recent"]},"age_min":18,"age_max":65}
            // location_types ZAWSZE jawnie ["home","recent"]! Bez tego API zapisuje usunięty typ
            //   „osoby mieszkające w lokalizacji" (home solo) i Ads Manager blokuje publikację błędem
            //   #1870194 („opcja targetowania na podstawie lokalizacji została usunięta") — Doodlo 2026-06-10.
            // Fix po fakcie: ads_update_entity z pełnym targeting + location_types ["home","recent"]
            //   MOŻE NIE WYSTARCZYĆ — u Doodlo UI dalej pokazywał stary typ mimo success z API.
            //   Ostatecznie poproś Tomka: Ads Manager → grupa odbiorców → Lokalizacje → przełącz na
            //   PIERWSZĄ opcję („Osoby mieszkające w tej lokalizacji lub niedawno ją odwiedzające").
            // płeć: pomiń (wszyscy) chyba że produkt jednoznacznie damski/męski → "genders":[2]/[1]
            // Advantage+ Audience ON: NIE ustawiaj advantage_audience=0 (broad to default)
dsa_beneficiary: "<MARKA>", dsa_payor: "<podmiot finansujący>"
attribution: domyślne 7-dniowe kliknięcie + 1-dniowe wyświetlenie (2026; 7-day-view zniesiony I.2026)
```
- **1 grupa, nie 2.** Wydarzenia nauki liczą się per AD SET — dzielenie budżetu = wieczna nauka.
- Zainteresowania: `ads_targeting_search` niedostępne w MCP → broad i tak jest poprawnym defaultem (nie kompromisem).

## KROK 5 — ⭐ DRABINA EVENTU OPTYMALIZACJI (sedno v2)

Dobierz `custom_event_type` wg tego, co pixel REALNIE odpala (z `ads_get_dataset_stats`):

| Stan pixela | `custom_event_type` | Kiedy |
|---|---|---|
| 0 historii / świeży | **`INITIATED_CHECKOUT`** | **START (decyzja Tomka 2026-06-10).** NIE ViewContent ani AddToCart — optymalizacja na nie zbiera tanich klikaczy bez intencji (śmieciowy ruch). IC = przejście do kasy, najniższy event o realnej intencji zakupowej |
| Pixel z HISTORIĄ zakupów (sklep już sprzedaje) | **`PURCHASE`** od startu | audyt 2026-06-10: H2VITAL na Purchase od dnia 1 = ROAS 5+; kryterium to ZDROWIE pixela, nie wiek |
| ≥5 zakupów/tydz przez 2 kolejne tygodnie LUB ≥20 łącznie | **`PURCHASE`** (graduacja z IC) | stary próg 10-15/tydz nieosiągalny w portfelu (p90 = 1 zakup/raport); CAPI Purchase płynie od dnia 1 niezależnie od eventu optymalizacji, więc dataset rośnie zawsze |
| Dojrzałe + CAPI „Delivered" | **custom „Confirmed/Delivered"** | tnie RTO; uczy na płacących, nie no-show |

- ⚠️ **Enum:** `INITIATED_CHECKOUT` (z „D"), NIE „INITIATE_CHECKOUT" — zły enum zwraca mylący
  `INTERNAL` error bez wskazania przyczyny (Doodlo 2026-06-10).
- ⚠️ **Eventu NIE zmienisz po utworzeniu ad setu** (error 100/3260011 „Can't Make Edits to Published
  Ad Set" — dotyczy też PAUSED). Graduacja/zmiana = NOWY ad set (kreacje reużyj przez `creative_id`,
  reklamy utwórz na nowo), stary przemianuj na `*-OLD-DO-USUNIECIA` (MCP nie ma delete; Tomek kasuje w Ads Manager).
- **Próg nauki:** ~50 zdarzeń/ad set/7 dni (Meta obniżyła minimum wyjścia do ~10 od poł. 2024, ale
  ~50 to nadal realny cel stabilności). Konsekwencja startu na IC: przy 10 zł/dzień to ~1-6 IC/tydz →
  wieczna „Learning Limited". To świadomy trade-off (jakość ruchu > szybkość nauki) — tym bardziej
  **budżet 40-60 zł/dzień to minimum**, żeby IC w ogóle karmił algorytm.
- **Od dnia 1, niezależnie od optymalizacji:** wysyłaj custom event „PurchaseConfirmed/Delivered"
  przez CAPI przy potwierdzeniu zamówienia — budujesz dataset pod późniejsze przełączenie (zero downside).
- **Graduacja resetuje naukę** — przy zmianie eventu zaplanuj nowy okres nauki.

## KROK 6 — Kreacje (`ads_create_creative`) — 3-5 RÓŻNYCH konceptów

Dla każdej kreacji (max 5; różne KĄTY, nie warianty tego samego):
```
page_id: <PAGE>, image_url: <creative.url>, link_url: <LANDING + UTM (KROK 7)>,
message: <primary_text>, headline: <headline>, description: <description>,
call_to_action_type: SHOP_NOW,  name: "<marka> — <angle> #<i>"
```
- **CTA:** weź `cta` z konceptu i zmapuj: „Kup teraz"→**SHOP_NOW** (default) · „Zamów teraz"→ORDER_NOW
  · „Zobacz opinie"→SEE_MORE · „Dowiedz się więcej"→LEARN_MORE. Content v2 generuje już CTA z tej listy
  + risk-reversal COD w primary_text (nie dopisuj nic od siebie).
- **Format:** statyk 4:5 (1080×1350) jako master Feed. **Dołóż wideo 9:16 (1080×1920) Reels ASAP**
  (nawet prosty slideshow z grafik) — to pojedynczo największy dźwig CTR na zimno. Unikaj 1:1 jako głównego.
- **UGC-look > studio:** produkt w realnym kontekście (ręka/dom), nie sterylne białe tło.
- **Advantage+ Creative:** od II.2026 nowe kampanie Sales mają WSZYSTKIE ulepszenia auto-ON.
  Włącz bezpieczne (jasność/kontrast, muzyka, dopasowanie proporcji), **WYŁĄCZ generatywne**
  (generowanie/rozszerzanie obrazu, podmiana tła) — psują wierność produktu = zwroty COD. Audytuj draft przed publikacją.
- **image_url = publiczny URL Supabase** (Meta auto-fetch, zero ręcznego uploadu — przewaga nad cowork).

## KROK 6b — Reklamy WIDEO z rolek klienta (druga kampania, zasada #6)

⚠️ **MCP NIE MA uploadu video** (`ads_create_creative` z video wymaga `video_id` = video już
w bibliotece konta; narzędzia upload brak — stan 2026-06). Flow:

1. `ads_get_ad_videos(ad_account_id)` — jeśli rolki już wgrane, bierz `video_id` i idź do pkt 3.
2. Jeśli `[]` → **ręczny upload przez Tomka** (jedyny ręczny krok): podaj mu URL-e MP4
   (Supabase `attachments/landing/<slug>/reels/reel-{N}.mp4` — po dedupie, NIE 12 oryginałów)
   + link do biblioteki: `https://business.facebook.com/asset_library/ad_account_videos/?act=<KONTO>`
   (fallback ręczny: Ads Manager → menu ☰ „Wszystkie narzędzia" → Biblioteka zasobów → Filmy → Wgraj).
   Zbuduj kampanię+grupę OD RAZU (szkielet czeka tylko na reklamy), reklamy dokończ po wgraniu.
3. Po uploadzie: `ads_get_ad_videos` → zmapuj video_id→rolka (po `title` = nazwa pliku),
   `ads_create_creative` z `video_id` + **`image_url` = thumbnail rolki** (`reel-{N}.jpg` z tego samego
   folderu Supabase — wymagany dla video ads) + `message`/`headline` z konceptów + SHOP_NOW + link z UTM.
4. `ads_create_ad` per kreacja + `ads_activate_entity` (grupa+reklamy ACTIVE, kampania PAUSED).

## KROK 7 — UTM-y na linku (obowiązkowo)

`link_url` = landing + parametry (makra Meta w `{{...}}`):
```
?utm_source=meta&utm_medium=paid_social&utm_campaign={{campaign.name}}
&utm_content={{ad.name}}&utm_id={{campaign.id}}&utm_term={{adset.name}}
```
`utm_source` STATYCZNE (`{{placement}}`/`{{site_source_name}}` bywają puste, zwł. w ASC).
`utm_medium=paid_social` mapuje się na kanał „Paid Social" w GA4. Nazwy lowercase-z-myślnikami.

## KROK 8 — Reklamy (`ads_create_ad`) + audiencje retargetingu

- `ads_create_ad`: `ad_set_id`, `ad_name`, `creative: {"creative_id":"<id>"}`. Po utworzeniu włącz
  reklamy i ad set przez `ads_activate_entity` (kampania zostaje PAUSED — patrz zasada #1).
- **Retargeting od dnia 1 — tylko PRE-TWORZENIE pul, NIE płatny ad set:** `ads_create_custom_audience`
  (WEBSITE) dla: All visitors 180d, ViewContent 180d, AddToCart 180d, InitiateCheckout 180d
  (+ ENGAGEMENT: zaangażowani na FB/IG — napełniają się bez ruchu na stronie). Pule są puste na
  starcie i napełniają się z prospectingu. Płatny retargeting włącz dopiero przy ~300-1000+ userach.
  **PUŁAPKA:** gdy pixel żyje w INNYM BM niż konto reklamowe (np. pixel w BM Tomka, konto w BM klienta),
  `ads_create_custom_audience` pada z `INTERNAL` (non-retryable) — Doodlo 2026-06-10. Wtedy pule = prerekwizyt
  (Tomek ręcznie w Ads Manager lub po udostępnieniu pixela do BM konta).

## KROK 9 — Zapis w CRM + raport + PREREKWIZYTY

- `UPDATE workflow_ads SET meta_ad_account_id=..., ad_account_data = ... || '{"mcp_campaign":{...}}'`.
- **NIE** ustawiaj `campaign_launched`/`*_shared_at` — to Tomek po publikacji.
- Raport: ID kampanii/grupy/reklam, link Ads Manager, **lista prerekwizytów** (czego brakuje do
  ideału): CAPI, custom event Confirmed/Delivered, wideo 9:16, metoda płatności, EMQ < 7, elementy zaufania na landingu.

---

## PO STARCIE — playbook (dla Tomka / przy optymalizacji)

**Kryteria zabijania (niski budżet):**
- Dni 1-2 = szum, nie oceniaj. Decyzja nie wcześniej niż dzień 3-5 LUB po wydaniu znaczącej kwoty.
- **Hard kill:** wydane 3× docelowy CPA i 0 zakupów → pauza (problem strukturalny: pixel/landing/oferta).
- Dzień 7-10: CPA ≤ cel przez 3+ dni = zwycięzca (skaluj); 10-30% powyżej = szara strefa (+3 dni);
  50%+ powyżej po dniu 10 = kill. Przy 10 zł/dzień używaj bramek **opartych na WYDATKU** (wielokrotność CPA), nie na kalendarzu.

**Skalowanie:**
- Pionowo: **max +20% budżetu co 72h**, tylko po wyjściu z nauki / 3 dniach stabilnego CPA. Nie edytuj w trakcie nauki.
- NIE duplikuj-by-skalować przy niskim budżecie (fragmentuje sygnał). Duplikuj TYLKO by dodać nowe kreacje (zachowuje historię nauki zwycięzcy).
- **Break-even ROAS z ekonomiki:** ~30% marży → ~3,0× break-even; cienka marża → 5×+. COD: dolicz
  bufor +20-30% na nieodebrane przesyłki (pixel Purchase zawyża o 40-60%).

**Co mierzyć przy 10 zł/dzień:** CTR, CPC, hook-rate, koszt/ViewContent, koszt/ATC — NIE ROAS
(zakupów będzie za mało na sensowny ROAS). To są wskaźniki wyprzedzające jakości kreacji.

---

## MCP vs Cowork + ograniczenia

| | Cowork (przeglądarka) | MCP (API) |
|---|---|---|
| Strona w BM klienta | widzi w UI | niewidoczna jeśli niepodpięta → potrzebny page_id |
| Zainteresowania | wpisuje w UI | brak `ads_targeting_search` → broad (i tak default) |
| Grafiki | Tomek wgrywa | `image_url` Supabase, auto-fetch |
| Edycja encji | — | `ads_update_entity` WYMUSZA PAUSED przy edycji |
| CAPI / custom events / wideo | poza zakresem | poza zakresem MCP — to prerekwizyty TakeDrop/dev |

## Czego v2 NIE załatwia przez MCP (prerekwizyty do zbudowania osobno)

1. **CAPI server-side + custom event „Confirmed/Delivered"** per sklep TakeDrop — kluczowe dla COD,
   wymaga webhooka z potwierdzenia zamówienia → dataset. To największy brakujący element jakości.
2. **Wideo 9:16 Reels** — pipeline kreacji generuje statyki; content v2 daje już `video_hook`
   (brief pierwszych 3 s per koncept) — brakuje generacji/montażu wideo lub nagrania UGC przez klienta.
3. **Weryfikacja domeny + konfiguracja eventu w Events Manager** (AEM/iOS) — limit 8 eventów zniesiony VI.2025.

---

## Worked example — Trenbox (workflow cc5f4a48, 2026-06-10)

Zbudowane v1 (PAUSED): kampania `120254314521770595` (CBO 10 zł, 2 grupy, Purchase) + 5 kreacji
(strona Sfera AI `1147835615071379`, pixel `1332510272137238`, landing trenbox.pl). 10 reklam padło
na brak karty (subcode 1359188). **Pixel ma 0 zdarzeń/7 dni → kampania jest ślepa.**

**Co zmienić pod v2:** (1) skonsolidować do 1 szerokiej grupy; (2) zmienić event z Purchase na
`INITIATED_CHECKOUT` (= nowy ad set — eventu nie da się edytować); (3) dodać UTM-y do linków;
(4) **najpierw naprawić tracking** — pixel nic nie zbiera, więc nawet po dodaniu karty kampania
nie ma sygnału. Bez kroku (4) reszta jest kosmetyką.

## Worked example #2 — Doodlo (workflow 46cb4f0b, 2026-06-10, pierwsza kampania wg v2.1)

Konto „Doodlo PL" `2021242195486085` (BM klienta DoodloPl), strona `1171912009334193` (page_id podany
przez Tomka z linku BM), pixel `1327151336097514` (0 zdarzeń — świeży). Kampania `120250450175050635`
(CBO 10 zł) + ad set `120250450932190635` (broad PL, INITIATED_CHECKOUT) + 5 kreacji + 5 reklam, wszystko
PAUSED. Wnioski wpisane wyżej: reklamy przeszły bez karty; WCA padły (pixel w BM Tomka vs konto w BM
klienta); event po utworzeniu nieedytowalny → pierwszy ad set (CONTENT_VIEW) przemianowany do usunięcia.
