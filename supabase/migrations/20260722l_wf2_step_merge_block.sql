-- 20260722l_wf2_step_merge_block.sql — rozszerzenie wf2_step_merge o p_block_merge (Etap 4, runda 3, P2.2).
--
-- PROBLEM: portal (task_save) zapisywał data.fields kroków ads_* read-modify-write'em CAŁEGO wf2_steps.data
-- na tym samym wierszu, co wf2-ads-verify (blok ads_verify) i wf2-ads-connect (blok leadsie). Zapis
-- pojedynczego pola przez klienta w oknie sweepa/webhooka = lost update (nadpisanie świeżo dopisanego
-- bloku/odhaczonej checklisty) albo wytarcie innych pól tego samego kroku.
--
-- FIX: portal ads_* przechodzi na rpc(wf2_step_merge) pod blokadą wiersza. Dotychczasowa sygnatura
-- PODSTAWIAŁA cały klucz (jsonb_set = pełne nadpisanie), więc zapis jednego pola wytarłby pozostałe
-- pola bloku „fields". Dodajemy parametr p_block_merge:
--   false (domyślnie, zachowanie 1:1 jak dotąd — connect/verify): pełne podstawienie klucza,
--   true  (portal, blok „fields"): PŁYTKI merge klucza `coalesce(data->key,'{}') || p_block` —
--         zapis pojedynczego pola nie wyciera reszty pól ani nie wyściga się z verify/connect.
--
-- DROP starej sygnatury 4-arg jest KONIECZNY: gdyby zostawić ją obok nowej 5-arg (z DEFAULT), wywołanie
-- 4-argumentowe (connect/verify) pasowałoby do OBU → „function is not unique". Po DROP+CREATE pozostaje
-- jedna funkcja; wywołania 4-arg rozwiązują się do 5-arg z p_block_merge=DEFAULT false (bez zmian zachowania).

DROP FUNCTION IF EXISTS public.wf2_step_merge(uuid, text, jsonb, text[]);

CREATE OR REPLACE FUNCTION public.wf2_step_merge(
  p_step_id     uuid,
  p_block_key   text,
  p_block       jsonb,
  p_checks      text[],
  p_block_merge boolean DEFAULT false
) RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_data     jsonb;
  v_existing jsonb;
  v_merged   jsonb;
BEGIN
  -- blokada wiersza serializuje równoległe merge (webhook ↔ verify ↔ cron ↔ portal)
  SELECT coalesce(data, '{}'::jsonb) INTO v_data
  FROM wf2_steps WHERE id = p_step_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN; -- stary projekt bez kroku — nie wywracamy wołającego
  END IF;

  -- 1. podblok: pełne podstawienie klucza (p_block_merge=false) LUB płytki merge (true; np. data.fields)
  IF p_block_key IS NOT NULL AND p_block_key <> '' THEN
    IF p_block_merge THEN
      -- płytki merge: zachowaj istniejące pola, nadpisz tylko podane (zapis 1 pola nie wyciera reszty)
      v_data := jsonb_set(v_data, ARRAY[p_block_key],
                          coalesce(v_data->p_block_key, '{}'::jsonb) || coalesce(p_block, '{}'::jsonb), true);
    ELSE
      v_data := jsonb_set(v_data, ARRAY[p_block_key], coalesce(p_block, 'null'::jsonb), true);
    END IF;
  END IF;

  -- 2. unia checklisty (dodaj/odhacz TYLKO p_checks; nic nie odznaczamy, nic nie usuwamy)
  IF p_checks IS NOT NULL AND array_length(p_checks, 1) > 0 THEN
    v_existing := coalesce(v_data->'checklist', '[]'::jsonb);
    SELECT coalesce(jsonb_agg(
             CASE WHEN elem->>'t' = ANY(p_checks)
                  THEN jsonb_set(elem, '{done}', 'true'::jsonb, true)
                  ELSE elem END
           ), '[]'::jsonb)
    INTO v_merged
    FROM jsonb_array_elements(v_existing) elem;
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

-- Gate identyczny jak przy 4-arg (20260722j): tylko service_role (edge). Nowa sygnatura = nowe REVOKE/GRANT.
REVOKE ALL ON FUNCTION public.wf2_step_merge(uuid, text, jsonb, text[], boolean) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.wf2_step_merge(uuid, text, jsonb, text[], boolean) FROM anon;
REVOKE ALL ON FUNCTION public.wf2_step_merge(uuid, text, jsonb, text[], boolean) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.wf2_step_merge(uuid, text, jsonb, text[], boolean) TO service_role;

COMMENT ON FUNCTION public.wf2_step_merge(uuid, text, jsonb, text[], boolean) IS
  'Atomowy merge wf2_steps.data: podblok (p_block_merge=false pełne podstawienie / true płytki merge klucza) + unia checklisty po t. Eliminuje lost-update connect↔verify↔cron↔portal. Etap 4 runda 3.';
