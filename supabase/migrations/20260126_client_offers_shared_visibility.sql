-- Migration: Make client_offers visible to all team members
-- Previously, users could only see client_offers they created
-- Now all authenticated users can view all client_offers

-- Drop existing SELECT policy if it exists
DROP POLICY IF EXISTS "Users can view own client_offers" ON client_offers;
DROP POLICY IF EXISTS "Team members can view all client_offers" ON client_offers;

-- Create new policy for shared visibility
CREATE POLICY "Team members can view all client_offers"
    ON client_offers FOR SELECT
    TO authenticated
    USING (true);

-- Ensure INSERT, UPDATE, DELETE policies exist for authenticated users
DROP POLICY IF EXISTS "Team members can insert client_offers" ON client_offers;
CREATE POLICY "Team members can insert client_offers"
    ON client_offers FOR INSERT
    TO authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "Team members can update client_offers" ON client_offers;
CREATE POLICY "Team members can update client_offers"
    ON client_offers FOR UPDATE
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Team members can delete client_offers" ON client_offers;
CREATE POLICY "Team members can delete client_offers"
    ON client_offers FOR DELETE
    TO authenticated
    USING (true);
