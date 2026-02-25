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

    // Sprawdź API key w bazie
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

    // Wyciągnij ostatnie 9 cyfr (numer bez kierunkowego)
    // Najpierw usuń wszystko poza cyframi (spacje, myślniki itp.)
    const phoneDigits = phone.replace(/\D/g, '')
    const phone9 = phoneDigits.slice(-9)

    // Szukaj leada po numerze telefonu
    console.log(`whatsapp-lead-lookup: phone=${phone}, phoneDigits=${phoneDigits}, phone9=${phone9}`)

    const { data: leads, error } = await supabase
      .from('leads')
      .select('id, name, phone, status, created_at, expected_close, deal_value')
      .or(`phone.ilike.%${phone9}%,phone.ilike.%${phone}%`)
      .limit(1)

    console.log(`whatsapp-lead-lookup: found ${leads?.length || 0} leads, error=${error?.message || 'none'}`)

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Pobierz pipeline stages z ustawień
    const { data: settingsData } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'pipeline_stages')
      .single()

    const pipelineStages = settingsData?.value || []

    return new Response(
      JSON.stringify({
        found: leads && leads.length > 0,
        lead: leads?.[0] || null,
        pipelineStages,
        debug: { phoneReceived: phone, phoneDigits, phone9 }
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
