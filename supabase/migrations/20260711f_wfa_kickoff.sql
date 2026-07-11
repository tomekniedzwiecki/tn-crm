-- Krok `kickoff` (E1, sort 15): po wycięciu akceptu klient nie miał ŻADNEGO punktu
-- startowego — nie wiedział, że ruszyliśmy, bez linku do portalu, bez prośby o dane
-- do umowy. Jeden mail kickoff załatwia wszystko + zapala pierwszy kamień w portalu.
INSERT INTO public.wfa_step_defs (key, stage, stage_label, label, icon, sort, owner, instructions_md, milestone_label) VALUES
('kickoff', 1, 'Fundament', 'Kickoff klienta', 'ph-flag', 15, 'admin', NULL, 'Budowa wystartowała')
ON CONFLICT (key) DO NOTHING;
