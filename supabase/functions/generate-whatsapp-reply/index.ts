import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

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
  lead_info?: {
    name?: string
    email?: string
    status?: string
  }
  custom_instruction?: string
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')
    if (!ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY not configured')
    }

    const body: RequestBody = await req.json()
    const { messages, contact_name, lead_info, custom_instruction } = body

    if (!messages || messages.length === 0) {
      throw new Error('No messages provided')
    }

    // Przygotuj historię konwersacji dla Claude
    const conversationHistory = messages
      .slice(-20) // Ostatnie 20 wiadomości
      .map(m => {
        const role = m.direction === 'outbound' ? 'Ty (sprzedawca)' : contact_name
        return `${role}: ${m.message_text}`
      })
      .join('\n')

    // Kontekst o leadzie
    let leadContext = ''
    if (lead_info) {
      const parts = []
      if (lead_info.name) parts.push(`Imię: ${lead_info.name}`)
      if (lead_info.email) parts.push(`Email: ${lead_info.email}`)
      if (lead_info.status) parts.push(`Status: ${lead_info.status}`)
      if (parts.length > 0) {
        leadContext = `\n\nInformacje o kliencie:\n${parts.join('\n')}`
      }
    }

    // System prompt
    const systemPrompt = `Jesteś asystentem sprzedawcy w firmie TN (Tomek Niedźwiecki - marketing dla firm).
Pomagasz pisać odpowiedzi na wiadomości WhatsApp od potencjalnych klientów.

Zasady:
- Pisz naturalnie, po polsku, jak człowiek (nie jak bot)
- Bądź uprzejmy ale konkretny
- Nie używaj emoji (chyba że klient ich używa)
- Odpowiedzi powinny być krótkie (1-3 zdania max)
- Jeśli klient pyta o cenę - zaproponuj rozmowę telefoniczną
- Jeśli klient się waha - zaproponuj krótkie spotkanie online
- Nie obiecuj rzeczy których nie wiesz
${leadContext}
${custom_instruction ? `\nDodatkowe instrukcje: ${custom_instruction}` : ''}`

    // Wywołaj Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: `Oto historia konwersacji na WhatsApp:\n\n${conversationHistory}\n\nNapisz odpowiedź na ostatnią wiadomość od ${contact_name}. Odpowiedz TYLKO tekstem wiadomości, bez żadnych wyjaśnień.`
          }
        ]
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Claude API error:', error)
      throw new Error(`Claude API error: ${response.status}`)
    }

    const result = await response.json()
    const generatedReply = result.content[0]?.text || ''

    return new Response(
      JSON.stringify({
        success: true,
        reply: generatedReply.trim(),
        tokens_used: result.usage?.output_tokens || 0
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
