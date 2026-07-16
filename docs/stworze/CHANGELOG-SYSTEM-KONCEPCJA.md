# System CHANGELOG — koncepcja (jedno źródło, dwa widoki)

> Decyzja Tomka 2026-07-16: „Mógłby być jeden change log, który zbierałby wszystkie
> ważniejsze zmiany z podziałem na to, jaki to typ zmiany, czego dotyczy, co robi. Pomyśl
> też, co używać po stronie klientów platformy, aby pokazać im co zostało zmienione. Podział:
> strona admina (może wiedzieć wszystko) oraz strona klienta."
>
> SSOT tego dokumentu. Status wdrożenia = sekcja §8 (prawda o tym, co żyje).

---

## 1. Po co (problem)

Dziś „co się zmieniło" jest rozsypane po ~15 mechanizmach w różnych technologiach i taksonomiach,
a **żaden nie jest jednym, kuratorowanym changelogiem admin+klient**. Klient projektu fabryki
(operator, np. Grzegorz) widzi tylko oś kamieni milowych — nie „co konkretnie ulepszyliśmy".
Cel: **jedna kuratorowana warstwa NAD surowymi logami**, z dwoma widokami z tego samego wiersza.

## 2. Czego NIE dublować (inwentaryzacja repo, 2026-07-16)

Nowy changelog **czerpie z** tych źródeł i **kuratoruje**, nie kopiuje ich 1:1:

| Mechanizm | Co to | Rola wobec changelogu |
|---|---|---|
| `co-nowego.html` + `changelog.md` (starter/fachmat/dobrywstep) | statyczny product-changelog dla end-usera apki, per-apka, ręczny MD | **poprzednik widoku klienta** — docelowo zasilany z danych, nie drugi równoległy |
| `wfa_notes` kind=`retro` „Dziennik zmian fabryki" (tn-app) | admin-only, per-projekt, wrażliwe zmiany (migracje/bezp.) | **źródło + admin-warstwa**; changelog linkuje, nie kopiuje |
| `BUILDLOG.md` (repo) | dziennik sesji dev, repo-only | źródło techniczne (nie widok) |
| `tn_ad_change_log` | before/after + kategorie (wąska domena Meta Ads) | **wzorzec taksonomii** (action/field/old/new) |
| `wfa_activities` / `wf2_activities` / `workflow_activities` / `lead_activities` | surowy feed akcji, operacyjny | źródło sygnału „coś się zmieniło"; NIE changelog |
| `app_events` / `bud_events` | analityka lejka/aktywacji | inne cele/RLS — nie mieszać |
| `APP_VERSION` `RRRRMMDDNN` + `?v=` | marker deployu | **klucz wersji** changelogu (datowy) |
| portal `milestone_label` (oś kamieni) | postęp budowy dla klienta | uzupełnienie, nie zastąpienie |

**Zasada:** changelog = **selektywna, kuratorowana warstwa**. Wpis może referować źródło (activity/retro/commit),
ale treść jest pisana pod odbiorcę. Nie duplikujemy activity feedu ani retro-dziennika.

## 3. Zasada nadrzędna (z researchu)

**Jedna tabela, dwie warstwy treści na tym samym wierszu:** `admin_note` (techniczne „jak") +
`public_summary` (dla klienta „co i dlaczego"). Widoczność steruje `visibility`. Multi-tenant =
`app_id` (NULL = zmiana globalna platformy, widzą wszyscy). **`public_summary` puste ⇒ wpis
zostaje admin-only** (techniczny szum nie wycieka). Zawsze **„translate, don't copy"** — nigdy
surowy commit/migracja do klienta.

Standard: **Keep a Changelog** (kategorie wewn.: Added/Changed/Deprecated/Removed/Fixed/Security)
mapowane na uproszczone kategorie klienta. Wersjonowanie **datowe** (`RRRRMMDDNN`, spójne z
`APP_VERSION`) — SemVer sztuczny dla apek end-user (brak publicznego API); SemVer tylko wewn. dla
reużywalnych pakietów (np. PanelCore).

## 4. Dwie powierzchnie (architektura)

Realia: **fachmat = OSOBNY projekt Supabase** (`cpzstoyvpfqydmoutcmk`) niż tn-crm
(`yxmavwkwnfuphjqbelws`). „Jeden changelog" = **jeden STANDARD (schema+taksonomia+UI)** + centralne
źródło dla fabryki; nie jedna fizyczna tabela spinająca wszystkie bazy.

- **WARSTWA 1 — Changelog FABRYKI (w tn-crm).** Tu żyje wartość, której dziś brak.
  - *Admin (Tomek)*: widzi WSZYSTKO — wszystkie projekty, techniczne + nietechniczne, w tym
    admin-only (bezp./infra). Konsoliduje rolę retro-dziennika + activity jako kuratorowany widok.
  - *Klient-operator (Grzegorz)*: w SWOIM portalu fabryki (`tn-app/portal.html`) widzi curated
    „co ulepszyliśmy w Twojej aplikacji" (`public_summary`, per jego `app_id` + globalne platformy).
    Buduje zaufanie i pokazuje wartość rev-share 10%.
- **WARSTWA 2 — Product-changelog zbudowanej apki (per-apka, np. fachmat `co-nowego.html`).**
  End-userzy apki (instalatorzy) widzą „co nowego w produkcie". Zostaje standardem startera;
  **wyrównujemy taksonomię** do tych samych kategorii; docelowo (opcjonalnie) fabryka może
  wypychać wpis do apki. Nie budujemy tego od zera — istnieje.

## 5. Model danych (tn-crm — WARSTWA 1)

`changelog_entries`:

| pole | typ | opis |
|---|---|---|
| `id` | uuid pk | |
| `project_id` | uuid null | FK `wfa_projects` (lub `wf2_projects`). **NULL = globalna platforma** |
| `platform` | text | `tn-app` \| `tn-sklepy` \| `sklep` \| `sparing` \| `crm` (dla wpisów bez projektu) |
| `version` | text null | datowy `RRRRMMDDNN` |
| `category` | text | wewn. KaC: `added/changed/deprecated/removed/fixed/security` (CHECK) |
| `public_category` | text null | klient: `new/improved/fixed/security` (CHECK) |
| `area` | text null | obszar/tag: `platnosci`,`panel`,`powiadomienia`,`landing`,`bezpieczenstwo`… |
| `title` | text | krótki nagłówek, jeden temat |
| `admin_note` | text | techniczne „jak": kontekst/migracja/commit |
| `public_summary` | text null | dla klienta „co i dlaczego". **NULL ⇒ admin-only** |
| `media_url` | text null | screenshot/GIF (Storage) |
| `cta_url` | text null | „wypróbuj" |
| `visibility` | text | `admin` \| `public` (default `admin`) (CHECK) |
| `source_kind` / `source_id` | text/uuid null | ślad do `wfa_notes`/`activity`/commit |
| `commit_sha` | text null | ślad techniczny (admin) |
| `published_at` | timestamptz null | moment publikacji public — **klucz read/unread** |
| `created_at` / `created_by` | | |

`changelog_reads` (per user): `user_id`, `project_id` null, `last_seen_at`. Badge nowości =
`count(*) WHERE visibility='public' AND published_at > last_seen_at AND (project_id IS NULL OR project_id=<jego>)`.

## 6. Bezpieczeństwo (twarde — spójne z memory)

- **RLS chroni WIERSZ, nie kolumny** → klient NIE dostaje `admin_note`/`commit_sha`/`source_*`.
  Klient czyta przez **osobny VIEW `changelog_public`** (whitelist kolumn: title, public_summary,
  public_category, area, media_url, cta_url, version, published_at) LUB edge zwracający whitelistę.
- **ZAKAZ `USING(true)`**, zero anon-write. Insert/update TYLKO service-role z edge (admin/ingest).
- Multi-tenant: mapowanie user→projekt przez członkostwo/token portalu (wzorzec „WITH CHECK
  parent-ownership"), NIE denorm po samym `project_id`.
- Wpisy Security: klientowi tylko neutralnie („wzmocniliśmy bezpieczeństwo konta"), NIGDY szczegół
  podatności. Domyślny `visibility=admin` = fail-safe (nic nie wycieka bez świadomej publikacji).
- Nowa tabela + RLS + edge + powierzchnia klienta = **GATE A** (audyt adwersarski) przed live.

## 7. Przepływ pracy (kto pisze)

1. Sesja fabryki po wrażliwej/istotnej zmianie: insert `changelog_entries` `visibility=admin`,
   `category` + `admin_note` (zastępuje część roli retro; retro-dziennik zostaje dla czystej
   akceptacji-śladu bezpieczeństwa albo migruje tu jako `category=security`).
2. Tomek/agent w panelu: dla zmian wartych pokazania klientowi — uzupełnia `public_summary`
   (2–4 zdania, korzyść-first, bez żargonu; te same zakazy co landing: ZAKAZ AI-poetic/purple),
   ustawia `public_category` + `visibility=public` + `published_at`.
3. Klient w portalu: widzi feed + badge dzwoneczka; otwarcie → `last_seen_at=now()`.
- **Automatyzacja (faza 2):** Conventional Commits (`feat:/fix:/…`) → edge `changelog-ingest`
  tworzy DRAFT admin z kategorią z prefiksu. `public_summary` zawsze krok ludzki/agentowy „translate".

## 8. UI

- **Admin** (`tn-app/projekt.html` + widok globalny w `tn-app/index` lub osobny `/tn-app/changelog`):
  lista wszystkich wpisów (filtr: platforma/kategoria/obszar/projekt), edycja `public_summary`,
  toggle `visibility`, „Publikuj" (set `published_at`).
- **Klient** (`tn-app/portal.html`): sekcja/zakładka „Co nowego" + dzwoneczek z badge; kategorie
  **Nowość / Ulepszenie / Poprawka / Bezpieczeństwo**; per jego apka + globalne. Wzorzec wizualny
  jak Linear/Vercel (krótkie, jeden temat, opcjonalny screenshot).

## 9. Fazy wdrożenia

- **Faza 0 (ten dokument):** koncept + inwentaryzacja + decyzja kierunku. ✅
- **Faza 1 (MVP, tn-crm):** tabela `changelog_entries` + `changelog_reads` + VIEW `changelog_public`
  + RLS + edge (`changelog-feed`, `changelog-seen`, admin insert/update) + panel admina + feed
  operatora w portalu + badge. GATE A + E2E przed live.
- **Faza 2:** wyrównanie `co-nowego.html` (starter) do wspólnej taksonomii; opcjonalny push fabryka→apka.
- **Faza 3:** `changelog-ingest` z Conventional Commits (auto-draft admin).

## 10. Otwarte decyzje (do potwierdzenia z Tomkiem)

1. **Priorytet powierzchni klienta:** operator w portalu fabryki (rekomendacja) vs end-user apki
   (`co-nowego`) vs wszystkie platformy naraz.
2. **Los retro-dziennika:** wchłonąć do changelogu jako `category=security` (jeden dziennik) czy
   zostawić osobno jako czysty ślad akceptacji-bezpieczeństwa (changelog tylko linkuje).
3. **Zakres „platform":** tylko TN App na start, czy od razu wspólny standard dla tn-sklepy/sklep/sparing.
