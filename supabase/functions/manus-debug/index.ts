import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

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
    const { task_id } = await req.json()

    if (!MANUS_API_KEY || !task_id) {
      return new Response(
        JSON.stringify({ error: 'Missing API key or task_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get task detail
    const detailRes = await fetch(`https://api.manus.ai/v2/task.detail?task_id=${task_id}`, {
      headers: { 'x-manus-api-key': MANUS_API_KEY }
    })
    const detail = await detailRes.json()

    // Get messages
    const msgRes = await fetch(`https://api.manus.ai/v2/task.listMessages?task_id=${task_id}&limit=100`, {
      headers: { 'x-manus-api-key': MANUS_API_KEY }
    })
    const messages = await msgRes.json()

    return new Response(
      JSON.stringify({ detail, messages }, null, 2),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
