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

    if (!MANUS_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: 'MANUS_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Test connection - list tasks (API v2)
    const response = await fetch('https://api.manus.ai/v2/task.list?limit=1', {
      method: 'GET',
      headers: {
        'x-manus-api-key': MANUS_API_KEY,
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (response.ok) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Manus API connection successful',
          status: response.status,
          data_preview: data
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Manus API error',
          status: response.status,
          details: data
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
