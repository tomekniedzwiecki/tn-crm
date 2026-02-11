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

    const { trigger_type, entity_type, entity_id, context, filters = {} } = body

    if (!trigger_type || !entity_type || !entity_id) {
      throw new Error('Missing required fields: trigger_type, entity_type, entity_id')
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
      .select('id, name, trigger_filters')
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

      // Check if execution already exists (prevent duplicates)
      const { data: existing } = await supabase
        .from('automation_executions')
        .select('id')
        .eq('flow_id', flow.id)
        .eq('entity_type', entity_type)
        .eq('entity_id', entity_id)
        .single()

      if (existing) {
        console.log(`[automation-trigger] Execution already exists for flow ${flow.id}, skipping`)
        continue
      }

      // Create new execution
      const { data: execution, error: execError } = await supabase
        .from('automation_executions')
        .insert({
          flow_id: flow.id,
          entity_type,
          entity_id,
          status: 'pending',
          context: {
            ...context,
            triggered_at: new Date().toISOString(),
            trigger_type
          },
          logs: [{
            timestamp: new Date().toISOString(),
            action: 'triggered',
            trigger_type,
            flow_name: flow.name
          }]
        })
        .select('id')
        .single()

      if (execError) {
        console.error(`[automation-trigger] Failed to create execution for flow ${flow.id}:`, execError)
        continue
      }

      console.log(`[automation-trigger] Created execution ${execution.id} for flow ${flow.name}`)
      createdExecutions.push(execution.id)
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
