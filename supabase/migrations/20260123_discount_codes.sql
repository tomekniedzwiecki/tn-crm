-- ============================================
-- DISCOUNT CODES / KODY RABATOWE
-- ============================================

CREATE TABLE IF NOT EXISTS discount_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT NOT NULL,
    offer_id UUID REFERENCES offers(id) ON DELETE CASCADE, -- NULL = applies to all offers

    -- Discount calculation
    original_price DECIMAL(10,2), -- Original price (from offer or custom)
    target_price DECIMAL(10,2) NOT NULL, -- Final price after discount
    discount_amount DECIMAL(10,2) GENERATED ALWAYS AS (original_price - target_price) STORED,
    discount_percent DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE WHEN original_price > 0 THEN ROUND(((original_price - target_price) / original_price) * 100, 2) ELSE 0 END
    ) STORED,

    -- Usage limits
    uses_limit INTEGER, -- NULL = unlimited
    uses_count INTEGER DEFAULT 0,

    -- Validity
    valid_from TIMESTAMPTZ DEFAULT NOW(),
    valid_until TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,

    -- Metadata
    description TEXT, -- Internal note
    created_by UUID REFERENCES team_members(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Unique code per offer (or globally if offer_id is NULL)
    UNIQUE(code, offer_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_discount_codes_code ON discount_codes(code);
CREATE INDEX IF NOT EXISTS idx_discount_codes_offer ON discount_codes(offer_id);
CREATE INDEX IF NOT EXISTS idx_discount_codes_active ON discount_codes(is_active) WHERE is_active = true;

-- Trigger for updated_at
CREATE TRIGGER update_discount_codes_updated_at
    BEFORE UPDATE ON discount_codes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can manage discount codes"
    ON discount_codes FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Allow anonymous users to validate codes (for checkout)
CREATE POLICY "Anyone can read active discount codes"
    ON discount_codes FOR SELECT
    TO anon
    USING (is_active = true);

-- Function to validate and get discount code
CREATE OR REPLACE FUNCTION validate_discount_code(
    p_code TEXT,
    p_offer_id UUID
) RETURNS TABLE (
    id UUID,
    code TEXT,
    target_price DECIMAL,
    discount_amount DECIMAL,
    discount_percent DECIMAL,
    is_valid BOOLEAN,
    error_message TEXT
) AS $$
DECLARE
    v_code RECORD;
BEGIN
    -- Find the code (either for specific offer or global)
    SELECT dc.* INTO v_code
    FROM discount_codes dc
    WHERE UPPER(dc.code) = UPPER(p_code)
      AND (dc.offer_id = p_offer_id OR dc.offer_id IS NULL)
      AND dc.is_active = true
    ORDER BY dc.offer_id NULLS LAST -- Prefer offer-specific codes
    LIMIT 1;

    -- Code not found
    IF v_code IS NULL THEN
        RETURN QUERY SELECT
            NULL::UUID, p_code, NULL::DECIMAL, NULL::DECIMAL, NULL::DECIMAL,
            false, 'Nieprawidłowy kod rabatowy'::TEXT;
        RETURN;
    END IF;

    -- Check validity period
    IF v_code.valid_from IS NOT NULL AND v_code.valid_from > NOW() THEN
        RETURN QUERY SELECT
            v_code.id, v_code.code, NULL::DECIMAL, NULL::DECIMAL, NULL::DECIMAL,
            false, 'Kod rabatowy jeszcze nie jest aktywny'::TEXT;
        RETURN;
    END IF;

    IF v_code.valid_until IS NOT NULL AND v_code.valid_until < NOW() THEN
        RETURN QUERY SELECT
            v_code.id, v_code.code, NULL::DECIMAL, NULL::DECIMAL, NULL::DECIMAL,
            false, 'Kod rabatowy wygasł'::TEXT;
        RETURN;
    END IF;

    -- Check usage limit
    IF v_code.uses_limit IS NOT NULL AND v_code.uses_count >= v_code.uses_limit THEN
        RETURN QUERY SELECT
            v_code.id, v_code.code, NULL::DECIMAL, NULL::DECIMAL, NULL::DECIMAL,
            false, 'Kod rabatowy został już wykorzystany'::TEXT;
        RETURN;
    END IF;

    -- Code is valid
    RETURN QUERY SELECT
        v_code.id, v_code.code, v_code.target_price, v_code.discount_amount, v_code.discount_percent,
        true, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment usage count
CREATE OR REPLACE FUNCTION use_discount_code(p_code_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE discount_codes
    SET uses_count = uses_count + 1,
        updated_at = NOW()
    WHERE id = p_code_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add discount_code_id to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_code_id UUID REFERENCES discount_codes(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS original_amount DECIMAL(10,2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2);
