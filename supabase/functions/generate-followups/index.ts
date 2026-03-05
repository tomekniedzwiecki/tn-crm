import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Lead {
  id: string
  name: string
  phone: string
  status: string
  expected_close?: string
  weekly_hours?: string
  experience?: string
  target_income?: string
  open_question?: string
  hours_since_contact?: number
}

interface RequestBody {
  stage: string           // Etap pipeline dla którego generujemy
  generated_by: string    // 'maciek' lub 'tomek'
}

const DEFAULT_GUIDELINES = `Piszesz krótko, bezpośrednio, bez korporacyjnego języka. Max 1-3 zdania.`

async function getGuidelines(supabase: any): Promise<string> {
  const { data } = await supabase
    .from('ai_guidelines')
    .select('content')
    .limit(1)
    .single()
  return data?.content || DEFAULT_GUIDELINES
}

// Pobierz ostatnie wiadomości dla leada
async function getLastMessages(supabase: any, leadId: string, limit = 10) {
  const { data } = await supabase
    .from('whatsapp_messages')
    .select('direction, message_text, message_timestamp')
    .eq('lead_id', leadId)
    .order('message_timestamp', { ascending: false })
    .limit(limit)

  return (data || []).reverse()
}

// Generuj pojedynczy follow-up
async function generateFollowup(
  apiKey: string,
  guidelines: string,
  lead: Lead,
  messages: any[],
  sellerName: string
): Promise<string> {
  const clientName = lead.name || 'Klient'

  // Format conversation
  const conversationHistory = messages
    .map(m => {
      const role = m.direction === 'outbound' ? `🔵 ${sellerName}` : `⚪ ${clientName}`
      const timestamp = m.message_timestamp
        ? new Date(m.message_timestamp).toLocaleString('pl-PL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
        : ''
      return `[${timestamp}] ${role}: ${m.message_text}`
    })
    .join('\n')

  const lastMessage = messages[messages.length - 1]
  const lastSellerText = lastMessage?.direction === 'outbound' ? lastMessage.message_text : ''

  let systemPrompt = `Pomagasz pisać follow-up na WhatsApp. Piszesz jako ${sellerName}.

${guidelines}

## KLIENT: ${clientName}
Status: ${lead.status || 'unknown'}`

  if (lead.weekly_hours) systemPrompt += `\nCzas tygodniowo: ${lead.weekly_hours}`
  if (lead.target_income) systemPrompt += `\nCel dochodu: ${lead.target_income}`
  if (lead.experience) systemPrompt += `\nMotywacja: ${lead.experience}`
  if (lead.open_question) systemPrompt += `\nOdpowiedź otwarta: ${lead.open_question}`

  const userMessage = `## ROZMOWA
🔵 = ${sellerName} (TY)
⚪ = ${clientName} (klient)

${conversationHistory || '(brak historii)'}

## SYTUACJA
Klient nie odpowiada od ${lead.hours_since_contact || '?'} godzin.
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
    throw new Error(`Claude API error: ${response.status}`)
  }

  const result = await response.json()
  return result.content[0]?.text?.trim() || ''
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
    const { stage, generated_by } = body

    if (!stage) {
      throw new Error('Stage is required')
    }

    const sellerName = generated_by === 'maciek' ? 'Maciek' : 'Tomek'

    // Get guidelines
    const guidelines = await getGuidelines(supabase)

    // Get leads in stage that need follow-up
    // We need to calculate needs_followup server-side
    const FOLLOWUP_STAGES = ['contacted', 'qualified', 'proposal', 'negotiation', 'waiting']
    const FOLLOWUP_HOURS = 24

    if (!FOLLOWUP_STAGES.includes(stage)) {
      return new Response(
        JSON.stringify({ success: true, generated: 0, message: 'Stage not eligible for follow-ups' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get leads in this stage with phone numbers
    const { data: leadsData, error: leadsError } = await supabase
      .from('leads')
      .select('id, name, phone, status, expected_close, weekly_hours, experience, target_income, open_question')
      .eq('status', stage)
      .not('phone', 'is', null)

    if (leadsError) throw leadsError

    if (!leadsData || leadsData.length === 0) {
      return new Response(
        JSON.stringify({ success: true, generated: 0, message: 'No leads in this stage' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get last message time for each lead
    const { data: messages } = await supabase
      .from('whatsapp_messages')
      .select('lead_id, message_timestamp')
      .in('lead_id', leadsData.map(l => l.id))
      .order('message_timestamp', { ascending: false })

    const lastMessageMap: Record<string, string> = {}
    messages?.forEach(m => {
      if (!lastMessageMap[m.lead_id]) {
        lastMessageMap[m.lead_id] = m.message_timestamp
      }
    })

    // Filter leads that need follow-up
    const now = new Date()
    const leadsNeedingFollowup: Lead[] = []

    for (const lead of leadsData) {
      let needsFollowup = false
      let hoursSinceContact = 0

      if (stage === 'waiting') {
        // Special case: waiting stage
        if (!lead.expected_close) continue

        const expectedClose = new Date(lead.expected_close)
        if (expectedClose > now) continue

        const lastMsg = lastMessageMap[lead.id]
        if (lastMsg) {
          hoursSinceContact = (now.getTime() - new Date(lastMsg).getTime()) / (1000 * 60 * 60)
          needsFollowup = hoursSinceContact > FOLLOWUP_HOURS
        } else {
          needsFollowup = true
        }
      } else {
        // Standard follow-up stages
        const lastMsg = lastMessageMap[lead.id]
        if (lastMsg) {
          hoursSinceContact = (now.getTime() - new Date(lastMsg).getTime()) / (1000 * 60 * 60)
          needsFollowup = hoursSinceContact > FOLLOWUP_HOURS
        } else {
          needsFollowup = true
        }
      }

      if (needsFollowup) {
        leadsNeedingFollowup.push({
          ...lead,
          hours_since_contact: Math.floor(hoursSinceContact)
        })
      }
    }

    if (leadsNeedingFollowup.length === 0) {
      return new Response(
        JSON.stringify({ success: true, generated: 0, message: 'No leads need follow-up' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check for existing pending followups (don't duplicate)
    const { data: existingFollowups } = await supabase
      .from('whatsapp_followups')
      .select('lead_id')
      .eq('status', 'pending')
      .in('lead_id', leadsNeedingFollowup.map(l => l.id))

    const existingLeadIds = new Set(existingFollowups?.map(f => f.lead_id) || [])
    const leadsToGenerate = leadsNeedingFollowup.filter(l => !existingLeadIds.has(l.id))

    if (leadsToGenerate.length === 0) {
      return new Response(
        JSON.stringify({ success: true, generated: 0, message: 'All leads already have pending follow-ups' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate follow-ups for each lead
    const results: any[] = []
    let totalInputTokens = 0
    let totalOutputTokens = 0

    for (const lead of leadsToGenerate) {
      try {
        // Get conversation history
        const leadMessages = await getLastMessages(supabase, lead.id)

        // Generate follow-up message
        const followupText = await generateFollowup(
          ANTHROPIC_API_KEY,
          guidelines,
          lead,
          leadMessages,
          sellerName
        )

        if (followupText) {
          // Normalize phone number
          let phone = lead.phone.replace(/[^0-9]/g, '')
          if (phone.length === 9) phone = '48' + phone

          // Save to database
          const { data: inserted, error: insertError } = await supabase
            .from('whatsapp_followups')
            .insert({
              lead_id: lead.id,
              phone_number: phone,
              contact_name: lead.name,
              message_text: followupText,
              status: 'pending',
              lead_status: lead.status,
              hours_since_contact: lead.hours_since_contact,
              generated_by
            })
            .select()
            .single()

          if (insertError) {
            console.error('Insert error for lead', lead.id, insertError)
          } else {
            results.push({
              lead_id: lead.id,
              lead_name: lead.name,
              message: followupText
            })
          }
        }
      } catch (err) {
        console.error('Error generating followup for lead', lead.id, err)
      }
    }

    // Calculate approximate cost (Sonnet: $3/M input, $15/M output)
    // Rough estimate: ~500 input tokens, ~50 output tokens per message
    const estimatedCost = results.length * ((500 * 3 / 1_000_000) + (50 * 15 / 1_000_000))

    return new Response(
      JSON.stringify({
        success: true,
        generated: results.length,
        skipped: leadsToGenerate.length - results.length,
        already_pending: existingLeadIds.size,
        results,
        estimated_cost_usd: Math.round(estimatedCost * 10000) / 10000
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
