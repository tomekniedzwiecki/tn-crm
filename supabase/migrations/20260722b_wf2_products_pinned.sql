-- ═══════════════════════════════════════════════════════════════════════════
-- WF2 — PORTFEL: kolumna `pinned` + krok 'wybor' = BRAMKA TOMKA (2026-07-22)
--
-- Decyzja Tomka (21.07 wieczór, projekt Hoffy): produkty do portfela wybiera
-- SAM w panelu (Dodaj produkty / Wylosuj dopełnia / Przelosuj). „Przelosuj"
-- wymienia WYŁĄCZNIE produkty niezaznaczone (pinned=false); zaznaczone zostają.
-- Fabryka NIE startuje, dopóki Tomek nie skompletuje portfela — autonomiczne
-- losowanie portfela przez fabrykę (panel-sync.py wybor) przestaje być torem
-- domyślnym (komenda tylko na jawne zlecenie Tomka).
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.wf2_products
  ADD COLUMN IF NOT EXISTS pinned boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.wf2_products.pinned IS
  'Zaznaczony przez Tomka — „Przelosuj" portfela go NIE wymienia (2026-07-22)';

UPDATE public.wf2_step_defs
   SET milestone_label = 'Portfel skompletowany — produkty wybrane przez Tomka'
 WHERE key = 'wybor';

-- BACKFILL checklist kroków 'wybor' z zapisanym stanem: teksty WS się zmieniły
-- (GOTCHA sierot z tn-app: stary tekst odhaczony + nowy pusty). Krok done =
-- nowa checklista w całości odhaczona; pozostałe = wyczyszczona (odhaczy panel).
UPDATE public.wf2_steps
   SET data = jsonb_set(coalesce(data, '{}'::jsonb), '{checklist}',
       '[{"t":"Produkty wybrane przez Tomka (ręcznie i/lub losowaniem w panelu)","done":true},
         {"t":"Niechciane wymienione przez „Przelosuj\" (pinezka chroni zaznaczone)","done":true},
         {"t":"Portfel skompletowany — fabryka może startować","done":true}]'::jsonb)
 WHERE step_key = 'wybor' AND status = 'done'
   AND coalesce(data->'checklist', '[]'::jsonb) <> '[]'::jsonb;

UPDATE public.wf2_steps
   SET data = jsonb_set(coalesce(data, '{}'::jsonb), '{checklist}', '[]'::jsonb)
 WHERE step_key = 'wybor' AND status <> 'done'
   AND coalesce(data->'checklist', '[]'::jsonb) <> '[]'::jsonb;
