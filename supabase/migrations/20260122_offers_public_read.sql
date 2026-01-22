-- Allow anonymous read access to offers table
-- This is needed for the public product page on tomekniedzwiecki.pl

-- Drop existing policy if it exists (to avoid conflicts)
DROP POLICY IF EXISTS "Anyone can read offers" ON offers;

-- Create policy for anonymous read access
CREATE POLICY "Anyone can read offers"
    ON offers FOR SELECT
    TO anon
    USING (true);

-- Note: Offers table should already have RLS enabled
-- If not, run: ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
