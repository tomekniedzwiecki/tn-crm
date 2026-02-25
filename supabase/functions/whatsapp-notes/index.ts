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

    // GET - pobierz notatki dla leada
    if (req.method === 'GET') {
      const url = new URL(req.url)
      const leadId = url.searchParams.get('leadId')

      if (!leadId) {
        return new Response(
          JSON.stringify({ error: 'Missing leadId' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const { data: lead, error } = await supabase
        .from('leads')
        .select('id, name, notes_history')
        .eq('id', leadId)
        .single()

      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({
          notes: lead?.notes_history || [],
          leadName: lead?.name
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // POST - dodaj nową notatkę
    if (req.method === 'POST') {
      const body = await req.json()
      const { leadId, content, createdBy } = body

      if (!leadId || !content) {
        return new Response(
          JSON.stringify({ error: 'Missing leadId or content' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Pobierz aktualne notatki
      const { data: lead, error: fetchError } = await supabase
        .from('leads')
        .select('notes_history')
        .eq('id', leadId)
        .single()

      if (fetchError) {
        return new Response(
          JSON.stringify({ error: fetchError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const notesHistory = lead?.notes_history || []

      // Dodaj nową notatkę (format zgodny z CRM)
      const newNote = {
        id: crypto.randomUUID(),
        content,
        created_at: new Date().toISOString(),
        performed_by: null,
        performed_by_name: createdBy || 'WhatsApp',
        lead_status: null
      }

      notesHistory.push(newNote)

      // Zapisz
      const { error: updateError } = await supabase
        .from('leads')
        .update({ notes_history: notesHistory })
        .eq('id', leadId)

      if (updateError) {
        return new Response(
          JSON.stringify({ error: updateError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ success: true, note: newNote }),
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
