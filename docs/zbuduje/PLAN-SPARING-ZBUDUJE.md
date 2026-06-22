# Plan wdrożeniowy — fork sparingu dla oferty AWE „Zbuduję Ci biznes online" (/zapisy)

**Status:** plan przed budową. Źródło prawdy dla forka sparingu AWE.
**Data:** 2026-06-21. Powstał z mapowania żywego kodu Aplikacji (workflow 6 agentów).
**Decyzje Tomka (zablokowane):** koniec lejka = zwrotna rezerwacja 500 zł; deliverables = marka + makieta sklepu/produktu + rekomendacja niszy/popytu + raport/prognoza/landing; architektura = PEŁNY FORK (`bud-*` funkcje, `bud_*` tabele, nowy front), zero ryzyka dla działającej Aplikacji.
**Relacje:** silnik bazowy → `docs/stworze/SYSTEM-APLIKACJA.md`; oferta AWE → `tomekniedzwiecki.pl/zbuduje/`; obecny lejek → `/zapisy`.

---

## 1. Cel i zakres

Budujemy **pełny fork** orkiestrowanego agenta AI sparingu (dziś `/aplikacja/sparing/` dla SaaS „Stworzę") na potrzeby oferty AWE — e-commerce fizyczny (produkt + marka + sklep TakeDrop + nauka sprzedaży + Tomek wspólnikiem/risk-sharing). Klient wchodzi przez `/zapisy/` → rozmowa z AI w jednym z 3 kierunków (K1 od zera / K2 mam produkt / K3 mam pomysł) → bramka oceny popytu na żywo → pakiet deliverables → zwrotna rezerwacja 500 zł → Tomek wchodzi jako wspólnik.

**NIE ruszamy:** działającej Aplikacji (wszystkie `spar_*` funkcje/tabele/settings/crony jobid 23+24), `tpay-webhook` (single endpoint całego TPay), integracji TPay (secrets). Zero współdzielenia stanu: nowe funkcje `bud-*`, tabele `bud_*`, klucze settings `budowanie_*`, nowe crony, nowy OFFER_ID.

## 2. Adres i nazewnictwo

| Element | Wartość | Uzasadnienie |
|---|---|---|
| URL sparingu | `tomekniedzwiecki.pl/sklep/` | **(decyzja Tomka 2026-06-21: „sklep" zamiast „zbuduje" — logiczniejsze, budujemy sklep internetowy).** `/zbuduje/` zostaje jako landing OFERTY AWE; jego CTA + `/zapisy` przekierują na `/sklep/` (F8) |
| URL satelitów | `/sklep/{podglad,projekt,wspolpraca,regulamin,inspiracje}/` | klon `/aplikacja/*` |
| Panel admina | `crm.tomekniedzwiecki.pl/sklep-leady/` | klon `tn-aplikacje` |
| ⚠️ Naming wewnętrzny | `bud-*` / `bud_*` / `budowanie_*` BEZ ZMIAN | już wdrożone/przetestowane/izolowane; „bud"=„budowanie"; rename = ryzyko bez korzyści. Publiczny URL `/sklep/` ≠ prefiks kodu `bud` (świadomie) |
| Prefiks funkcji | `bud-*` | krótki, niekolidujący ze `spar-*` |
| Prefiks tabel | `bud_*` | pełna izolacja danych |
| Klucze settings | `budowanie_*`; SSOT = `budowanie_model_biznesowy` | nie kolidują z `aplikacja_*`/`stworze_*` |
| Storage prefix | `attachments/bud/<sid>/` | rozdzielność od `spar/<sid>/` |
| localStorage prefix | `bud_*` (bud_session:/bud_messages:/bud_preview:/bud_convos/bud_active/bud_owner) | **KRYTYCZNE** — ta sama domena/przeglądarka co Aplikacja; inaczej workspace i konta się mieszają |
| Cron secret | `BUD_CRON_SECRET` (nowy) | rozdzielność |
| OFFER_ID | nowy uuid w `offers` (NIE a1656695) | osobny lejek płatności |
| persona reklam | `'budowanie'`/`'awe'` | rozdzielenie konwersji Meta/TikTok/GA |
| lead_source | `'budowanie'` (osobny od `'website'` i `'stworze'`) | widoczność w `/leads` + rozdzielenie źródeł |
| Krótki link | `/b/{code}` | rozdzielność od `/p/{code}` |

## 3. Architektura forka

| Komponent (Aplikacja) | Akcja | Cel (AWE) |
|---|---|---|
| `spar-chat` | **fork** | `bud-chat` — mózg, router 3 kierunków, markery e-com |
| `spar-assess` | **fork** | `bud-assess` — bramka popytu e-com, 3 warianty per kierunek |
| `spar-image` | **fork** | `bud-image` — makieta sklepu/karty produktu/logo |
| `spar-raport` | **fork** | `bud-raport` — rynek + walidacja popytu |
| `spar-plan` | **fork** | `bud-plan` — prognoza przychodu e-com (risk-sharing) |
| `spar-economics` | **fork** | `bud-economics` — unit economics (marża/AOV/COD/ROAS) |
| `spar-gtm` | **fork** | `bud-gtm` — go-to-market (Meta/IG/TikTok/Allegro) |
| `spar-landing` | **fork** (silnik 1:1, odwrócony prompt) | `bud-landing` — landing SKLEPU (COD/recenzje WŁ.) |
| `spar-prototype` | **decyzja** | klikalny sklep LUB wyłączyć (§14.1) |
| `spar-drip` / `spar-followups` | **fork** | `bud-drip` / `bud-followups` (nowe crony) |
| `spar-project` / `spar-public-feed` / `spar-go` | **fork** | `bud-project` / `bud-public-feed` / `bud-go` |
| `spar-admin-settings` | **fork** | `bud-admin-settings` (gate team_members + backup) |
| `_shared/spar-owner.ts` / `spar-reveal-plan.ts` / `spar-prompts.ts` | **fork** | `_shared/bud-owner.ts` / `bud-reveal-plan.ts` / `bud-prompts.ts` |
| **NOWE** | nowe | `bud-brand` (nazwa+logo+paleta) |
| `generate-image`, `lead-upsert`, `send-email`, `send-sms`, `tpay-create-transaction`, `_shared/openai-fetch.ts` | **reuse 1:1** | warstwy generyczne |
| `tpay-webhook` | **reuse, NIE RUSZAĆ** | matching przez osobny cron `bud-followups` |
| `checkout/v2/index.html` | **adapt** | dodać `AWE_OFFER_ID` + obsługę `?bid=` |

**Front klonowany:** `aplikacja/sparing/`→`zbuduje/sparing/`, `aplikacja/{podglad,projekt,wspolpraca,regulamin,inspiracje}/`→`zbuduje/*`. Panel admina `tn-crm/tn-aplikacje/`→`tn-crm/zbuduje-leady/`.

## 4. Model danych

Tabele = mirror `spar_*`. **UWAGA:** `spar_reveals` i kolumny `showcase`/`hidden_from_feed` istnieją tylko w live DB (zaaplikowane przez MCP, brak plików migracji) — odtworzyć DDL z live.

**`bud_sessions`** (mirror ~50 kolumn `spar_sessions`, różnice):
- `id uuid PK` **BEZ DEFAULT** (generuje klient — brak id = błąd zamiast sieroty)
- DODAJ `track text CHECK (track IN ('k1','k2','k3'))`
- DODAJ `niche text` (wybrana/rekomendowana nisza)
- DODAJ `product_input jsonb` (K2: {nazwa, zdjecia[], url, cena_obecna, kanal_sprzedazy})
- DODAJ `demand_validation jsonb` (wynik walidacji popytu)
- DODAJ `brand jsonb` ({nazwa, logo_url, paleta[], typografia, domena_pl})
- USUŃ SaaS-owe `profession`/`problem_hint` (zastąp `niche`/`track`)
- `preview_images` klucze → `{sklep, karta_produktu, logo, lifestyle}`
- ZOSTAJE: `verdict`, `assessment`, `preview_brief`, `business_plan`, `market_report`, `economics`, `gtm`, `landing_url`, `tracking`, `ip`, `email/name/phone`, `auth_user_id/auth_provider`, `paid_at`, `full_paid_at`, `knowhow_closed_at`, `idea_source`, drip-flagi (`last_user_at/last_panel_at/panel_visits/seen_landing_at/sequence_cancelled_at/pipeline_override`), `slack_*_notified_at`, `is_test/showcase/hidden_from_feed`, `lead_id/lead_error`, `gen_locks`, `created_at/updated_at`

**Pozostałe (mirror 1:1):** `bud_messages` (zachowaj `channel`), `bud_reveals` (odsłony: marka/nisza/rynek/prognoza/landing), `bud_usage` (kind: chat/brand/demand/raport/plan/economics/gtm/landing/image), `bud_emails`/`bud_abandoned_emails`/`bud_sms`/`bud_short_links` (UNIQUE(session_id,kind)), `bud_feedback`, `bud_knowhow_items` (kind e-com: dostawca/produkt/marża/logistyka/decyzja) + `bud_knowhow_summary`.

**RPC do powielenia** (wszystkie **SECURITY DEFINER + SET search_path=public + REVOKE od anon**): `bud_record_image` (logo/sklep/karta NIE zużywają puli), `bud_claim_lock`/`bud_release_lock` (TTL anty-duplikat), `bud_costs_daily`, `bud_session_avatars`. Trigger `bud_sessions_set_updated_at`.

**ALTER istniejących:** `orders ADD bud_session_id uuid` + index (NIE reuse spar_session_id); `leads` CHECK lead_source += `'budowanie'` — **PRZED** pierwszym zielonym werdyktem (inaczej lead-upsert 500 → lead znika, bug 20260614).

**RLS — OSTRZEŻENIE (projekt dzielony z CRM):** publiczna rejestracja daje rolę `authenticated` każdemu. **ZAKAZ `authenticated USING(true)`** na `bud_*` (wyciek cudzych sesji + PII). Reguły:
- admin = `auth.uid() IN (SELECT user_id FROM team_members)`
- klient = `auth_user_id = auth.uid()`
- `bud_messages` BEZ klient-SELECT — historię czyta tylko edge przez owner-gate
- panel pisze przez **GRANT kolumnowy**: REVOKE UPDATE, potem `GRANT UPDATE(is_test, showcase, hidden_from_feed, pipeline_override, idea_source, track)`

**Crony:** 2 nowe pg_cron z `x-cron-secret=BUD_CRON_SECRET`: `bud-followups` (`*/30 * * * *`), `bud-drip` (`5,35 * * * *` — przesunięte by nie kolidować z jobid 23/24). Deploy `--no-verify-jwt`.

## 5. Silnik rozmowy 3-kierunkowy

**ROUTER na wejściu** (front): zamiast START_CHIPS renderujemy 3 karty K1/K2/K3 jako pierwszy ekran (reuse parser `<kierunki>` — gotowy budulec). Sygnał wstępny z `/zapisy` (pole `tried[]`) podpowiada kierunek. Klik karty → 1. wiadomość usera → `bud-chat` ustawia `bud_sessions.track` i rozgałęzia prompt.

**Maszyna stanów** (etap WYLICZANY z flag): `full_paid_at→knowhow` > `verdict='zielony'→wspolpraca/rezerwacja` > `assessment.awaiting_preview→preview` > DEFAULT `gate`. Blok wstrzykiwania instrukcji galęzi się dodatkowo po `track`.

| Kierunek | Rozmowa prowadzi do | Bramka ocenia | Generujemy |
|---|---|---|---|
| **K1** brak pomysłu, od zera | discovery niszy/produktu (przeramowane „nie mam pomysłu") | popyt na niszę od zera, dostawca, marża kategorii, konkurencja Allegro/Amazon | rekomendacja niszy+produktu, marka, makieta sklepu, raport+prognoza+landing |
| **K2** mam produkt, chcę markę+sprzedaż | audyt istniejącego (`product_input`) → rebrand + plan wzrostu | czy się sprzedaje, marża obecna vs możliwa, pozycjonowanie, kanały | rebrand, makieta sklepu z produktem, plan wzrostu, raport+prognoza+landing |
| **K3** mam pomysł na produkt | walidacja pomysłu → go-to-market | realność popytu, sprzedawalność, wejście, sezonowość | walidacja popytu, marka, makieta, raport+prognoza+landing+GTM |

`track` niesie się przez całą rozmowę. `mergeBrief reset:true` zeruje pochodne przy pełnym pivocie między kierunkami.

## 6. Bramka potencjału e-com (`bud-assess`)

Fork `spar-assess`: WEWNĘTRZNY (Bearer=service_role, woła go `bud-chat` runGate server-to-server — utrzymać gate, inaczej każdy curlem pali tokeny). Responses API gpt-5.5 + `web_search`, structured JSON. `<ocena>` → research → werdykt → tura sterująca.

**`buildPrompt` przepisać SaaS→e-com.** Ocena (zamiast „~50 płacących B2B"):
- **popyt** — wolumen wyszukiwań / sezonowość / trend
- **marża/AOV** — cena detaliczna vs COGS
- **konkurencja** — sklepy/marki na Allegro/Amazon/IG + ceny
- **dosięgalność** — sprzedaż przez Meta/TikTok ads + COD
- **sezonowość** — ryzyko wahań

Output: `oplacalne`, `ocena('mocny'|'do_poprawy'|'slaby')`, `popyt`, `marza`, `konkurencja`, `dosiegalnosc`, `sezonowosc`, `kierunek(ZAWSZE)`, `powody[]`, `zrodla[]`. Kryteria galęzione per K1/K2/K3.

**TWARDA BRAMKA (zachować):** zielony `<werdykt>` downgradowany do żółtego, jeśli bramka != 'mocny'. Tylko 'mocny' odblokowuje drogie deliverables. Stream `event:progress` → teatr „Badam Twój rynek na żywo".

## 7. Deliverables (4)

| Deliverable | Źródło | Funkcja / model | Osadzenie |
|---|---|---|---|
| **Marka** (nazwa+logo+paleta+typografia) | NOWE + reuse `generate-image` + `CLAUDE_BRANDING_PROCEDURE.md` | `bud-brand` (gpt-5.1: nazwy + domena .pl + 6 kolorów + 3 fonty; logo przez generate-image, quality:medium) | zakładka „Twoja marka" → `brand` + `preview_images.logo` |
| **Makieta sklepu/produktu** | fork `spar-image` | `bud-image` (gpt-image-2 1536×1024 medium); widoki `sklep`/`karta_produktu`/`logo`/`lifestyle` | „Makieta sklepu" → `preview_images` |
| **Rekomendacja niszy + walidacja popytu** | fork `spar-raport` (web_search 1:1) | `bud-demand`/`bud-raport` (Responses API gpt-5.5) — wielkość rynku, konkurenci+ceny, sezonowość | „Potencjał rynku" → `market_report`+`demand_validation` |
| **Raport + prognoza + landing** | fork `spar-raport`/`plan`/`economics`/`landing` | `bud-plan` (kamienie po sprzedaży, risk-sharing), `bud-economics` (cena/COGS/AOV/COD/CAC/ROAS), `bud-landing` (2-pass, COD/recenzje WŁ.) | „Twój projekt"/„Czy to zarabia"/„Twoja strona" |

**Spójność ceny:** `business_plan.cena` = cena detaliczna produktu (jednorazowa, NIE zł/mies.) — kotwiczy `economics` ORAZ `landing` (validateHtml wymaga ceny w HTML). Przeprowadzić plan→economics→landing spójnie.

**`bud-landing` — ODWRÓCIĆ prompt:** w Aplikacji prompt WYŁĄCZA reguły e-commerce; tu to JEST sklep — WŁĄCZYĆ ofertę/COD/wysyłkę/recenzje/paletę marki. Zakaz „za pobraniem/24h/magazyn PL" dotyczy landingów OFERT TOMKA — tu generujemy landing SKLEPU KLIENTA (jak Etap 5 z COD przez TakeDrop), więc COD dozwolony. Silnik (2-pass, validateHtml, HERO_VARIANTS, wrapper-podgląd omijający `*.supabase.co`) reuse 1:1.

## 8. Płatność — rezerwacja 500 zł

1. **Nowa oferta:** INSERT do `offers` (nowy uuid, price=500). **Nazwa BEZ „aplikac"/„stworz"** (inaczej matcher Aplikacji w `tpay-webhook` zmapuje ją do `spar_sessions`). Np. „Rezerwacja współpracy — Zbuduję Ci biznes online".
2. **Checkout:** `checkout/v2/index.html` — dodać `AWE_OFFER_ID` + regulamin/zgodę 14 dni (e-com fizyczny) + obsługę `?bid=` → `orders.bud_session_id`.
3. **Matching BEZ ruszania `tpay-webhook`:** webhook zawsze ustawia `orders.status='paid'`+`paid_at`. Sync `paid → bud_sessions.paid_at` robi osobny cron `bud-followups` (paid_sync): szuka `orders.paid` z description = nazwa oferty AWE i `bud_session_id` not null → `bud_sessions.paid_at` + `leads.status='won'`. Wzorzec sprzed real-time syncu Aplikacji.
4. **Odblokowuje:** `paid_at` → faza współpracy. `full_paid_at` (jeśli wprowadzamy) → etap know-how.

## 9. Prompty (single-source)

Rejestr `_shared/bud-prompts.ts` (mirror), panel renderuje z rejestru. **W kodzie (kontrakty):** markery, schema bramki, gate'y, limity. **W settings (głos, bez redeploy):**
- `budowanie_model_biznesowy` — SSOT liczb (500 zł zwrotne, risk-sharing AWE)
- `budowanie_sparing_prompt` (klon przeramowany SaaS→e-com, 6 kamieni e-com) — lub 3 warianty `budowanie_prompt_k1/k2/k3`
- `budowanie_etap_{gate,kierunki,preview_po_kierunku,wspolpraca,rezygnacja}` (+ per-kierunek gate)
- `budowanie_prompt_{brand,demand,raport,plan,economics,gtm,landing}_system` (+ `_critic`)
- `budowanie_{drip,mail,sms}_*`

Backup przed każdą edycją (gate team_members). Walidacja: `_cele`=JSON, `*_sms_*` zawiera `{{LINK}}`. **Gotcha:** instrukcje to module-level `let` (cold-start) — zmiana w settings nie propaguje do ciepłych kontenerów przez kilka minut.

## 10. Panel admina

Fork `tn-aplikacje/`→`tn-crm/zbuduje-leady/` (Tailwind+Geist, jeden plik). `.from('spar_*')`→`bud_*`. Zakładki: Przegląd/Leady/Komunikacja/Koszty/Galeria/Ustawienia/Źródło prawdy. Karta leada (Przegląd/Rozmowa/Artefakty/Baza wiedzy/Sekwencja/Maile/SMS/Płatności/Koszty/Akcje). STAGES: talk/lead/project/green/paid (+resigned/lost) + wymiar **kierunek K1/K2/K3**. Koszty z `bud_usage`+`bud_costs_daily`+`usd_pln_rate`.

## 11. Drip / followupy

Fork 1:1 (REVEAL_PLAN single-source, bramki zaangażowania, anti-burst, cross-channel gap 10h, okno 8-23 PL, idempotentny claim, GSM-safe SMS).
- **`bud-drip`** (cron `5,35`): po zielonym werdykcie seeduje `bud_reveals`, odsłania: marka 0h → nisza/rynek 5h → prognoza 10h → landing 11h (gate panel_visits≥2) → makieta (gate seen_landing). Teksty e-com.
- **`bud-followups`** (cron `*/30`): abandoned (3 maile 3h/24h/48h, GPT pod realny fragment z `bud_messages`), nurture, verdict_no_payment/last_call, paid_welcome, raport/landing_ready, SMS powrotu + **paid_sync** (§8). Cel = rezerwacja 500 zł.
- **Resend:** NIE opierać logiki na `opened_at`/`clicked_at` (bug svix-id, wyłączone) — `delivered_at` + `last_panel_at`/`last_user_at`.

## 12. Plan fazowy

- **F0 — Fundament danych.** Migracja `bud_*` (z live DB), RPC (SECURITY DEFINER), RLS (team_members+owner), trigger, ALTER orders/leads, INSERT oferty 500 zł, `BUD_CRON_SECRET`, szkielet settings. *Gotowe:* schemat istnieje, RLS szczelny, oferta w `offers`.
- **F1 — Szkielet K1 end-to-end (rozmowa→werdykt, bez deliverables).** Fork `bud-chat`+`bud-assess`+`_shared/bud-*`. Router 3 kart (na razie wszystkie→K1). Prompty K1 e-com. Front: prefiks LS `bud_`, endpointy `bud-*`. *Gotowe:* K1 dochodzi do zielonego werdyktu na is_test, lead tworzony, Slack.
- **F2 — Kierunki K2+K3.** Galęzie promptu per `track`, kryteria bramki per kierunek, `product_input` dla K2. *Gotowe:* 3 kierunki niezależnie.
- **F3 — Deliverable wizualny.** `bud-brand` (NOWE) + `bud-image` (fork). Teatr generowania. *Gotowe:* marka+makieta w panelu, koszt w `bud_usage`.
- **F4 — Deliverable analityczny.** `bud-raport`/`plan`/`economics`/`landing` (odwrócony prompt), wrapper `zbuduje/podglad/`, spójność ceny. *Gotowe:* 4 deliverables kompletne, landing z COD.
- **F5 — Panel + read-panel.** `bud-project`/`public-feed`/`go` + panel `zbuduje-leady` + front `zbuduje/projekt/`. *Gotowe:* admin widzi pełen lejek + wymiar kierunku.
- **F6 — Płatność.** `AWE_OFFER_ID` w checkout, `?bid=`, paid_sync. *Gotowe:* rezerwacja 500 zł działa, zero kontaktu z `spar_sessions`.
- **F7 — Drip + followupy + crony.** Pełne sekwencje, 2 crony, prompty maili/SMS. *Gotowe:* odsłony + powroty + paid_sync.
- **F8 — Hardening + go-live.** Audyt RLS (advisors), owner-gate, is_test heurystyka, strony marketingowe, podpięcie `/zapisy`→`/zbuduje/sparing/`. *Gotowe:* lejek żywy.

## 13. Ryzyka i gotchas

- **RLS współdzielony** — `authenticated`≠admin; ZAKAZ `USING(true)` na `bud_*`; `bud_messages` bez klient-SELECT; GRANT kolumnowy.
- **localStorage prefix `bud_*`** — ta sama domena co Aplikacja, inaczej workspace/konto się mieszają.
- **Renderery zduplikowane** — `kartaGridHTML`/`bizplanHTML`/`econCalc`/`planSimHTML` w `sparing/` i `projekt/` — zmiana w obu.
- **Każdy nowy marker** → HIDDEN_MARKS + `visibleText()` regex + parser + renderer + finale streamReply + appendMessage + resume; pominięcie = wyciek do dymka.
- **`tpay-webhook` NIE RUSZAĆ** — matching przez paid_sync; nazwa oferty bez „aplikac/stworz".
- **Migracja PRZED pushem** — select nowej kolumny przed ALTER = PostgREST 500 na całe query.
- **leads CHECK += 'budowanie'** PRZED pierwszym werdyktem.
- **Deploy ZAWSZE `--no-verify-jwt`**; po deployu sprawdź 200.
- **Render API obrazów: `resize=contain`** — samo width tnie boki.
- **`generate-image` quality:medium** (`high` pada na bramce 150s); auth `x-cron-secret`, NIE Bearer.
- **Polskie znaki w regex** — NIE replace globalnie `ze`/`sa`/`moze`.
- **Literal `</script>` w stringu** — splituj tag w generatorach.
- **`*.supabase.co` serwuje HTML jako text/plain** — landing tylko przez wrapper `zbuduje/podglad/` (sandbox bez allow-same-origin → ZAKAZ localStorage w generowanym HTML; validateHtml to łapie).
- **OpenAI blipy 429/5xx** — `openaiFetchRetry` (3×) + auto-retry kafla.
- **`parseProjekt` bierze OSTATNI marker** — ucięty `</projekt>` = null; trzymać max tokens 3000/5000.
- **inline onclick NIE działa** (IIFE) — addEventListener + delegacja `[data-*]`.
- **startFresh() MUSI wołać resetStageState()**.
- **`spar_reveals`/`showcase`/`hidden_from_feed` brak w plikach** — DDL z live.
- **Confirm email = OFF** w Supabase (email+hasło bez OTP).
- **computeLeadValue base** — zweryfikować pod rezerwację 500 zł (steruje value-based Ads).

## 14. Otwarte decyzje do potwierdzenia

1. **Prototyp** — (a) klikalny SKLEP (witryna→produkt→koszyk) jako demo, czy (b) wyłączyć i zastąpić mocniejszą makietą sklepu. Jeśli (b) — `complete` w `bud-public-feed`/`bud-project` na landing+makieta.
2. **Pełna płatność i etap know-how** — czy AWE ma drugą bramkę (full_paid_at→spowiednik) jak Aplikacja, czy rezerwacja 500 zł kończy lejek AI a dalej Tomek ręcznie?
3. **Model finansowy w prognozie** — jakie konkretne liczby risk-sharing AWE do `budowanie_model_biznesowy` (SSOT)?
4. **3 prompty per kierunek vs jeden z sekcjami** — taniej utrzymać (1) czy czystsze galęzienie (3)?
5. **Slack** — nowy kanał `#zbuduje` czy `#sparing` z prefiksem `[AWE]`?
6. **Inspiracje** — galeria od startu czy odłożyć?
7. **Domena .pl w `bud-brand`** — auto-sprawdzanie (RDAP/whois) czy tylko sugestia nazwy?
8. **`/zapisy` jako wejście** — rozszerzyć formularz o ekran 3 kierunków i przekierować do sparingu, czy `/zapisy` zostaje lead-only a router żyje w sparingu?

---
*Najkrótsza ścieżka do działającego szkieletu: F0→F1 (K1 do zielonego werdyktu), potem kierunki, deliverables, płatność, drip.*
