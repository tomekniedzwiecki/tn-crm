-- 20260715g: uwagi Tomka 15.07 (sesja Dobry Wstęp)
-- (A) Krok `nazwa` na POCZĄTEK Etapu 1 (sort 50 -> 12): pytanie o nazwę+domenę ma paść
--     jak najszybciej po starcie flow, żeby zakup domeny/propagacja NS nie blokowały budowy.
-- (B) Nowy standardowy krok `logo` (Etap 1, zaraz po nazwie): logo + favicon generowane
--     z wybranej nazwy; JEDNO źródło w ustawieniach aplikacji (app_settings), z którego
--     korzystają landing, panel i maile.

UPDATE wfa_step_defs SET sort = 12 WHERE key = 'nazwa';

INSERT INTO wfa_step_defs (key, stage, stage_label, label, icon, sort, owner, milestone_label, active)
VALUES ('logo', 1, 'Fundament', 'Logo i favicon', 'ph-palette', 13, 'admin', NULL, true)
ON CONFLICT (key) DO NOTHING;
