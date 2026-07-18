-- ═══════════════════════════════════════════════════════════════════════════
-- WF2 — ROZBICIE ETAPU „KAMPANIE" NA DWA ETAPY (2026-07-19)
-- Decyzja Tomka 19.07: etap 4 mieszał dwa różne światy — przygotowanie
-- ŚRODOWISKA reklamowego (konto/budżet/pixel, project-scope, robota klienta+setup)
-- z produkcją MATERIAŁÓW i kampanią (grafiki/wideo/kampania, product-scope,
-- robota fabryki). Nowa struktura (7 etapów):
--   4 Środowisko reklamowe  (ads_konto → ads_strona → ads_budzet → ads_pixel 🏁
--                            → ads_preflight 🏁 — wszystko project-scope)
--   5 Materiały i kampania  (ads_grafiki → ads_wideo [+avi_*] → ads_zestaw
--                            → ads_kampanie 🏁 → ads_start 🏁 — product-scope)
--   6 Testy i skalowanie    (dawny 5; + ads_wyniki [auto] + ads_opieka —
--                            pętla wyników i higiena kampanii)
--   7 Przekazanie sterów    (dawny 6, bez zmian kluczy)
-- Podstawa: research 3× Sonnet 19.07 (Andromeda/GEM: kreacja = targetowanie;
-- pixel+CAPI dedup po event_id; EMQ z danych COD; feedback score; blocklista
-- komentarzy; fatigue frequency>3/CTR−25%/CPM+35%) → WORKFLOW-V2-TESTY.md §9.
-- Instancje wf2_steps: stan zweryfikowany 19.07 — wszystkie ads_*/test pending
-- z pustymi checklistami, więc zmiana tekstów WS jest bezpieczna (bez sierot).
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. Renumeracja od góry (7 ← 6, 6 ← 5) ──────────────────────────────────
UPDATE public.wf2_step_defs SET stage = 7, stage_label = 'Przekazanie sterów'
  WHERE key IN ('wdrazanie','przejecie_kampanii','przejecie_operacji','stery','monthly');
UPDATE public.wf2_step_defs SET stage = 6, stage_label = 'Testy i skalowanie'
  WHERE key IN ('test_wynik','skalowanie','rotacja','sprzedaz_sync');

-- ── 2. Etap 5 — Materiały i kampania (product-scope) ───────────────────────
UPDATE public.wf2_step_defs SET stage = 5, stage_label = 'Materiały i kampania', sort = 10
  WHERE key = 'ads_grafiki';
UPDATE public.wf2_step_defs SET stage = 5, stage_label = 'Materiały i kampania', sort = 20
  WHERE key = 'ads_wideo';
UPDATE public.wf2_step_defs SET stage = 5, stage_label = 'Materiały i kampania', sort = 40
  WHERE key = 'ads_kampanie';
-- sub-kroki wideo podążają za rodzicem (w 20260719b miały stage=4 na twardo)
UPDATE public.wf2_step_defs SET stage = 5, stage_label = 'Materiały i kampania'
  WHERE sub_of = 'ads_wideo';

-- ── 3. Etap 4 — Środowisko reklamowe (project-scope) ───────────────────────
UPDATE public.wf2_step_defs SET stage_label = 'Środowisko reklamowe', sort = 10,
  instructions_md = 'Załóż Business Manager (business.facebook.com) i w nim konto reklamowe: waluta PLN, strefa Europe/Warsaw — tych ustawień NIE DA SIĘ zmienić później. Zweryfikuj numer telefonu (SMS), włącz weryfikację dwuetapową. Dodaj metodę płatności (płatności ręczne). Nadaj nam dostęp partnera „Pełna kontrola" (ID partnera dostaniesz od nas) do 3 zasobów: konto reklamowe, strona na Facebooku, Instagram. Przygotuj dokumenty firmy (NIP, wpis CEIDG/KRS) — Meta może poprosić o weryfikację firmy i wtedy liczy się czas.'
  WHERE key = 'ads_konto';
UPDATE public.wf2_step_defs SET stage_label = 'Środowisko reklamowe', sort = 30,
  instructions_md = 'Doładuj konto reklamowe (płatności ręczne: BLIK / przelew / PayU). Budżet projektu: 1000 zł = 500 zł test 5 produktów + 500 zł skalowanie zwycięzców. Środki muszą być WIDOCZNE na koncie w Menedżerze reklam. Ustaw też limit wydatków konta (bezpiecznik) i dodaj zapasową metodę płatności — gdy główna padnie, Meta przełącza się na zapas zamiast zatrzymać kampanie.'
  WHERE key = 'ads_budzet';
UPDATE public.wf2_step_defs SET stage_label = 'Środowisko reklamowe', sort = 40
  WHERE key = 'ads_pixel';

INSERT INTO public.wf2_step_defs
  (key, stage, stage_label, label, icon, sort, owner, scope, milestone_label, instructions_md) VALUES
('ads_strona', 4, 'Środowisko reklamowe', 'Strona FB + Instagram', 'ph-thumbs-up', 20,
 'client', 'project', NULL,
 'Uzupełnij stronę firmową na Facebooku: logo i zdjęcie w tle (dostaniesz od nas), sekcja „Informacje" z danymi firmy i linkiem do sklepu, 3–6 postów (produkt, marka, kulisy). Podepnij konto Instagram do strony. Pusta strona to czerwona flaga i dla Meta, i dla klientów — ludzie z reklam wchodzą na profil sprawdzić, czy marka istnieje. Kilka rzetelnych postów wystarczy; nie kupuj lajków.'),
('ads_preflight', 4, 'Środowisko reklamowe', 'Pre-flight: gotowość środowiska', 'ph-list-checks', 50,
 'admin', 'project', 'Środowisko reklamowe gotowe (pre-flight 0 braków)', NULL),
('ads_zestaw', 5, 'Materiały i kampania', 'Zestaw reklam + copy', 'ph-stack', 30,
 'admin', 'product', NULL, NULL),
('ads_start', 5, 'Materiały i kampania', 'Start i pierwsza doba', 'ph-play-circle', 50,
 'admin', 'product', 'Kampania WYSTARTOWAŁA (reklamy zaakceptowane przez Meta)', NULL),
('ads_wyniki', 6, 'Testy i skalowanie', 'Pomiar wyników (sync Meta)', 'ph-chart-line-up', 5,
 'auto', 'project', NULL, NULL),
('ads_opieka', 6, 'Testy i skalowanie', 'Opieka i higiena kampanii', 'ph-heartbeat', 15,
 'admin', 'project', NULL, NULL)
ON CONFLICT (key) DO NOTHING;

-- ── 4. Koszty materiałów (grafiki/wideo) przechodzą do etapu 5 ─────────────
-- (hardkody stage:4 w wf2-ads/logCost i panel-sync/cost_add zmienione na 5 w kodzie)
UPDATE public.wf2_costs SET stage = 5
  WHERE stage = 4 AND (step_key IN ('ads_grafiki','ads_wideo','ads_zestaw') OR step_key LIKE 'avi_%');

-- ── 5. Przesiew instancji dla wszystkich projektów (idempotentne) ──────────
SELECT public.wf2_ensure_steps(id) FROM public.wf2_projects;
