-- Fix: Add validation to prevent selecting product before products are shared

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
    v_products_shared_at TIMESTAMPTZ;
BEGIN
    -- Find workflow by token and check if products are shared
    SELECT id, products_shared_at INTO v_workflow_id, v_products_shared_at
    FROM workflows
    WHERE unique_token = p_token;

    IF v_workflow_id IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Validate: products must be shared before client can select
    IF v_products_shared_at IS NULL THEN
        RAISE EXCEPTION 'Products not yet shared for this workflow';
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
