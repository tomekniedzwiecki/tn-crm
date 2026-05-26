-- =====================================================
-- FIX: Security Definer View advisor (4 widoki)
-- =====================================================
-- Supabase Security Advisor flagował 4 widoki jako SECURITY DEFINER.
-- W Postgresie widoki domyślnie wykonują się z uprawnieniami właściciela
-- (postgres), co omija RLS tabel źródłowych dla wywołującego (anon/auth).
-- Ustawienie security_invoker = true powoduje, że widok uruchamia się
-- z uprawnieniami wywołującego i respektuje jego RLS.
--
-- Widoki:
--   - public.whatsapp_conversations
--   - public.lead_email_stats
--   - public.automation_email_stats
--   - public.workflow_progress
-- =====================================================

ALTER VIEW public.whatsapp_conversations  SET (security_invoker = true);
ALTER VIEW public.lead_email_stats        SET (security_invoker = true);
ALTER VIEW public.automation_email_stats  SET (security_invoker = true);
ALTER VIEW public.workflow_progress       SET (security_invoker = true);

COMMENT ON VIEW public.whatsapp_conversations IS 'Aggregated WhatsApp conversations per phone+synced_by (security_invoker = on, respects RLS of whatsapp_messages + leads)';
COMMENT ON VIEW public.lead_email_stats       IS 'Email stats per lead (security_invoker = on, respects RLS of email_messages)';
COMMENT ON VIEW public.automation_email_stats IS 'Email stats per automation/email_type (security_invoker = on, respects RLS of email_messages)';
COMMENT ON VIEW public.workflow_progress      IS 'Aggregated workflow progress with deadline_resets for admin dashboard (security_invoker = on, respects RLS of workflows + workflow_tasks + workflow_milestones + workflow_video + workflow_activities)';
