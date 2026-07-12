-- ============================================================================
-- WFA flow v2 — rewizja po researchu (FLOW-AUTONOMIA-PLAN.md §10, METODYKA-BUDOWY.md)
-- deadline_at (zegar umowny) + 6 nowych kroków (pricing, dane_operatora,
-- review_adwersarski, demo_klienta, poprawki_demo, monthly) + korekty seedu.
-- wfa_ensure_steps dosieje instancje istniejącym projektom przy load panelu.
-- ============================================================================

ALTER TABLE public.wfa_projects ADD COLUMN IF NOT EXISTS deadline_at date;
COMMENT ON COLUMN public.wfa_projects.deadline_at IS 'Termin umowny oddania (oferta: 4-8 tyg. od pełnej płatności)';

-- Przesunięcie sortów w Etapie 4 (miejsce na pętlę demo klienta PRZED audytem)
UPDATE public.wfa_step_defs SET sort = 50 WHERE key = 'audyt';
UPDATE public.wfa_step_defs SET sort = 60 WHERE key = 'poprawki';

-- Lifecycle zamiast czysto transakcyjnych (etykieta; klucz i checklisty bez zmian)
UPDATE public.wfa_step_defs SET label = 'Lifecycle e-maile' WHERE key = 'maile_trans';

INSERT INTO public.wfa_step_defs (key, stage, stage_label, label, icon, sort, owner, instructions_md, milestone_label) VALUES
('pricing',            1, 'Fundament',        'Pricing i plany',        'ph-tag',              45, 'admin',
 NULL, NULL),
('dane_operatora',     3, 'Budowa MVP',       'Dane operatora',         'ph-upload-simple',    15, 'client',
 'Przekaż nam dane i materiały do wypełnienia aplikacji (np. cennik, biblioteka pozycji, treści branżowe) — my je zdigitalizujemy i wgramy.', NULL),
('review_adwersarski', 3, 'Budowa MVP',       'Review adwersarski',     'ph-detective',        90, 'admin',
 NULL, NULL),
('demo_klienta',       4, 'Landing i jakość', 'Demo dla klienta',       'ph-monitor-play',     30, 'client',
 'Przetestuj wersję roboczą aplikacji na linku, który od nas dostaniesz, i zgłoś wszystkie uwagi — to jest moment na poprawki w ramach pierwszej wersji.', 'Wersja robocza pokazana klientowi'),
('poprawki_demo',      4, 'Landing i jakość', 'Poprawki po demo',       'ph-arrows-clockwise', 40, 'admin',
 NULL, NULL),
('monthly',            5, 'Start',            'Przegląd miesięczny ×3', 'ph-calendar-check',   60, 'admin',
 NULL, NULL)
ON CONFLICT (key) DO NOTHING;
