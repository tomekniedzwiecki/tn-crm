-- Fix: trigger uzywa auth.role() (standard Supabase) zamiast current_user
CREATE OR REPLACE FUNCTION restrict_anon_review_updates()
RETURNS TRIGGER AS $$
BEGIN
    -- Sprawdz czy aktualny rola JWT to 'anon'
    IF auth.role() = 'anon' THEN
        IF NEW.workflow_id IS DISTINCT FROM OLD.workflow_id
           OR NEW.source IS DISTINCT FROM OLD.source
           OR NEW.source_review_id IS DISTINCT FROM OLD.source_review_id
           OR NEW.rating IS DISTINCT FROM OLD.rating
           OR NEW.content_pl IS DISTINCT FROM OLD.content_pl
           OR NEW.content_original IS DISTINCT FROM OLD.content_original
           OR NEW.language_original IS DISTINCT FROM OLD.language_original
           OR NEW.was_translated IS DISTINCT FROM OLD.was_translated
           OR NEW.author_name IS DISTINCT FROM OLD.author_name
           OR NEW.review_date IS DISTINCT FROM OLD.review_date
           OR NEW.sku_info IS DISTINCT FROM OLD.sku_info
           OR NEW.image_urls IS DISTINCT FROM OLD.image_urls
           OR NEW.sort_order IS DISTINCT FROM OLD.sort_order THEN
            RAISE EXCEPTION 'Anon may only update hidden, hidden_at, hidden_by columns';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
