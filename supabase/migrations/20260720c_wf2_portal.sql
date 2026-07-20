-- ═══════════════════════════════════════════════════════════════════════════
-- WF2 — BACKEND PORTALU KLIENTA (2026-07-20)
-- Portal klienta modułu „Sklepy" (edge wf2-portal, wzorzec wfa-portal):
--   1) wf2_projects: kolumna daty wysłania dostępu + e-mail konta klienta na
--      platformie panel.niedzwiecki.ai (do dopasowania sklepu / operatora).
--   2) Nowy krok kliencki pl_konto_klient (Etap 3) — klient zakłada darmowe
--      konto na platformie i podaje nam e-mail (zaraz po pl_sklep, przed pl_dane).
-- Idempotentne (IF NOT EXISTS / ON CONFLICT). RLS bez zmian — portal wchodzi
-- przez edge function (service-role), nie przez anon.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. PROJEKTY: dostęp portalu + e-mail konta na platformie ────────────────
ALTER TABLE public.wf2_projects
  ADD COLUMN IF NOT EXISTS access_mail_sent_at    timestamptz,
  ADD COLUMN IF NOT EXISTS platform_account_email text;   -- e-mail konta klienta na panel.niedzwiecki.ai

-- ── 2. NOWY KROK KLIENCKI: konto na platformie ─────────────────────────────
-- Etap 3 „Sklep na platformie", sort 15 = między pl_sklep (10) a pl_dane (20).
INSERT INTO public.wf2_step_defs
  (key, stage, stage_label, label, icon, sort, owner, scope, instructions_md, active) VALUES
('pl_konto_klient', 3, 'Sklep na platformie', 'Konto na platformie', 'ph-user-circle-plus', 15,
 'client', 'project',
 'Załóż darmowe konto na platformie https://panel.niedzwiecki.ai (rejestracja zajmuje chwilę) i podaj nam e-mail, na który je założyłeś — dzięki temu przypniemy do Ciebie sklep i nadamy uprawnienia.',
 true)
ON CONFLICT (key) DO UPDATE SET
  stage           = EXCLUDED.stage,
  stage_label     = EXCLUDED.stage_label,
  label           = EXCLUDED.label,
  icon            = EXCLUDED.icon,
  sort            = EXCLUDED.sort,
  owner           = EXCLUDED.owner,
  scope           = EXCLUDED.scope,
  instructions_md = EXCLUDED.instructions_md,
  active          = EXCLUDED.active;

-- ── 3. Przesiew instancji kroków dla wszystkich projektów (dosiewa pl_konto_klient) ──
SELECT public.wf2_ensure_steps(id) FROM public.wf2_projects;
