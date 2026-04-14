import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * CRON: Sprawdza pipelines w statusie 'running' + step='research'.
 * Gdy Manus skończył → odpala copy + creatives przez generate-campaign-batch.
 * Uruchamiany co 2 minuty.
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const MANUS_API_KEY = Deno.env.get('MANUS_API_KEY')
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    if (!MANUS_API_KEY) {
      return new Response(JSON.stringify({ success: false, error: 'No MANUS_API_KEY' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Znajdź pipelines czekające na research
    const { data: pending } = await supabase
      .from('workflow_ads')
      .select('workflow_id, competitor_research_task_id, campaign_pipeline_started_at, campaign_pipeline_include_creatives')
      .eq('campaign_pipeline_status', 'running')
      .eq('campaign_pipeline_step', 'research')
      .not('competitor_research_task_id', 'is', null)

    if (!pending?.length) {
      return new Response(JSON.stringify({ success: true, checked: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    console.log(`[campaign-check] Found ${pending.length} pending research tasks`)

    let completed = 0

    for (const row of pending) {
      const taskId = row.competitor_research_task_id

      // Timeout: jeśli pipeline działa > 20 min, oznacz jako failed
      const startedAt = new Date(row.campaign_pipeline_started_at).getTime()
      if (Date.now() - startedAt > 20 * 60 * 1000) {
        console.log(`[campaign-check] Pipeline timeout for ${row.workflow_id}`)
        await supabase.from('workflow_ads').update({
          campaign_pipeline_status: 'failed',
          campaign_pipeline_step: 'error'
        }).eq('workflow_id', row.workflow_id)
        continue
      }

      try {
        // Sprawdź status w Manus
        const detailRes = await fetch(`https://api.manus.ai/v2/task.detail?task_id=${taskId}`, {
          headers: { 'x-manus-api-key': MANUS_API_KEY, 'Content-Type': 'application/json' }
        })

        const detailData = await detailRes.json()
        if (!detailRes.ok || !detailData.ok) {
          if (detailData?.error?.code === 'not_found') {
            // Task wygasł
            await supabase.from('workflow_ads').update({
              competitor_research_status: 'expired',
              campaign_pipeline_status: 'failed',
              campaign_pipeline_step: 'error'
            }).eq('workflow_id', row.workflow_id)
          }
          continue
        }

        const task = detailData.task || detailData
        const isFinished = ['completed', 'done', 'stopped'].includes(task.status)
        if (!isFinished) continue

        console.log(`[campaign-check] Research done for ${row.workflow_id}, extracting results`)

        // Pobierz wiadomości
        const msgRes = await fetch(`https://api.manus.ai/v2/task.listMessages?task_id=${taskId}&limit=50`, {
          headers: { 'x-manus-api-key': MANUS_API_KEY, 'Content-Type': 'application/json' }
        })
        const msgData = await msgRes.json()
        const messages = msgData.messages || msgData.data || []

        // Znajdź JSON
        let result = ''
        for (const msg of [...messages].reverse()) {
          if (msg.type !== 'assistant_message') continue
          const content = typeof msg.assistant_message === 'string'
            ? msg.assistant_message
            : msg.assistant_message?.content || msg.assistant_message?.text || ''
          if (content.includes('{') && (content.includes('"competitors"') || content.includes('"gaps"'))) {
            result = content
            break
          }
        }

        // Parsuj JSON
        let researchData = null
        try {
          const jsonMatch = result.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            researchData = JSON.parse(jsonMatch[0])
          }
        } catch (e) {
          console.error(`[campaign-check] JSON parse error for ${row.workflow_id}:`, e.message)
        }

        // Zapisz research
        await supabase.from('workflow_ads').update({
          competitor_research: researchData || { raw_result: result?.substring(0, 2000), parse_error: true },
          competitor_research_at: new Date().toISOString(),
          competitor_research_status: 'completed'
        }).eq('workflow_id', row.workflow_id)

        // Odpala FAZĘ 2 (copy + creatives) przez generate-campaign-batch
        // Teraz research jest w bazie, więc batch function go znajdzie i od razu zrobi copy+creatives
        console.log(`[campaign-check] Triggering copy+creatives for ${row.workflow_id}`)

        const continueRes = await fetch(`${SUPABASE_URL}/functions/v1/generate-campaign-batch`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            workflow_id: row.workflow_id,
            include_creatives: row.campaign_pipeline_include_creatives !== false
          })
        })

        if (!continueRes.ok) {
          console.error(`[campaign-check] Failed to continue pipeline for ${row.workflow_id}`)
        }

        completed++
      } catch (err) {
        console.error(`[campaign-check] Error for ${row.workflow_id}:`, err.message)
      }
    }

    return new Response(
      JSON.stringify({ success: true, checked: pending.length, completed }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[campaign-check] Fatal error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
