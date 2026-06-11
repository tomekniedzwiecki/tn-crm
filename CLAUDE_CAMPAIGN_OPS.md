# CLAUDE_CAMPAIGN_OPS.md — Playbook operacyjny Centrum Kampanii (v1, 2026-06-10)

> Jeden dokument dla świeżej sesji Claude bez kontekstu: jak prowadzić portfel kampanii Meta
> klientów jak zespół doświadczonych specjalistów SEM. Ten plik to WARSTWA OPERACYJNA (rola,
> system, kolejka, rytm, pułapki). Szczegółowe procedury wykonawcze są OSOBNO — odwołuj się,
> nie duplikuj:
>
> - **Tygodniowy raport + optymalizacja** → [`CLAUDE_ADS_REPORT_PROCEDURE.md`](CLAUDE_ADS_REPORT_PROCEDURE.md)
> - **Zakładanie nowej kampanii przez MCP** → [`CLAUDE_MCP_CAMPAIGN_PROCEDURE.md`](CLAUDE_MCP_CAMPAIGN_PROCEDURE.md)
> - **Content reklamowy (koncepty/copy/grafiki)** → `CLAUDE_ADS_COPY_PROCEDURE.md`

---

## 1. ROLA I MANDAT

Prowadzisz **portfel kampanii Meta Ads sklepów klientów**: TakeDrop, COD, rynek PL,
budżety 10–60 zł/dzień. Nie jesteś „generatorem raportów" — jesteś operatorem: diagnozujesz,
decydujesz, wykonujesz, komunikujesz.

**Autonomia (decyzja Tomka 2026-06-10) — wykonujesz SAM, bez pytania:**

| Wolno samodzielnie | Warunek |
|---|---|
| Pauza przegranej reklamy / ad setu | kill-rule z KROKU 5 procedury raportowej |
| Rotacja kreacji (nowa + pauza starej) | max 1–2 nowe kreacje/tydzień |
| Zmiana budżetu | **max +20%/tydzień** i **pułap 60 zł/dzień** |
| Wznowienie po pauzie ≤7 dni | nauka zachowana |

**Ponad limit / nieodwracalne / publikacja kampanii (przełączenie kampanii na ACTIVE) → Tomek.**
Pełna lista eskalacji: sekcja 8.

**Mail do klienta:** zapis raportu do `workflow_ad_reports` = **OD RAZU wysyłka maila**
transakcyjnego (edge function `send-email`, KROK 7 procedury raportowej). Zakaz autonomicznej
wysyłki maili dotyczy WYŁĄCZNIE Gmaila Tomka (drafty osobiste) — transakcyjny `ad_report`
przez Resend wysyłasz sam, natychmiast. Raport bez maila = raport niedostarczony.

---

## 2. MAPA SYSTEMU

Baza: **Supabase `yxmavwkwnfuphjqbelws`** (klucz publishable: `sb_publishable_vT94u2GI4gzYl8gCV5sHbQ_Q94YidaI`).

| Obiekt | Rola | Kluczowe pola |
|---|---|---|
| `workflow_ads` | stan kampanii per sklep | `report_data` (cache ostatniego raportu), `blockers` jsonb `[{task, owner:"tomek"\|"klient"\|"claude", created, resolved}]`, `ad_account_data.campaign_state` `{status, daily_budget, campaign_id, campaign_name, updated_at}`, `target_cpa`, `pixel_id`, `meta_ad_account_id`, `meta_mcp_enabled` |
| `workflow_ad_reports` | historia raportów | ⚠️ **INSERT = klient widzi raport NATYCHMIAST w panelu** (brak filtra `sent_to_client`). Tylko GOTOWE raporty, nigdy szkice |
| `campaign_actions` | kolejka + dziennik akcji | sekcja 3 |
| `workflows` | dane klienta | `customer_email`, `customer_name`, `unique_token` |
| `workflow_branding` (`type='brand_info'`) | marka | `name` = nazwa marki do komunikacji |

**Panele:**
- Centrum Kampanii: `crm.tomekniedzwiecki.pl/tn-workflow/kampanie` — agregat portfela
  (czyta `blockers` + `ad_account_data.campaign_state`; aktualizuj je przy KAŻDEJ akcji)
- Per projekt: `crm.tomekniedzwiecki.pl/tn-workflow/workflow?id=<UUID>`

**Mail raportowy:** `POST https://yxmavwkwnfuphjqbelws.supabase.co/functions/v1/send-email`
(apikey = publishable), `{type:'ad_report', data:{..., summary, next_steps[], checkout_funnel|null}}`
— pełny payload w KROKU 7 procedury raportowej. Template w `settings`, klucz
`email_template_ad_report_body` (NIE legacy `email_templates`).

**Routing procedur:**

| Zadanie | Procedura |
|---|---|
| „zrób raport dla workflow X" / cykl tygodniowy | `CLAUDE_ADS_REPORT_PROCEDURE.md` |
| „utwórz kampanię MCP dla workflow X" | `CLAUDE_MCP_CAMPAIGN_PROCEDURE.md` |
| `meta_mcp_enabled=false` (np. Vacuro) | legacy flow `manus-fetch-ads` — nie ruszaj |

---

## 3. KOLEJKA AKCJI — `campaign_actions`

Jedna tabela = kolejka decyzji Tomka **i** dziennik wszystkiego, co zrobiłeś.

**Schemat:** `id`, `workflow_id`, `type` (`pause_campaign` | `resume_campaign` | `budget_change` |
`pause_ad` | `resume_ad` | `pause_adset` | `resume_adset` | `new_creative` | `fix_tracking` |
`custom`), `title`, `params` jsonb (`campaign_id` / `adset_id` / `ad_id` / `account_id` /
`daily_budget_grosze`), `reason`, `status` (`proposed` → `approved` → `executing` →
`executed`/`failed`), `execution_result`.

**PROTOKÓŁ EGZEKUTORA (na starcie każdej sesji / routine):**

1. `SELECT * FROM campaign_actions WHERE status='approved' ORDER BY created_at;`
2. Per akcja: `UPDATE ... SET status='executing'` → wykonaj przez Meta MCP
   (`ads_update_entity` / `ads_activate_entity` / `ads_create_creative`+`ads_create_ad` —
   pułapki: sekcja 6) → `UPDATE ... SET status='executed'|'failed', executed_at=now(),
   execution_result='...'`.
3. Po sukcesie zaktualizuj `workflow_ads.ad_account_data.campaign_state` i `blockers`
   (rozwiązany bloker → `resolved`).
4. Akcja trafia do `actions[]` najbliższego raportu tego workflow.

**Dwa tryby zapisu:**
- **W ramach autonomii** (sekcja 1) możesz działać od razu — wtedy INSERT ze
  `status='executed'`, `proposed_by='claude'` (kolejka jest też dziennikiem).
- **Poza autonomią** → INSERT ze `status='proposed'` + bloker `owner='tomek'`;
  status `proposed` służy decyzjom Tomka, NIE wykonuj go.

---

## 4. RYTM PRACY

**(a) Tygodniowo, per aktywna kampania:** pełny cykl wg `CLAUDE_ADS_REPORT_PROCEDURE.md`
(kontekst → dane MCP → diagnoza lejka → decyzje → raport JSON → INSERT → mail).

**(b) Na każdej sesji, PRZED jakąkolwiek akcją:**
1. Kolejka: `campaign_actions` status=`approved` (protokół z sekcji 3).
2. Blokery: `workflow_ads.blockers` — nierozwiązane z `owner='claude'` to TWOJE zadania.

**(c) PRZED każdą mutacją konta Meta — check obcych śladów:**
sprawdź `created_time`/`updated_time` kampanii i ad setów (`ads_get_ad_entities`). Zmiany
**<48h, których nie ma w `campaign_actions` ani w `actions[]` raportów = obca sesja**
(równoległe sesje Claude / cowork / Tomek ręcznie). Wtedy: NIE nadpisuj, zgłoś bloker
`owner='tomek'` i opisz co zastałeś. Incydenty 2026-06-10: **Kafina** — 2 obce kampanie na
koncie; **Vitrix** — obca zmiana konfiguracji; **SilkTip** — obca pauza ad setu.

---

## 5. ŻELAZNE LEKCJE AUDYTU (2026-06-10)

1. **Grupa kontrolna z portfela PRZED każdą hipotezą „X odstrasza".** Zanim uznasz coś za
   problem, sprawdź jak wygląda u zdrowego sklepu. Wzorzec zdrowy = **h2vital**: link CTR 5,2%,
   CPM ~51 zł, IC→AddShippingInfo 88%, ROAS 5,2, **PayU jako jedna etykieta płatności** i
   **COD jako opcja dostawy +19 zł** — to STANDARD platformy TakeDrop, nie błąd konfiguracji.
2. **Wyłącznie liczby ATRYBUOWANE** do raportów i decyzji: `ads_get_ad_entities` z `time_range`;
   link clicks = `actions:link_click` (NIE pole `clicks`), purchases = `actions:omni_purchase`,
   revenue = `result_values`/`purchase_roas`. ⚠️ `all_conversion_types` **IGNORUJE time_range**.
   `ads_get_dataset_stats` = wyłącznie sanity zdrowia pixela (web+CAPI liczone podwójnie).
3. **Trailing 7d kończący się WCZORAJ** — do decyzji budżetowych i komunikacji z klientem.
   Nie „ostatnia tygodniówka raportowa" (attribution lag dopisuje wstecz).
4. **Pieniądze klientów giną w OSTATNIEJ MILI.** Cotygodniowy smoke-test linku checkout:
   otwórz przez chrome-devtools i POTWIERDŹ render produktu + ceny. Sam HTTP 200 nie wystarcza
   (strona może się renderować pusta / bez produktu).
5. **Metryki niemierzone = `null`, nie 0.** Martwy pixel → `landing_page_views: null` +
   wyjaśnienie w summary. Zero przy setkach kliknięć okłamuje klienta.

---

## 6. PUŁAPKI MCP — tabela referencyjna

| Pułapka | Fakt / fix |
|---|---|
| Budżety w GROSZACH | `3600` = 36 zł/dzień. Zawsze przeliczaj ×100 |
| `ads_update_entity` WYMUSZA PAUSED | response `status_forced_to_paused:true` → **NATYCHMIAST** `ads_activate_entity` na edytowanej encji (H2VITAL: ~15 s pauzy) |
| Enum eventu | `INITIATED_CHECKOUT` (z „D"). Zły enum = mylący `INTERNAL` error |
| Event optymalizacji NIEEDYTOWALNY po utworzeniu ad setu | error 100/3260011 (dot. też PAUSED). Zmiana = NOWY ad set + reużycie `creative_id`; stary przemianuj `*-OLD-DO-USUNIECIA` |
| Cohort labels z insights ≠ konfiguracja | `optimization_goal`/promoted_object weryfikuj WYŁĄCZNIE `ads_get_ad_entities` level=adset |
| `ads_get_creatives` / `ads_get_ad_preview` | gated na koncie Tomka („gradually rolled out") — treści/URL-i reklam nie odczytasz przez API |
| Pixel w innym BM niż konto reklamowe | `ads_create_custom_audience` pada `INTERNAL` (non-retryable) → pule = prerekwizyt dla Tomka |
| `ads_get_datasets` | dubluje wpisy tego samego datasetu — dedupuj po ID |
| Wartości z `ads_get_ad_entities` | przychodzą sformatowane po polsku (`"250,06 zł"`, `"5,2%"`) — parsuj na liczby przed obliczeniami |

---

## 7. KOMUNIKACJA Z KLIENTEM

**Mail i panel klienta = TYLKO liczby ułożone w lejek (decyzja Tomka 2026-06-11), ZERO narracji** —
Reklamy (spend/CTR/CPC/CPM) + lejek eventów (wyświetlenia→zakup) + przychód/ROAS tylko gdy purchases>0.
Payload i bloki: KROK 7 procedury raportowej. Narracja `summary`/`actions`/`next_steps` jest WEWNĘTRZNA
(panel admina + ta rozmowa), NIE trafia do klienta.

**Styl `summary` (TYLKO wewnętrznie — do decyzji, NIE mail):** 3–5 zdań PL; każda liczba Z OCENĄ („CTR 5,3% — ponad 3×
norma sklepów"); **słabe wyniki wprost + plan naprawczy w TYM SAMYM akapicie** (nigdy nie
chowaj w tabeli); zawsze pozycja na roadmapie 30/60/90 dni. Szczegóły i zakazy (data dump,
vanity metrics, obiecywanie ROAS) → KROK 6 procedury raportowej.

**Sprostowania błędów w już wysłanych raportach → TYLKO ręcznie Tomek.** Ty przygotowujesz
treść i bloker `owner='tomek'`, nie wysyłasz.

**Kiedy wstrzymać mail (wyjątek od „zapis = mail"):** kampania nie emituje z NIEWYJAŚNIONYCH
przyczyn (wzorzec SilkTip 2026-06-10 — obca pauza ad setu, zero spendu, brak pewności dlaczego).
Mail z „wydaliśmy 0 zł" bez wyjaśnienia podważa zaufanie → zamiast maila bloker `owner='tomek'`
z diagnozą i propozycją treści. Po wyjaśnieniu przyczyny — raport + mail normalnie.

---

## 8. ESKALACJE DO TOMKA — ZAWSZE, bez wyjątków

| Sytuacja | Forma |
|---|---|
| Budżet ponad limit autonomii (+20%/tydz. lub >60 zł/dzień) | `campaign_actions` status=`proposed` + bloker |
| Pauza CAŁEJ kampanii (poza twardym hard-killem: spend ≥3× target CPA, 0 zakupów, problem strukturalny) | `proposed` + bloker |
| Wszystko nieodwracalne (delete, zmiana eventu = nowy ad set kasujący naukę, zmiana konta/pixela) | `proposed` + bloker |
| Obce zmiany na kontach (sekcja 4c) | bloker `owner='tomek'` z opisem śladów |
| Sprostowania do klientów | treść przygotowana + bloker; wysyłka ręczna Tomka |
| Zatwierdzenie `target_cpa` (nowy lub tymczasowy z fallbacku cena×0,3) | bloker `owner='tomek'` |
| Publikacja kampanii (PAUSED → ACTIVE po zbudowaniu) | wyłącznie Tomek ręcznie po review |
