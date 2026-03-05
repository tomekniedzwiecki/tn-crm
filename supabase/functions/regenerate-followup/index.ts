import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-sync-api-key',
}

interface Config {
  seller_name: string
  guidelines: string
}

// Pobierz konfigurację z bazy
async function getConfig(supabase: any): Promise<Config> {
  const { data: guidelinesData } = await supabase
    .from('ai_guidelines')
    .select('content')
    .limit(1)
    .single()

  const { data: settingsData } = await supabase
    .from('app_settings')
    .select('key, value')
    .eq('key', 'followup_seller_name')
    .single()

  return {
    seller_name: settingsData?.value || 'Tomek',
    guidelines: guidelinesData?.content || 'Piszesz krótko, bezpośrednio, bez korporacyjnego języka. Max 1-3 zdania.'
  }
}

// Pobierz ostatnie wiadomości dla leada
async function getLastMessages(supabase: any, leadId: string, limit = 15) {
  const { data } = await supabase
    .from('whatsapp_messages')
    .select('direction, message_text, message_timestamp')
    .eq('lead_id', leadId)
    .order('message_timestamp', { ascending: false })
    .limit(limit)

  return (data || []).reverse()
}

// Generuj wiadomość follow-up przez Claude API
async function generateFollowupMessage(
  apiKey: string,
  config: Config,
  lead: any,
  messages: any[],
  hoursSinceContact: number
): Promise<string> {
  const clientName = lead.name || 'Klient'

  const conversationHistory = messages
    .map(m => {
      const role = m.direction === 'outbound' ? `🔵 ${config.seller_name}` : `⚪ ${clientName}`
      const timestamp = m.message_timestamp
        ? new Date(m.message_timestamp).toLocaleString('pl-PL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
        : ''
      return `[${timestamp}] ${role}: ${m.message_text}`
    })
    .join('\n')

  const lastMessage = messages[messages.length - 1]
  const lastSellerText = lastMessage?.direction === 'outbound' ? lastMessage.message_text : ''

  let systemPrompt = `Pomagasz pisać follow-up na WhatsApp. Piszesz jako ${config.seller_name}.

${config.guidelines}

## KLIENT: ${clientName}
Status: ${lead.status || 'unknown'}`

  if (lead.weekly_hours) systemPrompt += `\nCzas tygodniowo: ${lead.weekly_hours}`
  if (lead.target_income) systemPrompt += `\nCel dochodu: ${lead.target_income}`
  if (lead.experience) systemPrompt += `\nMotywacja: ${lead.experience}`
  if (lead.open_question) systemPrompt += `\nOdpowiedź otwarta: ${lead.open_question}`

  const userMessage = `## ROZMOWA
🔵 = ${config.seller_name} (TY)
⚪ = ${clientName} (klient)

${conversationHistory || '(brak historii)'}

## SYTUACJA
Klient nie odpowiada od ${hoursSinceContact || '?'} godzin.
${lastSellerText ? `Twoja ostatnia wiadomość: "${lastSellerText}"` : ''}

Napisz KRÓTKI follow-up (1-2 zdania). Nie powtarzaj poprzednich wiadomości. Bądź naturalny.
ZAWSZE pisz po polsku, poprawnie gramatycznie. Napisz TYLKO tekst wiadomości.`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 150,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }]
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Claude API error ${response.status}: ${errorText}`)
  }

  const result = await response.json()
  const text = result.content[0]?.text?.trim() || ''

  if (text.length < 5) {
    throw new Error('Generated message too short')
  }

  return text
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Sprawdź API key
    const syncApiKey = req.headers.get('x-sync-api-key')
    if (!syncApiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing API key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY not configured')
    }

    const supabase = createClient(SUPABASE_URL || '', SUPABASE_SERVICE_ROLE_KEY || '')

    // Weryfikuj API key
    const { data: keyData } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'whatsapp_sync_api_key')
      .single()

    if (!keyData || keyData.value !== syncApiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid API key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Pobierz followup_id z body
    const { followup_id } = await req.json()

    if (!followup_id) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing followup_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Pobierz istniejący followup
    const { data: followup, error: followupError } = await supabase
      .from('whatsapp_followups')
      .select('*')
      .eq('id', followup_id)
      .single()

    if (followupError || !followup) {
      return new Response(
        JSON.stringify({ success: false, error: 'Followup not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Pobierz dane leada
    const { data: lead } = await supabase
      .from('leads')
      .select('id, name, phone, status, weekly_hours, experience, target_income, open_question')
      .eq('id', followup.lead_id)
      .single()

    if (!lead) {
      return new Response(
        JSON.stringify({ success: false, error: 'Lead not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Pobierz konfigurację
    const config = await getConfig(supabase)

    // Pobierz najnowsze wiadomości (po synchronizacji)
    const messages = await getLastMessages(supabase, lead.id)

    // Oblicz godziny od ostatniego kontaktu
    let hoursSinceContact = followup.hours_since_contact || 24
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1]
      hoursSinceContact = Math.floor(
        (Date.now() - new Date(lastMsg.message_timestamp).getTime()) / (1000 * 60 * 60)
      )
    }

    // Generuj nową wiadomość
    const newMessage = await generateFollowupMessage(
      ANTHROPIC_API_KEY,
      config,
      lead,
      messages,
      hoursSinceContact
    )

    // Zaktualizuj followup
    const { error: updateError } = await supabase
      .from('whatsapp_followups')
      .update({
        message_text: newMessage,
        hours_since_contact: hoursSinceContact,
        regenerated_at: new Date().toISOString()
      })
      .eq('id', followup_id)

    if (updateError) {
      throw new Error('Failed to update followup: ' + updateError.message)
    }

    console.log(`regenerate-followup: Regenerated for ${lead.name || followup.phone_number}`)

    return new Response(
      JSON.stringify({
        success: true,
        message: newMessage,
        hours_since_contact: hoursSinceContact
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('regenerate-followup: Error', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
