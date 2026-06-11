-- Podgląd 4 widoków narzędzia (panel / główna funkcja / dodatkowa / landing)
-- {"panel": url, "glowna": url, "dodatkowa": url, "landing": url}
-- Zaaplikowane 2026-06-12 przez one-off spar-ddl (MCP niedostępny)
ALTER TABLE spar_sessions ADD COLUMN IF NOT EXISTS preview_images jsonb;

-- Archiwum wcześniejszych wersji widoków: {"panel": [stare urls], ...}
-- (poprawka ekranu nie kasuje poprzedniej grafiki — zaaplikowane 2026-06-12)
ALTER TABLE spar_sessions ADD COLUMN IF NOT EXISTS preview_history jsonb;

-- Atomowy zapis wygenerowanego widoku: 4 równoległe generacje nie mogą się
-- ścigać na read-modify-write image_count/preview_images (gubiłyby zapisy);
-- poprzednia wersja widoku trafia do preview_history zamiast przepadać
CREATE OR REPLACE FUNCTION spar_record_image(p_session uuid, p_view text, p_url text)
RETURNS int LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE spar_sessions
  SET image_count = COALESCE(image_count, 0) + 1,
      preview_history = CASE
        WHEN preview_images ? p_view AND preview_images->>p_view IS NOT NULL AND preview_images->>p_view <> p_url
        THEN jsonb_set(
          COALESCE(preview_history, '{}'::jsonb),
          ARRAY[p_view],
          COALESCE(preview_history->p_view, '[]'::jsonb) || to_jsonb(preview_images->>p_view)
        )
        ELSE COALESCE(preview_history, '{}'::jsonb)
      END,
      preview_images = COALESCE(preview_images, '{}'::jsonb) || jsonb_build_object(p_view, p_url),
      preview_image_url = CASE WHEN p_view = 'panel' OR preview_image_url IS NULL THEN p_url ELSE preview_image_url END,
      updated_at = now()
  WHERE id = p_session
  RETURNING image_count;
$$;
REVOKE ALL ON FUNCTION spar_record_image(uuid, text, text) FROM anon, authenticated, public;
