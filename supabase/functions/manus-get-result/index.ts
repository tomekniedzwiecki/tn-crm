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
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to get task detail', details: detailData }),
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

    // Look for assistant messages that might contain JSON (use spread to not mutate original)
    for (const msg of [...messages].reverse()) {
      if (msg.role === 'assistant' && msg.content) {
        const content = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)
        if (content.includes('{') && content.includes('}')) {
          result = content
          break
        }
      }
    }

    // Fallback to last message
    if (!result && messages.length > 0) {
      const lastMsg = messages[messages.length - 1]
      result = typeof lastMsg.content === 'string' ? lastMsg.content : JSON.stringify(lastMsg.content)
    }

    // Try to parse JSON from result
    let reportData = null
    try {
      // Look for JSON in the result (non-greedy to get first complete JSON object)
      const jsonMatch = result.match(/\{[\s\S]*?\}/)
      if (jsonMatch) {
        reportData = JSON.parse(jsonMatch[0])
      }
    } catch (parseErr) {
      console.error('Error parsing result:', parseErr)
      // Store raw result if can't parse
      reportData = {
        raw_result: result,
        parse_error: true,
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

                console.log('Report email sent to:', workflow.client_email)
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
