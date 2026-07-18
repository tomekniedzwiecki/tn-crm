 

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  'https://crm.tomekniedzwiecki.pl',
  'https://tomekniedzwiecki.pl',
  'https://www.tomekniedzwiecki.pl',
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
    const webhookZwolnieLead = Deno.env.get('slack_webhook_zwolnie_lead')
    // Lejek Sparing/Aplikacja → kanał #sparing
    const webhookSparing = Deno.env.get('slack_webhook_sparing')

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

      case 'zwolnie_lead':
        webhookUrl = webhookZwolnieLead
        message = formatZwolnieLeadMessage(data)
        break

      case 'offer_viewed':
        webhookUrl = webhookActivity
        message = formatOfferViewedMessage(data)
        break

      case 'proforma_generated':
        webhookUrl = webhookActivity
        message = formatProformaMessage(data)
        break

      case 'schedule_viewed':
        webhookUrl = webhookActivity
        message = formatScheduleViewedMessage(data)
        break

      case 'checkout_started':
        webhookUrl = webhookActivity
        message = formatCheckoutStartedMessage(data)
        break

      case 'offer_expired_attempt':
        webhookUrl = webhookActivity
        message = formatOfferExpiredAttemptMessage(data)
        break

      case 'spar_contact':
        webhookUrl = webhookSparing
        message = formatSparContactMessage(data)
        break

      case 'spar_green':
        webhookUrl = webhookSparing
        message = formatSparGreenMessage(data)
        break

      case 'spar_revive':
        webhookUrl = webhookSparing
        message = formatSparReviveMessage(data)
        break

      case 'spar_knowhow_closed':
        webhookUrl = webhookSparing
        message = formatSparKnowhowClosedMessage(data)
        break

      case 'spar_preview':
        webhookUrl = webhookSparing
        message = formatSparPreviewMessage({ ...data, funnel: data.funnel || 'aplikacja' })
        break

      case 'spar_gen_error':
        webhookUrl = webhookSparing
        message = formatSparGenErrorMessage(data)
        break

      case 'bud_preview':
        webhookUrl = webhookSparing
        message = formatSparPreviewMessage({ ...data, funnel: 'sklep' })
        break

      case 'bud_html':
        webhookUrl = webhookSparing
        message = formatBudHtmlMessage(data)
        break

      case 'bud_mockups':
        webhookUrl = webhookSparing
        message = formatBudMockupsMessage(data)
        break

      case 'bud_reservation':
        webhookUrl = webhookSparing
        message = formatBudReservationMessage(data)
        break

      case 'bud_lead_error':
        webhookUrl = webhookSparing
        message = formatBudLeadErrorMessage(data)
        break

      case 'bud_knowhow_error':
        webhookUrl = webhookSparing
        message = formatBudKnowhowErrorMessage(data)
        break

      case 'bud_gen_error':
        webhookUrl = webhookSparing
        message = formatBudGenErrorMessage(data)
        break

      case 'wf2_order':
        webhookUrl = webhookSparing
        message = formatWf2OrderMessage(data)
        break

      case 'wf2_ads_ready':
        webhookUrl = webhookSparing
        message = formatWf2AdsReadyMessage(data)
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

function leadLink(email: string, label?: string, leadId?: string): string {
  const display = label || email
  if (leadId) {
    return `<https://crm.tomekniedzwiecki.pl/lead?id=${leadId}|${display}>`
  }
  return display
}

function formatNewLeadMessage(data: {
  name?: string
  email: string
  phone?: string
  company?: string
  source?: string
  deal_value?: number
  lead_id?: string
  // Zapisy form fields
  traffic_source?: string
  direction?: string
  weekly_hours?: string
  target_income?: string
  current_income?: string
  experience?: string
  open_question?: string
  budget?: string
  survey_version?: number
}) {
  // Check if this is from zapisy form (has survey fields)
  if (data.weekly_hours || data.target_income || data.current_income || data.experience) {
    return formatZapisyLeadMessage(data)
  }

  // Original CRM lead format
  const fields = []

  if (data.name) {
    fields.push({ type: 'mrkdwn', text: `*Imię:*\n${data.name}` })
  }
  fields.push({ type: 'mrkdwn', text: `*Email:*\n${leadLink(data.email, data.email, data.lead_id)}` })
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

  const blocks: any[] = [
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
    }
  ]

  // Action buttons
  const actionElements: any[] = []

  // "Zobacz szczegóły" button - only if we have lead_id
  if (data.lead_id) {
    actionElements.push({
      type: 'button',
      text: {
        type: 'plain_text',
        text: '📋 Zobacz szczegóły',
        emoji: true
      },
      url: `https://crm.tomekniedzwiecki.pl/lead?id=${data.lead_id}`,
      action_id: 'view_lead'
    })
  }

  // "WhatsApp" button - only if we have phone
  if (data.phone) {
    let waPhone = data.phone.replace(/[\s\-\(\)]/g, '')
    if (waPhone.startsWith('0')) {
      waPhone = '48' + waPhone.substring(1)
    }
    if (!waPhone.startsWith('+') && !waPhone.startsWith('48')) {
      waPhone = '48' + waPhone
    }
    waPhone = waPhone.replace('+', '')

    actionElements.push({
      type: 'button',
      text: {
        type: 'plain_text',
        text: '💬 WhatsApp',
        emoji: true
      },
      url: `https://wa.me/${waPhone}`,
      action_id: 'whatsapp'
    })
  }

  if (actionElements.length > 0) {
    blocks.push({
      type: 'actions',
      elements: actionElements
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

function formatZapisyLeadMessage(data: {
  email: string
  phone?: string
  name?: string
  lead_id?: string
  traffic_source?: string
  direction?: string
  weekly_hours?: string
  target_income?: string
  current_income?: string
  experience?: string
  open_question?: string
  budget?: string
  survey_version?: number
}) {
  // Detekcja v2 (zapisy v2): ma current_income, budget jako liczba, lub explicit version
  const isV2 = data.survey_version === 2
            || !!data.current_income
            || (!!data.budget && /^\d+$/.test(data.budget))

  // v1 — pojedynczy "kierunek" (nieużywane w v2)
  const directionLabelsV1: Record<string, string> = {
    'sklep': 'Sklep internetowy',
    'aplikacja': 'Aplikacja / SaaS',
    'produkt_cyfrowy': 'Kurs / Produkt cyfrowy',
    'nie_wiem': 'Potrzebuje doradzenia'
  }

  // v2 — multiselect "co już próbował" (CSV)
  const triedLabelsV2: Record<string, string> = {
    sklep_online: 'Własny sklep online',
    allegro: 'Allegro',
    vinted_olx: 'Vinted / OLX',
    dropshipping: 'Dropshipping',
    takedrop: 'TakeDrop',
    amazon: 'Amazon FBA',
    kursy: 'Kursy / szkolenia',
    freelance: 'Freelance / usługi',
    afiliacja: 'Afiliacja',
    trading: 'Trading / krypto',
    nigdy: 'Nigdy nie próbował'
  }

  const hoursLabels: Record<string, string> = {
    '1-2h': '1-2h',
    '3-5h': '3-5h',
    '6-10h': '6-10h',
    'fulltime': 'Full-time'
  }

  const incomeLabels: Record<string, string> = {
    '<5k': 'Poniżej 5k PLN',
    '5-10k': '5-10k PLN',
    '10-20k': '10-20k PLN',
    '20-50k': '20-50k PLN',
    '50k+': '50k+ PLN'
  }

  // v1 budget brackets (zachowane dla starych)
  const budgetLabelsV1: Record<string, string> = {
    '5-10k': '5-10k PLN',
    '10-20k': '10-20k PLN',
    '20-40k': '20-40k PLN',
    '40k+': '40k+ PLN'
  }

  function formatBudgetV2(raw: string): string {
    const n = parseInt(raw.replace(/\D/g, ''), 10)
    if (!n || n <= 0) return raw
    return n.toLocaleString('pl-PL').replace(/,/g, ' ') + ' PLN'
  }

  const versionTag = isV2 ? ' _(v2)_' : ''
  const headerLabel = data.name ? `*${data.name}* · ` : ''
  const phoneLabel = data.phone ? ` · ${data.phone}` : ''

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
        text: `${headerLabel}*${leadLink(data.email, data.email, data.lead_id)}*${phoneLabel}${versionTag}`
      }
    }
  ]

  // Co próbował / Kierunek
  const optionalFields: any[] = []
  if (data.direction) {
    if (isV2) {
      const labels = data.direction
        .split(',').map(v => v.trim()).filter(Boolean)
        .map(v => triedLabelsV2[v] || v)
        .join(', ')
      optionalFields.push({ type: 'mrkdwn', text: `*Co próbował:*\n${labels}` })
    } else {
      optionalFields.push({ type: 'mrkdwn', text: `*Kierunek:*\n${directionLabelsV1[data.direction] || data.direction}` })
    }
  }
  if (data.traffic_source) {
    optionalFields.push({ type: 'mrkdwn', text: `*Źródło:*\n${data.traffic_source}` })
  }
  if (optionalFields.length > 0) {
    blocks.push({ type: 'section', fields: optionalFields })
  }

  // Survey: czas + dochód
  const surveyFields: any[] = []
  if (data.weekly_hours) {
    surveyFields.push({ type: 'mrkdwn', text: `*Czas/tydzień:*\n${hoursLabels[data.weekly_hours] || data.weekly_hours}` })
  }
  const incomeValue = data.current_income || data.target_income
  if (incomeValue) {
    const incomeLabel = isV2 ? 'Obecny dochód' : 'Cel dochodu'
    surveyFields.push({ type: 'mrkdwn', text: `*${incomeLabel}:*\n${incomeLabels[incomeValue] || incomeValue}` })
  }
  if (surveyFields.length > 0) {
    blocks.push({ type: 'section', fields: surveyFields })
  }

  // Budżet (v2: liczba; v1: kategoria)
  if (data.budget) {
    const budgetText = isV2 ? formatBudgetV2(data.budget) : (budgetLabelsV1[data.budget] || data.budget)
    blocks.push({
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*Budżet inwestycyjny:*\n${budgetText}` }
      ]
    })
  }

  // Experience (etykieta zależna od wersji)
  if (data.experience) {
    const expLabel = isV2 ? 'O sobie' : 'Doświadczenie'
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*${expLabel}:*\n${data.experience.substring(0, 500)}`
      }
    })
  }

  // Open question (v1 only)
  if (data.open_question) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Czym się zajmuje:*\n${data.open_question.substring(0, 500)}`
      }
    })
  }

  // Action buttons
  const actionElements: any[] = []

  // "Zobacz szczegóły" button - only if we have lead_id
  if (data.lead_id) {
    actionElements.push({
      type: 'button',
      text: {
        type: 'plain_text',
        text: '📋 Zobacz szczegóły',
        emoji: true
      },
      url: `https://crm.tomekniedzwiecki.pl/lead?id=${data.lead_id}`,
      action_id: 'view_lead'
    })
  }

  // "Napisz na WhatsApp" button - only if we have phone
  if (data.phone) {
    // Format phone for WhatsApp: remove spaces, dashes, and ensure country code
    let waPhone = data.phone.replace(/[\s\-\(\)]/g, '')
    // If starts with 0, replace with Poland code
    if (waPhone.startsWith('0')) {
      waPhone = '48' + waPhone.substring(1)
    }
    // If doesn't start with +, assume Poland
    if (!waPhone.startsWith('+') && !waPhone.startsWith('48')) {
      waPhone = '48' + waPhone
    }
    // Remove + for wa.me link
    waPhone = waPhone.replace('+', '')

    actionElements.push({
      type: 'button',
      text: {
        type: 'plain_text',
        text: '💬 WhatsApp',
        emoji: true
      },
      url: `https://wa.me/${waPhone}`,
      action_id: 'whatsapp'
    })
  }

  if (actionElements.length > 0) {
    blocks.push({
      type: 'actions',
      elements: actionElements
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
  lead_phone?: string
  lead_company?: string
  lead_id?: string
  offer_name: string
  offer_price?: number
  first_view?: boolean
  view_history?: string[]
}) {
  const displayName = data.lead_company || data.lead_name || data.lead_email
  const viewCount = data.view_history?.length || 1
  const viewText = data.first_view ? '👀 Pierwsze otwarcie oferty!' : `👁️ Oferta przeglądana (${viewCount}x)`

  const fields = [
    { type: 'mrkdwn', text: `*Klient:*\n${leadLink(data.lead_email, displayName, data.lead_id)}` },
    { type: 'mrkdwn', text: `*Oferta:*\n${data.offer_name}` }
  ]

  if (data.offer_price) {
    fields.push({ type: 'mrkdwn', text: `*Wartość:*\n${data.offer_price.toLocaleString('pl-PL')} PLN` })
  }

  if (data.lead_email !== displayName) {
    fields.push({ type: 'mrkdwn', text: `*Email:*\n${leadLink(data.lead_email, data.lead_email, data.lead_id)}` })
  }

  if (data.lead_phone) {
    fields.push({ type: 'mrkdwn', text: `*Telefon:*\n${data.lead_phone}` })
  }

  const blocks: any[] = [
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
    }
  ]

  // Add view history section if there are previous views (not first view)
  if (data.view_history && data.view_history.length > 1) {
    const historyDates = data.view_history
      .slice(0, -1) // Exclude current view (last one)
      .map(dateStr => new Date(dateStr).toLocaleString('pl-PL', {
        timeZone: 'Europe/Warsaw',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      }))
      .reverse() // Most recent first
      .slice(0, 5) // Show max 5 previous views

    const moreCount = data.view_history.length - 1 - historyDates.length
    let historyText = `📜 *Poprzednie otworzenia:*\n${historyDates.join(' · ')}`
    if (moreCount > 0) {
      historyText += ` _(+${moreCount} więcej)_`
    }

    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: historyText
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

function formatScheduleViewedMessage(data: {
  lead_name?: string
  lead_email: string
  lead_phone?: string
  lead_company?: string
  lead_id?: string
  schedule_id: string
  total_amount: number
  paid_amount: number
  installments_total: number
  installments_paid: number
}) {
  const displayName = data.lead_company || data.lead_name || data.lead_email
  const progressPercent = data.total_amount > 0 ? Math.round((data.paid_amount / data.total_amount) * 100) : 0
  const remaining = data.total_amount - data.paid_amount

  const fields = [
    { type: 'mrkdwn', text: `*Klient:*\n${leadLink(data.lead_email, displayName, data.lead_id)}` },
    { type: 'mrkdwn', text: `*Postęp:*\n${data.installments_paid}/${data.installments_total} rat (${progressPercent}%)` }
  ]

  if (data.total_amount) {
    fields.push({ type: 'mrkdwn', text: `*Suma:*\n${data.total_amount.toLocaleString('pl-PL')} PLN` })
  }

  if (remaining > 0) {
    fields.push({ type: 'mrkdwn', text: `*Pozostało:*\n${remaining.toLocaleString('pl-PL')} PLN` })
  }

  if (data.lead_phone) {
    fields.push({ type: 'mrkdwn', text: `*Telefon:*\n${data.lead_phone}` })
  }

  const blocks: any[] = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: '📅 Klient otworzył harmonogram płatności',
        emoji: true
      }
    },
    {
      type: 'section',
      fields: fields
    }
  ]

  // Action buttons
  const actionElements: any[] = []

  if (data.lead_id) {
    actionElements.push({
      type: 'button',
      text: {
        type: 'plain_text',
        text: '📋 Zobacz lead',
        emoji: true
      },
      url: `https://crm.tomekniedzwiecki.pl/lead?id=${data.lead_id}`,
      action_id: 'view_lead'
    })
  }

  if (data.lead_phone) {
    let waPhone = data.lead_phone.replace(/[\s\-\(\)]/g, '')
    if (waPhone.startsWith('0')) {
      waPhone = '48' + waPhone.substring(1)
    }
    if (!waPhone.startsWith('+') && !waPhone.startsWith('48')) {
      waPhone = '48' + waPhone
    }
    waPhone = waPhone.replace('+', '')

    actionElements.push({
      type: 'button',
      text: {
        type: 'plain_text',
        text: '💬 WhatsApp',
        emoji: true
      },
      url: `https://wa.me/${waPhone}`,
      action_id: 'whatsapp'
    })
  }

  if (actionElements.length > 0) {
    blocks.push({
      type: 'actions',
      elements: actionElements
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

function formatProformaMessage(data: {
  lead_name?: string
  lead_email: string
  lead_company?: string
  lead_id?: string
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
    { type: 'mrkdwn', text: `*Klient:*\n${leadLink(data.lead_email, displayName, data.lead_id)}` },
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

function formatOfferExpiredAttemptMessage(data: {
  lead_name?: string
  lead_email: string
  lead_phone?: string
  lead_company?: string
  lead_id?: string
  offer_name: string
  offer_price?: number
  valid_until?: string
  page_version?: string
}) {
  const displayName = data.lead_company || data.lead_name || data.lead_email

  const fields = [
    { type: 'mrkdwn', text: `*Klient:*\n${leadLink(data.lead_email, displayName, data.lead_id)}` },
    { type: 'mrkdwn', text: `*Oferta:*\n${data.offer_name}` }
  ]

  if (data.valid_until) {
    const expiredDate = new Date(data.valid_until).toLocaleDateString('pl-PL', {
      day: 'numeric', month: 'long', year: 'numeric'
    })
    fields.push({ type: 'mrkdwn', text: `*Wygasła:*\n${expiredDate}` })
  }

  if (data.offer_price) {
    fields.push({ type: 'mrkdwn', text: `*Wartość:*\n${data.offer_price.toLocaleString('pl-PL')} PLN` })
  }

  if (data.lead_email !== displayName) {
    fields.push({ type: 'mrkdwn', text: `*Email:*\n${leadLink(data.lead_email, data.lead_email, data.lead_id)}` })
  }

  if (data.lead_phone) {
    fields.push({ type: 'mrkdwn', text: `*Telefon:*\n${data.lead_phone}` })
  }

  const blocks: any[] = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: '⏰ Lead próbował otworzyć wygasłą ofertę!',
        emoji: true
      }
    },
    {
      type: 'section',
      fields: fields
    }
  ]

  const actionElements: any[] = []

  if (data.lead_id) {
    actionElements.push({
      type: 'button',
      text: { type: 'plain_text', text: '📋 Zobacz lead', emoji: true },
      url: `https://crm.tomekniedzwiecki.pl/lead?id=${data.lead_id}`,
      action_id: 'view_lead'
    })
  }

  if (data.lead_phone) {
    let waPhone = data.lead_phone.replace(/[\s\-\(\)]/g, '')
    if (waPhone.startsWith('0')) waPhone = '48' + waPhone.substring(1)
    if (!waPhone.startsWith('+') && !waPhone.startsWith('48')) waPhone = '48' + waPhone
    waPhone = waPhone.replace('+', '')

    actionElements.push({
      type: 'button',
      text: { type: 'plain_text', text: '💬 WhatsApp', emoji: true },
      url: `https://wa.me/${waPhone}`,
      action_id: 'whatsapp'
    })
  }

  if (actionElements.length > 0) {
    blocks.push({ type: 'actions', elements: actionElements })
  }

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

function formatCheckoutStartedMessage(data: {
  lead_name?: string
  lead_email: string
  lead_phone?: string
  lead_company?: string
  lead_id?: string
  offer_name: string
  checkout_type: 'deposit' | 'remaining' | 'full'
  amount?: number
  page_version?: string
}) {
  const displayName = data.lead_company || data.lead_name || data.lead_email

  const typeLabels: Record<string, string> = {
    deposit:   '🔒 Zadatek (rezerwacja miejsca)',
    remaining: '💳 Pozostała kwota (po zadatku)',
    full:      '💰 Pełna opłata (od razu)'
  }
  const typeLabel = typeLabels[data.checkout_type] || data.checkout_type

  const fields = [
    { type: 'mrkdwn', text: `*Klient:*\n${leadLink(data.lead_email, displayName, data.lead_id)}` },
    { type: 'mrkdwn', text: `*Oferta:*\n${data.offer_name}` },
    { type: 'mrkdwn', text: `*Typ:*\n${typeLabel}` }
  ]

  if (data.amount) {
    fields.push({ type: 'mrkdwn', text: `*Kwota:*\n${data.amount.toLocaleString('pl-PL')} PLN` })
  }

  if (data.lead_email !== displayName) {
    fields.push({ type: 'mrkdwn', text: `*Email:*\n${leadLink(data.lead_email, data.lead_email, data.lead_id)}` })
  }

  if (data.lead_phone) {
    fields.push({ type: 'mrkdwn', text: `*Telefon:*\n${data.lead_phone}` })
  }

  return {
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '🛒 Klient przeszedł do checkout!',
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

// =====================================================
// ZWOLNIE LEAD — formularz /zwolnie/ na tomekniedzwiecki.pl
// Tabela: public.zwolnie_leads
// =====================================================

function formatZwolnieLeadMessage(data: {
  lead_id?: string
  contact_name?: string
  contact_email?: string
  contact_phone?: string
  company?: string
  website?: string
  industry?: string
  team_size?: string
  payroll?: string
  budget?: string
  problem?: string
  attachments_total?: number
  attachments_uploaded?: number
}) {
  const industryLabels: Record<string, string> = {
    'ecommerce':   'E-commerce / sklep online',
    'uslugi':      'Usługi (B2B / B2C)',
    'produkcja':   'Produkcja / fabryka',
    'handel-b2b':  'Handel B2B / hurtownia',
    'tech':        'Tech / SaaS / software',
    'prawo':       'Kancelaria / doradztwo',
    'finanse':     'Finanse / księgowość',
    'medyczne':    'Medyczne / wellness',
    'inna':        'Inna'
  }

  const teamSizeLabels: Record<string, string> = {
    '1-5':    '1-5 osób',
    '6-15':   '6-15 osób',
    '16-50':  '16-50 osób',
    '51-150': '51-150 osób',
    '150+':   '150+ osób'
  }

  const payrollLabels: Record<string, string> = {
    '<50k':       'do 50 000 zł',
    '50-150k':    '50 - 150 tys. zł',
    '150-500k':   '150 - 500 tys. zł',
    '500k-1.5M':  '500 tys. - 1,5 mln zł',
    '1.5M+':      'powyżej 1,5 mln zł',
    'nie-chce':   'nie chce podawać'
  }

  const budgetLabels: Record<string, string> = {
    '<20k':     'do 20 000 zł',
    '20-50k':   '20 - 50 tys. zł',
    '50-150k':  '50 - 150 tys. zł',
    '150-500k': '150 - 500 tys. zł',
    '500k+':    'powyżej 500 tys. zł',
    'nie-wiem': 'nie wie — prosi o propozycję'
  }

  const headerName = data.contact_name ? `*${data.contact_name}*` : '*(bez imienia)*'
  const emailLine = data.contact_email ? ` · ${data.contact_email}` : ''
  const phoneLine = data.contact_phone ? ` · ${data.contact_phone}` : ''

  const blocks: any[] = [
    {
      type: 'header',
      text: { type: 'plain_text', text: '🔥 Nowy lead z /zwolnie/', emoji: true }
    },
    {
      type: 'section',
      text: { type: 'mrkdwn', text: `${headerName}${emailLine}${phoneLine}` }
    }
  ]

  const firmFields: any[] = []
  if (data.company) {
    firmFields.push({ type: 'mrkdwn', text: `*Firma:*\n${data.company}` })
  }
  if (data.website) {
    const url = /^https?:\/\//i.test(data.website) ? data.website : `https://${data.website}`
    firmFields.push({ type: 'mrkdwn', text: `*WWW:*\n<${url}|${data.website}>` })
  }
  if (data.industry) {
    firmFields.push({ type: 'mrkdwn', text: `*Branża:*\n${industryLabels[data.industry] || data.industry}` })
  }
  if (firmFields.length > 0) {
    blocks.push({ type: 'section', fields: firmFields })
  }

  const scaleFields: any[] = []
  if (data.team_size) {
    scaleFields.push({ type: 'mrkdwn', text: `*Zespół:*\n${teamSizeLabels[data.team_size] || data.team_size}` })
  }
  if (data.payroll) {
    scaleFields.push({ type: 'mrkdwn', text: `*Pensje/mies.:*\n${payrollLabels[data.payroll] || data.payroll}` })
  }
  if (data.budget) {
    scaleFields.push({ type: 'mrkdwn', text: `*Budżet:*\n${budgetLabels[data.budget] || data.budget}` })
  }
  if (scaleFields.length > 0) {
    blocks.push({ type: 'section', fields: scaleFields })
  }

  if (data.problem) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Co ma zniknąć z roboty:*\n${data.problem.substring(0, 1500)}${data.problem.length > 1500 ? '…' : ''}`
      }
    })
  }

  if (data.attachments_total && data.attachments_total > 0) {
    const uploaded = data.attachments_uploaded || 0
    const failed = data.attachments_total - uploaded
    const attachText = failed > 0
      ? `📎 ${uploaded}/${data.attachments_total} załączników (${failed} nie zapisało się)`
      : `📎 ${data.attachments_total} załącznik${data.attachments_total === 1 ? '' : data.attachments_total < 5 ? 'i' : 'ów'}`
    blocks.push({
      type: 'context',
      elements: [{ type: 'mrkdwn', text: attachText }]
    })
  }

  if (data.contact_phone) {
    let waPhone = data.contact_phone.replace(/[\s\-\(\)]/g, '')
    if (waPhone.startsWith('0')) waPhone = '48' + waPhone.substring(1)
    if (!waPhone.startsWith('+') && !waPhone.startsWith('48')) waPhone = '48' + waPhone
    waPhone = waPhone.replace('+', '')

    blocks.push({
      type: 'actions',
      elements: [{
        type: 'button',
        text: { type: 'plain_text', text: '💬 WhatsApp', emoji: true },
        url: `https://wa.me/${waPhone}`,
        action_id: 'whatsapp'
      }]
    })
  }

  blocks.push({
    type: 'context',
    elements: [{
      type: 'mrkdwn',
      text: `📅 ${new Date().toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw' })}${data.lead_id ? ` · id: \`${data.lead_id.substring(0, 8)}\`` : ''}`
    }]
  })

  return { blocks }
}

// =====================================================
// SPARING / APLIKACJA — lejek /aplikacja (tabela spar_sessions)
// Kanał #sparing. Karta leada w panelu: tn-aplikacje/index#lead-<sessionId>
// =====================================================

// Normalizacja telefonu do linku wa.me (PL domyślnie)
function waLink(phone: string): string | null {
  let p = phone.replace(/[\s\-\(\)]/g, '')
  if (!p) return null
  if (p.startsWith('0')) p = '48' + p.substring(1)
  if (!p.startsWith('+') && !p.startsWith('48')) p = '48' + p
  p = p.replace('+', '')
  return `https://wa.me/${p}`
}

// Deep-link do karty leada w panelu TN Aplikacje
function sparLeadLink(sessionId?: string): string | null {
  if (!sessionId) return null
  return `https://crm.tomekniedzwiecki.pl/tn-aplikacje/index#lead-${sessionId}`
}

// ŹRÓDŁO akcji: który lejek (sklep vs aplikacja). Obie funkcje piszą na #sparing,
// więc każde powiadomienie MUSI jawnie oznaczać pochodzenie + linkować do WŁAŚCIWEGO
// panelu (Sklep → tn-sklep, Aplikacja → tn-aplikacje).
function funnelLabel(funnel?: string): string {
  return funnel === 'sklep' ? 'Sklep' : 'Aplikacja'
}
function funnelLeadLink(funnel?: string, sessionId?: string): string | null {
  return (funnel === 'sklep' ? budLeadLink : sparLeadLink)(sessionId)
}

// Przyciski akcji wspólne dla obu typów: karta w panelu (wg lejka) + WhatsApp
function sparActionButtons(sessionId?: string, phone?: string, funnel?: string): any[] {
  const elements: any[] = []
  const crm = funnelLeadLink(funnel, sessionId)
  if (crm) {
    elements.push({
      type: 'button',
      text: { type: 'plain_text', text: '📋 Otwórz w panelu', emoji: true },
      url: crm,
      action_id: 'view_spar_lead'
    })
  }
  if (phone) {
    const wa = waLink(phone)
    if (wa) {
      elements.push({
        type: 'button',
        text: { type: 'plain_text', text: '💬 WhatsApp', emoji: true },
        url: wa,
        style: 'primary',
        action_id: 'whatsapp'
      })
    }
  }
  return elements
}

// Krótkie podsumowanie projektu z Karty Problemu (zielony) lub briefu (kontakt)
function sparProjectSummary(data: {
  project_name?: string
  project_desc?: string
  karta?: Record<string, unknown> | null
}): string | null {
  const k = data.karta || {}
  const pick = (v: unknown): string => {
    if (v === null || v === undefined) return ''
    return (Array.isArray(v) ? v.join(', ') : String(v)).trim()
  }
  const parts: string[] = []
  const name = pick(data.project_name) || pick(k.nazwa)
  const desc = pick(data.project_desc) || pick(k.opis)
  if (name) parts.push(`*${name}*`)
  if (desc) parts.push(desc)

  const detail = (label: string, v: unknown) => {
    const t = pick(v)
    if (t) parts.push(`*${label}:* ${t.substring(0, 220)}`)
  }
  detail('Problem', k.problem)
  detail('Dla kogo', k.dla_kogo || k.kto)
  detail('Kto płaci', k.kto_placi)
  detail('Ekrany', k.ekrany)

  if (!parts.length) return null
  return parts.join('\n')
}

function formatSparContactMessage(data: {
  session_id?: string
  funnel?: string
  name?: string
  email?: string
  phone?: string
  profession?: string
  project_name?: string
  project_desc?: string
  karta?: Record<string, unknown> | null
}) {
  const headerName = data.name ? `*${data.name}*` : '*(bez imienia)*'
  const emailLine = data.email ? ` · ${data.email}` : ''
  const phoneLine = data.phone ? ` · ${data.phone}` : ''

  const blocks: any[] = [
    {
      type: 'header',
      text: { type: 'plain_text', text: `🆕 ${funnelLabel(data.funnel)} — lead zostawił kontakt`, emoji: true }
    },
    {
      type: 'section',
      text: { type: 'mrkdwn', text: `${headerName}${emailLine}${phoneLine}` }
    }
  ]

  if (data.profession) {
    blocks.push({
      type: 'section',
      fields: [{ type: 'mrkdwn', text: `*Profesja:*\n${data.profession.substring(0, 200)}` }]
    })
  }

  const summary = sparProjectSummary(data)
  if (summary) {
    blocks.push({
      type: 'section',
      text: { type: 'mrkdwn', text: `🧩 *Projekt (w toku):*\n${summary}` }
    })
  } else {
    blocks.push({
      type: 'context',
      elements: [{ type: 'mrkdwn', text: '🧩 Projekt jeszcze nie zdefiniowany — rozmowa w toku.' }]
    })
  }

  const actions = sparActionButtons(data.session_id, data.phone, data.funnel)
  if (actions.length) blocks.push({ type: 'actions', elements: actions })

  blocks.push({
    type: 'context',
    elements: [{
      type: 'mrkdwn',
      text: `📅 ${new Date().toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw' })}`
    }]
  })

  return { blocks }
}

// Czytelna nazwa widoku ekranu (klucze z spar-image)
const SPAR_VIEW_LABELS: Record<string, string> = {
  panel: 'Pulpit',
  glowna: 'Główny ekran',
  dodatkowa: 'Dodatkowy ekran',
  landing: 'Strona sprzedażowa',
  podsumowanie: 'Projekt w pigułce',
  sklep: 'W sklepie z aplikacjami',
  telefon: 'W dłoni',
}

// Widoki makiet lejka /sklep (klucze z bud-image: kolejność sklep→…→podsumowanie)
const BUD_VIEW_LABELS: Record<string, string> = {
  sklep: 'Sklep — strona główna',
  karta_produktu: 'Karta produktu',
  logo: 'Logo / marka',
  lifestyle: 'Zdjęcie lifestyle',
  podsumowanie: 'Podsumowanie',
}

// Publiczny URL pliku PNG (…/storage/v1/object/public/…) → render endpoint
// (…/storage/v1/render/image/public/…?width=600&resize=contain). resize=contain
// OBOWIĄZKOWO — samo width tnie boki i Slack dostałby pionowy wycinek
// (patrz pamięć: feedback-supabase-render-api-resize-contain).
function toRenderUrl(publicUrl: string, width = 600): string {
  if (typeof publicUrl !== 'string' || !publicUrl.includes('/storage/v1/object/public/')) return publicUrl
  const base = publicUrl.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/')
  const sep = base.includes('?') ? '&' : '?'
  return `${base}${sep}width=${width}&resize=contain`
}

// Galeria wygenerowanych ekranów aplikacji (PNG ze spar-image) na #sparing.
// Każdy ekran = osobny image block (Slack pokazuje miniaturę). Dodatkowo
// przyciski: karta w CRM, WhatsApp oraz — jeśli istnieją — live landing i prototyp.
function formatSparPreviewMessage(data: {
  session_id?: string
  funnel?: string
  name?: string
  email?: string
  phone?: string
  project_name?: string
  images?: { view?: string; url?: string }[]
  landing_url?: string | null
  prototype_url?: string | null
}) {
  const isSklep = data.funnel === 'sklep'
  const headerName = data.name ? `*${data.name}*` : '*(bez imienia)*'
  const emailLine = data.email ? ` · ${data.email}` : ''
  const phoneLine = data.phone ? ` · ${data.phone}` : ''
  const projectLine = data.project_name ? `\n🧩 *${data.project_name}*` : ''

  const blocks: any[] = [
    {
      type: 'header',
      text: { type: 'plain_text', text: `🎨 ${funnelLabel(data.funnel)} — ${isSklep ? 'makiety sklepu gotowe' : 'podgląd aplikacji gotowy'}`, emoji: true }
    },
    {
      type: 'section',
      text: { type: 'mrkdwn', text: `${headerName}${emailLine}${phoneLine}${projectLine}` }
    }
  ]

  // Slack: max ~50 bloków/wiadomość — ekranów jest 4-7, mieścimy się z zapasem.
  const images = Array.isArray(data.images) ? data.images : []
  for (const img of images) {
    if (!img || typeof img.url !== 'string' || !img.url) continue
    const label = (isSklep ? BUD_VIEW_LABELS : SPAR_VIEW_LABELS)[img.view || ''] || (img.view || (isSklep ? 'Makieta' : 'Ekran'))
    blocks.push({
      type: 'image',
      title: { type: 'plain_text', text: label, emoji: false },
      image_url: toRenderUrl(img.url),
      alt_text: label,
    })
  }

  if (!images.some((i) => i && typeof i.url === 'string' && i.url)) {
    blocks.push({
      type: 'context',
      elements: [{ type: 'mrkdwn', text: '⚠️ Brak gotowych miniatur ekranów do pokazania.' }]
    })
  }

  // Przyciski: karta w CRM + WhatsApp (wspólny helper) + live landing/prototyp
  const actions = sparActionButtons(data.session_id, data.phone, data.funnel)
  if (data.landing_url) {
    actions.push({
      type: 'button',
      text: { type: 'plain_text', text: isSklep ? '🛒 Zobacz sklep' : '🌐 Zobacz stronę', emoji: true },
      url: data.landing_url,
      action_id: 'view_spar_landing',
    })
  }
  if (data.prototype_url) {
    actions.push({
      type: 'button',
      text: { type: 'plain_text', text: '📱 Zobacz prototyp', emoji: true },
      url: data.prototype_url,
      action_id: 'view_spar_prototype',
    })
  }
  if (actions.length) blocks.push({ type: 'actions', elements: actions })

  blocks.push({
    type: 'context',
    elements: [{
      type: 'mrkdwn',
      text: `📅 ${new Date().toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw' })}`
    }]
  })

  return { blocks }
}

// =====================================================
// BUDOWANIE (/sklep) — CICHE AWARIE: lead nie zapisał się / handoff/know-how padł.
// Kanał #sparing. Cel: Tomek widzi od razu, że płacący/zielony lead wymaga ręcznej
// interwencji (zamiast odkrywać ubytek przypadkiem). Deep-link do panelu tn-sklep.
// =====================================================

function budLeadLink(sessionId?: string): string | null {
  if (!sessionId) return null
  return `https://crm.tomekniedzwiecki.pl/tn-sklep/index#lead-${sessionId}`
}

function formatBudLeadErrorMessage(data: {
  session_id?: string
  email?: string
  name?: string
  phone?: string
  error?: string
}) {
  const headerName = data.name ? `*${data.name}*` : '*(bez imienia)*'
  const emailLine = data.email ? ` · ${data.email}` : ''
  const phoneLine = data.phone ? ` · ${data.phone}` : ''
  const blocks: any[] = [
    { type: 'header', text: { type: 'plain_text', text: '🛑 Budowa — LEAD NIE ZAPISAŁ SIĘ', emoji: true } },
    { type: 'section', text: { type: 'mrkdwn', text: `Zielony werdykt + kontakt, ale lead NIE trafił do CRM. Wymaga ręcznego utworzenia.\n${headerName}${emailLine}${phoneLine}` } },
  ]
  if (data.error) {
    blocks.push({ type: 'section', text: { type: 'mrkdwn', text: `*Błąd:*\n\`${String(data.error).slice(0, 280)}\`` } })
  }
  const link = budLeadLink(data.session_id)
  const actions: any[] = []
  if (link) actions.push({ type: 'button', text: { type: 'plain_text', text: '📋 Otwórz w panelu', emoji: true }, url: link, style: 'primary', action_id: 'view_bud_lead' })
  if (data.phone) { const wa = waLink(data.phone); if (wa) actions.push({ type: 'button', text: { type: 'plain_text', text: '💬 WhatsApp', emoji: true }, url: wa, action_id: 'whatsapp' }) }
  if (actions.length) blocks.push({ type: 'actions', elements: actions })
  blocks.push({ type: 'context', elements: [{ type: 'mrkdwn', text: `📅 ${new Date().toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw' })}${data.session_id ? ` · sid: \`${data.session_id.substring(0, 8)}\`` : ''}` }] })
  return { blocks }
}

// Awaria generatora lejka /sklep (raport / makiety / reklamy / strona) — user widzi
// zablokowany pipeline, Tomek ma wiedzieć PRZED userem. Wysyłane z bud-raport /
// bud-mockup / bud-ads / bud-landing-gen przy DEFINITYWNEJ porażce generacji
// oraz z bud-drip (sweep wiszących sesji / Manus timeout).
function formatBudGenErrorMessage(data: {
  session_id?: string
  stage?: string
  error?: string
  product?: string
}) {
  const blocks: any[] = [
    { type: 'header', text: { type: 'plain_text', text: '🛑 Sklep — GENERACJA PADŁA', emoji: true } },
    { type: 'section', text: { type: 'mrkdwn', text: `*Etap:* ${data.stage || '?'}${data.product ? `\n*Produkt:* ${String(data.product).slice(0, 120)}` : ''}` } },
  ]
  if (data.error) {
    blocks.push({ type: 'section', text: { type: 'mrkdwn', text: `*Błąd:*\n\`${String(data.error).slice(0, 280)}\`` } })
  }
  const genLink = budLeadLink(data.session_id)
  if (genLink) {
    blocks.push({ type: 'actions', elements: [{ type: 'button', text: { type: 'plain_text', text: '📋 Otwórz w panelu', emoji: true }, url: genLink, style: 'primary', action_id: 'view_bud_lead' }] })
  }
  blocks.push({ type: 'context', elements: [{ type: 'mrkdwn', text: `📅 ${new Date().toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw' })}${data.session_id ? ` · sid: \`${data.session_id.substring(0, 8)}\`` : ''}` }] })
  return { blocks }
}

function formatBudKnowhowErrorMessage(data: {
  session_id?: string
  lead_id?: string
  error_type?: string
  error_msg?: string
  error?: string
}) {
  const typeLabel = data.error_type === 'handoff_error'
    ? 'Pakiet wykonawczy (handoff) NIE wygenerował się'
    : data.error_type === 'extract_error'
      ? 'Ekstrakcja wiedzy (dossier) padła'
      : 'Błąd etapu know-how'
  const blocks: any[] = [
    { type: 'header', text: { type: 'plain_text', text: '⚠️ Budowa — KNOW-HOW: błąd po pełnej płatności', emoji: true } },
    { type: 'section', text: { type: 'mrkdwn', text: `*${typeLabel}.* Płacący klient — sprawdź i wygeneruj ponownie z panelu.` } },
  ]
  const msg = data.error_msg || data.error
  if (msg) blocks.push({ type: 'section', text: { type: 'mrkdwn', text: `*Szczegóły:*\n\`${String(msg).slice(0, 280)}\`` } })
  const link = budLeadLink(data.session_id)
  if (link) blocks.push({ type: 'actions', elements: [{ type: 'button', text: { type: 'plain_text', text: '📋 Otwórz w panelu', emoji: true }, url: link, style: 'primary', action_id: 'view_bud_lead' }] })
  blocks.push({ type: 'context', elements: [{ type: 'mrkdwn', text: `📅 ${new Date().toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw' })}${data.session_id ? ` · sid: \`${data.session_id.substring(0, 8)}\`` : ''}${data.lead_id ? ` · lead: \`${data.lead_id.substring(0, 8)}\`` : ''}` }] })
  return { blocks }
}

// #sparing: strona sklepu (HTML) wygenerowana i opublikowana (bud-landing, pass 1).
// Lejek /sklep — zawsze funnel='sklep'.
function formatBudHtmlMessage(data: {
  session_id?: string
  name?: string
  email?: string
  phone?: string
  project_name?: string
  shop_url?: string | null
}) {
  const headerName = data.name ? `*${data.name}*` : '*(bez imienia)*'
  const emailLine = data.email ? ` · ${data.email}` : ''
  const phoneLine = data.phone ? ` · ${data.phone}` : ''
  const projectLine = data.project_name ? `\n🧩 *${data.project_name}*` : ''
  const blocks: any[] = [
    { type: 'header', text: { type: 'plain_text', text: '🛍️ Sklep — strona sklepu gotowa', emoji: true } },
    { type: 'section', text: { type: 'mrkdwn', text: `${headerName}${emailLine}${phoneLine}${projectLine}` } },
  ]
  const actions = sparActionButtons(data.session_id, data.phone, 'sklep')
  if (data.shop_url) {
    actions.push({
      type: 'button',
      text: { type: 'plain_text', text: '🛒 Zobacz sklep', emoji: true },
      url: data.shop_url,
      style: 'primary',
      action_id: 'view_bud_shop',
    })
  }
  if (actions.length) blocks.push({ type: 'actions', elements: actions })
  blocks.push({ type: 'context', elements: [{ type: 'mrkdwn', text: `📅 ${new Date().toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw' })}${data.session_id ? ` · sid: \`${data.session_id.substring(0, 8)}\`` : ''}` }] })
  return { blocks }
}

// #sparing: user WYBRAŁ makietę sklepu (bud-chat po chosen_style). Lejek /sklep, żywa
// ścieżka picker-first (bud_sessions.mockups). Pokazujemy TĘ JEDNĄ wybraną makietę
// (decyzja Tomka 2026-07-07), nie całą galerię 4 stylów. Struktura `mockups[]` zostawiona
// tablicą (elastyczność), ale bud-chat przekazuje tu 1 element = wybrany styl.
function formatBudMockupsMessage(data: {
  session_id?: string
  name?: string
  email?: string
  phone?: string
  project_name?: string
  mockups?: { style?: string; label?: string; url?: string }[]
}) {
  const headerName = data.name ? `*${data.name}*` : '*(bez imienia)*'
  const emailLine = data.email ? ` · ${data.email}` : ''
  const phoneLine = data.phone ? ` · ${data.phone}` : ''
  const mockups = Array.isArray(data.mockups) ? data.mockups.filter((m) => m && typeof m.url === 'string' && m.url) : []
  const styleLabel = (mockups[0] && typeof mockups[0].label === 'string' && mockups[0].label) ? mockups[0].label : ''
  const projectLine = data.project_name ? `\n🧩 *${data.project_name}*${styleLabel ? ` · styl: ${styleLabel}` : ''}` : (styleLabel ? `\nstyl: *${styleLabel}*` : '')
  const blocks: any[] = [
    { type: 'header', text: { type: 'plain_text', text: '🎨 Sklep — lead wybrał makietę sklepu', emoji: true } },
    { type: 'section', text: { type: 'mrkdwn', text: `${headerName}${emailLine}${phoneLine}${projectLine}` } },
  ]
  for (const m of mockups) {
    const label = (typeof m.label === 'string' && m.label) ? m.label : (m.style || 'Makieta')
    blocks.push({
      type: 'image',
      title: { type: 'plain_text', text: label.slice(0, 200), emoji: false },
      image_url: toRenderUrl(m.url as string),
      alt_text: label.slice(0, 200),
    })
  }
  if (!mockups.length) {
    blocks.push({ type: 'context', elements: [{ type: 'mrkdwn', text: '⚠️ Brak gotowej miniatury wybranej makiety do pokazania.' }] })
  }
  const actions = sparActionButtons(data.session_id, data.phone, 'sklep')
  if (actions.length) blocks.push({ type: 'actions', elements: actions })
  blocks.push({ type: 'context', elements: [{ type: 'mrkdwn', text: `📅 ${new Date().toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw' })}${data.session_id ? ` · sid: \`${data.session_id.substring(0, 8)}\`` : ''}` }] })
  return { blocks }
}

// #sparing: bot zaproponował leadowi wpłatę ZWROTNEJ rezerwacji 500 zł (marker <makieta>
// w bud-chat, po zielonym świetle). Gorący moment lejka /sklep — Tomek ma odezwać się,
// póki decyzja świeża. Deep-link do panelu tn-sklep + WhatsApp.
// TN Sklepy (workflow v2): NOWE ZAMÓWIENIA z platformy — najważniejszy sygnał fabryki.
function formatWf2OrderMessage(data: {
  project_id?: string
  customer?: string
  count?: number
  total_value?: number
  shop_domain?: string
}) {
  const n = Number(data.count) || 1
  const val = Number(data.total_value) || 0
  const blocks: any[] = [
    { type: 'header', text: { type: 'plain_text', text: `🛒 SKLEP SPRZEDAJE — ${n === 1 ? 'nowe zamówienie!' : n + ' nowe zamówienia!'}`, emoji: true } },
    { type: 'section', text: { type: 'mrkdwn', text: `*${data.customer || '(projekt)'}*${data.shop_domain ? ` · ${data.shop_domain}` : ''}${val > 0 ? `\n💰 wartość: *${val.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} zł*` : ''}` } },
  ]
  if (data.project_id) {
    blocks.push({ type: 'actions', elements: [{ type: 'button', text: { type: 'plain_text', text: 'Otwórz projekt', emoji: true }, url: `https://crm.tomekniedzwiecki.pl/tn-sklepy/projekt?id=${data.project_id}` }] })
  }
  blocks.push({ type: 'context', elements: [{ type: 'mrkdwn', text: `📅 ${new Date().toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw' })}` }] })
  return { blocks }
}

// TN Sklepy: kreacje reklamowe produktu gotowe (wf2-ads: Manus/Gemini) — do akceptu.
function formatWf2AdsReadyMessage(data: {
  project_id?: string
  customer?: string
  product?: string
  source?: string
}) {
  const blocks: any[] = [
    { type: 'header', text: { type: 'plain_text', text: '🎨 3 grafiki reklamowe gotowe', emoji: true } },
    { type: 'section', text: { type: 'mrkdwn', text: `*${data.product || '(produkt)'}*${data.customer ? ` · ${data.customer}` : ''}${data.source ? ` · ${data.source}` : ''}\nSprawdź wierność produktu i zaakceptuj w kroku „3 grafiki (Manus)".` } },
  ]
  if (data.project_id) {
    blocks.push({ type: 'actions', elements: [{ type: 'button', text: { type: 'plain_text', text: 'Otwórz projekt', emoji: true }, url: `https://crm.tomekniedzwiecki.pl/tn-sklepy/projekt?id=${data.project_id}` }] })
  }
  blocks.push({ type: 'context', elements: [{ type: 'mrkdwn', text: `📅 ${new Date().toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw' })}` }] })
  return { blocks }
}

function formatBudReservationMessage(data: {
  session_id?: string
  name?: string
  email?: string
  phone?: string
  project_name?: string
  have?: string[]
}) {
  const headerName = data.name ? `*${data.name}*` : '*(bez imienia)*'
  const emailLine = data.email ? ` · ${data.email}` : ''
  const phoneLine = data.phone ? ` · ${data.phone}` : ''
  const projectLine = data.project_name ? `\n🧩 *${data.project_name}*` : ''
  const blocks: any[] = [
    { type: 'header', text: { type: 'plain_text', text: '💰 Sklep — lead dostał propozycję rezerwacji 500 zł', emoji: true } },
    { type: 'section', text: { type: 'mrkdwn', text: `${headerName}${emailLine}${phoneLine}${projectLine}` } },
    { type: 'section', text: { type: 'mrkdwn', text: 'Bot zaproponował wpłatę zwrotnej rezerwacji (miejsce w kolejce). Najgorętszy moment — odezwij się, póki decyzja świeża.' } },
  ]
  const have = Array.isArray(data.have) ? data.have.filter((h) => typeof h === 'string' && h) : []
  if (have.length) {
    blocks.push({ type: 'context', elements: [{ type: 'mrkdwn', text: `Ma już: ${have.map((h) => `✓ ${h}`).join(' · ')}` }] })
  }
  const actions = sparActionButtons(data.session_id, data.phone, 'sklep')
  if (actions.length) blocks.push({ type: 'actions', elements: actions })
  blocks.push({ type: 'context', elements: [{ type: 'mrkdwn', text: `📅 ${new Date().toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw' })}${data.session_id ? ` · sid: \`${data.session_id.substring(0, 8)}\`` : ''}` }] })
  return { blocks }
}

// Odrzucony (lost/abandoned) lead WRÓCIŁ do rozmowy (genuine user turn) — najgorętszy
// sygnał sprzedażowy. funnel decyduje o panelu deep-linku (aplikacja/sklep).
function formatSparReviveMessage(data: {
  session_id?: string
  funnel?: string
  name?: string
  email?: string
  phone?: string
  from?: string
  to?: string
}) {
  const STAGE_PL: Record<string, string> = {
    new: 'Nowy', contacted: 'Skontaktowany', qualified: 'Oferta', proposal: 'Zakwalifikowany',
    negotiation: 'Rezerwacja', won: 'Wygrany', lost: 'Przegrany', abandoned: 'Porzucony',
  }
  const isSklep = data.funnel === 'sklep'
  const funnelLabel = isSklep ? 'Sklep' : 'Aplikacja'
  const headerName = data.name ? `*${data.name}*` : '*(bez imienia)*'
  const emailLine = data.email ? ` · ${data.email}` : ''
  const phoneLine = data.phone ? ` · ${data.phone}` : ''
  const fromL = STAGE_PL[data.from || ''] || data.from || '—'
  const toL = STAGE_PL[data.to || ''] || data.to || '—'

  const blocks: any[] = [
    { type: 'header', text: { type: 'plain_text', text: `🔥 ${funnelLabel} — odrzucony lead WRÓCIŁ`, emoji: true } },
    { type: 'section', text: { type: 'mrkdwn', text: `${headerName}${emailLine}${phoneLine}` } },
    { type: 'section', text: { type: 'mrkdwn', text: `Sam wrócił do rozmowy i pisze. Lejek: *${fromL}* → *${toL}*. Odezwij się, póki gorący.` } },
  ]

  const link = isSklep ? budLeadLink(data.session_id) : sparLeadLink(data.session_id)
  const actions: any[] = []
  if (link) actions.push({ type: 'button', text: { type: 'plain_text', text: '📋 Otwórz w panelu', emoji: true }, url: link, style: 'primary', action_id: 'view_revive_lead' })
  if (data.phone) { const wa = waLink(data.phone); if (wa) actions.push({ type: 'button', text: { type: 'plain_text', text: '💬 WhatsApp', emoji: true }, url: wa, action_id: 'whatsapp' }) }
  if (actions.length) blocks.push({ type: 'actions', elements: actions })
  blocks.push({ type: 'context', elements: [{ type: 'mrkdwn', text: `📅 ${new Date().toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw' })}` }] })
  return { blocks }
}

// #sparing: cichy pad generacji artefaktu lejka /aplikacja (rynek/economics/gtm/
// strona/prototyp). Reveal utknął w 'generating' i po N ponowieniach spar-drip
// oznaczył go 'failed'. Tomek ma wiedzieć, że zielony lead NIE dostał artefaktu
// (mail odsłony nie poszedł) — zanim odkryje ubytek przypadkiem. Deep-link do
// karty leada w panelu TN Aplikacje.
const SPAR_ARTIFACT_LABELS: Record<string, string> = {
  rynek: 'Raport rynku',
  economics: 'Unit economics',
  gtm: 'Plan + reklamy (GTM)',
  landing: 'Strona sprzedażowa',
  prototyp: 'Klikalny prototyp',
}
function formatSparGenErrorMessage(data: {
  session_id?: string
  name?: string
  email?: string
  project_name?: string
  artifact?: string
  error?: string
  count?: number
}) {
  const headerName = data.name ? `*${data.name}*` : '*(bez imienia)*'
  const emailLine = data.email ? ` · ${data.email}` : ''
  const projectLine = data.project_name ? `\n🧩 *${data.project_name}*` : ''
  const artLabel = SPAR_ARTIFACT_LABELS[data.artifact || ''] || (data.artifact || 'artefakt')
  const blocks: any[] = [
    { type: 'header', text: { type: 'plain_text', text: '🛑 Aplikacja — GENERACJA PADŁA', emoji: true } },
    { type: 'section', text: { type: 'mrkdwn', text: `Zielony lead NIE dostał artefaktu — mail odsłony nie poszedł. Sprawdź i wygeneruj ręcznie z panelu.\n${headerName}${emailLine}${projectLine}` } },
    { type: 'section', fields: [
      { type: 'mrkdwn', text: `*Artefakt:*\n${artLabel}` },
      { type: 'mrkdwn', text: `*Nieudane próby:*\n${typeof data.count === 'number' ? data.count : '?'}` },
    ] },
  ]
  if (data.error) {
    blocks.push({ type: 'section', text: { type: 'mrkdwn', text: `*Błąd:*\n\`${String(data.error).slice(0, 280)}\`` } })
  }
  const link = sparLeadLink(data.session_id)
  if (link) blocks.push({ type: 'actions', elements: [{ type: 'button', text: { type: 'plain_text', text: '📋 Otwórz w panelu', emoji: true }, url: link, style: 'primary', action_id: 'view_spar_gen_error' }] })
  blocks.push({ type: 'context', elements: [{ type: 'mrkdwn', text: `📅 ${new Date().toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw' })}${data.session_id ? ` · sid: \`${data.session_id.substring(0, 8)}\`` : ''}` }] })
  return { blocks }
}

function formatSparGreenMessage(data: {
  session_id?: string
  funnel?: string
  name?: string
  email?: string
  phone?: string
  profession?: string
  project_name?: string
  project_desc?: string
  karta?: Record<string, unknown> | null
}) {
  const headerName = data.name ? `*${data.name}*` : '*(bez imienia)*'
  const emailLine = data.email ? ` · ${data.email}` : ''
  const phoneLine = data.phone ? ` · ${data.phone}` : ''

  const blocks: any[] = [
    {
      type: 'header',
      text: { type: 'plain_text', text: `🟢 ${funnelLabel(data.funnel)} — ZIELONY werdykt (warto pisać)`, emoji: true }
    },
    {
      type: 'section',
      text: { type: 'mrkdwn', text: `${headerName}${emailLine}${phoneLine}` }
    }
  ]

  if (data.profession) {
    blocks.push({
      type: 'section',
      fields: [{ type: 'mrkdwn', text: `*Profesja:*\n${data.profession.substring(0, 200)}` }]
    })
  }

  const summary = sparProjectSummary(data)
  if (summary) {
    blocks.push({
      type: 'section',
      text: { type: 'mrkdwn', text: `🧩 *Projekt:*\n${summary}` }
    })
  }

  const actions = sparActionButtons(data.session_id, data.phone, data.funnel)
  if (actions.length) blocks.push({ type: 'actions', elements: actions })

  blocks.push({
    type: 'context',
    elements: [{
      type: 'mrkdwn',
      text: `📅 ${new Date().toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw' })}`
    }]
  })

  return { blocks }
}

// #sparing: klient DOMKNĄŁ etap spowiednika (przycisk „To już wszystko" w spar-chat).
// To jest sygnał startu budowy dla Tomka — do tego momentu projekt w TN App czeka
// (badge „Spowiednik w toku"). Handoff pack generuje się w tle tuż po tym evencie.
function formatSparKnowhowClosedMessage(data: {
  session_id?: string
  project_id?: string
  name?: string
  email?: string
  phone?: string
  project_name?: string
  items_count?: number
}) {
  const headerName = data.name ? `*${data.name}*` : '*(bez imienia)*'
  const emailLine = data.email ? ` · ${data.email}` : ''
  const phoneLine = data.phone ? ` · ${data.phone}` : ''
  const projectLine = data.project_name ? `\n🧩 *${data.project_name}*` : ''

  const blocks: any[] = [
    { type: 'header', text: { type: 'plain_text', text: '🏁 Aplikacja — klient UKOŃCZYŁ spowiednika', emoji: true } },
    { type: 'section', text: { type: 'mrkdwn', text: `${headerName}${emailLine}${phoneLine}${projectLine}` } },
    { type: 'section', text: { type: 'mrkdwn', text: `Klient kliknął *„To już wszystko"* — wiedza zebrana${typeof data.items_count === 'number' ? ` (${data.items_count} itemów w bazie)` : ''}, Pakiet wiedzy składa się w tle. *Możesz zaczynać budowę.*` } },
  ]

  const actions: any[] = []
  if (data.project_id) {
    actions.push({
      type: 'button',
      text: { type: 'plain_text', text: '🚀 Otwórz projekt TN App', emoji: true },
      url: `https://crm.tomekniedzwiecki.pl/tn-app/projekt?id=${data.project_id}`,
      style: 'primary',
      action_id: 'view_wfa_project',
    })
  }
  const panelLink = sparLeadLink(data.session_id)
  if (panelLink) {
    actions.push({ type: 'button', text: { type: 'plain_text', text: '📋 Karta w panelu', emoji: true }, url: panelLink, action_id: 'view_spar_lead' })
  }
  if (data.phone) {
    const wa = waLink(data.phone)
    if (wa) actions.push({ type: 'button', text: { type: 'plain_text', text: '💬 WhatsApp', emoji: true }, url: wa, action_id: 'whatsapp' })
  }
  if (actions.length) blocks.push({ type: 'actions', elements: actions })

  blocks.push({ type: 'context', elements: [{ type: 'mrkdwn', text: `📅 ${new Date().toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw' })}${data.session_id ? ` · sid: \`${data.session_id.substring(0, 8)}\`` : ''}` }] })
  return { blocks }
}
