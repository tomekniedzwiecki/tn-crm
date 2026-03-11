import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-sync-api-key',
}

// Aktualizuje status follow-upu (sent/skipped)
// Wymaga x-sync-api-key header

interface RequestBody {
  followup_id: string
  status: 'sent' | 'skipped'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Weryfikuj API key
    const syncApiKey = req.headers.get('x-sync-api-key')
    const expectedKey = Deno.env.get('WHATSAPP_SYNC_KEY')

    if (!syncApiKey || syncApiKey !== expectedKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid API key' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    const body: RequestBody = await req.json()
    const { followup_id, status } = body

    if (!followup_id || !status) {
      throw new Error('followup_id and status are required')
    }

    if (!['sent', 'skipped'].includes(status)) {
      throw new Error('status must be "sent" or "skipped"')
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    const supabase = createClient(
      SUPABASE_URL || 'https://yxmavwkwnfuphjqbelws.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY || ''
    )

    // Pobierz dane follow-upa przed aktualizacją
    const { data: followup, error: fetchError } = await supabase
      .from('whatsapp_followups')
      .select('lead_id, phone_number, message_text')
      .eq('id', followup_id)
      .single()

    if (fetchError || !followup) {
      throw new Error('Follow-up not found')
    }

    const updateData: any = { status }
    if (status === 'sent') {
      updateData.sent_at = new Date().toISOString()
    }

    const { error } = await supabase
      .from('whatsapp_followups')
      .update(updateData)
      .eq('id', followup_id)

    if (error) throw error

    // Jeśli wysłany - dodaj do whatsapp_messages żeby zaktualizować "czas od ostatniej wiadomości"
    if (status === 'sent' && followup.lead_id) {
      await supabase.from('whatsapp_messages').insert({
        lead_id: followup.lead_id,
        phone_number: followup.phone_number,
        direction: 'outbound',
        message_text: followup.message_text,
        message_timestamp: new Date().toISOString()
      })
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('update-followup error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
