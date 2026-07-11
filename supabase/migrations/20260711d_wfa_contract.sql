-- ============================================================================
-- WFA: mechanizm umowy (odwzorowanie tn-crm workflow.html/client-projekt.html)
-- Szablon: umowy/umowa-budowa-aplikacji.html (v3, placeholdery {{...}}).
-- Render ZAWSZE w locie (szablon/custom + podstawienie) — lekcja „baked
-- placeholders" z tn-crm: zapis custom_html wymaga obecności placeholderów.
-- Pliki podpisane: Storage attachments/wfa/<project_id>/umowa-*.pdf
-- ============================================================================

ALTER TABLE public.wfa_projects
  ADD COLUMN IF NOT EXISTS contract_status text NOT NULL DEFAULT 'brak'
    CHECK (contract_status IN ('brak','dane_klienta','do_podpisu','podpisana_klient','podpisana')),
  ADD COLUMN IF NOT EXISTS contract_fields jsonb NOT NULL DEFAULT '{}'::jsonb,  -- {company,nip,street,postal,city,termin_tygodni}
  ADD COLUMN IF NOT EXISTS contract_custom_html text,
  ADD COLUMN IF NOT EXISTS contract_generated_at timestamptz,
  ADD COLUMN IF NOT EXISTS contract_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS contract_client_signed_path text,   -- skan/plik podpisany przez klienta
  ADD COLUMN IF NOT EXISTS contract_final_path text,           -- obustronnie podpisana (wgrywa Tomek)
  ADD COLUMN IF NOT EXISTS contract_signed_at timestamptz;

COMMENT ON COLUMN public.wfa_projects.contract_status IS 'brak → dane_klienta (portal zbiera dane) → do_podpisu (wygenerowana/wysłana) → podpisana_klient → podpisana (finalna wgrana)';

-- Krok „Umowa" w Etapie 1 (między domeną 60 a akceptem 70)
INSERT INTO public.wfa_step_defs (key, stage, stage_label, label, icon, sort, owner, instructions_md, milestone_label) VALUES
('umowa', 1, 'Fundament', 'Umowa', 'ph-file-text', 68, 'client',
 'Uzupełnij dane do umowy w swoim portalu, a potem podpisz umowę zgodnie z instrukcją (podpis odręczny na wydruku lub kwalifikowany podpis elektroniczny).',
 'Umowa podpisana')
ON CONFLICT (key) DO NOTHING;
