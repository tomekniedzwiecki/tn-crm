-- =====================================================
-- Tabela kontraktów leasingowych
-- =====================================================

CREATE TABLE IF NOT EXISTS leasing_contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Dane umowy
    contract_number TEXT NOT NULL,
    lessor_name TEXT NOT NULL DEFAULT 'CA Auto Bank',

    -- Dane pojazdu
    vehicle_name TEXT NOT NULL,
    vin TEXT,
    registration_number TEXT,
    vehicle_type TEXT NOT NULL DEFAULT 'combustion', -- combustion, phev, electric

    -- Wartości
    vehicle_value_netto DECIMAL(12,2) NOT NULL, -- Pełna wartość auta netto
    financing_amount DECIMAL(12,2) NOT NULL,    -- Kwota finansowania
    residual_value DECIMAL(12,2) NOT NULL,      -- Wartość wykupu

    -- Raty
    installments_count INTEGER NOT NULL,
    monthly_installment_netto DECIMAL(10,2) NOT NULL,

    -- Daty
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,

    -- Opcje podatkowe
    usage_type TEXT NOT NULL DEFAULT 'mixed', -- mixed (50% VAT), business_only (100% VAT)

    -- Harmonogram (JSONB z wszystkimi ratami)
    payment_schedule JSONB,

    -- Metadata
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE leasing_contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage leasing_contracts"
    ON leasing_contracts FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Index
CREATE INDEX IF NOT EXISTS idx_leasing_contracts_active ON leasing_contracts(is_active);

-- =====================================================
-- Wstaw dane leasingu Mazda
-- =====================================================

INSERT INTO leasing_contracts (
    contract_number,
    lessor_name,
    vehicle_name,
    vin,
    registration_number,
    vehicle_type,
    vehicle_value_netto,
    financing_amount,
    residual_value,
    installments_count,
    monthly_installment_netto,
    start_date,
    end_date,
    usage_type,
    payment_schedule,
    notes
) VALUES (
    '6400019277',
    'CA Auto Bank S.p.A.',
    'Mazda CX-60',
    'JMZKH0HEX01372938',
    'DX1535F',
    'combustion',
    231643.09,
    213111.64,
    150709.05,
    35,
    2468.77,
    '2026-03-20',
    '2029-01-20',
    'mixed',
    '[
        {"nr": 1, "date": "2026-03-20", "total": 2468.77, "capital": 1734.73, "interest": 734.04, "remaining": 211376.91},
        {"nr": 2, "date": "2026-04-20", "total": 2468.77, "capital": 1662.70, "interest": 806.07, "remaining": 209714.21},
        {"nr": 3, "date": "2026-05-20", "total": 2468.77, "capital": 1694.83, "interest": 773.94, "remaining": 208019.38},
        {"nr": 4, "date": "2026-06-20", "total": 2468.77, "capital": 1675.50, "interest": 793.27, "remaining": 206343.88},
        {"nr": 5, "date": "2026-07-20", "total": 2468.77, "capital": 1707.28, "interest": 761.49, "remaining": 204636.60},
        {"nr": 6, "date": "2026-08-20", "total": 2468.77, "capital": 1688.40, "interest": 780.37, "remaining": 202948.20},
        {"nr": 7, "date": "2026-09-20", "total": 2468.77, "capital": 1694.84, "interest": 773.93, "remaining": 201253.36},
        {"nr": 8, "date": "2026-10-20", "total": 2468.77, "capital": 1726.06, "interest": 742.71, "remaining": 199527.30},
        {"nr": 9, "date": "2026-11-20", "total": 2468.77, "capital": 1707.89, "interest": 760.88, "remaining": 197819.41},
        {"nr": 10, "date": "2026-12-20", "total": 2468.77, "capital": 1738.74, "interest": 730.03, "remaining": 196080.67},
        {"nr": 11, "date": "2027-01-20", "total": 2468.77, "capital": 1721.03, "interest": 747.74, "remaining": 194359.64},
        {"nr": 12, "date": "2027-02-20", "total": 2468.77, "capital": 1727.59, "interest": 741.18, "remaining": 192632.05},
        {"nr": 13, "date": "2027-03-20", "total": 2468.77, "capital": 1805.27, "interest": 663.50, "remaining": 190826.78},
        {"nr": 14, "date": "2027-04-20", "total": 2468.77, "capital": 1741.07, "interest": 727.70, "remaining": 189085.71},
        {"nr": 15, "date": "2027-05-20", "total": 2468.77, "capital": 1770.97, "interest": 697.80, "remaining": 187314.74},
        {"nr": 16, "date": "2027-06-20", "total": 2468.77, "capital": 1754.46, "interest": 714.31, "remaining": 185560.28},
        {"nr": 17, "date": "2027-07-20", "total": 2468.77, "capital": 1783.97, "interest": 684.80, "remaining": 183776.31},
        {"nr": 18, "date": "2027-08-20", "total": 2468.77, "capital": 1767.95, "interest": 700.82, "remaining": 182008.36},
        {"nr": 19, "date": "2027-09-20", "total": 2468.77, "capital": 1774.69, "interest": 694.08, "remaining": 180233.67},
        {"nr": 20, "date": "2027-10-20", "total": 2468.77, "capital": 1803.64, "interest": 665.13, "remaining": 178430.03},
        {"nr": 21, "date": "2027-11-20", "total": 2468.77, "capital": 1788.34, "interest": 680.43, "remaining": 176641.69},
        {"nr": 22, "date": "2027-12-20", "total": 2468.77, "capital": 1816.89, "interest": 651.88, "remaining": 174824.80},
        {"nr": 23, "date": "2028-01-20", "total": 2468.77, "capital": 1803.21, "interest": 665.56, "remaining": 173021.59},
        {"nr": 24, "date": "2028-02-20", "total": 2468.77, "capital": 1810.77, "interest": 658.00, "remaining": 171210.82},
        {"nr": 25, "date": "2028-03-20", "total": 2468.77, "capital": 1859.67, "interest": 609.10, "remaining": 169351.15},
        {"nr": 26, "date": "2028-04-20", "total": 2468.77, "capital": 1824.73, "interest": 644.04, "remaining": 167526.42},
        {"nr": 27, "date": "2028-05-20", "total": 2468.77, "capital": 1852.22, "interest": 616.55, "remaining": 165674.20},
        {"nr": 28, "date": "2028-06-20", "total": 2468.77, "capital": 1838.71, "interest": 630.06, "remaining": 163835.49},
        {"nr": 29, "date": "2028-07-20", "total": 2468.77, "capital": 1865.80, "interest": 602.97, "remaining": 161969.69},
        {"nr": 30, "date": "2028-08-20", "total": 2468.77, "capital": 1852.79, "interest": 615.98, "remaining": 160116.90},
        {"nr": 31, "date": "2028-09-20", "total": 2468.77, "capital": 1859.84, "interest": 608.93, "remaining": 158257.06},
        {"nr": 32, "date": "2028-10-20", "total": 2468.77, "capital": 1886.33, "interest": 582.44, "remaining": 156370.73},
        {"nr": 33, "date": "2028-11-20", "total": 2468.77, "capital": 1874.09, "interest": 594.68, "remaining": 154496.64},
        {"nr": 34, "date": "2028-12-20", "total": 2468.77, "capital": 1900.17, "interest": 568.60, "remaining": 152596.47},
        {"nr": 35, "date": "2029-01-20", "total": 2468.72, "capital": 1887.42, "interest": 581.30, "remaining": 150709.05}
    ]'::jsonb,
    'Leasing operacyjny Mazda CX-60. Użytek mieszany - 50% VAT, 75% eksploatacji.'
);
