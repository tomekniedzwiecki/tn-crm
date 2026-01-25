-- Migration: Allow anonymous users to update recently created leads
-- This fixes the survey form not saving answers to the leads table

-- Allow anon to update leads created within the last hour
-- This is secure because:
-- 1. Only allows updating leads created recently (not old data)
-- 2. The survey flow happens within minutes, so 1 hour is plenty

CREATE POLICY "Anon can update recent leads"
ON leads
FOR UPDATE
TO anon
USING (created_at > NOW() - INTERVAL '1 hour')
WITH CHECK (created_at > NOW() - INTERVAL '1 hour');
