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
    console.log('whatsapp-lead-update request:', { leadId, status, expected_close })

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
      .select('id, name, phone, status, expected_close, updated_at')
      .single()

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Dodaj aktywność o zmianie statusu (jeśli się zmienił) - tak jak w CRM
    if (status !== undefined && oldStatus && oldStatus !== status) {
      try {
        const statusNames: Record<string, string> = {
          'new': 'Nowy',
          'contacted': 'Skontaktowany',
          'qualified': 'Zakwalifikowany',
          'proposal': 'Propozycja',
          'negotiation': 'Negocjacje',
          'waiting': 'Oczekiwanie',
          'won': 'Wygrany',
          'lost': 'Przegrany',
          'abandoned': 'Porzucony'
        }

        const oldName = statusNames[oldStatus] || oldStatus
        const newName = statusNames[status] || status

        // Pobierz aktualne activities z leada
        const { data: leadData } = await supabase
          .from('leads')
          .select('activities')
          .eq('id', leadId)
          .single()

        const currentActivities = Array.isArray(leadData?.activities) ? leadData.activities : []

        // Dodaj nową aktywność (format taki sam jak w CRM)
        const newActivity = {
          type: 'status_change',
          content: `Status zmieniony: ${oldName} → ${newName}`,
          created_at: new Date().toISOString(),
          performed_by: null,
          performed_by_name: 'WhatsApp'
        }

        // Zapisz zaktualizowane activities
        await supabase
          .from('leads')
          .update({ activities: [...currentActivities, newActivity] })
          .eq('id', leadId)
      } catch (activityError) {
        console.error('Error adding activity:', activityError)
        // Kontynuuj - główna aktualizacja statusu już się powiodła
      }
    }

    return new Response(
      JSON.stringify({ success: true, lead: updatedLead }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('whatsapp-lead-update error:', errorMessage)
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
