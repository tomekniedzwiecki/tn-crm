-- =====================================================
-- Automatyczne generowanie follow-upów co godzinę
-- =====================================================

-- Włącz pg_cron jeśli nie jest włączony
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Funkcja do wywołania edge function generate-followups
CREATE OR REPLACE FUNCTION trigger_generate_followups()
RETURNS void AS $$
DECLARE
    stages TEXT[] := ARRAY['contacted', 'qualified', 'proposal', 'negotiation', 'waiting'];
    stage TEXT;
    response JSONB;
BEGIN
    -- Dla każdego etapu wywołaj edge function
    FOREACH stage IN ARRAY stages LOOP
        -- Wywołaj edge function przez http extension
        SELECT content::jsonb INTO response
        FROM http_post(
            'https://yxmavwkwnfuphjqbelws.supabase.co/functions/v1/generate-followups',
            json_build_object('stage', stage, 'generated_by', 'tomek')::text,
            'application/json'
        );

        RAISE NOTICE 'Generated followups for stage %: %', stage, response;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Harmonogram: co godzinę o :00
-- SELECT cron.schedule('generate-followups-hourly', '0 * * * *', 'SELECT trigger_generate_followups()');

-- Na razie zakomentowane - odkomentuj po przetestowaniu
