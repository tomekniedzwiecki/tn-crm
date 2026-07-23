# PORTAL-UWAGI — moduł „Uwagi klienta" (doradca uwag) w portalu TN Sklepy

**SSOT modułu.** Decyzja Tomka 23.07.2026: klient-operator potrzebuje jednego miejsca, gdzie zgłasza
uwagi do WSZYSTKIEGO, co przygotowaliśmy (strona sprzedażowa, poprawki, kampanie reklamowe, materiały,
wideo). AI-**doradca** rozmawia z klientem, dopytuje nie tylko „co źle", ale też „jak Twoim zdaniem
powinno być", konstruktywnie kontruje z doświadczenia (max 1 runda) i składa z rozmowy ustrukturyzowane
uwagi z **rekomendacją dla Tomka**. Tomek rozstrzyga w panelu; nowe uwagi „świecą się" na liście
projektów i w konkretnym projekcie.

**Wzorzec:** kalka modułu „Testy klienta" (TN App: `wfa-test-chat` + `wfa_test_issues` + zakładka),
uproszczona (bez sesji/rund) i rozszerzona o pola `client_proposal` + `advisor_recommendation` oraz
`scope` (landing/kampania/wideo/materiały/ogólne/inne). Reużywa wspólny komponent czatu `tn-chat`
i wspólny handler `_shared/portal-chat.ts` — **NIE tworzy nowego okna czatu** (dyrektywa Tomka).

## 1. Architektura

```
supabase/functions/wf2-feedback/index.ts   DORADCA UWAG (cienka konfiguracja nad servePortalChat)
supabase/functions/_shared/portal-chat.ts  wspólny handler (gate token+hasło, throttle, vision, markery)
components/tn-chat.{js,css}                 wspólny front czatu (TNChat.mount, embedded) — BEZ zmian
tn-sklepy/portal.html                       widok #sec-uwagi + druga instancja TNChat (feedbackChat)
tn-sklepy/projekt.html                      zakładka „Uwagi klienta" (data-ptab=feedback)
tn-sklepy/index.html                        badge „nowe uwagi" na karcie projektu (.pc-fb)
supabase/migrations/20260723f_wf2_feedback.sql   tabele + bucket + RLS
scripts/apply-wf2-feedback.mjs              aplikacja migracji (Management API)
```

## 2. Baza danych (migracja `20260723f_wf2_feedback.sql`)

- **`wf2_feedback`** — ustrukturyzowane uwagi. Kolumny: `id`, `project_id` (FK cascade),
  `product_id` (FK set null, na przyszłość), `seq` (nr per projekt = UW-&lt;seq&gt;, liczony w edge
  `MAX(seq)+1` + retry na 23505; BEZ triggera), `scope`
  (landing|kampania|wideo|materialy|ogolne|inne), `target_ref`, `title`, `remark` (uwaga klienta),
  `client_proposal` (propozycja klienta), **`advisor_recommendation`** (rekomendacja AI — TYLKO dla
  Tomka, NIGDY do klienta), `severity` (wazne|srednie|drobne), `screenshots` jsonb, `status`
  (new|reviewed|in_progress|resolved|dismissed), `admin_note` (odpowiedź Tomka WIDOCZNA klientowi),
  `created_at`/`updated_at`/`decided_at`/`resolved_at`. UNIQUE `(project_id, seq)`.
- **`wf2_feedback_messages`** — transkrypt rozmowy z doradcą. Scope po `project_id` (jeden wątek na
  projekt, bez sesji). Kolumny: `id`, `project_id`, `role`, `content`, `images` jsonb, `created_at`.
- **Bucket `wf2-feedback-shots`** — PRIVATE (service-role z edge + signed URLs), 8 MB,
  `image/png|jpeg|webp`.
- **RLS = wyłącznie `team_members`** (ZERO polityk anon). Klient wchodzi tylko przez edge. Obie tabele
  dopisane do asercji anon-leak w `verify-wf2.mjs` (sekcja 4).

## 3. Edge `wf2-feedback` (nad `servePortalChat`)

- Gate = token portalu (32-hex) + hasło SHA-256 + throttle. Podgląd admina (`preview:true` + team JWT)
  = READ-ONLY. Kill-switch `settings.wf2_feedback_enabled` (FAIL-OPEN). Rate-limit 60/h. Model
  `WF2_FEEDBACK_OPENAI_MODEL` (default `gpt-4o`). Deploy: `npm run deploy:wf2-feedback` (`--no-verify-jwt`).
- **Prompt doradcy** (`buildAdvisorPrompt`): persona doradcy + JAWNOŚĆ („spisuję i przekazuję Tomkowi"),
  lista „co już przygotowaliśmy" (gotowe strony z `wf2_products.platform_page_url`), zasada „dopytaj o
  propozycję klienta", blok **SCEPTYK** (błąd = zapisz bez dyskusji; opinia = skontruj RAZ z
  doświadczenia, decyzja ZAWSZE Tomka, nigdy nie odrzucaj), granice (zero obietnic/terminów/RODO).
- **Marker `<uwaga>{scope,target,title,remark,client_proposal,recommendation,severity,dodaj_do}`** —
  edge wycina z odpowiedzi (klient go nie widzi), waliduje (scope/severity whitelist), zapisuje do
  `wf2_feedback` (seq retry), `dodaj_do` = dedup (dopisek zamiast duplikatu), zrzuty z wątku doklejane
  do PIERWSZEJ nowej uwagi tury (`pendingShots`). Potwierdzenie „✅ Zapisałem uwagę [UW-n]… przekażę
  Tomkowi" + activity `wf2_activities` action `feedback_new`.
- **Kontrakt JSON:** `message` → `{reply, saved:[{seq,title}], items:[clientItem]}`; `history` →
  `{enabled, readonly, brand, messages, items}`. `clientItem` = widok klienta (seq/title/scope_pl/
  status/status_pl/admin_note gdy status≠new) — **BEZ** `advisor_recommendation` i `severity`.
- **Akcja `feedback_admin`** (preAuth, gate team JWT): zwraca signed URL-e zrzutów per uwaga + pełny
  transkrypt. Same uwagi panel czyta wprost przez supabaseClient (RLS).

## 4. Front — portal klienta (`tn-sklepy/portal.html`)

- Nowy widok SPA `#…v=uwagi` (`VIEW_IDS.uwagi=['sec-uwagi']`), pozycja nav „Uwagi"
  (`ph-chat-teardrop-dots`, badge = odpowiedzi Tomka nieprzeczytane przez klienta, localStorage
  `wf2_fb_seen_<token>`). Widok dostępny zawsze (uwagi mogą dotyczyć całości).
- **Druga, PROSTA instancja TNChat** (`feedbackChat`, endpoint `wf2-feedback`, embedded) w
  `#uwagi-chat-host` — bez parkowania między slotami (inaczej niż asystent zadań `chat`/`asystent-host`).
  `cfg.intro` = powitanie z jawnością (komponent pokazuje je tylko gdy wątek pusty).
- Pod czatem lista „Twoje zgłoszone uwagi" (`renderFeedbackList`) ze statusem PL i odpowiedzią Tomka.
- Karty landingów (`renderLandings`): przycisk „Mam uwagę do tej strony" (`.lpb-uwaga`) — sibling
  `<a>` (NIE zagnieżdżony!), owinięcie w `.lpb-wrap`; `openUwagi(id)` ustawia `pendingFeedbackRef`
  (→ `context.ref` dla doradcy) i wchodzi w widok uwag.
- **ZAKAZY (verify-wf2):** nie ruszać `CHAT_TASKS`/`asystent-host`/`ensureChatMounted`; nie używać
  zakazanych nazw (gd-chat, asystent-fab, GUIDE_STEPS itd.). Bezpieczne nazwy: `uwagi-*`,
  `feedbackChat`, `ensureFeedbackChatMounted`, `openUwagi`, `renderUwagi`. Komponent tn-chat NIE
  zmieniany → bez bumpa `?v=`.

## 5. Front — panel admina

- **`projekt.html`** — zakładka „Uwagi klienta" (`data-ptab="feedback"`, klucz `feedback` — NIE mylić
  z istniejącą „Uwagi" = notatki Tomka `wf2_notes`). Badge `#tab-feedback-count` = liczba `status='new'`
  (bursztyn — „świeci się"). Uwagi czytane wprost przez supabaseClient (RLS), pobierane w `loadAll`
  (Promise.all). Render `renderFeedback`: scope/severity/status, remark, propozycja klienta,
  **rekomendacja doradcy (dla Tomka)**, zrzuty, pole odpowiedzi do klienta (`admin_note`), przyciski
  statusu (Przeczytane/W toku/Zrobione/Zostawiamy + ↩ Nowe), Usuń. Zrzuty + transkrypt leniwie przez
  edge `feedback_admin` (`loadFeedbackShots`, gate team JWT). Zapisy statusu/odpowiedzi wprost przez
  supabaseClient.update.
- **`index.html`** — badge `.pc-fb` na karcie projektu (bursztyn + delikatny puls) = liczba
  `status='new'` per projekt (jedno zbiorcze zapytanie w `loadAll` → `aggByProj[p.id].newFeedback`).

## 6. Zasady operacyjne

- Zmiana promptu doradcy → symulacje jak w PORTAL-ASYSTENT §6 (opcjonalnie). `advisor_recommendation`
  NIGDY nie może trafić do klienta — `clientItem` w edge go pomija (analogia „reason_pl NIGDY do
  klienta"). Zmiana `clientItem`/statusów → sprawdź oba końce (edge status_pl ↔ panel FB_STATUS).
- Po deployu edge: `npm run test:webhooks`. Przed commitem: `npm run test:wf2` (0 FAIL).
- Deploy frontu (portal/projekt/index) = `git push main` (Vercel). Migracja = `node
  scripts/apply-wf2-feedback.mjs` PRZED pushem.

## 7. Historia

- 23.07.2026 — powstanie modułu. Tabele `wf2_feedback` + `wf2_feedback_messages`, bucket
  `wf2-feedback-shots`, edge `wf2-feedback`, widok „Uwagi" w portalu, zakładka „Uwagi klienta"
  w panelu, badge na liście projektów. E2E doradcy zweryfikowany (marker → zapis → rekomendacja).
  Powiązane: [[projekt-portal-asystent-chat-first]] (wspólny komponent + handler),
  MODUL-TESTY-KLIENTA.md (wzorzec).
