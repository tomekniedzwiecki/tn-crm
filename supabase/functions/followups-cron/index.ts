import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Ta funkcja jest wywoływana przez cron (np. co godzinę)
// Generuje follow-upy dla wszystkich etapów pipeline

const FOLLOWUP_STAGES = ['contacted', 'qualified', 'proposal', 'negotiation', 'waiting']
const FOLLOWUP_HOURS = 24
const DEFAULT_GUIDELINES = `Piszesz krótko, bezpośrednio, bez korporacyjnego języka. Max 1-3 zdania.`

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

async function getGuidelines(supabase: any): Promise<string> {
  const { data } = await supabase
    .from('ai_guidelines')
    .select('content')
    .limit(1)
    .single()
  return data?.content || DEFAULT_GUIDELINES
}

async function getLastMessages(supabase: any, leadId: string, limit = 10) {
  const { data } = await supabase
    .from('whatsapp_messages')
    .select('direction, message_text, message_timestamp')
    .eq('lead_id', leadId)
    .order('message_timestamp', { ascending: false })
    .limit(limit)

  return (data || []).reverse()
}

async function generateFollowupMessage(
  apiKey: string,
  guidelines: string,
  lead: Lead,
  messages: any[],
  sellerName: string
): Promise<string> {
  const clientName = lead.name || 'Klient'

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
  console.log('followups-cron: Starting...')

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

    const guidelines = await getGuidelines(supabase)
    const now = new Date()
    const results: any = {
      stages: {},
      total_generated: 0,
      total_skipped: 0
    }

    // Przetwórz każdy etap
    for (const stage of FOLLOWUP_STAGES) {
      console.log(`followups-cron: Processing stage ${stage}...`)

      // Pobierz leady w tym etapie
      const { data: leadsData, error: leadsError } = await supabase
        .from('leads')
        .select('id, name, phone, status, expected_close, weekly_hours, experience, target_income, open_question')
        .eq('status', stage)
        .not('phone', 'is', null)

      if (leadsError || !leadsData) {
        console.error(`followups-cron: Error fetching leads for ${stage}:`, leadsError)
        results.stages[stage] = { error: leadsError?.message }
        continue
      }

      // Pobierz ostatnie wiadomości
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

      // Filtruj leady potrzebujące follow-up
      const leadsNeedingFollowup: Lead[] = []

      for (const lead of leadsData) {
        let needsFollowup = false
        let hoursSinceContact = 0

        if (stage === 'waiting') {
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

      // Sprawdź istniejące pending followups
      const { data: existingFollowups } = await supabase
        .from('whatsapp_followups')
        .select('lead_id')
        .eq('status', 'pending')
        .in('lead_id', leadsNeedingFollowup.map(l => l.id))

      const existingLeadIds = new Set(existingFollowups?.map(f => f.lead_id) || [])
      const leadsToGenerate = leadsNeedingFollowup.filter(l => !existingLeadIds.has(l.id))

      let stageGenerated = 0
      let stageSkipped = 0

      // Generuj follow-upy (max 5 na etap na raz żeby nie przekroczyć limitu czasu)
      for (const lead of leadsToGenerate.slice(0, 5)) {
        try {
          const leadMessages = await getLastMessages(supabase, lead.id)
          const followupText = await generateFollowupMessage(
            ANTHROPIC_API_KEY,
            guidelines,
            lead,
            leadMessages,
            'Tomek'
          )

          if (followupText) {
            let phone = lead.phone.replace(/[^0-9]/g, '')
            if (phone.length === 9) phone = '48' + phone

            await supabase
              .from('whatsapp_followups')
              .insert({
                lead_id: lead.id,
                phone_number: phone,
                contact_name: lead.name,
                message_text: followupText,
                status: 'pending',
                lead_status: lead.status,
                hours_since_contact: lead.hours_since_contact,
                generated_by: 'cron'
              })

            stageGenerated++
          }
        } catch (err) {
          console.error(`followups-cron: Error generating for lead ${lead.id}:`, err)
          stageSkipped++
        }
      }

      results.stages[stage] = {
        total_leads: leadsData.length,
        needs_followup: leadsNeedingFollowup.length,
        already_pending: existingLeadIds.size,
        generated: stageGenerated,
        skipped: stageSkipped
      }

      results.total_generated += stageGenerated
      results.total_skipped += stageSkipped
    }

    console.log('followups-cron: Completed', results)

    return new Response(
      JSON.stringify({ success: true, ...results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('followups-cron: Error', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
