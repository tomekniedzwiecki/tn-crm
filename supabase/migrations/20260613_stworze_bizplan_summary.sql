-- Stworzę: mini biznes plan + graficzne podsumowanie karty (2026-06-13)

-- Wstępny plan przychodu liczony przez spar-plan (JSON: model, cena, kamienie,
-- rynek, zwrot wkładu, założenia; _meta.gen = licznik generacji)
ALTER TABLE spar_sessions ADD COLUMN IF NOT EXISTS business_plan jsonb;

-- spar_record_image v2: widok 'podsumowanie' (infografika karty) NIE zużywa
-- puli image_count — limit ekranów 4+4 zostaje nienaruszony, a komunikaty
-- "masz jeszcze N poprawek" na froncie się nie rozjeżdżają. Anty-abuse dla
-- podsumowania pilnuje spar-image (max 3 wersje/sesja z preview_history).
CREATE OR REPLACE FUNCTION spar_record_image(p_session uuid, p_view text, p_url text)
RETURNS int LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE spar_sessions
  SET image_count = COALESCE(image_count, 0) + CASE WHEN p_view = 'podsumowanie' THEN 0 ELSE 1 END,
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
