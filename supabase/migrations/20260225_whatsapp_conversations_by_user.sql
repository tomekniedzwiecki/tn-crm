-- =====================================================
-- Zmień widok whatsapp_conversations żeby grupował po synced_by
-- Dzięki temu konwersacje Tomka i Maćka są osobne
-- =====================================================

DROP VIEW IF EXISTS whatsapp_conversations;

CREATE VIEW whatsapp_conversations AS
SELECT
    wm.phone_number,
    wm.contact_name,
    wm.synced_by,
    wm.lead_id,
    l.email as lead_email,
    l.name as lead_name,
    l.status as lead_status,
    COUNT(*) as message_count,
    MAX(wm.message_timestamp) as last_message_at,
    SUM(CASE WHEN wm.direction = 'inbound' THEN 1 ELSE 0 END) as inbound_count,
    SUM(CASE WHEN wm.direction = 'outbound' THEN 1 ELSE 0 END) as outbound_count
FROM whatsapp_messages wm
LEFT JOIN leads l ON l.id = wm.lead_id
GROUP BY wm.phone_number, wm.contact_name, wm.synced_by, wm.lead_id, l.email, l.name, l.status
ORDER BY last_message_at DESC;
