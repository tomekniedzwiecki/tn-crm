-- =============================================
-- GLOBAL VOICE MESSAGE FOR VIDEO STAGE
-- =============================================
-- Jedna globalna wiadomość głosowa dla wszystkich klientów
-- na etapie Video (Etap 2)

-- Setting dla URL do pliku MP3
INSERT INTO settings (key, value) VALUES (
  'video_stage_voice_message_url',
  'https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/tn_voice/etap_2_video.mp3'
) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Komentarz
COMMENT ON TABLE settings IS 'Globalne ustawienia aplikacji';
