-- Moduł „Testy klienta" (spowiednik testów) — nowy krok workflow (koncept:
-- docs/stworze/MODUL-TESTY-KLIENTA.md). Tabele wfa_test_* dokłada migracja modułu (budowa).
INSERT INTO wfa_step_defs (key, stage, stage_label, sort, label, icon, owner, milestone_label, active)
VALUES ('testy_klienta', 6, 'Start', 6, 'Testy klienta (zgłoszenia)', 'ph-chats-circle', 'client',
        'Uwagi z testów zebrane', true)
ON CONFLICT (key) DO UPDATE SET stage=EXCLUDED.stage, sort=EXCLUDED.sort,
  label=EXCLUDED.label, icon=EXCLUDED.icon, owner=EXCLUDED.owner,
  milestone_label=EXCLUDED.milestone_label, active=true;
