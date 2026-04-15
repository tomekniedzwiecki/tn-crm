import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { jsonrepair } from 'https://esm.sh/jsonrepair@3.12.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function tolerantParse(raw: string) {
  try { return JSON.parse(raw) } catch {}
  try { return JSON.parse(jsonrepair(raw)) } catch { return null }
}

/**
 * Pobiera najnowszą odpowiedź Manusa z wątku i wyciąga campaign_spec.
 * Wywoływane przez UI po "Dogeneruj kampanię" (ręcznie) lub z crona.
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const MANUS_API_KEY = Deno.env.get('MANUS_API_KEY')!
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const { workflow_id } = await req.json()
    if (!workflow_id) {
      return new Response(JSON.stringify({ ok: false, error: 'workflow_id required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const { data: ads } = await supabase.from('workflow_ads')
      .select('manus_full_task_id, campaign_spec_requested_at').eq('workflow_id', workflow_id).maybeSingle()
    if (!ads?.manus_full_task_id) {
      return new Response(JSON.stringify({ ok: false, error: 'Brak manus_full_task_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const headers = { 'x-manus-api-key': MANUS_API_KEY, 'Content-Type': 'application/json' }
    const msgRes = await fetch(`https://api.manus.ai/v2/task.listMessages?task_id=${ads.manus_full_task_id}&limit=30`, { headers })
    const msgData = await msgRes.json()
    const messages = msgData.messages || []

    const requestedAt = ads.campaign_spec_requested_at ? new Date(ads.campaign_spec_requested_at).getTime() : 0

    // Przejdź od najnowszych — szukaj asystenta który odpowiedział PO requested_at i ma campaign_spec
    let spec: any = null
    let foundAt: string | null = null
    for (const m of messages) {
      if (m.type !== 'assistant_message') continue
      const createdAt = m.created_at ? new Date(m.created_at).getTime() : Date.now()
      if (requestedAt && createdAt < requestedAt) break
      const am = m.assistant_message
      const txt = typeof am === 'string' ? am : (am?.content || am?.text || '')
      if (!txt || !txt.includes('campaign_spec')) continue
      // Wyciągnij JSON
      const fenced = txt.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
      let raw = fenced ? fenced[1] : (txt.match(/\{[\s\S]*\}/) || [''])[0]
      const parsed = tolerantParse(raw)
      if (parsed?.campaign_spec?.ad_sets) {
        spec = parsed.campaign_spec
        foundAt = m.created_at || new Date().toISOString()
        break
      }
    }

    if (!spec) {
      return new Response(JSON.stringify({ ok: false, pending: true, message: 'Manus jeszcze nie odpowiedział lub odpowiedź nie zawiera campaign_spec' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    await supabase.from('workflow_ads').update({
      campaign_spec: spec,
      campaign_spec_at: foundAt || new Date().toISOString()
    }).eq('workflow_id', workflow_id)

    return new Response(JSON.stringify({ ok: true, campaign_spec: spec }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: (e as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
