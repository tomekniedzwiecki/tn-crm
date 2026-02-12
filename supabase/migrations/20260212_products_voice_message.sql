-- Add default products voice message URL to settings
INSERT INTO settings (key, value)
VALUES ('products_voice_message_url', 'https://yxmavwkwnfuphjqbelws.supabase.co/storage/v1/object/public/attachments/tn_voice/wybor_produkty.mp3')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
