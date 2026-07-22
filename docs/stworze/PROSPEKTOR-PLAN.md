# PROSPEKTOR — outbound fabryki aplikacji (moduł TN App)

> Wersja: 1.1 (2026-07-22, sesja nocna; po adwersarskiej krytyce Opus — poprawki K1-K3, W1-W9, N1-N6 wplecione). Status: SPEC → implementacja.
> Właściciel decyzji: Tomek. Decyzje podjęte autonomicznie w nocy oznaczono [DECYZJA-NOC] — do retro-akceptacji.

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
