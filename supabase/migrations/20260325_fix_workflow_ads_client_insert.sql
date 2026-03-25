-- Fix: Allow client (anon) to INSERT into workflow_ads when confirming partner access
-- Problem: Client gets RLS error when trying to mark partner_access_granted
--          if the workflow_ads record doesn't exist yet

-- Allow anon to INSERT (create) workflow_ads record for their workflow
-- This is needed when client clicks "I added you as partner" but no ads record exists yet
CREATE POLICY "Client can create ads record for partner access" ON workflow_ads
    FOR INSERT TO anon
    WITH CHECK (
        -- Must have workflow_id
        workflow_id IS NOT NULL
        -- Workflow must have test_accepted (Stage 3 complete)
        AND EXISTS (
            SELECT 1 FROM workflow_takedrop wt
            WHERE wt.workflow_id = workflow_ads.workflow_id
            AND wt.test_accepted = TRUE
        )
    );
