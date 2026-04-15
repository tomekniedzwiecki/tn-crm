import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * Wysyła follow-up wiadomość do istniejącego wątku Manus (task.sendMessage).
 * Zwraca natychmiast — nie polluje odpowiedzi (to robi cron campaign-check-progress).
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const MANUS_API_KEY = Deno.env.get('MANUS_API_KEY')!
    const { task_id, content } = await req.json()
    if (!task_id || !content) {
      return new Response(JSON.stringify({ ok: false, error: 'task_id and content required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const r = await fetch('https://api.manus.ai/v2/task.sendMessage', {
      method: 'POST',
      headers: { 'x-manus-api-key': MANUS_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ task_id, message: { content } })
    })
    const data = await r.json()
    return new Response(JSON.stringify(data),
      { status: r.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: (e as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
