import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  try {
    const MANUS_API_KEY = Deno.env.get('MANUS_API_KEY')!
    const { task_id } = await req.json()

    const detailRes = await fetch(`https://api.manus.ai/v2/task.detail?task_id=${task_id}`, {
      headers: { 'x-manus-api-key': MANUS_API_KEY, 'Content-Type': 'application/json' }
    })
    const detail = await detailRes.json()
    const status = detail.task?.status || detail.status

    const msgRes = await fetch(`https://api.manus.ai/v2/task.listMessages?task_id=${task_id}&limit=100`, {
      headers: { 'x-manus-api-key': MANUS_API_KEY, 'Content-Type': 'application/json' }
    })
    const msgData = await msgRes.json()
    const messages = msgData.messages || msgData.data || []

    const assistantMessages = messages
      .filter((m: any) => m.type === 'assistant_message')
      .map((m: any) => {
        const c = m.assistant_message
        if (typeof c === 'string') return c
        if (typeof c === 'object') return c.content || c.text || c.message || JSON.stringify(c)
        return ''
      })
      .filter((t: string) => t.length > 0)

    // Also extract user messages to inspect what we sent
    const userMessages = messages
      .filter((m: any) => m.type === 'user_message')
      .map((m: any) => {
        const um = m.user_message
        if (typeof um === 'string') return um
        if (typeof um === 'object') return um.content || um.text || JSON.stringify(um)
        return ''
      })

    // Extract attachments from user_messages (debug - verify our upload worked)
    const userAttachments = messages
      .filter((m: any) => m.type === 'user_message')
      .flatMap((m: any) => {
        const um = m.user_message
        if (typeof um === 'object' && um?.attachments) return um.attachments
        return []
      })

    return new Response(JSON.stringify({
      status,
      message_count: messages.length,
      assistant_count: assistantMessages.length,
      user_count: userMessages.length,
      user_attachments: userAttachments,
      user_attachments_count: userAttachments.length,
      user_messages: userMessages,
      last_assistant: assistantMessages[assistantMessages.length - 1] || null,
      all_assistant: assistantMessages
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders })
  }
})
