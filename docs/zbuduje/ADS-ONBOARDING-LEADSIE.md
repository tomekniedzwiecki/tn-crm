# Onboarding reklamowy przez Leadsie (Etap 4 — SSOT)

Jednoklikowy tor nadania **partner access** do BM Tomka (Meta Business Portfolio
`737839566050751`) w krokach klienckich `ads_konto` / `ads_strona`. Zastępuje ręczne
klikanie w Business Suite: klient loguje się do Facebooka, zaznacza konto reklamowe +
stronę + Instagram, klika „Połącz" — a my dostajemy webhook i **automatycznie odhaczamy
checklistę** w panelu. Ręczna instrukcja zostaje jako fallback.

Styl modułu: Geist/Vercel (tła `#0a0a0a/#111`, bordery `#1f1f1f–#333`, akcent `#0070f3`,
success `#45a557`, warning `#f5a623`, error `#e5484d`; zero fioletu).

---

## 1. Flow (end-to-end)

```
Tomek: request v2 w Leadsie → wkleja connect-link do settings.wf2_leadsie_connect_url
   │
   ▼
Portal klienta (tn-sklepy/portal.html, zadanie ads_konto / ads_strona)
   │  edge wf2-portal buduje URL = <connect-link> + customUserId=<wf2_projects.id>
   ▼
Klient klika „Połącz konta reklamowe (2 minuty)" → login FB → zaznacza assety → „Połącz"
   │  (nadaje partner access „Pełna kontrola" do BM 737839566050751)
   ▼
Leadsie POST → webhook wf2-ads-connect?s=<WF2_LEADSIE_SECRET>  (format v2)
   │  user=customUserId → wf2_projects.id → mapowanie na projekt
   ▼
wf2_steps(ads_konto/ads_strona).data.leadsie = {status, assets[…]}  +  checklist ✓
   +  wf2_activities(action='ads_connect')  +  (przy brakach) wf2_notes „⚠️ AUTOMAT: Leadsie…"
   ▼
Panel admina (projekt.html, warsztat ads_konto): sekcja „Połączenia Leadsie" (assety+chipy+linki)
Portal klienta: status „Połączono: konto ✓ / strona ✓" (MINIMALNE flagi)
```

`customUserId` to **`wf2_projects.id`** (UUID). Webhook waliduje UUID i istnienie projektu;
zły/nieznany → 200 z `{ok:false}` (retry Leadsie nic nie naprawi — ślad w logach).

---

## 2. Kontrakt webhooka `wf2-ads-connect`

- **Endpoint:** `.../functions/v1/wf2-ads-connect` — deploy `--no-verify-jwt`
  (POST idzie z serwerów Leadsie, bez JWT). `npm run deploy:wf2-ads-connect`.
- **Gate:** `?s=<WF2_LEADSIE_SECRET>` — Leadsie nie podpisuje webhooków, sekret żyje w URL-u
  wklejonym w ich dashboardzie (Settings → Webhooks, **format v2**). Brak env → `503`
  (fail-closed). Zły sekret → `401`.
- **Payload v2 (istotne pola):**
  `user`/`customUserId` = nasz UUID projektu · `status` = `SUCCESS`/`PARTIAL_SUCCESS`/`FAILED`
  · `clientName` · `connectionAssets[]` = `{type, platform, connectionStatus, accessLevel,
  linkToAsset, name}`.
- **Klasyfikacja assetu** (`assetKind`): defensywnie po `type`/`platform`/`name` →
  `ad_account` / `page` / `pixel` / `instagram` / `catalog` / `bm` / `other`. `other`
  odpada (nie-Meta).
- **Zapis (per krok, project-scope, `product_id IS NULL`):**
  `wf2_steps.data.leadsie = { at, status, client_name, request_url, summary_url,
  assets:[{kind,name,status,access,link}] }`. Ten sam blok trafia do **ads_konto** i
  **ads_strona** (lustro).
- **Mapowanie asset → krok / checklista:** webhook odhacza w `ads_konto.data.checklist`
  **DWIE** pozycje — `"Konto reklamowe istnieje i połączone (Leadsie — automat)"` oraz
  `"Partner access do BM Tomka — nadany przez Leadsie (automat)"` — i **tylko gdy** jest
  `ad_account` w stanie `Connected` z poziomem `Manage/Owner/Admin/Advertise/Full control`
  (allowlista poszerzona, case-insensitive — za wąska = cichy no-op toru). W `ads_strona.data.checklist`
  odhacza `"Strona FB istnieje i udostępniona do BM Tomka (Leadsie — automat)"` gdy strona `Connected`.
  Unia — nigdy nie odznacza; scalanie przez RPC **`wf2_step_merge`** (atomowy `jsonb_set` + unia
  checklisty w JEDNYM `UPDATE` — bez read-modify-write, koniec lost-update z cronem verify).
  `pending → in_progress` gdy pojawią się jakiekolwiek assety Meta.
- **Idempotencja:** nadpisanie bloku `leadsie` + unia checklisty → retry bezpieczny (500 →
  Leadsie może ponowić).

⚠️ **Tekst checklisty = klucz deduplikacji** ze stanem w bazie (`WS.check[]` w projekt.html
↔ `data.checklist.t` ↔ `CHECKLIST_MAP` w wf2-portal). **Nie parafrazować** żadnej istniejącej
pozycji — rozjazd zostawi „ducha" checklisty.

---

## 3. Co automat odhacza — a czego CELOWO NIE

**Odhacza:** partner access (gdy konto reklamowe Connected + Manage). To jedyna rzecz, którą
webhook potwierdza wiarygodnie.

**NIE odhacza (świadomie):** waluta PLN / strefa Europe/Warsaw, telefon+2FA, metoda płatności,
środki widoczne w Ads Managerze, dokumenty firmy. Tego Leadsie nie mówi — **weryfikacja w
krokach admina** `ads_pixel` / `ads_preflight` (wymaga `WF2_META_TOKEN`), nie na podstawie
webhooka. Braki/`FAILED`/`PARTIAL_SUCCESS` → nota `⚠️ AUTOMAT: Leadsie…` (dedup po otwartej
nocie), Tomek dogląda ręcznie.

---

## 4. Gdzie wkleić connect-link

`settings.wf2_leadsie_connect_url` (migracja `20260722_wf2_leadsie_settings.sql`; default = `''`).

- **Odczyt WYŁĄCZNIE service_role** (edge wf2-portal) i team_member (RLS settings). **NIE**
  jest to klucz z anon-whitelisty — front NIGDY nie czyta settings; link dostaje gotowy z edge.
- Edge dokleja separator (`?`/`&` wg tego, czy URL ma już query) + `customUserId=<project_id>`.
- **Pusty string → przycisk „Połącz konta reklamowe" się NIE renderuje** (fallback: ręczna
  instrukcja + checklista bez zmian). Tomek wkleja właściwy URL, gdy request w Leadsie gotowy.

Panel admina `projekt.html` **nie czyta settings** (nie ma takiego zapytania) → skrótu
„Link dla klienta: skopiuj" świadomie nie dodano (link buduje edge dla portalu).

---

## 5. Widoczność

| Miejsce | Co widać | Sanityzacja |
|---|---|---|
| **Panel admina** `projekt.html` (warsztat `ads_konto`/`ads_strona`, `adsKontoLeadsieBlock`) | pełny `data.leadsie`: lista assetów (kind/name), chip statusu (Connected=zielony, In progress=żółty, reszta=czerwony), `access`, link per asset, `summary_url`, `at` | pełny wgląd (team za JWT) |
| **Portal klienta** `portal.html` (`leadsieConnectBlock`) | przycisk connect + status „Połączono: konto ✓ / strona ✓" | **WYŁĄCZNIE** `{connected_ad_account, connected_page, at}` — bez linków do business.facebook.com, nazw kont, `summary_url` |

Tryb podglądu admina „oczami klienta" (preview) w portalu działa read-only jak dotąd — blok
Leadsie pokazuje tylko minimalne flagi (edge nie ujawnia więcej nawet podglądowi).

---

## 6. Plan Leadsie (koszty)

- **Trial** na starcie (walidacja formatu v2 + webhooka).
- Docelowo **Agency $129/mies.** (unlimited connections, white-label connect page,
  webhooki v2). Decyzja o wejściu na plan płatny = po potwierdzeniu, że tor skraca onboarding
  i redukuje „wiszące" partner-accessy.

---

## 7. Pliki

- Webhook: `supabase/functions/wf2-ads-connect/index.ts` (już zdeployowany).
- Portal edge: `supabase/functions/wf2-portal/index.ts` (`leadsie` w odpowiedzi).
- Portal front: `tn-sklepy/portal.html` (`leadsieConnectBlock`).
- Panel: `tn-sklepy/projekt.html` (`adsKontoLeadsieBlock`).
- Settings: `supabase/migrations/20260722_wf2_leadsie_settings.sql`.
- Smoke test: `scripts/verify-wf2.mjs` (gate webhooka + wiring portalu).

---

## 8. ETAP 4 PO PRZEBUDOWIE (21.07) — role i sekwencja

Przebudowa treści checklist/opisów 5 kroków `ads_*` pod ustalenia 21.07: onboarding klienta
**wyłącznie przez Leadsie**, CAPI emituje **platforma Trevio** po podaniu tokenu, token CAPI
generujemy **MY** w Events Managerze (wąski, per-pixel), limit wydatków ustawia **fabryka** po
`WF2_META_TOKEN`. Portfel projektu = **3 produkty**.

### Kto co robi (5 kroków)

| Krok | Automat (Leadsie / fabryka) | Klient (ręcznie) | Fabryka (ręcznie) |
|---|---|---|---|
| `ads_konto` | Leadsie tworzy BM + konto reklamowe (gdy brak) i nadaje partner access do BM Tomka; webhook odhacza „konto" + „partner access" i zapisuje `meta_ad_account_id` (gdy pusty) | metoda płatności (Leadsie promptuje), telefon/2FA | weryfikacja **PLN + Europe/Warsaw** w Business Settings (kreator Leadsie tego nie gwarantuje; docelowo automat po `WF2_META_TOKEN`) |
| `ads_strona` | Leadsie tworzy stronę FB w kreatorze (stron NIE DA SIĘ przez API) i udostępnia do BM; webhook odhacza „strona" gdy Connected | publikuje posty, IG opcjonalnie na start | dostarcza logo / cover / propozycje postów z brandingu parasola |
| `ads_budzet` | **limit wydatków konta** = fabryka przez API po `WF2_META_TOKEN` | zasila SWOJE konto — **prepaid / płatności ręczne** (BLIK/przelew/PayU); karta = wyjątek (wtedy główna + zapasowa) | — |
| `ads_pixel` 🏁 | pixel na koncie klienta (`POST /act_*/adspixels`), weryfikacja domen (TXT `wfa-domain`), `set_integration` na platformie | — | **RĘCZNE 30 s**: token CAPI w Events Managerze (wąski per-pixel) |
| `ads_preflight` 🏁 | mikro-wydatek, Account Quality, limit konta (po `WF2_META_TOKEN`) | — | blocklista PL, naming/UTM, plan struktury |

Automat NIE potwierdza: waluty/strefy, telefonu/2FA, metody płatności, środków, dokumentów —
to `ads_pixel`/`ads_preflight` lub ręczna weryfikacja, nigdy na podstawie webhooka.

> **Budżet — metoda płatności (decyzja Tomka 22.07, WIĄŻĄCA): PREPAID / płatności ręczne.** Domyślnie
> klient zasila konto płatnościami ręcznymi (BLIK/przelew/PayU), **nie kartą**. **Dlaczego:** pełna
> kontrola nad wydatkiem z góry, doładowanie z góry zamiast niekontrolowanego obciążenia karty.
> **Jak wpłacać poprawnie (L1):** doładowanie ZAWSZE z Ustawień płatności KONKRETNEGO konta reklamowego
> (`billing_hub/payment_settings/?asset_id=<ID konta>`) — ogólny przelew na Facebooka ląduje na
> domyślnym koncie rozliczeniowym profilu i utyka (incydent: 1000 zł stało tydzień poza kampanią).
> **L5:** płatności ręczne wybiera się przy PIERWSZEJ konfiguracji płatności konta — później nie da się
> przełączyć z automatycznych na ręczne. Karta pozostaje jako wyjątek (wtedy główna + zapasowa).

### Sekwencja `ads_pixel` (CAPI przez platformę Trevio)

1. **AUTOMAT** — pixel na koncie klienta (`POST /act_*/adspixels` po `WF2_META_TOKEN`); pixel w BM
   **KLIENTA** (ten sam co konto — inny BM = WCA nie działają).
2. **Domeny** landing + checkout: rekord TXT przez `wfa-domain` (`dns_set`) + weryfikacja w BM.
3. **RĘCZNE 30 s** — „Generate access token" w Events Managerze przy pixelu. Meta **nie ma API** do
   tokenu CAPI; generujemy MY przez partner access.
4. **AUTOMAT** — `set_integration {pixelId, apiKey = token CAPI}`; platforma **Trevio EMITUJE
   Purchase server-side** (potwierdzone 21.07). Klient niczego nie wkleja.
5. **GATE** — Purchase testowy + dedup po `event_id` w Events Managerze (1 zdarzenie, nie 2).
   COD daje email+telefon z formularza → EMQ 8+ realnie osiągalne.

### Zasada wąskiego tokenu (twardo)

Token CAPI generujemy **per pixel** w Events Managerze — wąski zakres, do jednego zbioru zdarzeń.
Do Trevio oddajemy **TYLKO** ten token, **NIGDY** master/system-user tokenu. Wyciek wąskiego tokenu =
szkoda ograniczona do jednego pixela; master token = klucz do całego BM. Bez wyjątków.

---

## 9. WERYFIKATOR `wf2-ads-verify` (środowisko, którego Leadsie NIE potwierdza)

Leadsie odhacza tylko **partner access + konto + strona** (webhook, §2–3). Reszta środowiska —
**waluta/strefa, metoda płatności, środki, limit wydatków, przypięcie strony do konta, pixel** —
wymaga odczytu przez **Graph API** (partner access do BM klientów). Robi to edge **`wf2-ads-verify`**
(Graph v23.0), auto-odhaczając w checklistcie **VERBATIM** to, czego webhook nie widzi.

- **Kontrakt (POST):** `{action:'verify', project_id}` (1 projekt) · `{action:'sweep'}` (wszystkie projekty
  z `meta_ad_account_id NOT NULL`; wołany cronem).
- **Gate:** team JWT (`team_members`) **LUB** `x-wf2-secret == WF2_GEN_SECRET` (wzorzec `wf2-platform`);
  bez auth → 403. Deploy `--no-verify-jwt` (`npm run deploy:wf2-ads-verify`).
- **⛔ TWARDY GUARD:** `EXCLUDED_ACCOUNTS = ['act_1537659320657091']` (konto marki osobistej Tomka) —
  konto z listy jest pomijane, **NIGDY** nie odpytywane ani modyfikowane (to samo konto wykluczone w
  `wf2-ads-sync`).
- **Fail-closed:** bez `WF2_META_TOKEN` → 200 `{skipped:'no_token'}` (nic nie sfabrykuje; token jeszcze
  nie istnieje w Supabase).
- **Co czyta i USTAWIA (per konto = `wf2_projects.meta_ad_account_id`):**
  1. `GET /{act}?fields=currency,timezone_name,account_status,funding_source_details,spend_cap,amount_spent` →
     waluta==PLN + strefa==Europe/Warsaw? metoda płatności (karta vs prepaid?) jest? `account_status==1`?
  2. `GET /{act}/promote_pages` → strona przypięta. **Puste `[]` (nie tylko rzucony błąd) też odpala
     fallback `assigned_pages`** zanim uznamy brak strony.
  3. `GET /{act}/adspixels` → pixel istnieje (zapis `pixel_id` na projekt gdy kolumna pusta).
  4. `spend_cap` brak/0 → `POST /{act} {spend_cap: amount_spent + 500000}` — **LIFETIME cap Meta**
     (nie miesięczny!): bufor **5000 zł NAD już wydanym** (jednostka = grosze/minor-units). Ustawiane
     **tylko** na koncie PLN/Warsaw **aktywnym**. Istniejący cap z buforem < 1000 zł nad wydanym →
     nota `info` „⚠️ AUTOMAT: konto zbliża się do limitu wydatków — podbij spend_cap" (dedup).
  Graph GET-y mają twardy timeout (AbortController 20 s) + 1 retry z backoffem 2 s na przejściowe (5xx/429/sieć).
- **Co odhacza (unia, VERBATIM — jak webhook; nigdy nie odznacza; TYLKO na aktywnym koncie):**
  `ads_konto` → „Waluta PLN + strefa Europe/Warsaw zweryfikowane w Business Settings" (gdy oba OK);
  `ads_budzet` → „Środki WIDOCZNE w Ads Managerze (nie tylko deklaracja)" **wyłącznie gdy metoda
  płatności = KARTA** (prepaid = saldo 0 nieczytelne przez Graph → zamiast odhaczenia nota `info`
  „metoda płatności jest, saldo nieczytelne API — potwierdź w Ads Managerze") + „Limit wydatków konta
  ustawiony (fabryka, po WF2_META_TOKEN)" (po ustawieniu/potwierdzeniu spend_cap);
  `ads_strona` → „Strona przypisana do konta reklamowego (wymóg create_ad)" (gdy strona przypięta).
- **Rozjazd waluty/strefy** = nota `blokada` „⚠️ AUTOMAT: środowisko — konto {act} ma walutę X/strefę Y
  (wymagane PLN/Europe-Warsaw) — konto DO WYMIANY (nieodwracalne)" (dedup po otwartej nocie) + **BEZ**
  odhaczenia. Pełny wynik → `wf2_steps(ads_konto).data.ads_verify = {at, wyniki}`; `wf2_activities(ads_verify)`.
- **`account_status != 1`** (nieaktywne/ograniczone) = nota `blokada` „⚠️ AUTOMAT: środowisko — konto {act}
  ma status {n} (nieaktywne/ograniczone) — sprawdź Account Quality" (dedup) + **pomija** odhaczanie
  środowiska i ustawianie spend_cap dla tego projektu (środowisko niepewne).
- **Heurystyka KARTY (runda 3):** „Środki WIDOCZNE" odhaczamy **wyłącznie gdy `funding_source_details`
  (type/display_string) zawiera nazwę brandu/typu karty** (`visa|master|amex|american express|discover|
  maestro|card|karta|credit|debit`). **Same ostatnie 4 cyfry / maska bez brandu NIE wystarczają** —
  prepaid i inne źródła też bywają pokazane cyframi, a fałszywy ptaszek przy prepaid kłamie (saldo 0
  nieczytelne przez Graph). Brak brandu ⇒ traktujemy jak prepaid: nota `info` „metoda płatności jest,
  saldo nieczytelne API — potwierdź w Ads Managerze", **bez** odhaczenia. `[ŻYWO: kształt fundBlob
  potwierdzić na 1. realnym funding_source_details — dopisać brakujące brandy]`.
- **Odporność merge (RPC `wf2_step_merge`, runda 3):** oba automaty przechwytują `{ error }` z rpc.
  **`wf2-ads-connect`**: błąd merge ⇒ `console.error` + **HTTP 500** (Leadsie ponawia webhook; merge jest
  idempotentny — unia checklisty + nadpisanie bloku `leadsie` — więc retry domyka stan bez dubli).
  **`wf2-ads-verify`**: błąd merge ⇒ `console.error` + **dopisek „⚠️ merge NIEUDANY: …" do opisu
  `wf2_activities`** tego runu; **NIE** przerywa całego sweepa (pozostałe projekty muszą się doweryfikować).
  Zapis pól klienta w portalu (`task_save` kroków `ads_*`) idzie **tym samym** atomowym merge
  (`p_block_merge=true` → `data.fields || cleaned` pod blokadą wiersza) — nie wyściga się z verify/connect.
- **Sweep** iteruje projekty **najstarzej weryfikowane najpierw** (`ads_konto.data.ads_verify.at` rosnąco,
  brak = najpierw — ogon nie głoduje pod deadline'em; stepy pobierane jednym zapytaniem, ⚠️ cap 1000 wierszy).
- **Cron:** `wf2-ads-verify` (migracja `20260722i_wf2_ads_verify_cron.sql`, apply
  `node scripts/apply-wf2-ads-verify-cron.mjs`) — `40 4 * * *` (**06:40 PL**, 20 min po `wf2-ads-sync`);
  `action:'sweep'`, `timeout_milliseconds:350000` (obejście 5 s pg_net), sekret z Vault `wf2_gen_secret`.
- **Panel** (`projekt.html`, warsztat `ads_konto`): przycisk „Weryfikuj środowisko (API)" (`adsVerifyEnv`)
  → `functions.invoke('wf2-ads-verify')` + sekcja `adsVerifyBlock` (staty checków, timestamp, styl Geist).
  Odpowiedź `{skipped:'no_token'}` → toast „WF2_META_TOKEN nie ustawiony — weryfikacja uśpiona".

---

## 10. KONTO DO WYMIANY (zła waluta/strefa — nieodwracalne)

Waluty i strefy konta reklamowego **nie da się zmienić po utworzeniu** (Meta). Gdy verify oznaczy
konto notą „konto DO WYMIANY", nota **nie jest ślepym zaułkiem** — jest procedura:

1. **Nowe konto w BM KLIENTA** z poprawną walutą **PLN** i strefą **Europe/Warsaw**:
   - przez **kreator Leadsie** (klient klika „Połącz konta reklamowe" i tworzy nowe konto), **albo**
   - przez **API** po `WF2_META_TOKEN` (`POST /{business_id}/adaccounts` w BM klienta) — konto powstaje
     od razu z partner access do BM Tomka.
2. **Ponowny connect** — klient przechodzi link Leadsie jeszcze raz (webhook nadpisze blok `leadsie`;
   przy pustym `meta_ad_account_id` zapisze nowe `act_…`). Gdy stare `act_` wciąż siedzi na projekcie —
   podmień je ręcznie w panelu (pole „Konto reklamowe act_…") na nowe, żeby verify sprawdzał właściwe.
3. **Stare konto**: zamknij w Business Settings albo **zostaw nieużywane** (guard `EXCLUDED_ACCOUNTS`
   dotyczy tylko konta marki Tomka — cudze konta nie kolidują; byle nie było `meta_ad_account_id` projektu).
4. **Domknięcie** — webhook (`ads_konto`/`ads_strona`) i verify (waluta/strefa/środki/strona/spend_cap)
   **same odhaczą** checklisty na nowym koncie przy najbliższym connect/sweep. Ręcznie tylko podmiana `act_`.
