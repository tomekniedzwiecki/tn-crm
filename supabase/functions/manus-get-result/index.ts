import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const MANUS_API_KEY = Deno.env.get('MANUS_API_KEY')
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!MANUS_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: 'MANUS_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { task_id, workflow_id } = await req.json()

    if (!task_id) {
      return new Response(
        JSON.stringify({ success: false, error: 'task_id required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get task details from Manus
    const detailResponse = await fetch(`https://api.manus.ai/v2/task.detail?task_id=${task_id}`, {
      method: 'GET',
      headers: {
        'x-manus-api-key': MANUS_API_KEY,
        'Content-Type': 'application/json',
      },
    })

    const detailData = await detailResponse.json()
    console.log('Manus task detail:', JSON.stringify(detailData, null, 2))

    if (!detailResponse.ok || !detailData.ok) {
      // If task not found, clear the pending status in DB
      if (detailData?.error?.code === 'not_found' && workflow_id) {
        const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)
        await supabase
          .from('workflow_ads')
          .update({
            manus_task_status: 'expired',
            manus_task_error: 'Task not found in Manus - may have expired'
          })
          .eq('workflow_id', workflow_id)
        console.log('Cleared expired task for workflow:', workflow_id)
      }

      return new Response(
        JSON.stringify({ success: false, error: 'Failed to get task detail', details: detailData, status: 'expired' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const task = detailData.task || detailData

    // Check status - Manus uses 'stopped' when agent finishes working
    const isFinished = ['completed', 'done', 'stopped'].includes(task.status)
    if (!isFinished) {
      return new Response(
        JSON.stringify({
          success: true,
          status: task.status,
          message: `Task is ${task.status}`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get task messages to extract the result
    const messagesResponse = await fetch(`https://api.manus.ai/v2/task.listMessages?task_id=${task_id}&limit=50`, {
      method: 'GET',
      headers: {
        'x-manus-api-key': MANUS_API_KEY,
        'Content-Type': 'application/json',
      },
    })

    const messagesData = await messagesResponse.json()
    console.log('Manus messages:', JSON.stringify(messagesData, null, 2))

    // Find the last assistant message with the result
    const messages = messagesData.messages || messagesData.data || []
    let result = ''

    console.log('Total messages:', messages.length)
    console.log('Message roles:', messages.map((m: any) => m.role).join(', '))

    // Look for assistant messages that might contain JSON (use spread to not mutate original)
    for (const msg of [...messages].reverse()) {
      if (msg.role === 'assistant' && msg.content) {
        const content = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)
        console.log('Assistant message preview:', content.substring(0, 200))
        if (content.includes('{') && content.includes('}')) {
          result = content
          console.log('Found JSON-like content in assistant message')
          break
        }
      }
    }

    // Fallback to last message
    if (!result && messages.length > 0) {
      const lastMsg = messages[messages.length - 1]
      result = typeof lastMsg.content === 'string' ? lastMsg.content : JSON.stringify(lastMsg.content)
      console.log('Using fallback - last message content:', result?.substring(0, 200))
    }

    // Try to parse JSON from result
    let reportData = null
    console.log('Raw result length:', result?.length || 0)
    console.log('Raw result preview:', result?.substring(0, 500))

    try {
      // Find balanced JSON object by counting braces
      let depth = 0
      let start = -1
      let end = -1
      for (let i = 0; i < result.length; i++) {
        if (result[i] === '{') {
          if (depth === 0) start = i
          depth++
        } else if (result[i] === '}') {
          depth--
          if (depth === 0 && start !== -1) {
            end = i + 1
            break
          }
        }
      }

      console.log('JSON bounds:', start, end)

      if (start !== -1 && end !== -1) {
        const jsonStr = result.substring(start, end)
        console.log('Extracted JSON:', jsonStr.substring(0, 300))
        reportData = JSON.parse(jsonStr)

        // Normalize numeric fields to ensure they're numbers, not strings
        const numericFields = ['spend', 'revenue', 'roas', 'impressions', 'clicks', 'ctr', 'cpc',
                               'add_to_cart', 'initiate_checkout', 'purchases', 'conversion_rate', 'cost_per_purchase',
                               'cpm', 'reach', 'frequency', 'link_clicks', 'landing_page_views']
        for (const field of numericFields) {
          if (reportData[field] !== undefined) {
            reportData[field] = Number(reportData[field]) || 0
          }
        }
        console.log('Parsed reportData keys:', Object.keys(reportData))
      } else {
        // No JSON found - save raw result for debugging
        console.log('No JSON braces found in result')
        reportData = {
          raw_result: result || '(empty)',
          parse_error: true,
          error_reason: 'no_json_found',
          status: task.status
        }
      }
    } catch (parseErr) {
      console.error('Error parsing result:', parseErr)
      // Store raw result if can't parse
      reportData = {
        raw_result: result || '(empty)',
        parse_error: true,
        error_reason: parseErr.message,
        status: task.status
      }
    }

    // Add metadata
    if (reportData) {
      reportData.source = 'manus'
      reportData.fetched_at = new Date().toISOString()
      reportData.manus_task_id = task_id
    }

    // Update database if workflow_id provided
    if (workflow_id) {
      const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

      // Zapisz bieżący raport w workflow_ads
      const { error: updateError } = await supabase
        .from('workflow_ads')
        .update({
          report_data: reportData,
          report_generated_at: new Date().toISOString(),
          manus_task_status: 'completed'
        })
        .eq('workflow_id', workflow_id)

      if (updateError) {
        console.error('Error updating workflow_ads:', updateError)
      }

      // Zapisz do historii raportów
      if (reportData && !reportData.parse_error) {
        const periodFrom = reportData.period?.from || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        const periodTo = reportData.period?.to || new Date().toISOString().split('T')[0]

        const { data: historyRecord, error: historyError } = await supabase
          .from('workflow_ad_reports')
          .insert({
            workflow_id,
            report_data: reportData,
            period_from: periodFrom,
            period_to: periodTo,
            spend: reportData.spend || 0,
            revenue: reportData.revenue || 0,
            roas: reportData.roas || 0,
            purchases: reportData.purchases || reportData.conversions || 0,
            manus_task_id: task_id
          })
          .select()
          .single()

        if (historyError) {
          console.error('Error saving to history:', historyError)
        } else {
          console.log('Saved report to history:', historyRecord.id)

          // Sprawdź czy auto-raporty są włączone i wyślij email
          const { data: adsData } = await supabase
            .from('workflow_ads')
            .select('auto_reports_enabled')
            .eq('workflow_id', workflow_id)
            .single()

          if (adsData?.auto_reports_enabled) {
            // Pobierz dane workflow i klienta
            const { data: workflow } = await supabase
              .from('workflows')
              .select('id, offer_name, customer_email, customer_name, unique_token')
              .eq('id', workflow_id)
              .single()

            if (workflow?.customer_email) {
              // Wyślij email z raportem
              try {
                const emailResponse = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    to: workflow.customer_email,
                    template: 'ad_report',
                    data: {
                      client_name: workflow.customer_name || 'Kliencie',
                      project_name: workflow.offer_name,
                      period_from: periodFrom,
                      period_to: periodTo,
                      spend: reportData.spend || 0,
                      revenue: reportData.revenue || 0,
                      roas: Number(reportData.roas || 0).toFixed(2),
                      purchases: reportData.purchases || reportData.conversions || 0,
                      clicks: reportData.clicks || 0,
                      impressions: reportData.impressions || 0,
                      add_to_cart: reportData.add_to_cart || 0,
                      initiate_checkout: reportData.initiate_checkout || 0,
                      currency: reportData.currency || 'PLN',
                      report_id: historyRecord.id,
                      workflow_id: workflow_id,
                      client_token: workflow.unique_token || ''
                    }
                  })
                })

                // Sprawdź czy email się wysłał
                if (!emailResponse.ok) {
                  console.error('Email send failed:', await emailResponse.text())
                  throw new Error('Email send failed')
                }

                // Oznacz raport jako wysłany
                await supabase
                  .from('workflow_ad_reports')
                  .update({
                    sent_to_client: true,
                    sent_at: new Date().toISOString()
                  })
                  .eq('id', historyRecord.id)

                console.log('Report email sent to:', workflow.customer_email)
              } catch (emailErr) {
                console.error('Error sending report email:', emailErr)
              }
            }
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        status: task.status,
        report_data: reportData
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
