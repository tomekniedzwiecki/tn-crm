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

interface WorkflowStageRequest {
  workflow_id: string
  milestone_id: string
  milestone_title: string
  milestone_index: number
  total_milestones: number
  // Optional: skip automation and send email directly (for backward compatibility)
  skip_automation?: boolean
}

// Email signature
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
                                    <a href="https://tomekniedzwiecki.pl" style="display: inline-block; font-size: 12px; color: #fff; text-decoration: none; background: rgba(255,255,255,0.18); padding: 6px 14px; border-radius: 6px;">tomekniedzwiecki.pl &rarr;</a>
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

// Replace template variables
function replaceVariables(template: string, data: Record<string, any>): string {
  let result = template

  // Replace all {{variable}} patterns
  Object.keys(data).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g')
    result = result.replace(regex, data[key] ?? '')
  })

  return result
}

// Default email templates
const DEFAULT_SUBJECT = 'Etap {{stageNumber}} zakonczony: {{stageName}}'
const DEFAULT_BODY = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <div style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 15px 25px; border-radius: 12px;">
      <span style="font-size: 24px; font-weight: bold; color: white;">Etap {{stageNumber}}/{{totalStages}} ukonczony!</span>
    </div>
  </div>

  <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
    Czesc {{clientName}}!
  </p>

  <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
    Swietna wiadomosc - zakonczylismy etap <strong>{{stageName}}</strong> w Twoim projekcie!
  </p>

  <!-- Progress Bar -->
  <div style="background: #f3f4f6; border-radius: 10px; padding: 20px; margin-bottom: 25px;">
    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
      <span style="font-size: 14px; color: #6b7280;">Postep projektu</span>
      <span style="font-size: 14px; font-weight: 600; color: #374151;">{{progressPercent}}%</span>
    </div>
    <div style="background: #e5e7eb; border-radius: 5px; height: 10px; overflow: hidden;">
      <div style="background: linear-gradient(90deg, #10b981 0%, #059669 100%); height: 100%; width: {{progressPercent}}%; border-radius: 5px;"></div>
    </div>
  </div>

  <p style="font-size: 16px; color: #374151; margin-bottom: 25px;">
    Sprawdz szczegoly i aktualny stan prac w swoim panelu:
  </p>

  <div style="text-align: center; margin-bottom: 30px;">
    <a href="{{projectUrl}}" style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 600; font-size: 16px;">
      Zobacz postep projektu &rarr;
    </a>
  </div>

  {{signature}}
</div>
`

Deno.serve(async (req) => {
  const origin = req.headers.get('origin')
  const corsHeaders = getCorsHeaders(origin)

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('[workflow-stage-completed] Processing request')

    const resendApiKey = Deno.env.get('resend_api_key')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!resendApiKey) {
      throw new Error('Missing resend_api_key')
    }
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase config')
    }

    const body: WorkflowStageRequest = await req.json()
    const { workflow_id, milestone_id, milestone_title, milestone_index, total_milestones, skip_automation } = body

    if (!workflow_id || !milestone_id) {
      throw new Error('Missing workflow_id or milestone_id')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Fetch workflow details
    const { data: workflow, error: workflowError } = await supabase
      .from('workflows')
      .select('*')
      .eq('id', workflow_id)
      .single()

    if (workflowError || !workflow) {
      throw new Error('Workflow not found')
    }

    // Calculate progress
    const { data: allTasks } = await supabase
      .from('workflow_tasks')
      .select('id, completed')
      .eq('workflow_id', workflow_id)

    const totalTasks = allTasks?.length || 0
    const completedTasks = allTasks?.filter(t => t.completed).length || 0
    const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    // Prepare context data for automation
    const projectUrl = `https://crm.tomekniedzwiecki.pl/projekt/${workflow.unique_token}`
    const clientName = workflow.customer_name || workflow.customer_company || 'Kliencie'

    const automationContext = {
      email: workflow.customer_email,
      clientName,
      customer_name: clientName,
      stageName: milestone_title,
      milestone_title,
      stageNumber: milestone_index + 1,
      totalStages: total_milestones,
      progressPercent,
      progress_percent: progressPercent,
      projectUrl,
      project_url: projectUrl,
      offerName: workflow.offer_name,
      offer_name: workflow.offer_name,
      workflow_id,
      milestone_id
    }

    // Try to trigger automation system first (unless skip_automation is set)
    if (!skip_automation) {
      console.log('[workflow-stage-completed] Triggering automation system')

      try {
        const triggerResponse = await fetch(
          `${supabaseUrl}/functions/v1/automation-trigger`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseServiceKey}`
            },
            body: JSON.stringify({
              trigger_type: 'stage_completed',
              entity_type: 'workflow_milestone',
              entity_id: milestone_id,
              context: automationContext,
              filters: {
                milestone_title // Allow filtering by stage name
              }
            })
          }
        )

        const triggerResult = await triggerResponse.json()
        console.log('[workflow-stage-completed] Automation trigger result:', triggerResult)

        if (triggerResult.success && triggerResult.created > 0) {
          // Automation will handle the email
          return new Response(
            JSON.stringify({
              success: true,
              message: 'Automation triggered',
              executions_created: triggerResult.created
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // No automation was triggered (no active flows)
        console.log('[workflow-stage-completed] No active automation, falling back to direct email')
      } catch (triggerError) {
        console.error('[workflow-stage-completed] Automation trigger failed:', triggerError)
        // Fall back to direct email sending
      }
    }

    // Direct email sending (fallback or when skip_automation=true)
    console.log('[workflow-stage-completed] Sending email directly')

    // Fetch email settings
    const { data: emailSettings } = await supabase
      .from('settings')
      .select('key, value')
      .in('key', [
        'email_from_name_transactional',
        'email_from_transactional',
        'offer_flow_reply_to',
        'email_template_workflow_stage_completed_subject',
        'email_template_workflow_stage_completed_body'
      ])

    const settings: Record<string, string> = {}
    emailSettings?.forEach(s => { settings[s.key] = s.value })

    const fromName = settings.email_from_name_transactional || 'Tomek Niedzwiecki'
    const fromEmail = settings.email_from_transactional || 'biuro@tomekniedzwiecki.pl'
    const fromAddress = `${fromName} <${fromEmail}>`
    const replyTo = settings.offer_flow_reply_to || 'ceo@tomekniedzwiecki.pl'

    const templateData = {
      clientName,
      stageName: milestone_title,
      stageNumber: milestone_index + 1,
      totalStages: total_milestones,
      progressPercent,
      projectUrl,
      offerName: workflow.offer_name,
      signature: getEmailSignature(fromName)
    }

    // Get templates or use defaults
    const subjectTemplate = settings.email_template_workflow_stage_completed_subject || DEFAULT_SUBJECT
    const bodyTemplate = settings.email_template_workflow_stage_completed_body || DEFAULT_BODY

    const subject = replaceVariables(subjectTemplate, templateData)
    const body_html = replaceVariables(bodyTemplate, templateData)

    // Send email via Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: fromAddress,
        to: workflow.customer_email,
        subject: subject,
        html: body_html,
        reply_to: replyTo
      })
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'Resend API error')
    }

    console.log(`[workflow-stage-completed] Email sent to ${workflow.customer_email}`)

    // Try to find lead by customer email
    let leadId: string | null = null
    const { data: foundLead } = await supabase
      .from('leads')
      .select('id')
      .eq('email', workflow.customer_email)
      .limit(1)
      .single()

    if (foundLead) {
      leadId = foundLead.id
    }

    // Log to email_messages
    await supabase
      .from('email_messages')
      .insert({
        direction: 'outbound',
        from_email: fromEmail,
        from_name: fromName,
        to_email: workflow.customer_email,
        subject: subject,
        body_html: body_html,
        lead_id: leadId,
        resend_id: result.id,
        status: 'sent',
        sent_at: new Date().toISOString(),
        email_type: 'workflow_stage_completed'
      })

    return new Response(
      JSON.stringify({ success: true, message: 'Email sent directly' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('[workflow-stage-completed] ERROR:', errorMessage)
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
