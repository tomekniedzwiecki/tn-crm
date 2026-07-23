# PORTAL-ASYSTENT — asystent chat-first portalu klienta + wspólny komponent czatu

**SSOT modułu.** Decyzja Tomka 22.07.2026: czat = główny interfejs prowadzenia klienta w portalu
TN Sklepy („ściana tekstu" instrukcji → prowadzenie krok po kroku rozmową); jeden wspólny komponent
czatu zamiast osobnych implementacji; asystent zna wszystkie zadania i zakładki portalu oraz doradza
ws. założenia firmy (DG vs działalność nierejestrowana).

## 1. Architektura

```
components/tn-chat.js        wspólny front czatu (IIFE, window.TNChat) — drawer|embedded
components/tn-chat.css       style .tnc-*, motyw przez zmienne --tnc-* (nadpisywalne per host)
supabase/functions/_shared/portal-chat.ts   wspólny handler edge servePortalChat(req, cfg)
supabase/functions/wf2-ads-guide/index.ts   ASYSTENT PORTALU TN SKLEPY (cienka konfiguracja)
supabase/functions/wfa-test-chat/index.ts   czat Testy klienta TN App (cienka konfiguracja)
tn-sklepy/portal.html        host asystenta (drawer na widoku zadań)
tn-app/portal.html           host czatu testów (embedded, sekcja Testy aplikacji)
```

- **bud-chat / spar-chat (lejki sprzedażowe na tn.pl) = POZA konsolidacją** — streaming SSE,
  inna bramka (JWT+Turnstile), front w repo tn-site. Nie ruszać w ramach tego modułu.
- Nazwa funkcji `wf2-ads-guide` została HISTORYCZNA (deploy/skrypty/tabele bez churnu) — od 22.07
  to asystent CAŁEGO portalu, nie tylko ads. Tabela `wf2_guide_messages`, bucket `wf2-guide-shots`
  (PRIVATE, 8 MB), kill-switch `settings.wf2_ads_guide_enabled` (FAIL-OPEN), rate-limit 60 wiad./h.

## 2. Kontrakty

**Front:** `TNChat.mount(rootEl, config)` → `{open, close, refresh, isEnabled, destroy, el}`.
Config (skrót; pełny JSDoc w tn-chat.js): endpoint, layout 'drawer'|'embedded', title/intro/placeholder,
`auth()` (body: token+hasło LUB token+preview), `authHeaders()` (Bearer JWT w podglądzie), readonly,
accept/maxMB/maxPerMsg, `features {paste, dnd, capture, fullscreen, timestamps}`, imageField
('images' wf2 / 'attachments' wfa), lightbox (adapter), `context()` (extra pola body — np. task_key),
onResponse/onHistory/onOpen/onClose, track. Komponent traktuje `enabled===false` LUB `active===false`
z history jako wyłączenie (kill-switch → host chowa wejścia).

**Edge:** `servePortalChat(req, cfg)` — wspólne: CORS, walidacja tokenu, gate hasła SHA-256 +
portal-throttle, preview team JWT (verifyTeamMember) → readonly (zapisy 403 „podgląd — tylko odczyt"),
history + signed URLs, upload_init/done, rate-limit, kill-switch, transkrypt+vision, openaiFetchRetry,
zapis wiadomości, `body.context` (cap 4KB) → `buildContextBlock`. Per funkcja (hooki): loadProject,
buildSystemPrompt, buildContextBlock, parseMarkers/onMarkers, extraActions (preAuth/postAuth),
buildHistory, buildUploadPath, resolveScope, limity/model/bucket.

## 3. Asystent portalu TN Sklepy (wf2) — v2.1 „ROZMOWA JEST TREŚCIĄ ZADANIA"

- **Model (doprecyzowanie Tomka 23.07):** w zadaniach `CHAT_TASKS = ads_strona/ads_konto/ads_budzet/firma`
  W MIEJSCU instrukcji jest OSADZONE okno rozmowy (TNChat embedded, jak WhatsApp) — asystent SAM wita
  per zadanie lokalnym dymkiem z PIERWSZYM krokiem (`CLIENT_WS.chatIntro`; efemeryczny — przy istniejącym
  wątku nie wraca) i prowadzi dalej bez powtórnego witania. ZERO przycisków/FAB/drawera/akordeonów.
  **Wyjątek `pl_dane`** = czysty formularz (decyzja: dane proste). Pola zadania („Twoje dane do tego
  zadania") + CTA „Zrobione" POD czatem (CTA nie-done = NIEBIESKI; zieleń tylko done).
- **Wątki per zadanie:** `wf2_guide_messages.task_key` (migracja 20260723) — historia, transkrypt modelu
  i intro filtrowane po `body.context.task_key` (hooki `rowExtra`/`historyExtraFilter` w portal-chat.ts);
  NULL = stare/ogólne; panel admina (projekt.html) czyta CAŁOŚĆ bez filtra. Jedna trwała instancja czatu
  przenoszona między slotami zadań (park w `#asystent-host` przed innerHTML!).
- **Klikalne linki (decyzja Tomka):** dymki linkifikują `https?://` bezpiecznie (createElement('a'),
  `tnc-link`, target=_blank, rel=noopener; zero innerHTML). Prompt: „zawsze dawaj bezpośredni pełny
  link zamiast opisywać nawigację"; wiedza i chatIntro używają pełnych https://.
- Kill-switch OFF → zadania czatowe pokazują pełną dawną instrukcję `ws.guide` (fallback; guide ZOSTAJE
  w CLIENT_WS jako fallback + źródło promptu). Dane klient wpisuje w POLACH zadań — asystent tam
  kieruje (dokładnymi etykietami pól), sam nie odhacza.
- **Prompt** (zaszyty w wf2-ads-guide): persona przewodnika + zasady „JEDEN krok naraz" + wiedza
  per zadanie (pl_dane, sekcja ŚRODOWISKO REKLAMOWE 1:1 — pilnowana asercjami verify-wf2) +
  **doradca firmy** (DG vs nierejestrowana, limit 10 813,50 zł/kwartał 2026, bramki, VAT, inFakt
  z linkiem polecającym; ton: nie straszyć, nie naciskać) + mapa zakładek portalu + granice
  (zero wiążących porad podatkowych, zero haseł, zero danych innych klientów).
- **[STAN PROJEKTU]** (`buildContextBlock`): statusy zadań klienta, aktywne zadanie
  (body.context.task_key), wypełnione pola (nazwy + maski NRB/NIP do 4 znaków), checklisty aktywnego
  zadania (import CHECKLIST_MAP z ../wf2-portal/checklist-map.ts), ostatnie ukończone kroki prac.
  ⛔ `HIDDEN_FOR_CLIENT = {"firma"}` — MUSI być w sync z `PREVIEW_ONLY_STEPS` (wf2-portal/index.ts);
  pilnuje tego asercja verify-wf2. Klient nie może się dowiedzieć o ukrytym zadaniu z kontekstu.
- **Marker `<utkniecie>`** → nota „blokada" `wf2_notes` (dedup „⚠️ PRZEWODNIK:") + activity — bez zmian.
- Tracking: `open_guide` w TRACK_ACTIONS (wf2-portal).

## 4. Zadanie „Twoja firma" — gating (stan 22.07.2026)

Ukryte SERVER-SIDE: `PREVIEW_ONLY_STEPS` w wf2-portal (klient nie dostaje defs/steps, zapisy 400).
Podgląd admina widzi zawsze. **Start = decyzja Tomka**: wyjęcie `firma` z PREVIEW_ONLY_STEPS →
wtedy front odsłania je dopiero po zrobieniu ads_strona+ads_konto+ads_budzet (uśpiony gating
FIRMA_AFTER w portal.html). Przy starcie usunąć też `firma` z HIDDEN_FOR_CLIENT w wf2-ads-guide
(asercja sync-guard przypomni). Asystent doradza ws. firmy NIEZALEŻNIE od widoczności zadania.

## 5. Zasady operacyjne

- **Aktualizując CLIENT_WS ads_\* w portal.html — zaktualizuj też prompt asystenta** (i odwrotnie);
  sekcja ads w promptcie = 1:1 z instrukcjami (asercje pilnują BM ID + „Partnerzy").
- Zmiana liczb w bloku firmy (limity, ZUS, prowizje) → zmień też w kroku `firma` w CLIENT_WS
  (te same kwoty w obu miejscach).
- Nowe eventy trackingu z frontu → dopisz do TRACK_ACTIONS w wf2-portal, inaczej cicho giną.
- Cache-bust: tn-chat.js/css ładowane z `?v=RRRRMMDDNN` — bump przy każdej zmianie komponentu
  W OBU portalach (tn-sklepy/portal.html i tn-app/portal.html).
- Zmiany w tn-chat.js/css testować na OBU hostach (visual-verify oba portale).
- Deploy: `npm run deploy:wf2-ads-guide` i odpowiednik dla wfa-test-chat; po KAŻDYM deployu
  `npm run test:webhooks`. verify-wf2.mjs 0 FAIL przed commitem.

## 6. Jakość — symulacje rozmów (metoda)

Przy każdej większej zmianie promptu: symuluj rozmowy agentami-personami bezpośrednio na edge
(skrypty wzorcowe w scratchpadzie sesji 22.07: `sim-msg.mjs` = tura z hasłem portalu + task_key,
`sim-reset.mjs` = czyszczenie historii/not — TYLKO projekty „TEST Asystent"). Projekty testowe
„TEST Asystent 1–5" (hasło portalu SimTest#2026; nr 1 ma zadania klienta done). Rubryka: jeden krok
naraz, zgodność faktów z CLIENT_WS, kierowanie do pól, ton, halucynacje ścieżek Meta, higiena danych,
markery utknięcia, granice (terminy/RODO/prepaid/injection). 22.07: 2 rundy × (15+10) rozmów →
10 poprawek promptu + fix kontekstu (przejecie_* ukryte). ⚠️ Zarzut symulanta ≠ prawda — weryfikuj
z CLIENT_WS (przykład: „halucynacja billing_hub" była poprawnym linkiem z instrukcji).

## 7. Historia

- 22.07.2026 — powstanie modułu: konsolidacja wfa-test-chat + wf2-ads-guide na portal-chat.ts,
  komponent tn-chat, chat-first widok zadań wf2, doradca firmy. (Poprzednik: przewodnik ads
  per-zadanie z 22.07 rano, commit 73a4f794 — patrz ADS-ONBOARDING-LEADSIE.md §14.)
  Commity: 56287ef3 (rdzeń), 3974c779 (poprawki po 25 symulacjach), 0b189bb8 (checklist-map),
  1cbdca74 (fix crash drawera + fab-dodge; pełny PASS weryfikacji wizualnej obu portali).
