import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// =====================================================
// FOLLOW-UPS CRON - System kolejkowy
// =====================================================
// 1. Sprawdza czy są elementy w kolejce
// 2. Jeśli nie - dodaje leady potrzebujące follow-up
// 3. Przetwarza BATCH_SIZE elementów z kolejki
// Wywoływane co 5 minut przez cron
// =====================================================

const FOLLOWUP_STAGES = ['contacted', 'qualified', 'proposal', 'negotiation', 'waiting']
const DEFAULT_FOLLOWUP_HOURS = 24
const BATCH_SIZE = 5 // Ile generować na jedno uruchomienie
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
  const { data: guidelinesData } = await supabase
    .from('ai_guidelines')
    .select('content')
    .limit(1)
    .single()

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

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

// Retry wrapper
async function withRetry<T>(fn: () => Promise<T>, maxRetries = MAX_RETRIES): Promise<T> {
  let lastError: Error | null = null
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err as Error
      const delay = RETRY_DELAY_MS * Math.pow(2, attempt)
      console.log(`followups-cron: Retry ${attempt + 1}/${maxRetries} after ${delay}ms`)
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

  if (text.length < 5) {
    throw new Error('Generated message too short')
  }

  return text
}

// Dodaj leady do kolejki
async function enqueueLeads(supabase: any, config: Config): Promise<number> {
  const now = new Date()
  let enqueued = 0

  for (const stage of FOLLOWUP_STAGES) {
    // Pobierz leady w tym etapie
    const { data: leadsData } = await supabase
      .from('leads')
      .select('id, name, phone, status, expected_close')
      .eq('status', stage)
      .not('phone', 'is', null)

    if (!leadsData || leadsData.length === 0) continue
    console.log(`followups-cron: Stage ${stage}: ${leadsData.length} leads`)

    // Pobierz ostatnie wiadomości
    const leadIds = leadsData.map((l: any) => l.id)
    const { data: messagesData } = await supabase
      .from('whatsapp_messages')
      .select('lead_id, message_timestamp')
      .in('lead_id', leadIds)
      .order('message_timestamp', { ascending: false })

    const lastMessageMap: Record<string, string> = {}
    messagesData?.forEach((m: any) => {
      if (!lastMessageMap[m.lead_id]) {
        lastMessageMap[m.lead_id] = m.message_timestamp
      }
    })

    // Sprawdź które leady mają już pending followup
    const { data: existingFollowups } = await supabase
      .from('whatsapp_followups')
      .select('lead_id')
      .eq('status', 'pending')
      .in('lead_id', leadIds)

    const hasFollowup = new Set(existingFollowups?.map((f: any) => f.lead_id) || [])

    // Sprawdź które leady są już w kolejce
    const { data: existingQueue } = await supabase
      .from('followup_queue')
      .select('lead_id')
      .in('status', ['queued', 'processing'])
      .in('lead_id', leadIds)

    const inQueue = new Set(existingQueue?.map((q: any) => q.lead_id) || [])

    // Filtruj leady potrzebujące follow-up
    const toEnqueue: any[] = []

    for (const lead of leadsData) {
      // Skip jeśli ma już pending followup
      if (hasFollowup.has(lead.id)) continue
      // Skip jeśli już w kolejce
      if (inQueue.has(lead.id)) continue

      // Dla etapu 'waiting' - sprawdź expected_close
      if (stage === 'waiting') {
        if (!lead.expected_close) continue
        if (new Date(lead.expected_close) > now) continue
      }

      const lastMsg = lastMessageMap[lead.id]
      let hoursSinceContact = 999

      if (lastMsg) {
        hoursSinceContact = (now.getTime() - new Date(lastMsg).getTime()) / (1000 * 60 * 60)
        if (hoursSinceContact < config.followup_hours) continue
      }

      let phone = lead.phone.replace(/[^0-9]/g, '')
      if (phone.length === 9) phone = '48' + phone

      toEnqueue.push({
        lead_id: lead.id,
        phone_number: phone,
        contact_name: lead.name,
        lead_status: lead.status,
        hours_since_contact: Math.floor(hoursSinceContact),
        status: 'queued'
      })
    }

    // Dodaj do kolejki
    if (toEnqueue.length > 0) {
      const { error, data } = await supabase
        .from('followup_queue')
        .insert(toEnqueue)
        .select()

      if (error) {
        console.error(`followups-cron: Insert error for ${stage}:`, error.message)
      } else {
        const inserted = data?.length || 0
        enqueued += inserted
        console.log(`followups-cron: Stage ${stage}: enqueued ${inserted} leads`)
      }
    }
  }

  return enqueued
}

// Przetwórz batch z kolejki
async function processQueue(supabase: any, apiKey: string, config: Config): Promise<{ processed: number, errors: number }> {
  // Pobierz BATCH_SIZE elementów z kolejki
  const { data: queueItems, error } = await supabase
    .from('followup_queue')
    .select('*')
    .eq('status', 'queued')
    .order('hours_since_contact', { ascending: false }) // Najdłużej czekający pierwszy
    .limit(BATCH_SIZE)

  if (error || !queueItems || queueItems.length === 0) {
    return { processed: 0, errors: 0 }
  }

  // Oznacz jako processing
  const ids = queueItems.map((q: any) => q.id)
  await supabase
    .from('followup_queue')
    .update({ status: 'processing' })
    .in('id', ids)

  let processed = 0
  let errors = 0

  for (const item of queueItems) {
    try {
      // Pobierz dane leada
      const { data: leadData } = await supabase
        .from('leads')
        .select('id, name, phone, status, weekly_hours, experience, target_income, open_question')
        .eq('id', item.lead_id)
        .single()

      if (!leadData) {
        throw new Error('Lead not found')
      }

      const lead: Lead = {
        ...leadData,
        hours_since_contact: item.hours_since_contact
      }

      // Pobierz wiadomości
      const messages = await getLastMessages(supabase, item.lead_id)

      // Generuj z retry
      const followupText = await withRetry(() =>
        generateFollowupMessage(apiKey, config, lead, messages)
      )

      // Zapisz follow-up
      await supabase
        .from('whatsapp_followups')
        .insert({
          lead_id: item.lead_id,
          phone_number: item.phone_number,
          contact_name: item.contact_name,
          message_text: followupText,
          status: 'pending',
          lead_status: item.lead_status,
          hours_since_contact: item.hours_since_contact,
          generated_by: 'cron'
        })

      // Usuń z kolejki (followup jest już w whatsapp_followups z status='pending')
      await supabase
        .from('followup_queue')
        .delete()
        .eq('id', item.id)

      processed++
      console.log(`followups-cron: Generated for ${item.contact_name || item.phone_number}`)

    } catch (err: any) {
      errors++
      console.error(`followups-cron: Error for ${item.lead_id}:`, err.message)

      // Oznacz jako failed lub wróć do queued (retry)
      const attempts = (item.attempts || 0) + 1
      if (attempts >= MAX_RETRIES) {
        await supabase
          .from('followup_queue')
          .update({ status: 'failed', attempts, last_error: err.message })
          .eq('id', item.id)
      } else {
        await supabase
          .from('followup_queue')
          .update({ status: 'queued', attempts, last_error: err.message })
          .eq('id', item.id)
      }
    }
  }

  return { processed, errors }
}

serve(async (req) => {
  const startTime = Date.now()
  console.log('followups-cron: Starting at', new Date().toISOString())

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

    const supabase = createClient(SUPABASE_URL || '', SUPABASE_SERVICE_ROLE_KEY || '')
    const config = await getConfig(supabase)

    // Sprawdź ile jest w kolejce
    const { count: queueCount } = await supabase
      .from('followup_queue')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'queued')

    console.log(`followups-cron: Queue has ${queueCount || 0} items`)

    // Jeśli kolejka pusta - dodaj nowe leady
    let enqueued = 0
    if (!queueCount || queueCount === 0) {
      console.log('followups-cron: Queue empty, enqueuing leads...')
      enqueued = await enqueueLeads(supabase, config)
      console.log(`followups-cron: Enqueued ${enqueued} leads`)
    }

    // Przetwórz batch
    const { processed, errors } = await processQueue(supabase, ANTHROPIC_API_KEY, config)

    const result = {
      success: true,
      queue_before: queueCount || 0,
      enqueued,
      processed,
      errors,
      duration_ms: Date.now() - startTime
    }

    console.log('followups-cron: Completed', result)

    // Zapisz log
    await supabase.from('followup_execution_logs').insert({
      executed_at: new Date().toISOString(),
      total_generated: processed,
      total_skipped: 0,
      total_errors: errors,
      details: result
    })

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('followups-cron: Fatal error', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
