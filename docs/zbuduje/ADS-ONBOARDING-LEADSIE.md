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
  **wyłącznie** pozycję `"Partner access do BM Tomka — pełna kontrola, 3 assety"` i **tylko
  gdy** jest `ad_account` w stanie `Connected` z poziomem `Manage/Owner/Admin`. Unia — nigdy
  nie odznacza. `pending → in_progress` gdy pojawią się jakiekolwiek assety Meta.
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
| `ads_budzet` | **limit wydatków konta** = fabryka przez API po `WF2_META_TOKEN` | zasila SWOJE konto (BLIK / przelew / PayU; przy karcie + zapasowa) | — |
| `ads_pixel` 🏁 | pixel na koncie klienta (`POST /act_*/adspixels`), weryfikacja domen (TXT `wfa-domain`), `set_integration` na platformie | — | **RĘCZNE 30 s**: token CAPI w Events Managerze (wąski per-pixel) |
| `ads_preflight` 🏁 | mikro-wydatek, Account Quality, limit konta (po `WF2_META_TOKEN`) | — | blocklista PL, naming/UTM, plan struktury |

Automat NIE potwierdza: waluty/strefy, telefonu/2FA, metody płatności, środków, dokumentów —
to `ads_pixel`/`ads_preflight` lub ręczna weryfikacja, nigdy na podstawie webhooka.

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
