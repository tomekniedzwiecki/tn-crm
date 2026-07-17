-- /trendy v3: powód odrzucenia (structured rejection — 87% decyzji to reject;
-- powody budują dane do strojenia auto-filtra). Wartości: za-drogie, slaba-marza,
-- gabaryt-wysylka, marka-licencja, moda-odziez, commodity-nuda, zly-produkt, inne.
-- APPLIED 2026-07-17 przez MCP — plik dla spójności repo.
alter table bud_tt_products add column if not exists reject_reason text;
