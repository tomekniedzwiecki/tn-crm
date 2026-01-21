-- Public legal documents table (separate from settings for security)
-- This table has anonymous read access for public legal pages

CREATE TABLE IF NOT EXISTS public_legal_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    doc_type TEXT NOT NULL UNIQUE CHECK (doc_type IN ('regulamin', 'privacy')),
    content TEXT,
    company_name TEXT DEFAULT 'Tomasz Niedźwiecki AI',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default rows
INSERT INTO public_legal_documents (doc_type, content, company_name)
VALUES
    ('regulamin', NULL, 'Tomasz Niedźwiecki AI'),
    ('privacy', NULL, 'Tomasz Niedźwiecki AI')
ON CONFLICT (doc_type) DO NOTHING;

-- Enable RLS
ALTER TABLE public_legal_documents ENABLE ROW LEVEL SECURITY;

-- Anonymous users can only READ
CREATE POLICY "Anyone can read legal documents"
ON public_legal_documents
FOR SELECT
TO anon
USING (true);

-- Authenticated users can read and update
CREATE POLICY "Authenticated users can read legal documents"
ON public_legal_documents
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can update legal documents"
ON public_legal_documents
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert legal documents"
ON public_legal_documents
FOR INSERT
TO authenticated
WITH CHECK (true);
