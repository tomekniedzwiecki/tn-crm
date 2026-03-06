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

    // Pobierz dane z body
    const body = await req.json()
    const { leadId, status, expected_close } = body

    if (!leadId) {
      return new Response(
        JSON.stringify({ error: 'Missing leadId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Pobierz aktualny status leada (przed zmianą)
    const { data: currentLead } = await supabase
      .from('leads')
      .select('id, name, status')
      .eq('id', leadId)
      .single()

    const oldStatus = currentLead?.status

    // Przygotuj dane do aktualizacji
    const updateData: Record<string, any> = {}
    if (status !== undefined) {
      updateData.status = status
      // Zawsze aktualizuj datę ostatniego kontaktu przy zmianie statusu
      updateData.last_contacted_at = new Date().toISOString()
    }
    if (expected_close !== undefined) {
      updateData.expected_close = expected_close
    }

    if (Object.keys(updateData).length === 0) {
      return new Response(
        JSON.stringify({ error: 'No fields to update' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Aktualizuj leada
    const { data: updatedLead, error } = await supabase
      .from('leads')
      .update(updateData)
      .eq('id', leadId)
      .select('id, name, phone, status, expected_close, last_contacted_at')
      .single()

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Dodaj notatkę o zmianie statusu (jeśli się zmienił)
    if (status !== undefined && oldStatus && oldStatus !== status) {
      const statusNames: Record<string, string> = {
        'new': 'Nowy',
        'contacted': 'Skontaktowany',
        'qualified': 'Zakwalifikowany',
        'proposal': 'Propozycja',
        'negotiation': 'Negocjacje',
        'waiting': 'Oczekiwanie',
        'won': 'Wygrany',
        'lost': 'Przegrany'
      }

      const oldName = statusNames[oldStatus] || oldStatus
      const newName = statusNames[status] || status

      await supabase
        .from('lead_notes')
        .insert({
          lead_id: leadId,
          content: `Zmiana statusu: ${oldName} → ${newName}`,
          created_by: 'WhatsApp'
        })
    }

    return new Response(
      JSON.stringify({ success: true, lead: updatedLead }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
