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

// Context builder - pobiera wszystkie dane potrzebne do kontekstu
async function buildContext(supabase: any, phoneNumber: string, syncedBy: string) {
  const context: {
    lead: Lead | null
    offer: Offer | null
    clientOffer: ClientOffer | null
    discountCodes: DiscountCode[]
    orders: Order[]
    knowledge: KnowledgeEntry[]
  } = {
    lead: null,
    offer: null,
    clientOffer: null,
    discountCodes: [],
    orders: [],
    knowledge: []
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

  return context
}

// Buduje system prompt z pełnym kontekstem
function buildSystemPrompt(context: any, syncedBy: string, customInstruction?: string): string {
  const parts: string[] = []

  // Nagłówek
  parts.push(`Jesteś asystentem sprzedawcy w firmie TN (Tomek Niedźwiecki).
Pomagasz pisać odpowiedzi na wiadomości WhatsApp od potencjalnych klientów.
Piszesz w imieniu: ${syncedBy === 'tomek' ? 'Tomka' : 'Maćka'}.`)

  // Wiedza o firmie
  const companyKnowledge = context.knowledge.filter((k: KnowledgeEntry) => k.category === 'company')
  if (companyKnowledge.length > 0) {
    parts.push('\n## O FIRMIE')
    companyKnowledge.forEach((k: KnowledgeEntry) => {
      parts.push(`${k.title}: ${k.content}`)
    })
  }

  // Styl komunikacji
  const toneKnowledge = context.knowledge.filter((k: KnowledgeEntry) => k.category === 'tone')
  if (toneKnowledge.length > 0) {
    parts.push('\n## STYL KOMUNIKACJI')
    toneKnowledge.forEach((k: KnowledgeEntry) => {
      parts.push(k.content)
    })
  }

  // Informacje o ofercie
  if (context.offer) {
    parts.push('\n## AKTUALNA OFERTA')
    parts.push(`Nazwa: ${context.offer.name}`)
    parts.push(`Cena: ${context.offer.price} zł`)
    if (context.offer.description) {
      parts.push(`Opis: ${context.offer.description}`)
    }
    if (context.offer.milestones && context.offer.milestones.length > 0) {
      parts.push('Etapy:')
      context.offer.milestones.forEach((m: any, i: number) => {
        parts.push(`  ${i + 1}. ${m.title}${m.duration_days ? ` (${m.duration_days} dni)` : ''}`)
      })
    }
  }

  // Informacje o kliencie (lead)
  if (context.lead) {
    parts.push('\n## INFORMACJE O KLIENCIE')
    parts.push(`Imię: ${context.lead.name || 'Nieznane'}`)
    if (context.lead.email) parts.push(`Email: ${context.lead.email}`)
    if (context.lead.company) parts.push(`Firma: ${context.lead.company}`)
    parts.push(`Status: ${context.lead.status || 'new'}`)
    if (context.lead.deal_value) parts.push(`Wartość dealu: ${context.lead.deal_value} zł`)

    // Kwalifikacja
    if (context.lead.weekly_hours) parts.push(`Dostępny czas: ${context.lead.weekly_hours} godz/tydzień`)
    if (context.lead.experience) parts.push(`Doświadczenie/motywacja: ${context.lead.experience}`)
    if (context.lead.target_income) parts.push(`Oczekiwany dochód: ${context.lead.target_income}`)
    if (context.lead.open_question) parts.push(`Odpowiedź z ankiety: ${context.lead.open_question}`)

    // Notatki
    if (context.lead.notes_history && context.lead.notes_history.length > 0) {
      parts.push('Notatki:')
      context.lead.notes_history.slice(-3).forEach((note: any) => {
        parts.push(`  - ${note.note || note}`)
      })
    }
  }

  // Oferta klienta (link)
  if (context.clientOffer) {
    parts.push('\n## OFERTA DLA KLIENTA')
    parts.push(`Link: https://crm.tomekniedzwiecki.pl/p/${context.clientOffer.unique_token}`)
    if (context.clientOffer.valid_until) {
      parts.push(`Ważna do: ${new Date(context.clientOffer.valid_until).toLocaleDateString('pl-PL')}`)
    }
    if (context.clientOffer.custom_price) {
      parts.push(`Cena specjalna: ${context.clientOffer.custom_price} zł`)
    }
    if (context.clientOffer.view_count > 0) {
      parts.push(`Klient oglądał ofertę: ${context.clientOffer.view_count}x`)
    }
  }

  // Kody rabatowe
  if (context.discountCodes.length > 0) {
    parts.push('\n## DOSTĘPNE KODY RABATOWE')
    context.discountCodes.forEach((dc: DiscountCode) => {
      const discount = dc.discount_amount
        ? `${dc.discount_amount} zł`
        : `${dc.discount_percent}%`
      parts.push(`- Kod: ${dc.code} (rabat: ${discount}, ważny do: ${new Date(dc.valid_until).toLocaleDateString('pl-PL')})`)
    })
  }

  // Historia zamówień
  if (context.orders.length > 0) {
    parts.push('\n## HISTORIA ZAMÓWIEŃ')
    context.orders.forEach((o: Order) => {
      const status = o.status === 'paid' ? 'OPŁACONE' : o.status === 'pending' ? 'Oczekuje' : o.status
      parts.push(`- ${o.amount} zł - ${status}${o.paid_at ? ` (${new Date(o.paid_at).toLocaleDateString('pl-PL')})` : ''}`)
    })
  }

  // Wiedza o obiekcjach
  const objectionKnowledge = context.knowledge.filter((k: KnowledgeEntry) => k.category === 'objection')
  if (objectionKnowledge.length > 0) {
    parts.push('\n## JAK ODPOWIADAĆ NA OBIEKCJE')
    objectionKnowledge.forEach((k: KnowledgeEntry) => {
      parts.push(`${k.title}: ${k.content}`)
    })
  }

  // Wiedza o procesach
  const processKnowledge = context.knowledge.filter((k: KnowledgeEntry) => k.category === 'process')
  if (processKnowledge.length > 0) {
    parts.push('\n## PROCESY')
    processKnowledge.forEach((k: KnowledgeEntry) => {
      parts.push(`${k.title}: ${k.content}`)
    })
  }

  // Wiedza o umowach
  const contractKnowledge = context.knowledge.filter((k: KnowledgeEntry) => k.category === 'contract')
  if (contractKnowledge.length > 0) {
    parts.push('\n## WARUNKI UMOWY')
    contractKnowledge.forEach((k: KnowledgeEntry) => {
      parts.push(`${k.title}: ${k.content}`)
    })
  }

  // Zasady ogólne
  parts.push(`\n## ZASADY
1. Pisz naturalnie, po polsku, jak człowiek (nie jak bot)
2. Bądź uprzejmy ale konkretny
3. Nie używaj emoji (chyba że klient ich używa)
4. Odpowiedzi powinny być krótkie (1-3 zdania max)
5. Jeśli klient pyta o cenę - podaj link do oferty
6. Jeśli klient się waha - subtelna presja czasowa (oferta ważna do...)
7. Nie obiecuj rzeczy których nie wiesz
8. Wykorzystaj informacje o kliencie do personalizacji`)

  // Dodatkowe instrukcje
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

    // Przygotuj historię konwersacji dla Claude
    const conversationHistory = messages
      .slice(-20) // Ostatnie 20 wiadomości
      .map(m => {
        const role = m.direction === 'outbound' ? `Ty (${synced_by || 'sprzedawca'})` : contact_name
        return `${role}: ${m.message_text}`
      })
      .join('\n')

    // Zbuduj system prompt z pełnym kontekstem
    const systemPrompt = buildSystemPrompt(context, synced_by || 'tomek', custom_instruction)

    // Log dla debugowania (można usunąć)
    console.log('Context built:', {
      hasLead: !!context.lead,
      hasOffer: !!context.offer,
      hasClientOffer: !!context.clientOffer,
      discountCodesCount: context.discountCodes.length,
      ordersCount: context.orders.length,
      knowledgeCount: context.knowledge.length
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
        model: 'claude-3-5-haiku-20241022',
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

    return new Response(
      JSON.stringify({
        success: true,
        reply: generatedReply.trim(),
        tokens_used: result.usage?.output_tokens || 0,
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
