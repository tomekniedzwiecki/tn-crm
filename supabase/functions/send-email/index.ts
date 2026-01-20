import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Valid email types
const VALID_EMAIL_TYPES = ['zapisy_confirmation', 'proforma_generated', 'offer_reminder']

// Fallback subjects only (body MUST come from database)
const FALLBACK_SUBJECTS: Record<string, string> = {
  zapisy_confirmation: 'Dziękuję za zgłoszenie',
  proforma_generated: 'Faktura proforma - {{offerName}}',
  offer_reminder: 'Przypomnienie: oferta wygasa {{validUntil}}'
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
      data.validUntil = new Date(data.validUntil).toLocaleDateString('pl-PL', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    } catch (e) {
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

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const resendApiKey = Deno.env.get('resend_api_key')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!resendApiKey) {
      throw new Error('Brak klucza API Resend')
    }

    const { type, data } = await req.json()

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

    // Fetch template from database (REQUIRED)
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: settingsData, error: settingsError } = await supabase
      .from('settings')
      .select('key, value')
      .in('key', [
        `email_template_${type}_subject`,
        `email_template_${type}_body`,
        'email_reply_to'
      ])

    if (settingsError) {
      throw new Error(`Błąd pobierania szablonu: ${settingsError.message}`)
    }

    const settingsMap: Record<string, string> = {}
    if (settingsData) {
      settingsData.forEach((s: { key: string; value: string }) => {
        settingsMap[s.key] = s.value
      })
    }

    // Subject: from DB or fallback
    const subject = settingsMap[`email_template_${type}_subject`] || FALLBACK_SUBJECTS[type] || 'Wiadomość'

    // Body: MUST be from database
    const body = settingsMap[`email_template_${type}_body`]
    if (!body) {
      throw new Error(`Brak szablonu email "${type}" w ustawieniach. Skonfiguruj szablon w CRM → Ustawienia → Szablony email.`)
    }

    // Prepare data for variable replacement
    const templateData: Record<string, any> = {
      email: data.email,
      clientName: data.clientName || 'Cześć',
      offerName: data.offerName || '',
      offerPrice: data.offerPrice,
      pdfUrl: data.pdfUrl || '',
      offerUrl: data.offerUrl || '',
      validUntil: data.validUntil || ''
    }

    // Replace variables in subject and body
    const finalSubject = replaceVariables(subject, templateData)
    const finalBody = replaceVariables(body, templateData)

    // Get reply-to from settings (optional)
    const replyTo = settingsMap['email_reply_to']

    // Send via Resend
    const emailPayload: Record<string, any> = {
      from: 'Tomek Niedzwiecki <biuro@tomekniedzwiecki.pl>',
      to: data.email,
      subject: finalSubject,
      html: finalBody
    }

    if (replyTo) {
      emailPayload.reply_to = replyTo
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailPayload)
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'Błąd wysyłania emaila')
    }

    return new Response(
      JSON.stringify({ success: true, id: result.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    console.error('Send email error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
