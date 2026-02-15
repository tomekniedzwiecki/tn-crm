import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AutomationStep {
  id: string
  flow_id: string
  step_order: number
  step_type: 'action' | 'condition' | 'delay'
  config: {
    action_type?: string
    email_type?: string
    delay_value?: number
    delay_unit?: 'hours' | 'days' | 'weeks'
    field?: string
    operator?: string
    value?: any
  }
  next_step_on_true?: string
  next_step_on_false?: string
}

interface AutomationExecution {
  id: string
  flow_id: string
  entity_type: string
  entity_id: string
  status: string
  current_step_id: string | null
  scheduled_for: string | null
  logs: any[]
  context: Record<string, any>
}

interface AutomationFlow {
  id: string
  name: string
  trigger_type: string
  is_active: boolean
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    console.log('[automation-executor] Starting execution cycle')

    // Check if automations are globally enabled
    const { data: masterSetting } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'automations_master_enabled')
      .single()

    if (masterSetting?.value !== 'true') {
      console.log('[automation-executor] Automations are globally disabled')
      return new Response(
        JSON.stringify({ success: true, message: 'Automations disabled', processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Find executions ready to process
    // status = 'pending' (new) or 'waiting' (after delay) AND scheduled_for <= NOW()
    const { data: executions, error: execError } = await supabase
      .from('automation_executions')
      .select(`
        id, flow_id, entity_type, entity_id, status, current_step_id,
        scheduled_for, logs, context
      `)
      .in('status', ['pending', 'waiting'])
      .or('scheduled_for.is.null,scheduled_for.lte.now()')
      .limit(50) // Process max 50 per cycle

    if (execError) {
      throw new Error(`Failed to fetch executions: ${execError.message}`)
    }

    console.log(`[automation-executor] Found ${executions?.length || 0} executions to process`)

    let processed = 0
    const results: any[] = []

    for (const execution of executions || []) {
      try {
        const result = await processExecution(supabase, execution)
        results.push({ id: execution.id, result })
        processed++
      } catch (err) {
        console.error(`[automation-executor] Error processing ${execution.id}:`, err)

        // Log error to execution
        await supabase
          .from('automation_executions')
          .update({
            status: 'failed',
            logs: [...(execution.logs || []), {
              timestamp: new Date().toISOString(),
              action: 'error',
              error: err instanceof Error ? err.message : 'Unknown error'
            }]
          })
          .eq('id', execution.id)

        results.push({ id: execution.id, error: err instanceof Error ? err.message : 'Unknown error' })
      }
    }

    console.log(`[automation-executor] Processed ${processed} executions`)

    return new Response(
      JSON.stringify({ success: true, processed, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[automation-executor] Critical error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

async function processExecution(supabase: any, execution: AutomationExecution): Promise<string> {
  console.log(`[automation-executor] Processing execution ${execution.id}`)

  // Get flow and check if active
  const { data: flow, error: flowError } = await supabase
    .from('automation_flows')
    .select('id, name, trigger_type, is_active')
    .eq('id', execution.flow_id)
    .single()

  if (flowError || !flow) {
    throw new Error(`Flow not found: ${execution.flow_id}`)
  }

  if (!flow.is_active) {
    // Cancel execution if flow was deactivated
    await supabase
      .from('automation_executions')
      .update({
        status: 'cancelled',
        logs: [...(execution.logs || []), {
          timestamp: new Date().toISOString(),
          action: 'cancelled',
          reason: 'Flow deactivated'
        }]
      })
      .eq('id', execution.id)
    return 'cancelled - flow inactive'
  }

  // Get all steps for this flow
  const { data: steps, error: stepsError } = await supabase
    .from('automation_steps')
    .select('*')
    .eq('flow_id', execution.flow_id)
    .order('step_order', { ascending: true })

  if (stepsError || !steps || steps.length === 0) {
    throw new Error(`No steps found for flow: ${execution.flow_id}`)
  }

  // Determine current step
  let currentStep: AutomationStep | null = null
  let currentStepIndex = 0

  if (execution.current_step_id) {
    // Find step by ID
    currentStep = steps.find((s: AutomationStep) => s.id === execution.current_step_id)
    if (currentStep) {
      currentStepIndex = steps.findIndex((s: AutomationStep) => s.id === currentStep!.id)
    }
  } else {
    // Start from first step
    currentStep = steps[0]
    currentStepIndex = 0

    // Mark as started
    await supabase
      .from('automation_executions')
      .update({
        status: 'running',
        started_at: new Date().toISOString(),
        current_step_id: currentStep.id,
        logs: [...(execution.logs || []), {
          timestamp: new Date().toISOString(),
          action: 'started',
          step_id: currentStep.id
        }]
      })
      .eq('id', execution.id)
  }

  if (!currentStep) {
    throw new Error('Could not determine current step')
  }

  // Process current step
  const stepResult = await processStep(supabase, execution, currentStep, steps)

  // Handle step result
  if (stepResult.nextStepId) {
    // Move to specific step (from condition)
    const nextStep = steps.find((s: AutomationStep) => s.id === stepResult.nextStepId)
    if (nextStep) {
      await supabase
        .from('automation_executions')
        .update({
          current_step_id: nextStep.id,
          scheduled_for: stepResult.scheduledFor || null,
          status: stepResult.status || 'running',
          logs: [...(execution.logs || []), stepResult.log]
        })
        .eq('id', execution.id)
      return `moved to step ${nextStep.step_order}`
    }
  }

  if (stepResult.status === 'waiting') {
    // Delay step - schedule for later
    await supabase
      .from('automation_executions')
      .update({
        status: 'waiting',
        scheduled_for: stepResult.scheduledFor,
        current_step_id: steps[currentStepIndex + 1]?.id || currentStep.id,
        logs: [...(execution.logs || []), stepResult.log]
      })
      .eq('id', execution.id)
    return `waiting until ${stepResult.scheduledFor}`
  }

  // Check if there's a next step
  const nextStepIndex = currentStepIndex + 1
  if (nextStepIndex < steps.length) {
    // Continue to next step
    await supabase
      .from('automation_executions')
      .update({
        current_step_id: steps[nextStepIndex].id,
        logs: [...(execution.logs || []), stepResult.log]
      })
      .eq('id', execution.id)
    return `moved to step ${nextStepIndex}`
  }

  // No more steps - completed
  await supabase
    .from('automation_executions')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      logs: [...(execution.logs || []), stepResult.log, {
        timestamp: new Date().toISOString(),
        action: 'completed'
      }]
    })
    .eq('id', execution.id)

  return 'completed'
}

async function processStep(
  supabase: any,
  execution: AutomationExecution,
  step: AutomationStep,
  allSteps: AutomationStep[]
): Promise<{
  status?: string
  scheduledFor?: string
  nextStepId?: string
  log: any
}> {
  const timestamp = new Date().toISOString()

  console.log(`[automation-executor] Processing step ${step.step_order} (${step.step_type})`)

  switch (step.step_type) {
    case 'action':
      return await processActionStep(supabase, execution, step, timestamp)

    case 'delay':
      return processDelayStep(step, timestamp)

    case 'condition':
      return await processConditionStep(supabase, execution, step, allSteps, timestamp)

    default:
      throw new Error(`Unknown step type: ${step.step_type}`)
  }
}

async function processActionStep(
  supabase: any,
  execution: AutomationExecution,
  step: AutomationStep,
  timestamp: string
): Promise<{ log: any }> {
  const { action_type, email_type } = step.config

  if (action_type === 'send_email' && email_type) {
    console.log(`[automation-executor] Sending email type: ${email_type}`)

    // Build email data from context
    const context = execution.context || {}

    const emailData = {
      email: context.email,
      clientName: context.clientName || context.customer_name,
      offerName: context.offerName || context.offer_name,
      offerPrice: context.offerPrice || context.amount,
      validUntil: context.validUntil || context.valid_until,
      offerUrl: context.offerUrl || context.offer_url,
      projectUrl: context.projectUrl || context.project_url,
      // Workflow specific
      milestoneName: context.milestone_title,
      progressPercent: context.progress_percent,
      reportTitle: context.reportTitle,
      salesPageUrl: context.salesPageUrl,
      // Contract specific
      contractUrl: context.contractUrl,
      // Invoice specific
      invoiceNumber: context.invoiceNumber,
      amount: context.amount,
      description: context.description,
      pdfUrl: context.pdfUrl,
      viewUrl: context.viewUrl
    }

    // Call send-email function
    const response = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/functions/v1/send-email`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
        },
        body: JSON.stringify({
          type: email_type,
          data: emailData
        })
      }
    )

    const result = await response.json()

    if (!response.ok) {
      throw new Error(`Email sending failed: ${result.error || 'Unknown error'}`)
    }

    console.log(`[automation-executor] Email sent successfully: ${result.id}`)

    // Update email_messages with automation reference
    if (result.id) {
      await supabase
        .from('email_messages')
        .update({
          automation_flow_id: execution.flow_id,
          automation_execution_id: execution.id
        })
        .eq('resend_id', result.id)
    }

    return {
      log: {
        timestamp,
        action: 'send_email',
        email_type,
        resend_id: result.id,
        success: true
      }
    }
  }

  // Share products action
  if (action_type === 'share_products') {
    console.log(`[automation-executor] Sharing products for workflow`)

    const workflowId = execution.entity_id

    if (execution.entity_type !== 'workflow') {
      throw new Error('share_products action requires entity_type=workflow')
    }

    // Check if already shared
    const { data: workflow } = await supabase
      .from('workflows')
      .select('id, products_shared_at, customer_email, customer_name, unique_token')
      .eq('id', workflowId)
      .single()

    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`)
    }

    if (workflow.products_shared_at) {
      console.log(`[automation-executor] Products already shared for ${workflowId}, skipping`)
      return {
        log: {
          timestamp,
          action: 'share_products',
          skipped: true,
          reason: 'already_shared'
        }
      }
    }

    // Update workflow
    const now = new Date().toISOString()
    const { error: updateError } = await supabase
      .from('workflows')
      .update({ products_shared_at: now })
      .eq('id', workflowId)

    if (updateError) {
      throw new Error(`Failed to update workflow: ${updateError.message}`)
    }

    // Log activity
    await supabase
      .from('workflow_activities')
      .insert({
        workflow_id: workflowId,
        action: 'products_shared',
        description: 'Produkty udostępnione automatycznie',
        metadata: { auto: true, automation_execution_id: execution.id }
      })

    // Trigger products_shared automation (for email)
    const clientName = (workflow.customer_name || '').split(' ')[0] || 'Cześć'
    const projectUrl = `https://crm.tomekniedzwiecki.pl/projekt/${workflow.unique_token}#produkty`

    try {
      await fetch(
        `${Deno.env.get('SUPABASE_URL')}/functions/v1/automation-trigger`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
          },
          body: JSON.stringify({
            trigger_type: 'products_shared',
            entity_type: 'workflow',
            entity_id: workflowId,
            context: {
              email: workflow.customer_email,
              clientName,
              projectUrl
            }
          })
        }
      )
    } catch (triggerError) {
      console.error(`[automation-executor] Failed to trigger products_shared:`, triggerError)
      // Don't throw - products are shared, email trigger failure is not critical
    }

    console.log(`[automation-executor] Products shared successfully for ${workflowId}`)

    return {
      log: {
        timestamp,
        action: 'share_products',
        workflow_id: workflowId,
        success: true
      }
    }
  }

  throw new Error(`Unknown action type: ${action_type}`)
}

function processDelayStep(
  step: AutomationStep,
  timestamp: string
): { status: string; scheduledFor: string; log: any } {
  const { delay_value = 1, delay_unit = 'days' } = step.config

  const now = new Date()
  let scheduledFor: Date

  switch (delay_unit) {
    case 'hours':
      scheduledFor = new Date(now.getTime() + delay_value * 60 * 60 * 1000)
      break
    case 'days':
      scheduledFor = new Date(now.getTime() + delay_value * 24 * 60 * 60 * 1000)
      break
    case 'weeks':
      scheduledFor = new Date(now.getTime() + delay_value * 7 * 24 * 60 * 60 * 1000)
      break
    default:
      scheduledFor = new Date(now.getTime() + delay_value * 24 * 60 * 60 * 1000)
  }

  console.log(`[automation-executor] Delay: ${delay_value} ${delay_unit}, scheduled for ${scheduledFor.toISOString()}`)

  return {
    status: 'waiting',
    scheduledFor: scheduledFor.toISOString(),
    log: {
      timestamp,
      action: 'delay',
      delay_value,
      delay_unit,
      scheduled_for: scheduledFor.toISOString()
    }
  }
}

async function processConditionStep(
  supabase: any,
  execution: AutomationExecution,
  step: AutomationStep,
  allSteps: AutomationStep[],
  timestamp: string
): Promise<{ nextStepId?: string; log: any }> {
  const { field, operator, value } = step.config
  let conditionResult = false

  console.log(`[automation-executor] Evaluating condition: ${field} ${operator} ${value}`)

  switch (field) {
    case 'has_purchased':
      // Check if lead has made a purchase
      const context = execution.context || {}
      const leadEmail = context.email

      if (leadEmail) {
        // Check for paid orders with this email
        const { data: orders } = await supabase
          .from('orders')
          .select('id')
          .eq('customer_email', leadEmail)
          .eq('status', 'paid')
          .limit(1)

        const hasPurchased = orders && orders.length > 0
        conditionResult = evaluateCondition(hasPurchased, operator, value)
        console.log(`[automation-executor] has_purchased check: ${hasPurchased}, condition result: ${conditionResult}`)
      }
      break

    case 'email_opened':
      // Check if specific email was opened
      const { data: emails } = await supabase
        .from('email_messages')
        .select('opened_at')
        .eq('automation_execution_id', execution.id)
        .not('opened_at', 'is', null)
        .limit(1)

      const emailOpened = emails && emails.length > 0
      conditionResult = evaluateCondition(emailOpened, operator, value)
      console.log(`[automation-executor] email_opened check: ${emailOpened}, condition result: ${conditionResult}`)
      break

    case 'days_since_trigger':
      // Check how many days since execution started
      const startedAt = execution.context?.triggered_at || execution.context?.created_at
      if (startedAt) {
        const daysSince = Math.floor((Date.now() - new Date(startedAt).getTime()) / (24 * 60 * 60 * 1000))
        conditionResult = evaluateCondition(daysSince, operator, value)
        console.log(`[automation-executor] days_since_trigger: ${daysSince}, condition result: ${conditionResult}`)
      }
      break

    default:
      console.warn(`[automation-executor] Unknown condition field: ${field}`)
      conditionResult = false
  }

  // Determine next step based on condition result
  let nextStepId: string | undefined

  if (conditionResult && step.next_step_on_true) {
    nextStepId = step.next_step_on_true
  } else if (!conditionResult && step.next_step_on_false) {
    nextStepId = step.next_step_on_false
  }

  // If no explicit branch, find next step by order
  if (!nextStepId) {
    const currentIndex = allSteps.findIndex(s => s.id === step.id)
    const nextStep = allSteps[currentIndex + 1]
    if (nextStep && conditionResult) {
      nextStepId = nextStep.id
    }
  }

  return {
    nextStepId,
    log: {
      timestamp,
      action: 'condition',
      field,
      operator,
      value,
      result: conditionResult,
      next_step_id: nextStepId
    }
  }
}

function evaluateCondition(actual: any, operator: string, expected: any): boolean {
  switch (operator) {
    case 'eq':
      return actual === expected
    case 'neq':
      return actual !== expected
    case 'gt':
      return actual > expected
    case 'gte':
      return actual >= expected
    case 'lt':
      return actual < expected
    case 'lte':
      return actual <= expected
    default:
      return false
  }
}
