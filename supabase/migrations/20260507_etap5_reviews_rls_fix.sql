-- Fix RLS dla workflow_reviews:
-- Problem: gdy anon UPDATE setuje hidden=true, NEW row nie spelnia SELECT policy (hidden=false),
-- co powoduje RLS violation 42501 nawet przy WITH CHECK=true na UPDATE policy.
-- Fix: anon SELECT widzi wszystkie wiersze, ale aplikacja (widget na landing page)
-- filtruje przez query (?hidden=eq.false). Ograniczenie write przez trigger column-level.

-- Zamien SELECT policy
DROP POLICY IF EXISTS "Anon can read visible reviews" ON workflow_reviews;
CREATE POLICY "Anon can read reviews"
ON workflow_reviews
FOR SELECT
TO anon
USING (true);

-- Trigger: anon moze zmieniac TYLKO pola hidden, hidden_at, hidden_by
CREATE OR REPLACE FUNCTION restrict_anon_review_updates()
RETURNS TRIGGER AS $$
BEGIN
    -- Tylko gdy aktualny rola to anon
    IF current_setting('request.jwt.claim.role', true) = 'anon' OR current_user = 'anon' THEN
        -- Sprawdz czy jakies inne pole niz hidden/hidden_at/hidden_by sie zmienilo
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS workflow_reviews_anon_restrict ON workflow_reviews;
CREATE TRIGGER workflow_reviews_anon_restrict
    BEFORE UPDATE ON workflow_reviews
    FOR EACH ROW
    EXECUTE FUNCTION restrict_anon_review_updates();
