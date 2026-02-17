-- =====================================================
-- CRITICAL SECURITY FIX: Restrict anon UPDATE on workflows
-- =====================================================
-- Problem: Anon can UPDATE ANY column on ANY workflow row
-- Solution: Remove the dangerous policy and create a secure function
-- =====================================================

-- 1. Drop the dangerous policy
DROP POLICY IF EXISTS "Anon can update workflow for password" ON workflows;

-- 2. Create a secure function for setting client password
-- This function only allows setting client_password_hash via token lookup
CREATE OR REPLACE FUNCTION set_workflow_client_password(
    p_token TEXT,
    p_password_hash TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_workflow_id UUID;
BEGIN
    -- Find workflow by token
    SELECT id INTO v_workflow_id
    FROM workflows
    WHERE unique_token = p_token;

    IF v_workflow_id IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Update only the password hash
    UPDATE workflows
    SET client_password_hash = p_password_hash,
        updated_at = NOW()
    WHERE id = v_workflow_id;

    RETURN TRUE;
END;
$$;

-- 3. Grant execute permission to anon
GRANT EXECUTE ON FUNCTION set_workflow_client_password(TEXT, TEXT) TO anon;

-- 4. Create a function for password reset (validates reset token)
CREATE OR REPLACE FUNCTION reset_workflow_client_password(
    p_token TEXT,
    p_reset_token TEXT,
    p_password_hash TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_workflow RECORD;
BEGIN
    -- Find workflow by token and verify reset token
    SELECT id, password_reset_token, password_reset_expires
    INTO v_workflow
    FROM workflows
    WHERE unique_token = p_token;

    IF v_workflow.id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Workflow not found');
    END IF;

    -- Verify reset token matches
    IF v_workflow.password_reset_token IS NULL OR v_workflow.password_reset_token != p_reset_token THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid reset token');
    END IF;

    -- Check if reset token has expired
    IF v_workflow.password_reset_expires < NOW() THEN
        RETURN jsonb_build_object('success', false, 'error', 'Reset token expired');
    END IF;

    -- Update password and clear reset token
    UPDATE workflows
    SET client_password_hash = p_password_hash,
        password_reset_token = NULL,
        password_reset_expires = NULL,
        updated_at = NOW()
    WHERE id = v_workflow.id;

    RETURN jsonb_build_object('success', true);
END;
$$;

-- Grant execute permission to anon
GRANT EXECUTE ON FUNCTION reset_workflow_client_password(TEXT, TEXT, TEXT) TO anon;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- After this migration:
-- - Anon cannot UPDATE any workflow columns directly
-- - Password setting must go through set_workflow_client_password() function
-- - Password reset must go through reset_workflow_client_password() function
-- - Functions validate tokens and only update allowed columns
-- =====================================================
