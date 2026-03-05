import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Message {
  direction: 'inbound' | 'outbound'
  message_text: string
  message_timestamp: string
}

interface RequestBody {
  messages: Message[]
  contact_name: string
  phone_number: string
  synced_by: string
  custom_instruction?: string
}

// Fallback wytycznych jeśli brak w bazie
const DEFAULT_GUIDELINES = `Piszesz krótko, bezpośrednio, bez korporacyjnego języka. Max 1-3 zdania.`

// Pobiera wytyczne AI z bazy
async function getGuidelines(supabase: any): Promise<string> {
  const { data } = await supabase
    .from('ai_guidelines')
    .select('content')
    .limit(1)
    .single()
  return data?.content || DEFAULT_GUIDELINES
}

// Pobiera podstawowe dane o kliencie
async function getClientData(supabase: any, phoneNumber: string) {
  const context: {
    lead: any
    clientOffer: any
  } = {
    lead: null,
    clientOffer: null
  }

  // Znajdź leada po numerze telefonu
  const { data: lead } = await supabase
    .from('leads')
    .select('id, name, status, weekly_hours, experience, target_income, open_question')
    .or(`phone.eq.${phoneNumber},phone.eq.+${phoneNumber},phone.eq.${phoneNumber.replace(/^\+/, '')}`)
    .single()

  if (lead) {
    context.lead = lead

    // Pobierz ofertę klienta
    const { data: clientOffer } = await supabase
      .from('client_offers')
      .select('unique_token, valid_until, view_count')
      .eq('lead_id', lead.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    context.clientOffer = clientOffer
  }

  return context
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY not configured')
    }

    const supabase = createClient(
      SUPABASE_URL || 'https://yxmavwkwnfuphjqbelws.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY || ''
    )

    const body: RequestBody = await req.json()
    const { messages, contact_name, phone_number, synced_by } = body

    if (!messages || messages.length === 0) {
      throw new Error('No messages provided')
    }

    // Pobierz wytyczne i dane klienta
    const [guidelines, context] = await Promise.all([
      getGuidelines(supabase),
      getClientData(supabase, phone_number || '')
    ])

    // Przygotuj rozmowę
    const recentMessages = messages.slice(-15)
    const sellerName = synced_by === 'maciek' ? 'Maciek' : 'Tomek'
    const clientName = contact_name || 'Klient'

    const conversationHistory = recentMessages
      .map((m, i) => {
        const role = m.direction === 'outbound' ? `🔵 ${sellerName}` : `⚪ ${clientName}`
        const timestamp = m.message_timestamp
          ? new Date(m.message_timestamp).toLocaleString('pl-PL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
          : ''
        const isLast3 = i >= recentMessages.length - 3
        const prefix = isLast3 ? '>>> ' : ''
        return `${prefix}[${timestamp}] ${role}: ${m.message_text}`
      })
      .join('\n')

    // Sprawdź sytuację
    const lastMessage = messages[messages.length - 1]
    const isWaitingForClient = lastMessage?.direction === 'outbound'
    const lastClientMessage = [...messages].reverse().find(m => m.direction === 'inbound')
    const lastClientText = lastClientMessage?.message_text || ''
    const lastSellerText = isWaitingForClient ? lastMessage?.message_text : ''

    // Oblicz dni od ostatniej wiadomości
    let daysSinceLastMessage = 0
    if (lastMessage?.message_timestamp) {
      const lastMsgDate = new Date(lastMessage.message_timestamp)
      daysSinceLastMessage = Math.floor((Date.now() - lastMsgDate.getTime()) / (1000 * 60 * 60 * 24))
    }

    // Zbuduj system prompt
    let systemPrompt = `Pomagasz pisać odpowiedzi WhatsApp. Piszesz jako ${sellerName}.

${guidelines}`

    // Dodaj dane klienta jeśli są
    if (context.lead) {
      systemPrompt += `\n\n## KLIENT: ${context.lead.name || clientName}`
      systemPrompt += `\nStatus: ${context.lead.status || 'new'}`
      if (context.lead.weekly_hours) systemPrompt += `\nCzas: ${context.lead.weekly_hours}`
      if (context.lead.target_income) systemPrompt += `\nCel: ${context.lead.target_income}`
    }

    if (context.clientOffer) {
      systemPrompt += `\n\nLink do oferty: https://crm.tomekniedzwiecki.pl/p/${context.clientOffer.unique_token}`
      if (context.clientOffer.view_count > 0) {
        systemPrompt += ` (oglądał ${context.clientOffer.view_count}x)`
      }
    }

    // User message z rozmową
    const userMessage = `## ROZMOWA
🔵 = ${sellerName} (TY)
⚪ = ${clientName} (klient)
>>> = ostatnie wiadomości

${conversationHistory}

## SYTUACJA
${isWaitingForClient
  ? `Twoja ostatnia wiadomość: "${lastSellerText}"
Klient NIE odpowiedział${daysSinceLastMessage > 0 ? ` (${daysSinceLastMessage} dni temu)` : ''}.
Napisz FOLLOW-UP. Nie powtarzaj się. Krótko: "I co?", "Dasz znać?" itp.`
  : `Klient napisał: "${lastClientText}"
Odpowiedz na to co napisał.`
}

ZAWSZE pisz po polsku, poprawnie gramatycznie. Napisz TYLKO tekst wiadomości (1-3 zdania).`

    // Wywołaj Claude
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 200,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }]
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Claude API error:', error)
      throw new Error(`Claude API error: ${response.status}`)
    }

    const result = await response.json()
    const generatedReply = result.content[0]?.text || ''

    // Oblicz koszt (Haiku: $0.80/M input, $4/M output)
    const inputTokens = result.usage?.input_tokens || 0
    const outputTokens = result.usage?.output_tokens || 0
    const costUSD = (inputTokens * 0.80 / 1_000_000) + (outputTokens * 4 / 1_000_000)

    return new Response(
      JSON.stringify({
        success: true,
        reply: generatedReply.trim(),
        usage: {
          input_tokens: inputTokens,
          output_tokens: outputTokens,
          cost_usd: Math.round(costUSD * 10000) / 10000
        },
        context: {
          lead_name: context.lead?.name || null,
          lead_status: context.lead?.status || null,
          has_offer: !!context.clientOffer,
          days_since_last_message: daysSinceLastMessage,
          waiting_for_client: isWaitingForClient
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
