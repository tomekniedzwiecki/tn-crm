-- 20260722j_wf2_step_merge.sql — atomowy merge stanu kroku wf2 (Etap 4, runda 2 poprawek).
--
-- PROBLEM: wf2-ads-connect (webhook Leadsie), wf2-ads-verify (weryfikator) i cron (sweep)
-- robiły read-modify-write CAŁEGO wf2_steps.data na tym samym wierszu. Okno wyścigu:
-- webhook klienta w czasie crona 06:40 → lost update (jeden zapis nadpisuje drugi snapshotem
-- sprzed sekundy, gubiąc świeżo dopisany blok/odhaczoną checklistę).
--
-- FIX: JEDEN UPDATE w SQL (CTE po jsonb_array_elements) pod blokadą wiersza (FOR UPDATE):
--   1. wstaw/nadpisz wskazany podblok (np. 'leadsie' albo 'ads_verify') — pełne podstawienie klucza,
--   2. unia checklisty po `t` — dopisz brakujące pozycje z p_checks jako {t, done:true}, istniejące
--      z p_checks ustaw done:true; NICZEGO nie odznaczamy ani nie usuwamy (jak dotąd w JS).
-- Różne podbloki (connect='leadsie', verify='ads_verify') nie kolidują; wspólna checklista jest
-- teraz scalana atomowo per wywołanie. Status (pending→in_progress) zostaje osobnym, monotonicznym
-- UPDATE-em w edge (nie jest źródłem wyścigu — nie czyta/nadpisuje dużego bloba data).

CREATE OR REPLACE FUNCTION public.wf2_step_merge(
  p_step_id  uuid,
  p_block_key text,
  p_block    jsonb,
  p_checks   text[]
) RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_data     jsonb;
  v_existing jsonb;
  v_merged   jsonb;
BEGIN
  -- blokada wiersza serializuje równoległe merge (webhook ↔ verify ↔ cron)
  SELECT coalesce(data, '{}'::jsonb) INTO v_data
  FROM wf2_steps WHERE id = p_step_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN; -- stary projekt bez kroku — nie wywracamy wołającego
  END IF;

  -- 1. podblok: pełne podstawienie klucza (gdy podano); NULL/'' = tylko checklista
  IF p_block_key IS NOT NULL AND p_block_key <> '' THEN
    v_data := jsonb_set(v_data, ARRAY[p_block_key], coalesce(p_block, 'null'::jsonb), true);
  END IF;

  -- 2. unia checklisty (dodaj/odhacz TYLKO p_checks; nic nie odznaczamy, nic nie usuwamy)
  IF p_checks IS NOT NULL AND array_length(p_checks, 1) > 0 THEN
    v_existing := coalesce(v_data->'checklist', '[]'::jsonb);
    -- istniejące pozycje: done=true gdy t ∈ p_checks, inaczej bez zmian
    SELECT coalesce(jsonb_agg(
             CASE WHEN elem->>'t' = ANY(p_checks)
                  THEN jsonb_set(elem, '{done}', 'true'::jsonb, true)
                  ELSE elem END
           ), '[]'::jsonb)
    INTO v_merged
    FROM jsonb_array_elements(v_existing) elem;
    -- brakujące pozycje z p_checks: dopisz {t, done:true}
    v_merged := v_merged || coalesce((
      SELECT jsonb_agg(jsonb_build_object('t', c, 'done', true))
      FROM unnest(p_checks) AS c
      WHERE NOT EXISTS (
        SELECT 1 FROM jsonb_array_elements(v_existing) e WHERE e->>'t' = c
      )
    ), '[]'::jsonb);
    v_data := jsonb_set(v_data, '{checklist}', v_merged, true);
  END IF;

  UPDATE wf2_steps SET data = v_data WHERE id = p_step_id;
END;
$$;

-- Wołane WYŁĄCZNIE z edge na service-role (wf2-ads-connect / wf2-ads-verify). Odbieramy z PUBLIC,
-- nadajemy service_role (anon/authenticated NIE mają prawa scalać kroków spoza swojego RLS).
REVOKE ALL ON FUNCTION public.wf2_step_merge(uuid, text, jsonb, text[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.wf2_step_merge(uuid, text, jsonb, text[]) TO service_role;

COMMENT ON FUNCTION public.wf2_step_merge(uuid, text, jsonb, text[]) IS
  'Atomowy merge wf2_steps.data: podblok (pełne podstawienie klucza) + unia checklisty po t (dopisuje/odhacza p_checks, nic nie odznacza). Eliminuje lost-update connect↔verify↔cron. Etap 4 runda 2.';
