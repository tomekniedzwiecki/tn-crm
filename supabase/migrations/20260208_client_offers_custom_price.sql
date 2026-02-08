-- Migration: Add custom_price to client_offers
-- Allows setting individual price per lead instead of using default offer price

ALTER TABLE client_offers
ADD COLUMN IF NOT EXISTS custom_price DECIMAL(10, 2) DEFAULT NULL;

COMMENT ON COLUMN client_offers.custom_price IS 'Custom price for this specific client offer. If NULL, use offer.price';
