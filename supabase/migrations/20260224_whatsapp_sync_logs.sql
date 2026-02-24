-- =====================================================
-- WhatsApp Sync Logs - historia synchronizacji
-- =====================================================

CREATE TABLE IF NOT EXISTS whatsapp_sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Typ synchronizacji
    sync_type TEXT NOT NULL CHECK (sync_type IN ('all_chats', 'single_chat', 'deep_sync', 'scheduled')),

    -- Kto synchronizował
    synced_by TEXT, -- 'Tomek' lub 'Maciek'

    -- Czas
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,

    -- Statystyki
    chats_processed INTEGER DEFAULT 0,
    total_inserted INTEGER DEFAULT 0,
    total_skipped INTEGER DEFAULT 0,

    -- Leady dotknięte synchronizacją (phone_numbers)
    phones_affected TEXT[] DEFAULT '{}',

    -- Status
    status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'failed')),
    error_message TEXT
);

-- Indeksy
CREATE INDEX IF NOT EXISTS idx_whatsapp_sync_logs_started ON whatsapp_sync_logs(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_whatsapp_sync_logs_synced_by ON whatsapp_sync_logs(synced_by);
CREATE INDEX IF NOT EXISTS idx_whatsapp_sync_logs_status ON whatsapp_sync_logs(status);

-- RLS
ALTER TABLE whatsapp_sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view whatsapp_sync_logs"
    ON whatsapp_sync_logs FOR SELECT TO authenticated USING (true);

CREATE POLICY "Service role full access to whatsapp_sync_logs"
    ON whatsapp_sync_logs FOR ALL TO service_role USING (true) WITH CHECK (true);

-- =====================================================
-- Tabela statusu widgetu (który użytkownik ma włączony widget)
-- =====================================================

CREATE TABLE IF NOT EXISTS whatsapp_widget_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_name TEXT NOT NULL, -- 'Tomek' lub 'Maciek'

    -- Status
    is_active BOOLEAN DEFAULT false,
    scheduled_sync_enabled BOOLEAN DEFAULT false,
    next_scheduled_sync TIMESTAMPTZ,

    -- Ostatnia aktywność
    last_seen_at TIMESTAMPTZ DEFAULT NOW(),
    last_sync_at TIMESTAMPTZ,

    -- Unikalne per user
    UNIQUE(user_name)
);

-- RLS
ALTER TABLE whatsapp_widget_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view whatsapp_widget_status"
    ON whatsapp_widget_status FOR SELECT TO authenticated USING (true);

CREATE POLICY "Service role full access to whatsapp_widget_status"
    ON whatsapp_widget_status FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Dodaj domyślne wpisy
INSERT INTO whatsapp_widget_status (user_name, is_active, scheduled_sync_enabled)
VALUES ('Tomek', false, false), ('Maciek', false, false)
ON CONFLICT (user_name) DO NOTHING;

-- =====================================================
-- Tabela ustawień aplikacji (klucze API, konfiguracja)
-- =====================================================

CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Tylko admin może odczytywać i modyfikować ustawienia
CREATE POLICY "Admin can manage app_settings"
    ON app_settings FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM team_members
            WHERE team_members.user_id = auth.uid()
            AND team_members.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM team_members
            WHERE team_members.user_id = auth.uid()
            AND team_members.role = 'admin'
        )
    );

CREATE POLICY "Service role full access to app_settings"
    ON app_settings FOR ALL TO service_role USING (true) WITH CHECK (true);
