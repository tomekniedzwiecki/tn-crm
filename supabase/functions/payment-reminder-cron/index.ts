import { createClient } from 'jsr:@supabase/supabase-js@2'

const ALLOWED_ORIGINS = [
  'https://crm.tomekniedzwiecki.pl',
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

// Reminder types and their day offsets (negative = before due date, positive = after)
const REMINDER_SCHEDULE = [
  { type: 'before_3d', daysOffset: -3, subject: 'Przypomnienie: rata za 3 dni', priority: 1 },
  { type: 'due_today', daysOffset: 0, subject: 'Dziś termin płatności raty', priority: 2 },
  { type: 'overdue_3d', daysOffset: 3, subject: 'Zaległa płatność - minęły 3 dni', priority: 3 },
  { type: 'overdue_7d', daysOffset: 7, subject: 'Pilne: zaległa rata (7 dni po terminie)', priority: 4 },
]

// Email signature
function getEmailSignature(): string {
  return `<br><br><table cellpadding="0" cellspacing="0" border="0" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;">
    <tr>
        <td style="background: linear-gradient(135deg, #065f46 0%, #0d9488 100%); padding: 20px 24px; border-radius: 12px;">
            <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                    <td style="vertical-align: top; padding-right: 18px;">
                        <img src="https://tomekniedzwiecki.pl/img/tn_kwadrat.png" width="78" height="78" style="border-radius: 12px; border: 2px solid rgba(255,255,255,0.2); display: block;" alt="TN">
                    </td>
                    <td style="vertical-align: middle;">
                        <div style="font-size: 17px; font-weight: 600; color: #fff; margin-bottom: 4px;">Tomek Niedzwiecki</div>
                        <div style="font-size: 13px; color: rgba(255,255,255,0.7); margin-bottom: 12px;">Budujemy i automatyzujemy biznesy online</div>
                        <table cellpadding="0" cellspacing="0" border="0">
                            <tr>
                                <td>
                                    <a href="https://tomekniedzwiecki.pl" style="display: inline-block; font-size: 12px; color: #fff; text-decoration: none; background: rgba(255,255,255,0.18); padding: 6px 14px; border-radius: 6px;">tomekniedzwiecki.pl →</a>
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

// Format currency
function formatCurrency(amount: number): string {
  return amount.toLocaleString('pl-PL') + ' zł'
}

// Format date
function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })
}

// Generate email body based on reminder type
function generateEmailBody(
  reminderType: string,
  clientName: string,
  installmentNumber: number,
  amount: number,
  dueDate: string,
  paymentUrl: string,
  totalInstallments: number,
  paidCount: number
): string {
  const formattedAmount = formatCurrency(amount)
  const formattedDate = formatDate(dueDate)
  const progressText = `(rata ${installmentNumber} z ${totalInstallments}, opłaconych: ${paidCount})`

  let greeting = clientName || 'Cześć'
  let mainMessage = ''
  let urgencyColor = '#f59e0b' // amber
  let buttonText = 'Opłać ratę'

  switch (reminderType) {
    case 'before_3d':
      mainMessage = `Przypominam, że <strong>za 3 dni (${formattedDate})</strong> przypada termin płatności raty nr ${installmentNumber}.`
      break
    case 'due_today':
      mainMessage = `<strong>Dziś (${formattedDate})</strong> przypada termin płatności raty nr ${installmentNumber}.`
      urgencyColor = '#f59e0b'
      break
    case 'overdue_3d':
      mainMessage = `Termin płatności raty nr ${installmentNumber} minął <strong>3 dni temu (${formattedDate})</strong>.`
      urgencyColor = '#ef4444'
      buttonText = 'Opłać zaległą ratę'
      break
    case 'overdue_7d':
      mainMessage = `Termin płatności raty nr ${installmentNumber} minął już <strong>7 dni temu (${formattedDate})</strong>. Proszę o pilne uregulowanie płatności.`
      urgencyColor = '#dc2626'
      buttonText = 'Opłać zaległą ratę teraz'
      break
  }

  return `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <p style="font-size: 16px; color: #333; margin-bottom: 20px;">${greeting},</p>

  <p style="font-size: 16px; color: #333; line-height: 1.6; margin-bottom: 24px;">
    ${mainMessage}
  </p>

  <div style="background: linear-gradient(135deg, ${urgencyColor}15 0%, ${urgencyColor}05 100%); border: 1px solid ${urgencyColor}30; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
    <table cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td style="font-size: 14px; color: #666;">Kwota do zapłaty:</td>
        <td style="text-align: right; font-size: 24px; font-weight: 700; color: ${urgencyColor};">${formattedAmount}</td>
      </tr>
      <tr>
        <td colspan="2" style="padding-top: 8px; font-size: 13px; color: #888;">${progressText}</td>
      </tr>
    </table>
  </div>

  <div style="text-align: center; margin-bottom: 24px;">
    <a href="${paymentUrl}" style="display: inline-block; background: linear-gradient(135deg, ${urgencyColor} 0%, ${urgencyColor}dd 100%); color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
      ${buttonText} →
    </a>
  </div>

  <p style="font-size: 14px; color: #666; line-height: 1.6;">
    Jeśli masz pytania dotyczące płatności, odpowiedz na tego maila.
  </p>
</div>
${getEmailSignature()}`
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin')
  const corsHeaders = getCorsHeaders(origin)

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('[payment-reminder-cron] Starting payment reminders job')

    const resendApiKey = Deno.env.get('resend_api_key')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!resendApiKey) throw new Error('Missing resend_api_key')
    if (!supabaseUrl || !supabaseServiceKey) throw new Error('Missing Supabase config')

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Fetch email settings
    const { data: emailSettings } = await supabase
      .from('settings')
      .select('key, value')
      .in('key', ['email_from_name_transactional', 'email_from_transactional'])

    const settings: Record<string, string> = {}
    emailSettings?.forEach(s => { settings[s.key] = s.value })

    const fromName = settings.email_from_name_transactional || 'Tomek Niedzwiecki'
    const fromEmail = settings.email_from_transactional || 'biuro@tomekniedzwiecki.pl'
    const fromAddress = `${fromName} <${fromEmail}>`

    // Get today's date at midnight for comparison
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Fetch all pending installments with schedule and lead/workflow info
    const { data: pendingInstallments, error: fetchError } = await supabase
      .from('payment_installments')
      .select(`
        *,
        schedule:payment_schedules (
          id,
          lead_id,
          workflow_id,
          total_amount,
          leads:lead_id (id, name, email, company),
          workflows:workflow_id (id, customer_name, customer_email, offer_name)
        )
      `)
      .eq('status', 'pending')
      .order('due_date', { ascending: true })

    if (fetchError) throw new Error(`Error fetching installments: ${fetchError.message}`)

    if (!pendingInstallments || pendingInstallments.length === 0) {
      console.log('[payment-reminder-cron] No pending installments')
      return new Response(
        JSON.stringify({ success: true, message: 'No pending installments', sent: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`[payment-reminder-cron] Found ${pendingInstallments.length} pending installments`)

    let totalSent = 0
    let totalSkipped = 0
    const errors: string[] = []

    for (const installment of pendingInstallments) {
      try {
        const schedule = installment.schedule as any
        if (!schedule) {
          console.log(`[payment-reminder-cron] No schedule for installment ${installment.id}`)
          continue
        }

        // Get client info from lead or workflow
        const lead = schedule.leads
        const workflow = schedule.workflows
        const clientEmail = lead?.email || workflow?.customer_email
        const clientName = lead?.name || lead?.company || workflow?.customer_name || ''

        if (!clientEmail) {
          console.log(`[payment-reminder-cron] No email for installment ${installment.id}`)
          continue
        }

        // Calculate days until/since due date
        const dueDate = new Date(installment.due_date)
        dueDate.setHours(0, 0, 0, 0)
        const daysDiff = Math.round((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

        // Find applicable reminder
        let applicableReminder = null
        for (const reminder of REMINDER_SCHEDULE) {
          // Check if this reminder applies based on days difference
          // before_3d: daysDiff === 3 (3 days before)
          // due_today: daysDiff === 0
          // overdue_3d: daysDiff === -3
          // overdue_7d: daysDiff === -7
          const targetDays = -reminder.daysOffset // Invert: offset -3 means 3 days before (daysDiff +3)

          if (daysDiff === targetDays) {
            // Check if we already sent this reminder
            if (installment.last_reminder_type !== reminder.type) {
              applicableReminder = reminder
              break
            }
          }
        }

        if (!applicableReminder) {
          totalSkipped++
          continue
        }

        console.log(`[payment-reminder-cron] Sending ${applicableReminder.type} to ${clientEmail} for installment ${installment.installment_number}`)

        // Get total installments and paid count for this schedule
        const { data: allInstallments } = await supabase
          .from('payment_installments')
          .select('status')
          .eq('schedule_id', schedule.id)

        const totalInstallments = allInstallments?.length || 1
        const paidCount = allInstallments?.filter(i => i.status === 'paid').length || 0

        // Generate payment URL
        const paymentUrl = `https://crm.tomekniedzwiecki.pl/payment-schedule?schedule=${schedule.id}`

        // Generate email
        const emailBody = generateEmailBody(
          applicableReminder.type,
          clientName,
          installment.installment_number,
          parseFloat(installment.amount),
          installment.due_date,
          paymentUrl,
          totalInstallments,
          paidCount
        )

        // Send email via Resend
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: fromAddress,
            to: clientEmail,
            subject: applicableReminder.subject,
            html: emailBody,
            reply_to: 'ceo@tomekniedzwiecki.pl'
          })
        })

        const emailResult = await emailResponse.json()

        if (!emailResponse.ok) {
          throw new Error(emailResult.message || 'Email send failed')
        }

        // Update installment with reminder sent
        await supabase
          .from('payment_installments')
          .update({
            last_reminder_type: applicableReminder.type,
            last_reminder_sent_at: new Date().toISOString()
          })
          .eq('id', installment.id)

        // Save to email_messages for history
        const leadId = lead?.id || null
        await supabase
          .from('email_messages')
          .insert({
            direction: 'outbound',
            from_email: fromEmail,
            from_name: fromName,
            to_email: clientEmail,
            subject: applicableReminder.subject,
            body_html: emailBody,
            lead_id: leadId,
            resend_id: emailResult.id,
            status: 'sent',
            sent_at: new Date().toISOString(),
            email_type: `payment_reminder_${applicableReminder.type}`
          })

        totalSent++
        console.log(`[payment-reminder-cron] Sent ${applicableReminder.type} reminder to ${clientEmail}`)

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100))

      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        console.error(`[payment-reminder-cron] Error processing installment ${installment.id}:`, errorMessage)
        errors.push(`${installment.id}: ${errorMessage}`)
      }
    }

    console.log(`[payment-reminder-cron] Completed. Sent: ${totalSent}, Skipped: ${totalSkipped}`)

    return new Response(
      JSON.stringify({
        success: true,
        sent: totalSent,
        skipped: totalSkipped,
        errors: errors.length > 0 ? errors : undefined
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('[payment-reminder-cron] ERROR:', errorMessage)
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
