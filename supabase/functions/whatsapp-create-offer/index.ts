import { createClient } from "jsr:@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-sync-api-key',
}

function generateToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return token
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

    // Pobierz dane z body
    const body = await req.json()
    const { leadId, offerId, offerType, validDays, customPrice } = body

    if (!leadId || !offerId) {
      return new Response(
        JSON.stringify({ error: 'Missing leadId or offerId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Pobierz dane leada
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('id, name, email, company')
      .eq('id', leadId)
      .single()

    if (leadError || !lead) {
      return new Response(
        JSON.stringify({ error: 'Lead not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Pobierz dane oferty
    const { data: offer, error: offerError } = await supabase
      .from('offers')
      .select('id, name, price, offer_type')
      .eq('id', offerId)
      .single()

    if (offerError || !offer) {
      return new Response(
        JSON.stringify({ error: 'Offer not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generuj token i datę ważności
    const token = generateToken()
    const validUntil = new Date()
    validUntil.setDate(validUntil.getDate() + (validDays || 2))
    const validUntilStr = validUntil.toISOString().split('T')[0]

    // Sprawdź czy istnieje już client_offer dla tego leada
    const { data: existingOffer } = await supabase
      .from('client_offers')
      .select('id, unique_token')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    let clientOffer

    if (existingOffer) {
      // Zaktualizuj istniejącą ofertę
      const updateData: any = {
        offer_id: offerId,
        valid_until: validUntilStr,
        offer_type: offerType || offer.offer_type || 'starter'
      }
      if (customPrice) {
        updateData.custom_price = customPrice
      }

      const { data, error } = await supabase
        .from('client_offers')
        .update(updateData)
        .eq('id', existingOffer.id)
        .select()
        .single()

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      clientOffer = data
    } else {
      // Utwórz nową client_offer
      const insertData: any = {
        lead_id: leadId,
        offer_id: offerId,
        unique_token: token,
        valid_until: validUntilStr,
        offer_type: offerType || offer.offer_type || 'starter'
      }
      if (customPrice) {
        insertData.custom_price = customPrice
      }

      const { data, error } = await supabase
        .from('client_offers')
        .insert([insertData])
        .select()
        .single()

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      clientOffer = data
    }

    // Generuj URL oferty
    const baseUrl = 'https://crm.tomekniedzwiecki.pl'
    const offerTypeForUrl = clientOffer.offer_type || 'starter'
    const offerUrl = offerTypeForUrl === 'starter'
      ? `${baseUrl}/offer-starter?token=${clientOffer.unique_token}`
      : `${baseUrl}/p/${clientOffer.unique_token}`

    // Trigger automation for offer email (jeśli lead ma email)
    if (lead.email) {
      const effectivePrice = customPrice || offer.price
      try {
        await supabase.functions.invoke('automation-trigger', {
          body: {
            trigger_type: 'offer_created',
            entity_type: 'client_offer',
            entity_id: clientOffer.id,
            context: {
              email: lead.email,
              clientName: lead.name || lead.company || 'Cześć',
              offerName: offer.name,
              offerPrice: effectivePrice,
              validUntil: validUntilStr,
              offerUrl: offerUrl
            }
          }
        })
      } catch (e) {
        console.error('Error triggering automation:', e)
        // Nie blokuj - email jest opcjonalny
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        clientOffer: {
          ...clientOffer,
          url: offerUrl
        },
        offer: {
          name: offer.name,
          price: customPrice || offer.price
        }
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
