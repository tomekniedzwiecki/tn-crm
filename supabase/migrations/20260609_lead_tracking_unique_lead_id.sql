-- Luka 1: lead-upsert zapisywal tracking TYLKO przy tworzeniu nowego leada.
-- Returning lead wracajacy z nowego klikniecia reklamy gubil swiezy gclid/fbclid.
-- Dodajemy UNIQUE(lead_id), zeby lead-upsert mogl robic upsert (onConflict: lead_id)
-- i odswiezac tracking takze przy powrocie istniejacego leada.
-- Webhooki (tpay/revolut) czytaja lead_tracking przez .single() po lead_id,
-- wiec MUSI byc <=1 wiersz na leada — ten constraint to gwarantuje.
-- Zweryfikowano przed migracja: 0 nulli, 0 duplikatow, max 1 wiersz/lead.

ALTER TABLE lead_tracking
  ADD CONSTRAINT lead_tracking_lead_id_unique UNIQUE (lead_id);
