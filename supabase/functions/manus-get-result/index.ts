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

    // Look for assistant messages that might contain JSON
    for (const msg of messages.reverse()) {
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
      // Look for JSON in the result
      const jsonMatch = result.match(/\{[\s\S]*\}/)
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

      const { error: updateError } = await supabase
        .from('workflow_ads')
        .update({
          report_data: reportData,
          report_generated_at: new Date().toISOString(),
          manus_task_status: 'completed'
        })
        .eq('workflow_id', workflow_id)

      if (updateError) {
        console.error('Error updating database:', updateError)
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
