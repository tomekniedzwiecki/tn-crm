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
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')

    if (!MANUS_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: 'MANUS_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const webhookUrl = `${SUPABASE_URL}/functions/v1/manus-webhook`

    // First, list existing webhooks
    const listResponse = await fetch('https://api.manus.ai/v2/webhook.list', {
      method: 'GET',
      headers: {
        'x-manus-api-key': MANUS_API_KEY,
        'Content-Type': 'application/json',
      },
    })

    const listData = await listResponse.json()
    console.log('Existing webhooks:', listData)

    // Check if our webhook already exists
    const existingWebhook = listData.webhooks?.find((w: any) => w.url === webhookUrl)

    if (existingWebhook) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Webhook already registered',
          webhook_id: existingWebhook.id,
          url: webhookUrl
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create new webhook
    const createResponse = await fetch('https://api.manus.ai/v2/webhook.create', {
      method: 'POST',
      headers: {
        'x-manus-api-key': MANUS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: webhookUrl,
        events: ['task.completed', 'task.failed', 'task.status_changed']
      })
    })

    const createData = await createResponse.json()

    if (!createResponse.ok || !createData.ok) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to create webhook',
          details: createData
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Webhook registered successfully',
        webhook_id: createData.webhook_id,
        url: webhookUrl
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
