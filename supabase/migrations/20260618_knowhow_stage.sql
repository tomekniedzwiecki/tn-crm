-- ===== Faza 0: Fundament danych etapu KNOW-HOW =====
-- Zastosowane na zdalnej bazie 2026-06-18 (migracja MCP: knowhow_stage_foundation).
-- Plik dla spójności repo. Idempotentne (IF NOT EXISTS / DROP POLICY IF EXISTS).

-- 1) Kolumny markerow na spar_sessions
ALTER TABLE public.spar_sessions
  ADD COLUMN IF NOT EXISTS idea_source text DEFAULT 'wlasny'
    CHECK (idea_source IN ('wlasny','ai','wspolny'));
ALTER TABLE public.spar_sessions ADD COLUMN IF NOT EXISTS full_paid_at timestamptz;
ALTER TABLE public.spar_sessions ADD COLUMN IF NOT EXISTS knowhow_closed_at timestamptz;

COMMENT ON COLUMN public.spar_sessions.idea_source IS 'Zrodlo pomyslu (steruje rozmowa know-how): wlasny|ai|wspolny. Auto-set AI na werdykcie, override w adminie.';
COMMENT ON COLUMN public.spar_sessions.full_paid_at IS 'Pelna platnosc (order z oferty offer_type=full). Ustawiany przez tpay-webhook. Odmraza know-how.';
COMMENT ON COLUMN public.spar_sessions.knowhow_closed_at IS 'Zamkniecie know-how (button To juz wszystko). NULL=aktywny, timestamp=build.';

-- 2) spar_knowhow_items
CREATE TABLE IF NOT EXISTS public.spar_knowhow_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.spar_sessions(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES public.leads(id) ON DELETE SET NULL,
  kind text NOT NULL CHECK (kind IN ('wniosek','wymaganie','link','zalacznik','uwaga','cytat','intel_cenowy')),
  source_tag text NOT NULL DEFAULT 'klient' CHECK (source_tag IN ('klient','research')),
  content text NOT NULL,
  url text, file_path text, file_mime_type text,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  used_in_build boolean NOT NULL DEFAULT false, used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ski_session ON public.spar_knowhow_items(session_id);
CREATE INDEX IF NOT EXISTS idx_ski_kind ON public.spar_knowhow_items(kind);
CREATE INDEX IF NOT EXISTS idx_ski_created ON public.spar_knowhow_items(created_at DESC);

-- 3) spar_knowhow_summary
CREATE TABLE IF NOT EXISTS public.spar_knowhow_summary (
  session_id uuid PRIMARY KEY REFERENCES public.spar_sessions(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES public.leads(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','closed')),
  closed_at timestamptz,
  items_count int NOT NULL DEFAULT 0,
  wymagania_count int NOT NULL DEFAULT 0,
  zalaczniki_count int NOT NULL DEFAULT 0,
  summary_text text, summary_ai_generated_at timestamptz,
  idea_source text NOT NULL DEFAULT 'wlasny' CHECK (idea_source IN ('wlasny','ai','wspolny')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_sks_lead ON public.spar_knowhow_summary(lead_id);

-- 4) trigger updated_at
CREATE OR REPLACE FUNCTION public.tg_knowhow_set_updated_at() RETURNS trigger
  LANGUAGE plpgsql AS $$ BEGIN NEW.updated_at := now(); RETURN NEW; END; $$;
DROP TRIGGER IF EXISTS trg_ski_upd ON public.spar_knowhow_items;
CREATE TRIGGER trg_ski_upd BEFORE UPDATE ON public.spar_knowhow_items
  FOR EACH ROW EXECUTE FUNCTION public.tg_knowhow_set_updated_at();
DROP TRIGGER IF EXISTS trg_sks_upd ON public.spar_knowhow_summary;
CREATE TRIGGER trg_sks_upd BEFORE UPDATE ON public.spar_knowhow_summary
  FOR EACH ROW EXECUTE FUNCTION public.tg_knowhow_set_updated_at();

-- 5) RLS items (team_members gate; owner = created_by). NIE 'authenticated USING(true)'!
ALTER TABLE public.spar_knowhow_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS ski_admin_read ON public.spar_knowhow_items;
CREATE POLICY ski_admin_read ON public.spar_knowhow_items FOR SELECT TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM public.team_members));
DROP POLICY IF EXISTS ski_admin_insert ON public.spar_knowhow_items;
CREATE POLICY ski_admin_insert ON public.spar_knowhow_items FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IN (SELECT user_id FROM public.team_members));
DROP POLICY IF EXISTS ski_admin_update ON public.spar_knowhow_items;
CREATE POLICY ski_admin_update ON public.spar_knowhow_items FOR UPDATE TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM public.team_members))
  WITH CHECK (auth.uid() IN (SELECT user_id FROM public.team_members));
DROP POLICY IF EXISTS ski_admin_del ON public.spar_knowhow_items;
CREATE POLICY ski_admin_del ON public.spar_knowhow_items FOR DELETE TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM public.team_members));
DROP POLICY IF EXISTS ski_owner_read ON public.spar_knowhow_items;
CREATE POLICY ski_owner_read ON public.spar_knowhow_items FOR SELECT TO authenticated
  USING (created_by = auth.uid());
DROP POLICY IF EXISTS ski_owner_insert ON public.spar_knowhow_items;
CREATE POLICY ski_owner_insert ON public.spar_knowhow_items FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid() AND source_tag = 'klient');
DROP POLICY IF EXISTS ski_owner_update ON public.spar_knowhow_items;
CREATE POLICY ski_owner_update ON public.spar_knowhow_items FOR UPDATE TO authenticated
  USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid() AND source_tag = 'klient');

-- 6) RLS summary
ALTER TABLE public.spar_knowhow_summary ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS sks_admin_read ON public.spar_knowhow_summary;
CREATE POLICY sks_admin_read ON public.spar_knowhow_summary FOR SELECT TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM public.team_members));
DROP POLICY IF EXISTS sks_admin_insert ON public.spar_knowhow_summary;
CREATE POLICY sks_admin_insert ON public.spar_knowhow_summary FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IN (SELECT user_id FROM public.team_members));
DROP POLICY IF EXISTS sks_admin_update ON public.spar_knowhow_summary;
CREATE POLICY sks_admin_update ON public.spar_knowhow_summary FOR UPDATE TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM public.team_members))
  WITH CHECK (auth.uid() IN (SELECT user_id FROM public.team_members));
DROP POLICY IF EXISTS sks_owner_read ON public.spar_knowhow_summary;
CREATE POLICY sks_owner_read ON public.spar_knowhow_summary FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.spar_sessions s WHERE s.id = spar_knowhow_summary.session_id AND s.auth_user_id = auth.uid()));

-- 7) Grants (RLS zaweza wiersze; NIE revoke nic istniejacego)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.spar_knowhow_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.spar_knowhow_summary TO authenticated;
GRANT UPDATE (idea_source) ON public.spar_sessions TO authenticated;
