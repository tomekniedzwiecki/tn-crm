-- Deadline kroków: ujednolicenie do jednej wartości "3 dni robocze" zamiast 6 ustawień per krok.
-- Logika dni roboczych + lazy init deadline_resets[current_step] po stronie frontendu (workflows.html).
-- Stare ustawienia deadline_contract/product/report/branding/salespage/scenario zostają jako legacy
-- (nie są już czytane przez frontend, można wyczyścić ręcznie w razie potrzeby).

INSERT INTO settings (key, value)
VALUES ('deadline_step_business_days', '3')
ON CONFLICT (key) DO NOTHING;

COMMENT ON COLUMN workflows.deadline_resets IS 'Timestampy wejścia w każdy krok (ISO). Format: {"step_key": "YYYY-MM-DDTHH:MM:SS.SSSZ"}. Zapisywany lazy przy pierwszym widoku kroku w workflows.html. Deadline = start + N dni roboczych (N z settings.deadline_step_business_days).';
