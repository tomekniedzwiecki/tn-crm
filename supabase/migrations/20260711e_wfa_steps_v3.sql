-- ============================================================================
-- WFA kroki v3 (feedback Tomka z panelu, 11.07 wieczorem):
-- 1) `zalaczniki` OUT — materiały klienta zbiera SPOWIEDNIK (etap lejka); dane
--    domenowe do produktu ma krok `dane_operatora` (E3). Zero dosyłania w E1.
-- 2) `nazwa` + `domena` = JEDEN krok „Nazwa i domena" (sesja proponuje 10 nazw
--    z wolnymi .pl, wybór w rozmowie; Tomkowi zostaje tylko zakup + DNS).
-- 3) `akcept_klienta` OUT — klient ocenia GOTOWE MVP przy demo (krok demo_klienta),
--    zakres formalnie wiąże Załącznik 1 umowy.
-- 4) NOWY krok E3 `design` — system designu przez Claude Design (spójny, profesjonalny),
--    na bazie makiet sparingu i ustaleń.
-- Instancje usuwanych kroków kasujemy (inaczej zawyżają liczniki postępu).
-- ============================================================================

UPDATE public.wfa_step_defs SET active = false WHERE key IN ('zalaczniki','domena','akcept_klienta');
DELETE FROM public.wfa_steps WHERE step_key IN ('zalaczniki','domena','akcept_klienta');

UPDATE public.wfa_step_defs
SET label = 'Nazwa i domena', icon = 'ph-globe',
    milestone_label = 'Nazwa i domena wybrane'
WHERE key = 'nazwa';

INSERT INTO public.wfa_step_defs (key, stage, stage_label, label, icon, sort, owner, instructions_md, milestone_label) VALUES
('design', 3, 'Budowa MVP', 'Design (system)', 'ph-palette', 17, 'admin', NULL, NULL)
ON CONFLICT (key) DO NOTHING;
