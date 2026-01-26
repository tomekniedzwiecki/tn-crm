 

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  'https://crm.tomekniedzwiecki.pl',
  'https://tomekniedzwiecki.pl',
  'http://localhost:3000',
]

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin')
  const corsHeaders = getCorsHeaders(origin)

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get webhook URLs from secrets
    const webhookNewLead = Deno.env.get('slack_webhook_new_lead')
    const webhookActivity = Deno.env.get('slack_webhook_activity')

    // Parse request body
    const { type, data } = await req.json()

    if (!type || !data) {
      throw new Error('Brak wymaganych danych (type, data)')
    }

    let webhookUrl: string | undefined
    let message: object

    switch (type) {
      case 'new_lead':
        webhookUrl = webhookNewLead
        message = formatNewLeadMessage(data)
        break

      case 'offer_viewed':
        webhookUrl = webhookActivity
        message = formatOfferViewedMessage(data)
        break

      case 'proforma_generated':
        webhookUrl = webhookActivity
        message = formatProformaMessage(data)
        break

      default:
        throw new Error(`Nieznany typ powiadomienia: ${type}`)
    }

    if (!webhookUrl) {
      console.log(`Brak webhooka dla typu: ${type}`)
      return new Response(
        JSON.stringify({ success: true, skipped: true, reason: 'No webhook configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // Send to Slack
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    })

    if (!response.ok) {
      throw new Error(`Slack API error: ${response.status}`)
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    console.error('Slack notify error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})

function formatNewLeadMessage(data: {
  name?: string
  email: string
  phone?: string
  company?: string
  source?: string
  deal_value?: number
  // Zapisy form fields
  traffic_source?: string
  direction?: string
  weekly_hours?: string
  target_income?: string
  experience?: string
  open_question?: string
  budget?: string
}) {
  // Check if this is from zapisy form (has direction field)
  if (data.direction) {
    return formatZapisyLeadMessage(data)
  }

  // Original CRM lead format
  const fields = []

  if (data.name) {
    fields.push({ type: 'mrkdwn', text: `*Imię:*\n${data.name}` })
  }
  fields.push({ type: 'mrkdwn', text: `*Email:*\n<https://crm.tomekniedzwiecki.pl/leads?search=${encodeURIComponent(data.email)}|${data.email}>` })
  if (data.phone) {
    fields.push({ type: 'mrkdwn', text: `*Telefon:*\n${data.phone}` })
  }
  if (data.company) {
    fields.push({ type: 'mrkdwn', text: `*Firma:*\n${data.company}` })
  }
  if (data.source) {
    fields.push({ type: 'mrkdwn', text: `*Źródło:*\n${data.source}` })
  }
  if (data.deal_value) {
    fields.push({ type: 'mrkdwn', text: `*Wartość:*\n${data.deal_value.toLocaleString('pl-PL')} PLN` })
  }

  return {
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '🎉 Nowy lead!',
          emoji: true
        }
      },
      {
        type: 'section',
        fields: fields
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `📅 ${new Date().toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw' })}`
          }
        ]
      }
    ]
  }
}

function formatZapisyLeadMessage(data: {
  email: string
  phone?: string
  traffic_source?: string
  direction?: string
  weekly_hours?: string
  target_income?: string
  experience?: string
  open_question?: string
  budget?: string
}) {
  // Labels for form values
  const directionLabels: Record<string, string> = {
    'sklep': 'Sklep internetowy',
    'aplikacja': 'Aplikacja / SaaS',
    'produkt_cyfrowy': 'Kurs / Produkt cyfrowy',
    'nie_wiem': 'Potrzebuje doradzenia'
  }

  const hoursLabels: Record<string, string> = {
    '1-2h': '1-2h',
    '3-5h': '3-5h',
    '6-10h': '6-10h',
    'fulltime': 'Full-time'
  }

  const incomeLabels: Record<string, string> = {
    '5-10k': '5-10k PLN',
    '10-20k': '10-20k PLN',
    '20-50k': '20-50k PLN',
    '50k+': '50k+ PLN'
  }

  const budgetLabels: Record<string, string> = {
    '5-10k': '5-10k PLN',
    '10-20k': '10-20k PLN',
    '20-40k': '20-40k PLN',
    '40k+': '40k+ PLN'
  }

  const blocks: any[] = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: 'Nowe zgłoszenie z formularza',
        emoji: false
      }
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*<https://crm.tomekniedzwiecki.pl/leads?search=${encodeURIComponent(data.email)}|${data.email}>*${data.phone ? ` · ${data.phone}` : ''}`
      }
    },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*Kierunek:*\n${directionLabels[data.direction || ''] || data.direction}` },
        { type: 'mrkdwn', text: `*Źródło:*\n${data.traffic_source || 'Direct'}` }
      ]
    },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*Czas/tydzień:*\n${hoursLabels[data.weekly_hours || ''] || data.weekly_hours}` },
        { type: 'mrkdwn', text: `*Cel dochodu:*\n${incomeLabels[data.target_income || ''] || data.target_income}` }
      ]
    },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*Budżet:*\n${budgetLabels[data.budget || ''] || data.budget}` }
      ]
    }
  ]

  // Experience (always present)
  if (data.experience) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Doświadczenie:*\n${data.experience.substring(0, 500)}`
      }
    })
  }

  // Open question (optional)
  if (data.open_question) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Dodatkowe info:*\n${data.open_question.substring(0, 500)}`
      }
    })
  }

  // Timestamp
  blocks.push({
    type: 'context',
    elements: [
      {
        type: 'mrkdwn',
        text: `📅 ${new Date().toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw' })}`
      }
    ]
  })

  return { blocks }
}

function formatOfferViewedMessage(data: {
  lead_name?: string
  lead_email: string
  lead_company?: string
  offer_name: string
  offer_price?: number
  first_view?: boolean
}) {
  const displayName = data.lead_company || data.lead_name || data.lead_email
  const viewText = data.first_view ? '👀 Pierwsze otwarcie oferty!' : '👁️ Oferta przeglądana'

  const fields = [
    { type: 'mrkdwn', text: `*Klient:*\n<https://crm.tomekniedzwiecki.pl/leads?search=${encodeURIComponent(data.lead_email)}|${displayName}>` },
    { type: 'mrkdwn', text: `*Oferta:*\n${data.offer_name}` }
  ]

  if (data.offer_price) {
    fields.push({ type: 'mrkdwn', text: `*Wartość:*\n${data.offer_price.toLocaleString('pl-PL')} PLN` })
  }

  if (data.lead_email !== displayName) {
    fields.push({ type: 'mrkdwn', text: `*Email:*\n<https://crm.tomekniedzwiecki.pl/leads?search=${encodeURIComponent(data.lead_email)}|${data.lead_email}>` })
  }

  return {
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: viewText,
          emoji: true
        }
      },
      {
        type: 'section',
        fields: fields
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `📅 ${new Date().toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw' })}`
          }
        ]
      }
    ]
  }
}

function formatProformaMessage(data: {
  lead_name?: string
  lead_email: string
  lead_company?: string
  offer_name: string
  offer_price?: number
  generated_by: 'client' | 'salesperson'
  salesperson_name?: string
}) {
  const displayName = data.lead_company || data.lead_name || data.lead_email
  const generatorText = data.generated_by === 'client'
    ? 'przez klienta'
    : `przez ${data.salesperson_name || 'handlowca'}`

  const fields = [
    { type: 'mrkdwn', text: `*Klient:*\n<https://crm.tomekniedzwiecki.pl/leads?search=${encodeURIComponent(data.lead_email)}|${displayName}>` },
    { type: 'mrkdwn', text: `*Oferta:*\n${data.offer_name}` }
  ]

  if (data.offer_price) {
    fields.push({ type: 'mrkdwn', text: `*Wartość brutto:*\n${data.offer_price.toLocaleString('pl-PL')} PLN` })
  }

  fields.push({ type: 'mrkdwn', text: `*Wygenerowano:*\n${generatorText}` })

  return {
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '📄 Wygenerowano proformę!',
          emoji: true
        }
      },
      {
        type: 'section',
        fields: fields
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `📅 ${new Date().toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw' })}`
          }
        ]
      }
    ]
  }
}
