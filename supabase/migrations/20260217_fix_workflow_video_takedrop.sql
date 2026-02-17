-- =====================================================
-- FIX: Allow clients to create video record and confirm TakeDrop account
-- =====================================================
-- Problem: After security review, clients can't:
-- 1. Create initial workflow_video record (no anon INSERT)
-- 2. Confirm TakeDrop account (no anon UPDATE)
-- Solution: Create secure RPC functions for these operations
-- =====================================================

-- 1. Function for creating workflow_video record
-- Only allows creating record with workflow_id (via token lookup)
CREATE OR REPLACE FUNCTION create_workflow_video_record(
    p_token TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_workflow_id UUID;
    v_video_id UUID;
BEGIN
    -- Find workflow by token
    SELECT id INTO v_workflow_id
    FROM workflows
    WHERE unique_token = p_token;

    IF v_workflow_id IS NULL THEN
        RETURN NULL;
    END IF;

    -- Check if record already exists
    SELECT id INTO v_video_id
    FROM workflow_video
    WHERE workflow_id = v_workflow_id;

    IF v_video_id IS NOT NULL THEN
        RETURN v_video_id; -- Return existing ID
    END IF;

    -- Create new record with empty video_links
    INSERT INTO workflow_video (workflow_id, video_links, is_active)
    VALUES (v_workflow_id, '[]'::jsonb, TRUE)
    RETURNING id INTO v_video_id;

    RETURN v_video_id;
END;
$$;

GRANT EXECUTE ON FUNCTION create_workflow_video_record(TEXT) TO anon;

-- 2. Function for confirming TakeDrop account
-- Client confirms they've created their account
CREATE OR REPLACE FUNCTION confirm_workflow_takedrop_account(
    p_token TEXT,
    p_account_email TEXT,
    p_account_password TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_workflow_id UUID;
    v_takedrop_exists BOOLEAN;
BEGIN
    -- Find workflow by token
    SELECT id INTO v_workflow_id
    FROM workflows
    WHERE unique_token = p_token;

    IF v_workflow_id IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Check if takedrop record exists and is active
    SELECT EXISTS(
        SELECT 1 FROM workflow_takedrop
        WHERE workflow_id = v_workflow_id AND is_active = TRUE
    ) INTO v_takedrop_exists;

    IF NOT v_takedrop_exists THEN
        RETURN FALSE;
    END IF;

    -- Update only allowed fields
    UPDATE workflow_takedrop
    SET
        account_email = p_account_email,
        account_password = p_account_password,
        account_created = TRUE,
        account_created_at = COALESCE(account_created_at, NOW()),
        updated_at = NOW()
    WHERE workflow_id = v_workflow_id;

    RETURN TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION confirm_workflow_takedrop_account(TEXT, TEXT, TEXT) TO anon;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
