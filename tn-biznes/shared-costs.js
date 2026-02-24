/**
 * Centralny serwis kosztow dla TN Biznes
 *
 * Wszystkie strony (costs, dashboard, taxes) powinny uzywac tego serwisu
 * zamiast duplikowac logike pobierania kosztow.
 *
 * Uzycie:
 *   const costs = await CostsService.getAllCosts(supabaseClient, '2026-02-01', '2026-02-28', 1);
 *   console.log(costs.items, costs.total);
 */

const CostsService = {
    // ============================================
    // HELPERS
    // ============================================
    toNetto(brutto) {
        return brutto / 1.23;
    },

    calcCommission(sales, tiers) {
        let commission = 0;
        const sortedTiers = [...tiers].sort((a, b) => a.min - b.min);

        for (const tier of sortedTiers) {
            if (sales > tier.min) {
                const amt = Math.min(sales, tier.max) - tier.min;
                commission += amt * tier.rate;
            }
        }

        // Handle sales above max tier
        if (sortedTiers.length > 0) {
            const maxTier = sortedTiers[sortedTiers.length - 1];
            if (sales > maxTier.max) {
                commission += (sales - maxTier.max) * maxTier.rate;
            }
        }

        return commission;
    },

    calcMonthlyBonus(sales, threshold, amount) {
        if (!threshold || !amount) return 0;
        return sales >= threshold ? amount : 0;
    },

    // ============================================
    // EMPLOYEE SALES
    // ============================================
    async getEmployeeSales(supabaseClient, teamMemberId, startDate, endDate) {
        // Get paid orders in date range
        const { data: orders } = await supabaseClient
            .from('orders')
            .select('id, amount, lead_id, paid_at, customer_email')
            .eq('status', 'paid')
            .gte('paid_at', startDate)
            .lt('paid_at', endDate);

        if (!orders || orders.length === 0) {
            return { totalSales: 0, orderCount: 0 };
        }

        // Get leads to find assigned_to
        const leadIds = [...new Set(orders.filter(o => o.lead_id).map(o => o.lead_id))];
        let leadsMap = {};

        if (leadIds.length > 0) {
            const { data: leads } = await supabaseClient
                .from('leads')
                .select('id, assigned_to')
                .in('id', leadIds);
            if (leads) leadsMap = Object.fromEntries(leads.map(l => [l.id, l.assigned_to]));
        }

        // For orders without lead_id, try to find lead by email
        const ordersWithoutLead = orders.filter(o => !o.lead_id && o.customer_email);
        if (ordersWithoutLead.length > 0) {
            const emails = [...new Set(ordersWithoutLead.map(o => o.customer_email))];
            const { data: leadsByEmail } = await supabaseClient
                .from('leads')
                .select('id, email, assigned_to')
                .in('email', emails);

            if (leadsByEmail) {
                const emailToLead = Object.fromEntries(leadsByEmail.map(l => [l.email, l]));
                for (const order of ordersWithoutLead) {
                    const lead = emailToLead[order.customer_email];
                    if (lead) {
                        leadsMap[order.id] = lead.assigned_to;
                    }
                }
            }
        }

        // Sum orders for this team member (convert to NETTO)
        let totalSales = 0;
        let orderCount = 0;

        for (const order of orders) {
            const assignedTo = order.lead_id ? leadsMap[order.lead_id] : leadsMap[order.id];
            if (assignedTo === teamMemberId) {
                totalSales += this.toNetto(parseFloat(order.amount));
                orderCount++;
            }
        }

        return { totalSales, orderCount };
    },

    // ============================================
    // EMPLOYEE COSTS
    // ============================================
    async getEmployeeCosts(supabaseClient, startDate, endDate, monthsInPeriod = 1) {
        // Pobierz aktywne umowy
        const { data: contracts } = await supabaseClient
            .from('employee_contracts')
            .select('*, team_members!inner(id, name)')
            .is('effective_to', null);

        if (!contracts || contracts.length === 0) {
            return [];
        }

        // Pobierz bonusy dla okresu
        const { data: bonuses } = await supabaseClient
            .from('employee_bonuses')
            .select('*')
            .eq('month', startDate);

        const employeeCosts = [];

        for (const contract of contracts) {
            // Pobierz sprzedaz pracownika
            const { totalSales } = await this.getEmployeeSales(
                supabaseClient,
                contract.team_member_id,
                startDate,
                endDate
            );

            // Oblicz prowizje
            const tiers = contract.commission_tiers || [];
            const commission = this.calcCommission(totalSales, tiers);

            // Bonus miesieczny
            const monthlyBonus = this.calcMonthlyBonus(
                totalSales,
                contract.monthly_bonus_threshold,
                contract.monthly_bonus_amount
            );

            // Bonusy reczne
            const memberBonuses = (bonuses || []).filter(b => b.team_member_id === contract.team_member_id);
            const manualBonusTotal = memberBonuses.reduce((sum, b) => sum + parseFloat(b.amount || 0), 0);

            // Podstawa * liczba miesiecy (dla kwartalow/roku)
            const baseSalary = parseFloat(contract.base_salary || 0) * monthsInPeriod;

            // Calkowity koszt (minimum 0 - nie moze byc ujemny)
            const totalCost = Math.max(0, baseSalary + commission + monthlyBonus + manualBonusTotal);

            // Buduj opis
            let description = `Podstawa: ${this.formatMoney(baseSalary)}`;
            if (totalSales > 0) {
                description += ` | Sprzedaz netto: ${this.formatMoney(totalSales)}`;
            }
            if (commission > 0) {
                description += ` | Prowizja: ${this.formatMoney(commission)}`;
            }
            if (monthlyBonus > 0) {
                description += ` | Bonus: ${this.formatMoney(monthlyBonus)}`;
            }
            if (manualBonusTotal !== 0) {
                description += ` | Bonusy dodatkowe: ${this.formatMoney(manualBonusTotal)}`;
            }

            employeeCosts.push({
                id: `emp-${contract.team_member_id}`,
                name: `${contract.team_members.name} (${contract.contract_type})`,
                description: description,
                amount: totalCost,
                category: 'pracownik',
                vat_rate: 0,
                cost_type: 'employee',
                is_paid: true,
                is_virtual: true,
                _details: {
                    baseSalary,
                    commission,
                    monthlyBonus,
                    manualBonusTotal,
                    totalSales
                }
            });
        }

        return employeeCosts;
    },

    // ============================================
    // AD EXPENSES
    // ============================================
    async getAdExpenses(supabaseClient, startDate, endDate) {
        const { data, error } = await supabaseClient
            .from('ad_expenses')
            .select('source, amount')
            .gte('date', startDate)
            .lte('date', endDate);

        if (error || !data || data.length === 0) {
            return null;
        }

        // Sum by source
        const bySource = { google: 0, meta: 0, tiktok: 0 };
        for (const row of data) {
            bySource[row.source] = (bySource[row.source] || 0) + parseFloat(row.amount || 0);
        }

        const totalAds = bySource.google + bySource.meta + bySource.tiktok;
        if (totalAds <= 0) return null;

        // Build description
        const parts = [];
        if (bySource.google > 0) parts.push(`Google: ${this.formatMoney(bySource.google)}`);
        if (bySource.meta > 0) parts.push(`Meta: ${this.formatMoney(bySource.meta)}`);
        if (bySource.tiktok > 0) parts.push(`TikTok: ${this.formatMoney(bySource.tiktok)}`);

        return {
            id: 'ads_live',
            name: 'Budzet reklamowy',
            description: parts.join(' | '),
            category: 'marketing',
            amount: totalAds,
            vat_rate: 0.23,
            cost_type: 'recurring',
            is_paid: true,
            is_virtual: true,
            _bySource: bySource
        };
    },

    // ============================================
    // MAIN: GET ALL COSTS
    // ============================================
    /**
     * Pobiera wszystkie koszty dla danego okresu
     *
     * @param {Object} supabaseClient - Klient Supabase
     * @param {string} startDate - Data poczatkowa (YYYY-MM-DD)
     * @param {string} endDate - Data koncowa (YYYY-MM-DD)
     * @param {number} monthsInPeriod - Liczba miesiecy (1 dla miesiaca, 3 dla kwartalu, 12 dla roku)
     * @returns {Object} { items: Array, total: number, byCategory: Object }
     */
    async getAllCosts(supabaseClient, startDate, endDate, monthsInPeriod = 1) {
        // 1. Pobierz koszty z biznes_costs (bez pracownikow - ci sa liczeni dynamicznie)
        const { data: biznesCosts } = await supabaseClient
            .from('biznes_costs')
            .select('*')
            .neq('category', 'pracownik')
            .gte('month', startDate)
            .lte('month', endDate);

        const costs = (biznesCosts || []).map(c => ({
            ...c,
            amount: parseFloat(c.amount || 0),
            is_virtual: false
        }));

        // 2. Pobierz dynamiczne koszty pracownikow
        const nextDay = new Date(endDate);
        nextDay.setDate(nextDay.getDate() + 1);
        const nextDayStr = nextDay.toISOString().split('T')[0];

        const employeeCosts = await this.getEmployeeCosts(supabaseClient, startDate, nextDayStr, monthsInPeriod);
        costs.push(...employeeCosts);

        // 3. Pobierz wydatki reklamowe
        const adExpenses = await this.getAdExpenses(supabaseClient, startDate, endDate);
        if (adExpenses) {
            costs.push(adExpenses);
        }

        // Oblicz sumy
        const total = costs.reduce((sum, c) => sum + (c.amount || 0), 0);

        // Grupuj po kategorii
        const byCategory = {};
        for (const cost of costs) {
            const cat = cost.category || 'other';
            byCategory[cat] = (byCategory[cat] || 0) + (cost.amount || 0);
        }

        return { items: costs, total, byCategory };
    },

    // ============================================
    // FORMAT HELPER
    // ============================================
    formatMoney(amount) {
        return new Intl.NumberFormat('pl-PL', {
            style: 'currency',
            currency: 'PLN',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }
};

// Export for use in other files
if (typeof window !== 'undefined') {
    window.CostsService = CostsService;
}
