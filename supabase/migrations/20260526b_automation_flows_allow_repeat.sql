-- =============================================
-- automation_flows.allow_repeat
-- =============================================
-- Default zachowanie: 1 trigger per (flow, entity) — UPSERT ignoreDuplicates
-- chroni przed race condition. Dla flow ktore moga sie powtorzyc dla tego
-- samego workflow (np. admin wielokrotnie cofa aktywacje konta, klient
-- wielokrotnie zmienia dane prawne), trzeba dopuscic powtorzenia.
-- automation-trigger sprawdza ta flage przed UPSERTem.

ALTER TABLE automation_flows
ADD COLUMN IF NOT EXISTS allow_repeat BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN automation_flows.allow_repeat IS
'Czy flow moze sie powtorzyc dla tego samego (entity_type, entity_id). Default false (1x per entity).';

-- Wlacz dla flow gdzie powtorzenie jest naturalne:
UPDATE automation_flows
SET allow_repeat = TRUE
WHERE trigger_type IN (
  'takedrop_account_revoked',  -- admin cofa wielokrotnie (zle haslo)
  'legal_data_submitted',      -- klient zmienia dane prawne
  'budget_not_funded'          -- ponawiamy przypomnienia o budzecie
);
