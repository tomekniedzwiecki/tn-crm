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
2. **Kampania** (ten plik): gate'y → kampania → 1 grupa → kreacje+reklamy z konceptów → PAUSED → raport.

---

## ZASADY BEZWZGLĘDNE

1. **Wszystko tworzysz PAUSED.** Publikacja = wyłącznie Tomek ręcznie po review.
2. **Nie dotykaj metody płatności.** Bez karty `ads_create_ad` pada (`No Payment Method`, subcode
   `1359188`) — kreacje się utworzą, reklamy nie. Zgłoś, nie naprawiaj.
3. **Potwierdź konto przed pierwszym zapisem** (zła kampania = budżet klienta X na koncie Y).
4. **Beneficjent/Płatnik (DSA)** wymagane na każdej grupie w EU — beneficjent = marka klienta, płatnik = podmiot finansujący.
5. **Nie blokuj się na „idealnym".** Jeśli brakuje CAPI/wideo/custom eventów — zbuduj to, co się da,
   i wypisz prerekwizyty (sekcja 9). Lepszy działający szkielet + lista braków niż nic.

---

## TL;DR — NOWE DOMYŚLNE (v2 vs stare)

| Parametr | Stare (v1/cowork) | **NOWE (v2)** | Dlaczego |
|---|---|---|---|
| Liczba grup | 2 demograficzne | **1 szeroka** | budżet/ad set < próg nauki → wieczna „Learning Limited"; konsolidacja = gęstszy sygnał |
| Event optymalizacji | Purchase od startu | **drabina: ViewContent → AddToCart → Purchase → Delivered** | nowy pixel ma ~0 zakupów/tydz; Purchase nigdy nie wyjdzie z nauki |
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
   Strony w BM klienta są niewidoczne przez MCP — poproś Tomka o `page_id` LUB przypięcie strony do konta.
   Strona zwykle nazywa się jak marka (wyjątki się zdarzają — Trenbox=„Sfera AI").
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
targeting: {"geo_locations":{"countries":["PL"]},"age_min":18,"age_max":65}
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
| 0 historii / świeży, niski budżet | **`CONTENT_VIEW`** (ViewContent) | start — odpala 20-100× częściej niż Purchase, karmi algorytm |
| Jest ruch, trochę koszyków | **`ADD_TO_CART`** | gdy ATC ~15-30/tydz; bliżej intencji, wciąż gęsty |
| ≥ ~10-15 (idealnie 50) zakupów/tydz + budżet ≥ CPA | **`PURCHASE`** | dopiero gdy wolumen pozwala wyjść z nauki |
| Dojrzałe + CAPI „Delivered" | **custom „Confirmed/Delivered"** | tnie RTO; uczy na płacących, nie no-show |

- **Próg nauki:** ~50 zdarzeń/ad set/7 dni (Meta obniżyła minimum wyjścia do ~10 od poł. 2024, ale
  ~50 to nadal realny cel stabilności). Przy 10 zł/dzień na Purchase = nieosiągalne → dlatego startujesz niżej.
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

## KROK 7 — UTM-y na linku (obowiązkowo)

`link_url` = landing + parametry (makra Meta w `{{...}}`):
```
?utm_source=meta&utm_medium=paid_social&utm_campaign={{campaign.name}}
&utm_content={{ad.name}}&utm_id={{campaign.id}}&utm_term={{adset.name}}
```
`utm_source` STATYCZNE (`{{placement}}`/`{{site_source_name}}` bywają puste, zwł. w ASC).
`utm_medium=paid_social` mapuje się na kanał „Paid Social" w GA4. Nazwy lowercase-z-myślnikami.

## KROK 8 — Reklamy (`ads_create_ad`) + audiencje retargetingu

- `ads_create_ad`: `ad_set_id`, `ad_name`, `creative: {"creative_id":"<id>"}`. Wszystko PAUSED.
- **Retargeting od dnia 1 — tylko PRE-TWORZENIE pul, NIE płatny ad set:** `ads_create_custom_audience`
  (WEBSITE) dla: All visitors 180d, ViewContent 180d, AddToCart 180d, InitiateCheckout 180d
  (+ ENGAGEMENT: zaangażowani na FB/IG — napełniają się bez ruchu na stronie). Pule są puste na
  starcie i napełniają się z prospectingu. Płatny retargeting włącz dopiero przy ~300-1000+ userach.

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
`CONTENT_VIEW`; (3) doań UTM-y do linków; (4) **najpierw naprawić tracking** — pixel nic nie zbiera,
więc nawet po dodaniu karty kampania nie ma sygnału. Bez kroku (4) reszta jest kosmetyką.
