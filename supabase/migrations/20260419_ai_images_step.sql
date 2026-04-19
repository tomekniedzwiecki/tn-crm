-- ============================================================================
-- Nowy krok "Grafiki" w Etapie 3: TakeDrop account → [Grafiki] → Strona
--
-- Grafiki generowane przez Claude Code (procedura CLAUDE_AI_IMAGES_PROCEDURE.md).
-- CRM jest tylko WIDOKIEM galerii + przycisków kopiowania promptów do Claude Code.
-- Claude Code zapisuje każdą wygenerowaną grafikę do workflow_ai_images.
-- ============================================================================

-- 1. Nowe kolumny w workflow_takedrop
ALTER TABLE workflow_takedrop
  ADD COLUMN IF NOT EXISTS ai_images_ready BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS ai_images_confirmed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS ai_images_landing_slug TEXT;

-- 2. Tabela przechowująca wygenerowane grafiki
-- Liczba grafik dynamiczna — zależy od placeholderów w danym landing page.
-- slot_key jest unikalny per workflow (np. "hero-figure-1", "tile-figure-3").
-- slot_type grupuje wg typu (hero/challenge/tile/persona/offer/ritual/spec/generic).
CREATE TABLE IF NOT EXISTS workflow_ai_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  slot_key TEXT NOT NULL,
  slot_label TEXT,
  slot_type TEXT NOT NULL,
  slot_order INT DEFAULT 0,
  aspect_ratio TEXT DEFAULT '1:1',
  prompt TEXT,
  image_url TEXT,
  previous_urls JSONB DEFAULT '[]'::JSONB,
  status TEXT DEFAULT 'pending',
  error_message TEXT,
  reference_image_url TEXT,
  is_custom_upload BOOLEAN DEFAULT FALSE,
  generated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_images_workflow ON workflow_ai_images(workflow_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_ai_images_slot ON workflow_ai_images(workflow_id, slot_key);

ALTER TABLE workflow_ai_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS ai_images_admin ON workflow_ai_images;
CREATE POLICY ai_images_admin ON workflow_ai_images
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS ai_images_anon_select ON workflow_ai_images;
CREATE POLICY ai_images_anon_select ON workflow_ai_images
  FOR SELECT TO anon USING (true);

CREATE OR REPLACE FUNCTION update_workflow_ai_images_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_workflow_ai_images_updated_at ON workflow_ai_images;
CREATE TRIGGER trg_workflow_ai_images_updated_at
  BEFORE UPDATE ON workflow_ai_images
  FOR EACH ROW EXECUTE FUNCTION update_workflow_ai_images_updated_at();

-- ============================================================================
-- Koniec migracji
-- ============================================================================
