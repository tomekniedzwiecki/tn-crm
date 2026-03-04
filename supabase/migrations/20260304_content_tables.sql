-- ============================================
-- TN CONTENT MODULE - Database Schema
-- ============================================

-- 1. Knowledge Base - baza wiedzy o Tomku, stylu, ofercie
CREATE TABLE IF NOT EXISTS content_knowledge (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('style', 'offer', 'philosophy', 'checklist', 'script_template', 'thumbnail_template')),
    title TEXT NOT NULL,
    content JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. YouTube Videos - dane z YouTube API
CREATE TABLE IF NOT EXISTS content_youtube_videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    youtube_id TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    published_at TIMESTAMPTZ,
    thumbnail_url TEXT,
    duration_seconds INTEGER,
    -- Current stats (updated periodically)
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    -- Calculated metrics
    ctr DECIMAL(5,2), -- Click-through rate (if available)
    avg_view_duration INTEGER, -- Average view duration in seconds
    avg_view_percentage DECIMAL(5,2), -- Average percentage watched
    -- Metadata
    tags TEXT[],
    stats_updated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Scripts - skrypty do odcinków
CREATE TABLE IF NOT EXISTS content_scripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    youtube_video_id UUID REFERENCES content_youtube_videos(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    -- Script sections (based on template)
    hook TEXT, -- 0-5 sek
    promise TEXT, -- 5-30 sek
    intro TEXT, -- 30-60 sek
    problem TEXT, -- 1-3 min
    solution TEXT, -- 3-10 min (main value)
    case_study TEXT, -- 10-12 min
    cta TEXT, -- 12-12:30
    -- Full script for prompter
    full_script TEXT,
    -- Metadata
    status TEXT DEFAULT 'draft' CHECK (status IN ('idea', 'draft', 'ready', 'recorded', 'published')),
    planned_publish_date DATE,
    topic_keywords TEXT[],
    target_duration_minutes INTEGER DEFAULT 12,
    -- Thumbnail
    thumbnail_prompt TEXT,
    thumbnail_url TEXT,
    -- Notes
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. YouTube Stats History - historia statystyk do analizy trendów
CREATE TABLE IF NOT EXISTS content_youtube_stats_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    youtube_video_id UUID NOT NULL REFERENCES content_youtube_videos(id) ON DELETE CASCADE,
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Content Ideas - bank pomysłów na odcinki
CREATE TABLE IF NOT EXISTS content_ideas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT CHECK (category IN ('educational', 'motivational', 'case_study', 'tutorial', 'behind_scenes', 'qa')),
    priority INTEGER DEFAULT 0, -- higher = more important
    status TEXT DEFAULT 'idea' CHECK (status IN ('idea', 'researching', 'scripting', 'scheduled', 'done', 'rejected')),
    script_id UUID REFERENCES content_scripts(id) ON DELETE SET NULL,
    source TEXT, -- where idea came from (comment, trend, personal)
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_content_knowledge_type ON content_knowledge(type);
CREATE INDEX IF NOT EXISTS idx_content_youtube_videos_youtube_id ON content_youtube_videos(youtube_id);
CREATE INDEX IF NOT EXISTS idx_content_youtube_videos_published_at ON content_youtube_videos(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_scripts_status ON content_scripts(status);
CREATE INDEX IF NOT EXISTS idx_content_scripts_planned_date ON content_scripts(planned_publish_date);
CREATE INDEX IF NOT EXISTS idx_content_stats_history_video ON content_youtube_stats_history(youtube_video_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_ideas_status ON content_ideas(status);
CREATE INDEX IF NOT EXISTS idx_content_ideas_priority ON content_ideas(priority DESC);

-- ============================================
-- RLS POLICIES (Admin only - tomekniedzwiecki@gmail.com)
-- ============================================
ALTER TABLE content_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_youtube_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_youtube_stats_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_ideas ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is content admin
CREATE OR REPLACE FUNCTION is_content_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (SELECT email FROM auth.users WHERE id = auth.uid()) = 'tomekniedzwiecki@gmail.com';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policies for content_knowledge
CREATE POLICY "Content knowledge - admin full access" ON content_knowledge
    FOR ALL USING (is_content_admin());

-- Policies for content_youtube_videos
CREATE POLICY "YouTube videos - admin full access" ON content_youtube_videos
    FOR ALL USING (is_content_admin());

-- Policies for content_scripts
CREATE POLICY "Scripts - admin full access" ON content_scripts
    FOR ALL USING (is_content_admin());

-- Policies for content_youtube_stats_history
CREATE POLICY "Stats history - admin full access" ON content_youtube_stats_history
    FOR ALL USING (is_content_admin());

-- Policies for content_ideas
CREATE POLICY "Ideas - admin full access" ON content_ideas
    FOR ALL USING (is_content_admin());

-- ============================================
-- TRIGGERS for updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER content_knowledge_updated_at
    BEFORE UPDATE ON content_knowledge
    FOR EACH ROW EXECUTE FUNCTION update_content_updated_at();

CREATE TRIGGER content_scripts_updated_at
    BEFORE UPDATE ON content_scripts
    FOR EACH ROW EXECUTE FUNCTION update_content_updated_at();

CREATE TRIGGER content_ideas_updated_at
    BEFORE UPDATE ON content_ideas
    FOR EACH ROW EXECUTE FUNCTION update_content_updated_at();
