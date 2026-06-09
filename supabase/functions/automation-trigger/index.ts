import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TriggerRequest {
  trigger_type: string
  entity_type: string
  entity_id: string
  context: Record<string, any>
  filters?: Record<string, any>
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    const body: TriggerRequest = await req.json()
    console.log('[automation-trigger] Received trigger:', JSON.stringify(body))

    const { trigger_type, entity_type, entity_id, context = {}, filters = {} } = body

    if (!trigger_type || !entity_type || !entity_id) {
      throw new Error('Missing required fields: trigger_type, entity_type, entity_id')
    }

    // Auto-fetch entity data if not provided in context
    let enrichedContext = { ...context }

    if (entity_type === 'lead' && !context.email) {
      const { data: lead } = await supabase
        .from('leads')
        .select('email, name, phone, company, deal_value, status, status_entered_at')
        .eq('id', entity_id)
        .single()

      if (lead) {
        const clientName = (lead.name || '').split(' ')[0] || 'Cześć'
        enrichedContext = {
          ...enrichedContext,
          email: lead.email,
          clientName,
          name: lead.name,
          phone: lead.phone,
          company: lead.company,
          deal_value: lead.deal_value,
          expected_status: enrichedContext.expected_status || lead.status,
          status_entered_at: lead.status_entered_at
        }
        console.log(`[automation-trigger] Enriched context with lead data, email: ${lead.email}, status: ${lead.status}`)
      } else {
        console.warn(`[automation-trigger] Could not fetch lead ${entity_id}`)
      }
    }

    if (entity_type === 'workflow' && !context.email) {
      // Fetch workflow data to get customer email, name, etc.
      const { data: workflow } = await supabase
        .from('workflows')
        .select('customer_email, customer_name, customer_company, offer_name, unique_token, amount')
        .eq('id', entity_id)
        .single()

      if (workflow) {
        const clientName = (workflow.customer_name || '').split(' ')[0] || 'Cześć'
        const projectUrl = `https://crm.tomekniedzwiecki.pl/projekt/${workflow.unique_token}`

        enrichedContext = {
          ...enrichedContext,
          email: workflow.customer_email,
          clientName,
          customer_name: workflow.customer_name,
          offerName: workflow.offer_name,
          amount: workflow.amount,
          projectUrl
        }
        console.log(`[automation-trigger] Enriched context with workflow data, email: ${workflow.customer_email}`)
      } else {
        console.warn(`[automation-trigger] Could not fetch workflow ${entity_id}`)
      }
    }

    // === GA4 lead-lifecycle (server-side Measurement Protocol) ===
    // Świadomie PRZED sprawdzeniem automations_master_enabled — to analityka, nie automatyzacja,
    // więc musi działać nawet gdy master switch jest off. Wysyła:
    //   qualify_lead       — wejście w lejek sprzedażowy (status 'qualified'/"Oferta" i głębiej),
    //   close_convert_lead — deal wygrany (status 'won').
    // user_id = lead_id — spójnie z tpay-webhook (purchase) i checkout/success.html, więc GA4 składa
    // jeden user journey: lead -> qualify -> convert -> purchase. Daje Google czysty sygnał jakości
    // (vs ~96% szum z form_complete: ~100 'won' na 1000+ leadów).
    if (trigger_type === 'lead_status_changed' && entity_type === 'lead') {
      try {
        const newStatus = String(filters?.status || enrichedContext.expected_status || '').trim()
        const prevStatus = String(context.previous_status || '').trim()
        const QUALIFIED_STAGES = ['qualified', 'proposal', 'negotiation', 'stage_6']
        const enteredWon = newStatus === 'won' && prevStatus !== 'won'
        // Fire raz, przy WEJŚCIU w lejek kwalifikacji (obsługuje też skok np. new -> proposal).
        const enteredQualified = QUALIFIED_STAGES.includes(newStatus) && !QUALIFIED_STAGES.includes(prevStatus)

        if (enteredWon || enteredQualified) {
          // deal_value -> value-based bidding (jeśli znane). Enrichment mógł go nie pobrać,
          // gdy caller (pipeline.html) podał email w context -> dociągnij bezpośrednio.
          let dealValue = enrichedContext.deal_value
          if (dealValue === undefined || dealValue === null) {
            const { data: l } = await supabase.from('leads').select('deal_value').eq('id', entity_id).maybeSingle()
            dealValue = l?.deal_value
          }
          await sendGA4LeadEvent(entity_id, enteredWon ? 'close_convert_lead' : 'qualify_lead', {
            lead_status: newStatus,
            previous_status: prevStatus || undefined,
            value: (dealValue != null && Number(dealValue) > 0) ? Number(dealValue) : undefined,
            currency: 'PLN'
          })
        }
      } catch (ga4Err) {
        console.error('[automation-trigger] GA4 lead event error:', ga4Err)
        // Nie przerywaj — analityka jest drugorzędna względem automatyzacji.
      }
    }

    // Check if automations are globally enabled
    const { data: masterSetting } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'automations_master_enabled')
      .single()

    if (masterSetting?.value !== 'true') {
      console.log('[automation-trigger] Automations are globally disabled')
      return new Response(
        JSON.stringify({ success: true, message: 'Automations disabled', created: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Find active flows matching this trigger type
    const { data: flows, error: flowsError } = await supabase
      .from('automation_flows')
      .select('id, name, trigger_filters, allow_repeat')
      .eq('trigger_type', trigger_type)
      .eq('is_active', true)

    if (flowsError) {
      throw new Error(`Failed to fetch flows: ${flowsError.message}`)
    }

    console.log(`[automation-trigger] Found ${flows?.length || 0} active flows for trigger: ${trigger_type}`)

    const createdExecutions: string[] = []

    for (const flow of flows || []) {
      // Check if filters match
      if (!matchesFilters(flow.trigger_filters, filters)) {
        console.log(`[automation-trigger] Flow ${flow.id} filters don't match, skipping`)
        continue
      }

      // Use UPSERT to prevent race condition duplicates
      const executionContext = {
        ...enrichedContext,
        triggered_at: new Date().toISOString(),
        trigger_type
      }

      const executionLogs = [{
        timestamp: new Date().toISOString(),
        action: 'triggered',
        trigger_type,
        flow_name: flow.name
      }]

      // Dedupe per (flow, entity): dla flow.allow_repeat=false skip jesli juz
      // istnieje wczesniejsza execution. Dla allow_repeat=true zawsze INSERT
      // (admin moze odpalic wielokrotnie: cofniecie aktywacji TakeDrop,
      // ponowne zlozenie legal_data, etc).
      if (!flow.allow_repeat) {
        const { data: existing } = await supabase
          .from('automation_executions')
          .select('id')
          .eq('flow_id', flow.id)
          .eq('entity_type', entity_type)
          .eq('entity_id', entity_id)
          .limit(1)
          .maybeSingle()

        if (existing) {
          console.log(`[automation-trigger] Execution already exists for flow ${flow.id} (allow_repeat=false), skipping`)
          continue
        }
      }

      const { data: execution, error: execError } = await supabase
        .from('automation_executions')
        .insert({
          flow_id: flow.id,
          entity_type,
          entity_id,
          status: 'pending',
          context: executionContext,
          logs: executionLogs
        })
        .select('id, status')
        .single()

      if (execError || !execution) {
        console.error(`[automation-trigger] Failed to create execution for flow ${flow.id}:`, execError)
        continue
      }

      // Only count as new if it's in pending status
      if (execution.status === 'pending') {
        console.log(`[automation-trigger] Created execution ${execution.id} for flow ${flow.name}`)
        createdExecutions.push(execution.id)
      } else {
        console.log(`[automation-trigger] Execution ${execution.id} already processed (${execution.status}), skipping`)
      }
    }

    // Optionally: immediately trigger executor for pending executions
    // This makes the system more responsive (no waiting for cron)
    if (createdExecutions.length > 0) {
      try {
        await fetch(
          `${supabaseUrl}/functions/v1/automation-executor`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseServiceKey}`
            },
            body: '{}'
          }
        )
        console.log('[automation-trigger] Triggered immediate executor run')
      } catch (err) {
        console.log('[automation-trigger] Could not trigger immediate executor:', err)
        // Not critical - cron will pick it up
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        created: createdExecutions.length,
        execution_ids: createdExecutions
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[automation-trigger] Error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})

function matchesFilters(flowFilters: Record<string, any> | null, triggerFilters: Record<string, any>): boolean {
  // If flow has no filters, it matches everything
  if (!flowFilters || Object.keys(flowFilters).length === 0) {
    return true
  }

  // Check each flow filter against trigger filters
  for (const [key, value] of Object.entries(flowFilters)) {
    // Skip empty/null values in flow filters
    if (value === null || value === undefined || value === '') {
      continue
    }

    // If trigger doesn't have this filter, or value doesn't match, it's not a match
    if (triggerFilters[key] !== value) {
      return false
    }
  }

  return true
}

// GA4 Measurement Protocol — zdarzenia cyklu życia leada (qualify_lead / close_convert_lead).
// client_id i user_id = lead_id (spójnie z tpay-webhook sendGA4Purchase oraz user_id w success.html
// i /zapisy) -> GA4 skleja cały journey jednego użytkownika: lead -> qualify -> convert -> purchase.
async function sendGA4LeadEvent(leadId: string, eventName: string, params: Record<string, any>) {
  const apiSecret = Deno.env.get('GA4_API_SECRET')
  const measurementId = Deno.env.get('GA4_MEASUREMENT_ID') || 'G-W8CLDSHVFC'
  if (!apiSecret) {
    console.log('[ga4] GA4_API_SECRET not configured, skipping lead event:', eventName)
    return
  }
  // engagement_time_msec + session_id wymagane, by GA4 zarejestrował event z Measurement Protocol.
  const cleanParams: Record<string, any> = { engagement_time_msec: 100, session_id: String(Date.now()) }
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') cleanParams[k] = v
  }
  const payload = {
    client_id: `${leadId}.0`,
    user_id: String(leadId),
    events: [{ name: eventName, params: cleanParams }]
  }
  try {
    const url = `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`
    const resp = await fetch(url, { method: 'POST', body: JSON.stringify(payload) })
    console.log('[ga4] MP lead event sent:', JSON.stringify({ leadId, eventName, status: resp.status }))
  } catch (err) {
    console.error('[ga4] MP lead event error:', err)
  }
}
