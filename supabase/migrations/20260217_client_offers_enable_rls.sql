-- =====================================================
-- CRITICAL SECURITY FIX: Enable RLS on client_offers
-- =====================================================
-- Problem: RLS policies exist but RLS is not enabled!
-- Without ENABLE ROW LEVEL SECURITY, policies are ignored
-- and the table is accessible to everyone (anon, public)
-- =====================================================

-- Enable RLS on client_offers
ALTER TABLE client_offers ENABLE ROW LEVEL SECURITY;

-- Verify existing policies will now take effect:
-- - "Authenticated users can view client_offers" (SELECT)
-- - "Anon can view shared client_offers" (SELECT by token)
-- - "Authenticated users can manage client_offers" (ALL)

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
