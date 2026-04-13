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
    const MANUS_API_KEY = Deno.env.get('MANUS_API_KEY')
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!MANUS_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: 'MANUS_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { workflow_id, ad_account_id, date_from, date_to } = await req.json()

    if (!workflow_id || !ad_account_id) {
      return new Response(
        JSON.stringify({ success: false, error: 'workflow_id and ad_account_id are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Default to last 30 days if no dates provided
    const endDate = date_to || new Date().toISOString().split('T')[0]
    const startDate = date_from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    // Create Manus task
    const instruction = `
Pobierz statystyki kampanii reklamowych z Meta Ads dla konta: ${ad_account_id}

Okres: od ${startDate} do ${endDate}

WAŻNE: Użyj DOKŁADNIE tej samej waluty co w ustawieniach konta Meta Ads. NIE przeliczaj na PLN jeśli konto używa innej waluty!

Zwróć dane w formacie JSON:
{
  "period": { "from": "${startDate}", "to": "${endDate}" },
  "currency": "[waluta konta Meta Ads - np. PLN, USD, EUR]",
  "spend": [całkowite wydatki - liczba bez waluty],
  "impressions": [liczba wyświetleń],
  "reach": [zasięg - unikalni użytkownicy],
  "frequency": [średnia częstotliwość wyświetleń na osobę],
  "cpm": [koszt za 1000 wyświetleń],
  "clicks": [liczba kliknięć w link],
  "link_clicks": [kliknięcia w link - jeśli dostępne osobno],
  "landing_page_views": [wyświetlenia strony docelowej],
  "ctr": [CTR w procentach],
  "cpc": [koszt za kliknięcie],
  "add_to_cart": [liczba zdarzeń AddToCart],
  "initiate_checkout": [liczba zdarzeń InitiateCheckout],
  "purchases": [liczba zakupów/konwersji Purchase],
  "conversion_rate": [współczynnik konwersji zakupów w %],
  "cost_per_purchase": [koszt za zakup],
  "revenue": [przychód z zakupów, jeśli dostępny],
  "roas": [ROAS = revenue/spend],
  "funnel": {
    "clicks_to_cart_rate": [% kliknięć które dodały do koszyka],
    "cart_to_checkout_rate": [% koszyków które przeszły do kasy],
    "checkout_to_purchase_rate": [% kas które zakończyły zakup]
  },
  "campaigns": [
    { "name": "nazwa kampanii", "spend": X, "purchases": Y, "impressions": Z, "reach": R, "cpm": C, "add_to_cart": A, "initiate_checkout": B }
  ]
}

Pobierz eventy konwersji: AddToCart, InitiateCheckout, Purchase.
Jeśli nie ma danych, ustaw na 0.
Zwróć TYLKO JSON, bez dodatkowego tekstu.
`.trim()

    // Get Meta Ads connector UUID from env (must be set after authorizing in Manus dashboard)
    const META_ADS_CONNECTOR_UUID = Deno.env.get('MANUS_META_ADS_CONNECTOR_UUID')

    const requestBody: any = {
      message: {
        content: instruction
      }
    }

    // Add connector if UUID is configured
    if (META_ADS_CONNECTOR_UUID) {
      requestBody.message.connectors = [META_ADS_CONNECTOR_UUID]
    }

    const manusResponse = await fetch('https://api.manus.ai/v2/task.create', {
      method: 'POST',
      headers: {
        'x-manus-api-key': MANUS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    })

    const manusData = await manusResponse.json()

    if (!manusResponse.ok || !manusData.ok) {
      console.error('Manus API error:', manusData)
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Manus API error',
          details: manusData
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Store task ID for tracking
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

    const { error: updateError } = await supabase
      .from('workflow_ads')
      .update({
        manus_task_id: manusData.task_id,
        manus_task_status: 'pending',
        manus_task_created_at: new Date().toISOString()
      })
      .eq('workflow_id', workflow_id)

    if (updateError) {
      console.error('Error updating workflow_ads:', updateError)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Manus task created',
        task_id: manusData.task_id,
        status: 'pending'
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
