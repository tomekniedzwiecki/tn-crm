-- =====================================================
-- SECURITY FIX: Remove anon UPDATE policy on leads
-- =====================================================
-- Problem: Anon users can update ANY column on recent leads
-- Solution: Drop this policy - all updates now go through lead-upsert edge function
-- which uses service_role and validates input properly
-- =====================================================

-- Drop the overly permissive anon UPDATE policy
DROP POLICY IF EXISTS "Anon can update recent leads" ON leads;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- After this migration:
-- - Anon users cannot directly update leads
-- - All lead updates from public forms go through lead-upsert edge function
-- - Admin pages (lead.html, leads.html) use authenticated access
-- =====================================================
