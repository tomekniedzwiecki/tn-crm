-- =====================================================================
-- PRZYWRÓCENIE DOSTĘPU KLIENTA (rola `anon`) DO PORTALU WORKFLOW
-- =====================================================================
-- Problem: polityki RLS `TO anon` na tabelach workflow_* zniknęły z
-- produkcji (rozjazd z migracjami — najpewniej po ręcznym "security fix"
-- w panelu, który odtworzył tylko polityki `TO authenticated`).
--
-- Skutek: klient (przeglądarka = rola anon, klucz publishable) dostawał
-- 0 wierszy ze wszystkich tabel workflow_*  ->  loadProject() nie znajduje
-- workflow  ->  ekran "Link nieprawidłowy / nie znaleziono", pusta zakładka
-- produktów. Admin (zalogowany = authenticated) widział wszystko, więc błąd
-- był niewidoczny od strony CRM.
--
-- Ten skrypt jest IDEMPOTENTNY (DROP IF EXISTS + CREATE) i odtwarza
-- WYŁĄCZNIE projektowy dostęp klienta przez token. Definicje 1:1 z migracji.
--
-- ŚWIADOMIE NIE przywracamy "Anon can update workflow for password" na
-- `workflows` — to była luka, hasło idzie teraz przez RPC
-- set_workflow_client_password() (migracja 20260217_fix_workflow_rls_security).
-- =====================================================================

-- ── RLS włączone (no-op, jeśli już jest) ──
ALTER TABLE workflows            ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_milestones  ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_tasks       ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_documents   ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_materials   ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_branding    ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_products    ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_comments    ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_reports     ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_access_log  ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_video       ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_takedrop    ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_ads         ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_optimization ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_reviews     ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_orders      ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- SEKCJA A — ODCZYT (SELECT). To naprawia "nie znaleziono" + puste produkty.
-- =====================================================================

DROP POLICY IF EXISTS "Anyone can view workflow by token" ON workflows;
CREATE POLICY "Anyone can view workflow by token"
    ON workflows FOR SELECT TO anon USING (true);   -- token sprawdzany w aplikacji

DROP POLICY IF EXISTS "Anyone can view workflow_milestones" ON workflow_milestones;
CREATE POLICY "Anyone can view workflow_milestones"
    ON workflow_milestones FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "Anyone can view workflow_tasks" ON workflow_tasks;
CREATE POLICY "Anyone can view workflow_tasks"
    ON workflow_tasks FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "Client read visible documents" ON workflow_documents;
CREATE POLICY "Client read visible documents"
    ON workflow_documents FOR SELECT TO anon USING (visible_to_client = true);

DROP POLICY IF EXISTS "Client read visible materials" ON workflow_materials;
CREATE POLICY "Client read visible materials"
    ON workflow_materials FOR SELECT TO anon USING (visible_to_client = true);

DROP POLICY IF EXISTS "Client read branding" ON workflow_branding;
CREATE POLICY "Client read branding"
    ON workflow_branding FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "Client read products" ON workflow_products;
CREATE POLICY "Client read products"
    ON workflow_products FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "Client read comments" ON workflow_comments;
CREATE POLICY "Client read comments"
    ON workflow_comments FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "Client read visible reports" ON workflow_reports;
CREATE POLICY "Client read visible reports"
    ON workflow_reports FOR SELECT TO anon USING (visible_to_client = true);

DROP POLICY IF EXISTS "Client read active video" ON workflow_video;
CREATE POLICY "Client read active video"
    ON workflow_video FOR SELECT TO anon USING (is_active = TRUE);

DROP POLICY IF EXISTS "Client read active takedrop" ON workflow_takedrop;
CREATE POLICY "Client read active takedrop"
    ON workflow_takedrop FOR SELECT TO anon USING (is_active = TRUE);

DROP POLICY IF EXISTS "Client read active ads" ON workflow_ads;
CREATE POLICY "Client read active ads"
    ON workflow_ads FOR SELECT TO anon USING (is_active = TRUE);

DROP POLICY IF EXISTS "Anon can read whatsapp config" ON workflow_optimization;
CREATE POLICY "Anon can read whatsapp config"
    ON workflow_optimization FOR SELECT TO anon USING (is_active = TRUE);

DROP POLICY IF EXISTS "Anon can read visible reviews" ON workflow_reviews;
DROP POLICY IF EXISTS "Anon can read reviews" ON workflow_reviews;
CREATE POLICY "Anon can read reviews"
    ON workflow_reviews FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "Anon select orders for active ads" ON workflow_orders;
CREATE POLICY "Anon select orders for active ads"
    ON workflow_orders FOR SELECT TO anon
    USING (EXISTS (SELECT 1 FROM workflow_ads wa
                   WHERE wa.workflow_id = workflow_orders.workflow_id AND wa.is_active = TRUE));

-- =====================================================================
-- SEKCJA B — AKCJE KLIENTA (INSERT / UPDATE / DELETE)
-- =====================================================================

-- log dostępu (logAccess w client-projekt.html)
DROP POLICY IF EXISTS "Anyone can insert workflow_access_log" ON workflow_access_log;
CREATE POLICY "Anyone can insert workflow_access_log"
    ON workflow_access_log FOR INSERT TO anon, authenticated WITH CHECK (true);

-- komentarze klienta
DROP POLICY IF EXISTS "Client insert comments" ON workflow_comments;
CREATE POLICY "Client insert comments"
    ON workflow_comments FOR INSERT TO anon WITH CHECK (author_type = 'client');

-- Etap 2: akceptacja video / profile / linki
DROP POLICY IF EXISTS "Client update own data" ON workflow_video;
CREATE POLICY "Client update own data"
    ON workflow_video FOR UPDATE TO anon
    USING (is_active = TRUE) WITH CHECK (is_active = TRUE);

-- Etap 3: dane prawne TakeDrop
DROP POLICY IF EXISTS "Client update legal data" ON workflow_takedrop;
CREATE POLICY "Client update legal data"
    ON workflow_takedrop FOR UPDATE TO anon
    USING (is_active = TRUE) WITH CHECK (is_active = TRUE);

-- Etap 4: nadanie dostępu partnerskiego (UPDATE + INSERT gdy brak rekordu)
DROP POLICY IF EXISTS "Client can grant partner access" ON workflow_ads;
CREATE POLICY "Client can grant partner access"
    ON workflow_ads FOR UPDATE TO anon
    USING (is_active = TRUE) WITH CHECK (is_active = TRUE);

DROP POLICY IF EXISTS "Client can create ads record for partner access" ON workflow_ads;
CREATE POLICY "Client can create ads record for partner access"
    ON workflow_ads FOR INSERT TO anon
    WITH CHECK (
        workflow_id IS NOT NULL
        AND EXISTS (SELECT 1 FROM workflow_takedrop wt
                    WHERE wt.workflow_id = workflow_ads.workflow_id
                      AND wt.test_accepted = TRUE)
    );

-- Etap 5: pola klienta optymalizacji (whitelist pól pilnuje trigger niżej)
DROP POLICY IF EXISTS "Anon can update client fields" ON workflow_optimization;
CREATE POLICY "Anon can update client fields"
    ON workflow_optimization FOR UPDATE TO anon
    USING (is_active = TRUE) WITH CHECK (is_active = TRUE);

-- Etap 5: ukrywanie opinii (whitelist pól pilnuje trigger niżej)
DROP POLICY IF EXISTS "Anon can hide reviews" ON workflow_reviews;
CREATE POLICY "Anon can hide reviews"
    ON workflow_reviews FOR UPDATE TO anon
    USING (true) WITH CHECK (true);

-- Zamówienia (panel zamówień przy aktywnych reklamach)
DROP POLICY IF EXISTS "Anon insert orders for active ads" ON workflow_orders;
CREATE POLICY "Anon insert orders for active ads"
    ON workflow_orders FOR INSERT TO anon
    WITH CHECK (
        EXISTS (SELECT 1 FROM workflow_ads wa
                WHERE wa.workflow_id = workflow_orders.workflow_id AND wa.is_active = TRUE)
        AND admin_note IS NULL
    );

DROP POLICY IF EXISTS "Anon update orders for active ads" ON workflow_orders;
CREATE POLICY "Anon update orders for active ads"
    ON workflow_orders FOR UPDATE TO anon
    USING (EXISTS (SELECT 1 FROM workflow_ads wa
                   WHERE wa.workflow_id = workflow_orders.workflow_id AND wa.is_active = TRUE))
    WITH CHECK (EXISTS (SELECT 1 FROM workflow_ads wa
                        WHERE wa.workflow_id = workflow_orders.workflow_id AND wa.is_active = TRUE));

DROP POLICY IF EXISTS "Anon delete orders for active ads" ON workflow_orders;
CREATE POLICY "Anon delete orders for active ads"
    ON workflow_orders FOR DELETE TO anon
    USING (EXISTS (SELECT 1 FROM workflow_ads wa
                   WHERE wa.workflow_id = workflow_orders.workflow_id AND wa.is_active = TRUE));

-- =====================================================================
-- SEKCJA C — TRIGGERY column-level (gwarantują, że anon UPDATE z sekcji B
-- nie zmieni pól admin-only). CREATE OR REPLACE = idempotentne; odtwarzamy
-- na wszelki wypadek, gdyby też zostały usunięte.
-- =====================================================================

CREATE OR REPLACE FUNCTION restrict_anon_optimization_updates()
RETURNS TRIGGER AS $$
BEGIN
    IF auth.role() = 'anon' THEN
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
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS workflow_optimization_anon_restrict ON workflow_optimization;
CREATE TRIGGER workflow_optimization_anon_restrict
    BEFORE UPDATE ON workflow_optimization
    FOR EACH ROW EXECUTE FUNCTION restrict_anon_optimization_updates();

CREATE OR REPLACE FUNCTION restrict_anon_review_updates()
RETURNS TRIGGER AS $$
BEGIN
    IF current_setting('request.jwt.claim.role', true) = 'anon' OR current_user = 'anon' THEN
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
    FOR EACH ROW EXECUTE FUNCTION restrict_anon_review_updates();

CREATE OR REPLACE FUNCTION protect_workflow_orders_admin_note()
RETURNS TRIGGER AS $$
BEGIN
    IF auth.role() = 'anon' THEN
        NEW.admin_note := OLD.admin_note;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS workflow_orders_protect_admin_note ON workflow_orders;
CREATE TRIGGER workflow_orders_protect_admin_note
    BEFORE UPDATE ON workflow_orders
    FOR EACH ROW EXECUTE FUNCTION protect_workflow_orders_admin_note();

-- =====================================================================
-- SEKCJA D — GRANT EXECUTE na RPC klienta (na wypadek gdyby też zniknęły)
-- =====================================================================
GRANT EXECUTE ON FUNCTION set_workflow_client_password(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION reset_workflow_client_password(TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION update_workflow_selected_product(TEXT, UUID) TO anon;
GRANT EXECUTE ON FUNCTION create_workflow_video_record(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION confirm_workflow_takedrop_account(TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION confirm_workflow_takedrop_active(TEXT, BOOLEAN) TO anon;
-- update_workflow_contract_data ma 12 parametrów TEXT:
GRANT EXECUTE ON FUNCTION update_workflow_contract_data(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO anon;

-- =====================================================================
-- KONIEC. Po uruchomieniu: otwórz link projektu w trybie incognito —
-- portal powinien się załadować, a zakładka produktów pokazać katalog.
-- =====================================================================
