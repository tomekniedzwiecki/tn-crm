-- Add client_offer_id to discount_codes for linking discounts to specific client offers
ALTER TABLE discount_codes
ADD COLUMN IF NOT EXISTS client_offer_id UUID REFERENCES client_offers(id) ON DELETE SET NULL;

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_discount_codes_client_offer ON discount_codes(client_offer_id);

-- Allow anon users to read client_offer_id (needed for checkout)
-- (already covered by existing policy "Anyone can read active discount codes")
