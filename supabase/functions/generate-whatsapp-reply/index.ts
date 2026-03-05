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
  synced_by: string // 'tomek' | 'maciek'
  custom_instruction?: string
}

interface Lead {
  id: string
  name: string
  email: string
  phone: string
  company: string
  status: string
  deal_value: number
  weekly_hours: string
  experience: string
  target_income: string
  open_question: string
  notes_history: any[]
  offer_id: string
}

interface Offer {
  id: string
  name: string
  description: string
  price: number
  offer_type: string
  milestones: any[]
}

interface ClientOffer {
  id: string
  unique_token: string
  valid_until: string
  custom_price: number
  viewed_at: string
  view_count: number
  offer_type: string
}

interface DiscountCode {
  code: string
  discount_amount: number
  discount_percent: number
  valid_until: string
  is_active: boolean
}

interface Order {
  id: string
  status: string
  amount: number
  paid_at: string
}

interface KnowledgeEntry {
  title: string
  content: string
  category: string
  priority: number
}

interface Scenario {
  id: string
  name: string
  description: string
  conditions: any
  instructions: string
  priority: number
}

interface ConversationAnalysis {
  lastMessageDirection: 'inbound' | 'outbound'
  daysSinceLastMessage: number
  hasClientOffer: boolean
  hasOrders: boolean
  hasPaidOrders: boolean
  leadStatus: string | null
  lastMessageText: string
  offerValidUntil: Date | null
  daysUntilOfferExpires: number | null
}

// Analizuje konwersację i zwraca parametry do dopasowania scenariuszy
function analyzeConversation(messages: Message[], context: any): ConversationAnalysis {
  const lastMessage = messages[messages.length - 1]
  const now = new Date()

  // Oblicz dni od ostatniej wiadomości
  let daysSinceLastMessage = 0
  if (lastMessage?.message_timestamp) {
    const lastMsgDate = new Date(lastMessage.message_timestamp)
    daysSinceLastMessage = Math.floor((now.getTime() - lastMsgDate.getTime()) / (1000 * 60 * 60 * 24))
  }

  // Oblicz dni do wygaśnięcia oferty
  let offerValidUntil: Date | null = null
  let daysUntilOfferExpires: number | null = null
  if (context.clientOffer?.valid_until) {
    offerValidUntil = new Date(context.clientOffer.valid_until)
    daysUntilOfferExpires = Math.ceil((offerValidUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  }

  return {
    lastMessageDirection: lastMessage?.direction || 'inbound',
    daysSinceLastMessage,
    hasClientOffer: !!context.clientOffer,
    hasOrders: context.orders.length > 0,
    hasPaidOrders: context.orders.some((o: Order) => o.status === 'paid'),
    leadStatus: context.lead?.status || null,
    lastMessageText: lastMessage?.message_text || '',
    offerValidUntil,
    daysUntilOfferExpires
  }
}

// Sprawdza czy scenariusz pasuje do analizy konwersacji
function matchScenario(scenario: Scenario, analysis: ConversationAnalysis): boolean {
  const conditions = scenario.conditions
  if (!conditions || Object.keys(conditions).length === 0) return false

  for (const [key, value] of Object.entries(conditions)) {
    switch (key) {
      case 'last_message_direction':
        if (analysis.lastMessageDirection !== value) return false
        break
      case 'days_since_last_message_min':
        if (analysis.daysSinceLastMessage < (value as number)) return false
        break
      case 'days_since_last_message_max':
        if (analysis.daysSinceLastMessage > (value as number)) return false
        break
      case 'has_client_offer':
        if (analysis.hasClientOffer !== value) return false
        break
      case 'has_orders':
        if (analysis.hasOrders !== value) return false
        break
      case 'has_paid_orders':
        if (analysis.hasPaidOrders !== value) return false
        break
      case 'lead_status':
        if (Array.isArray(value)) {
          if (!value.includes(analysis.leadStatus)) return false
        } else {
          if (analysis.leadStatus !== value) return false
        }
        break
      case 'days_until_offer_expires_max':
        if (analysis.daysUntilOfferExpires === null || analysis.daysUntilOfferExpires > (value as number)) return false
        break
      case 'message_contains':
        const keywords = Array.isArray(value) ? value : [value]
        const msgLower = analysis.lastMessageText.toLowerCase()
        if (!keywords.some((kw: string) => msgLower.includes(kw.toLowerCase()))) return false
        break
    }
  }
  return true
}

// Znajduje najlepiej pasujący scenariusz
function findMatchingScenario(scenarios: Scenario[], analysis: ConversationAnalysis): Scenario | null {
  const matching = scenarios.filter(s => matchScenario(s, analysis))
  if (matching.length === 0) return null
  // Zwróć scenariusz z najwyższym priorytetem
  return matching.sort((a, b) => b.priority - a.priority)[0]
}

// Context builder - pobiera wszystkie dane potrzebne do kontekstu
async function buildContext(supabase: any, phoneNumber: string, syncedBy: string) {
  const context: {
    lead: Lead | null
    offer: Offer | null
    clientOffer: ClientOffer | null
    discountCodes: DiscountCode[]
    orders: Order[]
    knowledge: KnowledgeEntry[]
    scenarios: Scenario[]
  } = {
    lead: null,
    offer: null,
    clientOffer: null,
    discountCodes: [],
    orders: [],
    knowledge: [],
    scenarios: []
  }

  // 1. Znajdź leada po numerze telefonu
  const { data: lead } = await supabase
    .from('leads')
    .select('*')
    .or(`phone.eq.${phoneNumber},phone.eq.+${phoneNumber},phone.eq.${phoneNumber.replace(/^\+/, '')}`)
    .single()

  if (lead) {
    context.lead = lead

    // 2. Pobierz ofertę bazową
    if (lead.offer_id) {
      const { data: offer } = await supabase
        .from('offers')
        .select('*')
        .eq('id', lead.offer_id)
        .single()
      context.offer = offer
    }

    // 3. Pobierz ofertę klienta (client_offer)
    const { data: clientOffer } = await supabase
      .from('client_offers')
      .select('*')
      .eq('lead_id', lead.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    context.clientOffer = clientOffer

    // 4. Pobierz kody rabatowe
    const { data: discountCodes } = await supabase
      .from('discount_codes')
      .select('*')
      .or(`lead_id.eq.${lead.id}${clientOffer ? `,client_offer_id.eq.${clientOffer.id}` : ''}`)
      .eq('is_active', true)
    context.discountCodes = discountCodes || []

    // 5. Pobierz zamówienia
    const { data: orders } = await supabase
      .from('orders')
      .select('*')
      .or(`lead_id.eq.${lead.id},email.eq.${lead.email}`)
      .order('created_at', { ascending: false })
    context.orders = orders || []
  }

  // 6. Pobierz wiedzę z Knowledge Base
  const { data: knowledge } = await supabase
    .from('ai_knowledge_base')
    .select('title, content, category, priority')
    .eq('is_active', true)
    .or(`for_user.is.null,for_user.eq.${syncedBy}`)
    .order('priority', { ascending: false })
  context.knowledge = knowledge || []

  // 7. Pobierz scenariusze AI
  const { data: scenarios } = await supabase
    .from('ai_scenarios')
    .select('id, name, description, conditions, instructions, priority')
    .eq('is_active', true)
    .order('priority', { ascending: false })
  context.scenarios = scenarios || []

  return context
}

// Buduje system prompt - UPROSZCZONY
// Przekazuje całą wiedzę i scenariusze do AI - niech sam wybierze co użyć
function buildSystemPrompt(context: any, syncedBy: string, matchedScenario: Scenario | null, customInstruction?: string): string {
  const parts: string[] = []

  // Nagłówek
  parts.push(`Jesteś asystentem sprzedawcy w firmie TN (Tomek Niedźwiecki).
Pomagasz pisać odpowiedzi na wiadomości WhatsApp od potencjalnych klientów.
Piszesz w imieniu: ${syncedBy === 'tomek' ? 'Tomka' : 'Maćka'}.`)

  // === BAZA WIEDZY (wszystko w jednym miejscu) ===
  if (context.knowledge && context.knowledge.length > 0) {
    parts.push('\n## BAZA WIEDZY')
    parts.push('Użyj tej wiedzy gdy będzie potrzebna:\n')
    context.knowledge.forEach((k: KnowledgeEntry) => {
      parts.push(`### ${k.title}`)
      parts.push(k.content)
      parts.push('')
    })
  }

  // === SCENARIUSZE (AI wybiera odpowiedni) ===
  if (context.scenarios && context.scenarios.length > 0) {
    parts.push('\n## SCENARIUSZE')
    parts.push('Wybierz scenariusz pasujący do sytuacji:\n')
    context.scenarios.forEach((scenario: Scenario) => {
      parts.push(`### ${scenario.name}`)
      if (scenario.description) {
        parts.push(`Kiedy: ${scenario.description}`)
      }
      parts.push(`Co robić: ${scenario.instructions}`)
      parts.push('')
    })
  }

  // === DANE O KLIENCIE (dynamiczne) ===
  if (context.lead) {
    parts.push('\n## KLIENT')
    parts.push(`Imię: ${context.lead.name || 'Nieznane'}`)
    parts.push(`Status w pipeline: ${context.lead.status || 'new'}`)
    if (context.lead.company) parts.push(`Firma: ${context.lead.company}`)
    if (context.lead.weekly_hours) parts.push(`Dostępny czas: ${context.lead.weekly_hours}`)
    if (context.lead.experience) parts.push(`Motywacja: ${context.lead.experience}`)
    if (context.lead.target_income) parts.push(`Cel dochodu: ${context.lead.target_income}`)
    if (context.lead.open_question) parts.push(`Z ankiety: ${context.lead.open_question}`)

    if (context.lead.notes_history && context.lead.notes_history.length > 0) {
      parts.push('Notatki:')
      context.lead.notes_history.slice(-5).forEach((note: any) => {
        const noteText = note.content || note.note || note
        parts.push(`  - ${noteText}`)
      })
    }
  }

  // === OFERTA ===
  if (context.clientOffer) {
    parts.push('\n## OFERTA DLA KLIENTA')
    parts.push(`Link: https://crm.tomekniedzwiecki.pl/p/${context.clientOffer.unique_token}`)
    if (context.clientOffer.valid_until) {
      parts.push(`Ważna do: ${new Date(context.clientOffer.valid_until).toLocaleDateString('pl-PL')}`)
    }
    if (context.clientOffer.view_count > 0) {
      parts.push(`Oglądał ofertę: ${context.clientOffer.view_count}x`)
    }
  }

  // === KODY RABATOWE ===
  if (context.discountCodes && context.discountCodes.length > 0) {
    parts.push('\n## KODY RABATOWE')
    context.discountCodes.forEach((dc: DiscountCode) => {
      const discount = dc.discount_amount ? `${dc.discount_amount} zł` : `${dc.discount_percent}%`
      parts.push(`- ${dc.code}: ${discount}`)
    })
  }

  // === ZAMÓWIENIA ===
  if (context.orders && context.orders.length > 0) {
    parts.push('\n## ZAMÓWIENIA')
    context.orders.forEach((o: Order) => {
      const status = o.status === 'paid' ? 'OPŁACONE' : o.status
      parts.push(`- ${o.amount} zł - ${status}`)
    })
  }

  // === DODATKOWE INSTRUKCJE ===
  if (customInstruction) {
    parts.push(`\n## DODATKOWE INSTRUKCJE\n${customInstruction}`)
  }

  return parts.join('\n')
}

serve(async (req) => {
  // Handle CORS
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

    // Utwórz klienta Supabase
    const supabase = createClient(
      SUPABASE_URL || 'https://yxmavwkwnfuphjqbelws.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY || ''
    )

    const body: RequestBody = await req.json()
    const { messages, contact_name, phone_number, synced_by, custom_instruction } = body

    if (!messages || messages.length === 0) {
      throw new Error('No messages provided')
    }

    // Zbuduj kontekst
    const context = await buildContext(supabase, phone_number || '', synced_by || 'tomek')

    // Analizuj konwersację
    const analysis = analyzeConversation(messages, context)

    // Znajdź pasujący scenariusz
    const matchedScenario = findMatchingScenario(context.scenarios, analysis)

    // Przygotuj historię konwersacji dla Claude
    const conversationHistory = messages
      .slice(-20) // Ostatnie 20 wiadomości
      .map(m => {
        const role = m.direction === 'outbound' ? `Ty (${synced_by || 'sprzedawca'})` : contact_name
        return `${role}: ${m.message_text}`
      })
      .join('\n')

    // Zbuduj system prompt z pełnym kontekstem i scenariuszem
    const systemPrompt = buildSystemPrompt(context, synced_by || 'tomek', matchedScenario, custom_instruction)

    // Log dla debugowania
    console.log('Context built:', {
      hasLead: !!context.lead,
      hasOffer: !!context.offer,
      hasClientOffer: !!context.clientOffer,
      discountCodesCount: context.discountCodes.length,
      ordersCount: context.orders.length,
      knowledgeCount: context.knowledge.length,
      scenariosCount: context.scenarios.length,
      matchedScenario: matchedScenario?.name || null,
      analysis: {
        lastMessageDirection: analysis.lastMessageDirection,
        daysSinceLastMessage: analysis.daysSinceLastMessage,
        hasClientOffer: analysis.hasClientOffer,
        leadStatus: analysis.leadStatus
      }
    })

    // Wywołaj Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-opus-4-20250514',
        max_tokens: 500,
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

    // Oblicz koszt (Claude Opus 4: $15/M input, $75/M output)
    const inputTokens = result.usage?.input_tokens || 0
    const outputTokens = result.usage?.output_tokens || 0
    const costUSD = (inputTokens * 15 / 1_000_000) + (outputTokens * 75 / 1_000_000)

    return new Response(
      JSON.stringify({
        success: true,
        reply: generatedReply.trim(),
        usage: {
          input_tokens: inputTokens,
          output_tokens: outputTokens,
          cost_usd: Math.round(costUSD * 10000) / 10000 // 4 decimal places
        },
        matched_scenario: matchedScenario ? {
          id: matchedScenario.id,
          name: matchedScenario.name
        } : null,
        analysis: {
          last_message_direction: analysis.lastMessageDirection,
          days_since_last_message: analysis.daysSinceLastMessage,
          days_until_offer_expires: analysis.daysUntilOfferExpires
        },
        context_summary: {
          lead_name: context.lead?.name || null,
          lead_status: context.lead?.status || null,
          offer_name: context.offer?.name || null,
          has_client_offer: !!context.clientOffer,
          discount_codes: context.discountCodes.map(dc => dc.code),
          orders_count: context.orders.length
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
