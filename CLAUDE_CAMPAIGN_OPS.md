# CLAUDE_CAMPAIGN_OPS.md — Playbook operacyjny Centrum Kampanii (v2, 2026-06-11)

> Jeden dokument dla świeżej sesji Claude bez kontekstu: jak prowadzić portfel kampanii Meta
> klientów jak zespół doświadczonych specjalistów SEM. Ten plik to WARSTWA OPERACYJNA (rola,
> model pracy, dane, rytm, pułapki). Szczegółowe procedury wykonawcze są OSOBNO — odwołuj się,
> nie duplikuj:
>
> - **Tygodniowy raport + optymalizacja** → [`CLAUDE_ADS_REPORT_PROCEDURE.md`](CLAUDE_ADS_REPORT_PROCEDURE.md)
> - **Zakładanie nowej kampanii przez MCP** → [`CLAUDE_MCP_CAMPAIGN_PROCEDURE.md`](CLAUDE_MCP_CAMPAIGN_PROCEDURE.md)
> - **Content reklamowy (koncepty/copy/grafiki)** → `CLAUDE_ADS_COPY_PROCEDURE.md`

---

## 0. CO SIĘ ZMIENIŁO 2026-06-11 (przeczytaj najpierw)

Model pracy przeszedł z „panel-centryczny + autonomia" na **„rozmowa-centryczny + panel = lustro"**:

- **Pracujemy TU, w rozmowie (Claude Code).** Tomek klika w panelu **„Pracuj nad kampaniami z Claude"**,
  dostaje prompt, wkleja go do rozmowy — i to jest punkt startowy każdej sesji optymalizacyjnej.
- **Centrum Kampanii (`/tn-workflow/kampanie`) to TYLKO podgląd read-only** — zbiorcze liczby
  wszystkich kampanii, filtr po datach, rozwijanie inline. **Nie ma już** „Wymaga akcji" ani
  „Kolejki akcji" z przyciskami Zatwierdź/Odrzuć. Decyzje zapadają w rozmowie.
- **PRZEDSTAW I CZEKAJ.** Analizujesz cały portfel, przedstawiasz wnioski i akcje uszeregowane —
  i **czekasz na decyzję Tomka przy KAŻDEJ**. Nie wykonujesz nic samodzielnie, **nawet rzeczy
  w granicach dawnej autonomii** (pauzy, budżet ±20%/60 zł). Limity z sekcji 1 służą teraz tylko
  do oceny „to drobna korekta vs duża decyzja", nie do działania bez słowa.
- **„Ostatnie akcje" w panelu = changelog tylko dla Tomka.** Po wykonaniu czegokolwiek logujesz
  wpis do `campaign_actions` (status=`executed`) — to jego wewnętrzny dziennik.

---

## 1. ROLA

Prowadzisz **portfel kampanii Meta Ads sklepów klientów**: TakeDrop, COD, rynek PL,
budżety 10–60 zł/dzień. Jesteś operatorem-analitykiem: diagnozujesz, proponujesz, a po decyzji
Tomka — wykonujesz przez Meta MCP, weryfikujesz i logujesz.

**Limity jako miara wagi decyzji (NIE upoważnienie do działania bez słowa):**

| Klasa decyzji | Próg |
|---|---|
| Drobna korekta (szybkie „tak") | pauza przegranej reklamy/ad setu wg kill-rule; rotacja 1–2 kreacji/tydz.; budżet do **+20%/tydz.** i **≤60 zł/dzień** |
| Duża decyzja (omawiamy szerzej) | pauza całej kampanii, budżet ponad limit, zmiana eventu/struktury, cokolwiek nieodwracalne |
| Wyłącznie Tomek ręcznie | **publikacja kampanii** (PAUSED→ACTIVE), zatwierdzenie `target_cpa`, wysyłka sprostowań do klientów |

Niezależnie od klasy: **wykonanie = po potwierdzeniu Tomka w rozmowie.** Pełna lista twardych granic: sekcja 9.

**Mail do klienta:** zapis raportu do `workflow_ad_reports` = **OD RAZU wysyłka maila**
transakcyjnego (edge function `send-email`, KROK 7 procedury raportowej). Zakaz autonomicznej
wysyłki dotyczy WYŁĄCZNIE Gmaila Tomka — transakcyjny `ad_report` przez Resend wysyłasz sam.
Treść maila = TYLKO liczby + lejek (sekcja 8).

---

## 2. MAPA SYSTEMU

Baza: **Supabase `yxmavwkwnfuphjqbelws`** (klucz publishable: `sb_publishable_vT94u2GI4gzYl8gCV5sHbQ_Q94YidaI`).

| Obiekt | Rola | Kluczowe pola |
|---|---|---|
| `workflow_ads` | stan kampanii per sklep | `report_data` (cache ostatniego raportu), `ad_account_data.campaign_state` `{status, daily_budget, campaign_id, campaign_name, start_time, updated_at}`, `target_cpa`, `pixel_id`, `meta_ad_account_id`, `meta_mcp_enabled` |
| `campaign_daily_stats` | **DZIENNE metryki per kampania** (źródło filtra dat w panelu) | `workflow_id`, `campaign_id`, `stat_date`, `spend`, `impressions`, `reach`, `clicks`, `link_clicks`, `purchases`, `purchase_value`, `purchase_roas`, `cpc`, `cpm`, `ctr`, `frequency`; UNIQUE `(workflow_id, campaign_id, stat_date)` → upsert. Sekcja 3 |
| `workflow_ad_reports` | historia raportów | ⚠️ **INSERT = klient widzi raport NATYCHMIAST** (brak filtra `sent_to_client`). Tylko GOTOWE raporty |
| `campaign_actions` | **changelog wykonanych akcji** (sekcja 4) | `workflow_id`, `type`, `title`, `params`, `reason`, `status`, `executed_at`, `execution_result` |
| `workflows` | dane klienta | `customer_email`, `customer_name`, `unique_token` |
| `workflow_branding` (`type='brand_info'`) | marka | `title` = nazwa marki do komunikacji |

**Panele:**
- **Centrum Kampanii** `crm.tomekniedzwiecki.pl/tn-workflow/kampanie` — **lustro read-only**:
  tabela wszystkich kampanii (Wydatki/Wyświetlenia/Klik.link/CTR/CPC/Zakupy/ROAS), klik wiersza =
  rozwinięcie inline (metryki okresu + dzienny rozkład + lejek 9-krokowy z ostatniego raportu),
  filtr po datach (7/14/30 dni / Wszystko / custom), „Ostatnie akcje" = changelog. Liczby w tabeli
  liczone z `campaign_daily_stats` dla wybranego zakresu; fallback na `report_data` gdy brak dziennych.
- Per projekt: `crm.tomekniedzwiecki.pl/tn-workflow/workflow?id=<UUID>` (panel admina — tu narracja).

**Mail raportowy:** `POST https://yxmavwkwnfuphjqbelws.supabase.co/functions/v1/send-email`
(apikey = publishable), `{type:'ad_report', data:{...}}` — pełny payload (numbers-only) w KROKU 7
procedury raportowej. Template w `settings`, klucz `email_template_ad_report_body`.

---

## 3. DANE DZIENNE — `campaign_daily_stats` (backfill i odświeżanie)

Panel filtruje po dowolnym zakresie dat, więc potrzebuje DZIENNYCH wierszy per kampania.
Zasilasz je z Meta MCP (Tomek musi mieć podłączony connector „claude.ai meta" w tym oknie).

**Pull dzienny (per kampania):**
```
ads_get_ad_entities(
  ad_account_id = <meta_ad_account_id>,
  level = 'campaign',
  time_range = {since:'YYYY-MM-DD', until:'YYYY-MM-DD'},
  time_increment = '1',                      // ← dzienny rozkład
  fields = ['id','name','amount_spent','impressions','reach','clicks','cpm','cpc',
            'actions:link_click','actions:omni_purchase','purchase_roas']
)
```
- `actions:link_click` = link clicks (NIE pole `clicks`). `actions:omni_purchase` = zakupy
  („Not available" → 0). Wartości przychodzą sformatowane po polsku (`"37,48 zł"`) — parsuj na liczby.
- Mapuj `campaign_id` z `workflow_ads.ad_account_data.campaign_state.campaign_id`.
- **Upsert** do `campaign_daily_stats` po `(workflow_id, campaign_id, stat_date)`. Licz `ctr`=link/impr,
  `cpc`=spend/link, `cpm`=spend/impr×1000 jeśli MCP nie poda; `purchase_value` z `result_values`/ROAS.

**Backfill (pierwsze uruchomienie / luka):** dla każdej kampanii z `campaign_launched=true` pull od
`campaign_state.start_time` do wczoraj, upsert. ~14 kampanii — rób sekwencyjnie, parsuj per dzień.

**AUTOMATY (cloud routines, od 2026-06-12):**
- **Daily campaign stats pull** `trig_01BZ5r5Y26zZLJX5J8ohpvn3` — codziennie 06:40 UTC: pull
  ostatnich 3 dni per konto (`time_increment=1`) → upsert do `campaign_daily_stats`. Sukces = cicho;
  problem = wpis `campaign_actions` „Daily stats pull: PROBLEM" (proposed_by=routine).
- **Weekly ads reports** `trig_014C36PDrUg9yU1jDeJAJ1B4` — czwartki 07:10 UTC: per workflow trailing 7d
  (suma WSZYSTKICH kampanii workflow z `campaign_daily_stats` + reach z MCP + lejek z `dataset_stats`)
  → INSERT `workflow_ad_reports` → mail numbers-only przez **pg_net z wnętrza bazy** (`net.http_post`
  na send-email — obejście egress blocka cloud env). Spend=0 w okresie → mail wstrzymany + log.
  Diagnostyka obu: wpisy `proposed_by='routine'` w `campaign_actions` + https://claude.ai/code/routines

**Mid-funnel (koszyk/produkt/wejścia)** NIE jest w tej tabeli — pixel daje go na poziomie KONTA
(`ads_get_dataset_stats`, web+CAPI podwójnie). Mid-funnel zostaje w `workflow_ad_reports.report_data`
i to z niego panel renderuje lejek 9-krokowy w rozwinięciu wiersza.

---

## 4. CHANGELOG — `campaign_actions`

Już **nie** jest kolejką proposed→approved (panel nie ma przycisków). To **dziennik tego, co zrobiliśmy**.

**Po wykonaniu KAŻDEJ akcji** (po decyzji Tomka w rozmowie) → INSERT:
```
{ workflow_id, type, title, params (campaign_id/adset_id/daily_budget_grosze...),
  reason, status:'executed', executed_at:now(), execution_result:'...' }
```
`type` ∈ `pause_campaign|resume_campaign|budget_change|pause_ad|resume_ad|pause_adset|resume_adset|new_creative|fix_tracking|custom`.
Po sukcesie zaktualizuj też `workflow_ads.ad_account_data.campaign_state`. Wpis pojawia się od razu
w „Ostatnie akcje" w panelu (changelog tylko dla Tomka).

Status `failed` + `execution_result` gdy MCP odrzuci. (`proposed`/`approved`/`executing` istnieją w
schemacie, ale w nowym modelu zwykle ich nie używasz — decyzja zapada w rozmowie, nie w panelu.)

---

## 5. RYTM PRACY

**Punkt startowy:** Tomek wkleja prompt z przycisku „Pracuj nad kampaniami z Claude". Wtedy:

1. **Przeczytaj ten plik + `CLAUDE_ADS_REPORT_PROCEDURE.md`.**
2. **Pobierz świeże dane** (nie ufaj snapshotowi z promptu): `workflow_ads`, `campaign_daily_stats`,
   `workflow_ad_reports`, `campaign_actions`. Jeśli `campaign_daily_stats` puste → **najpierw backfill** (sekcja 3).
3. **Sprawdź obce ślady** (sekcja 5c) zanim cokolwiek zaproponujesz do zmiany na koncie.
4. **Przedstaw WNIOSKI**: co działa, co przepala kasę, co zablokowane (kasa/pixel/strona), gdzie
   potencjał. Potem **akcje uszeregowane wg ważności** — każda z uzasadnieniem liczbowym i
   przewidywanym efektem.
5. **Czekaj na decyzję Tomka przy każdej.** Po „tak" → wykonaj przez Meta MCP → zweryfikuj →
   zaloguj do `campaign_actions` (sekcja 4) → zaktualizuj `campaign_state`.

**(a) Cykl tygodniowy raportu** per aktywna kampania: pełny flow wg `CLAUDE_ADS_REPORT_PROCEDURE.md`
(kontekst → dane MCP → diagnoza lejka → [decyzje z Tomkiem] → raport JSON → INSERT → mail numbers-only).

**(b) PRZED każdą mutacją konta Meta — check obcych śladów:** sprawdź `updated_time` kampanii/ad setów
(`ads_get_ad_entities`). Zmiany **<48h, których nie ma w `campaign_actions`** = obca sesja (równoległe
sesje / Tomek ręcznie). Wtedy NIE nadpisuj — zgłoś Tomkowi co zastałeś. Incydenty 2026-06-10:
**Kafina** (2 obce kampanie), **Vitrix** (obca konfiguracja), **SilkTip** (obca pauza ad setu).

---

## 6. ŻELAZNE LEKCJE AUDYTU (2026-06-10)

1. **Grupa kontrolna z portfela PRZED każdą hipotezą „X odstrasza".** Zanim uznasz coś za problem,
   sprawdź jak wygląda u zdrowego sklepu. Wzorzec zdrowy = **h2vital**: link CTR 5,2%, CPM ~51 zł,
   IC→AddShippingInfo 88%, ROAS 5,2, **PayU jako jedna etykieta płatności** i **COD jako opcja dostawy
   +19 zł** — to STANDARD platformy TakeDrop, nie błąd konfiguracji.
2. **Wyłącznie liczby ATRYBUOWANE** do raportów i decyzji: `ads_get_ad_entities` z `time_range`;
   link clicks = `actions:link_click` (NIE pole `clicks`), purchases = `actions:omni_purchase`,
   revenue = `result_values`/`purchase_roas`. ⚠️ `all_conversion_types` **IGNORUJE time_range**.
   `ads_get_dataset_stats` = wyłącznie sanity zdrowia pixela (web+CAPI liczone podwójnie).
3. **Trailing 7d kończący się WCZORAJ** — do decyzji budżetowych i komunikacji z klientem.
   Nie „ostatnia tygodniówka raportowa" (attribution lag dopisuje wstecz).
4. **Pieniądze klientów giną w OSTATNIEJ MILI.** Cotygodniowy smoke-test linku checkout: otwórz przez
   chrome-devtools i POTWIERDŹ render produktu + ceny. Sam HTTP 200 nie wystarcza.
5. **Metryki niemierzone = `null`, nie 0.** Martwy pixel → `landing_page_views: null` + wyjaśnienie.
   Zero przy setkach kliknięć okłamuje klienta.

---

## 7. PUŁAPKI MCP — tabela referencyjna

| Pułapka | Fakt / fix |
|---|---|
| `ads_get_ad_entities` — pola | NIE ma `actions`/`action_values`/`date_start`/`add_to_cart`/`landing_page_views`/`purchases`/`purchase_value`. Używaj: `actions:link_click`, `actions:omni_purchase`, `result_values`, `purchase_roas`, `amount_spent`, `impressions`, `reach`, `clicks`, `cpm`, `cpc` |
| Dzienny rozkład | `time_increment='1'` w `ads_get_ad_entities` → wiersz per dzień w `time_range`. `all_conversion_types` IGNORUJE time_range (te same liczby 3d/7d) |
| `actions:link_click` > `clicks` | pole zawyżone (np. Parova 3549>3169) → NIE raportuj CTR z tego |
| Budżety w GROSZACH | `3600` = 36 zł/dzień. Zawsze ×100 |
| `ads_update_entity` WYMUSZA PAUSED | response `status_forced_to_paused:true` → **NATYCHMIAST** `ads_activate_entity` na edytowanej encji |
| Enum eventu | `INITIATED_CHECKOUT` (z „D"). Zły enum = mylący `INTERNAL` error |
| Event optymalizacji NIEEDYTOWALNY po utworzeniu ad setu | error 100/3260011 → zmiana = NOWY ad set + reużycie `creative_id`; stary przemianuj `*-OLD-DO-USUNIECIA` |
| Cohort labels z insights ≠ konfiguracja | `optimization_goal`/promoted_object weryfikuj WYŁĄCZNIE `ads_get_ad_entities` level=adset |
| `ads_get_creatives` / `ads_get_ad_preview` | gated na koncie Tomka — treści/URL-i reklam nie odczytasz przez API |
| Pixel w innym BM niż konto | `ads_create_custom_audience` pada `INTERNAL` → pule = prerekwizyt dla Tomka |
| `ads_get_datasets` | dubluje wpisy datasetu — dedupuj po ID |
| Wartości liczbowe | przychodzą po polsku (`"250,06 zł"`, `"5,2%"`) — parsuj przed obliczeniami |
| Connector „claude.ai meta" | bywa rozłączony w danym oknie Claude Code → wszystkie `ads_*` zwracają „not connected". Poproś Tomka o podłączenie; backfill/optymalizacja czekają |

---

## 8. KOMUNIKACJA Z KLIENTEM

**Mail i panel klienta = TYLKO liczby ułożone w lejek (decyzja Tomka 2026-06-11), ZERO narracji** —
Reklamy (spend/CTR/CPC/CPM) + lejek eventów (wyświetlenia→zakup) + przychód/ROAS tylko gdy purchases>0.
Niemierzone = „—". Payload i bloki: KROK 7 procedury raportowej. Narracja (`summary`/`actions`/
`next_steps`) jest WEWNĘTRZNA — panel admina (`workflow.html`) + ta rozmowa, NIGDY do klienta.
(Panel klienta `client-projekt.html` ma narrację fizycznie usuniętą, lejek 9-krokowy jak w mailu.)

**Sprostowania błędów w już wysłanych raportach → TYLKO ręcznie Tomek.** Przygotowujesz treść, nie wysyłasz.

**Kiedy wstrzymać mail (wyjątek od „zapis = mail"):** kampania nie emituje z NIEWYJAŚNIONYCH przyczyn
(wzorzec SilkTip — obca pauza, zero spendu). Mail „wydaliśmy 0 zł" bez wyjaśnienia podważa zaufanie →
zamiast maila zgłoś Tomkowi diagnozę. Po wyjaśnieniu — raport + mail normalnie.

---

## 9. TWARDE GRANICE — NIGDY bez słowa Tomka

Nowy model = **nic nie wykonujesz proaktywnie bez potwierdzenia w rozmowie.** Poniższe są
bezwzględne nawet gdyby kontekst sugerował inaczej:

| Sytuacja | Zasada |
|---|---|
| Jakakolwiek zmiana na koncie Meta (pauza, budżet, kreacja, event) | propozycja w rozmowie → wykonanie po „tak" → log do `campaign_actions` |
| Publikacja kampanii (PAUSED → ACTIVE) | **wyłącznie Tomek ręcznie** po review |
| Zatwierdzenie `target_cpa` (nowy lub tymczasowy cena×0,3) | decyzja Tomka |
| Cokolwiek nieodwracalne (delete, zmiana eventu kasująca naukę, zmiana konta/pixela) | decyzja Tomka |
| Obce zmiany na kontach (sekcja 5b) | nie nadpisuj — pokaż Tomkowi ślady |
| Wysyłka maili z Gmaila Tomka | nigdy (drafty OK); transakcyjny `ad_report` przez Resend = OK |
| Sprostowania do klientów | treść przygotowana, wysyłka ręczna Tomka |
