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
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    const payload = await req.json()
    console.log('Manus webhook received:', JSON.stringify(payload, null, 2))

    // REFACTOR (2026-07-03, case „reklamy /sklep po 95 min"): Manus v2 wysyła eventy w RÓŻNYCH
    // kształtach ({task_id,...} / {event, data:{...}} / {task:{...}}) — stary kod czytał tylko
    // top-level task_id i odpowiadał 400 (8 retry Manusa poszło w ścianę), więc ukończenie
    // taska NIGDY nie docierało i dostawa wisiała na pollu frontu / cronie. Parsujemy
    // tolerancyjnie + routing również do bud-ads (taski kreacji lejka /sklep).
    // deno-lint-ignore no-explicit-any
    const p: any = payload || {}
    const taskObj = p.task || (p.data && p.data.task) || p.data || {}
    const task_id = p.task_id || taskObj.task_id || taskObj.id || null
    const status = p.status || taskObj.status || p.event_type || p.event || null
    const result = p.result || taskObj.result || null

    if (!task_id) {
      // 200, nie 400 — payload bez task_id i tak nie jest do zrutowania, a 4xx tylko
      // nakręcało burzę retry po stronie Manusa. Pełny payload jest w logu wyżej.
      console.error('Manus webhook: no task_id in payload — ignoring')
      return new Response(
        JSON.stringify({ success: true, ignored: true, reason: 'no task_id' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

    // Find workflow by manus_task_id
    const { data: adsRecord, error: findError } = await supabase
      .from('workflow_ads')
      .select('id, workflow_id')
      .eq('manus_task_id', task_id)
      .maybeSingle()

    if (findError || !adsRecord) {
      // ── Tor /sklep (bud-ads): task kreacji reklamowych sesji lejka ──
      // Ukończony task → sweep bud-ads (ten sam, przetestowany tor co cron): dociąga
      // załączniki, rehostuje do Storage, zapisuje session_ads i zwalnia lock — reklamy
      // trafiają do usera SEKUNDY po ukończeniu, bez czekania na poll frontu.
      const { data: budRow } = await supabase
        .from('bud_sessions')
        .select('id, ads_manus_status')
        .eq('ads_manus_task_id', task_id)
        .maybeSingle()
      if (budRow) {
        const CRON = Deno.env.get('SPAR_CRON_SECRET') || ''
        if (CRON && budRow.ads_manus_status === 'running') {
          const sweep = fetch(`${SUPABASE_URL}/functions/v1/bud-ads`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-admin-secret': CRON },
            body: JSON.stringify({ sweep: true }),
          }).then(async (r) => console.log('bud-ads sweep via webhook:', r.status, (await r.text()).slice(0, 200)))
            .catch((e) => console.error('bud-ads sweep via webhook error:', e))
          // deno-lint-ignore no-explicit-any
          const er = (globalThis as any).EdgeRuntime
          if (er && typeof er.waitUntil === 'function') er.waitUntil(sweep)
          else await sweep
        }
        return new Response(
          JSON.stringify({ success: true, routed: 'bud-ads', session_id: budRow.id, task_status: status }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      console.error('Could not find workflow for task:', task_id)
      // 200 zamiast 404 — taski spoza obu torów (np. odpalone ręcznie w UI Manusa)
      // nie mają gdzie trafić; 4xx tylko prowokował retraje.
      return new Response(
        JSON.stringify({ success: true, ignored: true, reason: 'task not matched' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update based on status
    if (status === 'completed' && result) {
      // Parse the result - Manus returns the AI response
      let reportData = null

      try {
        // Try to extract JSON from the result
        const jsonMatch = result.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          reportData = JSON.parse(jsonMatch[0])
        }
      } catch (parseErr) {
        console.error('Error parsing Manus result:', parseErr)
        reportData = { raw_result: result, parse_error: true }
      }

      // Add metadata
      if (reportData && !reportData.parse_error) {
        reportData.source = 'manus'
        reportData.fetched_at = new Date().toISOString()
        reportData.manus_task_id = task_id
      }

      const { error: updateError } = await supabase
        .from('workflow_ads')
        .update({
          report_data: reportData,
          report_generated_at: new Date().toISOString(),
          manus_task_status: 'completed'
        })
        .eq('id', adsRecord.id)

      if (updateError) {
        console.error('Error updating workflow_ads:', updateError)
        throw updateError
      }

      console.log('Report data saved for workflow:', adsRecord.workflow_id)

    } else if (status === 'failed') {
      await supabase
        .from('workflow_ads')
        .update({
          manus_task_status: 'failed',
          manus_task_error: result || 'Unknown error'
        })
        .eq('id', adsRecord.id)

    } else {
      // Update status only
      await supabase
        .from('workflow_ads')
        .update({ manus_task_status: status })
        .eq('id', adsRecord.id)
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Webhook processed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
