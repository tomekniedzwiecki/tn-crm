-- Etap „Przegląd" (decyzja Tomka 14.07.2026): duży przegląd jakości jako OSOBNY etap workflow
-- aplikacji, rozbity na soczewki (logika/bezpieczeństwo/UX/treść) + poprawki. Start przesunięty
-- na etap 6 i zaczyna się od Demo (klient ogląda apkę PO przeglądzie).
-- Zaaplikowane przez MCP 14.07 (przed pushem kodu). wfa_ensure_steps dosypuje nowe kroki projektom.

UPDATE wfa_step_defs SET stage=6 WHERE stage=5;
UPDATE wfa_step_defs SET stage=6, sort=5,  stage_label='Start' WHERE key='demo_klienta';
UPDATE wfa_step_defs SET stage=6, sort=8,  stage_label='Start' WHERE key='poprawki_demo';
UPDATE wfa_step_defs SET stage=5, stage_label='Przegląd', sort=10, label='Przegląd: logika (adwersarski)', icon='ph-magnifying-glass' WHERE key='review_adwersarski';
UPDATE wfa_step_defs SET stage=5, stage_label='Przegląd', sort=20, label='Przegląd: bezpieczeństwo (audyt)' WHERE key='audyt';
INSERT INTO wfa_step_defs (key, stage, stage_label, sort, label, icon, owner, active) VALUES
 ('review_ux',    5, 'Przegląd', 30, 'Przegląd: UX oczami usera',  'ph-eye',     'admin', true),
 ('review_tresc', 5, 'Przegląd', 40, 'Przegląd: treść i zgodność', 'ph-text-aa', 'admin', true)
ON CONFLICT (key) DO NOTHING;
UPDATE wfa_step_defs SET stage=5, stage_label='Przegląd', sort=50, label='Poprawki z przeglądu', milestone_label='Aplikacja przeszła pełny przegląd' WHERE key='poprawki';
UPDATE wfa_step_defs SET stage_label='Landing i testy' WHERE stage=4;

-- Uzupełnienie (decyzja Tomka 14.07, później tego dnia): soczewka zgodności z ustaleniami klienta
-- (rozmowa sparingowa + spowiednik + handoff) jako osobny krok Przeglądu. Zaaplikowane przez MCP.
INSERT INTO wfa_step_defs (key, stage, stage_label, sort, label, icon, owner, active) VALUES
 ('review_zgodnosc', 5, 'Przegląd', 45, 'Przegląd: zgodność z ustaleniami', 'ph-handshake', 'admin', true)
ON CONFLICT (key) DO NOTHING;
