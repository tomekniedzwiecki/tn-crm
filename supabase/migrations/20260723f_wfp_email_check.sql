-- 20260723f_wfp_email_check.sql — Prospektor: wynik higieny/weryfikacji e-maila prospekta.
-- Zapisywany przez scripts/wfp-verify-emails.mjs --apply. Wartości: 'ok' | 'typo' | 'no_mx' | 'bad'
-- (NULL = niesprawdzony). NIC więcej — sam magazyn na werdykt weryfikacji. Idempotentne.
ALTER TABLE public.wfp_prospects ADD COLUMN IF NOT EXISTS email_check text;
