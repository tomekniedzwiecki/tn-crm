-- Etap 1 „Fundament sklepu" — kolejność wg decyzji Tomka 18.07: NAJPIERW wybór
-- produktów (portfel = kontekst nazwy parasolowej — nazwa musi objąć cały
-- asortyment), POTEM marka, na końcu domena. Krok 'marka' aktywuje się więc
-- w banerze „Następny krok" dopiero po wyborze (wybor done na produktach).
UPDATE public.wf2_step_defs SET sort = 5  WHERE key = 'wybor';
UPDATE public.wf2_step_defs SET sort = 10 WHERE key = 'marka';
UPDATE public.wf2_step_defs SET sort = 15 WHERE key = 'pl_domena';
