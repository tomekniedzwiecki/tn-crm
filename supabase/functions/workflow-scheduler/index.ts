import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Workflow {
  id: string
  customer_email: string
  customer_name: string | null
  unique_token: string
  created_at: string
  products_shared_at: string | null
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    console.log('[workflow-scheduler] Starting scheduled tasks check')

    const results = {
      productsShared: 0,
      errors: [] as string[]
    }

    // =============================================
    // TASK 1: Auto-share products after X hours
    // =============================================

    // Get delay from settings (default 4 hours)
    const { data: delaySetting } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'workflow_auto_share_products_delay_hours')
      .single()

    const delayHours = parseInt(delaySetting?.value || '4', 10)
    console.log(`[workflow-scheduler] Using delay of ${delayHours} hours for auto-share products`)

    const cutoffTime = new Date(Date.now() - delayHours * 60 * 60 * 1000).toISOString()

    const { data: workflowsToShare, error: fetchError } = await supabase
      .from('workflows')
      .select('id, customer_email, customer_name, unique_token, created_at, products_shared_at')
      .is('products_shared_at', null)
      .lt('created_at', cutoffTime)
      .not('status', 'eq', 'cancelled')
      .limit(20) // Process max 20 per run

    if (fetchError) {
      throw new Error(`Error fetching workflows: ${fetchError.message}`)
    }

    console.log(`[workflow-scheduler] Found ${workflowsToShare?.length || 0} workflows needing products shared`)

    for (const workflow of workflowsToShare || []) {
      try {
        await shareProductsForWorkflow(supabase, supabaseUrl, supabaseServiceKey, workflow)
        results.productsShared++
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error'
        console.error(`[workflow-scheduler] Error sharing products for ${workflow.id}:`, errorMsg)
        results.errors.push(`${workflow.id}: ${errorMsg}`)
      }
    }

    console.log(`[workflow-scheduler] Completed. Products shared: ${results.productsShared}`)

    return new Response(
      JSON.stringify({ success: true, ...results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[workflow-scheduler] Critical error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

async function shareProductsForWorkflow(
  supabase: any,
  supabaseUrl: string,
  supabaseServiceKey: string,
  workflow: Workflow
) {
  const now = new Date().toISOString()

  console.log(`[workflow-scheduler] Sharing products for workflow ${workflow.id}`)

  // Update workflow
  const { error: updateError } = await supabase
    .from('workflows')
    .update({ products_shared_at: now })
    .eq('id', workflow.id)

  if (updateError) {
    throw new Error(`Failed to update workflow: ${updateError.message}`)
  }

  // Log activity
  await supabase
    .from('workflow_activities')
    .insert({
      workflow_id: workflow.id,
      action: 'products_shared',
      description: 'Produkty udostępnione automatycznie (4h od utworzenia)',
      metadata: { auto: true }
    })

  // Trigger automation for email
  const clientName = (workflow.customer_name || '').split(' ')[0] || 'Cześć'
  const projectUrl = `https://crm.tomekniedzwiecki.pl/projekt/${workflow.unique_token}#produkty`

  try {
    const response = await fetch(
      `${supabaseUrl}/functions/v1/automation-trigger`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`
        },
        body: JSON.stringify({
          trigger_type: 'products_shared',
          entity_type: 'workflow',
          entity_id: workflow.id,
          context: {
            email: workflow.customer_email,
            clientName,
            projectUrl
          }
        })
      }
    )

    const result = await response.json()
    console.log(`[workflow-scheduler] Automation trigger result for ${workflow.id}:`, result)
  } catch (triggerError) {
    console.error(`[workflow-scheduler] Failed to trigger automation for ${workflow.id}:`, triggerError)
    // Don't throw - products are already shared, email failure is not critical
  }

  console.log(`[workflow-scheduler] Products shared successfully for ${workflow.id}`)
}
