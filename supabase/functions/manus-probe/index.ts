import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * Probe Manus API for available endpoints related to files/artifacts/images.
 * Uses task_id from the user's image generation test.
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  try {
    const MANUS_API_KEY = Deno.env.get('MANUS_API_KEY')!
    const { task_id } = await req.json()
    const headers = { 'x-manus-api-key': MANUS_API_KEY, 'Content-Type': 'application/json' }
    const results: any = {}

    // Full dump of messages for inspection
    const msgRes = await fetch(`https://api.manus.ai/v2/task.listMessages?task_id=${task_id}&limit=100`, { headers })
    const msgData = await msgRes.json()
    const messages = msgData.messages || []
    // Extract all image/file-like fields
    const imageFinds: any[] = []
    for (const m of messages) {
      const keys = Object.keys(m)
      for (const k of keys) {
        const v: any = m[k]
        const str = JSON.stringify(v)
        if (str.includes('http') || str.includes('.jpg') || str.includes('.png') || str.includes('image') || str.includes('file') || str.includes('attachment') || str.includes('url')) {
          imageFinds.push({ msg_type: m.type, field: k, sample: str.substring(0, 1000) })
        }
      }
    }

    // Try various potential endpoints
    const endpoints = [
      `task.detail?task_id=${task_id}`,
      `task.listMessages?task_id=${task_id}&limit=100`,
      `task.listFiles?task_id=${task_id}`,
      `task.listArtifacts?task_id=${task_id}`,
      `task.files?task_id=${task_id}`,
      `task.attachments?task_id=${task_id}`,
      `task.outputs?task_id=${task_id}`,
      `task.listOutputs?task_id=${task_id}`,
      `task.getFiles?task_id=${task_id}`,
    ]

    for (const ep of endpoints) {
      try {
        const res = await fetch(`https://api.manus.ai/v2/${ep}`, { headers })
        const text = await res.text()
        let parsed: any = text
        try { parsed = JSON.parse(text) } catch {}
        results[ep] = {
          status: res.status,
          ok: res.ok,
          body: typeof parsed === 'object' ? JSON.stringify(parsed).substring(0, 500) : text.substring(0, 500)
        }
      } catch (e) {
        results[ep] = { error: e.message }
      }
    }

    // Also try v1
    try {
      const res = await fetch(`https://api.manus.ai/v1/task.detail?task_id=${task_id}`, { headers })
      results['v1.task.detail'] = { status: res.status, body: (await res.text()).substring(0, 300) }
    } catch (e) {}

    // Extract ALL attachments from ALL assistant_messages
    const allAttachments: any[] = []
    for (const m of messages) {
      if (m.type !== 'assistant_message') continue
      const am = m.assistant_message
      if (typeof am === 'object' && am?.attachments) {
        for (const a of am.attachments) {
          allAttachments.push({
            msg_id: m.id,
            type: a.type,
            content_type: a.content_type,
            filename: a.filename,
            url: a.url
          })
        }
      }
    }

    return new Response(JSON.stringify({
      total_messages: messages.length,
      unique_message_types: [...new Set(messages.map((m: any) => m.type))],
      attachments_count: allAttachments.length,
      all_attachments: allAttachments
    }, null, 2), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders })
  }
})
