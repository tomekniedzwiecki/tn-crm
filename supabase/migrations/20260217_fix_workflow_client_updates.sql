-- =====================================================
-- FIX: Allow clients to update contract data and select products
-- =====================================================
-- Problem: After dropping anon UPDATE policy, clients can't:
-- 1. Submit contract data
-- 2. Select a product
-- Solution: Create secure RPC functions for these operations
-- =====================================================

-- 1. Function for updating contract data
CREATE OR REPLACE FUNCTION update_workflow_contract_data(
    p_token TEXT,
    p_customer_name TEXT DEFAULT NULL,
    p_customer_company TEXT DEFAULT NULL,
    p_customer_email TEXT DEFAULT NULL,
    p_customer_phone TEXT DEFAULT NULL,
    p_client_pesel TEXT DEFAULT NULL,
    p_client_id_number TEXT DEFAULT NULL,
    p_client_nip TEXT DEFAULT NULL,
    p_client_street TEXT DEFAULT NULL,
    p_client_postal_code TEXT DEFAULT NULL,
    p_client_city TEXT DEFAULT NULL,
    p_client_country TEXT DEFAULT NULL
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

    -- Update only allowed contract fields
    UPDATE workflows
    SET
        customer_name = COALESCE(p_customer_name, customer_name),
        customer_company = COALESCE(p_customer_company, customer_company),
        customer_email = COALESCE(p_customer_email, customer_email),
        customer_phone = COALESCE(p_customer_phone, customer_phone),
        client_pesel = COALESCE(p_client_pesel, client_pesel),
        client_id_number = COALESCE(p_client_id_number, client_id_number),
        client_nip = COALESCE(p_client_nip, client_nip),
        client_street = COALESCE(p_client_street, client_street),
        client_postal_code = COALESCE(p_client_postal_code, client_postal_code),
        client_city = COALESCE(p_client_city, client_city),
        client_country = COALESCE(p_client_country, client_country),
        contract_status = 'data_filled',
        contract_data_filled_at = NOW(),
        updated_at = NOW()
    WHERE id = v_workflow_id;

    RETURN TRUE;
END;
$$;

-- Grant execute permission to anon
GRANT EXECUTE ON FUNCTION update_workflow_contract_data(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO anon;

-- 2. Function for selecting a product
CREATE OR REPLACE FUNCTION update_workflow_selected_product(
    p_token TEXT,
    p_product_id UUID
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

    -- Update only selected_product_id
    UPDATE workflows
    SET
        selected_product_id = p_product_id,
        updated_at = NOW()
    WHERE id = v_workflow_id;

    RETURN TRUE;
END;
$$;

-- Grant execute permission to anon
GRANT EXECUTE ON FUNCTION update_workflow_selected_product(TEXT, UUID) TO anon;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
