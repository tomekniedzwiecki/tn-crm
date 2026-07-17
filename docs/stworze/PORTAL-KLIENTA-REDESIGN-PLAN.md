# Portal klienta TN App — plan redesignu (SSOT)

> Status: **PROPOZYCJA do zatwierdzenia przez Tomka.** Plik = jedyne źródło prawdy dla sesji wykonawczych.
> Cel: przejść z jednej płachty 11 sekcji na **hub-and-spoke** z data-driven nawigacją (bottom-nav mobile + sidebar desktop), rozdzielić fazy „budowa vs apka żyje", scalić trzy „historie" wg odbiorcy — bez zmiany kontraktów edge i bez utraty bezpieczeństwa.
> Plik dotyczy WYŁĄCZNIE frontu `tn-crm/tn-app/portal.html`. Kontrakty `wfa-portal` i `wfa-test-chat` NIE ulegają zmianie.

Data: 2026-07-17 · Autor: sesja architektury produktu · Powiązane: `WORKFLOW-APLIKACJE-PLAN.md`, `MODUL-TESTY-KLIENTA.md`, `CHANGELOG-SYSTEM-KONCEPCJA.md`, `feedback-escape-atrybutowy-jedna-funkcja.md`, `wfa-portal-podglad-admina-oczami-klienta.md`.

---

## 0. Twarde ograniczenia (plan MUSI je respektować)

- **Stack:** statyczny HTML + vanilla JS, BEZ frameworka, BEZ buildu, BEZ CDN po stronie klienta (Phosphor rehostowany lokalnie: `/tn-app/vendor/phosphor/regular.css`). Motyw ciemny Geist/Vercel. Mocno mobilny. Będzie rósł o moduły.
- **Bezpieczeństwo (nie do ruszenia):**
  - Dane usera → DOM WYŁĄCZNIE przez `esc()` (escape atrybutowy, koduje też `"` i `'`) albo `textContent`. **ZERO `innerHTML` z surowych danych.** Nigdy nie wracać do wzorca `textContent→innerHTML` (SEC-D2).
  - Linki (`app_url` / `landing_url` / `media_url` / `cta_url`) → przez `safeHttpsUrl()` (tylko `https://`).
  - Umowa renderowana w sandboxed iframe (`srcdoc`, bez `allow-scripts`) — bez zmian.
  - `previewMode` (podgląd admina) = **READ-ONLY**: zapisy zwracają 403; formularze `disabled`; compose testów zablokowany.
  - Brak nowej powierzchni anon/serwerowej. Redesign = tylko IA + nawigacja + komponenty frontu.
- **Kontrakty edge bez zmian:** `wfa-portal` (akcje: `portal_state`, `set_password`, główny load token+hasło/preview, `intake_get/_save/_upload_init/_done/_file_delete`, `contract_meta/_data/_html`, `changelog_feed/_seen`) oraz `wfa-test-chat` (akcje: `history/message/upload_init/_done/end`). Payload i nazwy akcji zostają.
- **Model 2 narracji (zdecydowany, do utrzymania):** „Historia poprawek" (dla operatora — jego zgłoszenia, `wfa_test_issues`) ≠ „Co nowego" (dla end-userów jego apki — changelog). Różni odbiorcy, wspólny język wizualny.

---

## 1. Docelowa IA + nawigacja

### 1.1. Model: hub-and-spoke, nie płaska lista

Nawigacja główna = **stały szkielet zakładek**; „Przegląd" to obowiązkowy landing (status w 5 s + jeden next-best-action). Sekcje-na-płachcie zostają wyłącznie WEWNĄTRZ pojedynczego panelu (np. „Do zrobienia" ma 4 karty). Rośnięcie systemu = nowy spoke lub karta warunkowa, **bez zmiany szkieletu**.

### 1.2. Zestaw zakładek (nazwy PL, kolejność, ikony Phosphor)

| # | id | Etykieta | Ikona (`ph ph-*`) | Widoczność (`when`) | Zawartość |
|---|-----|----------|-------------------|---------------------|-----------|
| 1 | `przeglad` | **Przegląd** | `ph-squares-four` | zawsze (primary/landing) | Status 5 s (pasek % + linia „Etap X z Y" + dowód życia), next-best-action (Twój ruch), appcard gdy live, kafle-skróty do zakładek z badge |
| 2 | `budowa` | **Budowa** | `ph-stack` | zawsze | Kamienie milowe (oś czasu — jedyna szczegółowa reprezentacja procesu) + „Jak będzie wyglądać" (makiety/lightbox) |
| 3 | `zadania` | **Do zrobienia** | `ph-list-checks` | zawsze | Intake: Dane firmy / Materiały / Płatności (Stripe) / Osoby na start (akordeony). Jedyne miejsce akcji klienta. Badge = liczba nieukończonych kart |
| 4 | `testy` | **Testy** | `ph-chat-circle-dots` | `d.testy_active` (krok `testy_klienta` = `in_progress`/`done`) | Czat „spowiednika testów" + „Historia poprawek" (**Twoje zgłoszenia** — operator). Badge = nowa runda / zmiany statusu |
| 5 | `apka` | **Twoja aplikacja** | `ph-rocket-launch` | `d.app_url \|\| d.landing_url \|\| d.changelog_any` | Otwórz aplikację (appcard) + „Co nowego" (**Co widzą Twoi użytkownicy** — end-userzy) + Linki. Badge = nieprzeczytane „Co nowego" |
| — | `umowa` | **Umowa** | `ph-file-text` | `d.contract_status && d.contract_status !== 'brak'` | Flow umowy (dane→podpis→podpisana). Dziś predykat = false. Trafia do overflow „Więcej" |

- **Rdzeń zawsze widoczny:** Przegląd, Budowa, Do zrobienia (3 sloty stałe = spokojny, przewidywalny szkielet, zgodny z preferencją stabilnej nawigacji).
- **Zakładki fazowe (contextual disclosure):** Testy i Twoja aplikacja pojawiają się/znikają wg predykatu `when(d)` — to samo zachowanie co dziś (dziś sekcje są `hidden` do czasu spełnienia warunku), tylko podniesione do poziomu nawigacji. Szkielet się nie zmienia — `MODULES[]` filtruje po predykacie.
- **Mobile bottom-nav:** max 5 widocznych; przy >5 ostatni slot = „Więcej" (`ph-dots-three`). Realnie w fazie budowy widać 3–4, w fazie „apka żyje" 4–5. Umowa (gdy włączona) ląduje w „Więcej".

### 1.3. Mapowanie: KAŻDA obecna sekcja → cel

| # | Obecna sekcja (DOM id) | Cel | Uwaga |
|---|------------------------|-----|-------|
| 1 | Status (`c-name/c-bar/c-pct/c-stageline/c-hint/c-life`) | **Przegląd** | Pasek % + jedna linia etapu + dowód życia = „status w 5 s". Jedyny globalny licznik postępu |
| 2 | Karta aplikacji (`c-appcard`) | **Twoja aplikacja** (+ mirror na Przeglądzie gdy live) | Główny punkt wejścia partnera; na Przeglądzie jako „proof of life", gdy `app_url` https |
| 3 | Twój ruch (`c-move`) | **Przegląd** jako next-best-action (primary CTA) | Deep-link do właściwej zakładki (np. `#/zadania`) gdy piłka po stronie klienta |
| 4 | Co nowego (`c-changelog` + badge) | **Twoja aplikacja** | Rama: „Co widzą Twoi użytkownicy". W fazie budowy pusto → zakładka `apka` gated, nie pokazujemy pustki |
| 5 | Testy aplikacji + Historia poprawek (`c-testy`, `ct-issues`) | **Testy** | Czat + „Historia poprawek" = „Twoje zgłoszenia" (operator). Tryb pełnoekranowy zostaje |
| 6 | Do uzupełnienia / intake (`c-intake`, 4 karty) | **Do zrobienia** | Akordeony bez zmian; badge = nieukończone karty (dziś `ci-count`) |
| 7 | Jak będzie wyglądać / makiety (`c-vision`) | **Budowa** | Faza budowy — obok kamieni |
| 8 | Kamienie milowe (`c-timeline`) | **Budowa** | Jedyna szczegółowa oś procesu; usuwa potrójny postęp |
| 9 | Linki (`c-linkbox`) | **Twoja aplikacja** | Landing/strona aplikacji |
| 10 | Umowa (`c-contract`, dziś MARTWA) | **Umowa** (spoke warunkowy, w „Więcej") | Zob. §1.4; usuwa martwy DOM z płachty |
| 11 | Stopka (termin + kontakt) | **Przegląd** (globalna stopka pod hubem) | Termin oddania + „odpisz na maila" |
| — | Auth: `login/setpw/notoken/loading` + baner preview | Bez zmian (przed hubem) | Router startuje dopiero po `show('content')` |

### 1.4. Rozwiązanie pain pointów

- **P1 (brak nawigacji, długi scroll):** hub-and-spoke + bottom-nav; główna akcja (Twój ruch) wraca na górę Przeglądu jako primary CTA, nie jest już spychana pod czat.
- **P2 + P7 (trzy „historie" i pomieszane role/fazy):** rozdział wg **odbiorcy i fazy**:
  - **Kamienie milowe** → Budowa (gdzie jesteśmy w procesie; odbiorca: operator-kupujący budowę).
  - **Historia poprawek** → Testy, pod czatem, rama „Twoje zgłoszenia" (odbiorca: operator jako tester).
  - **Co nowego** → Twoja aplikacja, rama „Co widzą Twoi użytkownicy" (treść dla end-userów; operator ogląda jako właściciel produktu).
  - Faza „budowa" (Budowa + Do zrobienia + Testy) i faza „apka żyje" (Twoja aplikacja) rozdzielone na osobne zakładki.
- **P4 (potrójna reprezentacja postępu):** jeden **globalny** licznik = pasek % (Przegląd). Jedna **szczegółowa** oś = kamienie milowe (Budowa). Linia „Etap X z Y — nazwa" zostaje TYLKO na Przeglądzie jako podpis paska; NIE powtarzamy jej na osi. To dwie różne granularności, nie duplikat.
- **P5 (martwa Umowa):** kod umowy → moduł `umowa` z predykatem backendowym `contract_status !== 'brak'`; `SHOW_CONTRACT = false` zastąpione predykatem. Do finalizacji wzoru spoke nie istnieje w nav → zero martwego DOM na płachcie. **Dane firmy = jedno źródło wejścia:** zbiera je WYŁĄCZNIE karta intake „Dane firmy" (SSOT `contract_fields`). Sekcja Umowa w stanie `dane_klienta` NIE renderuje drugiego formularza — pokazuje „Dane z karty «Dane firmy» trafią do umowy" i, jeśli czegoś brak (NIP/adres), kieruje do `#/zadania`. (Decyzja dla Tomka — §7.)
- **P6 (czat = scroll-trap w środku płachty):** czat żyje we WŁASNEJ zakładce Testy — nie blokuje już scrolla innych treści. Tryb pełnoekranowy zostaje.
- **P3 (async pop-in, CLS):** Faza 4 — skeletony mirrorujące layout zamiast `fadeUp` nth-child i „Ładowanie…".
- **P8 (niespójne nagłówki, brak rejestru):** rejestr sekcji = `MODULES[]` + ta tabela; nagłówki ujednolicone przez komponent `.section-head`.

---

## 2. Przegląd (hub) — dokładna zawartość landingu

Cel: **status w 5 s + jeden next-best-action.** Kolejność (z góry):

1. **Nagłówek personalny:** „Cześć, {imię}!" + „Budujemy Twoją aplikację **{nazwa}**." (dziś `c-name` / `c-hello`).
2. **Status 5 s (jeden blok):**
   - Pasek % + wartość % (jedyny globalny licznik).
   - Jedna linia: „Etap X z Y — **{nazwa etapu}**".
   - Opis etapu „po ludzku" (`current_stage_hint`).
   - Dowód życia: „Ostatnia praca nad projektem: {względny czas}" (zielona pulsująca kropka).
3. **Next-best-action (primary CTA):** gdy `your_move` niepuste — wyróżniony przycisk/karta „Twój ruch: {tekst}" z deep-linkiem do właściwej zakładki (heurystyka: intake niekompletny → `#/zadania`; runda testów gotowa → `#/testy`). Gdy brak `your_move` — spokojny stan „Nie masz teraz nic do zrobienia — pracujemy".
4. **Otwórz aplikację (gdy `app_url` https):** appcard jako proof-of-life (mirror zakładki `apka`).
5. **Kafle-skróty:** 2–4 karty-LEGO do zakładek istotnych w tej fazie (Do zrobienia z badge „X do uzupełnienia", Budowa „Etap X z Y", Testy gdy aktywne z badge, Twoja aplikacja gdy live). Kafel = ikona + tytuł + jedna linia stanu + ewentualny badge.
6. **Stopka:** planowany termin oddania + „Masz pytanie? Odpisz na naszą korespondencję mailową."

**Co spychamy głębiej (poza Przegląd):** pełna oss kamieni (→ Budowa), makiety (→ Budowa), formularze intake (→ Do zrobienia), czat + historia poprawek (→ Testy), changelog + linki (→ Twoja aplikacja). Na Przeglądzie NIE ma osi kamieni ani drugiego licznika — tylko pasek + linia + następny krok.

---

## 3. Nawigacja techniczna

### 3.1. Data-driven `MODULES[]` (pod TEN portal)

```js
// Pojedyncze źródło prawdy nawigacji. Dodanie modułu = 1 wpis + 1 funkcja render.
// d = obiekt z wfa-portal (render(d)); pola pomocnicze (testy_active, changelog_any)
// ustawiamy przy odbiorze odpowiednich fetchy (loadTesty / loadChangelogFeed).
const MODULES = [
  { id:'przeglad', label:'Przegląd',        icon:'ph-squares-four',     when:()=>true,
    render: renderOverviewPanel },
  { id:'budowa',   label:'Budowa',          icon:'ph-stack',            when:()=>true,
    render: renderBudowaPanel },        // kamienie + makiety
  { id:'zadania',  label:'Do zrobienia',    icon:'ph-list-checks',      when:()=>true,
    badge:()=>intakeOpenCount(),        render: renderZadaniaPanel },
  { id:'testy',    label:'Testy',           icon:'ph-chat-circle-dots', when:d=>!!d.testy_active,
    badge:()=>testyBadge(),             render: renderTestyPanel },
  { id:'apka',     label:'Twoja aplikacja', icon:'ph-rocket-launch',    when:d=>!!(d.app_url||d.landing_url||d.changelog_any),
    badge:()=>changelogUnread(),        render: renderApkaPanel },
  { id:'umowa',    label:'Umowa',           icon:'ph-file-text',        when:d=>!!d.contract_status && d.contract_status!=='brak',
    render: renderUmowaPanel },
];
const DEFAULT_MODULE = 'przeglad';
```

- `when(d)` — predykat widoczności (contextual disclosure). Moduł nieaktywny nie ma slotu w nav ani panelu.
- `badge()` — deklaratywny licznik (liczba/`0`); nav renderuje pigułkę tylko gdy >0.
- `render(container)` — buduje panel z klocków przy PIERWSZYM wejściu (lazy). Panele zostają w DOM (`hidden`), stan i scroll przetrwają przełączenie.

### 3.2. Hash router

- Adres: `#/<id>` (np. `#/zadania`). Działa na Vercel statycznie (bez rewrite).
- **Kolizja z istniejącym `#`:** portal używa `#t=` / `#admintok` (token/JWT) w starcie. Router czyta hash DOPIERO po `show('content')` i po tym, jak start wyczyścił token z hasha (`history.replaceState`). Router obsługuje tylko wzorzec `#/...`; hash bez prefiksu `/` = ignorowany (nie mylić z tokenami).
- Nasłuch: `hashchange` + `popstate`. Nieznany/pusty id → `DEFAULT_MODULE` (fallback). id spoza `when(d)===true` → fallback.
- Deep-link: mail „uzupełnij dane" może linkować `...#/zadania`; next-best-action linkuje w obrębie hubu.

### 3.3. Bottom-nav mobile + sidebar/top desktop

- **Mobile (`<=768px`):** dolny fixed `<nav>` (kciuk). Sloty = widoczne moduły, max 5; nadmiar → „Więcej" (arkusz/menu). Aktywny: tło-pigułka + waga + `aria-current="page"` (NIE sam kolor). Touch ≥44px (48 komfort).
- **Desktop (`>768px`):** lewy sidebar (lub górny pasek) z tą samą listą modułów, ten sam `MODULES[]`. Treść = kolumna max-width ~640px zachowana wewnątrz panelu.
- **Overflow „Więcej":** liczony z długości widocznej listy (`>5` → ostatni slot to „Więcej" grupujący resztę). Skaluje się w nieskończoność.

### 3.4. Model ARIA (decyzja)

**Wybrany model: `<nav>` z linkami `<a href="#/...">` + `aria-current="page"` na aktywnym. NIE `role=tablist`.**
Uzasadnienie: nawigacja przełącza między deep-linkowalnymi „stronami" portalu o różnej treści i różnych odbiorcach (Budowa vs Testy vs Aplikacja) — to semantycznie nawigacja, nie zakładki jednej treści. `role=tablist` jest dla paneli tej samej treści bez własnego URL. Deep-linking `#/<id>` przesądza o modelu „stron". Konsekwentnie w bottom-nav i sidebarze.

### 3.5. Stan, lazy-render, safe-area, badge

- **Stan:** panele trzymane w DOM, przełączane klasą `.hidden` + `hidden`. Scroll pozycja i wartości formularzy przetrwają. Ciężkie panele (Testy — czat, Budowa — makiety) renderowane przy 1. wejściu (`render` woła się raz; kolejne wejścia tylko pokazują).
- **Safe-area:** `<meta viewport ... viewport-fit=cover>`; bottom-nav `padding-bottom: max(12px, env(safe-area-inset-bottom))`; body `padding-bottom` pod fixed bar. Fullscreen czatu już używa `env(safe-area-inset-*)` — spójnie.
- **Badge:** dziś liczniki żyją w treści (`ci-count`, `ct-count`, `cl-badge`). Redesign: te same dane zasilają `badge()` w nav (deklaratywnie), a wersje w treści zostają jako podpisy sekcji. Jedno źródło liczby, dwie powierzchnie.
- **Font inputów mobile:** podnieść pola z 14px do ≥16px na mobile (dziś iOS zoomuje przy focusie). `inputmode`/`type` per pole (tel/email w Beta i Dane firmy).

---

## 4. System wizualny

### 4.1. Tokeny semantyczne (`:root`) — aliasy do OBECNYCH wartości (zero zmian wizualnych w Fazie 1)

Warstwa 3-poziomowa: primitive → **semantic (używają moduły)** → component. Wartości wprost z dzisiejszego portalu:

```
/* Tła / powierzchnie */
--bg:#0a0a0b;  --bg-elev:#0e0e10;  --surface:#151517;  --surface-2:#18181b;
/* Bordery */
--border:#1e1e21;  --border-hover:#2b2b30;  --border-strong:#333338;
/* Tekst */
--text:#fff;  --text-2:#d4d4d8;  --text-3:#a7a7af;  --text-muted:#71717a;  --text-faint:#5b5b63;
/* Akcent (1) */
--accent:#0070f3;  --accent-2:#52a8ff;  --accent-bg:rgba(0,112,243,.12);  --accent-border:rgba(0,112,243,.42);
/* Semantyczne stany */
--ok:#4cb782;  --ok-2:#5fce8c;  --warn:#f5b955;  --err:#f26d78;
/* Promienie / gęstość / dotyk */
--r-sm:8px;  --r:12px;  --r-lg:14px;  --tap:44px;
```

Zasada: moduły używają WYŁĄCZNIE semantycznych tokenów, nie surowych hexów. Zgodne z Geist: tło #000/#0a0a0a, powierzchnie #111/#1a1a1a, bordery rgba(255,255,255,.08–.12), 1 akcent, minimalne cienie, Inter (mono do kwot/liczników — `font-variant-numeric:tabular-nums` już w użyciu).

### 4.2. Bazowe komponenty (LEGO) — co JEST, co ujednolicić, co dorobić

| Komponent | Dziś w portalu | Działanie |
|-----------|----------------|-----------|
| `.card` | jest (`.card`, `.ic`, `.cl-item`) | Ujednolicić do jednej bazy + warianty |
| `.section-head` | jest (`.shead` + `.scount` + `.sdesc`) | Zostawić, przemianować w konwencji, użyć wszędzie |
| `.status-chip` | rozproszone (`.tk-pill`, `.cl-chip`, `.st-line`) | Jeden komponent: kolor+ikona+tekst; warianty ok/warn/err/info |
| `.list-row` | rozproszone (`.trow` oś, `.st-line`, `.ifile`, `.tk-iss`) | Jeden wzorzec wiersza listy |
| `.accordion` | jest (`.ic` + `.ic-head/.ic-body`) | Zostawić — dobry wzorzec intake |
| `.stepper` / oś | jest (`.trow.done/.cur/.fut`) | To oś kamieni — wydzielić jako komponent osi (Budowa) |
| `.appcard` | jest | Zostawić, przenieść do panelu `apka` + mirror Przegląd |
| `.badge` | jest (`.cl-badge`, `.scount`) | Wydzielić jako komponent nav-badge + inline |
| `.btn` | jest (`button`, `.cbtn`, `.cbtn-sec`) | Ujednolicić: primary/secondary/ghost |
| `.progress` | jest (`.bar-wrap/.bar`) | Zostawić (Przegląd) |
| `.empty-state` | częściowo (`.cl-empty`, `.skel`) | Dorobić wzorzec: ikona + nagłówek + 1 zdanie + 1 CTA (zakaz „Brak danych") |
| `.skeleton` | brak (jest „Ładowanie…") | Dorobić: mirror layoutu → zero CLS |
| `.toast` | brak (jest `flashOk` inline) | Dorobić: wejście ~400ms, życie ~4–5s, `role=alert` |
| `.nav` bottom/side | brak | Nowy — §3 |

### 4.3. Konwencja klas

Kebab, BEM-lite (`block__element--modifier` tam gdzie potrzebny, inaczej płaskie kebaby). Prefiks modułowy tam, gdzie kolizja (`ovw-`, `bud-`, `tk-`, `ci-`). **Nie robimy wielkiego rename w Fazie 1** — tokeny + nowe komponenty wchodzą addytywnie, stare klasy migrują stopniowo (Faza 2/4).

### 4.4. Ruch / a11y

- Micro-interakcje 150–300ms, animować `transform`/`opacity`. Badge scale 200–300ms. Toast wejście ~400ms.
- `@media (prefers-reduced-motion: reduce)` — rozszerzyć obecny blok o nowe animacje.
- Kontrast ≥4.5:1, `:focus-visible` ring na WSZYSTKICH interaktywnych (nav, karty, przyciski, pola). Reduced-motion i safe-area jak §3.5.

---

## 5. Rozszerzalność

- **Mapa IA = artefakt wersjonowany:** ta tabela (§1.2/§1.3) + `MODULES[]` to rejestr. **Nowy moduł najpierw ląduje w mapie** (decyzja: zakładka / spoke warunkowy / karta w istniejącej zakładce), potem w kodzie.
- **Reguła decyzji „gdzie wsadzić nowy moduł":**
  1. Dotyczy CIĄGŁEJ relacji operatora i jest używany często → **stała zakładka** (tylko jeśli rdzeń nie przekroczy ~5 na mobile; inaczej „Więcej").
  2. Dotyczy konkretnej fazy / warunku → **spoke warunkowy** (`when(d)`), pojawia się gdy relevantny (jak Testy, Aplikacja, Umowa).
  3. Rozszerza istniejący temat → **karta w zakładce** (LEGO), nie nowa zakładka.
- **Rezerwa „Więcej":** overflow liczony z długości widocznej listy — bufor nieograniczony. Rzadkie/formalne (Umowa) domyślnie tam.
- **Billing / rozliczenia operatora z Tomkiem (potencjalna luka z researchu):** gdy powstanie — wchodzi jako **spoke warunkowy** `rozliczenia` (`when: d => !!d.billing_active`), ikona `ph-receipt` lub `ph-chart-line-up`, w „Więcej" lub jako 5. slot w fazie „apka żyje". Kwoty w mono (`tabular-nums`). Wymaga NOWEJ akcji w `wfa-portal` (poza zakresem redesignu frontu — do osobnej decyzji).
- **Większość planowanych modułów NIE trafia do portalu fabryki** (idą do `admin.html` apki operatora / powierzchni end-usera: Wiadomości, Polecenia, Onboarding). Portal fabryki rośnie głównie o: dojrzały changelog danymi, ewentualne rozliczenia, fazowe przełączenie „budowa→apka żyje" (już wbudowane w predykaty `when`).

---

## 6. Plan wdrożenia FAZAMI (iteracyjnie, nie big-bang)

Każda faza jest samodzielnie wdrażalna i testowalna. **NIE ruszać w żadnej fazie:** kontrakty/payloady `wfa-portal` i `wfa-test-chat`, `esc()`, `safeHttpsUrl()`, sandbox umowy, gałąź `previewMode` (403/disabled), start auth (token/hasło/preview/notoken).

### GATE (obowiązkowy po KAŻDEJ fazie)
- **Bezpieczeństwo:** grep — zero nowych `innerHTML =` z danymi bez `esc()`; wszystkie linki przez `safeHttpsUrl`; żaden nowy `onclick` z interpolacją danych (delegacja + `data-*`).
- **Preview read-only:** w `?podglad=admin` zapisy intake/testów/umowy nadal 403 / pola `disabled`; nawigacja i deep-linki działają.
- **Mobile:** 375px i 768px — bottom-nav w zasięgu kciuka, brak poziomego scrolla, touch ≥44px, inputy ≥16px (bez zoomu iOS).
- **Składnia:** portal ładuje się bez błędów konsoli; wszystkie panele renderują po deep-linku; `bindTesty`/uploady/akordeony działają po przełączeniu zakładki.
- **Regresja funkcji:** login/set_password/first-visit, intake save×4, upload+delete, czat (message/upload/end/fullscreen), changelog seen, appcard/linki.

### Faza 1 — Szkielet nawigacji + router + tokeny (BEZ zmiany treści)
- **Zakres:** dodać `:root` tokeny (aliasy do obecnych wartości → zero zmian wizualnych). Wprowadzić `MODULES[]`, hash router (`#/<id>`, fallback), bottom-nav + sidebar. Opakować istniejące sekcje w kontenery paneli (`<div class="panel" data-panel="...">`) i przełączać widoczność zamiast jednej płachty. Wszystkie fetche/funkcje bez zmian; `show('content')` pokazuje aktywny panel.
- **Ryzyka:** router startuje przed wyczyszczeniem tokenu z hasha (kolizja `#t=`/`#/`); init handlerów (`bindTesty`, `ci-file-input.onchange`) uruchamiany zanim panel istnieje. Mitygacja: router po `show('content')`; handlery bindowane na trwałych węzłach lub przez delegację na `document`.
- **Test (GATE):** deep-link do każdej zakładki działa; preview read-only; mobile 375/768; zero zmian wyglądu vs dziś.

### Faza 2 — Migracja sekcji do docelowych zakładek (wg §1.3)
- **Zakres:** rozłożyć sekcje: Budowa (kamienie+makiety), Do zrobienia (intake), Testy (czat+historia poprawek), Twoja aplikacja (appcard+co nowego+linki). Usunąć potrójny postęp (oś tylko w Budowa; Przegląd = pasek+linia). Ramy językowe: „Historia poprawek → Twoje zgłoszenia", „Co nowego → Co widzą Twoi użytkownicy". Liczniki `ci-count/ct-count/cl-badge` zasilają `badge()` w nav.
- **Ryzyka:** predykaty `when` (`testy_active`, `changelog_any`, `app_url`) muszą być ustawiane po odpowiednich fetchach → nav przelicza się po ich powrocie (nie tylko na starcie). Badge desynchronizacja.
- **Test (GATE):** każda sekcja w docelowej zakładce; zakładki fazowe pojawiają się/znikają wg danych; badge zgodne z treścią; GATE bezpieczeństwa/preview/mobile.

### Faza 3 — Przegląd/hub + next-best-action
- **Zakres:** zbudować landing wg §2: status 5 s + Twój ruch jako primary CTA z deep-linkiem + kafle-skróty z badge + appcard-mirror gdy live + stopka. Bez duplikatu osi/licznika.
- **Ryzyka:** heurystyka deep-linku next-best-action (który cel?). Mitygacja: prosta reguła (intake niekompletny → `#/zadania`; runda testów gotowa → `#/testy`; inaczej brak CTA).
- **Test (GATE):** „status w 5 s" czytelny na 375px; CTA prowadzi do właściwej zakładki; kafle mają realne badge; GATE.

### Faza 4 — Skeleton / empty-states / dopieszczenie
- **Zakres:** skeletony mirrorujące layout zamiast „Ładowanie…" i pop-in; usunąć `fadeUp` nth-child (P3). Empty states wg wzorca (ikona+nagłówek+zdanie+CTA, zakaz „Brak danych"). Toast dla zapisów (obok/zamiast `flashOk`). Micro-interakcje, `:focus-visible` wszędzie, reduced-motion rozszerzony, touch/font audit mobile, safe-area.
- **Ryzyka:** CLS jeśli skeleton nie pasuje do realnego layoutu. Mitygacja: skeleton = kopia struktury karty.
- **Test (GATE):** brak przeskoków layoutu przy ładowaniu (nagraj 375px); empty states sensowne; GATE.

### Faza 5 — Sprzątanie martwej Umowy
- **Zakres:** wydzielić kod umowy do modułu `umowa` z predykatem `contract_status !== 'brak'`; usunąć `SHOW_CONTRACT = false`. Formularz danych umowy NIE dubluje intake — w stanie `dane_klienta` kieruje do karty „Dane firmy" (`#/zadania`). Opcjonalnie (decyzja Tomka): usunąć uśpiony DOM/JS do czasu finalizacji wzoru (kod w git history).
- **Ryzyka:** dublowanie SSOT `contract_fields` (intake.firma ↔ contract_data). Mitygacja: jedno wejście = karta Dane firmy; sekcja Umowa tylko czyta.
- **Test (GATE):** przy `contract_status='brak'` brak zakładki Umowa i zero martwego DOM; przy stanie realnym flow działa i nie ma drugiego formularza danych; GATE.

---

## 7. Ryzyka i decyzje dla Tomka (do zatwierdzenia)

1. **Los Umowy.** Rekomendacja: moduł warunkowy w „Więcej", predykat backendowy zamiast `SHOW_CONTRACT`, formularz danych NIE dubluje intake (kieruje do „Dane firmy"). Alternatywa: całkowicie usunąć uśpiony kod do finalizacji wzoru. Którą wersję?
2. **Billing / rozliczenia operatora teraz czy później?** Research wskazał to jako lukę. Wymaga nowej akcji w `wfa-portal` (poza redesignem frontu). Czy rezerwujemy slot/spoke `rozliczenia` już teraz (placeholder), czy zostawiamy tylko regułę rozszerzalności?
3. **Nazwy zakładek.** Propozycja: Przegląd / Budowa / Do zrobienia / Testy / Twoja aplikacja. Warianty do rozważenia: „Do zrobienia" vs „Zadania"; „Testy" vs „Uwagi"; „Twoja aplikacja" vs „Aplikacja". Akceptacja?
4. **Bottom-nav vs top-tabs.** Rekomendacja: bottom-nav na mobile (kciuk) + sidebar na desktop. OK, czy wolisz top-tabs na obu?
5. **Zakładki fazowe (Testy/Aplikacja) pojawiają się/znikają.** Zgodne z dzisiejszym `hidden`, ale na poziomie nav może zaskakiwać. Utrzymać rdzeń 3 stałe + 2 fazowe, czy wszystkie 5 stałe (z empty state)?
6. **„Co nowego" w portalu operatora.** Potwierdzenie ramy: treść dla end-userów, operator ogląda jako właściciel („Co widzą Twoi użytkownicy") — w zakładce Twoja aplikacja, gated do czasu 1. wpisu. OK?
7. **Zakres jednej sesji wykonawczej.** Rekomendacja: Fazy 1–2 razem (szkielet + migracja) jako pierwsza wdrożona iteracja, potem 3, 4, 5 osobno. Akceptacja podziału?

---

## 8. Czego NIE ruszamy (twarda lista dla każdej sesji)
- Kontrakty i payloady `wfa-portal` oraz `wfa-test-chat` (nazwy akcji, pola).
- `esc()`, `safeHttpsUrl()`, `escSrcdoc()` + sandbox iframe umowy.
- Gałąź `previewMode`: 403 na zapisach, `disabled` na polach, `lockTestCompose`.
- Start auth: `bootstrapAuth`, `set_password`, first-visit, `notoken`, obsługa `#t=`/`?t=`/`#admintok` i czyszczenie z URL.
- Bucket/security intake i testów (`wfa-intake`, `wfa-test-shots` PRIVATE) — front tylko konsumuje signed URL.
- Rehost Phosphor lokalnie (bez CDN na powierzchni klienta z hasłem).
