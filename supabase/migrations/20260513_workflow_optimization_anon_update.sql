-- =============================================
-- FIX: anon UPDATE na workflow_optimization
-- =============================================
-- Bug: klient (anon) w client-projekt.html wywoluje UPDATE na workflow_optimization
-- (submitToolScript, submitToolNotes, saveClientWhatsappPhone, saveClientRecoveryNotes).
-- Tabela mialala tylko anon SELECT policy => UPDATE silently failed (0 rows, error: null),
-- klient widzial toast sukcesu, po refresh pole puste.
--
-- Fix: policy UPDATE for anon + trigger BEFORE UPDATE z whitelist'a pol,
-- zeby klient nie mogl zmienic pol admin-only (tools_ready_at, tools_*_connected_at,
-- cod_*, is_active, *_shared_at itd.). Wzorzec z workflow_reviews_rls_fix.

-- ─── POLICY: anon moze UPDATE wiersze aktywnych workflow_optimization ───
DROP POLICY IF EXISTS "Anon can update client fields" ON workflow_optimization;
CREATE POLICY "Anon can update client fields"
ON workflow_optimization
FOR UPDATE
TO anon
USING (is_active = TRUE)
WITH CHECK (is_active = TRUE);


-- ─── TRIGGER: ogranicz anon do whitelist'y pol klienckich ───
CREATE OR REPLACE FUNCTION restrict_anon_optimization_updates()
RETURNS TRIGGER AS $$
BEGIN
    -- Sprawdz role JWT
    IF auth.role() = 'anon' THEN
        -- Pola admin-only: jesli klient probuje je zmienic -> blokada
        IF NEW.id IS DISTINCT FROM OLD.id
           OR NEW.workflow_id IS DISTINCT FROM OLD.workflow_id
           OR NEW.is_active IS DISTINCT FROM OLD.is_active
           OR NEW.activated_at IS DISTINCT FROM OLD.activated_at
           OR NEW.cod_enabled IS DISTINCT FROM OLD.cod_enabled
           OR NEW.cod_enabled_at IS DISTINCT FROM OLD.cod_enabled_at
           OR NEW.cod_stock_confirmed IS DISTINCT FROM OLD.cod_stock_confirmed
           OR NEW.cod_stock_confirmed_at IS DISTINCT FROM OLD.cod_stock_confirmed_at
           OR NEW.notes IS DISTINCT FROM OLD.notes
           OR NEW.created_at IS DISTINCT FROM OLD.created_at
           OR NEW.reviews_product_url IS DISTINCT FROM OLD.reviews_product_url
           OR NEW.reviews_fetched_at IS DISTINCT FROM OLD.reviews_fetched_at
           OR NEW.reviews_count IS DISTINCT FROM OLD.reviews_count
           OR NEW.reviews_total_ratings IS DISTINCT FROM OLD.reviews_total_ratings
           OR NEW.reviews_avg_star IS DISTINCT FROM OLD.reviews_avg_star
           OR NEW.reviews_positive_pct IS DISTINCT FROM OLD.reviews_positive_pct
           OR NEW.reviews_shared_at IS DISTINCT FROM OLD.reviews_shared_at
           OR NEW.videos_inserted_at IS DISTINCT FROM OLD.videos_inserted_at
           OR NEW.videos_count IS DISTINCT FROM OLD.videos_count
           OR NEW.videos_shared_at IS DISTINCT FROM OLD.videos_shared_at
           OR NEW.tools_started_at IS DISTINCT FROM OLD.tools_started_at
           OR NEW.tools_ready_at IS DISTINCT FROM OLD.tools_ready_at
           OR NEW.tools_ga_connected_at IS DISTINCT FROM OLD.tools_ga_connected_at
           OR NEW.tools_hotjar_connected_at IS DISTINCT FROM OLD.tools_hotjar_connected_at
           OR NEW.tools_email_sent_at IS DISTINCT FROM OLD.tools_email_sent_at
        THEN
            RAISE EXCEPTION 'anon role cannot modify admin-only fields on workflow_optimization';
        END IF;

        -- Whitelist (klient moze zmieniac):
        --   whatsapp_phone, whatsapp_phone_set_by_client, whatsapp_configured_at,
        --   recovery_calls_done, recovery_calls_done_at, recovery_calls_notes,
        --   tools_ga_script, tools_ga_script_at,
        --   tools_hotjar_script, tools_hotjar_script_at,
        --   tools_session_notes, tools_session_notes_at,
        --   updated_at (auto trigger)
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS workflow_optimization_anon_restrict ON workflow_optimization;
CREATE TRIGGER workflow_optimization_anon_restrict
    BEFORE UPDATE ON workflow_optimization
    FOR EACH ROW
    EXECUTE FUNCTION restrict_anon_optimization_updates();

COMMENT ON FUNCTION restrict_anon_optimization_updates() IS 'Ogranicza UPDATE z anon role do whitelist''y pol klienckich (whatsapp_*, recovery_calls_*, tools_*_script*, tools_session_notes*). Admin-only pola (tools_ready_at, *_shared_at, cod_*, is_active, *_connected_at) sa chronione przed klientem.';
