-- =====================================================
-- Dodaj kolumnę synced_by do whatsapp_messages
-- =====================================================

ALTER TABLE whatsapp_messages
ADD COLUMN IF NOT EXISTS synced_by TEXT;

-- Indeks dla filtrowania po osobie
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_synced_by ON whatsapp_messages(synced_by);

-- Komentarz
COMMENT ON COLUMN whatsapp_messages.synced_by IS 'Kto synchronizował wiadomości (tomek/maciek)';
