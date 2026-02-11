-- =============================================
-- GLOBAL VOICE MESSAGE FOR VIDEO STAGE
-- =============================================
-- Jedna globalna wiadomość głosowa dla wszystkich klientów
-- na etapie Video (Etap 2)

-- Setting dla URL do pliku MP3
INSERT INTO settings (key, value) VALUES (
  'video_stage_voice_message_url',
  ''  -- Wklej tutaj URL do pliku MP3 z Supabase Storage
) ON CONFLICT (key) DO NOTHING;

-- Komentarz
COMMENT ON TABLE settings IS 'Globalne ustawienia aplikacji';
