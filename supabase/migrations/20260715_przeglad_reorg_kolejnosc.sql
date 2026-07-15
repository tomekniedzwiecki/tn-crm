-- Reorganizacja etapów TN App (decyzja Tomka 15.07): cała JAKOŚĆ w jednym etapie
-- „Przegląd i jakość" z wymuszoną kolejnością; Landing = tylko budowa.
-- Kolejność Przeglądu: suita E2E (fundament dowodów) -> soczewki (logika -> zgodność
-- -> landing-krytyk -> UX user -> UX admin -> treść) -> poprawki -> pętla do wyczerpania
-- -> AUDYT NA KOŃCU (audytuje stan finalny, nie sprzed poprawek).
-- Kamień „pełny przegląd" przenosi się z kroku poprawki na audyt (koniec etapu).

-- 1) Landing: zostaje tylko budowa (research/koncept/landing bez zmian).
UPDATE wfa_step_defs SET stage=5, sort=5,  label='Przegląd: testy przepływów (suita E2E)' WHERE key='testy_e2e';
UPDATE wfa_step_defs SET stage=5, sort=20, label='Przegląd: landing (krytyk z benchmarkami)' WHERE key='landing_krytyk';

-- 2) Etap 5: nazwa + kolejność soczewek i domknięć.
UPDATE wfa_step_defs SET stage_label='Przegląd i jakość' WHERE stage=5;
UPDATE wfa_step_defs SET sort=10 WHERE key='review_adwersarski';
UPDATE wfa_step_defs SET sort=15 WHERE key='review_zgodnosc';
UPDATE wfa_step_defs SET sort=25 WHERE key='review_ux';
UPDATE wfa_step_defs SET sort=30 WHERE key='review_ux_admin';
UPDATE wfa_step_defs SET sort=35 WHERE key='review_tresc';
UPDATE wfa_step_defs SET sort=50, label='Poprawki z przeglądu (wykonanie)' WHERE key='poprawki';
UPDATE wfa_step_defs SET sort=55, label='Pętla poprawek — do wyczerpania' WHERE key='ux_petla';
UPDATE wfa_step_defs SET sort=60 WHERE key='audyt';

-- 3) Kamień milowy „pełny przegląd" na KONIEC etapu (audyt).
UPDATE wfa_step_defs SET milestone_label=NULL WHERE key='poprawki';
UPDATE wfa_step_defs SET milestone_label='Aplikacja przeszła pełny przegląd' WHERE key='audyt';
