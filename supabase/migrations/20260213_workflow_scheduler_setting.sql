-- Setting for auto-share products delay (in hours)
INSERT INTO settings (key, value)
VALUES ('workflow_auto_share_products_delay_hours', '4')
ON CONFLICT (key) DO NOTHING;

COMMENT ON TABLE settings IS 'workflow_auto_share_products_delay_hours - ile godzin po utworzeniu projektu automatycznie udostępnić produkty';
