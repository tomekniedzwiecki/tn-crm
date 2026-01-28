-- Workflow Tabs Schema: Documents, Materials, Branding, Products, Comments, Reports
-- This migration adds tables to support the new project view tabs

-- =============================================
-- WORKFLOW DOCUMENTS
-- Stores contracts, invoices, and other important documents
-- =============================================
CREATE TABLE IF NOT EXISTS workflow_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN ('contract', 'invoice', 'other')),
    title TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT,
    file_size INTEGER,
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    uploaded_by UUID REFERENCES team_members(id),
    visible_to_client BOOLEAN DEFAULT true
);

CREATE INDEX idx_workflow_documents_workflow ON workflow_documents(workflow_id);

COMMENT ON TABLE workflow_documents IS 'Documents attached to workflows (contracts, invoices, etc.)';

-- =============================================
-- WORKFLOW MATERIALS
-- Stores deliverable files and assets
-- =============================================
CREATE TABLE IF NOT EXISTS workflow_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    file_type TEXT,
    file_size INTEGER,
    category TEXT CHECK (category IN ('design', 'code', 'video', 'audio', 'document', 'other')),
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    uploaded_by UUID REFERENCES team_members(id),
    milestone_id UUID REFERENCES workflow_milestones(id) ON DELETE SET NULL,
    visible_to_client BOOLEAN DEFAULT true
);

CREATE INDEX idx_workflow_materials_workflow ON workflow_materials(workflow_id);
CREATE INDEX idx_workflow_materials_milestone ON workflow_materials(milestone_id);

COMMENT ON TABLE workflow_materials IS 'Deliverable files and assets for workflows';

-- =============================================
-- WORKFLOW BRANDING
-- Stores brand assets: logos, colors, fonts, guidelines
-- =============================================
CREATE TABLE IF NOT EXISTS workflow_branding (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('logo', 'color', 'font', 'guideline', 'other')),
    title TEXT NOT NULL,
    value TEXT,
    file_url TEXT,
    notes TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_workflow_branding_workflow ON workflow_branding(workflow_id);

COMMENT ON TABLE workflow_branding IS 'Brand assets for workflows (logos, colors, fonts)';

-- =============================================
-- WORKFLOW PRODUCTS
-- Tracks physical products and deliveries
-- =============================================
CREATE TABLE IF NOT EXISTS workflow_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    quantity INTEGER DEFAULT 1,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_production', 'shipped', 'delivered')),
    tracking_number TEXT,
    tracking_url TEXT,
    estimated_delivery DATE,
    delivered_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_workflow_products_workflow ON workflow_products(workflow_id);

COMMENT ON TABLE workflow_products IS 'Physical products and delivery tracking';

-- =============================================
-- WORKFLOW COMMENTS
-- Communication thread between team and client
-- =============================================
CREATE TABLE IF NOT EXISTS workflow_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    author_type TEXT NOT NULL CHECK (author_type IN ('team', 'client')),
    author_name TEXT NOT NULL,
    author_id UUID REFERENCES team_members(id),
    content TEXT NOT NULL,
    attachments JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    edited_at TIMESTAMPTZ
);

CREATE INDEX idx_workflow_comments_workflow ON workflow_comments(workflow_id);
CREATE INDEX idx_workflow_comments_created ON workflow_comments(created_at DESC);

COMMENT ON TABLE workflow_comments IS 'Communication thread between team and client';

-- =============================================
-- WORKFLOW REPORTS
-- Analytics and performance reports
-- =============================================
CREATE TABLE IF NOT EXISTS workflow_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT CHECK (type IN ('analytics', 'performance', 'sales', 'custom')),
    content JSONB,
    file_url TEXT,
    period_start DATE,
    period_end DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    visible_to_client BOOLEAN DEFAULT true
);

CREATE INDEX idx_workflow_reports_workflow ON workflow_reports(workflow_id);

COMMENT ON TABLE workflow_reports IS 'Analytics and performance reports';

-- =============================================
-- EXTEND WORKFLOWS TABLE
-- Add sales page fields
-- =============================================
ALTER TABLE workflows ADD COLUMN IF NOT EXISTS sales_page_url TEXT;
ALTER TABLE workflows ADD COLUMN IF NOT EXISTS sales_page_status TEXT CHECK (sales_page_status IN ('draft', 'live'));

COMMENT ON COLUMN workflows.sales_page_url IS 'URL to the client sales page';
COMMENT ON COLUMN workflows.sales_page_status IS 'Status of the sales page (draft/live)';

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS on all new tables
ALTER TABLE workflow_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_branding ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_reports ENABLE ROW LEVEL SECURITY;

-- Policies for authenticated users (admin)
CREATE POLICY "Admin full access to workflow_documents" ON workflow_documents
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin full access to workflow_materials" ON workflow_materials
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin full access to workflow_branding" ON workflow_branding
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin full access to workflow_products" ON workflow_products
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin full access to workflow_comments" ON workflow_comments
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin full access to workflow_reports" ON workflow_reports
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Policies for anonymous users (client access via token)
CREATE POLICY "Client read visible documents" ON workflow_documents
    FOR SELECT TO anon USING (visible_to_client = true);

CREATE POLICY "Client read visible materials" ON workflow_materials
    FOR SELECT TO anon USING (visible_to_client = true);

CREATE POLICY "Client read branding" ON workflow_branding
    FOR SELECT TO anon USING (true);

CREATE POLICY "Client read products" ON workflow_products
    FOR SELECT TO anon USING (true);

CREATE POLICY "Client read comments" ON workflow_comments
    FOR SELECT TO anon USING (true);

CREATE POLICY "Client insert comments" ON workflow_comments
    FOR INSERT TO anon WITH CHECK (author_type = 'client');

CREATE POLICY "Client read visible reports" ON workflow_reports
    FOR SELECT TO anon USING (visible_to_client = true);
