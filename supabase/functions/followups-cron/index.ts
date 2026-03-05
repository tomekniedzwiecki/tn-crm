import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// =====================================================
// FOLLOW-UPS CRON - Profesjonalne generowanie follow-upów
// =====================================================
// Wywoływane przez Supabase cron co godzinę
// Generuje AI follow-upy dla leadów bez kontaktu >24h
// =====================================================

const FOLLOWUP_STAGES = ['contacted', 'qualified', 'proposal', 'negotiation', 'waiting']
const DEFAULT_FOLLOWUP_HOURS = 24
const MAX_FOLLOWUPS_PER_RUN = 20
const RATE_LIMIT_MS = 1500 // 1.5s między requestami do Claude
const MAX_RETRIES = 3
const RETRY_DELAY_MS = 2000

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

interface Config {
  followup_hours: number
  seller_name: string
  guidelines: string
}

// Pobierz konfigurację z bazy
async function getConfig(supabase: any): Promise<Config> {
  // Guidelines
  const { data: guidelinesData } = await supabase
    .from('ai_guidelines')
    .select('content')
    .limit(1)
    .single()

  // Settings
  const { data: settingsData } = await supabase
    .from('app_settings')
    .select('key, value')
    .in('key', ['followup_hours', 'followup_seller_name'])

  const settings: Record<string, string> = {}
  settingsData?.forEach((s: any) => { settings[s.key] = s.value })

  return {
    followup_hours: parseInt(settings.followup_hours) || DEFAULT_FOLLOWUP_HOURS,
    seller_name: settings.followup_seller_name || 'Tomek',
    guidelines: guidelinesData?.content || 'Piszesz krótko, bezpośrednio, bez korporacyjnego języka. Max 1-3 zdania.'
  }
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

// Sleep helper
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

// Retry wrapper z exponential backoff
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = MAX_RETRIES,
  baseDelay: number = RETRY_DELAY_MS
): Promise<T> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err as Error
      const delay = baseDelay * Math.pow(2, attempt)
      console.log(`followups-cron: Retry ${attempt + 1}/${maxRetries} after ${delay}ms - ${err.message}`)
      await sleep(delay)
    }
  }

  throw lastError
}

// Generuj wiadomość follow-up przez Claude API
async function generateFollowupMessage(
  apiKey: string,
  config: Config,
  lead: Lead,
  messages: any[]
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
    const errorText = await response.text()
    throw new Error(`Claude API error ${response.status}: ${errorText}`)
  }

  const result = await response.json()
  const text = result.content[0]?.text?.trim() || ''

  // Walidacja - wiadomość musi mieć min 5 znaków
  if (text.length < 5) {
    throw new Error('Generated message too short')
  }

  return text
}

// Sprawdź czy lead ma już podobny pending followup
async function hasSimilarPendingFollowup(supabase: any, leadId: string): Promise<boolean> {
  const { data } = await supabase
    .from('whatsapp_followups')
    .select('id')
    .eq('lead_id', leadId)
    .eq('status', 'pending')
    .limit(1)

  return (data?.length || 0) > 0
}

// Zapisz log wykonania
async function logExecution(supabase: any, results: any) {
  try {
    await supabase
      .from('followup_execution_logs')
      .insert({
        executed_at: new Date().toISOString(),
        total_generated: results.total_generated,
        total_skipped: results.total_skipped,
        total_errors: results.total_errors,
        details: results
      })
  } catch (err) {
    console.error('followups-cron: Failed to save execution log', err)
  }
}

serve(async (req) => {
  const startTime = Date.now()
  console.log('followups-cron: Starting at', new Date().toISOString())

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const results: any = {
    started_at: new Date().toISOString(),
    stages: {},
    total_generated: 0,
    total_skipped: 0,
    total_errors: 0,
    leads_processed: []
  }

  try {
    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY not configured')
    }

    const supabase = createClient(
      SUPABASE_URL || '',
      SUPABASE_SERVICE_ROLE_KEY || ''
    )

    // Pobierz konfigurację
    const config = await getConfig(supabase)
    console.log('followups-cron: Config loaded - hours:', config.followup_hours, 'seller:', config.seller_name)

    const now = new Date()
    let totalGenerated = 0

    // Przetwórz każdy etap
    for (const stage of FOLLOWUP_STAGES) {
      if (totalGenerated >= MAX_FOLLOWUPS_PER_RUN) {
        console.log('followups-cron: Reached max followups per run, stopping')
        break
      }

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

      // Pobierz ostatnie wiadomości dla wszystkich leadów
      const leadIds = leadsData.map(l => l.id)
      const { data: messagesData } = await supabase
        .from('whatsapp_messages')
        .select('lead_id, message_timestamp')
        .in('lead_id', leadIds)
        .order('message_timestamp', { ascending: false })

      // Mapa: lead_id -> ostatnia wiadomość
      const lastMessageMap: Record<string, string> = {}
      messagesData?.forEach(m => {
        if (!lastMessageMap[m.lead_id]) {
          lastMessageMap[m.lead_id] = m.message_timestamp
        }
      })

      // Filtruj leady potrzebujące follow-up
      const leadsNeedingFollowup: Lead[] = []

      for (const lead of leadsData) {
        let needsFollowup = false
        let hoursSinceContact = 0

        // Dla etapu 'waiting' - sprawdź expected_close
        if (stage === 'waiting') {
          if (!lead.expected_close) continue
          const expectedClose = new Date(lead.expected_close)
          if (expectedClose > now) continue
        }

        const lastMsg = lastMessageMap[lead.id]
        if (lastMsg) {
          hoursSinceContact = (now.getTime() - new Date(lastMsg).getTime()) / (1000 * 60 * 60)
          needsFollowup = hoursSinceContact >= config.followup_hours
        } else {
          // Brak wiadomości - potrzebuje follow-up
          needsFollowup = true
          hoursSinceContact = 999
        }

        if (needsFollowup) {
          leadsNeedingFollowup.push({
            ...lead,
            hours_since_contact: Math.floor(hoursSinceContact)
          })
        }
      }

      // Sortuj po czasie od kontaktu (najdłużej czekający pierwszy)
      leadsNeedingFollowup.sort((a, b) => (b.hours_since_contact || 0) - (a.hours_since_contact || 0))

      let stageGenerated = 0
      let stageSkipped = 0
      let stageErrors = 0

      // Generuj follow-upy
      for (const lead of leadsNeedingFollowup) {
        if (totalGenerated >= MAX_FOLLOWUPS_PER_RUN) break

        // Sprawdź czy już ma pending followup
        if (await hasSimilarPendingFollowup(supabase, lead.id)) {
          stageSkipped++
          continue
        }

        try {
          // Rate limiting
          await sleep(RATE_LIMIT_MS)

          // Pobierz wiadomości dla kontekstu
          const leadMessages = await getLastMessages(supabase, lead.id)

          // Generuj z retry
          const followupText = await withRetry(() =>
            generateFollowupMessage(ANTHROPIC_API_KEY, config, lead, leadMessages)
          )

          // Normalizuj numer telefonu
          let phone = lead.phone.replace(/[^0-9]/g, '')
          if (phone.length === 9) phone = '48' + phone

          // Zapisz follow-up
          const { error: insertError } = await supabase
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

          if (insertError) {
            throw insertError
          }

          stageGenerated++
          totalGenerated++
          results.leads_processed.push({
            lead_id: lead.id,
            name: lead.name,
            status: 'generated',
            hours: lead.hours_since_contact
          })

          console.log(`followups-cron: Generated for ${lead.name} (${lead.hours_since_contact}h)`)

        } catch (err) {
          stageErrors++
          results.total_errors++
          console.error(`followups-cron: Error for lead ${lead.id}:`, err.message)
          results.leads_processed.push({
            lead_id: lead.id,
            name: lead.name,
            status: 'error',
            error: err.message
          })
        }
      }

      results.stages[stage] = {
        total_leads: leadsData.length,
        needs_followup: leadsNeedingFollowup.length,
        generated: stageGenerated,
        skipped: stageSkipped,
        errors: stageErrors
      }

      results.total_generated += stageGenerated
      results.total_skipped += stageSkipped
    }

    results.completed_at = new Date().toISOString()
    results.duration_ms = Date.now() - startTime

    console.log('followups-cron: Completed in', results.duration_ms, 'ms')
    console.log('followups-cron: Generated:', results.total_generated, 'Skipped:', results.total_skipped, 'Errors:', results.total_errors)

    // Zapisz log wykonania
    await logExecution(supabase, results)

    return new Response(
      JSON.stringify({ success: true, ...results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    results.error = error.message
    results.completed_at = new Date().toISOString()
    results.duration_ms = Date.now() - startTime

    console.error('followups-cron: Fatal error', error)

    return new Response(
      JSON.stringify({ success: false, ...results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
