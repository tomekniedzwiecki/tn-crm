// ============================================
// SHARED SALES CALCULATION
// Used by: commissions.html, employees.html
// ============================================

const SalesService = {
    cache: null,
    cacheKey: null,

    toNetto(brutto) {
        return (parseFloat(brutto) || 0) / 1.23;
    },

    async getSalesByPerson(supabaseClient, monthStart, monthEnd) {
        const cacheKey = `${monthStart.toISOString()}-${monthEnd.toISOString()}`;
        if (this.cache && this.cacheKey === cacheKey) {
            return this.cache;
        }

        // Fetch all paid orders
        const { data: orders } = await supabaseClient
            .from('orders')
            .select('id, amount, lead_id, paid_at, customer_email, customer_name, description, order_number, commission_salesperson_id')
            .eq('status', 'paid')
            .gte('paid_at', monthStart.toISOString())
            .lte('paid_at', monthEnd.toISOString())
            .order('paid_at', { ascending: false });

        if (!orders || orders.length === 0) {
            this.cache = { byPerson: {}, totalSales: 0, totalOrders: 0 };
            this.cacheKey = cacheKey;
            return this.cache;
        }

        // Get leads for orders with lead_id
        const leadIds = [...new Set(orders.filter(o => o.lead_id).map(o => o.lead_id))];
        let leadsMap = {};

        if (leadIds.length > 0) {
            const { data: leads } = await supabaseClient
                .from('leads')
                .select('id, assigned_to, email, name, company')
                .in('id', leadIds);
            if (leads) leadsMap = Object.fromEntries(leads.map(l => [l.id, l]));
        }

        // Group by salesperson
        const byPerson = {};

        for (const order of orders) {
            let assignedTo = null;
            let leadData = null;

            // Get lead data if exists
            if (order.lead_id && leadsMap[order.lead_id]) {
                leadData = leadsMap[order.lead_id];
            }

            // Priority: commission_salesperson_id > leads.assigned_to
            if (order.commission_salesperson_id) {
                assignedTo = order.commission_salesperson_id;
            } else if (leadData) {
                assignedTo = leadData.assigned_to;
            }

            // Fallback: find lead by email
            if (!assignedTo && order.customer_email) {
                const { data: lead } = await supabaseClient
                    .from('leads')
                    .select('id, assigned_to, name, company')
                    .eq('email', order.customer_email)
                    .maybeSingle();
                if (lead) {
                    assignedTo = order.commission_salesperson_id || lead.assigned_to;
                    leadData = lead;
                }
            }

            const key = assignedTo || 'unassigned';
            if (!byPerson[key]) {
                byPerson[key] = { memberId: assignedTo, orders: [], total: 0 };
            }

            order._lead = leadData;
            order._amountNetto = this.toNetto(order.amount);
            byPerson[key].orders.push(order);
            byPerson[key].total += order._amountNetto;
        }

        const totalSales = Object.values(byPerson).reduce((sum, p) => sum + p.total, 0);
        const totalOrders = orders.length;

        this.cache = { byPerson, totalSales, totalOrders };
        this.cacheKey = cacheKey;
        return this.cache;
    },

    async getPersonSales(supabaseClient, teamMemberId, monthStart, monthEnd) {
        const data = await this.getSalesByPerson(supabaseClient, monthStart, monthEnd);
        const personData = data.byPerson[teamMemberId];

        if (!personData) {
            return { totalSales: 0, orderCount: 0, orders: [] };
        }

        return {
            totalSales: personData.total,
            orderCount: personData.orders.length,
            orders: personData.orders
        };
    },

    clearCache() {
        this.cache = null;
        this.cacheKey = null;
    }
};
