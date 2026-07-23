 
import { createClient } from 'jsr:@supabase/supabase-js@2'

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  'https://crm.tomekniedzwiecki.pl',
  'https://tomekniedzwiecki.pl',
  'http://localhost:3000',
  'http://127.0.0.1:5500',
  'http://localhost:5500',
]

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }
}

// Valid email types
const VALID_EMAIL_TYPES = [
  'zapisy_confirmation',
  'lead_intro_video',
  // Pipeline (sales tool — lead_status_changed automations)
  'pipeline_offer_cancelled',
  'pipeline_business_takeover',
  'proforma_generated',
  'invoice_sent',
  'contract_sent',
  'offer_created',
  'offer_personal',
  'offer_reminder_halfway',
  'offer_expired',
  'products_shared',
  'workflow_created',
  // Rezerwacja budowy sklepu (100 zl) — potwierdzenie + CTA WhatsApp (2026-07-23);
  // wysyla tpay-webhook przy pierwszym zaksiegowaniu rezerwacji
  'bud_reservation_confirmed',
  // Pelna platnosc za budowe sklepu — potwierdzenie + link do portalu klienta
  // /twoj-biznes?t=<token> (2026-07-23); wysyla tpay-webhook po utworzeniu/znalezieniu
  // projektu wf2, idempotentnie po wf2_projects.access_mail_sent_at
  'bud_full_payment_confirmed',
  'workflow_stage_completed',
  'report_published',
  'branding_delivered',
  'sales_page_shared',
  // Etap 2 - Video
  'video_activated',
  // Etap 3 - TakeDrop
  'takedrop_activated',
  'takedrop_account_rejected',
  'takedrop_account_inactive',
  'takedrop_welcome',
  'landing_page_connected',
  'payment_gateway_required',
  'test_ready',
  // Etap 4 - Reklamy
  'ads_activated',
  'partner_step_completed',
  'ads_completed',
  'content_ready',
  'campaign_launched',
  'budget_not_funded',
  'ad_report',
  // Etap 5 - Optymalizacja
  'optimization_started',
  'reviews_shared',
  'videos_shared',
  'videos_reminder',
  'videos_skipped',
  'tools_started',
  'tools_script_received',
  'tools_notes_received',
  'tools_completed',
  'analysis_started',
  'direct'
]

// Fallback subjects only (body MUST come from database)
const FALLBACK_SUBJECTS: Record<string, string> = {
  zapisy_confirmation: 'Dziękuję za zgłoszenie',
  lead_intro_video: 'Zobacz jak buduję biznesy online',
  proforma_generated: 'Faktura proforma - {{offerName}}',
  invoice_sent: 'Faktura VAT - {{invoiceNumber}}',
  contract_sent: 'Umowa podpisana - {{offerName}}',
  offer_created: 'Twoja oferta jest gotowa - {{offerName}}',
  offer_personal: 'Re: {{offerName}}',
  offer_reminder_halfway: 'Przypomnienie: Twoja oferta wygasa {{validUntil}}',
  offer_expired: 'Twoja oferta wygasła',
  products_shared: 'Propozycje produktowe — wybierz swój produkt',
  workflow_created: 'Płatność przyjęta — podpisz umowę',
  bud_reservation_confirmed: 'Rezerwacja przyjęta — napisz do mnie na WhatsApp',
  bud_full_payment_confirmed: 'Płatność przyjęta — Twój panel projektu',
  workflow_stage_completed: 'Etap {{stageNumber}} ukończony — {{stageName}}',
  report_published: 'Raport dotyczący Twojego produktu jest gotowy',
  branding_delivered: 'Branding Twojej marki jest gotowy!',
  sales_page_shared: 'Twoja strona sprzedażowa jest gotowa!',
  // Etap 2 - Video
  video_activated: 'Czas na nagranie materiałów video!',
  // Etap 3 - TakeDrop
  takedrop_activated: 'Załóż konto na platformie sklepowej',
  takedrop_account_rejected: 'Hasło do TakeDrop niepoprawne — popraw je w panelu',
  takedrop_account_inactive: 'Konto TakeDrop nieaktywne — podepnij kartę w panelu',
  takedrop_welcome: 'Witaj w TakeDrop — zaczynamy etap 3!',
  payment_gateway_required: '{{clientName}}, czas na bramkę płatności ({{gatewayName}})',
  // Etap 4 - Reklamy
  ads_activated: 'Ruszamy z reklamami — etap 4 aktywowany!',
  partner_step_completed: 'Konto reklamowe gotowe!',
  ads_completed: 'Budżet doładowany — zaczynamy kampanię!',
  content_ready: 'Twoje reklamy są gotowe — zobacz materiały!',
  campaign_launched: '🚀 Kampania {{brandName}} została uruchomiona!',
  budget_not_funded: 'Konto reklamowe wciąż nie zostało doładowane',
  ad_report: 'Raport z kampanii reklamowej — {{period_from}} - {{period_to}}',
  // Etap 5 - Optymalizacja
  optimization_started: 'Etap 5: Optymalizacja — zwiększamy liczbę zamówień',
  reviews_shared: 'Opinie klientów są już widoczne w Twoim sklepie ⭐',
  videos_shared: 'Twoje Reels są już na sklepie 🎬',
  videos_reminder: 'Przypomnienie: czekamy na Twoje nagrania video 🎬',
  videos_skipped: 'Etap nagrań video pominięty — idziemy dalej',
  tools_started: 'Ostatni krok Etapu 5 — narzędzia analityczne 🔧',
  tools_script_received: '{{clientName}} ({{brandName}}) przesłał skrypt {{toolName}} do osadzenia 🔧',
  tools_notes_received: '{{clientName}} ({{brandName}}) wpisał uwagi po analizie sesji 📝',
  tools_completed: 'Etap 5 zakończony — lecimy dalej 🚀',
  analysis_started: 'Hotjar zbiera już sesje — czas na analizę 📊'
}

// Offer flow email types (use special reply-to)
const OFFER_FLOW_TYPES = ['offer_created', 'offer_personal', 'offer_reminder_halfway', 'offer_expired']

// Validate email format
function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false
  // Basic email regex - catches most invalid formats
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}

// Extract first name for reply-to address (e.g. "Tomek Niedzwiecki" -> "tomek")
function getFirstNameForReplyTo(name: string): string {
  const firstName = name.split(' ')[0].toLowerCase()
  // Normalize Polish characters
  return firstName
    .replace(/ą/g, 'a')
    .replace(/ć/g, 'c')
    .replace(/ę/g, 'e')
    .replace(/ł/g, 'l')
    .replace(/ń/g, 'n')
    .replace(/ó/g, 'o')
    .replace(/ś/g, 's')
    .replace(/ź/g, 'z')
    .replace(/ż/g, 'z')
    .replace(/[^a-z]/g, '') // Remove any non-letter characters
}

// Email signature for direct emails
function getEmailSignature(name: string = 'Tomek Niedzwiecki'): string {
  const isMaciej = name.toLowerCase().includes('maciej')
  const photo = isMaciej ? 'mk_kwadrat.png' : 'tn_kwadrat.png'
  const initials = isMaciej ? 'MK' : 'TN'

  return `<br><br><table cellpadding="0" cellspacing="0" border="0" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">
    <tr>
        <td style="background: linear-gradient(135deg, #065f46 0%, #0d9488 100%); padding: 20px 24px; border-radius: 12px;">
            <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                    <td style="vertical-align: top; padding-right: 18px;">
                        <img src="https://tomekniedzwiecki.pl/img/${photo}" width="78" height="78" style="border-radius: 12px; border: 2px solid rgba(255,255,255,0.2); display: block;" alt="${initials}">
                    </td>
                    <td style="vertical-align: middle;">
                        <div style="font-size: 17px; font-weight: 600; color: #fff; margin-bottom: 4px;">${name}</div>
                        <div style="font-size: 13px; color: rgba(255,255,255,0.7); margin-bottom: 12px;">Budujemy i automatyzujemy biznesy online</div>
                        <table cellpadding="0" cellspacing="0" border="0">
                            <tr>
                                <td>
                                    <a href="https://tomekniedzwiecki.pl" style="display: inline-block; font-size: 12px; color: #fff; text-decoration: none; background: rgba(255,255,255,0.18); padding: 6px 14px; border-radius: 6px;">tomekniedzwiecki.pl →</a>
                                </td>
                                <td style="padding-left: 12px;">
                                    <a href="https://www.youtube.com/@TomekNiedzwiecki" style="display: inline-block; width: 22px; height: 22px; line-height: 22px; text-align: center; background: rgba(255,255,255,0.12); border-radius: 50%; color: rgba(255,255,255,0.6); font-size: 9px; font-weight: 600; text-decoration: none;">YT</a>
                                </td>
                                <td style="padding-left: 6px;">
                                    <a href="https://www.instagram.com/tomekniedzwiecki/" style="display: inline-block; width: 22px; height: 22px; line-height: 22px; text-align: center; background: rgba(255,255,255,0.12); border-radius: 50%; color: rgba(255,255,255,0.6); font-size: 9px; font-weight: 600; text-decoration: none;">IG</a>
                                </td>
                                <td style="padding-left: 6px;">
                                    <a href="https://www.linkedin.com/in/tomasz-niedzwiecki/" style="display: inline-block; width: 22px; height: 22px; line-height: 22px; text-align: center; background: rgba(255,255,255,0.12); border-radius: 50%; color: rgba(255,255,255,0.6); font-size: 9px; font-weight: 600; text-decoration: none;">IN</a>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>`
}

// Replace template variables with actual values
function replaceVariables(template: string, data: Record<string, any>): string {
  let result = template

  // Format price if present
  if (data.offerPrice !== undefined) {
    data.offerPrice = typeof data.offerPrice === 'number'
      ? data.offerPrice.toLocaleString('pl-PL')
      : data.offerPrice
  }

  // Format date if present
  if (data.validUntil) {
    try {
      // Handle date-only format (YYYY-MM-DD) by adding time component
      const dateStr = String(data.validUntil)
      const date = dateStr.includes('T') ? new Date(dateStr) : new Date(dateStr + 'T12:00:00')
      if (!isNaN(date.getTime())) {
        data.validUntil = date.toLocaleDateString('pl-PL', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })
      }
    } catch (_e) {
      // Keep original value if parsing fails
    }
  }

  // Replace all {{variable}} patterns
  Object.keys(data).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g')
    result = result.replace(regex, data[key] ?? '')
  })

  return result
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin')
  const corsHeaders = getCorsHeaders(origin)

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('[send-email] Request received')

    const resendApiKey = Deno.env.get('resend_api_key')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!resendApiKey) {
      throw new Error('Brak klucza API Resend')
    }
    console.log('[send-email] Resend API key present')

    const reqBody = await req.json()
    console.log('[send-email] Request type:', reqBody.type || 'direct', 'to:', reqBody.to || reqBody.data?.email || 'N/A')

    // Support two formats:
    // 1. Template-based: { type: 'zapisy_confirmation', data: { email, ... } }
    // 2. Direct: { to, subject, html, lead_id? }

    const supabase = createClient(supabaseUrl!, supabaseServiceKey!)

    // Fetch email domain settings for transactional emails
    const { data: emailDomainSettings } = await supabase
      .from('settings')
      .select('key, value')
      .in('key', ['email_from_name_transactional', 'email_from_transactional', 'email_reply_to'])

    const domainSettingsMap: Record<string, string> = {}
    emailDomainSettings?.forEach(s => { domainSettingsMap[s.key] = s.value })

    const fromNameTransactional = domainSettingsMap.email_from_name_transactional || 'Tomek Niedzwiecki'
    const fromEmailTransactional = domainSettingsMap.email_from_transactional || 'biuro@tomekniedzwiecki.pl'
    const fromAddressTransactional = `${fromNameTransactional} <${fromEmailTransactional}>`
    // Realna skrzynka na odpowiedzi (fallback dla maili do leadów). Patrz komentarz przy reply_to niżej.
    const replyToAddress = domainSettingsMap.email_reply_to || 'ceo@tomekniedzwiecki.pl'

    console.log('[send-email] Using transactional from address:', fromAddressTransactional)

    let finalSubject: string
    let finalBody: string
    let recipientEmail: string
    let leadId: string | null = null
    let senderName: string = fromNameTransactional
    let emailType: string | null = null

    // Track sender's direct email for reply-to
    let senderDirectEmail: string | null = null

    if (reqBody.to && reqBody.subject && reqBody.html) {
      // Direct email format - add signature automatically
      console.log('[send-email] Direct email mode')
      recipientEmail = reqBody.to
      finalSubject = reqBody.subject
      // Add signature for direct emails (skip if no_signature flag is set)
      senderName = reqBody.sender_name || 'Tomek Niedzwiecki'
      finalBody = reqBody.no_signature ? reqBody.html : reqBody.html + getEmailSignature(senderName)
      leadId = reqBody.lead_id || null
      // opcjonalny email_type od callera (np. talk_followup_1) — rozróżnialny w email_messages/lead.html
      emailType = (typeof reqBody.email_type === 'string' && reqBody.email_type.trim()) ? reqBody.email_type.trim().slice(0, 60) : 'direct'

      // Custom reply_to takes priority (for test emails, outreach, etc.)
      if (reqBody.reply_to) {
        senderDirectEmail = reqBody.reply_to
        console.log('[send-email] Using custom reply-to:', senderDirectEmail)
      }
      // If sender_id provided, look up their business email for reply-to
      else if (reqBody.sender_id) {
        const { data: sender } = await supabase
          .from('team_members')
          .select('email')
          .eq('id', reqBody.sender_id)
          .single()

        if (sender?.email) {
          senderDirectEmail = sender.email
          console.log('[send-email] Using sender direct email for reply-to:', senderDirectEmail)
        }
      }
    } else {
      // Template-based format
      const { type, data } = reqBody
      emailType = type
      console.log('[send-email] Template mode, type:', type, 'Email:', data?.email)

      if (!type || !data) {
        throw new Error('Brak wymaganych danych (type, data)')
      }

      if (!data.email) {
        throw new Error('Brak adresu email odbiorcy')
      }

      // Validate email type
      if (!VALID_EMAIL_TYPES.includes(type)) {
        throw new Error(`Nieznany typ emaila: ${type}`)
      }

      if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Brak konfiguracji Supabase')
      }

      recipientEmail = data.email

      // Fetch template from database (REQUIRED)
      const { data: settingsData, error: settingsError } = await supabase
        .from('settings')
        .select('key, value')
        .in('key', [
          `email_template_${type}_subject`,
          `email_template_${type}_body`,
          'email_reply_to',
          'offer_flow_reply_to'
        ])

      if (settingsError) {
        throw new Error(`Błąd pobierania szablonu: ${settingsError.message}`)
      }

      console.log('[send-email] Settings fetched, count:', settingsData?.length)

      const settingsMap: Record<string, string> = {}
      if (settingsData) {
        settingsData.forEach((s: { key: string; value: string }) => {
          settingsMap[s.key] = s.value
        })
      }

      console.log('[send-email] Settings keys:', Object.keys(settingsMap))

      // Subject: from DB or fallback
      const subject = settingsMap[`email_template_${type}_subject`] || FALLBACK_SUBJECTS[type] || 'Wiadomość'

      // Body: MUST be from database
      const body = settingsMap[`email_template_${type}_body`]
      if (!body) {
        console.log('[send-email] ERROR: Template body not found for type:', type)
        throw new Error(`Brak szablonu email "${type}" w ustawieniach. Skonfiguruj szablon w CRM → Ustawienia → Szablony email.`)
      }

      console.log('[send-email] Template found, subject:', subject.substring(0, 50), 'body length:', body.length)

      // Build admin workflow URL (used in admin-notification templates like tools_notes_received)
      const adminUrl = data.adminUrl
        || (data.workflowId ? `https://crm.tomekniedzwiecki.pl/tn-workflow/workflow?id=${data.workflowId}` : '')

      // ── Ad report: CZYSTE LICZBY + LEJEK (klient widzi TYLKO liczby; narracja/diagnoza jest wewnętrzna) ──
      // Decyzja Tomka 2026-06-11: mail = liczby z okresu ułożone w lejek, jak Manus. Zero komentarzy/planów.
      const esc = (s: unknown) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
      const cur = data.currency || 'PLN'
      const purchasesNum = Number(data.purchases) || 0
      const hasVal = (v: unknown) => v !== null && v !== undefined && v !== '' && !(typeof v === 'string' && v.toLowerCase().includes('not available'))
      const numPL = (v: unknown) => Number(v).toLocaleString('pl-PL')
      const moneyPL = (v: unknown) => hasVal(v) ? `${Number(v).toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${cur}` : '—'
      const pctPL = (v: unknown) => hasVal(v) ? `${Number(v).toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} %` : '—'
      const intPL = (v: unknown) => hasVal(v) ? numPL(v) : '—'

      // REKLAMY — metryki z Meta
      const mRow = (label: string, val: string) =>
        `<tr><td style="padding:9px 0;border-bottom:1px solid #1f1f22;color:#a1a1aa;font-size:13px;">${esc(label)}</td><td style="padding:9px 0;border-bottom:1px solid #1f1f22;color:#ffffff;font-size:14px;font-weight:600;text-align:right;">${val}</td></tr>`
      const metricsBlock =
        '<p style="margin:0 0 10px 0;color:#10b981;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;">Reklamy</p>' +
        '<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">' +
        mRow('Wydatki', moneyPL(data.spend)) +
        mRow('Wyświetlenia', intPL(data.impressions)) +
        mRow('Zasięg', intPL(data.reach)) +
        mRow('CTR', pctPL(data.ctr)) +
        mRow('CPC', moneyPL(data.cpc)) +
        mRow('CPM', moneyPL(data.cpm)) +
        '</table>'

      // LEJEK — od wyświetlenia reklamy do zakupu (góra z Meta, środek/dół z pixela sklepu)
      const linkClicks = hasVal(data.link_clicks) ? data.link_clicks : data.clicks
      const funnelRows: Array<[string, unknown]> = [
        ['Wyświetlenia reklam', data.impressions],
        ['Kliknięcia w link', linkClicks],
        ['Wejścia na stronę', data.landing_page_views],
        ['Obejrzeli produkt', data.view_content],
        ['Dodali do koszyka', data.add_to_cart],
        ['Przeszli do kasy', data.initiate_checkout],
        ['Dane dostawy', data.add_shipping_info],
        ['Płatność', data.add_payment_info],
        ['Zakup', data.purchases]
      ]
      const fRow = (label: string, val: unknown, last: boolean) =>
        `<tr><td style="padding:10px 14px;${last ? '' : 'border-bottom:1px solid #1f1f22;'}color:#d4d4d8;font-size:13px;">${esc(label)}</td><td style="padding:10px 14px;${last ? '' : 'border-bottom:1px solid #1f1f22;'}color:#ffffff;font-size:15px;font-weight:700;text-align:right;">${intPL(val)}</td></tr>`
      const funnelBlock =
        '<p style="margin:0 0 10px 0;color:#10b981;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;">Lejek</p>' +
        '<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#141416;border-radius:10px;margin-bottom:28px;">' +
        funnelRows.map(([l, v], i) => fRow(l, v, i === funnelRows.length - 1)).join('') +
        '</table>'

      // PRZYCHÓD / ROAS — tylko gdy są zakupy (decyzja Tomka 2026-06-11)
      const revenueBlock = purchasesNum > 0
        ? '<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;"><tr>'
          + `<td width="50%" style="padding:18px;background:linear-gradient(135deg,#059669,#10b981);border-radius:10px 0 0 10px;"><p style="margin:0 0 4px 0;color:rgba(255,255,255,.8);font-size:11px;text-transform:uppercase;letter-spacing:1px;">Przychód</p><p style="margin:0;color:#fff;font-size:22px;font-weight:700;">${moneyPL(data.revenue)}</p></td>`
          + `<td width="50%" style="padding:18px;background:#0d3d2a;border-radius:0 10px 10px 0;"><p style="margin:0 0 4px 0;color:rgba(255,255,255,.8);font-size:11px;text-transform:uppercase;letter-spacing:1px;">ROAS</p><p style="margin:0;color:#fff;font-size:22px;font-weight:700;">${esc(data.roas ?? '0')}×</p></td>`
          + '</tr></table>'
        : ''

      const reportUrl = data.report_url
        || (data.client_token ? `https://crm.tomekniedzwiecki.pl/client-projekt.html?token=${data.client_token}#raport` : (data.projectUrl || ''))
      const ctaBlock = reportUrl
        ? `<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;"><tr><td align="center"><a href="${esc(reportUrl)}" style="display:inline-block;background:linear-gradient(135deg,#10b981,#059669);color:#ffffff;text-decoration:none;padding:14px 30px;border-radius:8px;font-size:14px;font-weight:600;">Zobacz pełny raport →</a></td></tr></table>`
        : ''

      // Prepare data for variable replacement
      const templateData: Record<string, any> = {
        email: data.email,
        clientName: data.clientName || 'Cześć',
        // Rezerwacja/pełna płatność budowy sklepu (tpay-webhook): prefill WhatsApp
        // (już URL-encoded przez callera) i link do portalu klienta /twoj-biznes?t=…
        waPrefill: data.waPrefill || '',
        portalUrl: data.portalUrl || '',
        brandName: data.brandName || '',
        workflowId: data.workflowId || '',
        adminUrl,
        toolName: data.toolName || '',
        offerName: data.offerName || '',
        offerPrice: data.offerPrice,
        pdfUrl: data.pdfUrl || '',
        offerUrl: data.offerUrl || '',
        validUntil: data.validUntil || '',
        checkoutUrl: data.checkoutUrl || '',
        // Invoice-specific variables
        invoiceNumber: data.invoiceNumber || '',
        amount: data.amount || '',
        description: data.description || '',
        viewUrl: data.viewUrl || '',
        // Contract-specific variables
        projectUrl: data.projectUrl || '',
        contractUrl: data.contractUrl || '',
        // Sales page
        salesPageUrl: data.salesPageUrl || '',
        // TakeDrop
        landingDomain: data.landingDomain || '',
        landingPageUrl: data.landingPageUrl || '',
        gatewayName: data.gatewayName || '',
        // Ad report variables
        client_name: data.client_name || data.clientName || 'Kliencie',
        project_name: data.project_name || data.offerName || '',
        period_from: data.period_from || '',
        period_to: data.period_to || '',
        spend: data.spend || 0,
        revenue: data.revenue || 0,
        roas: data.roas || '0.00',
        purchases: data.purchases || 0,
        clicks: data.clicks || 0,
        impressions: data.impressions || 0,
        add_to_cart: data.add_to_cart || 0,
        initiate_checkout: data.initiate_checkout || 0,
        currency: data.currency || 'PLN',
        client_token: data.client_token || '',
        // Ad report v3 (2026-06-11) — TYLKO liczby + lejek, zero narracji
        metrics_block: metricsBlock,
        funnel_block: funnelBlock,
        revenue_block: revenueBlock,
        cta_block: ctaBlock,
        report_url: reportUrl
      }

      // Replace variables in subject and body
      finalSubject = replaceVariables(subject, templateData)
      finalBody = replaceVariables(body, templateData)

      // For offer_personal, add signature
      if (type === 'offer_personal') {
        senderName = 'Tomek Niedzwiecki'
        finalBody = finalBody + getEmailSignature(senderName)
      }

      // For offer flow emails, use special reply-to
      if (OFFER_FLOW_TYPES.includes(type)) {
        senderDirectEmail = settingsMap['offer_flow_reply_to'] || 'ceo@tomekniedzwiecki.pl'
        console.log('[send-email] Using offer flow reply-to:', senderDirectEmail)
      }
    }

    // Tryb PODGLĄDU — zwróć złożony HTML (z doklejoną stopką/sygnaturą) BEZ wysyłki.
    // Dzięki temu podgląd w panelu jest 1:1 z tym, co dostanie odbiorca.
    if (reqBody.preview === true) {
      return new Response(JSON.stringify({ success: true, preview: true, subject: finalSubject, html: finalBody }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 })
    }

    // Validate recipient email
    if (!isValidEmail(recipientEmail)) {
      throw new Error(`Nieprawidłowy adres email: ${recipientEmail}`)
    }

    // GLOBALNA LISTA WYPISÓW — jeden gate dla WSZYSTKICH silników (followupy talk/bud/spar,
    // drip, automatyzacje, oferty). Wcześniej `email_suppressions` honorował wyłącznie
    // outreach-send, więc człowiek po wypisie albo po RODO (rodo_erase_lead dopisuje go
    // tutaj) dalej dostawał maile. Zwracamy 200, żeby nie wywracać retry w silnikach.
    try {
      const { data: suppressed } = await supabase
        .from('email_suppressions').select('email').ilike('email', recipientEmail.trim()).maybeSingle()
      if (suppressed) {
        console.log('[send-email] Adres na liście wypisów — pomijam:', recipientEmail)
        return new Response(
          JSON.stringify({ success: true, skipped: 'suppressed' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )
      }
    } catch (supErr) {
      console.error('[send-email] Sprawdzenie wypisów nieudane (wysyłam dalej):', supErr)
    }

    // Send via Resend
    const emailPayload: Record<string, any> = {
      from: fromAddressTransactional,
      to: recipientEmail.trim(),
      subject: finalSubject,
      html: finalBody
    }

    // Set reply-to for direct emails
    // Priority: 1) Custom reply_to, 2) Sender's business email, 3) Inbound domain (if lead)
    if (senderDirectEmail) {
      // Use custom or sender's business email
      emailPayload.reply_to = senderDirectEmail
      console.log('[send-email] Reply-to set to:', senderDirectEmail)
    } else if (leadId) {
      // Odpowiedzi na maile do leadów (followupy, drip) lecą na realną skrzynkę = email_reply_to (ceo@tomekniedzwiecki.pl).
      // Wcześniej reply-to szło na {imie}@inbound.tomekniedzwiecki.pl (Resend Inbound → webhook email-inbound),
      // ale webhook przestał odbierać 2026-01-22 i odpowiedzi klientów ginęły. Decyzja Tomka 2026-07-01:
      // niech klienci odpisują wprost na ceo@ — z pominięciem inbound. reply_to == from, więc wątki się kleją.
      emailPayload.reply_to = replyToAddress
      console.log('[send-email] Reply-to set to real mailbox:', emailPayload.reply_to)
    }

    // List-Unsubscribe (opt-in flagą `unsubscribe:true`) — TYLKO dla maili lejka /sklep
    // (bud-followups/bud-drip). CRM (transakcyjne, ofertowe) NIE przekazuje flagi → bez zmian.
    // Zawsze mailto na realną skrzynkę (ceo@ = reply-to followupów). Wariant one-click (RFC 8058)
    // wymaga działającego endpointu https POST — obecnie brak (jedyny „cancel" w bud-drip jest za
    // x-admin-secret, nie publiczny). Gdy caller poda `unsubscribe_url`, dokładamy go + One-Click.
    if (reqBody.unsubscribe === true) {
      const unsubTargets: string[] = []
      if (reqBody.unsubscribe_url) unsubTargets.push(`<${reqBody.unsubscribe_url}>`)
      unsubTargets.push('<mailto:ceo@tomekniedzwiecki.pl?subject=unsubscribe>')
      emailPayload.headers = {
        ...(emailPayload.headers || {}),
        'List-Unsubscribe': unsubTargets.join(', '),
      }
      if (reqBody.unsubscribe_url) {
        emailPayload.headers['List-Unsubscribe-Post'] = 'List-Unsubscribe=One-Click'
      }
      console.log('[send-email] List-Unsubscribe header set:', emailPayload.headers['List-Unsubscribe'])
    }

    console.log('[send-email] Sending to Resend API, to:', recipientEmail)

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailPayload)
    })

    const result = await response.json()

    console.log('[send-email] Resend response:', response.status, JSON.stringify(result))

    if (!response.ok) {
      throw new Error(result.message || 'Błąd wysyłania emaila')
    }

    console.log('[send-email] SUCCESS - email sent, id:', result.id)

    // Save to email_messages table for history
    const sentAt = new Date().toISOString()

    // If lead_id not provided, try to find lead by recipient email
    if (!leadId) {
      const { data: foundLead } = await supabase
        .from('leads')
        .select('id')
        .eq('email', recipientEmail)
        .limit(1)
        .single()

      if (foundLead) {
        leadId = foundLead.id
        console.log('[send-email] Found lead by email:', leadId)
      }
    }

    await supabase
      .from('email_messages')
      .insert({
        direction: 'outbound',
        from_email: fromEmailTransactional,
        from_name: fromNameTransactional,
        to_email: recipientEmail,
        subject: finalSubject,
        body_html: finalBody,
        lead_id: leadId,
        resend_id: result.id,
        status: 'sent',
        sent_at: sentAt,
        email_type: emailType
      })

    return new Response(
      JSON.stringify({ success: true, id: result.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('[send-email] ERROR:', errorMessage, error)
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
