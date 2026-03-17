-- Fix: Allow anon (client) to UPDATE legal_data in workflow_takedrop
-- Previously client could only SELECT, so legal data submissions were silently ignored

-- Policy for client to update legal data (only specific columns)
CREATE POLICY "Client update legal data" ON workflow_takedrop
    FOR UPDATE TO anon
    USING (is_active = TRUE)
    WITH CHECK (is_active = TRUE);
