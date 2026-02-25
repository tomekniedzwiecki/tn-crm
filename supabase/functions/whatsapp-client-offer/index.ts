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

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Sprawdź API key
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

    const url = new URL(req.url)
    const leadId = url.searchParams.get('leadId')

    if (!leadId) {
      return new Response(
        JSON.stringify({ error: 'Missing leadId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // GET - pobierz istniejącą ofertę dla leada
    if (req.method === 'GET') {
      const { data: clientOffer, error } = await supabase
        .from('client_offers')
        .select(`
          id,
          unique_token,
          offer_type,
          custom_price,
          valid_until,
          created_at,
          offer:offers(id, name, price)
        `)
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (!clientOffer) {
        return new Response(
          JSON.stringify({ exists: false }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Generuj URL oferty
      const baseUrl = 'https://crm.tomekniedzwiecki.pl'
      const offerUrl = clientOffer.offer_type === 'starter'
        ? `${baseUrl}/offer-starter?token=${clientOffer.unique_token}`
        : `${baseUrl}/p/${clientOffer.unique_token}`

      return new Response(
        JSON.stringify({
          exists: true,
          clientOffer: {
            ...clientOffer,
            url: offerUrl
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // DELETE - usuń ofertę
    if (req.method === 'DELETE') {
      const { error } = await supabase
        .from('client_offers')
        .delete()
        .eq('lead_id', leadId)

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
