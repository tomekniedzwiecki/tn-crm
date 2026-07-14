-- Moduły fabryki: Wiadomości (centrum maili + seria trialowa) i Polecenia (referral).
-- Decyzja Tomka 14.07. Koncepty: docs/stworze/MODUL-WIADOMOSCI.md, MODUL-POLECENIA.md,
-- research-polecenia.md. Kroki w Etapie 3 (Budowa MVP); uruchomienie poleceń dopisane do gtm_50 (E6).
-- Pole logo marki aplikacji w ustawieniach projektu (maile apki: nagłówek z logo/placeholder).
-- Zaaplikowane przez MCP 14.07 (przed pushem kodu).

ALTER TABLE wfa_projects ADD COLUMN IF NOT EXISTS brand_logo_url text;

INSERT INTO wfa_step_defs (key, stage, stage_label, sort, label, icon, owner, active) VALUES
 ('wiadomosci_panel', 3, 'Budowa MVP', 82, 'Wiadomości: centrum w panelu', 'ph-envelope-open', 'admin', true),
 ('wiadomosci_trial', 3, 'Budowa MVP', 84, 'Wiadomości: seria trialowa',   'ph-flow-arrow',    'admin', true),
 ('polecenia',        3, 'Budowa MVP', 86, 'Program poleceń (referral)',   'ph-gift',          'admin', true)
ON CONFLICT (key) DO NOTHING;
