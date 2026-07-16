-- 20260716f: nowy krok `onboarding` (Etap 3 — Budowa MVP)
-- SSOT: docs/stworze/ONBOARDING-FABRYKA.md §3 (protokół per projekt) i §5 (umiejscowienie w etapach).
-- Onboarding = luka fabryki (user wchodzi i nie wie, co robić). Krok KONSOLIDUJE rozproszone
-- elementy (welcome/nudge/demo-seed/checklist) w spójny framework „Setup → Aha → Habit"
-- i uzupełnia luki (milestone-mail, survey-routing, checklist §1.5, empty-states, instrumentacja,
-- dashboard aktywacji). PO rdzeniu + panelach + mailach (aha znany, silnik maili istnieje) —
-- sort 88 (po `polecenia`=86). Owner: admin.

INSERT INTO wfa_step_defs (key, stage, stage_label, label, icon, sort, owner, milestone_label, active)
VALUES ('onboarding', 3, 'Budowa MVP', 'Onboarding użytkownika', 'ph-hand-waving', 88, 'admin',
        'Onboarding gotowy — user wie, co robić', true)
ON CONFLICT (key) DO NOTHING;

-- Zmaterializuj krok w istniejących projektach TN App (idempotentne — wfa_steps ma NOT EXISTS guard)
SELECT public.wfa_ensure_steps('858427d1-107f-48a9-9b91-3fe4999702e0');  -- Dobry Wstęp
SELECT public.wfa_ensure_steps('102e4c74-ae3d-4cbf-885d-0826b283f7e6');  -- fachmat
