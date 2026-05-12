-- TakeDrop: drugi gate — klient potwierdza, że konto FAKTYCZNIE działa
-- (karta podpięta, brak blokady billingu) zanim ruszamy ze stroną sprzedażową.
--
-- Semantyka:
--   account_created   - klient podał email/hasło (Step 2 portalu klienta)
--   account_active    - klient zalogował się i potwierdził, że konto jest aktywne (NOWE)
--   account_active_at - kiedy potwierdzono
--   account_active_confirmed_by - 'client' lub 'admin' (admin może wymusić/cofnąć)

ALTER TABLE workflow_takedrop
  ADD COLUMN IF NOT EXISTS account_active BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS account_active_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS account_active_confirmed_by TEXT
    CHECK (account_active_confirmed_by IN ('client', 'admin') OR account_active_confirmed_by IS NULL);

COMMENT ON COLUMN workflow_takedrop.account_active IS 'Klient zweryfikował (zalogowanie + sprawdzenie billingu), że konto TakeDrop faktycznie działa. Blokuje przejście do landing page.';
COMMENT ON COLUMN workflow_takedrop.account_active_at IS 'Kiedy potwierdzono aktywację konta';
COMMENT ON COLUMN workflow_takedrop.account_active_confirmed_by IS 'Kto potwierdził: client (sam klient) lub admin (admin wymusił)';

-- RPC dla klienta (anon przez unique_token) — potwierdza aktywację konta
CREATE OR REPLACE FUNCTION confirm_workflow_takedrop_active(
    p_token TEXT,
    p_active BOOLEAN DEFAULT TRUE
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_workflow_id UUID;
    v_account_created BOOLEAN;
BEGIN
    SELECT id INTO v_workflow_id
    FROM workflows
    WHERE unique_token = p_token;

    IF v_workflow_id IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Klient może potwierdzić aktywację tylko gdy najpierw założył konto (Step 2)
    SELECT account_created INTO v_account_created
    FROM workflow_takedrop
    WHERE workflow_id = v_workflow_id AND is_active = TRUE;

    IF NOT COALESCE(v_account_created, FALSE) THEN
        RETURN FALSE;
    END IF;

    UPDATE workflow_takedrop
    SET
        account_active = p_active,
        account_active_at = CASE WHEN p_active THEN NOW() ELSE NULL END,
        account_active_confirmed_by = CASE WHEN p_active THEN 'client' ELSE NULL END,
        updated_at = NOW()
    WHERE workflow_id = v_workflow_id;

    RETURN TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION confirm_workflow_takedrop_active(TEXT, BOOLEAN) TO anon;
