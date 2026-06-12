-- Zestaw "marka istnieje": widoki 'sklep' (karta w sklepie z aplikacjami)
-- i 'telefon' (lifestyle shot) nie zużywają puli image_count — jak 'podsumowanie'.
-- Zaaplikowane przez MCP 2026-06-12.
CREATE OR REPLACE FUNCTION public.spar_record_image(p_session uuid, p_view text, p_url text)
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  UPDATE spar_sessions
  SET image_count = COALESCE(image_count, 0) + CASE WHEN p_view IN ('podsumowanie', 'sklep', 'telefon') THEN 0 ELSE 1 END,
      preview_history = CASE
        WHEN preview_images ? p_view AND preview_images->>p_view IS NOT NULL AND preview_images->>p_view <> p_url
        THEN jsonb_set(COALESCE(preview_history, '{}'::jsonb), ARRAY[p_view],
          COALESCE(preview_history->p_view, '[]'::jsonb) || to_jsonb(preview_images->>p_view))
        ELSE COALESCE(preview_history, '{}'::jsonb)
      END,
      preview_images = COALESCE(preview_images, '{}'::jsonb) || jsonb_build_object(p_view, p_url),
      preview_image_url = CASE WHEN p_view = 'panel' OR preview_image_url IS NULL THEN p_url ELSE preview_image_url END,
      updated_at = now()
  WHERE id = p_session
  RETURNING image_count;
$function$
