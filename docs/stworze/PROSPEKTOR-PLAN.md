# PROSPEKTOR — outbound fabryki aplikacji (moduł TN App)

> Wersja: 1.2 (2026-07-23 rano). Status: **WDROŻONE — LIVE**.
> Właściciel decyzji: Tomek. Decyzje podjęte autonomicznie w nocy oznaczono [DECYZJA-NOC] — do retro-akceptacji.

## 0. STAN WDROŻENIA (prawda, 2026-07-23)

- [x] Migracja `20260722t_wfp_prospektor.sql` ZASTOSOWANA (4 tabele wfp_* + RLS team, RPC
  `wfp_kpi()`, 16 wertykali seed, 4 prompty + `wfp_daily_cap` w settings, leads constraint
  +'prospektor'). Aplikacja/re-aplikacja: `node scripts/apply-wfp-prospektor.mjs` (idempotentne).
- [x] Edge `wfp-engine` LIVE (deploy: `npm run deploy:wfp-engine`); `lead-upsert` zredeployowany
  ('prospektor' pomija automatyzację lead_created; nowy script `deploy:lead-upsert`).
- [x] Panel `crm.tomekniedzwiecki.pl/tn-app/prospektor` LIVE (sidebar + rewrite).
- [x] `npm run test:webhooks` 4/4 OK (tpay nietknięty).
- [x] E2E na produkcji 13/13 PASS (pełny cykl: research→idea→mail→gmail_draft→statusy→opt-out→
  gate'y 401/409; koszt cyklu AI ~0,38 USD ≈ 1,55 zł/firmę). Draft testowy trafił do Gmaila
  (claude3@) — dowód działania toru draftów.
- [x] Weryfikacja wizualna (desktop+mobile) + pętla poprawek: fix pustego ekranu na init,
  responsywny Import, przycisk „Usuń rekord" (chroni suppression — opt-out nieusuwalny z UI),
  auto-wysokość noty saturacji. Re-weryfikacja 4/4 PASS.
- Znane drobiazgi (świadomie zostawione): koszt AI w KPI liczy też usage testów (kronika kosztów,
  ~0,38 USD startowe); podświetlenie aktywnej pozycji sidebara = pre-existing w shared-sidebar
  (dotyczy wszystkich stron tn-app); threading 2. kontaktu w wątku Gmaila = przyszłość
  (pole `reply_thread_hex` gotowe).

## 1. Cel i koncepcja

Odwrócony lejek fabryki aplikacji: zamiast czekać na inbound (ads → /aplikacja → sparing),
sami znajdujemy firmy/ekspertów z branż o wysokim potencjale na vertical SaaS, AI bada firmę
i branżę, generuje KONKRETNY pomysł aplikacji (zgodny z bramką potencjału sparingu) oraz
hiper-dopasowany pierwszy kontakt (mail + LinkedIn). Tomek akceptuje każdą wiadomość ręcznie.

**Mail nie sprzedaje 12 500 zł — ma zasłużyć na jedną odpowiedź.** Pomysł z outboundu = seed
sparingu (przy pozytywnej odpowiedzi rozmowa startuje od gotowego pomysłu, nie od pustej kartki).

### Fundamenty z analizy (2026-07-22, 3 raporty: recon repo / prawo+rynek / strategia Opus)
1. **Prawo (PKE art. 398, obowiązuje od 11.2024):** cold mail „partnerski" to nadal informacja
   handlowa (promuje wizerunek/usługi pośrednio). Wbudowana zgodność: 1. kontakt = neutralne,
   krótkie pytanie BEZ oferty/cen/linków; stopka z tożsamością nadawcy, źródłem danych,
   klauzulą RODO i opt-outem; suppression list; preferencja adresów ogólnych (biuro@);
   tor LinkedIn jako kanał niższego ryzyka. Świadome zarządzanie ryzykiem, nie „zielone światło".
2. **Scam-radar:** lęk #1 leadów = scam. Mail: bez romantyzmu partnerstwa, bez „70 mln"
   (zakaz sumowania), bez obietnic; konkret + jeden weryfikowalny dowód + sygnał
   „jest wkład i ryzyko po obu stronach". Zakaz claimu „przebadaliśmy X firm" (kłamstwo).
3. **Staged reveal:** 1. mail bez linku i bez modelu finansowego → 2. kontakt (po odpowiedzi)
   przedstawia model współpracy wg SSOT (`settings.aplikacja_model_biznesowy`) → ceny na rozmowie.
4. **Anty-saturacja:** generator pomysłu MUSI sprawdzać konkurencję (web_search) i blokować
   „kolejne Booksy". Kategorie rezerwacji beauty/fitness = odrzucone na starcie.
5. **Wyłączność wertykalu:** rejestr branż ze statusem; wertykal „zajęty" blokuje nowe pomysły.
   [DECYZJA-NOC] wyłączność = cała branża w PL (model: Tomek prowadzi 1 instancję wertykalu).
6. **Human-in-the-loop TWARDY:** system NIGDY nie wysyła. Jedyne wyjście = draft w Gmailu
   (istniejąca fn `gmail-create-draft`) po jawnej akceptacji Tomka w kolejce review.
7. **Ekonomia:** koszt AI ~0,1–0,5 zł/firmę = pomijalny; wąskie gardło = czas Tomka
   i deliverability. Narzędzie optymalizuje JAKOŚĆ na godzinę Tomka, nie masówkę.
   Scenariusz bazowy: ~500 maili / 1 deal (12 500 zł + 10%).
8. **Targeting:** persona „ekspert z niedosytem" (solo-ekspert, mały właściciel usługowy,
   sfrustrowany nr 2) — NIE zapracowany właściciel prosperującego MŚP, NIE korpo-dyrektor.

## 2. Model danych (migracja `20260722t_wfp_prospektor.sql`)

Prefiks `wfp_` (workflow fabryki — prospecting). RLS na WSZYSTKICH tabelach:
`FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM team_members tm WHERE tm.user_id = auth.uid()))`
`WITH CHECK` identyczny. ZERO polityk anon. (Wzorzec wfa_foundation.)

### `wfp_verticals` — rejestr wertykali + wyłączność
```
id uuid PK DEFAULT gen_random_uuid(), created_at timestamptz DEFAULT now(),
key text UNIQUE NOT NULL,          -- slug np. 'warsztaty-samochodowe'
name text NOT NULL,
status text NOT NULL CHECK (status IN ('otwarty','w_grze','zajety','odrzucony')) DEFAULT 'otwarty',
saturation_note text,              -- uzasadnienie odrzucenia / notatka o konkurencji
idea_seed jsonb,                   -- kanoniczny pomysł dla wertykalu (opcjonalny cache)
notes text
```
Statusy: `otwarty` (wolno prospectować) · `w_grze` (aktywna rozmowa — ostrożnie z nowymi wysyłkami,
UI ostrzega) · `zajety` (deal/sparing — generator pomysłów BLOKUJE, 409) · `odrzucony` (saturacja).

Seed ~15 wertykali (z analizy strategicznej): warsztaty samochodowe, fizjoterapia, instalatorzy
PV/pomp ciepła, firmy sprzątające B2B, fotografowie ślubni, ekipy remontowe, szkółki sportowe
dzieci, przedszkola prywatne, wypożyczalnie sprzętu, zakłady pogrzebowe, studia tatuażu,
utrzymanie zieleni, firmy szkoleniowe, małe kancelarie, catering dietetyczny (nota: częściowa
saturacja). PLUS `beauty-salony` ze statusem `odrzucony` + saturation_note „Booksy — zabetonowane".

### `wfp_prospects` — firmy/prospekty
```
id uuid PK DEFAULT gen_random_uuid(), created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(),
company_name text NOT NULL,
www text, email text, phone text, nip text, city text, region text,
contact_person text, contact_role text, linkedin_url text,
vertical_id uuid REFERENCES wfp_verticals(id) ON DELETE SET NULL,
source text NOT NULL CHECK (source IN ('manual','csv')) DEFAULT 'manual',
status text NOT NULL CHECK (status IN ('nowy','research','pomysl','mail_gotowy','zaakceptowany',
  'wyslany','odpowiedzial','rozmowa','sparing','deal','odpadl','opt_out')) DEFAULT 'nowy',
score integer,                     -- 0-100 fit (z researchu)
score_reason text,
research jsonb,                    -- profil firmy+branży (AI, patrz §3 research)
idea jsonb,                        -- pomysł aplikacji (AI, seed sparingu)
mail jsonb,                        -- {temat,tresc,temat_alt,tresc_alt,linkedin_invite,linkedin_message,drugi_kontakt:{temat,tresc}}
reply_note text, replied_at timestamptz,
reply_sentiment text CHECK (reply_sentiment IN ('pozytywna','neutralna','negatywna')),
reply_thread_hex text,             -- Gmail thread id odpowiedzi (na przyszłość: threading 2. kontaktu)
sent_channel text CHECK (sent_channel IN ('mail','linkedin')),   -- kanał 1. kontaktu (przy 'wyslany')
opted_out boolean NOT NULL DEFAULT false, opted_out_at timestamptz,
gmail_draft_at timestamptz,
lead_id uuid,                      -- po utworzeniu leada w CRM
notes text,
is_test boolean NOT NULL DEFAULT false
```
Dedup (suppression + anty-duplikaty):
```
UNIQUE INDEX ON (nip) WHERE nip IS NOT NULL AND nip <> '';
UNIQUE INDEX ON (lower(email)) WHERE email IS NOT NULL AND email <> '';
UNIQUE INDEX ON (lower(www)) WHERE www IS NOT NULL AND www <> '';   -- www normalizowane w JS przy imporcie (bez protokołu/www./trailing slash)
UNIQUE INDEX ON (lower(linkedin_url)) WHERE linkedin_url IS NOT NULL AND linkedin_url <> '';  -- suppression także dla prospektów LinkedIn-only
INDEX ON (status); INDEX ON (vertical_id);
```
Trigger `updated_at = now()` na UPDATE (prosta funkcja).

**Opt-out = suppression:** rekord z `opted_out=true` NIGDY nie wraca do pipeline'u (UI blokuje
akcje AI/draft; import dedupem nie ożywi — email/nip unique). Usunięcie danych na żądanie
(RODO): kasujemy rekord ręcznie, zostaje wpis w `wfp_events` bez danych osobowych.

### `wfp_events` — kronika per prospect
```
id bigint GENERATED ALWAYS AS IDENTITY PK, prospect_id uuid REFERENCES wfp_prospects(id) ON DELETE CASCADE,
created_at timestamptz DEFAULT now(), actor text NOT NULL CHECK (actor IN ('admin','ai','auto')),
kind text NOT NULL,                -- 'created','research','idea','mail','accepted','gmail_draft','reply','status','opt_out','lead','note'
description text, payload jsonb DEFAULT '{}'
```

### `wfp_usage` — koszty AI (wzorzec spar_usage)
```
id bigint GENERATED ALWAYS AS IDENTITY PK, prospect_id uuid,   -- luźno, bez FK (rekord może zniknąć)
kind text NOT NULL CHECK (kind IN ('research','idea','mail')),
model text, input_tokens integer, output_tokens integer, cost_usd numeric(10,4),
meta jsonb DEFAULT '{}', created_at timestamptz DEFAULT now()
```

### Zmiany w istniejących
- `leads_lead_source_check` → poszerzyć o `'prospektor'` (DROP CONSTRAINT IF EXISTS + ADD,
  pełna lista: website, outreach, manual, stworze, budowanie, prospektor).
- **`lead-upsert/index.ts`** — dopisać `'prospektor'` do warunku POMIJAJĄCEGO automatyzację
  `lead_created` (obok 'budowanie' i 'stworze', ~linia 203). KRYTYCZNE: bez tego utworzenie leada
  z Prospektora wyśle prospektowi generyczny mail powitalny „Potwierdzenie zapisu" — katastrofa
  wizerunkowa w reżimie ostrożnego outboundu. Wymaga redeployu `lead-upsert`.
- Lead z panelu tworzymy WYŁĄCZNIE przez `functions/v1/lead-upsert` (dedup po email + revive),
  NIGDY raw INSERT (leads NIE MA unique na email — raw INSERT tworzy duplikaty).
- RPC agregujące (SECURITY INVOKER, działa pod RLS, GRANT EXECUTE TO authenticated):
  `wfp_kpi()` zwraca jsonb: `{costs: {total_usd, per_kind:{research,idea,mail}}, counts_per_status,
  counts_per_vertical, reply_per_vertical}` — KPI liczone po stronie DB (PostgREST tnie do 1000
  wierszy — sumowanie client-side po cichu zaniża wyniki).

### Seed `settings` (INSERT ... ON CONFLICT (key) DO NOTHING)
- `wfp_prompt_research` — system prompt researchu (patrz §4)
- `wfp_prompt_idea` — system prompt pomysłu (patrz §4)
- `wfp_prompt_mail` — system prompt maila (patrz §4)
- `wfp_stopka_prawna` — szablon stopki doklejanej SERWEROWO (WYŁĄCZNIE w akcji `gmail_draft`,
  patrz §3 — nigdy w `mail`, nigdy do textarea edycji). Wymagana treść (art. 14 RODO, zwięźle):
  tożsamość nadawcy (imię i nazwisko, firma — BEZ klikalnych URL w 1. mailu!), źródło danych:
  „Państwa dane (nazwa firmy, adres e-mail) pozyskałem z publicznie dostępnych źródeł (strona
  internetowa firmy / rejestry publiczne)", administrator danych, cel: nawiązanie współpracy B2B,
  podstawa: uzasadniony interes (art. 6 ust. 1 lit. f RODO), prawa: dostęp/sprostowanie/usunięcie/
  sprzeciw, prawo skargi do PUODO, retencja: do sprzeciwu lub 12 mies., opt-out: „Jeśli nie chcesz,
  abym pisał ponownie — odpisz »STOP«, usuwam z listy natychmiast." Placeholder `{{DANE_NADAWCY}}`
  z `settings.aplikacja_wykonawca_dane` (sam podpis tekstowy, bez linków).

## 3. Edge function `wfp-engine` (jedna funkcja, action-based)

Deploy: `--no-verify-jwt` + WŁASNA bramka: `verifyTeamMember` (wzorzec `_shared/admin-files.ts`) —
każde wywołanie wymaga `Authorization: Bearer <JWT sesji>` członka team_members; inaczej 401/403.
CORS: `crm.tomekniedzwiecki.pl`, `tn-crm.vercel.app`, `localhost` (dev). Service-role client do DB.
Model: `Deno.env.get('WFP_OPENAI_MODEL') || Deno.env.get('SPAR_OPENAI_MODEL') || 'gpt-5.6-sol'`.
Koszty → `wfp_usage` (cennik jak spar-assess: gpt-5.6-sol {i:5, c:0.5, o:30}/MTok, web_search $0.01/call).
Helper retry: `_shared/openai-fetch.ts`. Wall-clock edge = 330 s — pojedyncza akcja mieści się
(research ≤ ~120 s, miękko — max_tool_calls bywa ignorowany), ŻADNA akcja nie robi pętli po wielu
prospektach (batch = pętla we froncie).

**Zasady przekrojowe (obowiązują KAŻDĄ akcję):**
- **Limit dzienny AI [K3]:** przed akcją AI licz `wfp_usage` z ostatnich 24 h; cap z
  `settings.wfp_daily_cap` (seed: 300). Przekroczony → 409 `dzienny_limit`. Chroni WSPÓLNĄ quota
  OpenAI (insufficient_quota = wszystkie lejki DOWN). Batch front-side respektuje (stop + toast).
- **Statusy advance-only [W1]:** ranga `nowy<research<pomysl<mail_gotowy<zaakceptowany<wyslany<
  odpowiedzial<rozmowa<sparing<deal`; akcja awansuje status TYLKO w górę (dane research/idea/mail
  wolno nadpisać przy ponownym uruchomieniu, status nie cofa się). `opt_out` i `odpadl` nadrzędne —
  blokują akcje AI/draft (409 `opted_out` / dozwolone tylko ręczne przywrócenie statusu `odpadl` w UI).
- **Idempotencja [W2]:** event tego samego kind < 10 s temu → 409 `zbyt_szybko`; front blokuje
  przyciski danego prospekta na czas akcji.
- **Anty prompt-injection [W4]:** treści z web_search = DANE, nie instrukcje (zapis w promptach);
  serwer po `mail` WYCINA URL-e z `tresc`/`tresc_alt` (regex `https?://` + `www\.`) — jednocześnie
  egzekwuje regułę „pierwszy mail bez linków". Walidacja kształtu JSON każdej odpowiedzi AI
  (wzorzec `saneOcena()` ze spar-assess); brak wymaganych pól → 502 z komunikatem, bez zapisu.

### Akcje (`POST {action, prospectId?, ...}`)

**`research`** — Responses API + `web_search` (max_tool_calls 6, reasoning effort low,
max_output_tokens 6000). Wejście promptu budowane WYŁĄCZNIE z danych TEGO prospekta
(izolacja rekordu — lekcja „Radar: rekordy SKAŻONE"). Output JSON:
```
{ profil: {czym_sie_zajmuje, skala_szac, uslugi[], wyroznik, sygnaly_digitalizacji},
  branza: {bol_operacyjny[], istniejacy_software[], nasycenie: 'niskie'|'srednie'|'wysokie', uzasadnienie},
  osoby: {decydent?, rola?, linkedin?},
  score: 0-100, score_reason,        -- fit do persony operatora (mała firma/ekspert > korpo)
  zrodla: [url] }
```
Zapis: `research`, `score`, `score_reason`; status `nowy`→`research`; event; usage.
Gate: `opted_out` → 409. Extract JSON wzorcem `extractJson()` ze spar-assess + walidacja pól.

**`idea`** — wymaga `research` ORAZ `vertical_id` niepustego (NULL → 409 `brak_wertykalu` —
inaczej governance wyłączności jest omijane) [W5]. Gate wertykalu: jeśli `vertical.status='zajety'`
→ 409 `wertykal_zajety`; `odrzucony` → 409 `wertykal_odrzucony`. Responses API + web_search
(max_tool_calls 4) — weryfikacja konkurencji kandydata pomysłu. Output JSON:
```
{ nazwa_robocza, problem, rozwiazanie_rdzen,      -- JEDNA funkcja główna (zasada prostoty sparingu)
  dla_kogo, platnik, model_cenowy_szac,
  wedge_vs_konkurencja,
  saturacja: {werdykt:'ok'|'ryzyko'|'zablokowane', konkurenci[], uzasadnienie},
  potencjal_50: {ocena:'realny'|'trudny'|'nierealny', uzasadnienie} }
```
Zapis `idea`; status→`pomysl` TYLKO gdy `saturacja.werdykt != 'zablokowane'` (przy `zablokowane`
zapisujemy idea + event ostrzegawczy, status zostaje `research`; UI pokazuje czerwoną kartę
i proponuje zmianę wertykalu). Event; usage.

**`mail`** — wymaga `idea` (i saturacja != zablokowane). Chat Completions,
`response_format: json_object`, `reasoning_effort: 'low'` (TOP-LEVEL — kształt Chat Completions
jak spar-plan; NIE `reasoning:{effort}`, to Responses API) [N5], max_completion_tokens 5000
(zapas na reasoning — lekcja spar-plan 502). System prompt = `wfp_prompt_mail`. Kontekst:
research + idea + (dla `drugi_kontakt`) MODEL_BLOCK z `settings.aplikacja_model_biznesowy`. Output JSON:
```
{ temat, tresc, temat_alt, tresc_alt,             -- wariant 1. kontaktu (neutralny) + alternatywa
  linkedin_invite,                                 -- ≤280 znaków, zaproszenie z uzasadnieniem
  linkedin_message,                                -- wiadomość po akceptacji zaproszenia
  drugi_kontakt: {temat, tresc} }                  -- po odpowiedzi: model współpracy wg SSOT
```
**[K1] `mail` NIE dokleja stopki.** `tresc`/`tresc_alt` zapisywane BEZ stopki (to pola edytowalne
przez Tomka w UI). Serwer wycina URL-e (patrz zasady przekrojowe). Odpowiedź akcji zawiera
dodatkowo `stopka_preview` (złożona stopka z podstawionym `{{DANE_NADAWCY}}`) do read-only
podglądu w UI [N6]. Zapis `mail`; status→`mail_gotowy`; event; usage.

**`gmail_draft`** — wymaga `mail` + `email` niepustego + `opted_out=false`. Body:
`{prospectId, variant: 'first'|'second', temat?, tresc?}` — nadpisane temat/tresc (edycje Tomka
z UI) zapisywane też do `mail` jsonb. **[K1] TO JEDYNE miejsce doklejania stopki:** dla
`variant:'first'` body maila = `tresc` + `\n\n` + złożona `wfp_stopka_prawna`; dla
`variant:'second'` (drugi kontakt — idzie w wątku odpowiedzi) stopki NIE doklejamy.
Guard [W2]: `variant:'first'` przy `gmail_draft_at IS NOT NULL` → 409 `juz_utworzony`
(chyba że `force:true`). Woła `gmail-create-draft` (functions/v1, server-to-server) z `to=email`,
`subject`, `body`. Sukces (first) → `gmail_draft_at=now()`, status→`zaakceptowany`, event.
**To jedyna droga wyjścia wiadomości z systemu — draft w Gmailu; wysyła wyłącznie Tomek ręcznie.**

**`save_setting`** — `{key, value}`, TYLKO klucze z whitelisty `wfp_prompt_research|wfp_prompt_idea|
wfp_prompt_mail|wfp_stopka_prawna`. [W7] Min-length: prompty ≥ 200 zn., stopka ≥ 120 zn. → inaczej
400. Stopka dodatkowo MUSI zawierać `STOP` i `RODO` (guard przed cichym usunięciem klauzul) → 400.
Backup PRZED zapisem: `INSERT settings ('<key>_backup_' + RRRRMMDDHHMMSS, stara_wartość)`
(timestamp do sekund — wielokrotne edycje tego samego dnia zachowują historię; wzorzec
spar-admin-settings).

**`status_change`** — `{prospectId, status, channel?}` — ręczne przejścia (wyslany/rozmowa/sparing/
deal/odpadl/przywrócenie z odpadl). Przy `wyslany` wymagany `channel: 'mail'|'linkedin'` → zapis
`sent_channel` + event z kanałem [N3]. **Auto-awans wertykalu [W5]:** pierwszy `wyslany`
w wertykalu → `vertical.status='w_grze'` (jeśli był `otwarty`) + event; `deal` →
`vertical.status='zajety'` + event. Opt-out: `{prospectId, optOut:true}` → opted_out, status,
event (nieodwracalne z UI).

### Błędy
Zwracaj `{error: kod, message}` z sensownym HTTP (400/401/403/409/500). Front pokazuje toast.
Retry na 429/5xx OpenAI przez openaiFetchRetry. Nigdy cicho.

## 4. Prompty (settings; twarde wytyczne treści)

Wspólne: język polski, poprawne diakrytyki. Wszystkie prompty edytowalne w UI (Ustawienia).

**`wfp_prompt_research`:** rola analityka. Badasz JEDNĄ konkretną firmę (dane w input) + jej
branżę w Polsce. TYLKO fakty znalezione w web_search — zakaz zmyślania; brak danych = null.
Szukaj: strona firmy, oferta, opinie, skala; ból operacyjny branży; istniejący software dla tej
branży w PL (nazwy!); czy istnieje silny lider (Booksy-problem). Score 0-100 = fit do persony
operatora: mała firma/solo-ekspert wysoko, korpo/sieciówka nisko; obecność widocznego
właściciela-eksperta podnosi. Output = czysty JSON wg schematu.

**`wfp_prompt_idea`:** rola stratega vertical SaaS fabryki aplikacji. Na bazie researchu wymyśl
JEDEN pomysł aplikacji dla tej branży: WEDGE, nie kategoria („kolejny system rezerwacji" =
odrzuć). Zasada prostoty jak w sparingu: jedna rdzeniowa funkcja, produkt sprzedawalny INNYM
firmom z branży w modelu abonamentowym, realna droga do 50 płacących klientów w PL. BRAMKA
ANTY-SATURACJI: sprawdź web_search czy istnieje dominujący gracz dla tego dokładnie problemu;
jeśli tak → werdykt 'zablokowane' + wskaż konkurentów; niszowi/częściowi gracze → 'ryzyko'
+ wskaż wedge. Pomysł ma przejść bramkę potencjału sparingu (będzie seedem rozmowy).

**`wfp_prompt_mail`:** rola: piszesz PIERWSZY kontakt w imieniu Tomka (Tomasz Niedźwiecki).
Cel maila: JEDNA odpowiedź, nie sprzedaż. Twarde zasady:
- ≤120 słów treści, plain text, temat 2-6 słów bez CAPS, ludzki („Pytanie o [konkret branżowy]").
- Struktura: (1) personalizowany haczyk — konkret o ICH firmie z researchu (dowód, że to nie
  masówka); (2) zaobserwowana luka/ból branży — insight, NIE blueprint pomysłu; (3) kim jestem —
  jedno zdanie, jeden weryfikowalny fakt (buduję aplikacje i rozkręcam je sprzedażowo; ZAKAZ
  sumowania „70 mln", ZAKAZ wymieniania nazw innych firm-klientów); (4) sygnał współpracy bez
  romantyzmu: szukam osoby z branży do wspólnego projektu — jest praca i wkład po obu stronach;
  (5) miękkie CTA-pytanie: „Czy ten problem to u Was codzienność? Wystarczy jedno zdanie."
- ZAKAZY: ceny, „partnerstwo life-changing", obietnice zarobków, „przebadaliśmy X firm",
  linki, załączniki, CAPS, wykrzykniki, AI-poetic (zakazy frazowe jak w fabryce landingów),
  język ofertowy („oferujemy", „nasza oferta"). NIE brzmieć jak rekrutacja/etat.
- Wariant alt: inny haczyk/kąt, te same zasady.
- `linkedin_invite` ≤280 znaków: konkret branżowy + kim jestem, bez sprzedaży.
- `linkedin_message`: wersja maila skrócona, bez stopki.
- `drugi_kontakt` (po odpowiedzi): przedstawia model współpracy UCZCIWIE wg MODEL_BLOCK
  (Tomek buduje i osobiście rozkręca sprzedaż do 50 klientów, potem przekazuje stery, 10%;
  wkład klienta = wiedza branżowa + gotowość prowadzenia po przejęciu; bez kwot — kwoty na
  rozmowie), proponuje 15-min rozmowę. Nadal bez przymiotnikowego lania wody.

## 5. Frontend `tn-app/prospektor.html`

Wzorzec: `tn-app/index.html` (head, Tailwind CDN 3.4.17, supabase-js 2.91.0 unpkg pin, Phosphor,
`components/shared-sidebar.js`, checkAuth() z weryfikacją serwerową, styl Geist/Vercel — czarne
tła, akcent #0070f3). Jedna funkcja `esc()`/`escapeHtml()` do escapowania WSZYSTKICH wartości
z bazy (XSS). **[W3] Helper `safeUrl(u)`**: zwraca `u` tylko gdy `/^https?:\/\//i.test(u)`,
inaczej `'#'` — WSZYSTKIE linki (`zrodla`, `linkedin_url`, `www`) przez safeUrl +
`rel="noopener noreferrer" target="_blank"` (escapeHtml nie chroni przed `javascript:` w href).
Toasty błędów — zero cichych. Paginacja `.range()` po 1000 przy odczycie prospektów (wzorzec
fetchAllSteps). KPI przez RPC `wfp_kpi()` — NIE sumować client-side [W6].

### Układ: 5 tabów (Pipeline · Akceptacja · Wertykale · Import · Ustawienia)

**Pipeline (domyślny):**
- Pasek KPI (z RPC `wfp_kpi()`): liczniki per status (nowy/research/pomysł/do akceptacji/wysłane/
  odpowiedzi/rozmowy/deale), suma kosztów AI (USD→PLN po kursie `settings.usd_pln_rate` fallback
  4.0), reply-rate (odpowiedzial+dalej / wyslany+dalej), reply-rate per wertykal [N2], aging
  (prospekty w `mail_gotowy` > 3 dni) [N2].
- Filtry: status (multiselect chipy), wertykal (select), szukajka (nazwa/email/miasto), toggle „pokaż opt-out".
- Lista wierszy: firma, wertykal, miasto, status-badge (kolory etapów; zieleń TYLKO deal —
  zasada „zieleń tylko done"), score, koszt AI, data ostatniego zdarzenia. Klik → drawer.
- **Drawer szczegółu** (prawy, szeroki, mobile pełny ekran):
  1. Dane firmy — edytowalne (nazwa, www, email, telefon, NIP, miasto, osoba, rola, LinkedIn URL,
     wertykal-select, notatki). Zapisz.
  2. Akcje AI (przyciski z paskiem stanu i licznikiem sekund):
     „Zbadaj firmę" → research (render: profil, branża, ból, software, score z uzasadnieniem, źródła-linki)
     „Pomysł na aplikację" → idea (karta pomysłu: nazwa robocza, problem→rozwiązanie-rdzeń,
     dla kogo/płatnik/model cenowy, wedge; werdykt saturacji jako duży badge: zielony ok /
     żółty ryzyko / czerwony zablokowane + konkurenci; ocena potencjału 50)
     „Napisz wiadomości" → mail (sekcje niżej)
  3. Wiadomości: mail 1. kontaktu — temat + treść w EDYTOWALNYCH polach (textarea; edycja
     zapisuje się do `mail` jsonb przy akceptacji), przełącznik wariant A/B, podgląd doklejonej
     stopki (read-only, wyraźnie oddzielona); LinkedIn: invite + message z przyciskami „Kopiuj";
     akordeon „Drugi kontakt (po odpowiedzi)" — temat+treść, przycisk „Kopiuj" + osobny przycisk
     „Draft odpowiedzi w Gmailu" (gmail_draft z treścią 2. kontaktu — do użycia GDY odpowiedzą).
  4. Kolejka review: przy statusie `mail_gotowy` widoczne: **„Zatwierdź → draft w Gmailu"**
     (→ engine gmail_draft variant:'first'; po sukcesie status `zaakceptowany`, toast
     „Draft czeka w Gmailu — wyślij ręcznie") oraz „Odrzuć" (status `odpadl` + notatka).
     Po ręcznej wysyłce Tomek klika „Oznacz jako wysłany" → wybór kanału mail/LinkedIn
     (engine status_change z channel) [N3].
  5. Odpowiedź: „Zarejestruj odpowiedź" (sentiment pozytywna/neutralna/negatywna + notatka →
     replied_at, status `odpowiedzial`); przy pozytywnej — przycisk „Utwórz leada w CRM"
     [K2: przez `functions/v1/lead-upsert`, NIE raw INSERT] (payload: email,
     name=contact_person||company_name, company=company_name, lead_source='prospektor',
     notes z pomysłem i linkiem do prospekta; zwrócony lead_id → zapis; status `rozmowa`).
  6. „STOP / opt-out" (wyraźny, czerwony kontur): opted_out=true + opted_out_at + status `opt_out`
     + event. Nieodwracalne z UI (odblokowanie tylko ręcznie w DB — celowo).
  7. Status ręczny: select (rozmowa/sparing/deal/odpadl) — na dole, z eventem.
  8. Historia (wfp_events, od najnowszych).
- **Batch:** checkboxy na liście + przycisk „Przetwórz zaznaczone" — front SEKWENCYJNIE woła
  research→idea→mail per firma (pasek postępu „3/12: NazwaFirmy — pomysł…", stop-przycisk).
  Batch NIGDY nie tworzy draftów Gmail (akceptacja zawsze per sztuka).

**Akceptacja [N1]:** dedykowany widok kolejki review — lista TYLKO `mail_gotowy`, inline:
temat + pełna treść (edytowalna) + read-only stopka + karta pomysłu (skrót) + przyciski
„Zatwierdź → draft" / „Odrzuć" / „Pomiń" bez wchodzenia w drawer. Licznik „X czeka na Ciebie".
To serce codziennej pracy Tomka — ma być przejrzyste przy 50 sztukach.

**Wertykale:** karty (nazwa, status-select, licznik prospektów per status, saturation_note,
notes edytowalne) + „Dodaj wertykal" (key auto-slug z nazwy). Ostrzeżenie przy `w_grze`,
blokada informacyjna przy `zajety`/`odrzucony`.

**Import:** textarea „wklej firmy" — format liniowy `nazwa; www; email; nip; miasto; wertykal`
(separator `;` lub TAB; puste pola OK; nagłówek wykrywany i pomijany). Parser → tabela
podglądu z walidacją (email regex, nip 10 cyfr, www normalizacja: strip protokołu/www./slash)
+ dedup PRZED zapisem (zapytanie o istniejące email/nip/www; duplikaty oznaczone, pomijane).
Wybór wertykalu domyślnego dla partii. Zapis → INSERT batch. Obok: formularz „Dodaj 1 firmę".
Notka o źródłach: CEIDG/GUS/KRS/strony firm — NIE kupować gotowych baz (brak rozliczalnych zgód).

**Ustawienia:** edycja 4 kluczy settings przez engine `save_setting` (textarea + Zapisz + info
o backupie); sekcja „Zasady" (statyczna checklista prawna: PKE art. 398, pierwszy mail neutralny,
opt-out natychmiast, źródło danych w stopce, adresy ogólne preferowane, limity dzienne wysyłki
ręcznej ~20-30/dzień, otwarcia Resend OFF — mierzymy odpowiedzi).

### Nawigacja i routing
- `components/shared-sidebar.js` → `NAV_ITEMS_APP`: `{ id: 'prospektor', icon: 'ph-crosshair-simple', label: 'Prospektor' }` (po „Projekty").
- `vercel.json`: `{ "source": "/tn-app/prospektor", "destination": "/tn-app/prospektor.html" }`.

## 6. Deploy / operacje
- `package.json`: `"deploy:wfp-engine": "npx supabase functions deploy wfp-engine --project-ref yxmavwkwnfuphjqbelws --no-verify-jwt"`.
- Kolejność: migracja (Management API) → deploy edge → `npm run test:webhooks` → git push main (Vercel).
- Sekrety: żadnych nowych (OPENAI_API_KEY, SUPABASE_SERVICE_ROLE_KEY, GMAIL_APP_PASSWORD są).
  Opcjonalny override `WFP_OPENAI_MODEL`.
- Testy E2E: rekord `is_test=true` (Firma testowa) → research → idea → mail → gmail_draft
  (draft na adres testowy claude3@tomekniedzwiecki.pl, NIE do obcej firmy!) → sprzątnięcie.

═══════════════════════════════════════════════════════════════════════════

# CZĘŚĆ II — v2 (2026-07-23, decyzja Tomka): pełny obieg mailowy + wertykale v2

**DECYZJA TOMKA 23.07 (nadpisuje v1):** system WYSYŁA maile przez Resend po akceptacji
w panelu — Tomek nie uczestniczy w wysyłce, tylko akceptuje. Odpowiedzi wpadają do
Prospektora (Resend Inbound), AI je klasyfikuje i przygotowuje propozycje odpowiedzi,
które Tomek akceptuje → wysyłka w wątku. Bramka human-in-the-loop przenosi się
z „wysyłki" na „akceptację": **NIC nie wychodzi bez kliknięcia Tomka** (wyjątek: brak —
nawet obsługa STOP tylko zapisuje opt-out, nie wysyła potwierdzeń). Droga gmail_draft
zostaje jako fallback.

## II.1 Infrastruktura mailowa

- **Adres wysyłkowy:** `settings.wfp_from_email` (docelowo `tomek@kontakt.tomekniedzwiecki.pl`
  — dedykowana subdomena `kontakt.tomekniedzwiecki.pl` w Resend: sending SPF/DKIM + receiving MX,
  DNS przez `vercel dns add`; skrypt `scripts/setup-wfp-domain.mjs`) + `wfp_from_name`
  („Tomasz Niedźwiecki"). Reply-To = ten sam adres → odpowiedzi wracają przez Resend Inbound
  do GLOBALNEGO webhooka `wfa-inbox-webhook`. Fallback przed weryfikacją subdomeny:
  `biuro@tomekniedzwiecki.pl` (zweryfikowana) — przełącznik w settings, zero deployu.
- **Limit wysyłek:** `settings.wfp_send_daily_cap` (seed **25**/dzień — deliverability świeżej
  subdomeny; liczone z `wfp_outbox` 24h) → 409 `limit_wysylek`. Podnosić stopniowo (warm-up).
- **Higiena cold:** wysyłka `text` plain, BEZ sygnatury HTML; nagłówek `List-Unsubscribe`
  (mailto:wfp_from_email z tematem STOP) — wzorzec outreach-send; otwarcia OFF (mierzymy reply).

## II.2 Model danych (migracja `20260723a_wfp_v2.sql`)

- **`wfp_outbox`**: `id uuid PK, prospect_id FK→wfp_prospects ON DELETE SET NULL, kind text
  CHECK ('first','second','reply'), to_email, subject, body text, resend_id text, in_reply_to text,
  status text CHECK ('sent','failed') , error text, created_at`. RLS team. INDEX (prospect_id), (created_at).
- **`wfp_inbox`** (wzorzec wfa_inbox): `id uuid PK, prospect_id FK→wfp_prospects ON DELETE SET NULL,
  resend_id text UNIQUE, message_id text, from_email, from_name, to_email, subject, text_body,
  html_body, attachments jsonb, received_at, classified jsonb, suggested_reply jsonb,
  handled_at timestamptz, created_at`. RLS team.
  `classified` = `{typ:'pozytywna'|'neutralna'|'negatywna'|'ooo'|'opt_out'|'spam', uzasadnienie}` (AI);
  `suggested_reply` = `{temat, tresc, wygenerowano_at}` (AI, edytowalne przy wysyłce).
- **`wfp_verticals` — rozszerzenie (v2):** nowe kolumny `category text, pain text, wedge_hint text,
  priority integer CHECK 1..5, operator_persona text, report jsonb, report_at timestamptz,
  verdict text CHECK ('go','no_go') NULL, vscore integer`. NOWY zestaw statusów:
  `katalogowy → w_badaniu → zbadany → w_prospectingu → w_grze → zajety | odrzucony | wstrzymany`
  (CHECK podmienić; mapowanie starych: `otwarty`→`katalogowy`, reszta bez zmian).
- **Seed katalog ~90 wertykali** (z researchu 23.07, w 13 kategoriach) — UPSERT po `key`:
  nowe wiersze INSERT; istniejące UPDATE (category/pain/wedge_hint/priority/persona/saturation_note).
  KOREKTY z weryfikacji saturacji: `warsztaty-samochodowe`, `fizjoterapia`, `zaklady-pogrzebowe`
  (i inne [zweryf.] wysokie) → status `odrzucony` + saturation_note z nazwami konkurentów
  (żaden nie ma prospektów — bezpieczne). Priority 5: firmy-ppoz, firmy-ddd; priority 4:
  pracownie-protetyczne, kamieniarstwo, asenizacja, zespoly-dj-weselni, cukiernie-torty,
  szkolki-roslin, nadzor-budowlany, serwis-udt, bhp-outsourcing, stolarnia-na-wymiar,
  obozy-kolonie, wynajem-sprzetu-eventowego, pielegnacja-zieleni, kominiarstwo.
- **`wfp_usage.kind`** CHECK + `'reply'` + `'vertical'` + `'classify'`.
- **Settings seed:** `wfp_from_email` (seed `biuro@tomekniedzwiecki.pl` — podmiana po weryfikacji
  subdomeny), `wfp_from_name`, `wfp_send_daily_cap`='25', `wfp_prompt_reply` (propozycje odpowiedzi),
  `wfp_prompt_vertical` (raport branżowy), `wfp_prompt_classify` (klasyfikacja odpowiedzi).
- **RPC `wfp_kpi()`** — dodać: `sent_today` (wfp_outbox 24h), `inbox_unhandled`
  (wfp_inbox handled_at IS NULL AND classified->>'typ' != 'spam').

## II.3 Edge — nowe akcje `wfp-engine`

Wspólne: gate `verifyTeamMember` LUB service-role (Bearer == SERVICE_ROLE_KEY → actor 'auto';
wzorzec isTrustedInternalCall) — service-role dozwolony TYLKO dla `classify_reply` i `reply_suggest`.

- **`send`** `{prospectId, variant:'first'|'second', temat?, tresc?}` — zastępuje gmail_draft jako
  główna droga. Wymogi jak gmail_draft (mail, email, !opted_out) + limit `wfp_send_daily_cap`.
  Kompozycja: first = tresc + stopka (composeStopka); second bez stopki. Wysyłka POST
  api.resend.com/emails `{from: "name <wfp_from_email>", to, reply_to: wfp_from_email, subject,
  text, headers: {List-Unsubscribe}}`. Sukces → INSERT wfp_outbox, status→`wyslany`
  (advance-only), `sent_channel='mail'`, event `sent`. Błąd Resend → outbox status failed + 502.
  Idempotencja: recentEvent('sent') <10s → 409; wysłany first istnieje w outbox → 409
  `juz_wyslany` (chyba że force).
- **`classify_reply`** `{inboxId}` (service-role z webhooka lub team z UI) — Chat Completions
  (prompt `wfp_prompt_classify`): klasyfikacja typu + wykrycie sprzeciwu. Zapis `classified`.
  `opt_out` → AUTOMATYCZNIE opted_out prospekta (wymóg prawny: sprzeciw realizowany natychmiast;
  jedyny automat bez kliku — niczego nie wysyła). Pozytywna/neutralna → od razu wywołaj
  wewnętrznie logikę reply_suggest (jedna inwokacja). Event `reply_classified`.
- **`reply_suggest`** `{inboxId, force?}` — AI propozycja odpowiedzi: kontekst = wątek
  (wfp_outbox+wfp_inbox tego prospekta chronologicznie) + research + idea + MODEL_BLOCK
  (`aplikacja_model_biznesowy`) + prompt `wfp_prompt_reply`. Zasady: po polsku, styl Tomka
  (1-3 krótkie akapity), uczciwie wg SSOT, bez kwot w 1. odpowiedzi (kwoty na rozmowie),
  cel = umówić 15-min rozmowę; przy negatywnej — krótkie podziękowanie. Zapis `suggested_reply`.
- **`reply_send`** `{inboxId, temat?, tresc?}` (TYLKO team — to jest klik akceptacji Tomka) —
  wysyła w wątku: `In-Reply-To`/`References` = wfp_inbox.message_id, from/reply_to jak send,
  subject = `Re: ...`. Sukces → INSERT wfp_outbox kind 'reply', `handled_at=now()`, event.
  Limit dzienny wysyłek obowiązuje.
- **`vertical_research`** `{verticalId}` — Responses API + web_search (max_tool_calls 8,
  max_output_tokens 8000; prompt `wfp_prompt_vertical`): raport 8 sekcji (rynek PL/decydent/ból/
  konkurencja software z NAZWAMI/regulacje/wedge+ekonomia/persona+gdzie szukać/WERDYKT go|no_go
  + score 0-24 wg 6 osi: fragmentacja×2, saturacja×3, ból×2, willingness×2, persona×2, wedge×1;
  twarde bramki NO_GO: dedykowany lider / rynek <2000 firm / brak persony / rdzeń=system rządowy).
  Zapis report/report_at/verdict/vscore; status: katalogowy|wstrzymany|odrzucony → `zbadany`
  (w_badaniu ustawiane na czas trwania). Usage kind 'vertical'. Koszt ~0,3-0,5 USD.
- **Gate wysyłki wg wertykalu:** `send` variant first wymaga `vertical.status='w_prospectingu'`
  → inaczej 409 `wertykal_nie_w_prospectingu` (bramka GO: przejście `zbadany→w_prospectingu`
  robi człowiek w UI po werdykcie). `reply_send`/`second` — bez tej bramki (rozmowa już trwa).
  Auto-awans v2: prospekt `sparing` → wertykal `w_grze`; `deal` → `zajety` (stary awans
  wyslany→w_grze USUNĄĆ).

## II.4 Inbound routing (`wfa-inbox-webhook` — modyfikacja)

W bloku match (przed match wfa_projects): jeśli `toEmail` == `settings.wfp_from_email`
(case-insensitive; cache w module) → tor Prospektora:
1. INSERT `wfp_inbox` (upsert po resend_id, ignoreDuplicates — retry-safe); match prospekta
   po `lower(from_email)` w wfp_prospects (brak → prospect_id NULL, do ręcznego przypisania w UI).
2. Prospekt zmatchowany: `replied_at=now()` (jeśli NULL), status→`odpowiedzial` (advance-only,
   nie cofa rozmowa/sparing), event `reply`.
3. Fire-and-forget (EdgeRuntime.waitUntil): POST wfp-engine `{action:'classify_reply', inboxId}`
   z Bearer SERVICE_ROLE + POST slack-notify `{type:'wfp_reply', data:{firma, od, temat, snippet}}`
   (nowy case w slack-notify → webhook #sparing; błąd Slacka nie wywraca).
4. `return` — mail NIE trafia do wfa_inbox (to nie skrzynka aplikacji).
Loop-guard: `from_email == wfp_from_email` → ignore (nie odpowiadamy sami sobie).

## II.5 Frontend v2

- **Akceptacja:** główny przycisk = **„Zatwierdź i WYŚLIJ"** (action send, confirm modal
  z pełnym podglądem: from/to/temat/treść+stopka); gmail_draft zostaje jako mały przycisk
  zapasowy „draft w Gmailu". Badge limitu: „wysłane dziś X/25".
- **Tab „Odpowiedzi"** (nowy, badge nieobsłużonych): lista wfp_inbox (od, firma→link do drawera,
  temat, badge klasyfikacji, data, obsłużone/nie); widok rozwijany: pełna treść odpowiedzi,
  WĄTEK (outbox+inbox chronologicznie), karta „Propozycja odpowiedzi" (temat+treść EDYTOWALNE
  z suggested_reply; „Wygeneruj ponownie"=reply_suggest force) + **„Zatwierdź i wyślij odpowiedź"**
  (reply_send) + „Oznacz jako obsłużone bez odpowiedzi" (handled_at przez update) + STOP/opt-out
  + przypisanie prospekta gdy NULL (search-select).
- **Wertykale v2:** grupowanie po `category` (akordeony), sort po priority desc, filtry
  status/priority/kategoria; karta: nazwa, badge status+priority, pain, wedge_hint, persona,
  saturation_note; akcja **„Zbadaj branżę (raport AI)"** → vertical_research z paskiem;
  po zbadaniu: werdykt GO/NO_GO + score + przycisk „Pokaż raport" (drawer/modal render sekcji)
  + przejście „→ Do prospectingu" (status w_prospectingu; tylko przy go — przy no_go wymaga
  potwierdzenia). Statusy edytowalne selectem (jak v1).
- **Drawer prospekta:** sekcja „Korespondencja" (wątek outbox+inbox, najnowsze na dole);
  status `wyslany` ustawiany przez send automatycznie (przycisk ręczny „Oznacz jako wysłany"
  zostaje dla toru LinkedIn).
- **KPI:** + „Wysłane dziś X/limit", „Odpowiedzi do obsłużenia N".

## II.6 STAN WDROŻENIA v2 (prawda, 2026-07-23 przedpołudnie) — **WDROŻONE, LIVE**
- [x] Migracja `20260723a_wfp_v2.sql` ZASTOSOWANA (102 wertykale: 80 katalogowych + 22 odrzucone;
  wfp_inbox/outbox; prompty reply/vertical/classify; kpi v2). Re-aplikacja: `node scripts/apply-wfp-v2.mjs`.
- [x] **Domena `kontakt.tomekniedzwiecki.pl` VERIFIED w Resend** (sending SPF/DKIM + receiving MX).
  DNS dodane przez edge `wfa-domain` action dns_set (strefa GoDaddy — NS tomekniedzwiecki.pl to
  domaincontrol.com, NIE Vercel!). Administracja domeną: akcja `domain` w wfp-engine
  (op: create/status/verify/receiving — sekret Resend zostaje w edge; Management API zwraca
  tylko digesty sekretów, nie plaintext). `wfp_from_email` = `tomek@kontakt.tomekniedzwiecki.pl`.
- [x] Edge LIVE: wfp-engine (send/classify_reply/reply_suggest/reply_send/vertical_research/domain),
  wfa-inbox-webhook (tor Prospektora addytywnie), slack-notify (case wfp_reply → #sparing).
  test:webhooks 4/4 po każdym deployu.
- [x] E2E v2 na produkcji 9/9 PASS: gate wertykalu 409 → send (stopka w body) → duplikat 409 →
  REALNY inbound przez subdomenę (webhook → match → auto-classify 'pozytywna' → auto-suggest) →
  reply_send w wątku (In-Reply-To) → inbound „STOP" → AUTOMATYCZNY opt-out (actor auto) →
  vertical_research. Koszt AI testu ~0,44 USD.
- [x] Pierwszy realny raport branżowy: **firmy-ppoz = NO_GO 12/24** (istnieją dedykowani gracze:
  gasnica-control.pl, ppozmanager.pl, techpres, qrsystem) — bramka anty-saturacji działa.
- [x] Visual-verify v2 (desktop+mobile): 8/8 PASS, 3 kosmetyki naprawione (etykieta Źródła,
  ukrywanie badge 0; koszt AI z testów w KPI = celowa kronika).
- Znane niuanse: `sent_today` liczy też wysyłki testowe (wfp_outbox nie ma is_test — akceptowalne);
  wiadomość sklasyfikowana jako opt_out dostaje handled_at automatycznie (nie wisi w liczniku);
  `send-email` (symulacja odpowiedzi w testach) nadaje z ceo@, nie biuro@.

## 7. Czego NIE robimy w v1 (świadomie)
- Auto-wysyłka / sekwencje followup — NIGDY auto; followupy = przyszła iteracja też przez drafty.
- Integracja GUS BIR1/CEIDG API (klucz wymaga wniosku; hook w polu `source` — przyszłość).
- Rotacja domen wysyłkowych / warm-up infra — dopiero gdy reply-rate potwierdzony na małej partii.
- Tracking odpowiedzi przez skrzynkę (Resend Inbound) — v1 rejestruje odpowiedzi ręcznie.
- Scoring ML / pętla uczenia — v1 zbiera dane (statusy, wertykale), analiza później.

## 8. Otwarte decyzje Tomka (rano)
1. Retro-akceptacja [DECYZJA-NOC]: wyłączność=branża w PL; beauty odrzucone; persona ekspercka;
   ceny dopiero na rozmowie; 2. kontakt wg SSOT.
2. Kanał pierwszej partii testowej: LinkedIn (jakość, niższe ryzyko PKE) czy mail (skala)?
3. Które wertykale odpalamy pierwsze (rekomendacja: instalatorzy PV / ekipy remontowe /
   wypożyczalnie — wysoki fit, niska saturacja).
4. Czy budujemy mini-raport branżowy per wertykal (lead magnet, uczciwy claim badań) — zalecane.
5. Dedykowana subdomena/skrzynka wysyłkowa (deliverability) — przed skalą.
