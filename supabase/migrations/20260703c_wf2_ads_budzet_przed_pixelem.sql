-- Workflow v2 (decyzja Tomka 2026-07-03): w etapie Kampanie BUDŻET idzie zaraz po
-- koncie reklamowym — „najpierw muszą wpłacić kasę", dopiero potem pixel i kreacje.
-- Nowa kolejność: ads_konto(10) → ads_budzet(15) → ads_pixel(20) → ads_grafiki(30) → ads_kampanie(40).
UPDATE public.wf2_step_defs SET sort = 15 WHERE key = 'ads_budzet';

-- Projekt nie ma własnej nazwy (identyfikacja po kliencie; docelowo wizytówka =
-- link do galerii landingów klienta). Kolumna name zostaje w schemacie, UI jej nie używa.
