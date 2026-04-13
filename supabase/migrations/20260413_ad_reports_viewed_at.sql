-- Dodaj kolumnę viewed_at do śledzenia czy klient widział raport
ALTER TABLE workflow_ad_reports ADD COLUMN IF NOT EXISTS viewed_at TIMESTAMPTZ;

-- Indeks dla szybkiego wyszukiwania nieobejrzanych raportów
CREATE INDEX IF NOT EXISTS idx_ad_reports_viewed ON workflow_ad_reports(workflow_id, viewed_at);

-- Klient może aktualizować viewed_at
DROP POLICY IF EXISTS "Client can update viewed_at" ON workflow_ad_reports;
CREATE POLICY "Client can update viewed_at"
    ON workflow_ad_reports
    FOR UPDATE
    USING (auth.role() = 'anon')
    WITH CHECK (auth.role() = 'anon');
