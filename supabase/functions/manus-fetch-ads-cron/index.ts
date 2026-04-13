import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const MANUS_API_KEY = Deno.env.get('MANUS_API_KEY')
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!MANUS_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: 'MANUS_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

    // Get all active workflows with Meta Ad Account ID configured
    // and where campaign is launched (report stage is relevant)
    const { data: workflows, error: fetchError } = await supabase
      .from('workflow_ads')
      .select(`
        id,
        workflow_id,
        meta_ad_account_id,
        campaign_launched,
        report_generated_at
      `)
      .not('meta_ad_account_id', 'is', null)
      .eq('campaign_launched', true)

    if (fetchError) {
      throw fetchError
    }

    if (!workflows || workflows.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No workflows to update', count: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Filter to workflows that haven't been updated in 48 hours
    const now = new Date()
    const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000)

    const workflowsToUpdate = workflows.filter(w => {
      if (!w.report_generated_at) return true // Never fetched
      const lastFetch = new Date(w.report_generated_at)
      return lastFetch < fortyEightHoursAgo
    })

    console.log(`Found ${workflowsToUpdate.length} workflows to update out of ${workflows.length}`)

    // Date range: last 30 days
    const endDate = now.toISOString().split('T')[0]
    const startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    const results = []

    for (const workflow of workflowsToUpdate) {
      try {
        const instruction = `
Pobierz statystyki kampanii reklamowych z Meta Ads dla konta: ${workflow.meta_ad_account_id}

Okres: od ${startDate} do ${endDate}

Zwróć dane w formacie JSON:
{
  "period": { "from": "${startDate}", "to": "${endDate}" },
  "spend": [całkowite wydatki w PLN],
  "impressions": [liczba wyświetleń],
  "clicks": [liczba kliknięć],
  "ctr": [CTR w procentach],
  "cpc": [koszt za kliknięcie w PLN],
  "conversions": [liczba konwersji],
  "conversion_rate": [współczynnik konwersji w %],
  "cost_per_conversion": [koszt za konwersję w PLN],
  "revenue": [przychód z konwersji w PLN, jeśli dostępny],
  "roas": [ROAS = revenue/spend],
  "campaigns": [
    { "name": "nazwa kampanii", "spend": X, "conversions": Y, "impressions": Z }
  ]
}

Jeśli nie ma danych o przychodzie/konwersjach, ustaw na 0.
Zwróć TYLKO JSON, bez dodatkowego tekstu.
`.trim()

        // Get Meta Ads connector UUID from env
        const META_ADS_CONNECTOR_UUID = Deno.env.get('MANUS_META_ADS_CONNECTOR_UUID')

        const requestBody: any = {
          message: {
            content: instruction
          }
        }

        if (META_ADS_CONNECTOR_UUID) {
          requestBody.message.connectors = [META_ADS_CONNECTOR_UUID]
        }

        const manusResponse = await fetch('https://api.manus.ai/v2/task.create', {
          method: 'POST',
          headers: {
            'x-manus-api-key': MANUS_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        })

        const manusData = await manusResponse.json()

        if (manusResponse.ok && manusData.ok) {
          // Update workflow with task ID
          await supabase
            .from('workflow_ads')
            .update({
              manus_task_id: manusData.task_id,
              manus_task_status: 'pending',
              manus_task_created_at: new Date().toISOString()
            })
            .eq('id', workflow.id)

          results.push({
            workflow_id: workflow.workflow_id,
            task_id: manusData.task_id,
            status: 'created'
          })
        } else {
          results.push({
            workflow_id: workflow.workflow_id,
            status: 'error',
            error: manusData.error || 'Unknown error'
          })
        }

        // Small delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000))

      } catch (err) {
        console.error(`Error processing workflow ${workflow.workflow_id}:`, err)
        results.push({
          workflow_id: workflow.workflow_id,
          status: 'error',
          error: err.message
        })
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${results.length} workflows`,
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Cron error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
