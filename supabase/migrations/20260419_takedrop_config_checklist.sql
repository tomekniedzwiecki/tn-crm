-- ============================================================================
-- Checklist konfiguracji TakeDrop w widoku "Strona sprzedazowa" (Etap 3)
-- Zastepuje 4 osobne linki jednolista checkboxow.
-- (domain_connected juz istnieje - uzywany dla "Ustaw domene")
-- ============================================================================

ALTER TABLE workflow_takedrop
  ADD COLUMN IF NOT EXISTS td_product_added BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS td_product_added_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS td_html_added BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS td_html_added_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS td_logo_added BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS td_logo_added_at TIMESTAMPTZ;
