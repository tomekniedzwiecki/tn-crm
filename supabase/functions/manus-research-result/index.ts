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

    // Sprawdź status taska w Manus
    const detailResponse = await fetch(`https://api.manus.ai/v2/task.detail?task_id=${task_id}`, {
      method: 'GET',
      headers: {
        'x-manus-api-key': MANUS_API_KEY,
        'Content-Type': 'application/json',
      },
    })

    const detailData = await detailResponse.json()

    if (!detailResponse.ok || !detailData.ok) {
      if (detailData?.error?.code === 'not_found' && workflow_id) {
        const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)
        await supabase
          .from('workflow_ads')
          .update({
            competitor_research_status: 'expired',
          })
          .eq('workflow_id', workflow_id)
      }
      return new Response(
        JSON.stringify({ success: false, error: 'Task not found', status: 'expired' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const task = detailData.task || detailData
    const isFinished = ['completed', 'done', 'stopped'].includes(task.status)

    if (!isFinished) {
      return new Response(
        JSON.stringify({ success: true, status: task.status, message: `Task is ${task.status}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Pobierz wiadomości z taska
    const messagesResponse = await fetch(`https://api.manus.ai/v2/task.listMessages?task_id=${task_id}&limit=50`, {
      method: 'GET',
      headers: {
        'x-manus-api-key': MANUS_API_KEY,
        'Content-Type': 'application/json',
      },
    })

    const messagesData = await messagesResponse.json()
    const messages = messagesData.messages || messagesData.data || []

    // Szukaj JSON w wiadomościach asystenta (od końca)
    let result = ''
    for (const msg of [...messages].reverse()) {
      if (msg.type !== 'assistant_message') continue

      const assistantContent = msg.assistant_message
      if (!assistantContent) continue

      let content: string
      if (typeof assistantContent === 'string') {
        content = assistantContent
      } else if (typeof assistantContent === 'object') {
        content = assistantContent.content || assistantContent.text || assistantContent.message || JSON.stringify(assistantContent)
      } else {
        continue
      }

      // Szukaj JSON z danymi research
      if (content.includes('{') && (content.includes('"competitors"') || content.includes('"common_angles"') || content.includes('"gaps"'))) {
        result = content
        break
      }
    }

    // Fallback
    if (!result && messages.length > 0) {
      const lastMsg = messages[messages.length - 1]
      if (lastMsg?.content) {
        result = typeof lastMsg.content === 'string' ? lastMsg.content : JSON.stringify(lastMsg.content)
      }
    }
    if (!result && task.output) {
      result = typeof task.output === 'string' ? task.output : JSON.stringify(task.output)
    }

    result = result || ''

    // Parsuj JSON
    let researchData = null
    try {
      let depth = 0, start = -1, end = -1
      for (let i = 0; i < result.length; i++) {
        if (result[i] === '{') { if (depth === 0) start = i; depth++ }
        else if (result[i] === '}') { depth--; if (depth === 0 && start !== -1) { end = i + 1; break } }
      }

      if (start !== -1 && end !== -1) {
        researchData = JSON.parse(result.substring(start, end))
      } else {
        researchData = { raw_result: result || '(empty)', parse_error: true }
      }
    } catch (parseErr) {
      researchData = { raw_result: result || '(empty)', parse_error: true, error: parseErr.message }
    }

    // Zapisz do bazy
    if (workflow_id) {
      const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)
      await supabase
        .from('workflow_ads')
        .update({
          competitor_research: researchData,
          competitor_research_at: new Date().toISOString(),
          competitor_research_status: 'completed'
        })
        .eq('workflow_id', workflow_id)
    }

    return new Response(
      JSON.stringify({ success: true, status: 'completed', research_data: researchData }),
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
