-- =============================================
-- SCHEDULED EMAILS + POLISH HOLIDAYS
-- =============================================
-- Tabela do kolejkowania emaili z flow ofertowego
-- oraz tabela z polskimi świętami do obliczania dni roboczych

-- 1. Tabela scheduled_emails
CREATE TABLE IF NOT EXISTS scheduled_emails (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    client_offer_id UUID REFERENCES client_offers(id) ON DELETE CASCADE,
    email_type TEXT NOT NULL CHECK (email_type IN ('offer_created', 'offer_personal', 'offer_reminder_halfway', 'offer_expired')),
    scheduled_for TIMESTAMPTZ NOT NULL,
    sent_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    cancel_reason TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indeksy dla wydajności crona
CREATE INDEX idx_scheduled_emails_pending ON scheduled_emails(scheduled_for)
    WHERE sent_at IS NULL AND cancelled_at IS NULL;
CREATE INDEX idx_scheduled_emails_lead_id ON scheduled_emails(lead_id);
CREATE INDEX idx_scheduled_emails_client_offer_id ON scheduled_emails(client_offer_id);

-- RLS
ALTER TABLE scheduled_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view all scheduled_emails"
    ON scheduled_emails FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Team members can insert scheduled_emails"
    ON scheduled_emails FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Team members can update scheduled_emails"
    ON scheduled_emails FOR UPDATE
    TO authenticated
    USING (true);

-- Service role może aktualizować (dla cron job)
CREATE POLICY "Service role can do everything"
    ON scheduled_emails FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 2. Tabela polish_holidays
CREATE TABLE IF NOT EXISTS polish_holidays (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    name TEXT NOT NULL
);

-- RLS dla polish_holidays (publiczny odczyt)
ALTER TABLE polish_holidays ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read holidays"
    ON polish_holidays FOR SELECT
    TO authenticated, anon
    USING (true);

CREATE POLICY "Only service role can modify holidays"
    ON polish_holidays FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 3. Wstawienie polskich świąt 2026-2027
INSERT INTO polish_holidays (date, name) VALUES
    -- 2026
    ('2026-01-01', 'Nowy Rok'),
    ('2026-01-06', 'Trzech Króli'),
    ('2026-04-05', 'Wielkanoc'),
    ('2026-04-06', 'Poniedziałek Wielkanocny'),
    ('2026-05-01', 'Święto Pracy'),
    ('2026-05-03', 'Święto Konstytucji 3 Maja'),
    ('2026-06-04', 'Boże Ciało'),
    ('2026-08-15', 'Wniebowzięcie NMP'),
    ('2026-11-01', 'Wszystkich Świętych'),
    ('2026-11-11', 'Święto Niepodległości'),
    ('2026-12-25', 'Boże Narodzenie'),
    ('2026-12-26', 'Drugi dzień Bożego Narodzenia'),
    -- 2027
    ('2027-01-01', 'Nowy Rok'),
    ('2027-01-06', 'Trzech Króli'),
    ('2027-03-28', 'Wielkanoc'),
    ('2027-03-29', 'Poniedziałek Wielkanocny'),
    ('2027-05-01', 'Święto Pracy'),
    ('2027-05-03', 'Święto Konstytucji 3 Maja'),
    ('2027-05-27', 'Boże Ciało'),
    ('2027-08-15', 'Wniebowzięcie NMP'),
    ('2027-11-01', 'Wszystkich Świętych'),
    ('2027-11-11', 'Święto Niepodległości'),
    ('2027-12-25', 'Boże Narodzenie'),
    ('2027-12-26', 'Drugi dzień Bożego Narodzenia')
ON CONFLICT (date) DO NOTHING;

-- 4. Funkcja do sprawdzania czy data jest dniem roboczym
CREATE OR REPLACE FUNCTION is_working_day(check_date DATE)
RETURNS BOOLEAN AS $$
DECLARE
    day_of_week INTEGER;
    is_holiday BOOLEAN;
BEGIN
    -- Sprawdź dzień tygodnia (0=niedziela, 6=sobota)
    day_of_week := EXTRACT(DOW FROM check_date);
    IF day_of_week IN (0, 6) THEN
        RETURN FALSE;
    END IF;

    -- Sprawdź czy to święto
    SELECT EXISTS(SELECT 1 FROM polish_holidays WHERE date = check_date) INTO is_holiday;

    RETURN NOT is_holiday;
END;
$$ LANGUAGE plpgsql STABLE;

-- 5. Funkcja do obliczania daty + N dni roboczych
CREATE OR REPLACE FUNCTION add_working_days(start_date DATE, num_days INTEGER)
RETURNS DATE AS $$
DECLARE
    result_date DATE := start_date;
    days_added INTEGER := 0;
BEGIN
    WHILE days_added < num_days LOOP
        result_date := result_date + INTERVAL '1 day';
        IF is_working_day(result_date) THEN
            days_added := days_added + 1;
        END IF;
    END LOOP;

    RETURN result_date;
END;
$$ LANGUAGE plpgsql STABLE;

-- 6. Funkcja do znajdowania następnego dnia roboczego po podanej dacie
CREATE OR REPLACE FUNCTION next_working_day(check_date TIMESTAMPTZ)
RETURNS TIMESTAMPTZ AS $$
DECLARE
    next_date DATE := check_date::DATE;
BEGIN
    -- Jeśli już jest dzień roboczy, zwróć tę samą datę
    IF is_working_day(next_date) THEN
        RETURN check_date;
    END IF;

    -- Znajdź następny dzień roboczy
    LOOP
        next_date := next_date + INTERVAL '1 day';
        IF is_working_day(next_date) THEN
            -- Zwróć tę samą godzinę co oryginalna data
            RETURN next_date + check_date::TIME;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql STABLE;
