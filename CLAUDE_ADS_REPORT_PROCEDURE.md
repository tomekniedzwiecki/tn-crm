# Procedura tygodniowego raportu + optymalizacji Meta Ads przez MCP — v1

> **Filozofia w jednym zdaniu:** dobra agencja nie „robi raportu" — robi cotygodniową optymalizację,
> a raport to jej zapis przetłumaczony na język klienta. **Jeden proces, dwa outputy:**
> (1) wewnętrzna diagnoza + wykonane akcje, (2) raport dla klienta z narracją.
>
> Komenda: „zrób raport dla workflow X" / automat: cotygodniowa cloud routine (Etap 4, krok Raport).
> v1 (2026-06-10) — zaprojektowana po recon: 60 raportów Manus, tylko 4 otwarte przez klientów;
> gołe liczby bez interpretacji i bez ani jednej akcji optymalizacyjnej.

## ZASADY BEZWZGLĘDNE

1. **Autonomia z limitem** (decyzja Tomka 2026-06-10): pauzy przegranych reklam, rotacje kreacji
   ORAZ zmiany budżetu do **max +20%/tydzień, pułap 60 zł/dzień** — wykonuj sam wg reguł z KROKU 5
   i loguj w `actions[]`. Ponad limit / nieodwracalne / publikacja kampanii → pytanie do Tomka.
2. **INSERT do `workflow_ad_reports` = klient widzi raport NATYCHMIAST** — `loadRaportClient()`
   w client-projekt.html NIE filtruje po `sent_to_client`. Zapisuj wyłącznie GOTOWY raport,
   nigdy szkic. Draft do kalibracji = pokaż w czacie, nie w bazie.
3. **MCP-first, Manus fallback:** `workflow_ads.meta_mcp_enabled=true` → ta procedura;
   `false` (np. Vacuro) → istniejący flow `manus-fetch-ads` (nie ruszaj go).
4. **Okna 7-dniowe.** Dni 1-2 po zmianie = szum. Reguła 72h: po każdej edycji zero kolejnych
   zmian przez min. 72h (reset learning phase boli podwójnie przy małym budżecie).
5. **Pixel kłamie przy COD** — purchases z pixela to dolna granica. Zanim napiszesz „0 sprzedaży",
   sprawdź realne zamówienia (Tomek/klient/TakeDrop). Raport rozróżnia „0 zakupów zmierzonych"
   od „0 zakupów".
6. **Słabe wyniki komunikuj wprost + plan naprawczy w tym samym akapicie.** Nigdy nie chowaj
   w tabeli. Learningi z testów to deliverable („hipoteza A odrzucona, B wygrywa 2× CTR").

## KROK 1 — Kontekst (Supabase `yxmavwkwnfuphjqbelws`)

- `workflow_ads`: `meta_ad_account_id`, `pixel_id`, `ad_account_data.mcp_campaign` (ID-ki),
  `report_data` (poprzedni raport → porównanie t/t), `last_auto_report_at` → okres bieżący
  (od dnia po ostatnim raporcie do wczoraj; pierwszy raport = 7 dni wstecz).
- `workflow_branding` (`type='brand_info'`): marka. `workflow_takedrop.landing_url`: domena sklepu.
- **Target CPA**: `workflow_ads.target_cpa` jeśli jest; fallback = cena produktu × 0,3;
  brak ceny → ustal z Tomkiem przy pierwszym raporcie i zapisz. Bez targetu kill-rule nie działa.

## KROK 2 — Dane przez MCP (okres: od ostatniego raportu, max 28 dni dla pixel stats)

| Narzędzie | Co daje | Uwagi |
|---|---|---|
| `ads_get_ad_entities` level=ad | spend/impressions/reach/frequency/clicks/ctr/cpc/cpm per reklama + `effective_status` | `date_preset` lub `time_range`; sort `spend_descending`; wartości przychodzą sformatowane PL („250,06 zł") — parsuj |
| `ads_get_ad_entities` level=adset | `optimization_goal`, `daily_budget`, spend | weryfikuj czy event optymalizacji = zamierzony (SPRAYCRAFT: cohort pokazał `messaging_down_funnel_purchase` zamiast web purchase!) |
| `ads_get_datasets` + `ads_get_dataset_stats` | zdrowie pixela: eventy/7d per typ + `last_fired_time` | **KLUCZOWE** — patrz KROK 3 pkt 0. Pobieraj PEŁNĄ ścieżkę (niżej) |
| `ads_get_dataset_quality` | EMQ per event (cel ≥7; TakeDrop typowo ~6.1) | do `pixel_health.emq` |
| `ads_insights_performance_trend` (AD) | trend CTR/CPC/CPR t/t per reklama | dobry do „co się poprawiło" |
| `ads_insights_anomaly_signal` | auction overlap, creative fatigue, narrow audience | szybki health-check |
| `ads_insights_industry_benchmark` | metryki vs podobni reklamodawcy | **bywa „No data"** dla małych kont — wtedy benchmark portfelowy: AVG z naszych `workflow_ad_reports` (SQL) + statyczne normy z tabeli niżej |
| `ads_get_opportunity_score` | sugestie Meta | opcjonalnie, traktuj krytycznie |

- **Test pixela na żywym sklepie** (gdy PageView podejrzanie niski): PowerShell
  `Invoke-WebRequest <domena>` + regex `fbq\('init'` i `connect\.facebook\.net` — zero trafień
  = pixel fizycznie niewpięty (SPRAYCRAFT 2026-06-10: 0 wystąpień przy 700 klikach/mies.).
- **PEŁNA ŚCIEŻKA EVENTÓW (sklepy TakeDrop, potwierdzone w Events Manager 2026-06-10):**
  checkout TakeDrop emituje `PageView, ViewContent, ViewCart, AddToCart, RemoveFromCart,
  InitiateCheckout, AddShippingInfo, AddPaymentInfo, Purchase` — przy czym **`Purchase` idzie
  przez CAPI (server-side, „API konwersji")**, więc NIE zakładaj braku CAPI; sprawdzaj
  `event_source` w `ads_get_dataset_stats` (WEB vs SERVER). `ViewContent` strzela z kart
  produktów TakeDrop, nie z landing-homepage — landing musi mieć własny snippet (PageView+VC).

## KROK 3 — Diagnoza lejka: SEKWENCYJNIE, pierwsza metryka poza normą = wąskie gardło tygodnia

**0. Tracking (nadrzędne):** PageView/tydz < 20% × link_clicks/tydz → **TRACKING ZEPSUTY** —
kampania ślepa, wszystkie dalsze metryki niewiarygodne. Fix pixela = akcja #1, reszta diagnozy
ma status „wstępna". (Zdrowo: LPV ≥ 60% link_clicks.)

| Kolejność | Metryka | Norma (PL, portfel TN) | Poza normą → wąskie gardło |
|---|---|---|---|
| 1 | CPM | 15–40 zł | aukcja/audience (rzadkie przy broad) |
| 2 | CTR (link) | ≥1,5% dobre; <0,8% problem | **KREACJA** — rotacja konceptu |
| 3 | CPC | <1,00 zł OK | pochodna 1+2 |
| 4 | link_clicks→LPV | ≥60% | **TRACKING albo LANDING** (wolny load / redirect) |
| 5 | LPV→IC | ≥5–10% | **LANDING** (oferta, zaufanie COD, mismatch obietnicy) |
| 6 | IC→Purchase | ≥25–40% | **CHECKOUT** — rozbij na mikro-kroki (niżej) |
| 7 | frequency | <2,5–3,0 | powyżej → fatigue → nowy koncept |

**6a. Mikro-lejek checkoutu (TakeDrop):** `IC → AddShippingInfo → AddPaymentInfo → Purchase`.
Pierwszy krok z największym dropem = konkretna naprawa:
- IC→AddShippingInfo **<30%** → formularz dostawy odstrasza (długość, wymagane pola, brak
  wyboru Paczkomatu) — realny przykład 2026-06-10: 35 IC → 8 ASI = 23% (drop na formularzu)
- AddShippingInfo→AddPaymentInfo niski → koszty dostawy zaskakują
- AddPaymentInfo→Purchase **<50%** → metody płatności / ostatnie wahanie (brak COD? brak BLIK?)

Złota reguła: CTR >1,5% a konwersji brak = prawie nigdy problem kreacji — szukaj w landingu/trackingu.

## KROK 4 — Porównanie t/t + faza

- Delta vs poprzedni raport (`report_data`): spend, CTR, CPC, IC, purchases. Trend > wartość absolutna.
- **Faza** (do raportu i zarządzania oczekiwaniami): `learning` (dni 1–30: nauka + testy),
  `first_sales` (30–60: skalowanie zwycięzców), `scaling` (60–90+). `roadmap_day` = dni od startu kampanii.

## KROK 5 — Decyzje i wykonanie (w ramach autonomii; wszystko do `actions[]`)

| Sytuacja | Reguła | Akcja MCP |
|---|---|---|
| Przegrana reklama | spend ≥ 2× target CPA **AND** ≥7 dni **AND** CPA > 1,75× target (przy braku purchases: koszt/IC > 1,75× targetu IC) | `ads_update_entity` → PAUSED |
| Zwycięzca stabilny ≥3 dni | budżet +20%, max 60 zł/dzień | `ads_update_entity` budżet kampanii |
| Fatigue (KROK 3 pkt 7) | nowy koncept z `ad_copies.versions` (pipeline contentu) | `ads_create_creative`+`ads_create_ad`, stary PAUSED |
| CTR <0,8% po wydaniu 2× target CPA | wyjątek od reguły 72h — kill natychmiast | jw. |
| Tracking zepsuty / budżet >limit / landing fix | **eskalacja do Tomka** (TakeDrop handoff wg procedury) | brak — prerekwizyt w raporcie |

Po killu DIAGNOZA zanim wystawisz podobną kreację (zły hook? zły event? audience?). NIE duplikuj
ad setów przy małym budżecie. Max 1–2 nowe kreacje/tydzień.

## KROK 6 — Raport JSON (kompatybilny wstecz + nowe pola)

Stary kształt zostaje (panel go renderuje): `spend, impressions, reach, frequency, clicks,
link_clicks, cpc, cpm, ctr, landing_page_views, add_to_cart, initiate_checkout, purchases,
revenue, roas, conversion_rate, cost_per_purchase, funnel{}, campaigns[], currency, period{}`.
Nowe pola (`source:'mcp'`):

```json
{
  "source": "mcp", "fetched_at": "...",
  "summary": "3-5 zdań PL: co się działo → co zrobiliśmy → co dalej (klient czyta TYLKO to)",
  "phase": "learning|first_sales|scaling", "roadmap_day": 12,
  "bottleneck": "tracking|creative|landing|checkout|none",
  "pixel_health": {"status": "dead|weak|ok", "pageview_7d": 3, "last_fired": "...", "emq": 6.1, "capi_purchase": true, "note": "..."},
  "checkout_funnel": {"initiate_checkout": 35, "add_shipping_info": 8, "add_payment_info": 8, "purchases": 3},
  "benchmark": {"ctr_portfolio": 2.1, "ctr_account": 5.3, "source": "portfolio|meta"},
  "wow": {"spend_pct": 12, "ctr_pct": -5, "ic_abs": 4},
  "actions": [{"date":"...", "what":"pauza SPRAYCRAFT #1", "why":"kill rule: ...", "executed": true}],
  "learnings": ["hipoteza → wynik"],
  "next_steps": ["1-3 punkty na przyszły tydzień"]
}
```

Zasady treści `summary` (i maila): liczby ZAWSZE z oceną („CTR 5,3% — ponad 3× typowa norma
sklepów"), lejek obrazowo (wyświetlenia = przechodnie, kliknięcia = wchodzą do sklepu, IC =
podchodzą do kasy), zero żargonu bez tłumaczenia, max 5–7 metryk, pozycja na roadmapie 30/60/90
w każdym raporcie. ZAKAZ: data dump, vanity metrics bez kontekstu, obiecywanie ROAS, ukrywanie
słabych tygodni.

## KROK 7 — Zapis + wysyłka

1. INSERT `workflow_ad_reports` (report_data + denormalizacja spend/revenue/roas/purchases,
   period_from/to) — dopiero GOTOWY raport (zasada #2).
2. UPDATE `workflow_ads`: `report_data` (cache), `report_generated_at`, `last_auto_report_at`.
3. Mail: istniejący `send-email` type=`ad_report` (template w `email_templates` — po upgradzie
   o sekcje summary/next_steps + deep-link `client-projekt.html?token=...#raport`).
4. **NIE** ustawiaj `sent_to_client`/`report_sent` ręcznie — to robi flow wysyłki.

## Prerekwizyty / eskalacje (sekcja w każdym raporcie wewnętrznym)

Tracking (pixel niewpięty na sklep = handoff TakeDrop: HTML/snippet + email konta z
`workflow_takedrop.account_email`), CAPI, karta płatnicza, budżet ponad pułap, wideo 9:16,
target_cpa nieustalony, realne zamówienia COD do potwierdzenia.

## TODO wdrożenia (stan 2026-06-10)

- [x] Procedura v1 + pilotaż SPRAYCRAFT (draft w czacie)
- [ ] Kolumna `workflow_ads.target_cpa` (migracja PRZED kodem!)
- [ ] Panel klienta: sekcja summary/oceny w tab Raporty (TYLKO dashboard-screen)
- [ ] Upgrade template `ad_report` (summary + next_steps + deep-link)
- [ ] Cloud routine „Weekly ads reports": iteruje po `campaign_launched=true`, MCP-first,
      `meta_mcp_enabled=false` → trigger `manus-fetch-ads`

## Worked example — SPRAYCRAFT (workflow d6dc42b3, 2026-06-10, pilotaż)

Konto `2389574138207844`, 30 dni: spend 276,71 zł, 2 reklamy ACTIVE, CTR 5,3–5,8% (świetne),
CPC 0,34 zł, frequency 1,49. ALE: pixel `1683750612759721` = **3 PageView + 3 IC/tydzień przy
~140 link_clicks/tydz.** i `last_fired` 3 dni wstecz; test `Invoke-WebRequest spraycraft.pl` =
**zero `fbq`** — pixel fizycznie niewpięty na sklep. Bottleneck: **tracking**. Dodatkowo cohort
optymalizacji pokazał `messaging_down_funnel_purchase` (zły event — kampania z cowork).
Wniosek: kreacje wygrywają, ruch tani, sklep ślepy — fix pixela przed jakąkolwiek oceną sprzedaży.
Stary raport Manus z tych samych danych: „spend 280, purchases 0, ROAS 0" — zero wniosków.
