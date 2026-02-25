import { createClient } from "jsr:@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-sync-api-key',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const syncApiKey = req.headers.get('x-sync-api-key')

    if (!syncApiKey) {
      return new Response(
        JSON.stringify({ error: 'Missing API key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Sprawdź API key w bazie (tabela app_settings, key='whatsapp_sync_api_key')
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: keyData } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'whatsapp_sync_api_key')
      .single()

    if (!keyData || keyData.value !== syncApiKey) {
      return new Response(
        JSON.stringify({ error: 'Invalid API key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Pobierz parametry
    const url = new URL(req.url)
    const phone = url.searchParams.get('phone')

    if (!phone) {
      return new Response(
        JSON.stringify({ error: 'Missing phone parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Pobierz ostatnią wiadomość dla tego numeru
    const { data: messages, error } = await supabase
      .from('whatsapp_messages')
      .select('message_text, message_timestamp, direction')
      .eq('phone_number', phone)
      .order('message_timestamp', { ascending: false })
      .limit(1)

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        synced: messages && messages.length > 0,
        lastMessage: messages?.[0] || null
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
